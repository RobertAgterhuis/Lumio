using Lumio.Api.Domain.Common;

namespace Lumio.Api.Domain.FuneralWishes;

public class UitvaartWensen : BaseEntity
{
    public Guid EigenaarId { get; set; }
    public Eigenaar Eigenaar { get; set; } = null!;

    public string VoorkeurType { get; set; } = string.Empty;
    public string? Begraafplaats { get; set; }
    public string? UitvaartOndernemer { get; set; }
    public bool HeeftUitvaartVerzekering { get; set; }
    public string? UitvaartVerzekeringDetails { get; set; }
    public string? CeremonieSoort { get; set; }
    public string? CeremonieLocatie { get; set; }
    public string? Muziekwensen { get; set; }
    public string? Sprekers { get; set; }
    public string? Bloemen { get; set; }
    public string? Kledingwensen { get; set; }
    public string? RouwkaartTekst { get; set; }
    public string? Condoleance { get; set; }
    public string? OverigeWensen { get; set; }

    public List<CeremonieDetail> CeremonieDetails { get; set; } = [];
}
