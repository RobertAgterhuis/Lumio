using Lumio.Api.Domain.Common;

namespace Lumio.Api.Domain.AssetRegistry;

public class ErfgenaamToewijzing : BaseEntity
{
    public Guid EigenaarId { get; set; }
    public Guid ErfgenaamId { get; set; }
    public Erfgenaam Erfgenaam { get; set; } = null!;
    public string EntityType { get; set; } = string.Empty; // FysiekBezit, Bankrekening, Verzekering, DigitaalAccount, CryptoWallet
    public Guid EntityId { get; set; }
    public string? Instructies { get; set; }
}
