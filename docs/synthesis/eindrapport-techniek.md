# Eindrapport Techniek & Architectuur — Lumio — 2026-03-02
> Synthesis Agent | COMBO_AUDIT: TECHNIEK + UX | Fase 2 gevalideerd

⚠️ **PARTIAL_AUDIT:** Cross-team blocker analyse is onvolledig. Ontbrekende fasen: Fase 1 (Business & Strategie), Fase 4 (Brand, Marketing & Growth). Voer `AUDIT SYNTHESIS` uit na aanvulling van de ontbrekende fase(n) voor een volledig beeld.

---

## Besluitenregister (Stap 0)

`docs/decisions.md` geladen. Actieve besluiten:
- **DEC-101:** Chromatic uitgeschakeld
- **DEC-102:** Geen nieuwe PostHog-implementatie (bestaand `lumio_activated` event toegestaan)
- **DEC-103:** Feature branch strategie: max. 1 actieve feature branch, squash merge
- **DEC-104:** Main branch protected via Ruleset "ProtectLumio"
- **DEC-105:** `unsafe-inline` in CSP is harde architectuurconstraint (SECURITY_FLAG: GAP-ARCH-002) — mag niet verwijderd worden zonder volledige SSR-migratie (SP-15)
- **DEC-201:** EV-certificaat UITGESTELD (niet blokkerend)
- **DEC-202:** Penetratietest NIET BLOKKEREND — alleen aan einde dev-cyclus indien van toepassing

---

## 1. Samenvatting voor het Engineering-team

**Lumio** is een offline-first Electron-desktopapplicatie voor Nederlandse burgers om hun digitale nalatenschap te beheren. De architectuur is een ingebedde sidecar: Electron → .NET 10 ASP.NET Core API (127.0.0.1:5123) → SQLite/SQLCipher + Next.js SSG-frontend. Dit is weloverwogen en goed uitgevoerd voor het offline-first use-case.

**Sterktes:** SQLCipher-encryptie (≥310K PBKDF2 iteraties) is best-practice; BruteForceProtection aanwezig; BSN-masking via Serilog; CodeQL + NuGet/npm audit CI-jobs up-and-running; 7 GitHub Actions workflows; EF Core migrations-strategie; Radix UI + Tailwind CSS 4 design system met WCAG-contrast fixes reeds doorgevoerd.

**Kritieke zwaktes:** (1) Controlelaag-testen ontbreken (12% controller-coverage); (2) CSP `unsafe-inline` — structureel onderdeel van static export pero niet aanvaardbaar voor long-term; (3) TruffleHog afwezig in CI; (4) Executables unsigned (SmartScreen-risico); (5) IMasterPasswordService heeft geen session-timeout; (6) 224 ESLint `design-system/no-raw-colors` violations.

Het primaire technische risico is de gecombineerde zwakte van lage controlelaag-testdekking + absence van secret scanning + unsigned release artifacts — elk afzonderlijk acceptabel, samen een regressie-risico vóór v1.0.

---

## 2. Aanbevelingen (geprioriteerd)

| Prioriteit | Aanbeveling | Bron agent/ID | Effort | Impact |
|---|---|---|---|---|
| HOOG | TruffleHog als vereist CI-gate toevoegen | DevOps REC-DEVOPS-002 / Security REC-SEC-002 | S (30 min) | Hoog — secret leak preventie |
| HOOG | Code signing via EV-certificaat voor releases | DevOps REC-DEVOPS-001 | M | Hoog — SmartScreen, distributiekanaal | **UITGESTELD — DEC-201. Niet blokkerend.** |
| HOOG | PostHog EU-datacenter verificatie + DPIA-update | Data REC-DATA-003 | S (1 uur) | Hoog — GDPR compliance |
| HOOG | Session auto-lock timer (IMasterPasswordService) | Security REC-SEC-003 | M | Hoog — onbeheerde sessie risico |
| HOOG | Controller-test dekking naar ≥80% (4 batches) | Senior Dev REC-DEV-001 (SP-11–SP-14) | L | Hoog — regressie preventie |
| MIDDEN | API-versioning `/api/v1/` op alle endpoints | Architect REC-ARCH-002 | M | Midden — toekomstbestendigheid |
| MIDDEN | Data dictionary aanmaken (≥90% entities) | Data REC-DATA-001 | M | Midden — kennisborging |
| MIDDEN | MigratieDbHelper verwijderen (ADR-001 schuld) | Data REC-DATA-002 | M | Midden — schema-consistentie |
| MIDDEN | ESLint `design-system/no-raw-colors` fixen (224 violations) | Senior Dev REC-DEV-002 | L | Midden — whitelabel + design system |
| MIDDEN | Crash reporting met consent (opt-in) | DevOps REC-DEVOPS-003 | M | Midden — observability |
| LAAG | Penetratietest voor v1.0 | Security REC-SEC-004 | M | Hoog risico-reductie | **NIET BLOKKEREND — DEC-202. Einde dev-cyclus, optioneel.** |
| LAAG | SSR-migratie voor nonce-based CSP (post-pentest) | Security REC-SEC-001 | L | Lang termijn | **DEC-105: `unsafe-inline` is harde constraint (Next.js static export). NIET verwijderbaar vóór SP-15 SSR-migratie.** |

---

## 3. Roadmap-items voor dit team (12 maanden)

