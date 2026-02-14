using Hurma.API.Data;
using Hurma.API.Dtos;
using Hurma.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Hurma.API.Controllers;

[ApiController]
[Route("api/addresses")]
[Authorize]
public class AddressesController : ControllerBase
{
    private readonly AppDbContext _db;

    public AddressesController(AppDbContext db)
    {
        _db = db;
    }

    // =================================================
    // GET MY ADDRESSES
    // =================================================
    // GET /api/addresses
    // GET /api/addresses/my   (alias)
    // =================================================
    [HttpGet]
    [HttpGet("my")]
    public async Task<ActionResult<List<AddressDto>>> GetMyAddresses()
    {
        int userId = AuthHelpers.GetUserId(User);

        var list = await _db.Addresses
            .AsNoTracking()
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.Id)
            .Select(a => new AddressDto(
                a.Id,
                a.Title,
                a.FullName,
                a.Phone,
                a.City,
                a.District,
                a.Detail
            ))
            .ToListAsync();

        return Ok(list);
    }

    // =================================================
    // CREATE ADDRESS
    // POST /api/addresses
    // =================================================
    [HttpPost]
    public async Task<ActionResult<AddressDto>> Create(
        [FromBody] UpsertAddressRequest req)
    {
        int userId = AuthHelpers.GetUserId(User);

        var address = new Address
        {
            UserId = userId,
            Title = req.Title,
            FullName = req.FullName,
            Phone = req.Phone,
            City = req.City,
            District = req.District,
            Detail = req.Detail
        };

        _db.Addresses.Add(address);
        await _db.SaveChangesAsync();

        return Ok(new AddressDto(
            address.Id,
            address.Title,
            address.FullName,
            address.Phone,
            address.City,
            address.District,
            address.Detail
        ));
    }

    // =================================================
    // UPDATE ADDRESS
    // PUT /api/addresses/{id}
    // =================================================
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] UpsertAddressRequest req)
    {
        int userId = AuthHelpers.GetUserId(User);

        var address = await _db.Addresses
            .FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);

        if (address == null)
            return NotFound("Adres bulunamadı.");

        address.Title = req.Title;
        address.FullName = req.FullName;
        address.Phone = req.Phone;
        address.City = req.City;
        address.District = req.District;
        address.Detail = req.Detail;

        await _db.SaveChangesAsync();

        return NoContent();
    }

    // =================================================
    // DELETE ADDRESS
    // DELETE /api/addresses/{id}
    // =================================================
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        int userId = AuthHelpers.GetUserId(User);

        var address = await _db.Addresses
            .FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);

        if (address == null)
            return NoContent();

        _db.Addresses.Remove(address);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}
