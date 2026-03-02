using Lumio.Api.Controllers;
using Lumio.Api.Domain.Common;
using Lumio.Api.Dtos.Common;
using Lumio.Api.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace Lumio.Api.Tests.Controllers;

/// <summary>
/// Integration tests for <see cref="WerkgeverController"/> — CRUD endpoints.
/// SP-13-004 Controller-tests batch 3. Uses TestDbFactory for in-memory EF.
/// </summary>
public sealed class WerkgeverControllerTests
{
    // ── helpers ────────────────────────────────────────────────────────────────

    private static WerkgeverController MakeController() =>
        new(new EfWerkgeverRepository(TestDbFactory.Create()), new FakeAuditService());

    private static WerkgeverUpsertRequest MinimalRequest(string naam = "Testbedrijf BV") =>
        new(naam, null, null, null, null, null, null, null, null, null, false, null, null, null, null, null, null, null, null, null, null);

    private static async Task<Eigenaar> SeedEigenaar(Lumio.Api.Data.LumioDbContext db)
    {
        var eigenaar = new Eigenaar { Id = Guid.NewGuid(), Voornaam = "Jan", Achternaam = "Test", Geboortedatum = new DateOnly(1970, 1, 1) };
        db.Eigenaren.Add(eigenaar);
        await db.SaveChangesAsync();
        return eigenaar;
    }

    // ── GetAll ─────────────────────────────────────────────────────────────────

    [Fact]
    public async Task GetAll_Returns200MetLeegeLijst_WhenGeenWerkgevers()
    {
        var ctrl = MakeController();

        var result = await ctrl.GetAll();

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var list = Assert.IsType<List<WerkgeverResponse>>(ok.Value);
        Assert.Empty(list);
    }

    [Fact]
    public async Task GetAll_Returns200MetWerkgevers_WhenWerkgeversAanwezig()
    {
        var db = TestDbFactory.Create();
        await SeedEigenaar(db);
        var ctrl = new WerkgeverController(new EfWerkgeverRepository(db), new FakeAuditService());
        await ctrl.Create(MinimalRequest("Bedrijf A"));
        await ctrl.Create(MinimalRequest("Bedrijf B"));

        var result = await ctrl.GetAll();

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var list = Assert.IsType<List<WerkgeverResponse>>(ok.Value);
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
        var db = TestDbFactory.Create();
        await SeedEigenaar(db);
        var ctrl = new WerkgeverController(new EfWerkgeverRepository(db), new FakeAuditService());
        var created = (CreatedAtActionResult)(await ctrl.Create(MinimalRequest())).Result!;
        var response = (WerkgeverResponse)created.Value!;

        var result = await ctrl.GetById(response.Id);

        Assert.IsType<OkObjectResult>(result.Result);
    }

    // ── Create ─────────────────────────────────────────────────────────────────

    [Fact]
    public async Task Create_Returns400_WhenGeenEigenaar()
    {
        var ctrl = MakeController(); // lege db — geen eigenaar

        var result = await ctrl.Create(MinimalRequest());

        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public async Task Create_Returns201_WhenEigenaarAanwezig()
    {
        var db = TestDbFactory.Create();
        await SeedEigenaar(db);
        var ctrl = new WerkgeverController(new EfWerkgeverRepository(db), new FakeAuditService());

        var result = await ctrl.Create(MinimalRequest());

        Assert.IsType<CreatedAtActionResult>(result.Result);
    }

    // ── Update ─────────────────────────────────────────────────────────────────

    [Fact]
    public async Task Update_Returns404_WhenNietGevonden()
    {
        var ctrl = MakeController();
        var result = await ctrl.Update(Guid.NewGuid(), MinimalRequest());
        Assert.IsType<NotFoundResult>(result.Result);
    }

    [Fact]
    public async Task Update_Returns200MetGewijzigdeData_WhenGevonden()
    {
        var db = TestDbFactory.Create();
        await SeedEigenaar(db);
        var ctrl = new WerkgeverController(new EfWerkgeverRepository(db), new FakeAuditService());
        var created = (CreatedAtActionResult)(await ctrl.Create(MinimalRequest("Oud Naam"))).Result!;
        var id = ((WerkgeverResponse)created.Value!).Id;

        var result = await ctrl.Update(id, MinimalRequest("Nieuw Naam"));

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var gewijzigd = Assert.IsType<WerkgeverResponse>(ok.Value);
        Assert.Equal("Nieuw Naam", gewijzigd.BedrijfsNaam);
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
        var db = TestDbFactory.Create();
        await SeedEigenaar(db);
        var ctrl = new WerkgeverController(new EfWerkgeverRepository(db), new FakeAuditService());
        var created = (CreatedAtActionResult)(await ctrl.Create(MinimalRequest())).Result!;
        var id = ((WerkgeverResponse)created.Value!).Id;

        var result = await ctrl.Delete(id);

        Assert.IsType<NoContentResult>(result);

        // Verify gone
        var gone = await ctrl.GetById(id);
        Assert.IsType<NotFoundResult>(gone.Result);
    }
}
