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

    // RDW: Voertuig-specifieke velden (uitgebreide RDW profiel)
    public int? BouwJaar { get; set; }              // Bouwjaar voor depreciatieberekening
    public decimal? RestWaarde { get; set; }        // Read-only berekend op basis van depreciatietabel
    public decimal? CatalogusWaarde { get; set; }   // OVI (Officiële Verkoopwaarde Index) van RDW - startpunt voor RestWaarde berekening
    public string? Merk { get; set; }               // Merk (VOLVO, BMW, etc.)
    public string? Model { get; set; }              // Model/Handelsbenaming (XC60, 3-Serie, etc.)
    public string? Voertuigklasse { get; set; }     // Klasse (Personenauto, Bedrijfsvoertuig, etc.)
    public string? Brandstof { get; set; }          // Brandstoftype (Benzine, Diesel, Elektrisch, etc.)
    public int? Vermogen { get; set; }              // Vermogen in kW (relevant voor belasting/verzekering)
    public int? AantalCilinders { get; set; }       // Aantal cilinders (relevant voor voertuigwaarde)
    public int? CilinderInhoud { get; set; }        // Cilinderinhoud in cc (relevant voor belasting)
    public string? Kleur { get; set; }              // Voertuigkleur (identificatie + verzekering)
    public decimal? MassaRijklaar { get; set; }     // Massa rijklaar in kg (verzekering/belasting)
    public int? AantalZitplaatsen { get; set; }     // Aantal plaatsen (verzekeringsgroep)
    public string? Transmissie { get; set; }        // Handeling/automaat (waarde indicator)

    // Relatie naar kentekenbewijzen via DocumentGroepId
    public Guid? KentekenBewijsDocumentGroepId { get; set; }

    // Gekoppelde schulden / financieringsverplichtingen
    public ICollection<Schuld> LinkedSchulden { get; set; } = new List<Schuld>();
}
