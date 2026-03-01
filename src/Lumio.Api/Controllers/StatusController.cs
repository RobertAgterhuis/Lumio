using Lumio.Api.Rules;
using Lumio.Api.Rules.Services;
using Lumio.Api.Services;
using Lumio.Api.Services.Security;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;

namespace Lumio.Api.Controllers;

/// <summary>
/// Core status endpoints: overall health, completeness, notifications and statistics.
/// Backup/snapshot routes → StatusDataController.
/// Actualisatie routes → StatusActualisatieController.
/// SP-7-004 / GUARD-010 refactoring.
/// </summary>
[ApiController]
[Route("api/status")]
public class StatusController : ControllerBase
{
    private readonly ICompleetheidsService _compleetheidsService;
    private readonly IMeldingService _meldingService;
    private readonly ISuggestieService _suggestieService;
    private readonly IStatusFactsBuilder _factsBuilder;
    private readonly IStringLocalizer<StatusController> L;

    public StatusController(
        ICompleetheidsService compleetheidsService,
        IMeldingService meldingService,
        ISuggestieService suggestieService,
        IStatusFactsBuilder factsBuilder,
        IStringLocalizer<StatusController> localizer)
    {
        _compleetheidsService = compleetheidsService;
        _meldingService = meldingService;
        _suggestieService = suggestieService;
        _factsBuilder = factsBuilder;
        L = localizer;
    }

    [HttpGet]
    public IActionResult GetStatus(
        [FromServices] IMasterPasswordService passwordService,
        [FromServices] IProfileService profileService)
    {
        var activeProfile = profileService.ActiveProfile;
        return Ok(new
        {
            status = "ok",
            versie = "1.0.0",
            isOntgrendeld = passwordService.IsUnlocked,
            isEersteKeer = profileService.IsFirstRun,
            profielGeselecteerd = activeProfile != null,
            actiefProfiel = activeProfile?.Naam
        });
    }

    [HttpGet("compleetheid")]
    public async Task<IActionResult> GetCompleetheid()
    {
        var facts = await _factsBuilder.BuildCompleetFactsAsync();
        var result = _compleetheidsService.BerekenSimpel(facts);
        var r = result.Resultaat;

        return Ok(new
        {
            percentage = r.Percentage,
            aantalIngevuld = r.AantalIngevuld,
            totaal = r.Totaal,
            domeinen = r.Domeinen.Select(d => new { domein = d.Domein, label = d.Label, ingevuld = d.Ingevuld > 0 })
        });
    }

    /// <summary>Granulaire voortgang per sectie met deelscores.</summary>
    [HttpGet("compleetheid/granulair")]
    public async Task<IActionResult> GetGranulairCompleetheid()
    {
        var facts = await _factsBuilder.BuildCompleetFactsAsync();
        var result = _compleetheidsService.BerekenGranulair(facts);
        var r = result.Resultaat;

        return Ok(new { percentage = r.Percentage, totaalIngevuld = r.AantalIngevuld, totaalVelden = r.Totaal, domeinen = r.Domeinen.Select(d => new { domein = d.Domein, label = d.Label, ingevuld = d.Ingevuld, totaal = d.Totaal }) });
    }

    [HttpGet("meldingen")]
    public async Task<IActionResult> GetMeldingen()
    {
        var facts = await _factsBuilder.BuildMeldingFactsAsync();
        var result = await _meldingService.EvalueerAsync(facts);

        return Ok(new { meldingen = result.Resultaat.Meldingen, aantal = result.Resultaat.Aantal });
    }

    [HttpGet("suggesties")]
    public async Task<IActionResult> Suggesties()
    {
        var facts = await _factsBuilder.BuildSuggestieFactsAsync();
        var result = await _suggestieService.EvalueerAsync(facts);

        return Ok(new { aantalSuggesties = result.Resultaat.AantalSuggesties, suggesties = result.Resultaat.Suggesties });
    }

    /// <summary>Gedetailleerde statistieken voor het dashboard.</summary>
    [HttpGet("statistieken")]
    public async Task<IActionResult> GetStatistieken([FromServices] Lumio.Api.Data.LumioDbContext db)
    {
        var erfgenamen = await db.Erfgenamen.CountAsync();
        var noodcontacten = await db.Noodcontacten.CountAsync();
        var documenten = await db.Documenten.CountAsync();
        var accounts = await db.DigitaleAccounts.CountAsync();
        var wachtwoorden = await db.Wachtwoorden.CountAsync();
        var wallets = await db.CryptoWallets.CountAsync();
        var bezittingen = await db.FysiekeBezittingen.CountAsync();
        var bankrekeningen = await db.Bankrekeningen.CountAsync();
        var verzekeringen = await db.Verzekeringen.CountAsync();
        var schulden = await db.Schulden.CountAsync();

        var totaalBezittingen = await db.FysiekeBezittingen.SumAsync(f => f.GeschatteWaarde ?? 0m);
        var totaalSaldi = await db.Bankrekeningen.SumAsync(b => b.Saldo ?? 0m);
        var totaalVerzekeringen = await db.Verzekeringen.SumAsync(v => v.VerzekerdBedrag ?? 0m);
        var totaalVerzekeringenMetBegunstigde = await db.Verzekeringen
            .Where(v => !string.IsNullOrEmpty(v.Begunstigde))
            .SumAsync(v => v.VerzekerdBedrag ?? 0m);
        var totaalSchulden = await db.Schulden.SumAsync(s => s.Bedrag);
        var (_, nettoNalatenschap) = NalatenschapHelper.Bereken(
            totaalBezittingen, totaalSaldi, totaalVerzekeringen, totaalSchulden, totaalVerzekeringenMetBegunstigde);

        return Ok(new
        {
            erfgenamen,
            noodcontacten,
            documenten,
            digitaalBezit = new { accounts, wachtwoorden, wallets, totaal = accounts + wachtwoorden + wallets },
            boedel = new { bezittingen, bankrekeningen, verzekeringen, schulden },
            financieel = new
            {
                totaalBezittingen,
                totaalSaldi,
                totaalVerzekeringen,
                totaalSchulden,
                nettoNalatenschap,
            },
        });
    }
}
