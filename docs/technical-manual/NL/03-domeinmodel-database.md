# 3 — Domeinmodel & Database

## Database

Lumio gebruikt **SQLite** met **SQLCipher** voor volledige database-encryptie (AES-256). Elke profiel heeft een eigen databasebestand in de `data/` map.

**ORM:** Entity Framework Core 10 (code-first)
**Context:** `LumioDbContext` (295 regels, 22+ DbSets)

### Databasepad

```
data/
├── profiles.json          # Profielmanifest
├── {profiel-id}.db        # Versleutelde SQLite database
├── {profiel-id}.db-wal    # Write-ahead log
└── documents/             # Geüploade documenten
    └── {profiel-id}/
```

## Entiteiten (30)

### Common (Basis)

| Entiteit | DbSet | Doel |
|----------|-------|------|
| `BaseEntity` | — | Basisklasse: `Id` (GUID), `AangemaaktOp`, `GewijzigdOp` |
| `Eigenaar` | `Eigenaren` | Persoonsgegevens van de gebruiker |
| `Erfgenaam` | `Erfgenamen` | Erfgenaam (18 velden incl. legitimatie) |
| `Noodcontact` | `Noodcontacten` | Noodcontactpersonen |
| `AuditLogEntry` | `AuditLog` | Activiteitenlog (onwijzigbaar) |
| `AfhandelingsItem` | `AfhandelingsItems` | Afhandelingschecklist nabestaanden |
| `Profile` | — | Profielmetadata (in manifest, niet in DB) |
| `ActualisatieBevestiging` | `ActualisatieBevestigingen` | Bevestiging dat domein actueel is |
| `SectieNotitie` | `SectieNotities` | Vrije notities per sectie |

### Testament

| Entiteit | DbSet | Doel |
|----------|-------|------|
| `TestamentInfo` | `Testamenten` | Testamentgegevens |
| `Begunstigde` | `Begunstigden` | Begunstigde in testament |
| `Executeur` | `Executeurs` | Testamentexecuteur |
| `TestamentSnapshot` | `TestamentSnapshots` | Versiebeheer testament |

### Wilsverklaring Euthanasie

| Entiteit | DbSet | Doel |
|----------|-------|------|
| `WilsverklaringEuthanasie` | `Wilsverklaringen` | Euthanasieverklaring |
| `EuthanasieVoorwaarde` | `EuthanasieVoorwaarden` | Voorwaarden / situaties |

### Donorregistratie

| Entiteit | DbSet | Doel |
|----------|-------|------|
| `DonorRegistratie` | `DonorRegistraties` | Donorkeuze |
| `OrgaanKeuze` | `OrgaanKeuzes` | Per-orgaan beslissing |

### Digitaal Bezit

| Entiteit | DbSet | Doel |
|----------|-------|------|
| `DigitaalAccount` | `DigitaleAccounts` | Online account (platform, URL) |
| `WachtwoordEntry` | `Wachtwoorden` | Versleuteld wachtwoord |
| `CryptoWallet` | `CryptoWallets` | Cryptocurrency wallet |

### Bezittingen & Financiën (Boedel)

| Entiteit | DbSet | Doel |
|----------|-------|------|
| `FysiekBezit` | `FysiekeBezittingen` | Fysiek bezit (huis, auto, sieraden) |
| `Bankrekening` | `Bankrekeningen` | Bankrekening |
| `Verzekering` | `Verzekeringen` | Verzekeringspolis |
| `Schuld` | `Schulden` | Schuld / hypotheek |
| `ErfgenaamToewijzing` | `ErfgenaamToewijzingen` | Toewijzing bezit aan erfgenaam |
| `VermogensSoort` | — | Enum: soort vermogen |

### Uitvaart

| Entiteit | DbSet | Doel |
|----------|-------|------|
| `UitvaartWensen` | `UitvaartWensen` | Uitvaartwensen |
| `CeremonieDetail` | `CeremonieDetails` | Ceremonie-onderdeel |
| `UitvaartGenodigde` | `UitvaartGenodigden` | Genodigde bij uitvaart |

### Documenten

| Entiteit | DbSet | Doel |
|----------|-------|------|
| `PersoonlijkDocument` | `Documenten` | Geüpload document (metadata + verwijzing naar bestand) |

## Relaties

Alle entiteiten hangen af van `Eigenaar` als root-aggregaat. Cascade-delete is geconfigureerd zodat het verwijderen van een eigenaar alle gerelateerde gegevens verwijdert.

```
Eigenaar (1)
├── TestamentInfo (1)
│   ├── Begunstigde (n)
│   ├── Executeur (n)
│   └── TestamentSnapshot (n)
├── WilsverklaringEuthanasie (1)
│   └── EuthanasieVoorwaarde (n)
├── DonorRegistratie (1)
│   └── OrgaanKeuze (n)
├── DigitaalAccount (n)
│   └── WachtwoordEntry (n)
├── CryptoWallet (n)
├── FysiekBezit (n)
├── Bankrekening (n)
├── Verzekering (n)
├── Schuld (n)
├── ErfgenaamToewijzing (n)
├── UitvaartWensen (1)
│   ├── CeremonieDetail (n)
│   └── UitvaartGenodigde (n)
├── Erfgenaam (n)
├── Noodcontact (n)
├── PersoonlijkDocument (n)
├── SectieNotitie (n)
├── ActualisatieBevestiging (n)
├── AuditLogEntry (n)
└── AfhandelingsItem (n)
```

## Enumeraties

| Enum | Waarden |
|------|---------|
| `BurgerlijkeStaat` | Ongehuwd, Gehuwd, Geregistreerd partnerschap, Gescheiden, Weduwe/Weduwnaar |
| `HuwelijksVoorwaarden` | Gemeenschap van goederen, Huwelijkse voorwaarden, Beperkte gemeenschap |
| `LegitimatieSoort` | Geen (0), Paspoort (1), Identiteitskaart (2), Rijbewijs (3) |
| `VermogensSoort` | Onroerend goed, Voertuig, Sieraden, Kunst, Elektronica, Overig |
| `AfhandelingsStatus` | NietGestart, Bezig, Afgerond |

## BaseEntity

Alle entiteiten erven van `BaseEntity`:

```csharp
public abstract class BaseEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTime AangemaaktOp { get; set; } = DateTime.UtcNow;
    public DateTime GewijzigdOp { get; set; } = DateTime.UtcNow;
}
```

`GewijzigdOp` wordt automatisch bijgewerkt bij `SaveChanges()` via override in `LumioDbContext`.

## SQLCipher

De database wordt volledig versleuteld met SQLCipher:

```csharp
// Bij ontgrendeling:
connection.Open();
using var cmd = connection.CreateCommand();
cmd.CommandText = $"PRAGMA key = '{password}'";
cmd.ExecuteNonQuery();
```

- **Algoritme:** AES-256
- **Wachtwoord:** Alleen in-memory via `MasterPasswordService`
- **Per profiel:** Elk profiel krijgt een eigen versleuteld `.db`-bestand
- **Wachtwoord wijzigen:** Via `PRAGMA rekey`
