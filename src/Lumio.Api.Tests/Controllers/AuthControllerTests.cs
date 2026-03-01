using Lumio.Api.Controllers;
using Lumio.Api.Domain.Common;
using Lumio.Api.Dtos.Auth;
using Lumio.Api.Rules.Configuration;
using Lumio.Api.Services.Security;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace Lumio.Api.Tests.Controllers;

/// <summary>
/// Unit tests for <see cref="AuthController.VerwijderAccount"/>.
///
/// Focus: AVG Art.17 compliance — verifies that the audit log is written and the re-auth
/// guard behaves correctly before any destructive operation takes place.
/// </summary>
public sealed class AuthControllerTests
{
    // ── helpers ────────────────────────────────────────────────────────────────

    private static AuthController MakeController(
        FakeMasterPasswordService? pwd = null,
        FakeProfileService? profiles = null,
        SpyAuditService? audit = null,
        string env = "Production",
        IBruteForceProtectionService? bruteForce = null) =>
        new(
            pwd ?? new FakeMasterPasswordService(),
            profiles ?? new FakeProfileService(),
            audit ?? new SpyAuditService(),
            Options.Create(new LimietenOptions()),
            new FakeWebHostEnvironment { EnvironmentName = env },
            bruteForce ?? new BruteForceProtectionService());

    private static Profile MakeProfile(string naam = "Test", string relatie = "Partner") =>
        new() { Id = Guid.NewGuid(), Naam = naam, Relatie = relatie };

    // ── VerwijderAccount ────────────────────────────────────────────────────────

    [Fact]
    public async Task VerwijderAccount_WhenDbLocked_Returns423()
    {
        // Arrange
        var pwd = new FakeMasterPasswordService { IsUnlocked = false };
        var ctrl = MakeController(pwd: pwd);

        // Act
        var result = await ctrl.VerwijderAccount(new OntgrendelRequest("any"));

        // Assert
        var statusResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(423, statusResult.StatusCode);
    }

    [Fact]
    public async Task VerwijderAccount_WhenNoActiveProfile_Returns400()
    {
        // Arrange — unlocked but no active profile selected
        var pwd = new FakeMasterPasswordService { IsUnlocked = true };
        var profiles = new FakeProfileService(); // ActiveProfile == null
        var ctrl = MakeController(pwd: pwd, profiles: profiles);

        // Act
        var result = await ctrl.VerwijderAccount(new OntgrendelRequest("any"));

        // Assert
        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task VerwijderAccount_WrongPassword_Returns401_NoAuditNoDelete()
    {
        // Arrange
        var profile = MakeProfile();
        var pwd = new FakeMasterPasswordService { IsUnlocked = true, VerifyResult = false };
        var profiles = new FakeProfileService(profile) { ActiveProfile = profile };
        var audit = new SpyAuditService();
        var ctrl = MakeController(pwd: pwd, profiles: profiles, audit: audit);

        // Act
        var result = await ctrl.VerwijderAccount(new OntgrendelRequest("wrong"));

        // Assert – 401, no audit, profile untouched
        Assert.IsType<UnauthorizedObjectResult>(result);
        Assert.Empty(audit.Calls);                   // no audit on failed re-auth
        Assert.Single(profiles.GetProfiles());       // profile still present
        Assert.False(pwd.WasLocked);                 // DB not locked
    }

    [Fact]
    public async Task VerwijderAccount_CorrectPassword_WritesAuditDeletesProfile_Returns200()
    {
        // Arrange
        var profile = MakeProfile();
        var pwd = new FakeMasterPasswordService { IsUnlocked = true, VerifyResult = true };
        var profiles = new FakeProfileService(profile) { ActiveProfile = profile };
        var audit = new SpyAuditService();
        var ctrl = MakeController(pwd: pwd, profiles: profiles, audit: audit);

        // Act
        var result = await ctrl.VerwijderAccount(new OntgrendelRequest("correct"));

        // Assert – 200 OK
        Assert.IsType<OkObjectResult>(result);

        // AVG Art.17: exactly one audit entry, correct metadata
        var call = Assert.Single(audit.Calls);
        Assert.Equal("Account verwijderd", call.Actie);
        Assert.Equal("Account", call.EntityType);
        Assert.Equal(profile.Id, call.EntityId);
        Assert.Contains("AVG Art.17", call.Details ?? string.Empty);

        // Database locked and profile removed
        Assert.True(pwd.WasLocked);
        Assert.Empty(profiles.GetProfiles());
    }
}
