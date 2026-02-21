namespace Lumio.Api.Dtos.Common;

public record NoodcontactResponse(
    Guid Id,
    string Naam,
    string Relatie,
    string? Telefoon,
    string? Email,
    string? Adres,
    string? Postcode,
    string? Woonplaats,
    string Rol,
    string? Instructies);

public record NoodcontactUpsertRequest(
    string Naam,
    string Relatie,
    string? Telefoon,
    string? Email,
    string? Adres,
    string? Postcode,
    string? Woonplaats,
    string Rol,
    string? Instructies);
