using Hurma.API.Data;
using Hurma.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Hurma.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AppointmentsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AppointmentsController(AppDbContext context)
        {
            _context = context;
        }

        // 🧾 TÜM RANDEVULARI GETİR
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var appointments = await _context.Appointments
                .Include(a => a.Vet)
                .AsNoTracking()
                .ToListAsync();

            return Ok(appointments);
        }

        // 🧾 ID'YE GÖRE RANDEVU GETİR
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var appointment = await _context.Appointments
                .Include(a => a.Vet)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (appointment == null)
                return NotFound(new { message = "Randevu bulunamadı." });

            return Ok(appointment);
        }

        // 🩺 YENİ RANDEVU OLUŞTUR
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Appointment appointment)
        {
            if (appointment == null)
                return BadRequest(new { message = "Geçersiz veri gönderildi." });

            appointment.Status = "Pending"; // Yeni randevular beklemede başlar
            _context.Appointments.Add(appointment);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Randevu başarıyla oluşturuldu.", appointment });
        }

        // ✏️ RANDEVU GÜNCELLE
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] Appointment updated)
        {
            var appointment = await _context.Appointments.FindAsync(id);
            if (appointment == null)
                return NotFound(new { message = "Randevu bulunamadı." });

            appointment.Name = updated.Name;
            appointment.Phone = updated.Phone;
            appointment.Date = updated.Date;
            appointment.Notes = updated.Notes;
            appointment.Status = updated.Status;
            appointment.VetId = updated.VetId;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Randevu güncellendi.", appointment });
        }

        // ✅ DURUMU GÜNCELLE (örnek: Onayla / İptal et)
        [HttpPatch("{id:int}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] string status)
        {
            var appointment = await _context.Appointments.FindAsync(id);
            if (appointment == null)
                return NotFound(new { message = "Randevu bulunamadı." });

            appointment.Status = status;
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Randevu durumu '{status}' olarak güncellendi." });
        }

        // ❌ RANDEVU SİL
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var appointment = await _context.Appointments.FindAsync(id);
            if (appointment == null)
                return NotFound(new { message = "Silinecek randevu bulunamadı." });

            _context.Appointments.Remove(appointment);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Randevu başarıyla silindi." });
        }
    }
}
