using Hurma.API.Data;
using Hurma.API.Dtos;
using Hurma.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Hurma.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CartController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CartController(AppDbContext context)
        {
            _context = context;
        }

        // ✅ GET /api/cart
        [HttpGet]
        public async Task<IActionResult> GetMyCart()
        {
            var userId = GetUserIdFromToken();
            if (userId == null) return Unauthorized();

            var items = await _context.CartItems
                .Include(x => x.Product)
                .Where(x => x.UserId == userId.Value)
                .OrderByDescending(x => x.Id)
                .Select(x => new
                {
                    x.Id,
                    x.ProductId,
                    product = new
                    {
                        x.Product!.Id,
                        x.Product.Name,
                        x.Product.Price,
                        x.Product.PhotoUrl   // ✅ DOĞRUSU BU
                    },
                    x.Quantity
                })
                .ToListAsync();

            return Ok(items);
        }

        // ✅ POST /api/cart  body: { productId, quantity }
        [HttpPost]
        public async Task<IActionResult> AddToCart([FromBody] AddToCartRequest dto)
        {
            var userId = GetUserIdFromToken();
            if (userId == null) return Unauthorized();

            if (dto.ProductId <= 0) return BadRequest(new { error = "ProductId geçersiz" });
            var qty = dto.Quantity <= 0 ? 1 : dto.Quantity;

            var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == dto.ProductId);
            if (product == null) return NotFound(new { error = "Ürün bulunamadı" });

            var existing = await _context.CartItems
                .FirstOrDefaultAsync(x => x.UserId == userId.Value && x.ProductId == dto.ProductId);

            if (existing != null)
            {
                existing.Quantity += qty;
            }
            else
            {
                _context.CartItems.Add(new CartItem
                {
                    UserId = userId.Value,
                    ProductId = dto.ProductId,
                    Quantity = qty
                });
            }

            await _context.SaveChangesAsync();
            return Ok(new { success = true });
        }

        // ✅ PUT /api/cart/{id}  body: { quantity }
        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateQty(int id, [FromBody] CartItemDto dto)
        {
            var userId = GetUserIdFromToken();
            if (userId == null) return Unauthorized();

            var item = await _context.CartItems.FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId.Value);
            if (item == null) return NotFound();

            var qty = dto.Quantity;
            if (qty <= 0) qty = 1;

            item.Quantity = qty;
            await _context.SaveChangesAsync();

            return Ok(new { success = true });
        }

        // ✅ DELETE /api/cart/{id}
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Remove(int id)
        {
            var userId = GetUserIdFromToken();
            if (userId == null) return Unauthorized();

            var item = await _context.CartItems.FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId.Value);
            if (item == null) return NotFound();

            _context.CartItems.Remove(item);
            await _context.SaveChangesAsync();

            return Ok(new { success = true });
        }

        // ✅ DELETE /api/cart/clear
        [HttpDelete("clear")]
        public async Task<IActionResult> Clear()
        {
            var userId = GetUserIdFromToken();
            if (userId == null) return Unauthorized();

            var items = await _context.CartItems.Where(x => x.UserId == userId.Value).ToListAsync();
            _context.CartItems.RemoveRange(items);
            await _context.SaveChangesAsync();

            return Ok(new { success = true });
        }

        private int? GetUserIdFromToken()
        {
            var claim =
                User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
                User.FindFirst("id")?.Value ??
                User.FindFirst("userId")?.Value;

            return int.TryParse(claim, out var id) ? id : null;
        }
    }
}
