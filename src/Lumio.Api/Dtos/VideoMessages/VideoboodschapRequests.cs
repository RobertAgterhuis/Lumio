using System.ComponentModel.DataAnnotations;

namespace Lumio.Api.Dtos.VideoMessages;

/// <summary>Body for PATCH /api/videoboodschappen/{id} — all fields optional.</summary>
public record VideoboodschapUpdateRequest(
    string? Titel,
    string? Beschrijving,
    List<Guid>? OntvangerIds);

/// <summary>
/// Multipart form model for POST /api/v1/videoboodschappen/uploaden.
/// Wrapper class required so Swashbuckle can generate the IFormFile schema.
/// </summary>
public class VideoboodschapUploadRequest
{
    [Required]
    public IFormFile Bestand { get; set; } = null!;

    [Required]
    public string Titel { get; set; } = string.Empty;

    public string? Beschrijving { get; set; }

    /// <summary>JSON-encoded array of erfgenaam Guid values.</summary>
    public string? OntvangerIds { get; set; }

    public int? DuurSeconden { get; set; }
}
