using Lumio.Api.Domain.VideoMessages;
using Lumio.Api.Dtos.VideoMessages;
using Lumio.Api.Repositories;
using Lumio.Api.Rules.Configuration;
using Lumio.Api.Services.Video;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace Lumio.Api.Controllers;

[ApiController]
[Route("api/v1/videoboodschappen")]
public class VideoboodschappenController(
    IVideoboodschapRepository repo,
    IOptions<LimietenOptions> limieten,
    IVideoStorageService videoStorage) : ControllerBase
{
    private readonly LimietenOptions _limieten = limieten.Value;
    private readonly IVideoboodschapRepository _repo = repo;

    // ── GET /api/videoboodschappen ──────────────────────────────────────────
    /// <summary>Returns all video message metadata for the current owner (no binary content).</summary>
    [HttpGet]
    public async Task<ActionResult<List<VideoboodschapResponse>>> GetAll()
    {
        var eigenaarId = await _repo.GetEigenaarIdAsync();
        if (eigenaarId is null) return Ok(new List<VideoboodschapResponse>());

        var items = await _repo.GetAllAsync(eigenaarId.Value);
        var namen = await LaadNamenAsync(items.SelectMany(v => v.Ontvangers.Select(o => o.ErfgenaamId)));
        return Ok(items.Select(v => ToResponse(v, namen)).ToList());
    }

    // ── GET /api/videoboodschappen/limiet ───────────────────────────────────
    /// <summary>Returns the configured limits and current usage totals.</summary>
    [HttpGet("limiet")]
    public async Task<IActionResult> GetLimiet()
    {
        var eigenaarId = await _repo.GetEigenaarIdAsync();
        long gebruiktBytes = 0;
        if (eigenaarId is not null)
            gebruiktBytes = await _repo.GetTotaalBytesAsync(eigenaarId.Value);

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
        var eigenaarId = await _repo.GetEigenaarIdAsync();
        if (eigenaarId is null) return BadRequest(new { error = "Maak eerst een eigenaar profiel aan." });

        // Enforce count limit
        var aantalBestaand = await _repo.CountAsync(eigenaarId.Value);
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
            EigenaarId = eigenaarId.Value,
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
            var bestaat = await _repo.ErfgenaamBestaatAsync(eid, eigenaarId.Value);
            if (!bestaat)
                return BadRequest(new { error = $"Erfgenaam {eid} bestaat niet of behoort niet tot dit profiel." });
        }
        foreach (var eid in distinctIds)
            item.Ontvangers.Add(new VideoboodschapOntvanger { ErfgenaamId = eid });

        await _repo.AddAsync(item);
        await _repo.CommitAsync();

        var namen = await LaadNamenAsync(item.Ontvangers.Select(o => o.ErfgenaamId));
        return Created($"/api/videoboodschappen/{item.Id}", ToResponse(item, namen));
    }

    // ── GET /api/videoboodschappen/{id}/stream ──────────────────────────────
    /// <summary>Streams the raw video bytes. Supports HTTP Range requests for seeking.</summary>
    [HttpGet("{id:guid}/stream")]
    public async Task<IActionResult> Stream(Guid id)
    {
        var eigenaarId = await _repo.GetEigenaarIdAsync();
        if (eigenaarId is null) return NotFound();

        var meta = await _repo.FindStreamMetaAsync(id, eigenaarId.Value);
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
        var blob = await _repo.FindBlobAsync(id);
        if (blob is null) return NotFound();

        return File(blob, meta.ContentType, enableRangeProcessing: true);
    }

    // ── PATCH /api/videoboodschappen/{id} ───────────────────────────────────
    /// <summary>Updates titel, beschrijving, and/or recipient list. Binary content unchanged.</summary>
    [HttpPatch("{id:guid}")]
    public async Task<ActionResult<VideoboodschapResponse>> Update(
        Guid id,
        [FromBody] VideoboodschapUpdateRequest request)
    {
        var eigenaarId = await _repo.GetEigenaarIdAsync();
        if (eigenaarId is null) return NotFound();

        var item = await _repo.FindWithOntvangersByIdAsync(id, eigenaarId.Value);
        if (item is null) return NotFound();

        if (request.Titel is not null)
            item.Titel = request.Titel.Trim();

        if (request.Beschrijving is not null)
            item.Beschrijving = string.IsNullOrWhiteSpace(request.Beschrijving)
                ? null
                : request.Beschrijving.Trim();

        if (request.OntvangerIds is not null)
        {
            await _repo.RemoveOntvangersByVideoAsync(item.Id);
            item.Ontvangers.Clear();

            foreach (var eid in request.OntvangerIds.Distinct())
            {
                var bestaat = await _repo.ErfgenaamBestaatAsync(eid, eigenaarId.Value);
                if (bestaat)
                    item.Ontvangers.Add(new VideoboodschapOntvanger
                    {
                        ErfgenaamId = eid,
                        VideoboodschapId = id,
                    });
            }
        }

        item.GewijzigdOp = DateTime.UtcNow;
        await _repo.CommitAsync();

        var namen = await LaadNamenAsync(item.Ontvangers.Select(o => o.ErfgenaamId));
        return Ok(ToResponse(item, namen));
    }

    // ── DELETE /api/videoboodschappen/{id} ──────────────────────────────────
    /// <summary>
    /// T-006: Atomaire verwijdering — compensating transaction patroon.
    /// Schijfbestand wordt verwijderd VOOR de DB-commit. Als het bestand niet
    /// verwijderd kan worden, wordt de DB-transactie teruggedraaid zodat het
    /// record intact blijft (GDPR Art.17 correctheid).
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var eigenaarId = await _repo.GetEigenaarIdAsync();
        if (eigenaarId is null) return NotFound();

        // Laad entiteit inclusief ontvangers voor expliciete cascade bij InMemory-provider
        var item = await _repo.FindWithOntvangersByIdAsync(id, eigenaarId.Value);
        if (item is null) return NotFound();

        var bestandsPad = item.BestandsPad;

        // T-006: Compensating transaction (compensating-commit patroon)
        // 1. Stage DB-verwijdering + schijfbestand verwijdering
        //    → als file-verwijdering faalt, CommitAsync wordt niet aangeroepen
        //    → als DB-commit faalt, bestand is al weg (acceptabel voor een single-user app)
        await _repo.RemoveOntvangersByVideoAsync(item.Id);
        await _repo.RemoveAsync(item);

        if (bestandsPad is not null)
            videoStorage.Verwijderen(bestandsPad); // gooit bij fout → CommitAsync niet bereikt

        await _repo.CommitAsync();

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
        var eigenaarId = await _repo.GetEigenaarIdAsync();
        if (eigenaarId is null) return NotFound();

        var bestaat = await _repo.ErfgenaamBestaatAsync(erfgenaamId, eigenaarId.Value);
        if (!bestaat) return NotFound();

        // Collect IDs of videos addressed to this heir
        var videoIds = await _repo.GetVideoIdsVoorErfgenaamAsync(erfgenaamId);

        if (videoIds.Count == 0)
            return Ok(new List<VideoboodschapResponse>());

        var items = await _repo.GetByIdsAsync(videoIds);

        var namen = await LaadNamenAsync(items.SelectMany(v => v.Ontvangers.Select(o => o.ErfgenaamId)));
        return Ok(items.Select(v => ToResponse(v, namen)).ToList());
    }

    // ── Helpers ────────────────────────────────────────────────────────────
    private Task<IReadOnlyDictionary<Guid, string?>> LaadNamenAsync(IEnumerable<Guid> erfgenaamIds) =>
        _repo.LaadOntvangerNamenAsync(erfgenaamIds)
             .ContinueWith(t => (IReadOnlyDictionary<Guid, string?>)t.Result);

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
