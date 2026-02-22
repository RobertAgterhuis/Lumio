namespace Lumio.Api.Dtos.AssetRegistry;

public record ErfgenaamToewijzingResponse(
    Guid Id,
    Guid ErfgenaamId,
    string ErfgenaamNaam,
    string EntityType,
    Guid EntityId,
    string EntityNaam,
    string? Instructies);

public record ErfgenaamToewijzingUpsertRequest(
    Guid ErfgenaamId,
    string EntityType,
    Guid EntityId,
    string? Instructies);
