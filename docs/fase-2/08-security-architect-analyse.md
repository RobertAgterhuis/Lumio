# Analyse – Security (Security Architect) – 2026-03-02
> Security Architect | Agent 08 | Fase 2

## Metadata
- Agent: Security Architect (08)
- Fase: 2
- Input ontvangen: agents 05, 06, 07 + alle SECURITY_FLAG items
- Datum: 2026-03-02

---

## 1. SECURITY_FLAG Inventory (binnenkomst vorige agents)

| ID | Afkomst | Beschrijving | Initiële prioriteit |
|---|---|---|---|
| SF-001 | Software Architect (05) | `unsafe-inline` in `script-src` CSP — GAP-ARCH-002 | Hoog |
| SF-002 | Software Architect (05) | GAP-ARCH-004: geen geautomatiseerd migratie-update mechanisme → data-integriteitsrisico bij schema-mismatch | Midden |
| SF-003 | Senior Developer (06) | GAP-DEV-003: next@16.1.6 pre-release status UNCERTAIN | Midden |
| SF-004 | Senior Developer (06) | GAP-DEV-001: ~12% controller-testdekking → regression-risico voor auth/export flows | Hoog |
| SF-005 | DevOps Engineer (07) | GAP-DEVOPS-002: TruffleHog secret scan afwezig in CI | Hoog |
| SF-006 | DevOps Engineer (07) | GAP-DEVOPS-001: geen code signing → executables unsigned | Midden |

---

## 2. Compliance Kader

**Van toepassing:**

| Kader | Basis | Status |
|---|---|---|
| **AVG / GDPR** | Lumio verwerkt bijzondere persoonsgegevens (gezondheidsgegevens, BSN, erfenisinformatie) van Nederlandse burgers | Primair kader — verplicht |
| **Wet BIG / BSN-wet** | BSN verwerking vereist specifieke grondslag en technische maatregelen | Van toepassing |

**Niet van toepassing:** ISO27001 (geen certificering in scope), PCI-DSS (geen betalingen), HIPAA (geen US-organisatie).

**Bronnen:** `devdocs/dpia-bijzondere-categorieen.md`, `devdocs/data-retention-policy.md`, `src/Lumio.Api/Logging/BsnMaskingEnricher.cs` (bestaan bevestigd via Program.cs L52)

---

## 3. OWASP Top 10 Analyse

| # | Categorie | Status | Bevinding | Bron | Prioriteit |
|---|---|---|---|---|---|
| A01 | Broken Access Control | GEDEELTELIJK | ✓ LocalOriginValidationMiddleware blokkeert niet-localhost/Electron origins op `/api/`. ✓ CORS beperkt tot localhost/Electron. ✓ DatabaseUnlockMiddleware blokkeert verzoeken bij vergrendelde DB. ✗ Geen centrale autorisatielaag — direct DbContext in 34 controllers (GAP-ARCH-001) — geen per-resource eigenaarschapscheck herleidbaar uit code | `Program.cs` L136-160; GAP-ARCH-001 | Midden |
| A02 | Cryptographic Failures | GOED | ✓ SQLCipher met ≥310.000 PBKDF2-SHA512 iteraties (ISqlCipherKdfService). ✓ UsePassword-callback beperkt blootstelling van het masterpassword als managed string. ✓ Geheugenbeheer: wachtwoord niet opgeslagen buiten callback-scope | `Program.cs` L116-135, comment "GAP-SEC-01" | Laag |
| A03 | Injection | GEDEELTELIJK | ✓ EF Core parameterized queries (default gedrag). ✗ MigratieDbHelper.EnsureSchuldKolommenAsync gebruikt raw DDL SQL (ADR-001 schuld). Risico: SQL injection via tabelnaamsinterpolatie beperkt (geen user-input), maar raw DDL is principieel onveilig | `devdocs/adr-001-schulden-schema-brug.md`; GAP-ARCH software architect | Midden |
| A04 | Insecure Design | GOED | ✓ DPIA aanwezig + DPO sign-off 2026-03-01. ✓ BruteForceProtectionService (5 pogingen, 15 min lockout). ✓ Shamir's Secret Sharing voor masterkey recovery. ✓ Data design: cascade delete implementeert GDPR right-to-erasure | `Program.cs` L77; `devdocs/dpia-bijzondere-categorieen.md` | Laag |
| A05 | Security Misconfiguration | GEVONDEN | ✓ Swagger uitgeschakeld in productie (GUARD-011). ✓ API bind aan 127.0.0.1 only. ✗ CSP `script-src 'unsafe-inline'` in layout.tsx — SF-001. ✗ `style-src 'unsafe-inline'` — XSS-bescherming in stijlen afwezig | `src/lumio-web/src/app/layout.tsx` L44; `Program.cs` L232 | Hoog |
| A06 | Vulnerable Components | GEDEELTELIJK | ✓ NuGet vulnerability scan in CI (GUARD-013). ✓ npm audit `--audit-level=high` in CI. ✓ CodeQL aanwezig. ✗ UNCERTAIN: next@16.1.6 pre-release status (SF-003) — verifieer npm registry | `ci.yml` L55, L73; SF-003 | Midden |
| A07 | Auth Failures | GEDEELTELIJK | ✓ BruteForceProtectionService (5 pogingen, 15 min lockout). ✓ Geen JWT/sessietoken-management (lokale app, stateless). ✗ ~12% controller-testdekking → regression-risico voor auth-flow bij refactor (SF-004) | `Program.cs` L77; GAP-DEV-001 | Hoog |
| A08 | Software/Data Integrity | GEVONDEN | ✓ CodeQL in CI. ✗ TruffleHog ontbreekt in CI (SF-005). ✗ Executables unsigned (SF-006) — SmartScreen bypass mogelijk via spoofing | GAP-DEVOPS-002; GAP-DEVOPS-001 | Hoog |
| A09 | Logging Failures | GOED | ✓ Serilog structured logging. ✓ BSN-masking enricher (GUARD-SEC-01). ✓ AuditService fail-safe pattern. ✓ AuditLogRotatieService (90 dagen, AVG art. 5(1)(e)). ✓ SerilogRequestLogging voor alle API-calls | `Program.cs` L40-60; `Services/AuditService.cs` | Laag |
| A10 | SSRF | N/A | Geen uitgaande HTTP-calls vanuit API-laag. API serveert uitsluitend lokale SQLite-data. PostHog-calls komen uit de frontend (browser-context). | `Program.cs` volledig gelezen | N/A |

