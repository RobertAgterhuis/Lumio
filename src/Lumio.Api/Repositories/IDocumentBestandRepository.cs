using Lumio.Api.Domain.Documents;

namespace Lumio.Api.Repositories;

/// <summary>
/// Repository interface for document binary file operations.
/// Introduced in SP-14-003.
/// </summary>
public interface IDocumentBestandRepository
{
    Task<Guid?> GetEigenaarIdAsync();
    Task<PersoonlijkDocument?> FindByIdAsync(Guid id);
    Task<PersoonlijkDocument?> FindLatestByNaamAsync(string naam, Guid eigenaarId);
    Task<int> GetAantalVersiesAsync(Guid documentGroepId);
    Task AddAsync(PersoonlijkDocument item);
    Task CommitAsync();
}
