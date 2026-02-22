using Lumio.Api.Data;
using Lumio.Api.Services.Security;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lumio.Api.Controllers;

[ApiController]
[Route("api/status")]
public class StatusController : ControllerBase
{
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
        var eigenaar = await db.Eigenaren.AnyAsync();
        var testament = await db.Testamenten.AnyAsync();
        var euthanasie = await db.Wilsverklaringen.AnyAsync();
        var donor = await db.DonorRegistraties.AnyAsync();
        var digitaalBezit = await db.DigitaleAccounts.AnyAsync() || await db.Wachtwoorden.AnyAsync() || await db.CryptoWallets.AnyAsync();
        var boedel = await db.FysiekeBezittingen.AnyAsync() || await db.Bankrekeningen.AnyAsync() || await db.Verzekeringen.AnyAsync();
        var uitvaart = await db.UitvaartWensen.AnyAsync();
        var documenten = await db.Documenten.AnyAsync();
        var erfgenamen = await db.Erfgenamen.AnyAsync();
        var noodcontacten = await db.Noodcontacten.AnyAsync();

        var domeinen = new[]
        {
            new { domein = "eigenaar", label = "Mijn Profiel", ingevuld = eigenaar },
            new { domein = "testament", label = "Testament", ingevuld = testament },
            new { domein = "euthanasie", label = "Wilsverklaring", ingevuld = euthanasie },
            new { domein = "donor", label = "Donorregistratie", ingevuld = donor },
            new { domein = "digitaal-bezit", label = "Digitaal Bezit", ingevuld = digitaalBezit },
            new { domein = "boedel", label = "Boedel", ingevuld = boedel },
            new { domein = "uitvaart", label = "Uitvaartwensen", ingevuld = uitvaart },
            new { domein = "documenten", label = "Documenten", ingevuld = documenten },
            new { domein = "erfgenamen", label = "Erfgenamen", ingevuld = erfgenamen },
            new { domein = "noodcontacten", label = "Noodcontacten", ingevuld = noodcontacten },
        };

        var aantalIngevuld = domeinen.Count(d => d.ingevuld);
        var totaal = domeinen.Length;
        var percentage = totaal > 0 ? (int)Math.Round(100.0 * aantalIngevuld / totaal) : 0;

