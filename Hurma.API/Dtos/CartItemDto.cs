namespace Hurma.API.Dtos;

public class CartItemDto
{
    // Frontend item.id -> biz ProductId kullanıyoruz
    public int ProductId { get; set; }

    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string PhotoUrl { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Stock { get; set; }
    public int Quantity { get; set; }
}
