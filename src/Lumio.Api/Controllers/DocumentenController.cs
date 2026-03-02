using Lumio.Api.Domain.Documents;
using Lumio.Api.Dtos.Documents;
using Lumio.Api.Repositories;
using Lumio.Api.Rules.Configuration;
using Lumio.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace Lumio.Api.Controllers;

[ApiController]
[Route("api/v1/documenten")]
public class DocumentenController : ControllerBase
{
    private readonly IDocumentRepository _repo;
    private readonly IAuditService _audit;

    public DocumentenController(IDocumentRepository repo, IAuditService audit)
    {
        _repo = repo;
        _audit = audit;
    }

    [HttpGet]
    public async Task<ActionResult<List<DocumentResponse>>> GetAll()
    {
        var all = await _repo.GetAllAsync();

        var versionCounts = all
            .GroupBy(d => d.DocumentGroepId)
            .ToDictionary(g => g.Key, g => g.Count());

        var latest = all
            .GroupBy(d => d.DocumentGroepId)
            .Select(g => g.First())
            .ToList();

        var result = latest.Select(d => new DocumentResponse(
            d.Id, d.Naam, d.Categorie.ToString(), d.BestandsNaam, d.ContentType,
            d.BestandsGrootte, d.Notities, d.VerlooptOp, d.AangemaaktOp, d.GewijzigdOp,
            d.DocumentGroepId, d.Versie,
            versionCounts.GetValueOrDefault(d.DocumentGroepId, 1)
        )).ToList();

        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<DocumentResponse>> GetById(Guid id)
    {
        var item = await _repo.FindByIdAsync(id);
        if (item is null) return NotFound();

        var aantalVersies = await _repo.CountByGroepAsync(item.DocumentGroepId);

        return Ok(new DocumentResponse(
            item.Id, item.Naam, item.Categorie.ToString(), item.BestandsNaam, item.ContentType,
            item.BestandsGrootte, item.Notities, item.VerlooptOp, item.AangemaaktOp, item.GewijzigdOp,
            item.DocumentGroepId, item.Versie, aantalVersies
        ));
    }

    [HttpGet("{id:guid}/versies")]
    public async Task<ActionResult<List<DocumentVersieResponse>>> GetVersions(Guid id)
    {
        var item = await _repo.FindByIdAsync(id);
        if (item is null) return NotFound();

        var versies = (await _repo.GetByGroepAsync(item.DocumentGroepId))
            .Select(d => new DocumentVersieResponse(d.Id, d.Versie, d.BestandsNaam, d.BestandsGrootte, d.AangemaaktOp))
            .ToList();

        return Ok(versies);
    }

    [HttpPatch("{id:guid}")]
    public async Task<ActionResult<DocumentResponse>> Update(Guid id, [FromBody] DocumentUpdateRequest request)
    {
        var item = await _repo.FindByIdAsync(id);
        if (item is null) return NotFound();

        if (request.VerlooptOp is not null)
            item.VerlooptOp = request.VerlooptOp;

        if (request.Notities is not null)
            item.Notities = request.Notities;

        await _repo.CommitAsync();
        await _audit.LogAsync("Gewijzigd", "Document", id);

        var aantalVersies = await _repo.CountByGroepAsync(item.DocumentGroepId);

        return Ok(new DocumentResponse(
            item.Id, item.Naam, item.Categorie.ToString(), item.BestandsNaam, item.ContentType,
            item.BestandsGrootte, item.Notities, item.VerlooptOp, item.AangemaaktOp, item.GewijzigdOp,
            item.DocumentGroepId, item.Versie, aantalVersies
        ));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var item = await _repo.FindByIdAsync(id);
        if (item is null) return NotFound();

        await _repo.RemoveAsync(item);
        await _repo.CommitAsync();
        await _audit.LogAsync("Verwijderd", "Document", id);
        return NoContent();
    }

    [HttpDelete("{id:guid}/alle-versies")]
    public async Task<IActionResult> DeleteAllVersions(Guid id)
    {
        var item = await _repo.FindByIdAsync(id);
        if (item is null) return NotFound();

        var allVersions = await _repo.GetByGroepAsync(item.DocumentGroepId);
        await _repo.RemoveRangeAsync(allVersions);
        await _repo.CommitAsync();
        await _audit.LogAsync("Verwijderd", "Document", id, "alle-versies");
        return NoContent();
    }
}
