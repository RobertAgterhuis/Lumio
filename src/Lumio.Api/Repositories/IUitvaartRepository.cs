using Lumio.Api.Domain.FuneralWishes;

namespace Lumio.Api.Repositories;

/// <summary>
/// Repository interface for <see cref="UitvaartWensen"/>.
/// Introduced in SP-13-003 — Application Layer fase 2.
/// </summary>
public interface IUitvaartRepository
{
    /// <summary>Returns the single uitvaartwensen record, or <c>null</c> when none exists.</summary>
    Task<UitvaartWensen?> FindAsync();

    /// <summary>Stages uitvaartwensen for insertion (does not save).</summary>
    Task AddAsync(UitvaartWensen uitvaart);

    /// <summary>Persists all pending changes to the database.</summary>
    Task CommitAsync();
}
