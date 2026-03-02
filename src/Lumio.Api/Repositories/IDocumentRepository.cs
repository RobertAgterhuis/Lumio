using Lumio.Api.Domain.Documents;

namespace Lumio.Api.Repositories;

/// <summary>
/// Repository interface for <see cref="PersoonlijkDocument"/> metadata.
/// Introduced in SP-14-003.
/// </summary>
public interface IDocumentRepository
{
    Task<List<PersoonlijkDocument>> GetAllAsync();
    Task<PersoonlijkDocument?> FindByIdAsync(Guid id);
    Task<List<PersoonlijkDocument>> GetByGroepAsync(Guid groepId);
    Task<int> CountByGroepAsync(Guid groepId);
    Task AddAsync(PersoonlijkDocument item);
    Task RemoveAsync(PersoonlijkDocument item);
    Task RemoveRangeAsync(List<PersoonlijkDocument> items);
    Task CommitAsync();
}
