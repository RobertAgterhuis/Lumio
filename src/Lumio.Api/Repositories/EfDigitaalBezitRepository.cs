using Lumio.Api.Data;
using Lumio.Api.Domain.DigitalEstate;
using Microsoft.EntityFrameworkCore;

namespace Lumio.Api.Repositories;

public sealed class EfDigitaalBezitRepository : IDigitaalBezitRepository
{
    private readonly LumioDbContext _db;
    public EfDigitaalBezitRepository(LumioDbContext db) => _db = db;

    public async Task<Guid?> GetEigenaarIdAsync() =>
        await _db.Eigenaren.Select(e => (Guid?)e.Id).FirstOrDefaultAsync();

    // DigitaalAccount
    public Task<List<DigitaalAccount>> GetAccountsAsync(Guid eigenaarId) =>
        _db.DigitaleAccounts.Where(a => a.EigenaarId == eigenaarId).ToListAsync();
    public Task<DigitaalAccount?> FindAccountAsync(Guid id) =>
        _db.DigitaleAccounts.FindAsync(id).AsTask();
    public Task AddAsync(DigitaalAccount item)    { _db.DigitaleAccounts.Add(item); return Task.CompletedTask; }
    public Task RemoveAsync(DigitaalAccount item)  { _db.DigitaleAccounts.Remove(item); return Task.CompletedTask; }

    // WachtwoordEntry
    public Task<List<WachtwoordEntry>> GetWachtwoordenAsync(Guid eigenaarId) =>
        _db.Wachtwoorden.Where(w => w.EigenaarId == eigenaarId).ToListAsync();
    public Task<WachtwoordEntry?> FindWachtwoordAsync(Guid id) =>
        _db.Wachtwoorden.FindAsync(id).AsTask();
    public Task AddAsync(WachtwoordEntry item)    { _db.Wachtwoorden.Add(item); return Task.CompletedTask; }
    public Task RemoveAsync(WachtwoordEntry item)  { _db.Wachtwoorden.Remove(item); return Task.CompletedTask; }

    // CryptoWallet
    public Task<List<CryptoWallet>> GetCryptoWalletsAsync(Guid eigenaarId) =>
        _db.CryptoWallets.Where(c => c.EigenaarId == eigenaarId).ToListAsync();
    public Task<CryptoWallet?> FindCryptoWalletAsync(Guid id) =>
        _db.CryptoWallets.FindAsync(id).AsTask();
    public Task AddAsync(CryptoWallet item)    { _db.CryptoWallets.Add(item); return Task.CompletedTask; }
    public Task RemoveAsync(CryptoWallet item)  { _db.CryptoWallets.Remove(item); return Task.CompletedTask; }

    public async Task CommitAsync() => await _db.SaveChangesAsync();
}
