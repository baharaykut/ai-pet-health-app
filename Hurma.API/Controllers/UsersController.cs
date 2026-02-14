using Hurma.API.Data;
using Hurma.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Hurma.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IWebHostEnvironment _env;

    public UsersController(AppDbContext db, IWebHostEnvironment env)
    {
        _db = db;
        _env = env;
    }

    // ==============================
    // 📸 PROFİL FOTO UPLOAD
    // ==============================
    [HttpPost("upload-profile-photo")]
    [RequestSizeLimit(10_000_000)] // 10MB limit
    public async Task<IActionResult> UploadProfilePhoto([FromForm] IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("Dosya boş");

        // JWT içinden user id al
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier)
                        ?? User.FindFirstValue("id"); // fallback

        if (!int.TryParse(userIdStr, out var userId))
            return Unauthorized("UserId okunamadı");

        var user = await _db.Users.FindAsync(userId);
        if (user == null) return NotFound("Kullanıcı bulunamadı");

        // wwwroot/uploads/profiles
        var uploadsPath = Path.Combine(_env.WebRootPath!, "uploads", "profiles");
        if (!Directory.Exists(uploadsPath))
            Directory.CreateDirectory(uploadsPath);

        // Dosya uzantısı kontrol
        var ext = Path.GetExtension(file.FileName).ToLower();
        var allowed = new[] { ".jpg", ".jpeg", ".png", ".webp" };

        if (!allowed.Contains(ext))
            return BadRequest("Sadece jpg, png, webp yüklenebilir");

        var fileName = $"user_{userId}_{Guid.NewGuid()}{ext}";
        var filePath = Path.Combine(uploadsPath, fileName);

        // Kaydet
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        // Eski foto varsa sil
        if (!string.IsNullOrEmpty(user.PhotoUrl))
        {
            var oldPath = Path.Combine(_env.WebRootPath!, user.PhotoUrl.TrimStart('/'));
            if (System.IO.File.Exists(oldPath))
                System.IO.File.Delete(oldPath);
        }

        // DB güncelle
        user.PhotoUrl = $"/uploads/profiles/{fileName}";
        await _db.SaveChangesAsync();

        return Ok(new
        {
            photoUrl = user.PhotoUrl
        });
    }
}
