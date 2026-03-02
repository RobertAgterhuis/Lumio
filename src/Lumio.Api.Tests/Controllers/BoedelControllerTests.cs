using Lumio.Api.Controllers;
using Lumio.Api.Domain.Common;
using Lumio.Api.Domain.AssetRegistry;
using Lumio.Api.Dtos.AssetRegistry;
using Lumio.Api.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace Lumio.Api.Tests.Controllers;

/// <summary>
/// Integration tests for <see cref="BoedelController"/> — Samenvatting, Bezittingen, Bankrekeningen.
/// SP-14-004 Controller-tests batch 4.
/// </summary>
public sealed class BoedelControllerTests
{
    // ── helpers ────────────────────────────────────────────────────────────────

    private static BoedelController MakeController(Lumio.Api.Data.LumioDbContext? db = null) =>
        new(new EfBoedelRepository(db ?? TestDbFactory.Create()), new FakeAuditService());

    private static async Task<Eigenaar> SeedEigenaar(Lumio.Api.Data.LumioDbContext db)
    {
        var eigenaar = new Eigenaar { Id = Guid.NewGuid(), Voornaam = "Jan", Achternaam = "Test", Geboortedatum = new DateOnly(1970, 1, 1) };
        db.Eigenaren.Add(eigenaar);
        await db.SaveChangesAsync();
        return eigenaar;
    }

    private static FysiekBezitUpsertRequest MinimalBezit() =>
        new("Voertuig", "Auto Mercedes", null, null, null, VermogensSoort.Prive, null, null, "AB-123-C", null);

    private static BankrekeningUpsertRequest MinimalBankrekening() =>
        new("Rabobank", "NL91RABO0315273637", "Betaalrekening", null, VermogensSoort.Prive, null);

    // ── GetSamenvatting ────────────────────────────────────────────────────────

    [Fact]
    public async Task GetSamenvatting_Returns404_ZonderEigenaar()
    {
        var ctrl = MakeController();

        var result = await ctrl.GetSamenvatting();

        Assert.IsType<NotFoundObjectResult>(result);
    }

    [Fact]
    public async Task GetSamenvatting_Returns200_MetEigenaar()
    {
        var db = TestDbFactory.Create();
        await SeedEigenaar(db);
        var ctrl = new BoedelController(new EfBoedelRepository(db), new FakeAuditService());

        var result = await ctrl.GetSamenvatting();

        Assert.IsType<OkObjectResult>(result);
    }

    // ── Bezittingen ────────────────────────────────────────────────────────────

    [Fact]
    public async Task GetBezittingen_Returns200_MetLeegeLijst()
    {
        var ctrl = MakeController();

        var result = await ctrl.GetBezittingen();

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var list = Assert.IsType<List<FysiekBezitResponse>>(ok.Value);
        Assert.Empty(list);
    }

    [Fact]
    public async Task CreateBezit_Returns400_ZonderEigenaar()
    {
        var ctrl = MakeController();

        var result = await ctrl.CreateBezit(MinimalBezit());

        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public async Task CreateBezit_Returns201_MetEigenaar()
    {
        var db = TestDbFactory.Create();
        await SeedEigenaar(db);
        var ctrl = new BoedelController(new EfBoedelRepository(db), new FakeAuditService());

        var result = await ctrl.CreateBezit(MinimalBezit());

        var created = Assert.IsType<CreatedResult>(result.Result);
        var response = Assert.IsType<FysiekBezitResponse>(created.Value);
        Assert.Equal("Auto Mercedes", response.Omschrijving);
    }

    [Fact]
    public async Task DeleteBezit_Returns404_WanneerNietGevonden()
    {
        var ctrl = MakeController();

        var result = await ctrl.DeleteBezit(Guid.NewGuid());

        Assert.IsType<NotFoundResult>(result);
    }

    // ── Bankrekeningen ─────────────────────────────────────────────────────────

    [Fact]
    public async Task GetBankrekeningen_Returns200_MetLeegeLijst()
    {
        var ctrl = MakeController();

        var result = await ctrl.GetBankrekeningen();

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var list = Assert.IsType<List<BankrekeningResponse>>(ok.Value);
        Assert.Empty(list);
    }

    [Fact]
    public async Task CreateBankrekening_Returns201_MetEigenaar()
    {
        var db = TestDbFactory.Create();
        await SeedEigenaar(db);
        var ctrl = new BoedelController(new EfBoedelRepository(db), new FakeAuditService());

        var result = await ctrl.CreateBankrekening(MinimalBankrekening());

        var created = Assert.IsType<CreatedResult>(result.Result);
        var response = Assert.IsType<BankrekeningResponse>(created.Value);
        Assert.Equal("Rabobank", response.BankNaam);
    }
}
