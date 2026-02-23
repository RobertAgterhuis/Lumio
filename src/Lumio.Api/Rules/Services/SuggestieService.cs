using Lumio.Api.Rules.Configuration;
using Lumio.Api.Rules.Engine;
using Lumio.Api.Rules.Facts;
using Lumio.Api.Rules.Results;
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

    public SuggestieService(
        IRuleEngineService engine,
        IOptions<LumioRulesOptions> rootOptions,
        ILogger<SuggestieService> logger)
    {
        _engine = engine;
        _regelVersie = rootOptions.Value.Versie;
        _logger = logger;
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
                "Notaris inconsistentie",
                $"De notaris in uw profiel (\"{facts.EigenaarNotaris}\") verschilt van de notaris " +
                    $"bij het testament (\"{testament.NotarisNaam}\"). Klopt dit?",
                "Controleer of u dezelfde notaris bedoelt en werk de gegevens bij."));
        }

        // Notaris in noodcontacten
        if (facts.Testament is not null &&
            !string.IsNullOrWhiteSpace(facts.Testament.NotarisNaam))
        {
            var notarisContact = facts.Noodcontacten.FirstOrDefault(n => n.Rol == "Notaris");
            if (notarisContact == null)
            {
                suggesties.Add(new Suggestie(
                    "Notaris noodcontact",
                    $"Notaris \"{facts.Testament.NotarisNaam}\" is wel bij het testament ingevuld " +
                        "maar niet als noodcontact geregistreerd.",
                    "Voeg uw notaris toe als noodcontact met het contactnummer."));
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
                    "Uitvaartondernemer noodcontact",
                    $"Uitvaartondernemer \"{facts.UitvaartOndernemer}\" is niet als noodcontact geregistreerd.",
                    "Voeg uw uitvaartondernemer toe als noodcontact."));
            }
        }

        // Begunstigde ↔ Erfgenaam
        suggesties.AddRange(EvalueerBegunstigdeErfgenaamKoppeling(facts));

        // Huisarts in noodcontacten
        var heeftHuisarts = facts.Noodcontacten.Any(n => n.Rol == "Huisarts");
        if (!heeftHuisarts && facts.Erfgenamen.Count > 0)
        {
            suggesties.Add(new Suggestie(
                "Ontbrekend noodcontact",
                "Er is geen huisarts als noodcontact geregistreerd. " +
                    "Een huisarts is belangrijk bij overlijden en voor medische documentatie.",
                "Voeg uw huisarts toe als noodcontact."));
        }

        return suggesties;
    }

    // ── Iteratie-gebaseerde regels (altijd via code) ─────────

    private static List<Suggestie> EvalueerErfgenaamNoodcontactKoppeling(SuggestieFacts facts)
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
                    "Erfgenaam ↔ Noodcontact",
                    $"Erfgenaam \"{e.VolledigeNaam}\" is niet als noodcontact geregistreerd. " +
                        "Overweeg deze persoon ook als noodcontact toe te voegen zodat zij bereikbaar zijn bij nood.",
                    "Ga naar Noodcontacten en voeg deze persoon toe."));
            }
        }
        return suggesties;
    }

    private static List<Suggestie> EvalueerNoodcontactErfgenaamKoppeling(SuggestieFacts facts)
    {
        var suggesties = new List<Suggestie>();
        foreach (var n in facts.Noodcontacten.Where(n => n.Rol == "Vertrouwenspersoon"))
        {
            var isErfgenaam = facts.Erfgenamen.Any(e =>
                e.VolledigeNaam.Equals(n.Naam, StringComparison.OrdinalIgnoreCase));
            if (!isErfgenaam)
            {
                suggesties.Add(new Suggestie(
                    "Noodcontact ↔ Erfgenaam",
                    $"Vertrouwenspersoon \"{n.Naam}\" is niet als erfgenaam geregistreerd. " +
                        "Wilt u deze persoon ook als erfgenaam toevoegen?",
                    "Ga naar Erfgenamen en voeg deze persoon toe."));
            }
        }
        return suggesties;
    }

    private static List<Suggestie> EvalueerBegunstigdeErfgenaamKoppeling(SuggestieFacts facts)
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
                    "Begunstigde ↔ Erfgenaam",
                    $"Begunstigde \"{b}\" in het testament is niet als erfgenaam geregistreerd.",
                    "Controleer of deze persoon ook als erfgenaam moet worden toegevoegd."));
            }
        }
        return suggesties;
    }
}
