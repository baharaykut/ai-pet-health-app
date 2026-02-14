using Hurma.API.Data;
using Hurma.API.Dtos;
using Hurma.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Hurma.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PetsController : ControllerBase
{
    private readonly AppDbContext _context;

    public PetsController(AppDbContext context)
    {
        _context = context;
    }

    // ==============================
    // 🐾 KULLANICININ PETLERİ
    // ==============================
    [HttpGet]
    public async Task<IActionResult> GetMyPets()
    {
        int userId = AuthHelpers.GetUserId(User);

        var pets = await _context.Pets
            .Where(p => p.UserId == userId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        foreach (var pet in pets)
            pet.PhotoUrl = NormalizePhotoUrl(pet.PhotoUrl);

        return Ok(pets);
    }

    // ==============================
    // ➕ PET EKLE (FOTOĞRAFLI + AŞILI)
    // ==============================
    [HttpPost]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(100_000_000)]
    public async Task<ActionResult<Pet>> AddPet([FromForm] PetCreateRequest request)
    {
        int userId = AuthHelpers.GetUserId(User);

        string? photoPath = null;

        if (request.Photo != null && request.Photo.Length > 0)
        {
            var uploadsDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
            Directory.CreateDirectory(uploadsDir);

            var fileName = Guid.NewGuid() + Path.GetExtension(request.Photo.FileName);
            var fullPath = Path.Combine(uploadsDir, fileName);

            using var stream = new FileStream(fullPath, FileMode.Create);
            await request.Photo.CopyToAsync(stream);

            photoPath = "/uploads/" + fileName;
        }

        var pet = new Pet
        {
            Name = request.Name,
            Type = request.Type,
            Breed = request.Breed,
            Age = request.Age,
            Weight = request.Weight,
            Height = request.Height,

            // ✅ AŞILAR
            RabiesVaccineDate = request.RabiesVaccineDate,
            InternalParasiteDate = request.InternalParasiteDate,
            ExternalParasiteDate = request.ExternalParasiteDate,

            PhotoUrl = photoPath,
            UserId = userId,
            CreatedAt = DateTime.Now
        };

        _context.Pets.Add(pet);
        await _context.SaveChangesAsync();

        pet.PhotoUrl = NormalizePhotoUrl(pet.PhotoUrl);

        return Ok(pet);
    }

    // ==============================
    // ✅ AŞI YAPILDI
    // ==============================
    [HttpPut("{petId}/mark-vaccine-done")]
    public async Task<IActionResult> MarkVaccineDone(int petId, [FromQuery] string type)
    {
        int userId = AuthHelpers.GetUserId(User);

        var pet = await _context.Pets
            .FirstOrDefaultAsync(p => p.Id == petId && p.UserId == userId);

        if (pet == null)
            return NotFound("Pet bulunamadı");

        if (type == "Kuduz")
            pet.RabiesVaccineDate = DateTime.Now.AddYears(1);
        else if (type == "İç Parazit")
            pet.InternalParasiteDate = DateTime.Now.AddMonths(3);
        else if (type == "Dış Parazit")
            pet.ExternalParasiteDate = DateTime.Now.AddMonths(2);
        else
            return BadRequest("Geçersiz aşı tipi");

        await _context.SaveChangesAsync();

        return Ok(new { message = "Aşı takvimi güncellendi" });
    }

    // ==============================
    // 📸 FOTO GÜNCELLE
    // ==============================
    [HttpPost("{id}/upload-photo")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadPhoto(int id, [FromForm] IFormFile photo)
    {
        if (photo == null || photo.Length == 0)
            return BadRequest("Dosya gelmedi");

        int userId = AuthHelpers.GetUserId(User);

        var pet = await _context.Pets
            .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

        if (pet == null)
            return NotFound("Pet bulunamadı");

        var uploadsDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
        Directory.CreateDirectory(uploadsDir);

        var fileName = $"pet_{id}_{Guid.NewGuid()}{Path.GetExtension(photo.FileName)}";
        var path = Path.Combine(uploadsDir, fileName);

        using var stream = new FileStream(path, FileMode.Create);
        await photo.CopyToAsync(stream);

        pet.PhotoUrl = "/uploads/" + fileName;
        await _context.SaveChangesAsync();

        return Ok(new { photoUrl = NormalizePhotoUrl(pet.PhotoUrl) });
    }

    // ==============================
    // ❌ PET SİL
    // ==============================
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePet(int id)
    {
        int userId = AuthHelpers.GetUserId(User);

        var pet = await _context.Pets
            .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

        if (pet == null)
            return NotFound("Pet bulunamadı");

        _context.Pets.Remove(pet);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // ==============================
    // ✏️ PET GÜNCELLE
    // ==============================
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePet(int id, [FromBody] PetUpdateRequest request)
    {
        int userId = AuthHelpers.GetUserId(User);

        var pet = await _context.Pets
            .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

        if (pet == null)
            return NotFound("Pet bulunamadı");

        pet.Name = request.Name;
        pet.Type = request.Type;
        pet.Breed = request.Breed;
        pet.Age = request.Age;
        pet.Weight = request.Weight;
        pet.Height = request.Height;
        pet.RabiesVaccineDate = request.RabiesVaccineDate;
        pet.InternalParasiteDate = request.InternalParasiteDate;
        pet.ExternalParasiteDate = request.ExternalParasiteDate;

        await _context.SaveChangesAsync();

        pet.PhotoUrl = NormalizePhotoUrl(pet.PhotoUrl);

        return Ok(pet);
    }

    // ==============================
    // 🔧 URL NORMALIZER
    // ==============================
    private string? NormalizePhotoUrl(string? url)
    {
        if (string.IsNullOrEmpty(url)) return null;
        if (url.StartsWith("http")) return url;
        return $"{Request.Scheme}://{Request.Host}{url}";
    }
}
