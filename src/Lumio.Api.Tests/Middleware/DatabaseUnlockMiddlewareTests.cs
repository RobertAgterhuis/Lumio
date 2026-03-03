using Lumio.Api.Domain.Common;
using Lumio.Api.Middleware;
using Lumio.Api.Services.Security;
using Microsoft.AspNetCore.Http;

namespace Lumio.Api.Tests.Middleware;

/// <summary>
/// Integration tests for <see cref="DatabaseUnlockMiddleware"/> — SP-1-006 / REC-SEC-005.
///
/// Regression guard for BUG-SHAMIR-001: ensures AllowedPrefixes keeps
/// /api/v1/shamir/reconstrueer-en-ontgrendel accessible so heirs can unlock
/// the vault even before the database is unlocked.
///
/// AC:
/// AC: AllowedPrefixes bevat het Shamir-endpoint en auth-prefixes.
/// AC: Beveiligde endpoints krijgen 423 terug wanneer de DB vergrendeld is.
/// AC: Deze test faalt als een vereist pad uit AllowedPrefixes wordt verwijderd.
/// </summary>
public class DatabaseUnlockMiddlewareTests
{
    // ── AllowedPrefixes contract ──────────────────────────────────────────────
    // These paths MUST be accessible without database unlock.
    // If this test fails, a required path was removed from AllowedPrefixes.
    [Theory]
    [InlineData("/api/v1/shamir/reconstrueer-en-ontgrendel")] // BUG-SHAMIR-001 regression guard
    [InlineData("/api/v1/shamir/drempel")]
    [InlineData("/api/v1/auth/login")]
    [InlineData("/api/v1/profielen")]
    [InlineData("/api/v1/backup/restore")]
    [InlineData("/swagger")]
    public async Task LockedDatabase_AllowedPrefix_PassesThrough(string path)
    {
        // Arrange – DB locked (no profile selected, password not set)
        var nextCalled = false;
        RequestDelegate next = _ => { nextCalled = true; return Task.CompletedTask; };
        var (ctx, mw) = BuildMiddleware(next, path);

        // Act
        await mw.InvokeAsync(ctx, new LockedPasswordService(), new NoProfileService());

        // Assert
        Assert.True(nextCalled,
            $"Path '{path}' must pass through DatabaseUnlockMiddleware even when DB is locked (AllowedPrefixes). " +
            "If this fails, check AllowedPrefixes in DatabaseUnlockMiddleware — see BUG-SHAMIR-001 / REC-SEC-005.");
        Assert.NotEqual(423, ctx.Response.StatusCode);
    }

    [Theory]
    [InlineData("/api/v1/testament")]
    [InlineData("/api/v1/euthanasie")]
    [InlineData("/api/v1/donor")]
    [InlineData("/api/v1/boedel")]
    public async Task LockedDatabase_ProtectedEndpoint_Returns423(string path)
    {
        // Arrange – DB locked (no profile)
        var nextCalled = false;
        RequestDelegate next = _ => { nextCalled = true; return Task.CompletedTask; };
        var (ctx, mw) = BuildMiddleware(next, path);

        // Act
        await mw.InvokeAsync(ctx, new LockedPasswordService(), new NoProfileService());

        // Assert
        Assert.False(nextCalled,
            $"Path '{path}' must NOT pass through when DB is locked and no profile is active.");
        Assert.Equal(423, ctx.Response.StatusCode);
    }

    [Theory]
    [InlineData("/api/v1/shamir/reconstrueer-en-ontgrendel")]
    [InlineData("/api/v1/testament")]
    [InlineData("/api/v1/auth/login")]
    public async Task UnlockedDatabase_AnyPath_PassesThrough(string path)
    {
        // Arrange – DB unlocked, profile active
        var nextCalled = false;
        RequestDelegate next = _ => { nextCalled = true; return Task.CompletedTask; };
        var (ctx, mw) = BuildMiddleware(next, path);

        // Act
        await mw.InvokeAsync(ctx, new UnlockedPasswordService(), new ActiveProfileService());

        // Assert
        Assert.True(nextCalled, $"Path '{path}' must pass through when DB is unlocked and a profile is active.");
    }

