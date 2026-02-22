using Lumio.Api.Data;
using Lumio.Api.Domain.Common;
using Lumio.Api.Dtos.Common;
using Mapster;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lumio.Api.Controllers;

[ApiController]
[Route("api/notities")]
public class NotitiesController(LumioDbContext db) : ControllerBase
{
    /// <summary>Alle notities voor de eigenaar.</summary>
    [HttpGet]
    public async Task<ActionResult<List<SectieNotitieResponse>>> GetAll()
    {
        var eigenaar = await db.Eigenaren.FirstOrDefaultAsync();
        if (eigenaar is null) return NotFound("Geen eigenaar gevonden.");

        var notities = await db.SectieNotities
            .Where(n => n.EigenaarId == eigenaar.Id)
            .OrderBy(n => n.Sectie)
            .ToListAsync();

        return notities.Adapt<List<SectieNotitieResponse>>();
    }

    /// <summary>Notitie ophalen voor een specifieke sectie.</summary>
    [HttpGet("{sectie}")]
    public async Task<ActionResult<SectieNotitieResponse>> GetBySectie(string sectie)
    {
        var eigenaar = await db.Eigenaren.FirstOrDefaultAsync();
        if (eigenaar is null) return NotFound("Geen eigenaar gevonden.");

        var notitie = await db.SectieNotities
            .FirstOrDefaultAsync(n => n.EigenaarId == eigenaar.Id && n.Sectie == sectie);

        if (notitie is null) return NotFound();
        return notitie.Adapt<SectieNotitieResponse>();
    }

    /// <summary>Notitie opslaan (upsert) voor een sectie.</summary>
    [HttpPut("{sectie}")]
    public async Task<ActionResult<SectieNotitieResponse>> Upsert(string sectie, [FromBody] SectieNotitieUpsertRequest request)
    {
        var eigenaar = await db.Eigenaren.FirstOrDefaultAsync();
        if (eigenaar is null) return NotFound("Geen eigenaar gevonden.");

        var notitie = await db.SectieNotities
            .FirstOrDefaultAsync(n => n.EigenaarId == eigenaar.Id && n.Sectie == sectie);

        if (notitie is null)
        {
            notitie = new SectieNotitie
            {
                EigenaarId = eigenaar.Id,
                Sectie = sectie,
                Inhoud = request.Inhoud,
            };
            db.SectieNotities.Add(notitie);
        }
        else
        {
            notitie.Inhoud = request.Inhoud;
        }

        await db.SaveChangesAsync();
        return notitie.Adapt<SectieNotitieResponse>();
    }

    /// <summary>Notitie verwijderen voor een sectie.</summary>
    [HttpDelete("{sectie}")]
    public async Task<IActionResult> Delete(string sectie)
    {
        var eigenaar = await db.Eigenaren.FirstOrDefaultAsync();
        if (eigenaar is null) return NotFound("Geen eigenaar gevonden.");

        var notitie = await db.SectieNotities
            .FirstOrDefaultAsync(n => n.EigenaarId == eigenaar.Id && n.Sectie == sectie);

        if (notitie is null) return NotFound();
        db.SectieNotities.Remove(notitie);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
