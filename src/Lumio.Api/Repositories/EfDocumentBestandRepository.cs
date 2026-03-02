using Lumio.Api.Data;
using Lumio.Api.Domain.Documents;
using Microsoft.EntityFrameworkCore;

namespace Lumio.Api.Repositories;

public sealed class EfDocumentBestandRepository : IDocumentBestandRepository
{
    private readonly LumioDbContext _db;
    public EfDocumentBestandRepository(LumioDbContext db) => _db = db;

    public async Task<Guid?> GetEigenaarIdAsync() =>
        await _db.Eigenaren.Select(e => (Guid?)e.Id).FirstOrDefaultAsync();

    public Task<PersoonlijkDocument?> FindByIdAsync(Guid id) =>
        _db.Documenten.FindAsync(id).AsTask();

    public Task<PersoonlijkDocument?> FindLatestByNaamAsync(string naam, Guid eigenaarId) =>
        _db.Documenten
            .Where(d => d.Naam == naam && d.EigenaarId == eigenaarId)
            .OrderByDescending(d => d.Versie)
            .FirstOrDefaultAsync();

    public Task<int> GetAantalVersiesAsync(Guid documentGroepId) =>
        _db.Documenten.CountAsync(d => d.DocumentGroepId == documentGroepId);

    public Task AddAsync(PersoonlijkDocument item) { _db.Documenten.Add(item); return Task.CompletedTask; }
    public async Task CommitAsync() => await _db.SaveChangesAsync();
}
