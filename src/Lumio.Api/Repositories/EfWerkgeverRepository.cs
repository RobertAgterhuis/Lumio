using Lumio.Api.Data;
using Lumio.Api.Domain.Common;
using Microsoft.EntityFrameworkCore;

namespace Lumio.Api.Repositories;

/// <summary>
/// EF Core implementation of <see cref="IWerkgeverRepository"/>.
/// </summary>
public sealed class EfWerkgeverRepository : IWerkgeverRepository
{
    private readonly LumioDbContext _db;

    public EfWerkgeverRepository(LumioDbContext db) => _db = db;

    public Task<List<Werkgever>> GetAllAsync() =>
        _db.Werkgevers
            .OrderBy(w => w.BedrijfsNaam)
            .ToListAsync();

    public Task<Werkgever?> FindByIdAsync(Guid id) =>
        _db.Werkgevers.FindAsync(id).AsTask();

    public async Task<Guid?> GetEigenaarIdAsync() =>
        (await _db.Eigenaren.Select(e => (Guid?)e.Id).FirstOrDefaultAsync());

    public Task AddAsync(Werkgever item)
    {
        _db.Werkgevers.Add(item);
        return Task.CompletedTask;
    }

    public Task RemoveAsync(Werkgever item)
    {
        _db.Werkgevers.Remove(item);
        return Task.CompletedTask;
    }

    public async Task CommitAsync() =>
        await _db.SaveChangesAsync();
}
