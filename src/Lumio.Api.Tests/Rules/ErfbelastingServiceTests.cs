using Lumio.Api.Rules.Configuration;
using Lumio.Api.Rules.Facts;
using Lumio.Api.Rules.Services;
using Microsoft.Extensions.Options;

namespace Lumio.Api.Tests.Rules;

/// <summary>
/// Unit tests voor ErfbelastingService (SP-9-002).
/// Pure POCO tests — geen database, geen HTTP.
/// Tarieven 2025: kind vrijstelling €25.187, schijf1 10%, schijf2 20%, grens €154.197.
/// Partner vrijstelling €795.156, schijf1 10%, schijf2 20%.
/// </summary>
public class ErfbelastingServiceTests
{
    private static ErfbelastingService Create()
    {
        var erfOpts   = Options.Create(new ErfbelastingOptions());
        var rootOpts  = Options.Create(new LumioRulesOptions { Versie = "2025.1" });
        return new ErfbelastingService(erfOpts, rootOpts);
    }

    private static ErfgenaamFact MaakKind(string naam, decimal? portie = null)
        => new(Guid.NewGuid(), naam, "kind", portie);

    private static ErfgenaamFact MaakPartner(string naam, decimal? portie = null)
        => new(Guid.NewGuid(), naam, "partner", portie);

    // ── Leeg ─────────────────────────────────────────────────────────────

    [Fact]
    public void Bereken_GeenErfgenamen_GeeftLegeResultatenLijst()
    {
        var svc   = Create();
        var facts = new ErfbelastingFacts(NettoNalatenschap: 500_000m, Erfgenamen: []);

        var result = svc.Bereken(facts);

        Assert.Empty(result.Resultaat.Resultaten);
        Assert.Equal(0, result.Resultaat.AantalErfgenamen);
    }

    // ── Kind-tarief schijf 1 ─────────────────────────────────────────────

    [Fact]
    public void Bereken_KindSchijf1_BerekentBelastingCorrect()
    {
        var svc   = Create();
        // nalatenschap 100k, vrijstelling kind = 25.187, belastbaar = 74.813
        // belasting = 74.813 * 0.10 = 7.481,30
        var facts = new ErfbelastingFacts(
            NettoNalatenschap: 100_000m,
            Erfgenamen: [MaakKind("Jan")]);

        var result = svc.Bereken(facts);
        var e = result.Resultaat.Resultaten.Single();

        Assert.Equal(100_000m, e.BrutoDeel);
        Assert.Equal(25_187m,  e.Vrijstelling);
        var verwachteBelasting = Math.Round(74_813m * 0.10m, 2);
        Assert.Equal(verwachteBelasting, e.Erfbelasting);
    }

    [Fact]
    public void Bereken_KindSchijf1_TariefgroepNaamBevatKind()
    {
        var svc   = Create();
        var facts = new ErfbelastingFacts(100_000m, [MaakKind("Jan")]);

        var result = svc.Bereken(facts);

        Assert.Contains("Kind", result.Resultaat.Resultaten.Single().TariefGroep,
            StringComparison.OrdinalIgnoreCase);
    }

    // ── Kind-tarief schijf 2 ─────────────────────────────────────────────

    [Fact]
    public void Bereken_KindSchijf2_BerekentTweeSchijven()
    {
        var svc = Create();
        // nalatenschap 400.000; vrijstelling 25.187; belastbaar = 374.813
        // schijf1 grens = 154.197 → schijf1 belasting = 154.197 * 0.10 = 15.419,70
        // schijf2 = (374.813 - 154.197) * 0.20 = 220.616 * 0.20 = 44.123,20
        // totaal = 59.542,90
        var facts = new ErfbelastingFacts(400_000m, [MaakKind("Petra")]);

        var result = svc.Bereken(facts);
        var e = result.Resultaat.Resultaten.Single();

        var verwachteSchijf1 = Math.Round(154_197m * 0.10m, 2);
        var verwachteSchijf2 = Math.Round((374_813m - 154_197m) * 0.20m, 2);
        var verwacht = verwachteSchijf1 + verwachteSchijf2;
        Assert.Equal(verwacht, e.Erfbelasting);
    }

    // ── Partner-vrijstelling ─────────────────────────────────────────────

