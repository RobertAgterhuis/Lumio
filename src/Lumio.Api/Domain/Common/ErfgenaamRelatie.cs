using System.ComponentModel.DataAnnotations.Schema;

namespace Lumio.Api.Domain.Common;

/// <summary>
/// Type-safe relationship classification for <see cref="Erfgenaam"/>.
/// Stored as the original Dutch string in the database (see <see cref="ErfgenaamRelatieHelper"/>).
/// The domain field <see cref="Erfgenaam.Relatie"/> remains a plain string for Mapster/DTO
/// compatibility; use <see cref="Erfgenaam.RelatieEnum"/> for typed access.
/// </summary>
public enum ErfgenaamRelatie
{
    Partner,
    Kind,
    Ouder,
    /// <summary>Stored as "Broer/Zus".</summary>
    BroerZus,
    Kleinkind,
    /// <summary>Stored as "Neef/Nicht".</summary>
    NeefNicht,
    Vriend,
    Organisatie,
    Anders,
}

/// <summary>
/// Converts between <see cref="ErfgenaamRelatie"/> enum values and the Dutch strings
/// stored in the database and used in API responses.
/// </summary>
public static class ErfgenaamRelatieHelper
{
    private static readonly Dictionary<ErfgenaamRelatie, string> ToStorage = new()
    {
        [ErfgenaamRelatie.BroerZus] = "Broer/Zus",
        [ErfgenaamRelatie.NeefNicht] = "Neef/Nicht",
    };

    private static readonly Dictionary<string, ErfgenaamRelatie> FromStorage;

    static ErfgenaamRelatieHelper()
    {
        FromStorage = Enum.GetValues<ErfgenaamRelatie>()
            .ToDictionary(
                e => ToStorage.TryGetValue(e, out var v) ? v : e.ToString(),
                e => e,
                StringComparer.OrdinalIgnoreCase);
    }

    public static string Serialize(ErfgenaamRelatie relatie)
        => ToStorage.TryGetValue(relatie, out var v) ? v : relatie.ToString();

    public static ErfgenaamRelatie Deserialize(string? value)
        => !string.IsNullOrWhiteSpace(value) && FromStorage.TryGetValue(value, out var r)
            ? r
            : ErfgenaamRelatie.Anders;
}
