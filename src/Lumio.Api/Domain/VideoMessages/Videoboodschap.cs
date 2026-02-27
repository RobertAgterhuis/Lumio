using Lumio.Api.Domain.Common;

namespace Lumio.Api.Domain.VideoMessages;

public class Videoboodschap : BaseEntity
{
    public Guid EigenaarId { get; set; }

    public string Titel { get; set; } = string.Empty;
    public string? Beschrijving { get; set; }

    /// <summary>Original filename as uploaded or recorded.</summary>
    public string BestandsNaam { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long BestandsGrootte { get; set; }

    /// <summary>Duration in seconds; null when not known at upload time.</summary>
    public int? DuurSeconden { get; set; }

    /// <summary>Heirs this video is addressed to.</summary>
    public List<VideoboodschapOntvanger> Ontvangers { get; set; } = [];

    /// <summary>The binary content — stored in a separate table to keep metadata queries lean.</summary>
    public VideoboodschapBlob? Blob { get; set; }

    /// <summary>
    /// Absolute path to the video file on disk (new uploads).
    /// Null for legacy records whose binary content is in <see cref="Blob"/>.
    /// </summary>
    public string? BestandsPad { get; set; }
}
