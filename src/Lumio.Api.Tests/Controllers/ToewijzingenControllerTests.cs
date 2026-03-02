using Lumio.Api.Controllers;
using Lumio.Api.Domain.Common;
using Lumio.Api.Dtos.AssetRegistry;
using Lumio.Api.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace Lumio.Api.Tests.Controllers;

/// <summary>
/// Integration tests for <see cref="ToewijzingenController"/> — GetAll, Query, CRUD.
/// SP-14-004 Controller-tests batch 4.
/// </summary>
public sealed class ToewijzingenControllerTests
{
    // ── helpers ────────────────────────────────────────────────────────────────

    private static ToewijzingenController MakeController(Lumio.Api.Data.LumioDbContext? db = null) =>
        new(new EfToewijzingRepository(db ?? TestDbFactory.Create()));

    private static async Task<Eigenaar> SeedEigenaar(Lumio.Api.Data.LumioDbContext db)
    {
        var eigenaar = new Eigenaar { Id = Guid.NewGuid(), Voornaam = "Jan", Achternaam = "Test", Geboortedatum = new DateOnly(1970, 1, 1) };
        db.Eigenaren.Add(eigenaar);
        await db.SaveChangesAsync();
        return eigenaar;
    }

    private static async Task<Erfgenaam> SeedErfgenaam(Lumio.Api.Data.LumioDbContext db, Guid eigenaarId)
    {
        var erfgenaam = new Erfgenaam
        {
            Id        = Guid.NewGuid(),
            EigenaarId = eigenaarId,
            Voornaam   = "Piet",
            Achternaam = "Pietersen",
            Geboortedatum = new DateOnly(1990, 5, 1),
        };
        db.Erfgenamen.Add(erfgenaam);
        await db.SaveChangesAsync();
        return erfgenaam;
    }

    // ── GetAll ─────────────────────────────────────────────────────────────────

    [Fact]
    public async Task GetAll_Returns200_MetLeegeLijst_ZonderEigenaar()
    {
        var ctrl = MakeController();

        var result = await ctrl.GetAll();

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var list = Assert.IsType<List<ErfgenaamToewijzingResponse>>(ok.Value);
        Assert.Empty(list);
    }

    // ── GetByErfgenaam ─────────────────────────────────────────────────────────

    [Fact]
    public async Task GetByErfgenaam_Returns404_WanneerErfgenaamNietAanwezig()
    {
        var ctrl = MakeController();

        var result = await ctrl.GetByErfgenaam(Guid.NewGuid());

        Assert.IsType<NotFoundResult>(result.Result);
    }

    // ── Create ─────────────────────────────────────────────────────────────────

    [Fact]
    public async Task Create_Returns400_ZonderEigenaar()
    {
        var ctrl = MakeController();
        var request = new ErfgenaamToewijzingUpsertRequest(Guid.NewGuid(), "Bankrekening", Guid.NewGuid(), null);

        var result = await ctrl.Create(request);

        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public async Task Create_Returns400_WanneerErfgenaamNietGevonden()
    {
        var db = TestDbFactory.Create();
        await SeedEigenaar(db);
        var ctrl = new ToewijzingenController(new EfToewijzingRepository(db));
        var request = new ErfgenaamToewijzingUpsertRequest(Guid.NewGuid(), "Bankrekening", Guid.NewGuid(), null);

        var result = await ctrl.Create(request);

        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public async Task Create_Returns201_WanneerErfgenaamEnEigenaarBestaan()
    {
        var db = TestDbFactory.Create();
        var eigenaar = await SeedEigenaar(db);
        var erfgenaam = await SeedErfgenaam(db, eigenaar.Id);
        var ctrl = new ToewijzingenController(new EfToewijzingRepository(db));
        var request = new ErfgenaamToewijzingUpsertRequest(erfgenaam.Id, "Bankrekening", Guid.NewGuid(), "Alles overdragen");

        var result = await ctrl.Create(request);

        Assert.IsType<CreatedResult>(result.Result);
    }

    // ── Delete ─────────────────────────────────────────────────────────────────

    [Fact]
    public async Task Delete_Returns404_WanneerNietGevonden()
    {
        var ctrl = MakeController();

        var result = await ctrl.Delete(Guid.NewGuid());

        Assert.IsType<NotFoundResult>(result);
    }
}
