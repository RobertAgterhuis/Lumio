# 11 — Business Rules & Rule Engine

## Overview

Lumio uses an **externalizable rule system** based on Microsoft RulesEngine. All business rules, limits, and configurable values are defined in JSON files, not in code.

```
Architecture:

lumio-rules.json     ─┐
                      ├── IOptions<T> ──→ Services/Validators
lumio-workflows.json ─┘
                      └── RuleEngine ──→ MeldingService
                                    ──→ SuggestieService
```

## Directory Structure

```
src/Lumio.Api/Rules/
├── Configuration/              # IOptions<T> classes + DI
│   ├── RuleServiceExtensions.cs    # AddLumioRules() extension
│   ├── LumioRulesOptions.cs        # Version + date
│   ├── ErfbelastingOptions.cs      # Inheritance tax parameters
│   ├── LimietenOptions.cs          # System limits
│   ├── VeldLengtesOptions.cs       # Field lengths
│   ├── ValidatieOptions.cs         # Regex patterns
│   ├── EncryptieOptions.cs         # Encryption parameters
│   ├── ExportOptions.cs            # Export settings
│   └── CompleetheidsOptions.cs     # Completeness rules
├── Engine/                     # Microsoft RulesEngine wrapper
│   ├── RuleEngineService.cs        # IRuleEngineService (Singleton)
│   └── WorkflowLoader.cs          # Load workflows from JSON
├── Facts/                      # Input records
│   ├── MeldingFacts.cs
│   ├── SuggestieFacts.cs
│   ├── CompleetFacts.cs
│   ├── ErfbelastingFacts.cs
│   ├── LegitimairePortieFacts.cs
│   └── NalatenschapFacts.cs
├── Results/                    # Output records
│   ├── MeldingResultaat.cs
│   ├── SuggestieResultaat.cs
│   ├── CompleetheidsResultaat.cs
│   ├── ErfbelastingResultaat.cs
│   ├── LegitimairePortieResultaat.cs
│   ├── NalatenschapResultaat.cs
│   └── PolicyResult.cs
├── Services/                   # Domain services (Scoped)
│   ├── MeldingService.cs           # Warnings/reminders
│   ├── SuggestieService.cs         # Automatic suggestions
│   ├── CompleetheidsService.cs     # Profile completeness
│   ├── ErfbelastingService.cs      # Inheritance tax calculation
│   ├── LegitimairePortieService.cs # Legitimate portion (BW 4:63-4:69)
│   └── NalatenschapService.cs      # Net estate
├── NalatenschapHelper.cs       # Static helper
├── lumio-rules.json            # Configurable rules
├── lumio-rules.schema.json     # JSON Schema for validation
└── lumio-workflows.json        # RulesEngine workflow definitions
```

## lumio-rules.json

The central configuration file with all business rules and limits.

### Sections

#### `lumioRules` — Metadata

| Field | Value |
|-------|-------|
| Version | `2025.1` |
| Last modified | `2025-01-01` |

#### `erfbelasting` — Inheritance Tax 2025

| Property | Description |
|----------|-------------|
| **5 relationship groups** | Partner, Child, Grandchild, Parent, Other |
| **Exemptions** | Per relationship group (e.g., Partner: high, Child: lower) |
| **2 tax brackets** | Low and high rate per group |
| **Bracket threshold** | €154,197 |
| **Legitimate portion** | Relationships entitled to a legal share of the estate |
| **Disclaimer** | Template for indicative calculation |

#### `limieten` — System Limits

| Key | Value | Description |
|-----|-------|-------------|
| `maxProfielen` | 5 | Maximum number of profiles |
| `wachtwoordMinLengte` | 8 | Minimum password length |
| `shamirMinDrempel` | 2 | Minimum Shamir threshold |
| `backupVerouderdDagen` | 30 | Mark backup as outdated after |
| `documentVerloopWaarschuwingDagen` | 30 | Warning before document expiry date |
| `actualisatieIntervalDagen` | 90 | Reminder for actualization |
| `auditLogLimiet` | 200 | Maximum audit log entries |
| `zoekMinLengte` | 2 | Minimum search text length |
| `fotoMaxMB` | 10 | Maximum photo upload |
| `documentMaxMB` | 50 | Maximum document upload |
| `legitimatieVerloopWaarschuwingDagen` | 180 | Warn when ID document expires within this many days |
| `wilsverklaringHerbevestigingDagen` | 1825 | Suggest reconfirmation if advance directive is older than this many days (5 years) |

