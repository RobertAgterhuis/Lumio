# Sprintplan – Fase 2 Techniek & Architectuur – 2026-03-02

## Metadata
- Fase: 2
- Gebaseerd op aanbevelingen: `docs/fase-2/05-software-architect-aanbevelingen.md`, `docs/fase-2/06-senior-developer-aanbevelingen.md`, `docs/fase-2/07-devops-engineer-aanbevelingen.md`, `docs/fase-2/08-security-architect-aanbevelingen.md`, `docs/fase-2/09-data-architect-aanbevelingen.md`
- Datum: 2026-03-02
- Huidige sprint op mainline: SP-10 (feature/SP-10-COR-001-002-shamir-drempel-fix)
- Totale scope: SP-11 t/m SP-15 (5 sprints) — SP-14/15 gesplitst na Risk Agent SYS-RISK-001 mitigatie

---

## Aannames

- **Team samenstelling:** `INSUFFICIENT_DATA:` — geen teamsamenstelling aangeleverd in onboarding
- **Capaciteit:** `INSUFFICIENT_DATA:` — als proxy: geschatte uren per story op basis van complexiteit
- **Sprint duur:** 2 weken
- **Stack:** .NET 10, Next.js 16, TypeScript 5.9, SQLite/SQLCipher, GitHub Actions
- **Randvoorwaarden vóór SP-11:**
  - SP-10 shamir-drempel-fix gemerged naar main
  - CI groen op main
  - ~~EV Code Signing Certificate aangevraagd~~ (UITGESTELD — DEC-201)

---

## Sprint SP-11 – Beveiligingsfundament & CI Hygiene

### Doel
Alle kritieke P1-beveiligings- en CI-kwetsbaarheden verholpen. TruffleHog actief, PostHog EU geverifieerd, API versioning ingevoerd. Code signing (EV-cert) is UITGESTELD buiten sprint (DEC-201).

### Stories

| Story ID | Beschrijving | Type | Team | Acceptatiecriteria | Story Points | Afhankelijkheden | Blocker | Risico |
|----------|-------------|------|------|-------------------|--------------|-----------------|---------|--------|
| SP-11-001 | TruffleHog GitHub Action toevoegen aan `ci.yml` als blokkerende CI-stap | INFRA | Dev | CI job `secret-scan` aanwezig; PR naar main faalt bij detectie geverifieerd secrets | 1 | Geen | NONE | Laag |
| ~~SP-11-002~~ | ~~Code signing configureren via EV-certificaat secrets in GitHub Actions~~ | INFRA | Dev | **UITGESTELD — DEC-201.** Story is verplaatst buiten de actieve sprint. EV-certificaat aanvraag is uitgesteld totdat development team gereed is (niet blokkerend). Oppakken buiten reguliere sprint-cyclus. | 3 | EV-certificaat aangeschaft | **UITGESTELD: DEC-201 (eigenaar: product owner; niet blokkerend voor andere sprints)** | Laag |
| SP-11-003 | PostHog datacenter regio verifiëren + evt. migreren naar EU-endpoint | ANALYSIS + CODE | Dev | PostHog host geconfigureerd op `eu.i.posthog.com`; of SCC-grondslag gedocumenteerd in DPIA | 1 | Geen | NONE | Laag |
| SP-11-004 | API versioning invoeren: alle routes prefixen met `/api/v1/` | CODE | Dev | Alle 34 controllers via `/api/v1/` bereikbaar; frontend `api-client.ts` bijgewerkt; E2E tests groen | 5 | Geen | NONE | Midden — frontend + backend sync vereist |
| SP-11-005 | Controller-tests batch 1: auth, setup/unlock, shamir endpoints (≥5 controllers) | CODE | Dev | ≥5 nieuwe controller testbestanden aanwezig; CI backend test-job groen | 5 | Geen | NONE | Laag |

### Parallel Tracks SP-11

