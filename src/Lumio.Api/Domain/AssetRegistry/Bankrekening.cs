using Lumio.Api.Domain.Common;

namespace Lumio.Api.Domain.AssetRegistry;

public class Bankrekening : BaseEntity
{
    public Guid EigenaarId { get; set; }
    public string BankNaam { get; set; } = string.Empty;
    public string IBAN { get; set; } = string.Empty;
    public string RekeningType { get; set; } = string.Empty;
    public decimal? Saldo { get; set; }
    public VermogensSoort VermogensSoort { get; set; } = VermogensSoort.Prive;
    public string? Notities { get; set; }
}
