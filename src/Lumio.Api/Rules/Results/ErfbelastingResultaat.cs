namespace Lumio.Api.Rules.Results;

/// <summary>
/// Resultaat van erfbelasting-berekening per erfgenaam.
/// </summary>
public record ErfbelastingResultaat(
    List<ErfgenaamBelasting> Resultaten,
    decimal NettoNalatenschap,
    int AantalErfgenamen,
    string Disclaimer);

public record ErfgenaamBelasting(
    Guid ErfgenaamId,
    string Naam,
    string Relatie,
    string TariefGroep,
    decimal BrutoDeel,
    decimal Vrijstelling,
    decimal Belastbaar,
    decimal Erfbelasting,
    decimal NettoDeel);
