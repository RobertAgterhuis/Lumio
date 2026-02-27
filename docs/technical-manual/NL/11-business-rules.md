# 11 — Business Rules & Rule Engine

## Overzicht

Lumio gebruikt een **externaliseerbaar regelsysteem** op basis van Microsoft RulesEngine. Alle bedrijfsregels, limieten en configureerbare waarden zijn gedefinieerd in JSON-bestanden, niet in code.

```
Architectuur:

lumio-rules.json     ─┐
                      ├── IOptions<T> ──→ Services/Validators
lumio-workflows.json ─┘
                      └── RuleEngine ──→ MeldingService
                                    ──→ SuggestieService
```

## Directorystructuur

```
src/Lumio.Api/Rules/
├── Configuration/              # IOptions<T> klassen + DI
│   ├── RuleServiceExtensions.cs    # AddLumioRules() extensie
│   ├── LumioRulesOptions.cs        # Versie + datum
│   ├── ErfbelastingOptions.cs      # Erfbelasting parameters
│   ├── LimietenOptions.cs          # Systeemlimieten
│   ├── VeldLengtesOptions.cs       # Veldlengtes
│   ├── ValidatieOptions.cs         # Regex patronen
│   ├── EncryptieOptions.cs         # Encryptie parameters
│   ├── ExportOptions.cs            # Export instellingen
│   └── CompleetheidsOptions.cs     # Compleetheidsregels
├── Engine/                     # Microsoft RulesEngine wrapper
│   ├── RuleEngineService.cs        # IRuleEngineService (Singleton)
│   └── WorkflowLoader.cs          # Workflows laden uit JSON
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
├── Services/                   # Domeinservices (Scoped)
│   ├── MeldingService.cs           # Waarschuwingen/herinneringen
│   ├── SuggestieService.cs         # Automatische suggesties
│   ├── CompleetheidsService.cs     # Profiel-compleetheid
│   ├── ErfbelastingService.cs      # Erfbelasting berekening
│   ├── LegitimairePortieService.cs # Legitieme portie (BW 4:63-4:69)
│   └── NalatenschapService.cs      # Netto nalatenschap
├── NalatenschapHelper.cs       # Statische helper
├── lumio-rules.json            # Configureerbare regels
├── lumio-rules.schema.json     # JSON Schema voor validatie
└── lumio-workflows.json        # RulesEngine workflow definities
```

## lumio-rules.json

Het centrale configuratiebestand met alle bedrijfsregels en limieten.

### Secties

#### `lumioRules` — Metadata

| Veld | Waarde |
|------|--------|
| Versie | `2025.1` |
| Laatst gewijzigd | `2025-01-01` |

#### `erfbelasting` — Erfbelasting 2025

| Eigenschap | Beschrijving |
|------------|--------------|
| **5 relatiegroepen** | Partner, Kind, Kleinkind, Ouder, Overig |
| **Vrijstellingen** | Per relatiegroep (bijv. Partner: hoog, Kind: lager) |
| **2 tariefschijven** | Laag en hoog tarief per groep |
| **Schijfgrens** | €154.197 |
| **Legitieme portie** | Relaties die recht hebben op wettelijk erfdeel |
| **Disclaimer** | Template voor indicatieve berekening |

#### `limieten` — Systeemlimieten

| Sleutel | Waarde | Beschrijving |
|---------|--------|--------------|
| `maxProfielen` | 5 | Maximaal aantal profielen |
| `wachtwoordMinLengte` | 8 | Minimale wachtwoordlengte |
| `shamirMinDrempel` | 2 | Minimum Shamir-threshold |
| `backupVerouderdDagen` | 30 | Backup als verouderd markeren na |
| `documentVerloopWaarschuwingDagen` | 30 | Waarschuwing vóór documentverloopdatum |
| `actualisatieIntervalDagen` | 90 | Herinnering voor actualisatie |
| `auditLogLimiet` | 200 | Maximum auditlog-vermeldingen |
| `zoekMinLengte` | 2 | Minimaal zoektekst lengte |
| `fotoMaxMB` | 10 | Maximum foto-upload |
| `documentMaxMB` | 50 | Maximum document-upload |
| `legitimatieVerloopWaarschuwingDagen` | 180 | Waarschuw wanneer legitimatiebewijs binnen dit aantal dagen verloopt |
| `wilsverklaringHerbevestigingDagen` | 1825 | Stel herbevestiging voor als wilsverklaring ouder is dan dit aantal dagen (5 jaar) |

