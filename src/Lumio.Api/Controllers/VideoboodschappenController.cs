using Lumio.Api.Data;
using Lumio.Api.Domain.VideoMessages;
using Lumio.Api.Dtos.VideoMessages;
using Lumio.Api.Rules.Configuration;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Lumio.Api.Controllers;

[ApiController]
[Route("api/videoboodschappen")]
public class VideoboodschappenController(LumioDbContext db, IOptions<LimietenOptions> limieten) : ControllerBase
{
    private readonly LimietenOptions _limieten = limieten.Value;

    // ── GET /api/videoboodschappen ──────────────────────────────────────────
    /// <summary>Returns all video message metadata for the current owner (no binary content).</summary>
    [HttpGet]
    public async Task<ActionResult<List<VideoboodschapResponse>>> GetAll()
    {
        var eigenaar = await db.Eigenaren.FirstOrDefaultAsync();
        if (eigenaar is null) return Ok(new List<VideoboodschapResponse>());

        var items = await db.Videoboodschappen
            .Where(v => v.EigenaarId == eigenaar.Id)
            .Select(v => new
            {
                v.Id,
                v.Titel,
                v.Beschrijving,
                v.BestandsNaam,
                v.ContentType,
                v.BestandsGrootte,
                v.DuurSeconden,
                v.AangemaaktOp,
                v.GewijzigdOp,
                Ontvangers = v.Ontvangers
                    .Select(o => new
                    {
                        o.Id,
                        o.ErfgenaamId,
                        Naam = db.Erfgenamen
                            .Where(e => e.Id == o.ErfgenaamId)
                            .Select(e => e.Tussenvoegsel != null && e.Tussenvoegsel != ""
                                ? e.Voornaam + " " + e.Tussenvoegsel + " " + e.Achternaam
                                : e.Voornaam + " " + e.Achternaam)
                            .FirstOrDefault(),
                    })
                    .ToList(),
            })
            .OrderByDescending(v => v.AangemaaktOp)
            .ToListAsync();

        var result = items.Select(v => new VideoboodschapResponse(
            v.Id, v.Titel, v.Beschrijving, v.BestandsNaam, v.ContentType,
            v.BestandsGrootte, v.DuurSeconden,
            v.Ontvangers.Select(o => new OntvangerResponse(o.Id, o.ErfgenaamId, o.Naam)).ToList(),
            v.AangemaaktOp, v.GewijzigdOp
        )).ToList();

        return Ok(result);
    }

    // ── GET /api/videoboodschappen/limiet ───────────────────────────────────
    /// <summary>Returns the configured maximum number of video messages allowed.</summary>
    [HttpGet("limiet")]
    public IActionResult GetLimiet()
    {
        return Ok(new { maxAantal = _limieten.VideoMaxAantal, maxDuurSeconden = _limieten.VideoMaxDuurSeconden });
    }

    // ── POST /api/videoboodschappen/uploaden ────────────────────────────────
    /// <summary>
    /// Accepts a multipart upload.  Fields: bestand (file), titel, beschrijving?,
    /// ontvangerIds? (JSON array of erfgenaam GUIDs), duurSeconden? (int).
    /// </summary>
    [HttpPost("uploaden")]
    [RequestSizeLimit(104_857_600)]          // 100 MB hard cap at filter level
    [RequestFormLimits(MultipartBodyLengthLimit = 104_857_600)]
    public async Task<ActionResult<VideoboodschapResponse>> Upload(
        [FromForm] IFormFile bestand,
        [FromForm] string titel,
        [FromForm] string? beschrijving,
        [FromForm] string? ontvangerIds,
        [FromForm] int? duurSeconden)
    {
        var eigenaar = await db.Eigenaren.FirstOrDefaultAsync();
        if (eigenaar is null) return BadRequest(new { error = "Maak eerst een eigenaar profiel aan." });

        // Enforce count limit
        var aantalBestaand = await db.Videoboodschappen
            .CountAsync(v => v.EigenaarId == eigenaar.Id);
        if (aantalBestaand >= _limieten.VideoMaxAantal)
            return BadRequest(new
            {
                error = $"Maximaal {_limieten.VideoMaxAantal} videoboodschappen toegestaan."
            });

        // Enforce file size limit
        if (bestand.Length > _limieten.VideoMaxBytes)
            return BadRequest(new
            {
                error = $"Bestand is te groot. Maximum is {_limieten.VideoMaxBytes / 1_048_576} MB."
            });

        // Enforce duration limit
        if (duurSeconden.HasValue && duurSeconden.Value > _limieten.VideoMaxDuurSeconden)
            return BadRequest(new
            {
                error = $"Video mag maximaal {_limieten.VideoMaxDuurSeconden} seconden duren."
            });

        // Allow only video MIME types
        if (!bestand.ContentType.StartsWith("video/", StringComparison.OrdinalIgnoreCase))
            return BadRequest(new { error = "Alleen videobestanden zijn toegestaan." });

        // Read binary content
        using var ms = new MemoryStream();
        await bestand.CopyToAsync(ms);

        // Parse recipient erfgenaam IDs
        var ontvIds = new List<Guid>();
        if (!string.IsNullOrWhiteSpace(ontvangerIds))
        {
            try
            {
                ontvIds = System.Text.Json.JsonSerializer.Deserialize<List<Guid>>(ontvangerIds) ?? [];
            }
            catch
            {
                // Ignore malformed JSON; store without recipients
            }
        }

        var item = new Videoboodschap
        {
            EigenaarId = eigenaar.Id,
            Titel = titel.Trim(),
            Beschrijving = string.IsNullOrWhiteSpace(beschrijving) ? null : beschrijving.Trim(),
            BestandsNaam = bestand.FileName,
            ContentType = bestand.ContentType,
            BestandsGrootte = bestand.Length,
            DuurSeconden = duurSeconden,
            Blob = new VideoboodschapBlob { Inhoud = ms.ToArray() },
        };

        // Validate and link recipients
        var distinctIds = ontvIds.Distinct().ToList();
        foreach (var eid in distinctIds)
        {
            var bestaat = await db.Erfgenamen
                .AnyAsync(e => e.Id == eid && e.EigenaarId == eigenaar.Id);
            if (!bestaat)
                return BadRequest(new { error = $"Erfgenaam {eid} bestaat niet of behoort niet tot dit profiel." });
        }
        foreach (var eid in distinctIds)
            item.Ontvangers.Add(new VideoboodschapOntvanger { ErfgenaamId = eid });

        db.Videoboodschappen.Add(item);
        await db.SaveChangesAsync();

        var namen = await LaadNamenAsync(item.Ontvangers.Select(o => o.ErfgenaamId));
        return Created($"/api/videoboodschappen/{item.Id}", ToResponse(item, namen));
    }

