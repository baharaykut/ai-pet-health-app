using Hurma.API.Data;
using Hurma.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Hurma.API.Controllers;

[ApiController]
[Route("api/products")]
public class ProductsController : ControllerBase
{
    private readonly AppDbContext _db;
    public ProductsController(AppDbContext db) => _db = db;

    // ✅ GELİŞMİŞ LİSTELEME
    // /api/products?search=&category=&minPrice=&maxPrice=&sort=
    [HttpGet]
    public async Task<IActionResult> GetAll(
        string? search,
        string? category,
        decimal? minPrice,
        decimal? maxPrice,
        string? sort
    )
    {
        var query = _db.Products.Where(p => p.IsActive && p.Stock > 0).AsQueryable();

        // 🔍 Arama
        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(p => p.Name.Contains(search) || p.Description.Contains(search));

        // 🐾 Kategori
        if (!string.IsNullOrWhiteSpace(category))
            query = query.Where(p => p.Category == category);

        // 💰 Fiyat
        if (minPrice.HasValue)
            query = query.Where(p => p.Price >= minPrice);

        if (maxPrice.HasValue)
            query = query.Where(p => p.Price <= maxPrice);

        // 🔃 Sıralama
        query = sort switch
        {
            "price_asc" => query.OrderBy(p => p.Price),
            "price_desc" => query.OrderByDescending(p => p.Price),
            "popular" => query.OrderByDescending(p => p.InCarts),
            "rating" => query.OrderByDescending(p => p.Rating),
            "newest" => query.OrderByDescending(p => p.Id),
            _ => query.OrderByDescending(p => p.InCarts)
        };

        var items = await query.ToListAsync();
        return Ok(items);
    }

    // ✅ ÜRÜN DETAY
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var product = await _db.Products.FirstOrDefaultAsync(p => p.Id == id && p.IsActive);
        if (product == null) return NotFound();
        return Ok(product);
    }

    // ✅ ÜRÜN EKLE
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Product product)
    {
        product.IsActive = true;
        _db.Products.Add(product);
        await _db.SaveChangesAsync();
        return Ok(product);
    }

    // ✅ KATEGORİ LİSTESİ
    [HttpGet("categories")]
    public async Task<IActionResult> Categories()
    {
        var cats = await _db.Products
            .Where(p => p.IsActive)
            .Select(p => p.Category)
            .Distinct()
            .ToListAsync();

        return Ok(cats);
    }
}
