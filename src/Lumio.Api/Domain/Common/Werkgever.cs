namespace Lumio.Api.Domain.Common;

public class Werkgever : BaseEntity
{
    public Guid EigenaarId { get; set; }

    // Organisatie
    public string BedrijfsNaam { get; set; } = string.Empty;
    public string? KvKNummer { get; set; }
    public string? Adres { get; set; }
    public string? Postcode { get; set; }
    public string? Vestigingsplaats { get; set; }
    public string? Website { get; set; }
    public string? TelefoonHoofdkantoor { get; set; }

    // Dienstverband
    public string? Functietitel { get; set; }
    public string? Afdeling { get; set; }
    public DateOnly? StartdatumDienstverband { get; set; }
    public bool IsZzp { get; set; }

    // Pensioenfonds (direct gekoppeld aan werkgever in NL)
    public string? PensioenfondNaam { get; set; }
    public string? PensioenfondTelefoon { get; set; }
    public string? PensioenfondEmail { get; set; }

    // HR contact
    public string? HrContactNaam { get; set; }
    public string? HrContactTelefoon { get; set; }
    public string? HrContactEmail { get; set; }

    // Leidinggevende
    public string? LeidinggevendeNaam { get; set; }
    public string? LeidinggevendeTelefoon { get; set; }
    public string? LeidinggevendeEmail { get; set; }

    public string? Notities { get; set; }
}
