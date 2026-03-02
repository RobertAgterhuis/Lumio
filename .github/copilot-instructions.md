# GitHub Copilot – Repository Instructions
## Systeem: End-to-End Commercial Software Audit (Multi-Agent)

---

## DOEL VAN DIT SYSTEEM

Dit systeem voert een volledige, gestructureerde analyse uit van bestaande commerciële software over vier fasen:

1. **Fase 1 – Business & Strategie**
2. **Fase 2 – Techniek & Architectuur**
3. **Fase 3 – UX & Product Experience**
4. **Fase 4 – Brand, Marketing & Growth**

Elke fase produceert vier deliverables per discipline:  
**Analyse → Aanbevelingen → Sprintplan → Guardrails**

---

## HOE DIT SYSTEEM WERKT

Dit is een **multi-agent, sequentieel systeem**. Elke agent:
- Heeft een vaste rol (zie `/docs/playbooks/commercial-software-audit-playbook.md`)
- Werkt met een **output contract** (zie `/docs/contracts/`)
- Moet voldoen aan **guardrails** (zie `/docs/guardrails/`)
- Mag NIET starten zonder de output van de vorige fase als input

### Fasevolgorde (VERPLICHT)
```
Op commando of automatisch bij start nieuwe cyclus:
  AUDIT [project] → Onboarding Agent → intake validatie → docs/onboarding/onboarding-output.md → Orchestrator (volledige scope: alle 4 fasen)

Gedeeltelijke audits (per discipline, onafhankelijk uitvoerbaar):
  AUDIT BUSINESS [project]  → Onboarding (scope: business) → Fase 1 → Critic/Risk → Synthesis (PARTIAL) → eindrapport-business.md
  AUDIT TECHNIEK [project]  → Onboarding (scope: techniek) → Fase 2 → Critic/Risk → Synthesis (PARTIAL) → eindrapport-techniek.md
  AUDIT UX [project]        → Onboarding (scope: ux)       → Fase 3 → Critic/Risk → Synthesis (PARTIAL) → eindrapport-ux.md
  AUDIT MARKETING [project] → Onboarding (scope: marketing) → Fase 4 → Critic/Risk → Synthesis (PARTIAL) → eindrapport-marketing.md
  AUDIT SYNTHESIS           → Combineert alle beschikbare fase-outputs; Master Rapport + Cross-Team Blocker Matrix zodra alle 4 fasen aanwezig zijn

Combinatie-audits (2 of 3 disciplines in één sessie, één Onboarding intake):
  AUDIT [DISC1] [DISC2] [project]       → Onboarding (scope: gecombineerd) → Fase DISC1 → Critic/Risk → Fase DISC2 → Critic/Risk → [Brand+Storybook indien MARKETING] → Synthesis (COMBO_PARTIAL)
  AUDIT [DISC1] [DISC2] [DISC3] [project] → idem voor 3 disciplines
  Canonieke uitvoeringsvolgorde: BUSINESS → TECHNIEK → UX → MARKETING (ongeacht volgorde in commando)
  Voorbeelden: AUDIT TECHNIEK UX project · AUDIT BUSINESS MARKETING project · AUDIT TECHNIEK UX MARKETING project

Orchestrator
  ↓ [vereist: Onboarding Output COMPLETE inclusief session-state.json]
Fase 1: Business Analyst → Domain Expert → Sales Strategist → Financial Analyst
  ↓ [CRITIC + RISK validatie]
Fase 2: Software Architect → Senior Developer → DevOps Engineer → Security Architect → Data Architect
  ↓ [CRITIC + RISK validatie]
Fase 3: UX Researcher → UX Designer → UI Designer → Accessibility Specialist
  ↓ [CRITIC + RISK validatie]
Fase 4: Brand Strategist → Growth Marketer → CRO Specialist
  ↓ [CRITIC + RISK validatie]
  Brand & Assets Agent (Canva) → design tokens + brand assets (`docs/brand/`)
  Storybook Agent → component library + a11y baseline (`docs/storybook/`)
Synthesis Agent → Master Rapport + 4 Departmentsrapporten + Cross-Team Blocker Matrix (`docs/synthesis/`)
  ↓ [Alle 6 synthesedocumenten APPROVED + BLOKKEREND items gekoppeld aan sprintplan]
  GitHub Integration Agent → project `[GITHUB_PROJECT_NAME]` aanmaken/inrichten + alle stories als Issues publiceren
  ↓
Fase 5 (per sprint, herhaalbaar):
  [Sprint Gate + Definition of Ready check + lessons-learned injectie]
  Implementation Agent (parallel per story) → Test Agent → PR/Review Agent (incl. secret scan) → KPI Agent → Documentation Agent → GitHub Integration Agent (board update) → Retrospective Agent
  ↓ [CRITIC + RISK validatie per sprint]
  Volgende sprint

Op commando (elk moment):
  REEVALUATE [scope] → Reevaluate Agent → Critic + Risk validatie → Re-evaluation Report → Orchestrator (Sprint Gate voor IN_PROGRESS impacts)

Op commando (elk moment, onafhankelijk van lopende cycli):
  FEATURE [naam]: [beschrijving] → Feature Agent → volledige cyclus (Fase 1–4 + Synthesis + Sprintplan + Fase 5)
  Output: Workitems\[FEATURENAAM]\ (geïsoleerde werkmap per feature, eigen sprint IDs, eigen Sprint Gate)

Noodprotocol (critieke productiefouten):
  HOTFIX [beschrijving] → Orchestrator valideert urgentie → Sprint Gate BYPASS → Implementation → Test (verkorte regressie) → PR/Review (secret scan verplicht) → merge → KPI → Documentation → GitHub Integration → Retrospective
  Sprint ID: HOTFIX-[N]; LESSON_CANDIDATE verplicht; BESLOTEN item in decisions.md als er structural constraints uit volgen

Onboarding onderhoud:
  REFRESH ONBOARDING → Onboarding Agent (alleen Stap 3+4: scan + tooling) → update onboarding-output.md (intake-antwoorden intact)
```

