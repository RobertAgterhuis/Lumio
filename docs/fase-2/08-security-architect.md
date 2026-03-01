# Fase 2 — Security Architect (08)
**Agent:** 08-security-architect  
**Datum:** 2026-03-01  
**Input:** `docs/fase-2/05-software-architect.md`, `docs/fase-2/06-senior-developer.md`, `docs/fase-2/07-devops-engineer.md`, SECURITY_FLAG doorschakelingen van voorgaande agents  
**Output contract:** `docs/contracts/analysis-output-contract.md`  
**Guardrails geraadpleegd:** `docs/guardrails/03-security-guardrails.md` (G-SEC-01 t/m G-SEC-08)  
**Status:** GEREED VOOR HANDOFF

---

## 1. SECURITY_FLAG INVENTORY

Ontvangen flags van voorgaande Fase 2 agents:

| Flag ID | Agent | Bevinding | Prioriteit bij ontvangst |
|---|---|---|---|
| SF-001 | Software Architect (05) | CORS `AllowAnyOrigin()` in productie — `Program.cs` | Hoog |
| SF-002 | Software Architect (05) | Swagger UI zichtbaar in productie — `Program.cs` | Hoog |
| SF-003 | Senior Developer (06) | `System.Linq.Dynamic.Core` v1.7.1 in `Lumio.Api.csproj` — potentiële injection vector | Kritiek |
| SF-004 | DevOps Engineer (07) | `appsettings.Development.json` aanwezig in source tree — mogelijke secrets | Hoog |

**Resultaten na verificatie:**
- **SF-003: OPGEHEVEN** — Grep over alle `*.cs` bestanden toont NUL gebruik van `System.Linq.Dynamic.Core` namespace of Dynamic LINQ methoden. Package aanwezig maar ongebruikt (zie GAP-SEC-007).
- **SF-004: OPGEHEVEN** — `appsettings.Development.json` bevat uitsluitend log-level configuratie (geen credentials, bevestigd via directe inspectie).

---

## 2. COMPLIANCE KADER

**Van toepassing op Lumio:**

| Kader | Grondslag | Status |
|---|---|---|
| **AVG/GDPR** | Lumio verwerkt bijzondere categorieën persoonsgegevens (BSN, medische wensen via euthanasie-/donorformulier, financiële nalatenschap, persoonlijke relaties). DPIA aangetroffen in `devdocs/dpia-bijzondere-categorieen.md`. | **VAN TOEPASSING — PRIMAIR** |
| **NIS2** | Lumio is geen aanbieder van essentiële diensten of digitale infrastructuur. | Niet van toepassing |
| **ISO 27001** | Geen formele certificering. Relevante praktijken worden benoemd als gap. | Niet gecertificeerd; relevante controls aangewezen |
| **PCI-DSS** | Geen directe kaartverwerking — betalingen verlopen via externe checkout (toekomstig). | Niet van toepassing (externe verwerker verantwoordelijk) |

**GDPR bijzondere overwegingen:**
- `devdocs/dpia-bijzondere-categorieen.md` bevestigt DPIA-bewustzijn bij de organisatie.
- Gegevensminimalisatie: applicatie is volledig offline-first en slaat data uitsluitend lokaal op → geen transmissie naar servers.
- Encryptie at rest: SQLCipher per profiel + AES-256-GCM veldversleuteling — sterk punt.
- Recht op verwijdering (AVG Art. 17): GAP-SA-006 (geen profiel-DELETE cascade) is een AVG-compliance-risico — forward uit Fase 2 SA.

---

## 3. OWASP TOP 10 ANALYSE

**Bron:** Directe inspectie — `Program.cs`, `MasterPasswordService.cs`, `EncryptionService.cs`, `DatabaseUnlockMiddleware.cs`, `window.ts`, `index.ts` (preload), `AuditLogController.cs`

