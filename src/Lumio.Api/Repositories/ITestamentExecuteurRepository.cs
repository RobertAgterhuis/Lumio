using Lumio.Api.Domain.Testament;

namespace Lumio.Api.Repositories;

/// <summary>
/// Repository interface for <see cref="Executeur"/> (testament executors).
/// Introduced in SP-14-003.
/// </summary>
public interface ITestamentExecuteurRepository
{
    Task<Guid?> FindTestamentIdAsync();
    Task<List<Executeur>> GetAllByTestamentAsync(Guid testamentId);
    Task<Executeur?> FindByIdAsync(Guid id);
    Task AddAsync(Executeur item);
    Task RemoveAsync(Executeur item);
    Task CommitAsync();
}
