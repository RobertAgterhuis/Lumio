using Lumio.Api.Controllers;
using Lumio.Api.Dtos.Shamir;
using Lumio.Api.Rules.Configuration;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace Lumio.Api.Tests.Controllers;

/// <summary>
/// Unit tests for <see cref="ShamirController"/> — Genereer, Reconstrueer and GetDrempel endpoints.
/// SP-11-005 Controller-tests batch 1.
/// </summary>
public sealed class ShamirControllerTests
{
    // ── helpers ────────────────────────────────────────────────────────────────

    private static ShamirController MakeController(
        Lumio.Api.Services.Security.IShamirService? shamir = null,
        FakeMasterPasswordService? pwd = null,
        LimietenOptions? limieten = null)
    {
        var db = TestDbFactory.Create();
        return new ShamirController(
            shamir ?? new FakeShamirService(),            pwd ?? new FakeMasterPasswordService(),
            db,
            Options.Create(limieten ?? new LimietenOptions()));
    }

    // ── Genereer — validatie ───────────────────────────────────────────────────

    [Fact]
    public async Task Genereer_WhenDrempelTeLaag_Returns400()
    {
        // Arrange — drempel = 1, ShamirMinDrempel defaults to 2
        var ctrl = MakeController();

        // Act
        var result = await ctrl.Genereer(new GenereerSharesRequest("pwd", AantalDelen: 3, Drempel: 1));

        // Assert
        var bad = Assert.IsType<BadRequestObjectResult>(result.Result);
        Assert.NotNull(bad.Value);
    }

    [Fact]
    public async Task Genereer_WhenAantalDelenOnderDrempel_Returns400()
    {
        // Arrange — aantalDelen(2) < drempel(3)
        var ctrl = MakeController();

        // Act
        var result = await ctrl.Genereer(new GenereerSharesRequest("pwd", AantalDelen: 2, Drempel: 3));

        // Assert
        var bad = Assert.IsType<BadRequestObjectResult>(result.Result);
        Assert.NotNull(bad.Value);
    }

    [Fact]
    public async Task Genereer_WhenWachtwoordOngeldig_Returns401()
    {
        // Arrange — UnlockAsync returns false
        var pwd = new FakeMasterPasswordService { UnlockResult = false };
        var ctrl = MakeController(pwd: pwd);

        // Act
        var result = await ctrl.Genereer(new GenereerSharesRequest("fout", AantalDelen: 3, Drempel: 2));

        // Assert
        Assert.IsType<UnauthorizedObjectResult>(result.Result);
    }

    // ── Reconstrueer ───────────────────────────────────────────────────────────

    [Fact]
    public void Reconstrueer_WhenSharesGeldig_Returns200MetSucces()
    {
        // Arrange
        var shamir = new FakeShamirService();
        var ctrl = MakeController(shamir: shamir);

        // Act
        var result = ctrl.Reconstrueer(new ReconstrueerRequest(["share-1", "share-2"]));

        // Assert
        Assert.IsType<OkObjectResult>(result);
    }

    [Fact]
    public void Reconstrueer_WhenReconstructThrows_Returns400()
    {
        // Arrange — shamir throws on invalid shares
        var shamir = new ThrowingShamirService();
        var ctrl = MakeController(shamir: shamir);

        // Act
        var result = ctrl.Reconstrueer(new ReconstrueerRequest(["invalid"]));

        // Assert
        Assert.IsType<BadRequestObjectResult>(result);
    }

    // ── GetDrempel ─────────────────────────────────────────────────────────────

    [Fact]
    public async Task GetDrempel_WhenGeenEigenaar_ReturnsConfigMinDrempel()
    {
        // Arrange — empty DB, limieten.ShamirMinDrempel = 2 (default)
        var ctrl = MakeController();

        // Act
        var result = await ctrl.GetDrempel();

        // Assert — returns the configured minimum
        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(ok.Value);
    }
}

/// <summary>Helper that throws on ReconstructSecret to test the Reconstrueer error path.</summary>
file sealed class ThrowingShamirService : Lumio.Api.Services.Security.IShamirService
{
    public Lumio.Api.Services.Security.ShamirResult GenerateShares(string secret, int totalShares, int threshold) =>
        throw new InvalidOperationException("should not be called");

    public string ReconstructSecret(System.Collections.Generic.IEnumerable<string> shares) =>
        throw new InvalidOperationException("Invalid shares.");
}
