using Lumio.Api.Domain.Common;

namespace Lumio.Api.Domain.FuneralWishes;

public class UitvaartGenodigde : BaseEntity
{
    public Guid UitvaartWensenId { get; set; }
    public UitvaartWensen UitvaartWensen { get; set; } = null!;

    public string Naam { get; set; } = string.Empty;
    public string? Relatie { get; set; }
    public string? Telefoon { get; set; }
    public string? Email { get; set; }
    public string? Adres { get; set; }
    public string? Postcode { get; set; }
    public string? Woonplaats { get; set; }
    public string? Notities { get; set; }
}
