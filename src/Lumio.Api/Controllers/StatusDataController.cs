using Lumio.Api.Repositories;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Lumio.Api.Controllers;

/// <summary>
/// Backup status/confirmation and data snapshot (integrity hash) endpoints.
/// Extracted from StatusController (SP-7-004 / GUARD-010 refactoring).
/// SP-14-003: LumioDbContext replaced by IStatusDataRepository.
/// </summary>
[ApiController]
[Route("api/v1/status")]
public class StatusDataController : ControllerBase
{
    private readonly IStatusDataRepository _repo;
    private readonly IStringLocalizer<StatusController> L;

    public StatusDataController(IStatusDataRepository repo, IStringLocalizer<StatusController> localizer)
    {
        _repo = repo;
        L = localizer;
    }

    // ── S4-06: Backup status ────────────────────────────────────

    [HttpGet("backup")]
    public async Task<IActionResult> GetBackupStatus()
    {
        var latest = await _repo.FindLatestBackupAsync();

        if (latest is null)
            return Ok(new { lastBackup = (DateTime?)null, daysSince = (int?)null, status = "noBackup" });

        var daysSince = (int)(DateTime.UtcNow - latest.Tijdstip).TotalDays;
        var status = daysSince <= 30 ? "ok" : "warning";

        return Ok(new { lastBackup = latest.Tijdstip, daysSince, status });
    }

    // ── S4-07: Handmatige backup bevestiging ──────────────────

    [HttpPost("backup/bevestigd")]
    public async Task<IActionResult> BevestigBackup()
    {
        var tijdstip = DateTime.UtcNow;
        await _repo.BevestigBackupAsync(tijdstip);
        return Ok(new { bevestigdOp = tijdstip, status = "ok" });
    }

    /// <summary>
    /// Genereert een SHA-256 hash van de huidige database-staat als digitale handtekening.
    /// </summary>
    [HttpGet("snapshot")]
    public async Task<IActionResult> GetDataSnapshot()
    {
        var data = await _repo.GetSnapshotDataAsync();

        if (data.Eigenaar is null)
            return NotFound(new { error = "Geen eigenaar profiel gevonden." });

        var eigenaar = data.Eigenaar;

        var snapshot = new
        {
            eigenaar     = new { eigenaar.Voornaam, eigenaar.Achternaam, eigenaar.Geboortedatum, eigenaar.GewijzigdOp },
            erfgenamen   = data.Erfgenamen,
            testament    = data.Testament,
            wilsverklaring = data.Wilsverklaring,
            donor        = data.Donor,
            uitvaart     = data.Uitvaart,
            bezittingen  = data.Bezittingen,
            bankrekeningen = data.Bankrekeningen,
            verzekeringen = data.Verzekeringen,
            schulden     = data.Schulden,
            documenten   = data.Documenten,
            digitaleAccounts = data.DigitaleAccounts,
            noodcontacten = data.Noodcontacten,
        };

        var options = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
            WriteIndented = false,
        };
        var json = JsonSerializer.Serialize(snapshot, options);
        var hashBytes = SHA256.HashData(Encoding.UTF8.GetBytes(json));
        var hash = Convert.ToHexStringLower(hashBytes);
        var tijdstip = DateTime.UtcNow;

        return Ok(new { hash, algoritme = "SHA-256", tijdstip, beschrijving = L["SnapshotDescription"].Value });
    }
}
