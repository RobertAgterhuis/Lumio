using Lumio.Api.Data;
using Lumio.Api.Domain.EuthanasiaDirective;
using Microsoft.EntityFrameworkCore;

namespace Lumio.Api.Repositories;

/// <summary>
/// EF Core implementation of <see cref="IWilsverklaringRepository"/>.
/// </summary>
public sealed class EfWilsverklaringRepository : IWilsverklaringRepository
{
    private readonly LumioDbContext _db;

    public EfWilsverklaringRepository(LumioDbContext db) => _db = db;

    public Task<WilsverklaringEuthanasie?> FindAsync() =>
        _db.Wilsverklaringen.FirstOrDefaultAsync();

    public Task AddAsync(WilsverklaringEuthanasie wilsverklaring)
    {
        _db.Wilsverklaringen.Add(wilsverklaring);
        return Task.CompletedTask;
    }

    public async Task CommitAsync() =>
        await _db.SaveChangesAsync();
}
