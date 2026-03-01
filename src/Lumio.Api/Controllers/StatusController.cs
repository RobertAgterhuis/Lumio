using Lumio.Api.Data;
using Lumio.Api.Rules;
using Lumio.Api.Rules.Configuration;
using Lumio.Api.Rules.Services;
using Lumio.Api.Services;
using Microsoft.Extensions.Options;
using Lumio.Api.Services.Security;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Lumio.Api.Controllers;

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
        db.AuditLog.Add(new Domain.Common.AuditLogEntry
        {
            Tijdstip = tijdstip,
            Actie = "Backup",
            EntityType = "export",
            Details = "handmatig",
        });
        await db.SaveChangesAsync();

        return Ok(new { bevestigdOp = tijdstip, status = "ok" });
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
            new { domein = "eigenaar", label = L["DomainMyProfile"].Value },
            new { domein = "testament", label = L["DomainTestament"].Value },
            new { domein = "euthanasie", label = L["DomainLivingWill"].Value },
            new { domein = "donor", label = L["DomainDonor"].Value },
            new { domein = "boedel", label = L["DomainEstate"].Value },
            new { domein = "uitvaart", label = L["DomainFuneral"].Value },
            new { domein = "erfgenamen", label = L["DomainHeirs"].Value },
            new { domein = "documenten", label = L["DomainDocuments"].Value },
            new { domein = "digitaal-bezit", label = L["DomainDigitalAssets"].Value },
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

        var bevestiging = new Domain.Common.ActualisatieBevestiging
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
            db.ActualisatieBevestigingen.Add(new Domain.Common.ActualisatieBevestiging
            {
                EigenaarId = eigenaar.Id,
                Domein = domein,
                BevestigdOp = nu,
            });
        }

        await db.SaveChangesAsync();
        return Ok(new { bevestigd = domeinen.Length, tijdstip = nu });
    }

    /// <summary>Gedetailleerde statistieken voor het dashboard.</summary>
    [HttpGet("statistieken")]
    public async Task<IActionResult> GetStatistieken([FromServices] LumioDbContext db)
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

    // ── P-C14: Automatische suggesties gekoppelde profielen ──

    [HttpGet("suggesties")]
    public async Task<IActionResult> Suggesties()
    {
        var facts = await _factsBuilder.BuildSuggestieFactsAsync();
        var result = await _suggestieService.EvalueerAsync(facts);

        return Ok(new { aantalSuggesties = result.Resultaat.AantalSuggesties, suggesties = result.Resultaat.Suggesties });
    }

    // S6-20: Mark the timeline as viewed
    [HttpPost("tijdlijn-bekeken")]
    public async Task<IActionResult> TijdlijnBekeken([FromServices] LumioDbContext db)
    {
        var eigenaar = await db.Eigenaren.FirstOrDefaultAsync();
        if (eigenaar is null) return BadRequest(new { error = "Maak eerst een eigenaar profiel aan." });

        if (!eigenaar.TijdlijnBekeken)
        {
            eigenaar.TijdlijnBekeken = true;
            await db.SaveChangesAsync();
        }
        return Ok(new { success = true });
    }

}
