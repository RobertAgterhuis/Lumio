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
| DEC-113 | HOOG | SP-3+, Marketing, Analytics | Welk analytics-tool vervangt Plausible op `lumio-legacy.nl`? DEC-109 verwijderde Plausible; DEC-102 verbiedt nieuwe PostHog-events. Geen analytics-stories kunnen worden ingepland zonder dit besluit. Opties: (a) Plausible heradoptie na GDPR/AVG-review + DPA-afsluiting; (b) Fathom of Simple Analytics (privacy-first, geen DPA vereist); (c) Google Analytics 4 (vereist cookie consent banner + DPA). Blokkeert: alle conversion optimization-, A/B testing- en SEO-meetstories op `site/`. | *(vul jouw keuze in)* | 2026-03-03 |

---

## Genomen Besluiten (agents volgen dit op)

| ID | Prioriteit | Scope | Beslissing | Toelichting | Datum |
|----|-----------|-------|-----------|-------------|-------|
| DEC-101 | HOOG | Alle sprints, CI/CD | Chromatic visual regression uitgeschakeld | Bewuste keuze (DEC-101 gedocumenteerd in `chromatic.config.json`); mag NIET blokkerend zijn voor andere sprints; alternatief visual regression tooling optioneel na v1.0 | 2026-03-02 |
| DEC-102 | HOOG | Alle sprints | Geen nieuwe PostHog-implementatie; bestaand gebruik toegestaan | Geen nieuwe PostHog events of uitbreidingen implementeren. Bestaand `lumio_activated` event mag blijven. REC-UX-004 (`lumio_partial_activation`) is GECANCELD (VERVALLEN). SP-UX-01-005 is VERVALLEN. | 2026-03-02 |
| DEC-103 | HOOG | Alle sprints | Feature branch strategie: maximaal 1 actieve feature branch naast main | Altijd Squash Merge naar main voordat een nieuwe feature branch wordt aangemaakt. Naast main is op elk moment maximaal 1 actieve feature branch aanwezig. | 2026-03-02 |
| DEC-104 | HOOG | Alle sprints, CI/CD | Main branch beschermd via GitHub Ruleset "ProtectLumio" | PRs vanuit feature branches naar main zijn toegestaan; directe pushes naar main zijn geblokkeerd. Als protection ruleset afwezig is, opnieuw instellen vóór merge. | 2026-03-02 |
| DEC-105 | HOOG | Fase 2/3, Security | `unsafe-inline` in CSP is een harde architectuurconstraint (SECURITY_FLAG: GAP-ARCH-002) | Next.js static export (`output: "export"`) injecteert inline hydration scripts bij build. Verwijdering breekt de applicatie. `unsafe-inline` MOET blijven totdat volledige SSR-migratie (SP-15+) compleet is. Gedocumenteerd in `src/lumio-web/src/app/layout.tsx` L38-44. | 2026-03-02 |
| DEC-106 | MIDDEL | Security, Alle sprints | Geen SSR-migratie voor nonce-based CSP — REC-SEC-001 geaccepteerd risico | Post-pentest aanbeveling REC-SEC-001 adviseert nonce-based CSP via SSR (Next.js Server Components of `next start`). Voor de huidige setup (Electron desktop + static export, lokale SQLite, geen publieke hosting) is SSR-migratie disproportioneel en niet noodzakelijk. Het risico van `unsafe-inline` zonder nonce is geaccepteerd: aanvalsoppervlak is beperkt tot de lokale machine van de gebruiker. SSR-migratie blijft een optie voor een toekomstige web/SaaS-variant maar is geen vereiste voor v1.0. Geen verdere actie op REC-SEC-001 in huidige ontwikkelcyclus. | 2026-03-02 |
| DEC-107 | HOOG | SP-UX-03, A11y | Sidebar `<h1>Lumio</h1>` gewijzigd naar `<p>` (SP-UX-03-002) | Elke authenticated pagina had twee `<h1>`-elementen: één in de sidebar (branding "Lumio") en één als paginatitel in de content. Dubbele h1 schendt best practice `page-has-heading-one`. De sidebar-branding is visueel label, geen document-structuur; gewijzigd naar `<p>` met behoud van identieke styling. `<h2>` navegatiegroepen in sidebar blijven — deze zijn scoped binnen `<nav>` landmark. Fix: `Sidebar.tsx` L133 (SP-UX-02-006 escalatie opgelost in SP-UX-03-002). | 2026-03-05 |
| DEC-110 | HOOG | Alle sprints — CI/CD | Geen nieuwe of her-activated CI checks; alleen lokale checks toegestaan | Totdat nader bericht volgt: geen nieuwe GitHub Actions workflows aanmaken, geen bestaande workflows heractiveren, geen billing-afhankelijke CI gates introduceren. Enige toegestane quality gate is lokaal: `dotnet test`, `npm run build`, `npx tsc --noEmit`. SP-1-007 (CI billing) en SP-1-002 (nightly test script) zijn hiermee VERVALLEN voor de huidige sprint. Impacts: TruffleHog pre-push hook (.githooks/pre-push) blijft — dit is lokaal, niet CI. Toekomstige CI-activering vereist een nieuw besluit in dit bestand. | 2026-03-03 |
| DEC-109 | HOOG | Alle sprints — Analytics, Marketing | Plausible.io volledig verwijderd uit de solution | Scope Change: geen Plausible-integratie in `site/` of `src/lumio-web/`. Script-tag verwijderd uit `site/src/app/layout.tsx`. SP-1-017 (Plausible custom goals) vervallen. PostHog in `src/lumio-web/` blijft — zie DEC-102 (alleen bestaand gebruik). Toekomstige analytics op de marketingsite vereist een apart besluit. `devdocs/plausible-custom-goals.md` verwijderd. | 2026-03-03 |
| DEC-108 | HOOG | Alle sprints — Security, Auth middleware | Elk API-endpoint dat bereikbaar moet zijn vóór DB-ontgrendeling MOET worden opgenomen in `AllowedPrefixes` in `DatabaseUnlockMiddleware.cs` | BUG-SHAMIR-001 toonde aan dat `/api/v1/shamir/reconstrueer-en-ontgrendel` ontbrak in de `AllowedPrefixes` whitelist. Daardoor retourneerde de middleware HTTP 423 voordat het ontgrendelingsverzoek de controller bereikte — erfgenamen konden per definitie nooit inloggen. Fix: endpoint toegevoegd aan whitelist met beveiligingscommentaar. Veilig: het endpoint valideert zelf via Shamir-reconstructie + PBKDF2. Structurele constraint: toekomstige auth/unlock-endpoints (bv. SSO callback, reset flow) moeten dit patroon volgen. Geen logicawijziging in de middleware zelf, alleen whitelist-uitbreiding. `DatabaseUnlockMiddleware.cs` L8–17. Agent 08 moet `security-handoff-context.md` bijwerken vóór de volgende Sprint Gate (SECURITY_HANDOFF_STATUS: UPDATE_REQUIRED). REC-SEC-005: schrijf integration test die verifieert dat `AllowedPrefixes` de verwachte endpoints bevat. | 2026-03-03 |
| DEC-111 | HOOG | Alle sprints — Analytics, Marketing | SP-04-005 (Plausible analytics events / EXP-003) is CANCELLED / SUPERSEDED | DEC-109 verwijderde Plausible; DEC-102 verbiedt nieuwe PostHog-events. SP-04-005 kan om geen van beide redenen worden geïmplementeerd. Implementation Agent mag geen analytics-events op `site/` plannen zonder een nieuw DECIDED item (DEC-113 moet eerst worden beantwoord). REC-CRO-003 en REC-G-002 zijn SUPERSEDED. Story SP-04-005 is definitief geannuleerd uit de backlog. | 2026-03-03 |
| DEC-112 | MIDDEL | Alle sprints — CI/CD, Risk | SYS-RISK-002 (CI uitgeschakeld) is hereclassificeerd als ACCEPTED_RISK conform DEC-110 | DEC-110 formaliseert de keuze om CI uitgeschakeld te houden. SYS-RISK-002 is geen actief te-fixen backlog-item meer en mag niet als CRITICAL blocker worden behandeld. Enige quality gate is lokaal: `dotnet test` + `npm run build` + `npx tsc --noEmit`. Periodieke review bij elke Sprint Gate. CI-heractivering vereist een nieuw of gewijzigd besluit in dit bestand. | 2026-03-03 |

---

## Uitgestelde & Vervallen items

| ID | Status | Scope | Onderwerp | Reden | Datum |
|----|--------|-------|-----------|-------|-------|
| DEC-203 | VERVALLEN | SP-1, CI/CD | SP-1-007 CI billing + SP-1-002 nightly test | DEC-110: geen CI checks totdat nader bericht. Heropenen vereist nieuw besluit. | 2026-03-03 |
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
