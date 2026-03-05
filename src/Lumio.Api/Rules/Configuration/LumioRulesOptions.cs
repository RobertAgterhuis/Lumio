namespace Lumio.Api.Rules.Configuration;

/// <summary>
/// Root-configuratieklasse voor alle geëxternaliseerde Lumio business rules.
/// Gebonden vanuit rules/lumio-rules.json via IOptions&lt;T&gt;.
/// </summary>
public class LumioRulesOptions
{
    public string Versie { get; set; } = "2025.1";
    public string LaatstGewijzigd { get; set; } = "2025-01-01";

    /// <summary>
    /// Voertuig-specifieke regels: depreciatietabel voor restwaardebepaling.
    /// </summary>
    public VoertuigRules? Voertuig { get; set; }
}
