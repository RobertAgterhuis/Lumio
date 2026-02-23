# 1. Huidige Situatie — Business Rules in Lumio

> **Doel:** een eerlijk en gedetailleerd beeld schetsen van hoe bedrijfsregels
> op dit moment in de Lumio-.NET-codebase zijn geïmplementeerd, welke
> architecturale patronen worden gehanteerd, en welke pijnpunten daaruit
> voortvloeien.

---

## 1.1 Architectuuroverzicht

Lumio volgt momenteel een **"thick controller / anemic domain"**-patroon:

```
┌──────────────────────────────────────────────────────┐
│  Frontend (Next.js)                                  │
│  — roept REST API-endpoints aan                      │
└──────────────────┬───────────────────────────────────┘
                   │  HTTP
┌──────────────────▼───────────────────────────────────┐
│  Middleware                                          │
│  ├─ DatabaseUnlockMiddleware  (toegangscontrole)     │
│  ├─ ExceptionHandlingMiddleware                      │
│  └─ RscRewriteMiddleware                             │
├──────────────────────────────────────────────────────┤
│  Controllers (21 stuks)                              │
│  ├─ Input-validatie (FluentValidation — auto)        │
│  ├─ EF Core queries (direct in action methods)       │
│  ├─ Business rules (inline!)                         │
│  ├─ Berekeningen (inline!)                           │
│  └─ HTTP-response mapping                            │
├──────────────────────────────────────────────────────┤
│  Services (5 stuks — alleen security/infra)          │
│  ├─ MasterPasswordService (singleton, in-memory)     │
│  ├─ ProfileService       (singleton, file-based)     │
│  ├─ EncryptionService    (AES-256-GCM + PBKDF2)     │
│  ├─ ShamirService        (secret sharing)            │
│  └─ AuditService         (log schrijven)             │
├──────────────────────────────────────────────────────┤
│  Domain Models (30 entiteiten — puur data)           │
│  — Geen methoden, geen validatie, geen gedrag        │
├──────────────────────────────────────────────────────┤
│  Data / LumioDbContext                               │
│  — EF Core + SQLCipher                               │
│  — Cascade deletes, auto-audit, auto-timestamp       │
└──────────────────────────────────────────────────────┘
```

### Kernobservaties

| Aspect | Status | Toelichting |
|--------|--------|-------------|
| Domain Models | **Anemisch** | 30 entiteiten, 0 regels, 0 methoden — pure POCO/data-bags |
| Controllers | **Overbelast** | ~1.240 regels businesslogica verdeeld over 21 controllers |
| Service-laag | **Ontbreekt** | Alleen security/infra; geen domein-services |
| Validatie | **Gedeeltelijk apart** | FluentValidation voor veldniveau; geavanceerde checks inline in controllers |
| Configuratie | **Niet aanwezig** | 0 regels via `appsettings.json`; alles compile-time |
| Testbaarheid | **Beperkt** | Controllers bevatten EF-queries + logica → integratie-tests nodig |
| Lokalisatie | **Niet aanwezig** | ~205 hardcoded Nederlandse strings |

---

## 1.2 Hoe regels nu verdeeld zijn

### Verdeling per laag (regels code)

| Laag | Totaal regels | Waarvan business rules | % |
|------|--------------|----------------------|---|
| Controllers (21 bestanden) | ~4.388 | ~1.240 | 28% |
| Validators (5 bestanden) | ~168 | 168 | 100% |
| Middleware (1 bestand) | ~95 | ~55 | 58% |
| Services (5 bestanden) | ~487 | ~95 | 20% |
| Domain Models (30 bestanden) | ~500 | 0 | 0% |
| DbContext (1 bestand) | ~200 | ~25 | 13% |
| **Totaal** | **~5.838** | **~1.583** | **27%** |

### Top-5 controllers met meeste business-logica

| Controller | Totaal regels | Business rules | % BR |
|------------|--------------|---------------|------|
| StatusController | 603 | ~420 | 70% |
| ExportController | 901 | ~50 | 6% |
| TestamentController | 310 | ~177 | 57% |
| ErfgenamenController | 159 | ~110 | 69% |
| AuthController | 164 | ~90 | 55% |

De **StatusController** bevat verreweg de meeste regels: compleetheid, granulaire scoring, meldingen, suggesties, actualisatie, data-integriteit, en tijdlijn — allemaal inline in één bestand van 600+ regels.

