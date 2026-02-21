using Lumio.Api.Domain.Common;

namespace Lumio.Api.Domain.DigitalEstate;

public class CryptoWallet : BaseEntity
{
    public Guid EigenaarId { get; set; }
    public string WalletNaam { get; set; } = string.Empty;
    public string CryptoType { get; set; } = string.Empty;
    public string? WalletAdres { get; set; }
    public string? EncryptedSeedPhrase { get; set; }
    public string? Exchange { get; set; }
    public string? Notities { get; set; }
}
