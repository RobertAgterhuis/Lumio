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
Orchestrator
  ↓
Fase 1: Business Analyst → Domain Expert → Sales Strategist → Financial Analyst
  ↓ [CRITIC + RISK validatie]
Fase 2: Software Architect → Senior Developer → DevOps Engineer → Security Architect → Data Architect
  ↓ [CRITIC + RISK validatie]
Fase 3: UX Researcher → UX Designer → UI Designer → Accessibility Specialist
  ↓ [CRITIC + RISK validatie]
Fase 4: Brand Strategist → Growth Marketer → CRO Specialist
  ↓ [CRITIC + RISK validatie]
Synthesis Agent → Eindrapport
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

---

## CONTRACTS REFERENTIE

| Contract | File |
|---|---|
| Analyse output | `docs/contracts/analysis-output-contract.md` |
| Aanbevelingen output | `docs/contracts/recommendations-output-contract.md` |
| Sprintplan output | `docs/contracts/sprintplan-output-contract.md` |
| Guardrails output | `docs/contracts/guardrails-output-contract.md` |
| Agent Handoff | `docs/contracts/agent-handoff-contract.md` |

---

## PLAYBOOK

Volledig auditproces: `docs/playbooks/commercial-software-audit-playbook.md`

---

## DEFINITION OF DONE (SYSTEEM-NIVEAU)

Het systeem is compleet wanneer:
1. Alle vier fasen zijn doorlopen
2. Alle Critic + Risk validaties zijn geslaagd
3. De Synthesis Agent heeft het eindrapport geproduceerd
4. Het eindrapport bevat: Executive Summary, Capability Heatmap, Risk Matrix, 12-maanden roadmap, Guardrail document, KPI baseline + target
5. Geen open `UNCERTAIN:` of `INSUFFICIENT_DATA:` items zonder resolutie