#### `veldLengtes` — Field Length Limits

| Field | Maximum |
|-------|---------|
| Name | 100 |
| Postal code | 10 |
| Email | 254 |
| Phone | 20 |
| Address | 200 |
| Description | 500 |
| Note | 2,000 |
| URL | 2,048 |

#### `validatie` — Regex Patterns

| Pattern | Purpose |
|---------|---------|
| IBAN | International bank account validation |
| Dutch postal code | Format `1234 AB` |
| Phone number | International format |

#### `encryptie` — Encryption Parameters

| Parameter | Value |
|-----------|-------|
| PBKDF2 iterations | 100,000 |
| Salt length | 32 bytes |
| Nonce length | 12 bytes |
| Tag length | 16 bytes |
| Key length | 32 bytes |

#### `export` — Export Settings

Paper format A4, margins 40pt, allowed file types.

#### `compleetheid` — Completeness Scoring

Caps for calculating profile completeness:

| Category | Maximum counted |
|----------|----------------|
| Digital assets | 3 |
| Documents | 3 |
| Heirs | 2 |
| Emergency contacts | 2 |

Plus field counts per domain for the completeness calculation.

## lumio-workflows.json — RulesEngine Workflows

### MeldingenWorkflow (15 rules)

Generates warnings and reminders:

| Rule | Trigger |
|------|---------|
| `GeenProfiel` | No profile created |
| `GeenTestament` | Will not filled in |
| `GeenWilsverklaring` | Advance directive missing |
| `GeenDonor` | Organ donation not filled in |
| `GeenUitvaart` | Funeral wishes missing |
| `GeenErfgenamen` | No heirs specified |
| `GeenNoodcontacten` | No emergency contacts specified |
| `GeenDocumenten` | No documents uploaded |
| `NooitBackup` | Never made a backup |
| `BackupVerouderd` | Backup older than 30 days |
| `ShamirNietVerdeeld` | Shamir emergency codes not distributed |
| `VerlopenDocumenten` | Documents past expiry date |
| `BijnaVerlopenDocumenten` | Documents nearing expiry |
| `NooitGeactualiseerd` | Profile never updated |
| `ActualisatieVerlopen` | Actualization more than 90 days ago |

### SuggestiesWorkflow (16 rules)

Generates automatic suggestions using a **hybrid strategy**: the original 4 boolean rules run through the RulesEngine; the 12 iteration-based BR-SUG rules always run via code (fallback-safe).

#### Engine rules — lumio-workflows.json (4)

| Rule | Suggestion |
|------|------------|
| `NotarisInconsistentie` | Notary data not consistent |
| `NotarisGeenNoodcontact` | Notary not listed as emergency contact |
| `UitvaartondernemerGeenNoodcontact` | Funeral director not listed as emergency contact |
| `GeenHuisarts` | No GP filled in |

All engine rules use `LambdaExpression` with `SuccessEvent` containing JSON payloads.

#### Code rules — SuggestieService.cs (12)

These rules iterate over lists or require multi-field logic that cannot be expressed in the RulesEngine DSL.

| BR-code | Trigger | Legal basis |
|---------|---------|-------------|
| `BR-SUG-13` | Executor named in will but not listed as emergency contact | — |
| `BR-SUG-14` | Emergency contact has no phone number | — |
| `BR-SUG-15` | Will pre-dates marriage or registered partnership | BW art. 4:46 |
| `BR-SUG-16` | Will exists but has no CTR registration number | Wet op het Notarisambt art. 38a |
| `BR-SUG-17` | Married / registered partnership but no marriage property regime recorded | BW art. 1:94 |
| `BR-SUG-18` | Divorced but ex-partner still listed as heir (relationship Partner / Spouse) | BW art. 4:52 |
| `BR-SUG-19` | Identity document expires within 180 days or already expired | — |
| `BR-SUG-20` | Advance directive representative(s) not listed as emergency contact | KNMG Guideline 2022 |
| `BR-SUG-21` | Advance directive older than 5 years (1825 days) | NVVE advice |
| `BR-SUG-22` | GP named in advance directive not listed as emergency contact | — |
| `BR-SUG-23` | Donor decision-maker ("specific person") not listed as emergency contact | Wet orgaandonatie art. 9 |
| `BR-SUG-24` | Donor wish recorded in Lumio but not officially registered with Donor Register | — |

