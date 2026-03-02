using Lumio.Api.Data;
using Lumio.Api.Domain.VideoMessages;
using Microsoft.EntityFrameworkCore;

namespace Lumio.Api.Repositories;

public sealed class EfVideoboodschapRepository : IVideoboodschapRepository
{
    private readonly LumioDbContext _db;
    public EfVideoboodschapRepository(LumioDbContext db) => _db = db;

    public async Task<Guid?> GetEigenaarIdAsync() =>
        await _db.Eigenaren.Select(e => (Guid?)e.Id).FirstOrDefaultAsync();

    public Task<List<Videoboodschap>> GetAllAsync(Guid eigenaarId) =>
        _db.Videoboodschappen
            .Include(v => v.Ontvangers)
            .Where(v => v.EigenaarId == eigenaarId)
            .OrderByDescending(v => v.AangemaaktOp)
            .ToListAsync();

    public Task<int> CountAsync(Guid eigenaarId) =>
        _db.Videoboodschappen.CountAsync(v => v.EigenaarId == eigenaarId);

    public async Task<long> GetTotaalBytesAsync(Guid eigenaarId) =>
        await _db.Videoboodschappen
            .Where(v => v.EigenaarId == eigenaarId)
            .SumAsync(v => (long?)v.BestandsGrootte) ?? 0;

    public Task<bool> ErfgenaamBestaatAsync(Guid erfgenaamId, Guid eigenaarId) =>
        _db.Erfgenamen.AnyAsync(e => e.Id == erfgenaamId && e.EigenaarId == eigenaarId);

    public Task<Videoboodschap?> FindWithOntvangersByIdAsync(Guid id, Guid eigenaarId) =>
        _db.Videoboodschappen
            .Include(v => v.Ontvangers)
            .FirstOrDefaultAsync(v => v.Id == id && v.EigenaarId == eigenaarId);

    public async Task<VideoboodschapStreamMeta?> FindStreamMetaAsync(Guid id, Guid eigenaarId)
    {
        var meta = await _db.Videoboodschappen
            .Where(v => v.Id == id && v.EigenaarId == eigenaarId)
            .Select(v => new { v.ContentType, v.BestandsPad })
            .FirstOrDefaultAsync();
        return meta is null ? null : new VideoboodschapStreamMeta(meta.BestandsPad, meta.ContentType);
    }

    public async Task<byte[]?> FindBlobAsync(Guid videoboodschapId)
    {
        var blob = await _db.VideoboodschapBlobs
            .Where(b => b.VideoboodschapId == videoboodschapId)
            .Select(b => new { b.Inhoud })
            .FirstOrDefaultAsync();
        return blob?.Inhoud;
    }

    public Task<List<Guid>> GetVideoIdsVoorErfgenaamAsync(Guid erfgenaamId) =>
        _db.VideoboodschapOntvangers
            .Where(o => o.ErfgenaamId == erfgenaamId)
            .Select(o => o.VideoboodschapId)
            .ToListAsync();

    public Task<List<Videoboodschap>> GetByIdsAsync(IEnumerable<Guid> ids)
    {
        var idList = ids.ToList();
        return _db.Videoboodschappen
            .Include(v => v.Ontvangers)
            .Where(v => idList.Contains(v.Id))
            .OrderByDescending(v => v.AangemaaktOp)
            .ToListAsync();
    }

    public async Task<Dictionary<Guid, string?>> LaadOntvangerNamenAsync(IEnumerable<Guid> erfgenaamIds)
    {
        var ids = erfgenaamIds.Distinct().ToList();
        if (ids.Count == 0) return [];
        return await _db.Erfgenamen
            .Where(e => ids.Contains(e.Id))
            .ToDictionaryAsync(
                e => e.Id,
                e => (string?)(string.IsNullOrEmpty(e.Tussenvoegsel)
                    ? $"{e.Voornaam} {e.Achternaam}"
                    : $"{e.Voornaam} {e.Tussenvoegsel} {e.Achternaam}"));
    }

    public Task AddAsync(Videoboodschap item) { _db.Videoboodschappen.Add(item); return Task.CompletedTask; }
    public Task RemoveAsync(Videoboodschap item) { _db.Videoboodschappen.Remove(item); return Task.CompletedTask; }

    public Task RemoveOntvangersByVideoAsync(Guid videoId)
    {
        _db.VideoboodschapOntvangers.RemoveRange(
            _db.VideoboodschapOntvangers.Where(o => o.VideoboodschapId == videoId));
        return Task.CompletedTask;
    }

    public async Task CommitAsync() => await _db.SaveChangesAsync();
}
