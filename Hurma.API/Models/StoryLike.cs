using Hurma.Domain.Entities;

namespace Hurma.API.Models;

public class StoryLike
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public int StoryId { get; set; }

    public Story Story { get; set; } = null!;
}
