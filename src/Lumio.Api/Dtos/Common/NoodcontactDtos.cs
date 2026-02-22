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
    string? Instructies,
    bool IsGedeeld);

public record NoodcontactUpsertRequest(
    string Naam,
    string Relatie,
    string? Telefoon,
    string? Email,
    string? Adres,
    string? Postcode,
    string? Woonplaats,
    string Rol,
    string? Instructies,
    bool IsGedeeld = false);

/// <summary>
/// Lightweight record for exporting/importing shared contacts between profiles.
/// </summary>
public record GedeeldNoodcontactDto(
    string Naam,
    string Relatie,
    string? Telefoon,
    string? Email,
    string? Adres,
    string? Postcode,
    string? Woonplaats,
    string Rol,
    string? Instructies);
