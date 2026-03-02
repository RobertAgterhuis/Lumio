using Lumio.Api.Domain.AssetRegistry;
using Lumio.Api.Domain.Common;

namespace Lumio.Api.Repositories;

/// <summary>
/// Repository interface for <see cref="ErfgenaamToewijzing"/>.
/// Introduced in SP-14-003.
/// </summary>
public interface IToewijzingRepository
{
    Task<Guid?> GetEigenaarIdAsync();
    Task<List<ErfgenaamToewijzing>> GetAllAsync(Guid eigenaarId);
    Task<List<ErfgenaamToewijzing>> GetByErfgenaamAsync(Guid erfgenaamId);
    Task<ErfgenaamToewijzing?> FindByIdAsync(Guid id);
    Task<ErfgenaamToewijzing?> FindWithErfgenaamByIdAsync(Guid id);
    Task<bool> ExistsToewijzingAsync(Guid erfgenaamId, string entityType, Guid entityId);
    Task<Erfgenaam?> FindErfgenaamAsync(Guid erfgenaamId);
    Task AddAsync(ErfgenaamToewijzing item);
    Task RemoveAsync(ErfgenaamToewijzing item);
    Task CommitAsync();
    /// <summary>Builds a name cache for entity display labels in toewijzingen.</summary>
    Task<Dictionary<(string EntityType, Guid EntityId), string>> BuildEntityNameCacheAsync(
        IEnumerable<(string EntityType, Guid EntityId)> entries);
}