    [Fact]
    public void Bereken_PartnerOnderVrijstelling_GeeftNulBelasting()
    {
        var svc   = Create();
        // nalatenschap 300.000 — ruim onder partner vrijstelling 795.156
        var facts = new ErfbelastingFacts(300_000m, [MaakPartner("Marie")]);

        var result = svc.Bereken(facts);
        var e = result.Resultaat.Resultaten.Single();

        Assert.Equal(0m, e.Erfbelasting);
        Assert.Equal(0m, e.Belastbaar);
    }

    [Fact]
    public void Bereken_PartnerBovenVrijstelling_BerekentBelasting()
    {
        var svc = Create();
        // nalatenschap 1.000.000; vrijstelling partner 795.156; belastbaar = 204.844
        // schijf1: 154.197 * 0.10 = 15.419,70; schijf2: (204.844 - 154.197) * 0.20 = 50.647 * 0.20 = 10.129,40
        var facts = new ErfbelastingFacts(1_000_000m, [MaakPartner("Marie")]);

        var result = svc.Bereken(facts);
        var e = result.Resultaat.Resultaten.Single();

        Assert.True(e.Erfbelasting > 0m);
        Assert.Equal(795_156m, e.Vrijstelling);
    }

    // ── Overig (default tariefgroep) ──────────────────────────────────────

    [Fact]
    public void Bereken_OverigeRelatie_GebruiktDefaultTarief()
    {
        var svc   = Create();
        var broer = new ErfgenaamFact(Guid.NewGuid(), "Piet", "broer", null);
        var facts = new ErfbelastingFacts(100_000m, [broer]);

        var result = svc.Bereken(facts);
        var e = result.Resultaat.Resultaten.Single();

        // Vrijstelling 2.658 (overig tariefgroep 2)
        Assert.Equal(2_658m, e.Vrijstelling);
        // Percentage 30% omdat belastbaar < grens
        var verwacht = Math.Round((100_000m - 2_658m) * 0.30m, 2);
        Assert.Equal(verwacht, e.Erfbelasting);
    }

    // ── Portie override ──────────────────────────────────────────────────

    [Fact]
    public void Bereken_MetPortie_VerdeeltNalatenschapVolgensToegewezenPercentage()
    {
        var svc   = Create();
        // Nalatenschap 200.000; kind heeft 50% portie → bruto deel = 100.000
        var kind  = MaakKind("Tom", portie: 50m);
        var facts = new ErfbelastingFacts(200_000m, [kind]);

        var result = svc.Bereken(facts);
        var e = result.Resultaat.Resultaten.Single();

        Assert.Equal(100_000m, e.BrutoDeel);
    }

    [Fact]
    public void Bereken_MeerdereErfgenamen_ZonderPortieSplitGelijkmatig()
    {
        var svc   = Create();
        var facts = new ErfbelastingFacts(300_000m,
        [
            MaakKind("A"),
            MaakKind("B"),
            MaakKind("C")
        ]);

        var result = svc.Bereken(facts);

        Assert.All(result.Resultaat.Resultaten, e => Assert.Equal(100_000m, e.BrutoDeel));
    }

    // ── NettoDeel = BrutoDeel - Erfbelasting ─────────────────────────────

    [Fact]
    public void Bereken_NettoDeel_IsNaAftrrekVanBelasting()
    {
        var svc   = Create();
        var facts = new ErfbelastingFacts(200_000m, [MaakKind("Sara")]);

        var result = svc.Bereken(facts);
        var e = result.Resultaat.Resultaten.Single();

        Assert.Equal(e.BrutoDeel - e.Erfbelasting, e.NettoDeel);
    }

    // ── Metadata ────────────────────────────────────────────────────────

    [Fact]
    public void Bereken_AantalErfgenamen_KloptMetInput()
    {
        var svc   = Create();
        var facts = new ErfbelastingFacts(300_000m, [MaakKind("K1"), MaakKind("K2")]);

        var result = svc.Bereken(facts);

        Assert.Equal(2, result.Resultaat.AantalErfgenamen);
    }

    [Fact]
    public void Bereken_RegelVersieWordtTeruggegeven()
    {
        var svc   = Create();
        var facts = new ErfbelastingFacts(100_000m, [MaakKind("Jan")]);

        var result = svc.Bereken(facts);

        Assert.Equal("2025.1", result.RegelVersie);
    }

    [Fact]
    public void Bereken_DisclaimerIsGevuld()
    {
        var svc   = Create();
        var facts = new ErfbelastingFacts(100_000m, [MaakKind("Jan")]);

        var result = svc.Bereken(facts);

        Assert.False(string.IsNullOrWhiteSpace(result.Resultaat.Disclaimer));
    }
}
