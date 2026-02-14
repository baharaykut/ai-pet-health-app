namespace Hurma.Domain.Entities;

public class Story
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public string UserName { get; set; } = "";

    public string Content { get; set; } = "";
    public string? ImageUrl { get; set; }

    public bool IsVetPost { get; set; }
    public int LikeCount { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
