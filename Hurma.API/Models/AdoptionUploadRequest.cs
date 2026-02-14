namespace Hurma.API.Models;

public class AdoptionUploadRequest
{
    public string? Name { get; set; }
    public string? Type { get; set; }
    public string? Breed { get; set; }
    public string? Location { get; set; }
    public string? Contact { get; set; }
    public string? Description { get; set; }
    public IFormFile? Photo { get; set; }
}
