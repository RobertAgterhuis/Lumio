using Lumio.Api.Data;
using Lumio.Api.Domain.Common;
using Microsoft.Extensions.Logging;

namespace Lumio.Api.Services;

public interface IAuditService
{
    /// <summary>
    /// Log an audit event. Fails gracefully (LogWarning) if DB is not available.
    /// </summary>
    Task LogAsync(string actie, string? entityType = null, Guid? entityId = null, string? details = null);
}

public class AuditService : IAuditService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<AuditService> _logger;

    public AuditService(IServiceProvider serviceProvider, ILogger<AuditService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
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
        catch (Exception ex)
        {
            // DB may be locked or not yet set up — log for observability, never re-throw.
            _logger.LogWarning(ex, "AuditService.LogAsync mislukt (actie={Actie})", actie);
        }
    }
}