---

## 1.3 Wat FluentValidation momenteel doet

FluentValidation wordt **correct** ingezet voor veldniveau-validatie:

```
14 validator-klassen  →  ~30 veldregels
```

**Wat wél in validators zit:**
- `NotEmpty()`, `MaximumLength()`, `MinimumLength()`
- `EmailAddress()`, `GreaterThan(0)`, `GreaterThanOrEqualTo(0)`
- IBAN regex: `^[A-Z]{2}\d{2}[A-Z0-9]{4,30}$`

**Wat NIET in validators zit (maar zou kunnen):**
- Profiel-relatie check (inline in controller)
- Bestandstype/-grootte checks (inline in controller)
- Wachtwoord min-lengte (gedupliceerd in validator + controller)
- Drempel-validatie voor Shamir (inline in controller)

---

## 1.4 Wat inline in controllers zit

### A. Hardcoded constanten / drempelwaarden

Er zijn **21 hardcoded constanten** verspreid over de codebase:

| Constante | Waarde | Locatie(s) | Duplicaten |
|-----------|--------|-----------|------------|
| Min wachtwoordlengte | 8 | AuthValidators + AuthController | 🔴 3× |
| Max profielen | 5 | IProfileService | 1× |
| Max document upload | 50 MB | DocumentenController | 1× |
| Max profielfoto | 10 MB | EigenaarController | 1× |
| Erfbelasting vrijstellingen | 5 waarden | ErfgenamenController | 1× |
| Erfbelasting tarieven | 10 waarden | ErfgenamenController | 1× |
| Schijfgrens | €154.197 | ErfgenamenController | 1× |
| Backup waarschuwing | 30 dagen | StatusController | 1× |
| Actualisatie interval | 90 dagen | StatusController | 1× |
| Document verloop waarschuwing | 30 dagen | StatusController | 1× |
| Audit log limiet | 200 | AuditLogController | 1× |
| Min zoektermlengte | 2 | ZoekenController | 1× |
| Shamir min drempel | 2 | ShamirController + ShamirService | 🔴 2× |
| PBKDF2 iteraties | 100.000 | EncryptionService | 1× |

**Probleem:** geen van deze waarden is configureerbaar. Wijziging vereist code-aanpassing + rebuild + deploy.

### B. Complexe berekeningen (inline in controllers)

| Berekening | Controller | Regels code | Complexiteit |
|-----------|-----------|-------------|-------------|
| Erfbelasting 2025 | ErfgenamenController | ~83 | **Hoog** — tariefgroepen, schijven, vrijstellingen |
| Netto nalatenschap | BoedelController | ~28 | Middel — 4 EF-queries + som |
| Netto nalatenschap | ErfgenamenController | ~7 | 🔴 Duplicaat van hierboven |
| Netto nalatenschap | StatusController | ~7 | 🔴 Duplicaat (3e kopie) |
| Compleetheid (10 domeinen) | StatusController | ~36 | Middel — 10× AnyAsync |
| Granulaire compleetheid | StatusController | ~77 | Middel — veldcontroles per domein |
| Data integrity hash | StatusController | ~49 | Laag — SHA-256 van snapshot |
| Legitimaire portie (BW 4:63) | TestamentController | ~74 | **Hoog** — juridische berekening |
| Juridische check (6 sub-regels) | TestamentController | ~103 | **Hoog** — cross-entity, juridisch |
| Suggesties (7 sub-regels) | StatusController | ~129 | **Hoog** — cross-entity vergelijkingen |
| Meldingen (16 checks) | StatusController | ~65 | Middel — status/aanwezigheid checks |

### C. Cross-entity checks

De meest waardevolle business rules span **meerdere entiteiten**:

```
Legitimaire portie check
  └→ leest: Eigenaar (burgerlijkeStaat), Erfgenamen (relatie), 
            Begunstigden (percentage), TestamentInfo

Juridische check
  └→ leest: Eigenaar (notaris), TestamentInfo (type, uitsluitingsclausule),
            Begunstigden (percentage), Executeurs, Erfgenamen, FysiekBezit (categorie)

Suggesties
  └→ leest: Eigenaar (notaris), Erfgenamen (naam), Noodcontacten (naam, rol),
            TestamentInfo, Begunstigden (naam), Executeurs, UitvaartWensen

Erfbelasting
  └→ leest: Erfgenamen (relatie), FysiekBezit (waarde), Bankrekeningen (saldo),
            Verzekeringen (bedrag), Schulden (bedrag)
```

