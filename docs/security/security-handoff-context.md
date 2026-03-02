# Security Handoff Context
_Gegenereerd door Security Architect op 2026-03-02 — v1_  
_Bijwerken bij elke REEVALUATE of HOTFIX die security-bevindingen wijzigt._

---

## IMPL-CONSTRAINTs

### IMPL-CONSTRAINT-001
- **Afgeleid van:** GAP-ARCH-002 / A05 Security Misconfiguration / REC-SEC-001
- **Scope:** `src/lumio-web/src/app/layout.tsx` — CSP meta-tag
- **⚠️ GECORRIGEERD (2026-03-02) — SECURITY_FLAG: GAP-ARCH-002 — DEC-105:**
  `unsafe-inline` in `script-src` is een **harde architectuurconstraint**, GEEN tijdelijke schuld die verwijderd kan worden zonder SSR-migratie. Next.js `output: "export"` (static export) injecteert inline hydration scripts bij build-time; verwijdering van `unsafe-inline` breekt de applicatie volledig.
- **Bilaterale constraint:**
  - Mag NIET: nieuwe `<script>` tags inline toevoegen of `unsafe-inline` uitbreiden naar andere directives.
  - Mag OOK NIET: `unsafe-inline` verwijderen uit de huidige CSP totdat de volledige SSR-migratie (SP-15, REC-SEC-001) compleet is.
- **Vereiste (status quo protected):** De bestaande `unsafe-inline` in layout.tsx L44 MOET aanwezig blijven. Bij elke wijziging aan de CSP-header: voer CSP-evaluatie uit vóór merge en zorg dat precies 1 treffer aanwezig is (de gedocumenteerde in layout.tsx).
- **Verificatie:** `grep -n "unsafe-inline" src/lumio-web/src/app/layout.tsx` → precies 1 treffer op L44. Nul nieuwe treffers in andere bestanden.
- **Guardrail referentie:** GAP-ARCH-002, DEC-105

### IMPL-CONSTRAINT-002
- **Afgeleid van:** GAP-SEC-001 / A07 Auth Failures / REC-SEC-003
- **Scope:** `src/lumio-desktop/src/main/` — Electron main process; `src/Lumio.Api/Services/Security/IMasterPasswordService`
- **Vereiste:** Moet: inactiviteits-timer implementeren die na configureerbare timeout (standaard 15 min) automatisch `POST /api/setup/lock` aanroept. Mag niet: de in-memory unlock-state van `IMasterPasswordService` onbeperkt actief laten zonder gebruikersinteractie.
- **Verificatie:** Integratietest: mock 15 minuten inactiviteit → verifieer dat `DatabaseUnlockMiddleware` vervolgens 401 retourneert.
- **Guardrail referentie:** GAP-SEC-001

### IMPL-CONSTRAINT-003
- **Afgeleid van:** GAP-DEVOPS-002 / A08 Software/Data Integrity / REC-SEC-002 / REC-DEVOPS-002
- **Scope:** `.github/workflows/ci.yml` — alle PRs naar `main`
- **Vereiste:** Moet: TruffleHog GitHub Action uitvoeren op elke PR naar `main`. Mag niet: een PR mergen naar `main` zonder geslaagde TruffleHog scan.
- **Verificatie:** Branch protection rule op `main`: `secret-scan` job is required status check.
- **Guardrail referentie:** GAP-DEVOPS-002

### IMPL-CONSTRAINT-004
- **Afgeleid van:** A03 Injection / ADR-001 MigratieDbHelper
- **Scope:** `src/Lumio.Api/Data/MigratieDbHelper.cs` (of vergelijkbaar) — raw DDL SQL
- **Vereiste:** Mag niet: nieuwe raw DDL SQL-constructies toevoegen met tabelnam- of kolomnaaminterpolatie via gebruikersinvoer. Bestaande MigratieDbHelper-code: mag alleen worden uitgebreid als de input uitsluitend hardcoded constanten zijn (geen user-supplied strings).
- **Verificatie:** Code review checklist: elke PR die `MigratieDbHelper` raakt vereist expliciete reviewer-signoff op A03-compliance.
- **Guardrail referentie:** ADR-001

### IMPL-CONSTRAINT-005
- **Afgeleid van:** A02 Cryptographic Failures / GAP-SEC-01 (ISqlCipherKdfService)
- **Scope:** `src/Lumio.Api/Services/Security/` — alle wachtwoordverwerkende services
- **Vereiste:** Mag niet: het masterpassword opslaan als `string` buiten de `UsePassword()` callback scope. Vereist: versleuteloperaties uitsluitend via `UsePassword(pw => { ... })` callback patroon om `SecureString`-graad van beheersing te handhaven.
- **Verificatie:** CI GUARD-002 check (`ci.yml`: "no plaintext CurrentPassword in interface") afdwingen op alle commits. Uitbreiden naar `plaintext.*Password` patroon in toekomstige GUARD-versie.
- **Guardrail referentie:** GUARD-002

### IMPL-CONSTRAINT-006
- **Afgeleid van:** A09 Logging Failures / GUARD-SEC-01 / BsnMaskingEnricher
- **Scope:** Alle log-statements in `src/Lumio.Api/` en `src/lumio-web/`
- **Vereiste:** Mag niet: BSN of andere bijzondere persoonsgegevens (gezondheidsgegevens, erfenisdetails) direct in log-berichten plaatsen. Vereist: gebruikmaken van structured logging properties zodat `BsnMaskingEnricher` automatisch masking kan toepassen. Mag niet: `ToString()` voor entiteiten met BSN-veld in een log-context.
- **Verificatie:** Automated lint rule: voeg `no-log-sensitive-data` ESLint rule toe voor frontend; dotnet Analyzer voor backend (of manuele code review checklist).
- **Guardrail referentie:** GUARD-SEC-01

---

## Openstaande Risico's (UNCERTAIN)

| ID | Beschrijving | Actie vereist |
|---|---|---|
| UNCERTAIN-SEC-001 | next@16.1.6 pre-release status — mogelijk RC met ongepatchte CVEs | DevOps Engineer: verifieer npm registry (`npm view next@16.1.6 dist-tags`) vóór SP-11 release |
| UNCERTAIN-SEC-002 | ESLint lint CI-blokkerstatus niet geverifieerd (UNCERTAIN-DEVOPS-001) | DevOps Engineer: bevestig exit-code gedrag van `npm run lint` in CI |

---

_Bijwerken: bij elke REEVALUATE die impact heeft op bovenstaande constraints, nieuwe versie opslaan als `docs/security/security-handoff-context-v[N].md`._
