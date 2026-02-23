namespace Lumio.Api.Rules.Facts;

/// <summary>
/// Feiten voor legitimaire-portie berekening (BW Boek 4, art. 4:63-4:69).
/// </summary>
public record LegitimairePortieFacts(
    bool HeeftEigenaar,
    bool HeeftTestament,
    BurgerlijkeStaatFact BurgerlijkeStaat,
    List<KindErfgenaamFact> Kinderen,
    List<BegunstigdeFact> Begunstigden);

public record KindErfgenaamFact(
    Guid ErfgenaamId,
    string VolledigeNaam,
    string Voornaam,
    string Achternaam);

public record BegunstigdeFact(
    string Naam,
    decimal? Percentage);

public enum BurgerlijkeStaatFact
{
    Alleenstaand,
    Gehuwd,
    GeregistreerdPartnerschap,
    Overig
}
