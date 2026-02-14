using System.Security.Cryptography;
using System.Text;
using Hurma.API.Data;
using Hurma.API.Dtos;
using Hurma.API.Models;
using Hurma.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Hurma.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ITokenService _tokenService;

        public AuthController(AppDbContext context, ITokenService tokenService)
        {
            _context = context;
            _tokenService = tokenService;
        }

        // =====================================================
        // 📝 REGISTER
        // =====================================================
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new { success = false, message = "Email ve şifre zorunludur." });
            }

            bool exists = await _context.Users.AnyAsync(u => u.Email == request.Email);
            if (exists)
                return BadRequest(new { success = false, message = "Bu email zaten kayıtlı." });

            CreatePasswordHash(request.Password, out var hash, out var salt);

            var user = new User
            {
                Email = request.Email,
                PasswordHash = hash,
                PasswordSalt = salt,
                Role = UserRole.User
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                message = "Kayıt başarılı 🎉"
            });
        }

        // =====================================================
        // 🔐 LOGIN
        // =====================================================
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var user = await _context.Users
                .SingleOrDefaultAsync(u => u.Email == request.Email);

            if (user == null)
                return Unauthorized(new { success = false, message = "Email veya şifre hatalı." });

            bool valid = VerifyPasswordHash(
                request.Password,
                user.PasswordHash,
                user.PasswordSalt
            );

            if (!valid)
                return Unauthorized(new { success = false, message = "Email veya şifre hatalı." });

            var token = _tokenService.CreateToken(user);

            return Ok(new AuthResponse
            {
                Email = user.Email,
                Token = token,
                Expiration = DateTime.UtcNow.AddDays(7),
                Success = true,
                Message = "Login successful",
                Role = user.Role == UserRole.Vet ? "VET" : "USER"
            });
        }

        // =====================================================
        // 🔄 SET ROLE
        // =====================================================
        [Authorize]
        [HttpPost("set-role")]
        public async Task<IActionResult> SetRole([FromBody] SetRoleRequest request)
        {
            int userId;
            try
            {
                userId = AuthHelpers.GetUserId(User);
            }
            catch (Exception ex)
            {
                return Unauthorized(new { success = false, message = ex.Message });
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
                return NotFound(new { success = false, message = "Kullanıcı bulunamadı." });

            user.Role = request.Role == "VET"
                ? UserRole.Vet
                : UserRole.User;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                role = request.Role
            });
        }

        // =====================================================
        // 👤 ME
        // =====================================================
        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> Me()
        {
            int userId;
            try
            {
                userId = AuthHelpers.GetUserId(User);
            }
            catch (Exception ex)
            {
                return Unauthorized(new { success = false, message = ex.Message });
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
                return Unauthorized(new { success = false, message = "Kullanıcı bulunamadı." });

            return Ok(new
            {
                id = user.Id,
                email = user.Email,
                role = user.Role == UserRole.Vet ? "VET" : "USER",
                success = true
            });
        }

        // =====================================================
        // 🔑 CHANGE PASSWORD
        // =====================================================
        [Authorize]
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            int userId;
            try
            {
                userId = AuthHelpers.GetUserId(User);
            }
            catch (Exception ex)
            {
                return Unauthorized(new { success = false, message = ex.Message });
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
                return NotFound(new { success = false, message = "Kullanıcı bulunamadı." });

            bool valid = VerifyPasswordHash(
                request.OldPassword,
                user.PasswordHash,
                user.PasswordSalt
            );

            if (!valid)
                return BadRequest(new { success = false, message = "Eski şifre yanlış." });

            CreatePasswordHash(request.NewPassword, out var newHash, out var newSalt);

            user.PasswordHash = newHash;
            user.PasswordSalt = newSalt;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                message = "Şifre başarıyla değiştirildi."
            });
        }

        // =====================================================
        // 🔒 PASSWORD HELPERS
        // =====================================================
        private static void CreatePasswordHash(string password, out byte[] hash, out byte[] salt)
        {
            using var hmac = new HMACSHA512();
            salt = hmac.Key;
            hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
        }

        private static bool VerifyPasswordHash(string password, byte[] storedHash, byte[] storedSalt)
        {
            using var hmac = new HMACSHA512(storedSalt);
            var computed = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
            return computed.SequenceEqual(storedHash);
        }
    }
}
