namespace Hurma.API.Dtos
{
    public class AiAnalyzeRequest
    {
        // İstersen pet seçip analiz bağlarsın
        public int? PetId { get; set; }

        // Mobil taraftan base64 göndermek istersen:
        // "data:image/jpeg;base64,....." veya sadece base64
        public string? ImageBase64 { get; set; }

        // Alternatif: daha önce yüklenmiş dosyanın url'i
        public string? ImageUrl { get; set; }

        // Ek bilgi (opsiyonel)
        public string? Note { get; set; }
    }
}
