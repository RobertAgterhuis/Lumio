namespace Lumio.Api.Rules;

/// <summary>
/// Gecentraliseerde berekening van bruto- en netto nalatenschap.
/// Elimineert de 3× duplicatie in BoedelController, ErfgenamenController en StatusController.
/// </summary>
public static class NalatenschapHelper
{
    /// <summary>
    /// Berekent bruto- en netto nalatenschap op basis van de vier vermogenscomponenten.
    /// </summary>
    /// <param name="totaalBezittingen">Totaalwaarde fysieke bezittingen.</param>
    /// <param name="totaalSaldi">Totaal saldo van bankrekeningen.</param>
    /// <param name="totaalVerzekeringen">Totaal verzekerd bedrag (alle verzekeringen).</param>
    /// <param name="totaalSchulden">Totaal schulden.</param>
    /// <param name="verzekeringenMetBegunstigde">
    /// S5-14: Verzekeringen met een benoemde begunstigde vallen buiten de nalatenschap
    /// (uitkering gaat rechtstreeks naar de begunstigde, bypasses estate).
    /// </param>
    public static (decimal Bruto, decimal Netto) Bereken(
        decimal totaalBezittingen,
        decimal totaalSaldi,
        decimal totaalVerzekeringen,
        decimal totaalSchulden,
        decimal verzekeringenMetBegunstigde = 0m)
    {
        // Alleen verzekeringen zonder begunstigde tellen mee in de nalatenschap
        var verzekeringenInNalatenschap = totaalVerzekeringen - verzekeringenMetBegunstigde;
        var bruto = totaalBezittingen + totaalSaldi + verzekeringenInNalatenschap;
        var netto = bruto - totaalSchulden;
        return (bruto, netto);
    }
}
