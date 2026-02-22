using Lumio.Api.Data;
using Lumio.Api.Services.Security;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

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

    /// <summary>Granulaire voortgang per sectie met deelscores.</summary>
    [HttpGet("compleetheid/granulair")]
    public async Task<IActionResult> GetGranulairCompleetheid([FromServices] LumioDbContext db)
    {
        var eigenaar = await db.Eigenaren.FirstOrDefaultAsync();
        var details = new List<object>();

        // Eigenaar
        if (eigenaar is not null)
        {
            var velden = new[] {
                !string.IsNullOrEmpty(eigenaar.Voornaam),
                !string.IsNullOrEmpty(eigenaar.Achternaam),
                eigenaar.Geboortedatum != default,
                !string.IsNullOrEmpty(eigenaar.Telefoon),
                !string.IsNullOrEmpty(eigenaar.Email),
                !string.IsNullOrEmpty(eigenaar.Adres),
                !string.IsNullOrEmpty(eigenaar.BSN),
                !string.IsNullOrEmpty(eigenaar.Notaris),
            };
            details.Add(new { domein = "eigenaar", label = "Mijn Profiel", ingevuld = velden.Count(v => v), totaal = velden.Length });
        }
        else
            details.Add(new { domein = "eigenaar", label = "Mijn Profiel", ingevuld = 0, totaal = 8 });

        // Testament
        var testament = await db.Testamenten.Include(t => t.Begunstigden).Include(t => t.Executeurs).FirstOrDefaultAsync();
        if (testament is not null)
        {
            var velden = new[] {
                !string.IsNullOrEmpty(testament.TestamentType),
                !string.IsNullOrEmpty(testament.NotarisNaam),
                testament.DatumTestament.HasValue,
                !string.IsNullOrEmpty(testament.AlgemeneWensen),
                testament.Begunstigden.Count > 0,
                testament.Executeurs.Count > 0,
            };
            details.Add(new { domein = "testament", label = "Testament", ingevuld = velden.Count(v => v), totaal = velden.Length });
        }
        else
            details.Add(new { domein = "testament", label = "Testament", ingevuld = 0, totaal = 6 });

        // Euthanasie
        var euth = await db.Wilsverklaringen.FirstOrDefaultAsync();
        if (euth is not null)
        {
            var velden = new[] { euth.DatumOndertekening.HasValue, !string.IsNullOrEmpty(euth.Huisarts), !string.IsNullOrEmpty(euth.VertegenwoordigerNaam) };
            details.Add(new { domein = "euthanasie", label = "Wilsverklaring", ingevuld = velden.Count(v => v), totaal = velden.Length });
        }
        else
            details.Add(new { domein = "euthanasie", label = "Wilsverklaring", ingevuld = 0, totaal = 3 });

        // Donor
        var donor = await db.DonorRegistraties.FirstOrDefaultAsync();
        details.Add(new { domein = "donor", label = "Donorregistratie", ingevuld = donor is not null ? 1 : 0, totaal = 1 });

        // Digitaal bezit
        var digiCount = await db.DigitaleAccounts.CountAsync() + await db.Wachtwoorden.CountAsync() + await db.CryptoWallets.CountAsync();
        details.Add(new { domein = "digitaal-bezit", label = "Digitaal Bezit", ingevuld = Math.Min(digiCount, 3), totaal = 3 });

        // Boedel
        var boedelItems = new[] { await db.FysiekeBezittingen.AnyAsync(), await db.Bankrekeningen.AnyAsync(), await db.Verzekeringen.AnyAsync(), await db.Schulden.AnyAsync() };
        details.Add(new { domein = "boedel", label = "Boedel", ingevuld = boedelItems.Count(v => v), totaal = boedelItems.Length });

        // Uitvaart
        var uitvaart = await db.UitvaartWensen.FirstOrDefaultAsync();
        if (uitvaart is not null)
        {
            var velden = new[] { !string.IsNullOrEmpty(uitvaart.VoorkeurType), !string.IsNullOrEmpty(uitvaart.UitvaartOndernemer), !string.IsNullOrEmpty(uitvaart.CeremonieSoort), !string.IsNullOrEmpty(uitvaart.RouwkaartTekst) };
            details.Add(new { domein = "uitvaart", label = "Uitvaartwensen", ingevuld = velden.Count(v => v), totaal = velden.Length });
        }
        else
            details.Add(new { domein = "uitvaart", label = "Uitvaartwensen", ingevuld = 0, totaal = 4 });

        // Documenten (at least 1 = basic, 3+ = complete)
        var docCount = await db.Documenten.CountAsync();
        details.Add(new { domein = "documenten", label = "Documenten", ingevuld = Math.Min(docCount, 3), totaal = 3 });

        // Erfgenamen
        var erfCount = await db.Erfgenamen.CountAsync();
        details.Add(new { domein = "erfgenamen", label = "Erfgenamen", ingevuld = Math.Min(erfCount, 2), totaal = 2 });

        // Noodcontacten
        var noodCount = await db.Noodcontacten.CountAsync();
        details.Add(new { domein = "noodcontacten", label = "Noodcontacten", ingevuld = Math.Min(noodCount, 2), totaal = 2 });

        var totaalIngevuld = details.Cast<dynamic>().Sum(d => (int)d.ingevuld);
        var totaalVelden = details.Cast<dynamic>().Sum(d => (int)d.totaal);
        var percentage = totaalVelden > 0 ? (int)Math.Round(100.0 * totaalIngevuld / totaalVelden) : 0;

        return Ok(new { percentage, totaalIngevuld, totaalVelden, domeinen = details });
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
        var totaalSchulden = await db.Schulden.SumAsync(s => s.Bedrag);
        var nettoNalatenschap = totaalBezittingen + totaalSaldi + totaalVerzekeringen - totaalSchulden;

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
            beschrijving = "Digitale handtekening van de huidige data-staat. " +
                "Als deze hash verandert, is de onderliggende data gewijzigd.",
        });
    }

    // ── P-C14: Automatische suggesties gekoppelde profielen ──

    [HttpGet("suggesties")]
    public async Task<IActionResult> Suggesties([FromServices] LumioDbContext db)
    {
        var eigenaar = await db.Eigenaren.FirstOrDefaultAsync();
        if (eigenaar is null)
            return Ok(new { aantalSuggesties = 0, suggesties = Array.Empty<object>() });

        var erfgenamen = await db.Erfgenamen.Where(e => e.EigenaarId == eigenaar.Id).ToListAsync();
        var noodcontacten = await db.Noodcontacten.Where(n => n.EigenaarId == eigenaar.Id).ToListAsync();
        var testament = await db.Testamenten.FirstOrDefaultAsync(t => t.EigenaarId == eigenaar.Id);
        var begunstigden = testament != null
            ? await db.Begunstigden.Where(b => b.TestamentInfoId == testament.Id).ToListAsync()
            : new List<Domain.Testament.Begunstigde>();
        var executeurs = testament != null
            ? await db.Executeurs.Where(e => e.TestamentInfoId == testament.Id).ToListAsync()
            : new List<Domain.Testament.Executeur>();
        var uitvaart = await db.UitvaartWensen.FirstOrDefaultAsync();

        string FullName(Domain.Common.Erfgenaam e) =>
            string.IsNullOrWhiteSpace(e.Tussenvoegsel)
                ? $"{e.Voornaam} {e.Achternaam}"
                : $"{e.Voornaam} {e.Tussenvoegsel} {e.Achternaam}";

        var suggesties = new List<object>();

        // Erfgenamen die ook noodcontact zouden moeten zijn
        foreach (var e in erfgenamen)
        {
            var naam = FullName(e);
            var isNoodcontact = noodcontacten.Any(n =>
                n.Naam.Equals(naam, StringComparison.OrdinalIgnoreCase) ||
                (!string.IsNullOrWhiteSpace(e.Telefoon) && n.Telefoon == e.Telefoon));
            if (!isNoodcontact)
            {
                suggesties.Add(new
                {
                    categorie = "Erfgenaam ↔ Noodcontact",
                    melding = $"Erfgenaam \"{naam}\" is niet als noodcontact geregistreerd. " +
                        "Overweeg deze persoon ook als noodcontact toe te voegen zodat zij bereikbaar zijn bij nood.",
                    actie = "Ga naar Noodcontacten en voeg deze persoon toe."
                });
            }
        }

        // Noodcontacten die mogelijk erfgenaam moeten zijn
        foreach (var n in noodcontacten.Where(n => n.Rol == "Vertrouwenspersoon"))
        {
            var isErfgenaam = erfgenamen.Any(e =>
                FullName(e).Equals(n.Naam, StringComparison.OrdinalIgnoreCase));
            if (!isErfgenaam)
            {
                suggesties.Add(new
                {
                    categorie = "Noodcontact ↔ Erfgenaam",
                    melding = $"Vertrouwenspersoon \"{n.Naam}\" is niet als erfgenaam geregistreerd. " +
                        "Wilt u deze persoon ook als erfgenaam toevoegen?",
                    actie = "Ga naar Erfgenamen en voeg deze persoon toe."
                });
            }
        }

        // Notaris in eigenaar vs testament
        if (testament != null &&
            !string.IsNullOrWhiteSpace(eigenaar.Notaris) &&
            !string.IsNullOrWhiteSpace(testament.NotarisNaam) &&
            !eigenaar.Notaris.Equals(testament.NotarisNaam, StringComparison.OrdinalIgnoreCase))
        {
            suggesties.Add(new
            {
                categorie = "Notaris inconsistentie",
                melding = $"De notaris in uw profiel (\"{eigenaar.Notaris}\") verschilt van de notaris " +
                    $"bij het testament (\"{testament.NotarisNaam}\"). Klopt dit?",
                actie = "Controleer of u dezelfde notaris bedoelt en werk de gegevens bij."
            });
        }

        // Notaris in noodcontacten
        var notarisContact = noodcontacten.FirstOrDefault(n => n.Rol == "Notaris");
        if (testament != null && !string.IsNullOrWhiteSpace(testament.NotarisNaam) && notarisContact == null)
        {
            suggesties.Add(new
            {
                categorie = "Notaris noodcontact",
                melding = $"Notaris \"{testament.NotarisNaam}\" is wel bij het testament ingevuld " +
                    "maar niet als noodcontact geregistreerd.",
                actie = "Voeg uw notaris toe als noodcontact met het contactnummer."
            });
        }

        // Uitvaartondernemer in noodcontacten
        if (uitvaart != null && !string.IsNullOrWhiteSpace(uitvaart.UitvaartOndernemer))
        {
            var heeftUitvaartContact = noodcontacten.Any(n =>
                n.Rol == "Uitvaartondernemer" ||
                n.Naam.Equals(uitvaart.UitvaartOndernemer, StringComparison.OrdinalIgnoreCase));
            if (!heeftUitvaartContact)
            {
                suggesties.Add(new
                {
                    categorie = "Uitvaartondernemer noodcontact",
                    melding = $"Uitvaartondernemer \"{uitvaart.UitvaartOndernemer}\" is niet als noodcontact geregistreerd.",
                    actie = "Voeg uw uitvaartondernemer toe als noodcontact."
                });
            }
        }

        // Begunstigden zonder erfgenaam-koppeling
        foreach (var b in begunstigden)
        {
            var isErfgenaam = erfgenamen.Any(e =>
                FullName(e).Equals(b.Naam, StringComparison.OrdinalIgnoreCase));
            if (!isErfgenaam)
            {
                suggesties.Add(new
                {
                    categorie = "Begunstigde ↔ Erfgenaam",
                    melding = $"Begunstigde \"{b.Naam}\" in het testament is niet als erfgenaam geregistreerd.",
                    actie = "Controleer of deze persoon ook als erfgenaam moet worden toegevoegd."
                });
            }
        }

        // Huisarts in noodcontacten
        var heeftHuisarts = noodcontacten.Any(n => n.Rol == "Huisarts");
        if (!heeftHuisarts && erfgenamen.Count > 0)
        {
            suggesties.Add(new
            {
                categorie = "Ontbrekend noodcontact",
                melding = "Er is geen huisarts als noodcontact geregistreerd. " +
                    "Een huisarts is belangrijk bij overlijden en voor medische documentatie.",
                actie = "Voeg uw huisarts toe als noodcontact."
            });
        }

        return Ok(new { aantalSuggesties = suggesties.Count, suggesties });
    }
}
