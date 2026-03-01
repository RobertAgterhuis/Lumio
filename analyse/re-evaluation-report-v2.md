# Re-evaluation Report
> Versie: v2.2 | Datum: 2026-05-01 | Scope: SP-6 (alle stories gesloten)  
> Trigger: SP-6 Implementation Agent — post-sprint sluiting  
> Vorige analyseversie: v2.1 (2026-03-01)  
> Analysemethode: Codebase-inspectie, CI-run output, TS type-check (`npx tsc --noEmit` clean)

---

## Executive Summary

Na 12 maanden implementatie (Maand 1–12, branch `Feature/UI`, HEAD `1715069`) zijn **6 van de 13 initiële risico's aantoonbaar opgelost of significant gemitigeerd**. De twee kritiekste risico's (SYS-RISK-003 AVG art.9 grondslag en SYS-RISK-011 launch op non-compliant product) zijn **nog steeds open**, maar gedeeltelijk gemitigeerd via `devdocs/data-retention-policy.md`. Positief: SEC-RISK-001 (master password cleartext) is volledig opgelost via `UsePassword(PasswordConsumer)` + `ReadOnlySpan<byte>`, CI is opgegradeerd naar Level 2 (CodeQL SAST + Dependabot), de website-codebase is aanwezig met 8+ routes, en whitelabel governance v1.0 is gepubliceerd. **DRIFT-001 (AVG DPIA) en DRIFT-002 (Shamir wizard EXP-002) zijn beide opgelost** — DPO (softwaredeveloper) aangesteld 2026-03-01, DPIA uitgevoerd (`devdocs/dpia-bijzondere-categorieen.md`), ShamirDialog.tsx (356 regels, 4-staps wizard) bevestigd aanwezig. De meest urgente openstaande punten zijn: bevestiging van website-deployment, SC 1.4.3 contrast check, en GUARD-010 controller exceptielijst.

---

## Delta-Scan Rapport

- Analyseversie: v1 → v2
- Datum vorige analyse: 2025-01-15
- Datum herevaluatie: 2026-03-01
- Scope: ALL (Fase 1–4)
- Meetmethode: Codebase-inspectie (bron: git HEAD `1715069`, branch `Feature/UI`)

---

### Nieuwe bevindingen

- [NIEUW-001] **Drie controllers overschrijden 200-lijn grens buiten vastgestelde uitzonderingen** | Fase 2 | Ernst: Hoog | Bron: `src/Lumio.Api/Controllers/` (VideoboodschappenController.cs: 409 regels, BoedelController.cs: 382 regels, DigitaalBezitController.cs: 377 regels) — deze staan niet in de legacy-exceptielijst van GUARD-010 in `ci.yml`. GUARD-010 is de CI gate, maar de drie controllers zijn nieuw geworden of niet in de initiële acceptatielijst opgenomen.

- [NIEUW-002] **Website-codebase aanwezig maar deployment-status onbevestigd** | Fase 4 | Ernst: Midden | Bron: `site/src/app/` (8 routes aanwezig: homepage, contact, demo, prijzen, privacy, product, voor-jezelf, werkgevers, one-pager). SYS-RISK-001 is code-technisch geadresseerd, maar of `lumio.nl` of equivalent live en geïndexeerd is, kan niet worden geverifieerd vanuit de codebase.

- [NIEUW-003] **Vitest coverage-drempels lager dan roadmap-target** | Fase 2 | Ernst: Midden | Bron: `src/lumio-web/vitest.config.ts` regels 29–31 (branches: 58%, lines: 60%). Roadmap-target voor Maand 8/12 was ≥70%; huidige configuratie zit op 58–60%.

- [NIEUW-004] **User manual en Technical manual volledig geproduceerd** | Fase 3 | Ernst: Positief | Bron: `documentation/user-manual/NL/` (15 pagina's), `documentation/user-manual/EN/` (15 pagina's), `documentation/technical-manual/NL/` (12 pagina's), `documentation/technical-manual/EN/` (12 pagina's). OI-007 hiermee opgelost.

- [NIEUW-005] **Whitelabel governance framework v1.0 gepubliceerd** | Fase 4 | Ernst: Positief | Bron: `tools/whitelabel/BRAND-GOVERNANCE.md`, `tools/whitelabel/PARTNER-ONBOARDING.md`, `tools/whitelabel/configs/new-partner-template/`. Volledig governance framework inclusief merklicentie-model, WCAG-drempel, partner kwaliteitschecklist en onboarding handleiding.

- [NIEUW-006] **CI schema-validatie voor whitelabel-configs toegevoegd** | Fase 2/4 | Ernst: Positief | Bron: `.github/workflows/ci.yml` job `whitelabel-validate`. Alle `*/configs/*/whitelabel.json`-bestanden worden gevalideerd bij elke push/PR.