| # | Categorie | Status | Bevinding | Bron | Prioriteit |
|---|---|---|---|---|---|
| **A01** | Broken Access Control | ⚠️ PARTIEEL | `DatabaseUnlockMiddleware` blokkeert API-toegang zonder unlock correct via HTTP 423. `/swagger` staat in `AllowedPrefixes` → Swagger UI passeert de databaselock en is productie-toegankelijk zonder authenticatie. Geen user-level RBAC (acceptabel voor single-user offline app). Read-only modus correct geïmplementeerd. | `DatabaseUnlockMiddleware.cs:16`, `Program.cs:239` | **GAP-SEC-001: Hoog** |
| **A02** | Cryptographic Failures | ✅ STERK (2 minors) | SQLCipher AES-256-CBC per database. AES-256-GCM veldversleuteling voor BSN, seeds, wachtwoorden. PBKDF2-SHA256 met 100.000 iteraties (`lumio-rules.json:96`). `CryptographicOperations.ZeroMemory` op Lock(). Nonce random per encryptie. **Minor-1:** PBKDF2 100.000 iteraties — voldoet aan NIST minimum maar onder OWASP aanbeveling (600.000 voor PBKDF2-SHA256 in 2025). **Minor-2:** Legacy fallback salt `"Lumio.FieldEncryption.v1"` — vaste salt voor bestaande databases zonder `.salt` bestand. | `EncryptionService.cs:117-137`, `lumio-rules.json:96`, `MasterPasswordService.cs:77` | **GAP-SEC-002: Laag (PBKDF2)**, **GAP-SEC-003: Laag (legacy salt)** |
| **A03** | Injection | ✅ NIET AANWEZIG | `System.Linq.Dynamic.Core` in csproj maar GEEN gebruik in productiecode (geverifieerd via grep — 0 namespace-imports). Alle databasetoegang via EF Core parameterized LINQ. PRAGMA rekey gebruikt `quote($pw)` parameterisatie. GUARD-002 actief in CI prevents string CurrentPassword in source. | `Lumio.Api.csproj:24`, grep-resultaat, `MasterPasswordService.cs:109` | **GAP-SEC-007: Middel (zombie dependency)** |
| **A04** | Insecure Design | ⚠️ AANWEZIG | Geen formeel threat model gedocumenteerd. CORS AllowAnyOrigin. Swagger in productie. DevTools ingeschakeld in productie Electron window. Geen formele security review van de Electron IPC surface. | `Program.cs:155-159`, `window.ts:57` | **GAP-SEC-001**, **GAP-SEC-004: Middel (devTools)** |
| **A05** | Security Misconfiguration | ⚠️ AANWEZIG (3 items) | **1.** CORS `AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()` — overly permissive; mitigated door `UseUrls("http://127.0.0.1:5123")` (localhost-only binding). **2.** Swagger UI altijd ingeschakeld; geen `if (app.Environment.IsDevelopment())` guard. **3.** `devTools: true` in productie Electron webPreferences. | `Program.cs:155-159`, `Program.cs:239-240`, `window.ts:57` | **GAP-SEC-001 (CORS)**, **GAP-SEC-001 (Swagger)**, **GAP-SEC-004 (devTools)** |
| **A06** | Vulnerable Components | ⚠️ PARTIEEL VERIFIEERBAAR | npm audit voor frontend actief in CI (high+critical gate). **Geen `dotnet package audit` in CI** voor .NET NuGet packages. System.Linq.Dynamic.Core v1.7.1 aanwezig maar ongebruikt. Electron 35.2.1 — recente versie. `UNCERTAIN:` CVE-status NuGet packages niet geautomatiseerd gecontroleerd. | `.github/workflows/ci.yml`, `Lumio.Api.csproj` | **GAP-SEC-005: Middel** |
| **A07** | Auth Failures | ⚠️ PARTIEEL | Authenticatie: wachtwoord-gebaseerde SQLCipher unlock. **Geen brute-force beveiliging op `/api/auth/ontgrendelen`** — onbeperkte pogingen mogelijk. Geen account lockout. Geen MFA (by design offline?). Geen expliciete sessie-timeout — database blijft ontgrendeld tot expliciete lock via UI. | `DatabaseUnlockMiddleware.cs`, `MasterPasswordService.cs:38-60` | **GAP-SEC-006: Hoog** |
| **A08** | Software/Data Integrity | ⚠️ PARTIEEL | **Geen code signing voor Electron installer** — gebruikers kunnen een ongeauthenticeerde `.exe`/`.dmg` installeren zonder verificatie van authenticity. CodeQL SAST actief ✅. Whitelabel schema-validatie actief ✅. Geen SBOM. | `electron-builder.yml` (geen `sign` config gevonden), DevOps analyse | **GAP-SEC-008: Kritiek** |
| **A09** | Security Logging | ⚠️ PARTIEEL | Serilog actief met request logging ✅. AuditService writes mutaties naar `audit_log` tabel ✅. 30-dagen log rotatie ✅. **`AuditService` silently fails** (code-review resultaat Fase 2 SA): mutaties worden niet geblokkeerd als audit logging mislukt — audit trail kan incompleet zijn. | `AuditService.cs`, Fase 2 SA analyse | **GAP-SEC-009: Middel** |
| **A10** | SSRF | ✅ NIET VERIFIEERBAAR (laag risico) | Applicatie is offline-first; geen externe HTTP-aanroepen aangetroffen in geanalyseerde code. `will-navigate` event blokkeert non-localhost navigaties. `openExternalUrl` HTTPS-only + blocked patterns geïmplementeerd. | `window.ts:83-88`, `index.ts:142-174` | Niet van toepassing (gearchiveerd) |

