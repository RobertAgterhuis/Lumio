namespace Lumio.Api.Domain.Common;

/// <summary>
/// Represents a user profile. Each profile has its own encrypted database.
/// Stored in profiles.json (unencrypted manifest), NOT in a database.
/// Maximum 5 profiles per installation.
/// </summary>
public class Profile
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Naam { get; set; } = string.Empty;
    public string Relatie { get; set; } = string.Empty; // "Primair", "Partner", "Kind", "Ouder", "Overig"
    public string DbBestand { get; set; } = string.Empty; // e.g. "{id}.db"
    public DateTime AangemaaktOp { get; set; } = DateTime.UtcNow;
    public bool IsPrimair { get; set; }
}
