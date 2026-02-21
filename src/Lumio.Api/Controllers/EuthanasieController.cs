using Lumio.Api.Data;
using Lumio.Api.Domain.EuthanasiaDirective;
using Lumio.Api.Dtos.EuthanasiaDirective;
using Mapster;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lumio.Api.Controllers;

[ApiController]
[Route("api/euthanasie")]
public class EuthanasieController : ControllerBase
{
    private readonly LumioDbContext _db;

    public EuthanasieController(LumioDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<WilsverklaringResponse>> Get()
    {
        var item = await _db.Wilsverklaringen.FirstOrDefaultAsync();
        if (item is null) return NotFound();
        return Ok(item.Adapt<WilsverklaringResponse>());
    }

    [HttpPut]
    public async Task<ActionResult<WilsverklaringResponse>> Upsert([FromBody] WilsverklaringUpsertRequest request)
    {
        var eigenaar = await _db.Eigenaren.FirstOrDefaultAsync();
        if (eigenaar is null)
            return BadRequest(new { error = "Maak eerst een eigenaar profiel aan." });

        var item = await _db.Wilsverklaringen.FirstOrDefaultAsync();
        if (item is null)
        {
            item = request.Adapt<WilsverklaringEuthanasie>();
            item.EigenaarId = eigenaar.Id;
            _db.Wilsverklaringen.Add(item);
        }
        else
        {
            request.Adapt(item);
        }

        await _db.SaveChangesAsync();
        return Ok(item.Adapt<WilsverklaringResponse>());
    }

    [HttpGet("voorwaarden")]
    public async Task<ActionResult<List<VoorwaardeResponse>>> GetVoorwaarden()
    {
        var wilsverklaring = await _db.Wilsverklaringen.FirstOrDefaultAsync();
        if (wilsverklaring is null) return Ok(new List<VoorwaardeResponse>());

        var items = await _db.EuthanasieVoorwaarden
            .Where(v => v.WilsverklaringId == wilsverklaring.Id)
            .ToListAsync();
        return Ok(items.Adapt<List<VoorwaardeResponse>>());
    }

    [HttpPost("voorwaarden")]
    public async Task<ActionResult<VoorwaardeResponse>> CreateVoorwaarde([FromBody] VoorwaardeUpsertRequest request)
    {
        var wilsverklaring = await _db.Wilsverklaringen.FirstOrDefaultAsync();
        if (wilsverklaring is null)
            return BadRequest(new { error = "Maak eerst een wilsverklaring aan." });

        var item = request.Adapt<EuthanasieVoorwaarde>();
        item.WilsverklaringId = wilsverklaring.Id;
        _db.EuthanasieVoorwaarden.Add(item);
        await _db.SaveChangesAsync();
        return Created($"/api/euthanasie/voorwaarden/{item.Id}", item.Adapt<VoorwaardeResponse>());
    }

    [HttpPut("voorwaarden/{id:guid}")]
    public async Task<ActionResult<VoorwaardeResponse>> UpdateVoorwaarde(Guid id, [FromBody] VoorwaardeUpsertRequest request)
    {
        var item = await _db.EuthanasieVoorwaarden.FindAsync(id);
        if (item is null) return NotFound();

        request.Adapt(item);
        await _db.SaveChangesAsync();
        return Ok(item.Adapt<VoorwaardeResponse>());
    }

    [HttpDelete("voorwaarden/{id:guid}")]
    public async Task<IActionResult> DeleteVoorwaarde(Guid id)
    {
        var item = await _db.EuthanasieVoorwaarden.FindAsync(id);
        if (item is null) return NotFound();

        _db.EuthanasieVoorwaarden.Remove(item);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
