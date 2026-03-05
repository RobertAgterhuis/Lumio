using Lumio.Api.Domain.Common;

namespace Lumio.Api.Domain.AssetRegistry;

public class FysiekBezit : BaseEntity
{
    public Guid EigenaarId { get; set; }
    public string Categorie { get; set; } = string.Empty;
    public string Omschrijving { get; set; } = string.Empty;
    public decimal? GeschatteWaarde { get; set; }
    public string? Locatie { get; set; }
    public Guid? BestemdeErfgenaamId { get; set; }
    public Erfgenaam? BestemdeErfgenaam { get; set; }
    public VermogensSoort VermogensSoort { get; set; } = VermogensSoort.Prive;
    public string? Notities { get; set; }

    // P-S3: Registerreferenties
    public string? KadastraalNummer { get; set; }
    public string? Kenteken { get; set; }
    public string? KvKNummer { get; set; }

    // RDW: Voertuig-specifieke velden
    public int? BouwJaar { get; set; }          // Bouwjaar voor depreciatieberekening
    public decimal? RestWaarde { get; set; }    // Read-only berekend op basis van depreciatietabel

    // Relatie naar kentekenbewijzen via DocumentGroepId
    public Guid? KentekenBewijsDocumentGroepId { get; set; }

    // Gekoppelde schulden / financieringsverplichtingen
    public ICollection<Schuld> LinkedSchulden { get; set; } = new List<Schuld>();
}
