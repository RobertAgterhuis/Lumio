using Lumio.Api.Rules.Configuration;
using Lumio.Api.Rules.Facts;
using Lumio.Api.Rules.Services;
using Microsoft.Extensions.Options;

namespace Lumio.Api.Tests.Rules;

/// <summary>
/// Unit tests voor LegitimairePortieService (SP-9-002 — BW Boek 4, art. 4:63-4:69).
/// Pure POCO tests — geen database, geen HTTP.
/// Formule: intestaat per kind = 100% / (kinderen + (heeftPartner ? 1 : 0))
///          legitimaire portie = intestaat / 2
/// </summary>
public class LegitimairePortieServiceTests
{
    private static LegitimairePortieService Create()
    {
        var opts = Options.Create(new LumioRulesOptions { Versie = "2025.1" });
        return new LegitimairePortieService(opts);
    }

    private static KindErfgenaamFact MaakKind(string voornaam, string achternaam)
        => new(Guid.NewGuid(), $"{voornaam} {achternaam}", voornaam, achternaam);

    private static BegunstigdeFact MaakBegunstigde(string naam, decimal? pct)
        => new(naam, pct);

    // ── Guard: geen eigenaar ─────────────────────────────────────────────

    [Fact]
    public void Bereken_GeenEigenaar_GeeftLeegResultaat()
    {
        var svc = Create();
        var facts = new LegitimairePortieFacts(
            HeeftEigenaar: false,
            HeeftTestament: true,
            BurgerlijkeStaat: BurgerlijkeStaatFact.Alleenstaand,
            Kinderen: [MaakKind("Jan", "Jansen")],
            Begunstigden: []);

        var result = svc.Bereken(facts);

        Assert.False(result.Resultaat.HeeftWaarschuwing);
        Assert.Equal(0, result.Resultaat.AantalKinderen);
        Assert.Empty(result.Resultaat.Waarschuwingen);
    }

    // ── Guard: geen testament ────────────────────────────────────────────

    [Fact]
    public void Bereken_GeenTestament_GeeftLeegResultaat()
    {
        var svc = Create();
        var facts = new LegitimairePortieFacts(
            HeeftEigenaar: true,
            HeeftTestament: false,
            BurgerlijkeStaat: BurgerlijkeStaatFact.Alleenstaand,
            Kinderen: [MaakKind("Jan", "Jansen")],
            Begunstigden: []);

        var result = svc.Bereken(facts);

        Assert.False(result.Resultaat.HeeftWaarschuwing);
        Assert.Equal(0, result.Resultaat.AantalKinderen);
    }

    // ── Guard: geen kinderen ─────────────────────────────────────────────

    [Fact]
    public void Bereken_GeenKinderen_GeeftLeegResultaat()
    {
        var svc = Create();
        var facts = new LegitimairePortieFacts(
            HeeftEigenaar: true,
            HeeftTestament: true,
            BurgerlijkeStaat: BurgerlijkeStaatFact.Alleenstaand,
            Kinderen: [],
            Begunstigden: []);

        var result = svc.Bereken(facts);

        Assert.Equal(0, result.Resultaat.AantalKinderen);
        Assert.False(result.Resultaat.HeeftWaarschuwing);
    }

    // ── Minimumberekening: 1 kind, geen partner ──────────────────────────

    [Fact]
    public void Bereken_EenKindGeenPartner_MinimumIs50Procent()
    {
        var svc = Create();
        var kind = MaakKind("Lisa", "Smit");
        var facts = new LegitimairePortieFacts(
            HeeftEigenaar: true,
            HeeftTestament: true,
            BurgerlijkeStaat: BurgerlijkeStaatFact.Alleenstaand,
            Kinderen: [kind],
            Begunstigden: [MaakBegunstigde("Lisa Smit", 50m)]);

        var result = svc.Bereken(facts);

        Assert.Equal(50.00m, result.Resultaat.MinimumPercentagePerKind);
    }

    // ── Minimumberekening: 2 kinderen, geen partner ──────────────────────

    [Fact]
    public void Bereken_TweeKinderenGeenPartner_MinimumIs25Procent()
    {
        var svc = Create();
        var facts = new LegitimairePortieFacts(
            HeeftEigenaar: true,
            HeeftTestament: true,
            BurgerlijkeStaat: BurgerlijkeStaatFact.Alleenstaand,
            Kinderen: [MaakKind("A", "X"), MaakKind("B", "X")],
            Begunstigden:
            [
                MaakBegunstigde("A X", 25m),
                MaakBegunstigde("B X", 25m)
            ]);

        var result = svc.Bereken(facts);

        Assert.Equal(25.00m, result.Resultaat.MinimumPercentagePerKind);
    }