    [Fact]
    public async Task NonApiPath_Always_PassesThrough()
    {
        // Static front-end assets and other non-API routes must never be blocked.
        var nextCalled = false;
        RequestDelegate next = _ => { nextCalled = true; return Task.CompletedTask; };
        var (ctx, mw) = BuildMiddleware(next, "/favicon.ico");

        await mw.InvokeAsync(ctx, new LockedPasswordService(), new NoProfileService());

        Assert.True(nextCalled, "Non-API paths must always pass through DatabaseUnlockMiddleware.");
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static (DefaultHttpContext ctx, DatabaseUnlockMiddleware mw) BuildMiddleware(
        RequestDelegate next, string path)
    {
        var ctx = new DefaultHttpContext();
        ctx.Request.Path = path;
        ctx.Response.Body = new MemoryStream();
        var mw = new DatabaseUnlockMiddleware(next);
        return (ctx, mw);
    }

    // ── Service stubs ─────────────────────────────────────────────────────────

    private sealed class LockedPasswordService : IMasterPasswordService
    {
        public bool IsUnlocked => false;
        public bool IsFirstRun => false;
        public bool IsReadOnly => false;
        public string? ActiveDbPath => null;
        public void UsePassword(PasswordConsumer use) => throw new InvalidOperationException("Locked");
        public Task<bool> UnlockAsync(string password) => Task.FromResult(false);
        public Task<bool> VerifyPasswordAsync(string password) => Task.FromResult(false);
        public Task SetupAsync(string password) => Task.CompletedTask;
        public void Lock() { }
        public void SetReadOnly(bool readOnly) { }
        public Task ChangePasswordAsync(string currentPassword, string newPassword) => Task.CompletedTask;
    }

    private sealed class UnlockedPasswordService : IMasterPasswordService
    {
        public bool IsUnlocked => true;
        public bool IsFirstRun => false;
        public bool IsReadOnly => false;
        public string? ActiveDbPath => "/test/lumio.db";
        public void UsePassword(PasswordConsumer use) { }
        public Task<bool> UnlockAsync(string password) => Task.FromResult(true);
        public Task<bool> VerifyPasswordAsync(string password) => Task.FromResult(true);
        public Task SetupAsync(string password) => Task.CompletedTask;
        public void Lock() { }
        public void SetReadOnly(bool readOnly) { }
        public Task ChangePasswordAsync(string currentPassword, string newPassword) => Task.CompletedTask;
    }

    private sealed class NoProfileService : IProfileService
    {
        public Profile? ActiveProfile => null;
        public string? ActiveDbPath => null;
        public string? ActiveSaltPath => null;
        public bool IsFirstRun => true;
        public bool ActiveProfileDbExists => false;
        public List<Profile> GetProfiles() => [];
        public Profile? GetProfile(Guid id) => null;
        public void SelectProfile(Guid profileId) { }
        public void DeselectProfile() { }
        public Profile CreateProfile(string naam, string relatie) => throw new NotImplementedException();
        public void DeleteProfile(Guid profileId) { }
        public void UpdateActiveProfileThumbnail(string? base64Thumbnail) { }
    }

    private sealed class ActiveProfileService : IProfileService
    {
        private static readonly Profile _profile = new() { Id = Guid.NewGuid(), Naam = "Test", Relatie = "Primair" };
        public Profile? ActiveProfile => _profile;
        public string? ActiveDbPath => "/test/lumio.db";
        public string? ActiveSaltPath => "/test/lumio.salt";
        public bool IsFirstRun => false;
        public bool ActiveProfileDbExists => true;
        public List<Profile> GetProfiles() => [_profile];
        public Profile? GetProfile(Guid id) => _profile;
        public void SelectProfile(Guid profileId) { }
        public void DeselectProfile() { }
        public Profile CreateProfile(string naam, string relatie) => _profile;
        public void DeleteProfile(Guid profileId) { }
        public void UpdateActiveProfileThumbnail(string? base64Thumbnail) { }
    }
}
