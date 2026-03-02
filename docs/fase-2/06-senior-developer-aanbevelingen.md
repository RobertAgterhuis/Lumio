# Aanbevelingen – Code Kwaliteit (Senior Developer) – 2026-03-02
> Senior Developer | Agent 06 | Fase 2

## Metadata
- Agent: Senior Developer (06)
- Fase: 2
- Gebaseerd op analyse: `docs/fase-2/06-senior-developer-analyse.md`
- Datum: 2026-03-02

---

## Aanbeveling REC-DEV-001

### Probleem
~12% controller-testdekking in de backend. 30 van 34 controllers hebben geen testbestand. Business-logica zit verstrengeld in controllers en is niet afzonderlijk testbaar.  
**Analyse referentie:** GAP-DEV-001, RISK-DEV-001

### Oplossing
Implementeer een **gelaagde test-strategie** voor de backend controllers: begin met integratietests (WebApplicationFactory + SQLite in-memory) voor de 10 hoogste-risico-endpoints (auth, shamir, export, erfgenamen, testament), later overgaand naar unit-tests na Application Layer introductie (REC-ARCH-001).

**Implementatie-aanpak:**
1. Prioriteer controller-tests op business-impact: (1) auth/setup/unlock, (2) shamir, (3) export, (4) erfgenamen, (5) testament.
2. Gebruik `TestDbFactory.cs` (reeds aanwezig) als basis voor nieuwe integratietests.
3. Voeg CI-gate toe: minimum coverage threshold via `services-coverage.runsettings` uitbreiden naar controllers.
4. Bij ingebruikname Application Layer (per REC-ARCH-001): vervang integratietests stapsgewijs door unit-tests met Fakes.

**Impact:**

| Dimensie | Verwacht effect | Rationale |
|----------|----------------|-----------|
| Revenue | INSUFFICIENT_DATA: | Indirect via kwaliteitsgarantie bij updates |
| Risk Reductie | Hoog — regressies in core flows worden eerder onderschept | 30+ endpoints momenteel ongetest |
| Cost | Negatief initieel (~30-60 uur), daarna positief (minder productie-bugs) | Schatting op basis van 10 priority endpoints × ~3-6 uur per endpoint |
| UX | Indirect positief — minder regrssies bereiken eindgebruiker | — |

### Afhankelijkheden
- Vereist: `TestDbFactory.cs` (aanwezig)
- Versterkt door: REC-ARCH-001 (Application Layer) voor unit-testbaarheid

### Risico's van niet uitvoeren
Elke sprint die zonder nieuwe tests wordt geleverd vergroot het regressieoppervlak. Bij export- of shamir-failures heeft de eindgebruiker geen vangnet.

### Meetcriterium
- KPI: % backend controllers met ≥1 testbestand
- Baseline: 12% (4/34)
- Target: ≥80% binnen 6 sprints
- Meetmethode: bestandscount in `src/Lumio.Api.Tests/Controllers/` vs. `src/Lumio.Api/Controllers/`
- Tijdshorizon: SP-11 tot SP-16

---

## Aanbeveling REC-DEV-002

### Probleem
224 `design-system/no-raw-colors` ESLint-overtredingen in page-componenten. Design-system-enforcement via ESLint is aanwezig maar violations ophopen zich onoplost.  
**Analyse referentie:** GAP-DEV-002, RISK-DEV-002

### Oplossing
Activeer `design-system/no-raw-colors` als **blokkerende CI-fout** (als dat nog niet het geval is). Vervolgens maak een backlog-sprint voor het oplossen van bestaande violations, en voorkom nieuwe violations via CI-gate.

**Implementatie-aanpak:**
1. Verifieer of `npm run lint` de CI-job laat falen bij errors (UNCERTAIN: CI lint-status).
2. Als niet blokkerend: update `.github/workflows/ci.yml` frontend-job om te falen bij lint-errors.
3. Maak een geautomatiseerde codemigratierun via een script dat de meest voorkomende raw-kleur-patronen (bijv. `text-red-*`, `bg-blue-*`) vervangt door semantische equivalenten.
4. Stel een "no new violations" policy in: enkel bestaande violations worden geaccepteerd zolang backlog loopt.

**Impact:**

| Dimensie | Verwacht effect | Rationale |
|----------|----------------|-----------|
| Revenue | INSUFFICIENT_DATA: | Geen directe impact |
| Risk Reductie | Midden — design-system updates breken niet meer onverwacht | 224 lekken in design-system-contract |
| Cost | Negatief initieel (~8-16 uur migratie), positief op termijn | Schatting: 224 violations, veel herhaalbaar via autofix |
| UX | Positief — consistente kleurgebruik bevordert visuele cohesie | — |

### Afhankelijkheden
- Vereist: begrip van beschikbare semantische tokens (zie `docs/design-system/TOKENS.md` — aanwezig volgens ESLint foutmelding)

### Risico's van niet uitvoeren
Bij introductie van dark mode of herbranding worden 224+ locaties manueel bijgewerkt; inconsistente thema-toepassing in toekomstige releases.

### Meetcriterium
- KPI: Aantal `design-system/no-raw-colors` ESLint violations
- Baseline: 224 (2026-03-02)
- Target: 0
- Meetmethode: `npm run lint` output
- Tijdshorizon: SP-11 (triage) → SP-12 (bulk migratie)

---

## PRIORITEITENMATRIX

| Aanbeveling ID | Impact | Effort | Prioriteit | Sprint |
|----------------|--------|--------|------------|--------|
| REC-DEV-001 (Controller-tests) | Hoog | Hoog | P1 | SP-11–SP-16 gefaseerd |
| REC-DEV-002 (Design token violations) | Midden | Midden | P2 | SP-12 |

---

## HANDOFF CHECKLIST — Aanbevelingen Senior Developer
- [x] Alle aanbevelingen verwijzen naar analyse-bevindingen
- [x] Impacts hebben rationale
- [x] INSUFFICIENT_DATA items gedocumenteerd
- [x] Meetcriteria SMART
- [x] Prioriteitenmatrix volledig
- [x] Status: READY voor DevOps Engineer
