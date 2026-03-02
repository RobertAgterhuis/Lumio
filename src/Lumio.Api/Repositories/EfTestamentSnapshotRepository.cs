using Lumio.Api.Data;
using Lumio.Api.Domain.Testament;
using Microsoft.EntityFrameworkCore;

namespace Lumio.Api.Repositories;

public sealed class EfTestamentSnapshotRepository : ITestamentSnapshotRepository
{
    private readonly LumioDbContext _db;
    public EfTestamentSnapshotRepository(LumioDbContext db) => _db = db;

    public Task<List<TestamentSnapshot>> GetAllAsync(Guid testamentId) =>
        _db.TestamentSnapshots
            .Where(s => s.TestamentInfoId == testamentId)
            .OrderByDescending(s => s.Versie)
            .ToListAsync();

    public Task<TestamentSnapshot?> FindByIdAsync(Guid id) =>
        _db.TestamentSnapshots.FindAsync(id).AsTask();

    public async Task<int> GetMaxVersieAsync(Guid testamentId) =>
        await _db.TestamentSnapshots
            .Where(s => s.TestamentInfoId == testamentId)
            .MaxAsync(s => (int?)s.Versie) ?? 0;

    public Task AddAsync(TestamentSnapshot item)    { _db.TestamentSnapshots.Add(item); return Task.CompletedTask; }
    public Task RemoveAsync(TestamentSnapshot item)  { _db.TestamentSnapshots.Remove(item); return Task.CompletedTask; }
    public async Task CommitAsync() => await _db.SaveChangesAsync();
}
