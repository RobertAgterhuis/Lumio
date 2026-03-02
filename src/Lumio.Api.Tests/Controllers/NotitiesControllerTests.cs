using Lumio.Api.Controllers;
using Lumio.Api.Domain.Common;
using Lumio.Api.Dtos.Common;
using Lumio.Api.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace Lumio.Api.Tests.Controllers;

/// <summary>
/// Unit tests for <see cref="NotitiesController"/> — GetAll, GetBySectie, Upsert, Delete endpoints.
/// SP-13-003 Application Layer fase 2.
/// </summary>
public sealed class NotitiesControllerTests
{
    // ── helpers ────────────────────────────────────────────────────────────────

    private static readonly Eigenaar DefaultEigenaar = new()
    {
        Id = Guid.NewGuid(), Voornaam = "Jan", Achternaam = "Test",
        Geboortedatum = new DateOnly(1970, 1, 1)
    };

    private static NotitiesController MakeController(
        FakeNotitieRepo? notitieRepo = null,
        FakeEigenaarRepoForNotities? eigenaarRepo = null) =>
        new(
            notitieRepo ?? new FakeNotitieRepo(),
            eigenaarRepo ?? new FakeEigenaarRepoForNotities(DefaultEigenaar));

    private static SectieNotitie NewNotitie(Guid eigenaarId, string sectie = "Algemeen") =>
        new() { Id = Guid.NewGuid(), EigenaarId = eigenaarId, Sectie = sectie, Inhoud = "Test inhoud" };

    // ── GetAll ─────────────────────────────────────────────────────────────────

    [Fact]
    public async Task GetAll_Returns404_WhenGeenEigenaar()
    {
        var ctrl = MakeController(eigenaarRepo: new FakeEigenaarRepoForNotities(null));

        var result = await ctrl.GetAll();

        Assert.IsType<NotFoundObjectResult>(result.Result);
    }

    [Fact]
    public async Task GetAll_Returns200MetLeegeLijst_WhenGeenNotities()
    {
        var ctrl = MakeController();

        var result = await ctrl.GetAll();

        var ok = Assert.IsType<ActionResult<List<SectieNotitieResponse>>>(result);
        Assert.NotNull(ok.Value);
    }

    [Fact]
    public async Task GetAll_Returns200MetNotities_WhenNotitiesAanwezig()
    {
        var notities = new List<SectieNotitie>
        {
            NewNotitie(DefaultEigenaar.Id, "Medisch"),
            NewNotitie(DefaultEigenaar.Id, "Financieel"),
        };
        var ctrl = MakeController(notitieRepo: new FakeNotitieRepo(all: notities));

        var result = await ctrl.GetAll();

        var list = Assert.IsType<List<SectieNotitieResponse>>(result.Value);
        Assert.Equal(2, list.Count);
    }

    // ── GetBySectie ────────────────────────────────────────────────────────────

    [Fact]
    public async Task GetBySectie_ReturnsDefaultResponse_WhenGeenEigenaar()
    {
        var ctrl = MakeController(eigenaarRepo: new FakeEigenaarRepoForNotities(null));

        var result = await ctrl.GetBySectie("Medisch");

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var response = Assert.IsType<SectieNotitieResponse>(ok.Value);
        Assert.Equal(Guid.Empty, response.Id);
    }

    [Fact]
    public async Task GetBySectie_ReturnsDefaultResponse_WhenSectieNietBestaat()
    {
        var ctrl = MakeController(); // no notities in repo

        var result = await ctrl.GetBySectie("Medisch");

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var response = Assert.IsType<SectieNotitieResponse>(ok.Value);
        Assert.Equal(Guid.Empty, response.Id);
    }

    [Fact]
    public async Task GetBySectie_ReturnsNotitie_WhenGevonden()
    {
        var notitie = NewNotitie(DefaultEigenaar.Id, "Medisch");
        var ctrl = MakeController(notitieRepo: new FakeNotitieRepo(bySectie: notitie));

        var result = await ctrl.GetBySectie("Medisch");

        // Controller returns `notitie.Adapt<SectieNotitieResponse>()` directly → result.Value not result.Result
        var response = Assert.IsType<SectieNotitieResponse>(result.Value);
        Assert.Equal("Medisch", response.Sectie);
    }