    // ── GET /api/videoboodschappen/{id}/stream ──────────────────────────────
    /// <summary>Streams the raw video bytes. Supports HTTP Range requests for seeking.</summary>
    [HttpGet("{id:guid}/stream")]
    public async Task<IActionResult> Stream(Guid id)
    {
        var blob = await db.VideoboodschapBlobs
            .Where(b => b.VideoboodschapId == id)
            .Select(b => new { b.Inhoud })
            .FirstOrDefaultAsync();

        if (blob is null) return NotFound();

        // Resolve content type from the metadata row
        var meta = await db.Videoboodschappen
            .Where(v => v.Id == id)
            .Select(v => new { v.ContentType, v.BestandsNaam })
            .FirstOrDefaultAsync();

        var contentType = meta?.ContentType ?? "video/webm";
        var bestandsNaam = meta?.BestandsNaam ?? "video.webm";

        return File(blob.Inhoud, contentType, bestandsNaam, enableRangeProcessing: true);
    }

    // ── PATCH /api/videoboodschappen/{id} ───────────────────────────────────
    /// <summary>Updates titel, beschrijving, and/or recipient list. Binary content unchanged.</summary>
    [HttpPatch("{id:guid}")]
    public async Task<ActionResult<VideoboodschapResponse>> Update(
        Guid id,
        [FromBody] VideoboodschapUpdateRequest request)
    {
        var eigenaar = await db.Eigenaren.FirstOrDefaultAsync();
        if (eigenaar is null) return NotFound();

        var item = await db.Videoboodschappen
            .Include(v => v.Ontvangers)
            .FirstOrDefaultAsync(v => v.Id == id && v.EigenaarId == eigenaar.Id);

        if (item is null) return NotFound();

        if (request.Titel is not null)
            item.Titel = request.Titel.Trim();

        if (request.Beschrijving is not null)
            item.Beschrijving = string.IsNullOrWhiteSpace(request.Beschrijving)
                ? null
                : request.Beschrijving.Trim();

        if (request.OntvangerIds is not null)
        {
            db.VideoboodschapOntvangers.RemoveRange(item.Ontvangers);
            item.Ontvangers.Clear();

            foreach (var eid in request.OntvangerIds.Distinct())
            {
                var bestaat = await db.Erfgenamen
                    .AnyAsync(e => e.Id == eid && e.EigenaarId == eigenaar.Id);
                if (bestaat)
                    item.Ontvangers.Add(new VideoboodschapOntvanger
                    {
                        ErfgenaamId = eid,
                        VideoboodschapId = id,
                    });
            }
        }

        item.GewijzigdOp = DateTime.UtcNow;
        await db.SaveChangesAsync();

        var namen = await LaadNamenAsync(item.Ontvangers.Select(o => o.ErfgenaamId));
        return Ok(ToResponse(item, namen));
    }

    // ── DELETE /api/videoboodschappen/{id} ──────────────────────────────────
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var eigenaar = await db.Eigenaren.FirstOrDefaultAsync();
        if (eigenaar is null) return NotFound();

        var deleted = await db.Videoboodschappen
            .Where(v => v.Id == id && v.EigenaarId == eigenaar.Id)
            .ExecuteDeleteAsync();

        return deleted == 0 ? NotFound() : NoContent();
    }

    // ── Helpers ────────────────────────────────────────────────────────────
    private async Task<IReadOnlyDictionary<Guid, string?>> LaadNamenAsync(IEnumerable<Guid> erfgenaamIds)
    {
        var ids = erfgenaamIds.Distinct().ToList();
        if (ids.Count == 0) return new Dictionary<Guid, string?>();
        return await db.Erfgenamen
            .Where(e => ids.Contains(e.Id))
            .ToDictionaryAsync(
                e => e.Id,
                e => (string?)(string.IsNullOrEmpty(e.Tussenvoegsel)
                    ? $"{e.Voornaam} {e.Achternaam}"
                    : $"{e.Voornaam} {e.Tussenvoegsel} {e.Achternaam}"));
    }

    private static VideoboodschapResponse ToResponse(Videoboodschap v, IReadOnlyDictionary<Guid, string?>? namen = null) => new(
        v.Id,
        v.Titel,
        v.Beschrijving,
        v.BestandsNaam,
        v.ContentType,
        v.BestandsGrootte,
        v.DuurSeconden,
        v.Ontvangers.Select(o => new OntvangerResponse(o.Id, o.ErfgenaamId, namen?.GetValueOrDefault(o.ErfgenaamId))).ToList(),
        v.AangemaaktOp,
        v.GewijzigdOp);
}
