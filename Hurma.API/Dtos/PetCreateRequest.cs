using Microsoft.AspNetCore.Http;

namespace Hurma.API.Dtos;

public class PetCreateRequest
{
    public string Name { get; set; } = "";
    public string Type { get; set; } = "";
    public string? Breed { get; set; }
    public string? Age { get; set; }
    public string? Weight { get; set; }
    public string? Height { get; set; }

    // 💉 AŞILAR
    public DateTime? RabiesVaccineDate { get; set; }
    public DateTime? InternalParasiteDate { get; set; }
    public DateTime? ExternalParasiteDate { get; set; }

    // 📸 FOTO
    public IFormFile? Photo { get; set; }   // ✅ BURASI ÇOK ÖNEMLİ
}

