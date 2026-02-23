using Lumio.Api.Rules.Configuration;
using Lumio.Api.Rules.Engine;
using Lumio.Api.Rules.Facts;
using Lumio.Api.Rules.Results;
using Microsoft.Extensions.Options;
using RulesEngine.Models;

namespace Lumio.Api.Rules.Services;

/// <summary>Genereert meldingen (waarschuwingen en herinneringen) op basis van de huidige data-staat.</summary>
public interface IMeldingService
{
    /// <summary>Evalueert de meldingsregels voor de opgegeven feiten.</summary>
    Task<PolicyResult<MeldingResultaat>> EvalueerAsync(MeldingFacts facts);
}

/// <summary>
/// Genereert meldingen (waarschuwingen + herinneringen) op basis van de huidige data-staat.
/// Gebruikt de Rule Engine indien beschikbaar; valt terug op hardcoded logica bij problemen.
/// </summary>
public class MeldingService : IMeldingService
{
    private const string WorkflowName = "MeldingenWorkflow";

    private readonly IRuleEngineService _engine;
    private readonly LimietenOptions _limieten;
    private readonly string _regelVersie;
    private readonly ILogger<MeldingService> _logger;

    public MeldingService(
        IRuleEngineService engine,
        IOptions<LimietenOptions> limieten,
        IOptions<LumioRulesOptions> rootOptions,
        ILogger<MeldingService> logger)
    {
        _engine = engine;
        _limieten = limieten.Value;
        _regelVersie = rootOptions.Value.Versie;
        _logger = logger;
    }

    public async Task<PolicyResult<MeldingResultaat>> EvalueerAsync(MeldingFacts facts)
    {
        // Engine-first strategie met fallback naar hardcoded logica
        if (_engine.IsAvailable)
        {
            try
            {
                return await EvalueerViaEngineAsync(facts);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex,
                    "Rule engine evaluatie mislukt voor {Workflow}, fallback naar hardcoded logica",
                    WorkflowName);
            }
        }