        return Ok(new
        {
            percentage,
            aantalIngevuld,
            totaal,
            domeinen
        });
    }

    [HttpGet("meldingen")]
    public async Task<IActionResult> GetMeldingen([FromServices] LumioDbContext db)
    {
        var meldingen = new List<object>();

        // 1. Check of eigenaar profiel is aangemaakt
        var eigenaar = await db.Eigenaren.FirstOrDefaultAsync();
        if (eigenaar is null)
        {
            meldingen.Add(new { type = "waarschuwing", categorie = "profiel", bericht = "U heeft nog geen persoonlijk profiel aangemaakt. Dit is de eerste stap.", actie = "/eigenaar" });
        }

        // 2. Check ontbrekende domeinen
        if (!await db.Testamenten.AnyAsync())
            meldingen.Add(new { type = "herinnering", categorie = "testament", bericht = "U heeft nog geen testamentaire informatie vastgelegd.", actie = "/testament" });

        if (!await db.Wilsverklaringen.AnyAsync())
            meldingen.Add(new { type = "herinnering", categorie = "euthanasie", bericht = "U heeft nog geen wilsverklaring euthanasie opgesteld.", actie = "/euthanasie" });

        if (!await db.DonorRegistraties.AnyAsync())
            meldingen.Add(new { type = "herinnering", categorie = "donor", bericht = "U heeft uw donorregistratie nog niet vastgelegd.", actie = "/donor" });

        if (!await db.UitvaartWensen.AnyAsync())
            meldingen.Add(new { type = "herinnering", categorie = "uitvaart", bericht = "U heeft nog geen uitvaartwensen vastgelegd.", actie = "/uitvaart" });

        if (!await db.Erfgenamen.AnyAsync())
            meldingen.Add(new { type = "herinnering", categorie = "erfgenamen", bericht = "U heeft nog geen erfgenamen geregistreerd.", actie = "/erfgenamen" });

        if (!await db.Noodcontacten.AnyAsync())
            meldingen.Add(new { type = "herinnering", categorie = "noodcontacten", bericht = "U heeft nog geen noodcontacten opgegeven.", actie = "/noodcontacten" });

        if (!await db.Documenten.AnyAsync())
            meldingen.Add(new { type = "herinnering", categorie = "documenten", bericht = "U heeft nog geen belangrijke documenten geüpload.", actie = "/documenten" });

        // 3. Check of er een backup is gemaakt (geen recente backup-actie in audit log)
        var laatsteBackup = await db.AuditLog
            .Where(a => a.Actie == "Backup")
            .OrderByDescending(a => a.Tijdstip)
            .FirstOrDefaultAsync();
        if (laatsteBackup is null)
        {
            meldingen.Add(new { type = "waarschuwing", categorie = "backup", bericht = "U heeft nog nooit een backup gemaakt. Maak een backup om dataverlies te voorkomen.", actie = "/instellingen" });
        }
        else if (laatsteBackup.Tijdstip < DateTime.UtcNow.AddDays(-30))
        {
            meldingen.Add(new { type = "herinnering", categorie = "backup", bericht = $"Uw laatste backup is van {laatsteBackup.Tijdstip:dd-MM-yyyy}. Overweeg een nieuwe backup.", actie = "/instellingen" });
        }

        // 4. Check of Shamir sleuteldelen zijn verdeeld
        var erfgenamenMetSleutel = await db.Erfgenamen.AnyAsync(e => e.HeeftShareOntvangen);
        var erfgenamenTotaal = await db.Erfgenamen.CountAsync();
        if (erfgenamenTotaal > 0 && !erfgenamenMetSleutel)
        {
            meldingen.Add(new { type = "herinnering", categorie = "shamir", bericht = "U heeft erfgenamen maar nog geen noodcodes verdeeld. Verdeel uw noodcodes zodat erfgenamen samen toegang kunnen krijgen.", actie = "/erfgenamen" });
        }

        // 5. Check verlopen en bijna-verlopen documenten
        var vandaag = DateOnly.FromDateTime(DateTime.Today);
        var over30Dagen = vandaag.AddDays(30);

        var verlopenDocs = await db.Documenten
            .Where(d => d.VerlooptOp != null && d.VerlooptOp <= vandaag)
            .Select(d => d.Naam)
            .Distinct()
            .ToListAsync();

        if (verlopenDocs.Count > 0)
        {
            var namen = string.Join(", ", verlopenDocs);
            meldingen.Add(new { type = "waarschuwing", categorie = "documenten", bericht = $"De volgende documenten zijn verlopen: {namen}. Controleer of ze nog actueel zijn.", actie = "/documenten" });
        }

        var bijnaVerlopenDocs = await db.Documenten
            .Where(d => d.VerlooptOp != null && d.VerlooptOp > vandaag && d.VerlooptOp <= over30Dagen)
            .Select(d => d.Naam)
            .Distinct()
            .ToListAsync();

        if (bijnaVerlopenDocs.Count > 0)
        {
            var namen = string.Join(", ", bijnaVerlopenDocs);
            meldingen.Add(new { type = "herinnering", categorie = "documenten", bericht = $"De volgende documenten verlopen binnenkort: {namen}.", actie = "/documenten" });
        }

        // 6. Check periodieke actualisatie-herinnering (kwartaal)
        if (eigenaar is not null)
        {
            var bevestigingen = await db.ActualisatieBevestigingen
                .Where(a => a.EigenaarId == eigenaar.Id)
                .ToListAsync();
            var laatsteAlgemeen = bevestigingen
                .OrderByDescending(b => b.BevestigdOp)
                .FirstOrDefault();
            if (laatsteAlgemeen is null)
            {
                meldingen.Add(new { type = "herinnering", categorie = "actualisatie", bericht = "Controleer regelmatig of al uw gegevens nog actueel zijn. Bevestig uw actualisatie via Instellingen.", actie = "/instellingen" });
            }
            else if (laatsteAlgemeen.BevestigdOp < DateTime.UtcNow.AddDays(-90))
            {
                meldingen.Add(new { type = "herinnering", categorie = "actualisatie", bericht = $"Uw laatste actualisatie-controle was op {laatsteAlgemeen.BevestigdOp:dd-MM-yyyy}. Controleer of uw gegevens nog actueel zijn.", actie = "/instellingen" });
            }
        }

        return Ok(new { meldingen, aantal = meldingen.Count });
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
        var kwartaal = TimeSpan.FromDays(90);

        var domeinChecks = new[]
        {
            new { domein = "eigenaar", label = "Mijn Profiel" },
            new { domein = "testament", label = "Testament" },
            new { domein = "euthanasie", label = "Wilsverklaring" },
            new { domein = "donor", label = "Donorregistratie" },
            new { domein = "boedel", label = "Boedel" },
            new { domein = "uitvaart", label = "Uitvaartwensen" },
            new { domein = "erfgenamen", label = "Erfgenamen" },
            new { domein = "documenten", label = "Documenten" },
            new { domein = "digitaal-bezit", label = "Digitaal Bezit" },
            new { domein = "noodcontacten", label = "Noodcontacten" },
        };

        var resultaat = domeinChecks.Select(d =>
        {
            var bevestiging = bevestigingen
                .Where(b => b.Domein == d.domein)
                .OrderByDescending(b => b.BevestigdOp)
                .FirstOrDefault();

            var laatsteBevestiging = bevestiging?.BevestigdOp;
            var isVerlopen = laatsteBevestiging is null || (nu - laatsteBevestiging.Value) > kwartaal;

            return new
            {
                d.domein,
                d.label,
                laatsteBevestiging = laatsteBevestiging?.ToString("yyyy-MM-dd"),
                actualisatieNodig = isVerlopen
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
}
