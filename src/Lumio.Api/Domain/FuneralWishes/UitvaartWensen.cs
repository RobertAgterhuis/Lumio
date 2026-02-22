using Lumio.Api.Domain.Common;

namespace Lumio.Api.Domain.FuneralWishes;

public class UitvaartWensen : BaseEntity
{
    public Guid EigenaarId { get; set; }
    public Eigenaar Eigenaar { get; set; } = null!;

    public string VoorkeurType { get; set; } = string.Empty;
    public string? Begraafplaats { get; set; }
    public string? UitvaartOndernemer { get; set; }
    public string? UitvaartOndernemerTelefoon { get; set; }
    public string? UitvaartOndernemerEmail { get; set; }
    public string? UitvaartOndernemerAdres { get; set; }
    public string? UitvaartOndernemerPostcode { get; set; }
    public string? UitvaartOndernemerPlaats { get; set; }
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

    public List<CeremonieDetail> CeremonieDetails { get; set; } = [];
}
