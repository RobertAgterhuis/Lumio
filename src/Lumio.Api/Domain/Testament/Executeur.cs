using Lumio.Api.Domain.Common;

namespace Lumio.Api.Domain.Testament;

public class Executeur : BaseEntity
{
    public Guid TestamentInfoId { get; set; }
    public TestamentInfo TestamentInfo { get; set; } = null!;

    public string Naam { get; set; } = string.Empty;
    public string? Relatie { get; set; }
    public string? Telefoon { get; set; }
    public string? Email { get; set; }
    public string? Adres { get; set; }
    public string? Postcode { get; set; }
    public string? Woonplaats { get; set; }
    public string? Bevoegdheden { get; set; }

    // M4: Persistent link to the originating person record
    public Guid? ErfgenaamId { get; set; }
    public Guid? NoodcontactId { get; set; }
}
