using Hurma.API.Data;
using Hurma.API.Models;
using Hurma.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Hurma.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AiController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly AiService _aiService;
        private readonly DiseaseService _diseaseService;
        private readonly VetSuggestionService _vetSuggestionService;
        private readonly IWebHostEnvironment _env;

        public AiController(
            AppDbContext context,
            AiService aiService,
            DiseaseService diseaseService,
            VetSuggestionService vetSuggestionService,
            IWebHostEnvironment env)
        {
            _context = context;
            _aiService = aiService;
            _diseaseService = diseaseService;
            _vetSuggestionService = vetSuggestionService;
            _env = env;
        }

        // =========================================================
        // 🔥 FULL ANALYZE
        // =========================================================
        [HttpPost("analyze-full")]
        [DisableRequestSizeLimit]
        [RequestFormLimits(MultipartBodyLengthLimit = 100_000_000)]
        public async Task<IActionResult> AnalyzeFull([FromForm] IFormFile file, [FromForm] int? petId)
        {
            try
            {
                var userId = GetUserIdFromToken();
                if (userId == null) return Unauthorized();

                if (file == null || file.Length == 0)
                    return BadRequest(new { error = "Foto gönderilmedi." });

                if (!file.ContentType.StartsWith("image/"))
                    return BadRequest(new { error = "Sadece resim dosyası gönderilebilir." });

                if (petId.HasValue)
                {
                    var petOk = await _context.Pets.AnyAsync(p => p.Id == petId && p.UserId == userId.Value);
                    if (!petOk)
                        return BadRequest(new { error = "Pet bulunamadı veya sana ait değil." });
                }

                // ================= SAVE IMAGE =================
                var uploadsDir = Path.Combine(_env.WebRootPath, "uploads", "ai");
                if (!Directory.Exists(uploadsDir))
                    Directory.CreateDirectory(uploadsDir);

                var ext = Path.GetExtension(file.FileName);
                var fileName = $"{Guid.NewGuid()}{ext}";
                var savePath = Path.Combine(uploadsDir, fileName);

                using (var fs = new FileStream(savePath, FileMode.Create))
                {
                    await file.CopyToAsync(fs);
                }

                var imageUrl = $"/uploads/ai/{fileName}";

                // ================= AI =================
                byte[] bytes = await System.IO.File.ReadAllBytesAsync(savePath);

                // ✅ AiService -> AiPythonResult döndürür
                var ai = await _aiService.AnalyzeAsync(bytes);

                if (ai == null)
                {
                    return StatusCode(502, new
                    {
                        error = "AI servisi cevap vermedi."
                    });
                }

                // ----- Species -----
                var species = string.IsNullOrWhiteSpace(ai.Species)
                    ? "unknown"
                    : ai.Species.Trim().ToLowerInvariant();

                var speciesConf = Clamp01(ai.SpeciesConfidence);

                // ----- Disease -----
                // ✅ FIX: DTO değişti -> SkinResult yerine SkinDisease geldi
                var disease = string.IsNullOrWhiteSpace(ai.SkinDisease?.Disease)
                    ? null
                    : ai.SkinDisease.Disease.Trim().ToLowerInvariant();

                var diseaseConf = Clamp01(ai.SkinDisease?.Confidence ?? 0);

                // disease null ise healthy kabul
                var diseaseKey = string.IsNullOrWhiteSpace(disease) ? "healthy" : disease;

                var diseaseInfo = _diseaseService.GetByKey(diseaseKey);

                // =========================================================
                // ✅ RISK (threshold fix)
                // healthy => LOW
                // değilse:
                //   >=0.70 HIGH
                //   >=0.60 MEDIUM
                //   else LOW (uncertain/low confidence)
                // =========================================================
                var risk = "LOW";
                var isHealthy = diseaseKey == "healthy";

                if (!isHealthy)
                {
                    risk = diseaseConf >= 0.70 ? "HIGH"
                         : diseaseConf >= 0.60 ? "MEDIUM"
                         : "LOW";
                }

                if (diseaseInfo?.IsUrgent == true)
                    risk = "HIGH";

                // ================= DB SAVE =================
                var analysis = new AiAnalysis
                {
                    UserId = userId.Value,
                    PetId = petId,
                    Title = "AI Analiz",
                    Summary = $"Species: {species}, Disease: {diseaseKey}",
                    Confidence = diseaseConf,
                    Status = risk,
                    CreatedAt = DateTime.UtcNow,
                    ImageUrl = imageUrl
                };

                _context.AiAnalyses.Add(analysis);
                await _context.SaveChangesAsync();

                // ================= RESPONSE =================
                return Ok(new
                {
                    success = true,
                    result = new
                    {
                        analysisId = analysis.Id,
                        petId = petId,
                        imageUrl = imageUrl,

                        species = new { name = species, confidence = speciesConf },

                        skinDisease = (diseaseKey == "healthy")
                            ? null
                            : new { name = diseaseKey, confidence = diseaseConf },

                        summary = new
                        {
                            animal = species,
                            disease = diseaseKey,
                            confidence = diseaseConf,
                            riskLevel = risk,
                            message = BuildMessage(species, diseaseKey, risk, diseaseConf)
                        },

                        diseaseInfo = diseaseInfo,
                        vets = _vetSuggestionService.GetSuggestedVets()
                    }
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                return StatusCode(500, new { error = "AI Analyze crash", detail = ex.Message });
            }
        }

        // =========================================================
        // 🕘 MY HISTORY
        // =========================================================
        [HttpGet("mine")]
        public async Task<IActionResult> MyHistory()
        {
            var userId = GetUserIdFromToken();
            if (userId == null) return Unauthorized();

            var list = await _context.AiAnalyses
                .Include(x => x.Pet)
                .Where(x => x.UserId == userId.Value)
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();

            return Ok(list);
        }

        // =========================================================
        // 🔎 DETAIL
        // =========================================================
        [HttpGet("{id:int}")]
        public async Task<IActionResult> Detail(int id)
        {
            var userId = GetUserIdFromToken();
            if (userId == null) return Unauthorized();

            var item = await _context.AiAnalyses
                .Include(x => x.Pet)
                .FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId.Value);

            if (item == null) return NotFound();

            return Ok(new
            {
                id = item.Id,
                pet = item.Pet == null ? null : new { item.Pet.Id, item.Pet.Name },
                title = item.Title,
                summary = item.Summary,
                status = item.Status,
                confidence = item.Confidence,
                createdAt = item.CreatedAt,
                imageUrl = item.ImageUrl
            });
        }

        // =========================================================
        // 🗑️ DELETE
        // =========================================================
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = GetUserIdFromToken();
            if (userId == null) return Unauthorized();

            var item = await _context.AiAnalyses
                .FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId.Value);

            if (item == null)
                return NotFound(new { error = "Analiz bulunamadı." });

            // ================= DELETE IMAGE FROM DISK =================
            if (!string.IsNullOrWhiteSpace(item.ImageUrl))
            {
                var fullPath = Path.Combine(
                    _env.WebRootPath,
                    item.ImageUrl.TrimStart('/').Replace("/", Path.DirectorySeparatorChar.ToString())
                );

                if (System.IO.File.Exists(fullPath))
                    System.IO.File.Delete(fullPath);
            }

            _context.AiAnalyses.Remove(item);
            await _context.SaveChangesAsync();

            return Ok(new { success = true });
        }

        // =========================================================
        // 🔐 TOKEN
        // =========================================================
        private int? GetUserIdFromToken()
        {
            var claim =
                User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
                User.FindFirst("id")?.Value ??
                User.FindFirst("userId")?.Value;

            return int.TryParse(claim, out var id) ? id : null;
        }

        // =========================================================
        // 🧰 HELPERS
        // =========================================================
        private static double Clamp01(double v)
        {
            if (double.IsNaN(v) || double.IsInfinity(v)) return 0;
            if (v < 0) return 0;
            if (v > 1) return 1;
            return v;
        }

        // ✅ build message: threshold’lara göre daha doğru konuşsun
        private static string BuildMessage(string species, string? disease, string risk, double conf)
        {
            var dis = string.IsNullOrWhiteSpace(disease) ? "healthy" : disease;

            if (dis == "healthy")
                return "Takip edilebilir. Şüphede veterinere danış.";

            if (risk == "HIGH")
                return "Yüksek risk! En kısa sürede veterinere danış.";

            if (risk == "MEDIUM")
                return "Sonuç belirsiz. Daha net bir fotoğrafla tekrar deneyin veya veterinere danışın.";

            // LOW ama diseased çıktıysa güven düşüktür
            if (conf < 0.60)
                return "Düşük güven. Daha net fotoğrafla tekrar deneyin.";

            return "Belirti olabilir. Gözlemle ve gerekirse veterinere danış.";
        }
    }
}
