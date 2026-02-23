# 3. Domeinmodel & Database

## 3.1 Overzicht

Lumio gebruikt Entity Framework Core 10.0.3 met SQLite als database-engine, versleuteld via SQLCipher. Elke gebruiker (profiel) heeft een eigen versleutelde database.

### Database per profiel

```
data/
├── profiles.json          # Onversleuteld manifest (profielnamen, relaties)
├── a1b2c3d4-....db        # Versleutelde SQLite database (profiel 1)
├── a1b2c3d4-....salt      # Salt voor veldversleuteling (profiel 1)
├── e5f6g7h8-....db        # Versleutelde SQLite database (profiel 2)
└── e5f6g7h8-....salt      # Salt voor veldversleuteling (profiel 2)
```

## 3.2 BaseEntity

Alle domeinentiteiten erven van `BaseEntity`:

```csharp
public abstract class BaseEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTime AangemaaktOp { get; set; } = DateTime.UtcNow;
    public DateTime GewijzigdOp { get; set; } = DateTime.UtcNow;
}
```

- **Id** — Primaire sleutel, automatisch gegenereerd als `Guid.NewGuid()`
- **AangemaaktOp** — Creatiedatumstempel (UTC)
- **GewijzigdOp** — Automatisch bijgewerkt bij elke wijziging via `LumioDbContext.UpdateTimestamps()`

## 3.3 Entiteiten-diagram

```
                              ┌─────────────┐
                              │  Eigenaar   │ (1 per profiel)
                              └──────┬──────┘
                                     │ 1:N
            ┌────────────────────────┼────────────────────────┐
            │            │           │           │            │
     ┌──────▼──────┐  ┌──▼────┐  ┌──▼──────┐ ┌──▼──────┐ ┌──▼──────┐
     │  Erfgenaam  │  │Nood-  │  │Testament│ │Uitvaart │ │Euthan-  │
     │             │  │contact│  │Info     │ │Wensen   │ │asie     │
     └──────┬──────┘  └───────┘  └────┬────┘ └────┬────┘ └────┬────┘
            │                         │            │           │
     ┌──────▼──────┐           ┌──────┼──────┐     │     ┌─────▼─────┐
     │Toewijzing   │           │      │      │     │     │Voorwaarde │
     │(bezit→erf)  │        ┌──▼──┐┌──▼──┐┌──▼──┐  │     └───────────┘
     └─────────────┘        │Beg- ││Exec-││Snap-│  │
                            │uns- ││uteur││shot │  │
                            │tigde│└─────┘└─────┘  │
                            └─────┘           ┌────┼────┐
                                             │         │
     ┌─────────────┐                    ┌────▼───┐┌───▼────┐
     │DonorReg.    │                    │Ceremon.││Genod-  │
     │             │                    │Detail  ││igde    │
     └──────┬──────┘                    └────────┘└────────┘
            │
     ┌──────▼──────┐
     │OrgaanKeuze  │
     └─────────────┘

     ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
     │FysiekBezit  │  │Bankrekening │  │Verzekering  │
     ├─────────────┤  ├─────────────┤  ├─────────────┤
     │Schuld       │  │DigitaalAcc. │  │WachtwoordE. │
     └─────────────┘  ├─────────────┤  └─────────────┘
                      │CryptoWallet │
                      └─────────────┘

     Ondersteunend:
     ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
     │AuditLogEntry│  │Afhandelings-│  │SectieNotitie│
     │             │  │Item         │  │             │
     └─────────────┘  └─────────────┘  └─────────────┘
     ┌─────────────┐  ┌─────────────┐
     │Actualisatie-│  │Persoonlijk  │
     │Bevestiging  │  │Document     │
     └─────────────┘  └─────────────┘
```

## 3.4 Entiteiten — Common

### 3.4.1 Eigenaar

Persoonsgegevens van de profileigenaar. Eén per database.