##### SuggestieFacts input record

```csharp
public record SuggestieFacts(
    bool HeeftEigenaar, string? EigenaarNotaris,
    List<SuggestieErfgenaamFact> Erfgenamen,
    List<SuggestieNoodcontactFact> Noodcontacten,
    SuggestieTestamentFact? Testament,
    string? UitvaartOndernemer,
    int AantalVerzekeringenZonderBegunstigde,
    bool HeeftHypotheekZonderBezit,
    bool HeeftAccountOverdragenZonderNaam,
    bool HeeftCryptoZonderSeedPhrase,
    bool HeeftAccountZonderActie,
    BurgerlijkeStaat BurgerlijkeStaat,       // Sprint 2
    HuwelijksVoorwaarden HuwelijksVoorwaarden, // Sprint 2
    DateOnly? DatumHuwelijk,                 // Sprint 2
    DateOnly? LegitimatieGeldigTot,          // Sprint 2
    SuggestieWilsverklaringFact? Wilsverklaring, // Sprint 3
    SuggestieDonorFact? Donor);              // Sprint 3

public record SuggestieTestamentFact(
    string? NotarisNaam, List<string> BegunstigdeNamen,
    List<string> ExecuteurNamen,
    DateOnly? DatumTestament,   // Sprint 2
    bool HeeftCtrNummer);       // Sprint 2

public record SuggestieWilsverklaringFact( // Sprint 3
    string? VertegenwoordigerNaam, string? Vertegenwoordiger2Naam,
    string? HuisartsNaam, DateOnly? DatumOndertekening);

public record SuggestieDonorFact(          // Sprint 3
    string Keuze, string? BeslisserNaam,
    bool IsGeregistreerdBijDonorregister);
```

## Engine-First with Fallback

`MeldingService` and `SuggestieService` use a **dual pattern**:

```
Request arrives
  ├── Try RulesEngine (lumio-workflows.json)
  │   ├── Success → return results
  │   └── Error/unavailable ↓
  └── Fallback to hardcoded domain logic
      └── Return results
```

This ensures the application always works, even if the workflow files are missing or contain errors.

## DI Registration — AddLumioRules()

The extension method `AddLumioRules()` in `RuleServiceExtensions.cs` registers everything:

```csharp
public static IServiceCollection AddLumioRules(
    this IServiceCollection services,
    IConfiguration configuration)
{
    // 1. Load lumio-rules.json as configuration source
    // 2. Bind 8 IOptions sections:
    //    - LumioRulesOptions, ErfbelastingOptions, LimietenOptions
    //    - VeldLengtesOptions, ValidatieOptions, EncryptieOptions
    //    - ExportOptions, CompleetheidsOptions
    // 3. Singletons: WorkflowLoader, RuleEngineService
    // 4. Scoped: 6 domain services
    // 5. Startup validation: log warning if rules are missing
}
```

Called in `Program.cs`:

```csharp
builder.Services.AddLumioRules(builder.Configuration);
```

## Facts → Results Pattern

Each domain service follows the same pattern:

```
Input: *Facts record
  │
  ↓
Service.Calculate(facts)
  │
  ↓
Output: PolicyResult<*Result>
  ├── Result (calculated values)
  ├── Applied rule IDs
  ├── Warnings
  └── Rule version
```

## FluentValidation

In addition to the rule engine, request validations are performed with FluentValidation:

| Validator | DTOs |
|-----------|------|
| `AssetValidators.cs` | Bank account (IBAN regex), physical possession, insurance, debt |
| `AuthValidators.cs` | Setup (password min length), unlock, password change |
| `DigitalEstateValidators.cs` | Digital account, password entry, crypto wallet |
| `EigenaarValidator.cs` | Owner (field lengths from config) |
| `ErfgenaamValidator.cs` | Heir (field lengths from config) |

Validators are automatically registered via:

```csharp
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<Program>();
```

Many validators inject `IOptions<T>` to use the configured values from `lumio-rules.json` (e.g., IBAN regex, minimum password length, field length limits).
