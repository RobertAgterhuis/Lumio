using Lumio.Api.Rules.Configuration;
using Lumio.Api.Rules.Facts;
using Lumio.Api.Rules.Results;
using Microsoft.Extensions.Options;

namespace Lumio.Api.Rules.Services;

/// <summary>Berekent de netto nalatenschap met PolicyResult wrapper.</summary>
public interface INalatenschapService
{
    /// <summary>Berekent de netto nalatenschap voor de opgegeven feiten.</summary>
    PolicyResult<NalatenschapResultaat> Bereken(NalatenschapFacts facts);
}

/// <summary>
/// Netto-nalatenschapberekening met PolicyResult wrapper.
/// Vervangt directe NalatenschapHelper.Bereken()-aanroepen in controllers.
/// </summary>
public class NalatenschapService : INalatenschapService
{
    private readonly string _regelVersie;

    public NalatenschapService(IOptions<LumioRulesOptions> rootOptions)
    {
        _regelVersie = rootOptions.Value.Versie;
    }

    public PolicyResult<NalatenschapResultaat> Bereken(NalatenschapFacts facts)
    {
        var waarschuwingen = new List<string>();
        var toegepasteRegels = new List<string> { "BR-048: Netto nalatenschap = bruto - schulden" };

        var (bruto, netto) = NalatenschapHelper.Bereken(
            facts.TotaalBezittingen, facts.TotaalSaldi,
            facts.TotaalVerzekeringen, facts.TotaalSchulden);

        if (netto < 0)
            waarschuwingen.Add("Netto nalatenschap is negatief — schulden overtreffen bezittingen.");

        return new PolicyResult<NalatenschapResultaat>
        {
            Resultaat = new NalatenschapResultaat(
                facts.TotaalBezittingen,
                facts.TotaalSaldi,
                facts.TotaalVerzekeringen,
                facts.TotaalSchulden,
                bruto,
                netto),
            RegelVersie = _regelVersie,
            Waarschuwingen = waarschuwingen,
            ToegepasteRegels = toegepasteRegels
        };
    }
}
