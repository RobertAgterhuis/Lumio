using Lumio.Api.Data;
using Lumio.Api.Domain.Testament;
using Microsoft.EntityFrameworkCore;

namespace Lumio.Api.Repositories;

public sealed class EfTestamentRepository : ITestamentRepository
{
    private readonly LumioDbContext _db;
    public EfTestamentRepository(LumioDbContext db) => _db = db;

    public Task<TestamentInfo?> FindAsync() =>
        _db.Testamenten.FirstOrDefaultAsync();

    public Task AddAsync(TestamentInfo item) { _db.Testamenten.Add(item); return Task.CompletedTask; }

    public Task AddSnapshotAsync(TestamentSnapshot snapshot)
    {
        _db.TestamentSnapshots.Add(snapshot);
        return Task.CompletedTask;
    }

    public async Task CommitAsync() => await _db.SaveChangesAsync();
}
