using Lumio.Api.Data;
using Lumio.Api.Domain.VideoMessages;
using Lumio.Api.Dtos.VideoMessages;
using Lumio.Api.Rules.Configuration;
using Lumio.Api.Services.Video;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Lumio.Api.Controllers;

[ApiController]
[Route("api/videoboodschappen")]
public class VideoboodschappenController(
    LumioDbContext db,
    IOptions<LimietenOptions> limieten,
    VideoStorageService videoStorage) : ControllerBase
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
    /// <summary>Returns the configured limits and current usage totals.</summary>
    [HttpGet("limiet")]
    public async Task<IActionResult> GetLimiet()
    {
        var eigenaar = await db.Eigenaren.FirstOrDefaultAsync();
        long gebruiktBytes = 0;
        if (eigenaar is not null)
            gebruiktBytes = await db.Videoboodschappen
                .Where(v => v.EigenaarId == eigenaar.Id)
                .SumAsync(v => (long?)v.BestandsGrootte) ?? 0;

        return Ok(new
        {
            maxAantal = _limieten.VideoMaxAantal,
            maxDuurSeconden = _limieten.VideoMaxDuurSeconden,
            maxBytes = _limieten.VideoMaxBytes,
            gebruiktBytes,
        });
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

        // Persist video file to disk (no longer stored in SQLite)
        // Normalise content type: strip codec parameters so "video/webm;codecs=vp9,opus" → "video/webm".
        // This ensures correct file extension and clean response headers for Range streaming.
        var normContentType = bestand.ContentType.Split(';')[0].Trim();
        var newId = Guid.NewGuid();
        var extensie = VideoStorageService.ExtensieVanContentType(normContentType);
        var bestandsPad = await videoStorage.OpslaanAsync(newId, bestand.OpenReadStream(), extensie);

        var item = new Videoboodschap
        {
            Id = newId,
            EigenaarId = eigenaar.Id,
            Titel = titel.Trim(),
            Beschrijving = string.IsNullOrWhiteSpace(beschrijving) ? null : beschrijving.Trim(),
            BestandsNaam = bestand.FileName,
            ContentType = normContentType,
            BestandsGrootte = bestand.Length,
            DuurSeconden = duurSeconden,
            BestandsPad = bestandsPad,
            // Blob intentionally null — new uploads go to disk
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
        var eigenaar = await db.Eigenaren.FirstOrDefaultAsync();
        if (eigenaar is null) return NotFound();

        // Valideer eigenaarschap VOOR we data laden (voorkomt IDOR)
        var meta = await db.Videoboodschappen
            .Where(v => v.Id == id && v.EigenaarId == eigenaar.Id)
            .Select(v => new { v.ContentType, v.BestandsNaam, v.BestandsPad })
            .FirstOrDefaultAsync();

        if (meta is null) return NotFound();

        // Nieuwe uploads: stream van schijf (echte range-support, geen RAM-spike)
        if (meta.BestandsPad is not null)
        {
            var fs = videoStorage.Openen(meta.BestandsPad);
            if (fs is null) return NotFound();
            // Do NOT pass fileDownloadName — that would set Content-Disposition:attachment
            // which prevents browsers from streaming inside a <video> element.
            return File(fs, meta.ContentType, enableRangeProcessing: true);
        }

        // Legacy-fallback: blob uit SQLite
        var blob = await db.VideoboodschapBlobs
            .Where(b => b.VideoboodschapId == id)
            .Select(b => new { b.Inhoud })
            .FirstOrDefaultAsync();

        if (blob is null) return NotFound();

        return File(blob.Inhoud, meta.ContentType, enableRangeProcessing: true);
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

        // Haal bestandspad op VOOR we verwijderen, zodat we het schijfbestand kunnen opruimen
        var bestandsPad = await db.Videoboodschappen
            .Where(v => v.Id == id && v.EigenaarId == eigenaar.Id)
            .Select(v => v.BestandsPad)
            .FirstOrDefaultAsync();

        var deleted = await db.Videoboodschappen
            .Where(v => v.Id == id && v.EigenaarId == eigenaar.Id)
            .ExecuteDeleteAsync();

        if (deleted == 0) return NotFound();

        // Verwijder het schijfbestand als dit een nieuwe upload was
        if (bestandsPad is not null)
            videoStorage.Verwijderen(bestandsPad);

        return NoContent();
    }

    // ── Temp preview endpoints ──────────────────────────────────────────────
    // Workflow: record → POST /preview (get tempId) → show via GET /preview/{id}/stream
    // On accept: parent saves + DELETE /preview/{id}; on retry: DELETE /preview/{id}.

    /// <summary>Saves an in-progress recording to temp storage and returns a tempId.</summary>
    [HttpPost("preview")]
    [RequestSizeLimit(104_857_600)]
    [RequestFormLimits(MultipartBodyLengthLimit = 104_857_600)]
    public async Task<IActionResult> UploadPreview([FromForm] IFormFile bestand)
    {
        if (!bestand.ContentType.StartsWith("video/", StringComparison.OrdinalIgnoreCase))
            return BadRequest(new { error = "Alleen videobestanden zijn toegestaan." });

        var normContentType = bestand.ContentType.Split(';')[0].Trim();
        var tempId = Guid.NewGuid();
        var extensie = VideoStorageService.ExtensieVanContentType(normContentType);
        await videoStorage.OpslaanTempAsync(tempId, bestand.OpenReadStream(), extensie);

        return Ok(new { tempId, contentType = normContentType });
    }

    /// <summary>Streams a temp preview file. Supports HTTP Range for seeking.</summary>
    [HttpGet("preview/{tempId:guid}/stream")]
    public IActionResult StreamPreview(Guid tempId)
    {
        var pad = videoStorage.VindTempBestand(tempId);
        if (pad is null) return NotFound();

        var fs = videoStorage.Openen(pad);
        if (fs is null) return NotFound();

        var ext = Path.GetExtension(pad).TrimStart('.').ToLowerInvariant();
        var contentType = ext switch
        {
            "mp4" => "video/mp4",
            "ogv" => "video/ogg",
            _     => "video/webm",
        };

        return File(fs, contentType, enableRangeProcessing: true);
    }

    /// <summary>Deletes a temp preview file after accept or retry.</summary>
    [HttpDelete("preview/{tempId:guid}")]
    public IActionResult VerwijderPreview(Guid tempId)
    {
        var pad = videoStorage.VindTempBestand(tempId);
        if (pad is not null)
            videoStorage.Verwijderen(pad);
        return NoContent();
    }

    // ── GET /api/videoboodschappen/voor-erfgenaam/{erfgenaamId} ─────────────
    /// <summary>
    /// Returns all video messages addressed to a specific heir.
    /// Used in erfgenaam-modus (all Shamir-unlocked sessions).
    /// </summary>
    [HttpGet("voor-erfgenaam/{erfgenaamId:guid}")]
    public async Task<ActionResult<List<VideoboodschapResponse>>> GetVoorErfgenaam(Guid erfgenaamId)
    {
        var bestaat = await db.Erfgenamen.AnyAsync(e => e.Id == erfgenaamId);
        if (!bestaat) return NotFound();

        // Collect IDs of videos addressed to this heir
        var videoIds = await db.VideoboodschapOntvangers
            .Where(o => o.ErfgenaamId == erfgenaamId)
            .Select(o => o.VideoboodschapId)
            .ToListAsync();

        if (videoIds.Count == 0)
            return Ok(new List<VideoboodschapResponse>());

        var items = await db.Videoboodschappen
            .Include(v => v.Ontvangers)
            .Where(v => videoIds.Contains(v.Id))
            .OrderByDescending(v => v.AangemaaktOp)
            .ToListAsync();

        var namen = await LaadNamenAsync(items.SelectMany(v => v.Ontvangers.Select(o => o.ErfgenaamId)));
        return Ok(items.Select(v => ToResponse(v, namen)).ToList());
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
