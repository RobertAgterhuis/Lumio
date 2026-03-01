using Lumio.Api.Middleware;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging.Abstractions;

namespace Lumio.Api.Tests.Middleware;

/// <summary>
/// Unit tests for <see cref="LocalOriginValidationMiddleware"/> — GAP-ARC-01.
///
/// AC: Origin header validatie actief.
/// AC: Geen externe toegang mogelijk in integratie test.
/// </summary>
public class LocalOriginValidationMiddlewareTests
{
    // ── IsAllowedOrigin helper ────────────────────────────────────────────────

    [Theory]
    [InlineData("app://lumio")]
    [InlineData("http://localhost")]
    [InlineData("http://localhost:3000")]
    [InlineData("http://127.0.0.1")]
    [InlineData("http://127.0.0.1:5123")]
    [InlineData("http://[::1]")]
    [InlineData("http://[::1]:5123")]
    [InlineData("file://")]
    [InlineData("https://localhost")]
    public void IsAllowedOrigin_PermittedOrigins_ReturnsTrue(string origin)
    {
        Assert.True(LocalOriginValidationMiddleware.IsAllowedOrigin(origin),
            $"Origin '{origin}' zou toegestaan moeten zijn.");
    }

    [Theory]
    [InlineData("https://evil.com")]
    [InlineData("https://attacker.example.com")]
    [InlineData("http://192.168.1.1")]
    [InlineData("http://10.0.0.1")]
    [InlineData("chrome-extension://abcdef")]
    public void IsAllowedOrigin_BlockedOrigins_ReturnsFalse(string origin)
    {
        Assert.False(LocalOriginValidationMiddleware.IsAllowedOrigin(origin),
            $"Origin '{origin}' zou geblokkeerd moeten zijn.");
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void IsAllowedOrigin_NullOrEmpty_ReturnsTrue(string? origin)
    {
        // No Origin header = local tool / direct request → allowed
        Assert.True(LocalOriginValidationMiddleware.IsAllowedOrigin(origin!));
    }

    // ── Middleware: API requests ──────────────────────────────────────────────

    [Fact]
    public async Task ApiRequest_AllowedOrigin_PassesThrough()
    {
        // Arrange
        var nextCalled = false;
        RequestDelegate next = _ => { nextCalled = true; return Task.CompletedTask; };

        var ctx = BuildContext("/api/auth/status", origin: "http://localhost:3000");
        var mw = BuildMiddleware(next);

        // Act
        await mw.InvokeAsync(ctx);

        // Assert
        Assert.True(nextCalled, "Volgende middleware moet aangeroepen zijn voor een toegestane origin.");
        Assert.NotEqual(403, ctx.Response.StatusCode);
    }

    [Fact]
    public async Task ApiRequest_BlockedOrigin_Returns403()
    {
        var nextCalled = false;
        RequestDelegate next = _ => { nextCalled = true; return Task.CompletedTask; };

        var ctx = BuildContext("/api/auth/ontgrendel", origin: "https://evil.com");
        var mw = BuildMiddleware(next);

        await mw.InvokeAsync(ctx);

        Assert.False(nextCalled, "Volgende middleware mag NIET worden aangeroepen voor een geblokkeerde origin.");
        Assert.Equal(403, ctx.Response.StatusCode);
    }

    [Fact]
    public async Task ApiRequest_NoOriginHeader_PassesThrough()
    {
        var nextCalled = false;
        RequestDelegate next = _ => { nextCalled = true; return Task.CompletedTask; };

        var ctx = BuildContext("/api/auth/status", origin: null);
        var mw = BuildMiddleware(next);

        await mw.InvokeAsync(ctx);

        Assert.True(nextCalled, "Verzoeken zonder Origin header moeten doorgelaten worden.");
    }

    [Fact]
    public async Task NonApiRequest_AnyOrigin_PassesThrough()
    {
        // Non-API routes (e.g. static assets, Swagger UI) are never blocked
        var nextCalled = false;
        RequestDelegate next = _ => { nextCalled = true; return Task.CompletedTask; };

        var ctx = BuildContext("/swagger/index.html", origin: "https://evil.com");
        var mw = BuildMiddleware(next);

        await mw.InvokeAsync(ctx);

        Assert.True(nextCalled, "Niet-API routes mogen nooit worden geblokkeerd.");
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static DefaultHttpContext BuildContext(string path, string? origin)
    {
        var ctx = new DefaultHttpContext();
        ctx.Request.Path = path;
        ctx.Response.Body = new MemoryStream();
        if (origin is not null)
            ctx.Request.Headers["Origin"] = origin;
        return ctx;
    }

    private static LocalOriginValidationMiddleware BuildMiddleware(RequestDelegate next) =>
        new(next, NullLogger<LocalOriginValidationMiddleware>.Instance);
}
