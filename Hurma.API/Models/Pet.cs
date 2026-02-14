namespace Hurma.API.Models;

public class Pet
{
    public int Id { get; set; }

    // 🔐 SAHİBİ
    public int UserId { get; set; }
    public User? User { get; set; }

    // 🐾 TEMEL BİLGİLER
    public string Name { get; set; } = "";
    public string Type { get; set; } = ""; // Kedi, Köpek vs
    public string? Breed { get; set; }

    public string? Age { get; set; }
    public string? Weight { get; set; }
    public string? Height { get; set; }

    // 📸 FOTO (ARTIK DOĞRU ALAN)
    public string? PhotoUrl { get; set; }   // ✅ ESKİ Photo SİLİNDİ

    // 💉 AŞILAR (GERÇEK TARİH)
    public DateTime? RabiesVaccineDate { get; set; }
    public DateTime? InternalParasiteDate { get; set; }
    public DateTime? ExternalParasiteDate { get; set; }

    // 🧠 AI CACHE
    public string? AiNotes { get; set; }
    public double? AiScore { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
