using Lumio.Api.Domain.Testament;

namespace Lumio.Api.Repositories;

/// <summary>
/// Repository interface for <see cref="Begunstigde"/> (testament beneficiaries).
/// Introduced in SP-14-003 — Application Layer fase 3.
/// </summary>
public interface ITestamentBegunstigdeRepository
{
    /// <summary>Returns the testament id, or <c>null</c> when none exists.</summary>
    Task<Guid?> FindTestamentIdAsync();

    /// <summary>Returns all begunstigden linked to the given testament.</summary>
    Task<List<Begunstigde>> GetAllByTestamentAsync(Guid testamentId);

    /// <summary>Returns a begunstigde by id, or <c>null</c> when not found.</summary>
    Task<Begunstigde?> FindByIdAsync(Guid id);

    /// <summary>Stages the begunstigde for insertion (does not save).</summary>
    Task AddAsync(Begunstigde item);

    /// <summary>Stages the begunstigde for removal (does not save).</summary>
    Task RemoveAsync(Begunstigde item);

    /// <summary>Persists all pending changes to the database.</summary>
    Task CommitAsync();
}
