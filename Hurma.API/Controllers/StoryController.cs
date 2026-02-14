using Hurma.API.Data;
using Hurma.Domain.Entities;
using Hurma.API.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Hurma.API.Controllers
{
    [ApiController]
    [Route("api/story")]
    public class StoryController : ControllerBase
    {
        private readonly AppDbContext _db;

        public StoryController(AppDbContext db)
        {
            _db = db;
        }

        // ==================== STORY CREATE (POST) ====================
        [HttpPost("create")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> CreateStory([FromForm] StoryUploadRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.content))
                return BadRequest("İçerik (content) zorunludur.");

            string? imageUrl = null;

            // 📷 Eğer resim geldiyse kaydet
            if (request.image != null && request.image.Length > 0)
            {
                var uploadPath = Path.Combine(
                    Directory.GetCurrentDirectory(),
                    "wwwroot",
                    "uploads",
                    "stories"
                );

                Directory.CreateDirectory(uploadPath);

                var fileName = $"{Guid.NewGuid()}{Path.GetExtension(request.image.FileName)}";
                var filePath = Path.Combine(uploadPath, fileName);

                await using var stream = new FileStream(filePath, FileMode.Create);
                await request.image.CopyToAsync(stream);

                imageUrl = $"/uploads/stories/{fileName}";
            }

            var story = new Story
            {
                UserId = request.userId,
                UserName = request.userName ?? "Kullanıcı",
                Content = request.content,
                ImageUrl = imageUrl,
                IsVetPost = request.isVetPost,
                LikeCount = 0,
                CreatedAt = DateTime.UtcNow
            };

            _db.Stories.Add(story);
            await _db.SaveChangesAsync();

            return Ok(story);
        }

        // ==================== ALL STORIES ====================
        [HttpGet("all")]
        public async Task<IActionResult> GetAllStories()
        {
            var stories = await _db.Stories
                .AsNoTracking()
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();

            return Ok(stories);
        }
    }
}
