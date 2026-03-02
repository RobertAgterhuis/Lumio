using Lumio.Api.Data;
using Lumio.Api.Domain.DonorRegistration;
using Microsoft.EntityFrameworkCore;

namespace Lumio.Api.Repositories;

public sealed class EfDonorRepository : IDonorRepository
{
    private readonly LumioDbContext _db;
    public EfDonorRepository(LumioDbContext db) => _db = db;

    public async Task<Guid?> GetEigenaarIdAsync() =>
        await _db.Eigenaren.Select(e => (Guid?)e.Id).FirstOrDefaultAsync();

    public Task<DonorRegistratie?> FindDonorRegistratieAsync() =>
        _db.DonorRegistraties.FirstOrDefaultAsync();

    public Task<OrgaanKeuze?> FindOrgaanKeuzeByIdAsync(Guid id) =>
        _db.OrgaanKeuzes.FindAsync(id).AsTask();

    public Task<List<OrgaanKeuze>> GetAlleOrgaanKeuzesAsync(Guid donorRegistratieId) =>
        _db.OrgaanKeuzes.Where(o => o.DonorRegistratieId == donorRegistratieId).ToListAsync();

    public Task AddAsync(DonorRegistratie item) { _db.DonorRegistraties.Add(item); return Task.CompletedTask; }
    public Task AddOrgaanKeuzeAsync(OrgaanKeuze item) { _db.OrgaanKeuzes.Add(item); return Task.CompletedTask; }
    public Task RemoveOrgaanKeuzeAsync(OrgaanKeuze item) { _db.OrgaanKeuzes.Remove(item); return Task.CompletedTask; }

    public async Task<List<OrgaanKeuze>> BatchUpdateOrgaanKeuzesAsync(Guid donorRegistratieId, List<OrgaanKeuze> keuzes)
    {
        await using var tx = await _db.Database.BeginTransactionAsync();
        try
        {
            var bestaande = _db.OrgaanKeuzes.Where(o => o.DonorRegistratieId == donorRegistratieId);
            _db.OrgaanKeuzes.RemoveRange(bestaande);
            foreach (var k in keuzes)
            {
                k.DonorRegistratieId = donorRegistratieId;
                _db.OrgaanKeuzes.Add(k);
            }
            await _db.SaveChangesAsync();
            await tx.CommitAsync();
            return await _db.OrgaanKeuzes.Where(o => o.DonorRegistratieId == donorRegistratieId).ToListAsync();
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }
    }

    public async Task CommitAsync() => await _db.SaveChangesAsync();
}
