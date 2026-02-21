using Lumio.Api.Domain.Common;

namespace Lumio.Api.Domain.EuthanasiaDirective;

public class WilsverklaringEuthanasie : BaseEntity
{
    public Guid EigenaarId { get; set; }
    public Eigenaar Eigenaar { get; set; } = null!;

    public DateOnly? DatumOndertekening { get; set; }
    public bool WilEuthanasie { get; set; }
    public string? SituatieBeschrijving { get; set; }
    public string? Huisarts { get; set; }
    public string? HuisartsPraktijk { get; set; }
    public string? HuisartsTelefoon { get; set; }
    public string? HuisartsEmail { get; set; }
    public string? VertegenwoordigerNaam { get; set; }
    public string? VertegenwoordigerRelatie { get; set; }
    public string? VertegenwoordigerTelefoon { get; set; }
    public string? VertegenwoordigerEmail { get; set; }
    public string? VertegenwoordigerAdres { get; set; }
    public string? VertegenwoordigerPostcode { get; set; }
    public string? VertegenwoordigerWoonplaats { get; set; }
    public string? AanvullendeWensen { get; set; }

    public List<EuthanasieVoorwaarde> Voorwaarden { get; set; } = [];
}
