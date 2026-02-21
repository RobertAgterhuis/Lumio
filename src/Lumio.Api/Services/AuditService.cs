using Lumio.Api.Data;
using Lumio.Api.Domain.Common;

namespace Lumio.Api.Services;

public interface IAuditService
{
    /// <summary>
    /// Log an audit event. Silently fails if DB is not available.
    /// </summary>
    Task LogAsync(string actie, string? entityType = null, Guid? entityId = null, string? details = null);
}

public class AuditService : IAuditService
{
    private readonly IServiceProvider _serviceProvider;

    public AuditService(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public async Task LogAsync(string actie, string? entityType = null, Guid? entityId = null, string? details = null)
    {
        try
        {
            using var scope = _serviceProvider.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<LumioDbContext>();
            db.AuditLog.Add(new AuditLogEntry
            {
                Actie = actie,
                EntityType = entityType,
                EntityId = entityId,
                Details = details
            });
            await db.SaveChangesAsync();
        }
        catch
        {
            // Silently ignore — DB may not be available (locked/not setup)
        }
    }
}
