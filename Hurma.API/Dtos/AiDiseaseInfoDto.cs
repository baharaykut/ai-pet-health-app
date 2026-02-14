public class AiDiseaseInfoDto
{
    public string Key { get; set; } = "";
    public string Title { get; set; } = "";
    public string Description { get; set; } = "";
    public bool IsContagious { get; set; }
    public bool IsUrgent { get; set; }
    public List<string> Actions { get; set; } = new();
}
