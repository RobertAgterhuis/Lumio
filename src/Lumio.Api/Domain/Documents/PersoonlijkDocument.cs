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
}
