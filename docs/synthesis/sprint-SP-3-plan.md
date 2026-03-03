# Sprint Plan – SP-3 – Video-encryptie, Analytics Live, Technische Schuld

## Metadata
- Agent: 20-implementation-agent
- Sprint ID: SP-3
- Sprint name: Video-encryptie, Analytics live & ADR-001 cleanup
- Based on: reevaluation-report-v3-20260303.md (Sprint-Delta Proposal) · DEC-113 · DEC-114 · Q-09-001 · Q-09-002 · GAP-LEGAL-002 · REC-DATA-001
- Date: 2026-03-03
- Sprint type: DEVELOPMENT + LEGAL CONTENT (parallel tracks)
- Note on SP-UT-01: The axe e2e scan (SP-UT-01-003) and Shamir UX retest (SP-UT-01-000/001/002) are **NOT** in this sprint. They run in SP-UT-01 in parallel — no dependency either way.

---

## Sprint Plan Assumptions

- **Team composition:**
  - **Team Dev** — 1 full-stack developer (.NET/Next.js) — capacity: ~10 days / sprint (1 developer, 2-week sprint)
  - **Team Legal/PO** — PO + privacy lawyer (as needed for B2B DPA review) — capacity: ~3 days (PO: content authoring; lawyer: review slot at end of sprint)
- **Sprint duration:** 2 weeks
- **Technology stack:** .NET 10 · Electron 40 · Next.js 15 · TypeScript strict · SQLite/SQLCipher · `@microsoft/applicationinsights-web` (new) · Storybook 10
- **Prerequisites:**
  - main branch at commit `98c2f19` (post DEC-113/114 decisions)
  - `dotnet test` PASS (423/423 baseline)
  - `npm run build` PASS on `site/`
  - DEC-113 BESLOTEN ✅ (Azure Application Insights — eigen tenant)
  - DEC-114 BESLOTEN ✅ (implementatieconstraints inclusief env var naam)
  - Q-09-001 RESOLVED ✅ (video filesystem encryption preferred; max ~50 MB; max 10 per profile)
  - Q-09-002 RESOLVED ✅ (all active installations have run EF migrations; ADR-001 cleanup eligible)
  - Azure Application Insights resource aangemaakt in eigen tenant **vóór** SP-3-003 (PO/DevOps actie — zie BLK-SP3-001)
  - Feature branch `feature/sp-3` aangemaakt conform DEC-103

---

## Sprint SP-3 – Video-encryptie, Analytics Live & ADR-001 Cleanup

### Goal
Na SP-3 is de privacy-architectuur van Lumio compleet op data-at-rest: alle videobestanden zijn versleuteld opgeslagen (AES-256-GCM). De marketingsite is voor het eerst meetbaar met Azure Application Insights (cookie-vrij, eigen tenant). De ADR-001 bridge code is verwijderd. De B2B juridische basis (verwerkersovereenkomst-template) is gereed voor het eerste werkgeversgesprek.

---

### Stories

