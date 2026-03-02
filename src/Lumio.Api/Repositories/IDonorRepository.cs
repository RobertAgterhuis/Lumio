using Lumio.Api.Domain.DonorRegistration;

namespace Lumio.Api.Repositories;

/// <summary>
/// Repository interface for DonorRegistratie and OrgaanKeuze.
/// Introduced in SP-14-003.
/// </summary>
public interface IDonorRepository
{
    Task<Guid?> GetEigenaarIdAsync();
    Task<DonorRegistratie?> FindDonorRegistratieAsync();
    Task<OrgaanKeuze?> FindOrgaanKeuzeByIdAsync(Guid id);
    Task<List<OrgaanKeuze>> GetAlleOrgaanKeuzesAsync(Guid donorRegistratieId);
    Task AddAsync(DonorRegistratie item);
    Task AddOrgaanKeuzeAsync(OrgaanKeuze item);
    Task RemoveOrgaanKeuzeAsync(OrgaanKeuze item);
    Task<List<OrgaanKeuze>> BatchUpdateOrgaanKeuzesAsync(Guid donorRegistratieId, List<OrgaanKeuze> keuzes);
    Task CommitAsync();
}

