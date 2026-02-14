public class AuthResponse
{
    public string Email { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
    public DateTime Expiration { get; set; }

    public bool Success { get; set; } = true;
    public string Message { get; set; } = "Giriş başarılı.";

    public string Role { get; set; } = "USER"; // 👈 EKLE
}
