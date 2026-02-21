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

    public List<OrgaanKeuze> OrgaanKeuzes { get; set; } = [];
}
