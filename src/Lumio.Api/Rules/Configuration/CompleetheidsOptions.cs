namespace Lumio.Api.Rules.Configuration;

/// <summary>
/// Compleetheid-scoring configuratie: cap-waarden per domein voor granulaire voortgang.
/// </summary>
public class CompleetheidsOptions
{
    /// <summary>Maximaal aantal items dat meetelt per domein (cap).</summary>
    public int DigitaalBezitCap { get; set; } = 3;
    public int DocumentenCap { get; set; } = 3;
    public int ErfgenamenCap { get; set; } = 2;
    public int NoodcontactenCap { get; set; } = 2;

    /// <summary>Aantal verwachte velden per domein (als entiteit ontbreekt).</summary>
    public int EigenaarVelden { get; set; } = 8;
    public int TestamentVelden { get; set; } = 6;
    public int EuthanasieVelden { get; set; } = 5;
    public int DonorVelden { get; set; } = 1;
    public int UitvaartVelden { get; set; } = 4;
}
