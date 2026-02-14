namespace Hurma.API.Dtos;

// ---------------- ORDER ITEM ----------------
public record OrderItemDto(
    int ProductId,
    string Name,
    string PhotoUrl,
    decimal UnitPrice,
    int Quantity
);

// ---------------- ORDER ----------------
public record OrderDto(
    long Id,
    decimal Total,
    string CreatedAt,
    AddressDto Address,
    List<OrderItemDto> Items
);

// ---------------- CREATE ORDER REQUEST ----------------
public record CreateOrderRequest(int AddressId);