| Track | Type | Stories | Team | Startvoorwaarde |
|-------|------|---------|------|----------------|
| Track 1 (Code) | CODE | SP-11-004, SP-11-005 | Dev | SP-11 start |
| Track 2 (Infra) | INFRA | SP-11-001 | Dev | SP-11 start (SP-11-002 UITGESTELD — DEC-201) |
| Track 3 (Analysis+Code) | ANALYSIS | SP-11-003 | Dev | SP-11 start, ≤1 uur |

### Blocker Register SP-11

| Blocker ID | Type | Omschrijving | Eigenaar | Verwachte Oplossing | Escalatie als niet opgelost voor |
|------------|------|-------------|---------|--------------------|---------------------------------|
| ~~BLK-11-001~~ | VERVALLEN | EV Code Signing Certificate (UITGESTELD — DEC-201) | Product Owner | n.v.t. | SP-11-002 is uitgesteld buiten sprint-cyclus; geen blocker meer |

### Sprint KPI's SP-11

| KPI | Baseline | Target na sprint | Meetmethode |
|-----|----------|-----------------|-------------|
| TruffleHog in CI | Nee | Ja — blokkerend | `ci.yml` job aanwezig |
| Code signing actief | Nee | Ja (of BLK-11-001 escalatie) | Release artifact + SM-test |
| PostHog datacenter | UNCERTAIN | EU of SCC gedocumenteerd | Dashboard check |
| API versioning | Nee | Ja — `/api/v1/` actief | curl-test + E2E |
| Controller-testcoverage | 12% (4/34) | ≥27% (9/34) | bestandscount |

### Definition of Done SP-11
- [ ] Alle stories met APPROVED acceptatiecriteria
- [ ] CI groen op main na merge
- [ ] Secret scan actief als PR-gate
- [ ] Geen nieuwe GUARD-violations geïntroduceerd
- [ ] DPIA update (SP-11-003) indien PostHog-migratie vereist
- [ ] session-state.json bijgewerkt

---

## Sprint SP-12 – Kwaliteit & Governance

### Doel
Design-token violations opgelost, session timeout geïmplementeerd, data woordenboek aangemaakt, eerste fase Application Layer gestart, controller-tests uitgebreid.

### Stories

| Story ID | Beschrijving | Type | Team | Acceptatiecriteria | Story Points | Afhankelijkheden | Blocker | Risico |
|----------|-------------|------|------|-------------------|--------------|-----------------|---------|--------|
| SP-12-001 | ESLint design-system/no-raw-colors bulk-fix (≥150 van 224 violations) | CODE | Dev | ESLint violations ≤74; CI lint-stap groen | 5 | Geen | NONE | Laag — grotendeels automat. |
| SP-12-002 | Session timeout implementeren in Electron main process (auto-lock na 15 min inactiviteit) | CODE | Dev | Inactiviteits-timer aanwezig; na 15 min → lock; configureerbaar 5-60 min; integratie-test groen | 5 | Geen | NONE | Midden |
| SP-12-003 | Data woordenboek `docs/data-dictionary.md` aanmaken (≥90% van 26 entiteiten) | ANALYSIS | Dev/Doc | Bestand aanwezig; ≥24/26 entiteiten gedocumenteerd met AVG-classificatie | 3 | Geen | NONE | Laag |
| SP-12-004 | Application Layer fase 1: IRepository interface introduceren voor Common domain (Eigenaar, Erfgenaam) | CODE | Dev | IEigenaarRepository + IErfgenaamRepository interfaces aanwezig; 2 controllers refactored; unit-tests groen | 8 | SP-11 groen | NONE | Hoog — grote refactor |
| SP-12-005 | Controller-tests batch 2: export (CSV, ZIP, NUV) endpoints | CODE | Dev | ≥3 nieuwe controller testbestanden; CI groen | 5 | SP-11-005 | NONE | Laag |

### Parallel Tracks SP-12

| Track | Type | Stories | Team | Startvoorwaarde |
|-------|------|---------|------|----------------|
| Track 1 (Code) | CODE | SP-12-001, SP-12-002, SP-12-004, SP-12-005 | Dev | SP-11 groen |
| Track 2 (Analysis) | ANALYSIS | SP-12-003 | Dev/Doc | SP-11 groen — onafhankelijk van Code track |

