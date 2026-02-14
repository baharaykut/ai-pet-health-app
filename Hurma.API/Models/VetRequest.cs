namespace Hurma.API.Models;

public class VetRequest
{
    public int Id { get; set; }
    public string Question { get; set; } = "";

    public int UserId { get; set; }
    public int VetId { get; set; }

    public bool IsAccepted { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
