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
    DateTime? LaatsteActualisatie);
