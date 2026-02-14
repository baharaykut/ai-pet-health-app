using Microsoft.AspNetCore.Http;

namespace Hurma.API.Dtos
{
    public class VetUploadRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string WorkHours { get; set; } = "09:00-18:00";
        public double Rating { get; set; } = 0;
        public bool IsOnDuty { get; set; }
        public IFormFile? Photo { get; set; }
    }
}
