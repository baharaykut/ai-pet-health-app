namespace Hurma.API.Dtos
{
    public class CreateVetRequestDto
    {
        public int VetId { get; set; }
        public string Question { get; set; } = string.Empty;

        // Opsiyonel (ileride AI / Pet bağları için)
        public int? PetId { get; set; }
        public int? AiAnalysisId { get; set; }
    }
}
