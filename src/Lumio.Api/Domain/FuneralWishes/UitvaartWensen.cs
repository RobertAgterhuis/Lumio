using Lumio.Api.Domain.Common;

namespace Lumio.Api.Domain.FuneralWishes;

public class UitvaartWensen : BaseEntity
{
    public Guid EigenaarId { get; set; }
    public Eigenaar Eigenaar { get; set; } = null!;

    // SharedContact FK voor uitvaartondernemer
    public Guid? UitvaartOndernemerContactId { get; set; }
    public SharedContact? UitvaartOndernemerContact { get; set; }

    public string VoorkeurType { get; set; } = string.Empty;
    public string? Begraafplaats { get; set; }
    public bool HeeftUitvaartVerzekering { get; set; }
    public string? UitvaartVerzekeringDetails { get; set; }
    public string? CeremonieSoort { get; set; }
    public string? CeremonieLocatie { get; set; }
    public string? Muziekwensen { get; set; }
    public string? Sprekers { get; set; }
    public string? Bloemen { get; set; }
    public string? Kledingwensen { get; set; }
    public string? RouwkaartTekst { get; set; }
    public string? RouwadvertentieTekst { get; set; }
    public string? Condoleance { get; set; }
    public string? OverigeWensen { get; set; }

    // P-M14: Locatie-voorkeuren
    public string? VoorkeurBegraafplaatsNaam { get; set; }
    public string? VoorkeurBegraafplaatsAdres { get; set; }
    public string? VoorkeurCrematoriumnaam { get; set; }
    public string? VoorkeurCrematoriumAdres { get; set; }
    public string? VoorkeurAulaNaam { get; set; }
    public string? VoorkeurAulaAdres { get; set; }

    // P-S16: Budgetrichting
    public string? BudgetRichting { get; set; }

    // S4-09: Datum opgesteld
    public DateOnly? DatumOpgesteld { get; set; }

    public List<CeremonieDetail> CeremonieDetails { get; set; } = [];
    public List<UitvaartGenodigde> Genodigden { get; set; } = [];
}
