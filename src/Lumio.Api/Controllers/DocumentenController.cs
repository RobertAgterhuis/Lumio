using Lumio.Api.Data;
using Lumio.Api.Domain.Documents;
using Lumio.Api.Dtos.Documents;
using Lumio.Api.Rules.Configuration;
using Lumio.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Lumio.Api.Controllers;

[ApiController]
[Route("api/documenten")]
public class DocumentenController : ControllerBase
{
    private readonly LumioDbContext _db;
    private readonly LimietenOptions _limieten;
    private readonly IAuditService _audit;

    public DocumentenController(LumioDbContext db, IOptions<LimietenOptions> limieten, IAuditService audit)
    {
        _db = db;
        _limieten = limieten.Value;
        _audit = audit;
    }

    /// <summary>
    /// Returns the latest version of each document group.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<DocumentResponse>>> GetAll()
    {
        // Get all documents grouped, then pick the latest version per group
        var all = await _db.Documenten
            .OrderBy(d => d.Categorie)
            .ThenBy(d => d.Naam)
            .ThenByDescending(d => d.Versie)
            .ToListAsync();

        var versionCounts = all
            .GroupBy(d => d.DocumentGroepId)
            .ToDictionary(g => g.Key, g => g.Count());

        var latest = all
            .GroupBy(d => d.DocumentGroepId)
            .Select(g => g.First()) // already sorted descending by Versie
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
        var item = await _db.Documenten.FindAsync(id);
        if (item is null) return NotFound();

        var aantalVersies = await _db.Documenten
            .CountAsync(d => d.DocumentGroepId == item.DocumentGroepId);

        return Ok(new DocumentResponse(
            item.Id, item.Naam, item.Categorie.ToString(), item.BestandsNaam, item.ContentType,
            item.BestandsGrootte, item.Notities, item.VerlooptOp, item.AangemaaktOp, item.GewijzigdOp,
            item.DocumentGroepId, item.Versie, aantalVersies
        ));
    }

    /// <summary>
    /// Returns all versions for a given document's group.
    /// </summary>
    [HttpGet("{id:guid}/versies")]
    public async Task<ActionResult<List<DocumentVersieResponse>>> GetVersions(Guid id)
    {
        var item = await _db.Documenten.FindAsync(id);
        if (item is null) return NotFound();

        var versies = await _db.Documenten
            .Where(d => d.DocumentGroepId == item.DocumentGroepId)
            .OrderByDescending(d => d.Versie)
            .Select(d => new DocumentVersieResponse(
                d.Id, d.Versie, d.BestandsNaam, d.BestandsGrootte, d.AangemaaktOp
            ))
            .ToListAsync();

        return Ok(versies);
    }

    /// <summary>
    /// Updates the expiry date and/or notes of a document.
    /// </summary>
    [HttpPatch("{id:guid}")]
    public async Task<ActionResult<DocumentResponse>> Update(Guid id, [FromBody] DocumentUpdateRequest request)
    {
        var item = await _db.Documenten.FindAsync(id);
        if (item is null) return NotFound();

        if (request.VerlooptOp is not null)
            item.VerlooptOp = request.VerlooptOp;

        if (request.Notities is not null)
            item.Notities = request.Notities;

        await _db.SaveChangesAsync();
        await _audit.LogAsync("Gewijzigd", "Document", id);

        var aantalVersies = await _db.Documenten
            .CountAsync(d => d.DocumentGroepId == item.DocumentGroepId);

        return Ok(new DocumentResponse(
            item.Id, item.Naam, item.Categorie.ToString(), item.BestandsNaam, item.ContentType,
            item.BestandsGrootte, item.Notities, item.VerlooptOp, item.AangemaaktOp, item.GewijzigdOp,
            item.DocumentGroepId, item.Versie, aantalVersies
        ));
    }

    /// <summary>
    /// Deletes a single version. If it's the last version in the group, the group is gone.
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var item = await _db.Documenten.FindAsync(id);
        if (item is null) return NotFound();

        _db.Documenten.Remove(item);
        await _db.SaveChangesAsync();
        await _audit.LogAsync("Verwijderd", "Document", id);
        return NoContent();
    }

    /// <summary>
    /// Deletes all versions in a document group.
    /// </summary>
    [HttpDelete("{id:guid}/alle-versies")]
    public async Task<IActionResult> DeleteAllVersions(Guid id)
    {
        var item = await _db.Documenten.FindAsync(id);
        if (item is null) return NotFound();

        var allVersions = await _db.Documenten
            .Where(d => d.DocumentGroepId == item.DocumentGroepId)
            .ToListAsync();

        _db.Documenten.RemoveRange(allVersions);
        await _db.SaveChangesAsync();
        await _audit.LogAsync("Verwijderd", "Document", id, "alle-versies");
        return NoContent();
    }
}
