using Lumio.Api.Domain.Common;

namespace Lumio.Api.Domain.FuneralWishes;

public class CeremonieDetail : BaseEntity
{
    public Guid UitvaartWensenId { get; set; }
    public UitvaartWensen UitvaartWensen { get; set; } = null!;

    public string Onderdeel { get; set; } = string.Empty;
    public string? Beschrijving { get; set; }
    public int Volgorde { get; set; }

    // P-S15: Uitgebreide ceremonie-details
    public string? Muziek { get; set; }
    public string? Spreker { get; set; }
    public string? Tekstlezing { get; set; }
    public string? Dresscode { get; set; }
}
