namespace Hurma.API.Dtos
{
    public class AiAnalysisDetailDto
    {
        public int Id { get; set; }

        public string? ImageUrl { get; set; }

        public DateTime CreatedAt { get; set; }

        // Pet bilgisi
        public int? PetId { get; set; }
        public string? PetName { get; set; }
        public string? PetType { get; set; }

        // AI sonucu
        public string? Species { get; set; }
        public double SpeciesConfidence { get; set; }

        public string? Disease { get; set; }
        public double DiseaseConfidence { get; set; }

        public string? RiskLevel { get; set; }

        public string? Summary { get; set; }
    }
}
