using Lumio.Api.Domain.Common;

namespace Lumio.Api.Domain.Testament;

public class TestamentInfo : BaseEntity
{
    public Guid EigenaarId { get; set; }
    public Eigenaar Eigenaar { get; set; } = null!;

    public string? TestamentType { get; set; }
    public string? NotarisNaam { get; set; }
    public string? NotarisKantoor { get; set; }
    public DateOnly? DatumTestament { get; set; }
    public string? TestamentLocatie { get; set; }
    public string? CTR_Nummer { get; set; }
    public string? AlgemeneWensen { get; set; }
    public string? BijzondereBepalingen { get; set; }

    public List<Begunstigde> Begunstigden { get; set; } = [];
    public List<Executeur> Executeurs { get; set; } = [];
}
