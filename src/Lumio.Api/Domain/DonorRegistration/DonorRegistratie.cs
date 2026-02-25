using Lumio.Api.Domain.Common;

namespace Lumio.Api.Domain.DonorRegistration;

public class DonorRegistratie : BaseEntity
{
    public Guid EigenaarId { get; set; }
    public Eigenaar Eigenaar { get; set; } = null!;

    public string Keuze { get; set; } = string.Empty;
    public bool IsGeregistreerdBijDonorregister { get; set; }
    public string? DonorregisterReferentie { get; set; }
    public string? Toelichting { get; set; }

    // S5-11: Beslissende persoon bij keuze "Specifiek persoon beslist"
    public string? BeslisserNaam { get; set; }
    public string? BeslisserRelatie { get; set; }
    public string? BeslisserTelefoon { get; set; }

    public List<OrgaanKeuze> OrgaanKeuzes { get; set; } = [];
}
