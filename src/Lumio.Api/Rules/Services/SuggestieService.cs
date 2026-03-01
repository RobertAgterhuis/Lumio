using Lumio.Api.Domain.Common;
using Lumio.Api.Rules.Configuration;
using Lumio.Api.Rules.Engine;
using Lumio.Api.Rules.Facts;
using Lumio.Api.Rules.Results;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Options;
using RulesEngine.Models;

namespace Lumio.Api.Rules.Services;

/// <summary>Genereert automatische suggesties voor gekoppelde profielen.</summary>
public interface ISuggestieService
{
    /// <summary>Evalueert de suggestieregels voor de opgegeven feiten.</summary>
    Task<PolicyResult<SuggestieResultaat>> EvalueerAsync(SuggestieFacts facts);
}

/// <summary>
/// Genereert automatische suggesties voor gekoppelde profielen (P-C14).
/// Hybride strategie: engine voor boolean-regels, code voor iteratie-logica.
/// Valt volledig terug op hardcoded logica als de engine niet beschikbaar is.
/// </summary>
public class SuggestieService : ISuggestieService
{
    private const string WorkflowName = "SuggestiesWorkflow";

    private readonly IRuleEngineService _engine;
    private readonly string _regelVersie;
    private readonly ILogger<SuggestieService> _logger;
    private readonly IStringLocalizer<SuggestieService> L;

    public SuggestieService(
        IRuleEngineService engine,
        IOptions<LumioRulesOptions> rootOptions,
        ILogger<SuggestieService> logger,
        IStringLocalizer<SuggestieService> localizer)
    {
        _engine = engine;
        _regelVersie = rootOptions.Value.Versie;
        _logger = logger;
        L = localizer;
    }

    public async Task<PolicyResult<SuggestieResultaat>> EvalueerAsync(SuggestieFacts facts)
    {
        var toegepasteRegels = new List<string> { "BR-SUG-01: Automatische suggesties gekoppelde profielen" };

        if (!facts.HeeftEigenaar)
        {
            return new PolicyResult<SuggestieResultaat>
            {
                Resultaat = new SuggestieResultaat(0, []),
                RegelVersie = _regelVersie,
                ToegepasteRegels = toegepasteRegels
            };
        }

        List<Suggestie> suggesties;

        if (_engine.IsAvailable)
        {
            try
            {
                suggesties = await EvalueerHybridAsync(facts, toegepasteRegels);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex,
                    "Rule engine evaluatie mislukt voor {Workflow}, fallback naar hardcoded logica",
                    WorkflowName);
                suggesties = EvalueerAlleViaCode(facts, toegepasteRegels);
            }
        }
        else
        {
            suggesties = EvalueerAlleViaCode(facts, toegepasteRegels);
        }