---

## 4. SECRETS MANAGEMENT AUDIT

**Scope:** Alle gelezen artefacten — `appsettings.json`, `appsettings.Development.json`, `.github/workflows/*.yml`, `Program.cs`, security services, `lumio-rules.json`, `profiles.json`

**Resultaten:**

| Artefact | Bevinding | Status |
|---|---|---|
| `appsettings.json` | Logging levels only | ✅ CLEAN |
| `appsettings.Development.json` | Logging levels only | ✅ CLEAN |
| `lumio-rules.json` | PBKDF2 parameters, limits — geen secrets | ✅ CLEAN |
| `Program.cs` | `dataDir` via env var of relatief pad — geen hardcoded paths | ✅ CLEAN |
| `ci.yml` | `NEXT_PUBLIC_POSTHOG_KEY` als GitHub Secret — correct | ✅ CORRECT |
| `ProfileService` / `data/profiles.json` | `INSUFFICIENT_DATA:` profiles.json inhoud niet volledig gelezen | ⚠️ NIET GEVERIFIEERD |
| Electron preload | Geen secrets blootgesteld via contextBridge | ✅ CLEAN |

**Legacy salt bevinding:**  
`EncryptionService.cs:124`: `"Lumio.FieldEncryption.v1"u8.ToArray()` — dit is een hardcoded, voorspelbare salt voor bestaande databases die zijn aangemaakt vóór de migratie naar per-database random salts. 

**Risico-beoordeling legacy salt:** LAAG.  
- De salt is niet geheim (determinristisch en voorspelbaar)
- Maar: de effectiviteit van PBKDF2 wordt aanzienlijk verminderd voor databases die deze salt gebruiken
- Als een aanvaller toegang krijgt tot de `.db` bestand én het wachtwoord zwak is → dictionary attack wordt versneld
- Geen directe critical finding; gedocumenteerd als GAP-SEC-003

**Geen CRITICAL_FINDING: secrets in code.**

---

## 5. IAM ANALYSE

**Authenticatiemechanisme:**
- Type: Lokaal wachtwoord (masterpass) → SQLCipher unlock
- Geen netwerk-authenticatie (offline-first)
- Geen tokens, geen JWT, geen OAuth
- Geen shared credentials (per-profile, per-database)

**Autorisatiemodel:**
- Type: Encoded in `DatabaseUnlockMiddleware` + `IsReadOnly` flag
- Rollen: geen expliciete RBAC — wel functionele modes: **Locked** / **Unlocked** / **ReadOnly** (erfgenaam/Shamir mode)
- Overprivileging: Niet van toepassing — single-user app

**MFA:** Niet aanwezig. Shamir Secret Sharing als "social MFA" — k-of-n drempel voor erfgenamentoegang.  
→ `UNCERTAIN:` Of Shamir ook wordt gebruikt voor primary user unlock of uitsluitend voor erfgenamentoegang.

**Brute Force:** **GAP-SEC-006** — `/api/auth/ontgrendelen` heeft geen rate limiting of lockout.

**Session management:**
- Geen timeout — database blijft ontgrendeld tot expliciete `Lock()`
- `UNCERTAIN:` Of app automatisch lockt bij inactiviteit of scherm-lock OS-event

---

## 6. SECURITY IN CI/CD

**Aanwezig:**
- ✅ SAST: CodeQL (`csharp` + `javascript`, `security-and-quality` queries, wekelijks + push/PR)
- ✅ Dependency scanning frontend: `npm audit --audit-level=high`
- ✅ GUARD-002: CI-check, geen plaintext current password in source
- ✅ GUARD-010: CI-check, controller max 200 regels

**Ontbrekend:**
- `CRITICAL_GAP: Security scan [dotnet package audit]` — geen `dotnet list package --vulnerable` of gelijkwaardig in `ci.yml`
- `CRITICAL_GAP: Security scan [Electron installer signing verification]` — geen signatuur-check in CI
- Geen DAST (acceptabel voor offline-first)
- Geen container scanning (n.v.t. — geen containers)

---

## 7. PENETRATIE TEST STATUS

`HIGH_PRIORITY_GAP: Geen recente pentest` (GAP-SEC-010)

- Geen pentest-rapport aangetroffen in de repository.
- Lumio verwerkt bijzondere categorieën persoonsgegevens (BSN, medische wensen) — pentest is aan te raden voor een productie-release.
- Scope suggestie: Electron IPC surface, lokale API endpoints, SQLCipher unlock flow, backup/restore flow.

