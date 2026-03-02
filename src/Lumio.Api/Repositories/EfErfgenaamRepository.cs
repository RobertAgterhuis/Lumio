using Lumio.Api.Data;
using Lumio.Api.Domain.Common;
using Microsoft.EntityFrameworkCore;

namespace Lumio.Api.Repositories;

/// <summary>
/// EF Core implementation of <see cref="IErfgenaamRepository"/>.
/// </summary>
public sealed class EfErfgenaamRepository : IErfgenaamRepository
{
    private readonly LumioDbContext _db;

    public EfErfgenaamRepository(LumioDbContext db) => _db = db;

    public Task<List<Erfgenaam>> GetAllByNameAsync() =>
        _db.Erfgenamen.OrderBy(e => e.Achternaam).ToListAsync();

    public async Task<Erfgenaam?> FindAsync(Guid id) =>
        await _db.Erfgenamen.FindAsync(id);

    public Task AddAsync(Erfgenaam erfgenaam)
    {
        _db.Erfgenamen.Add(erfgenaam);
        return Task.CompletedTask;
    }

    public async Task RemoveAsync(Erfgenaam erfgenaam)
    {
        // S3-34: cascade-delete gekoppelde toewijzingen first
        var toewijzingen = await _db.ErfgenaamToewijzingen
            .Where(t => t.ErfgenaamId == erfgenaam.Id)
            .ToListAsync();
        _db.ErfgenaamToewijzingen.RemoveRange(toewijzingen);
        _db.Erfgenamen.Remove(erfgenaam);
    }

    public async Task CommitAsync() =>
        await _db.SaveChangesAsync();
}
