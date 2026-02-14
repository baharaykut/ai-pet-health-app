using Hurma.Domain.Entities;

namespace Hurma.API.Data;

public static class ProductSeeder
{
    public static void Seed(AppDbContext db)
    {
        if (db.Products.Any())
            return;

        var baseProducts = new List<Product>
        {
            new Product {
                Name = "Pro Plan Adult Kedi Maması 15kg",
                Description = "Yüksek proteinli premium kedi maması",
                Price = 1899,
                OriginalPrice = 2199,
                Category = "Kedi Maması",
                PhotoUrl = "/uploads/kedi-mama-1.png",
                Stock = 50,
                Rating = 4.8,
                ReviewCount = 1240,
                InCarts = 500
            },

            new Product {
                Name = "Royal Canin Köpek Maması 15kg",
                Description = "Büyük ırklar için tam besin",
                Price = 2099,
                OriginalPrice = 2399,
                Category = "Köpek Maması",
                PhotoUrl = "/uploads/kopek-mama-1.png",
                Stock = 40,
                Rating = 4.7,
                ReviewCount = 980,
                InCarts = 430
            },

            new Product {
                Name = "Topaklanan Kedi Kumu 10L",
                Description = "Kokusuz, yüksek emici",
                Price = 299,
                OriginalPrice = 349,
                Category = "Kum",
                PhotoUrl = "/uploads/kedi-kum-1.png",
                Stock = 200,
                Rating = 4.6,
                ReviewCount = 1500,
                InCarts = 700
            },

            new Product {
                Name = "Kedi Oyuncak Seti 5'li",
                Description = "Zilli, tüylü eğlenceli oyuncak set",
                Price = 149,
                OriginalPrice = 199,
                Category = "Oyuncak",
                PhotoUrl = "/uploads/kedi-oyuncak-1.png",
                Stock = 300,
                Rating = 4.5,
                ReviewCount = 800,
                InCarts = 350
            },

            new Product {
                Name = "Kedi & Köpek Taşıma Çantası",
                Description = "Uçak kabinine uygun",
                Price = 799,
                OriginalPrice = 999,
                Category = "Aksesuar",
                PhotoUrl = "/uploads/tasima-cantasi-1.png",
                Stock = 60,
                Rating = 4.9,
                ReviewCount = 420,
                InCarts = 260
            },
        };

        var bigList = new List<Product>();

        int index = 1;
        foreach (var p in baseProducts)
        {
            for (int i = 0; i < 8; i++)
            {
                bigList.Add(new Product
                {
                    Name = p.Name + " " + (index),
                    Description = p.Description,
                    Price = p.Price + (i * 10),
                    OriginalPrice = p.OriginalPrice,
                    Category = p.Category,
                    PhotoUrl = p.PhotoUrl,
                    Stock = 100,
                    Rating = p.Rating,
                    ReviewCount = p.ReviewCount + i * 5,
                    InCarts = p.InCarts + i * 10,
                    IsActive = true
                });
                index++;
            }
        }

        db.Products.AddRange(bigList);
        db.SaveChanges();
    }
}
