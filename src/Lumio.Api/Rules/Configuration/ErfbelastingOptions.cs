namespace Lumio.Api.Rules.Configuration;

/// <summary>
/// Erfbelasting tarieven, vrijstellingen en relatie-mapping.
/// Wijzigt jaarlijks — nu volledig configureerbaar via lumio-rules.json.
/// </summary>
public class ErfbelastingOptions
{
    public int Jaar { get; set; } = 2025;

    /// <summary>
    /// Geordende lijst van relatie-tarief mappings. Volgorde is belangrijk: eerste match wint.
    /// Specifiekere matches (kleinkind) staan vóór generieke (kind).
    /// </summary>
    public List<RelatieTariefOptions> RelatieTarieven { get; set; } =
    [
        new() { Naam = "Partner (Tariefgroep 1)",       Keywords = ["partner", "echtgen", "gehuwd", "samenwon"],  Vrijstelling = 795_156m, Schijf1Percentage = 0.10m, Schijf2Percentage = 0.20m, Schijf1Grens = 154_197m },
        new() { Naam = "Kleinkind (Tariefgroep 1a)",    Keywords = ["kleinkind", "kleinzoon", "kleindochter"],    Vrijstelling = 25_187m,  Schijf1Percentage = 0.18m, Schijf2Percentage = 0.36m, Schijf1Grens = 154_197m },
        new() { Naam = "Kind (Tariefgroep 1)",          Keywords = ["kind", "zoon", "dochter", "stief"],          Vrijstelling = 25_187m,  Schijf1Percentage = 0.10m, Schijf2Percentage = 0.20m, Schijf1Grens = 154_197m },
        new() { Naam = "Ouder (Tariefgroep 1)",         Keywords = ["ouder", "vader", "moeder"],                  Vrijstelling = 56_724m,  Schijf1Percentage = 0.10m, Schijf2Percentage = 0.20m, Schijf1Grens = 154_197m },
    ];

    /// <summary>Default tarief als geen relatie-keywords matchen (broers/zussen, overig).</summary>
    public RelatieTariefOptions DefaultTarief { get; set; } = new()
    {
        Naam = "Overig (Tariefgroep 2)",
        Keywords = [],
        Vrijstelling = 2_658m,
        Schijf1Percentage = 0.30m,
        Schijf2Percentage = 0.40m,
        Schijf1Grens = 154_197m
    };

    /// <summary>Kind-relatie keywords voor legitimaire portie berekening (BW 4:63–4:69).</summary>
    public string[] KindRelatiesLegitimairePortie { get; set; } =
        ["kind", "zoon", "dochter", "stiefkind", "stiefzoon", "stiefdochter"];

    public string DisclaimerTemplate { get; set; } =
        "Dit is een indicatieve berekening op basis van de erfbelastingtarieven {0}. " +
        "De werkelijke erfbelasting kan afwijken door testamentaire bepalingen, " +
        "huwelijkse voorwaarden, schenkingen en andere fiscale factoren. " +
        "Raadpleeg een notaris of belastingadviseur voor een exacte berekening.";

    /// <summary>Formatted disclaimer met het actuele belastingjaar.</summary>
    public string Disclaimer => string.Format(DisclaimerTemplate, Jaar);

    /// <summary>
    /// Bepaalt tariefgroep op basis van relatie-string (case-insensitive contains).
    /// Retourneert eerste match uit RelatieTarieven, of DefaultTarief.
    /// </summary>
    public RelatieTariefOptions BepaalTariefgroep(string relatie)
    {
        var rel = (relatie ?? "").Trim().ToLowerInvariant();

        foreach (var tarief in RelatieTarieven)
        {
            if (tarief.Keywords.Any(k => rel.Contains(k)))
                return tarief;
        }

        return DefaultTarief;
    }
}

/// <summary>Tariefgroep definitie met keywords, vrijstelling en tarief-schijven.</summary>
public class RelatieTariefOptions
{
    public string Naam { get; set; } = "";
    public string[] Keywords { get; set; } = [];
    public decimal Vrijstelling { get; set; }
    public decimal Schijf1Percentage { get; set; }
    public decimal Schijf2Percentage { get; set; }
    public decimal Schijf1Grens { get; set; }
}
