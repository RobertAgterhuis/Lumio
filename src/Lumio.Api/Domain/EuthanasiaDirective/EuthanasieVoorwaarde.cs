using Lumio.Api.Domain.Common;

namespace Lumio.Api.Domain.EuthanasiaDirective;

public class EuthanasieVoorwaarde : BaseEntity
{
    public Guid WilsverklaringId { get; set; }
    public WilsverklaringEuthanasie Wilsverklaring { get; set; } = null!;

    public string Voorwaarde { get; set; } = string.Empty;
    public string? Toelichting { get; set; }
}
