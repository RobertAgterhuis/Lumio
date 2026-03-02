using Lumio.Api.Domain.Common;

namespace Lumio.Api.Repositories;

/// <summary>
/// Repository interface for <see cref="AuditLogEntry"/>.
/// Introduced in SP-14-003.
/// </summary>
public interface IAuditLogRepository
{
    Task<(List<AuditLogEntry> Items, bool HeeftMeer)> GetPagedAsync(
        int limit,
        string? actie = null,
        string? entityType = null,
        DateTime? from = null,
        DateTime? to = null,
        DateTime? before = null);

    Task<AuditLogEntry?> FindLatestByActieAsync(string actie);
    Task AddAsync(AuditLogEntry entry);
    Task CommitAsync();
}
