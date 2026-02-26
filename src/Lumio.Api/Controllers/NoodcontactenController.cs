using Lumio.Api.Data;
using Lumio.Api.Domain.Common;
using Lumio.Api.Dtos.Common;
using Lumio.Api.Services;
using Mapster;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace Lumio.Api.Controllers;

[ApiController]
[Route("api/noodcontacten")]
public class NoodcontactenController : ControllerBase
{
    private readonly LumioDbContext _db;
    private readonly IAuditService _audit;

    public NoodcontactenController(LumioDbContext db, IAuditService audit)
    {
        _db = db;
        _audit = audit;
    }

    [HttpGet]
    public async Task<ActionResult<List<NoodcontactResponse>>> GetAll()
    {
        var items = await _db.Noodcontacten.OrderBy(n => n.Naam).ToListAsync();
        return Ok(items.Adapt<List<NoodcontactResponse>>());
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<NoodcontactResponse>> GetById(Guid id)
    {
        var item = await _db.Noodcontacten.FindAsync(id);
        if (item is null) return NotFound();
        return Ok(item.Adapt<NoodcontactResponse>());
    }

    [HttpPost]
    public async Task<ActionResult<NoodcontactResponse>> Create([FromBody] NoodcontactUpsertRequest request)
    {
        var eigenaar = await _db.Eigenaren.FirstOrDefaultAsync();
        if (eigenaar is null)
            return BadRequest(new { error = "Maak eerst een eigenaar profiel aan." });

        var item = request.Adapt<Noodcontact>();
        item.EigenaarId = eigenaar.Id;
        _db.Noodcontacten.Add(item);
        await _db.SaveChangesAsync();
        await _audit.LogAsync("Aangemaakt", "Noodcontact", item.Id);
        return CreatedAtAction(nameof(GetById), new { id = item.Id }, item.Adapt<NoodcontactResponse>());
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<NoodcontactResponse>> Update(Guid id, [FromBody] NoodcontactUpsertRequest request)
    {
        var item = await _db.Noodcontacten.FindAsync(id);
        if (item is null) return NotFound();

        request.Adapt(item);
        await _db.SaveChangesAsync();
        await _audit.LogAsync("Gewijzigd", "Noodcontact", id);
        return Ok(item.Adapt<NoodcontactResponse>());
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var item = await _db.Noodcontacten.FindAsync(id);
        if (item is null) return NotFound();

        _db.Noodcontacten.Remove(item);
        await _db.SaveChangesAsync();
        await _audit.LogAsync("Verwijderd", "Noodcontact", id);
        return NoContent();
    }

    /// <summary>
    /// Exporteer alle als 'gedeeld' gemarkeerde noodcontacten als JSON.
    /// Hiermee kunnen gedeelde contacten (bijv. huisarts, notaris) worden
    /// overgedragen naar een ander profiel.
    /// </summary>
    [HttpGet("gedeeld/export")]
    public async Task<IActionResult> ExportGedeeld()
    {
        var gedeeld = await _db.Noodcontacten
            .Where(n => n.IsGedeeld)
            .OrderBy(n => n.Naam)
            .ToListAsync();

        var dtos = gedeeld.Select(n => new GedeeldNoodcontactDto(
            n.Naam, n.Relatie, n.Telefoon, n.Email,
            n.Adres, n.Postcode, n.Woonplaats, n.Rol, n.Instructies
        )).ToList();

        var json = JsonSerializer.Serialize(dtos, new JsonSerializerOptions
        {
            WriteIndented = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        return File(
            System.Text.Encoding.UTF8.GetBytes(json),
            "application/json",
            "gedeelde-noodcontacten.json"
        );
    }

    /// <summary>
    /// Importeer gedeelde noodcontacten uit een JSON-bestand.
    /// Duplicaten (op basis van naam + rol) worden overgeslagen.
    /// </summary>
    [HttpPost("gedeeld/import")]
    public async Task<IActionResult> ImportGedeeld([FromBody] List<GedeeldNoodcontactDto> contacten)
    {
        var eigenaar = await _db.Eigenaren.FirstOrDefaultAsync();
        if (eigenaar is null)
            return BadRequest(new { error = "Maak eerst een eigenaar profiel aan." });

        var bestaand = await _db.Noodcontacten.ToListAsync();
        var toegevoegd = 0;
        var overgeslagen = 0;

        foreach (var dto in contacten)
        {
            // Skip duplicates based on name + role + email + phone
            var isDuplicaat = bestaand.Any(b =>
                b.Naam.Equals(dto.Naam, StringComparison.OrdinalIgnoreCase) &&
                b.Rol.Equals(dto.Rol, StringComparison.OrdinalIgnoreCase) &&
                string.Equals(b.Email ?? "", dto.Email ?? "", StringComparison.OrdinalIgnoreCase) &&
                string.Equals(b.Telefoon ?? "", dto.Telefoon ?? "", StringComparison.OrdinalIgnoreCase));

            if (isDuplicaat)
            {
                overgeslagen++;
                continue;
            }

            var item = new Noodcontact
            {
                EigenaarId = eigenaar.Id,
                Naam = dto.Naam,
                Relatie = dto.Relatie,
                Telefoon = dto.Telefoon,
                Email = dto.Email,
                Adres = dto.Adres,
                Postcode = dto.Postcode,
                Woonplaats = dto.Woonplaats,
                Rol = dto.Rol,
                Instructies = dto.Instructies,
                IsGedeeld = true
            };
            _db.Noodcontacten.Add(item);
            toegevoegd++;
        }

        await _db.SaveChangesAsync();

        return Ok(new { toegevoegd, overgeslagen });
    }
}