| Property | Type | Beschrijving |
|----------|------|-------------|
| `Voornaam` | `string` | Voornaam |
| `Achternaam` | `string` | Achternaam |
| `Tussenvoegsel` | `string?` | Tussenvoegsel (bijv. "van der") |
| `Geboortedatum` | `DateOnly` | Geboortedatum |
| `BSN` | `string?` | Burgerservicenummer |
| `Adres`, `Postcode`, `Woonplaats` | `string?` | Adresgegevens |
| `Telefoon`, `Email` | `string?` | Contactgegevens |
| `Notaris`, `NotarisKantoor`, `NotarisTelefoon`, `NotarisEmail`, `NotarisAdres`, `NotarisPostcode`, `NotarisPlaats` | `string?` | Notarisgegevens |
| `BurgerlijkeStaat` | `BurgerlijkeStaat` (enum) | Ongehuwd, Gehuwd, GeregistreerdPartnerschap, Gescheiden, Weduwe |
| `HuwelijksVoorwaarden` | `HuwelijksVoorwaarden` (enum) | NietVanToepassing, GemeenschapVanGoederen, BeperkteGemeenschap, KoudeUitsluiting |
| `DatumHuwelijk` | `DateOnly?` | Datum huwelijk/partnerschap |
| `LegitimatieSoort` | `LegitimatieSoort` (enum) | Geen, Paspoort, Identiteitskaart, Rijbewijs |
| `LegitimatieNummer` | `string?` | Documentnummer |
| `LegitimatieDatumAfgifte` | `DateOnly?` | Afgiftedatum |
| `LegitimatieGeldigTot` | `DateOnly?` | Geldigheid |
| `ProfielFoto` | `byte[]?` | Profielfoto (binair) |
| `ProfielFotoContentType` | `string?` | MIME-type (bijv. "image/jpeg") |
| `ProfielFotoNaam` | `string?` | Oorspronkelijke bestandsnaam |
| `HeeftProfielFoto` | `bool` | [NotMapped] Computed property |

### 3.4.2 Erfgenaam

| Property | Type | Beschrijving |
|----------|------|-------------|
| `EigenaarId` | `Guid` | FK naar Eigenaar |
| `Voornaam` | `string` | Voornaam |
| `Achternaam` | `string` | Achternaam |
| `Tussenvoegsel` | `string?` | Tussenvoegsel |
| `Relatie` | `string` | Relatie tot eigenaar (bijv. "Kind", "Partner") |
| `Telefoon`, `Email` | `string?` | Contactgegevens |
| `Adres`, `Postcode`, `Woonplaats` | `string?` | Adresgegevens |
| `Geboortedatum` | `DateOnly?` | Geboortedatum |
| `BSN` | `string?` | Burgerservicenummer |
| `ShareIndex` | `int?` | Index van de toegewezen Shamir-share |
| `HeeftShareOntvangen` | `bool` | Of de share is uitgereikt |
| `ShareUitgegevenOp` | `DateTime?` | Datum van uitgifte |
| `LegitimatieSoort`, `LegitimatieNummer`, `LegitimatieDatumAfgifte`, `LegitimatieGeldigTot` | diversen | Legitimatiegegevens |

### 3.4.3 Noodcontact

| Property | Type | Beschrijving |
|----------|------|-------------|
| `EigenaarId` | `Guid` | FK naar Eigenaar |
| `Naam` | `string` | Volledige naam |
| `Relatie` | `string` | Relatie tot eigenaar |
| `Telefoon`, `Email` | `string?` | Contactgegevens |
| `Adres`, `Postcode`, `Woonplaats` | `string?` | Adresgegevens |
| `Rol` | `string` | Huisarts, Notaris, Uitvaartondernemer, Vertrouwenspersoon, Overig |
| `Instructies` | `string?` | Specifieke instructies |
| `IsGedeeld` | `bool` | Markering als gedeeld contact (relevant voor meerdere profielen) |

### 3.4.4 Profile

**Let op:** Profile wordt niet in de database opgeslagen maar in `profiles.json`.

| Property | Type | Beschrijving |
|----------|------|-------------|
| `Id` | `Guid` | Uniek profiel-ID |
| `Naam` | `string` | Profielnaam |
| `Relatie` | `string` | "Primair", "Partner", "Kind", "Ouder", "Overig" |
| `DbBestand` | `string` | Bestandsnaam database (bijv. "{id}.db") |
| `AangemaaktOp` | `DateTime` | Aanmaakdatum |
| `IsPrimair` | `bool` | Of dit het primaire profiel is |

### 3.4.5 AuditLogEntry

Audit-trail van alle wijzigingen.

| Property | Type | Beschrijving |
|----------|------|-------------|
| `Id` | `Guid` | Primaire sleutel |
| `Tijdstip` | `DateTime` | Tijdstip van de actie |
| `Actie` | `string` | "Aangemaakt", "Gewijzigd", "Verwijderd", "Ontgrendeld", "Vergrendeld", "Export" |
| `EntityType` | `string?` | Type entiteit (bijv. "Erfgenaam") |
| `EntityId` | `Guid?` | ID van de betreffende entiteit |
| `Details` | `string?` | Extra context |

