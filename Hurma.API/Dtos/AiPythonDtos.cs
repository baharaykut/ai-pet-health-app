using System.Text.Json.Serialization;

namespace Hurma.API.Dtos
{
    // ================= WRAPPER =================
    public class AiPythonWrapper
    {
        [JsonPropertyName("ok")]
        public bool Ok { get; set; }

        [JsonPropertyName("error")]
        public string? Error { get; set; }

        [JsonPropertyName("result")]
        public AiPythonResult? Result { get; set; }
    }

    // ================= RESULT =================
    public class AiPythonResult
    {
        [JsonPropertyName("success")]
        public bool Success { get; set; }

        [JsonPropertyName("species")]
        public string? Species { get; set; }

        // ❗ PYTHON: speciesConfidence
        [JsonPropertyName("speciesConfidence")]
        public double SpeciesConfidence { get; set; }

        // ❗ PYTHON: skinDisease
        [JsonPropertyName("skinDisease")]
        public AiPythonSkinDisease? SkinDisease { get; set; }

        // ❗ PYTHON: summary
        [JsonPropertyName("summary")]
        public AiPythonSummary? Summary { get; set; }
    }

    // ================= SKIN DISEASE =================
    public class AiPythonSkinDisease
    {
        [JsonPropertyName("animal")]
        public string? Animal { get; set; }

        [JsonPropertyName("disease")]
        public string? Disease { get; set; }

        [JsonPropertyName("confidence")]
        public double Confidence { get; set; }
    }

    // ================= SUMMARY =================
    public class AiPythonSummary
    {
        [JsonPropertyName("animal")]
        public string? Animal { get; set; }

        [JsonPropertyName("disease")]
        public string? Disease { get; set; }

        [JsonPropertyName("confidence")]
        public double Confidence { get; set; }

        [JsonPropertyName("riskLevel")]
        public string? RiskLevel { get; set; }

        [JsonPropertyName("message")]
        public string? Message { get; set; }
    }
}
