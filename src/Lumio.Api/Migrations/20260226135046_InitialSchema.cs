using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Lumio.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ActualisatieBevestigingen",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    EigenaarId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Domein = table.Column<string>(type: "TEXT", nullable: false),
                    BevestigdOp = table.Column<DateTime>(type: "TEXT", nullable: false),
                    AangemaaktOp = table.Column<DateTime>(type: "TEXT", nullable: false),
                    GewijzigdOp = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ActualisatieBevestigingen", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AfhandelingsItems",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Domein = table.Column<string>(type: "TEXT", nullable: false),
                    EntityId = table.Column<Guid>(type: "TEXT", nullable: true),
                    Label = table.Column<string>(type: "TEXT", nullable: true),
                    Status = table.Column<int>(type: "INTEGER", nullable: false),
                    Notitie = table.Column<string>(type: "TEXT", nullable: true),
                    AfgehandeldOp = table.Column<DateTime>(type: "TEXT", nullable: true),
                    AangemaaktOp = table.Column<DateTime>(type: "TEXT", nullable: false),
                    GewijzigdOp = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AfhandelingsItems", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AuditLog",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Tijdstip = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Actie = table.Column<string>(type: "TEXT", nullable: false),
                    EntityType = table.Column<string>(type: "TEXT", nullable: true),
                    EntityId = table.Column<Guid>(type: "TEXT", nullable: true),
                    Details = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditLog", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Eigenaren",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Voornaam = table.Column<string>(type: "TEXT", nullable: false),
                    Achternaam = table.Column<string>(type: "TEXT", nullable: false),
                    Tussenvoegsel = table.Column<string>(type: "TEXT", nullable: true),
                    Geboortedatum = table.Column<DateOnly>(type: "TEXT", nullable: false),
                    BSN = table.Column<string>(type: "TEXT", nullable: true),
                    Adres = table.Column<string>(type: "TEXT", nullable: true),
                    Postcode = table.Column<string>(type: "TEXT", nullable: true),
                    Woonplaats = table.Column<string>(type: "TEXT", nullable: true),
                    Telefoon = table.Column<string>(type: "TEXT", nullable: true),
                    Email = table.Column<string>(type: "TEXT", nullable: true),
                    Notaris = table.Column<string>(type: "TEXT", nullable: true),
                    NotarisKantoor = table.Column<string>(type: "TEXT", nullable: true),
                    NotarisTelefoon = table.Column<string>(type: "TEXT", nullable: true),
                    NotarisEmail = table.Column<string>(type: "TEXT", nullable: true),
                    NotarisAdres = table.Column<string>(type: "TEXT", nullable: true),
                    NotarisPostcode = table.Column<string>(type: "TEXT", nullable: true),
                    NotarisPlaats = table.Column<string>(type: "TEXT", nullable: true),
                    BurgerlijkeStaat = table.Column<int>(type: "INTEGER", nullable: false),
                    HuwelijksVoorwaarden = table.Column<int>(type: "INTEGER", nullable: false),
                    DatumHuwelijk = table.Column<DateOnly>(type: "TEXT", nullable: true),
                    LegitimatieSoort = table.Column<int>(type: "INTEGER", nullable: false),
                    LegitimatieNummer = table.Column<string>(type: "TEXT", nullable: true),
                    LegitimatieDatumAfgifte = table.Column<DateOnly>(type: "TEXT", nullable: true),
                    LegitimatieGeldigTot = table.Column<DateOnly>(type: "TEXT", nullable: true),
                    ProfielFoto = table.Column<byte[]>(type: "BLOB", nullable: true),
                    ProfielFotoContentType = table.Column<string>(type: "TEXT", nullable: true),
                    ProfielFotoNaam = table.Column<string>(type: "TEXT", nullable: true),
                    TijdlijnBekeken = table.Column<bool>(type: "INTEGER", nullable: false),
                    OnboardingVoltooid = table.Column<bool>(type: "INTEGER", nullable: false),
                    AangemaaktOp = table.Column<DateTime>(type: "TEXT", nullable: false),
                    GewijzigdOp = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Eigenaren", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Bankrekeningen",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    EigenaarId = table.Column<Guid>(type: "TEXT", nullable: false),
                    BankNaam = table.Column<string>(type: "TEXT", nullable: false),
                    IBAN = table.Column<string>(type: "TEXT", nullable: false),
                    RekeningType = table.Column<string>(type: "TEXT", nullable: false),
                    Saldo = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    VermogensSoort = table.Column<int>(type: "INTEGER", nullable: false),
                    Notities = table.Column<string>(type: "TEXT", nullable: true),
                    AangemaaktOp = table.Column<DateTime>(type: "TEXT", nullable: false),
                    GewijzigdOp = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Bankrekeningen", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Bankrekeningen_Eigenaren_EigenaarId",
                        column: x => x.EigenaarId,
                        principalTable: "Eigenaren",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CryptoWallets",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    EigenaarId = table.Column<Guid>(type: "TEXT", nullable: false),
                    WalletNaam = table.Column<string>(type: "TEXT", nullable: false),
                    CryptoType = table.Column<string>(type: "TEXT", nullable: false),
                    WalletAdres = table.Column<string>(type: "TEXT", nullable: true),
                    EncryptedSeedPhrase = table.Column<string>(type: "TEXT", nullable: true),
                    Exchange = table.Column<string>(type: "TEXT", nullable: true),
                    Notities = table.Column<string>(type: "TEXT", nullable: true),
                    AangemaaktOp = table.Column<DateTime>(type: "TEXT", nullable: false),
                    GewijzigdOp = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CryptoWallets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CryptoWallets_Eigenaren_EigenaarId",
                        column: x => x.EigenaarId,
                        principalTable: "Eigenaren",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DigitaleAccounts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    EigenaarId = table.Column<Guid>(type: "TEXT", nullable: false),
                    PlatformNaam = table.Column<string>(type: "TEXT", nullable: false),
                    Categorie = table.Column<string>(type: "TEXT", nullable: true),
                    Gebruikersnaam = table.Column<string>(type: "TEXT", nullable: true),
                    EmailAdres = table.Column<string>(type: "TEXT", nullable: true),
                    Url = table.Column<string>(type: "TEXT", nullable: true),
                    GewensteActie = table.Column<string>(type: "TEXT", nullable: false),
                    OverdrachtAan = table.Column<string>(type: "TEXT", nullable: true),
                    Notities = table.Column<string>(type: "TEXT", nullable: true),
                    AangemaaktOp = table.Column<DateTime>(type: "TEXT", nullable: false),
                    GewijzigdOp = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DigitaleAccounts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DigitaleAccounts_Eigenaren_EigenaarId",
                        column: x => x.EigenaarId,
                        principalTable: "Eigenaren",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Documenten",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    EigenaarId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Naam = table.Column<string>(type: "TEXT", nullable: false),
                    Categorie = table.Column<string>(type: "TEXT", nullable: false),
                    BestandsNaam = table.Column<string>(type: "TEXT", nullable: false),
                    ContentType = table.Column<string>(type: "TEXT", nullable: false),
                    BestandsGrootte = table.Column<long>(type: "INTEGER", nullable: false),
                    BestandsInhoud = table.Column<byte[]>(type: "BLOB", nullable: false),
                    Notities = table.Column<string>(type: "TEXT", nullable: true),
                    VerlooptOp = table.Column<DateOnly>(type: "TEXT", nullable: true),
                    DocumentGroepId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Versie = table.Column<int>(type: "INTEGER", nullable: false),
                    AangemaaktOp = table.Column<DateTime>(type: "TEXT", nullable: false),
                    GewijzigdOp = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Documenten", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Documenten_Eigenaren_EigenaarId",
                        column: x => x.EigenaarId,
                        principalTable: "Eigenaren",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DonorRegistraties",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    EigenaarId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Keuze = table.Column<string>(type: "TEXT", nullable: false),
                    IsGeregistreerdBijDonorregister = table.Column<bool>(type: "INTEGER", nullable: false),
                    DonorregisterReferentie = table.Column<string>(type: "TEXT", nullable: true),
                    Toelichting = table.Column<string>(type: "TEXT", nullable: true),
                    BeslisserNaam = table.Column<string>(type: "TEXT", nullable: true),
                    BeslisserRelatie = table.Column<string>(type: "TEXT", nullable: true),
                    BeslisserTelefoon = table.Column<string>(type: "TEXT", nullable: true),
                    AangemaaktOp = table.Column<DateTime>(type: "TEXT", nullable: false),
                    GewijzigdOp = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DonorRegistraties", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DonorRegistraties_Eigenaren_EigenaarId",
                        column: x => x.EigenaarId,
                        principalTable: "Eigenaren",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Erfgenamen",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    EigenaarId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Voornaam = table.Column<string>(type: "TEXT", nullable: false),
                    Achternaam = table.Column<string>(type: "TEXT", nullable: false),
                    Tussenvoegsel = table.Column<string>(type: "TEXT", nullable: true),
                    Relatie = table.Column<string>(type: "TEXT", nullable: false),
                    Telefoon = table.Column<string>(type: "TEXT", nullable: true),
                    Email = table.Column<string>(type: "TEXT", nullable: true),
                    Adres = table.Column<string>(type: "TEXT", nullable: true),
                    Postcode = table.Column<string>(type: "TEXT", nullable: true),
                    Woonplaats = table.Column<string>(type: "TEXT", nullable: true),
                    Geboortedatum = table.Column<DateOnly>(type: "TEXT", nullable: true),
                    BSN = table.Column<string>(type: "TEXT", nullable: true),
                    ShareIndex = table.Column<int>(type: "INTEGER", nullable: true),
                    HeeftShareOntvangen = table.Column<bool>(type: "INTEGER", nullable: false),
                    ShareUitgegevenOp = table.Column<DateTime>(type: "TEXT", nullable: true),
                    LegitimatieSoort = table.Column<int>(type: "INTEGER", nullable: false),
                    LegitimatieNummer = table.Column<string>(type: "TEXT", nullable: true),
                    LegitimatieDatumAfgifte = table.Column<DateOnly>(type: "TEXT", nullable: true),
                    LegitimatieGeldigTot = table.Column<DateOnly>(type: "TEXT", nullable: true),
                    AangemaaktOp = table.Column<DateTime>(type: "TEXT", nullable: false),
                    GewijzigdOp = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Erfgenamen", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Erfgenamen_Eigenaren_EigenaarId",
                        column: x => x.EigenaarId,
                        principalTable: "Eigenaren",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Noodcontacten",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    EigenaarId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Naam = table.Column<string>(type: "TEXT", nullable: false),
                    Relatie = table.Column<string>(type: "TEXT", nullable: false),
                    Telefoon = table.Column<string>(type: "TEXT", nullable: true),
                    Email = table.Column<string>(type: "TEXT", nullable: true),
                    Adres = table.Column<string>(type: "TEXT", nullable: true),
                    Postcode = table.Column<string>(type: "TEXT", nullable: true),
                    Woonplaats = table.Column<string>(type: "TEXT", nullable: true),
                    Rol = table.Column<string>(type: "TEXT", nullable: false),
                    Instructies = table.Column<string>(type: "TEXT", nullable: true),
                    IsGedeeld = table.Column<bool>(type: "INTEGER", nullable: false),
                    AangemaaktOp = table.Column<DateTime>(type: "TEXT", nullable: false),
                    GewijzigdOp = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Noodcontacten", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Noodcontacten_Eigenaren_EigenaarId",
                        column: x => x.EigenaarId,
                        principalTable: "Eigenaren",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SectieNotities",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    EigenaarId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Sectie = table.Column<string>(type: "TEXT", nullable: false),
                    Inhoud = table.Column<string>(type: "TEXT", nullable: false),
                    AangemaaktOp = table.Column<DateTime>(type: "TEXT", nullable: false),
                    GewijzigdOp = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SectieNotities", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SectieNotities_Eigenaren_EigenaarId",
                        column: x => x.EigenaarId,
                        principalTable: "Eigenaren",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Testamenten",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    EigenaarId = table.Column<Guid>(type: "TEXT", nullable: false),
                    TestamentType = table.Column<string>(type: "TEXT", nullable: true),
                    NotarisNaam = table.Column<string>(type: "TEXT", nullable: true),
                    NotarisKantoor = table.Column<string>(type: "TEXT", nullable: true),
                    NotarisTelefoon = table.Column<string>(type: "TEXT", nullable: true),
                    NotarisEmail = table.Column<string>(type: "TEXT", nullable: true),
                    NotarisAdres = table.Column<string>(type: "TEXT", nullable: true),
                    NotarisPostcode = table.Column<string>(type: "TEXT", nullable: true),
                    NotarisPlaats = table.Column<string>(type: "TEXT", nullable: true),
                    DatumTestament = table.Column<DateOnly>(type: "TEXT", nullable: true),
                    TestamentLocatie = table.Column<string>(type: "TEXT", nullable: true),
                    CTR_Nummer = table.Column<string>(type: "TEXT", nullable: true),
                    AlgemeneWensen = table.Column<string>(type: "TEXT", nullable: true),
                    BijzondereBepalingen = table.Column<string>(type: "TEXT", nullable: true),
                    UitsluitingsClausule = table.Column<bool>(type: "INTEGER", nullable: true),
                    Legaten = table.Column<string>(type: "TEXT", nullable: true),
                    AangemaaktOp = table.Column<DateTime>(type: "TEXT", nullable: false),
                    GewijzigdOp = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Testamenten", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Testamenten_Eigenaren_EigenaarId",
                        column: x => x.EigenaarId,
                        principalTable: "Eigenaren",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UitvaartWensen",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    EigenaarId = table.Column<Guid>(type: "TEXT", nullable: false),
                    VoorkeurType = table.Column<string>(type: "TEXT", nullable: false),
                    Begraafplaats = table.Column<string>(type: "TEXT", nullable: true),
                    UitvaartOndernemer = table.Column<string>(type: "TEXT", nullable: true),
                    UitvaartOndernemerTelefoon = table.Column<string>(type: "TEXT", nullable: true),
                    UitvaartOndernemerEmail = table.Column<string>(type: "TEXT", nullable: true),
                    UitvaartOndernemerAdres = table.Column<string>(type: "TEXT", nullable: true),
                    UitvaartOndernemerPostcode = table.Column<string>(type: "TEXT", nullable: true),
                    UitvaartOndernemerPlaats = table.Column<string>(type: "TEXT", nullable: true),
                    HeeftUitvaartVerzekering = table.Column<bool>(type: "INTEGER", nullable: false),
                    UitvaartVerzekeringDetails = table.Column<string>(type: "TEXT", nullable: true),
                    CeremonieSoort = table.Column<string>(type: "TEXT", nullable: true),
                    CeremonieLocatie = table.Column<string>(type: "TEXT", nullable: true),
                    Muziekwensen = table.Column<string>(type: "TEXT", nullable: true),
                    Sprekers = table.Column<string>(type: "TEXT", nullable: true),
                    Bloemen = table.Column<string>(type: "TEXT", nullable: true),
                    Kledingwensen = table.Column<string>(type: "TEXT", nullable: true),
                    RouwkaartTekst = table.Column<string>(type: "TEXT", nullable: true),
                    RouwadvertentieTekst = table.Column<string>(type: "TEXT", nullable: true),
                    Condoleance = table.Column<string>(type: "TEXT", nullable: true),
                    OverigeWensen = table.Column<string>(type: "TEXT", nullable: true),
                    VoorkeurBegraafplaatsNaam = table.Column<string>(type: "TEXT", nullable: true),
                    VoorkeurBegraafplaatsAdres = table.Column<string>(type: "TEXT", nullable: true),
                    VoorkeurCrematoriumnaam = table.Column<string>(type: "TEXT", nullable: true),
                    VoorkeurCrematoriumAdres = table.Column<string>(type: "TEXT", nullable: true),
                    VoorkeurAulaNaam = table.Column<string>(type: "TEXT", nullable: true),
                    VoorkeurAulaAdres = table.Column<string>(type: "TEXT", nullable: true),
                    BudgetRichting = table.Column<string>(type: "TEXT", nullable: true),
                    DatumOpgesteld = table.Column<DateOnly>(type: "TEXT", nullable: true),
                    AangemaaktOp = table.Column<DateTime>(type: "TEXT", nullable: false),
                    GewijzigdOp = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UitvaartWensen", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UitvaartWensen_Eigenaren_EigenaarId",
                        column: x => x.EigenaarId,
                        principalTable: "Eigenaren",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Verzekeringen",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    EigenaarId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Verzekeraar = table.Column<string>(type: "TEXT", nullable: false),
                    VerzekeraarTelefoon = table.Column<string>(type: "TEXT", nullable: true),
                    VerzekeraarEmail = table.Column<string>(type: "TEXT", nullable: true),
                    PolisNummer = table.Column<string>(type: "TEXT", nullable: false),
                    Type = table.Column<string>(type: "TEXT", nullable: false),
                    VerzekerdBedrag = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Begunstigde = table.Column<string>(type: "TEXT", nullable: true),
                    BegunstigdeErfgenaamId = table.Column<Guid>(type: "TEXT", nullable: true),
                    VermogensSoort = table.Column<int>(type: "INTEGER", nullable: false),
                    Notities = table.Column<string>(type: "TEXT", nullable: true),
                    AangemaaktOp = table.Column<DateTime>(type: "TEXT", nullable: false),
                    GewijzigdOp = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Verzekeringen", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Verzekeringen_Eigenaren_EigenaarId",
                        column: x => x.EigenaarId,
                        principalTable: "Eigenaren",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Videoboodschappen",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    EigenaarId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Titel = table.Column<string>(type: "TEXT", nullable: false),
                    Beschrijving = table.Column<string>(type: "TEXT", nullable: true),
                    BestandsNaam = table.Column<string>(type: "TEXT", nullable: false),
                    ContentType = table.Column<string>(type: "TEXT", nullable: false),
                    BestandsGrootte = table.Column<long>(type: "INTEGER", nullable: false),
                    DuurSeconden = table.Column<int>(type: "INTEGER", nullable: true),
                    AangemaaktOp = table.Column<DateTime>(type: "TEXT", nullable: false),
                    GewijzigdOp = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Videoboodschappen", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Videoboodschappen_Eigenaren_EigenaarId",
                        column: x => x.EigenaarId,
                        principalTable: "Eigenaren",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Wachtwoorden",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    EigenaarId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Naam = table.Column<string>(type: "TEXT", nullable: false),
                    Gebruikersnaam = table.Column<string>(type: "TEXT", nullable: true),
                    EncryptedWachtwoord = table.Column<string>(type: "TEXT", nullable: false),
                    Url = table.Column<string>(type: "TEXT", nullable: true),
                    Notities = table.Column<string>(type: "TEXT", nullable: true),
                    AangemaaktOp = table.Column<DateTime>(type: "TEXT", nullable: false),
                    GewijzigdOp = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Wachtwoorden", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Wachtwoorden_Eigenaren_EigenaarId",
                        column: x => x.EigenaarId,
                        principalTable: "Eigenaren",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Wilsverklaringen",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    EigenaarId = table.Column<Guid>(type: "TEXT", nullable: false),
                    DatumOndertekening = table.Column<DateOnly>(type: "TEXT", nullable: true),
                    WilEuthanasie = table.Column<bool>(type: "INTEGER", nullable: false),
                    SituatieBeschrijving = table.Column<string>(type: "TEXT", nullable: true),
                    Huisarts = table.Column<string>(type: "TEXT", nullable: true),
                    HuisartsPraktijk = table.Column<string>(type: "TEXT", nullable: true),
                    HuisartsTelefoon = table.Column<string>(type: "TEXT", nullable: true),
                    HuisartsEmail = table.Column<string>(type: "TEXT", nullable: true),
                    VertegenwoordigerNaam = table.Column<string>(type: "TEXT", nullable: true),
                    VertegenwoordigerRelatie = table.Column<string>(type: "TEXT", nullable: true),
                    VertegenwoordigerTelefoon = table.Column<string>(type: "TEXT", nullable: true),
                    VertegenwoordigerEmail = table.Column<string>(type: "TEXT", nullable: true),
                    VertegenwoordigerAdres = table.Column<string>(type: "TEXT", nullable: true),
                    VertegenwoordigerPostcode = table.Column<string>(type: "TEXT", nullable: true),
                    VertegenwoordigerWoonplaats = table.Column<string>(type: "TEXT", nullable: true),
                    AanvullendeWensen = table.Column<string>(type: "TEXT", nullable: true),
                    Vertegenwoordiger2Naam = table.Column<string>(type: "TEXT", nullable: true),
                    Vertegenwoordiger2Relatie = table.Column<string>(type: "TEXT", nullable: true),
                    Vertegenwoordiger2Telefoon = table.Column<string>(type: "TEXT", nullable: true),
                    Vertegenwoordiger2Email = table.Column<string>(type: "TEXT", nullable: true),
                    SituatieOpties = table.Column<string>(type: "TEXT", nullable: true),
                    SituatieNotitie = table.Column<string>(type: "TEXT", nullable: true),
                    DementieClausule = table.Column<bool>(type: "INTEGER", nullable: false),
                    DementieClausuleToelichting = table.Column<string>(type: "TEXT", nullable: true),
                    BehandelVerbod = table.Column<string>(type: "TEXT", nullable: true),
                    AangemaaktOp = table.Column<DateTime>(type: "TEXT", nullable: false),
                    GewijzigdOp = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Wilsverklaringen", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Wilsverklaringen_Eigenaren_EigenaarId",
                        column: x => x.EigenaarId,
                        principalTable: "Eigenaren",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OrgaanKeuzes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    DonorRegistratieId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Orgaan = table.Column<string>(type: "TEXT", nullable: false),
                    WelDoneren = table.Column<bool>(type: "INTEGER", nullable: false),
                    Toelichting = table.Column<string>(type: "TEXT", nullable: true),
                    AangemaaktOp = table.Column<DateTime>(type: "TEXT", nullable: false),
                    GewijzigdOp = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrgaanKeuzes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OrgaanKeuzes_DonorRegistraties_DonorRegistratieId",
                        column: x => x.DonorRegistratieId,
                        principalTable: "DonorRegistraties",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ErfgenaamToewijzingen",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    EigenaarId = table.Column<Guid>(type: "TEXT", nullable: false),
                    ErfgenaamId = table.Column<Guid>(type: "TEXT", nullable: false),
                    EntityType = table.Column<string>(type: "TEXT", nullable: false),
                    EntityId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Instructies = table.Column<string>(type: "TEXT", nullable: true),
                    AangemaaktOp = table.Column<DateTime>(type: "TEXT", nullable: false),
                    GewijzigdOp = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ErfgenaamToewijzingen", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ErfgenaamToewijzingen_Eigenaren_EigenaarId",
                        column: x => x.EigenaarId,
                        principalTable: "Eigenaren",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ErfgenaamToewijzingen_Erfgenamen_ErfgenaamId",
                        column: x => x.ErfgenaamId,
                        principalTable: "Erfgenamen",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FysiekeBezittingen",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    EigenaarId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Categorie = table.Column<string>(type: "TEXT", nullable: false),
                    Omschrijving = table.Column<string>(type: "TEXT", nullable: false),
                    GeschatteWaarde = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Locatie = table.Column<string>(type: "TEXT", nullable: true),
                    BestemdeErfgenaamId = table.Column<Guid>(type: "TEXT", nullable: true),
                    VermogensSoort = table.Column<int>(type: "INTEGER", nullable: false),
                    Notities = table.Column<string>(type: "TEXT", nullable: true),
                    KadastraalNummer = table.Column<string>(type: "TEXT", nullable: true),
                    Kenteken = table.Column<string>(type: "TEXT", nullable: true),
                    KvKNummer = table.Column<string>(type: "TEXT", nullable: true),
                    AangemaaktOp = table.Column<DateTime>(type: "TEXT", nullable: false),
                    GewijzigdOp = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FysiekeBezittingen", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FysiekeBezittingen_Eigenaren_EigenaarId",
                        column: x => x.EigenaarId,
                        principalTable: "Eigenaren",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FysiekeBezittingen_Erfgenamen_BestemdeErfgenaamId",
                        column: x => x.BestemdeErfgenaamId,
                        principalTable: "Erfgenamen",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "Begunstigden",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    TestamentInfoId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Naam = table.Column<string>(type: "TEXT", nullable: false),
                    Relatie = table.Column<string>(type: "TEXT", nullable: false),
                    Telefoon = table.Column<string>(type: "TEXT", nullable: true),
                    Email = table.Column<string>(type: "TEXT", nullable: true),
                    Adres = table.Column<string>(type: "TEXT", nullable: true),
                    Postcode = table.Column<string>(type: "TEXT", nullable: true),
                    Woonplaats = table.Column<string>(type: "TEXT", nullable: true),
                    Omschrijving = table.Column<string>(type: "TEXT", nullable: true),
                    Percentage = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    IsLegitiemePortie = table.Column<bool>(type: "INTEGER", nullable: false),
                    AangemaaktOp = table.Column<DateTime>(type: "TEXT", nullable: false),
                    GewijzigdOp = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Begunstigden", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Begunstigden_Testamenten_TestamentInfoId",
                        column: x => x.TestamentInfoId,
                        principalTable: "Testamenten",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Executeurs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    TestamentInfoId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Naam = table.Column<string>(type: "TEXT", nullable: false),
                    Relatie = table.Column<string>(type: "TEXT", nullable: true),
                    Telefoon = table.Column<string>(type: "TEXT", nullable: true),
                    Email = table.Column<string>(type: "TEXT", nullable: true),
                    Adres = table.Column<string>(type: "TEXT", nullable: true),
                    Postcode = table.Column<string>(type: "TEXT", nullable: true),
                    Woonplaats = table.Column<string>(type: "TEXT", nullable: true),
                    Bevoegdheden = table.Column<string>(type: "TEXT", nullable: true),
                    AangemaaktOp = table.Column<DateTime>(type: "TEXT", nullable: false),
                    GewijzigdOp = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Executeurs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Executeurs_Testamenten_TestamentInfoId",
                        column: x => x.TestamentInfoId,
                        principalTable: "Testamenten",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TestamentSnapshots",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    TestamentInfoId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Versie = table.Column<int>(type: "INTEGER", nullable: false),
                    SnapshotDatum = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Notitie = table.Column<string>(type: "TEXT", nullable: true),
                    SnapshotJson = table.Column<string>(type: "TEXT", nullable: false),
                    AangemaaktOp = table.Column<DateTime>(type: "TEXT", nullable: false),
                    GewijzigdOp = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TestamentSnapshots", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TestamentSnapshots_Testamenten_TestamentInfoId",
                        column: x => x.TestamentInfoId,
                        principalTable: "Testamenten",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CeremonieDetails",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    UitvaartWensenId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Onderdeel = table.Column<string>(type: "TEXT", nullable: false),
                    Beschrijving = table.Column<string>(type: "TEXT", nullable: true),
                    Volgorde = table.Column<int>(type: "INTEGER", nullable: false),
                    Muziek = table.Column<string>(type: "TEXT", nullable: true),
                    Spreker = table.Column<string>(type: "TEXT", nullable: true),
                    Tekstlezing = table.Column<string>(type: "TEXT", nullable: true),
                    Dresscode = table.Column<string>(type: "TEXT", nullable: true),
                    AangemaaktOp = table.Column<DateTime>(type: "TEXT", nullable: false),
                    GewijzigdOp = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CeremonieDetails", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CeremonieDetails_UitvaartWensen_UitvaartWensenId",
                        column: x => x.UitvaartWensenId,
                        principalTable: "UitvaartWensen",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UitvaartGenodigden",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    UitvaartWensenId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Naam = table.Column<string>(type: "TEXT", nullable: false),
                    Relatie = table.Column<string>(type: "TEXT", nullable: true),
                    Telefoon = table.Column<string>(type: "TEXT", nullable: true),
                    Email = table.Column<string>(type: "TEXT", nullable: true),
                    Adres = table.Column<string>(type: "TEXT", nullable: true),
                    Postcode = table.Column<string>(type: "TEXT", nullable: true),
                    Woonplaats = table.Column<string>(type: "TEXT", nullable: true),
                    Notities = table.Column<string>(type: "TEXT", nullable: true),
                    AangemaaktOp = table.Column<DateTime>(type: "TEXT", nullable: false),
                    GewijzigdOp = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UitvaartGenodigden", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UitvaartGenodigden_UitvaartWensen_UitvaartWensenId",
                        column: x => x.UitvaartWensenId,
                        principalTable: "UitvaartWensen",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "VideoboodschapBlobs",
                columns: table => new
                {
                    VideoboodschapId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Inhoud = table.Column<byte[]>(type: "BLOB", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VideoboodschapBlobs", x => x.VideoboodschapId);
                    table.ForeignKey(
                        name: "FK_VideoboodschapBlobs_Videoboodschappen_VideoboodschapId",
                        column: x => x.VideoboodschapId,
                        principalTable: "Videoboodschappen",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "VideoboodschapOntvangers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    VideoboodschapId = table.Column<Guid>(type: "TEXT", nullable: false),
                    ErfgenaamId = table.Column<Guid>(type: "TEXT", nullable: false),
                    AangemaaktOp = table.Column<DateTime>(type: "TEXT", nullable: false),
                    GewijzigdOp = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VideoboodschapOntvangers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VideoboodschapOntvangers_Videoboodschappen_VideoboodschapId",
                        column: x => x.VideoboodschapId,
                        principalTable: "Videoboodschappen",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "EuthanasieVoorwaarden",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    WilsverklaringId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Voorwaarde = table.Column<string>(type: "TEXT", nullable: false),
                    Toelichting = table.Column<string>(type: "TEXT", nullable: true),
                    AangemaaktOp = table.Column<DateTime>(type: "TEXT", nullable: false),
                    GewijzigdOp = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EuthanasieVoorwaarden", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EuthanasieVoorwaarden_Wilsverklaringen_WilsverklaringId",
                        column: x => x.WilsverklaringId,
                        principalTable: "Wilsverklaringen",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Schulden",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    EigenaarId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Schuldeiser = table.Column<string>(type: "TEXT", nullable: false),
                    SchuldeiserTelefoon = table.Column<string>(type: "TEXT", nullable: true),
                    SchuldeiserEmail = table.Column<string>(type: "TEXT", nullable: true),
                    Type = table.Column<string>(type: "TEXT", nullable: false),
                    Bedrag = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    MaandelijkseAflossing = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Referentie = table.Column<string>(type: "TEXT", nullable: true),
                    VermogensSoort = table.Column<int>(type: "INTEGER", nullable: false),
                    Notities = table.Column<string>(type: "TEXT", nullable: true),
                    HypotheekVorm = table.Column<string>(type: "TEXT", nullable: true),
                    Rentepercentage = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    MaandelijkseRente = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Einddatum = table.Column<DateTime>(type: "TEXT", nullable: true),
                    Restschuld = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    LeaseMaatschappij = table.Column<string>(type: "TEXT", nullable: true),
                    BezitId = table.Column<Guid>(type: "TEXT", nullable: true),
                    AangemaaktOp = table.Column<DateTime>(type: "TEXT", nullable: false),
                    GewijzigdOp = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Schulden", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Schulden_Eigenaren_EigenaarId",
                        column: x => x.EigenaarId,
                        principalTable: "Eigenaren",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Schulden_FysiekeBezittingen_BezitId",
                        column: x => x.BezitId,
                        principalTable: "FysiekeBezittingen",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Bankrekeningen_EigenaarId",
                table: "Bankrekeningen",
                column: "EigenaarId");

            migrationBuilder.CreateIndex(
                name: "IX_Begunstigden_TestamentInfoId",
                table: "Begunstigden",
                column: "TestamentInfoId");

            migrationBuilder.CreateIndex(
                name: "IX_CeremonieDetails_UitvaartWensenId",
                table: "CeremonieDetails",
                column: "UitvaartWensenId");

            migrationBuilder.CreateIndex(
                name: "IX_CryptoWallets_EigenaarId",
                table: "CryptoWallets",
                column: "EigenaarId");

            migrationBuilder.CreateIndex(
                name: "IX_DigitaleAccounts_EigenaarId",
                table: "DigitaleAccounts",
                column: "EigenaarId");

            migrationBuilder.CreateIndex(
                name: "IX_Documenten_EigenaarId",
                table: "Documenten",
                column: "EigenaarId");

            migrationBuilder.CreateIndex(
                name: "IX_DonorRegistraties_EigenaarId",
                table: "DonorRegistraties",
                column: "EigenaarId");

            migrationBuilder.CreateIndex(
                name: "IX_ErfgenaamToewijzingen_EigenaarId",
                table: "ErfgenaamToewijzingen",
                column: "EigenaarId");

            migrationBuilder.CreateIndex(
                name: "IX_ErfgenaamToewijzingen_ErfgenaamId",
                table: "ErfgenaamToewijzingen",
                column: "ErfgenaamId");

            migrationBuilder.CreateIndex(
                name: "IX_Erfgenamen_EigenaarId",
                table: "Erfgenamen",
                column: "EigenaarId");

            migrationBuilder.CreateIndex(
                name: "IX_EuthanasieVoorwaarden_WilsverklaringId",
                table: "EuthanasieVoorwaarden",
                column: "WilsverklaringId");

            migrationBuilder.CreateIndex(
                name: "IX_Executeurs_TestamentInfoId",
                table: "Executeurs",
                column: "TestamentInfoId");

            migrationBuilder.CreateIndex(
                name: "IX_FysiekeBezittingen_BestemdeErfgenaamId",
                table: "FysiekeBezittingen",
                column: "BestemdeErfgenaamId");

            migrationBuilder.CreateIndex(
                name: "IX_FysiekeBezittingen_EigenaarId",
                table: "FysiekeBezittingen",
                column: "EigenaarId");

            migrationBuilder.CreateIndex(
                name: "IX_Noodcontacten_EigenaarId",
                table: "Noodcontacten",
                column: "EigenaarId");

            migrationBuilder.CreateIndex(
                name: "IX_OrgaanKeuzes_DonorRegistratieId",
                table: "OrgaanKeuzes",
                column: "DonorRegistratieId");

            migrationBuilder.CreateIndex(
                name: "IX_Schulden_BezitId",
                table: "Schulden",
                column: "BezitId");

            migrationBuilder.CreateIndex(
                name: "IX_Schulden_EigenaarId",
                table: "Schulden",
                column: "EigenaarId");

            migrationBuilder.CreateIndex(
                name: "IX_SectieNotities_EigenaarId",
                table: "SectieNotities",
                column: "EigenaarId");

            migrationBuilder.CreateIndex(
                name: "IX_Testamenten_EigenaarId",
                table: "Testamenten",
                column: "EigenaarId");

            migrationBuilder.CreateIndex(
                name: "IX_TestamentSnapshots_TestamentInfoId",
                table: "TestamentSnapshots",
                column: "TestamentInfoId");

            migrationBuilder.CreateIndex(
                name: "IX_UitvaartGenodigden_UitvaartWensenId",
                table: "UitvaartGenodigden",
                column: "UitvaartWensenId");

            migrationBuilder.CreateIndex(
                name: "IX_UitvaartWensen_EigenaarId",
                table: "UitvaartWensen",
                column: "EigenaarId");

            migrationBuilder.CreateIndex(
                name: "IX_Verzekeringen_EigenaarId",
                table: "Verzekeringen",
                column: "EigenaarId");

            migrationBuilder.CreateIndex(
                name: "IX_VideoboodschapOntvangers_VideoboodschapId",
                table: "VideoboodschapOntvangers",
                column: "VideoboodschapId");

            migrationBuilder.CreateIndex(
                name: "IX_Videoboodschappen_EigenaarId",
                table: "Videoboodschappen",
                column: "EigenaarId");

            migrationBuilder.CreateIndex(
                name: "IX_Wachtwoorden_EigenaarId",
                table: "Wachtwoorden",
                column: "EigenaarId");

            migrationBuilder.CreateIndex(
                name: "IX_Wilsverklaringen_EigenaarId",
                table: "Wilsverklaringen",
                column: "EigenaarId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ActualisatieBevestigingen");

            migrationBuilder.DropTable(
                name: "AfhandelingsItems");

            migrationBuilder.DropTable(
                name: "AuditLog");

            migrationBuilder.DropTable(
                name: "Bankrekeningen");

            migrationBuilder.DropTable(
                name: "Begunstigden");

            migrationBuilder.DropTable(
                name: "CeremonieDetails");

            migrationBuilder.DropTable(
                name: "CryptoWallets");

            migrationBuilder.DropTable(
                name: "DigitaleAccounts");

            migrationBuilder.DropTable(
                name: "Documenten");

            migrationBuilder.DropTable(
                name: "ErfgenaamToewijzingen");

            migrationBuilder.DropTable(
                name: "EuthanasieVoorwaarden");

            migrationBuilder.DropTable(
                name: "Executeurs");

            migrationBuilder.DropTable(
                name: "Noodcontacten");

            migrationBuilder.DropTable(
                name: "OrgaanKeuzes");

            migrationBuilder.DropTable(
                name: "Schulden");

            migrationBuilder.DropTable(
                name: "SectieNotities");

            migrationBuilder.DropTable(
                name: "TestamentSnapshots");

            migrationBuilder.DropTable(
                name: "UitvaartGenodigden");

            migrationBuilder.DropTable(
                name: "Verzekeringen");

            migrationBuilder.DropTable(
                name: "VideoboodschapBlobs");

            migrationBuilder.DropTable(
                name: "VideoboodschapOntvangers");

            migrationBuilder.DropTable(
                name: "Wachtwoorden");

            migrationBuilder.DropTable(
                name: "Wilsverklaringen");

            migrationBuilder.DropTable(
                name: "DonorRegistraties");

            migrationBuilder.DropTable(
                name: "FysiekeBezittingen");

            migrationBuilder.DropTable(
                name: "Testamenten");

            migrationBuilder.DropTable(
                name: "UitvaartWensen");

            migrationBuilder.DropTable(
                name: "Videoboodschappen");

            migrationBuilder.DropTable(
                name: "Erfgenamen");

            migrationBuilder.DropTable(
                name: "Eigenaren");
        }
    }
}