### 3.4.6 SectieNotitie

Persoonlijke notities per applicatiesectie.

| Property | Type | Beschrijving |
|----------|------|-------------|
| `EigenaarId` | `Guid` | FK naar Eigenaar |
| `Sectie` | `string` | testament, euthanasie, donor, digitaal-bezit, boedel, uitvaart, documenten, erfgenamen, noodcontacten |
| `Inhoud` | `string` | Notitietekst |

### 3.4.7 AfhandelingsItem

Afhandelingstracker voor nabestaanden.

| Property | Type | Beschrijving |
|----------|------|-------------|
| `Domein` | `string` | Categorie (bijv. "noodcontacten", "uitvaart") |
| `EntityId` | `Guid?` | Optionele referentie naar specifieke entiteit |
| `Label` | `string?` | Beschrijving van het item |
| `Status` | `AfhandelingsStatus` (enum) | Open, InBehandeling, Afgehandeld |
| `Notitie` | `string?` | Opmerkingen |
| `AfgehandeldOp` | `DateTime?` | Datum afhandeling |

### 3.4.8 ActualisatieBevestiging

Bijhouding wanneer een sectie voor het laatst is gecontroleerd.

| Property | Type | Beschrijving |
|----------|------|-------------|
| `EigenaarId` | `Guid` | FK naar Eigenaar |
| `Domein` | `string` | Sectienaam |
| `BevestigdOp` | `DateTime` | Datum laatste bevestiging |

## 3.5 Entiteiten — Testament

### 3.5.1 TestamentInfo

| Property | Type | Beschrijving |
|----------|------|-------------|
| `EigenaarId` | `Guid` | FK naar Eigenaar |
| `TestamentType` | `string?` | Type testament |
| `NotarisNaam` t/m `NotarisPlaats` | `string?` | Notarisgegevens |
| `DatumTestament` | `DateOnly?` | Datum testament |
| `TestamentLocatie` | `string?` | Fysieke locatie document |
| `CTR_Nummer` | `string?` | Centraal Testamentenregister nummer |
| `AlgemeneWensen` | `string?` | Algemene wensen |
| `BijzondereBepalingen` | `string?` | Bijzondere bepalingen |
| `UitsluitingsClausule` | `bool` | Uitsluitingsclausule actief |
| `Legaten` | `string?` | Legaten |
| `Begunstigden` | `List<Begunstigde>` | Navigatie-eigenschap |
| `Executeurs` | `List<Executeur>` | Navigatie-eigenschap |
| `Snapshots` | `List<TestamentSnapshot>` | Versiegeschiedenis |

### 3.5.2 Begunstigde

| Property | Type | Beschrijving |
|----------|------|-------------|
| `TestamentInfoId` | `Guid` | FK naar TestamentInfo |
| `Naam` | `string` | Volledige naam |
| `Relatie` | `string` | Relatie tot eigenaar |
| `Telefoon`, `Email`, `Adres`, `Postcode`, `Woonplaats` | `string?` | Contactgegevens |
| `Omschrijving` | `string?` | Beschrijving van het legaat |
| `Percentage` | `decimal?` | Percentage van de nalatenschap (precision 5,2) |
| `IsLegitiemePortie` | `bool` | Of dit een legitimaire portie betreft |

### 3.5.3 Executeur

| Property | Type | Beschrijving |
|----------|------|-------------|
| `TestamentInfoId` | `Guid` | FK naar TestamentInfo |
| `Naam` | `string` | Volledige naam |
| `Relatie` | `string?` | Relatie tot eigenaar |
| `Telefoon`, `Email`, `Adres`, `Postcode`, `Woonplaats` | `string?` | Contactgegevens |
| `Bevoegdheden` | `string?` | Beschrijving bevoegdheden |

### 3.5.4 TestamentSnapshot

| Property | Type | Beschrijving |
|----------|------|-------------|
| `TestamentInfoId` | `Guid` | FK naar TestamentInfo |
| `Versie` | `int` | Versienummer |
| `SnapshotDatum` | `DateTime` | Datum van de snapshot |
| `Notitie` | `string?` | Versienotitie |
| `SnapshotJson` | `string` | JSON-serialisatie van alle testamentvelden |

