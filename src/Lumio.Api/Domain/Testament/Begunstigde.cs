using Lumio.Api.Domain.Common;

namespace Lumio.Api.Domain.Testament;

public class Begunstigde : BaseEntity
{
    public Guid TestamentInfoId { get; set; }
    public TestamentInfo TestamentInfo { get; set; } = null!;

    public string Naam { get; set; } = string.Empty;
    public string Relatie { get; set; } = string.Empty;
    public string? Omschrijving { get; set; }
    public decimal? Percentage { get; set; }
    public bool IsLegitiemePortie { get; set; }
}
