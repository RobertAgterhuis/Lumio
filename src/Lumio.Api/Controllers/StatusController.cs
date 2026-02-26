using Lumio.Api.Data;
using Lumio.Api.Domain.Common;
using Lumio.Api.Rules;
using Lumio.Api.Rules.Configuration;
using Lumio.Api.Rules.Facts;
using Lumio.Api.Rules.Services;
using Lumio.Api.Services.Security;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Options;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Lumio.Api.Controllers;

[ApiController]
[Route("api/status")]
public class StatusController : ControllerBase
{
    private readonly LimietenOptions _limieten;
    private readonly ICompleetheidsService _compleetheidsService;
    private readonly IMeldingService _meldingService;
    private readonly ISuggestieService _suggestieService;
    private readonly ILegitimairePortieService _legitiemairePortieService;
    private readonly ErfbelastingOptions _erfbelasting;
    private readonly IStringLocalizer<StatusController> L;

    public StatusController(
        IOptions<LimietenOptions> limieten,
        ICompleetheidsService compleetheidsService,
        IMeldingService meldingService,
        ISuggestieService suggestieService,
        ILegitimairePortieService legitiemairePortieService,
        IOptions<ErfbelastingOptions> erfbelasting,
        IStringLocalizer<StatusController> localizer)
    {
        _limieten = limieten.Value;
        _compleetheidsService = compleetheidsService;
        _meldingService = meldingService;
        _suggestieService = suggestieService;
        _legitiemairePortieService = legitiemairePortieService;
        _erfbelasting = erfbelasting.Value;
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
    public async Task<IActionResult> GetCompleetheid([FromServices] LumioDbContext db)
    {
        var facts = await BuildCompleetFacts(db);
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
    public async Task<IActionResult> GetGranulairCompleetheid([FromServices] LumioDbContext db)
    {
        var facts = await BuildCompleetFacts(db);
        var result = _compleetheidsService.BerekenGranulair(facts);
        var r = result.Resultaat;

        return Ok(new { percentage = r.Percentage, totaalIngevuld = r.AantalIngevuld, totaalVelden = r.Totaal, domeinen = r.Domeinen.Select(d => new { domein = d.Domein, label = d.Label, ingevuld = d.Ingevuld, totaal = d.Totaal }) });
    }

    [HttpGet("meldingen")]
    public async Task<IActionResult> GetMeldingen([FromServices] LumioDbContext db)
    {
        var facts = await BuildMeldingFacts(db);
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

    // ── P-S7: Periodieke actualisatie-herinnering ─────────────

    [HttpGet("actualisatie")]
    public async Task<IActionResult> GetActualisatie([FromServices] LumioDbContext db)
    {
        var eigenaar = await db.Eigenaren.FirstOrDefaultAsync();
        if (eigenaar is null)
            return Ok(new { domeinen = Array.Empty<object>(), herinneringNodig = false });

        var bevestigingen = await db.ActualisatieBevestigingen
            .Where(a => a.EigenaarId == eigenaar.Id)
            .ToListAsync();

        var nu = DateTime.UtcNow;
        var kwartaal = TimeSpan.FromDays(_limieten.ActualisatieIntervalDagen);

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
    public async Task<IActionResult> Suggesties([FromServices] LumioDbContext db)
    {
        var facts = await BuildSuggestieFacts(db);
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

    // ── Private facts-builders ──────────────────────────────

    private static async Task<CompleetFacts> BuildCompleetFacts(LumioDbContext db)
    {
        var eigenaar = await db.Eigenaren.FirstOrDefaultAsync();
        var testament = await db.Testamenten.Include(t => t.Begunstigden).Include(t => t.Executeurs).FirstOrDefaultAsync();
        var euth = await db.Wilsverklaringen.FirstOrDefaultAsync();
        var donor = await db.DonorRegistraties.FirstOrDefaultAsync();
        var uitvaart = await db.UitvaartWensen.FirstOrDefaultAsync();

        return new CompleetFacts(
            eigenaar is not null ? new EigenaarCompleetInfo(
                !string.IsNullOrEmpty(eigenaar.Voornaam),
                !string.IsNullOrEmpty(eigenaar.Achternaam),
                eigenaar.Geboortedatum != default,
                !string.IsNullOrEmpty(eigenaar.Telefoon),
                !string.IsNullOrEmpty(eigenaar.Email),
                !string.IsNullOrEmpty(eigenaar.Adres),
                !string.IsNullOrEmpty(eigenaar.BSN),
                !string.IsNullOrEmpty(eigenaar.Notaris)) : null,
            testament is not null ? new TestamentCompleetInfo(
                !string.IsNullOrEmpty(testament.TestamentType),
                !string.IsNullOrEmpty(testament.NotarisNaam),
                testament.DatumTestament.HasValue,
                !string.IsNullOrEmpty(testament.AlgemeneWensen),
                testament.Begunstigden.Count,
                testament.Executeurs.Count) : null,
            euth is not null ? new EuthanasieCompleetInfo(
                euth.DatumOndertekening.HasValue,
                !string.IsNullOrEmpty(euth.Huisarts),
                !string.IsNullOrEmpty(euth.VertegenwoordigerNaam),
                // S8-15: granulaire euthanasie-volledigheid
                WilEuthanasieIngevuld: true,  // record bestaat → keuze is gemaakt
                DementieClausuleIngevuld: !euth.WilEuthanasie || euth.DementieClausule) : null,
            donor is not null ? new DonorCompleetInfo(
                !string.IsNullOrEmpty(donor.Keuze),
                donor.Keuze != "Specifiek persoon beslist" || !string.IsNullOrEmpty(donor.BeslisserNaam),
                await db.OrgaanKeuzes.AnyAsync(o => o.DonorRegistratieId == donor.Id)) : null,
            await db.DigitaleAccounts.CountAsync() + await db.Wachtwoorden.CountAsync() + await db.CryptoWallets.CountAsync(),
            new[] { await db.FysiekeBezittingen.AnyAsync(), await db.Bankrekeningen.AnyAsync(), await db.Verzekeringen.AnyAsync(), await db.Schulden.AnyAsync() },
            uitvaart is not null ? new UitvaartCompleetInfo(
                !string.IsNullOrEmpty(uitvaart.VoorkeurType),
                !string.IsNullOrEmpty(uitvaart.UitvaartOndernemer),
                !string.IsNullOrEmpty(uitvaart.CeremonieSoort),
                !string.IsNullOrEmpty(uitvaart.RouwkaartTekst),
                !string.IsNullOrEmpty(uitvaart.VoorkeurBegraafplaatsNaam) || !string.IsNullOrEmpty(uitvaart.VoorkeurCrematoriumnaam) || !string.IsNullOrEmpty(uitvaart.VoorkeurAulaNaam),
                !string.IsNullOrEmpty(uitvaart.CeremonieSoort),
                !string.IsNullOrEmpty(uitvaart.Muziekwensen)) : null,
            await db.Documenten.CountAsync(),
            await db.Erfgenamen.CountAsync(),
            await db.Noodcontacten.CountAsync());
    }

    private async Task<MeldingFacts> BuildMeldingFacts(LumioDbContext db)
    {
        var eigenaar = await db.Eigenaren.FirstOrDefaultAsync();
        var testament = await db.Testamenten.FirstOrDefaultAsync();
        var wils = await db.Wilsverklaringen.FirstOrDefaultAsync();
        var donor = await db.DonorRegistraties.FirstOrDefaultAsync();
        var uitvaart = await db.UitvaartWensen.FirstOrDefaultAsync();

        var vandaag = DateOnly.FromDateTime(DateTime.Today);
        var over30Dagen = vandaag.AddDays(_limieten.DocumentVerlooptWaarschuwingDagen);

        var laatsteBackup = await db.AuditLog
            .Where(a => a.Actie == "Backup")
            .OrderByDescending(a => a.Tijdstip)
            .FirstOrDefaultAsync();

        DateTime? laatsteActualisatie = null;
        var verlopenActualisatieDomeinen = new List<string>();
        if (eigenaar is not null)
        {
            // S4-04: per-domein actualisatiedatum — gebruik de "zwakste schakel" (oudste meest-recente bevestiging)
            var alleBevestigingen = await db.ActualisatieBevestigingen
                .Where(a => a.EigenaarId == eigenaar.Id)
                .ToListAsync();

            var domeinenLijst = new[] { "eigenaar", "testament", "euthanasie", "donor", "boedel",
                "uitvaart", "erfgenamen", "documenten", "digitaal-bezit", "noodcontacten" };

            var perDomeinLatest = domeinenLijst
                .Select(d => alleBevestigingen
                    .Where(b => b.Domein == d)
                    .OrderByDescending(b => b.BevestigdOp)
                    .FirstOrDefault()?.BevestigdOp)
                .ToList();

            // Null als enig domein nooit bevestigd; anders de oudste (minste) datum
            if (perDomeinLatest.All(d => d is not null))
                laatsteActualisatie = perDomeinLatest.Min();

            // S8-12: per-domein actualisatie verlopen check (eigen interval per domein)
            verlopenActualisatieDomeinen = domeinenLijst
                .Select((d, i) => new { Domein = d, Latest = perDomeinLatest[i] })
                .Where(x => x.Latest.HasValue &&
                            x.Latest.Value < DateTime.UtcNow.AddDays(-_limieten.ActualisatieIntervallen.VoorDomein(x.Domein)))
                .Select(x => x.Domein)
                .ToList();
        }

        // Legitimatie
        var heeftLegitimatie = eigenaar is not null && eigenaar.LegitimatieSoort != LegitimatieSoort.Geen;
        var legiGeldigTot = eigenaar?.LegitimatieGeldigTot;
        var legiIsVerlopen = heeftLegitimatie && legiGeldigTot.HasValue && legiGeldigTot.Value < vandaag;
        var legiIsBijnaVerlopen = heeftLegitimatie && legiGeldigTot.HasValue
            && legiGeldigTot.Value >= vandaag && legiGeldigTot.Value <= vandaag.AddDays(30);

        // Wilsverklaring verouderd (> 5 jaar)
        var wilsVerouderd = wils?.DatumOndertekening.HasValue == true
            && wils!.DatumOndertekening!.Value.AddYears(5) < vandaag;

        // Uitvaart verouderd (> 2 jaar)
        var uitvaartIsVerouderd = uitvaart?.DatumOpgesteld.HasValue == true
            && uitvaart!.DatumOpgesteld!.Value.AddYears(2) < vandaag;

        // Testament begunstigden count
        var aantalBegunstigden = testament != null
            ? await db.Begunstigden.CountAsync(b => b.TestamentInfoId == testament.Id)
            : 0;

        // Shamir: oudste share-datum
        DateTime? shamirOudste = null;
        if (await db.Erfgenamen.AnyAsync(e => e.HeeftShareOntvangen && e.ShareUitgegevenOp != null))
        {
            shamirOudste = await db.Erfgenamen
                .Where(e => e.HeeftShareOntvangen && e.ShareUitgegevenOp != null)
                .MinAsync(e => e.ShareUitgegevenOp);
        }

        // S6-17: Legitimaire portie schending
        bool heeftLegitimairePortieSchending = false;
        if (eigenaar is not null && testament is not null)
        {
            var erfgenamen = await db.Erfgenamen.Where(e => e.EigenaarId == eigenaar.Id).ToListAsync();
            string[] kindRelaties = _erfbelasting.KindRelatiesLegitimairePortie;
            var kinderen = erfgenamen
                .Where(e => kindRelaties.Any(r => e.Relatie.Contains(r, StringComparison.OrdinalIgnoreCase)))
                .ToList();
            if (kinderen.Count > 0)
            {
                var begunstigden = await db.Begunstigden
                    .Where(b => b.TestamentInfoId == testament.Id).ToListAsync();
                var lpFacts = new LegitimairePortieFacts(
                    true, true,
                    eigenaar.BurgerlijkeStaat switch
                    {
                        BurgerlijkeStaat.Gehuwd => BurgerlijkeStaatFact.Gehuwd,
                        BurgerlijkeStaat.GeregistreerdPartnerschap => BurgerlijkeStaatFact.GeregistreerdPartnerschap,
                        _ => BurgerlijkeStaatFact.Alleenstaand
                    },
                    kinderen.Select(k => new KindErfgenaamFact(
                        k.Id,
                        string.IsNullOrEmpty(k.Tussenvoegsel) ? $"{k.Voornaam} {k.Achternaam}" : $"{k.Voornaam} {k.Tussenvoegsel} {k.Achternaam}",
                        k.Voornaam, k.Achternaam)).ToList(),
                    begunstigden.Select(b => new BegunstigdeFact(b.Naam, b.Percentage)).ToList());
                var lpResult = _legitiemairePortieService.Bereken(lpFacts);
                heeftLegitimairePortieSchending = lpResult.Resultaat.HeeftWaarschuwing;
            }
        }

        // S6-20: Tijdlijn bekeken
        bool heeftTijdlijnGezien = eigenaar?.TijdlijnBekeken ?? false;

        // S8-01: bezit zonder geschatte waarde (null of €0)
        var heeftBezitMissendeWaarde = eigenaar is not null
            && await db.FysiekeBezittingen.AnyAsync(b => b.EigenaarId == eigenaar.Id
                && (b.GeschatteWaarde == null || b.GeschatteWaarde == 0));

        // S8-02: netto nalatenschap negatief (schulden overtreffen bezit)
        var totaalFysiekBezit = await db.FysiekeBezittingen.SumAsync(b => b.GeschatteWaarde ?? 0m);
        var totaalSaldiBoedel = await db.Bankrekeningen.SumAsync(b => b.Saldo ?? 0m);
        var totaalSchuldenBoedel = await db.Schulden.SumAsync(s => s.Bedrag);
        var nettoNalatenschapNegatief = eigenaar is not null
            && totaalSchuldenBoedel > (totaalFysiekBezit + totaalSaldiBoedel);

        // S8-03: fysiek bezit zonder bestemde erfgenaam
        var heeftBezitZonderErfgenaam = eigenaar is not null
            && await db.FysiekeBezittingen.AnyAsync(b => b.EigenaarId == eigenaar.Id
                && b.BestemdeErfgenaamId == null);

        // S8-04: erfgenaam zonder e-mail én telefoon
        var heeftErfgenaamZonderContactgegevens = eigenaar is not null
            && await db.Erfgenamen.AnyAsync(e => e.EigenaarId == eigenaar.Id
                && string.IsNullOrEmpty(e.Telefoon) && string.IsNullOrEmpty(e.Email));

        // S8-08: heeft minimaal één noodcontact met rol 'Vertrouwenspersoon'
        var heeftVertrouwenspersoon = eigenaar is not null
            && await db.Noodcontacten.AnyAsync(n => n.EigenaarId == eigenaar.Id
                && n.Rol == "Vertrouwenspersoon");

        // S8-09: heeft minimaal één noodcontact met een telefoonnummer
        var heeftNoodcontactMetTelefoon = eigenaar is not null
            && await db.Noodcontacten.AnyAsync(n => n.EigenaarId == eigenaar.Id
                && !string.IsNullOrEmpty(n.Telefoon));

        return new MeldingFacts(
            eigenaar is not null,
            await db.Testamenten.AnyAsync(),
            await db.Wilsverklaringen.AnyAsync(),
            await db.DonorRegistraties.AnyAsync(),
            await db.UitvaartWensen.AnyAsync(),
            await db.Erfgenamen.AnyAsync(),
            await db.Noodcontacten.AnyAsync(),
            await db.Documenten.AnyAsync(),
            laatsteBackup?.Tijdstip,
            await db.Erfgenamen.CountAsync(),
            await db.Erfgenamen.AnyAsync(e => e.HeeftShareOntvangen),
            await db.Documenten
                .Where(d => d.VerlooptOp != null && d.VerlooptOp <= vandaag)
                .Select(d => d.Naam).Distinct().ToListAsync(),
            await db.Documenten
                .Where(d => d.VerlooptOp != null && d.VerlooptOp > vandaag && d.VerlooptOp <= over30Dagen)
                .Select(d => d.Naam).Distinct().ToListAsync(),
            laatsteActualisatie,
            // S5: Testament
            aantalBegunstigden,
            testament != null && await db.TestamentSnapshots.AnyAsync(s => s.TestamentInfoId == testament.Id),
            testament?.AangemaaktOp,
            // S5: Wilsverklaring
            wilsVerouderd,
            !string.IsNullOrEmpty(wils?.VertegenwoordigerNaam),
            wils?.WilEuthanasie ?? false,
            !string.IsNullOrEmpty(wils?.BehandelVerbod),
            // S5: Donor
            donor?.Keuze,
            await db.OrgaanKeuzes.AnyAsync(),
            donor?.BeslisserNaam,
            // S5: Boedel / Digitaal bezit
            await db.FysiekeBezittingen.AnyAsync() || await db.Bankrekeningen.AnyAsync()
                || await db.Verzekeringen.AnyAsync() || await db.Schulden.AnyAsync(),
            await db.DigitaleAccounts.AnyAsync() || await db.Wachtwoorden.AnyAsync()
                || await db.CryptoWallets.AnyAsync(),
            // S5: Legitimatie
            heeftLegitimatie,
            legiIsVerlopen,
            legiIsBijnaVerlopen,
            heeftLegitimatie && !legiGeldigTot.HasValue,
            // S5: Uitvaart
            uitvaart?.VoorkeurType,
            uitvaart?.Begraafplaats,
            uitvaartIsVerouderd,
            uitvaart?.HeeftUitvaartVerzekering ?? false,
            !string.IsNullOrEmpty(uitvaart?.UitvaartVerzekeringDetails),
            !string.IsNullOrEmpty(uitvaart?.CeremonieSoort),
            // S5: Shamir
            shamirOudste,
            // S6: Legitimaire portie schending
            heeftLegitimairePortieSchending,
            // S6: Tijdlijn bekeken
            heeftTijdlijnGezien,
            // S8-01..09: Workflow-regels
            heeftBezitMissendeWaarde,
            nettoNalatenschapNegatief,
            heeftBezitZonderErfgenaam,
            heeftErfgenaamZonderContactgegevens,
            heeftVertrouwenspersoon,
            heeftNoodcontactMetTelefoon,
            // S8-12: Verlopen actualisatie per domein (per-domein interval)
            verlopenActualisatieDomeinen);
    }

    private static async Task<SuggestieFacts> BuildSuggestieFacts(LumioDbContext db)
    {
        var eigenaar = await db.Eigenaren.FirstOrDefaultAsync();
        if (eigenaar is null)
            return new SuggestieFacts(false, null, [], [], null, null, 0, false, false, false, false);

        var erfgenamen = await db.Erfgenamen.Where(e => e.EigenaarId == eigenaar.Id).ToListAsync();
        var noodcontacten = await db.Noodcontacten.Where(n => n.EigenaarId == eigenaar.Id).ToListAsync();
        var testament = await db.Testamenten.FirstOrDefaultAsync(t => t.EigenaarId == eigenaar.Id);
        var uitvaart = await db.UitvaartWensen.FirstOrDefaultAsync();

        SuggestieTestamentFact? testamentFact = null;
        if (testament is not null)
        {
            var begunstigden = await db.Begunstigden.Where(b => b.TestamentInfoId == testament.Id).ToListAsync();
            var executeurs = await db.Executeurs.Where(e => e.TestamentInfoId == testament.Id).ToListAsync();
            testamentFact = new SuggestieTestamentFact(
                testament.NotarisNaam,
                begunstigden.Select(b => b.Naam).ToList(),
                executeurs.Select(e => e.Naam).ToList());
        }

        string FullName(Erfgenaam e) =>
            string.IsNullOrWhiteSpace(e.Tussenvoegsel)
                ? $"{e.Voornaam} {e.Achternaam}"
                : $"{e.Voornaam} {e.Tussenvoegsel} {e.Achternaam}";

        // S5: Boedel suggesties
        var aantalVerzekeringenZonderBegunstigde = await db.Verzekeringen
            .CountAsync(v => v.EigenaarId == eigenaar.Id && string.IsNullOrEmpty(v.Begunstigde));
        var heeftHypotheekZonderBezit = await db.Schulden
            .AnyAsync(s => s.EigenaarId == eigenaar.Id
                && s.Type.ToLower().Contains("hypotheek")
                && s.BezitId == null);

        // S5: Digitaal bezit suggesties
        var heeftAccountOverdragenZonderNaam = await db.DigitaleAccounts
            .AnyAsync(a => a.EigenaarId == eigenaar.Id
                && a.GewensteActie.ToLower().Contains("overdragen")
                && string.IsNullOrEmpty(a.OverdrachtAan));
        var heeftCryptoZonderSeedPhrase = await db.CryptoWallets
            .AnyAsync(c => c.EigenaarId == eigenaar.Id && c.EncryptedSeedPhrase == null);
        var heeftAccountZonderActie = await db.DigitaleAccounts
            .AnyAsync(a => a.EigenaarId == eigenaar.Id && string.IsNullOrEmpty(a.GewensteActie));

        return new SuggestieFacts(
            true,
            eigenaar.Notaris,
            erfgenamen.Select(e => new SuggestieErfgenaamFact(FullName(e), e.Telefoon, e.Relatie)).ToList(),
            noodcontacten.Select(n => new SuggestieNoodcontactFact(n.Naam, n.Telefoon, n.Rol)).ToList(),
            testamentFact,
            uitvaart?.UitvaartOndernemer,
            aantalVerzekeringenZonderBegunstigde,
            heeftHypotheekZonderBezit,
            heeftAccountOverdragenZonderNaam,
            heeftCryptoZonderSeedPhrase,
            heeftAccountZonderActie);
    }
}
