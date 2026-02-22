using Lumio.Api.Domain.Common;

namespace Lumio.Api.Domain.AssetRegistry;

public class FysiekBezit : BaseEntity
{
    public Guid EigenaarId { get; set; }
    public string Categorie { get; set; } = string.Empty;
    public string Omschrijving { get; set; } = string.Empty;
    public decimal? GeschatteWaarde { get; set; }
    public string? Locatie { get; set; }
    public string? BestemdeErfgenaam { get; set; }
    public VermogensSoort VermogensSoort { get; set; } = VermogensSoort.Prive;
    public string? Notities { get; set; }
}
