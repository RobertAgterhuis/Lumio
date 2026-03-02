using Lumio.Api.Data;
using Lumio.Api.Domain.Common;
using Microsoft.EntityFrameworkCore;

namespace Lumio.Api.Repositories;

/// <summary>
/// EF Core implementation of <see cref="IEigenaarRepository"/>.
/// </summary>
public sealed class EfEigenaarRepository : IEigenaarRepository
{
    private readonly LumioDbContext _db;

    public EfEigenaarRepository(LumioDbContext db) => _db = db;

    public Task<Eigenaar?> FindAsync() =>
        _db.Eigenaren.FirstOrDefaultAsync();

    public Task AddAsync(Eigenaar eigenaar)
    {
        _db.Eigenaren.Add(eigenaar);
        return Task.CompletedTask;
    }

    public async Task CommitAsync() =>
        await _db.SaveChangesAsync();
}
