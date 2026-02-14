using Hurma.API.Data;
using Hurma.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace Hurma.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ArticlesController : ControllerBase
    {
        private readonly AppDbContext _db;

        public ArticlesController(AppDbContext db)
        {
            _db = db;
        }

        // ------------------------------------------------
        // 📄 TÜM MAKALELER
        // ------------------------------------------------
        [HttpGet]
        public IActionResult GetAll()
        {
            var articles = _db.Articles
                .OrderByDescending(x => x.CreatedAt)
                .ToList();

            return Ok(articles);
        }

        // ------------------------------------------------
        // 📄 TEK MAKALE
        // ------------------------------------------------
        [HttpGet("{id:int}")]
        public IActionResult Get(int id)
        {
            var article = _db.Articles.Find(id);
            if (article == null) return NotFound();
            return Ok(article);
        }

        // ------------------------------------------------
        // 🌱 SEED (ÖRNEK MAKALE DOLDURMA)
        // ------------------------------------------------
        // ⚠️ GET yaptık ki tarayıcıdan direkt çalışsın
        [HttpGet("seed")]
        public IActionResult Seed()
        {
            if (_db.Articles.Any())
                return Ok("Zaten makaleler var.");

            _db.Articles.AddRange(
                new Article
                {
                    Title = "Kediler neden mırlar?",
                    Summary = "Kedilerin mırlama davranışının bilimsel açıklaması",
                    Content = "Kediler sadece mutlu olduklarında değil, stres altındayken de mırlar...",
                    ImageUrl = "https://placekitten.com/600/400",
                    CreatedAt = DateTime.UtcNow
                },
                new Article
                {
                    Title = "Köpeklerde mama seçimi",
                    Summary = "Doğru mama nasıl seçilir?",
                    Content = "Köpeğin yaşı, kilosu ve cinsi mama seçiminde çok önemlidir...",
                    ImageUrl = "https://place-puppy.com/600x400",
                    CreatedAt = DateTime.UtcNow.AddMinutes(-10)
                },
                new Article
                {
                    Title = "Evcil hayvanlarda aşı takvimi",
                    Summary = "Hangi aşı ne zaman yapılmalı?",
                    Content = "Kedi ve köpeklerde yavruluk döneminden itibaren düzenli aşı çok önemlidir...",
                    ImageUrl = "https://placebear.com/600/400",
                    CreatedAt = DateTime.UtcNow.AddHours(-1)
                }
            );

            _db.SaveChanges();

            return Ok("Seed OK ✅");
        }
    }
}

