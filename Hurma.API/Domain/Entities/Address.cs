namespace Hurma.Domain.Entities;

public class Address
{
    public int Id { get; set; }

    public int UserId { get; set; }   // ✅ STRING DEĞİL, INT

    public string Title { get; set; } = "";
    public string FullName { get; set; } = "";
    public string Phone { get; set; } = "";
    public string City { get; set; } = "";
    public string District { get; set; } = "";
    public string Detail { get; set; } = "";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