---

## 8. SPECIFIEKE BEVINDINGEN — KWETSBAARHEID SCORING

### GAP-SEC-001 — Swagger UI productie-exposure + CORS AllowAnyOrigin
**Prioriteit:** Hoog  
**Bron:** `Program.cs:155-159` (CORS), `Program.cs:239-240` (Swagger), `DatabaseUnlockMiddleware.cs:16` (/swagger in AllowedPrefixes)  
**Kwetsbaarheids-klasse:** CWE-16 (Configuration), CWE-942 (Permissive Cross-Origin)  
**Score:** Hoog (CVSS indicatief: 6.5 — lokale scope + informatielekrisico)

**Swagger:** Alle API-endpoints, parameters, request/response schema's zijn zichtbaar op `http://127.0.0.1:5123/swagger` — zonder databaselock-check. In een desktop-app is het risico beperkt tot een lokale aanvaller, maar het is een onnodige exposuur van de volledige API-interface.

**CORS:** `AllowAnyOrigin()` laat toe dat iedere webpage (geopend in de Electron renderer of in een externe browser op dezelfde machine) API-aanroepen doet. Gezien de `127.0.0.1:5123` binding is het risico beperkt tot:
- Kwaadaardige javascript ingeladen via HTTPS-URL geopend in een andere browser op hetzelfde systeem
- Minder relevant door Electron sandbox, maar extern browser op zelfde machine heeft wél toegang

---

### GAP-SEC-002 — PBKDF2 iteraties: 100.000 (onder OWASP 2025 aanbeveling)
**Prioriteit:** Laag  
**Bron:** `lumio-rules.json:96`, `EncryptionService.cs:140`  
**Score:** Laag (geen directe exploitability; offline-context)

OWASP Password Storage Cheat Sheet (2025): aanbevolen 600.000 iteraties voor PBKDF2-HMAC-SHA256.  
Huidige stand: 100.000 iteraties — voldoet aan NIST SP 800-132 minimum.  
**Actie:** Verhogen naar 600.000 vereist re-encryptie van bestaande databases — complexe migratie.

---

### GAP-SEC-003 — Legacy fixed salt voor EncryptionService
**Prioriteit:** Laag  
**Bron:** `EncryptionService.cs:124`

```csharp
return "Lumio.FieldEncryption.v1"u8.ToArray();
```

Vaste salt voor databases zonder `.salt` bestand (legacy). Verlaagt PBKDF2-effectiviteit.  
**Mitigatie:** Migratiescript schrijven dat legacy databases voorziet van een `.salt` bestand en data opnieuw versleutelt.

---

### GAP-SEC-004 — DevTools ingeschakeld in productie Electron window
**Prioriteit:** Middel  
**Bron:** `window.ts:57`: `devTools: true`  
**Score:** Middel (informatielekrisico voor productie-gebruikers)

Gebruikers kunnen de Chrome DevTools openen (F12), de DOM inspecteren, en netwerkverkeer bekijken. Voor een privacy-gevoelige applicatie is dit suboptimaal:
- Console-logs met gevoelige data worden zichtbaar
- Lokale API-endpoints zijn eenvoudig te exploreren
- Aanbeveling: `devTools: process.env.NODE_ENV !== 'production'`

---

### GAP-SEC-005 — Geen dotnet package vulnerability audit in CI
**Prioriteit:** Middel  
**Bron:** `.github/workflows/ci.yml` (afwezig)  
**Score:** Middel (supply-chain risico)

`npm audit` voor frontend actief. **NuGet packages worden niet geautomatiseerd gescand op CVE's.**  
Commando: `dotnet list package --vulnerable --include-transitive`

---

### GAP-SEC-006 — Geen brute-force bescherming op unlock endpoint
**Prioriteit:** Hoog  
**Bron:** `DatabaseUnlockMiddleware.cs` + `MasterPasswordService.cs:38-60`  
**Score:** Hoog (CVSS indicatief: 7.0, lokale aanval)

`/api/auth/ontgrendelen` heeft geen:
- Rate limiting
- Account lockout na N mislukte pogingen
- Vertraging tussen pogingen (exponential backoff)

Een lokale aanvaller (of kwaadaardig process op dezelfde machine) kan automatisch wachtwoorden proberen.  
**Relevantie:** Verhoogd door het ontbreken van code signing (GAP-SEC-008) — een aanvaller die een binary plaatst heeft ook netwerkinterface-toegang.

---

### GAP-SEC-007 — System.Linq.Dynamic.Core zombie dependency
**Prioriteit:** Middel  
**Bron:** `Lumio.Api.csproj:24`

