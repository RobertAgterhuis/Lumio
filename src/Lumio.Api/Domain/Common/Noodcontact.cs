namespace Lumio.Api.Domain.Common;

public class Noodcontact : BaseEntity
{
    public Guid EigenaarId { get; set; }
    public string Naam { get; set; } = string.Empty;
    public string Relatie { get; set; } = string.Empty;
    public string? Telefoon { get; set; }
    public string? Email { get; set; }
    public string? Adres { get; set; }
    public string? Postcode { get; set; }
    public string? Woonplaats { get; set; }
    public string Rol { get; set; } = string.Empty;
    public string? Instructies { get; set; }

    // Organisatiecontext (professionele en juridische rollen)
    public string? BedrijfsNaam { get; set; }
    public string? Functie { get; set; }

    /// <summary>
    /// Belprioriteitsvolgorde: 1 = eerst bellen, 2 = daarna, 3 = later.
    /// </summary>
    public int Prioriteit { get; set; } = 3;

    /// <summary>
    /// Markeer als gedeeld contact — bijv. huisarts, notaris of uitvaartondernemer
    /// die voor meerdere profielen (partners) gelden.
    /// </summary>
    public bool IsGedeeld { get; set; }
}
