namespace Hurma.API.Dtos;

public class PetResponse
{
    public int Id { get; set; }

    public string Name { get; set; } = "";
    public string Type { get; set; } = "";
    public string? Breed { get; set; }
    public string? Age { get; set; }
    public string? Weight { get; set; }
    public string? Height { get; set; }

    public DateTime? RabiesVaccineDate { get; set; }
    public DateTime? InternalParasiteDate { get; set; }
    public DateTime? ExternalParasiteDate { get; set; }

    public string? PhotoUrl { get; set; }
}
