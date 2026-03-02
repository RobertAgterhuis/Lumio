using Lumio.Api.Domain.Testament;

namespace Lumio.Api.Repositories;

/// <summary>
/// Repository interface for <see cref="TestamentSnapshot"/>.
/// Introduced in SP-14-003.
/// </summary>
public interface ITestamentSnapshotRepository
{
    Task<List<TestamentSnapshot>> GetAllAsync(Guid testamentId);
    Task<TestamentSnapshot?> FindByIdAsync(Guid id);
    Task<int> GetMaxVersieAsync(Guid testamentId);
    Task AddAsync(TestamentSnapshot item);
    Task RemoveAsync(TestamentSnapshot item);
    Task CommitAsync();
}
