using Lumio.Api.Domain.Common;

namespace Lumio.Api.Rules.Facts;

/// <summary>
/// Feiten voor het genereren van automatische suggesties (gekoppelde profielen P-C14).
/// </summary>
public record SuggestieFacts(
    bool HeeftEigenaar,
    string? EigenaarNotaris,
    List<SuggestieErfgenaamFact> Erfgenamen,
    List<SuggestieNoodcontactFact> Noodcontacten,
    SuggestieTestamentFact? Testament,
    string? UitvaartOndernemer,
    // S5: Boedel suggesties
    int AantalVerzekeringenZonderBegunstigde,
    bool HeeftHypotheekZonderBezit,
    // S5: Digitaal bezit suggesties
    bool HeeftAccountOverdragenZonderNaam,
    bool HeeftCryptoZonderSeedPhrase,
    bool HeeftAccountZonderActie,
    // Sprint 2: Profiel & Testament uitbreidingen
    BurgerlijkeStaat BurgerlijkeStaat,
    HuwelijksVoorwaarden HuwelijksVoorwaarden,
    DateOnly? DatumHuwelijk,
    DateOnly? LegitimatieGeldigTot,
    // Sprint 3: Wilsverklaring & Donorregistratie
    SuggestieWilsverklaringFact? Wilsverklaring,
    SuggestieDonorFact? Donor);

public record SuggestieErfgenaamFact(
    string VolledigeNaam,
    string? Telefoon,
    string Relatie);

public record SuggestieNoodcontactFact(
    string Naam,
    string? Telefoon,
    string? Rol);

public record SuggestieTestamentFact(
    string? NotarisNaam,
    List<string> BegunstigdeNamen,
    List<string> ExecuteurNamen,
    // Sprint 2: Testament uitbreiding
    DateOnly? DatumTestament,
    bool HeeftCtrNummer);

// Sprint 3: Wilsverklaring & Donorregistratie
public record SuggestieWilsverklaringFact(
    string? VertegenwoordigerNaam,
    string? Vertegenwoordiger2Naam,
    string? HuisartsNaam,
    DateOnly? DatumOndertekening);

public record SuggestieDonorFact(
    string Keuze,
    string? BeslisserNaam,
    bool IsGeregistreerdBijDonorregister);
