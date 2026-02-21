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
    int? ShareIndex,
    bool HeeftShareOntvangen,
    DateTime? ShareUitgegevenOp);

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
    DateOnly? Geboortedatum);
