using Lumio.Api.Domain.Common;

namespace Lumio.Api.Repositories;

/// <summary>
/// Repository interface for <see cref="Erfgenaam"/>.
/// Introduced in SP-12-004 — Application Layer fase 1.
/// </summary>
public interface IErfgenaamRepository
{
    /// <summary>Returns all erfgenamen sorted by Achternaam ascending.</summary>
    Task<List<Erfgenaam>> GetAllByNameAsync();

    /// <summary>Finds an erfgenaam by primary key, or returns <c>null</c>.</summary>
    Task<Erfgenaam?> FindAsync(Guid id);

    /// <summary>Stages the erfgenaam for insertion (does not save).</summary>
    Task AddAsync(Erfgenaam erfgenaam);

    /// <summary>
    /// Stages the erfgenaam and all linked <c>ErfgenaamToewijzingen</c> for deletion (does not save).
    /// S3-34: cascade-deletes toewijzingen before removing the erfgenaam itself.
    /// </summary>
    Task RemoveAsync(Erfgenaam erfgenaam);

    /// <summary>Persists all pending changes to the database.</summary>
    Task CommitAsync();
}