        return EvalueerFallback(facts);
    }

    // ── Engine-evaluatie ────────────────────────────────────

    private async Task<PolicyResult<MeldingResultaat>> EvalueerViaEngineAsync(MeldingFacts facts)
    {
        var param = new RuleParameter("facts", facts);
        var meldingen = await _engine.EvalueerAsync<Melding>(WorkflowName, param);

        var toegepasteRegels = new List<string> { "BR-MELD-01: Meldingenberekening (via Rule Engine)" };
        toegepasteRegels.AddRange(meldingen.Select(m => $"engine:{m.Categorie}"));

        return new PolicyResult<MeldingResultaat>
        {
            Resultaat = new MeldingResultaat(meldingen, meldingen.Count),
            RegelVersie = _regelVersie,
            ToegepasteRegels = toegepasteRegels
        };
    }

    // ── Fallback: hardcoded logica (originele Sprint 2 implementatie) ──

    private PolicyResult<MeldingResultaat> EvalueerFallback(MeldingFacts facts)
    {
        var meldingen = new List<Melding>();
        var toegepasteRegels = new List<string> { "BR-MELD-01: Meldingenberekening (fallback)" };

        // 1. Profiel check
        if (!facts.HeeftEigenaar)
        {
            meldingen.Add(new Melding("waarschuwing", "profiel",
                "U heeft nog geen persoonlijk profiel aangemaakt. Dit is de eerste stap.", "/eigenaar"));
            toegepasteRegels.Add("BR-MELD-02: Geen eigenaar profiel");
        }

        // 2. Ontbrekende domeinen
        if (!facts.HeeftTestament)
            meldingen.Add(new Melding("herinnering", "testament",
                "U heeft nog geen testamentaire informatie vastgelegd.", "/testament"));

        if (!facts.HeeftWilsverklaring)
            meldingen.Add(new Melding("herinnering", "euthanasie",
                "U heeft nog geen wilsverklaring euthanasie opgesteld.", "/euthanasie"));

        if (!facts.HeeftDonor)
            meldingen.Add(new Melding("herinnering", "donor",
                "U heeft uw donorregistratie nog niet vastgelegd.", "/donor"));

        if (!facts.HeeftUitvaart)
            meldingen.Add(new Melding("herinnering", "uitvaart",
                "U heeft nog geen uitvaartwensen vastgelegd.", "/uitvaart"));

        if (!facts.HeeftErfgenamen)
            meldingen.Add(new Melding("herinnering", "erfgenamen",
                "U heeft nog geen erfgenamen geregistreerd.", "/erfgenamen"));

        if (!facts.HeeftNoodcontacten)
            meldingen.Add(new Melding("herinnering", "noodcontacten",
                "U heeft nog geen noodcontacten opgegeven.", "/noodcontacten"));

        if (!facts.HeeftDocumenten)
            meldingen.Add(new Melding("herinnering", "documenten",
                "U heeft nog geen belangrijke documenten geüpload.", "/documenten"));

        // 3. Backup check
        if (facts.LaatsteBackupTijdstip is null)
        {
            meldingen.Add(new Melding("waarschuwing", "backup",
                "U heeft nog nooit een backup gemaakt. Maak een backup om dataverlies te voorkomen.", "/instellingen"));
            toegepasteRegels.Add("BR-MELD-03: Geen backup ooit gemaakt");
        }
        else if (facts.LaatsteBackupTijdstip.Value < DateTime.UtcNow.AddDays(-_limieten.BackupVerouderdDagen))
        {
            meldingen.Add(new Melding("herinnering", "backup",
                $"Uw laatste backup is van {facts.LaatsteBackupTijdstip.Value:dd-MM-yyyy}. Overweeg een nieuwe backup.", "/instellingen"));
            toegepasteRegels.Add("BR-MELD-04: Backup verouderd");
        }

        // 4. Shamir check
        if (facts.ErfgenamenTotaal > 0 && !facts.ErfgenamenMetSleutel)
        {
            meldingen.Add(new Melding("herinnering", "shamir",
                "U heeft erfgenamen maar nog geen noodcodes verdeeld. Verdeel uw noodcodes zodat erfgenamen samen toegang kunnen krijgen.", "/erfgenamen"));
            toegepasteRegels.Add("BR-MELD-05: Shamir niet verdeeld");
        }

        // 5. Verlopen documenten
        if (facts.VerlopenDocumenten.Count > 0)
        {
            var namen = string.Join(", ", facts.VerlopenDocumenten);
            meldingen.Add(new Melding("waarschuwing", "documenten",
                $"De volgende documenten zijn verlopen: {namen}. Controleer of ze nog actueel zijn.", "/documenten"));
            toegepasteRegels.Add("BR-MELD-06: Verlopen documenten");
        }

        if (facts.BijnaVerlopenDocumenten.Count > 0)
        {
            var namen = string.Join(", ", facts.BijnaVerlopenDocumenten);
            meldingen.Add(new Melding("herinnering", "documenten",
                $"De volgende documenten verlopen binnenkort: {namen}.", "/documenten"));
            toegepasteRegels.Add("BR-MELD-07: Bijna verlopen documenten");
        }

        // 6. Actualisatie check
        if (facts.HeeftEigenaar)
        {
            if (facts.LaatsteActualisatie is null)
            {
                meldingen.Add(new Melding("herinnering", "actualisatie",
                    "Controleer regelmatig of al uw gegevens nog actueel zijn. Bevestig uw actualisatie via Instellingen.", "/instellingen"));
                toegepasteRegels.Add("BR-MELD-08: Nooit geactualiseerd");
            }
            else if (facts.LaatsteActualisatie.Value < DateTime.UtcNow.AddDays(-_limieten.ActualisatieIntervalDagen))
            {
                meldingen.Add(new Melding("herinnering", "actualisatie",
                    $"Uw laatste actualisatie-controle was op {facts.LaatsteActualisatie.Value:dd-MM-yyyy}. Controleer of uw gegevens nog actueel zijn.", "/instellingen"));
                toegepasteRegels.Add("BR-MELD-09: Actualisatie verlopen");
            }
        }

        return new PolicyResult<MeldingResultaat>
        {
            Resultaat = new MeldingResultaat(meldingen, meldingen.Count),
            RegelVersie = _regelVersie,
            ToegepasteRegels = toegepasteRegels
        };
    }
}