### Blocker Register SP-12
Geen externe blockers. SP-12-004 heeft intern risico (hoge effort); bewaken via mid-sprint review.

### Sprint KPI's SP-12

| KPI | Baseline | Target na sprint | Meetmethode |
|-----|----------|-----------------|-------------|
| ESLint design-token violations | 224 | ≤74 | `npm run lint` |
| Session timeout actief | Nee | Ja | Integratie-test |
| Data woordenboek | Nee | ≥90% entiteiten | bestandscheck |
| Application Layer (Common) | 0/34 refactored | 2/34 | code review |
| Controller-testcoverage | ≥27% | ≥36% (12/34) | bestandscount |

### Definition of Done SP-12
- [ ] ESLint violations significant verminderd
- [ ] Session timeout aantoonbaar werkend
- [ ] Data woordenboek gepubliceerd
- [ ] Application Layer spike bewezen haalbaar
- [ ] CI groen

---

## Sprint SP-13 – Schuld Afbetaling & Observability

### Doel
MigratieDbHelper verwijderd, crash reporting geconfigureerd (na DPO-review), Application Layer uitgebreid, resterende ESLint violations opgelost.

### Stories

| Story ID | Beschrijving | Type | Team | Acceptatiecriteria | Story Points | Afhankelijkheden | Blocker | Risico |
|----------|-------------|------|------|-------------------|--------------|-----------------|---------|--------|
| SP-13-001 | MigratieDbHelper verwijderen + ADR-001 sluiten | CODE | Dev | Geen `MigratieDbHelper` in codebase; ADR-001 status RESOLVED; CI groen | 3 | SP-12 (Application layer context) | NONE | Midden — DB-compatibiliteit |
| SP-13-002 | → **Verplaatst naar SP-15-003** — pricing plan beslissing + DPO-toets vereist vóór productie | - | - | - | - | - | → SP-15-003 | - |
| SP-13-003 | Application Layer fase 2: IRepository voor 4 extra bounded contexts | CODE | Dev | ≥6 controllers refactored naar IRepository-patroon; unit-tests groen | 8 | SP-12-004 | NONE | Hoog |
| SP-13-004 | Controller-tests batch 3: testament, videoboodschappen, donor (≥5 controllers) | CODE | Dev | ≥5 nieuwe controller testbestanden; CI groen | 5 | SP-12-005 | NONE | Laag |
| SP-13-005 | ESLint design-token violations afmaken (resterende ≤74 → 0) | CODE | Dev | `npm run lint` 0 errors; CI lint-gate volledig groen | 3 | SP-12-001 | NONE | Laag |

### Blocker Register SP-13

| Blocker ID | Type | Omschrijving | Eigenaar | Verwachte Oplossing | Escalatie |
|------------|------|-------------|---------|--------------------|----|
| BLK-13-001 | EXTERN | Pricing plan beslissing (Sentry) + DPO-toets crash reporting | PO/DPO | Vóór SP-15 start | Story is verplaatst naar SP-15-003 |

### Definition of Done SP-13
- [ ] MigratieDbHelper afwezig in codebase
- [ ] ESLint violations opgelost (0)
- [ ] Crash reporting actief (indien DPO GO) of bewust uitgesteld
- [ ] Application Layer uitgebreid naar ≥6 controllers

---

## Sprint SP-14 – Application Layer Afronden & Release Readiness
> **RISK MITIGATIE (SYS-RISK-001):** SSR-migratie (REC-SEC-001) is verplaatst naar SP-15 als dedicated sprint. SP-14 focust op Application Layer voltooiing + controller-tests + pentest.

### Doel
Application Layer voltooid (≥80% controllers), controller-testcoverage ≥80%. Pentest is niet-blokkerend (DEC-202) — wordt optioneel gepland na einde van de ontwikkelcyclus.

