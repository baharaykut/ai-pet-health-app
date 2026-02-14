using System.Text.Json.Serialization;

namespace Hurma.API.Dtos
{
    public class AiAnalyzeResponse
    {
        [JsonPropertyName("ok")]
        public bool Ok { get; set; }

        [JsonPropertyName("result")]
        public AiAnalyzeResult Result { get; set; } = new();
    }

    public class AiAnalyzeResult
    {
        [JsonPropertyName("species")]
        public string? Species { get; set; }

        [JsonPropertyName("species_confidence")]
        public double SpeciesConfidence { get; set; }

        [JsonPropertyName("skin_result")]
        public SkinResult? SkinResult { get; set; }
    }

    public class SkinResult
    {
        [JsonPropertyName("class")]
        public string? Class { get; set; }

        [JsonPropertyName("confidence")]
        public double Confidence { get; set; }
    }
}
