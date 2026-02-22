using Lumio.Api.Domain.Common;

namespace Lumio.Api.Domain.Testament;

public class TestamentInfo : BaseEntity
{
    public Guid EigenaarId { get; set; }
    public Eigenaar Eigenaar { get; set; } = null!;

    public string? TestamentType { get; set; }
    public string? NotarisNaam { get; set; }
    public string? NotarisKantoor { get; set; }
    public string? NotarisTelefoon { get; set; }
    public string? NotarisEmail { get; set; }
    public string? NotarisAdres { get; set; }
    public string? NotarisPostcode { get; set; }
    public string? NotarisPlaats { get; set; }
    public DateOnly? DatumTestament { get; set; }
    public string? TestamentLocatie { get; set; }
    public string? CTR_Nummer { get; set; }
    public string? AlgemeneWensen { get; set; }
    public string? BijzondereBepalingen { get; set; }

    // S8 — Wettelijk conforme document-generatie
    public bool UitsluitingsClausule { get; set; } = true;
    public string? Legaten { get; set; }

    public List<Begunstigde> Begunstigden { get; set; } = [];
    public List<Executeur> Executeurs { get; set; } = [];
    public List<TestamentSnapshot> Snapshots { get; set; } = [];
}
