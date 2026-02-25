namespace Lumio.Api.Domain.AssetRegistry;

/// <summary>
/// Bekende verzekering-type waarden die relevant zijn voor de NUV-uitvaartexport.
/// Vergelijking via <see cref="IsNuvType"/> voorkomt verspreide magic strings.
/// </summary>
public static class NuvVerzekeringTypen
{
    public static readonly string[] UitvaartTypen =
    [
        "uitvaartverzekering",
        "uitvaart",
        "begrafenisverzekering",
        "begrafenis",
        "overlijdensverzekering",
        "overlijden",
        "natura uitvaartverzekering",
    ];

    /// <summary>
    /// Returns true when the given type string matches one of the NUV-relevant
    /// insurance types (case-insensitive substring match).
    /// </summary>
    public static bool IsNuvType(string? type)
    {
        if (string.IsNullOrWhiteSpace(type)) return false;
        var lower = type.ToLowerInvariant();
        return Array.Exists(UitvaartTypen, t => lower.Contains(t));
    }
}
