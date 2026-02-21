namespace Lumio.Api.Domain.Common;

public class AuditLogEntry
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTime Tijdstip { get; set; } = DateTime.UtcNow;
    public string Actie { get; set; } = string.Empty;       // bijv. "Aangemaakt", "Gewijzigd", "Verwijderd", "Ontgrendeld", "Vergrendeld", "Export"
    public string? EntityType { get; set; }                   // bijv. "Erfgenaam", "DigitaalAccount"
    public Guid? EntityId { get; set; }
    public string? Details { get; set; }                      // Extra context
}
