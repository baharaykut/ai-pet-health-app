namespace Hurma.API.Models;

public class Adoption
{
    public int Id { get; set; }

    public string? Name { get; set; }
    public string? Type { get; set; }
    public string? Breed { get; set; }
    public string? Location { get; set; }
    public string? Contact { get; set; }
    public string? PhotoUrl { get; set; }
    public string? Description { get; set; }
}
