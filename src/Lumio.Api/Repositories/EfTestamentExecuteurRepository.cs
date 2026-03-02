using Lumio.Api.Data;
using Lumio.Api.Domain.Testament;
using Microsoft.EntityFrameworkCore;

namespace Lumio.Api.Repositories;

public sealed class EfTestamentExecuteurRepository : ITestamentExecuteurRepository
{
    private readonly LumioDbContext _db;
    public EfTestamentExecuteurRepository(LumioDbContext db) => _db = db;

    public async Task<Guid?> FindTestamentIdAsync() =>
        await _db.Testamenten.Select(t => (Guid?)t.Id).FirstOrDefaultAsync();

    public Task<List<Executeur>> GetAllByTestamentAsync(Guid testamentId) =>
        _db.Executeurs.Where(e => e.TestamentInfoId == testamentId).ToListAsync();

    public Task<Executeur?> FindByIdAsync(Guid id) =>
        _db.Executeurs.FindAsync(id).AsTask();

    public Task AddAsync(Executeur item)   { _db.Executeurs.Add(item); return Task.CompletedTask; }
    public Task RemoveAsync(Executeur item) { _db.Executeurs.Remove(item); return Task.CompletedTask; }
    public async Task CommitAsync() => await _db.SaveChangesAsync();
}
