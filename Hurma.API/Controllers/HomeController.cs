using Hurma.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Hurma.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class HomeController : ControllerBase
    {
        private readonly AppDbContext _db;

        public HomeController(AppDbContext db)
        {
            _db = db;
        }

        // =====================================================
        // 🏠 DASHBOARD
        // GET: /api/Home/dashboard
        // =====================================================
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr))
                return Unauthorized();

            int userId = int.Parse(userIdStr);

            string baseUrl = $"{Request.Scheme}://{Request.Host}";

            // =====================================================
            // 🐾 BENİM HAYVANLARIM
            // =====================================================
            var myPets = await _db.Pets
                .AsNoTracking()
                .Where(p => p.UserId == userId)
                .OrderByDescending(p => p.Id)
                .Select(p => new
                {
                    p.Id,
                    p.Name,
                    p.Type,
                    p.Breed,
                    PhotoUrl = p.PhotoUrl == null
                        ? null
                        : (p.PhotoUrl.StartsWith("http") ? p.PhotoUrl : baseUrl + p.PhotoUrl),
                    p.Weight,
                    p.RabiesVaccineDate,
                    p.InternalParasiteDate,
                    p.ExternalParasiteDate
                })
                .ToListAsync();

            // =====================================================
            // 💉 TÜM AŞI + PARAZİT TAKVİMİ
            // =====================================================
            var vaccines = new List<DashboardVaccineItem>();

            foreach (var p in myPets)
            {
                if (p.RabiesVaccineDate != null)
                {
                    vaccines.Add(new DashboardVaccineItem
                    {
                        PetId = p.Id,
                        PetName = p.Name,
                        Vaccine = "Kuduz",
                        Date = p.RabiesVaccineDate.Value,
                        DaysLeft = (int)(p.RabiesVaccineDate.Value.Date - DateTime.Now.Date).TotalDays
                    });
                }

                if (p.InternalParasiteDate != null)
                {
                    vaccines.Add(new DashboardVaccineItem
                    {
                        PetId = p.Id,
                        PetName = p.Name,
                        Vaccine = "İç Parazit",
                        Date = p.InternalParasiteDate.Value,
                        DaysLeft = (int)(p.InternalParasiteDate.Value.Date - DateTime.Now.Date).TotalDays
                    });
                }

                if (p.ExternalParasiteDate != null)
                {
                    vaccines.Add(new DashboardVaccineItem
                    {
                        PetId = p.Id,
                        PetName = p.Name,
                        Vaccine = "Dış Parazit",
                        Date = p.ExternalParasiteDate.Value,
                        DaysLeft = (int)(p.ExternalParasiteDate.Value.Date - DateTime.Now.Date).TotalDays
                    });
                }
            }

            vaccines = vaccines
                .OrderBy(x => x.DaysLeft)
                .ToList();

            // =====================================================
            // 🐶 SAHİPLENDİRMELER
            // =====================================================
            var adoptions = await _db.Adoptions
                .AsNoTracking()
                .OrderByDescending(a => a.Id)
                .Take(10)
                .Select(a => new
                {
                    a.Id,
                    a.Name,
                    a.Type,
                    a.Location,
                    a.Description,
                    PhotoUrl = a.PhotoUrl == null
                        ? null
                        : (a.PhotoUrl.StartsWith("http") ? a.PhotoUrl : baseUrl + a.PhotoUrl)
                })
                .ToListAsync();

            return Ok(new
            {
                myPets,
                vaccines,
                adoptions
            });
        }
    }

    // =====================================================
    // 🔹 DASHBOARD AŞI DTO
    // =====================================================
    public class DashboardVaccineItem
    {
        public int PetId { get; set; }
        public string PetName { get; set; } = "";
        public string Vaccine { get; set; } = "";
        public DateTime Date { get; set; }
        public int DaysLeft { get; set; }
    }
}

