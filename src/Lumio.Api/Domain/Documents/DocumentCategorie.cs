namespace Lumio.Api.Domain.Documents;

/// <summary>
/// Type-safe categorisation for <see cref="PersoonlijkDocument"/>.
/// Stored as TEXT (string) via EF Core HasConversion.
/// </summary>
public enum DocumentCategorie
{
    Testament,
    Identiteitsbewijs,
    Akte,
    Verzekeringspolis,
    Medisch,
    Financieel,
    Overig,
}
