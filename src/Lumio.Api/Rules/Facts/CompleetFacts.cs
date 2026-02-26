namespace Lumio.Api.Rules.Facts;

/// <summary>
/// Feiten voor domein-compleetheid en granulaire voortgangsberekening.
/// </summary>
public record CompleetFacts(
    EigenaarCompleetInfo? Eigenaar,
    TestamentCompleetInfo? Testament,
    EuthanasieCompleetInfo? Euthanasie,
    DonorCompleetInfo? Donor,
    int DigitaalBezitAantal,
    bool[] BoedelCategorieën,
    UitvaartCompleetInfo? Uitvaart,
    int DocumentenAantal,
    int ErfgenamenAantal,
    int NoodcontactenAantal);

public record EigenaarCompleetInfo(
    bool HeeftVoornaam,
    bool HeeftAchternaam,
    bool HeeftGeboortedatum,
    bool HeeftTelefoon,
    bool HeeftEmail,
    bool HeeftAdres,
    bool HeeftBSN,
    bool HeeftNotaris);

public record TestamentCompleetInfo(
    bool HeeftType,
    bool HeeftNotaris,
    bool HeeftDatum,
    bool HeeftWensen,
    int AantalBegunstigden,
    int AantalExecuteurs);

/// <summary>S8-15 — Granulaire informatie over euthanasie/wilsverklaring compleetheid.</summary>
public record EuthanasieCompleetInfo(
    bool HeeftDatum,
    bool HeeftHuisarts,
    bool HeeftVertegenwoordiger,
    bool WilEuthanasieIngevuld,
    bool DementieClausuleIngevuld);

public record UitvaartCompleetInfo(
    bool HeeftVoorkeurType,
    bool HeeftOndernemer,
    bool HeeftCeremonie,
    bool HeeftRouwkaart,
    bool HeeftLocatie,
    bool CeremonieTypeIngevuld,
    bool MuziekIngevuld);

/// <summary>S7-12 — Granulaire informatie over donor-registratie compleetheid.</summary>
public record DonorCompleetInfo(
    bool HeeftDecisie,
    bool BeslisserVolledig,
    bool OrgaanKeuzeGemaakt);
