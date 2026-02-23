namespace Lumio.Api.Rules.Configuration;

/// <summary>
/// Maximale veldlengtes voor validatie.
/// </summary>
public class VeldLengtesOptions
{
    public int NaamMax { get; set; } = 100;
    public int TussenvoegselMax { get; set; } = 20;
    public int PostcodeMax { get; set; } = 10;
    public int EmailMax { get; set; } = 254;
    public int TelefoonMax { get; set; } = 20;
    public int AdresMax { get; set; } = 200;
    public int OmschrijvingMax { get; set; } = 500;
    public int NotitieMax { get; set; } = 2000;
    public int UrlMax { get; set; } = 2048;
}
