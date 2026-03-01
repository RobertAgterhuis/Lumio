# Commercial Software Audit – Volledig Playbook
> End-to-end auditproces voor bestaande commerciële software

---

## OVERZICHT

Dit playbook beschrijft het volledige auditproces van A tot Z. Het dekt vijf fasen over 14–17 weken en produceert een eindrapport én geïmplementeerde code met Executive Summary, Capability Heatmap, Risk Matrix, 12-maanden roadmap, Guardrail document, KPI baseline + targets, en Sprint Completion Reports per geïmplementeerde sprint.

**De volgorde is niet onderhandelbaar.** Strategie → Techniek → Ervaring → Groei → Implementatie.

---

## FASE 1: BUSINESS & STRATEGIE (2–3 weken)

### Doelstelling
Volledig begrip van het huidige business model, capabilities, business rules, en strategische positie voordat enige technische of UX analyse start.

### Agents (In Volgorde)
1. **Business Analyst** (skill: `01-business-analyst.md`)
2. **Domain Expert** (skill: `02-domain-expert.md`)
3. **Sales Strategist** (skill: `03-sales-strategist.md`)
4. **Financial Analyst** (skill: `04-financial-analyst.md`)

### Benodigde Input
- Volledige codebase (of toegang daartoe)
- Productdocumentatie (requirements, specs, wiki, README)
- Business documentatie (financieel, pricing, ICP, CRM exports)
- Domein-informatie (industrie, compliance-kader)
- Eventueel: interviews met stakeholders, support ticket data, analytics exports

### Verplichte Output (Fase 1)
```json
{
  "capabilities": [],
  "business_rules": [],
  "risk_assessment": [],
  "kpi_baseline": {},
  "gap_analysis": {
    "market": [],
    "product": [],
    "revenue": [],
    "operations": []
  },
  "priority_matrix": [],
  "icp": {},
  "sales_cycle": [],
  "financial_summary": {}
}
```

### Validatie
Na Fase 1: **Critic Agent** + **Risk Agent** validatie verplicht.  
Fase 2 start NIET zonder beide validaties APPROVED.

---

## FASE 2: TECHNIEK & ARCHITECTUUR (3–4 weken)

### Doelstelling
Volledig beeld van de technische staat van de software: architectuur, codekwaliteit, infra, security, en data — getoetst aan de strategische ambities uit Fase 1.

### Agents (In Volgorde)
1. **Software Architect** (skill: `05-software-architect.md`)
2. **Senior Developer** (skill: `06-senior-developer.md`)
3. **DevOps Engineer** (skill: `07-devops-engineer.md`)
4. **Security Architect** (skill: `08-security-architect.md`)
5. **Data Architect** (skill: `09-data-architect.md`)

### Benodigde Input
- Fase 1 output (volledig)
- Volledige codebase met git history
- CI/CD configuratiebestanden
- Infrastructuur-documentatie / IaC bestanden
- Database schemas
- Security scan output (indien beschikbaar)

### Verplichte Output (Fase 2)
```json
{
  "architecture_gaps": [],
  "tech_debt_score": {"dimensions": {}, "total": 0},
  "scalability_risks": [],
  "security_findings": [],
  "ci_cd_maturity_level": 0,
  "observability_gaps": [],
  "data_lineage_map": {}
}
```

### Validatie
Na Fase 2: **Critic Agent** + **Risk Agent** validatie verplicht.

---

## FASE 3: UX & PRODUCT EXPERIENCE (2–3 weken)

### Doelstelling
Volledig beeld van de gebruikerservaring, getoetst aan de technische kaders uit Fase 2 en de business-doelen uit Fase 1.

### Agents (In Volgorde)
1. **UX Researcher** (skill: `10-ux-researcher.md`)
2. **UX Designer** (skill: `11-ux-designer.md`)
3. **UI Designer** (skill: `12-ui-designer.md`)
4. **Accessibility Specialist** (skill: `13-accessibility-specialist.md`)

