using Lumio.Api.Data;
using Lumio.Api.Domain.Common;
using Microsoft.EntityFrameworkCore;

namespace Lumio.Api.Repositories;

/// <summary>
/// EF Core implementation of <see cref="INotitieRepository"/>.
/// </summary>
public sealed class EfNotitieRepository : INotitieRepository
{
    private readonly LumioDbContext _db;

    public EfNotitieRepository(LumioDbContext db) => _db = db;

    public Task<List<SectieNotitie>> GetAllForEigenaarAsync(Guid eigenaarId) =>
        _db.SectieNotities
            .Where(n => n.EigenaarId == eigenaarId)
            .OrderBy(n => n.Sectie)
            .ToListAsync();

    public Task<SectieNotitie?> FindBySectieAsync(Guid eigenaarId, string sectie) =>
        _db.SectieNotities
            .FirstOrDefaultAsync(n => n.EigenaarId == eigenaarId && n.Sectie == sectie);

    public Task AddAsync(SectieNotitie notitie)
    {
        _db.SectieNotities.Add(notitie);
        return Task.CompletedTask;
    }

    public Task RemoveAsync(SectieNotitie notitie)
    {
        _db.SectieNotities.Remove(notitie);
        return Task.CompletedTask;
    }

    public async Task CommitAsync() =>
        await _db.SaveChangesAsync();
}
