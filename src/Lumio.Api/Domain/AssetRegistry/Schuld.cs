using Lumio.Api.Domain.Common;

namespace Lumio.Api.Domain.AssetRegistry;

public class Schuld : BaseEntity
{
    public Guid EigenaarId { get; set; }
    public string Schuldeiser { get; set; } = string.Empty;
    public string? SchuldeiserTelefoon { get; set; }
    public string? SchuldeiserEmail { get; set; }
    public string Type { get; set; } = string.Empty;
    public decimal Bedrag { get; set; }
    public decimal? MaandelijkseAflossing { get; set; }
    public string? Referentie { get; set; }
    public VermogensSoort VermogensSoort { get; set; } = VermogensSoort.Prive;
    public string? Notities { get; set; }
}
