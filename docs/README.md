# devAgentic – End-to-End Commercial Software Audit

Een **multi-agent systeem** voor de volledige analyse, aanbevelingen en implementatie van commerciële software. Het team bestaat uit 30 gespecialiseerde AI-agents die sequentieel samenwerken, elk met een vaste rol, eigen skill file en output contract.

---

## Wat doet dit team?

Het systeem voert in vijf fasen een gestructureerde audit uit van bestaande of te bouwen software:

| Fase | Inhoud | Agents |
|------|--------|--------|
| **1 – Business & Strategie** | Marktpositie, verdienmodel, sales, financiën | Business Analyst, Domain Expert, Sales Strategist, Financial Analyst |
| **2 – Techniek & Architectuur** | Codebase, architectuur, DevOps, security, data | Software Architect, Senior Developer, DevOps Engineer, Security Architect, Data Architect |
| **3 – UX & Product Experience** | Gebruiksonderzoek, UX/UI design, toegankelijkheid | UX Researcher, UX Designer, UI Designer, Accessibility Specialist |
| **4 – Brand, Marketing & Growth** | Merkstrategie, groei, conversie | Brand Strategist, Growth Marketer, CRO Specialist |
| **5 – Implementatie (per sprint)** | Sprint-voor-sprint realisatie van de roadmap | Implementation, Test, PR/Review, KPI, Documentation, GitHub Integration, Retrospective |

Elke fase levert vier vaste deliverables: **Analyse → Aanbevelingen → Sprintplan → Guardrails**.  
Na alle fasen stelt de Synthesis Agent **zes documenten** op in `docs/synthesis/`:

| Bestand | Inhoud | Doelgroep |
|---------|--------|----------|
| `eindrapport-master.md` | Executive Summary, Heatmap, Risk Matrix, 12-maanden Roadmap, KPIs | Board, directie |
| `eindrapport-business.md` | Bevindingen, aanbevelingen, roadmap-items, KPIs en blockers voor Business | Business, Sales, Finance |
| `eindrapport-techniek.md` | Idem voor Techniek & Architectuur | Engineering, DevOps, Security |
| `eindrapport-ux.md` | Idem voor UX & Product | UX/UI, Product owners |
| `eindrapport-marketing.md` | Idem voor Brand & Marketing | Marketing, Growth, CRO |
| `cross-team-blocker-matrix.md` | Alle cross-team afhankelijkheden (BLOKKEREND / ADVISEREND) | Alle teams + Orchestrator |

Elk departmentsrapport is volledig zelfstandig leesbaar en bevat een verplichte **"Blockers vanuit andere teams"** sectie, zodat iedere afdeling direct kan handelen zonder het volledige masterrapport te hoeven doorlezen.

---

## Hoe gebruik je dit team?

### Stap 1 — Start een audit

Kies de gewenste scope:

| Commando | Wat er happens |
|----------|----------------|
| `AUDIT [project]` | Volledige audit: alle 4 disciplines, Master Rapport + 4 departmentsrapporten + Cross-Team Blocker Matrix |
| `AUDIT BUSINESS [project]` | Alleen Fase 1 (Business & Strategie) → `eindrapport-business.md` |
| `AUDIT TECHNIEK [project]` | Alleen Fase 2 (Tech & Architectuur) → `eindrapport-techniek.md` |
| `AUDIT UX [project]` | Alleen Fase 3 (UX & Product) → `eindrapport-ux.md` |
| `AUDIT MARKETING [project]` | Alleen Fase 4 (Brand & Marketing) → `eindrapport-marketing.md` |
| `AUDIT [DISC1] [DISC2] [project]` | **Combinatie-audit:** 2 (of 3) disciplines in één sessie via één Onboarding intake — bijv. `AUDIT TECHNIEK UX MijnProject`. Disciplines worden altijd in canonieke volgorde uitgevoerd. Levert beide departmentsrapporten op. |
| `AUDIT SYNTHESIS` | Samenvoegen van meerdere eerdere partiele audits tot gecombineerd rapport |

De **Onboarding Agent** stelt een reeks intakevragen (doelgroep, technische stack, GitHub project naam, etc.) en legt de antwoorden vast in `docs/session/session-state.json`. Bij een gedeeltelijke audit worden alleen de vragen gesteld die relevant zijn voor de opgegeven discipline. Daarna neemt de **Orchestrator** het over en stuurt alle fases aan.

> Wil je meerdere disciplines in één keer uitvoeren? Gebruik dan een **combinatie-audit**: `AUDIT TECHNIEK UX MijnProject`. Eén Onboarding intake, disciplines worden sequentieel uitgevoerd in canonieke volgorde (BUSINESS → TECHNIEK → UX → MARKETING).

> Gedeeltelijke audits op hetzelfde project worden automatisch gecombineerd. Na twee of meer partiele audits kun je `AUDIT SYNTHESIS` uitvoeren om een gecombineerd rapport en de Cross-Team Blocker Matrix te produceren.

> Zorg dat je de intakevragen volledig beantwoordt — de kwaliteit van de hele audit staat of valt bij de onboarding input.

---

### Stap 2 — Volg de fasevolgorde

De Orchestrator stuurt elke agent aan in de verplichte volgorde. Je hoeft zelf niets te routeren. Elke agent:
- Leest de output van de vorige fase
- Produceert zijn deliverables als Markdown/JSON bestanden
- Sluit af met een **Handoff Checklist** — de volgende agent start pas als alles aangevinkt is

