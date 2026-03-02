using Lumio.Api.Controllers;
using Lumio.Api.Domain.Common;
using Lumio.Api.Domain.FuneralWishes;
using Lumio.Api.Dtos.FuneralWishes;
using Lumio.Api.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace Lumio.Api.Tests.Controllers;

/// <summary>
/// Unit tests for <see cref="UitvaartController"/> — Get, Upsert, Details, Genodigden.
/// SP-13-003 Application Layer fase 2.
/// EF-dependent Details/Genodigden tests use TestDbFactory.
/// </summary>
public sealed class UitvaartControllerTests
{
    // ── helpers ────────────────────────────────────────────────────────────────

    private static readonly Eigenaar DefaultEigenaar = new()
    {
        Id = Guid.NewGuid(), Voornaam = "Jan", Achternaam = "Test",
        Geboortedatum = new DateOnly(1970, 1, 1)
    };

    private static UitvaartController MakeController(
        FakeUitvaartRepo? uitvaartRepo = null,
        FakeEigenaarRepoForUitvaart? eigenaarRepo = null,
        Lumio.Api.Data.LumioDbContext? db = null,
        FakeAuditService? audit = null) =>
        new(
            uitvaartRepo ?? new FakeUitvaartRepo(),
            eigenaarRepo ?? new FakeEigenaarRepoForUitvaart(DefaultEigenaar),
            db ?? TestDbFactory.Create(),
            audit ?? new FakeAuditService());

    private static UitvaartWensenUpsertRequest MinimalRequest() =>
        new("Begraving", null, null, null, null, null, null, null, false, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null);

    // ── Get ────────────────────────────────────────────────────────────────────

    [Fact]
    public async Task Get_Returns404_WhenGeenUitvaartWensen()
    {
        var ctrl = MakeController(uitvaartRepo: new FakeUitvaartRepo(null));

        var result = await ctrl.Get();

        Assert.IsType<NotFoundResult>(result.Result);
    }

    [Fact]
    public async Task Get_Returns200_WhenUitvaartWensenAanwezig()
    {
        var item = new UitvaartWensen { Id = Guid.NewGuid(), EigenaarId = DefaultEigenaar.Id, VoorkeurType = "Begraving" };
        var ctrl = MakeController(uitvaartRepo: new FakeUitvaartRepo(item));

        var result = await ctrl.Get();

        Assert.IsType<OkObjectResult>(result.Result);
    }

    // ── Upsert ─────────────────────────────────────────────────────────────────

    [Fact]
    public async Task Upsert_Returns400_WhenGeenEigenaar()
    {
        var ctrl = MakeController(eigenaarRepo: new FakeEigenaarRepoForUitvaart(null));

        var result = await ctrl.Upsert(MinimalRequest());

        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public async Task Upsert_MaaktNieuweWensen_WhenNietBestaand()
    {
        var repo = new FakeUitvaartRepo(null);
        var ctrl = MakeController(uitvaartRepo: repo);

        var result = await ctrl.Upsert(MinimalRequest());

        Assert.IsType<OkObjectResult>(result.Result);
        Assert.True(repo.WasCommitted);
        Assert.NotNull(repo.Current);
    }

    [Fact]
    public async Task Upsert_UpdatetBestaandeWensen_WhenAlBestaand()
    {
        var existing = new UitvaartWensen { Id = Guid.NewGuid(), EigenaarId = DefaultEigenaar.Id, VoorkeurType = "Begraving" };
        var repo = new FakeUitvaartRepo(existing);
        var ctrl = MakeController(uitvaartRepo: repo);

        var result = await ctrl.Upsert(MinimalRequest());

        Assert.IsType<OkObjectResult>(result.Result);
        Assert.True(repo.WasCommitted);
    }

    // ── GetDetails ─────────────────────────────────────────────────────────────

    [Fact]
    public async Task GetDetails_ReturnsLeegeLijst_WhenGeenUitvaartWensen()
    {
        var ctrl = MakeController(uitvaartRepo: new FakeUitvaartRepo(null));

        var result = await ctrl.GetDetails();

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var list = Assert.IsType<List<CeremonieDetailResponse>>(ok.Value);
        Assert.Empty(list);
    }

    [Fact]
    public async Task GetDetails_ReturnsLeegeLijst_WhenWensenZonderDetails()
    {
        var item = new UitvaartWensen { Id = Guid.NewGuid(), EigenaarId = DefaultEigenaar.Id, VoorkeurType = "Begraving" };
        var ctrl = MakeController(uitvaartRepo: new FakeUitvaartRepo(item));

        var result = await ctrl.GetDetails();

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var list = Assert.IsType<List<CeremonieDetailResponse>>(ok.Value);
        Assert.Empty(list);
    }

    // ── GetGenodigden ──────────────────────────────────────────────────────────

    [Fact]
    public async Task GetGenodigden_ReturnsLeegeLijst_WhenGeenUitvaartWensen()
    {
        var ctrl = MakeController(uitvaartRepo: new FakeUitvaartRepo(null));

        var result = await ctrl.GetGenodigden();

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var list = Assert.IsType<List<UitvaartGenodigdeResponse>>(ok.Value);
        Assert.Empty(list);
    }

    // ── CreateDetail ───────────────────────────────────────────────────────────

    [Fact]
    public async Task CreateDetail_Returns400_WhenGeenWensen()
    {
        var ctrl = MakeController(uitvaartRepo: new FakeUitvaartRepo(null));

        var result = await ctrl.CreateDetail(new CeremonieDetailUpsertRequest("Muziek", null, 1, null, null, null, null));

        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public async Task CreateDetail_ReturnsCreated_WhenWensenAanwezig()
    {
        var item = new UitvaartWensen { Id = Guid.NewGuid(), EigenaarId = DefaultEigenaar.Id, VoorkeurType = "Begraving" };
        var db = TestDbFactory.Create();
        db.UitvaartWensen.Add(item);
        await db.SaveChangesAsync();

        var ctrl = MakeController(uitvaartRepo: new FakeUitvaartRepo(item), db: db);

        var result = await ctrl.CreateDetail(new CeremonieDetailUpsertRequest("Opening", "Muziek bij aankomst", 1, "Amazing Grace", null, null, null));

        Assert.IsType<CreatedResult>(result.Result);
    }
}

// ── Fakes ──────────────────────────────────────────────────────────────────────

sealed class FakeUitvaartRepo : IUitvaartRepository
{
    private UitvaartWensen? _item;
    private bool _committed;

    public FakeUitvaartRepo(UitvaartWensen? item = null) => _item = item;

    public Task<UitvaartWensen?> FindAsync() => Task.FromResult(_item);
    public Task AddAsync(UitvaartWensen u) { _item = u; return Task.CompletedTask; }
    public Task CommitAsync() { _committed = true; return Task.CompletedTask; }

    public UitvaartWensen? Current => _item;
    public bool WasCommitted => _committed;
}

sealed class FakeEigenaarRepoForUitvaart : IEigenaarRepository
{
    private Eigenaar? _eigenaar;
    public FakeEigenaarRepoForUitvaart(Eigenaar? eigenaar = null) => _eigenaar = eigenaar;
    public Task<Eigenaar?> FindAsync() => Task.FromResult(_eigenaar);
    public Task AddAsync(Eigenaar eigenaar) { _eigenaar = eigenaar; return Task.CompletedTask; }
    public Task CommitAsync() => Task.CompletedTask;
}