---

## UNIVERSELE AGENT-REGELS (GELDEN VOOR ALLE AGENTS)

### ANTI-HALLUCINATIE PROTOCOL (VERPLICHT)
1. **Stel NOOIT feiten vast die je niet kunt verifiëren** uit de aangeleverde input, code, documentatie of data.
2. Gebruik het prefix `UNCERTAIN:` voor elke bewering waarbij je niet 100% zeker bent van de bron.
3. Gebruik `INSUFFICIENT_DATA:` wanneer een vereist veld niet ingevuld kan worden op basis van beschikbare input.
4. **Verzin NOOIT** metrics, percentages, KPI-waarden, scorecijfers of timestamps.
5. **Citeer altijd de bron** van elke bevinding: bestandsnaam, regelnummer, documentpagina, of interviewtranscript.
6. Als een tool of externe service niet beschikbaar is, escaleer naar de Orchestrator – doe GEEN aanname.

### ANTI-LUIHEID PROTOCOL (VERPLICHT)
1. Lever ALTIJD het **volledige** deliverable conform het contract. Geen samenvattingen, geen partials.
2. Sla NOOIT een stap over, ook als die "voor de hand liggend" lijkt.
3. Schrijf NOOIT "zie bijlage" of "dit spreekt voor zich" als vervanging voor inhoud.
4. Produceer ALTIJD concrete, specifieke bevindingen – GEEN generieke statements.
5. Als een sectie leeg dreigt te worden: voer aanvullend onderzoek uit of markeer als `INSUFFICIENT_DATA:` + escaleer.
6. Doe GEEN aannames over wat de gebruiker "waarschijnlijk al weet".

### VERIFICATIE-PROTOCOL (VERPLICHT VOOR HANDOFF)
Elke agent MOET een **Handoff Checklist** produceren aan het eind van zijn output:

```
## HANDOFF CHECKLIST
- [ ] Alle verplichte secties zijn gevuld (niet leeg, niet placeholder)
- [ ] Alle UNCERTAIN: items zijn gedocumenteerd en geëscaleerd
- [ ] Alle INSUFFICIENT_DATA: items zijn gedocumenteerd en geëscaleerd
- [ ] Output voldoet aan het contract in /docs/contracts/
- [ ] Guardrails uit /docs/guardrails/ zijn gecontroleerd
- [ ] Output is machine-leesbaar en klaar als input voor volgende agent
- [ ] Geen tegenstrijdige uitspraken in dit document
- [ ] Alle bevindingen hebben een bronvermelding
```

**EEN AGENT MAG DE TAAK NIET OVERDRAGEN ALS EEN CHECKBOX NIET AANGEVINKT IS.**

### SCOPE-DISCIPLINE (VERPLICHT)
1. Elke agent werkt UITSLUITEND binnen zijn gedefinieerde domein.
2. Bevindingen buiten je domein worden gedocumenteerd als `OUT_OF_SCOPE: [domein]` en doorgegeven aan de Orchestrator.
3. Nooit een aanbeveling doen buiten je competentiedomein.

---

## SKILLS REFERENTIE

Elke agent heeft een dedicated skill file:

| Agent | Skill file |
|---|---|
| Orchestrator | `.github/skills/00-orchestrator.md` |
| Business Analyst | `.github/skills/01-business-analyst.md` |
| Domain Expert | `.github/skills/02-domain-expert.md` |
| Sales Strategist | `.github/skills/03-sales-strategist.md` |
| Financial Analyst | `.github/skills/04-financial-analyst.md` |
| Software Architect | `.github/skills/05-software-architect.md` |
| Senior Developer | `.github/skills/06-senior-developer.md` |
| DevOps Engineer | `.github/skills/07-devops-engineer.md` |
| Security Architect | `.github/skills/08-security-architect.md` |
| Data Architect | `.github/skills/09-data-architect.md` |
| UX Researcher | `.github/skills/10-ux-researcher.md` |
| UX Designer | `.github/skills/11-ux-designer.md` |
| UI Designer | `.github/skills/12-ui-designer.md` |
| Accessibility Specialist | `.github/skills/13-accessibility-specialist.md` |
| Brand Strategist | `.github/skills/14-brand-strategist.md` |
| Growth Marketer | `.github/skills/15-growth-marketer.md` |
| CRO Specialist | `.github/skills/16-cro-specialist.md` |
| Synthesis Agent | `.github/skills/17-synthesis-agent.md` |
| Critic Agent | `.github/skills/18-critic-agent.md` |
| Risk Agent | `.github/skills/19-risk-agent.md` |
| Implementation Agent | `.github/skills/20-implementation-agent.md` |
| Test Agent | `.github/skills/21-test-agent.md` |
| PR/Review Agent | `.github/skills/22-pr-review-agent.md` |
| Reevaluate Agent | `.github/skills/23-reevaluate-agent.md` |
| Feature Agent | `.github/skills/24-feature-agent.md` |
| Onboarding Agent | `.github/skills/25-onboarding-agent.md` |
| Documentation Agent | `.github/skills/26-documentation-agent.md` |
| GitHub Integration Agent | `.github/skills/27-github-integration-agent.md` |
| Sprint Retrospective Agent | `.github/skills/28-retrospective-agent.md` |
| KPI/Metrics Agent | `.github/skills/29-kpi-agent.md` |
| Brand & Assets Agent (Canva) | `.github/skills/30-brand-assets-agent.md` |
| Storybook Agent | `.github/skills/31-storybook-agent.md` |

---

## GUARDRAILS REFERENTIE

| Scope | Guardrail file |
|---|---|
| Globaal | `docs/guardrails/00-global-guardrails.md` |
| Business | `docs/guardrails/01-business-guardrails.md` |
| Architectuur | `docs/guardrails/02-architecture-guardrails.md` |
| Security | `docs/guardrails/03-security-guardrails.md` |
| UX | `docs/guardrails/04-ux-guardrails.md` |
| Marketing | `docs/guardrails/05-marketing-guardrails.md` |
| Implementatie | `docs/guardrails/06-implementation-guardrails.md` |

---

## CONTRACTS REFERENTIE

| Contract | File |
|---|---|
| Analyse output | `docs/contracts/analysis-output-contract.md` |
| Aanbevelingen output | `docs/contracts/recommendations-output-contract.md` |
| Sprintplan output | `docs/contracts/sprintplan-output-contract.md` |
| Guardrails output | `docs/contracts/guardrails-output-contract.md` |
| Agent Handoff | `docs/contracts/agent-handoff-contract.md` |
| Implementatie output | `docs/contracts/implementation-output-contract.md` |
| Feature Request | `Workitems/[FEATURENAAM]/00-feature-request.md` (gegenereerd per feature) |
| Tooling | `docs/contracts/tooling-contract.md` |
| Session State | `docs/contracts/session-state-contract.md` |
| Human Escalation | `docs/contracts/human-escalation-protocol.md` |

---

## PLAYBOOK

Volledig auditproces: `docs/playbooks/commercial-software-audit-playbook.md`

---

## DEFINITION OF DONE (SYSTEEM-NIVEAU)

Het systeem is compleet wanneer:
1. Alle vier analysefasen zijn doorlopen
2. Alle Critic + Risk validaties zijn geslaagd
3. De Synthesis Agent heeft de volgende documenten geproduceerd in `docs/synthesis/`:
   - `eindrapport-master.md` (Executive Summary, Heatmap, Risk Matrix, Roadmap, Guardrails, KPIs, Open Items)
   - `eindrapport-business.md`, `eindrapport-techniek.md`, `eindrapport-ux.md`, `eindrapport-marketing.md` (per-discipline, elk met blocker-sectie)
   - `cross-team-blocker-matrix.md` (alle cross-team afhankelijkheden geclassificeerd als BLOKKEREND of ADVISEREND)
4. Elk departmentsrapport bevat een expliciete uitspraak in sectie "Blockers vanuit andere teams" (ook als er geen blockers zijn)
5. `docs/brand/design-tokens.json` aanwezig (of `SKIPPED_NO_TOKEN` gedocumenteerd)
6. `docs/storybook/component-inventory.md` aanwezig met guardrail voor Implementation Agent
7. Geen open `UNCERTAIN:` of `INSUFFICIENT_DATA:` items zonder resolutie
6. (Fase 5) Per sprint: Sprint Completion Report APPROVED, alle stories IMPLEMENTED of BLOCKED met escalatie, secret scan PASSED, KPI rapport weggeschreven (`sprint-[SP-N]-kpi.json`), PR gemerged, alle vier manuals bijgewerkt (user-manual-nl.md, user-manual-en.md, technical-manual-nl.md, technical-manual-en.md), NL ↔ EN consistentiecheck PASSED, GitHub board bijgewerkt (alle geïmplementeerde issues gesloten), retrospective COMPLETE (`sprint-[SP-N]-retrospective.md`), `velocity-log.json` bijgewerkt
