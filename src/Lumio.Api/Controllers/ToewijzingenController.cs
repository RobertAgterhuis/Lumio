using Lumio.Api.Domain.AssetRegistry;
using Lumio.Api.Dtos.AssetRegistry;
using Lumio.Api.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace Lumio.Api.Controllers;

[ApiController]
[Route("api/v1/toewijzingen")]
public class ToewijzingenController : ControllerBase
{
    private readonly IToewijzingRepository _repo;

    public ToewijzingenController(IToewijzingRepository repo) => _repo = repo;

    [HttpGet]
    public async Task<ActionResult<List<ErfgenaamToewijzingResponse>>> GetAll()
    {
        var eigenaarId = await _repo.GetEigenaarIdAsync();
        if (eigenaarId is null) return Ok(new List<ErfgenaamToewijzingResponse>());

        var items = await _repo.GetAllAsync(eigenaarId.Value);

        var nameCache = await _repo.BuildEntityNameCacheAsync(items.Select(t => (t.EntityType, t.EntityId)));

        var result = items.Select(t =>
        {
            var erfgenaamNaam = FormatNaam(t.Erfgenaam);
            var entityNaam = nameCache.TryGetValue((t.EntityType, t.EntityId), out var n) ? n : "Onbekend";
            return new ErfgenaamToewijzingResponse(
                t.Id, t.ErfgenaamId, erfgenaamNaam,
                t.EntityType, t.EntityId, entityNaam, t.Instructies);
        }).ToList();

        return Ok(result);
    }

    [HttpGet("erfgenaam/{erfgenaamId:guid}")]
    public async Task<ActionResult<List<ErfgenaamToewijzingResponse>>> GetByErfgenaam(Guid erfgenaamId)
    {
        var erfgenaam = await _repo.FindErfgenaamAsync(erfgenaamId);
        if (erfgenaam is null) return NotFound();

        var items = await _repo.GetByErfgenaamAsync(erfgenaamId);

        var nameCache = await _repo.BuildEntityNameCacheAsync(items.Select(t => (t.EntityType, t.EntityId)));
        var erfgenaamNaam = FormatNaam(erfgenaam);

        var result = items.Select(t =>
        {
            var entityNaam = nameCache.TryGetValue((t.EntityType, t.EntityId), out var n) ? n : "Onbekend";
            return new ErfgenaamToewijzingResponse(
                t.Id, t.ErfgenaamId, erfgenaamNaam,
                t.EntityType, t.EntityId, entityNaam, t.Instructies);
        }).ToList();

        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<ErfgenaamToewijzingResponse>> Create([FromBody] ErfgenaamToewijzingUpsertRequest request)
    {
        var eigenaarId = await _repo.GetEigenaarIdAsync();
        if (eigenaarId is null) return BadRequest(new { error = "Maak eerst een eigenaar profiel aan." });

        var erfgenaam = await _repo.FindErfgenaamAsync(request.ErfgenaamId);
        if (erfgenaam is null) return BadRequest(new { error = "Erfgenaam niet gevonden." });

        var exists = await _repo.ExistsToewijzingAsync(request.ErfgenaamId, request.EntityType, request.EntityId);
        if (exists) return BadRequest(new { error = "Deze toewijzing bestaat al." });

        var item = new ErfgenaamToewijzing
        {
            EigenaarId = eigenaarId.Value,
            ErfgenaamId = request.ErfgenaamId,
            EntityType = request.EntityType,
            EntityId = request.EntityId,
            Instructies = request.Instructies,
        };

        await _repo.AddAsync(item);
        await _repo.CommitAsync();

        var entityNaam = await ResolveEntityNaam(item.EntityType, item.EntityId);
        var erfgenaamNaam = FormatNaam(erfgenaam);
        return Created($"/api/toewijzingen/{item.Id}",
            new ErfgenaamToewijzingResponse(
                item.Id, item.ErfgenaamId, erfgenaamNaam,
                item.EntityType, item.EntityId, entityNaam, item.Instructies));
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ErfgenaamToewijzingResponse>> Update(Guid id, [FromBody] ErfgenaamToewijzingUpsertRequest request)
    {
        var item = await _repo.FindByIdAsync(id);
        if (item is null) return NotFound();

        item.ErfgenaamId = request.ErfgenaamId;
        item.EntityType = request.EntityType;
        item.EntityId = request.EntityId;
        item.Instructies = request.Instructies;
        await _repo.CommitAsync();

        var erfgenaam = await _repo.FindErfgenaamAsync(item.ErfgenaamId);
        var erfgenaamNaam = erfgenaam is not null ? FormatNaam(erfgenaam) : "Onbekend";
        var entityNaam = await ResolveEntityNaam(item.EntityType, item.EntityId);
        return Ok(new ErfgenaamToewijzingResponse(
            item.Id, item.ErfgenaamId, erfgenaamNaam,
            item.EntityType, item.EntityId, entityNaam, item.Instructies));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var item = await _repo.FindByIdAsync(id);
        if (item is null) return NotFound();

        await _repo.RemoveAsync(item);
        await _repo.CommitAsync();
        return NoContent();
    }

    // ── helpers ─────────────────────────────────────────────────────────────

    private async Task<string> ResolveEntityNaam(string entityType, Guid entityId)
    {
        var cache = await _repo.BuildEntityNameCacheAsync([(entityType, entityId)]);
        return cache.TryGetValue((entityType, entityId), out var name) ? name : "Onbekend";
    }

    private static string FormatNaam(Domain.Common.Erfgenaam e) =>
        $"{e.Voornaam} {e.Tussenvoegsel} {e.Achternaam}".Replace("  ", " ").Trim();
}
