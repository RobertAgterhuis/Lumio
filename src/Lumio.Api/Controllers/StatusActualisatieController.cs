using Lumio.Api.Data;
using Lumio.Api.Domain.Common;
using Lumio.Api.Rules.Configuration;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Options;

namespace Lumio.Api.Controllers;

/// <summary>
/// Periodieke actualisatie-herinneringen en tijdlijn-tracking.
/// Extracted from StatusController (SP-7-004 / GUARD-010 refactoring).
/// </summary>
[ApiController]
[Route("api/v1/status")]
public class StatusActualisatieController : ControllerBase
{
    private readonly IStringLocalizer<StatusController> L;

    public StatusActualisatieController(IStringLocalizer<StatusController> localizer)
    {
        L = localizer;
    }

    // ── P-S7: Periodieke actualisatie-herinnering ─────────────

    [HttpGet("actualisatie")]
    public async Task<IActionResult> GetActualisatie(
        [FromServices] LumioDbContext db,
        [FromServices] IOptions<LimietenOptions> limieten)
    {
        var eigenaar = await db.Eigenaren.FirstOrDefaultAsync();
        if (eigenaar is null)
            return Ok(new { domeinen = Array.Empty<object>(), herinneringNodig = false });

        var bevestigingen = await db.ActualisatieBevestigingen
            .Where(a => a.EigenaarId == eigenaar.Id)
            .ToListAsync();

        var nu = DateTime.UtcNow;
        var kwartaal = TimeSpan.FromDays(limieten.Value.ActualisatieIntervalDagen);

        var domeinChecks = new[]
        {
            new { domein = "eigenaar",      label = L["DomainMyProfile"].Value },
            new { domein = "testament",     label = L["DomainTestament"].Value },
            new { domein = "euthanasie",    label = L["DomainLivingWill"].Value },
            new { domein = "donor",         label = L["DomainDonor"].Value },
            new { domein = "boedel",        label = L["DomainEstate"].Value },
            new { domein = "uitvaart",      label = L["DomainFuneral"].Value },
            new { domein = "erfgenamen",    label = L["DomainHeirs"].Value },
            new { domein = "documenten",    label = L["DomainDocuments"].Value },
            new { domein = "digitaal-bezit",label = L["DomainDigitalAssets"].Value },
            new { domein = "noodcontacten", label = L["DomainEmergencyContacts"].Value },
        };

        var resultaat = domeinChecks.Select(d =>
        {
            var bevestiging = bevestigingen
                .Where(b => b.Domein == d.domein)
                .OrderByDescending(b => b.BevestigdOp)
                .FirstOrDefault();

            var isAfgerond = bevestiging is not null;
            var actualisatieNodig = isAfgerond && (nu - bevestiging!.BevestigdOp) > kwartaal;

            return new
            {
                d.domein,
                d.label,
                isAfgerond,
                laatsteBevestiging = bevestiging?.BevestigdOp.ToString("yyyy-MM-dd"),
                actualisatieNodig
            };
        }).ToList();

        var herinneringNodig = resultaat.Any(r => r.actualisatieNodig);
        return Ok(new { domeinen = resultaat, herinneringNodig });
    }

    [HttpPost("actualisatie/{domein}")]
    public async Task<IActionResult> BevestigActualisatie(
        string domein,
        [FromServices] LumioDbContext db)
    {
        var eigenaar = await db.Eigenaren.FirstOrDefaultAsync();
        if (eigenaar is null)
            return NotFound(new { error = "Geen profiel gevonden." });

        var bevestiging = new ActualisatieBevestiging
        {
            EigenaarId = eigenaar.Id,
            Domein = domein,
            BevestigdOp = DateTime.UtcNow,
        };

        db.ActualisatieBevestigingen.Add(bevestiging);
        await db.SaveChangesAsync();

        return Ok(new { domein, bevestigdOp = bevestiging.BevestigdOp });
    }

    // S4-01: Verwijder afgerond-markering voor een domein
    [HttpDelete("actualisatie/{domein}")]
    public async Task<IActionResult> VerwijderActualisatie(
        string domein,
        [FromServices] LumioDbContext db)
    {
        var eigenaar = await db.Eigenaren.FirstOrDefaultAsync();
        if (eigenaar is null)
            return NotFound(new { error = "Geen profiel gevonden." });

        var bevestigingen = db.ActualisatieBevestigingen
            .Where(a => a.EigenaarId == eigenaar.Id && a.Domein == domein);
        db.ActualisatieBevestigingen.RemoveRange(bevestigingen);
        await db.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("actualisatie/alles")]
    public async Task<IActionResult> BevestigAlleActualisaties([FromServices] LumioDbContext db)
    {
        var eigenaar = await db.Eigenaren.FirstOrDefaultAsync();
        if (eigenaar is null)
            return NotFound(new { error = "Geen profiel gevonden." });

        var domeinen = new[] { "eigenaar", "testament", "euthanasie", "donor", "boedel",
            "uitvaart", "erfgenamen", "documenten", "digitaal-bezit", "noodcontacten" };

        var nu = DateTime.UtcNow;
        foreach (var domein in domeinen)
        {
            db.ActualisatieBevestigingen.Add(new ActualisatieBevestiging
            {
                EigenaarId = eigenaar.Id,
                Domein = domein,
                BevestigdOp = nu,
            });
        }

        await db.SaveChangesAsync();
        return Ok(new { bevestigd = domeinen.Length, tijdstip = nu });
    }

    // S6-20: Mark the timeline as viewed
    [HttpPost("tijdlijn-bekeken")]
    public async Task<IActionResult> TijdlijnBekeken([FromServices] LumioDbContext db)
    {
        var eigenaar = await db.Eigenaren.FirstOrDefaultAsync();
        if (eigenaar is null)
            return BadRequest(new { error = "Maak eerst een eigenaar profiel aan." });

        if (!eigenaar.TijdlijnBekeken)
        {
            eigenaar.TijdlijnBekeken = true;
            await db.SaveChangesAsync();
        }
        return Ok(new { success = true });
    }
}
