using Lumio.Api.Data;
using Lumio.Api.Domain.Common;
using Lumio.Api.Domain.DonorRegistration;
using Lumio.Api.Rules.Configuration;
using Lumio.Api.Rules.Facts;
using Lumio.Api.Rules.Results;
using Lumio.Api.Rules.Services;
using Lumio.Api.Services;
using Microsoft.Extensions.Options;

namespace Lumio.Api.Tests.Services;

/// <summary>
/// Unit tests for StatusFactsBuilder (SP-8-002 — coverage gate ≥70%).
/// </summary>
public class StatusFactsBuilderTests
{
    // ── Helpers ─────────────────────────────────────────────────────────

    private static StatusFactsBuilder CreateSvc(LumioDbContext db) =>
        new(db,
            Options.Create(new LimietenOptions()),
            Options.Create(new ErfbelastingOptions()),
            new FakeLegitimairePortieService());

    private static Eigenaar MakeEigenaar() => new()
    {
        Voornaam = "Alice",
        Achternaam = "Bakker",
        Geboortedatum = new DateOnly(1970, 5, 15),
    };

    // ── BuildCompleetFactsAsync ──────────────────────────────────────────

    [Fact]
    public async Task BuildCompleetFactsAsync_ReturnsNullEigenaar_WhenNoData()
    {
        await using var db = TestDbFactory.Create();
        var svc = CreateSvc(db);

        var facts = await svc.BuildCompleetFactsAsync();

        Assert.Null(facts.Eigenaar);
        Assert.Null(facts.Testament);
        Assert.Null(facts.Donor);
    }

    [Fact]
    public async Task BuildCompleetFactsAsync_ReturnsEigenaarInfo_WhenPresent()
    {
        await using var db = TestDbFactory.Create();
        var eigenaar = MakeEigenaar();
        db.Eigenaren.Add(eigenaar);
        await db.SaveChangesAsync();

        var svc = CreateSvc(db);
        var facts = await svc.BuildCompleetFactsAsync();

        Assert.NotNull(facts.Eigenaar);
        Assert.True(facts.Eigenaar!.HeeftVoornaam);
        Assert.True(facts.Eigenaar.HeeftAchternaam);
        Assert.True(facts.Eigenaar.HeeftGeboortedatum);
    }

    [Fact]
    public async Task BuildCompleetFactsAsync_ZeroCountersWithoutEntities()
    {
        await using var db = TestDbFactory.Create();
        var svc = CreateSvc(db);

        var facts = await svc.BuildCompleetFactsAsync();

        Assert.Equal(0, facts.DigitaalBezitAantal);
        Assert.Equal(0, facts.DocumentenAantal);
        Assert.Equal(0, facts.ErfgenamenAantal);
        Assert.Equal(0, facts.NoodcontactenAantal);
    }

    [Fact]
    public async Task BuildCompleetFactsAsync_CountsEntitiesCorrectly()
    {
        await using var db = TestDbFactory.Create();
        var eigenaar = MakeEigenaar();
        db.Eigenaren.Add(eigenaar);
        db.Erfgenamen.AddRange(
            new Erfgenaam { EigenaarId = eigenaar.Id, Voornaam = "B", Achternaam = "C", Relatie = "kind" },
            new Erfgenaam { EigenaarId = eigenaar.Id, Voornaam = "D", Achternaam = "E", Relatie = "kind" });
        db.Noodcontacten.Add(new Noodcontact
            { EigenaarId = eigenaar.Id, Naam = "Arts", Relatie = "arts", Rol = "huisarts" });
        await db.SaveChangesAsync();

        var svc = CreateSvc(db);
        var facts = await svc.BuildCompleetFactsAsync();

        Assert.Equal(2, facts.ErfgenamenAantal);
        Assert.Equal(1, facts.NoodcontactenAantal);
    }

    // ── BuildSuggestieFactsAsync ─────────────────────────────────────────

    [Fact]
    public async Task BuildSuggestieFactsAsync_HeeftEigenaarFalse_WhenNoEigenaar()
    {
        await using var db = TestDbFactory.Create();
        var svc = CreateSvc(db);

        var facts = await svc.BuildSuggestieFactsAsync();

        Assert.False(facts.HeeftEigenaar);
        Assert.Empty(facts.Erfgenamen);
        Assert.Empty(facts.Noodcontacten);
    }

    [Fact]
    public async Task BuildSuggestieFactsAsync_HeeftEigenaarTrue_WhenPresent()
    {
        await using var db = TestDbFactory.Create();
        db.Eigenaren.Add(MakeEigenaar());
        await db.SaveChangesAsync();

        var svc = CreateSvc(db);
        var facts = await svc.BuildSuggestieFactsAsync();

        Assert.True(facts.HeeftEigenaar);
    }

    [Fact]
    public async Task BuildSuggestieFactsAsync_IncludesErfgenamen()
    {
        await using var db = TestDbFactory.Create();
        var eigenaar = MakeEigenaar();
        db.Eigenaren.Add(eigenaar);
        db.Erfgenamen.Add(new Erfgenaam
            { EigenaarId = eigenaar.Id, Voornaam = "Tom", Achternaam = "Jansen", Relatie = "kind" });
        await db.SaveChangesAsync();

        var svc = CreateSvc(db);
        var facts = await svc.BuildSuggestieFactsAsync();

        Assert.Single(facts.Erfgenamen);
        Assert.Contains("Tom", facts.Erfgenamen[0].VolledigeNaam);
    }

    // ── BuildMeldingFactsAsync ───────────────────────────────────────────

    [Fact]
    public async Task BuildMeldingFactsAsync_HeeftEigenaarFalse_WhenNoData()
    {
        await using var db = TestDbFactory.Create();
        var svc = CreateSvc(db);

        var facts = await svc.BuildMeldingFactsAsync();

        Assert.False(facts.HeeftEigenaar);
        Assert.False(facts.HeeftTestament);
        Assert.False(facts.HeeftDonor);
    }

    [Fact]
    public async Task BuildMeldingFactsAsync_HeeftEigenaarTrue_WhenPresent()
    {
        await using var db = TestDbFactory.Create();
        db.Eigenaren.Add(MakeEigenaar());
        db.DonorRegistraties.Add(new DonorRegistratie { Keuze = "Ja, alles" });
        await db.SaveChangesAsync();

        var svc = CreateSvc(db);
        var facts = await svc.BuildMeldingFactsAsync();

        Assert.True(facts.HeeftEigenaar);
        Assert.True(facts.HeeftDonor);
    }
}

/// <summary>
/// Minimal fake that returns a no-warning legitimaire-portie result.
/// Used in StatusFactsBuilder tests to avoid a full DI setup.
/// </summary>
file sealed class FakeLegitimairePortieService : ILegitimairePortieService
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
