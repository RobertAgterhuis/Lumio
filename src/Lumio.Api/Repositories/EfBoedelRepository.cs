using Lumio.Api.Data;
using Lumio.Api.Domain.AssetRegistry;
using Microsoft.EntityFrameworkCore;

namespace Lumio.Api.Repositories;

public sealed class EfBoedelRepository : IBoedelRepository
{
    private readonly LumioDbContext _db;
    public EfBoedelRepository(LumioDbContext db) => _db = db;

    public async Task<Guid?> GetEigenaarIdAsync() =>
        await _db.Eigenaren.Select(e => (Guid?)e.Id).FirstOrDefaultAsync();

    // FysiekBezit
    public Task<List<FysiekBezit>> GetBezittingenWithNavigationAsync() =>
        _db.FysiekeBezittingen
            .Include(f => f.LinkedSchulden)
            .Include(f => f.BestemdeErfgenaam)
            .OrderBy(f => f.Categorie)
            .ToListAsync();
    public Task<List<FysiekBezit>> GetFysiekeBezittingenAsync(Guid eigenaarId) =>
        _db.FysiekeBezittingen.Where(b => b.EigenaarId == eigenaarId).ToListAsync();
    public Task<FysiekBezit?> FindFysiekBezitAsync(Guid id) =>
        _db.FysiekeBezittingen.FindAsync(id).AsTask();
    public Task<FysiekBezit?> FindBezitWithNavigationAsync(Guid id) =>
        _db.FysiekeBezittingen
            .Include(f => f.LinkedSchulden)
            .Include(f => f.BestemdeErfgenaam)
            .FirstOrDefaultAsync(f => f.Id == id);
    public Task AddAsync(FysiekBezit item)    { _db.FysiekeBezittingen.Add(item); return Task.CompletedTask; }
    public Task RemoveAsync(FysiekBezit item)  { _db.FysiekeBezittingen.Remove(item); return Task.CompletedTask; }

    // Bankrekening
    public Task<List<Bankrekening>> GetBankrekeningenAsync(Guid eigenaarId) =>
        _db.Bankrekeningen.Where(b => b.EigenaarId == eigenaarId).OrderBy(b => b.BankNaam).ToListAsync();
    public Task<Bankrekening?> FindBankrekeningAsync(Guid id) =>
        _db.Bankrekeningen.FindAsync(id).AsTask();
    public Task AddAsync(Bankrekening item)    { _db.Bankrekeningen.Add(item); return Task.CompletedTask; }
    public Task RemoveAsync(Bankrekening item)  { _db.Bankrekeningen.Remove(item); return Task.CompletedTask; }

    // Verzekering
    public Task<List<Verzekering>> GetVerzekeringenAsync(Guid eigenaarId) =>
        _db.Verzekeringen.Where(v => v.EigenaarId == eigenaarId).OrderBy(v => v.Verzekeraar).ToListAsync();
    public Task<Verzekering?> FindVerzekeringAsync(Guid id) =>
        _db.Verzekeringen.FindAsync(id).AsTask();
    public Task AddAsync(Verzekering item)    { _db.Verzekeringen.Add(item); return Task.CompletedTask; }
    public Task RemoveAsync(Verzekering item)  { _db.Verzekeringen.Remove(item); return Task.CompletedTask; }

    // Schuld
    public Task<List<Schuld>> GetSchuldenAsync(Guid eigenaarId) =>
        _db.Schulden.Where(s => s.EigenaarId == eigenaarId).ToListAsync();
    public Task<List<Schuld>> GetSchuldenWithBezitAsync(Guid eigenaarId) =>
        _db.Schulden.Include(s => s.Bezit).Where(s => s.EigenaarId == eigenaarId).OrderBy(s => s.Schuldeiser).ToListAsync();
    public Task<List<Schuld>> GetSchuldenByBezitIdAsync(Guid bezitId) =>
        _db.Schulden.Include(s => s.Bezit).Where(s => s.BezitId == bezitId).OrderBy(s => s.Schuldeiser).ToListAsync();
    public Task<Schuld?> FindSchuldAsync(Guid id) =>
        _db.Schulden.FindAsync(id).AsTask();
    public Task<Schuld?> FindSchuldByIdAndBezitIdAsync(Guid schuldId, Guid bezitId) =>
        _db.Schulden.FirstOrDefaultAsync(s => s.Id == schuldId && s.BezitId == bezitId);
    public Task AddAsync(Schuld item)    { _db.Schulden.Add(item); return Task.CompletedTask; }
    public Task RemoveAsync(Schuld item)  { _db.Schulden.Remove(item); return Task.CompletedTask; }

    public async Task BatchCreateSchuldenAsync(IEnumerable<Schuld> items)
    {
        using var tx = await _db.Database.BeginTransactionAsync();
        _db.Schulden.AddRange(items);
        await _db.SaveChangesAsync();
        await tx.CommitAsync();
    }

    public async Task CommitAsync() => await _db.SaveChangesAsync();
}
