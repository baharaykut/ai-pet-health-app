namespace Hurma.API.Dtos;

public class AuthResponse
{
    /// <summary>
    /// Kullanıcının e-posta adresi
    /// </summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// JWT Token değeri (login sonrası döner)
    /// </summary>
    public string Token { get; set; } = string.Empty;

    /// <summary>
    /// Token'ın geçerlilik süresi (UTC)
    /// </summary>
    public DateTime Expiration { get; set; }

    /// <summary>
    /// İşlem sonucu (true: başarılı, false: hata)
    /// </summary>
    public bool Success { get; set; } = true;

    /// <summary>
    /// Bilgilendirme veya hata mesajı
    /// </summary>
    public string Message { get; set; } = "Giriş başarılı.";

    /// <summary>
    /// Kullanıcı rolü (USER / VET)
    /// </summary>
    public string Role { get; set; } = "USER"; // 🔥 EKLENEN ALAN
}
