namespace Lumio.Api.Rules.Facts;

/// <summary>
/// Feiten voor het genereren van meldingen en waarschuwingen.
/// </summary>
public record MeldingFacts(
    bool HeeftEigenaar,
    bool HeeftTestament,
    bool HeeftWilsverklaring,
    bool HeeftDonor,
    bool HeeftUitvaart,
    bool HeeftErfgenamen,
    bool HeeftNoodcontacten,
    bool HeeftDocumenten,
    DateTime? LaatsteBackupTijdstip,
    int ErfgenamenTotaal,
    bool ErfgenamenMetSleutel,
    List<string> VerlopenDocumenten,
    List<string> BijnaVerlopenDocumenten,
    DateTime? LaatsteActualisatie,
    // S5: Testament
    int AantalTestamentBegunstigden,
    bool HeeftTestamentSnapshot,
    DateTime? TestamentAangemaaktOp,
    // S5: Wilsverklaring
    bool WilsverklaringIsVerouderd,
    bool HeeftWilsverklaringVertegenwoordiger,
    bool WilEuthanasie,
    bool HeeftBehandelVerbod,
    // S5: Donor
    string? DonorKeuze,
    bool HeeftDonorOrgaankeuzes,
    string? DonorBeslisserNaam,
    // S5: Boedel / Digitaal bezit
    bool HeeftBoedel,
    bool HeeftDigitaalBezit,
    // S5: Eigenaar legitimatie
    bool HeeftLegitimatie,
    bool LegitimatieIsVerlopen,
    bool LegitimatieIsBijnaVerlopen,
    bool HeeftLegitimatieZonderVervaldatum,
    // S5: Uitvaart
    string? UitvaartVoorkeurType,
    string? UitvaartBegraafplaats,
    bool UitvaartIsVerouderd,
    bool HeeftUitvaartVerzekering,
    bool HeeftUitvaartVerzekeringDetails,
    bool HeeftCeremonieDetails,
    // S5: Shamir
    DateTime? ShamirOudsteDatumShareUitgegeven,
    // S6: Legitimaire portie schending
    bool HeeftLegitimairePortieSchending,
    // S6: Tijdlijn bezoek
    bool HeeftTijdlijnGezien);
