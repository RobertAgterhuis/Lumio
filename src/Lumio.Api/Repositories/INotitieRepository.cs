using Lumio.Api.Domain.Common;

namespace Lumio.Api.Repositories;

/// <summary>
/// Repository interface for <see cref="SectieNotitie"/>.
/// Introduced in SP-13-003 — Application Layer fase 2.
/// </summary>
public interface INotitieRepository
{
    /// <summary>Returns all notities for an eigenaar ordered by sectie.</summary>
    Task<List<SectieNotitie>> GetAllForEigenaarAsync(Guid eigenaarId);

    /// <summary>Returns the notitie for a specific sectie, or <c>null</c>.</summary>
    Task<SectieNotitie?> FindBySectieAsync(Guid eigenaarId, string sectie);

    /// <summary>Stages a notitie for insertion (does not save).</summary>
    Task AddAsync(SectieNotitie notitie);

    /// <summary>Stages a notitie for removal (does not save).</summary>
    Task RemoveAsync(SectieNotitie notitie);

    /// <summary>Persists all pending changes to the database.</summary>
    Task CommitAsync();
}
