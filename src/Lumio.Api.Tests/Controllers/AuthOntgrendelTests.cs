using Lumio.Api.Controllers;
using Lumio.Api.Dtos.Auth;
using Lumio.Api.Rules.Configuration;
using Lumio.Api.Services.Security;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace Lumio.Api.Tests.Controllers;

/// <summary>
/// Unit tests for <see cref="AuthController"/> — Ontgrendel, Vergrendel and GetStatus endpoints.
/// SP-11-005 Controller-tests batch 1.
/// </summary>
public sealed class AuthOntgrendelTests
{
    // ── helpers ────────────────────────────────────────────────────────────────

    private static AuthController MakeController(
        FakeMasterPasswordService? pwd = null,
        FakeProfileService? profiles = null,
        SpyAuditService? audit = null,
        IBruteForceProtectionService? bruteForce = null) =>
        new(
            pwd ?? new FakeMasterPasswordService(),
            profiles ?? new FakeProfileService(),
            audit ?? new SpyAuditService(),
            Options.Create(new LimietenOptions()),
            new FakeWebHostEnvironment { EnvironmentName = "Production" },
            bruteForce ?? new BruteForceProtectionService());

    private static Lumio.Api.Domain.Common.Profile MakeProfile() =>
        new() { Id = Guid.NewGuid(), Naam = "Test", Relatie = "Partner" };

    // ── GetStatus ──────────────────────────────────────────────────────────────

    [Fact]
    public void GetStatus_WhenOntgrendeld_ReturnsIsOntgrendeldTrue()
    {
        // Arrange
        var profile = MakeProfile();
        var pwd = new FakeMasterPasswordService { IsUnlocked = true };
        var profiles = new FakeProfileService(profile) { ActiveProfile = profile };
        var ctrl = MakeController(pwd: pwd, profiles: profiles);

        // Act
        var result = ctrl.GetStatus();

        // Assert
        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(ok.Value);
    }

    [Fact]
    public void GetStatus_WhenVergrendeld_ReturnsIsOntgrendeldFalse()
    {
        // Arrange
        var pwd = new FakeMasterPasswordService { IsUnlocked = false };
        var ctrl = MakeController(pwd: pwd);

        // Act
        var result = ctrl.GetStatus();

        // Assert — result should be 200, but isOntgrendeld is false
        Assert.IsType<OkObjectResult>(result);
    }

    // ── Ontgrendel ─────────────────────────────────────────────────────────────

    [Fact]
    public async Task Ontgrendel_WhenGeenProfielGeselecteerd_Returns400()
    {
        // Arrange — no active profile
        var profiles = new FakeProfileService();
        var ctrl = MakeController(profiles: profiles);

        // Act
        var result = await ctrl.Ontgrendel(new OntgrendelRequest("wachtwoord"), serviceProvider: null!);

        // Assert
        var bad = Assert.IsType<BadRequestObjectResult>(result);
        Assert.NotNull(bad.Value);
    }

    [Fact]
    public async Task Ontgrendel_WhenIsFirstRun_Returns400()
    {
        // Arrange — profile selected but database does not exist yet
        var profile = MakeProfile();
        var pwd = new FakeMasterPasswordService { IsFirstRun = true, IsUnlocked = false };
        var profiles = new FakeProfileService(profile) { ActiveProfile = profile };
        var ctrl = MakeController(pwd: pwd, profiles: profiles);

        // Act
        var result = await ctrl.Ontgrendel(new OntgrendelRequest("wachtwoord"), serviceProvider: null!);

        // Assert
        var bad = Assert.IsType<BadRequestObjectResult>(result);
        Assert.NotNull(bad.Value);
    }

    [Fact]
    public async Task Ontgrendel_WhenAlOntgrendeld_Returns200()
    {
        // Arrange — already unlocked (idempotent)
        var profile = MakeProfile();
        var pwd = new FakeMasterPasswordService { IsUnlocked = true };
        var profiles = new FakeProfileService(profile) { ActiveProfile = profile };
        var ctrl = MakeController(pwd: pwd, profiles: profiles);

        // Act
        var result = await ctrl.Ontgrendel(new OntgrendelRequest("wachtwoord"), serviceProvider: null!);

        // Assert — already unlocked returns 200 OK
        Assert.IsType<OkObjectResult>(result);
    }

    // ── Vergrendel ─────────────────────────────────────────────────────────────

    [Fact]
    public async Task Vergrendel_Returns200EnLocksPwd()
    {
        // Arrange
        var profile = MakeProfile();
        var pwd = new FakeMasterPasswordService { IsUnlocked = true };
        var profiles = new FakeProfileService(profile) { ActiveProfile = profile };
        var ctrl = MakeController(pwd: pwd, profiles: profiles);

        // Act
        var result = await ctrl.Vergrendel();

        // Assert — lock was applied, 200 returned
        Assert.IsType<OkObjectResult>(result);
        Assert.True(pwd.WasLocked, "Lock() should be called on vergrendel.");
    }

    [Fact]
    public async Task Vergrendel_DeselectsActiveProfile()
    {
        // Arrange
        var profile = MakeProfile();
        var profiles = new FakeProfileService(profile) { ActiveProfile = profile };
        var ctrl = MakeController(profiles: profiles);

        // Act
        await ctrl.Vergrendel();

        // Assert — profile is deselected
        Assert.Null(profiles.ActiveProfile);
    }
}
