namespace Lumio.Api.Dtos.Common;

public record AfhandelingsItemDto(
    Guid Id,
    string Domein,
    Guid? EntityId,
    string? Label,
    string Status,
    string? Notitie,
    DateTime? AfgehandeldOp,
    DateTime AangemaaktOp,
    DateTime GewijzigdOp
);

public record AfhandelingsItemCreateRequest(
    string Domein,
    Guid? EntityId,
    string? Label,
    string? Notitie
);

public record AfhandelingsItemUpdateRequest(
    string Status,
    string? Notitie
);
