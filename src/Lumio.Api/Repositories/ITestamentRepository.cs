using Lumio.Api.Domain.Testament;

namespace Lumio.Api.Repositories;

/// <summary>
/// Repository interface for <see cref="TestamentInfo"/>.
/// Introduced in SP-14-003.
/// </summary>
public interface ITestamentRepository
{
    Task<TestamentInfo?> FindAsync();
    Task AddAsync(TestamentInfo item);
    Task AddSnapshotAsync(TestamentSnapshot snapshot);
    Task CommitAsync();
}