    // ── Minimumberekening: 1 kind, gehuwd partner ────────────────────────

    [Fact]
    public void Bereken_EenKindGehuwdPartner_MinimumIs25Procent()
    {
        // intestaat = 100 / (1 kind + 1 partner) = 50%; minimum = 25%
        var svc = Create();
        var kind = MaakKind("Tom", "Berg");
        var facts = new LegitimairePortieFacts(
            HeeftEigenaar: true,
            HeeftTestament: true,
            BurgerlijkeStaat: BurgerlijkeStaatFact.Gehuwd,
            Kinderen: [kind],
            Begunstigden: [MaakBegunstigde("Tom Berg", 25m)]);

        var result = svc.Bereken(facts);

        Assert.Equal(25.00m, result.Resultaat.MinimumPercentagePerKind);
        Assert.True(result.Resultaat.HeeftPartner);
    }

    [Fact]
    public void Bereken_GeregistreerdPartnerschap_WordtAlsPartnerHerkend()
    {
        var svc = Create();
        var kind = MaakKind("Eva", "Berg");
        var facts = new LegitimairePortieFacts(
            HeeftEigenaar: true,
            HeeftTestament: true,
            BurgerlijkeStaat: BurgerlijkeStaatFact.GeregistreerdPartnerschap,
            Kinderen: [kind],
            Begunstigden: [MaakBegunstigde("Eva Berg", 25m)]);

        var result = svc.Bereken(facts);

        Assert.True(result.Resultaat.HeeftPartner);
        Assert.Equal(25.00m, result.Resultaat.MinimumPercentagePerKind);
    }

    // ── Begunstigde voldoet aan minimum — geen waarschuwing ──────────────

    [Fact]
    public void Bereken_BegunstigdeVoldoetAanMinimum_GeenWaarschuwing()
    {
        var svc = Create();
        var kind = MaakKind("Sara", "Wit");
        var facts = new LegitimairePortieFacts(
            HeeftEigenaar: true,
            HeeftTestament: true,
            BurgerlijkeStaat: BurgerlijkeStaatFact.Alleenstaand,
            Kinderen: [kind],
            Begunstigden: [MaakBegunstigde("Sara Wit", 60m)]);  // 60 >= 50 minimum

        var result = svc.Bereken(facts);

        Assert.False(result.Resultaat.HeeftWaarschuwing);
        Assert.Empty(result.Resultaat.Waarschuwingen);
    }

    // ── Begunstigde te laag — waarschuwing ────────────────────────────────

    [Fact]
    public void Bereken_BegunstigdeTeLaag_GeeftWaarschuwing()
    {
        var svc = Create();
        var kind = MaakKind("Piet", "Dam");
        var facts = new LegitimairePortieFacts(
            HeeftEigenaar: true,
            HeeftTestament: true,
            BurgerlijkeStaat: BurgerlijkeStaatFact.Alleenstaand,
            Kinderen: [kind],
            Begunstigden: [MaakBegunstigde("Piet Dam", 10m)]); // 10 < 50 minimum

        var result = svc.Bereken(facts);

        Assert.True(result.Resultaat.HeeftWaarschuwing);
        Assert.Single(result.Resultaat.Waarschuwingen);
        Assert.Single(result.Resultaat.Waarschuwingen);
    }

    [Fact]
    public void Bereken_BegunstigdeTeLaag_WaarschuwingResultBevatCorrectePct()
    {
        var svc = Create();
        var kind = MaakKind("Piet", "Dam");
        var facts = new LegitimairePortieFacts(
            HeeftEigenaar: true,
            HeeftTestament: true,
            BurgerlijkeStaat: BurgerlijkeStaatFact.Alleenstaand,
            Kinderen: [kind],
            Begunstigden: [MaakBegunstigde("Piet Dam", 10m)]);

        var result = svc.Bereken(facts);

        var w = result.Resultaat.Waarschuwingen.Single();
        Assert.Equal(10m, w.ToegewezenPercentage);
        Assert.Equal(50.00m, w.MinimumPercentage);
    }

    // ── Kind niet gevonden in begunstigden ────────────────────────────────

