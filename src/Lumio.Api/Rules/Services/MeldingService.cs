using Lumio.Api.Rules.Configuration;
using Lumio.Api.Rules.Engine;
using Lumio.Api.Rules.Facts;
using Lumio.Api.Rules.Results;
using Microsoft.Extensions.Localization;
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
    private readonly IStringLocalizer<MeldingService> L;

    public MeldingService(
        IRuleEngineService engine,
        IOptions<LimietenOptions> limieten,
        IOptions<LumioRulesOptions> rootOptions,
        ILogger<MeldingService> logger,
        IStringLocalizer<MeldingService> localizer)
    {
        _engine = engine;
        _limieten = limieten.Value;
        _regelVersie = rootOptions.Value.Versie;
        _logger = logger;
        L = localizer;
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
                L["NoProfile"].Value, "/eigenaar"));
            toegepasteRegels.Add("BR-MELD-02: Geen eigenaar profiel");
        }

        // 2. Ontbrekende domeinen
        if (!facts.HeeftTestament)
            meldingen.Add(new Melding("herinnering", "testament",
                L["NoTestament"].Value, "/testament"));

        if (!facts.HeeftWilsverklaring)
            meldingen.Add(new Melding("herinnering", "euthanasie",
                L["NoLivingWill"].Value, "/euthanasie"));

        if (!facts.HeeftDonor)
            meldingen.Add(new Melding("herinnering", "donor",
                L["NoDonor"].Value, "/donor"));

        if (!facts.HeeftUitvaart)
            meldingen.Add(new Melding("herinnering", "uitvaart",
                L["NoFuneral"].Value, "/uitvaart"));

        if (!facts.HeeftErfgenamen)
            meldingen.Add(new Melding("herinnering", "erfgenamen",
                L["NoHeirs"].Value, "/erfgenamen"));

        if (!facts.HeeftNoodcontacten)
            meldingen.Add(new Melding("herinnering", "noodcontacten",
                L["NoEmergencyContacts"].Value, "/noodcontacten"));

        if (!facts.HeeftDocumenten)
            meldingen.Add(new Melding("herinnering", "documenten",
                L["NoDocuments"].Value, "/documenten"));

        // 3. Backup check
        if (facts.LaatsteBackupTijdstip is null)
        {
            meldingen.Add(new Melding("waarschuwing", "backup",
                L["NoBackupEver"].Value, "/instellingen"));
            toegepasteRegels.Add("BR-MELD-03: Geen backup ooit gemaakt");
        }
        else if (facts.LaatsteBackupTijdstip.Value < DateTime.UtcNow.AddDays(-_limieten.BackupVerouderdDagen))
        {
            meldingen.Add(new Melding("herinnering", "backup",
                L["BackupOutdated", facts.LaatsteBackupTijdstip.Value.ToString("dd-MM-yyyy")].Value, "/instellingen"));
            toegepasteRegels.Add("BR-MELD-04: Backup verouderd");
        }

        // 4. Shamir check
        if (facts.ErfgenamenTotaal > 0 && !facts.ErfgenamenMetSleutel)
        {
            meldingen.Add(new Melding("herinnering", "shamir",
                L["ShamirNotDistributed"].Value, "/erfgenamen"));
            toegepasteRegels.Add("BR-MELD-05: Shamir niet verdeeld");
        }

        // 5. Verlopen documenten
        if (facts.VerlopenDocumenten.Count > 0)
        {
            var namen = string.Join(", ", facts.VerlopenDocumenten);
            meldingen.Add(new Melding("waarschuwing", "documenten",
                L["DocumentsExpired", namen].Value, "/documenten"));
            toegepasteRegels.Add("BR-MELD-06: Verlopen documenten");
        }

        if (facts.BijnaVerlopenDocumenten.Count > 0)
        {
            var namen = string.Join(", ", facts.BijnaVerlopenDocumenten);
            meldingen.Add(new Melding("herinnering", "documenten",
                L["DocumentsExpiringSoon", namen].Value, "/documenten"));
            toegepasteRegels.Add("BR-MELD-07: Bijna verlopen documenten");
        }

        // 6. Actualisatie check
        if (facts.HeeftEigenaar)
        {
            if (facts.LaatsteActualisatie is null)
            {
                meldingen.Add(new Melding("herinnering", "actualisatie",
                    L["NeverActualized"].Value, "/instellingen"));
                toegepasteRegels.Add("BR-MELD-08: Nooit geactualiseerd");
            }
            // S8-12: per-domein actualisatie check (vervangt uniforme 90-dagencheck)
            else if (facts.VerlopenActualisatieDomeinen.Count > 0)
            {
                var domeinen = string.Join(", ", facts.VerlopenActualisatieDomeinen);
                meldingen.Add(new Melding("herinnering", "actualisatie",
                    $"De volgende registraties zijn aan actualisatie toe: {domeinen}. Controleer of de informatie nog actueel is.",
                    "/instellingen"));
                toegepasteRegels.Add("BR-MELD-09: Per-domein actualisatie verlopen (S8-12)");
            }
        }

        // S6-17: Legitimaire portie schending
        if (facts.HeeftLegitimairePortieSchending)
        {
            meldingen.Add(new Melding("waarschuwing", "testament",
                "De verdeling in uw testament kan de legitimaire portie van uw kinderen schenden. Controleer de percentages bij uw notaris.",
                "/testament"));
            toegepasteRegels.Add("BR-MELD-10: Legitimaire portie schending");
        }

        // S6-20: Tijdlijn niet bekeken
        if (facts.HeeftEigenaar && !facts.HeeftTijdlijnGezien)
        {
            meldingen.Add(new Melding("herinnering", "tijdlijn",
                "U heeft de tijdlijn nog niet bekeken. Gebruik de tijdlijn om te zien welke stappen uw nabestaanden moeten doorlopen.",
                "/tijdlijn"));
            toegepasteRegels.Add("BR-MELD-11: Tijdlijn nooit bekeken");
        }

        // S8-01: Bezit zonder geschatte waarde
        if (facts.HeeftBezitMissendeWaarde)
        {
            meldingen.Add(new Melding("waarschuwing", "boedel",
                "Eén of meer bezittingen hebben geen geschatte waarde. Voeg een waarde toe voor een compleet nalatenschapsoverzicht.",
                "/boedel"));
            toegepasteRegels.Add("BR-MELD-12: Bezit zonder waarde");
        }

        // S8-02: Netto nalatenschap negatief
        if (facts.NettoNalatenschapNegatief)
        {
            meldingen.Add(new Melding("waarschuwing", "boedel",
                "Uw schulden overtreffen de totale bezitswaarde. Overweeg een uitsluitingsclausule of bespreek dit met uw notaris.",
                "/boedel"));
            toegepasteRegels.Add("BR-MELD-13: Netto nalatenschap negatief");
        }

        // S8-03: Bezit zonder bestemde erfgenaam
        if (facts.HeeftBezitZonderErfgenaam)
        {
            meldingen.Add(new Melding("herinnering", "boedel",
                "Eén of meer bezittingen zijn nog niet toegewezen aan een erfgenaam. Wijs een bestemde erfgenaam toe in het boedeloverzicht.",
                "/boedel"));
            toegepasteRegels.Add("BR-MELD-14: Bezit zonder bestemde erfgenaam");
        }

        // S8-04: Erfgenaam zonder contactgegevens
        if (facts.HeeftErfgenaamZonderContactgegevens)
        {
            meldingen.Add(new Melding("herinnering", "erfgenamen",
                "Eén of meer erfgenamen hebben geen contactgegevens (e-mail én telefoon). Voeg contactinformatie toe.",
                "/erfgenamen"));
            toegepasteRegels.Add("BR-MELD-15: Erfgenaam zonder contactgegevens");
        }

        // S8-06: Donor — nabestaanden als beslisser maar geen noodcontact aanwezig
        if (facts.DonorKeuze?.Contains("nabestaanden", StringComparison.OrdinalIgnoreCase) == true
            && !facts.HeeftNoodcontacten)
        {
            meldingen.Add(new Melding("waarschuwing", "donor",
                "U heeft uw nabestaanden als beslisser aangewezen voor uw donorregistratie, maar er zijn geen noodcontacten geregistreerd. Voeg minimaal één noodcontact toe.",
                "/noodcontacten"));
            toegepasteRegels.Add("BR-MELD-16: Donor nabestaanden zonder noodcontact");
        }

        // S8-08: Geen vertrouwenspersoon in noodcontacten
        if (facts.HeeftNoodcontacten && !facts.HeeftVertrouwenspersoon)
        {
            meldingen.Add(new Melding("herinnering", "noodcontacten",
                "Geen van uw noodcontacten heeft de rol 'Vertrouwenspersoon'. Wijs een vertrouwenspersoon aan.",
                "/noodcontacten"));
            toegepasteRegels.Add("BR-MELD-17: Geen vertrouwenspersoon");
        }

        // S8-09: Noodcontacten zonder telefoonnummer
        if (facts.HeeftNoodcontacten && !facts.HeeftNoodcontactMetTelefoon)
        {
            meldingen.Add(new Melding("herinnering", "noodcontacten",
                "Geen van uw noodcontacten heeft een telefoonnummer. Voeg een telefoonnummer toe zodat ze bereikbaar zijn.",
                "/noodcontacten"));
            toegepasteRegels.Add("BR-MELD-18: Geen noodcontact met telefoonnummer");
        }

        return new PolicyResult<MeldingResultaat>
        {
            Resultaat = new MeldingResultaat(meldingen, meldingen.Count),
            RegelVersie = _regelVersie,
            ToegepasteRegels = toegepasteRegels
        };
    }
}
