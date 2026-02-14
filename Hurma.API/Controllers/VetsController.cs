using Hurma.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace Hurma.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VetsController : ControllerBase
    {
        private readonly GooglePlacesService _googlePlacesService;

        private const string FALLBACK_IMAGE =
            "https://images.unsplash.com/photo-1581888227599-779811939961?q=80&w=1200";

        public VetsController(GooglePlacesService googlePlacesService)
        {
            _googlePlacesService = googlePlacesService;
        }

        // ----------------------------------------------------
        // 📍 SADECE GOOGLE MAPS'TEN GERÇEK VETERİNERLER
        // ⚠️ MESAFEYİ FRONTEND HESAPLIYOR
        // ----------------------------------------------------
        [HttpGet("nearby")]
        public async Task<IActionResult> GetNearby([FromQuery] double lat, [FromQuery] double lng)
        {
            if (lat == 0 || lng == 0)
                return BadRequest("Geçerli bir konum gönderilmedi.");

            List<GooglePlaceVet> googleVets = new();

            try
            {
                googleVets = await _googlePlacesService.SearchNearbyVets(lat, lng);
            }
            catch (Exception ex)
            {
                Console.WriteLine("❌ Google Places Hatası: " + ex.Message);
            }

            var result = googleVets.Select(v => new
            {
                id = $"google_{v.PlaceId}",
                name = v.Name,
                address = v.Address,
                phone = "",
                rating = v.Rating,
                isOpen = v.IsOpen,
                photoUrl = !string.IsNullOrWhiteSpace(v.PhotoUrl) ? v.PhotoUrl : FALLBACK_IMAGE,
                isOfficial = false,

                latitude = v.Lat,
                longitude = v.Lng,

                distanceKm = 0.0 // ❗ FRONTEND HESAPLAYACAK
            })
            .Take(50)
            .ToList();

            return Ok(result);
        }
    }
}
