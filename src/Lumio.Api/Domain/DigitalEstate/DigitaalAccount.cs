using Lumio.Api.Domain.Common;

namespace Lumio.Api.Domain.DigitalEstate;

public class DigitaalAccount : BaseEntity
{
    public Guid EigenaarId { get; set; }
    public string PlatformNaam { get; set; } = string.Empty;
    public string? Categorie { get; set; }
    public string? Gebruikersnaam { get; set; }
    public string? EmailAdres { get; set; }
    public string? Url { get; set; }
    public string GewensteActie { get; set; } = string.Empty;
    public string? OverdrachtAan { get; set; }
    public string? Notities { get; set; }
}
