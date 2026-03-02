using Lumio.Api.Data;
using Lumio.Api.Domain.Common;
using Microsoft.EntityFrameworkCore;

namespace Lumio.Api.Repositories;

public sealed class EfStatusDataRepository : IStatusDataRepository
{
    private readonly LumioDbContext _db;
    public EfStatusDataRepository(LumioDbContext db) => _db = db;

    public Task<AuditLogEntry?> FindLatestBackupAsync() =>
        _db.AuditLog
            .Where(a => a.Actie == "Backup")
            .OrderByDescending(a => a.Tijdstip)
            .FirstOrDefaultAsync();

    public async Task BevestigBackupAsync(DateTime tijdstip)
    {
        _db.AuditLog.Add(new AuditLogEntry
        {
            Tijdstip   = tijdstip,
            Actie      = "Backup",
            EntityType = "export",
            Details    = "handmatig",
        });
        await _db.SaveChangesAsync();
    }

    public async Task<StatusSnapshotData> GetSnapshotDataAsync()
    {
        var eigenaar = await _db.Eigenaren.FirstOrDefaultAsync();

        return new StatusSnapshotData
        {
            Eigenaar       = eigenaar,
            Erfgenamen     = eigenaar is null ? null : await _db.Erfgenamen
                                  .OrderBy(e => e.Id)
                                  .Select(e => new { e.Id, e.Voornaam, e.Achternaam, e.GewijzigdOp })
                                  .ToListAsync(),
            Testament      = await _db.Testamenten.Select(t => new { t.Id, t.GewijzigdOp }).FirstOrDefaultAsync(),
            Wilsverklaring = await _db.Wilsverklaringen.Select(w => new { w.Id, w.GewijzigdOp }).FirstOrDefaultAsync(),
            Donor          = await _db.DonorRegistraties.Select(d => new { d.Id, d.GewijzigdOp }).FirstOrDefaultAsync(),
            Uitvaart       = await _db.UitvaartWensen.Select(u => new { u.Id, u.GewijzigdOp }).FirstOrDefaultAsync(),
            Bezittingen    = await _db.FysiekeBezittingen.CountAsync(),
            Bankrekeningen = await _db.Bankrekeningen.CountAsync(),
            Verzekeringen  = await _db.Verzekeringen.CountAsync(),
            Schulden       = await _db.Schulden.CountAsync(),
            Documenten     = await _db.Documenten.CountAsync(),
            DigitaleAccounts = await _db.DigitaleAccounts.CountAsync(),
            Noodcontacten  = await _db.Noodcontacten.CountAsync(),
        };
    }
}
