using Lumio.Api.Data;
using Lumio.Api.Domain.Documents;
using Microsoft.EntityFrameworkCore;

namespace Lumio.Api.Repositories;

public sealed class EfDocumentRepository : IDocumentRepository
{
    private readonly LumioDbContext _db;
    public EfDocumentRepository(LumioDbContext db) => _db = db;

    public Task<List<PersoonlijkDocument>> GetAllAsync() =>
        _db.Documenten
            .OrderBy(d => d.Categorie).ThenBy(d => d.Naam).ThenByDescending(d => d.Versie)
            .ToListAsync();

    public Task<PersoonlijkDocument?> FindByIdAsync(Guid id) =>
        _db.Documenten.FindAsync(id).AsTask();

    public Task<List<PersoonlijkDocument>> GetByGroepAsync(Guid groepId) =>
        _db.Documenten
            .Where(d => d.DocumentGroepId == groepId)
            .OrderByDescending(d => d.Versie)
            .ToListAsync();

    public Task<int> CountByGroepAsync(Guid groepId) =>
        _db.Documenten.CountAsync(d => d.DocumentGroepId == groepId);

    public Task AddAsync(PersoonlijkDocument item) { _db.Documenten.Add(item); return Task.CompletedTask; }
    public Task RemoveAsync(PersoonlijkDocument item) { _db.Documenten.Remove(item); return Task.CompletedTask; }

    public Task RemoveRangeAsync(List<PersoonlijkDocument> items)
    {
        _db.Documenten.RemoveRange(items);
        return Task.CompletedTask;
    }

    public async Task CommitAsync() => await _db.SaveChangesAsync();
}
