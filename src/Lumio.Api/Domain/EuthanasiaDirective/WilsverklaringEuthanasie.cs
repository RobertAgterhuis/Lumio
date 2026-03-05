using Lumio.Api.Domain.Common;

namespace Lumio.Api.Domain.EuthanasiaDirective;

public class WilsverklaringEuthanasie : BaseEntity
{
    public Guid EigenaarId { get; set; }
    public Eigenaar Eigenaar { get; set; } = null!;

    // SharedContact FKs
    public Guid? HuisartsContactId { get; set; }
    public SharedContact? HuisartsContact { get; set; }
    public Guid? VertegenwoordigerContactId { get; set; }
    public SharedContact? VertegenwoordigerContact { get; set; }
    public Guid? Vertegenwoordiger2ContactId { get; set; }
    public SharedContact? Vertegenwoordiger2Contact { get; set; }

    public DateOnly? DatumOndertekening { get; set; }
    public bool WilEuthanasie { get; set; }
    public string? SituatieBeschrijving { get; set; }
    public string? AanvullendeWensen { get; set; }
    /// <summary>JSON-array van geselecteerde situatie-opties (bijv. ["Dementie","Coma"]).</summary>
    public string? SituatieOpties { get; set; }
    public string? SituatieNotitie { get; set; }

    // S8 — Wettelijk conforme document-generatie
    public bool DementieClausule { get; set; }
    public string? DementieClausuleToelichting { get; set; }
    public string? BehandelVerbod { get; set; }

    public List<EuthanasieVoorwaarde> Voorwaarden { get; set; } = [];
}
