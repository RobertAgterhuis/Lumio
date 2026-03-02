using Lumio.Api.Domain.VideoMessages;

namespace Lumio.Api.Repositories;

/// <summary>Metadata for video streaming (path/content-type without binary data).</summary>
public sealed record VideoboodschapStreamMeta(string? BestandsPad, string ContentType);

/// <summary>
/// Repository interface for <see cref="Videoboodschap"/>.
/// Introduced in SP-14-003.
/// </summary>
public interface IVideoboodschapRepository
{
    Task<Guid?> GetEigenaarIdAsync();
    Task<List<Videoboodschap>> GetAllAsync(Guid eigenaarId);
    Task<int> CountAsync(Guid eigenaarId);
    Task<long> GetTotaalBytesAsync(Guid eigenaarId);
    Task<bool> ErfgenaamBestaatAsync(Guid erfgenaamId, Guid eigenaarId);
    Task<Videoboodschap?> FindWithOntvangersByIdAsync(Guid id, Guid eigenaarId);
    Task<VideoboodschapStreamMeta?> FindStreamMetaAsync(Guid id, Guid eigenaarId);
    Task<byte[]?> FindBlobAsync(Guid videoboodschapId);
    Task<List<Guid>> GetVideoIdsVoorErfgenaamAsync(Guid erfgenaamId);
    Task<List<Videoboodschap>> GetByIdsAsync(IEnumerable<Guid> ids);
    Task<Dictionary<Guid, string?>> LaadOntvangerNamenAsync(IEnumerable<Guid> erfgenaamIds);
    Task AddAsync(Videoboodschap item);
    Task RemoveAsync(Videoboodschap item);
    Task RemoveOntvangersByVideoAsync(Guid videoId);
    Task CommitAsync();
}
