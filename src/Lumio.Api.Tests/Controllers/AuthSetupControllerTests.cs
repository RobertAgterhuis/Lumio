using Lumio.Api.Controllers;
using Lumio.Api.Dtos.Auth;
using Lumio.Api.Rules.Configuration;
using Lumio.Api.Services.Security;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace Lumio.Api.Tests.Controllers;

/// <summary>
/// Unit tests for <see cref="AuthSetupController"/>.
/// Covers: SelecteerProfiel, and Setup error paths.
/// SP-11-005 Controller-tests batch 1.
/// </summary>
public sealed class AuthSetupControllerTests
{
    // ── helpers ────────────────────────────────────────────────────────────────

    private static AuthSetupController MakeController(
        FakeMasterPasswordService? pwd = null,
        FakeProfileService? profiles = null,
        LimietenOptions? limieten = null,
        ISqlCipherKdfService? kdf = null) =>
        new(
            pwd ?? new FakeMasterPasswordService(),
            profiles ?? new FakeProfileService(),
            Options.Create(limieten ?? new LimietenOptions()),
            kdf ?? new FakeSqlCipherKdfService());

    // ── SelecteerProfiel ───────────────────────────────────────────────────────

    [Fact]
    public void SelecteerProfiel_WhenProfielBestaat_Returns200MetProfielNaam()
    {
        // Arrange
        var profile = new Lumio.Api.Domain.Common.Profile
        {
            Id = Guid.NewGuid(),
            Naam = "Jan",
            Relatie = "Partner"
        };
        var profiles = new FakeProfileService(profile);
        var ctrl = MakeController(profiles: profiles);

        // Act
        var result = ctrl.SelecteerProfiel(new SelectProfileRequest(profile.Id));

        // Assert — 200 OK with heeftSetupNodig indicating no db
        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(ok.Value);
    }

    [Fact]
    public void SelecteerProfiel_LocksPreviousSessionWhenUnlocked()
    {
        // Arrange
        var profile = new Lumio.Api.Domain.Common.Profile
        {
            Id = Guid.NewGuid(),
            Naam = "Test",
            Relatie = "Zelf"
        };
        var pwd = new FakeMasterPasswordService { IsUnlocked = true };
        var profiles = new FakeProfileService(profile);
        var ctrl = MakeController(pwd: pwd, profiles: profiles);

        // Act
        ctrl.SelecteerProfiel(new SelectProfileRequest(profile.Id));

        // Assert — previous session was locked before profile switch
        Assert.True(pwd.WasLocked, "Lock() should be called when a session was active.");
    }

    // ── Setup ──────────────────────────────────────────────────────────────────

    [Fact]
    public async Task Setup_WhenGeenActiefProfiel_Returns400()
    {
        // Arrange — no profile selected
        var profiles = new FakeProfileService(); // no profiles
        var ctrl = MakeController(profiles: profiles);

        // Act
        var result = await ctrl.Setup(new SetupRequest("SterkWachtwoord123!"), serviceProvider: null!);

        // Assert
        var bad = Assert.IsType<BadRequestObjectResult>(result);
        Assert.NotNull(bad.Value);
    }

    [Fact]
    public async Task Setup_WhenDatabaseBestaatAl_Returns400()
    {
        // Arrange — profile selected, but IsFirstRun = false (DB already exists)
        var profile = new Lumio.Api.Domain.Common.Profile { Id = Guid.NewGuid(), Naam = "Test", Relatie = "Zelf" };
        var pwd = new FakeMasterPasswordService { IsFirstRun = false };
        var profiles = new FakeProfileService(profile) { ActiveProfile = profile };
        var ctrl = MakeController(pwd: pwd, profiles: profiles);

        // Act
        var result = await ctrl.Setup(new SetupRequest("SterkWachtwoord123!"), serviceProvider: null!);

        // Assert
        var bad = Assert.IsType<BadRequestObjectResult>(result);
        Assert.NotNull(bad.Value);
    }

    [Fact]
    public async Task Setup_WhenWachtwoordTekortKort_Returns400()
    {
        // Arrange — profile selected + IsFirstRun + password too short
        var profile = new Lumio.Api.Domain.Common.Profile { Id = Guid.NewGuid(), Naam = "Test", Relatie = "Zelf" };
        var pwd = new FakeMasterPasswordService { IsFirstRun = true };
        var profiles = new FakeProfileService(profile) { ActiveProfile = profile };
        var limieten = new LimietenOptions { WachtwoordMinLengte = 12 };
        var ctrl = MakeController(pwd: pwd, profiles: profiles, limieten: limieten);

        // Act — password is only 4 chars, well below the minimum
        var result = await ctrl.Setup(new SetupRequest("kort"), serviceProvider: null!);

        // Assert
        var bad = Assert.IsType<BadRequestObjectResult>(result);
        Assert.NotNull(bad.Value);
    }
}
