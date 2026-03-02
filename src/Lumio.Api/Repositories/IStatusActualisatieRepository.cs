using Lumio.Api.Domain.Common;

namespace Lumio.Api.Repositories;

/// <summary>
/// Repository interface for actualisatie confirmations.
/// Introduced in SP-14-003.
/// </summary>
public interface IStatusActualisatieRepository
{
    Task<Eigenaar?> FindEigenaarAsync();
    Task<List<ActualisatieBevestiging>> GetBevestigingenAsync(Guid eigenaarId);
    Task AddAsync(ActualisatieBevestiging item);
    Task RemoveByDomeinAsync(Guid eigenaarId, string domein);
    Task CommitAsync();
}
