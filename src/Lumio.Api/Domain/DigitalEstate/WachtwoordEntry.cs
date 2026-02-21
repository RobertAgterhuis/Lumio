using Lumio.Api.Domain.Common;

namespace Lumio.Api.Domain.DigitalEstate;

public class WachtwoordEntry : BaseEntity
{
    public Guid EigenaarId { get; set; }
    public string Naam { get; set; } = string.Empty;
    public string? Gebruikersnaam { get; set; }
    public string EncryptedWachtwoord { get; set; } = string.Empty;
    public string? Url { get; set; }
    public string? Notities { get; set; }
}
