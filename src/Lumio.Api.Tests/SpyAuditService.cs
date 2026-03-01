using Lumio.Api.Services;

namespace Lumio.Api.Tests;

/// <summary>
/// Tracking fake for <see cref="IAuditService"/> — records every LogAsync call for assertion.
/// </summary>
public sealed class SpyAuditService : IAuditService
{
    public record AuditCall(string Actie, string? EntityType, Guid? EntityId, string? Details);

    public List<AuditCall> Calls { get; } = [];

    public Task LogAsync(string actie, string? entityType = null, Guid? entityId = null, string? details = null)
    {
        Calls.Add(new AuditCall(actie, entityType, entityId, details));
        return Task.CompletedTask;
    }
}
