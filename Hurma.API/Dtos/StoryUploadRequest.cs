using Microsoft.AspNetCore.Http;

namespace Hurma.API.Dtos
{
    public class StoryUploadRequest
    {
        public int userId { get; set; }
        public string? userName { get; set; }
        public string content { get; set; } = "";
        public bool isVetPost { get; set; }

        public IFormFile? image { get; set; }
    }
}