---

## 1.5 Geïdentificeerde problemen

### 🔴 Probleem 1: Geen scheiding van verantwoordelijkheden

Controllers doen **drie dingen tegelijk**:
1. HTTP-verwerking (routing, status codes, response mapping)
2. Data-toegang (EF Core queries, Include-paden)
3. Business rules (validatie, berekeningen, beleidsbesluiten)

Dit maakt de codebase moeilijk te begrijpen, wijzigen, en testen.

### 🔴 Probleem 2: Code-duplicatie

De **netto nalatenschap**-berekening staat op **3 verschillende plekken**:
- `BoedelController.GetOverzicht()` (28 regels)
- `ErfgenamenController.BerekenErfbelasting()` (7 regels)
- `StatusController` (7 regels)

Als de formule wijzigt (bijv. pensioenen toevoegen), moeten 3 bestanden aangepast worden.

### 🔴 Probleem 3: Niet-configureerbare parameters

De erfbelasting tarieven 2025 zijn **hardcoded**. In 2026 wijzigen deze gegarandeerd — dit vereist dan:
1. Code aanpassen
2. Testen
3. Nieuwe build
4. Distribueren naar alle USB-sticks

Terwijl dit met een configuratiebestand in **0 codewijzigingen** zou kunnen.

### 🔴 Probleem 4: Onmogelijk unit-testen

De erfbelasting-berekening zit inline in een controller die `LumioDbContext` inject. Unit-testen vereist:
- Een configuratie van EF Core met in-memory provider
- Seed-data voor minstens 5 entiteittypen
- HTTP-context setup

Dit zou **1 regel code** moeten zijn:
```csharp
var belasting = TaxCalculator.BerekenErfbelasting(100_000m, TariefGroep.Kind, tarieven2025);
```

### 🟡 Probleem 5: Hardcoded Nederlandse teksten

~205 foutmeldingen, labels, en juridische teksten staan inline. Dit bemoeilijkt:
- Toekomstige meertaligheid
- Consistentie van berichtgeving
- Centraal beheer van teksten

### 🟡 Probleem 6: Encryptie-parameters niet configureerbaar

PBKDF2 iteraties (100.000) en salt-lengte (32 bytes) zijn hardcoded. Bij een toekomstig security-advies om iteraties te verhogen naar bijv. 600.000, is een code-aanpassing nodig.

### 🟡 Probleem 7: Geen versiebeheer op regels

Er is geen manier om te traceren **welke versie** van de erfbelasting-tarieven of juridische checks is gebruikt bij een bepaalde berekening. Bij een audit-scenario is dit problematisch.

---

## 1.6 Wat al goed gaat

Het is belangrijk ook de sterke punten te benoemen:

| Aspect | Waardering |
|--------|-----------|
| **FluentValidation** opzet | ✅ Netjes opgezet, auto-registratie, consistent patroon |
| **Middleware** scheiding | ✅ Toegangscontrole is correct in middleware i.p.v. in elke controller |
| **EF Core** cascade-configuratie | ✅ Alle relaties correct geconfigureerd in `OnModelCreating` |
| **Encryptie** services | ✅ Goed geïsoleerd als services, correct gebruik van AES-256-GCM |
| **Audit trail** automatisch | ✅ Via `SaveChangesAsync()` override — elegant |
| **Naamgeving** | ✅ Nederlands, consistent, begrijpelijk |

---

## 1.7 Conclusie huidige situatie

De Lumio-codebase heeft een **werkende maar niet-schaalbare** architectuur voor business rules:

- **~1.583 regels** business-logica verspreid over ~25 bestanden
- **0% daarvan** is extern configureerbaar
- **0%** zit in domain models
- **100%** van de complexe logica zit direct in controllers, verweven met EF Core queries
- **3 duidelijke duplicaten** van de netto-nalatenschapsberekening
- **21 hardcoded constanten** waarvan sommige **jaarlijks** wijzigen (erfbelasting)

De rest van deze analyse onderzoekt **hoe** deze situatie verbeterd kan worden, welke opties beschikbaar zijn, en wat de aanbevolen aanpak is voor een offline-first USB-applicatie als Lumio.
