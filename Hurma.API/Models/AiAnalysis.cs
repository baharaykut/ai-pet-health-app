namespace Hurma.API.Models;

public class AiAnalysis
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public int? PetId { get; set; }
    public Pet? Pet { get; set; }

    public string Title { get; set; } = "AI Analiz Sonucu";
    public string Summary { get; set; } = "";
    public string Details { get; set; } = "";

    public string Status { get; set; } = "info";
    public double Confidence { get; set; }

    public string? RawJson { get; set; }
    public string? ImageUrl { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
