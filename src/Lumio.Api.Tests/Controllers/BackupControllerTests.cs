using Lumio.Api.Controllers;
using Microsoft.AspNetCore.Mvc;

namespace Lumio.Api.Tests.Controllers;

/// <summary>
/// Unit tests for <see cref="BackupController"/> — DownloadBackup endpoint.
/// SP-11-005 Controller-tests batch 1.
/// </summary>
public sealed class BackupControllerTests
{
    // ── helpers ────────────────────────────────────────────────────────────────

    private static BackupController MakeController(
        FakeMasterPasswordService? pwd = null,
        FakeProfileService? profiles = null,
        FakeAuditService? audit = null) =>
        new(
            pwd ?? new FakeMasterPasswordService(),
            profiles ?? new FakeProfileService(),
            audit ?? new FakeAuditService());

    // ── DownloadBackup ─────────────────────────────────────────────────────────

    [Fact]
    public async Task DownloadBackup_WhenDbVergrendeld_Returns423()
    {
        // Arrange
        var pwd = new FakeMasterPasswordService { IsUnlocked = false };
        var ctrl = MakeController(pwd: pwd);

        // Act
        var result = await ctrl.DownloadBackup();

        // Assert — 423 Locked
        var status = Assert.IsType<ObjectResult>(result);
        Assert.Equal(423, status.StatusCode);
    }

    [Fact]
    public async Task DownloadBackup_WhenGeenActiveDatabasePad_Returns404()
    {
        // Arrange — unlocked but no profile/db path available
        var pwd = new FakeMasterPasswordService { IsUnlocked = true };
        var profiles = new FakeProfileService(); // ActiveDbPath = null
        var ctrl = MakeController(pwd: pwd, profiles: profiles);

        // Act
        var result = await ctrl.DownloadBackup();

        // Assert — 404 Not Found
        var notFound = Assert.IsType<NotFoundObjectResult>(result);
        Assert.NotNull(notFound.Value);
    }

    [Fact]
    public async Task DownloadBackup_WhenDbPathNietBestaatOpDisk_Returns404()
    {
        // Arrange — unlocked, db path set but file does not exist on disk
        var pwd = new FakeMasterPasswordService { IsUnlocked = true };
        var profile = new Lumio.Api.Domain.Common.Profile { Id = Guid.NewGuid(), Naam = "Test", Relatie = "Zelf" };
        var profiles = new FakeProfileService(profile) { ActiveProfile = profile };
        // Override ActiveDbPath to a path that does not exist
        var ctrl = new BackupController(pwd, new FakeProfileServiceWithDbPath("/non/existent/lumio.db"), new FakeAuditService());

        // Act
        var result = await ctrl.DownloadBackup();

        // Assert — 404 because the file is missing
        var notFound = Assert.IsType<NotFoundObjectResult>(result);
        Assert.NotNull(notFound.Value);
    }
}

/// <summary>
/// Variant of <see cref="FakeProfileService"/> that exposes a configurable ActiveDbPath.
/// Used to simulate a profile with a specific (possibly non-existent) database path.
/// </summary>
file sealed class FakeProfileServiceWithDbPath : Lumio.Api.Services.Security.IProfileService
{
    private readonly string _dbPath;

    public FakeProfileServiceWithDbPath(string dbPath) => _dbPath = dbPath;

    public Lumio.Api.Domain.Common.Profile? ActiveProfile { get; set; } =
        new() { Id = Guid.NewGuid(), Naam = "Test", Relatie = "Zelf" };

    public string? ActiveDbPath => _dbPath;
    public string? ActiveSaltPath => null;
    public bool IsFirstRun => false;
    public bool ActiveProfileDbExists => false;

    public System.Collections.Generic.List<Lumio.Api.Domain.Common.Profile> GetProfiles() => [];
    public Lumio.Api.Domain.Common.Profile? GetProfile(Guid id) => null;
    public void SelectProfile(Guid profileId) { }
    public void DeselectProfile() => ActiveProfile = null;
    public Lumio.Api.Domain.Common.Profile CreateProfile(string naam, string relatie) =>
        new() { Id = Guid.NewGuid(), Naam = naam, Relatie = relatie };
    public void DeleteProfile(Guid profileId) { }
    public void UpdateActiveProfileThumbnail(string? base64Thumbnail) { }
    public void UpdateShamirDrempel(Guid profileId, int drempel) { }
}
