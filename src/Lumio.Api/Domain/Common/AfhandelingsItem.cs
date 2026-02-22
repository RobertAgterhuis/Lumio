namespace Lumio.Api.Domain.Common;

public enum AfhandelingsStatus
{
    Open = 0,
    InBehandeling = 1,
    Afgehandeld = 2
}

/// <summary>
/// Tracks the handling status of an item from the heir's perspective.
/// Heirs can mark domain items (erfgenaam, boedel, documenten, etc.) as handled.
/// </summary>
public class AfhandelingsItem : BaseEntity
{
    /// <summary>
    /// The domain/category being tracked (e.g. "noodcontacten", "uitvaart", "testament", "boedel").
    /// </summary>
    public string Domein { get; set; } = string.Empty;

    /// <summary>
    /// Optional reference to a specific entity ID within the domain.
    /// When null, tracks the domain as a whole.
    /// </summary>
    public Guid? EntityId { get; set; }

    /// <summary>
    /// Optional label describing the specific item being tracked.
    /// </summary>
    public string? Label { get; set; }

    public AfhandelingsStatus Status { get; set; } = AfhandelingsStatus.Open;

    /// <summary>
    /// Optional notes from the heir about the handling of this item.
    /// </summary>
    public string? Notitie { get; set; }

    public DateTime? AfgehandeldOp { get; set; }
}