    [Fact]
    public void Bereken_KindNietInBegunstigden_GeeftWaarschuwingMetNullPercentage()
    {
        var svc = Create();
        var kind = MaakKind("Anna", "Vos");
        var facts = new LegitimairePortieFacts(
            HeeftEigenaar: true,
            HeeftTestament: true,
            BurgerlijkeStaat: BurgerlijkeStaatFact.Alleenstaand,
            Kinderen: [kind],
            Begunstigden: []); // anna ontbreekt

        var result = svc.Bereken(facts);

        Assert.True(result.Resultaat.HeeftWaarschuwing);
        var w = result.Resultaat.Waarschuwingen.Single();
        Assert.Null(w.ToegewezenPercentage);
        Assert.Equal("Anna Vos", w.Naam);
    }

    // ── Naam-normalisatie (witruimte) ─────────────────────────────────────

    [Fact]
    public void Bereken_NaamMetExtraSpaties_WordtNogSteedsGematcht()
    {
        var svc = Create();
        var kind = MaakKind("Mark", "de Vries");
        var facts = new LegitimairePortieFacts(
            HeeftEigenaar: true,
            HeeftTestament: true,
            BurgerlijkeStaat: BurgerlijkeStaatFact.Alleenstaand,
            Kinderen: [kind],
            // Extra spaties in begunstigde naam — ServiceS8-10 normaliseert dit
            Begunstigden: [MaakBegunstigde("Mark  de  Vries", 50m)]);

        var result = svc.Bereken(facts);

        // Zou geen waarschuwing moeten geven (50% >= 50% minimum)
        Assert.False(result.Resultaat.HeeftWaarschuwing);
    }

    // ── AantalKinderen en HeeftPartner ───────────────────────────────────

    [Fact]
    public void Bereken_AantalKinderenKloptInResultaat()
    {
        var svc = Create();
        var facts = new LegitimairePortieFacts(
            HeeftEigenaar: true,
            HeeftTestament: true,
            BurgerlijkeStaat: BurgerlijkeStaatFact.Alleenstaand,
            Kinderen: [MaakKind("K1", "X"), MaakKind("K2", "X"), MaakKind("K3", "X")],
            Begunstigden:
            [
                MaakBegunstigde("K1 X", 34m),
                MaakBegunstigde("K2 X", 33m),
                MaakBegunstigde("K3 X", 33m)
            ]);

        var result = svc.Bereken(facts);

        Assert.Equal(3, result.Resultaat.AantalKinderen);
    }

    [Fact]
    public void Bereken_AlleenstaandBurgerlijkeStaat_HeeftPartnerIsFalse()
    {
        var svc = Create();
        var kind = MaakKind("Jan", "K");
        var facts = new LegitimairePortieFacts(
            HeeftEigenaar: true,
            HeeftTestament: true,
            BurgerlijkeStaat: BurgerlijkeStaatFact.Alleenstaand,
            Kinderen: [kind],
            Begunstigden: [MaakBegunstigde("Jan K", 50m)]);

        var result = svc.Bereken(facts);

        Assert.False(result.Resultaat.HeeftPartner);
    }

    // ── Metadata ─────────────────────────────────────────────────────────

    [Fact]
    public void Bereken_RegelVersieWordtTeruggegeven()
    {
        var svc = Create();
        var kind = MaakKind("Jan", "Post");
        var facts = new LegitimairePortieFacts(
            HeeftEigenaar: true,
            HeeftTestament: true,
            BurgerlijkeStaat: BurgerlijkeStaatFact.Alleenstaand,
            Kinderen: [kind],
            Begunstigden: [MaakBegunstigde("Jan Post", 50m)]);

        var result = svc.Bereken(facts);

        Assert.Equal("2025.1", result.RegelVersie);
    }

    [Fact]
    public void Bereken_ToegepasteRegelsBevatBRLP01()
    {
        var svc = Create();
        var kind = MaakKind("Jan", "Post");
        var facts = new LegitimairePortieFacts(
            HeeftEigenaar: true,
            HeeftTestament: true,
            BurgerlijkeStaat: BurgerlijkeStaatFact.Alleenstaand,
            Kinderen: [kind],
            Begunstigden: [MaakBegunstigde("Jan Post", 50m)]);

        var result = svc.Bereken(facts);

        Assert.Contains(result.ToegepasteRegels, r => r.Contains("BR-LP-01"));
    }
}
