using Lumio.Api.Domain.EuthanasiaDirective;

namespace Lumio.Api.Repositories;

/// <summary>
/// Repository interface for <see cref="WilsverklaringEuthanasie"/>.
/// Introduced in SP-13-003 — Application Layer fase 2.
/// </summary>
public interface IWilsverklaringRepository
{
    /// <summary>Returns the single wilsverklaring, or <c>null</c> when none exists.</summary>
    Task<WilsverklaringEuthanasie?> FindAsync();

    /// <summary>Stages the wilsverklaring for insertion (does not save).</summary>
    Task AddAsync(WilsverklaringEuthanasie wilsverklaring);

    /// <summary>Persists all pending changes to the database.</summary>
    Task CommitAsync();
}
