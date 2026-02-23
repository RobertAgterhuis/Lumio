namespace Lumio.Api.Rules.Results;

/// <summary>
/// Resultaat van netto-nalatenschapberekening.
/// </summary>
public record NalatenschapResultaat(
    decimal TotaalBezittingen,
    decimal TotaalSaldi,
    decimal TotaalVerzekeringen,
    decimal TotaalSchulden,
    decimal BrutoNalatenschap,
    decimal NettoNalatenschap);
