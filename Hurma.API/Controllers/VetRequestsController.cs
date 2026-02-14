using System.Security.Claims;
using Hurma.API.Data;
using Hurma.API.Dtos;
using Hurma.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Hurma.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // 🔐 HER ŞEY TOKEN İLE
    public class VetRequestsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public VetRequestsController(AppDbContext context)
        {
            _context = context;
        }

        // ================= USER -> Vet'e soru gönderir =================
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateVetRequestDto dto)
        {
            if (dto.VetId <= 0)
                return BadRequest(new { message = "VetId zorunlu." });

            if (string.IsNullOrWhiteSpace(dto.Question))
                return BadRequest(new { message = "Soru boş olamaz." });

            // 🔑 USER ID TOKEN'DAN ALINIYOR
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrWhiteSpace(userIdStr) || !int.TryParse(userIdStr, out var userId))
                return Unauthorized(new { message = "Geçersiz token (userId yok)." });

            var request = new VetRequest
            {
                UserId = userId,
                VetId = dto.VetId,
                Question = dto.Question.Trim(),
                IsAccepted = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.VetRequests.Add(request);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                requestId = request.Id
            });
        }

        // ================= VET -> Kendisine gelen talepler =================
        [HttpGet("vet/{vetId}")]
        [Authorize(Roles = "VET")]
        public async Task<IActionResult> GetForVet(int vetId)
        {
            var requests = await _context.VetRequests
                .Where(x => x.VetId == vetId)
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();

            return Ok(requests);
        }

        // ================= VET -> Talebi kabul eder =================
        [HttpPost("{id}/accept")]
        [Authorize(Roles = "VET")]
        public async Task<IActionResult> Accept(int id)
        {
            var request = await _context.VetRequests.FindAsync(id);
            if (request == null)
                return NotFound();

            request.IsAccepted = true;
            await _context.SaveChangesAsync();

            return Ok(new { success = true });
        }
    }
}
