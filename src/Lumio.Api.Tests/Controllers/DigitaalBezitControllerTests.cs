using Lumio.Api.Controllers;
using Lumio.Api.Domain.Common;
using Lumio.Api.Dtos.DigitalEstate;
using Lumio.Api.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace Lumio.Api.Tests.Controllers;

/// <summary>
/// Integration tests for <see cref="DigitaalBezitController"/> — Accounts, Wachtwoorden.
/// SP-14-004 Controller-tests batch 4.
/// </summary>
public sealed class DigitaalBezitControllerTests
{
    // ── helpers ────────────────────────────────────────────────────────────────

    private static DigitaalBezitController MakeController(Lumio.Api.Data.LumioDbContext? db = null) =>
        new(new EfDigitaalBezitRepository(db ?? TestDbFactory.Create()), new FakeAuditService());

    private static async Task<Eigenaar> SeedEigenaar(Lumio.Api.Data.LumioDbContext db)
    {
        var eigenaar = new Eigenaar { Id = Guid.NewGuid(), Voornaam = "Jan", Achternaam = "Test", Geboortedatum = new DateOnly(1970, 1, 1) };
        db.Eigenaren.Add(eigenaar);
        await db.SaveChangesAsync();
        return eigenaar;
    }

    private static DigitaalAccountUpsertRequest MinimalAccount() =>
        new("Facebook", "Sociaal", "jan@example.com", null, "https://facebook.com", "Verwijderen", null, null);

    // ── GetAllAccounts ─────────────────────────────────────────────────────────

    [Fact]
    public async Task GetAllAccounts_Returns200_MetLeegeLijst_ZonderEigenaar()
    {
        var ctrl = MakeController();

        var result = await ctrl.GetAccounts();

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var list = Assert.IsType<List<DigitaalAccountResponse>>(ok.Value);
        Assert.Empty(list);
    }

    // ── CreateAccount ──────────────────────────────────────────────────────────

    [Fact]
    public async Task CreateAccount_Returns400_ZonderEigenaar()
    {
        var ctrl = MakeController();

        var result = await ctrl.CreateAccount(MinimalAccount());

        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public async Task CreateAccount_Returns201_MetEigenaar()
    {
        var db = TestDbFactory.Create();
        await SeedEigenaar(db);
        var ctrl = new DigitaalBezitController(new EfDigitaalBezitRepository(db), new FakeAuditService());

        var result = await ctrl.CreateAccount(MinimalAccount());

        var created = Assert.IsType<CreatedResult>(result.Result);
        var response = Assert.IsType<DigitaalAccountResponse>(created.Value);
        Assert.Equal("Facebook", response.PlatformNaam);
    }

    // ── DeleteAccount ──────────────────────────────────────────────────────────

    [Fact]
    public async Task DeleteAccount_Returns404_WanneerNietGevonden()
    {
        var ctrl = MakeController();

        var result = await ctrl.DeleteAccount(Guid.NewGuid());

        Assert.IsType<NotFoundResult>(result);
    }

    [Fact]
    public async Task DeleteAccount_Returns204_WanneerGevonden()
    {
        var db = TestDbFactory.Create();
        await SeedEigenaar(db);
        var ctrl = new DigitaalBezitController(new EfDigitaalBezitRepository(db), new FakeAuditService());
        var created = (CreatedResult)(await ctrl.CreateAccount(MinimalAccount())).Result!;
        var id = ((DigitaalAccountResponse)created.Value!).Id;

        var result = await ctrl.DeleteAccount(id);

        Assert.IsType<NoContentResult>(result);
    }

    // ── GetAllWachtwoorden ─────────────────────────────────────────────────────

    [Fact]
    public async Task GetAllWachtwoorden_Returns200_MetLeegeLijst_ZonderEigenaar()
    {
        var ctrl = MakeController();

        var result = await ctrl.GetWachtwoorden();

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var list = Assert.IsType<List<WachtwoordEntryResponse>>(ok.Value);
        Assert.Empty(list);
    }
}
