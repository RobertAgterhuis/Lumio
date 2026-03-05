namespace Lumio.Api.Rules.Configuration;

/// <summary>
/// Configuratie voor voertuigwaardering en depreciatieberekening.
/// </summary>
public class VoertuigRules
{
    /// <summary>
    /// Depreciatietabel voor restwaarde berekening per voertuigleeftijd.
    /// Mapping: jaren sinds aankoop (jarenMeeRekenen) → restwaardeFractie (percentage van geschatte waarde).
    /// </summary>
    public List<DepreciationTableRow> DepreciatieTabel { get; set; } = new();

    /// <summary>
    /// Disclaimer tekst voor restwaardebepaling (optioneel).
    /// </summary>
    public string? Beschrijving { get; set; }
}

/// <summary>
/// Één rij in de depreciatietabel: jaren sinds aankoop → restwaardeFractie.
/// </summary>
public class DepreciationTableRow
{
    /// <summary>
    /// Jaren (inclusief) tot deze restwaardeFractie van toepassing is.
    /// Bv. "1" betekent: voertuigen tot 1 jaar oud krijgen restwaardeFractie van deze rij.
    /// </summary>
    public int JarenMeeRekenen { get; set; }

    /// <summary>
    /// Restwaardeilfractie als decimaal (0.0 - 1.0).
    /// Bv. 0.75 betekent: houdt 75% van geschatte waarde.
    /// </summary>
    public decimal RestwaardeFractie { get; set; }

    /// <summary>
    /// Humaan-leesbare beschrijving voor deze rij (optioneel).
    /// </summary>
    public string? Beschrijving { get; set; }
}
