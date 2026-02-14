using Microsoft.AspNetCore.Http;

namespace Hurma.API.Models
{
    public class StoryUploadRequest
    {
        public int userId { get; set; }
        public int petId { get; set; }
        public string? caption { get; set; }

        // 🔥 Swagger'da dosya seçtiren alan
        public IFormFile media { get; set; } = null!;
    }
}