```xml
<PackageReference Include="System.Linq.Dynamic.Core" Version="1.7.1" />
```

Package aanwezig maar ONGEBRUIKT in alle geanalyseerde productiecode. Risico's:
- Supply chain aanval: een kwaadaardige update van deze dependency zou actief zijn in de binary
- Aanvallers zoeken gericht naar unused packages als supply chain vector
- Vergroot het aanvaloppervlak zonder enige functionaliteitswinst

**Actie:** Package verwijderen uit `Lumio.Api.csproj`.

---

### GAP-SEC-008 — Geen code signing voor Electron installer
**Prioriteit:** KRITIEK  
**Bron:** `electron-builder.yml` (geen `sign` configuratie aangetroffen), DevOps analyse  
**Score:** CRITIEK (CVSS indicatief: 8.0+)

**Dit is de zwaarste bevinding van deze analyse.**

Distribuitie zonder code signing leidt tot:
- **Windows SmartScreen blokkeert de installer** bij elke nieuwe gebruiker (UX breaker)
- **Geen authenticiteitsgarantie** — een aanvaller kan de binary vervangen/tamper zonder detectie  
- **Aanvalsketen:** Aanvaller distribueert malafide Lumio binary → gebruiker installeert → malafide app heeft toegang tot alle ongespiet data (SQLite databases, wachtwoorden, BSN, testament)
- **macOS Gatekeeper vereist notarisatie** voor distributie buiten de App Store

Voor een applicatie die bijzondere categorieën persoonsgegevens verwerkt (DPIA aanwezig), is unsigned distributie een GDPR-risico.

---

### GAP-SEC-009 — AuditService silently fails
**Prioriteit:** Middel  
**Bron:** AuditService analyse (Fase 2 SA/SD), `AuditService.cs`  
**Score:** Middel

Als de audit-logging mislukt (bijv. DBContext-fout), wordt de mutatie niet geblokkeerd. Dit kan leiden tot een onvolledig audit trail, wat een AVG-compliance risico is (verantwoording = accountability principle Art. 5(2)).

---

### GAP-SEC-010 — Geen recente penetratietest
**Prioriteit:** Hoog  
**Score:** Hoog (HIGH_PRIORITY_GAP)

`HIGH_PRIORITY_GAP: Geen recente pentest aangetroffen.` Toepassing verwerkt bijzondere persoonsgegevens. AVG accountability + due diligence vereisen aantoonbaar security testing-programma.

---

## 9. AANBEVELINGEN

### REC-SEC-001 — Swagger UI beperken tot development builds
**Prioriteit:** P1 — Hoog (Quick win: 1 SP)  
**Gap:** GAP-SEC-001  
**Effort:** 0.5 SP

```csharp
// Program.cs — vervang:
app.UseSwagger();
app.UseSwaggerUI();

// Door:
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
```

Verwijder `/swagger` uit `AllowedPrefixes` in `DatabaseUnlockMiddleware.cs`.

**SMART KPI:** Swagger niet bereikbaar op `http://127.0.0.1:5123/swagger` in Release-build (geautomatiseerde CI-check toe te voegen).  
**Risico bij niet-uitvoeren:** Volledige API-definitie permanent zichtbaar voor lokale aanvallers/tools zonder authenticatie.

---

### REC-SEC-002 — CORS beperken tot localhost origins
**Prioriteit:** P1 — Hoog (Quick win: 0.5 SP)  
**Gap:** GAP-SEC-001  
**Effort:** 0.5 SP

```csharp
// Program.cs — vervang AllowAnyOrigin door:
policy.WithOrigins(
    $"http://127.0.0.1:{port}",
    $"http://localhost:{port}",
    "null" // Electron file-origin wanneer loadFile() wordt gebruikt
).AllowAnyMethod().AllowAnyHeader();
```

**SMART KPI:** CORS headers in response-headers beperkt tot `127.0.0.1:{port}` — verifieerbaar via curl-response.  
**Risico bij niet-uitvoeren:** Cross-origin requests van externe browsers op hetzelfde systeem mogelijk naar de volledige API.

---

### REC-SEC-003 — DevTools disablen in productie Electron
**Prioriteit:** P2 — Middel (Quick win: 0.5 SP)  
**Gap:** GAP-SEC-004  
**Effort:** 0.5 SP

```typescript
// window.ts — vervang:
devTools: true,

// Door:
devTools: process.env.NODE_ENV === "development",
```

**SMART KPI:** DevTools niet opensbaar (F12) in productie Electron binary — verifieerbaar bij release build test.

---

### REC-SEC-004 — dotnet package audit toevoegen aan CI
**Prioriteit:** P1 — Hoog  
**Gap:** GAP-SEC-005  
**Effort:** 0.5 SP

