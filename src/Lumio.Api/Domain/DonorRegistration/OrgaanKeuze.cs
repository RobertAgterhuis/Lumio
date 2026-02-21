using Lumio.Api.Domain.Common;

namespace Lumio.Api.Domain.DonorRegistration;

public class OrgaanKeuze : BaseEntity
{
    public Guid DonorRegistratieId { get; set; }
    public DonorRegistratie DonorRegistratie { get; set; } = null!;

    public string Orgaan { get; set; } = string.Empty;
    public bool WelDoneren { get; set; }
    public string? Toelichting { get; set; }
}
