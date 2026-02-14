using Hurma.API.Data;
using Hurma.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Hurma.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MessagesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MessagesController(AppDbContext context)
        {
            _context = context;
        }

        // ✅ Mesaj gönder
        [HttpPost]
        public async Task<IActionResult> Send([FromBody] Message msg)
        {
            if (string.IsNullOrWhiteSpace(msg.Text))
                return BadRequest(new { success = false, message = "Text boş olamaz." });

            msg.CreatedAt = DateTime.UtcNow;
            _context.Messages.Add(msg);
            await _context.SaveChangesAsync();
            return Ok(new { success = true });
        }

        // ✅ 2 kullanıcı arasındaki konuşma
        // /api/Messages/conversation?user1Id=999&user2Id=3
        [HttpGet("conversation")]
        public async Task<IActionResult> Conversation([FromQuery] int user1Id, [FromQuery] int user2Id)
        {
            var list = await _context.Messages
                .Where(m =>
                    (m.FromUserId == user1Id && m.ToUserId == user2Id) ||
                    (m.FromUserId == user2Id && m.ToUserId == user1Id)
                )
                .OrderBy(m => m.CreatedAt)
                .ToListAsync();

            return Ok(list);
        }
    }
}
