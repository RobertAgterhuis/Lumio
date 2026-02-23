namespace Lumio.Api.Rules.Results;

/// <summary>
/// Resultaat van meldingenberekening — waarschuwingen en herinneringen.
/// </summary>
public record MeldingResultaat(
    List<Melding> Meldingen,
    int Aantal);

public record Melding(
    string Type,
    string Categorie,
    string Bericht,
    string Actie);