#### `veldLengtes` — Veldlengtelimieten

| Veld | Maximum |
|------|---------|
| Naam | 100 |
| Postcode | 10 |
| E-mail | 254 |
| Telefoon | 20 |
| Adres | 200 |
| Beschrijving | 500 |
| Notitie | 2.000 |
| URL | 2.048 |

#### `validatie` — Regex Patronen

| Patroon | Doel |
|---------|------|
| IBAN | Internationale bankrekening validatie |
| Nederlandse postcode | Formaat `1234 AB` |
| Telefoonnummer | Internationaal formaat |

#### `encryptie` — Encryptie Parameters

| Parameter | Waarde |
|-----------|--------|
| PBKDF2 iteraties | 100.000 |
| Salt-lengte | 32 bytes |
| Nonce-lengte | 12 bytes |
| Tag-lengte | 16 bytes |
| Sleutellengte | 32 bytes |

#### `export` — Export Instellingen

Papierformaat A4, marges 40pt, toegestane bestandstypen.

#### `compleetheid` — Compleetheidsscoring

Caps voor het berekenen van profiel-compleetheid:

| Categorie | Maximum meegeteld |
|-----------|-------------------|
| Digitale bezittingen | 3 |
| Documenten | 3 |
| Erfgenamen | 2 |
| Noodcontacten | 2 |

Plus veldtellingen per domein voor de compleetheidsberekening.

## lumio-workflows.json — RulesEngine Workflows

### MeldingenWorkflow (15 regels)

Genereert waarschuwingen en herinneringen:

| Regel | Trigger |
|-------|---------|
| `GeenProfiel` | Geen profiel aangemaakt |
| `GeenTestament` | Testament niet ingevuld |
| `GeenWilsverklaring` | Wilsverklaring ontbreekt |
| `GeenDonor` | Donorregistratie niet ingevuld |
| `GeenUitvaart` | Uitvaartwensen ontbreken |
| `GeenErfgenamen` | Geen erfgenamen opgegeven |
| `GeenNoodcontacten` | Geen noodcontacten opgegeven |
| `GeenDocumenten` | Geen documenten geüpload |
| `NooitBackup` | Nog nooit een backup gemaakt |
| `BackupVerouderd` | Backup ouder dan 30 dagen |
| `ShamirNietVerdeeld` | Shamir noodcodes niet verdeeld |
| `VerlopenDocumenten` | Documenten voorbij de verloopdatum |
| `BijnaVerlopenDocumenten` | Documenten bijna verlopen |
| `NooitGeactualiseerd` | Profiel nooit bijgewerkt |
| `ActualisatieVerlopen` | Actualisatie langer dan 90 dagen geleden |

### SuggestiesWorkflow (16 regels)

Genereert automatische suggesties via een **hybride strategie**: de originele 4 booleaanse regels draaien via de RulesEngine; de 12 iteratiegebaseerde BR-SUG regels draaien altijd via code (fallback-veilig).

#### Engine-regels — lumio-workflows.json (4)

| Regel | Suggestie |
|-------|----------|
| `NotarisInconsistentie` | Notarisgegevens niet consistent |
| `NotarisGeenNoodcontact` | Notaris niet als noodcontact opgegeven |
| `UitvaartondernemerGeenNoodcontact` | Uitvaartondernemer niet als noodcontact |
| `GeenHuisarts` | Geen huisarts ingevuld |

Alle engine-regels gebruiken `LambdaExpression` met `SuccessEvent` die JSON-payloads bevatten.

#### Code-regels — SuggestieService.cs (12)

Deze regels itereren over lijsten of vereisen meerveldige logica die niet in de RulesEngine DSL uit te drukken is.

