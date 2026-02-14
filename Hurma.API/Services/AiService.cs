using Hurma.API.Dtos;
using System.Net.Http.Headers;
using System.Text.Json;

namespace Hurma.API.Services
{
    public class AiService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _config;

        public AiService(HttpClient httpClient, IConfiguration config)
        {
            _httpClient = httpClient;
            _config = config;
        }

        public async Task<AiPythonResult> AnalyzeAsync(byte[] imageBytes)
        {
            var baseUrl = _config["AIService:BaseUrl"];

            if (string.IsNullOrWhiteSpace(baseUrl))
                throw new Exception("❌ AIService:BaseUrl tanımlı değil (appsettings.json)");

            baseUrl = baseUrl.TrimEnd('/');

            // ✅ DOĞRU PYTHON ENDPOINT
            var url = $"{baseUrl}/ai/analyze";

            Console.WriteLine("🤖 AI REQUEST URL: " + url);

            using var form = new MultipartFormDataContent();

            var imageContent = new ByteArrayContent(imageBytes);
            imageContent.Headers.ContentType = MediaTypeHeaderValue.Parse("image/jpeg");

            form.Add(imageContent, "file", "photo.jpg");

            var response = await _httpClient.PostAsync(url, form);

            var responseText = await response.Content.ReadAsStringAsync();

            Console.WriteLine("🤖 AI RAW RESPONSE: " + responseText);

            if (!response.IsSuccessStatusCode)
                throw new Exception($"AI servisi hata döndü: {responseText}");

            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };

            var wrapper = JsonSerializer.Deserialize<AiPythonWrapper>(responseText, options);

            if (wrapper == null)
                throw new Exception("AI cevabı parse edilemedi!");

            if (!wrapper.Ok)
                throw new Exception("AI hata döndürdü: " + wrapper.Error);

            if (wrapper.Result == null)
                throw new Exception("AI result null geldi!");

            return wrapper.Result;
        }
    }
}
