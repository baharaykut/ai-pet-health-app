namespace Hurma.API.Models;

public class User
{
    public int Id { get; set; }

    public string Email { get; set; } = "";

    public byte[] PasswordHash { get; set; } = Array.Empty<byte>();
    public byte[] PasswordSalt { get; set; } = Array.Empty<byte>();

    public UserRole Role { get; set; } = UserRole.User;

    // ✅ EKLE
    public string? PhotoUrl { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
