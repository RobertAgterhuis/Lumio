namespace Lumio.Api.Dtos.Export;

/// <summary>
/// Top-level structured export DTO containing all Lumio data.
/// Excludes: wachtwoorden, seed phrases, Shamir shares, document file contents.
/// </summary>
public record LumioExportData
{
    public DateTime ExportDatum { get; init; } = DateTime.Now;
    public string Versie { get; init; } = "1.0";

    public EigenaarExport? Eigenaar { get; init; }
    public List<ErfgenaamExport> Erfgenamen { get; init; } = [];
    public List<NoodcontactExport> Noodcontacten { get; init; } = [];
    public TestamentExport? Testament { get; init; }
    public EuthanasieExport? Euthanasie { get; init; }
    public DonorExport? DonorRegistratie { get; init; }
    public UitvaartExport? Uitvaart { get; init; }
    public BoedelExport Boedel { get; init; } = new();
    public List<DigitaalAccountExport> DigitaleAccounts { get; init; } = [];
    public List<DocumentExport> Documenten { get; init; } = [];
}

// ── Eigenaar ────────────────────────────────────────────

public record EigenaarExport(
    string Voornaam,
    string Achternaam,
    string? Tussenvoegsel,
    string Geboortedatum,
    string? BSN,
    string? Adres,
    string? Postcode,
    string? Woonplaats,
    string? Telefoon,
    string? Email,
    string? Notaris,
    string? NotarisKantoor,
    string? NotarisTelefoon,
    string? NotarisEmail,
    string? NotarisAdres,
    string? NotarisPostcode,
    string? NotarisPlaats,
    string BurgerlijkeStaat,
    string HuwelijksVoorwaarden,
    string? DatumHuwelijk,
    string LegitimatieSoort,
    string? LegitimatieNummer,
    string? LegitimatieDatumAfgifte,
    string? LegitimatieGeldigTot
);

// ── Erfgenaam ───────────────────────────────────────────

public record ErfgenaamExport(
    string Voornaam,
    string Achternaam,
    string? Tussenvoegsel,
    string Relatie,
    string? Telefoon,
    string? Email,
    string? Adres,
    string? Postcode,
    string? Woonplaats,
    string? Geboortedatum,
    string? BSN,
    string LegitimatieSoort,
    string? LegitimatieNummer,
    string? LegitimatieDatumAfgifte,
    string? LegitimatieGeldigTot
);

// ── Noodcontact ─────────────────────────────────────────

public record NoodcontactExport(
    string Naam,
    string Relatie,
    string Rol,
    string? Telefoon,
    string? Email,
    string? Adres,
    string? Postcode,
    string? Woonplaats,
    string? Instructies
);

// ── Testament ───────────────────────────────────────────

public record TestamentExport(
    string? TestamentType,
    string? NotarisNaam,
    string? NotarisKantoor,
    string? DatumTestament,
    string? TestamentLocatie,
    string? CTR_Nummer,
    string? AlgemeneWensen,
    string? BijzondereBepalingen,
    bool UitsluitingsClausule,
    string? Legaten,
    List<BegunstigdeExport> Begunstigden,
    List<ExecuteurExport> Executeurs
);

public record BegunstigdeExport(
    string Naam,
    string Relatie,
    string? Telefoon,
    string? Email,
    string? Omschrijving,
    decimal? Percentage,
    bool IsLegitiemePortie
);

public record ExecuteurExport(
    string Naam,
    string? Relatie,
    string? Telefoon,
    string? Email,
    string? Bevoegdheden
);

// ── Euthanasie ──────────────────────────────────────────

public record EuthanasieExport(
    string? DatumOndertekening,
    bool WilEuthanasie,
    string? SituatieBeschrijving,
    string? Huisarts,
    string? HuisartsPraktijk,
    string? HuisartsTelefoon,
    string? VertegenwoordigerNaam,
    string? VertegenwoordigerRelatie,
    string? VertegenwoordigerTelefoon,
    string? AanvullendeWensen,
    bool DementieClausule,
    string? DementieClausuleToelichting,
    string? BehandelVerbod,
    List<VoorwaardeExport> Voorwaarden
);

