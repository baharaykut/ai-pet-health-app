namespace Hurma.Domain.Entities;

public class Order
{
    public int Id { get; set; }

    public int UserId { get; set; }   // ✅ STRING DEĞİL, INT

    public decimal Total { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public string AddressTitle { get; set; } = "";
    public string FullName { get; set; } = "";
    public string Phone { get; set; } = "";
    public string City { get; set; } = "";
    public string District { get; set; } = "";
    public string Detail { get; set; } = "";

    public List<OrderItem> Items { get; set; } = new();
}
