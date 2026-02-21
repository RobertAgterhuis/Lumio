namespace Lumio.Api.Domain.Common;

public class Eigenaar : BaseEntity
{
    public string Voornaam { get; set; } = string.Empty;
    public string Achternaam { get; set; } = string.Empty;
    public string? Tussenvoegsel { get; set; }
    public DateOnly Geboortedatum { get; set; }
    public string? BSN { get; set; }
    public string? Adres { get; set; }
    public string? Postcode { get; set; }
    public string? Woonplaats { get; set; }
    public string? Telefoon { get; set; }
    public string? Email { get; set; }
    public string? Notaris { get; set; }
    public string? NotarisKantoor { get; set; }
    public string? NotarisTelefoon { get; set; }
    public string? NotarisEmail { get; set; }
    public string? NotarisAdres { get; set; }
    public string? NotarisPostcode { get; set; }
    public string? NotarisPlaats { get; set; }
}
