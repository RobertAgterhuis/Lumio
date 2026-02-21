namespace Lumio.Api.Dtos.Common;

public record EigenaarResponse(
    Guid Id,
    string Voornaam,
    string Achternaam,
    string? Tussenvoegsel,
    DateOnly Geboortedatum,
    string? BSN,
    string? Adres,
    string? Postcode,
    string? Woonplaats,
    string? Telefoon,
    string? Email,
    string? Notaris,
    string? NotarisKantoor,
    DateTime AangemaaktOp,
    DateTime GewijzigdOp);

public record EigenaarUpsertRequest(
    string Voornaam,
    string Achternaam,
    string? Tussenvoegsel,
    DateOnly Geboortedatum,
    string? BSN,
    string? Adres,
    string? Postcode,
    string? Woonplaats,
    string? Telefoon,
    string? Email,
    string? Notaris,
    string? NotarisKantoor);
