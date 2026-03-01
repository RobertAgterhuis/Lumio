using Lumio.Api.Data;
using Lumio.Api.Domain.Common;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Lumio.Api.Controllers;

/// <summary>
/// Backup status/confirmation and data snapshot (integrity hash) endpoints.
/// Extracted from StatusController (SP-7-004 / GUARD-010 refactoring).
/// </summary>
[ApiController]
[Route("api/status")]
public class StatusDataController : ControllerBase
{
    private readonly IStringLocalizer<StatusController> L;

    public StatusDataController(IStringLocalizer<StatusController> localizer)
    {
        L = localizer;
    }

    // ── S4-06: Backup status ────────────────────────────────────

    [HttpGet("backup")]
    public async Task<IActionResult> GetBackupStatus([FromServices] LumioDbContext db)
    {
        var latest = await db.AuditLog
            .Where(a => a.Actie == "Backup")
            .OrderByDescending(a => a.Tijdstip)
            .FirstOrDefaultAsync();

        if (latest is null)
            return Ok(new { lastBackup = (DateTime?)null, daysSince = (int?)null, status = "noBackup" });

        var daysSince = (int)(DateTime.UtcNow - latest.Tijdstip).TotalDays;
        var status = daysSince <= 30 ? "ok" : "warning";

        return Ok(new { lastBackup = latest.Tijdstip, daysSince, status });
    }

    // ── S4-07: Handmatige backup bevestiging ──────────────────

    /// <summary>
    /// Registreert dat de gebruiker handmatig een backup heeft gemaakt.
    /// Wordt ook automatisch geregistreerd bij gebruik van POST /api/export/backup/encrypted.
    /// </summary>
    [HttpPost("backup/bevestigd")]
    public async Task<IActionResult> BevestigBackup([FromServices] LumioDbContext db)
    {
        var tijdstip = DateTime.UtcNow;
        db.AuditLog.Add(new AuditLogEntry
        {
            Tijdstip = tijdstip,
            Actie = "Backup",
            EntityType = "export",
            Details = "handmatig",
        });
        await db.SaveChangesAsync();

        return Ok(new { bevestigdOp = tijdstip, status = "ok" });
    }

    /// <summary>
    /// Genereert een SHA-256 hash van de huidige database-staat als digitale handtekening.
    /// Hiermee kan later geverifieerd worden of data is gewijzigd.
    /// </summary>
    [HttpGet("snapshot")]
    public async Task<IActionResult> GetDataSnapshot([FromServices] LumioDbContext db)
    {
        var eigenaar = await db.Eigenaren.FirstOrDefaultAsync();
        if (eigenaar is null)
            return NotFound(new { error = "Geen eigenaar profiel gevonden." });

        // Bouw een deterministisch overzicht van alle data
        var snapshot = new
        {
            eigenaar = new { eigenaar.Voornaam, eigenaar.Achternaam, eigenaar.Geboortedatum, eigenaar.GewijzigdOp },
            erfgenamen = await db.Erfgenamen.OrderBy(e => e.Id).Select(e => new { e.Id, e.Voornaam, e.Achternaam, e.GewijzigdOp }).ToListAsync(),
            testament = await db.Testamenten.Select(t => new { t.Id, t.GewijzigdOp }).FirstOrDefaultAsync(),
            wilsverklaring = await db.Wilsverklaringen.Select(w => new { w.Id, w.GewijzigdOp }).FirstOrDefaultAsync(),
            donor = await db.DonorRegistraties.Select(d => new { d.Id, d.GewijzigdOp }).FirstOrDefaultAsync(),
            uitvaart = await db.UitvaartWensen.Select(u => new { u.Id, u.GewijzigdOp }).FirstOrDefaultAsync(),
            bezittingen = await db.FysiekeBezittingen.CountAsync(),
            bankrekeningen = await db.Bankrekeningen.CountAsync(),
            verzekeringen = await db.Verzekeringen.CountAsync(),
            schulden = await db.Schulden.CountAsync(),
            documenten = await db.Documenten.CountAsync(),
            digitaleAccounts = await db.DigitaleAccounts.CountAsync(),
            noodcontacten = await db.Noodcontacten.CountAsync(),
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

        return Ok(new
        {
            hash,
            algoritme = "SHA-256",
            tijdstip,
            beschrijving = L["SnapshotDescription"].Value,
        });
    }
}
