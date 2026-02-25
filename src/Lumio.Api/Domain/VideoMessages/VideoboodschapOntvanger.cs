using Lumio.Api.Domain.Common;

namespace Lumio.Api.Domain.VideoMessages;

/// <summary>Links a video message to one specific heir (erfgenaam).</summary>
public class VideoboodschapOntvanger : BaseEntity
{
    public Guid VideoboodschapId { get; set; }
    public Videoboodschap Videoboodschap { get; set; } = null!;

    public Guid ErfgenaamId { get; set; }
}