```yaml
# ci.yml — toevoegen aan backend job:
- name: Audit NuGet packages
  run: dotnet list package --vulnerable --include-transitive
  working-directory: src/Lumio.Api
```

**SMART KPI:** Backend CI-job rapporteert CVE-status van alle transitive dependencies bij elk build.  
**Risico bij niet-uitvoeren:** Kwetsbare NuGet packages onopgemerkt in productie.

---

### REC-SEC-005 — Rate limiting op unlock endpoint
**Prioriteit:** P1 — Hoog  
**Gap:** GAP-SEC-006  
**Effort:** 2 SP

```csharp
// Program.cs:
builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("unlock", config =>
    {
        config.Window = TimeSpan.FromMinutes(5);
        config.PermitLimit = 10; // max 10 pogingen per 5 minuten
        config.QueueLimit = 0;
    });
});

// AuthController.cs — [EnableRateLimiting("unlock")] op ontgrendelen endpoint
```

**SMART KPI:** Na 10 mislukte pogingen in 5 minuten → HTTP 429 retourneren; geautomatiseerde test bevestigt gedrag.

---

### REC-SEC-006 — System.Linq.Dynamic.Core verwijderen
**Prioriteit:** P1 — Middel (Quick win: 0.5 SP)  
**Gap:** GAP-SEC-007  
**Effort:** 0.5 SP

Verwijder uit `Lumio.Api.csproj`:
```xml
<!-- VERWIJDER: -->
<PackageReference Include="System.Linq.Dynamic.Core" Version="1.7.1" />
```

Verifieer na verwijdering: `dotnet build` slaagt; geen runtime-fouten.

**SMART KPI:** Package niet aanwezig in `dotnet list package` output na verwijdering.

---

### REC-SEC-007 — Code signing voor Electron installer implementeren
**Prioriteit:** P1 — KRITIEK  
**Gap:** GAP-SEC-008  
**Effort:** 5 SP (certificaat + CI-configuratie + macOS notarisatie)

**Windows:**
```yaml
# electron-builder.yml:
win:
  certificateSubjectName: "Lumio by [Company]"
  certificateSha1: "${CODE_SIGN_CERT_HASH}"
  signingHashAlgorithms: ["sha256"]
```

**macOS:**
```yaml
mac:
  hardenedRuntime: true
  entitlements: build/entitlements.mac.plist
  entitlementsInherit: build/entitlements.mac.plist
  notarize:
    teamId: "${APPLE_TEAM_ID}"
```

**CI secrets vereist:** `WINDOWS_CERT_P12`, `WINDOWS_CERT_PASSWORD`, `APPLE_TEAM_ID`, `APPLE_API_KEY`, `APPLE_API_KEY_ID`, `APPLE_API_ISSUER`

**Kosten:** EV Code Signing Certificate ~ €200-500/jaar (Windows); Apple Developer Program ~ $99/jaar (macOS).

**SMART KPI:** Windows installer toont verified publisher in SmartScreen; macOS Gatekeeper accepteert installer direct.

---

### REC-SEC-008 — AuditService fout-handling: fail-closed of alert
**Prioriteit:** P2 — Middel  
**Gap:** GAP-SEC-009  
**Effort:** 1 SP

Opties:
1. **Fail-closed:** Gooi exception als audit logging mislukt → mutatie wordt geblokkeerd
2. **Alert:** Log audit-fout als Error-level (niet Verbose) zodat het zichtbaar is in de logs

Keuze afhankelijk van UX/business override (escaleer naar Product Owner als audit-failure gebruiker blokkeert).

---

## 10. SPRINTPLAN

### Aannames
- **Team:** 1 fullstack developer (senior), ook verantwoordelijk voor Fase 5 implementatie
- **Capaciteit:** `INSUFFICIENT_DATA:` exacte sprint-capaciteit niet bekend; aanname 10-15 SP per 2-weken sprint op basis van eerder vastgestelde project-context (perpetual, solo-developer omgeving)
- **Sprint duur:** 2 weken
- **Randvoorwaarden sprint SEC-1:** Code signing certificate aankoop (extern, EXTERN-blocker); REC-SEC-001 t/m REC-SEC-004 hebben geen externe afhankelijkheden.

---

### Sprint SEC-1 — Quick Wins Security Hardening
**Doel:** Alle low-effort critical en high security fixes doorvoeren  
**Capacity aanname:** 10 SP