public record VoorwaardeExport(
    string Voorwaarde,
    string? Toelichting
);

// ── Donor ───────────────────────────────────────────────

public record DonorExport(
    string Keuze,
    bool IsGeregistreerdBijDonorregister,
    string? DonorregisterReferentie,
    string? Toelichting,
    List<OrgaanKeuzeExport> OrgaanKeuzes
);

public record OrgaanKeuzeExport(
    string Orgaan,
    bool WelDoneren,
    string? Toelichting
);

// ── Uitvaart ────────────────────────────────────────────

public record UitvaartExport(
    string VoorkeurType,
    string? Begraafplaats,
    string? UitvaartOndernemer,
    string? UitvaartOndernemerTelefoon,
    string? UitvaartOndernemerEmail,
    bool HeeftUitvaartVerzekering,
    string? UitvaartVerzekeringDetails,
    string? CeremonieSoort,
    string? CeremonieLocatie,
    string? Muziekwensen,
    string? Sprekers,
    string? Bloemen,
    string? Kledingwensen,
    string? RouwkaartTekst,
    string? RouwadvertentieTekst,
    string? Condoleance,
    string? OverigeWensen,
    string? VoorkeurBegraafplaatsNaam,
    string? VoorkeurBegraafplaatsAdres,
    string? VoorkeurCrematoriumnaam,
    string? VoorkeurCrematoriumAdres,
    string? VoorkeurAulaNaam,
    string? VoorkeurAulaAdres,
    string? BudgetRichting,
    List<CeremonieDetailExport> CeremonieDetails
);

public record CeremonieDetailExport(
    string Onderdeel,
    string? Beschrijving,
    int Volgorde,
    string? Muziek,
    string? Spreker,
    string? Tekstlezing,
    string? Dresscode
);

// ── Boedel ──────────────────────────────────────────────

public record BoedelExport
{
    public List<FysiekBezitExport> FysiekeBezittingen { get; init; } = [];
    public List<BankrekeningExport> Bankrekeningen { get; init; } = [];
    public List<VerzekeringExport> Verzekeringen { get; init; } = [];
    public List<SchuldExport> Schulden { get; init; } = [];
}

public record FysiekBezitExport(
    string Categorie,
    string Omschrijving,
    decimal? GeschatteWaarde,
    string? Locatie,
    string? BestemdeErfgenaam,
    string VermogensSoort,
    string? Notities,
    string? KadastraalNummer,
    string? Kenteken,
    string? KvKNummer
);

public record BankrekeningExport(
    string BankNaam,
    string IBAN,
    string RekeningType,
    decimal? Saldo,
    string VermogensSoort,
    string? Notities
);

public record VerzekeringExport(
    string Verzekeraar,
    string PolisNummer,
    string Type,
    string? VerzekeraarTelefoon,
    string? VerzekeraarEmail,
    decimal? VerzekerdBedrag,
    string? Begunstigde,
    string VermogensSoort,
    string? Notities
);

public record SchuldExport(
    string Schuldeiser,
    string Type,
    decimal Bedrag,
    decimal? MaandelijkseAflossing,
    string? Referentie,
    string VermogensSoort,
    string? Notities
);

// ── Digitaal Account (exclusief wachtwoorden!) ──────────

public record DigitaalAccountExport(
    string PlatformNaam,
    string? Categorie,
    string? Gebruikersnaam,
    string? EmailAdres,
    string? Url,
    string GewensteActie,
    string? OverdrachtAan,
    string? Notities
);

// ── Documenten (metadata only, no file content) ────────

public record DocumentExport(
    string Naam,
    string Categorie,
    string BestandsNaam,
    string ContentType,
    long BestandsGrootte,
    string? Notities,
    string? VerlooptOp,
    int Versie,
    string AangemaaktOp
);
