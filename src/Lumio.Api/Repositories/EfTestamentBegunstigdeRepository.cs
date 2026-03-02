using Lumio.Api.Data;
using Lumio.Api.Domain.Testament;
using Microsoft.EntityFrameworkCore;

namespace Lumio.Api.Repositories;

/// <summary>EF Core implementation of <see cref="ITestamentBegunstigdeRepository"/>.</summary>
public sealed class EfTestamentBegunstigdeRepository : ITestamentBegunstigdeRepository
{
    private readonly LumioDbContext _db;
    public EfTestamentBegunstigdeRepository(LumioDbContext db) => _db = db;

    public async Task<Guid?> FindTestamentIdAsync() =>
        await _db.Testamenten.Select(t => (Guid?)t.Id).FirstOrDefaultAsync();

    public Task<List<Begunstigde>> GetAllByTestamentAsync(Guid testamentId) =>
        _db.Begunstigden.Where(b => b.TestamentInfoId == testamentId).ToListAsync();

    public Task<Begunstigde?> FindByIdAsync(Guid id) =>
        _db.Begunstigden.FindAsync(id).AsTask();

    public Task AddAsync(Begunstigde item)   { _db.Begunstigden.Add(item); return Task.CompletedTask; }
    public Task RemoveAsync(Begunstigde item) { _db.Begunstigden.Remove(item); return Task.CompletedTask; }
    public async Task CommitAsync() => await _db.SaveChangesAsync();
}