## 3.6 Entiteiten — Digitaal Bezit

### 3.6.1 DigitaalAccount

| Property | Type | Beschrijving |
|----------|------|-------------|
| `EigenaarId` | `Guid` | FK naar Eigenaar |
| `PlatformNaam` | `string` | Naam van het platform (bijv. "Facebook") |
| `Categorie` | `string?` | Categorie (bijv. "Social media") |
| `Gebruikersnaam` | `string?` | Gebruikersnaam |
| `EmailAdres` | `string?` | Gekoppeld e-mailadres |
| `Url` | `string?` | URL naar het platform |
| `GewensteActie` | `string` | Gewenste actie bij overlijden |
| `OverdrachtAan` | `string?` | Aan wie overdragen |
| `Notities` | `string?` | Opmerkingen |

### 3.6.2 WachtwoordEntry

| Property | Type | Beschrijving |
|----------|------|-------------|
| `EigenaarId` | `Guid` | FK naar Eigenaar |
| `Naam` | `string` | Naam/label |
| `Gebruikersnaam` | `string?` | Gebruikersnaam |
| `EncryptedWachtwoord` | `string` | AES-256-GCM versleuteld wachtwoord |
| `Url` | `string?` | URL |
| `Notities` | `string?` | Opmerkingen |

### 3.6.3 CryptoWallet

| Property | Type | Beschrijving |
|----------|------|-------------|
| `EigenaarId` | `Guid` | FK naar Eigenaar |
| `WalletNaam` | `string` | Naam van de wallet |
| `CryptoType` | `string` | Type crypto (bijv. "Bitcoin") |
| `WalletAdres` | `string?` | Publiek wallet-adres |
| `EncryptedSeedPhrase` | `string?` | AES-256-GCM versleutelde seed phrase |
| `Exchange` | `string?` | Exchange-platform |
| `Notities` | `string?` | Opmerkingen |

## 3.7 Entiteiten — Uitvaart

### 3.7.1 UitvaartWensen

| Property | Type | Beschrijving |
|----------|------|-------------|
| `EigenaarId` | `Guid` | FK naar Eigenaar |
| `VoorkeurType` | `string` | Begraven, Cremeren, Natuurbegraven |
| `Begraafplaats` | `string?` | Gewenste begraafplaats |
| `UitvaartOndernemer` t/m `UitvaartOndernemerPlaats` | `string?` | Uitvaartondernemer-gegevens |
| `HeeftUitvaartVerzekering` | `bool` | Heeft uitvaartverzekering |
| `UitvaartVerzekeringDetails` | `string?` | Details verzekering |
| `CeremonieSoort`, `CeremonieLocatie` | `string?` | Ceremonie voorkeuren |
| `Muziekwensen`, `Sprekers`, `Bloemen`, `Kledingwensen` | `string?` | Details |
| `RouwkaartTekst`, `RouwadvertentieTekst`, `Condoleance` | `string?` | Teksten |
| `OverigeWensen` | `string?` | Overige wensen |
| `VoorkeurBegraafplaatsNaam/Adres`, `VoorkeurCrematoriumnaam/Adres`, `VoorkeurAulaNaam/Adres` | `string?` | Locatie-voorkeuren |
| `BudgetRichting` | `string?` | Budgetindicatie |

### 3.7.2 CeremonieDetail

| Property | Type | Beschrijving |
|----------|------|-------------|
| `UitvaartWensenId` | `Guid` | FK naar UitvaartWensen |
| `Onderdeel` | `string` | Onderdeel van de ceremonie |
| `Beschrijving` | `string?` | Beschrijving |
| `Volgorde` | `int` | Volgorde in de ceremonie |
| `Muziek`, `Spreker`, `Tekstlezing`, `Dresscode` | `string?` | Uitgebreide details |

### 3.7.3 UitvaartGenodigde

| Property | Type | Beschrijving |
|----------|------|-------------|
| `UitvaartWensenId` | `Guid` | FK naar UitvaartWensen |
| `Naam`, `Relatie`, `Telefoon`, `Email`, `Adres`, `Postcode`, `Woonplaats`, `Notities` | `string?` | Genodigde-gegevens |

## 3.8 Entiteiten — Euthanasie

### 3.8.1 WilsverklaringEuthanasie

