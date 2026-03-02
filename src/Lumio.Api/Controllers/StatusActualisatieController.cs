using Lumio.Api.Domain.Common;
using Lumio.Api.Repositories;
using Lumio.Api.Rules.Configuration;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Options;

namespace Lumio.Api.Controllers;

/// <summary>
/// Periodieke actualisatie-herinneringen en tijdlijn-tracking.
/// Extracted from StatusController (SP-7-004 / GUARD-010 refactoring).
/// SP-14-003: LumioDbContext replaced by IStatusActualisatieRepository.
/// </summary>
[ApiController]
[Route("api/v1/status")]
public class StatusActualisatieController : ControllerBase
{
    private readonly IStatusActualisatieRepository _repo;
    private readonly IStringLocalizer<StatusController> L;
    private readonly LimietenOptions _limieten;

    public StatusActualisatieController(
        IStatusActualisatieRepository repo,
        IStringLocalizer<StatusController> localizer,
        IOptions<LimietenOptions> limieten)
    {
        _repo = repo;
        L = localizer;
        _limieten = limieten.Value;
    }

    [HttpGet("actualisatie")]
    public async Task<IActionResult> GetActualisatie()
    {
        var eigenaar = await _repo.FindEigenaarAsync();
        if (eigenaar is null)
            return Ok(new { domeinen = Array.Empty<object>(), herinneringNodig = false });

        var bevestigingen = await _repo.GetBevestigingenAsync(eigenaar.Id);

        var nu = DateTime.UtcNow;
        var kwartaal = TimeSpan.FromDays(_limieten.ActualisatieIntervalDagen);

        var domeinChecks = new[]
        {
            new { domein = "eigenaar",       label = L["DomainMyProfile"].Value },
            new { domein = "testament",      label = L["DomainTestament"].Value },
            new { domein = "euthanasie",     label = L["DomainLivingWill"].Value },
            new { domein = "donor",          label = L["DomainDonor"].Value },
            new { domein = "boedel",         label = L["DomainEstate"].Value },
            new { domein = "uitvaart",       label = L["DomainFuneral"].Value },
            new { domein = "erfgenamen",     label = L["DomainHeirs"].Value },
            new { domein = "documenten",     label = L["DomainDocuments"].Value },
            new { domein = "digitaal-bezit", label = L["DomainDigitalAssets"].Value },
            new { domein = "noodcontacten",  label = L["DomainEmergencyContacts"].Value },
        };

        var resultaat = domeinChecks.Select(d =>
        {
            var bevestiging = bevestigingen
                .Where(b => b.Domein == d.domein)
                .OrderByDescending(b => b.BevestigdOp)
                .FirstOrDefault();

            var isAfgerond      = bevestiging is not null;
            var actualisatieNodig = isAfgerond && (nu - bevestiging!.BevestigdOp) > kwartaal;

            return new
            {
                d.domein,
                d.label,
                isAfgerond,
                laatsteBevestiging = bevestiging?.BevestigdOp.ToString("yyyy-MM-dd"),
                actualisatieNodig,
            };
        }).ToList();

        var herinneringNodig = resultaat.Any(r => r.actualisatieNodig);
        return Ok(new { domeinen = resultaat, herinneringNodig });
    }

    [HttpPost("actualisatie/{domein}")]
    public async Task<IActionResult> BevestigActualisatie(string domein)
    {
        var eigenaar = await _repo.FindEigenaarAsync();
        if (eigenaar is null)
            return NotFound(new { error = "Geen profiel gevonden." });

        var bevestiging = new ActualisatieBevestiging
        {
            EigenaarId  = eigenaar.Id,
            Domein      = domein,
            BevestigdOp = DateTime.UtcNow,
        };

        await _repo.AddAsync(bevestiging);
        await _repo.CommitAsync();

        return Ok(new { domein, bevestigdOp = bevestiging.BevestigdOp });
    }

    [HttpDelete("actualisatie/{domein}")]
    public async Task<IActionResult> VerwijderActualisatie(string domein)
    {
        var eigenaar = await _repo.FindEigenaarAsync();
        if (eigenaar is null)
            return NotFound(new { error = "Geen profiel gevonden." });

        await _repo.RemoveByDomeinAsync(eigenaar.Id, domein);
        await _repo.CommitAsync();
        return NoContent();
    }

    [HttpPost("actualisatie/alles")]
    public async Task<IActionResult> BevestigAlleActualisaties()
    {
        var eigenaar = await _repo.FindEigenaarAsync();
        if (eigenaar is null)
            return NotFound(new { error = "Geen profiel gevonden." });

        var domeinen = new[] { "eigenaar", "testament", "euthanasie", "donor", "boedel",
                               "uitvaart", "erfgenamen", "documenten", "digitaal-bezit", "noodcontacten" };
        var nu = DateTime.UtcNow;
        foreach (var domein in domeinen)
            await _repo.AddAsync(new ActualisatieBevestiging { EigenaarId = eigenaar.Id, Domein = domein, BevestigdOp = nu });

        await _repo.CommitAsync();
        return Ok(new { bevestigd = domeinen.Length, tijdstip = nu });
    }

    [HttpPost("tijdlijn-bekeken")]
    public async Task<IActionResult> TijdlijnBekeken()
    {
        var eigenaar = await _repo.FindEigenaarAsync();
        if (eigenaar is null)
            return BadRequest(new { error = "Maak eerst een eigenaar profiel aan." });

        if (!eigenaar.TijdlijnBekeken)
        {
            eigenaar.TijdlijnBekeken = true;
            await _repo.CommitAsync();
        }
        return Ok(new { success = true });
    }
}
