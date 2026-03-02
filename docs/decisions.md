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
| — | — | — | Geen open vragen | — | — |

---

## Genomen Besluiten (agents volgen dit op)

| ID | Prioriteit | Scope | Beslissing | Toelichting | Datum |
|----|-----------|-------|-----------|-------------|-------|
| DEC-101 | HOOG | Alle sprints, CI/CD | Chromatic visual regression uitgeschakeld | Bewuste keuze (DEC-101 gedocumenteerd in `chromatic.config.json`); mag NIET blokkerend zijn voor andere sprints; alternatief visual regression tooling optioneel na v1.0 | 2026-03-02 |
| DEC-102 | HOOG | Alle sprints | Geen nieuwe PostHog-implementatie; bestaand gebruik toegestaan | Geen nieuwe PostHog events of uitbreidingen implementeren. Bestaand `lumio_activated` event mag blijven. REC-UX-004 (`lumio_partial_activation`) is GECANCELD (VERVALLEN). SP-UX-01-005 is VERVALLEN. | 2026-03-02 |
| DEC-103 | HOOG | Alle sprints | Feature branch strategie: maximaal 1 actieve feature branch naast main | Altijd Squash Merge naar main voordat een nieuwe feature branch wordt aangemaakt. Naast main is op elk moment maximaal 1 actieve feature branch aanwezig. | 2026-03-02 |
| DEC-104 | HOOG | Alle sprints, CI/CD | Main branch beschermd via GitHub Ruleset "ProtectLumio" | PRs vanuit feature branches naar main zijn toegestaan; directe pushes naar main zijn geblokkeerd. Als protection ruleset afwezig is, opnieuw instellen vóór merge. | 2026-03-02 |
| DEC-105 | HOOG | Fase 2/3, Security | `unsafe-inline` in CSP is een harde architectuurconstraint (SECURITY_FLAG: GAP-ARCH-002) | Next.js static export (`output: "export"`) injecteert inline hydration scripts bij build. Verwijdering breekt de applicatie. `unsafe-inline` MOET blijven totdat volledige SSR-migratie (SP-15+) compleet is. Gedocumenteerd in `src/lumio-web/src/app/layout.tsx` L38-44. | 2026-03-02 |

---

## Uitgestelde & Vervallen items

| ID | Status | Scope | Onderwerp | Reden | Datum |
|----|--------|-------|-----------|-------|-------|
| DEC-201 | UITGESTELD | SP-11, DevOps | EV Code Signing Certificate aanvraag | Uitgesteld totdat development team gereed is; mag NIET blokkerend zijn voor andere sprints. SP-11-002 wordt niet geblokkeerd door het ontbreken van cert; GitHub URL: https://github.com/RobertAgterhuis/Lumio | 2026-03-02 |
| DEC-202 | UITGESTELD | SP-14, Security | Penetratietest | Niet blokkerend. Wordt pas aangevraagd en uitgevoerd aan het einde van de ontwikkelcyclus indien van toepassing. SP-14-002 heeft geen v1.0 release gate meer. | 2026-03-02 |

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