| BR-code | Trigger | Rechtsbasis |
|---------|---------|-------------|
| `BR-SUG-13` | Executeur in testament maar niet als noodcontact | — |
| `BR-SUG-14` | Noodcontact heeft geen telefoonnummer | — |
| `BR-SUG-15` | Testament dateert vóór huwelijk of geregistreerd partnerschap | BW art. 4:46 |
| `BR-SUG-16` | Testament aanwezig maar geen CTR-registratienummer | Wet op het Notarisambt art. 38a |
| `BR-SUG-17` | Gehuwd / geregistreerd partnerschap maar geen huwelijksgoederenregime vastgelegd | BW art. 1:94 |
| `BR-SUG-18` | Gescheiden maar ex-partner nog als erfgenaam (relatie Partner / Echtgenoot) | BW art. 4:52 |
| `BR-SUG-19` | Legitimatiebewijs verloopt binnen 180 dagen of al verlopen | — |
| `BR-SUG-20` | Vertegenwoordiger(s) wilsverklaring niet als noodcontact | KNMG Richtlijn 2022 |
| `BR-SUG-21` | Wilsverklaring ouder dan 5 jaar (1825 dagen) | NVVE-advies |
| `BR-SUG-22` | Huisarts uit wilsverklaring niet als noodcontact | — |
| `BR-SUG-23` | Donor-beslisser (\"specifiek persoon\") niet als noodcontact | Wet orgaandonatie art. 9 |
| `BR-SUG-24` | Donorkeuze vastgelegd in Lumio maar niet officieel geregistreerd bij Donorregister | — |

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
    BurgerlijkeStaat BurgerlijkeStaat,           // Sprint 2
    HuwelijksVoorwaarden HuwelijksVoorwaarden,   // Sprint 2
    DateOnly? DatumHuwelijk,                     // Sprint 2
    DateOnly? LegitimatieGeldigTot,              // Sprint 2
    SuggestieWilsverklaringFact? Wilsverklaring, // Sprint 3
    SuggestieDonorFact? Donor);                  // Sprint 3

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

## Engine-First met Fallback

`MeldingService` en `SuggestieService` gebruiken een **dubbel patroon**:

```
Aanvraag binnenkomst
  ├── Probeer RulesEngine (lumio-workflows.json)
  │   ├── Succes → retourneer resultaten
  │   └── Fout/niet beschikbaar ↓
  └── Fallback naar hardcoded domeinlogica
      └── Retourneer resultaten
```

Dit zorgt ervoor dat de applicatie altijd werkt, ook als de workflow-bestanden ontbreken of fouten bevatten.

## DI Registratie — AddLumioRules()

De extensiemethode `AddLumioRules()` in `RuleServiceExtensions.cs` registreert alles:

```csharp
public static IServiceCollection AddLumioRules(
    this IServiceCollection services,
    IConfiguration configuration)
{
    // 1. Laad lumio-rules.json als configuratiebron
    // 2. Bind 8 IOptions secties:
    //    - LumioRulesOptions, ErfbelastingOptions, LimietenOptions
    //    - VeldLengtesOptions, ValidatieOptions, EncryptieOptions
    //    - ExportOptions, CompleetheidsOptions
    // 3. Singletons: WorkflowLoader, RuleEngineService
    // 4. Scoped: 6 domeinservices
    // 5. Startup-validatie: log waarschuwing als regels ontbreken
}
```

Aangeroepen in `Program.cs`:

```csharp
builder.Services.AddLumioRules(builder.Configuration);
```

## Facts → Results Patroon

Elke domeinservice volgt hetzelfde patroon:

```
Input: *Facts record
  │
  ↓
Service.Bereken(facts)
  │
  ↓
Output: PolicyResult<*Resultaat>
  ├── Resultaat (berekende waarden)
  ├── Toegepaste regel-ID's
  ├── Waarschuwingen
  └── Regelversie
```

## FluentValidation

Naast de rule engine worden request-validaties uitgevoerd met FluentValidation:

| Validator | DTO's |
|-----------|-------|
| `AssetValidators.cs` | Bankrekening (IBAN regex), fysiek bezit, verzekering, schuld |
| `AuthValidators.cs` | Setup (wachtwoord min lengte), ontgrendel, wachtwoord wijzigen |
| `DigitalEstateValidators.cs` | Digitaal account, wachtwoord entry, crypto wallet |
| `EigenaarValidator.cs` | Eigenaar (veldlengtes uit config) |
| `ErfgenaamValidator.cs` | Erfgenaam (veldlengtes uit config) |

Validators worden automatisch geregistreerd via:

```csharp
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<Program>();
```

Veel validators injecteren `IOptions<T>` om de geconfigureerde waarden uit `lumio-rules.json` te gebruiken (bijv. IBAN-regex, minimale wachtwoordlengte, veldlengtelimieten).
