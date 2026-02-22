namespace Lumio.Api.Dtos.Auth;

public record ProfileResponse(
    Guid Id,
    string Naam,
    string Relatie,
    bool IsPrimair,
    DateTime AangemaaktOp);

public record CreateProfileRequest(string Naam, string Relatie);

public record SelectProfileRequest(Guid ProfielId);
