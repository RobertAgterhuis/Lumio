using Lumio.Api.Domain.Common;
using Lumio.Api.Dtos.Common;
using Lumio.Api.Repositories;
using Mapster;
using Microsoft.AspNetCore.Mvc;

namespace Lumio.Api.Controllers;

[ApiController]
[Route("api/v1/notities")]
public class NotitiesController(INotitieRepository notitieRepo, IEigenaarRepository eigenaarRepo) : ControllerBase
{
    /// <summary>Alle notities voor de eigenaar.</summary>
    [HttpGet]
    public async Task<ActionResult<List<SectieNotitieResponse>>> GetAll()
    {
        var eigenaar = await eigenaarRepo.FindAsync();
        if (eigenaar is null) return NotFound("Geen eigenaar gevonden.");

        var notities = await notitieRepo.GetAllForEigenaarAsync(eigenaar.Id);
        return notities.Adapt<List<SectieNotitieResponse>>();
    }

    /// <summary>Notitie ophalen voor een specifieke sectie.</summary>
    [HttpGet("{sectie}")]
    public async Task<ActionResult<SectieNotitieResponse>> GetBySectie(string sectie)
    {
        var eigenaar = await eigenaarRepo.FindAsync();
        if (eigenaar is null) return Ok(new SectieNotitieResponse(Guid.Empty, sectie, "", DateTime.MinValue));

        var notitie = await notitieRepo.FindBySectieAsync(eigenaar.Id, sectie);
        if (notitie is null) return Ok(new SectieNotitieResponse(Guid.Empty, sectie, "", DateTime.MinValue));
        return notitie.Adapt<SectieNotitieResponse>();
    }

    /// <summary>Notitie opslaan (upsert) voor een sectie.</summary>
    [HttpPut("{sectie}")]
    public async Task<ActionResult<SectieNotitieResponse>> Upsert(string sectie, [FromBody] SectieNotitieUpsertRequest request)
    {
        var eigenaar = await eigenaarRepo.FindAsync();
        if (eigenaar is null) return NotFound("Geen eigenaar gevonden.");

        var notitie = await notitieRepo.FindBySectieAsync(eigenaar.Id, sectie);
        if (notitie is null)
        {
            notitie = new SectieNotitie
            {
                EigenaarId = eigenaar.Id,
                Sectie = sectie,
                Inhoud = request.Inhoud,
            };
            await notitieRepo.AddAsync(notitie);
        }
        else
        {
            notitie.Inhoud = request.Inhoud;
        }

        await notitieRepo.CommitAsync();
        return notitie.Adapt<SectieNotitieResponse>();
    }

    /// <summary>Notitie verwijderen voor een sectie.</summary>
    [HttpDelete("{sectie}")]
    public async Task<IActionResult> Delete(string sectie)
    {
        var eigenaar = await eigenaarRepo.FindAsync();
        if (eigenaar is null) return NotFound("Geen eigenaar gevonden.");

        var notitie = await notitieRepo.FindBySectieAsync(eigenaar.Id, sectie);
        if (notitie is null) return NotFound();
        await notitieRepo.RemoveAsync(notitie);
        await notitieRepo.CommitAsync();
        return NoContent();
    }
}
