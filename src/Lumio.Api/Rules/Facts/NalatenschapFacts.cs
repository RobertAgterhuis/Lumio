namespace Lumio.Api.Rules.Facts;

/// <summary>
/// Feiten voor netto-nalatenschapberekening.
/// </summary>
public record NalatenschapFacts(
    decimal TotaalBezittingen,
    decimal TotaalSaldi,
    decimal TotaalVerzekeringen,
    decimal TotaalSchulden);
