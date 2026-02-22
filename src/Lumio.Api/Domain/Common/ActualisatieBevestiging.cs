namespace Lumio.Api.Domain.Common;

/// <summary>
/// Tracks when the user last confirmed a specific domain's data is up-to-date.
/// </summary>
public class ActualisatieBevestiging : BaseEntity
{
    public Guid EigenaarId { get; set; }
    public string Domein { get; set; } = string.Empty;
    public DateTime BevestigdOp { get; set; } = DateTime.UtcNow;
}
