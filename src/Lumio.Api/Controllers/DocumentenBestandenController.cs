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

/// <summary>
/// Handles binary file operations for documents: upload and download.
/// Extracted from DocumentenController (SP-7-004 / GUARD-010).
/// </summary>
[ApiController]
[Route("api/documenten")]
public class DocumentenBestandenController : ControllerBase
{
    private readonly LumioDbContext _db;
    private readonly LimietenOptions _limieten;
    private readonly IAuditService _audit;

    public DocumentenBestandenController(LumioDbContext db, IOptions<LimietenOptions> limieten, IAuditService audit)
    {
        _db = db;
        _limieten = limieten.Value;
        _audit = audit;
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
        var rawContent = ms.ToArray();
        var content = encryption.EncryptBytes(rawContent);

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
            Categorie = Enum.TryParse<DocumentCategorie>(categorie, ignoreCase: true, out var parsedCat)
                ? parsedCat
                : DocumentCategorie.Overig,
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
            item.Id, item.Naam, item.Categorie.ToString(), item.BestandsNaam, item.ContentType,
            item.BestandsGrootte, item.Notities, item.VerlooptOp, item.AangemaaktOp, item.GewijzigdOp,
            item.DocumentGroepId, item.Versie, aantalVersies
        ));
    }

    [HttpGet("{id:guid}/download")]
    public async Task<IActionResult> Download(
        Guid id,
        [FromServices] IEncryptionService encryption)
    {
        var item = await _db.Documenten.FindAsync(id);
        if (item is null) return NotFound();

        await _audit.LogAsync("DocumentGedownload", "Document", id, item.BestandsNaam);

        byte[] content;
        try
        {
            content = encryption.DecryptBytes(item.BestandsInhoud);
        }
        catch
        {
            // Fallback: document was stored before encryption was enabled
            content = item.BestandsInhoud;
        }

        return File(content, item.ContentType, item.BestandsNaam);
    }
}
