using System.Globalization;
using System.Text.Json;

namespace Hurma.API.Services
{
    public class GooglePlacesService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _config;

        public GooglePlacesService(HttpClient httpClient, IConfiguration config)
        {
            _httpClient = httpClient;
            _config = config;
        }

        public async Task<List<GooglePlaceVet>> SearchNearbyVets(double lat, double lng)
        {
            var apiKey = _config["Google:PlacesApiKey"];

            if (string.IsNullOrWhiteSpace(apiKey))
                throw new Exception("Google Places API Key bulunamadı!");

            var url =
                $"https://maps.googleapis.com/maps/api/place/nearbysearch/json" +
                $"?location={lat.ToString(CultureInfo.InvariantCulture)},{lng.ToString(CultureInfo.InvariantCulture)}" +
                $"&radius=50000" +   // 🔥 50 KM
                $"&type=veterinary_care" +
                $"&key={apiKey}";

            var response = await _httpClient.GetAsync(url);
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();
            var doc = JsonDocument.Parse(json);

            var results = new List<GooglePlaceVet>();

            if (!doc.RootElement.TryGetProperty("results", out var places))
                return results;

            foreach (var p in places.EnumerateArray())
            {
                var loc = p.GetProperty("geometry").GetProperty("location");

                string? photoUrl = null;

                // 📸 Foto
                if (p.TryGetProperty("photos", out var photos) && photos.GetArrayLength() > 0)
                {
                    var photoRef = photos[0].GetProperty("photo_reference").GetString();
                    if (!string.IsNullOrEmpty(photoRef))
                    {
                        photoUrl =
                            $"https://maps.googleapis.com/maps/api/place/photo" +
                            $"?maxwidth=1200" +
                            $"&photo_reference={photoRef}" +
                            $"&key={apiKey}";
                    }
                }

                results.Add(new GooglePlaceVet
                {
                    PlaceId = p.GetProperty("place_id").GetString() ?? "",
                    Name = p.GetProperty("name").GetString() ?? "",
                    Address = p.TryGetProperty("vicinity", out var vic) ? vic.GetString() ?? "" : "",
                    Rating = p.TryGetProperty("rating", out var r) ? r.GetDouble() : 4.0,
                    Lat = loc.GetProperty("lat").GetDouble(),
                    Lng = loc.GetProperty("lng").GetDouble(),
                    IsOpen = p.TryGetProperty("opening_hours", out var oh)
                             && oh.TryGetProperty("open_now", out var on)
                             && on.GetBoolean(),
                    PhotoUrl = photoUrl,
                    IsOfficial = false
                });
            }

            return results;
        }
    }

    public class GooglePlaceVet
    {
        public string PlaceId { get; set; } = "";
        public string Name { get; set; } = "";
        public string Address { get; set; } = "";
        public double Rating { get; set; }
        public double Lat { get; set; }
        public double Lng { get; set; }
        public bool IsOpen { get; set; }
        public string? PhotoUrl { get; set; }
        public bool IsOfficial { get; set; }
    }
}