| Property | Type | Beschrijving |
|----------|------|-------------|
| `EigenaarId` | `Guid` | FK naar Eigenaar |
| `DatumOndertekening` | `DateOnly?` | Ondertekeningsdatum |
| `WilEuthanasie` | `bool` | Wens voor euthanasie |
| `SituatieBeschrijving` | `string?` | Beschrijving van de situatie |
| `Huisarts`, `HuisartsPraktijk`, `HuisartsTelefoon`, `HuisartsEmail` | `string?` | Huisartsgegevens |
| `VertegenwoordigerNaam` t/m `VertegenwoordigerWoonplaats` | `string?` | Vertegenwoordiger-gegevens |
| `AanvullendeWensen` | `string?` | Aanvullende wensen |
| `DementieClausule` | `bool` | Dementie-clausule actief |
| `DementieClausuleToelichting` | `string?` | Toelichting |
| `BehandelVerbod` | `string?` | Behandelverbod |

### 3.8.2 EuthanasieVoorwaarde

| Property | Type | Beschrijving |
|----------|------|-------------|
| `WilsverklaringId` | `Guid` | FK naar WilsverklaringEuthanasie |
| `Voorwaarde` | `string` | Beschrijving voorwaarde |
| `Toelichting` | `string?` | Toelichting |

## 3.9 Entiteiten — Donorregistratie

### 3.9.1 DonorRegistratie

| Property | Type | Beschrijving |
|----------|------|-------------|
| `EigenaarId` | `Guid` | FK naar Eigenaar |
| `Keuze` | `string` | Donorkeuze |
| `IsGeregistreerdBijDonorregister` | `bool` | Geregistreerd bij Donorregister |
| `DonorregisterReferentie` | `string?` | Referentienummer |
| `Toelichting` | `string?` | Toelichting |

### 3.9.2 OrgaanKeuze

| Property | Type | Beschrijving |
|----------|------|-------------|
| `DonorRegistratieId` | `Guid` | FK naar DonorRegistratie |
| `Orgaan` | `string` | Naam van het orgaan |
| `WelDoneren` | `bool` | Wel of niet doneren |
| `Toelichting` | `string?` | Toelichting |

## 3.10 Entiteiten — Vermogensbeheer (Boedel)

### 3.10.1 FysiekBezit

| Property | Type | Beschrijving |
|----------|------|-------------|
| `EigenaarId` | `Guid` | FK naar Eigenaar |
| `Categorie` | `string` | Categorie (bijv. "Onroerend goed") |
| `Omschrijving` | `string` | Beschrijving |
| `GeschatteWaarde` | `decimal?` | Geschatte waarde (precision 18,2) |
| `Locatie` | `string?` | Fysieke locatie |
| `BestemdeErfgenaam` | `string?` | Beoogde erfgenaam |
| `VermogensSoort` | `VermogensSoort` (enum) | Privé of Gemeenschap |
| `Notities` | `string?` | Opmerkingen |
| `KadastraalNummer` | `string?` | Kadastrale referentie |
| `Kenteken` | `string?` | Voertuig kenteken |
| `KvKNummer` | `string?` | KvK-nummer (onderneming) |

### 3.10.2 VermogensSoort (enum)

| Waarde | Int | Beschrijving |
|--------|-----|-------------|
| `Prive` | 0 | Privévermogen |
| `Gemeenschap` | 1 | Gemeenschappelijk vermogen |

### 3.10.3 Bankrekening

| Property | Type | Beschrijving |
|----------|------|-------------|
| `EigenaarId` | `Guid` | FK naar Eigenaar |
| `BankNaam` | `string` | Naam van de bank |
| `IBAN` | `string` | IBAN-nummer |
| `RekeningType` | `string` | Type rekening (bijv. "Betaalrekening") |
| `Saldo` | `decimal?` | Huidig saldo (precision 18,2) |
| `VermogensSoort` | `VermogensSoort` | Privé of Gemeenschap |

### 3.10.4 Verzekering

| Property | Type | Beschrijving |
|----------|------|-------------|
| `EigenaarId` | `Guid` | FK naar Eigenaar |
| `Verzekeraar` | `string` | Naam verzekeraar |
| `VerzekeraarTelefoon`, `VerzekeraarEmail` | `string?` | Contactgegevens |
| `PolisNummer` | `string` | Polisnummer |
| `Type` | `string` | Type verzekering |
| `VerzekerdBedrag` | `decimal?` | Verzekerd bedrag (precision 18,2) |
| `Begunstigde` | `string?` | Begunstigde |
| `VermogensSoort` | `VermogensSoort` | Privé of Gemeenschap |

