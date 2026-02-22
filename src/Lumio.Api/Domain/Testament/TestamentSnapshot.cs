using Lumio.Api.Domain.Common;

namespace Lumio.Api.Domain.Testament;

public class TestamentSnapshot : BaseEntity
{
    public Guid TestamentInfoId { get; set; }
    public TestamentInfo TestamentInfo { get; set; } = null!;

    public int Versie { get; set; }
    public DateTime SnapshotDatum { get; set; } = DateTime.UtcNow;
    public string? Notitie { get; set; }

    /// <summary>
    /// JSON-serialisatie van alle testamentvelden + begunstigden op het moment van de snapshot.
    /// </summary>
    public string SnapshotJson { get; set; } = string.Empty;
}