| Story ID | Beschrijving | Type | Team | Acceptatiecriteria | Story Points | Dependencies | Blocker | Risico |
|----------|-------------|------|------|--------------------|--------------|--------------|---------|--------|
| SP-3-001 | **Video-encryptie: AES-256-GCM per videobestand** — implementeer transparante encryptie/decryptie voor videobestanden die via de desktop-app worden opgeslagen. Sleutel afgeleid van master-password via bestaande PBKDF2-pipeline. | CODE | Team Dev | (1) Videobestand wordt AES-256-GCM versleuteld bij opslaan in het profiel; (2) Transparante decryptie bij lezen — UI-laag heeft geen kennis van versleuteling; (3) Sleutel afgeleid van master-password + salt via `DatabasePasswordService` (bestaande PBKDF2-flow, ≥310k iteraties); (4) Bestaande niet-versleutelde bestanden worden bij eerste unlock ná update gemigreerd (migration path, inclusief rollback-pad gedocumenteerd); (5) Unit tests voor encrypt/decrypt round-trip slagen; (6) `dotnet test` PASS; (7) `MigratieDbHelper.cs` of equivalente service bevat geen hardcoded encryption keys | 5 | Geen | NONE | HOOG — AES-GCM cipher mode vereist GCM-authenticatietag bij decryptie; tamper-detectie als side-effect |
| SP-3-002 | **ADR-001 bridge code verwijderen** — verwijder `EnsureSchuldKolommenAsync` uit `src/Lumio.Api/Data/MigratieDbHelper.cs` en alle aanroepen | CODE | Team Dev | (1) Methode `EnsureSchuldKolommenAsync` verwijderd uit `MigratieDbHelper.cs`; (2) Aanroep in `EnsureMigratedAsync` verwijderd; (3) EF-migratie `20260224151055_AddSchuldBezitLink` blijft aanwezig in migrations-map; (4) `dotnet test` PASS; (5) `devdocs/adr-001-schulden-schema-brug.md` status bijgewerkt naar `VERWIJDERD — SP-3-002 voltooid` | 1 | Geen | NONE | LAAG — idempotente DDL-methode; verwijdering heeft geen runtimerisico voor bijgewerkte installaties |
| SP-3-003 | **Azure Application Insights integreren op `site/`** — installeer `@microsoft/applicationinsights-web`, configureer cookie-vrij, auto route tracking, verbind via env var conform DEC-114 | CODE | Team Dev | (1) Pakket `@microsoft/applicationinsights-web` toegevoegd aan `site/package.json`; (2) `AppInsightsProvider` of initialisatie in `site/src/app/layout.tsx` met `disableCookiesUsage: true`, `enableAutoRouteTracking: true`; (3) Connection string geladen uit `process.env.NEXT_PUBLIC_APPINSIGHTS_CONNECTION_STRING` — nooit hardcoded; (4) `.env.example` in `site/` bevat `NEXT_PUBLIC_APPINSIGHTS_CONNECTION_STRING=` (lege placeholder + toelichting); (5) `npm run build` PASS; (6) `npx tsc --noEmit` PASS; (7) Lokaal getest: navigeren tussen pagina's triggert pageview telemetrie in App Insights portal (of browser network tab — `dc.services.visualstudio.com`); (8) Geen cookies gezet in browser (DevTools Application > Cookies leeg voor lumio-legacy.nl) | 3 | BLK-SP3-001 (App Insights resource) | EXTERN: BLK-SP3-001 — Azure resource moet beschikbaar zijn vóór dev-start | MIDDEL — connection string is publiek zichtbaar in Next.js client-bundle; App Insights connection strings zijn by design publiek en bevatten alleen een instrumentatiesleutel |
| SP-3-004 | **App Insights custom conversie-events** — voeg getypeerde custom events toe voor de vier belangrijkste conversie-actiepunten op de marketingsite | CODE | Team Dev | (1) Centrale `trackEvent` util in `site/src/lib/analytics.ts` (of equivalente locatie) — getypeerd, geen PII-properties conform DEC-114; (2) Events: `cta_hero_clicked` (+ `audience` property: `b2c`/`b2b`), `pricing_page_viewed`, `werkgevers_page_viewed`, `one_pager_downloaded`; (3) Events vuren bij de juiste UI-interactions (onClick hero CTA, page-load pricing, page-load werkgevers, klik op one-pager PDF-link); (4) `npx tsc --noEmit` PASS; (5) `npm run build` PASS; (6) Lokaal getest: events verschijnen in App Insights Live Metrics of browser network tab | 2 | SP-3-003 (App Insights init aanwezig) | INTERN: SP-3-003 — kan pas starten na SP-3-003 merge | LAAG |
| SP-3-005 | **Handmatige dependency security audit** — voer `npm audit` en `dotnet list package --vulnerable` uit, documenteer bevindingen, fix alle high/critical findings | INFRA | Team Dev | (1) `npm audit --audit-level=high` uitgevoerd op `site/`; bevindingen gedocumenteerd in `devdocs/dependency-audit-SP3.md`; alle HIGH en CRITICAL findings gefixt of als ACCEPTED_RISK gedocumenteerd met reden; (2) `dotnet list package --vulnerable` uitgevoerd op de solution; bevindingen gedocumenteerd; alle HIGH/CRITICAL findings gefixt of ACCEPTED_RISK; (3) `dotnet test` PASS na fixes; (4) `npm run build` PASS na fixes | 1 | Geen | NONE | LAAG — DEC-110 (geen CI) verhoogt kans op onontdekte kwetsbaarheden; audit vermindert dit handmatig |

