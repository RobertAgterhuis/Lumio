using Lumio.Api.Rules.Configuration;
using Lumio.Api.Rules.Facts;
using Lumio.Api.Rules.Services;
using Microsoft.Extensions.Options;

namespace Lumio.Api.Tests.Rules;

/// <summary>
/// Unit tests voor NalatenschapService (SP-9-002).
/// Pure POCO tests — geen database, geen HTTP.
/// </summary>
public class NalatenschapServiceTests
{
    private static NalatenschapService Create()
    {
        var opts = Options.Create(new LumioRulesOptions { Versie = "2025.1" });
        return new NalatenschapService(opts);
    }

    // ── Positieve netto ──────────────────────────────────────────────────

    [Fact]
    public void Bereken_PositiefNetto_GeeftCorrectNetto()
    {
        var svc = Create();
        var facts = new NalatenschapFacts(
            TotaalBezittingen: 400_000m,
            TotaalSaldi: 50_000m,
            TotaalVerzekeringen: 25_000m,
            TotaalSchulden: 100_000m);

        var result = svc.Bereken(facts);

        // bruto = 400k + 50k + 25k = 475k; netto = 475k - 100k = 375k
        Assert.Equal(475_000m, result.Resultaat.BrutoNalatenschap);
        Assert.Equal(375_000m, result.Resultaat.NettoNalatenschap);
    }

    [Fact]
    public void Bereken_PositiefNetto_GeenWaarschuwingen()
    {
        var svc = Create();
        var facts = new NalatenschapFacts(200_000m, 0m, 0m, 50_000m);

        var result = svc.Bereken(facts);

        Assert.Empty(result.Waarschuwingen);
    }

    // ── Negatieve netto ──────────────────────────────────────────────────

    [Fact]
    public void Bereken_NegatiefNetto_GeeftWaarschuwing()
    {
        var svc = Create();
        var facts = new NalatenschapFacts(
            TotaalBezittingen: 50_000m,
            TotaalSaldi: 0m,
            TotaalVerzekeringen: 0m,
            TotaalSchulden: 150_000m);

        var result = svc.Bereken(facts);

        Assert.True(result.Resultaat.NettoNalatenschap < 0);
        Assert.Single(result.Waarschuwingen);
        Assert.Contains("negatief", result.Waarschuwingen[0], StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void Bereken_NegatiefNetto_NettoWaardeBerekeningKlopt()
    {
        var svc = Create();
        var facts = new NalatenschapFacts(30_000m, 0m, 0m, 80_000m);

        var result = svc.Bereken(facts);

        Assert.Equal(-50_000m, result.Resultaat.NettoNalatenschap);
    }

    // ── Nul-waarden ──────────────────────────────────────────────────────

    [Fact]
    public void Bereken_AllesNul_GeeftNulNetto()
    {
        var svc = Create();
        var facts = new NalatenschapFacts(0m, 0m, 0m, 0m);

        var result = svc.Bereken(facts);

        Assert.Equal(0m, result.Resultaat.NettoNalatenschap);
        Assert.Equal(0m, result.Resultaat.BrutoNalatenschap);
        Assert.Empty(result.Waarschuwingen);
    }

    // ── Saldi en verzekeringen worden meegerekend ─────────────────────────

    [Fact]
    public void Bereken_SaldiEnVerzekeringenTellenMeeInBruto()
    {
        var svc = Create();
        var facts = new NalatenschapFacts(
            TotaalBezittingen: 0m,
            TotaalSaldi: 10_000m,
            TotaalVerzekeringen: 20_000m,
            TotaalSchulden: 0m);

        var result = svc.Bereken(facts);

        Assert.Equal(30_000m, result.Resultaat.BrutoNalatenschap);
        Assert.Equal(30_000m, result.Resultaat.NettoNalatenschap);
    }

    // ── ResultaatVelden ──────────────────────────────────────────────────

    [Fact]
    public void Bereken_ResultaatBevatInputWaarden()
    {
        var svc = Create();
        var facts = new NalatenschapFacts(300_000m, 10_000m, 5_000m, 80_000m);

        var result = svc.Bereken(facts);

        Assert.Equal(300_000m, result.Resultaat.TotaalBezittingen);
        Assert.Equal(10_000m,  result.Resultaat.TotaalSaldi);
        Assert.Equal(5_000m,   result.Resultaat.TotaalVerzekeringen);
        Assert.Equal(80_000m,  result.Resultaat.TotaalSchulden);
    }

    [Fact]
    public void Bereken_RegelVersieWordtTeruggegeven()
    {
        var svc = Create();
        var facts = new NalatenschapFacts(100_000m, 0m, 0m, 0m);

        var result = svc.Bereken(facts);

        Assert.Equal("2025.1", result.RegelVersie);
    }

    [Fact]
    public void Bereken_ToegepasteRegelsBevatBR048()
    {
        var svc = Create();
        var facts = new NalatenschapFacts(100_000m, 0m, 0m, 0m);

        var result = svc.Bereken(facts);

        Assert.Contains(result.ToegepasteRegels, r => r.Contains("BR-048"));
    }
}
