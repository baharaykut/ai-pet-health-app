using Hurma.API.Data;
using Hurma.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Hurma.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AdoptionsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IWebHostEnvironment _env;

    public AdoptionsController(AppDbContext context, IWebHostEnvironment env)
    {
        _context = context;
        _env = env;
    }

    // 🐾 TÜM İLANLARI GETİR
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var adoptions = await _context.Adoptions
            .AsNoTracking()
            .OrderByDescending(x => x.Id)
            .ToListAsync();

        return Ok(adoptions);
    }

    // 🐾 ID'YE GÖRE GETİR
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var adoption = await _context.Adoptions
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == id);

        if (adoption == null)
            return NotFound(new { message = "İlan bulunamadı." });

        return Ok(adoption);
    }

    // 🐾 YENİ İLAN OLUŞTUR
    [HttpPost("upload")]
    [RequestSizeLimit(10_000_000)]
    public async Task<IActionResult> CreateWithPhoto([FromForm] AdoptionUploadRequest request)
    {
        if (request == null)
            return BadRequest("Geçersiz istek.");

        string? photoUrl = null;

        if (request.Photo != null && request.Photo.Length > 0)
        {
            var root = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var uploadDir = Path.Combine(root, "uploads");
            Directory.CreateDirectory(uploadDir);

            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(request.Photo.FileName)}";
            var filePath = Path.Combine(uploadDir, fileName);

            await using var stream = new FileStream(filePath, FileMode.Create);
            await request.Photo.CopyToAsync(stream);

            // 🔥 SADECE RELATIVE PATH
            photoUrl = $"/uploads/{fileName}";
        }

        var adoption = new Adoption
        {
            Name = request.Name?.Trim(),
            Type = request.Type?.Trim(),
            Breed = request.Breed?.Trim(),
            Location = request.Location?.Trim(),
            Contact = request.Contact?.Trim(),
            Description = request.Description?.Trim(),
            PhotoUrl = photoUrl
        };

        _context.Adoptions.Add(adoption);
        await _context.SaveChangesAsync();

        return Ok(adoption);
    }

    // ✏️ GÜNCELLE
    [HttpPut("{id:int}")]
    [RequestSizeLimit(10_000_000)]
    public async Task<IActionResult> Update(int id, [FromForm] AdoptionUploadRequest request)
    {
        var adoption = await _context.Adoptions.FindAsync(id);
        if (adoption == null)
            return NotFound("İlan bulunamadı.");

        if (request.Photo != null && request.Photo.Length > 0)
        {
            // 🗑️ ESKİ DOSYAYI SİL
            if (!string.IsNullOrEmpty(adoption.PhotoUrl))
            {
                var oldFile = Path.GetFileName(adoption.PhotoUrl);
                var oldPath = Path.Combine(_env.WebRootPath ?? "wwwroot", "uploads", oldFile);
                if (System.IO.File.Exists(oldPath))
                    System.IO.File.Delete(oldPath);
            }

            var uploadDir = Path.Combine(_env.WebRootPath ?? "wwwroot", "uploads");
            Directory.CreateDirectory(uploadDir);

            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(request.Photo.FileName)}";
            var filePath = Path.Combine(uploadDir, fileName);

            await using var stream = new FileStream(filePath, FileMode.Create);
            await request.Photo.CopyToAsync(stream);

            adoption.PhotoUrl = $"/uploads/{fileName}";
        }

        adoption.Name = request.Name ?? adoption.Name;
        adoption.Type = request.Type ?? adoption.Type;
        adoption.Breed = request.Breed ?? adoption.Breed;
        adoption.Location = request.Location ?? adoption.Location;
        adoption.Contact = request.Contact ?? adoption.Contact;
        adoption.Description = request.Description ?? adoption.Description;

        await _context.SaveChangesAsync();

        return Ok(adoption);
    }

    // 🗑️ SİL
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var adoption = await _context.Adoptions.FindAsync(id);
        if (adoption == null)
            return NotFound("İlan bulunamadı.");

        // 🧹 DOSYAYI SİL
        if (!string.IsNullOrEmpty(adoption.PhotoUrl))
        {
            var fileName = Path.GetFileName(adoption.PhotoUrl);
            var path = Path.Combine(_env.WebRootPath ?? "wwwroot", "uploads", fileName);
            if (System.IO.File.Exists(path))
                System.IO.File.Delete(path);
        }

        _context.Adoptions.Remove(adoption);
        await _context.SaveChangesAsync();

        return Ok(new { message = "İlan silindi." });
    }
}
