using Lumio.Api.Data;
using Lumio.Api.Domain.AssetRegistry;
using Lumio.Api.Domain.Common;
using Microsoft.EntityFrameworkCore;

namespace Lumio.Api.Repositories;

public sealed class EfToewijzingRepository : IToewijzingRepository
{
    private readonly LumioDbContext _db;
    public EfToewijzingRepository(LumioDbContext db) => _db = db;

    public async Task<Guid?> GetEigenaarIdAsync() =>
        await _db.Eigenaren.Select(e => (Guid?)e.Id).FirstOrDefaultAsync();

    public Task<List<ErfgenaamToewijzing>> GetAllAsync(Guid eigenaarId) =>
        _db.ErfgenaamToewijzingen
            .Include(t => t.Erfgenaam)
            .Where(t => t.EigenaarId == eigenaarId)
            .OrderBy(t => t.Erfgenaam.Achternaam).ThenBy(t => t.Erfgenaam.Voornaam)
            .ToListAsync();

    public Task<List<ErfgenaamToewijzing>> GetByErfgenaamAsync(Guid erfgenaamId) =>
        _db.ErfgenaamToewijzingen
            .Where(t => t.ErfgenaamId == erfgenaamId)
            .ToListAsync();

    public Task<ErfgenaamToewijzing?> FindByIdAsync(Guid id) =>
        _db.ErfgenaamToewijzingen.FindAsync(id).AsTask();

    public Task<ErfgenaamToewijzing?> FindWithErfgenaamByIdAsync(Guid id) =>
        _db.ErfgenaamToewijzingen.Include(t => t.Erfgenaam).FirstOrDefaultAsync(t => t.Id == id);

    public Task<bool> ExistsToewijzingAsync(Guid erfgenaamId, string entityType, Guid entityId) =>
        _db.ErfgenaamToewijzingen.AnyAsync(t =>
            t.ErfgenaamId == erfgenaamId &&
            t.EntityType == entityType &&
            t.EntityId == entityId);

    public Task<Erfgenaam?> FindErfgenaamAsync(Guid erfgenaamId) =>
        _db.Erfgenamen.FindAsync(erfgenaamId).AsTask();

    public Task AddAsync(ErfgenaamToewijzing item) { _db.ErfgenaamToewijzingen.Add(item); return Task.CompletedTask; }
    public Task RemoveAsync(ErfgenaamToewijzing item) { _db.ErfgenaamToewijzingen.Remove(item); return Task.CompletedTask; }
    public async Task CommitAsync() => await _db.SaveChangesAsync();

    public async Task<Dictionary<(string EntityType, Guid EntityId), string>> BuildEntityNameCacheAsync(
        IEnumerable<(string EntityType, Guid EntityId)> entries)
    {
        var cache = new Dictionary<(string, Guid), string>();

        var list = entries.ToList();
        var ids = list.ToLookup(e => e.EntityType.ToLowerInvariant(), e => e.EntityId);

        foreach (var r in await _db.FysiekeBezittingen
            .Where(b => ids["fysiekbezit"].Contains(b.Id))
            .Select(b => new { b.Id, Naam = b.Omschrijving })
            .ToListAsync())
            cache[("FysiekBezit", r.Id)] = r.Naam;

        foreach (var r in await _db.Bankrekeningen
            .Where(b => ids["bankrekening"].Contains(b.Id))
            .Select(b => new { b.Id, Naam = b.BankNaam + " " + b.IBAN })
            .ToListAsync())
            cache[("Bankrekening", r.Id)] = r.Naam;

        foreach (var r in await _db.Verzekeringen
            .Where(v => ids["verzekering"].Contains(v.Id))
            .Select(v => new { v.Id, Naam = v.Verzekeraar })
            .ToListAsync())
            cache[("Verzekering", r.Id)] = r.Naam;

        foreach (var r in await _db.DigitaleAccounts
            .Where(a => ids["digitaalaccount"].Contains(a.Id))
            .Select(a => new { a.Id, Naam = a.PlatformNaam })
            .ToListAsync())
            cache[("DigitaalAccount", r.Id)] = r.Naam;

        foreach (var r in await _db.CryptoWallets
            .Where(c => ids["cryptowallet"].Contains(c.Id))
            .Select(c => new { c.Id, Naam = c.WalletNaam })
            .ToListAsync())
            cache[("CryptoWallet", r.Id)] = r.Naam;

        foreach (var r in await _db.Wachtwoorden
            .Where(w => ids["wachtwoordentry"].Contains(w.Id))
            .Select(w => new { w.Id, Naam = w.Naam })
            .ToListAsync())
            cache[("WachtwoordEntry", r.Id)] = r.Naam;

        foreach (var r in await _db.Documenten
            .Where(d => ids["persoonlijkdocument"].Contains(d.Id))
            .Select(d => new { d.Id, Naam = d.Naam })
            .ToListAsync())
            cache[("PersoonlijkDocument", r.Id)] = r.Naam;

        return cache;
    }
}
