using Lumio.Api.Controllers;
using Lumio.Api.Domain.Common;
using Lumio.Api.Repositories;
using Lumio.Api.Rules.Services;
using Microsoft.AspNetCore.Mvc;

namespace Lumio.Api.Tests.Controllers;

/// <summary>
/// Unit tests for <see cref="ErfgenamenController"/> — CRUD endpoints.
/// SP-12-004 Application Layer fase 1: tests use IErfgenaamRepository + IEigenaarRepository fakes.
/// </summary>
public sealed class ErfgenamenControllerTests
{
    // ── helpers ────────────────────────────────────────────────────────────────

    private static ErfgenamenController MakeController(
        FakeErfgenaamRepo? erfRepo = null,
        FakeEigenaarRepoForErfgenamen? eigenaarRepo = null,
        Lumio.Api.Data.LumioDbContext? db = null,
        FakeErfbelastingService? erfbelasting = null,
        FakeAuditService? audit = null)
    {
        return new ErfgenamenController(
            erfRepo ?? new FakeErfgenaamRepo(),
            eigenaarRepo ?? new FakeEigenaarRepoForErfgenamen(),
            db ?? TestDbFactory.Create(),
            erfbelasting ?? new FakeErfbelastingService(),
            audit ?? new FakeAuditService());
    }

    // ── GetAll ─────────────────────────────────────────────────────────────────

    [Fact]
    public async Task GetAll_Returns200MetLeegeLijst_WhenGeenErfgenamen()
    {
        var ctrl = MakeController();

        var result = await ctrl.GetAll();

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var list = Assert.IsType<List<Lumio.Api.Dtos.Common.ErfgenaamResponse>>(ok.Value);
        Assert.Empty(list);
    }

    [Fact]
    public async Task GetAll_Returns200MetErfgenamen_WhenErfgenamenaanwezig()
    {
        var erfgenamen = new List<Erfgenaam>
        {
            NewErfgenaam("Alice", "Bakker"),
            NewErfgenaam("Bob", "Aalbers"),
        };
        var ctrl = MakeController(erfRepo: new FakeErfgenaamRepo(erfgenamen));

        var result = await ctrl.GetAll();

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var list = Assert.IsType<List<Lumio.Api.Dtos.Common.ErfgenaamResponse>>(ok.Value);
        Assert.Equal(2, list.Count);
    }

    // ── GetById ────────────────────────────────────────────────────────────────

    [Fact]
    public async Task GetById_Returns404_WhenNietGevonden()
    {
        var ctrl = MakeController();
        var result = await ctrl.GetById(Guid.NewGuid());
        Assert.IsType<NotFoundResult>(result.Result);
    }

    [Fact]
    public async Task GetById_Returns200_WhenGevonden()
    {
        var id = Guid.NewGuid();
        var erfgenaam = new Erfgenaam { Id = id, Voornaam = "Jan", Achternaam = "Test", Relatie = "Kind", EigenaarId = Guid.NewGuid() };
        var ctrl = MakeController(erfRepo: new FakeErfgenaamRepo(null, erfgenaam));

        var result = await ctrl.GetById(id);

        Assert.IsType<OkObjectResult>(result.Result);
    }

    // ── Create ─────────────────────────────────────────────────────────────────

