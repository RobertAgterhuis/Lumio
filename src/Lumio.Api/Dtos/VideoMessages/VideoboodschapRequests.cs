namespace Lumio.Api.Dtos.VideoMessages;

/// <summary>Body for PATCH /api/videoboodschappen/{id} — all fields optional.</summary>
public record VideoboodschapUpdateRequest(
    string? Titel,
    string? Beschrijving,
    List<Guid>? OntvangerIds);
