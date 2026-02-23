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
    public static (decimal Bruto, decimal Netto) Bereken(
        decimal totaalBezittingen,
        decimal totaalSaldi,
        decimal totaalVerzekeringen,
        decimal totaalSchulden)
    {
        var bruto = totaalBezittingen + totaalSaldi + totaalVerzekeringen;
        var netto = bruto - totaalSchulden;
        return (bruto, netto);
    }
}
