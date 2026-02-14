namespace Hurma.API.Dtos
{
    public class SpeciesResultDto
    {
        public bool Ok { get; set; }
        public string? Species { get; set; }
        public double Confidence { get; set; }
        public string? Error { get; set; }
    }
}
