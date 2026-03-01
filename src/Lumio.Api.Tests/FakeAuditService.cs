using Lumio.Api.Services;

namespace Lumio.Api.Tests;

/// <summary>No-op IAuditService for unit tests — discards all log calls.</summary>
public sealed class FakeAuditService : IAuditService
{
    public Task LogAsync(string actie, string? entityType = null, Guid? entityId = null, string? details = null)
        => Task.CompletedTask;
}
