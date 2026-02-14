using Hurma.API.Data;
using Hurma.API.Dtos;
using Hurma.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Hurma.API.Controllers;

[ApiController]
[Route("api/orders")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly AppDbContext _db;
    public OrdersController(AppDbContext db) => _db = db;

    // ---------------- CREATE ORDER ----------------
    [HttpPost]
    public async Task<ActionResult<OrderDto>> Create([FromBody] CreateOrderRequest req)
    {
        int userId = AuthHelpers.GetUserId(User);

        var address = await _db.Addresses
            .FirstOrDefaultAsync(a => a.Id == req.AddressId && a.UserId == userId);

        if (address is null)
            return BadRequest("Adres bulunamadı.");

        var cart = await _db.CartItems
            .Where(c => c.UserId == userId)
            .Include(c => c.Product)
            .ToListAsync();

        if (cart.Count == 0)
            return BadRequest("Sepet boş.");

        foreach (var c in cart)
        {
            if (c.Product == null)
                return BadRequest("Ürün bulunamadı.");

            if (c.Quantity > c.Product.Stock)
                return BadRequest($"{c.Product.Name} stok yetersiz. Max: {c.Product.Stock}");
        }

        var order = new Order
        {
            UserId = userId,
            CreatedAt = DateTime.UtcNow,

            AddressTitle = address.Title,
            FullName = address.FullName,
            Phone = address.Phone,
            City = address.City,
            District = address.District,
            Detail = address.Detail,

            Total = cart.Sum(x => x.Product!.Price * x.Quantity),

            Items = cart.Select(x => new OrderItem
            {
                ProductId = x.ProductId,
                Quantity = x.Quantity,
                Price = x.Product!.Price
            }).ToList()
        };

        foreach (var c in cart)
        {
            if (c.Product != null)
                c.Product.Stock -= c.Quantity;
        }

        _db.Orders.Add(order);
        _db.CartItems.RemoveRange(cart);
        await _db.SaveChangesAsync();

        return Ok(await BuildOrderDto(order.Id, userId));
    }

    // ---------------- MY ORDERS ----------------
    [HttpGet]
    public async Task<ActionResult<List<OrderDto>>> MyOrders()
    {
        int userId = AuthHelpers.GetUserId(User);

        var ids = await _db.Orders
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.Id)
            .Select(o => o.Id)
            .ToListAsync();

        var list = new List<OrderDto>();
        foreach (var id in ids)
            list.Add(await BuildOrderDto(id, userId));

        return Ok(list);
    }

    // ---------------- ORDER DETAIL ----------------
    [HttpGet("{id:int}")]
    public async Task<ActionResult<OrderDto>> Get(int id)
    {
        int userId = AuthHelpers.GetUserId(User);

        var exists = await _db.Orders.AnyAsync(o => o.Id == id && o.UserId == userId);
        if (!exists)
            return NotFound("Sipariş bulunamadı.");

        return Ok(await BuildOrderDto(id, userId));
    }

    // ---------------- DTO BUILDER ----------------
    private async Task<OrderDto> BuildOrderDto(int orderId, int userId)
    {
        var order = await _db.Orders
            .Where(o => o.Id == orderId && o.UserId == userId)
            .Include(o => o.Items)
                .ThenInclude(i => i.Product)
            .FirstAsync();

        var addressDto = new AddressDto(
            0,
            order.AddressTitle,
            order.FullName,
            order.Phone,
            order.City,
            order.District,
            order.Detail
        );

        var items = order.Items.Select(i => new OrderItemDto(
            i.ProductId,
            i.Product!.Name,
            i.Product.PhotoUrl,   // ✅ SENİN PROJEN: PhotoUrl
            i.Price,
            i.Quantity
        )).ToList();

        return new OrderDto(
            order.Id,
            order.Total,
            order.CreatedAt.ToLocalTime().ToString("yyyy-MM-dd HH:mm"),
            addressDto,
            items
        );
    }
}
