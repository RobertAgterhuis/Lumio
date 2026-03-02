using Lumio.Api.Controllers;
using Lumio.Api.Domain.Common;
using Lumio.Api.Dtos.DonorRegistration;
using Microsoft.AspNetCore.Mvc;

namespace Lumio.Api.Tests.Controllers;

/// <summary>
/// Integration tests for <see cref="DonorController"/> — Get, Upsert, OrgaanKeuze CRUD.
/// SP-13-004 Controller-tests batch 3. Uses TestDbFactory for in-memory EF.
/// </summary>
public sealed class DonorControllerTests
{
    // ── helpers ────────────────────────────────────────────────────────────────

    private static DonorController MakeController() =>
        new(TestDbFactory.Create(), new FakeAuditService());

    private static DonorRegistratieUpsertRequest MinimalRequest() =>
        new("JaAlleOrganen", false, null, null, null, null, null);

    private static async Task<Eigenaar> SeedEigenaar(Lumio.Api.Data.LumioDbContext db)
    {
        var eigenaar = new Eigenaar { Id = Guid.NewGuid(), Voornaam = "Jan", Achternaam = "Test", Geboortedatum = new DateOnly(1970, 1, 1) };
        db.Eigenaren.Add(eigenaar);
        await db.SaveChangesAsync();
        return eigenaar;
    }

    // ── Get ────────────────────────────────────────────────────────────────────

    [Fact]
    public async Task Get_Returns404_WhenGeenRegistratie()
    {
        var ctrl = MakeController();

        var result = await ctrl.Get();

        Assert.IsType<NotFoundResult>(result.Result);
    }

    [Fact]
    public async Task Get_Returns200_WhenRegistratieAanwezig()
    {
        var db = TestDbFactory.Create();
        await SeedEigenaar(db);
        var ctrl = new DonorController(db, new FakeAuditService());
        await ctrl.Upsert(MinimalRequest());

        var result = await ctrl.Get();

        Assert.IsType<OkObjectResult>(result.Result);
    }

    // ── Upsert ─────────────────────────────────────────────────────────────────

    [Fact]
    public async Task Upsert_Returns400_WhenGeenEigenaar()
    {
        var ctrl = MakeController();

        var result = await ctrl.Upsert(MinimalRequest());

        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public async Task Upsert_MaaktNieuweRegistratie_WhenNietBestaand()
    {
        var db = TestDbFactory.Create();
        await SeedEigenaar(db);
        var ctrl = new DonorController(db, new FakeAuditService());

        var result = await ctrl.Upsert(MinimalRequest());

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var response = Assert.IsType<DonorRegistratieResponse>(ok.Value);
        Assert.Equal("JaAlleOrganen", response.Keuze);
    }

    [Fact]
    public async Task Upsert_UpdatetBestaandeRegistratie_WhenAlBestaand()
    {
        var db = TestDbFactory.Create();
        await SeedEigenaar(db);
        var ctrl = new DonorController(db, new FakeAuditService());

        // Eerste aanmaak
        await ctrl.Upsert(MinimalRequest());

        // Update
        var result = await ctrl.Upsert(new DonorRegistratieUpsertRequest("Nee", false, null, "Persoonlijke keuze", null, null, null));

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var response = Assert.IsType<DonorRegistratieResponse>(ok.Value);
        Assert.Equal("Nee", response.Keuze);
    }

    // ── GetOrgaanKeuzes ────────────────────────────────────────────────────────

    [Fact]
    public async Task GetOrgaanKeuzes_ReturnsLeegeLijst_WhenGeenRegistratie()
    {
        var ctrl = MakeController();

        var result = await ctrl.GetOrgaanKeuzes();

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var list = Assert.IsType<List<OrgaanKeuzeResponse>>(ok.Value);
        Assert.Empty(list);
    }

    [Fact]
    public async Task GetOrgaanKeuzes_ReturnsLeegeLijst_WhenRegistratieZonderKeuzes()
    {
        var db = TestDbFactory.Create();
        await SeedEigenaar(db);
        var ctrl = new DonorController(db, new FakeAuditService());
        await ctrl.Upsert(MinimalRequest());

        var result = await ctrl.GetOrgaanKeuzes();

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var list = Assert.IsType<List<OrgaanKeuzeResponse>>(ok.Value);
        Assert.Empty(list);
    }

    // ── CreateOrgaanKeuze ──────────────────────────────────────────────────────

    [Fact]
    public async Task CreateOrgaanKeuze_Returns400_WhenGeenRegistratie()
    {
        var ctrl = MakeController();

        var result = await ctrl.CreateOrgaanKeuze(new OrgaanKeuzeUpsertRequest("Hart", true, null));

        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public async Task CreateOrgaanKeuze_ReturnsCreated_WhenRegistratieAanwezig()
    {
        var db = TestDbFactory.Create();
        await SeedEigenaar(db);
        var ctrl = new DonorController(db, new FakeAuditService());
        await ctrl.Upsert(MinimalRequest());

        var result = await ctrl.CreateOrgaanKeuze(new OrgaanKeuzeUpsertRequest("Hart", true, null));

        Assert.IsType<CreatedResult>(result.Result);
    }

    // ── BatchUpdateOrgaanKeuzes ────────────────────────────────────────────────

    [Fact]
    public async Task BatchUpdateOrgaanKeuzes_Returns400_WhenGeenRegistratie()
    {
        var ctrl = MakeController();

        var result = await ctrl.BatchUpdateOrgaanKeuzes(new List<OrgaanKeuzeUpsertRequest>());

        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public async Task BatchUpdateOrgaanKeuzes_ReturnsKeuzes_WhenRegistratieAanwezig()
    {
        var db = TestDbFactory.Create();
        await SeedEigenaar(db);
        var ctrl = new DonorController(db, new FakeAuditService());
        await ctrl.Upsert(MinimalRequest());

        var keuzes = new List<OrgaanKeuzeUpsertRequest>
        {
            new("Hart", true, null),
            new("Nieren", true, "Beide nieren"),
        };

        var result = await ctrl.BatchUpdateOrgaanKeuzes(keuzes);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var list = Assert.IsType<List<OrgaanKeuzeResponse>>(ok.Value);
        Assert.Equal(2, list.Count);
    }
}
