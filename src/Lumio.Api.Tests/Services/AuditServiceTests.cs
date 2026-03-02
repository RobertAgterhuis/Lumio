using Lumio.Api.Services;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Lumio.Api.Tests.Services;

/// <summary>
/// Unit tests for <see cref="AuditService"/> — SP-8-R003.
///
/// AC: AuditService.LogAsync logt exceptions als LogWarning (zonder de aanroeper te onderbreken).
/// AC: Tests verifiëren dat de log-call wordt gemist wanneer een exceptie optreedt.
/// </summary>
public class AuditServiceTests
{
    // ── LogAsync — exception path ─────────────────────────────────────────────

    [Fact]
    public async Task LogAsync_WhenDbThrows_LogsWarningAndDoesNotThrow()
    {
        // Arrange: a service provider that raises on any GetRequiredService call
        var sp = new ThrowingServiceProvider();
        var logger = new CapturingLogger<AuditService>();
        var svc = new AuditService(sp, logger);

        // Act — must not throw
        await svc.LogAsync("test-actie", "Profile", Guid.NewGuid(), "details");

        // Assert: exactly one warning logged containing the action name
        var warning = Assert.Single(logger.Warnings);
        Assert.Contains("test-actie", warning.Message);
        Assert.NotNull(warning.Exception);
    }

    [Fact]
    public async Task LogAsync_WhenDbThrows_DoesNotPropagateException()
    {
        var sp = new ThrowingServiceProvider();
        var logger = new CapturingLogger<AuditService>();
        var svc = new AuditService(sp, logger);

        // Must complete without an exception even when the underlying scope throws
        var ex = await Record.ExceptionAsync(() => svc.LogAsync("actie-x"));

        Assert.Null(ex);
    }

    [Fact]
    public async Task LogAsync_WhenDbSucceeds_DoesNotLogWarning()
    {
        // Arrange: working in-memory db context
        var services = new ServiceCollection();
        services.AddSingleton(TestDbFactory.Create());
        // AuditService uses IServiceProvider to resolve LumioDbContext from a scope
        using var sp = services.BuildServiceProvider();
        var logger = new CapturingLogger<AuditService>();
        var svc = new AuditService(sp, logger);

        // Act
        await svc.LogAsync("normaal-gebruik");

        // Assert: no warnings when everything works
        Assert.Empty(logger.Warnings);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /// <summary>
    /// <see cref="IServiceProvider"/> that always throws to simulate an unavailable database.
    /// </summary>
    private sealed class ThrowingServiceProvider : IServiceProvider
    {
        public object? GetService(Type serviceType)
            => throw new InvalidOperationException("Simulated DB unavailable for logging test.");
    }
}
