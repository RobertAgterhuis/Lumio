using Lumio.Api.Rules.Configuration;
using Lumio.Api.Rules.Facts;
using Lumio.Api.Rules.Results;
using Microsoft.Extensions.Options;

namespace Lumio.Api.Rules.Services;

/// <summary>Berekent erfbelasting op basis van configureerbare tariefgroepen.</summary>
public interface IErfbelastingService
{
    /// <summary>Berekent de erfbelasting voor de opgegeven feiten.</summary>
    PolicyResult<ErfbelastingResultaat> Bereken(ErfbelastingFacts facts);
}

/// <summary>
/// Erfbelasting-berekening op basis van configureerbare tariefgroepen.
/// Vervangt inline logica in ErfgenamenController.BerekenErfbelasting().
/// </summary>
public class ErfbelastingService : IErfbelastingService
{
    private readonly ErfbelastingOptions _options;
    private readonly string _regelVersie;

    public ErfbelastingService(
        IOptions<ErfbelastingOptions> options,
        IOptions<LumioRulesOptions> rootOptions)
    {
        _options = options.Value;
        _regelVersie = rootOptions.Value.Versie;
    }

    public PolicyResult<ErfbelastingResultaat> Bereken(ErfbelastingFacts facts)
    {
        var waarschuwingen = new List<string>();
        var toegepasteRegels = new List<string> { "BR-048: Netto nalatenschap berekening" };

        var nettoNalatenschap = facts.NettoNalatenschap;
        if (nettoNalatenschap < 0)
        {
            waarschuwingen.Add("Netto nalatenschap is negatief; geen erfbelasting verschuldigd.");
            nettoNalatenschap = 0;
        }

        var aantalErfgenamen = facts.Erfgenamen.Count;
        // S5-22: Testamentaire percentages — gebruik Portie als beschikbaar, anders gelijke verdeling
        var totaalPortie = facts.Erfgenamen.Where(e => e.Portie.HasValue).Sum(e => e.Portie!.Value);
        var erfgenamenZonderPortie = facts.Erfgenamen.Where(e => !e.Portie.HasValue).ToList();
        var resterendePortie = Math.Max(0m, 100m - totaalPortie);
        var deelZonderPortie = erfgenamenZonderPortie.Count > 0
            ? nettoNalatenschap * resterendePortie / 100m / erfgenamenZonderPortie.Count
            : 0m;

        var resultaten = facts.Erfgenamen.Select(e =>
        {
            var deelDitErfgenaam = e.Portie.HasValue
                ? nettoNalatenschap * e.Portie.Value / 100m
                : deelZonderPortie;

            var groep = _options.BepaalTariefgroep(e.Relatie);
            var vrijstelling = groep.Vrijstelling;
            var belastbaar = Math.Max(0, deelDitErfgenaam - vrijstelling);
            var belasting = BerekenBelasting(belastbaar, groep.Schijf1Percentage, groep.Schijf2Percentage, groep.Schijf1Grens);

            var regelLabel = e.Portie.HasValue ? $"BR-046+S5-22: Erfbelasting {e.Naam} ({e.Portie.Value}%, {groep.Naam})" : $"BR-046: Erfbelasting {e.Naam} ({groep.Naam})";
            toegepasteRegels.Add(regelLabel);

            return new ErfgenaamBelasting(
                e.ErfgenaamId,
                e.Naam,
                e.Relatie,
                groep.Naam,
                deelDitErfgenaam,
                vrijstelling,
                belastbaar,
                belasting,
                deelDitErfgenaam - belasting);
        }).ToList();

        return new PolicyResult<ErfbelastingResultaat>
        {
            Resultaat = new ErfbelastingResultaat(
                resultaten,
                nettoNalatenschap,
                aantalErfgenamen,
                _options.Disclaimer),
            RegelVersie = _regelVersie,
            Waarschuwingen = waarschuwingen,
            ToegepasteRegels = toegepasteRegels
        };
    }

    private static decimal BerekenBelasting(decimal belastbaar, decimal schijf1, decimal schijf2, decimal grens)
    {
        if (belastbaar <= 0) return 0m;
        if (belastbaar <= grens)
            return Math.Round(belastbaar * schijf1, 2);
        return Math.Round(grens * schijf1 + (belastbaar - grens) * schijf2, 2);
    }
}