Na elke fase valideren de **Critic Agent** en **Risk Agent** de output. Bij twijfels of onvoldoende data zie je `UNCERTAIN:` of `INSUFFICIENT_DATA:` prefixen — die worden geëscaleerd naar jou voordat de volgende fase start.

---

### Stap 3 — Sprint-implementatie (Fase 5)

Na goedkeuring van het eindrapport publiceert de **GitHub Integration Agent** alle stories als Issues in jouw GitHub project. Daarna start Fase 5:

```
Sprint Gate (Definition of Ready + lessons-learned injectie)
  → Implementation Agent → Test Agent → PR/Review Agent (secret scan)
  → KPI Agent → Documentation Agent → GitHub Integration Agent → Retrospective Agent
  → Volgende sprint
```

Elke sprint sluit af met een retrospective en KPI-meting die automatisch worden meegenomen naar de volgende sprint.

---

### Op elk moment — Feature of herbeoordeling

```
FEATURE [naam]: [beschrijving]
```
Start een geïsoleerde cyclus (Fase 1–5) voor één nieuwe feature. Output belandt in `Workitems/[FEATURENAAM]/`.

```
REEVALUATE [scope]
```
Herbeoordeelt een eerder onderdeel (bijv. na een grote technische wijziging). Genereert een Re-evaluation Report en injecteert impacts in de lopende Sprint Gate.

---

## Projectstructuur

```
.github/
  copilot-instructions.md   ← Systeem-instructies voor de Orchestrator
  skills/                   ← Eén skill file per agent (00-orchestrator.md … 29-kpi-agent.md)

docs/
  contracts/                ← Output contracts per deliverable type
  guardrails/               ← Guardrail bestanden per domein (business, security, UX, …)
  playbooks/                ← Volledig auditproces (commercial-software-audit-playbook.md)
  retrospectives/           ← Sprint retrospectives + velocity-log + lessons-learned (cumulatief)
  metrics/                  ← KPI baseline + sprint KPI rapporten + trend dashboard
  session/                  ← session-state.json (gegenereerd door Onboarding Agent)
  security/                 ← Secret scan rapporten per sprint
  decisions.md              ← Jouw beslissingen & open vragen — door de Orchestrator gelezen bij elke Sprint Gate
  brand/
    design-tokens.json      ← W3C design tokens (kleuren, typografie, spacing) uit Canva
    brand-assets-rapport.md ← Overzicht van brand kit, asset-URLs en token-status
    assets/                 ← Geëxporteerde PNG/SVG brand assets (logo, banners, social cards)
  storybook/
    component-inventory.md  ← Enige geldige lijst van goedgekeurde UI-componenten (guardrail)
    storybook-setup-rapport.md ← Storybook configuratie en a11y baseline

Workitems/
  [FEATURENAAM]/            ← Geïsoleerde werkmap per FEATURE-commando
```

---

## Beslissingen & Open Vragen (`docs/decisions.md`)

Dit is jouw directe communicatiekanaal met het Agentic Team. Je vult het zelf in; agents passen hun gedrag automatisch aan.

| Status | Wat de Orchestrator doet |
|--------|-------------------------|
| `OPEN` + prioriteit `HOOG` + sprint raakt scope | **Sprint Gate blokkeert** totdat jij antwoord geeft in het bestand |
| `OPEN` + prioriteit `MIDDEL/LAAG` | Melding bij Sprint Gate, geen blokkering |
| `BESLOTEN` | Wordt als harde constraint geïnjecteerd bij alle relevante agents |
| `UITGESTELD` / `VERVALLEN` | Wordt genegeerd |

Elke beslissing of vraag krijgt een uniek ID (`DEC-NNN`), een scope (bijv. `Fase 2`, `SP-3`, `Alle sprints`) en een prioriteit. Zie [docs/decisions.md](docs/decisions.md) voor het ingevulde sjabloon met voorbeelden.



| Regel | Wat het betekent |
|-------|-----------------|
| **Anti-hallucinatie** | Agents verzinnen nooit feiten. Onzekere beweringen krijgen het prefix `UNCERTAIN:` |
| **Bronvermelding verplicht** | Elke bevinding verwijst naar bestand, regelnummer of document |
| **Immutable sprint-bestanden** | `sprint-[SP-N]-*.md` en `sprint-[SP-N]-*.json` worden nooit overschreven na aanmaak |
| **Secret scan als merge-gate** | PR/Review Agent blokkeert de merge bij gevonden secrets (TruffleHog) |
| **Fasevolgorde is verplicht** | Een agent mag nooit starten zonder de output van de vorige fase als input |
| **Handoff Checklist** | Elke agent controleert zijn eigen output volledig voor overdracht — geen partials || **Storybook als design system** | Implementation Agent mag alleen componenten uit `docs/storybook/component-inventory.md` gebruiken. Nieuwe componenten vereisen eerst een Storybook story + a11y check |
| **decisions.md is leidend** | Beslissingen in `docs/decisions.md` gaan altijd voor agent-aannames; HOOG-prioriteit open vragen blokkeren sprint-start |
---

## Agents overzicht

Alle skill files staan in `.github/skills/`. De nummering volgt de uitvoeringsvolgorde:

`00` Orchestrator · `01–04` Fase 1 · `05–09` Fase 2 · `10–13` Fase 3 · `14–16` Fase 4 · `17` Synthesis · `18` Critic · `19` Risk · `20` Implementation · `21` Test · `22` PR/Review · `23` Reevaluate · `24` Feature · `25` Onboarding · `26` Documentation · `27` GitHub Integration · `28` Sprint Retrospective · `29` KPI/Metrics · `30` Brand & Assets (Canva) · `31` Storybook
