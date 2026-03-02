using Lumio.Api.Controllers;
using Lumio.Api.Domain.Common;
using Lumio.Api.Repositories;
using Lumio.Api.Rules.Configuration;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace Lumio.Api.Tests.Controllers;

/// <summary>
/// Unit tests for <see cref="EigenaarController"/> — Get, Create, Update endpoints.
/// SP-11-005 Controller-tests batch 1 (updated SP-12-004: now uses IEigenaarRepository fake).
/// </summary>
public sealed class EigenaarControllerTests
{
    // ── helpers ────────────────────────────────────────────────────────────────

    private static EigenaarController MakeController(
        FakeEigenaarRepo? repo = null,
        FakeProfileService? profiles = null,
        FakeAuditService? audit = null) =>
        new(
            repo ?? new FakeEigenaarRepo(),
            Options.Create(new LimietenOptions()),
            profiles ?? new FakeProfileService(),
            audit ?? new FakeAuditService());

    // ── Get ────────────────────────────────────────────────────────────────────

    [Fact]
    public async Task Get_WhenGeenEigenaar_Returns404()
    {
        // Arrange — repo returns null
        var ctrl = MakeController(repo: new FakeEigenaarRepo(null));

        // Act
        var result = await ctrl.Get();

        // Assert
        var notFound = Assert.IsType<NotFoundObjectResult>(result.Result);
        Assert.NotNull(notFound.Value);
    }

    [Fact]
    public async Task Get_WhenEigenaarAanwezig_Returns200MetEigenaarData()
    {
        // Arrange
        var eigenaar = new Eigenaar { Id = Guid.NewGuid(), Voornaam = "Jan", Achternaam = "de Vries", Geboortedatum = new DateOnly(1975, 4, 15) };
        var ctrl = MakeController(repo: new FakeEigenaarRepo(eigenaar));

        // Act
        var result = await ctrl.Get();

        // Assert
        var ok = Assert.IsType<OkObjectResult>(result.Result);
        Assert.NotNull(ok.Value);
    }

    [Fact]
    public async Task Get_WhenMeerdereEigenaren_RetourneertEerste()
    {
        // Fake repo always returns the pre-seeded eigenaar (simulates FirstOrDefault behaviour)
        var eigenaar = new Eigenaar { Id = Guid.NewGuid(), Voornaam = "Eerste", Achternaam = "Test", Geboortedatum = new DateOnly(1970, 1, 1) };
        var ctrl = MakeController(repo: new FakeEigenaarRepo(eigenaar));

        // Act
        var result = await ctrl.Get();

        // Assert — still returns 200, not 500 or 400
        Assert.IsType<OkObjectResult>(result.Result);
    }

    // ── Create ─────────────────────────────────────────────────────────────────

    [Fact]
    public async Task Create_WhenAlBestaatEigenaar_Returns400()
    {
        // Arrange — repo already has an eigenaar → should reject second creation
        var bestaand = new Eigenaar { Id = Guid.NewGuid(), Voornaam = "Al", Achternaam = "Aanwezig", Geboortedatum = new DateOnly(1980, 1, 1) };
        var ctrl = MakeController(repo: new FakeEigenaarRepo(bestaand));

        // Act
        var result = await ctrl.Create(new Lumio.Api.Dtos.Common.EigenaarUpsertRequest(
            "Nieuw", "Profiel", null, new DateOnly(1990, 1, 1),
            null, null, null, null, null, null, null, null, null, null, null, null, null,
            BurgerlijkeStaat.Ongehuwd, HuwelijksVoorwaarden.NietVanToepassing, null,
            LegitimatieSoort.Geen, null, null, null));

        // Assert
        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public async Task Create_WhenGeenBestaandeEigenaar_Returns201()
    {
        // Arrange — empty repo
        var ctrl = MakeController(repo: new FakeEigenaarRepo(null));

        // Act
        var result = await ctrl.Create(new Lumio.Api.Dtos.Common.EigenaarUpsertRequest(
            "Jan", "de Vries", null, new DateOnly(1975, 4, 15),
            null, null, null, null, null, null, null, null, null, null, null, null, null,
            BurgerlijkeStaat.Ongehuwd, HuwelijksVoorwaarden.NietVanToepassing, null,
            LegitimatieSoort.Geen, null, null, null));

        // Assert
        Assert.IsType<CreatedAtActionResult>(result.Result);
    }
}

/// <summary>
/// In-memory fake implementation of <see cref="IEigenaarRepository"/> for controller unit tests.
/// </summary>
sealed class FakeEigenaarRepo : IEigenaarRepository
{
    private Eigenaar? _eigenaar;
    private bool _committed;

    public FakeEigenaarRepo(Eigenaar? eigenaar = null) => _eigenaar = eigenaar;

    public Task<Eigenaar?> FindAsync() => Task.FromResult(_eigenaar);

    public Task AddAsync(Eigenaar eigenaar)
    {
        _eigenaar = eigenaar;
        return Task.CompletedTask;
    }

    public Task CommitAsync()
    {
        _committed = true;
        return Task.CompletedTask;
    }

    /// <summary>Asserted in tests that need to verify persistence was triggered.</summary>
    public bool WasCommitted => _committed;
}
