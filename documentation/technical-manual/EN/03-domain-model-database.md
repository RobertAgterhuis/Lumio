# 3 — Domain Model & Database

## Database

Lumio uses **SQLite** with **SQLCipher** for full database encryption (AES-256). Each profile has its own database file in the `data/` directory.

**ORM:** Entity Framework Core 10 (code-first)
**Context:** `LumioDbContext` (295 lines, 22+ DbSets)

### Database Path

```
data/
├── profiles.json          # Profile manifest
├── {profile-id}.db        # Encrypted SQLite database
├── {profile-id}.db-wal    # Write-ahead log
└── documents/             # Uploaded documents
    └── {profile-id}/
```

## Entities (30)

### Common (Base)

| Entity | DbSet | Purpose |
|--------|-------|---------|
| `BaseEntity` | — | Base class: `Id` (GUID), `AangemaaktOp`, `GewijzigdOp` |
| `Eigenaar` | `Eigenaren` | Personal data of the user |
| `Erfgenaam` | `Erfgenamen` | Heir (18 fields incl. identification) |
| `Noodcontact` | `Noodcontacten` | Emergency contacts |
| `AuditLogEntry` | `AuditLog` | Activity log (immutable) |
| `AfhandelingsItem` | `AfhandelingsItems` | Settlement checklist for heirs |
| `Profile` | — | Profile metadata (in manifest, not in DB) |
| `ActualisatieBevestiging` | `ActualisatieBevestigingen` | Confirmation that domain is up to date |
| `SectieNotitie` | `SectieNotities` | Free-text notes per section |

### Testament

| Entity | DbSet | Purpose |
|--------|-------|---------|
| `TestamentInfo` | `Testamenten` | Will/testament data |
| `Begunstigde` | `Begunstigden` | Beneficiary in will |
| `Executeur` | `Executeurs` | Will executor |
| `TestamentSnapshot` | `TestamentSnapshots` | Will version management |

### Euthanasia Advance Directive

| Entity | DbSet | Purpose |
|--------|-------|---------|
| `WilsverklaringEuthanasie` | `Wilsverklaringen` | Euthanasia directive |
| `EuthanasieVoorwaarde` | `EuthanasieVoorwaarden` | Conditions / situations |

### Organ Donation Registration

| Entity | DbSet | Purpose |
|--------|-------|---------|
| `DonorRegistratie` | `DonorRegistraties` | Donor choice |
| `OrgaanKeuze` | `OrgaanKeuzes` | Per-organ decision |

### Digital Estate

| Entity | DbSet | Purpose |
|--------|-------|---------|
| `DigitaalAccount` | `DigitaleAccounts` | Online account (platform, URL) |
| `WachtwoordEntry` | `Wachtwoorden` | Encrypted password |
| `CryptoWallet` | `CryptoWallets` | Cryptocurrency wallet |

### Assets & Finances (Estate)

| Entity | DbSet | Purpose |
|--------|-------|---------|
| `FysiekBezit` | `FysiekeBezittingen` | Physical possession (house, car, jewelry) |
| `Bankrekening` | `Bankrekeningen` | Bank account |
| `Verzekering` | `Verzekeringen` | Insurance policy |
| `Schuld` | `Schulden` | Debt / mortgage |
| `ErfgenaamToewijzing` | `ErfgenaamToewijzingen` | Asset assignment to heir |
| `VermogensSoort` | — | Enum: asset type |

### Funeral

| Entity | DbSet | Purpose |
|--------|-------|---------|
| `UitvaartWensen` | `UitvaartWensen` | Funeral wishes |
| `CeremonieDetail` | `CeremonieDetails` | Ceremony element |
| `UitvaartGenodigde` | `UitvaartGenodigden` | Funeral guest |

### Documents

| Entity | DbSet | Purpose |
|--------|-------|---------|
| `PersoonlijkDocument` | `Documenten` | Uploaded document (metadata + file reference) |

### Video Messages

| Entity | DbSet | Purpose |
|--------|-------|---------|
| `Videoboodschap` | `Videoboodschappen` | Video message metadata (title, description, filename, duration) |
| `VideoboodschapBlob` | `VideoboodschapBlobs` | Binary video data (kept separate from metadata for efficient list queries) |
| `VideoboodschapOntvanger` | — | Receiver link: video message → heir |

## Relationships

All entities depend on `Eigenaar` as the root aggregate. Cascade delete is configured so that deleting an owner removes all related data.

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

## Enumerations

| Enum | Values |
|------|--------|
| `BurgerlijkeStaat` | Ongehuwd, Gehuwd, Geregistreerd partnerschap, Gescheiden, Weduwe/Weduwnaar |
| `HuwelijksVoorwaarden` | Gemeenschap van goederen, Huwelijkse voorwaarden, Beperkte gemeenschap |
| `LegitimatieSoort` | Geen (0), Paspoort (1), Identiteitskaart (2), Rijbewijs (3) |
| `VermogensSoort` | Onroerend goed, Voertuig, Sieraden, Kunst, Elektronica, Overig |
| `AfhandelingsStatus` | NietGestart, Bezig, Afgerond |

## BaseEntity

All entities inherit from `BaseEntity`:

```csharp
public abstract class BaseEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTime AangemaaktOp { get; set; } = DateTime.UtcNow;
    public DateTime GewijzigdOp { get; set; } = DateTime.UtcNow;
}
```

`GewijzigdOp` is automatically updated on `SaveChanges()` via an override in `LumioDbContext`.

## SQLCipher

The database is fully encrypted with SQLCipher:

```csharp
// On unlock:
connection.Open();
using var cmd = connection.CreateCommand();
cmd.CommandText = $"PRAGMA key = '{password}'";
cmd.ExecuteNonQuery();
```

- **Algorithm:** AES-256
- **Password:** In-memory only via `MasterPasswordService`
- **Per profile:** Each profile gets its own encrypted `.db` file
- **Password change:** Via `PRAGMA rekey`
