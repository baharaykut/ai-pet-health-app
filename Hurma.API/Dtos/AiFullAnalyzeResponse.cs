public class AiFullAnalyzeResponse
{
    public object? Species { get; set; }
    public object? SkinDisease { get; set; }
    public object? Summary { get; set; }
    public object[] YoloDetections { get; set; } = [];
    public List<AiVetDto> Vets { get; set; } = [];
    public AiDiseaseInfoDto? DiseaseInfo { get; set; }
}