### 3.10.5 Schuld

| Property | Type | Beschrijving |
|----------|------|-------------|
| `EigenaarId` | `Guid` | FK naar Eigenaar |
| `Schuldeiser` | `string` | Naam schuldeiser |
| `SchuldeiserTelefoon`, `SchuldeiserEmail` | `string?` | Contactgegevens |
| `Type` | `string` | Type schuld (bijv. "Hypotheek") |
| `Bedrag` | `decimal` | Bedrag van de schuld (precision 18,2) |
| `MaandelijkseAflossing` | `decimal?` | Maandelijkse aflossing (precision 18,2) |
| `Referentie` | `string?` | Referentienummer |
| `VermogensSoort` | `VermogensSoort` | Privé of Gemeenschap |

### 3.10.6 ErfgenaamToewijzing

| Property | Type | Beschrijving |
|----------|------|-------------|
| `EigenaarId` | `Guid` | FK naar Eigenaar |
| `ErfgenaamId` | `Guid` | FK naar Erfgenaam |
| `EntityType` | `string` | Type entiteit (bijv. "FysiekBezit", "Bankrekening") |
| `EntityId` | `Guid` | ID van de toegewezen entiteit |
| `Instructies` | `string?` | Specifieke instructies |

## 3.11 Entiteiten — Documenten

### 3.11.1 PersoonlijkDocument

| Property | Type | Beschrijving |
|----------|------|-------------|
| `EigenaarId` | `Guid` | FK naar Eigenaar |
| `Naam` | `string` | Document naam |
| `Categorie` | `string` | Categorie (bijv. "Legitimatie", "Financieel") |
| `BestandsNaam` | `string` | Oorspronkelijke bestandsnaam |
| `ContentType` | `string` | MIME-type |
| `BestandsGrootte` | `long` | Bestandsgrootte in bytes |
| `BestandsInhoud` | `byte[]` | Binaire inhoud (versleuteld in DB) |
| `Notities` | `string?` | Opmerkingen |
| `VerlooptOp` | `DateOnly?` | Vervaldatum (bijv. paspoort) |
| `DocumentGroepId` | `Guid` | Groeperings-ID voor alle versies |
| `Versie` | `int` | Versienummer (begint bij 1) |

## 3.12 LumioDbContext

### DbSets

```csharp
// Common
public DbSet<Eigenaar> Eigenaren
public DbSet<Erfgenaam> Erfgenamen
public DbSet<Noodcontact> Noodcontacten

// Testament
public DbSet<TestamentInfo> Testamenten
public DbSet<Begunstigde> Begunstigden
public DbSet<Executeur> Executeurs
public DbSet<TestamentSnapshot> TestamentSnapshots

// Euthanasie
public DbSet<WilsverklaringEuthanasie> Wilsverklaringen
public DbSet<EuthanasieVoorwaarde> EuthanasieVoorwaarden

// Donor
public DbSet<DonorRegistratie> DonorRegistraties
public DbSet<OrgaanKeuze> OrgaanKeuzes

// Digitaal Bezit
public DbSet<DigitaalAccount> DigitaleAccounts
public DbSet<WachtwoordEntry> Wachtwoorden
public DbSet<CryptoWallet> CryptoWallets

// Boedel
public DbSet<FysiekBezit> FysiekeBezittingen
public DbSet<Bankrekening> Bankrekeningen
public DbSet<Verzekering> Verzekeringen
public DbSet<Schuld> Schulden
public DbSet<ErfgenaamToewijzing> ErfgenaamToewijzingen

// Uitvaart
public DbSet<UitvaartWensen> UitvaartWensen
public DbSet<CeremonieDetail> CeremonieDetails
public DbSet<UitvaartGenodigde> UitvaartGenodigden

// Documenten
public DbSet<PersoonlijkDocument> Documenten

// Audit
public DbSet<AuditLogEntry> AuditLog

// Status-tracking
public DbSet<AfhandelingsItem> AfhandelingsItems

// Actualisatie
public DbSet<ActualisatieBevestiging> ActualisatieBevestigingen

// Notities
public DbSet<SectieNotitie> SectieNotities
```

### Relaties (OnModelCreating)

