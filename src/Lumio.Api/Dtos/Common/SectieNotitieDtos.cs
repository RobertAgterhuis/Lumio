namespace Lumio.Api.Dtos.Common;

public record SectieNotitieResponse(
    Guid Id,
    string Sectie,
    string Inhoud,
    DateTime GewijzigdOp);

public record SectieNotitieUpsertRequest(
    string Inhoud);
