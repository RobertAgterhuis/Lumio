using Lumio.Api.Controllers;
using Lumio.Api.Domain.Common;
using Lumio.Api.Domain.EuthanasiaDirective;
using Lumio.Api.Dtos.EuthanasiaDirective;
using Lumio.Api.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace Lumio.Api.Tests.Controllers;

/// <summary>
/// Unit tests for <see cref="EuthanasieController"/> — Get, Upsert, Voorwaarden endpoints.
/// SP-13-003 Application Layer fase 2.
/// EF-dependent Voorwaarden tests use TestDbFactory.
/// </summary>
public sealed class EuthanasieControllerTests
{
    // ── helpers ────────────────────────────────────────────────────────────────

    private static readonly Eigenaar DefaultEigenaar = new()
    {
        Id = Guid.NewGuid(), Voornaam = "Jan", Achternaam = "Test",
        Geboortedatum = new DateOnly(1970, 1, 1)
    };

    private static EuthanasieController MakeController(
        FakeWilsverklaringRepo? wilsRepo = null,
        FakeEigenaarRepoForEuthanasie? eigenaarRepo = null,
        Lumio.Api.Data.LumioDbContext? db = null) =>
        new(
            wilsRepo ?? new FakeWilsverklaringRepo(),
            eigenaarRepo ?? new FakeEigenaarRepoForEuthanasie(DefaultEigenaar),
            db ?? TestDbFactory.Create());

    private static WilsverklaringUpsertRequest MinimalRequest() =>
        new(null, false, null, null, null, null, null, null, null, null, null, null, null, null, null, false, null, null, null, null, null, null, null, null);

    // ── Get ────────────────────────────────────────────────────────────────────

    [Fact]
    public async Task Get_Returns404_WhenGeenWilsverklaring()
    {
        var ctrl = MakeController(wilsRepo: new FakeWilsverklaringRepo(null));

        var result = await ctrl.Get();

        Assert.IsType<NotFoundResult>(result.Result);
    }

    [Fact]
    public async Task Get_Returns200_WhenWilsverklaringAanwezig()
    {
        var wilsverklaring = new WilsverklaringEuthanasie { Id = Guid.NewGuid(), EigenaarId = DefaultEigenaar.Id };
        var ctrl = MakeController(wilsRepo: new FakeWilsverklaringRepo(wilsverklaring));

        var result = await ctrl.Get();

        Assert.IsType<OkObjectResult>(result.Result);
    }

    // ── Upsert ─────────────────────────────────────────────────────────────────

    [Fact]
    public async Task Upsert_Returns400_WhenGeenEigenaar()
    {
        var ctrl = MakeController(eigenaarRepo: new FakeEigenaarRepoForEuthanasie(null));

        var result = await ctrl.Upsert(MinimalRequest());

        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public async Task Upsert_MaaktNieuweWilsverklaring_WhenNietBestaand()
    {
        var repo = new FakeWilsverklaringRepo(null);
        var ctrl = MakeController(wilsRepo: repo);

        var result = await ctrl.Upsert(MinimalRequest());

        Assert.IsType<OkObjectResult>(result.Result);
        Assert.True(repo.WasCommitted);
        Assert.NotNull(repo.Current);
    }

    [Fact]
    public async Task Upsert_UpdatetBestaandeWilsverklaring_WhenAlBestaand()
    {
        var existing = new WilsverklaringEuthanasie { Id = Guid.NewGuid(), EigenaarId = DefaultEigenaar.Id };
        var repo = new FakeWilsverklaringRepo(existing);
        var ctrl = MakeController(wilsRepo: repo);

        var result = await ctrl.Upsert(MinimalRequest());

        Assert.IsType<OkObjectResult>(result.Result);
        Assert.True(repo.WasCommitted);
    }

    // ── GetVoorwaarden ─────────────────────────────────────────────────────────

    [Fact]
    public async Task GetVoorwaarden_ReturnsLeegeLijst_WhenGeenWilsverklaring()
    {
        var ctrl = MakeController(wilsRepo: new FakeWilsverklaringRepo(null));

        var result = await ctrl.GetVoorwaarden();

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var list = Assert.IsType<List<VoorwaardeResponse>>(ok.Value);
        Assert.Empty(list);
    }

    [Fact]
    public async Task GetVoorwaarden_ReturnsLeegeLijst_WhenWilsverklaringZonderVoorwaarden()
    {
        var wilsverklaring = new WilsverklaringEuthanasie { Id = Guid.NewGuid(), EigenaarId = DefaultEigenaar.Id };
        var ctrl = MakeController(wilsRepo: new FakeWilsverklaringRepo(wilsverklaring));

        var result = await ctrl.GetVoorwaarden();

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var list = Assert.IsType<List<VoorwaardeResponse>>(ok.Value);
        Assert.Empty(list);
    }

    // ── CreateVoorwaarde ───────────────────────────────────────────────────────

    [Fact]
    public async Task CreateVoorwaarde_Returns400_WhenGeenWilsverklaring()
    {
        var ctrl = MakeController(wilsRepo: new FakeWilsverklaringRepo(null));

        var result = await ctrl.CreateVoorwaarde(new VoorwaardeUpsertRequest("Pijn", null));

        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public async Task CreateVoorwaarde_ReturnsCreated_WhenWilsverklaringAanwezig()
    {
        var wilsverklaring = new WilsverklaringEuthanasie { Id = Guid.NewGuid(), EigenaarId = DefaultEigenaar.Id };
        var db = TestDbFactory.Create();
        db.Wilsverklaringen.Add(wilsverklaring);
        await db.SaveChangesAsync();

        var ctrl = MakeController(wilsRepo: new FakeWilsverklaringRepo(wilsverklaring), db: db);

        var result = await ctrl.CreateVoorwaarde(new VoorwaardeUpsertRequest("Ondraaglijk lijden", null));

        Assert.IsType<CreatedResult>(result.Result);
    }
}

// ── Fakes ──────────────────────────────────────────────────────────────────────

sealed class FakeWilsverklaringRepo : IWilsverklaringRepository
{
    private WilsverklaringEuthanasie? _item;
    private bool _committed;

    public FakeWilsverklaringRepo(WilsverklaringEuthanasie? item = null) => _item = item;

    public Task<WilsverklaringEuthanasie?> FindAsync() => Task.FromResult(_item);
    public Task AddAsync(WilsverklaringEuthanasie w) { _item = w; return Task.CompletedTask; }
    public Task CommitAsync() { _committed = true; return Task.CompletedTask; }

    public WilsverklaringEuthanasie? Current => _item;
    public bool WasCommitted => _committed;
}

sealed class FakeEigenaarRepoForEuthanasie : IEigenaarRepository
{
    private Eigenaar? _eigenaar;
    public FakeEigenaarRepoForEuthanasie(Eigenaar? eigenaar = null) => _eigenaar = eigenaar;
    public Task<Eigenaar?> FindAsync() => Task.FromResult(_eigenaar);
    public Task AddAsync(Eigenaar eigenaar) { _eigenaar = eigenaar; return Task.CompletedTask; }
    public Task CommitAsync() => Task.CompletedTask;
}
