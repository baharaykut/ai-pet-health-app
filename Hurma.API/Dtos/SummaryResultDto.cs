namespace Hurma.API.Dtos;

public class SummaryResultDto
{
    public string? Animal { get; set; }
    public string? Disease { get; set; }
    public double Confidence { get; set; }
    public string? RiskLevel { get; set; }
    public string? Message { get; set; }
}
