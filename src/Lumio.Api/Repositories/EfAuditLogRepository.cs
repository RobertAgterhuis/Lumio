using Lumio.Api.Data;
using Lumio.Api.Domain.Common;
using Microsoft.EntityFrameworkCore;

namespace Lumio.Api.Repositories;

public sealed class EfAuditLogRepository : IAuditLogRepository
{
    private readonly LumioDbContext _db;
    public EfAuditLogRepository(LumioDbContext db) => _db = db;

    public async Task<(List<AuditLogEntry> Items, bool HeeftMeer)> GetPagedAsync(
        int limit,
        string? actie = null,
        string? entityType = null,
        DateTime? from = null,
        DateTime? to = null,
        DateTime? before = null)
    {
        var query = _db.AuditLog.AsQueryable();

        if (!string.IsNullOrWhiteSpace(actie))
            query = query.Where(a => a.Actie == actie);
        if (!string.IsNullOrWhiteSpace(entityType))
            query = query.Where(a => a.EntityType == entityType);
        if (from.HasValue)
            query = query.Where(a => a.Tijdstip >= from.Value.ToUniversalTime());
        if (to.HasValue)
            query = query.Where(a => a.Tijdstip <= to.Value.ToUniversalTime());
        if (before.HasValue)
            query = query.Where(a => a.Tijdstip < before.Value.ToUniversalTime());

        query = query.OrderByDescending(a => a.Tijdstip);

        var raw = await query.Take(limit + 1).ToListAsync();
        var heeftMeer = raw.Count > limit;
        return (heeftMeer ? raw.Take(limit).ToList() : raw, heeftMeer);
    }

    public Task<AuditLogEntry?> FindLatestByActieAsync(string actie) =>
        _db.AuditLog
            .Where(a => a.Actie == actie)
            .OrderByDescending(a => a.Tijdstip)
            .FirstOrDefaultAsync();

    public Task AddAsync(AuditLogEntry entry) { _db.AuditLog.Add(entry); return Task.CompletedTask; }
    public async Task CommitAsync() => await _db.SaveChangesAsync();
}
