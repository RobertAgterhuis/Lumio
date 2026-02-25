using Lumio.Api.Data;
using Lumio.Api.Domain.Documents;
using Lumio.Api.Dtos.Documents;
using Lumio.Api.Rules.Configuration;
using Lumio.Api.Services;
using Lumio.Api.Services.Security;
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
            d.Id, d.Naam, d.Categorie, d.BestandsNaam, d.ContentType,
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
            item.Id, item.Naam, item.Categorie, item.BestandsNaam, item.ContentType,
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

    [HttpPost("uploaden")]
    [RequestSizeLimit(52_428_800)] // 50 MB (compile-time upper bound)
    public async Task<ActionResult<DocumentResponse>> Upload(
        [FromForm] DocumentUploadRequest request,
        [FromServices] IEncryptionService encryption)
    {
        var bestand = request.Bestand;
        var naam = request.Naam;
        var categorie = request.Categorie;
        var notities = request.Notities;
        var verlooptOp = request.VerlooptOp;

        if (bestand is null)
            return BadRequest(new { error = "Geen bestand opgegeven." });

        var eigenaar = await _db.Eigenaren.FirstOrDefaultAsync();
        if (eigenaar is null) return BadRequest(new { error = "Maak eerst een eigenaar profiel aan." });

        if (bestand.Length > _limieten.DocumentMaxBytes)
            return BadRequest(new { error = $"Bestand is te groot. Maximum is {_limieten.DocumentMaxBytes / 1_048_576} MB." });

        using var ms = new MemoryStream();
        await bestand.CopyToAsync(ms);
        var content = ms.ToArray();

        // Check if a document with the same name already exists → create new version
        var existing = await _db.Documenten
            .Where(d => d.Naam == naam && d.EigenaarId == eigenaar.Id)
            .OrderByDescending(d => d.Versie)
            .FirstOrDefaultAsync();

        var documentGroepId = existing?.DocumentGroepId ?? Guid.NewGuid();
        var versie = (existing?.Versie ?? 0) + 1;

        var item = new PersoonlijkDocument
        {
            EigenaarId = eigenaar.Id,
            Naam = naam,
            Categorie = categorie,
            BestandsNaam = bestand.FileName,
            ContentType = bestand.ContentType,
            BestandsGrootte = bestand.Length,
            BestandsInhoud = content,
            Notities = notities,
            VerlooptOp = DateOnly.TryParse(verlooptOp, out var vd) ? vd : null,
            DocumentGroepId = documentGroepId,
            Versie = versie
        };

        _db.Documenten.Add(item);
        await _db.SaveChangesAsync();
        await _audit.LogAsync("Aangemaakt", "Document", item.Id, naam);

        var aantalVersies = await _db.Documenten
            .CountAsync(d => d.DocumentGroepId == documentGroepId);

        return Created($"/api/documenten/{item.Id}", new DocumentResponse(
            item.Id, item.Naam, item.Categorie, item.BestandsNaam, item.ContentType,
            item.BestandsGrootte, item.Notities, item.VerlooptOp, item.AangemaaktOp, item.GewijzigdOp,
            item.DocumentGroepId, item.Versie, aantalVersies
        ));
    }

    [HttpGet("{id:guid}/download")]
    public async Task<IActionResult> Download(Guid id)
    {
        var item = await _db.Documenten.FindAsync(id);
        if (item is null) return NotFound();

        return File(item.BestandsInhoud, item.ContentType, item.BestandsNaam);
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
            item.Id, item.Naam, item.Categorie, item.BestandsNaam, item.ContentType,
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