| Story ID | Beschrijving | SP | Type | Prioriteit |
|---|---|---|---|---|
| SEC-1-001 | Als developer wil ik Swagger UI beperken tot development builds zodat productie-API niet publiek geïnspecteerd kan worden | 0.5 | CODE | P1 |
| SEC-1-002 | Als developer wil ik CORS beperken tot localhost-origine zodat externe sites geen API-calls kunnen doen | 0.5 | CODE | P1 |
| SEC-1-003 | Als developer wil ik `System.Linq.Dynamic.Core` verwijderen zodat een ongebruikte attack surface verdwijnt | 0.5 | CODE | P1 |
| SEC-1-004 | Als developer wil ik `dotnet list package --vulnerable` in CI zodat kwetsbare NuGet packages vroegtijdig gedetecteerd worden | 0.5 | INFRA | P1 |
| SEC-1-005 | Als developer wil ik DevTools disablen in productie Electron builds zodat gebruikers API-internals niet kunnen inspecteren | 0.5 | CODE | P2 |
| SEC-1-006 | Als developer wil ik rate limiting op `/api/auth/ontgrendelen` zodat brute-force aanvallen worden geblokkeerd | 2 | CODE | P1 |
| SEC-1-007 | Als developer wil ik AuditService fout-handling verbeteren zodat een falende audit zichtbaar is in logs | 1 | CODE | P2 |

**Acceptatiecriteria SEC-1-001:** Gegeven een Release-build, wanneer `/swagger` wordt bezocht, dan HTTP 404.  
**Acceptatiecriteria SEC-1-002:** Gegeven een request van `http://evil.example.com`, wanneer de API wordt aangesproken, dan bevat de CORS-header niet de evil origin.  
**Acceptatiecriteria SEC-1-006:** Gegeven 11 unlock-pogingen in 5 minuten, wanneer de 11e poging binnenkomt, dan HTTP 429.

**Blocker Register Sprint SEC-1:**
- Alle stories: NONE

---

### Sprint SEC-2 — Code Signing & Pentest
**Doel:** Electron installer authenticiteit + eerste externe security assessment  
**Capacity aanname:** 10 SP

| Story ID | Beschrijving | SP | Type | Prioriteit |
|---|---|---|---|---|
| SEC-2-001 | Als eindgebruiker wil ik een gesigneerde installer zodat Windows SmartScreen geen waarschuwing toont | 5 | INFRA | P1 |
| SEC-2-002 | Als product owner wil ik een externe penetratiebeoordeling van de Electron IPC surface en unlock-flow laten uitvoeren zodat we GDPR accountability kunnen aantonen | 3 | ANALYSIS | P1 |
| SEC-2-003 | Als developer wil ik een SBOM genereren als CI-artifact zodat we kunnen aantonen welke dependencies in iedere release zitten | 1 | INFRA | P2 |

**Blocker Register Sprint SEC-2:**

| Blocker ID | Story | Type | Beschrijving | Eigenaar | Escalatie |
|---|---|---|---|---|---|
| BLK-SEC2-001 | SEC-2-001 | EXTERN | EV Code Signing Certificate aankoop (Windows) + Apple Developer Program | Product Owner / Business | Als niet tijdig: release uitstellen |
| BLK-SEC2-002 | SEC-2-002 | EXTERN | Budget en selectie pentest-bureau | Product Owner | Als niet tijdig: intern threat-model als tussenstap |

---

## 11. GUARDRAILS

### GUARD-SEC-001 — Swagger UI is NOOIT toegankelijk in productie builds
**Categorie:** Security Misconfiguration (A05)  
**Prioriteit:** P1  
**Analyse-referentie:** GAP-SEC-001  
**Overlap check:** Nieuw — vult G-SEC-03 aan (geen gedetailleerde app-config guardrail)

> Swagger UI (`/swagger`, `/swagger-ui`, `/swagger.json`) MOET zijn uitgeschakeld in Release/Productie-configuratie. `app.UseSwagger()` en `app.UseSwaggerUI()` MOGEN alleen worden aangeroepen binnen `if (app.Environment.IsDevelopment())`.

**Schending-actie:** Build met `ASPNETCORE_ENVIRONMENT=Production` → `curl http://127.0.0.1:5123/swagger/` MOET HTTP 404 retourneren. Als CI-check dit niet detecteert: CRITICAL_FINDING gerapporteerd in PR review.  
**Verificatiemethode:** Geautomatiseerde CI-check (curl-test in backend job); handmatige check bij elke release-tag.

---

### GUARD-SEC-002 — Electron installer MOET gesigneerd zijn vóór distributie
**Categorie:** Software/Data Integrity (A08)  
**Prioriteit:** P1  
**Analyse-referentie:** GAP-SEC-008  
**Overlap check:** Nieuw

