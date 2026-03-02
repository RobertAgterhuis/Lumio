using Lumio.Api.Data;
using Lumio.Api.Domain.FuneralWishes;
using Microsoft.EntityFrameworkCore;

namespace Lumio.Api.Repositories;

/// <summary>
/// EF Core implementation of <see cref="IUitvaartRepository"/>.
/// </summary>
public sealed class EfUitvaartRepository : IUitvaartRepository
{
    private readonly LumioDbContext _db;

    public EfUitvaartRepository(LumioDbContext db) => _db = db;

    public Task<UitvaartWensen?> FindAsync() =>
        _db.UitvaartWensen.FirstOrDefaultAsync();

    public Task AddAsync(UitvaartWensen uitvaart)
    {
        _db.UitvaartWensen.Add(uitvaart);
        return Task.CompletedTask;
    }

    public async Task CommitAsync() =>
        await _db.SaveChangesAsync();
}
