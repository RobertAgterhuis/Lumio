namespace Lumio.Api.Domain.Common;

public class SectieNotitie : BaseEntity
{
    public Guid EigenaarId { get; set; }
    public string Sectie { get; set; } = string.Empty; // testament, euthanasie, donor, digitaal-bezit, boedel, uitvaart, documenten, erfgenamen, noodcontacten
    public string Inhoud { get; set; } = string.Empty;
}