**Track 3 — parallel, onafhankelijk van Track 1 en Track 2:**

| Story ID | Beschrijving | Type | Team | Acceptatiecriteria | Story Points | Dependencies | Blocker | Risico |
|----------|-------------|------|------|--------------------|--------------|--------------|---------|--------|
| SP-3-006 | **B2B verwerkersovereenkomst (VOK) template** — maak een AVG art. 26-conforme template voor joint-controller overeenkomst met werkgevers die Lumio als WKR-benefit aanbieden | CONTENT | Team Legal/PO | (1) `docs/legal/b2b-joint-controller-agreement-template.md` aangemaakt; (2) Structuur dekt: scope van gezamenlijke verwerkersverantwoordelijkheid, betrokken verwerkingsactiviteiten en categorieën betrokkenen, verdeling AVG-verplichtingen (art. 13/14, rechten betrokkenen, datalekmelding), sub-verwerkers, bewaartermijnen, aansprakelijkheid; (3) Template bevat invulvelden voor werkgeversgegevens (bedrijfsnaam, KVK, contactpersoon); (4) Status: DRAFT — gereed voor review door privacy-jurist (PO plant dit review); (5) `document-registry.md` bijgewerkt met verwijzing naar het nieuwe document | 3 | Geen | NONE — CONTENT track blokkeert CODE track NIET | MIDDEL — template vereist juridische review vóór eerste gebruik bij werkgever; template-status is DRAFT totdat review plaatsvindt |

---

### Story Type Breakdown

| Type | Stories | Team | Geschatte effort |
|------|---------|------|-----------------|
| CODE | SP-3-001, SP-3-002, SP-3-003, SP-3-004 | Team Dev | ~7 SP / ~7–8 dagen |
| INFRA | SP-3-005 | Team Dev | ~1 SP / 0.5 dag |
| CONTENT | SP-3-006 | Team Legal/PO | ~3 SP / 1.5–2 dagen |
| **Totaal** | **6 stories** | | **~11 SP** |

---

### Parallel Tracks

| Track | Type | Stories | Team | Startvereiste |
|-------|------|---------|------|--------------|
| Track 1 (Code — Data) | CODE | SP-3-001, SP-3-002 | Team Dev | Sprint start — geen externe afhankelijkheden |
| Track 2 (Code — Analytics) | CODE | SP-3-003 → SP-3-004 | Team Dev | SP-3-003: BLK-SP3-001 opgelost (Azure resource); SP-3-004: SP-3-003 merged |
| Track 3 (INFRA) | INFRA | SP-3-005 | Team Dev | Sprint start — onafhankelijk; kan op elk moment; aanbevolen na SP-3-001/002 zodat nieuwe code meegenomen wordt |
| Track 4 (Content/Legal) | CONTENT | SP-3-006 | Team Legal/PO | Sprint start — volledig onafhankelijk van alle CODE/INFRA tracks |

> **TRACK INDEPENDENCE REMINDER:** Track 4 (CONTENT) blokkeert NOOIT Track 1, 2 of 3. Vertragingen in juridische review raken uitsluitend SP-3-006 en hebben geen invloed op de sprint velocity van Team Dev.

**Aanbevolen volgorde Team Dev:**
1. SP-3-001 (grootste story, start dag 1)
2. SP-3-002 (parallel of direct na SP-3-001 — snel)
3. SP-3-003 (zodra BLK-SP3-001 opgelost)
4. SP-3-004 (direct na SP-3-003 merge)
5. SP-3-005 (afsluitend — na alle code wijzigingen)

---

### Blocker Register (SP-3)

| Blocker ID | Story | Type | Beschrijving | Eigenaar | Verwachte oplossing | Escalatie indien niet opgelost |
|------------|-------|------|-------------|---------|--------------------|---------------------------------|
| BLK-SP3-001 | SP-3-003 | EXTERN | Azure Application Insights resource aanmaken in eigen Azure tenant, data-regio West Europe, en connection string beschikbaar stellen als `NEXT_PUBLIC_APPINSIGHTS_CONNECTION_STRING` | PO / DevOps | Dag 1–2 van sprint (Azure portal, ~10 minuten; connection string via App Settings) | Als niet opgelost door dag 3: SP-3-003 mag doorgaan met placeholder (mock `window.APPINSIGHTS_DISABLED = true` guard); story is BLOCKED_PENDING_RESOURCE |

