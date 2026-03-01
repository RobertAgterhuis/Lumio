using Lumio.Api.Controllers;
using Lumio.Api.Domain.Common;
using Microsoft.AspNetCore.Mvc;

namespace Lumio.Api.Tests.Controllers;

/// <summary>
/// Unit tests for <see cref="ProfileController.Delete"/>.
///
/// Focus: AVG Art.17 compliance — audit is written before delete;
/// active-profile sessions are locked on deletion.
/// </summary>
public sealed class ProfileControllerTests
{
    // ── helpers ────────────────────────────────────────────────────────────────

    private static ProfileController MakeController(
        FakeProfileService? profiles = null,
        SpyAuditService? audit = null) =>
        new(
            profiles ?? new FakeProfileService(),
            audit ?? new SpyAuditService());

    private static Profile MakeProfile(string naam = "Test", string relatie = "Partner") =>
        new() { Id = Guid.NewGuid(), Naam = naam, Relatie = relatie };

    // ── Delete ─────────────────────────────────────────────────────────────────

    [Fact]
    public async Task Delete_ProfileNotFound_Returns404()
    {
        // Arrange — empty service, no matching ID
        var ctrl = MakeController(new FakeProfileService());
        var pwd = new FakeMasterPasswordService { IsUnlocked = true };

        // Act
        var result = await ctrl.Delete(Guid.NewGuid(), pwd);

        // Assert
        Assert.IsType<NotFoundObjectResult>(result);
    }

    [Fact]
    public async Task Delete_WhenDbLocked_Returns423()
    {
        // Arrange — profile exists but DB is locked
        var profile = MakeProfile();
        var ctrl = MakeController(new FakeProfileService(profile));
        var pwd = new FakeMasterPasswordService { IsUnlocked = false };

        // Act
        var result = await ctrl.Delete(profile.Id, pwd);

        // Assert
        var statusResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(423, statusResult.StatusCode);
    }

    [Fact]
    public async Task Delete_NonActiveProfile_WritesAuditAndDeletes_Returns200()
    {
        // Arrange — profile exists but is NOT the active profile
        var profile = MakeProfile();
        var profiles = new FakeProfileService(profile); // ActiveProfile == null
        var audit = new SpyAuditService();
        var ctrl = MakeController(profiles, audit);
        var pwd = new FakeMasterPasswordService { IsUnlocked = true };

        // Act
        var result = await ctrl.Delete(profile.Id, pwd);

        // Assert – 200 OK
        Assert.IsType<OkObjectResult>(result);

        // AVG Art.17: exactly one audit entry, correct metadata
        var call = Assert.Single(audit.Calls);
        Assert.Equal("Profiel verwijderd", call.Actie);
        Assert.Equal("Profiel", call.EntityType);
        Assert.Equal(profile.Id, call.EntityId);
        Assert.Contains("AVG Art.17", call.Details ?? string.Empty);

        // Profile removed; DB NOT locked (was not active profile)
        Assert.Empty(profiles.GetProfiles());
        Assert.False(pwd.WasLocked);
    }

    [Fact]
    public async Task Delete_ActiveProfile_WritesAuditLocksAndDeletes_Returns200()
    {
        // Arrange — profile IS the active profile
        var profile = MakeProfile();
        var profiles = new FakeProfileService(profile) { ActiveProfile = profile };
        var audit = new SpyAuditService();
        var ctrl = MakeController(profiles, audit);
        var pwd = new FakeMasterPasswordService { IsUnlocked = true };

        // Act
        var result = await ctrl.Delete(profile.Id, pwd);

        // Assert – 200 OK
        Assert.IsType<OkObjectResult>(result);

        // AVG Art.17: audit written
        var call = Assert.Single(audit.Calls);
        Assert.Equal("Profiel verwijderd", call.Actie);
        Assert.Equal(profile.Id, call.EntityId);

        // Session locked (active profile deletion must lock)
        Assert.True(pwd.WasLocked);
        Assert.Empty(profiles.GetProfiles());
    }
}
