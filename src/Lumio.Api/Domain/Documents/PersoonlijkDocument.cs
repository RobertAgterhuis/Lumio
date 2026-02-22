using Lumio.Api.Domain.Common;

namespace Lumio.Api.Domain.Documents;

public class PersoonlijkDocument : BaseEntity
{
    public Guid EigenaarId { get; set; }
    public string Naam { get; set; } = string.Empty;
    public string Categorie { get; set; } = string.Empty;
    public string BestandsNaam { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long BestandsGrootte { get; set; }
    public byte[] BestandsInhoud { get; set; } = [];
    public string? Notities { get; set; }

    /// <summary>Optional expiry date for identity documents, passports, etc.</summary>
    public DateOnly? VerlooptOp { get; set; }

    /// <summary>Groups all versions of the same logical document together.</summary>
    public Guid DocumentGroepId { get; set; }

    /// <summary>Version number, starting at 1.</summary>
    public int Versie { get; set; } = 1;
}
