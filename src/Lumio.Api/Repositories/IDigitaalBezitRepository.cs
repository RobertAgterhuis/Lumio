using Lumio.Api.Domain.DigitalEstate;

namespace Lumio.Api.Repositories;

/// <summary>
/// Repository interface for digital estate entities: DigitaalAccount, WachtwoordEntry, CryptoWallet.
/// Introduced in SP-14-003.
/// </summary>
public interface IDigitaalBezitRepository
{
    Task<Guid?> GetEigenaarIdAsync();

    // DigitaalAccount
    Task<List<DigitaalAccount>> GetAccountsAsync(Guid eigenaarId);
    Task<DigitaalAccount?> FindAccountAsync(Guid id);
    Task AddAsync(DigitaalAccount item);
    Task RemoveAsync(DigitaalAccount item);

    // WachtwoordEntry
    Task<List<WachtwoordEntry>> GetWachtwoordenAsync(Guid eigenaarId);
    Task<WachtwoordEntry?> FindWachtwoordAsync(Guid id);
    Task AddAsync(WachtwoordEntry item);
    Task RemoveAsync(WachtwoordEntry item);

    // CryptoWallet
    Task<List<CryptoWallet>> GetCryptoWalletsAsync(Guid eigenaarId);
    Task<CryptoWallet?> FindCryptoWalletAsync(Guid id);
    Task AddAsync(CryptoWallet item);
    Task RemoveAsync(CryptoWallet item);

    Task CommitAsync();
}
