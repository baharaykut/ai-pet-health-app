using Hurma.API.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Hurma.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CommunityController : ControllerBase
    {
        private readonly AppDbContext _db;

        public CommunityController(AppDbContext db)
        {
            _db = db;
        }

        // ----------------------------------------------------
        // 🌍 TOPLULUK FEED
        // ----------------------------------------------------
        [HttpGet("feed")]
        public async Task<IActionResult> GetFeed()
        {
            var stories = await _db.Stories
                .AsNoTracking()
                .OrderByDescending(s => s.Id)
                .Select(s => new
                {
                    s.Id,
                    s.ImageUrl,
                    Content = s.Content,
                    LikeCount = s.LikeCount,
                    CommentCount = _db.StoryComments.Count(c => c.StoryId == s.Id),
                    s.UserName,
                    s.IsVetPost,
                    s.CreatedAt
                })
                .ToListAsync();

            return Ok(stories);
        }
    }
}