    [Fact]
    public async Task Create_Returns400_WhenGeenEigenaar()
    {
        // IEigenaarRepository returns null → no eigenaar yet
        var ctrl = MakeController(eigenaarRepo: new FakeEigenaarRepoForErfgenamen(null));

        var result = await ctrl.Create(new Lumio.Api.Dtos.Common.ErfgenaamUpsertRequest(
            "Jan", "Test", null, "Kind", null, null, null, null, null, null, null, LegitimatieSoort.Geen, null, null, null));

        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public async Task Create_Returns201_WhenEigenaarAanwezig()
    {
        var eigenaar = new Eigenaar { Id = Guid.NewGuid(), Voornaam = "E", Achternaam = "E", Geboortedatum = new DateOnly(1970, 1, 1) };
        var ctrl = MakeController(eigenaarRepo: new FakeEigenaarRepoForErfgenamen(eigenaar));

        var result = await ctrl.Create(new Lumio.Api.Dtos.Common.ErfgenaamUpsertRequest(
            "Jan", "Test", null, "Kind", null, null, null, null, null, null, null, LegitimatieSoort.Geen, null, null, null));

        Assert.IsType<CreatedAtActionResult>(result.Result);
    }

    // ── Update ─────────────────────────────────────────────────────────────────

    [Fact]
    public async Task Update_Returns404_WhenNietGevonden()
    {
        var ctrl = MakeController();
        var result = await ctrl.Update(Guid.NewGuid(), new Lumio.Api.Dtos.Common.ErfgenaamUpsertRequest(
            "X", "Y", null, "Kind", null, null, null, null, null, null, null, LegitimatieSoort.Geen, null, null, null));
        Assert.IsType<NotFoundResult>(result.Result);
    }

    [Fact]
    public async Task Update_Returns200_WhenGevonden()
    {
        var id = Guid.NewGuid();
        var erfgenaam = new Erfgenaam { Id = id, Voornaam = "Oud", Achternaam = "Naam", Relatie = "Kind", EigenaarId = Guid.NewGuid() };
        var ctrl = MakeController(erfRepo: new FakeErfgenaamRepo(null, erfgenaam));

        var result = await ctrl.Update(id, new Lumio.Api.Dtos.Common.ErfgenaamUpsertRequest(
            "Nieuw", "Naam", null, "Partner", null, null, null, null, null, null, null, LegitimatieSoort.Geen, null, null, null));

        Assert.IsType<OkObjectResult>(result.Result);
    }

    // ── Delete ─────────────────────────────────────────────────────────────────

    [Fact]
    public async Task Delete_Returns404_WhenNietGevonden()
    {
        var ctrl = MakeController();
        var result = await ctrl.Delete(Guid.NewGuid());
        Assert.IsType<NotFoundResult>(result);
    }

    [Fact]
    public async Task Delete_Returns204_WhenGevonden()
    {
        var id = Guid.NewGuid();
        var erfgenaam = new Erfgenaam { Id = id, Voornaam = "Jan", Achternaam = "Test", Relatie = "Kind", EigenaarId = Guid.NewGuid() };
        var repo = new FakeErfgenaamRepo(null, erfgenaam);
        var ctrl = MakeController(erfRepo: repo);

        var result = await ctrl.Delete(id);

        Assert.IsType<NoContentResult>(result);
        Assert.True(repo.RemoveWasCalled, "RemoveAsync must have been called");
        Assert.True(repo.CommitWasCalled, "CommitAsync must have been called");
    }

    // ── helpers ────────────────────────────────────────────────────────────────

    private static Erfgenaam NewErfgenaam(string voornaam, string achternaam) =>
        new() { Id = Guid.NewGuid(), Voornaam = voornaam, Achternaam = achternaam, Relatie = "Kind", EigenaarId = Guid.NewGuid() };
}

// ── Fakes ───────────────────────────────────────────────────────────────────

/// <summary>Fake <see cref="IErfgenaamRepository"/> for ErfgenamenController unit tests.</summary>
sealed class FakeErfgenaamRepo : IErfgenaamRepository
{
    private readonly List<Erfgenaam> _all;
    private readonly Erfgenaam? _single;

    public bool RemoveWasCalled { get; private set; }
    public bool CommitWasCalled { get; private set; }

    /// <param name="all">Used by GetAllByNameAsync.</param>
    /// <param name="single">Used by FindAsync.</param>
    public FakeErfgenaamRepo(List<Erfgenaam>? all = null, Erfgenaam? single = null)
    {
        _all = all ?? [];
        _single = single;
    }

    public Task<List<Erfgenaam>> GetAllByNameAsync() =>
        Task.FromResult(_all.OrderBy(e => e.Achternaam).ToList());

    public Task<Erfgenaam?> FindAsync(Guid id) =>
        Task.FromResult(_single?.Id == id ? _single : null);

    public Task AddAsync(Erfgenaam erfgenaam) => Task.CompletedTask;

    public Task RemoveAsync(Erfgenaam erfgenaam)
    {
        RemoveWasCalled = true;
        return Task.CompletedTask;
    }

    public Task CommitAsync()
    {
        CommitWasCalled = true;
        return Task.CompletedTask;
    }
}

/// <summary>Fake <see cref="IEigenaarRepository"/> for ErfgenamenController unit tests (distinct name to avoid collision).</summary>
sealed class FakeEigenaarRepoForErfgenamen : IEigenaarRepository
{
    private readonly Eigenaar? _eigenaar;

    public FakeEigenaarRepoForErfgenamen(Eigenaar? eigenaar = null) => _eigenaar = eigenaar;

    public Task<Eigenaar?> FindAsync() => Task.FromResult(_eigenaar);
    public Task AddAsync(Eigenaar eigenaar) => Task.CompletedTask;
    public Task CommitAsync() => Task.CompletedTask;
}

/// <summary>Minimal fake IErfbelastingService used when erfbelasting is not the focus of the test.</summary>
sealed class FakeErfbelastingService : IErfbelastingService
{
    public Lumio.Api.Rules.Results.PolicyResult<Lumio.Api.Rules.Results.ErfbelastingResultaat> Bereken(Lumio.Api.Rules.Facts.ErfbelastingFacts facts) =>
        new()
        {
            Resultaat = new Lumio.Api.Rules.Results.ErfbelastingResultaat([], 0m, 0, "Fake disclaimer"),
            RegelVersie = "test"
        };
}
