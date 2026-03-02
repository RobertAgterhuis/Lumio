using Lumio.Api.Domain.AssetRegistry;

namespace Lumio.Api.Repositories;

/// <summary>
/// Repository interface for boedel entities: FysiekBezit, Bankrekening, Verzekering, Schuld.
/// Introduced in SP-14-003.
/// </summary>
public interface IBoedelRepository
{
    Task<Guid?> GetEigenaarIdAsync();

    // FysiekBezit
    Task<List<FysiekBezit>> GetBezittingenWithNavigationAsync();
    Task<List<FysiekBezit>> GetFysiekeBezittingenAsync(Guid eigenaarId);
    Task<FysiekBezit?> FindFysiekBezitAsync(Guid id);
    Task<FysiekBezit?> FindBezitWithNavigationAsync(Guid id);
    Task AddAsync(FysiekBezit item);
    Task RemoveAsync(FysiekBezit item);

    // Bankrekening
    Task<List<Bankrekening>> GetBankrekeningenAsync(Guid eigenaarId);
    Task<Bankrekening?> FindBankrekeningAsync(Guid id);
    Task AddAsync(Bankrekening item);
    Task RemoveAsync(Bankrekening item);

    // Verzekering
    Task<List<Verzekering>> GetVerzekeringenAsync(Guid eigenaarId);
    Task<Verzekering?> FindVerzekeringAsync(Guid id);
    Task AddAsync(Verzekering item);
    Task RemoveAsync(Verzekering item);

    // Schuld
    Task<List<Schuld>> GetSchuldenAsync(Guid eigenaarId);
    Task<List<Schuld>> GetSchuldenWithBezitAsync(Guid eigenaarId);
    Task<List<Schuld>> GetSchuldenByBezitIdAsync(Guid bezitId);
    Task<Schuld?> FindSchuldAsync(Guid id);
    Task<Schuld?> FindSchuldByIdAndBezitIdAsync(Guid schuldId, Guid bezitId);
    Task AddAsync(Schuld item);
    Task RemoveAsync(Schuld item);
    Task BatchCreateSchuldenAsync(IEnumerable<Schuld> items);

    Task CommitAsync();
}