---

## 4. Secrets Management Audit

**Hardcoded secrets gevonden:** GEEN aangetroffen in geïnspecteerde bestanden.

**Secrets management patroon:**
- Database-wachtwoord: via `IMasterPasswordService.UsePassword()` callback — GOED
- PostHog keys: via GitHub Actions secrets + environment variables — GOED
- Code signing secrets: via GitHub Actions secrets (optioneel) — GOED
- `LUMIO_DATA_DIR` / `LUMIO_FRONTEND_DIR`: environment variables — GOED

**BEPERKING:** TruffleHog-scan niet uitgevoerd (TOOLING_GAP). Volledige scan niet mogelijk. Alle bevindingen zijn gebaseerd op handmatige inspectie van 8 kernbestanden.  
→ `CRITICAL_GAP: TruffleHog secret scan ontbreekt in CI (SF-005)`

---

## 5. IAM Analyse

| Aspect | Status | Detail | Bron |
|---|---|---|---|
| Authenticatiemechanisme | Masterpassword (lokaal) | Enkelvoudig masterpassword + SQLCipher encryptie. Geen OAuth/OIDC (N/A voor offline app). | `Program.cs` L73 |
| Autorisatiemodel | GEEN expliciete RBAC/ABAC | Eén gebruikerscontext per SQLite-database. Geen multi-user autorisatielogica. | Controllers analyse |
| Overprivileging | Niet van toepassing | Single-user lokale app. | — |
| MFA | AFWEZIG | Shamir key-recovery als quasi-2nd-factor, maar geen echte MFA. | `devdocs/shamir-ux-test-protocol.md` |
| Shared credentials | AFWEZIG | Per-profile separate database. | `devdocs/activation-definition.md` |
| Session management | IN-MEMORY | `IMasterPasswordService` houdt unlock-state in geheugen; geen token-expiratie | `Program.cs` L73-76 |

**GAP-SEC-001:** Geen session timeout voor de in-memory unlock-state van `IMasterPasswordService`. Een ontgrendeld process dat onbeheerd achterblijft blijft ontgrendeld totdat het Electron-window sluit.

---

## 6. Security in CI/CD

| Scan type | Aanwezig | Detail | Bron |
|---|---|---|---|
| SAST (Static Analysis) | ✓ | CodeQL | `codeql.yml` |
| Dependency Scanning | ✓ | NuGet vuln scan + npm audit --audit-level=high | `ci.yml` L55, L73 |
| Container Scanning | N/A | Geen containers | — |
| Secret Scanning | ✗ AFWEZIG | TruffleHog TOOLING_GAP | SF-005 |
| DAST | ✗ AFWEZIG | Geen DAST in CI | — |

`CRITICAL_GAP: Secret scanning ontbreekt in CI/CD (TruffleHog)`

---

## 7. Penetratie Test Status

`HIGH_PRIORITY_GAP: Geen recente penetratietest beschikbaar`  
**Bron:** Geen pentest-rapport aangetroffen in workspace (616 bestandscan). `docs/decisions.md` bevat geen pentest-beslissing.  
**Aanbeveling:** Pentest uitvoeren vóór publieke v1.0 release, specifiek gericht op masterpassword-flow en SQLCipher-implementatie.

---

## 8. Kwetsbaarheid Scoring

| Bevinding | Ernst | Rationale |
|---|---|---|
| CSP `unsafe-inline` (A05) | Hoog | Vermindert XSS-bescherming significant; TODO in code bevestigt probleem |
| TruffleHog afwezig (A08) | Hoog | Secrets kunnen ongedetecteerd in git terechtkomen |
| ~12% controller-testdekking auth-flow (A07) | Hoog | Regressie in auth-flow niet automatisch detecteerbaar |
| MigratieDbHelper raw DDL SQL (A03) | Midden | User-input niet in scope, maar raw DDL is schuld |
| Unsigned executables (A08) | Midden | SmartScreen + supply chain integriteitsrisico |
| IMasterPasswordService geen session timeout (IAM) | Midden | Lokale app; aanvaller heeft fysieke toegang nodig |
| next@16.1.6 UNCERTAIN status (A06) | Midden | UNCERTAIN: ongedefinieerd risico totdat registry-status geverifieerd |
| Geen pentest | Hoog | Onbekende kwetsbaarheden in cryptografische implementatie |

---

## 9. HANDOFF CHECKLIST — Analyse Security Architect
- [x] SECURITY_FLAG inventory compleet
- [x] Compliance kader vastgesteld met bronverwijzing
- [x] OWASP Top 10 volledig ingevuld
- [x] Secrets audit uitgevoerd (met TOOLING_GAP beperking gedocumenteerd)
- [x] IAM analyse volledig
- [x] CI/CD security scans gedocumenteerd
- [x] Pentest-status gedocumenteerd
- [x] Kwetsbaarheid scoring aanwezig
- [x] Status: READY voor Security Aanbevelingen + Security Handoff Context
