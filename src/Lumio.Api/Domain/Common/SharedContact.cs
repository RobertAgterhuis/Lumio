using System.ComponentModel.DataAnnotations.Schema;

namespace Lumio.Api.Domain.Common;

/// <summary>/// Centrale opslag voor contactpersonen en professionals die in meerdere domeinen
/// worden gebruikt (notaris, huisarts, uitvaartondernemer, etc.).
/// Voorkomt duplicatie van contactgegevens en zorgt voor data consistentie.
/// </summary>
public class SharedContact : BaseEntity
{
    public Guid EigenaarId { get; set; }
    public Eigenaar Eigenaar { get; set; } = null!;

    /// <summary>
    /// Type contact: Notaris, Huisarts, Uitvaartondernemer, etc.
    /// </summary>
    public ContactType Type { get; set; }

    /// <summary>
    /// Optioneel subtype voor nadere classificatie (bijv. "Executeur", "Vertegenwoordiger")
    /// </summary>
    public string? SubType { get; set; }

    // Persoonlijke gegevens
    public string Naam { get; set; } = string.Empty;
    public string? Relatie { get; set; }
    public string? Telefoon { get; set; }
    public string? Email { get; set; }
    public string? Adres { get; set; }
    public string? Postcode { get; set; }
    public string? Woonplaats { get; set; }

    // Organisatie gegevens (voor professionals)
    /// <summary>
    /// Bedrijfsnaam / kantoornaam (bijv. "Notariskantoor De Jong", "Huisartsenpraktijk Centrum")
    /// </summary>
    public string? BedrijfsNaam { get; set; }

    /// <summary>
    /// Functie binnen organisatie (bijv. "Huisarts", "Junior Notaris")
    /// </summary>
    public string? Functie { get; set; }

    /// <summary>
    /// Vrije notities over dit contact
    /// </summary>
    public string? Notities { get; set; }

    /// <summary>
    /// Indien true, wordt dit contact gedeeld tussen meerdere profielen (bijv. partners met zelfde notaris)
    /// </summary>
    public bool IsGedeeld { get; set; }

    [NotMapped]
    public string VolledigeNaam
    {
        get
        {
            var naam = Naam;
            if (!string.IsNullOrEmpty(BedrijfsNaam))
                naam += $" ({BedrijfsNaam})";
            return naam;
        }
    }

    [NotMapped]
    public string VolledigAdres
    {
        get
        {
            if (string.IsNullOrEmpty(Adres))
                return string.Empty;

            var parts = new List<string> { Adres };
            if (!string.IsNullOrEmpty(Postcode))
                parts.Add(Postcode);
            if (!string.IsNullOrEmpty(Woonplaats))
                parts.Add(Woonplaats);

            return string.Join(", ", parts);
        }
    }
}

/// <summary>
/// Classificatie van contact types
/// </summary>
public enum ContactType
{
    /// <summary>Notaris (testament, legalisatie)</summary>
    Notaris = 1,

    /// <summary>Huisarts (medische zorg, wilsverklaring euthanasie)</summary>
    Huisarts = 2,

    /// <summary>Uitvaartondernemer (uitvaartwensen)</summary>
    Uitvaartondernemer = 3,

    /// <summary>Executeur van testament</summary>
    Executeur = 4,

    /// <summary>Vertegenwoordiger (wilsverklaring euthanasie)</summary>
    Vertegenwoordiger = 5,

    /// <summary>Familie lid</summary>
    Familie = 6,

    /// <summary>Vriend of kennis</summary>
    Vriend = 7,

    /// <summary>Andere professional (accountant, advocaat, etc.)</summary>
    Professional = 8,

    /// <summary>Anders / niet geclassificeerd</summary>
    Anders = 9
}