> **Toelichting BLK-SP3-001:** Een App Insights resource aanmaken in Azure Portal neemt <10 minuten. Ga naar portal.azure.com → Create resource → Application Insights → regio: West Europe → Workspace-based (koppel aan bestaande Log Analytics workspace of maak nieuwe aan). Kopieer de Connection String uit het Overview-tabblad.

---

### Sprint KPIs

| KPI | Baseline (pre-SP-3) | Target na SP-3 | Meetmethode |
|-----|---------------------|---------------|------------|
| Videobestanden versleuteld bij opslag | 0% (geen encryptie op bestandsniveau) | 100% nieuwe videobestanden AES-256-GCM versleuteld | Code review + unit test coverage `VideoEncryptieService` |
| ADR-001 bridge code aanwezig | Ja (`EnsureSchuldKolommenAsync` in `MigratieDbHelper.cs`) | Nee (verwijderd) | `dotnet test` + code review |
| App Insights pageviews getrackt op `site/` | 0 (geen analytics) | ≥1 succeeded telemetry request per paginanavigatie | Browser network tab inspection + App Insights portal Live Metrics |
| Custom conversie-events gefired | 0 | 4 event types instrumenteel aanwezig + getest | Code review + browser console |
| Kritieke/hoge dependency kwetsbaarheden gerapporteerd | Onbekend (nooit geauditeerd) | 0 HIGH/CRITICAL open (of gedocumenteerd als ACCEPTED_RISK) | `npm audit` output + `dotnet list package --vulnerable` output |
| B2B VOK template aanwezig | Nee | Ja (DRAFT, gereed voor juridische review) | Bestandsaanwezigheid `docs/legal/b2b-joint-controller-agreement-template.md` |
| `dotnet test` | 423/423 PASS | ≥423/423 PASS (netto geen regressie) | `dotnet test` lokaal |
| `npm run build` | PASS | PASS | lokaal |

---

### Definition of Done (SP-3)

- [ ] SP-3-001: Video encryptie actief — unit tests PASS, integratie getest (encrypt/decrypt round-trip in profiel), migratie-pad gedocumenteerd
- [ ] SP-3-002: `EnsureSchuldKolommenAsync` verwijderd uit codebase, `dotnet test` PASS, ADR bijgewerkt
- [ ] SP-3-003: App Insights initialisatie aanwezig, cookie-vrij, env var conform DEC-114, `npm run build` PASS, pageview trackable lokaal
- [ ] SP-3-004: 4 custom events aanwezig, getypeerd, geen PII, getest in dev
- [ ] SP-3-005: Dependency audit rapport gepubliceerd in `devdocs/`, alle HIGH/CRITICAL findings afgehandeld
- [ ] SP-3-006: B2B VOK template DRAFT aanwezig in `docs/legal/`, document-registry bijgewerkt
- [ ] `dotnet test` PASS (≥423 tests)
- [ ] `npm run build` PASS
- [ ] `npx tsc --noEmit` PASS
- [ ] TruffleHog pre-push hook geslaagd (geen secrets committed)
- [ ] Squash merge naar main via PR (DEC-103/104)
- [ ] Sprint retrospective gepland

---

## Dependency Overzicht

| Story | Afhankelijk van | Type | Blokkerend? |
|-------|----------------|------|------------|
| SP-3-001 | Geen | — | — |
| SP-3-002 | Geen | — | — |
| SP-3-003 | BLK-SP3-001 (Azure resource) | EXTERN | Ja — maar niet blocking voor SP-3-001/002/005/006 |
| SP-3-004 | SP-3-003 | Intern story | Ja — kan pas na SP-3-003 merge starten |
| SP-3-005 | Geen | — | — |
| SP-3-006 | Geen | — | — |

## Parallel Tracks Overzicht (volledig sprint)

| Sprint | Track | Stories | Team |
|--------|-------|---------|------|
| SP-3 | Track 1 (Code — Data) | SP-3-001, SP-3-002, SP-3-005 | Team Dev |
| SP-3 | Track 2 (Code — Analytics) | SP-3-003, SP-3-004 | Team Dev |
| SP-3 | Track 3 (Content/Legal) | SP-3-006 | Team Legal/PO |
| SP-UT-01 | Track UX/Research | SP-UT-01-000…002 | Team UX/Research |
| SP-UT-01 | Track Test Infra | SP-UT-01-003 | Team Dev (los van SP-3) |

