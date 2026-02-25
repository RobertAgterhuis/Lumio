namespace Lumio.Api.Domain.VideoMessages;

/// <summary>
/// Holds the raw binary content of a video message in a dedicated table.
/// Kept separate from <see cref="Videoboodschap"/> so that list queries
/// never load video bytes into memory.
/// </summary>
public class VideoboodschapBlob
{
    /// <summary>Primary key — same value as the owning Videoboodschap.Id.</summary>
    public Guid VideoboodschapId { get; set; }

    public byte[] Inhoud { get; set; } = [];
}
