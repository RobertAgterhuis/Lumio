namespace Lumio.Api.Rules.Facts;

/// <summary>
/// Feiten voor erfbelasting-berekening per erfgenaam.
/// </summary>
public record ErfbelastingFacts(
    decimal NettoNalatenschap,
    List<ErfgenaamFact> Erfgenamen);

public record ErfgenaamFact(
    Guid ErfgenaamId,
    string Naam,
    string Relatie);
