using Lumio.Api.Data;
using Lumio.Api.Domain.Common;
using Lumio.Api.Dtos.Common;
using Lumio.Api.Services;
using Mapster;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lumio.Api.Controllers;

[ApiController]
[Route("api/v1/werkgever")]
public class WerkgeverController : ControllerBase
{
    private readonly LumioDbContext _db;
    private readonly IAuditService _audit;

    public WerkgeverController(LumioDbContext db, IAuditService audit)
    {
        _db = db;
        _audit = audit;
    }

    [HttpGet]
    public async Task<ActionResult<List<WerkgeverResponse>>> GetAll()
    {
        var items = await _db.Werkgevers.OrderBy(w => w.BedrijfsNaam).ToListAsync();
        return Ok(items.Adapt<List<WerkgeverResponse>>());
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<WerkgeverResponse>> GetById(Guid id)
    {
        var item = await _db.Werkgevers.FindAsync(id);
        if (item is null) return NotFound();
        return Ok(item.Adapt<WerkgeverResponse>());
    }

    [HttpPost]
    public async Task<ActionResult<WerkgeverResponse>> Create([FromBody] WerkgeverUpsertRequest request)
    {
        var eigenaar = await _db.Eigenaren.FirstOrDefaultAsync();
        if (eigenaar is null)
            return BadRequest(new { error = "Maak eerst een eigenaar profiel aan." });

        var item = request.Adapt<Werkgever>();
        item.EigenaarId = eigenaar.Id;
        _db.Werkgevers.Add(item);
        await _db.SaveChangesAsync();
        await _audit.LogAsync("Aangemaakt", "Werkgever", item.Id);
        return CreatedAtAction(nameof(GetById), new { id = item.Id }, item.Adapt<WerkgeverResponse>());
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<WerkgeverResponse>> Update(Guid id, [FromBody] WerkgeverUpsertRequest request)
    {
        var item = await _db.Werkgevers.FindAsync(id);
        if (item is null) return NotFound();

        request.Adapt(item);
        await _db.SaveChangesAsync();
        await _audit.LogAsync("Gewijzigd", "Werkgever", id);
        return Ok(item.Adapt<WerkgeverResponse>());
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var item = await _db.Werkgevers.FindAsync(id);
        if (item is null) return NotFound();

        _db.Werkgevers.Remove(item);
        await _db.SaveChangesAsync();
        await _audit.LogAsync("Verwijderd", "Werkgever", id);
        return NoContent();
    }
}
