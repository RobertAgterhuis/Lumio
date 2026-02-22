using Lumio.Api.Domain.Common;

namespace Lumio.Api.Dtos.Common;

public record ErfgenaamResponse(
    Guid Id,
    string Voornaam,
    string Achternaam,
    string? Tussenvoegsel,
    string Relatie,
    string? Telefoon,
    string? Email,
    string? Adres,
    string? Postcode,
    string? Woonplaats,
    DateOnly? Geboortedatum,
    string? BSN,
    int? ShareIndex,
    bool HeeftShareOntvangen,
    DateTime? ShareUitgegevenOp,
    LegitimatieSoort LegitimatieSoort,
    string? LegitimatieNummer,
    DateOnly? LegitimatieDatumAfgifte,
    DateOnly? LegitimatieGeldigTot);

public record ErfgenaamUpsertRequest(
    string Voornaam,
    string Achternaam,
    string? Tussenvoegsel,
    string Relatie,
    string? Telefoon,
    string? Email,
    string? Adres,
    string? Postcode,
    string? Woonplaats,
    DateOnly? Geboortedatum,
    string? BSN,
    LegitimatieSoort LegitimatieSoort,
    string? LegitimatieNummer,
    DateOnly? LegitimatieDatumAfgifte,
    DateOnly? LegitimatieGeldigTot);
