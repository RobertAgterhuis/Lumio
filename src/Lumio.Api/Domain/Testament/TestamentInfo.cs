using Lumio.Api.Domain.Common;

namespace Lumio.Api.Domain.Testament;

public class TestamentInfo : BaseEntity
{
    public Guid EigenaarId { get; set; }
    public Eigenaar Eigenaar { get; set; } = null!;

    public string? TestamentType { get; set; }

    // Relatie naar gedeeld notaris contact
    public Guid? NotarisContactId { get; set; }
    public SharedContact? NotarisContact { get; set; }

    public DateOnly? DatumTestament { get; set; }
    public string? TestamentLocatie { get; set; }
    public string? CTR_Nummer { get; set; }
    public string? AlgemeneWensen { get; set; }
    public string? BijzondereBepalingen { get; set; }

    // S7-02 — Nullable: null = geen keuze gemaakt, true = ja, false = nee
    public bool? UitsluitingsClausule { get; set; }
    public string? Legaten { get; set; }

    public List<Begunstigde> Begunstigden { get; set; } = [];
    public List<Executeur> Executeurs { get; set; } = [];
    public List<TestamentSnapshot> Snapshots { get; set; } = [];
}
