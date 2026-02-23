using Lumio.Api.Rules.Configuration;
using Lumio.Api.Rules.Facts;
using Lumio.Api.Rules.Results;
using Microsoft.Extensions.Options;

namespace Lumio.Api.Rules.Services;

/// <summary>Controleert de legitimaire portie conform BW Boek 4, art. 4:63–4:69.</summary>
public interface ILegitimairePortieService
{
    /// <summary>Berekent de legitimaire portie voor de opgegeven feiten.</summary>
    PolicyResult<LegitimairePortieResultaat> Bereken(LegitimairePortieFacts facts);
}

/// <summary>
/// Legitimaire-portie check (BW Boek 4, art. 4:63-4:69).
/// Legitimaire portie = 50% van het intestaat erfdeel per kind.
/// Vervangt inline logica in TestamentController.LegitimairePortieCheck().
/// </summary>
public class LegitimairePortieService : ILegitimairePortieService
{
    private readonly string _regelVersie;

    public LegitimairePortieService(IOptions<LumioRulesOptions> rootOptions)
    {
        _regelVersie = rootOptions.Value.Versie;
    }

    public PolicyResult<LegitimairePortieResultaat> Bereken(LegitimairePortieFacts facts)
    {
        var waarschuwingen = new List<string>();
        var toegepasteRegels = new List<string> { "BR-LP-01: Legitimaire portie check (BW 4:63-4:69)" };

        // Geen eigenaar of testament → geen check
        if (!facts.HeeftEigenaar || !facts.HeeftTestament)
        {
            return new PolicyResult<LegitimairePortieResultaat>
            {
                Resultaat = new LegitimairePortieResultaat(false, 0, false, 0, []),
                RegelVersie = _regelVersie,
                ToegepasteRegels = toegepasteRegels
            };
        }

        var aantalKinderen = facts.Kinderen.Count;
        if (aantalKinderen == 0)
        {
            return new PolicyResult<LegitimairePortieResultaat>
            {
                Resultaat = new LegitimairePortieResultaat(false, 0, false, 0, []),
                RegelVersie = _regelVersie,
                ToegepasteRegels = toegepasteRegels
            };
        }

        // Bepaal of er een partner is
        bool heeftPartner = facts.BurgerlijkeStaat is BurgerlijkeStaatFact.Gehuwd
            or BurgerlijkeStaatFact.GeregistreerdPartnerschap;

        // Intestaat erfdeel per kind: partner telt als 1 extra erfgenaam
        int aantalErfgenamen = aantalKinderen + (heeftPartner ? 1 : 0);
        decimal intestaatPerKind = 100m / aantalErfgenamen;

        // Legitimaire portie = 50% van het intestaat erfdeel
        decimal minimumPerKind = Math.Round(intestaatPerKind / 2m, 2);
        toegepasteRegels.Add($"BR-LP-02: Intestaat {intestaatPerKind:F2}%, minimum {minimumPerKind:F2}%");

        var portieWaarschuwingen = new List<LegitimairePortieWaarschuwingResult>();

        foreach (var kind in facts.Kinderen)
        {
            // Zoek matchende begunstigde (op naam)
            var begunstigde = facts.Begunstigden.FirstOrDefault(b =>
                b.Naam.Contains(kind.Voornaam, StringComparison.OrdinalIgnoreCase) &&
                b.Naam.Contains(kind.Achternaam, StringComparison.OrdinalIgnoreCase));

            if (begunstigde is null)
            {
                portieWaarschuwingen.Add(new LegitimairePortieWaarschuwingResult(
                    kind.VolledigeNaam, null, minimumPerKind));
            }
            else if (begunstigde.Percentage.HasValue && begunstigde.Percentage.Value < minimumPerKind)
            {
                portieWaarschuwingen.Add(new LegitimairePortieWaarschuwingResult(
                    kind.VolledigeNaam, begunstigde.Percentage.Value, minimumPerKind));
            }
        }

        if (portieWaarschuwingen.Count > 0)
            waarschuwingen.Add($"Mogelijke schending legitimaire portie bij {portieWaarschuwingen.Count} kind(eren).");

        return new PolicyResult<LegitimairePortieResultaat>
        {
            Resultaat = new LegitimairePortieResultaat(
                portieWaarschuwingen.Count > 0,
                aantalKinderen,
                heeftPartner,
                minimumPerKind,
                portieWaarschuwingen),
            RegelVersie = _regelVersie,
            Waarschuwingen = waarschuwingen,
            ToegepasteRegels = toegepasteRegels
        };
    }
}
