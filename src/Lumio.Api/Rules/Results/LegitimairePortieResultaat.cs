namespace Lumio.Api.Rules.Results;

/// <summary>
/// Resultaat van legitimaire-portie check (BW Boek 4, art. 4:63-4:69).
/// </summary>
public record LegitimairePortieResultaat(
    bool HeeftWaarschuwing,
    int AantalKinderen,
    bool HeeftPartner,
    decimal MinimumPercentagePerKind,
    List<LegitimairePortieWaarschuwingResult> Waarschuwingen);

public record LegitimairePortieWaarschuwingResult(
    string Naam,
    decimal? ToegewezenPercentage,
    decimal MinimumPercentage);
