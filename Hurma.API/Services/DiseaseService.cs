public class DiseaseService
{
    private static readonly Dictionary<string, AiDiseaseInfoDto> Diseases = new()
    {
        ["scabies"] = new AiDiseaseInfoDto
        {
            Key = "scabies",
            Title = "Uyuz",
            Description = "Paraziter, bulaşıcı deri hastalığı.",
            IsContagious = true,
            IsUrgent = true,
            Actions = {
                "Veterinere götür",
                "Diğer hayvanlardan izole et",
                "Ortamı temizle"
            }
        },
        ["ringworm"] = new AiDiseaseInfoDto
        {
            Key = "ringworm",
            Title = "Mantar",
            Description = "Dermatofitoz mantar enfeksiyonu.",
            IsContagious = true,
            IsUrgent = true,
            Actions = {
                "Veterinere danış",
                "Ortamı temizle"
            }
        }
    };

    public AiDiseaseInfoDto? GetByKey(string? key)
    {
        if (string.IsNullOrWhiteSpace(key)) return null;
        key = key.ToLower().Trim();
        return Diseases.ContainsKey(key) ? Diseases[key] : null;
    }
}
