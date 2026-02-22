using Lumio.Api.Domain.Common;

namespace Lumio.Api.Domain.AssetRegistry;

public class Verzekering : BaseEntity
{
    public Guid EigenaarId { get; set; }
    public string Verzekeraar { get; set; } = string.Empty;
    public string? VerzekeraarTelefoon { get; set; }
    public string? VerzekeraarEmail { get; set; }
    public string PolisNummer { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public decimal? VerzekerdBedrag { get; set; }
    public string? Begunstigde { get; set; }
    public VermogensSoort VermogensSoort { get; set; } = VermogensSoort.Prive;
    public string? Notities { get; set; }
}
