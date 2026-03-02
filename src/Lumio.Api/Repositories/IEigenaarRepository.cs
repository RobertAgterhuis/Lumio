using Lumio.Api.Domain.Common;

namespace Lumio.Api.Repositories;

/// <summary>
/// Repository interface for <see cref="Eigenaar"/>.
/// Introduced in SP-12-004 — Application Layer fase 1.
/// </summary>
public interface IEigenaarRepository
{
    /// <summary>Returns the single eigenaar, or <c>null</c> when none exists.</summary>
    Task<Eigenaar?> FindAsync();

    /// <summary>Stages the eigenaar for insertion (does not save).</summary>
    Task AddAsync(Eigenaar eigenaar);

    /// <summary>Persists all pending changes to the database.</summary>
    Task CommitAsync();
}