### Benodigde Input
- Fase 1 + Fase 2 output (volledig)
- Toegang tot het live product of screenshots/recordings
- Analytics data (pageflows, funnel data)
- Usability test data (indien beschikbaar)
- Design bestanden (Figma, Sketch, etc. – indien beschikbaar)

### Verplichte Output (Fase 3)
```json
{
  "journey_gaps": [],
  "cognitive_load_scores": [],
  "accessibility_score": "WCAG-AA",
  "heuristic_evaluation": [],
  "design_debt_estimate": {},
  "friction_points": []
}
```

### Validatie
Na Fase 3: **Critic Agent** + **Risk Agent** validatie verplicht.

---

## FASE 4: BRAND, MARKETING & GROWTH (2 weken)

### Doelstelling
Optimaliseren van het externe beeld en de groei-strategie op basis van de product-realiteit die in de voorgaande fasen is vastgesteld.

### Agents (In Volgorde)
1. **Brand Strategist** (skill: `14-brand-strategist.md`)
2. **Growth Marketer** (skill: `15-growth-marketer.md`)
3. **CRO Specialist** (skill: `16-cro-specialist.md`)

### Benodigde Input
- Fase 1 t/m Fase 3 output (volledig)
- Marketing materialen (website, sales decks, social media)
- Analytics data (web, advertenties, email)
- CRM data (funnel, conversie)

### Verplichte Output (Fase 4)
```json
{
  "message_alignment_score": 0,
  "funnel_dropoffs": [],
  "experiment_backlog": [],
  "brand_consistency_audit": [],
  "competitive_positioning": {}
}
```

### Validatie
Na Fase 4: **Critic Agent** + **Risk Agent** validatie verplicht.

---

## FASE 5: AUTONOME IMPLEMENTATIE (Doorlopend per sprint)

### Doelstelling
Daadwerkelijke implementatie van de goedgekeurde sprint stories uit Fasen 1–4, volledig autonoom en traceerbaar, met geautomatiseerde tests, guardrail validatie, en Sprint Completion Reports per sprint.

### Agents (Per Sprint, In Volgorde)
1. **Implementation Agent** (skill: `20-implementation-agent.md`) — schrijft code per story
2. **Test Agent** (skill: `21-test-agent.md`) — valideert implementatie tegen acceptatiecriteria
3. **PR/Review Agent** (skill: `22-pr-review-agent.md`) — finale review, PR aanmaken, sprint afsluiten
4. ↓ **Critic Agent** (skill: `18-critic-agent.md`) — validatie sprint output
5. ↓ **Risk Agent** (skill: `19-risk-agent.md`) — risicobeoordeling per sprint

### Benodigde Input
- Synthesis Eindrapport (volledig, Critic + Risk APPROVED)
- Goedgekeurde sprintplannen van alle 16 specialist-agents
- Codebase (lees + schrijf toegang)
- Architectuurbeslissingen Fase 2 (Software Architect + Senior Developer output)
- Guardrails (`docs/guardrails/00–06`)
- Implementation Output Contract (`docs/contracts/implementation-output-contract.md`)

**HALT:** Fase 5 start NOOIT zonder volledig APPROVED Synthesis Eindrapport én gevalideerde sprintplannen (Critic + Risk PASSED per fase).

### Uitvoering Per Sprint

```
Voor elke sprint (SP-1, SP-2, ...):
  1. Orchestrator: activeer stories conform sprintplan (parallel tracks = gelijktijdig)
  2. Per story: Implementation Agent → Test Agent (retour bij REJECTED)
  3. Na alle stories: PR/Review Agent assembleert sprint PR
  4. Critic Agent valideert Sprint Completion Report
  5. Risk Agent beoordeelt nieuwe findings
  6. Bij PASSED: merge PR, activeer volgende sprint
  7. Bij FAILED: retour naar Implementation Agent per bevinding
```

### Parallelle Tracks