### Stories

| Story ID | Beschrijving | Type | Team | Acceptatiecriteria | Story Points | Afhankelijkheden | Blocker | Risico |
|----------|-------------|------|------|-------------------|--------------|-----------------|---------|--------|
| SP-14-001 | Next.js SSR-migratie SPIKE: onderzoek machbaarheid nonce-based CSP in Electron | ANALYSIS | Dev | Proof-of-concept aanwezig; haalbaarheidsrapport in `docs/security/csp-ssr-spike.md` | 3 | SP-13 stabiel | NONE | Laag — spike, geen productiewijziging |
| SP-14-002 | Pentest plannen + uitvoeren (gericht: masterpassword, Shamir, LocalOriginValidation) | ANALYSIS | Extern/Dev | Pentest-rapport aanwezig in `docs/security/`; bevindingen geprioriteerd | 5 | - | **DEC-202: NIET blokkerend.** Wordt pas aan einde van dev-cyclus aangevraagd indien van toepassing. Geen v1.0 release gate. | Laag |
| SP-14-003 | Application Layer fase 3: alle resterende controllers tot ≥80% | CODE | Dev | ≥28/34 controllers via IRepository; LumioDbContext niet meer direct in nieuwe controllers | 8 | SP-13-003 | NONE | Midden |
| SP-14-004 | Controller-tests batch 4: resterende controllers tot ≥80% | CODE | Dev | ≥27/34 controller testbestanden; CI groen | 8 | SP-13-004 | NONE | Laag |

## Sprint SP-15 – CSP & Security Hardening (SSR-migratie)
> **RISK MITIGATIE (SYS-RISK-001):** SSR-migratie uit SP-14 verplaatst naar dedicated sprint.

### Doel
Next.js statische export gemigreerd naar SSR; nonce-based CSP actief; `unsafe-inline` verwijderd.

### Stories

| Story ID | Beschrijving | Type | Team | Acceptatiecriteria | Story Points | Afhankelijkheden | Blocker | Risico |
|----------|-------------|------|------|-------------------|--------------|-----------------|---------|--------|
| SP-15-001 | Next.js SSR-migratie: `output:"export"` verwijderen, nonce-based CSP inschakelen | CODE | Dev | CSP bevat geen `unsafe-inline`; alle pagina's renderbaar; E2E groen; Electron renderer werkt | 13 | SP-14-001 spike | NONE | Hoog — grootste architectuurwijziging in roadmap |
| SP-15-002 | Pentest bevindingen verwerken (naar aanleiding van SP-14-002) | CODE | Dev | Alle kritieke + hoge pentest-bevindingen opgelost; rapport bijgewerkt | 8 | SP-14-002 | NONE | UNCERTAIN: scope afhankelijk van pentest-uitkomst |
| SP-15-003 | Crash reporting (Sentry Developer gratis tier) met opt-in consent implementeren | CODE | Dev | Crash reporting actief met opt-in UI; pricing plan vastgesteld en gedocumenteerd; DPIA v1.2 DPO-toets goedgekeurd; BLK-13-001 opgelost | 8 | SP-14 gereed; pricing plan beslissing (PO); DPO GO | EXTERN: pricing plan beslissing (eigenaar: PO) + DPO-toets DPIA v1.2 (eigenaar: DPO) | Midden |

### Blocker Register SP-14

| Blocker ID | Type | Omschrijving | Eigenaar | Verwachte Oplossing | Escalatie |
|------------|------|-------------|---------|--------------------|----|
| BLK-14-001 | EXTERN | Pentest-leverancier beschikbaarheid | PO | Voor SP-14 einde | v1.0 release gegateerd op pentest-rapport |

### Sprint KPI's SP-14

| KPI | Baseline | Target | Meetmethode |
|-----|----------|--------|-------------|
| CSP unsafe-inline | Aanwezig | Afwezig | CSP-evaluator |
| Controller-testcoverage | ≥50% | ≥80% | bestandscount |
| Application Layer dekking | ~20% | ≥80% | code review |
| Pentest rapport | Nee | Ja | bestandscheck |