    // ── Upsert ─────────────────────────────────────────────────────────────────

    [Fact]
    public async Task Upsert_Returns404_WhenGeenEigenaar()
    {
        var ctrl = MakeController(eigenaarRepo: new FakeEigenaarRepoForNotities(null));

        var result = await ctrl.Upsert("Medisch", new SectieNotitieUpsertRequest("Tekst"));

        Assert.IsType<NotFoundObjectResult>(result.Result);
    }

    [Fact]
    public async Task Upsert_MaaktNieuweNotitie_WhenNietBestaand()
    {
        var repo = new FakeNotitieRepo(); // returns null for FindBySectie
        var ctrl = MakeController(notitieRepo: repo);

        var result = await ctrl.Upsert("Medisch", new SectieNotitieUpsertRequest("Nieuwe inhoud"));

        Assert.IsType<SectieNotitieResponse>(result.Value);
        Assert.True(repo.WasCommitted);
    }

    [Fact]
    public async Task Upsert_UpdatetBestaandeNotitie_WhenAlBestaand()
    {
        var notitie = NewNotitie(DefaultEigenaar.Id, "Medisch");
        var repo = new FakeNotitieRepo(bySectie: notitie);
        var ctrl = MakeController(notitieRepo: repo);

        var result = await ctrl.Upsert("Medisch", new SectieNotitieUpsertRequest("Bijgewerkte inhoud"));

        Assert.IsType<SectieNotitieResponse>(result.Value);
        Assert.Equal("Bijgewerkte inhoud", notitie.Inhoud);
        Assert.True(repo.WasCommitted);
    }

    // ── Delete ─────────────────────────────────────────────────────────────────

    [Fact]
    public async Task Delete_Returns404_WhenGeenEigenaar()
    {
        var ctrl = MakeController(eigenaarRepo: new FakeEigenaarRepoForNotities(null));

        var result = await ctrl.Delete("Medisch");

        Assert.IsType<NotFoundObjectResult>(result);
    }

    [Fact]
    public async Task Delete_Returns404_WhenNotitieNietGevonden()
    {
        var ctrl = MakeController(); // repo returns null for FindBySectie

        var result = await ctrl.Delete("Medisch");

        Assert.IsType<NotFoundResult>(result);
    }

    [Fact]
    public async Task Delete_Returns204_WhenSucces()
    {
        var notitie = NewNotitie(DefaultEigenaar.Id, "Medisch");
        var repo = new FakeNotitieRepo(bySectie: notitie);
        var ctrl = MakeController(notitieRepo: repo);

        var result = await ctrl.Delete("Medisch");

        Assert.IsType<NoContentResult>(result);
        Assert.True(repo.WasCommitted);
    }
}

// ── Fakes ──────────────────────────────────────────────────────────────────────

sealed class FakeNotitieRepo : INotitieRepository
{
    private readonly List<SectieNotitie> _all;
    private readonly SectieNotitie? _bySectie;
    private bool _committed;

    public FakeNotitieRepo(List<SectieNotitie>? all = null, SectieNotitie? bySectie = null)
    {
        _all = all ?? new List<SectieNotitie>();
        _bySectie = bySectie;
    }

    public Task<List<SectieNotitie>> GetAllForEigenaarAsync(Guid eigenaarId) => Task.FromResult(_all);
    public Task<SectieNotitie?> FindBySectieAsync(Guid eigenaarId, string sectie) => Task.FromResult(_bySectie);
    public Task AddAsync(SectieNotitie notitie) { _all.Add(notitie); return Task.CompletedTask; }
    public Task RemoveAsync(SectieNotitie notitie) { _all.Remove(notitie); return Task.CompletedTask; }
    public Task CommitAsync() { _committed = true; return Task.CompletedTask; }

    public bool WasCommitted => _committed;
}

sealed class FakeEigenaarRepoForNotities : IEigenaarRepository
{
    private Eigenaar? _eigenaar;
    public FakeEigenaarRepoForNotities(Eigenaar? eigenaar = null) => _eigenaar = eigenaar;
    public Task<Eigenaar?> FindAsync() => Task.FromResult(_eigenaar);
    public Task AddAsync(Eigenaar eigenaar) { _eigenaar = eigenaar; return Task.CompletedTask; }
    public Task CommitAsync() => Task.CompletedTask;
}
