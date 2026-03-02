using Lumio.Api.Data;
using Lumio.Api.Domain.Common;
using Microsoft.EntityFrameworkCore;

namespace Lumio.Api.Repositories;

/// <summary>
/// EF Core implementation of <see cref="INoodcontactRepository"/>.
/// </summary>
public sealed class EfNoodcontactRepository : INoodcontactRepository
{
    private readonly LumioDbContext _db;

    public EfNoodcontactRepository(LumioDbContext db) => _db = db;

    public Task<List<Noodcontact>> GetAllByNameAsync() =>
        _db.Noodcontacten.OrderBy(n => n.Naam).ToListAsync();

    public Task<Noodcontact?> FindByIdAsync(Guid id) =>
        _db.Noodcontacten.FindAsync(id).AsTask();

    public Task<List<Noodcontact>> GetGedeeldByNameAsync() =>
        _db.Noodcontacten.Where(n => n.IsGedeeld).OrderBy(n => n.Naam).ToListAsync();

    public Task AddAsync(Noodcontact noodcontact)
    {
        _db.Noodcontacten.Add(noodcontact);
        return Task.CompletedTask;
    }

    public Task RemoveAsync(Noodcontact noodcontact)
    {
        _db.Noodcontacten.Remove(noodcontact);
        return Task.CompletedTask;
    }

    public async Task CommitAsync() =>
        await _db.SaveChangesAsync();
}
