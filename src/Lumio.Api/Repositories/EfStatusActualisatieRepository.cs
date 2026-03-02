using Lumio.Api.Data;
using Lumio.Api.Domain.Common;
using Microsoft.EntityFrameworkCore;

namespace Lumio.Api.Repositories;

public sealed class EfStatusActualisatieRepository : IStatusActualisatieRepository
{
    private readonly LumioDbContext _db;
    public EfStatusActualisatieRepository(LumioDbContext db) => _db = db;

    public Task<Eigenaar?> FindEigenaarAsync() =>
        _db.Eigenaren.FirstOrDefaultAsync();

    public Task<List<ActualisatieBevestiging>> GetBevestigingenAsync(Guid eigenaarId) =>
        _db.ActualisatieBevestigingen
            .Where(a => a.EigenaarId == eigenaarId)
            .ToListAsync();

    public Task AddAsync(ActualisatieBevestiging item) { _db.ActualisatieBevestigingen.Add(item); return Task.CompletedTask; }

    public Task RemoveByDomeinAsync(Guid eigenaarId, string domein)
    {
        _db.ActualisatieBevestigingen.RemoveRange(
            _db.ActualisatieBevestigingen.Where(a => a.EigenaarId == eigenaarId && a.Domein == domein));
        return Task.CompletedTask;
    }

    public async Task CommitAsync() => await _db.SaveChangesAsync();
}
