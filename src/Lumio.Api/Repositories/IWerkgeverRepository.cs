using Lumio.Api.Domain.Common;

namespace Lumio.Api.Repositories;

/// <summary>
/// Repository interface for <see cref="Werkgever"/>.
/// Introduced in SP-14-003 — Application Layer fase 3.
/// </summary>
public interface IWerkgeverRepository
{
    /// <summary>Returns all werkgevers ordered by bedrijfsnaam.</summary>
    Task<List<Werkgever>> GetAllAsync();

    /// <summary>Returns a werkgever by id, or <c>null</c> when not found.</summary>
    Task<Werkgever?> FindByIdAsync(Guid id);

    /// <summary>Returns the eigenaar id, or <c>null</c> when no eigenaar exists.</summary>
    Task<Guid?> GetEigenaarIdAsync();

    /// <summary>Stages the werkgever for insertion (does not save).</summary>
    Task AddAsync(Werkgever item);

    /// <summary>Stages the werkgever for removal (does not save).</summary>
    Task RemoveAsync(Werkgever item);

    /// <summary>Persists all pending changes to the database.</summary>
    Task CommitAsync();
}
