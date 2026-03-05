namespace Lumio.Api.Domain.Common;

public enum BurgerlijkeStaat
{
    Ongehuwd = 0,
    Gehuwd = 1,
    GeregistreerdPartnerschap = 2,
    Gescheiden = 3,
    Weduwe = 4
}

public enum HuwelijksVoorwaarden
{
    NietVanToepassing = 0,
    GemeenschapVanGoederen = 1,
    BeperkteGemeenschap = 2,
    KoudeUitsluiting = 3
}

public enum LegitimatieSoort
{
    Geen = 0,
    Paspoort = 1,
    Identiteitskaart = 2,
    Rijbewijs = 3
}

public class Eigenaar : BaseEntity
{
    public string Voornaam { get; set; } = string.Empty;
    public string Achternaam { get; set; } = string.Empty;
    public string? Tussenvoegsel { get; set; }
    public DateOnly Geboortedatum { get; set; }
    public string? BSN { get; set; }
    public string? Adres { get; set; }
    public string? Postcode { get; set; }
    public string? Woonplaats { get; set; }
    public string? Telefoon { get; set; }
    public string? Email { get; set; }

    // Relatie naar gedeeld notaris contact
    public Guid? NotarisContactId { get; set; }
    public SharedContact? NotarisContact { get; set; }

    // Relatie naar gedeeld huisarts contact
    public Guid? HuisartsContactId { get; set; }
    public SharedContact? HuisartsContact { get; set; }

    // Relatie naar gedeeld uitvaartondernemer contact
    public Guid? UitvaartOndernemerContactId { get; set; }
    public SharedContact? UitvaartOndernemerContact { get; set; }

    // P-M4: Burgerlijke staat en huwelijksvoorwaarden
    public BurgerlijkeStaat BurgerlijkeStaat { get; set; } = BurgerlijkeStaat.Ongehuwd;
    public HuwelijksVoorwaarden HuwelijksVoorwaarden { get; set; } = HuwelijksVoorwaarden.NietVanToepassing;
    public DateOnly? DatumHuwelijk { get; set; }

    // P-M17: Legitimatiegegevens
    public LegitimatieSoort LegitimatieSoort { get; set; } = LegitimatieSoort.Geen;
    public string? LegitimatieNummer { get; set; }
    public DateOnly? LegitimatieDatumAfgifte { get; set; }
    public DateOnly? LegitimatieGeldigTot { get; set; }

    // P-M16: Pasfoto / profielfoto
    public byte[]? ProfielFoto { get; set; }
    public string? ProfielFotoContentType { get; set; }
    public string? ProfielFotoNaam { get; set; }

    // S6-20: Tijdlijn bezoek-tracking
    public bool TijdlijnBekeken { get; set; } = false;

    // S6-22: Onboarding wizard status
    public bool OnboardingVoltooid { get; set; } = false;

    // SP-9: Shamir drempel — het bij generatie ingestelde aantal codes dat benodigd is voor ontsleuteling.
    // Null betekent: nog geen shares gegenereerd; frontend valt terug op ShamirMinDrempel uit configuratie.
    public int? ShamirDrempel { get; set; }

    [System.ComponentModel.DataAnnotations.Schema.NotMapped]
    public bool HeeftProfielFoto => ProfielFoto is not null;
}
