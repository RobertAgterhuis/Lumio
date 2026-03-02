# Beslissingen & Open Vragen

> Dit bestand is jouw directe communicatiekanaal met het Agentic Team.  
> De Orchestrator raadpleegt dit bestand bij elke Sprint Gate en bij de start van elke sprint.  
> Vul het zelf in — agents passen hun gedrag automatisch aan op basis van de status hieronder.

---

## Hoe werkt dit bestand?

| Kolom | Uitleg |
|-------|--------|
| **ID** | Uniek ID, formaat `DEC-NNN` |
| **Type** | `BESLUIT` (jij hebt beslist) of `OPEN_VRAAG` (wacht op jouw antwoord) |
| **Status** | `OPEN` · `BESLOTEN` · `UITGESTELD` · `VERVALLEN` |
| **Prioriteit** | `HOOG` · `MIDDEL` · `LAAG` |
| **Scope** | Welke fase, agent of sprint dit raakt (bijv. `Fase 2`, `SP-3`, `PR/Review Agent`, `Alle sprints`) |
| **Beslissing / Vraag** | Wat er beslist is of wat beantwoord moet worden |
| **Jouw antwoord / Toelichting** | Vul dit in bij OPEN_VRAAG zodat de Orchestrator het kan verwerken |
| **Datum** | Datum van invoer of laatste update |

**Gedragsregels voor de Orchestrator:**
- `OPEN` + prioriteit `HOOG` + sprint raakt de scope → **Sprint Gate blokkeert** totdat jij dit beantwoordt
- `OPEN` + prioriteit `MIDDEL/LAAG` → Orchestrator meldt het maar blokkeert niet
- `BESLOTEN` → Orchestrator injecteert de beslissing als harde constraint bij alle relevante agents
- `UITGESTELD` → Orchestrator negeert tot datum of scope-trigger
- `VERVALLEN` → Orchestrator negeert volledig

---

## Open Vragen (wacht op jouw antwoord)

| ID | Prioriteit | Scope | Vraag | Jouw antwoord | Datum |
|----|-----------|-------|-------|---------------|-------|
| DEC-001 | HOOG | — | *(Voeg hier een open vraag toe)* | | |

---

## Genomen Besluiten (agents volgen dit op)

| ID | Prioriteit | Scope | Beslissing | Toelichting | Datum |
|----|-----------|-------|-----------|-------------|-------|
| DEC-101 | HOOG | Alle sprints | Chromatic wordt **niet** gebruikt voor visuele regressietests | Het project maakt geen gebruik van Chromatic. De CI-job (`chromatic`) moet worden uitgeschakeld (`if: false`). `chromatic.config.json` blijft als skelet bewaard maar wordt niet geconfigureerd. `CHROMATIC_PROJECT_TOKEN` hoeft niet ingesteld te worden. | 2026-03-02 |
| DEC-102 | HOOG | Alle sprints | CodeQL SAST wordt **niet** uitgevoerd | GitHub Advanced Security / Code Scanning is niet ingeschakeld voor deze repository. De CodeQL-job (`codeql.yml`) wordt overgeslagen via `if: false` zodat de check als "Skipped" verschijnt in plaats van ❌ FAILURE. Opnieuw activeren door `if: false` te verwijderen zodra Code Scanning wordt ingeschakeld. | 2026-03-02 |
| DEC-103 | HOOG | SP-8 / Fase 2 | Swagger UI wordt **alleen** in development-modus geactiveerd | REEVALUATE FASE-2 (SEC-001): Swagger UI is zonder `IsDevelopment()`-guard beschikbaar in productie. Besluit: wrap `app.UseSwagger()` + `app.UseSwaggerUI()` in `if (app.Environment.IsDevelopment())`. Tracked als story SP-8-R001. GUARD-011 toegevoegd. | 2026-03-02 |
| DEC-104 | HOOG | SP-8 / Fase 2 | AuditLog-rotatie (90 dagen) moet geïmplementeerd worden als IHostedService | REEVALUATE FASE-2 (SEC-005): de AVG art. 5 opslagbeperking van 90 dagen voor AuditLog entries is gedocumenteerd maar niet technisch afgedwongen. Besluit: implementeer `AuditLogRotatieService : BackgroundService` in SP-8. Tracked als story SP-8-R002. | 2026-03-02 |
| DEC-105 | ~~KRITIEK~~ | SP-8 / Fase 3 | ✅ GEÏMPLEMENTEERD — OnboardingWizard focus-trap Escape-handler + aria-label | Commit `6a04cf2` (SP-8-UX-001): Escape-key handler (`setVisible(false)`, geen stale-closure), `title` → `aria-label` op sluiten-knop. SC 2.1.1 + 2.1.2 gesloten. Oorspronkelijke focus-trap `useEffect` was al aanwezig — alleen Escape ontbrak. | 2026-03-02 |

---

## Uitgestelde & Vervallen items

| ID | Status | Scope | Onderwerp | Reden | Datum |
|----|--------|-------|-----------|-------|-------|
| DEC-106 | VERVALLEN | SP-8 / Fase 3 | IdleWarningDialog `<DialogContent>`-wrapper | FALSE POSITIVE: `dialog.tsx` is een custom component waarbij `Dialog` zelf `role="dialog"`, `aria-modal`, focus-trap en backdrop bevat. `DialogContent` bestaat niet in deze codebase. Het bestaande patroon (`DialogHeader` + `DialogFooter` als directe children van `Dialog`) was correct. | 2026-03-02 |

---

## Voorbeelden

### Voorbeeld: Open vraag (blokkerend)
| ID | Prioriteit | Scope | Vraag | Jouw antwoord | Datum |
|----|-----------|-------|-------|---------------|-------|
| DEC-002 | HOOG | Fase 2, SP-1 | Welk cloud platform gebruiken we: Azure of AWS? | Azure — gebruik altijd managed services waar mogelijk | 2026-03-01 |

### Voorbeeld: Genomen besluit
| ID | Prioriteit | Scope | Beslissing | Toelichting | Datum |
|----|-----------|-------|-----------|-------------|-------|
| DEC-101 | HOOG | Alle sprints | Geen third-party betaalsystemen integreren buiten Stripe | Compliance vereiste vanuit legal | 2026-03-01 |