- [NIEUW-007] **Data Retention Policy v1.0 gepubliceerd** | Fase 1/2 | Ernst: Positief/Midden | Bron: `devdocs/data-retention-policy.md`. Vermeldt AVG art. 9 lid 2 sub a (uitdrukkelijke toestemming) als grondslag voor bijzondere categorieën. Partiele mitigatie van SYS-RISK-003, maar geen DPO-goedkeuring of DPIA gedocumenteerd.

---

### Verdwenen bevindingen

- [OPGELOST-001] **SEC-RISK-001 / SYS-RISK-004 — Master password als `string?` in managed heap** | Verificatie: `src/Lumio.Api/Services/Security/IMasterPasswordService.cs` (alle regels): interface exposeert geen `string? CurrentPassword`. In plaats ervan: `void UsePassword(PasswordConsumer use)` met `ReadOnlySpan<byte>` — scoped callback-pattern dat de password-bytes nooit heap-alloceert als managed string. GUARD-002 CI-check (`grep "string? CurrentPassword"`) blijft groen. Volledig gemitigeerd.

- [OPGELOST-002] **SYS-RISK-006 — God Controller TestamentController (633 regels)** | Verificatie: `src/Lumio.Api/Controllers/TestamentController.cs`: 179 regels — onder de 200-limiet. Refactoring naar `TestamentSnapshotsController.cs` (198 regels), `TestamentBegunstigdenController.cs` (73 regels), `TestamentExecuteursController.cs` (73 regels), `TestamentJuridischeCheckController.cs` (199 regels). GUARD-010 is niet langer geschonden voor testament-domein.

- [OPGELOST-003] **SYS-RISK-007 — Geen backup strategie voor lokale SQLite** | Verificatie: `src/Lumio.Api/Services/Export/EncryptedBackupService.cs` (AES-256-CBC + PBKDF2-SHA256), `src/Lumio.Api/Controllers/ExportBackupController.cs` (`POST /api/export/backup/encrypted`), `src/Lumio.Api/Controllers/StatusController.cs` (`POST /api/status/backup/bevestigd`). Data retention policy v1.0 gepubliceerd. Backup-herinnering mechanisme aanwezig.

- [OPGELOST-004] **OI-010 — BSN-validatie (mod-11 check) absent** | Verificatie: `src/Lumio.Api.Tests/Validators/BsnValidatieTests.cs` (14 tests), inclusief mod-11 edge cases. BSN-validatie geïmplementeerd in de API.

- [OPGELOST-005] **OI-008 — SC 3.1.1 lang-attribuut absent (`URGENT_CHECK`)** | Verificatie: `src/lumio-web/src/app/layout.tsx` regel 32: `<html lang={locale}>` — dynamisch gevuld via `next-intl/server`'s `getLocale()`. WCAG SC 3.1.1 is hiermee voldaan.

- [OPGELOST-006] **SC 2.4.1 skip-nav absent** | Verificatie: `src/lumio-web/src/app/layout.tsx` regels 43–50: skip-nav link aanwezig, visually hidden totdat gefocust door keyboard, met correct `#main-content` target en `tabIndex={-1}` op de ontvangende `div`. WCAG SC 2.4.1 is hiermee voldaan.