Stories in dezelfde sprint die GEEN onderlinge afhankelijkheden hebben (geïdentificeerd in Stap F2 van de sprintplannen) worden **gelijktijdig** door meerdere Implementation Agent instanties opgepakt. De PR/Review Agent assembleert alle story-outputs in één sprint PR nadat alle stories APPROVED zijn.

### Verplichte Output (Per Sprint)
```json
{
  "sprint_id": "SP-N",
  "sprint_goal": "",
  "stories_implemented": [],
  "sprint_completion_report": {},
  "pr_url": "",
  "kpi_measurement": {},
  "new_critical_findings": [],
  "blockers_open": [],
  "critic_status": "PASSED | FAILED",
  "risk_status": "PASSED | FAILED"
}
```

### Validatie Per Sprint
Na elke sprint: **Critic Agent** + **Risk Agent** validatie verplicht.  
Volgende sprint start NIET zonder beide validaties APPROVED.

---

## SYNTHESE (1 week)

### Doelstelling
Consolidatie van alle fase-outputs in één coherent eindrapport voor besluitmakers.

### Agent
**Synthesis Agent** (skill: `17-synthesis-agent.md`)

### Verplichte Output (Eindrapport)
1. Executive Summary (board-level, max 2 pagina's)
2. Capability Heatmap
3. Risk Matrix (geconsolideerd)
4. 12-maanden roadmap
5. Gecombineerd Guardrail Document
6. KPI Baseline + Target Dashboard
7. Open Items Register

---

## GOVERNANCE STRUCTUUR

| Overleg | Frequentie | Deelnemers | Doel |
|---------|-----------|------------|------|
| Agent Handoff Review | Per handoff | Orchestrator | Kwaliteitscontrole |
| Fase Review | Einde van elke fase | Critic + Risk + Orchestrator | Go/No-Go beslissing |
| Stakeholder Update | Wekelijks | Product owner / opdrachtgever | Voortgangsrapportage |
| Eindpresentatie | Week 12 | Alle stakeholders | Eindrapport presentatie |

---

## TIJDSINDICATIE

| Fase | Duur |
|------|------|
| Fase 1: Business & Strategie | 2–3 weken |
| Fase 2: Techniek & Architectuur | 3–4 weken |
| Fase 3: UX & Product Experience | 2–3 weken |
| Fase 4: Brand, Marketing & Growth | 2 weken |
| Synthese & Roadmap | 1 week |
| Fase 5: Implementatie (per sprint) | 2 weken/sprint × [n sprints] |
| **Totaal (analyse + eerste sprint)** | **12–14 weken** |

---

## DEFINITION OF DONE (SYSTEEM)

Het auditproces is COMPLEET wanneer:
1. Alle vier analysefasen zijn Critic + Risk APPROVED
2. De Synthesis Agent het eindrapport heeft geproduceerd
3. Het eindrapport alle 7 verplichte onderdelen bevat
4. Geen open `CRITICAL_FINDING` of `CRITICAL_GAP` items zonder resolutie
5. Geen open `CRITICAL_MISALIGNMENT` items zonder resolutie
6. KPI baseline is gedocumenteerd (of `INSUFFICIENT_DATA:` met escalaties opgelost)

Het implementatieproces (Fase 5) is COMPLEET per sprint wanneer:
7. Alle stories in de sprint zijn IMPLEMENTED of BLOCKED (met escalatie)
8. Sprint Completion Report JSON is aanwezig en APPROVED door Critic + Risk Agent
9. KPI-meting per sprint is uitgevoerd en gedocumenteerd
10. Geen nieuwe `CRITICAL_FINDING` zonder resolutie in de sprint-output
11. De PR is gemerged in de main branch

---

## KERNPRINCIPE

> **Optimaliseren zonder strategische validatie leidt tot lokale verbeteringen zonder structurele waarde.**

De volgorde:  
**Strategie → Techniek → Ervaring → Groei → Implementatie**

is bewust en onwijzigbaar.
