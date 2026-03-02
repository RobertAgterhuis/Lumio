using Lumio.Api.Data;
using Lumio.Api.Domain.Common;
using Microsoft.EntityFrameworkCore;

namespace Lumio.Api.Repositories;

public sealed class EfAfhandelingRepository : IAfhandelingRepository
{
    private readonly LumioDbContext _db;
    public EfAfhandelingRepository(LumioDbContext db) => _db = db;

    public Task<List<AfhandelingsItem>> GetAllAsync(string? domein = null)
    {
        var q = _db.AfhandelingsItems.AsQueryable();
        if (!string.IsNullOrWhiteSpace(domein))
            q = q.Where(a => a.Domein == domein);
        return q.OrderBy(a => a.Domein).ThenBy(a => a.AangemaaktOp).ToListAsync();
    }

    public Task<AfhandelingsItem?> FindByIdAsync(Guid id) =>
        _db.AfhandelingsItems.FindAsync(id).AsTask();

    public Task<bool> AnyAsync() =>
        _db.AfhandelingsItems.AnyAsync();

    public Task AddAsync(AfhandelingsItem item) { _db.AfhandelingsItems.Add(item); return Task.CompletedTask; }

    public Task AddRangeAsync(List<AfhandelingsItem> items)
    {
        _db.AfhandelingsItems.AddRange(items);
        return Task.CompletedTask;
    }

    public Task RemoveAsync(AfhandelingsItem item) { _db.AfhandelingsItems.Remove(item); return Task.CompletedTask; }

    public async Task CommitAsync() => await _db.SaveChangesAsync();

    public async Task<AfhandelingBronnenStatus> GetBronnenStatusAsync()
    {
        return new AfhandelingBronnenStatus(
            HeeftNoodcontacten:    await _db.Noodcontacten.AnyAsync(),
            HeeftUitvaartWensen:   await _db.UitvaartWensen.AnyAsync(),
            HeeftDonorRegistratie: await _db.DonorRegistraties.AnyAsync(),
            HeeftWilsverklaring:   await _db.Wilsverklaringen.AnyAsync(),
            HeeftTestament:        await _db.Testamenten.AnyAsync(),
            HeeftErfgenamen:       await _db.Erfgenamen.AnyAsync(),
            HeeftDocumenten:       await _db.Documenten.AnyAsync(),
            HeeftBoedel:           await _db.FysiekeBezittingen.AnyAsync()
                                   || await _db.Bankrekeningen.AnyAsync()
                                   || await _db.Verzekeringen.AnyAsync()
                                   || await _db.Schulden.AnyAsync(),
            HeeftDigitaalBezit:    await _db.DigitaleAccounts.AnyAsync()
                                   || await _db.Wachtwoorden.AnyAsync()
                                   || await _db.CryptoWallets.AnyAsync(),
            HeeftEigenaar:         await _db.Eigenaren.AnyAsync()
        );
    }
}