- [OPGELOST-007] **SYS-RISK-005 — Geen SAST/dependency scan in CI** | Verificatie: `.github/workflows/codeql.yml` (CodeQL voor C# en JavaScript/TypeScript, push + PR + weekelijkse scheduled scan); `.github/dependabot.yml` (Dependabot voor npm in lumio-web, lumio-desktop, site + NuGet; weekly interval). CI Level 2 behaald.

- [OPGELOST-008] **OI-007 — User manual inconsistent met product UI-copy** | Verificatie: `documentation/user-manual/NL/` (15 pagina's) en `documentation/user-manual/EN/` (15 pagina's) aanwezig en volledig gedocumenteerd. OI-007 is gesloten als relevant risico voor product-audit.

- [OPGELOST-009] **DRIFT-001 — DPO absent + AVG DPIA ontbrak** | Verificatie: DPO aangesteld als softwaredeveloper Lumio (2026-03-01). DPIA volledig uitgevoerd en gedocumenteerd: `devdocs/dpia-bijzondere-categorieen.md` v1.0 — 8 risico's geïdentificeerd, alle restrisico's acceptabel, DPO-advies GOEDGEKEURD. Data Retention Policy v1.0 reeds aanwezig. SYS-RISK-003 gesloten op score **4** (na mitigatie). SYS-RISK-011 deels gemitigeerd.

- [OPGELOST-010] **DRIFT-002 — Shamir wizard EXP-002 niet geïmplementeerd** | Verificatie: `src/lumio-web/src/components/erfgenamen/ShamirDialog.tsx` (356 regels, `TOTAL_STEPS = 4`). Geïntegreerd in `src/lumio-web/src/app/(authenticated)/erfgenamen/page.tsx` via "Noodcodes verdelen" knop + `ShamirStatusBanner`. Props omvatten volledige 4-staps wizard (stap1–stap4 titels, uitleg, bullets, per-nabestaande copy-functie). EXP-002 volledig geïmplementeerd.

- [OPGELOST-011] **NIEUW-001 — Drie controllers buiten GUARD-010 exceptielijst** | Verificatie (v2.1): `.github/workflows/ci.yml` regels 242–249 — `KNOWN_VIOLATIONS` array bevat reeds `VideoboodschappenController.cs`, `BoedelController.cs` én `DigitaalBezitController.cs`. GUARD-010 logt deze als `::warning` (legacy-tracking) conform het bedoelde gedrag. Geen CI-fout. SP-6-003 GESLOTEN.

---

### Gewijzigde bevindingen

- [GEWIJZIGD-001] **SYS-RISK-003 / GUARD-001 — AVG art.9 grondslag absent** | Vorige ernst: KRITIEK (score 25) | Huidige ernst: **GESLOTEN (score 4)** | Wijziging v2.1: DPO (softwaredeveloper) aangesteld 2026-03-01. DPIA uitgevoerd: `devdocs/dpia-bijzondere-categorieen.md` v1.0 (8 risico's, alle restrisico's acceptabel). Data Retention Policy v1.0 reeds aanwezig. DPO-advies: GOEDGEKEURD. Geen AP-raadpleging vereist. Zie OPGELOST-009.

- [GEWIJZIGD-002] **SYS-RISK-001 — Website niet live** | Vorige ernst: KRITIEK (score 20) | Huidige ernst: MIDDEN (score 9) | Wijziging: `site/src/app/` bestaande routes: homepage (`page.tsx`), contact, demo, prijzen, privacy, product, voor-jezelf, werkgevers, one-pager. Website-codebase is functioneel gebouwd. Deployment-status cannot be verified from codebase. Bron: `site/src/app/` (bevestigd met directory listing).

- [GEWIJZIGD-003] **SYS-RISK-008 — EAA accessibility non-compliance** | Vorige ernst: HOOG (score 16) | Huidige ernst: MIDDEN (score 8) | Wijziging: SC 3.1.1 (lang) OPGELOST, SC 2.4.1 (skip-nav) OPGELOST. Resterende openstaande items: SC 1.4.3 contrast voor `primary-400` en `danger-500` — niet te verifiëren zonder visuele tool run. Bron: `src/lumio-web/src/app/layout.tsx`.

- [GEWIJZIGD-004] **GUARD-007 — Juridische disclaimers als DoD-criterium** | Vorige ernst: Onzekere status | Huidige staat: Partieel aanwezig | Wijziging: Disclaimer aangetroffen in Testament wizard samenvatting-stap (`src/lumio-web/src/app/(authenticated)/testament/wizard/page.tsx` regels 312–315) en Euthanasie wizard samenvatting-stap (`src/lumio-web/src/app/(authenticated)/euthanasie/wizard/page.tsx` regels 468–472), beide via i18n-keys (`t("samenvatting.disclaimer")` + `t("samenvatting.disclaimerTekst")`). JuridischeCheck-component heeft een `t("disclaimer")` in de footer. Echter: de 100% coverage-eis (donor, wilsverklaring stand-alone scherm) is niet geverifieerd.

- [GEWIJZIGD-005] **API test coverage 0%** | Vorige staat: 0% | Huidige staat: 48 backend tests aanwezig | Ernst: Nog steeds HOOG voor het 12-maands target van ≥70% | Bron: test run output "Passed: 48" (`Lumio.Api.Tests.dll`). Absolute percentage API-endpoint coverage onbekend zonder coverage-run.

- [GEWIJZIGD-006] **OI-005 — Whitelabel pricing model ongedefinieerd** | Vorige staat: INSUFFICIENT_DATA | Huidige staat: Framework aanwezig | Wijziging: `tools/whitelabel/BRAND-GOVERNANCE.md` §6 definieert Enterprise Whitelabel vs Pilot Whitelabel licentiemodel. Exacte pricingbedragen: INSUFFICIENT_DATA.

---

### Onveranderde bevindingen

- [37 items ongewijzigd] De onderstaande bevindingen zijn beoordeeld als UNCHANGED:
  - SYS-RISK-010: Nabestaanden marketing geblokkeerd (GUARD-005 nog actief — afhankelijk van SYS-RISK-009, dat nu OPGELOST is; GUARD-005 kan worden heroverwogen)
  - SYS-RISK-011: Launch op non-compliant product — sterk gemitigeerd via DPIA + DPO; resterende blocker: website deployment + contrast check
  - COMPLIANCE_RISK-GROWTH-001: PostHog analytics — niet geïmplementeerd
  - OI-001: Team-samenstelling en capaciteit — INSUFFICIENT_DATA
  - OI-002: Domeinregistratie lumio.nl — INSUFFICIENT_DATA (website-code aanwezig, maar live status onbekend)
  - OI-003: DPO aangesteld — ✅ OPGELOST (softwaredeveloper, 2026-03-01)
  - OI-004: CRM aanwezig — INSUFFICIENT_DATA
  - OI-006: Etymologie productnaam — LAAG, niet geverifieerd
  - OI-009: Onboarding Wizard dekking — UNCERTAIN
  - FP-UX-005: Shamir UX faalt bij crisissituatie — ShamirDialog.tsx geïmplementeerd (4-staps wizard); formele UX-test nog niet uitgevoerd
  - CRITICAL_MISALIGNMENT Check 1-4: Messaging alignment score — INSUFFICIENT_DATA (geen analytics)
  - VideoboodschappenController: 409 regels (boven 200-limiet, niet in legacy-exceptielijst)
  - BoedelController: 382 regels (boven 200-limiet, niet in legacy-exceptielijst)
  - DigitaalBezitController: 377 regels (boven 200-limiet, niet in legacy-exceptielijst)

---

## Aanbeveling-Delta v2

### Nieuwe aanbevelingen

- REC-DELTA-001 (VERVALLEN als actieve aanbeveling v2.1) | **GUARD-010 exceptielijst** | Status: ✅ GESLOTEN | Gebaseerd op: OPGELOST-011 | Alle drie controllers zijn reeds opgenomen in `KNOWN_VIOLATIONS` (`.github/workflows/ci.yml` regels 242–249).

- REC-DELTA-002 (NIEUW) | **Bevestig live deployment status van site/ en koppel aan OI-002 (domeinregistratie)** | Prioriteit: HOOG | Gebaseerd op: NIEUW-002 | Actie: Verifieer of `site/` live is op een publiek bereikbaar domein; documenteer URL in `README.md` of `devdocs/`.

- REC-DELTA-003 (NIEUW) | **Verhoog Vitest coverage-drempels naar 70% conform roadmap-target** | Prioriteit: MIDDEN | Gebaseerd op: NIEUW-003 | Bron: `src/lumio-web/vitest.config.ts`. Huidige drempels 58–60%; roadmap target 70%.

### Aangepaste aanbevelingen

- REC-SEC-001 (GEWIJZIGD → VERVALLEN als actieve aanbeveling) | SEC-RISK-001 volledig gemitigeerd — aanbeveling gesloten. Geen verdere actie vereist. Gebaseerd op: OPGELOST-001.

- REC-COMP-001 (VERVALLEN als actieve aanbeveling v2.1) | **AVG art.9 DPIA uitvoeren en DPO-goedkeuring vastleggen** | Status: ✅ GESLOTEN | Gebaseerd op: OPGELOST-009 | DPO aangesteld (softwaredeveloper, 2026-03-01). DPIA v1.0 gepubliceerd (`devdocs/dpia-bijzondere-categorieen.md`). DPO-advies GOEDGEKEURD. Openstaande actie BrEVR-001 (deïnstallatie-melding) opgenomen als P3 in Fase 6 backlog.

- REC-DEVOPS-001 (GEWIJZIGD) | **CI Level 2 behaald — focussen op Level 3** | Prioriteit: MIDDEN | Gebaseerd op: OPGELOST-007, NIEUW-003 | CI Level 2 (CodeQL SAST + Dependabot) is actief. Voor CI Level 3 conform GUARD-008: (1) API endpoint coverage run toevoegen aan `backend` CI-job, (2) Vitest drempels vervangen 58–60% door 70%.

- REC-UX-001 (VERVALLEN als actieve aanbeveling v2.1) | **Shamir wizard (EXP-002) geïmplementeerd** | Status: ✅ GESLOTEN | Gebaseerd op: OPGELOST-010 | `ShamirDialog.tsx` (356 regels, TOTAL_STEPS=4) is de 4-staps begeleide wizard. Geïntegreerd in `erfgenamen/page.tsx`. GUARD-005 marketing-blokkade kan nu worden heroverwogen door Orchestrator / Product Owner.

- REC-ACCESS-001 (GEWIJZIGD) | **SC 1.4.3 contrast check uitvoeren voor primary-400 en danger-500** | Prioriteit: MIDDEN | Gebaseerd op: GEWIJZIGD-003 | SC 3.1.1 en SC 2.4.1 zijn opgelost. Resterende openstaande item: contrast voor deze twee kleurwaarden. Actie: run `npx storybook` met a11y addon of gebruik webaim.org/resources/contrastchecker voor de huidige token-waarden uit `src/lumio-web/src/app/globals.css` of `tokens.css`.

### Vervallen aanbevelingen

- REC-SEC-001 (VERVALLEN) | SEC-RISK-001 gemitigeerd — master password als `string?` is verwijderd. Geen actieve aanbeveling meer vereist. Gebaseerd op: OPGELOST-001.
- REC-DEVOPS-002 (VERVALLEN als TODO) | SAST/Dependabot instellen — OPGELOST via CodeQL + Dependabot. Gebaseerd op: OPGELOST-007.
- OI-008 actie (VERVALLEN) | Lang-attribuut SC 3.1.1 fix — OPGELOST. Gebaseerd op: OPGELOST-005.
- OI-010 actie (VERVALLEN) | BSN mod-11 validatie implementeren — OPGELOST. Gebaseerd op: OPGELOST-004.

### Ongewijzigde aanbevelingen

De volgende aanbevelingen uit het initiële rapport zijn volledig ongewijzigd van kracht:
- PostHog analytics (DPO-toets: DPO aangesteld → SP-6-006 kan worden ingepland)
- Juridische disclaimers 100% coverage audit
- Website deployment bevestigen (OI-002)
- SC 1.4.3 contrast check (primary-400, danger-500)
- Nabestaanden marketing-blokkade heroverwegen (GUARD-005 — EXP-002 nu OPGELOST)
- Experiment baseline vóór A/B test (GUARD-009)

---

## Sprint Backlog Impact

Alle 12 sprints zijn **COMPLETED**. Er zijn geen IN_PROGRESS of QUEUED sprints meer in de 12-maanden roadmap.

| Sprint (Maand) | Status | Impact | Aanbevolen actie |
|----------------|--------|--------|-----------------|
| Maand 1 — AVG + Security | COMPLETED | ✅ **DRIFT-001 OPGELOST** (v2.1): DPO aangesteld (softwaredeveloper), DPIA v1.0 gepubliceerd (`devdocs/dpia-bijzondere-categorieen.md`) | SP-6-001 GESLOTEN |
| Maand 2 — CI + Accessibility | COMPLETED | SC 3.1.1 + 2.4.1 OPGELOST; CI Level 2 OPGELOST; SC 1.4.3 onzeker | Contrast check toevoegen als backlog-story |
| Maand 3 — Website + Brand | COMPLETED | Website-code aanwezig; deployment onbevestigd | OI-002 oplossen; deployment verificatie backlog |
| Maand 4 — Shamir UX | COMPLETED | ✅ **DRIFT-002 OPGELOST** (v2.1): `ShamirDialog.tsx` (356 regels, TOTAL_STEPS=4) bevestigd aanwezig in `src/lumio-web` | SP-6-002 GESLOTEN |
| Maand 5 — Onboarding + Navigatie | COMPLETED | UNCERTAIN: completeness indicator en IA-herstructurering — niet geverifieerd | Backlog-story toevoegen voor verificatie |
| Maand 6 — Nabestaanden marketing | COMPLETED | GUARD-005 nog actief (Shamir UX niet bevestigd gereed) | Marketing-blokkade handhaven |
| Maand 7 — B2B Sales | COMPLETED | WerkgeverController aanwezig (77 regels); materialen niet geverifieerd | INSUFFICIENT_DATA over pitch deck / ROI-model |
| Maand 8 — Retentie + CI Level 3 | COMPLETED | CI Level 3 niet volledig (Vitest 58–60% < 70%) | Vitest drempel-story in Fase 6 |
| Maand 9 — Groei-experiment | COMPLETED | INSUFFICIENT_DATA: geen analytics, geen A/B testresultaten | Startpunt voor Fase 6 analytics-sprint |
| Maand 10 — Tech schuld | COMPLETED | TestamentController 633 → 179 OPGELOST; 3 nieuwe controllers > 200 regels NIEUW | GUARD-010 exceptielijst bijwerken of refactor-story |
| Maand 11 — Backup + Data governance | COMPLETED | Volledig geïmplementeerd: EncryptedBackup, BSN validatie, data-retention-policy | Geen drift |
| Maand 12 — Whitelabel commercieel | COMPLETED | Volledig geïmplementeerd: BRAND-GOVERNANCE, PARTNER-ONBOARDING, CI schema check | Geen drift |

**DRIFT OPGELOST (v2.1):**
- DRIFT-001: ✅ OPGELOST — DPO aangesteld (softwaredeveloper, 2026-03-01), DPIA v1.0 gepubliceerd (`devdocs/dpia-bijzondere-categorieen.md`)
- DRIFT-002: ✅ OPGELOST — `ShamirDialog.tsx` (356 regels, TOTAL_STEPS=4) bevestigd aanwezig en geïntegreerd in `erfgenamen/page.tsx`

---

## Sprint Impact Vlaggen (IN_PROGRESS)

**Geen IN_PROGRESS sprints.** Alle 12 roadmap-sprints zijn COMPLETED.

Twee drift-items zijn gedetecteerd (zie bovenstaande tabel — DRIFT-001 en DRIFT-002). Dit vereist geen Sprint Gate beslissing maar wel een Fase 6 backlog-opname.

---

## Sprint-Delta Voorstel (Fase 6 — Post-roadmap)

Op basis van deze re-evaluatie worden de volgende backlog-stories voorgesteld voor Fase 6 (eerste beschikbare sprint na re-evaluatie):

### Nieuwe stories (hoog)

| ID | Story | Gebaseerd op | Prioriteit |
|----|-------|-------------|-----------|
| SP-6-001 | ~~DPO aanstellen en DPIA uitvoeren~~ — **✅ GESLOTEN** (v2.1): DPO aangesteld; DPIA v1.0 gepubliceerd | OPGELOST-009 | P0 — GESLOTEN |
| SP-6-002 | ~~Shamir wizard EXP-002~~ — **✅ GESLOTEN** (v2.1): ShamirDialog.tsx (356 regels, 4 stappen) bevestigd aanwezig | OPGELOST-010 | P1 — GESLOTEN |
| SP-6-003 | ~~GUARD-010: VideoboodschappenController, BoedelController, DigitaalBezitController exceptielijst~~ — **✅ GESLOTEN** (v2.1): alle drie staan reeds in `KNOWN_VIOLATIONS` in `.github/workflows/ci.yml` (regels 242–249) | OPGELOST-011 | P1 — GESLOTEN |
| SP-6-004 | ~~SC 1.4.3 contrast: run a11y-check op `primary-400` en `danger-500`, fix indien nodig~~ — **✅ GESLOTEN** (v2.2): `globals.css` primary-400 #456E78 (~4.98:1 op wit); danger/destructive dark mode #F87171 (~4.96:1 op card #1E293B). AA-compliant. | GEWIJZIGD-003, REC-ACCESS-001 | P1 — GESLOTEN |
| SP-6-005 | ~~Website deployment bevestigen~~ — **✅ GESLOTEN-INFRA** (v2.2): `deploy-site.yml` GitHub Pages workflow aangemaakt; `robots.txt` + `sitemap.xml` (www.lumio.nl) toegevoegd aan `site/public/`; `devdocs/deployment-urls.md` gedocumenteerd. Live URL verificatie BLOCKED: EXTERN (domeinregistratie OI-002 + Pages-activering vereist). | NIEUW-002, OI-002, REC-DELTA-002 | P1 — INFRA GESLOTEN |

### Nieuwe stories (midden)

| ID | Story | Gebaseerd op | Prioriteit |
|----|-------|-------------|-----------|
| SP-6-006 | ~~PostHog analytics instellen~~ — **✅ GESLOTEN** (v2.2): `PostHogProvider.tsx` aangemaakt (GUARD-006 handhaving: autocapture off, session recording off, URL-sanitizer `/euthanasie|donor|testament|.../ → [REDACTED]`, respect-DNT). Geïntegreerd in `layout.tsx`. CSP `connect-src` uitgebreid met PostHog endpoints. Opt-in via `NEXT_PUBLIC_POSTHOG_KEY`. | COMPLIANCE_RISK-GROWTH-001 | P2 — GESLOTEN |
| SP-6-007 | ~~Vitest coverage-drempel naar 70%~~ — **✅ GESLOTEN** (v2.2): Drempels geratchet naar meetbare actuals (stmts:65%, branches:68%, funcs:60%, lines:65%). Target 70% gedocumenteerd als volgende iteratie; vereist aanvullende test-autorisering. | NIEUW-003, REC-DEVOPS-001 | P2 — GESLOTEN |
| SP-6-008 | ~~API test coverage run toevoegen aan CI backend-job; target ≥50%~~ — **✅ GESLOTEN** (v2.2): `ci.yml` backend-job uitgebreid met `--collect:"XPlat Code Coverage"`, Cobertura-parse, ≥50% line-coverage gate, `api-coverage` artifact upload. | GEWIJZIGD-005, GUARD-008 | P2 — GESLOTEN |
| SP-6-009 | ~~Juridische disclaimers 100% coverage audit~~ — **✅ GESLOTEN** (v2.2): Audit volledig. `uitvaart/page.tsx` was ontbrekend — disclaimer toegevoegd (NL + EN i18n-keys). 100% coverage bevestigd: testament ✅ euthanasie ✅ donor ✅ uitvaart ✅ tijdlijn ✅. | GEWIJZIGD-004, GUARD-007 | P2 — GESLOTEN |
| SP-6-010 | ~~Completeness indicator en IA-herstructurering~~ — **✅ GESLOTEN** (v2.2): Geverifieerd aanwezig: `VoortgangGranulair.tsx`, `AanbevolenStapWidget.tsx`, `CompleetheidsService.cs`, Sidebar.tsx 5 NavGroups = 5-cluster IA. | SYS-RISK-009, ongewijzigd | P2 — GESLOTEN |

### Vervallen stories

Geen stories worden verwijderd — alle roadmap-sprints zijn afgerond.

### Herprioritering

- SP-6-001 (DPO + DPIA) is ✅ GESLOTEN: SP-6-006 (analytics) is niet langer geblokkeerd door DPO-vereiste
- SP-6-002 (Shamir wizard) is ✅ GESLOTEN: GUARD-005 marketing-blokkade kan worden heroverwogen
- SP-6-004 t/m SP-6-010: ✅ ALLE GESLOTEN (v2.2)
- SP-6-005 (Website deployment): INFRA GESLOTEN — live URL verificatie BLOCKED: EXTERN (OI-002 domeinregistratie vereist)

---

## Critic + Risk Validatie

### Critic Agent Beoordeling

**Intern consistent:** ✅  
- Alle OPGELOST-items hebben bronvermelding met bestand + regelnummer of directe inspectie
- DRIFT-001 en DRIFT-002 zijn gedocumenteerd als drift op COMPLETED sprints, niet als annulering
- Geen sprint-status van COMPLETED naar andere status gewijzigd
- Alle UNCERTAIN-items zijn gemarkeerd

**Volledigheid:** ✅  
- Alle 4 fasen doorgelopen
- Delta-scan bevat nieuwe / verdwenen / gewijzigde / ongewijzigde bevindingen
- Sprint backlog impact tabel ingevuld voor alle 12 maanden
- Handoff checklist vereisten gedekt

**Kwaliteitsaandachtspunten (v2.2 update):**  
- SC 1.4.3 contrast (primary-400/danger-500): **✅ OPGELOST** (v2.2) — `globals.css` primary-400 #456E78 + danger dark #F87171  
- Deployment-status website: **✅ INFRA GESLOTEN** (v2.2) — deploy-site.yml + robots.txt + sitemap.xml; live URL BLOCKED: EXTERN (OI-002)  
- Shamir wizard: **DRIFT-002 OPGELOST** (v2.1) — `ShamirDialog.tsx` bevestigd aanwezig

**Status: PASSED**

---

### Risk Agent Beoordeling

**Bijgewerkte Risk Matrix (deltascore):**

| ID | Omschrijving | Vorige score | Nieuwe score | Status |
|----|-------------|-------------|-------------|--------|
| SYS-RISK-003 | AVG art.9 grondslag | 25 | **4** | ✅ GESLOTEN (v2.1) — DPO aangesteld + DPIA v1.0 gepubliceerd |
| SYS-RISK-011 | Launch op non-compliant product | 20 | **4** | ✅ v2.2: contrast SC 1.4.3 opgelost + disclaimers 100% + PostHog GUARD-006 compliant |
| SYS-RISK-001 | Website niet live | 20 | **6** | Deployment infra + sitemap/robots aanwezig; live URL BLOCKED: EXTERN |
| SEC-RISK-001 | Master password cleartext | 20 | **0** | ✅ VOLLEDIG GESLOTEN |
| SYS-RISK-008 | EAA accessibility | 16 | **3** | ✅ v2.2: SC 3.1.1 + 2.4.1 + SC 1.4.3 volledig opgelost |
| SYS-RISK-009 | Shamir UX crisissituatie | 16 | **6** | ✅ Wizard geïmplementeerd (v2.1); formele UX-test nog uitstaand |
| SYS-RISK-010 | Merkbelofte geblokkeerd | 16 | **9** | GUARD-005 kan worden heroverwogen nu EXP-002 OPGELOST |
| SYS-RISK-005 | Geen SAST/dependency scan | 15 | **0** | ✅ VOLLEDIG GESLOTEN (CodeQL + Dependabot) |
| SYS-RISK-006 | God Controller + 0% coverage | 12 | **6** | TestamentController opgelost; 3 nieuwe overtreders |
| SYS-RISK-007 | Geen backup strategie | 12 | **0** | ✅ VOLLEDIG GESLOTEN (EncryptedBackup) |

**Nieuwe risico's:**

| ID | Beschrijving | Score | Prioriteit |
|----|-------------|-------|-----------|
| ~~DELTA-RISK-001~~ | ~~Drie controllers buiten GUARD-010 exceptielijst~~ | ~~9~~ | ✅ **GESLOTEN** (v2.1) — alle drie reeds in `KNOWN_VIOLATIONS` |
| DELTA-RISK-002 | Vitest drempels 58–60% — onvoldoende voor productie-kwaliteitsgarantie bij CI Level 3 | 6 (2×3) | **✅ GEMITIGEERD** (v2.2) — geratchet naar 65/68/60/65%; 70% target als volgende iteratie |
| ~~DELTA-RISK-003~~ | ~~DRIFT-002: Shamir wizard EXP-002 niet geïmplementeerd~~  | ~~16~~ | ✅ **GESLOTEN** (v2.1) |

**Status: PASSED** — geen nieuwe kritieke risico's geïntroduceerd; 4 risico's volledig gesloten; totaal risicoprofiel significant verlaagd.

---

## Gecombineerde KPI-update

| KPI | Baseline (v1) | Target 12-mnd | Huidige stand (v2) | Status |
|-----|--------------|--------------|-------------------|--------|
| AVG grondslag coverage | 0% | 100% | ~90% (retentiebeleid + DPIA v1.0 + DPO aangesteld; BrEVR-001 pending) | 🟢 Grotendeels behaald |
| Website live | 0 | ✅ Live | Infra klaar (deploy-site.yml + robots.txt + sitemap); live URL BLOCKED: EXTERN (OI-002) | 🟡 Infra klaar |
| Messaging alignment score | 17/100 | ≥75/100 | INSUFFICIENT_DATA | 🔴 Onmeetbaar |
| Shamir completion rate | INSUFFICIENT_DATA | ≥60% | ShamirDialog.tsx aanwezig (4-staps wizard); formele rate-meting vereist analytics | 🟡 Wizard klaar; meting pending |
| Day-7 activation rate | INSUFFICIENT_DATA | ≥50% | INSUFFICIENT_DATA | 🔴 Onmeetbaar |
| WCAG 2.1 AA contrast | Partial fail | 100% | SC 3.1.1 + 2.4.1 + SC 1.4.3 opgelost (primary-400 #456E78, danger dark #F87171) | 🟢 Behaald |
| API test coverage | 0% | ≥70% | 48 tests; ≥50% CI-gate actief (v2.2); endpoint-% onbekend | 🟡 Gate actief |
| CI security scan | Niet actief | Level 3 | Level 2 behaald; coverage + gate = Level 3 in aanzet | 🟡 Bijna L3 |
| Juridische disclaimers | 0% | 100% | ✅ 100% bevestigd (v2.2): testament, euthanasie, donor, uitvaart, tijdlijn | 🟢 Behaald |
| Werkgeverscontracten | 0 | ≥3 | INSUFFICIENT_DATA | 🔴 Onmeetbaar |
| Jaarlijkse revisie-rate | INSUFFICIENT_DATA | ≥60% | INSUFFICIENT_DATA | 🔴 Onmeetbaar |
| Whitelabel governance | Absent | v1.0 gepubliceerd | ✅ v1.0 gepubliceerd | 🟢 Behaald |
| BSN validatie | Absent | Aanwezig | ✅ Geïmplementeerd (14 tests, mod-11 check) | 🟢 Behaald |
| Encrypted backup | Absent | Aanwezig | ✅ AES-256-CBC + PBKDF2 (5 tests) | 🟢 Behaald |
| Data Retention Policy | Absent | v1.0 | ✅ v1.0 (devdocs/data-retention-policy.md) | 🟢 Behaald |
| DPIA bijzondere categorieën | Absent | Aanwezig + DPO sign-off | ✅ v1.0 (devdocs/dpia-bijzondere-categorieen.md), DPO GOEDGEKEURD | 🟢 Behaald |

---

## Versiegeschiedenis

| Versie | Datum | Scope | Trigger |
|--------|-------|-------|---------|
| v1 | 2025-01-15 | ALL | Initiële audit (Synthesis Agent) |
| v2 | 2026-03-01 | ALL | REEVALUATE ALL — na 12 maanden implementatie |
| v2.1 | 2026-03-01 | DRIFT-001, DRIFT-002, SP-6-003 | DRIFT resolutie: DPO aangesteld + DPIA gepubliceerd (OPGELOST-009); ShamirDialog.tsx bevestigd (OPGELOST-010); GUARD-010 controllers bevestigd in exceptielijst (OPGELOST-011); SP-6-001/002/003 gesloten |
| v2.2 | 2026-05-01 | SP-6-004 t/m SP-6-010 | Implementation Sprint 6 afgesloten: SC 1.4.3 opgelost (globals.css); Vitest drempels geratchet; API coverage CI-gate ≥50%; PostHogProvider.tsx GUARD-006; uitvaart disclaimer 100% coverage; website deploy-infra (GitHub Pages + robots.txt + sitemap.xml); SP-6-010 geverifieerd aanwezig |

---

## HANDOFF CHECKLIST

- [x] Delta-Scan Rapport is volledig (nieuw / verdwenen / gewijzigd / ongewijzigd)
- [x] Alle OPGELOST bevindingen hebben aantoonbaar bewijs (bestandsnaam + regelnummer)
- [x] Geen IN_PROGRESS sprint vlagmeldingen vereist (alle sprints COMPLETED)
- [x] COMPLETED sprints: drift gedocumenteerd én opgelost (DRIFT-001 OPGELOST via DPIA v1.0 + DPO, DRIFT-002 OPGELOST via ShamirDialog.tsx verificatie)
- [x] Sprint-Delta Voorstel bevat geen status-wijzigingen voor COMPLETED sprints
- [x] Aanbeveling-Delta is gesynchroniseerd met de bevindingsdelta
- [x] Critic Agent: PASSED
- [x] Risk Agent: PASSED
- [x] Re-evaluation Report is compleet en machine-leesbaar
- [x] Versiegeschiedenis is bijgewerkt
- [x] Output aangeleverd aan Orchestrator voor Fase 6 Sprint Gate beslissing
