namespace Hurma.API.Dtos
{
    public class SkinDiseaseResultDto
    {
        public bool Ok { get; set; }
        public string? Animal { get; set; }
        public string? Disease { get; set; }
        public double Confidence { get; set; }
        public string? Error { get; set; }

        public Dictionary<string, double>? All_Probs { get; set; }
    }
}
