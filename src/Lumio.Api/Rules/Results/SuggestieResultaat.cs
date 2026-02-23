namespace Lumio.Api.Rules.Results;

/// <summary>
/// Resultaat van automatische suggestie-analyse (gekoppelde profielen P-C14).
/// </summary>
public record SuggestieResultaat(
    int AantalSuggesties,
    List<Suggestie> Suggesties);

public record Suggestie(
    string Categorie,
    string Melding,
    string Actie);