| Kwartaal | Item | Afhankelijk van | KPI target |
|---|---|---|---|
| Q1 (SP-11) | TruffleHog CI, PostHog EU-check, API versioning, controller-tests batch 1 | GEEN blockers | Zero secret leaks in CI |
| Q1 (SP-12) | Session timeout, data dictionary, ESLint 50%, controller-tests batch 2, Application Layer start | SP-11 compleet | session timeout actief, ≤112 violations |
| Q2 (SP-13) | MigratieDbHelper removal, crash reporting, Application Layer uitbouwen, ESLint finish | SP-12 compleet | violations = 0, crash telemetrie actief |
| Q2 (SP-14) | Application Layer ≥80%, Controller-tests ≥80% | SP-13 compleet | testdekking ≥80% |
| Q3–Q4 (SP-15) | SSR-migratie + nonce-based CSP (na pentest-bevindingen) | SP-14 + pentest rapport | unsafe-inline verwijderd |

---

## 4. KPI's voor dit team

| KPI | Baseline | 6-maands target | 12-maands target | Meetmethode |
|---|---|---|---|---|
| Controller-test dekking | 12% | ≥50% | ≥80% | dotnet test --collect coverage |
| ESLint violations (raw colors) | 224 | ≤112 (SP-12) | 0 (SP-13) | ESLint CI-run |
| Secret leaks in CI | 0 ontdekt (TruffleHog afwezig) | 0 (TruffleHog actief SP-11) | 0 | TruffleHog job CI |
| PostHog datacenter compliant | UNCERTAIN | Geverifieerd SP-11 | ✓ EU + DPIA bijgewerkt | Handmatige verificatie |
| Session auto-lock actief | Nee | Ja (SP-12) | Ja | Integratie test |

---

## 5. ⚠️ Blockers vanuit andere teams (ACTIE VEREIST)

| Blocker ID | Blokkerend team | Wat is nodig | Prioriteit | Aanbevolen deadline |
|---|---|---|---|---|
| BLK-TECH-001 | UX-team | Session auto-lock (REC-SEC-003) heeft UX-afstemming nodig voor idle-timeout duur + warning-dialog ontwerp | HOOG | Vóór SP-12 |
| BLK-TECH-002 | Business/Product Owner | Crash reporting opt-in consent tekst en DPO-beoordeling (REC-DEVOPS-003) — GDPR-verantwoordelijkheid | HOOG | Vóór SP-13 |
| ~~BLK-TECH-003~~ | ~~Business/Product Owner~~ | ~~Penetratietest opdracht en budget (REC-SEC-004)~~ | ~~MIDDEN~~ | ~~Vóór SP-14~~ | **VERVALLEN — DEC-202: Penetratietest niet blokkerend; optioneel na einde dev-cyclus.** |

---

## 6. Afstemming gewenst met andere teams (ADVISEREND)

| Item | Betrokken team | Reden | Urgentie |
|---|---|---|---|
| API-versioning implementatie | UX/Product | Nieuwe endpoints `/api/v1/` raken frontend API-aanroepen | MIDDEN |
| SSR-migratie (SP-15) | UX-team | Overgang van static export naar SSR heeft ingrijpende frontend-impact | LAAG — lange termijn |
| PostHog EU datacenter bevestiging | Business (DPO) | DPIA-update vereist DPO sign-off | HOOG |

---

## 7. Open items (UNCERTAIN / INSUFFICIENT_DATA)

| ID | Beschrijving | Originating agent | Actie |
|---|---|---|---|
| UNCERTAIN-DEVOPS-001 | ESLint CI-run blokkeert pipeline op exit-code — niet bevestigd | DevOps Analyse | Verifiëren in SP-11 |
| UNCERTAIN-DATA-002 | PostHog EU datacenter locatie onbevestigd | Data Architect | Verifiëren SP-11-003 (1 uur) |
| UNCERTAIN-ARCH-001 | Application Layer abstraction volledigheid — geen meting vóór audit | Software Architect | Baseline meten SP-11 |
| INSUFFICIENT_DATA: team-capaciteit | Team-samenstelling onbekend voor capaciteitsplanning | Sprintplan | Documenteer vóór SP-11 |
| SYS-RISK-002 | Team-compostitieonzekerheid — medium risico | Risk validatie Fase 2 | Documenteren vóór SP-11 |
| SYS-RISK-003 | next@16.1.6 status — UNCERTAIN (latest-next) | Risk validatie Fase 2 | Verifiëren in SP-11 |

---

## 8. Guardrails voor dit team

Uit `docs/fase-2/guardrails.md` — bindend voor alle Implementation Agents:

| ID | Guardrail |
|---|---|
| G-TECH-001 | Geen directe LumioDbContext injectie in controllers — gebruik Application Layer |
| G-TECH-002 | CSP `unsafe-inline` mag niet worden uitgebreid — geen nieuwe inline-script-aanroepen |
| G-TECH-003 | Nieuwe controllers vereisen test-bestand vóór merge |
| G-TECH-004 | ESLint design-token violations mogen niet de baseline 224 overstijgen |
| G-TECH-005 | Masterpassword alleen via `UsePassword()` callback-patroon |
| G-TECH-006 | API versioning `/api/v1/` vereist voor nieuwe endpoints na SP-11 |
| G-TECH-007 | TruffleHog als verplichte PR-gate na SP-11-001 |

Aanvullend vanuit `docs/security/security-handoff-context.md`:
- IMPL-CONSTRAINT-001: Geen uitbreiding van `unsafe-inline` in CSP
- IMPL-CONSTRAINT-002: Inactiviteitsttimer → auto-lock verplicht (SP-12)
- IMPL-CONSTRAINT-003: TruffleHog verplicht als PR-gate
- IMPL-CONSTRAINT-004: Geen new raw DDL SQL in MigratieDbHelper
- IMPL-CONSTRAINT-005: Masterpassword alleen via `UsePassword()` callback
- IMPL-CONSTRAINT-006: Geen BSN/gevoelige PII in log statements