> SP-UT-01 loopt volledig parallel aan SP-3. De enige aanbevolen coördinatiemaatregel: Team Dev loopt SP-UT-01-003 (axe e2e) bij voorkeur ná SP-3 merge zodat de axe scan de bijgewerkte codebase test — maar dit is geen hard afhankelijkheid.

---

## Sprint Plan Risico-Log

| Risico | Kans | Impact | Mitigatie | Sprint |
|--------|------|--------|-----------|--------|
| AES-GCM decryptie faalt op bestaande video-bestanden na update (geen migration path) | MIDDEL | HOOG — data-loss scenario | SP-3-001 AC vereist expliciete migration path + rollback-documentatie; bouw opt-in migratie (niet automatisch bij upgrade) | SP-3 |
| BLK-SP3-001 wordt niet tijdig opgelost (App Insights resource) | LAAG | MIDDEL — vertraagt SP-3-003/004 | SP-3-003 bevat BLOCKED_PENDING_RESOURCE guard; Track 1 stories gaan door | SP-3 |
| Dependency audit (SP-3-005) onthult HIGH kwetsbaarheden die extra remediatieworkload vereisen | LAAG–MIDDEL | MIDDEL — sprint velocity risico | Reserve: SP-3-005 is als laatste ingepland; fix-stories (indien >1 dag werk) kunnen worden verschoven naar SP-4 mits gedocumenteerd als ACCEPTED_RISK | SP-3 |
| B2B VOK template (SP-3-006) kost PO meer tijd dan verwacht (juridische formuleringen) | MIDDEL | LAAG — CONTENT track blokkeert CODE track NIET | Template mag als DRAFT worden opgeleverd; juridische review in SP-4 inplannen | SP-3 |

---

## Geraaktheid door Beslissingen (Sprint Gate constraints)

| DEC | Impact op SP-3 |
|-----|---------------|
| DEC-103 | Feature branch `feature/sp-3` aanmaken vóór eerste commit; squash merge na sprint |
| DEC-104 | PR vereist; main branch protected; direct push verboden |
| DEC-108 | SP-3-001 voegt geen API-endpoint toe dat voor DB-unlock bereikbaar hoeft te zijn — N.v.t. |
| DEC-110 | Geen CI gates — lokale kwaliteitsgate: `dotnet test` + `npm run build` + `npx tsc --noEmit` |
| DEC-113 | SP-3-003 (App Insights) is het directe uitvoeringsgevolg van dit besluit |
| DEC-114 | SP-3-003 en SP-3-004 moeten exact de constraints in DEC-114 volgen (cookie-free, IP-anon, env var, geen PII) |
| DEC-102 | SP-3-004 custom events zijn App Insights events, NIET PostHog — constraint is niet van toepassing |

---

## HANDOFF CHECKLIST

- [x] Sprint plan assumptions zijn expliciet gedocumenteerd (teams + capaciteit)
- [x] Elke story heeft een story type classificatie (CODE/INFRA/DESIGN/CONTENT/ANALYSIS)
- [x] Elke story heeft een teamtoewijzing
- [x] Elke story heeft acceptatiecriteria (SMART en testbaar)
- [x] Elke story heeft een story point schatting
- [x] Elke story heeft een Blocker veld (minimaal NONE)
- [x] Alle EXTERN blockers hebben een eigenaar en escalatieroute
- [x] Parallelle tracks zijn geïdentificeerd per sprint
- [x] Sprint KPIs zijn SMART geformuleerd
- [x] Dependency overzicht is ingevuld
- [x] Consolidated Blocker Register is aanwezig
- [x] Definition of Done is aanwezig per sprint
- [x] Geen fictieve capaciteitsaannames
- [x] SCOPE_CHANGE: N.v.t. — normale audit cycle
- [x] Track independence: CONTENT track (SP-3-006) blokkeert NOOIT CODE/INFRA tracks expliciet gedocumenteerd
- [x] DEC-111 gerespecteerd: geen Plausible of PostHog events — App Insights gebruikt conform DEC-113/114
- [x] SP-UT-01 isolatie gerespecteerd: axe e2e en Shamir UX retest zijn NIET in SP-3 opgenomen
