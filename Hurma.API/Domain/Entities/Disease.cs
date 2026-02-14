namespace Hurma.Domain.Entities;

public class Disease
{
    public int Id { get; set; }
    public string Key { get; set; } = "";      // scabies, ringworm vs
    public string Title { get; set; } = "";    // Uyuz, Mantar...
    public string Description { get; set; } = "";
    public bool IsContagious { get; set; }
    public bool IsUrgent { get; set; }
}
