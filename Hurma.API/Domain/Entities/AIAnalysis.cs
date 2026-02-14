namespace Hurma.Domain.Entities
{
    public class AIAnalysis
    {
        public int Id { get; set; }

        // =========================
        // 🔐 OWNERSHIP
        // =========================
        public int UserId { get; set; }
        public int? PetId { get; set; }

        // =========================
        // 🖼 IMAGE
        // =========================
        public string? ImageUrl { get; set; }

        // =========================
        // 🧠 AI RESULTS
        // =========================
        public string? Animal { get; set; }
        public double AnimalConfidence { get; set; }

        public string? DiseaseKey { get; set; }
        public double DiseaseConfidence { get; set; }

        // =========================
        // ⚠️ RISK & SUMMARY
        // =========================
        public string RiskLevel { get; set; } = "LOW";
        public string? Summary { get; set; }

        // =========================
        // 🕒 META
        // =========================
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
