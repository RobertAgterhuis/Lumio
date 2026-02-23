# Lumio – Volledige Inventarisatie Bedrijfsregels, Validatie & Domeinconstraints

> **Gegenereerd op basis van:** alle `.cs`-bestanden in `src/Lumio.Api/`  
> **Scope:** Validators, Domain Models, Controllers, Services, Middleware, DbContext, Program.cs

---

## Inhoudsopgave

1. [Authenticatie & Beveiliging](#1-authenticatie--beveiliging)
2. [Profielen](#2-profielen)
3. [Eigenaar (Persoonsgegevens)](#3-eigenaar-persoonsgegevens)
4. [Erfgenamen](#4-erfgenamen)
5. [Testament](#5-testament)
6. [Euthanasie / Wilsverklaring](#6-euthanasie--wilsverklaring)
7. [Donorregistratie](#7-donorregistratie)
8. [Digitaal Bezit](#8-digitaal-bezit)
9. [Boedel (Vermogensoverzicht)](#9-boedel-vermogensoverzicht)
10. [Uitvaart](#10-uitvaart)
11. [Documenten](#11-documenten)
12. [Noodcontacten](#12-noodcontacten)
13. [Toewijzingen](#13-toewijzingen)
14. [Shamir Secret Sharing](#14-shamir-secret-sharing)
15. [Afhandeling](#15-afhandeling)
16. [Status & Compleetheid](#16-status--compleetheid)
17. [Zoeken](#17-zoeken)
18. [Export](#18-export)
19. [Backup & Restore](#19-backup--restore)
20. [Audit Log](#20-audit-log)
21. [Middleware (Toegangscontrole)](#21-middleware-toegangscontrole)
22. [Encryptie & Sleutelbeheer](#22-encryptie--sleutelbeheer)
23. [Database & Entity Framework](#23-database--entity-framework)
24. [Applicatieconfiguratie](#24-applicatieconfiguratie)

---

## 1. Authenticatie & Beveiliging

### 1.1 FluentValidation – `SetupRequestValidator`
**Bestand:** `Validators/AuthValidators.cs`  
**Klasse:** `SetupRequestValidator`  
**Configuratie:** `IOptions<LimietenOptions>`

| Veld | Regel | Parameter |
|------|-------|----------|
| `Wachtwoord` | `NotEmpty()` | — |
| `Wachtwoord` | `MinimumLength(limieten.WachtwoordMinLengte)` | Via `IOptions<LimietenOptions>` (standaard: 8) |

### 1.2 FluentValidation – `OntgrendelRequestValidator`
**Bestand:** `Validators/AuthValidators.cs`  
**Klasse:** `OntgrendelRequestValidator`

| Veld | Regel | Parameter |
|------|-------|-----------|
| `Wachtwoord` | `NotEmpty()` | — |

### 1.3 FluentValidation – `WachtwoordWijzigenRequestValidator`
**Bestand:** `Validators/AuthValidators.cs`  
**Klasse:** `WachtwoordWijzigenRequestValidator`  
**Configuratie:** `IOptions<LimietenOptions>`

| Veld | Regel | Parameter |
|------|-------|-----------|
| `HuidigWachtwoord` | `NotEmpty()` | — |
| `NieuwWachtwoord` | `NotEmpty()` | — |
| `NieuwWachtwoord` | `MinimumLength(limieten.WachtwoordMinLengte)` | Via `IOptions<LimietenOptions>` (standaard: 8) |

### 1.4 FluentValidation – `OntgrendelErfgenaamRequestValidator`
**Bestand:** `Validators/AuthValidators.cs`  
**Klasse:** `OntgrendelErfgenaamRequestValidator`

| Veld | Regel | Parameter |
|------|-------|-----------|
| `Shares` | `NotEmpty()` | Melding: "Minimaal één share is vereist" |

### 1.5 Controller – Setup
**Bestand:** `Controllers/AuthController.cs`  
**Methode:** `Setup(SetupRequest request)`

| # | Regel | HTTP-status | Melding |
|---|-------|-------------|---------|
| 1 | Profiel moet geselecteerd zijn (`_profileService.ActiveProfile == null`) | 400 | "Geen profiel geselecteerd" |
| 2 | Profiel moet op IsFirstRun staan | 400 | "Er is al een wachtwoord ingesteld voor dit profiel" |
| 3 | Wachtwoord ≥ 8 tekens (extra check bovenop validator) | 400 | "Wachtwoord moet minimaal 8 tekens lang zijn" |
| 4 | Na setup: `IsFirstRun = false`, `IsUnlocked = true` | — | — |

### 1.6 Controller – Ontgrendel
**Bestand:** `Controllers/AuthController.cs`  
**Methode:** `Ontgrendel(OntgrendelRequest request)`

| # | Regel | HTTP-status | Melding |
|---|-------|-------------|---------|
| 1 | Profiel moet geselecteerd zijn | 400 | "Geen profiel geselecteerd" |
| 2 | Profiel mag niet op IsFirstRun staan | 400 | "Er is nog geen wachtwoord ingesteld. Gebruik /setup" |
| 3 | Profiel mag niet al ontgrendeld zijn | 400 | "Profiel is al ontgrendeld" |
| 4 | Wachtwoord wordt geverifieerd via SQLCipher PRAGMA-query | 401 | "Onjuist wachtwoord" |
| 5 | Na succes: `IsUnlocked = true`, `IsReadOnly = false` | — | — |

### 1.7 Controller – Vergrendel
**Bestand:** `Controllers/AuthController.cs`  
**Methode:** `Vergrendel()`

| # | Regel | Effect |
|---|-------|--------|
| 1 | Vergrendelt profiel: `IsUnlocked = false` | — |
| 2 | Deselecteert profiel: `ActiveProfile = null` | — |
| 3 | Reset MasterPasswordService state | — |

### 1.8 Controller – WijzigWachtwoord
**Bestand:** `Controllers/AuthController.cs`  
**Methode:** `WijzigWachtwoord(WachtwoordWijzigenRequest request)`

| # | Regel | HTTP-status | Melding |
|---|-------|-------------|---------|
| 1 | Profiel moet geselecteerd en ontgrendeld zijn | 400 | "Geen actief en ontgrendeld profiel" |
| 2 | Nieuw wachtwoord ≥ 8 tekens | 400 | "Nieuw wachtwoord moet minimaal 8 tekens lang zijn" |
| 3 | Huidig wachtwoord wordt geverifieerd | 401 | "Huidig wachtwoord is onjuist" |
| 4 | SQLCipher `PRAGMA rekey` wijzigt database-encryptie | — | — |
| 5 | Encryptie salt-bestand wordt vernieuwd (nieuwe random salt) | — | — |
| 6 | Alle versleutelde velden worden her-versleuteld met nieuwe sleutel | — | — |
| 7 | Waarschuwing: "bestaande Shamir-sleuteldelen zijn ongeldig geworden" | — | In response |

### 1.9 Controller – DeleteAccount
**Bestand:** `Controllers/AuthController.cs`  
**Methode:** `DeleteAccount(OntgrendelRequest request)`

| # | Regel | HTTP-status | Melding |
|---|-------|-------------|---------|
| 1 | Profiel moet geselecteerd en ontgrendeld zijn | 400 | "Geen actief en ontgrendeld profiel" |
| 2 | Wachtwoord moet correct zijn | 401 | "Onjuist wachtwoord" |
| 3 | Database + salt-bestand worden fysiek verwijderd | — | — |
| 4 | Profiel wordt verwijderd uit ProfileService | — | — |

### 1.10 Controller – OntgrendelErfgenaam (Shamir)
**Bestand:** `Controllers/AuthController.cs`  
**Methode:** `OntgrendelErfgenaam(OntgrendelErfgenaamRequest request)`

| # | Regel | HTTP-status | Melding |
|---|-------|-------------|---------|
| 1 | Profiel moet geselecteerd zijn | 400 | "Geen profiel geselecteerd" |
| 2 | Profiel mag niet al ontgrendeld zijn | 400 | "Profiel is al ontgrendeld" |
| 3 | Shamir-reconstructie van master password uit shares | — | — |
| 4 | Gereconstrueerd wachtwoord wordt geverifieerd tegen DB | 401 | "De opgegeven shares vormen geen geldig wachtwoord" |
| 5 | Na succes: `IsUnlocked = true`, **`IsReadOnly = true`** | — | Erfgenamen krijgen altijd read-only toegang |

---

## 2. Profielen

### 2.1 Controller – Profielbeheer
**Bestand:** `Controllers/ProfileController.cs`

| # | Regel | Methode | HTTP-status | Melding |
|---|-------|---------|-------------|---------|
| 1 | Maximum 5 profielen (`IProfileService.MaxProfiles = 5`) | `CreateProfile` | 400 | "Maximum aantal profielen bereikt (5)" |
| 2 | Eerste profiel is altijd relatie "Primair" | `CreateProfile` | — | Automatisch ingesteld |
| 3 | Volgende profielen: relatie moet in ["Partner", "Kind", "Ouder", "Overig"] | `CreateProfile` | 400 | "Ongeldige relatie. Kies uit: Partner, Kind, Ouder, Overig" |
| 4 | Profielnaam mag niet leeg zijn | `CreateProfile` | 400 | "Naam is verplicht" |
| 5 | Profiel selecteren: profiel moet bestaan (by ID) | `SelectProfile` | 404 | "Profiel niet gevonden" |
| 6 | Delete: profiel moet actief en ontgrendeld zijn | `DeleteProfile` | 400 | "Profiel moet actief en ontgrendeld zijn om te verwijderen" |
| 7 | Delete: primair profiel niet verwijderbaar als er andere profielen bestaan | `DeleteProfile` | 400 | "Primair profiel kan niet worden verwijderd terwijl er andere profielen bestaan" |

### 2.2 Service – ProfileService
**Bestand:** `Services/ProfileService.cs`

| # | Regel | Detail |
|---|-------|--------|
| 1 | Thread-safe operaties via `lock(_lock)` | Alle muterende operaties |
| 2 | Profiel-ID is `Guid.NewGuid()` | Auto-gegenereerd |
| 3 | Profielen opgeslagen in `profiles.json` (niet versleuteld) | Buiten de database |
| 4 | Legacy migratie: als `lumio.db` bestaat zonder `profiles.json`, wordt automatisch een primair profiel aangemaakt | Backward compatibility |
| 5 | `MaxProfiles = 5` | Constante |

---

## 3. Eigenaar (Persoonsgegevens)

### 3.1 FluentValidation – `EigenaarUpsertRequestValidator`
**Bestand:** `Validators/EigenaarValidator.cs`  
**Configuratie:** `IOptions<VeldLengtesOptions>`

| Veld | Regel | Parameter |
|------|-------|-----------|
| `Voornaam` | `NotEmpty()` | — |
| `Voornaam` | `MaximumLength(vl.NaamMax)` | Via `IOptions<VeldLengtesOptions>` (standaard: 100) |
| `Achternaam` | `NotEmpty()` | — |
| `Achternaam` | `MaximumLength(vl.NaamMax)` | Via `IOptions<VeldLengtesOptions>` (standaard: 100) |
| `Tussenvoegsel` | `MaximumLength(vl.TussenvoegselMax)` | Via `IOptions<VeldLengtesOptions>` (standaard: 20) |
| `Email` | `EmailAddress()` | Alleen wanneer niet leeg (`.When(x => !string.IsNullOrWhiteSpace(x.Email))`) |
| `Postcode` | `MaximumLength(vl.PostcodeMax)` | Via `IOptions<VeldLengtesOptions>` (standaard: 10) |

### 3.2 Controller – Singleton-patroon
**Bestand:** `Controllers/EigenaarController.cs`

| # | Regel | Methode | HTTP-status | Melding |
|---|-------|---------|-------------|---------|
| 1 | Er kan per database slechts één Eigenaar bestaan | `Create` (POST) | 400 | "Er bestaat al een eigenaar" |
| 2 | `GET` retourneert enkel de eerste eigenaar | `Get` | 404 | "Geen eigenaar gevonden" |
| 3 | `PUT` update de enige eigenaar | `Update` | 404 | "Eigenaar niet gevonden" |
| 4 | Eigenaar moet bestaan voor diverse andere operaties (boedel, erfgenamen, etc.) | Diverse controllers | 400/404 | — |

### 3.3 Controller – Profielfoto
**Bestand:** `Controllers/EigenaarController.cs`  
**Methode:** `UploadProfielFoto(IFormFile file)`

| # | Regel | HTTP-status | Melding |
|---|-------|-------------|---------|
| 1 | Upload maximaal 10 MB (`[RequestSizeLimit(10_485_760)]`) | 413 | — (framework) |
| 2 | Content type moet beginnen met `image/` | 400 | "Alleen afbeeldingsbestanden zijn toegestaan" |
| 3 | Eigenaar moet bestaan | 404 | "Eigenaar niet gevonden" |
| 4 | Bestand wordt opgeslagen als `byte[]` met `ContentType` en `Naam` | — | — |

### 3.4 Domeinmodel – Eigenaar
**Bestand:** `Domain/Common/Eigenaar.cs`

| Veld/Enum | Constraint | Waarden |
|-----------|-----------|---------|
| `BurgerlijkeStaat` | Enum | `Ongehuwd` (0), `Gehuwd` (1), `GeregistreerdPartnerschap` (2), `Gescheiden` (3), `Weduwe` (4) |
| `HuwelijksVoorwaarden` | Enum | `Geen` (0), `GemeenschapVanGoederen` (1), `Huwelijksvoorwaarden` (2), `BeperkteGemeenschap` (3) |
| `LegitimatieSoort` | Enum | `Geen` (0), `Paspoort` (1), `Rijbewijs` (2), `IdentiteitsKaart` (3) |
| `HeeftProfielFoto` | Computed property | `ProfielFoto != null && ProfielFoto.Length > 0` |

---

## 4. Erfgenamen

### 4.1 FluentValidation – `ErfgenaamUpsertRequestValidator`
**Bestand:** `Validators/ErfgenaamValidator.cs`  
**Configuratie:** `IOptions<VeldLengtesOptions>`

| Veld | Regel | Parameter |
|------|-------|-----------|
| `Voornaam` | `NotEmpty()` | — |
| `Voornaam` | `MaximumLength(vl.NaamMax)` | Via `IOptions<VeldLengtesOptions>` (standaard: 100) |
| `Achternaam` | `NotEmpty()` | — |
| `Achternaam` | `MaximumLength(vl.NaamMax)` | Via `IOptions<VeldLengtesOptions>` (standaard: 100) |
| `Relatie` | `NotEmpty()` | — |
| `Email` | `EmailAddress()` | Alleen wanneer niet leeg (`.When(x => !string.IsNullOrWhiteSpace(x.Email))`) |

### 4.2 Controller – Erfbelasting Berekening (2025)
**Bestand:** `Controllers/ErfgenamenController.cs`  
**Methode:** `BerekenErfbelasting()`

**Algemene regels:**

| # | Regel | Detail |
|---|-------|--------|
| 1 | Eigenaar moet bestaan | 404 als niet gevonden |
| 2 | Erfgenamen moeten bestaan | 200 met lege resultaatlijst |
| 3 | Netto nalatenschap = (som bezittingen GeschatteWaarde) + (som bankrekeningen Saldo) + (som verzekeringen VerzekerdBedrag) − (som schulden Bedrag) | Vereenvoudigde berekening |
| 4 | Verdeling: gelijk over alle erfgenamen (vereenvoudigd) | `erfdeel = netto / aantalErfgenamen` |

**Erfbelasting tarieven 2025:**

| Relatie | Vrijstelling | Schijf 1 tarief | Schijf 2 tarief | Schijf 1 grens |
|---------|--------------|-----------------|-----------------|----------------|
| Partner | €795.156 | 10% | 20% | €154.197 |
| Kind / Zoon / Dochter | €25.187 | 10% | 20% | €154.197 |
| Kleinkind | €25.187 | 18% | 36% | €154.197 |
| Ouder | €56.724 | 10% | 20% | €154.197 |
| Overig (broer, zus, etc.) | €2.658 | 30% | 40% | €154.197 |

**Relatie-matching regels:**

| Relatie (case-insensitive) | Groep |
|---------------------------|-------|
| `partner`, `echtgenoot`, `echtgenote` | Partner |
| `kind`, `zoon`, `dochter`, `stiefkind`, `stiefzoon`, `stiefdochter` | Kind |
| `kleinkind` | Kleinkind |
| `ouder`, `vader`, `moeder` | Ouder |
| Alle overige | Overig |

**Berekening per erfgenaam:**

```
belastbaarBedrag = max(0, erfdeel − vrijstelling)
als belastbaarBedrag ≤ schijf1Grens:
    belasting = belastbaarBedrag × tarief1
anders:
    belasting = (schijf1Grens × tarief1) + ((belastbaarBedrag − schijf1Grens) × tarief2)
effectiefTarief = belasting / erfdeel × 100   (0% als erfdeel = 0)
```

### 4.3 Domeinmodel – Erfgenaam
**Bestand:** `Domain/Common/Erfgenaam.cs`

| Veld | Constraint | Detail |
|------|-----------|--------|
| `EigenaarId` | FK → Eigenaar | Required |
| `ShareIndex` | `int?` | Shamir share index (0-based) |
| `HeeftShareOntvangen` | `bool` | Tracking of share is uitgereikt |
| `ShareUitgegevenOp` | `DateTime?` | Wanneer share is uitgereikt |
| `LegitimatieSoort` | Enum LegitimatieSoort | Zelfde als Eigenaar |

---

## 5. Testament

### 5.1 Controller – Legitimaire Portie Check (BW Boek 4, art. 4:63–4:69)
**Bestand:** `Controllers/TestamentController.cs`  
**Methode:** `CheckLegitimairePortie()`

| # | Regel | Detail |
|---|-------|--------|
| 1 | Kind-relaties = `["kind", "zoon", "dochter", "stiefkind", "stiefzoon", "stiefdochter"]` | Case-insensitive matching |
| 2 | Partner telt mee als `BurgerlijkeStaat == Gehuwd` óf `GeregistreerdPartnerschap` | Wordt opgeteld bij totaal erfgenamen |
| 3 | `aantalErfgenamen` = kinderen + (1 als partner meetelt) | — |
| 4 | `intestaatPerKind = 100 / aantalErfgenamen` | Wettelijk erfdeel |
| 5 | `minimumPerKind = intestaatPerKind / 2` | Legitieme portie = helft van wettelijk erfdeel |
| 6 | **Waarschuwing 1:** kind dat niet in begunstigden voorkomt | "Kind {naam} ontvangt niets in het testament maar heeft recht op een legitieme portie van {minimum}%" |
| 7 | **Waarschuwing 2:** begunstigde-kind met percentage < minimum | "Kind {naam} ontvangt {percentage}% terwijl de legitieme portie {minimum}% is" |
| 8 | Als geen kinderen gevonden: lege lijst, geen waarschuwingen | — |

### 5.2 Controller – Juridische Check
**Bestand:** `Controllers/TestamentController.cs`  
**Methode:** `CheckJuridisch()`

| # | Check | Melding / Waarschuwing | Type |
|---|-------|------------------------|------|
| 1 | Begunstigden percentages optelling ≠ 100% (en > 0 begunstigden met percentage) | "De percentages van begunstigden tellen op tot {som}% in plaats van 100%" | waarschuwing |
| 2 | TestamentType bevat "codicil" (case-insensitive) EN er is onroerend goed | "Een codicil is niet geldig voor onroerend goed. U heeft onroerend goed in uw boedel — een notarieel testament is vereist (BW art. 4:97)" | waarschuwing |
| 3 | TestamentType bevat "handgeschreven" EN er zijn executeurs | "Bij een handgeschreven testament zijn de bevoegdheden van een executeur beperkt. Overweeg een notarieel testament" | waarschuwing |
| 4 | UitsluitingsClausule == false EN er zijn kinderen als erfgenaam | "Er is geen uitsluitingsclausule opgenomen. Dit betekent dat de erfenis van uw kinderen bij een scheiding in de gemeenschap valt" | waarschuwing |
| 5 | Eigenaar.Notaris is leeg | "Er is geen notaris ingevuld bij uw profiel" | waarschuwing |
| 6 | Erfgenamen zonder contactgegevens (telefoon én email beide leeg) | "Erfgenaam {naam} heeft geen contactgegevens. Dit kan problemen geven bij de afwikkeling" | waarschuwing |

**Onroerend goed detectie:**

| # | Detectiemethode | Detail |
|---|----------------|--------|
| 1 | `KadastraalNummer` is ingevuld | Direct |
| 2 | Categorie bevat (case-insensitive): `woning`, `huis`, `appartement`, `grond`, `onroerend`, `pand` | Keyword matching |

### 5.3 Controller – Snapshots
**Bestand:** `Controllers/TestamentController.cs`  
**Methode:** `CreateSnapshot()`

| # | Regel | Detail |
|---|-------|--------|
| 1 | Versienummer is auto-incrementerend | `maxVersie + 1`, default start bij 1 |
| 2 | Snapshot bevat JSON-serialisatie van huidige testament-status | Inclusief begunstigden en executeurs |
| 3 | Snapshot is immutable na aanmaak | Alleen lezen/verwijderen, geen update |

### 5.4 Domeinmodel – TestamentInfo
**Bestand:** `Domain/Testament/TestamentInfo.cs`

| Veld | Constraint | Default |
|------|-----------|---------|
| `EigenaarId` | FK → Eigenaar | Required |
| `UitsluitingsClausule` | `bool` | `true` |
| `Begunstigden` | Navigation list | — |
| `Executeurs` | Navigation list | — |
| `Snapshots` | Navigation list | — |

### 5.5 Domeinmodel – Begunstigde
**Bestand:** `Domain/Testament/Begunstigde.cs`

| Veld | Constraint | Detail |
|------|-----------|--------|
| `Percentage` | `decimal?` | EF precision: `decimal(5,2)` |
| `IsLegitiemePortie` | `bool` | Markering als legitieme portie |

### 5.6 Domeinmodel – TestamentSnapshot
**Bestand:** `Domain/Testament/TestamentSnapshot.cs`

| Veld | Constraint | Detail |
|------|-----------|--------|
| `Versie` | `int` | Auto-incrementing, start bij 1 |
| `JsonInhoud` | `string` | Volledige status als JSON |

---

## 6. Euthanasie / Wilsverklaring

### 6.1 Controller – CRUD
**Bestand:** `Controllers/EuthanasieController.cs`

| # | Regel | Detail |
|---|-------|--------|
| 1 | Singleton per eigenaar | Eén wilsverklaring per eigenaar |
| 2 | Eigenaar moet bestaan voor aanmaak | 404 als niet gevonden |
| 3 | Voorwaarden worden als geneste lijst mee-opgeslagen | Cascade create/update/delete |

### 6.2 Domeinmodel – WilsverklaringEuthanasie
**Bestand:** `Domain/EuthanasiaDirective/WilsverklaringEuthanasie.cs`

| Veld | Type | Detail |
|------|------|--------|
| `EigenaarId` | FK → Eigenaar | Required |
| `DementieClausule` | `bool` | Aanvullende dementie-bepaling |
| `BehandelVerbod` | `bool` | Verbod op medische behandeling |
| `Voorwaarden` | Navigation list | Lijst van `EuthanasieVoorwaarde` |

### 6.3 Domeinmodel – EuthanasieVoorwaarde
**Bestand:** `Domain/EuthanasiaDirective/EuthanasieVoorwaarde.cs`

| Veld | Type | Detail |
|------|------|--------|
| `Voorwaarde` | `string` | Voorwaarde-tekst |
| `Toelichting` | `string?` | Optionele toelichting |

---

## 7. Donorregistratie

### 7.1 Controller – CRUD
**Bestand:** `Controllers/DonorController.cs`

| # | Regel | Detail |
|---|-------|--------|
| 1 | Singleton per eigenaar | Eén donorregistratie per eigenaar |
| 2 | Eigenaar moet bestaan | 404 als niet gevonden |
| 3 | OrgaanKeuzes worden als geneste lijst mee-opgeslagen | Cascade create/update/delete |

### 7.2 Domeinmodel – DonorRegistratie
**Bestand:** `Domain/DonorRegistration/DonorRegistratie.cs`

| Veld | Type | Detail |
|------|------|--------|
| `EigenaarId` | FK → Eigenaar | Required |
| `Keuze` | `string?` | Keuze (bijv. "Alles doneren", "Beperkt") |
| `IsGeregistreerdBijDonorregister` | `bool` | — |
| `OrgaanKeuzes` | Navigation list | Lijst van `OrgaanKeuze` |

### 7.3 Domeinmodel – OrgaanKeuze
**Bestand:** `Domain/DonorRegistration/OrgaanKeuze.cs`

| Veld | Type | Detail |
|------|------|--------|
| `Orgaan` | `string` | Naam van het orgaan |
| `WelDoneren` | `bool` | Wel/niet doneren |

---

## 8. Digitaal Bezit

### 8.1 FluentValidation – `DigitaalAccountUpsertRequestValidator`
**Bestand:** `Validators/DigitalEstateValidators.cs`

| Veld | Regel | Parameter |
|------|-------|-----------|
| `PlatformNaam` | `NotEmpty()` | — |
| `GewensteActie` | `NotEmpty()` | — |

### 8.2 FluentValidation – `WachtwoordEntryCreateRequestValidator`
**Bestand:** `Validators/DigitalEstateValidators.cs`

| Veld | Regel | Parameter |
|------|-------|-----------|
| `Naam` | `NotEmpty()` | — |
| `Wachtwoord` | `NotEmpty()` | — |

### 8.3 FluentValidation – `WachtwoordEntryUpdateRequestValidator`
**Bestand:** `Validators/DigitalEstateValidators.cs`

| Veld | Regel | Parameter |
|------|-------|-----------|
| `Naam` | `NotEmpty()` | — |

### 8.4 FluentValidation – `CryptoWalletUpsertRequestValidator`
**Bestand:** `Validators/DigitalEstateValidators.cs`

| Veld | Regel | Parameter |
|------|-------|-----------|
| `WalletNaam` | `NotEmpty()` | — |
| `CryptoType` | `NotEmpty()` | — |

### 8.5 Controller – Wachtwoord-encryptie
**Bestand:** `Controllers/DigitaalBezitController.cs`

| # | Regel | Methode | Detail |
|---|-------|---------|--------|
| 1 | Wachtwoord wordt versleuteld bij aanmaak | `CreateWachtwoord` | `IEncryptionService.Encrypt()` → AES-256-GCM |
| 2 | Wachtwoord wordt ontsleuteld on-demand | `OntsluitelWachtwoord` | Via `/ontsluitel` endpoint |
| 3 | Bij update: alleen her-versleutelen als `NieuwWachtwoord` is meegegeven | `UpdateWachtwoord` | Naam/gebruikersnaam/URL altijd bijwerkbaar |
| 4 | Crypto wallet `SeedPhrase` wordt versleuteld bij aanmaak | `CreateCryptoWallet` | Zelfde encryptie als wachtwoorden |
| 5 | Crypto wallet `SeedPhrase` wordt ontsleuteld on-demand | `OntsluitelSeedPhrase` | Via `/ontsluitel` endpoint |
| 6 | Bij update crypto wallet: alleen her-versleutelen als `NieuweSeedPhrase` is meegegeven | `UpdateCryptoWallet` | — |

### 8.6 Controller – CSV Wachtwoord Import
**Bestand:** `Controllers/DigitaalBezitController.cs`  
**Methode:** `ImportWachtwoorden(IFormFile file)`

| # | Regel | Detail |
|---|-------|--------|
| 1 | Bestand moet `.csv` extensie hebben | — |
| 2 | Auto-detectie kolomnamen voor compatibiliteit met meerdere wachtwoordmanagers | — |
| 3 | Ondersteunde formaten: **1Password**, **Bitwarden**, **LastPass**, **KeePass**, **Chrome** | — |
| 4 | Kolom-matching (case-insensitive): | — |
|   | Naam: `name`, `title`, `entry`, `naam` | — |
|   | Gebruikersnaam: `username`, `login_username`, `gebruikersnaam`, `user` | — |
|   | Wachtwoord: `password`, `login_password`, `wachtwoord`, `pass` | — |
|   | URL: `url`, `login_uri`, `urls`, `website` | — |
|   | Notities: `notes`, `notities`, `extra`, `comments` | — |
| 5 | Regels met leeg wachtwoord worden overgeslagen | — |
| 6 | Elk geïmporteerd wachtwoord wordt individueel versleuteld | AES-256-GCM |

### 8.7 Domeinmodel – WachtwoordEntry
**Bestand:** `Domain/DigitalEstate/WachtwoordEntry.cs`

| Veld | Constraint | Detail |
|------|-----------|--------|
| `EigenaarId` | FK → Eigenaar | Required |
| `EncryptedWachtwoord` | `string` | AES-256-GCM versleuteld |

### 8.8 Domeinmodel – CryptoWallet
**Bestand:** `Domain/DigitalEstate/CryptoWallet.cs`

| Veld | Constraint | Detail |
|------|-----------|--------|
| `EigenaarId` | FK → Eigenaar | Required |
| `EncryptedSeedPhrase` | `string?` | AES-256-GCM versleuteld |

---

## 9. Boedel (Vermogensoverzicht)

### 9.1 FluentValidation – `BankrekeningUpsertRequestValidator`
**Bestand:** `Validators/AssetValidators.cs`  
**Configuratie:** `IOptions<ValidatieOptions>`

| Veld | Regel | Parameter |
|------|-------|-----------|
| `BankNaam` | `NotEmpty()` | — |
| `IBAN` | `NotEmpty()` | — |
| `IBAN` | `Matches(validatie.IbanRegex)` | Via `IOptions<ValidatieOptions>` (standaard: `^[A-Z]{2}\d{2}[A-Z0-9]{4,30}$`) |

### 9.2 FluentValidation – `FysiekBezitUpsertRequestValidator`
**Bestand:** `Validators/AssetValidators.cs`

| Veld | Regel | Parameter |
|------|-------|-----------|
| `Omschrijving` | `NotEmpty()` | — |
| `Categorie` | `NotEmpty()` | — |
| `GeschatteWaarde` | `GreaterThanOrEqualTo(0)` | Alleen wanneer `HasValue` |

### 9.3 FluentValidation – `VerzekeringUpsertRequestValidator`
**Bestand:** `Validators/AssetValidators.cs`

| Veld | Regel | Parameter |
|------|-------|-----------|
| `Verzekeraar` | `NotEmpty()` | — |
| `Type` | `NotEmpty()` | — |
| `PolisNummer` | `NotEmpty()` | — |
| `VerzekerdBedrag` | `GreaterThanOrEqualTo(0)` | Alleen wanneer `HasValue` |

### 9.4 FluentValidation – `SchuldUpsertRequestValidator`
**Bestand:** `Validators/AssetValidators.cs`

| Veld | Regel | Parameter |
|------|-------|-----------|
| `Schuldeiser` | `NotEmpty()` | — |
| `Bedrag` | `GreaterThan(0)` | Strikt groter dan 0 |
| `MaandelijkseAflossing` | `GreaterThanOrEqualTo(0)` | Alleen wanneer `HasValue` |

### 9.5 Controller – Financieel Overzicht
**Bestand:** `Controllers/BoedelController.cs`  
**Methode:** `GetOverzicht()`

| # | Regel | Berekening |
|---|-------|------------|
| 1 | `totaleBezittingen` | som van `FysiekeBezittingen.GeschatteWaarde` (waar HasValue) |
| 2 | `totaleSaldi` | som van `Bankrekeningen.Saldo` (waar HasValue) |
| 3 | `totaleVerzekeringen` | som van `Verzekeringen.VerzekerdBedrag` (waar HasValue) |
| 4 | `totaleSchulden` | som van `Schulden.Bedrag` |
| 5 | `brutoNalatenschap` | `bezittingen + saldi + verzekeringen` |
| 6 | `nettoNalatenschap` | `bruto − schulden` |

### 9.6 Controller – Eigenaar vereist
**Bestand:** `Controllers/BoedelController.cs`

| # | Regel | Detail |
|---|-------|--------|
| 1 | Voor alle CRUD-operaties op boedel-items moet de eigenaar bestaan | 400: "Maak eerst een eigenaar aan" |
| 2 | `EigenaarId` wordt automatisch ingevuld bij aanmaak | Vanuit de enige eigenaar in de database |

### 9.7 Domeinmodel – VermogensSoort
**Bestand:** `Domain/AssetRegistry/VermogensSoort.cs`

| Waarde | Index |
|--------|-------|
| `Prive` | 0 |
| `Gemeenschap` | 1 |

### 9.8 Domeinmodel – Decimale Precisie (EF)
**Bestand:** `Data/LumioDbContext.cs`

| Entiteit.Veld | Precisie |
|---------------|----------|
| `FysiekBezit.GeschatteWaarde` | `decimal(18,2)` |
| `Verzekering.VerzekerdBedrag` | `decimal(18,2)` |
| `Schuld.Bedrag` | `decimal(18,2)` |
| `Schuld.MaandelijkseAflossing` | `decimal(18,2)` |
| `Bankrekening.Saldo` | `decimal(18,2)` |
| `Begunstigde.Percentage` | `decimal(5,2)` |

---

## 10. Uitvaart

### 10.1 Controller – CRUD
**Bestand:** `Controllers/UitvaartController.cs`

| # | Regel | Detail |
|---|-------|--------|
| 1 | Singleton per eigenaar | Eén UitvaartWensen per eigenaar |
| 2 | Eigenaar moet bestaan | 404 als niet gevonden |
| 3 | CeremonieDetails en Genodigden worden als geneste lijsten mee-opgeslagen | Cascade create/update/delete |

### 10.2 Domeinmodel – UitvaartWensen
**Bestand:** `Domain/FuneralWishes/UitvaartWensen.cs`

| Veld | Type | Detail |
|------|------|--------|
| `EigenaarId` | FK → Eigenaar | Required |
| `VoorkeurType` | `string?` | Begraven/cremeren/etc. |
| `BudgetRichting` | `string?` | Budget indicatie |

### 10.3 Domeinmodel – CeremonieDetail
**Bestand:** `Domain/FuneralWishes/CeremonieDetail.cs`

| Veld | Type | Detail |
|------|------|--------|
| `Volgorde` | `int` | Ordening in ceremonie |
| `Muziek` | `string?` | Muziekkeuze |
| `Spreker` | `string?` | Spreker |
| `Tekstlezing` | `string?` | Tekst/lezing |
| `Dresscode` | `string?` | Kledingvoorschrift |

---

## 11. Documenten

### 11.1 Controller – Upload & Versioning
**Bestand:** `Controllers/DocumentenController.cs`

| # | Regel | Detail |
|---|-------|--------|
| 1 | Upload maximaal 50 MB | `[RequestSizeLimit(52_428_800)]` |
| 2 | Eigenaar moet bestaan | 400: "Maak eerst een eigenaar aan" |
| 3 | **Auto-versioning:** als een document met dezelfde naam al bestaat, wordt het nieuwe document aan dezelfde `DocumentGroepId` toegevoegd | `DocumentGroepId` koppelt versies |
| 4 | Versienummer auto-incrementeert | `maxVersie + 1` binnen dezelfde groep |
| 5 | Nieuw document (unieke naam) krijgt nieuwe `DocumentGroepId = Guid.NewGuid()` en `Versie = 1` | — |
| 6 | Delete per versie: verwijdert één specifieke versie | Via document-ID |
| 7 | Delete per groep: verwijdert alle versies in de groep | Via `DocumentGroepId` |

### 11.2 Domeinmodel – PersoonlijkDocument
**Bestand:** `Domain/Documents/PersoonlijkDocument.cs`

| Veld | Constraint | Detail |
|------|-----------|--------|
| `EigenaarId` | FK → Eigenaar | Required |
| `DocumentGroepId` | `Guid` | Groepeert versies |
| `Versie` | `int` | Start bij 1, auto-increment |
| `VerlooptOp` | `DateTime?` | Optionele verloopdatum |
| `BestandsGrootte` | `long` | Bestandsgrootte in bytes |
| `Inhoud` | `byte[]` | Bestandsinhoud |

---

## 12. Noodcontacten

### 12.1 Controller
**Bestand:** `Controllers/NoodcontactenController.cs`

| # | Regel | Detail |
|---|-------|--------|
| 1 | Eigenaar moet bestaan | 400 als niet gevonden |
| 2 | Gedeelde noodcontacten: exporteerbaar als JSON (`IsGedeeld == true`) | Filter op `IsGedeeld` |
| 3 | Import: duplicaat-detectie op basis van `Naam` + `Rol` | Case-insensitive vergelijking |
| 4 | Bij import: bestaande duplicaten worden overgeslagen | — |

### 12.2 Domeinmodel – Noodcontact
**Bestand:** `Domain/Common/Noodcontact.cs`

| Veld | Constraint | Detail |
|------|-----------|--------|
| `EigenaarId` | FK → Eigenaar | Required |
| `Rol` | `string` | Verwachte waarden: `Huisarts`, `Notaris`, `Uitvaartondernemer`, `Vertrouwenspersoon`, `Overig` |
| `IsGedeeld` | `bool` | Of het contact gedeeld mag worden |

---

## 13. Toewijzingen

### 13.1 Controller – Toewijzingsbeheer
**Bestand:** `Controllers/ToewijzingenController.cs`

| # | Regel | HTTP-status | Melding |
|---|-------|-------------|---------|
| 1 | Duplicaat-check: combinatie `ErfgenaamId` + `EntityType` + `EntityId` mag maar één keer voorkomen | 400 | "Deze toewijzing bestaat al" |
| 2 | `EntityType` moet een bekende waarde zijn | 400 | Impliciet door entity-resolutie |

**Geldige EntityType waarden:**

| EntityType |
|-----------|
| `FysiekBezit` |
| `Bankrekening` |
| `Verzekering` |
| `DigitaalAccount` |
| `CryptoWallet` |

### 13.2 Domeinmodel – ErfgenaamToewijzing
**Bestand:** `Domain/AssetRegistry/ErfgenaamToewijzing.cs`

| Veld | Constraint | Detail |
|------|-----------|--------|
| `ErfgenaamId` | FK → Erfgenaam | Required |
| `EntityType` | `string` | Type bezitting |
| `EntityId` | `Guid` | ID van het bezit |
| `Notities` | `string?` | Optionele toelichting |

---

## 14. Shamir Secret Sharing

### 14.1 Controller – Deelsleutels genereren
**Bestand:** `Controllers/ShamirController.cs`  
**Methode:** `GenereerShares(ShamirGenereerRequest request)`

| # | Regel | HTTP-status | Melding |
|---|-------|-------------|---------|
| 1 | `Drempel` (threshold) ≥ 2 | 400 | "Drempel moet minimaal 2 zijn" |
| 2 | `AantalDelen` ≥ `Drempel` | 400 | "Aantal delen moet minimaal gelijk zijn aan de drempel" |
| 3 | Profiel moet actief en ontgrendeld zijn | 400 | "Geen actief en ontgrendeld profiel" |
| 4 | Shares worden toegewezen aan erfgenamen op volgorde van stabiele ID-sortering | `erfgenamen.OrderBy(e => e.Id)` |
| 5 | Alle bestaande share-toewijzingen worden gereset bij regeneratie | `HeeftShareOntvangen = false`, `ShareIndex = null`, `ShareUitgegevenOp = null` |
| 6 | `ShareIndex` is 0-based, gekoppeld aan erfgenaam | — |

### 14.2 Controller – Share toekennen
**Bestand:** `Controllers/ShamirController.cs`  
**Methode:** `KenShareToe(Guid erfgenaamId)`

| # | Regel | HTTP-status | Melding |
|---|-------|-------------|---------|
| 1 | Erfgenaam moet bestaan | 404 | "Erfgenaam niet gevonden" |
| 2 | Erfgenaam moet een `ShareIndex` hebben (share moet gegenereerd zijn) | 400 | "Deze erfgenaam heeft geen share toegewezen" |
| 3 | Na toekenning: `HeeftShareOntvangen = true`, `ShareUitgegevenOp = DateTime.UtcNow` | — | — |

### 14.3 Service – ShamirService
**Bestand:** `Services/ShamirService.cs`

| # | Regel | Detail |
|---|-------|--------|
| 1 | Gebruikt `SecretSharingDotNet` library | BigInteger-based |
| 2 | `Split(secret, aantalDelen, drempel)` → lijst van share-strings | — |
| 3 | `Reconstruct(shares)` → oorspronkelijk secret (master password) | — |

---

## 15. Afhandeling

### 15.1 Controller – Afhandelingsbeheer
**Bestand:** `Controllers/AfhandelingController.cs`

| # | Regel | Detail |
|---|-------|--------|
| 1 | Status-enum validatie: moet `Open`, `InBehandeling`, of `Afgehandeld` zijn | Enum `AfhandelingsStatus` |
| 2 | Wanneer status → `Afgehandeld`: `AfgehandeldOp = DateTime.UtcNow` automatisch gezet | — |
| 3 | Wanneer status terug van `Afgehandeld`: `AfgehandeldOp = null` automatisch gecleared | — |
| 4 | `Initialiseer`: wordt slechts één keer uitgevoerd | Check: `_db.AfhandelingsItems.AnyAsync()` |
| 5 | Bij initialisatie worden standaard afhandelings-items aangemaakt per domein | Alle status = `Open` |

### 15.2 Domeinmodel – AfhandelingsItem
**Bestand:** `Domain/Common/AfhandelingsItem.cs`

| Veld/Enum | Constraint | Waarden |
|-----------|-----------|---------|
| `AfhandelingsStatus` | Enum | `Open` (0), `InBehandeling` (1), `Afgehandeld` (2) |
| `AfgehandeldOp` | `DateTime?` | Auto-set/cleared |

---

## 16. Status & Compleetheid

### 16.1 Controller – Compleetheidsscoring
**Bestand:** `Controllers/StatusController.cs`  
**Methode:** `GetCompleetheid()`

**Domein-scores (0–100%):**

| # | Domein | Score 100% als |
|---|--------|---------------|
| 1 | `eigenaar` | Eigenaar record bestaat |
| 2 | `testament` | TestamentInfo record bestaat |
| 3 | `euthanasie` | WilsverklaringEuthanasie record bestaat |
| 4 | `donor` | DonorRegistratie record bestaat |
| 5 | `digitaalBezit` | ≥1 DigitaalAccount OF ≥1 WachtwoordEntry OF ≥1 CryptoWallet |
| 6 | `boedel` | ≥1 FysiekBezit OF ≥1 Bankrekening OF ≥1 Verzekering |
| 7 | `uitvaart` | UitvaartWensen record bestaat |
| 8 | `erfgenamen` | ≥1 Erfgenaam |
| 9 | `documenten` | ≥1 PersoonlijkDocument |
| 10 | `noodcontacten` | ≥1 Noodcontact |

**Totaalscore:** gemiddelde van alle 10 domein-percentages

### 16.2 Controller – Granulaire Compleetheid
**Bestand:** `Controllers/StatusController.cs`  
**Methode:** `GetGranulairCompleetheid()`

**Veld-level scoring per domein:**

| Domein | Velden (1 punt per ingevuld veld) | Max |
|--------|----------------------------------|-----|
| `eigenaar` | Voornaam, Achternaam, Geboortedatum, BSN, Adres, Telefoon, Email, Notaris | 8 |
| `testament` | TestamentType, NotarisNaam, DatumTestament, TestamentLocatie, ≥1 begunstigde, ≥1 executeur | 6 |
| `euthanasie` | WilEuthanasie niet leeg, SituatieBeschrijving niet leeg, Huisarts niet leeg | 3 |
| `donor` | Keuze niet leeg, IsGeregistreerdBijDonorregister = true, ≥1 orgaankeuze | 3 |
| `digitaalBezit` | ≥1 account, ≥1 wachtwoord, ≥1 crypto wallet | 3 |
| `boedel` | ≥1 bezitting, ≥1 bankrekening, ≥1 verzekering, geen schulden OF schulden geregistreerd | 4 |
| `uitvaart` | VoorkeurType niet leeg, UitvaartOndernemer niet leeg, ≥1 ceremoniedetail | 3 |
| `erfgenamen` | ≥1 erfgenaam, alle met e-mail, alle met telefoon | 3 |
| `documenten` | ≥1 document, ≥1 in categorie "testament", ≥1 in categorie "identiteit" | 3 |
| `noodcontacten` | ≥1 noodcontact, heeft huisarts (rol), heeft vertrouwenspersoon (rol) | 3 |

### 16.3 Controller – Meldingen
**Bestand:** `Controllers/StatusController.cs`  
**Methode:** `GetMeldingen()`

| # | Check | Type | Melding |
|---|-------|------|---------|
| 1 | Geen eigenaar aangemaakt | waarschuwing | "Vul uw persoonsgegevens in om te beginnen" |
| 2 | Geen testament aangemaakt | info | "Overweeg uw testament vast te leggen" |
| 3 | Geen wilsverklaring euthanasie | info | "Overweeg een wilsverklaring euthanasie op te stellen" |
| 4 | Geen donorregistratie | info | "Overweeg uw donorkeuze vast te leggen" |
| 5 | Geen digitale accounts | info | "Leg uw digitale bezittingen vast" |
| 6 | Geen boedel-items | info | "Registreer uw bezittingen en financiën" |
| 7 | Geen uitvaartwensen | info | "Leg uw uitvaartwensen vast" |
| 8 | Geen erfgenamen | waarschuwing | "Voeg minimaal één erfgenaam toe" |
| 9 | Geen noodcontacten | waarschuwing | "Voeg minimaal één noodcontact toe" |
| 10 | Geen documenten | info | "Upload relevante documenten" |
| 11 | Backup ouder dan 30 dagen (of geen backup) | waarschuwing | "Er is al meer dan 30 dagen geen backup gemaakt" / "Er is nog geen backup gemaakt" |
| 12 | Shamir niet geconfigureerd (erfgenamen bestaan maar geen shares) | waarschuwing | "Verdeel sleuteldelen over uw erfgenamen zodat zij toegang hebben" |
| 13 | Niet alle Shamir-shares uitgereikt | waarschuwing | "Niet alle sleuteldelen zijn uitgereikt aan erfgenamen" |
| 14 | Verlopen documenten (`VerlooptOp < DateTime.UtcNow`) | waarschuwing | "Document '{naam}' is verlopen op {datum}" |
| 15 | Documenten die binnen 30 dagen verlopen | info | "Document '{naam}' verloopt op {datum}" |
| 16 | Actualisatie niet bevestigd (>90 dagen sinds laatste bevestiging per sectie) | info | "Controleer uw {sectie}-gegevens — het is meer dan 90 dagen geleden dat u deze hebt bevestigd" |

### 16.4 Controller – Data Integriteit
**Bestand:** `Controllers/StatusController.cs`  
**Methode:** `GetDataIntegriteit()`

| # | Regel | Detail |
|---|-------|--------|
| 1 | SHA-256 hash over snapshot van alle data | — |
| 2 | Snapshot bevat: eigenaar, testament, euthanasie, donor, uitvaart, erfgenamen, bezittingen, bankrekeningen, verzekeringen, schulden, accounts | JSON geserialiseerd |
| 3 | Resultaat: `hash` (hex-string), `berekendOp` (UTC timestamp) | — |

### 16.5 Controller – Suggesties (Cross-referentie checks)
**Bestand:** `Controllers/StatusController.cs`  
**Methode:** `GetSuggesties()`

| # | Check | Categorie | Melding |
|---|-------|-----------|---------|
| 1 | Erfgenaam niet als noodcontact geregistreerd | "Erfgenaam ↔ Noodcontact" | "Erfgenaam '{naam}' is niet als noodcontact geregistreerd" |
| 2 | Vertrouwenspersoon (noodcontact) niet als erfgenaam | "Noodcontact ↔ Erfgenaam" | "Vertrouwenspersoon '{naam}' is niet als erfgenaam geregistreerd" |
| 3 | Notaris in eigenaar ≠ notaris in testament (case-insensitive) | "Notaris inconsistentie" | "De notaris in uw profiel verschilt van de notaris bij het testament" |
| 4 | Testament-notaris niet als noodcontact | "Notaris noodcontact" | "Notaris '{naam}' is niet als noodcontact geregistreerd" |
| 5 | Uitvaartondernemer niet als noodcontact | "Uitvaartondernemer noodcontact" | "Uitvaartondernemer '{naam}' is niet als noodcontact geregistreerd" |
| 6 | Begunstigde in testament niet als erfgenaam | "Begunstigde ↔ Erfgenaam" | "Begunstigde '{naam}' is niet als erfgenaam geregistreerd" |
| 7 | Geen huisarts als noodcontact (terwijl er erfgenamen zijn) | "Ontbrekend noodcontact" | "Er is geen huisarts als noodcontact geregistreerd" |

---

## 17. Zoeken

### 17.1 Controller – Zoekregels
**Bestand:** `Controllers/ZoekenController.cs`  
**Methode:** `Zoek(string query)`

| # | Regel | Detail |
|---|-------|--------|
| 1 | Minimale zoektermlengte: 2 tekens | 400: "Zoekterm moet minimaal 2 tekens lang zijn" |
| 2 | Case-insensitive matching via `ToLower().Contains()` | — |
| 3 | Zoekt in 10 entiteittypen: Eigenaar, Erfgenaam, Noodcontact, FysiekBezit, Bankrekening, Verzekering, Schuld, DigitaalAccount, WachtwoordEntry, CryptoWallet | — |
| 4 | **Wachtwoord-uitsluiting:** bij WachtwoordEntry worden alleen naam/gebruikersnaam/URL doorzocht, **nooit** het daadwerkelijke wachtwoord | Security by design |

---

## 18. Export

### 18.1 Controller – Exportformaten
**Bestand:** `Controllers/ExportController.cs`

**PDF-exports (via ILumioPdfService):**

| # | Endpoint | PDF-type |
|---|----------|----------|
| 1 | `GET /pdf/testament` | Testament overzicht |
| 2 | `GET /pdf/euthanasie` | Wilsverklaring euthanasie |
| 3 | `GET /pdf/donor` | Donorregistratie |
| 4 | `GET /pdf/digitaal-bezit` | Digitale bezittingen (excl. wachtwoorden) |
| 5 | `GET /pdf/boedel` | Boedeloverzicht |
| 6 | `GET /pdf/uitvaart` | Uitvaartwensen |
| 7 | `GET /pdf/documenten` | Documentenoverzicht |
| 8 | `GET /pdf/compleet` | Volledig overzicht |
| 9 | `GET /pdf/noodkaart` | Noodkaart (compacte samenvatting) |
| 10 | `GET /pdf/testament-concept` | Testament concept |
| 11 | `GET /pdf/wilsverklaring` | Formele wilsverklaring |
| 12 | `GET /pdf/noodprocedure` | Noodprocedure handleiding |
| 13 | `GET /pdf/boedelbeschrijving` | Formele boedelbeschrijving |
| 14 | `GET /pdf/erfgenaam/{id}` | Per-erfgenaam rapport |
| 15 | `GET /pdf/executeur-rapport` | Executeur overzichtsrapport |
| 16 | `GET /pdf/notaris` | Notaris informatiepakket |

**Andere exportformaten:**

| # | Endpoint | Formaat | Bijzonderheden |
|---|----------|---------|----------------|
| 17 | `GET /zip` | ZIP | Alle PDFs + geüploade documenten + `INHOUD.txt` index |
| 18 | `GET /json` | JSON | Gestructureerde export van alle data |
| 19 | `GET /xml` | XML | Gestructureerde export van alle data |
| 20 | `GET /xml/nuv` | XML | NUV-standaard (`urn:nuv:uitvaart:1.0`) |
| 21 | `GET /html` | HTML | Voor delen met medeërfgenamen (geen gevoelige data) |
| 22 | `GET /csv/erfgenamen` | CSV | Erfgenamen met BOM (Excel-compatibel), `;`-gescheiden |
| 23 | `GET /csv/bezittingen` | CSV | Fysieke bezittingen |
| 24 | `GET /csv/bankrekeningen` | CSV | Bankrekeningen |
| 25 | `GET /csv/verzekeringen` | CSV | Verzekeringen |
| 26 | `GET /csv/schulden` | CSV | Schulden |
| 27 | `GET /csv/noodcontacten` | CSV | Noodcontacten |

### 18.2 Export – NUV XML
**Bestand:** `Controllers/ExportController.cs`  
**Methode:** `ExportNuvXml()`

| # | Regel | Detail |
|---|-------|--------|
| 1 | Namespace: `urn:nuv:uitvaart:1.0` | NUV-standaard |
| 2 | Encoding: `UTF-8` | — |
| 3 | Uitvaart-gerelateerde verzekeringen worden gefilterd | Type bevat (case-insensitive): `uitvaart`, `begrafenis`, `overlijden` |
| 4 | XML entities worden geëscaped | `&`, `<`, `>`, `"`, `'` |

### 18.3 Export – HTML voor medeerfgenamen
**Bestand:** `Controllers/ExportController.cs`

| # | Regel | Detail |
|---|-------|--------|
| 1 | Geen wachtwoorden of seed phrases in HTML export | Security constraint |
| 2 | Geen geüploade documenten (alleen metadata) | — |
| 3 | Bedoeld voor delen met medeerfgenamen | — |

### 18.4 Export – CSV
**Bestand:** `Controllers/ExportController.cs`

| # | Regel | Detail |
|---|-------|--------|
| 1 | CSV-separator: `;` (puntkomma) | Nederlands formaat |
| 2 | BOM-prefix (`0xEF 0xBB 0xBF`) voor Excel-compatibiliteit | UTF-8 BOM |
| 3 | Escaping: velden met `;`, `"` of newlines worden omsloten met `"`, interne `"` verdubbeld | RFC-achtig |

---

## 19. Backup & Restore

### 19.1 Controller – Backup
**Bestand:** `Controllers/BackupController.cs`  
**Methode:** `Download()` / `Restore()`

**Download:**

| # | Regel | Detail |
|---|-------|--------|
| 1 | Profiel moet actief en ontgrendeld zijn | 400 |
| 2 | ZIP bevat: `lumio.db` + `lumio.salt` | Beide bestanden |
| 3 | Bestandsnaam: `lumio-backup-{yyyy-MM-dd-HHmmss}.zip` | Timestamp in naam |

**Restore:**

| # | Regel | HTTP-status | Melding |
|---|-------|-------------|---------|
| 1 | Alleen `.zip` bestanden geaccepteerd | 400 | "Alleen .zip bestanden zijn toegestaan" |
| 2 | ZIP moet `lumio.db` bevatten | 400 | "Ongeldig backup-bestand: lumio.db niet gevonden" |
| 3 | Wachtwoord wordt geverifieerd tegen de backup-database | 401 | "Onjuist wachtwoord voor deze backup" |
| 4 | Huidige database wordt vergrendeld vóór vervanging | — | Via MasterPasswordService |
| 5 | Zowel `.db` als `.salt` bestand worden vervangen (als aanwezig in ZIP) | — | — |
| 6 | Na restore: profiel wordt ontgrendeld met meegegeven wachtwoord | — | — |

---

## 20. Audit Log

### 20.1 Automatisch vastleggen (DbContext)
**Bestand:** `Data/LumioDbContext.cs`  
**Methode:** `SaveChangesAsync()`

| # | Regel | Detail |
|---|-------|--------|
| 1 | Alle `Added` entities van type `BaseEntity` → AuditLogEntry met actie `"Aangemaakt"` | Automatisch |
| 2 | Alle `Modified` entities van type `BaseEntity` → AuditLogEntry met actie `"Gewijzigd"` | Automatisch |
| 3 | Alle `Deleted` entities van type `BaseEntity` → AuditLogEntry met actie `"Verwijderd"` | Automatisch |
| 4 | EntityType = naam van het CLR-type | `entry.Entity.GetType().Name` |
| 5 | EntityId = `Id` property van de `BaseEntity` | — |

### 20.2 Handmatig vastleggen (AuditService)
**Bestand:** `Services/AuditService.cs`

| # | Regel | Detail |
|---|-------|--------|
| 1 | Extra acties: `"Ontgrendeld"`, `"Vergrendeld"`, `"Export"` | Handmatig gelogd vanuit controllers |
| 2 | Faalt stil als database niet beschikbaar is | `try/catch` met lege `catch` |
| 3 | Maakt eigen `IServiceScope` per log-entry | Onafhankelijk van request-scope |

### 20.3 Controller – AuditLogController
**Bestand:** `Controllers/AuditLogController.cs`

| # | Regel | Detail |
|---|-------|--------|
| 1 | Default limiet: 200 entries | Parameter `limit`, default 200 |
| 2 | Sorteerbaar op AangemaaktOp descending | Laatste eerst |
| 3 | Filterbaar op `actie` en `entityType` | Query parameters |

---

## 21. Middleware (Toegangscontrole)

### 21.1 DatabaseUnlockMiddleware
**Bestand:** `Middleware/DatabaseUnlockMiddleware.cs`

**Altijd toegankelijke paden (bypass lock check):**

| # | Prefix | Reden |
|---|--------|-------|
| 1 | `/api/auth/` | Authenticatie-endpoints |
| 2 | `/api/profielen` | Profielbeheer |
| 3 | `/api/status` | Statuscontrole |
| 4 | `/api/backup/restore` | Backup restore (vereist eigen wachtwoord-check) |
| 5 | `/swagger` | API documentatie |

**Read-only modus (aanvullend toegankelijk):**

| # | Prefix | Reden |
|---|--------|-------|
| 6 | `/api/export/` | Exporteren (alleen lezen) |
| 7 | `/api/afhandeling` | Afhandelingsstatus (erfgenaam kan afhandelen) |

**Blokkeerregels:**

| # | Conditie | HTTP-status | Response |
|---|---------|-------------|----------|
| 1 | Geen profiel geselecteerd | 423 (Locked) | `{ "error": "Geen profiel geselecteerd" }` |
| 2 | Profiel is IsFirstRun | 423 (Locked) | `{ "error": "Database is nog niet ingericht", "isFirstRun": true }` |
| 3 | Profiel is niet ontgrendeld | 423 (Locked) | `{ "error": "Database is vergrendeld", "locked": true }` |
| 4 | Read-only modus + schrijfactie (POST/PUT/PATCH/DELETE) naar niet-readonly pad | 403 (Forbidden) | `{ "error": "Database is in alleen-lezen modus (erfgenaam toegang)" }` |

### 21.2 ExceptionHandlingMiddleware
**Bestand:** `Middleware/ExceptionHandlingMiddleware.cs`

| Exception type | HTTP-status | Response |
|---------------|-------------|----------|
| `InvalidOperationException` | 400 Bad Request | Exception message |
| `KeyNotFoundException` | 404 Not Found | Exception message |
| Alle andere exceptions | 500 Internal Server Error | "Er is een onverwachte fout opgetreden" (generiek) |

### 21.3 RscRewriteMiddleware
**Bestand:** `Middleware/RscRewriteMiddleware.cs`

| # | Regel | Detail |
|---|-------|--------|
| 1 | Herschrijft Next.js RSC-paden met dot-separated segmenten naar subdirectories | URL rewriting voor static frontend |

---

## 22. Encryptie & Sleutelbeheer

### 22.1 EncryptionService – AES-256-GCM
**Bestand:** `Services/EncryptionService.cs`

| # | Parameter | Waarde |
|---|-----------|--------|
| 1 | Algoritme | AES-256-GCM |
| 2 | Nonce lengte | 12 bytes (random) |
| 3 | Authentication tag | 16 bytes |
| 4 | Key derivation | PBKDF2 |
| 5 | PBKDF2 iteraties | 100.000 |
| 6 | PBKDF2 hash | SHA-256 |
| 7 | Database salt | 32 bytes random, opgeslagen in `.salt` bestand |
| 8 | Legacy fallback salt | `"Lumio.FieldEncryption.v1"` (als `.salt` bestand niet bestaat) |
| 9 | Encrypted formaat | `nonce + ciphertext + tag` (Base64-encoded string) |

### 22.2 MasterPasswordService
**Bestand:** `Services/MasterPasswordService.cs`

| # | Regel | Detail |
|---|-------|--------|
| 1 | Singleton service | Houdt master password state in-memory |
| 2 | Wachtwoord wordt niet opgeslagen op disk | Alleen in geheugen |
| 3 | `PRAGMA rekey` voor wachtwoord-wijziging | SQLCipher specifiek |
| 4 | Veilige escaping via `parameterized quote()` | SQL injection preventie |

### 22.3 SQLCipher Database Encryptie
**Bestand:** Diverse (AuthController, MasterPasswordService)

| # | Regel | Detail |
|---|-------|--------|
| 1 | Volledige database-encryptie via SQLCipher | `PRAGMA key` bij openen |
| 2 | Wachtwoord-verificatie via test-query (`SELECT count(*) FROM sqlite_master`) | Als key onjuist is, faalt de query |

---

## 23. Database & Entity Framework

### 23.1 BaseEntity
**Bestand:** `Domain/Common/BaseEntity.cs`

| Veld | Regel | Detail |
|------|-------|--------|
| `Id` | Auto-generated `Guid` | `Guid.NewGuid()` |
| `AangemaaktOp` | Auto-set UTC | `DateTime.UtcNow` bij aanmaak |
| `GewijzigdOp` | Auto-update UTC | Bijgewerkt bij elke wijziging (zie DbContext) |

### 23.2 DbContext – Auto-update regelwerk
**Bestand:** `Data/LumioDbContext.cs`  
**Methode:** `SaveChangesAsync()`

| # | Regel | Detail |
|---|-------|--------|
| 1 | Alle `Modified` entities: `GewijzigdOp = DateTime.UtcNow` | Automatisch |
| 2 | Audit log entries worden aangemaakt voor alle `BaseEntity` mutaties | Zie §20.1 |

### 23.3 DbContext – Cascade Delete
**Bestand:** `Data/LumioDbContext.cs`  
**Methode:** `OnModelCreating()`

Alle relaties met Eigenaar gebruiken `DeleteBehavior.Cascade`:

| Parent | Children |
|--------|----------|
| Eigenaar | Erfgenamen, Noodcontacten, Bankrekeningen, FysiekeBezittingen, Verzekeringen, Schulden, TestamentInfo, DonorRegistratie, WilsverklaringEuthanasie, UitvaartWensen, DigitaleAccounts, WachtwoordEntries, CryptoWallets, PersoonlijkeDocumenten, SectieNotities, ActualisatieBevestigingen |
| TestamentInfo | Begunstigden, Executeurs, TestamentSnapshots |
| WilsverklaringEuthanasie | EuthanasieVoorwaarden |
| DonorRegistratie | OrgaanKeuzes |
| UitvaartWensen | CeremonieDetails, UitvaartGenodigden |

### 23.4 SectieNotitie – Secties
**Bestand:** `Domain/Common/SectieNotitie.cs`

Geldige secties (gebruikt in controllers):

| Sectienaam |
|-----------|
| `testament` |
| `euthanasie` |
| `donor` |
| `digitaal-bezit` |
| `boedel` |
| `uitvaart` |
| `documenten` |
| `erfgenamen` |
| `noodcontacten` |

### 23.5 ActualisatieBevestiging
**Bestand:** `Domain/Common/ActualisatieBevestiging.cs`

| Veld | Constraint | Detail |
|------|-----------|--------|
| `EigenaarId` | FK → Eigenaar | Required |
| `Sectie` | `string` | Een van de secties hierboven |
| `BevestigdOp` | `DateTime` | Timestamp van bevestiging |
| Drempel voor melding | 90 dagen | Na 90 dagen zonder bevestiging → melding |

---

## 24. Applicatieconfiguratie

### 24.1 Program.cs – Opstartconfiguratie
**Bestand:** `Program.cs`

| # | Setting | Bron | Default |
|---|---------|------|---------|
| 1 | Data directory | Env var `LUMIO_DATA_DIR` | `{AppContext.BaseDirectory}/../data` |
| 2 | Poort/URL | Env var `ASPNETCORE_URLS` | `http://127.0.0.1:5123` |
| 3 | Frontend directory | Env var `LUMIO_FRONTEND_DIR` | `{AppContext.BaseDirectory}/../frontend` |
| 4 | CORS | Hardcoded | `AllowAnyOrigin`, `AllowAnyMethod`, `AllowAnyHeader` |
| 5 | QuestPDF licentie | Hardcoded | `LicenseType.Community` |
| 6 | FluentValidation | `AddFluentValidationAutoValidation()` | Registered from assembly containing `Program` |
| 7 | Business Rules | `AddLumioRules()` | Laadt `lumio-rules.json`, registreert IOptions<T>, domain services, rule engine |

### 24.2 Profile registratie
**Bestand:** `Program.cs`

| # | Regel | Detail |
|---|-------|--------|
| 1 | `IProfileService` is `Singleton` | Gedeeld over alle requests |
| 2 | `IMasterPasswordService` is `Singleton` | Password state in-memory |
| 3 | `IAuditService` is `Singleton` | Audit logging |
| 4 | `IEncryptionService` is `Scoped` | Per-request scope (afhankelijk van actief profiel) |
| 5 | `IShamirService` is `Transient` | Per inject-instantie |
| 6 | `LumioDbContext` is `Scoped` | Per-request scope |

### 24.3 Business Rules registratie
**Bestand:** `Rules/Configuration/RuleServiceExtensions.cs`  
**Methode:** `AddLumioRules()`

| # | Registratie | Scope | Bron |
|---|------------|-------|------|
| 1 | `IOptions<LumioRulesOptions>` | Singleton | `lumioRules` sectie |
| 2 | `IOptions<ErfbelastingOptions>` | Singleton | `erfbelasting` sectie |
| 3 | `IOptions<LimietenOptions>` | Singleton | `limieten` sectie |
| 4 | `IOptions<VeldLengtesOptions>` | Singleton | `veldLengtes` sectie |
| 5 | `IOptions<ValidatieOptions>` | Singleton | `validatie` sectie |
| 6 | `IOptions<EncryptieOptions>` | Singleton | `encryptie` sectie |
| 7 | `IOptions<ExportOptions>` | Singleton | `export` sectie |
| 8 | `IOptions<CompleetheidsOptions>` | Singleton | `compleetheid` sectie |
| 9 | `IWorkflowLoader` | Singleton | `lumio-workflows.json` |
| 10 | `IRuleEngineService` | Singleton | Microsoft RulesEngine wrapper |
| 11 | `IErfbelastingService` | Scoped | Erfbelastingberekening |
| 12 | `INalatenschapService` | Scoped | Nalatenschapsverdeling |
| 13 | `ICompleetheidsService` | Scoped | Compleetheidsberekening |
| 14 | `ILegitimairePortieService` | Scoped | Legitieme portie |
| 15 | `IMeldingService` | Scoped | Meldingen (engine-first + fallback) |
| 16 | `ISuggestieService` | Scoped | Suggesties (hybride engine + code) |

---

## Appendix A: Overzicht alle enumeraties

| Enum | Bestand | Waarden |
|------|---------|---------|
| `BurgerlijkeStaat` | `Domain/Common/Eigenaar.cs` | Ongehuwd(0), Gehuwd(1), GeregistreerdPartnerschap(2), Gescheiden(3), Weduwe(4) |
| `HuwelijksVoorwaarden` | `Domain/Common/Eigenaar.cs` | Geen(0), GemeenschapVanGoederen(1), Huwelijksvoorwaarden(2), BeperkteGemeenschap(3) |
| `LegitimatieSoort` | `Domain/Common/Eigenaar.cs` | Geen(0), Paspoort(1), Rijbewijs(2), IdentiteitsKaart(3) |
| `VermogensSoort` | `Domain/AssetRegistry/VermogensSoort.cs` | Prive(0), Gemeenschap(1) |
| `AfhandelingsStatus` | `Domain/Common/AfhandelingsItem.cs` | Open(0), InBehandeling(1), Afgehandeld(2) |

## Appendix B: Overzicht alle regex-patronen

| Veld | Regex | Bron | Doel |
|------|-------|------|------|
| IBAN | `^[A-Z]{2}\d{2}[A-Z0-9]{4,30}$` | `rules/lumio-rules.json` → `validatie.ibanRegex` | IBAN-format validatie |
| Postcode | `^[1-9][0-9]{3}\s?[a-zA-Z]{2}$` | `rules/lumio-rules.json` → `validatie.postcodeRegex` | Nederlandse postcode |
| Telefoon | `^[+]?[0-9\s\-()]{7,20}$` | `rules/lumio-rules.json` → `validatie.telefoonRegex` | Telefoonnummer |

> **Opmerking:** Alle regex-patronen zijn geëxternaliseerd naar `rules/lumio-rules.json` en geladen via `IOptions<ValidatieOptions>`.

## Appendix C: Overzicht alle limieten/drempels

| Limiet | Waarde | Bron | Aanpasbaar via JSON |
|--------|--------|------|---------------------|
| Max profielen | 5 | `limieten.maxProfielen` | ✅ |
| Min wachtwoordlengte | 8 tekens | `limieten.wachtwoordMinLengte` | ✅ |
| Max profielfoto grootte | 10 MB | `limieten.fotoMaxBytes` | ✅ |
| Max document upload | 50 MB | `limieten.documentMaxBytes` | ✅ |
| Min zoektermlengte | 2 tekens | `limieten.zoekenMinQueryLengte` | ✅ |
| Audit log default limiet | 200 entries | `limieten.auditLogStandaardLimiet` | ✅ |
| Backup waarschuwingsdrempel | 30 dagen | `limieten.backupVerouderdDagen` | ✅ |
| Actualisatie waarschuwingsdrempel | 90 dagen | `limieten.actualisatieIntervalDagen` | ✅ |
| Document verloop waarschuwing | 30 dagen | `limieten.documentVerlooptWaarschuwingDagen` | ✅ |
| Shamir minimum drempel | 2 | `limieten.shamirMinDrempel` | ✅ |
| PBKDF2 iteraties | 100.000 | `encryptie.pbkdf2Iteraties` | ✅ |
| AES nonce lengte | 12 bytes | `encryptie.nonceLengteBytes` | ✅ |
| AES tag lengte | 16 bytes | `encryptie.tagLengteBytes` | ✅ |
| Salt lengte | 32 bytes | `encryptie.saltLengteBytes` | ✅ |
| Key lengte | 32 bytes (256-bit) | `encryptie.keyLengteBytes` | ✅ |
| Erfbelasting schijf 1 grens | €154.197 | `erfbelasting.relatieTarieven[].schijf1Grens` | ✅ |
| Naam max lengte | 100 | `veldLengtes.naamMax` | ✅ |
| Tussenvoegsel max lengte | 20 | `veldLengtes.tussenvoegselMax` | ✅ |
| Postcode max lengte | 10 | `veldLengtes.postcodeMax` | ✅ |

> **Opmerking:** Alle limieten en drempels zijn geëxternaliseerd naar `rules/lumio-rules.json`. Standaardwaarden zijn ingebouwd in de `Options`-klassen; het JSON-bestand is optioneel.

## Appendix D: Business Rules Architectuur

### Gelaagde structuur

```
rules/lumio-rules.json          ← Configureerbare constanten (IOptions<T>)
rules/lumio-workflows.json      ← RulesEngine workflow-definities
Rules/Configuration/            ← Options-klassen + DI extensies
Rules/Engine/                   ← WorkflowLoader + RuleEngineService
Rules/Facts/                    ← Input-modellen per domeinservice
Rules/Results/                  ← Output-modellen (PolicyResult<T>)
Rules/Services/                 ← Domain services (Facts-in → Results-out)
```

### Fallback-mechanisme

| Service | Strategie | Wanneer fallback? |
|---------|-----------|-------------------|
| `MeldingService` | Engine-first | Als `lumio-workflows.json` ontbreekt, engine fout optreedt, of workflows niet geladen |
| `SuggestieService` | Hybride | Boolean-regels via engine + iteratieregels via code; bij falen alles via code |

Fallback-logica bevat dezelfde regels als de engine-workflows, waardoor functionaliteit gegarandeerd is ook zonder het JSON-bestand.
