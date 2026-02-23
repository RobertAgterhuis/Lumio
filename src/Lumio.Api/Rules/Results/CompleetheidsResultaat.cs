namespace Lumio.Api.Rules.Results;

/// <summary>
/// Resultaat van compleetheidsberekening (simpel + granulair).
/// </summary>
public record CompleetheidsResultaat(
    int Percentage,
    int AantalIngevuld,
    int Totaal,
    List<DomeinCompleetheid> Domeinen);

public record DomeinCompleetheid(
    string Domein,
    string Label,
    int Ingevuld,
    int Totaal);
