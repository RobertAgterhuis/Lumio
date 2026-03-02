using Lumio.Api.Controllers;
using Lumio.Api.Domain.Common;
using Lumio.Api.Dtos.Testament;
using Lumio.Api.Rules.Configuration;
using Lumio.Api.Rules.Facts;
using Lumio.Api.Rules.Results;
using Lumio.Api.Rules.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace Lumio.Api.Tests.Controllers;

/// <summary>
/// Integration tests for <see cref="TestamentController"/> — Get, Upsert, LegitimairePortieCheck.
/// SP-13-004 Controller-tests batch 3. Uses TestDbFactory + FakeLegitimairePortieServiceForTestament.
/// </summary>
public sealed class TestamentControllerTests
{
    // ── helpers ────────────────────────────────────────────────────────────────

    private static TestamentController MakeController(Lumio.Api.Data.LumioDbContext? db = null) =>
        new(
            db ?? TestDbFactory.Create(),
            Options.Create(new ErfbelastingOptions()),
            new FakeLegitimairePortieServiceForTestament(),
            new FakeAuditService());

    private static TestamentInfoUpsertRequest MinimalRequest(
        string? type = "Notarieel",
        DateOnly? datum = null) =>
        new(type, null, null, null, null, null, null, null, datum, null, null, null, null, null, null);

    private static async Task<Eigenaar> SeedEigenaar(Lumio.Api.Data.LumioDbContext db, DateOnly? geboortedatum = null)
    {
        var eigenaar = new Eigenaar
        {
            Id = Guid.NewGuid(),
            Voornaam = "Jan",
            Achternaam = "Test",
            Geboortedatum = geboortedatum ?? new DateOnly(1970, 1, 1)
        };
        db.Eigenaren.Add(eigenaar);
        await db.SaveChangesAsync();
        return eigenaar;
    }

    // ── Get ────────────────────────────────────────────────────────────────────

    [Fact]
    public async Task Get_Returns404_WhenGeenTestament()
    {
        var ctrl = MakeController();

        var result = await ctrl.Get();

        Assert.IsType<NotFoundResult>(result.Result);
    }

    [Fact]
    public async Task Get_Returns200_WhenTestamentAanwezig()
    {
        var db = TestDbFactory.Create();
        await SeedEigenaar(db);
        var ctrl = new TestamentController(db, Options.Create(new ErfbelastingOptions()), new FakeLegitimairePortieServiceForTestament(), new FakeAuditService());
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
    public async Task Upsert_Returns400_WanneerDatumVoorGeboortedatum()
    {
        var db = TestDbFactory.Create();
        // Eigenaar geboren in 1970 — testament datum mag niet voor 1970 liggen
        await SeedEigenaar(db, geboortedatum: new DateOnly(1970, 1, 1));
        var ctrl = new TestamentController(db, Options.Create(new ErfbelastingOptions()), new FakeLegitimairePortieServiceForTestament(), new FakeAuditService());

        var result = await ctrl.Upsert(MinimalRequest(datum: new DateOnly(1965, 1, 1)));

        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public async Task Upsert_MaaktNieuwTestament_WhenNietBestaand()
    {
        var db = TestDbFactory.Create();
        await SeedEigenaar(db);
        var ctrl = new TestamentController(db, Options.Create(new ErfbelastingOptions()), new FakeLegitimairePortieServiceForTestament(), new FakeAuditService());

        var result = await ctrl.Upsert(MinimalRequest("Notarieel"));

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var response = Assert.IsType<TestamentInfoResponse>(ok.Value);
        Assert.Equal("Notarieel", response.TestamentType);
    }

    [Fact]
    public async Task Upsert_UpdatetBestaandTestament_WhenAlBestaand()
    {
        var db = TestDbFactory.Create();
        await SeedEigenaar(db);
        var ctrl = new TestamentController(db, Options.Create(new ErfbelastingOptions()), new FakeLegitimairePortieServiceForTestament(), new FakeAuditService());

        await ctrl.Upsert(MinimalRequest("Notarieel"));
        var result = await ctrl.Upsert(MinimalRequest("Onderhands"));

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var response = Assert.IsType<TestamentInfoResponse>(ok.Value);
        Assert.Equal("Onderhands", response.TestamentType);
    }

    [Fact]
    public async Task Upsert_MaaktAutoSnapshot_WanneerTypeGewijzigd()
    {
        var db = TestDbFactory.Create();
        await SeedEigenaar(db);
        var ctrl = new TestamentController(db, Options.Create(new ErfbelastingOptions()), new FakeLegitimairePortieServiceForTestament(), new FakeAuditService());

        await ctrl.Upsert(MinimalRequest("Notarieel"));
        await ctrl.Upsert(MinimalRequest("Onderhands")); // type change → auto-snapshot

        var snapshots = db.TestamentSnapshots.ToList();
        Assert.Single(snapshots);
        Assert.Contains("Notarieel", snapshots[0].Notitie);
    }

    // ── LegitimairePortieCheck ─────────────────────────────────────────────────

    [Fact]
    public async Task LegitimairePortieCheck_Returns200_WhenGeenTestamentOfEigenaar()
    {
        var ctrl = MakeController();

        var result = await ctrl.LegitimairePortieCheck();

        // Service returns no-warning result even when no testament/eigenaar
        var ok = Assert.IsType<OkObjectResult>(result.Result);
        Assert.NotNull(ok.Value);
    }

    [Fact]
    public async Task LegitimairePortieCheck_Returns200_WhenTestamentAanwezig()
    {
        var db = TestDbFactory.Create();
        await SeedEigenaar(db);
        var ctrl = new TestamentController(db, Options.Create(new ErfbelastingOptions()), new FakeLegitimairePortieServiceForTestament(), new FakeAuditService());
        await ctrl.Upsert(MinimalRequest());

        var result = await ctrl.LegitimairePortieCheck();

        Assert.IsType<OkObjectResult>(result.Result);
    }
}

// ── Fake ───────────────────────────────────────────────────────────────────────

/// <summary>
/// Minimal fake that returns a no-warning legitimaire-portie result.
/// Mirrors the file-scoped fake in StatusFactsBuilderTests.
/// </summary>
sealed class FakeLegitimairePortieServiceForTestament : ILegitimairePortieService
{
    public PolicyResult<LegitimairePortieResultaat> Bereken(LegitimairePortieFacts facts) =>
        new()
        {
            Resultaat = new LegitimairePortieResultaat(
                HeeftWaarschuwing: false,
                AantalKinderen: 0,
                HeeftPartner: false,
                MinimumPercentagePerKind: 0m,
                Waarschuwingen: []),
            RegelVersie = "test-fake",
        };
}
