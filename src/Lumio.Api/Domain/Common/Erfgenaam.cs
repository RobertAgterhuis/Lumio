namespace Lumio.Api.Domain.Common;

public class Erfgenaam : BaseEntity
{
    public Guid EigenaarId { get; set; }
    public Eigenaar Eigenaar { get; set; } = null!;

    public string Voornaam { get; set; } = string.Empty;
    public string Achternaam { get; set; } = string.Empty;
    public string? Tussenvoegsel { get; set; }
    public string Relatie { get; set; } = string.Empty;
    public string? Telefoon { get; set; }
    public string? Email { get; set; }
    public string? Adres { get; set; }
    public string? Postcode { get; set; }
    public string? Woonplaats { get; set; }
    public DateOnly? Geboortedatum { get; set; }
    public string? BSN { get; set; }
    public int? ShareIndex { get; set; }
    public bool HeeftShareOntvangen { get; set; }
    public DateTime? ShareUitgegevenOp { get; set; }

    // P-M17: Legitimatiegegevens
    public LegitimatieSoort LegitimatieSoort { get; set; } = LegitimatieSoort.Geen;
    public string? LegitimatieNummer { get; set; }
    public DateOnly? LegitimatieDatumAfgifte { get; set; }
    public DateOnly? LegitimatieGeldigTot { get; set; }
}