| Parent → Child | FK | Cascade Delete |
|---------------|-----|---------------|
| Eigenaar → Erfgenaam | `EigenaarId` | Ja |
| Eigenaar → Noodcontact | `EigenaarId` | Ja |
| Eigenaar → TestamentInfo | `EigenaarId` | — |
| Eigenaar → UitvaartWensen | `EigenaarId` | — |
| Eigenaar → WilsverklaringEuthanasie | `EigenaarId` | — |
| Eigenaar → DonorRegistratie | `EigenaarId` | — |
| Eigenaar → FysiekBezit | `EigenaarId` | Ja |
| Eigenaar → Bankrekening | `EigenaarId` | Ja |
| Eigenaar → Verzekering | `EigenaarId` | Ja |
| Eigenaar → Schuld | `EigenaarId` | Ja |
| Eigenaar → DigitaalAccount | `EigenaarId` | Ja |
| Eigenaar → WachtwoordEntry | `EigenaarId` | Ja |
| Eigenaar → CryptoWallet | `EigenaarId` | Ja |
| Eigenaar → PersoonlijkDocument | `EigenaarId` | Ja |
| Eigenaar → SectieNotitie | `EigenaarId` | Ja |
| Eigenaar → ErfgenaamToewijzing | `EigenaarId` | Ja |
| TestamentInfo → Begunstigde | `TestamentInfoId` | — |
| TestamentInfo → Executeur | `TestamentInfoId` | — |
| TestamentInfo → TestamentSnapshot | `TestamentInfoId` | — |
| UitvaartWensen → CeremonieDetail | `UitvaartWensenId` | — |
| UitvaartWensen → UitvaartGenodigde | `UitvaartWensenId` | — |
| WilsverklaringEuthanasie → EuthanasieVoorwaarde | `WilsverklaringId` | — |
| DonorRegistratie → OrgaanKeuze | `DonorRegistratieId` | — |
| Erfgenaam → ErfgenaamToewijzing | `ErfgenaamId` | Ja |

### Decimal-precisie

| Entity | Property | Column Type |
|--------|----------|------------|
| `Begunstigde` | `Percentage` | `decimal(5,2)` |
| `FysiekBezit` | `GeschatteWaarde` | `decimal(18,2)` |
| `Verzekering` | `VerzekerdBedrag` | `decimal(18,2)` |
| `Schuld` | `Bedrag` | `decimal(18,2)` |
| `Schuld` | `MaandelijkseAflossing` | `decimal(18,2)` |
| `Bankrekening` | `Saldo` | `decimal(18,2)` |

### Automatische functies

#### Timestamp-bijwerking

Bij elke `SaveChanges()` of `SaveChangesAsync()` wordt `GewijzigdOp` automatisch bijgewerkt voor alle gewijzigde `BaseEntity`-entries:

```csharp
private void UpdateTimestamps()
{
    foreach (var entry in ChangeTracker.Entries<BaseEntity>())
    {
        if (entry.State == EntityState.Modified)
            entry.Entity.GewijzigdOp = DateTime.UtcNow;
    }
}
```

#### Automatische audit logging

Bij elke `SaveChanges()` worden alle aangemaakt, gewijzigde en verwijderde `BaseEntity`-entries automatisch naar de `AuditLog` geschreven:

```csharp
private void TrackAuditLog()
{
    var entries = ChangeTracker.Entries<BaseEntity>()
        .Where(e => e.State is EntityState.Added or EntityState.Modified or EntityState.Deleted)
        .ToList();

    foreach (var entry in entries)
    {
        var actie = entry.State switch
        {
            EntityState.Added => "Aangemaakt",
            EntityState.Modified => "Gewijzigd",
            EntityState.Deleted => "Verwijderd",
            _ => "Onbekend"
        };

        AuditLog.Add(new AuditLogEntry
        {
            Actie = actie,
            EntityType = entry.Entity.GetType().Name,
            EntityId = entry.Entity.Id,
            Details = $"{entityType} {actie.ToLower()}"
        });
    }
}
```

## 3.13 Migratiestrategie

Lumio gebruikt **geen** EF Core Migrations. De database wordt automatisch aangemaakt via `EnsureCreated()` bij de eerste unlock. Schema-wijzigingen worden direct doorgevoerd bij de volgende opstart.

Dit is een bewuste keuze:
- De applicatie is offline en single-user — er zijn geen complexe schema-migraties nodig
- SQLCipher-databases worden per profiel aangemaakt
- Bij grote schema-wijzigingen kan de gebruiker een backup exporteren en importeren in een nieuw profiel
