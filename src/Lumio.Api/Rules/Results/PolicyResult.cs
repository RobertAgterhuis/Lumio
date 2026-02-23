namespace Lumio.Api.Rules.Results;

/// <summary>
/// Generieke wrapper voor alle business-rule resultaten.
/// Bevat het berekende resultaat, versie-informatie, waarschuwingen en toegepaste regels.
/// </summary>
public record PolicyResult<T>
{
    public required T Resultaat { get; init; }
    public required string RegelVersie { get; init; }
    public DateTime BerekendOp { get; init; } = DateTime.UtcNow;
    public List<string> Waarschuwingen { get; init; } = [];
    public List<string> ToegepasteRegels { get; init; } = [];
}
