using Lumio.Api.Domain.Common;

namespace Lumio.Api.Repositories;

/// <summary>
/// Status record returned by <see cref="IAfhandelingRepository.GetBronnenStatusAsync"/>.
/// </summary>
public record AfhandelingBronnenStatus(
    bool HeeftNoodcontacten,
    bool HeeftUitvaartWensen,
    bool HeeftDonorRegistratie,
    bool HeeftWilsverklaring,
    bool HeeftTestament,
    bool HeeftErfgenamen,
    bool HeeftDocumenten,
    bool HeeftBoedel,
    bool HeeftDigitaalBezit,
    bool HeeftEigenaar);

/// <summary>
/// Repository interface for <see cref="AfhandelingsItem"/>.
/// Introduced in SP-14-003.
/// </summary>
public interface IAfhandelingRepository
{
    Task<List<AfhandelingsItem>> GetAllAsync(string? domein = null);
    Task<AfhandelingsItem?> FindByIdAsync(Guid id);
    Task<bool> AnyAsync();
    Task AddAsync(AfhandelingsItem item);
    Task AddRangeAsync(List<AfhandelingsItem> items);
    Task RemoveAsync(AfhandelingsItem item);
    Task CommitAsync();
    Task<AfhandelingBronnenStatus> GetBronnenStatusAsync();
}
