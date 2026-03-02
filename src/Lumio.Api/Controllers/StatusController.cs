using Lumio.Api.Repositories;
using Lumio.Api.Rules;
using Lumio.Api.Rules.Services;
using Lumio.Api.Services;
using Lumio.Api.Services.Security;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;

namespace Lumio.Api.Controllers;

/// <summary>
/// Core status endpoints: overall health, completeness, notifications and statistics.
/// Backup/snapshot routes → StatusDataController.
/// Actualisatie routes → StatusActualisatieController.
/// SP-7-004 / GUARD-010 refactoring.
/// </summary>
[ApiController]
[Route("api/v1/status")]
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
    public async Task<IActionResult> GetStatistieken([FromServices] IStatistiekenRepository repo)
    {
        var data = await repo.GetAsync();
        var (_, nettoNalatenschap) = NalatenschapHelper.Bereken(
            data.TotaalBezittingen, data.TotaalSaldi, data.TotaalVerzekeringen,
            data.TotaalSchulden, data.TotaalVerzekeringenMetBegunstigde);

        return Ok(new
        {
            erfgenamen = data.Erfgenamen,
            noodcontacten = data.Noodcontacten,
            documenten = data.Documenten,
            digitaalBezit = new
            {
                accounts = data.Accounts,
                wachtwoorden = data.Wachtwoorden,
                wallets = data.Wallets,
                totaal = data.Accounts + data.Wachtwoorden + data.Wallets,
            },
            boedel = new
            {
                bezittingen = data.Bezittingen,
                bankrekeningen = data.Bankrekeningen,
                verzekeringen = data.Verzekeringen,
                schulden = data.Schulden,
            },
            financieel = new
            {
                totaalBezittingen = data.TotaalBezittingen,
                totaalSaldi = data.TotaalSaldi,
                totaalVerzekeringen = data.TotaalVerzekeringen,
                totaalSchulden = data.TotaalSchulden,
                nettoNalatenschap,
            },
        });
    }
}