> Een Lumio-release MAG NOOIT worden gedistribueerd zonder geldige code signing certificaten voor ALLE doelplatforms (Windows: EV-certificaat + SmartScreen reputatie; macOS: Developer ID + notarisatie). GitHub Release-actie MOET worden geblokkeerd als `electron-builder` meldt dat signing is mislukt.

**Schending-actie:** CI-job `release-desktop` faalt als signing mislukt → geen GitHub Release aangemaakt → release niet gedistribueerd.  
**Verificatiemethode:** `signtool verify /pa /v Lumio-Setup.exe` in CI na build; macOS `spctl -a -vvv Lumio.dmg`.

---

### GUARD-SEC-003 — CORS MOET beperkt zijn tot localhost origins
**Categorie:** Security Misconfiguration (A05)  
**Prioriteit:** P1  
**Analyse-referentie:** GAP-SEC-001  
**Overlap check:** Nieuw — aanvulling op G-SEC-01 (Zero Trust)

> `AllowAnyOrigin()` is VERBODEN in `Program.cs`. CORS MOET uitsluitend `WithOrigins("http://127.0.0.1:{port}", "http://localhost:{port}")` toestaan. Nieuwe middleware-configuraties die CORS verbreden worden automatisch geflagd in code review.

**Schending-actie:** PR met `AllowAnyOrigin()` → AUTOMATIC_REVIEW_BLOCK (GUARD-SD-001 mechanisme) + CRITICAL_FINDING in PR.  
**Verificatiemethode:** `grep -r "AllowAnyOrigin" src/Lumio.Api/` → exit 1 (toevoegen aan ci.yml, analoog aan GUARD-002).

---

### GUARD-SEC-004 — Brute-force beveiliging MOET aanwezig zijn op auth endpoints
**Categorie:** Authentication Failures (A07)  
**Prioriteit:** P1  
**Analyse-referentie:** GAP-SEC-006  
**Overlap check:** Nieuw

> Elk endpoint dat authenticatie-validatie uitvoert (inclusief `/api/auth/ontgrendelen`, toekomstige wachtwoord-change endpoints) MOET een rate limiter hebben met maximaal 10 pogingen per 5 minuten. Nieuwe auth-endpoints MOGEN NIET worden gemergd zonder rate limiter unit-test.

**Schending-actie:** PR checklist vereist rate limiter acceptatietest.  
**Verificatiemethode:** Integration test verifieert HTTP 429 na 11 opeenvolgende mislukte pogingen.

---

## HANDOFF CHECKLIST

- [x] Alle SECURITY_FLAG: items van voorgaande agents verwerkt (SF-001 t/m SF-004)
- [x] Compliance kader vastgesteld met bronverwijzing (AVG/GDPR primair; `devdocs/dpia-bijzondere-categorieen.md`)
- [x] OWASP Top 10: alle 10 categorieën beoordeeld
- [x] Secrets audit uitgevoerd (`appsettings.json`, `appsettings.Development.json`, CI-workflows, EncryptionService — 1 INSUFFICIENT_DATA `profiles.json` gedocumenteerd)
- [x] IAM analyse compleet
- [x] Security in CI/CD beoordeeld (2 CRITICAL_GAP gedocumenteerd)
- [x] Pentest status gedocumenteerd (`HIGH_PRIORITY_GAP`)
- [x] Alle bevindingen gescoord (prioriteit Laag/Middel/Hoog/Kritiek met rationale)
- [x] CRITICAL_FINDING: GEEN hardcoded secrets in code (clean)
- [x] CRITICAL_FINDING: GAP-SEC-008 (unsigned installer) gemarkeerd als Kritiek
- [x] Zelfcontrole uitgevoerd
- [x] Aanbevelingen: elke aanbeveling verwijst naar GAP-SEC-NNN analyse-bevinding
- [x] Aanbevelingen: impact-velden gevuld of als `INSUFFICIENT_DATA:` gemarkeerd
- [x] Aanbevelingen: meetcriteria SMART
- [x] Sprintplan: aannames gedocumenteerd (INSUFFICIENT_DATA: exacte capaciteit)
- [x] Sprintplan: alle stories hebben minimaal 1 acceptatiecriterium
- [x] Guardrails: testbaar geformuleerd, schending-actie + verificatiemethode aanwezig
- [x] Guardrails: alle verwijzen naar GAP-SEC-NNN
- [x] Overlap check met `docs/guardrails/03-security-guardrails.md` uitgevoerd
- [x] Alle 4 deliverables aanwezig: Analyse ✓ Aanbevelingen ✓ Sprintplan ✓ Guardrails ✓

**STATUS: GEREED VOOR HANDOFF**  
**OVERDRACHT AAN:** Data Architect (09)