        return new PolicyResult<SuggestieResultaat>
        {
            Resultaat = new SuggestieResultaat(suggesties.Count, suggesties),
            RegelVersie = _regelVersie,
            ToegepasteRegels = toegepasteRegels
        };
    }

    // ── Hybride: engine (boolean-regels) + code (iteratie-regels) ────

    private async Task<List<Suggestie>> EvalueerHybridAsync(SuggestieFacts facts, List<string> toegepasteRegels)
    {
        var suggesties = new List<Suggestie>();

        // 1. Engine-regels: notaris inconsistentie, noodcontact checks, huisarts
        var param = new RuleParameter("facts", facts);
        var engineSuggesties = await _engine.EvalueerAsync<Suggestie>(WorkflowName, param);
        suggesties.AddRange(engineSuggesties);
        toegepasteRegels.AddRange(engineSuggesties.Select(s => $"engine:{s.Categorie}"));

        // 2. Code-regels: iteratie-gebaseerde matching (niet expresseerbaar in RulesEngine)
        suggesties.AddRange(EvalueerErfgenaamNoodcontactKoppeling(facts));
        suggesties.AddRange(EvalueerNoodcontactErfgenaamKoppeling(facts));
        suggesties.AddRange(EvalueerBegunstigdeErfgenaamKoppeling(facts));
        suggesties.AddRange(EvalueerExecuteurNoodcontactKoppeling(facts));
        suggesties.AddRange(EvalueerWilsverklaringVertegenwoordigerKoppeling(facts));

        return suggesties;
    }

    // ── Fallback: alle regels via code (originele Sprint 2 implementatie) ──

    private List<Suggestie> EvalueerAlleViaCode(SuggestieFacts facts, List<string> toegepasteRegels)
    {
        var suggesties = new List<Suggestie>();
        toegepasteRegels.Add("fallback: alle regels via code");

        // Erfgenaam ↔ Noodcontact
        suggesties.AddRange(EvalueerErfgenaamNoodcontactKoppeling(facts));

        // Noodcontact ↔ Erfgenaam
        suggesties.AddRange(EvalueerNoodcontactErfgenaamKoppeling(facts));

        // Notaris inconsistentie
        if (facts.Testament is { } testament &&
            !string.IsNullOrWhiteSpace(facts.EigenaarNotaris) &&
            !string.IsNullOrWhiteSpace(testament.NotarisNaam) &&
            !facts.EigenaarNotaris.Equals(testament.NotarisNaam, StringComparison.OrdinalIgnoreCase))
        {
            suggesties.Add(new Suggestie(
                L["CategoryNotaryInconsistency"].Value,
                L["MessageNotaryInconsistency", facts.EigenaarNotaris, testament.NotarisNaam].Value,
                L["SuggestionNotaryInconsistency"].Value));
        }

        // Notaris in noodcontacten
        if (facts.Testament is not null &&
            !string.IsNullOrWhiteSpace(facts.Testament.NotarisNaam))
        {
            var notarisContact = facts.Noodcontacten.FirstOrDefault(n => n.Rol == "Notaris");
            if (notarisContact == null)
            {
                suggesties.Add(new Suggestie(
                    L["CategoryNotaryEmergency"].Value,
                    L["MessageNotaryEmergency", facts.Testament.NotarisNaam].Value,
                    L["SuggestionNotaryEmergency"].Value));
            }
        }

        // Uitvaartondernemer in noodcontacten
        if (!string.IsNullOrWhiteSpace(facts.UitvaartOndernemer))
        {
            var heeftUitvaartContact = facts.Noodcontacten.Any(n =>
                n.Rol == "Uitvaartondernemer" ||
                n.Naam.Equals(facts.UitvaartOndernemer, StringComparison.OrdinalIgnoreCase));
            if (!heeftUitvaartContact)
            {
                suggesties.Add(new Suggestie(
                    L["CategoryFuneralDirectorEmergency"].Value,
                    L["MessageFuneralDirectorEmergency", facts.UitvaartOndernemer].Value,
                    L["SuggestionFuneralDirectorEmergency"].Value));
            }
        }

        // Begunstigde ↔ Erfgenaam
        suggesties.AddRange(EvalueerBegunstigdeErfgenaamKoppeling(facts));

        // BR-SUG-13: Executeur ↔ Noodcontact
        suggesties.AddRange(EvalueerExecuteurNoodcontactKoppeling(facts));

        // BR-SUG-20: Wilsverklaring vertegenwoordiger ↔ Noodcontact (Sprint 3)
        suggesties.AddRange(EvalueerWilsverklaringVertegenwoordigerKoppeling(facts));

        // Huisarts in noodcontacten
        var heeftHuisarts = facts.Noodcontacten.Any(n => n.Rol == "Huisarts");
        if (!heeftHuisarts && facts.Erfgenamen.Count > 0)
        {
            suggesties.Add(new Suggestie(
                L["CategoryMissingEmergencyContact"].Value,
                L["MessageMissingGP"].Value,
                L["SuggestionAddGP"].Value));
        }

        // BR-SUG-14: Noodcontact zonder telefoonnummer
        foreach (var nc in facts.Noodcontacten.Where(n => string.IsNullOrWhiteSpace(n.Telefoon)))
        {
            suggesties.Add(new Suggestie(
                L["CategoryEmergencyNoPhone"].Value,
                L["MessageEmergencyNoPhone", nc.Naam].Value,
                L["SuggestionAddPhone"].Value));
        }

        // BR-SUG-15: Testament vóór huwelijk (BW 4:46)
        if (facts.Testament?.DatumTestament is { } testamentDatum
            && facts.DatumHuwelijk is { } datumHuwelijk
            && testamentDatum < datumHuwelijk
            && (facts.BurgerlijkeStaat == BurgerlijkeStaat.Gehuwd
                || facts.BurgerlijkeStaat == BurgerlijkeStaat.GeregistreerdPartnerschap))
        {
            suggesties.Add(new Suggestie(
                L["CategoryWillBeforeMarriage"].Value,
                L["MessageWillBeforeMarriage"].Value,
                L["SuggestionReviewWill"].Value));
        }

        // BR-SUG-16: Testament zonder CTR-nummer (Wet op het Notarisambt art. 38a)
        if (facts.Testament is not null && !facts.Testament.HeeftCtrNummer)
        {
            suggesties.Add(new Suggestie(
                L["CategoryNoCtrNumber"].Value,
                L["MessageNoCtrNumber"].Value,
                L["SuggestionAskNotaryCtr"].Value));
        }

        // BR-SUG-17: Gehuwd zonder huwelijksgoederenregime (BW 1:94)
        if ((facts.BurgerlijkeStaat == BurgerlijkeStaat.Gehuwd
                || facts.BurgerlijkeStaat == BurgerlijkeStaat.GeregistreerdPartnerschap)
            && facts.HuwelijksVoorwaarden == HuwelijksVoorwaarden.NietVanToepassing)
        {
            suggesties.Add(new Suggestie(
                L["CategoryNoMarriageRegime"].Value,
                L["MessageNoMarriageRegime"].Value,
                L["SuggestionAddMarriageRegime"].Value));
        }

        // BR-SUG-18: Gescheiden maar ex-partner als erfgenaam (BW 4:52)
        if (facts.BurgerlijkeStaat == BurgerlijkeStaat.Gescheiden)
        {
            foreach (var ex in facts.Erfgenamen.Where(e =>
                e.Relatie.Equals("Partner", StringComparison.OrdinalIgnoreCase) ||
                e.Relatie.Equals("Echtgenoot", StringComparison.OrdinalIgnoreCase) ||
                e.Relatie.Equals("Echtgenote", StringComparison.OrdinalIgnoreCase)))
            {
                suggesties.Add(new Suggestie(
                    L["CategoryDivorcedHeir"].Value,
                    L["MessageDivorcedHeir", ex.VolledigeNaam].Value,
                    L["SuggestionReviewHeirs"].Value));
            }
        }

        // BR-SUG-19: Legitimatiegegevens verlopen of bijna verlopen (180 dagen drempel)
        if (facts.LegitimatieGeldigTot is { } geldigTot)
        {
            var dagenTot = (geldigTot.ToDateTime(TimeOnly.MinValue) - DateTime.Today).Days;
            if (dagenTot <= 180)
            {
                var melding = dagenTot < 0
                    ? L["MessageIdExpired"].Value
                    : L["MessageIdExpiringSoon", dagenTot].Value;
                suggesties.Add(new Suggestie(
                    L["CategoryIdExpiry"].Value,
                    melding,
                    L["SuggestionRenewId"].Value));
            }
        }

        // Sprint 3: Wilsverklaring & Donorregistratie

        // BR-SUG-21: Wilsverklaring ouder dan 5 jaar (NVVE-advies: herbevestig elke 1825 dagen)
        if (facts.Wilsverklaring?.DatumOndertekening is { } datumOndertekening)
        {
            var ouderDan = (DateTime.Today - datumOndertekening.ToDateTime(TimeOnly.MinValue)).Days;
            if (ouderDan > 1825)
            {
                suggesties.Add(new Suggestie(
                    L["CategoryWilsverklaringOud"].Value,
                    L["MessageWilsverklaringOud", datumOndertekening.ToString("d MMMM yyyy")].Value,
                    L["SuggestionHerbevestigWilsverklaring"].Value));
            }
        }

        // BR-SUG-22: Huisarts wilsverklaring niet als noodcontact (aanvulling op S-07)
        if (!string.IsNullOrWhiteSpace(facts.Wilsverklaring?.HuisartsNaam))
        {
            var huisartsAlsNoodcontact = facts.Noodcontacten.Any(n =>
                n.Rol == "Huisarts" ||
                n.Naam.Equals(facts.Wilsverklaring.HuisartsNaam, StringComparison.OrdinalIgnoreCase));
            if (!huisartsAlsNoodcontact)
            {
                suggesties.Add(new Suggestie(
                    L["CategoryHuisartsWilsverklaring"].Value,
                    L["MessageHuisartsWilsverklaring", facts.Wilsverklaring.HuisartsNaam].Value,
                    L["SuggestionAddHuisartsNoodcontact"].Value));
            }
        }

        // BR-SUG-23: Donor beslisser niet als noodcontact (Wet orgaandonatie art. 9)
        if (facts.Donor is { } donor
            && !string.IsNullOrWhiteSpace(donor.BeslisserNaam)
            && donor.Keuze.Contains("specifiek", StringComparison.OrdinalIgnoreCase))
        {
            var beslisserAlsNoodcontact = facts.Noodcontacten.Any(n =>
                n.Naam.Equals(donor.BeslisserNaam, StringComparison.OrdinalIgnoreCase));
            if (!beslisserAlsNoodcontact)
            {
                suggesties.Add(new Suggestie(
                    L["CategoryDonorBeslisser"].Value,
                    L["MessageDonorBeslisser", donor.BeslisserNaam].Value,
                    L["SuggestionAddDonorBeslisser"].Value));
            }
        }

        // BR-SUG-24: Donorwens niet officieel geregistreerd bij Donorregister
        if (facts.Donor is { IsGeregistreerdBijDonorregister: false } donorNietOfficieel
            && !string.IsNullOrWhiteSpace(donorNietOfficieel.Keuze)
            && !donorNietOfficieel.Keuze.Equals("Nee", StringComparison.OrdinalIgnoreCase))
        {
            suggesties.Add(new Suggestie(
                L["CategoryDonorNietOfficieel"].Value,
                L["MessageDonorNietOfficieel"].Value,
                L["SuggestionRegistreerBijDonorregister"].Value));
        }

        // S5: Boedel suggesties
        if (facts.AantalVerzekeringenZonderBegunstigde > 0)
        {
            suggesties.Add(new Suggestie(
                "Verzekering zonder begunstigde",
                $"Er {(facts.AantalVerzekeringenZonderBegunstigde == 1 ? "is 1 verzekering" : $"zijn {facts.AantalVerzekeringenZonderBegunstigde} verzekeringen")} zonder begunstigde.",
                "Wijs een begunstigde toe aan uw verzekering(en) in het boedeloverzicht."));
        }

        if (facts.HeeftHypotheekZonderBezit)
        {
            suggesties.Add(new Suggestie(
                "Hypotheek zonder gekoppeld bezit",
                "Er is een hypotheek geregistreerd zonder gekoppeld onroerend goed.",
                "Koppel de hypotheek aan de bijbehorende woning in het boedeloverzicht."));
        }

        // S5: Digitaal bezit suggesties
        if (facts.HeeftAccountOverdragenZonderNaam)
        {
            suggesties.Add(new Suggestie(
                "Digitaal bezit overdragen zonder ontvanger",
                "Er is een digitaal account met actie 'overdragen' maar zonder naam van de ontvanger.",
                "Vul de naam van de ontvanger in bij het digitale account."));
        }

        if (facts.HeeftCryptoZonderSeedPhrase)
        {
            suggesties.Add(new Suggestie(
                "Crypto wallet zonder seed phrase",
                "Er is een crypto wallet zonder opgeslagen seed phrase.",
                "Voeg de seed phrase toe aan uw crypto wallet voor veilige overdracht."));
        }

        if (facts.HeeftAccountZonderActie)
        {
            suggesties.Add(new Suggestie(
                "Digitaal account zonder gewenste actie",
                "Er is een digitaal account zonder opgegeven gewenste actie na overlijden.",
                "Geef aan wat er met elk digitaal account moet gebeuren na uw overlijden."));
        }

        return suggesties;
    }

    // ── Iteratie-gebaseerde regels (altijd via code) ─────────

    private List<Suggestie> EvalueerErfgenaamNoodcontactKoppeling(SuggestieFacts facts)
    {
        var suggesties = new List<Suggestie>();
        foreach (var e in facts.Erfgenamen)
        {
            var isNoodcontact = facts.Noodcontacten.Any(n =>
                n.Naam.Equals(e.VolledigeNaam, StringComparison.OrdinalIgnoreCase) ||
                (!string.IsNullOrWhiteSpace(e.Telefoon) && n.Telefoon == e.Telefoon));
            if (!isNoodcontact)
            {
                suggesties.Add(new Suggestie(
                    L["CategoryHeirEmergencyLink"].Value,
                    L["MessageHeirNotEmergency", e.VolledigeNaam].Value,
                    L["SuggestionGoToEmergencyContacts"].Value));
            }
        }
        return suggesties;
    }

    private List<Suggestie> EvalueerNoodcontactErfgenaamKoppeling(SuggestieFacts facts)
    {
        var suggesties = new List<Suggestie>();
        foreach (var n in facts.Noodcontacten.Where(n => n.Rol == "Vertrouwenspersoon"))
        {
            var isErfgenaam = facts.Erfgenamen.Any(e =>
                e.VolledigeNaam.Equals(n.Naam, StringComparison.OrdinalIgnoreCase));
            if (!isErfgenaam)
            {
                suggesties.Add(new Suggestie(
                    L["CategoryEmergencyHeirLink"].Value,
                    L["MessageEmergencyNotHeir", n.Naam].Value,
                    L["SuggestionGoToHeirs"].Value));
            }
        }
        return suggesties;
    }

    private List<Suggestie> EvalueerBegunstigdeErfgenaamKoppeling(SuggestieFacts facts)
    {
        if (facts.Testament is null) return [];

        var suggesties = new List<Suggestie>();
        foreach (var b in facts.Testament.BegunstigdeNamen)
        {
            var isErfgenaam = facts.Erfgenamen.Any(e =>
                e.VolledigeNaam.Equals(b, StringComparison.OrdinalIgnoreCase));
            if (!isErfgenaam)
            {
                suggesties.Add(new Suggestie(
                    L["CategoryBeneficiaryHeirLink"].Value,
                    L["MessageBeneficiaryNotHeir", b].Value,
                    L["SuggestionCheckBeneficiaryHeir"].Value));
            }
        }
        return suggesties;
    }

    // BR-SUG-13: Executeur ↔ Noodcontact (Sprint 1)
    private List<Suggestie> EvalueerExecuteurNoodcontactKoppeling(SuggestieFacts facts)
    {
        if (facts.Testament is null) return [];

        var suggesties = new List<Suggestie>();
        foreach (var executeur in facts.Testament.ExecuteurNamen)
        {
            var isNoodcontact = facts.Noodcontacten.Any(n =>
                n.Naam.Equals(executeur, StringComparison.OrdinalIgnoreCase));
            if (!isNoodcontact)
            {
                suggesties.Add(new Suggestie(
                    L["CategoryExecutorEmergencyLink"].Value,
                    L["MessageExecutorNotEmergency", executeur].Value,
                    L["SuggestionGoToEmergencyContacts"].Value));
            }
        }
        return suggesties;
    }

    // BR-SUG-20: Wilsverklaring vertegenwoordiger ↔ Noodcontact (Sprint 3)
    private List<Suggestie> EvalueerWilsverklaringVertegenwoordigerKoppeling(SuggestieFacts facts)
    {
        if (facts.Wilsverklaring is null) return [];

        var suggesties = new List<Suggestie>();
        var vertegenwoordigers = new[]
        {
            facts.Wilsverklaring.VertegenwoordigerNaam,
            facts.Wilsverklaring.Vertegenwoordiger2Naam
        };

        foreach (var naam in vertegenwoordigers.Where(n => !string.IsNullOrWhiteSpace(n)))
        {
            var isNoodcontact = facts.Noodcontacten.Any(n =>
                n.Naam.Equals(naam, StringComparison.OrdinalIgnoreCase));
            if (!isNoodcontact)
            {
                suggesties.Add(new Suggestie(
                    L["CategoryWilsverklaringVertegenwoordiger"].Value,
                    L["MessageWilsverklaringVertegenwoordiger", naam!].Value,
                    L["SuggestionAddWilsVertegenwoordiger"].Value));
            }
        }
        return suggesties;
    }
}