### Definition of Done SP-14
- [ ] CSP zonder unsafe-inline in productie-build
- [ ] Pentest-rapport aanwezig of release-gate actief
- [ ] Application Layer ≥80% controllers
- [ ] Controller-testcoverage ≥80%
- [ ] CI volledig groen

---

## Afhankelijkheidsoverzicht

| Story | Afhankelijk van | Blokkerend? |
|-------|----------------|------------|
| SP-12-* | SP-11 groen | Ja |
| SP-12-004 | SP-11 groen | Ja |
| SP-13-001 | SP-12-004 context | Midden |
| SP-13-003 | SP-12-004 | Ja |
| SP-13-005 | SP-12-001 | Ja |
| SP-14-001 | SP-13 stabiel | Ja |
| SP-14-003 | SP-13-003 | Ja |
| SP-14-004 | SP-13-004 | Ja |

---

## P1/P2 Traceability Matrix

| Aanbeveling ID | Prioriteit | Gedekt door Story | Sprint |
|----------------|------------|-------------------|--------|
| REC-ARCH-001 | P2 | SP-12-004, SP-13-003, SP-14-003 | SP-12–14 |
| REC-ARCH-002 | P1 | SP-13-001 | SP-13 |
| REC-ARCH-003 | P1 | SP-11-004 | SP-11 |
| REC-DEV-001 | P1 | SP-11-005, SP-12-005, SP-13-004, SP-14-004 | SP-11–14 |
| REC-DEV-002 | P2 | SP-12-001, SP-13-005 | SP-12–13 |
| REC-DEVOPS-001 | P1 | SP-11-002 | SP-11 |
| REC-DEVOPS-002 | P1 | SP-11-001 | SP-11 |
| REC-DEVOPS-003 | P2 | SP-15-003 (verplaatst van SP-13-002) | SP-15 |
| REC-SEC-001 | P2 | SP-14-001 | SP-14 |
| REC-SEC-002 | P1 | SP-11-001 (gedeeld) | SP-11 |
| REC-SEC-003 | P1 | SP-12-002 | SP-12 |
| REC-SEC-004 | P2 | SP-14-002 | SP-14 |
| REC-DATA-001 | P2 | SP-12-003 | SP-12 |
| REC-DATA-002 | P2 | SP-13-001 (gedeeld) | SP-13 |
| REC-DATA-003 | P1 | SP-11-003 | SP-11 |

**Alle P1-aanbevelingen zijn gedekt door een story. Alle P2-aanbevelingen zijn gedekt.**

---

## Geconsolideerd Blocker Register

| Blocker ID | Sprint | Type | Omschrijving | Eigenaar | Escalatie voor |
|------------|--------|------|-------------|---------|----------------|
| BLK-11-001 | SP-11 | EXTERN | EV certificate aanvraag | PO | Einde SP-11 |
| BLK-13-001 | SP-15 | EXTERN | Pricing plan beslissing (Sentry) + DPO-toets crash reporting | PO/DPO | Start SP-15 |
| BLK-14-001 | SP-14 | EXTERN | Pentest-leverancier | PO | Einde SP-14 |

---

## HANDOFF CHECKLIST — Sprintplan Fase 2
- [x] Aannames gedocumenteerd (incl. INSUFFICIENT_DATA teamsamenstelling)
- [x] Elke story heeft story-type classificatie
- [x] Elke story heeft acceptatiecriteria
- [x] Elke story heeft Blocker-veld
- [x] Alle EXTERN-blockers hebben eigenaar + escalatie
- [x] Parallel tracks geïdentificeerd
- [x] Sprint KPI's SMART
- [x] Afhankelijkheidsoverzicht aanwezig
- [x] Geconsolideerd Blocker Register aanwezig
- [x] P1/P2 traceability matrix compleet — alle P1-aanbevelingen gedekt
- [x] Definition of Done aanwezig per sprint
- [x] Status: READY voor Critic validatie
