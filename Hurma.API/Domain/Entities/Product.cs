namespace Hurma.Domain.Entities;

public class Product
{
    public int Id { get; set; }

    public string Name { get; set; } = "";
    public string Description { get; set; } = "";

    public decimal Price { get; set; }
    public decimal? OriginalPrice { get; set; }

    public string Category { get; set; } = "";
    public string PhotoUrl { get; set; } = "";

    public string Seller { get; set; } = "Hurma";
    public double SellerRating { get; set; } = 9.0;

    public int InCarts { get; set; }
    public string DeliveryTime { get; set; } = "2-3 iş günü";

    public double Rating { get; set; }
    public int ReviewCount { get; set; }

    public int Stock { get; set; }
    public bool IsActive { get; set; } = true;
}
