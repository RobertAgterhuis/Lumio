# Agent Handoff Contract
> Versie: 1.0 | Van toepassing op ELKE overdracht van output tussen agents

---

## DOEL
Dit contract definieert de verplichte handoff-procedure die elke agent moet voltooien voordat zijn output naar de volgende agent gaat.
Een handoff is NIET geldig als dit contract niet volledig is afgewerkt.

---

## HANDOFF PROCEDURE (VERPLICHT IN DEZE VOLGORDE)

### Stap 1: Zelfcontrole Uitvoeren
Voordat je een handoff declareert, voer je een expliciete zelfcontrole uit:

```
1. Lees je volledige output door van begin tot eind
2. Controleer elke sectie op volledigheid (geen lege secties, geen placeholders)
3. Controleer elke bevinding op bronvermelding
4. Controleer of het JSON schema valide is (syntactisch correct, alle verplichte velden aanwezig)
5. Controleer interne consistentie (geen tegenstrijdige uitspraken)
6. Controleer of je output de volgende agent van voldoende input voorziet
```

**Als je stap 1 niet kunt voltooien:** Stop, herstel de output, en herhaal stap 1.

### Stap 2: Handoff Checklist Invullen
Produceer de handoff checklist als laatste sectie van je output:

```markdown
## HANDOFF CHECKLIST – [Agent naam] – [Datum]

### Deliverables Volledigheid
- [ ] Analyse-document aanwezig en conform analysis-output-contract.md
- [ ] Aanbevelingen-document aanwezig en conform recommendations-output-contract.md
- [ ] Sprintplan aanwezig en conform sprintplan-output-contract.md
- [ ] Guardrails aanwezig en conform guardrails-output-contract.md

### Kwaliteitscontrole
- [ ] Alle bevindingen hebben een concrete bronvermelding
- [ ] Geen lege secties of placeholder tekst
- [ ] Geen gegenereerde/verzonnen metrics of KPI-waarden
- [ ] Alle UNCERTAIN: items zijn gedocumenteerd
- [ ] Alle INSUFFICIENT_DATA: items zijn gedocumenteerd en geëscaleerd
- [ ] Interne consistentie gecontroleerd (geen tegenstrijdige uitspraken)

### Input voor Volgende Agent
- [ ] JSON export beschikbaar en syntactisch valide
- [ ] Alle vereiste input-velden voor volgende agent zijn aanwezig
- [ ] Geblokkeerde items zijn gemarkeerd en geëscaleerd
- [ ] Cross-domain bevindingen zijn doorgestuurd naar Orchestrator

### Guardrails Compliance
- [ ] Global guardrails (00-global-guardrails.md) zijn nageleefd
- [ ] Domein-specifieke guardrails zijn nageleefd
- [ ] Geen GUARDRAIL_VIOLATION items onopgelost

### Finale Verklaring
- [ ] EEN AGENT MAG DE TAAK NIET OVERDRAGEN ALS EEN CHECKBOX NIET IS AANGEVINKT.
- STATUS: GEREED VOOR HANDOFF / GEBLOKKEERD (doorhalen wat niet van toepassing is)
- Onopgeloste items: [lijst of "geen"]
```

### Stap 3: Blokkerende Items Afhandelen
Als één of meer items in de checklist NIET zijn aangevinkt:
1. Documenteer het blokkerend item
2. Herstel het item als je dit zelf kunt doen
3. Escaleer naar Orchestrator als externe input nodig is
4. Herhaal stap 1

**NOOIT een handoff uitvoeren met openstaande checklist-items.**

### Stap 4: Handoff Bericht Produceren

```json
{
  "handoff": {
    "from_agent": "string",
    "to_agent": "string | orchestrator",
    "phase_completed": "1 | 2 | 3 | 4",
    "date": "ISO 8601",
    "status": "READY | BLOCKED",
    "blocked_reason": "string | null",
    "deliverables": {
      "analysis": "path/to/analysis.md",
      "recommendations": "path/to/recommendations.md",
      "sprintplan": "path/to/sprintplan.md",
      "guardrails": "path/to/guardrails.md",
      "json_export": "path/to/export.json"
    },
    "uncertain_items": ["UNC-001"],
    "insufficient_data_items": ["IND-001"],
    "cross_domain_flags": ["OUT_OF_SCOPE: [domein]"],
    "security_flags": ["SECURITY_FLAG: [beschrijving]"],
    "checklist_complete": true
  }
}
```

---

## FASE-OVERGANGEN EN VALIDATIE

| Van | Naar | Vereiste validatie |
|-----|------|--------------------|
| Fase 1 → Fase 2 | Architect | Critic Agent + Risk Agent validatie VERPLICHT |
| Fase 2 → Fase 3 | UX Researcher | Critic Agent + Risk Agent validatie VERPLICHT |
| Fase 3 → Fase 4 | Brand Strategist | Critic Agent + Risk Agent validatie VERPLICHT |
| Fase 4 → Synthesis | Synthesis Agent | Critic Agent + Risk Agent validatie VERPLICHT |
| Elke agent → Volgende in fase | Volgende agent | Handoff checklist VERPLICHT |

---

## ESCALATIEPAD

```
Agent kan handoff niet voltooien
  ↓
Documenteer blokkerend item in handoff bericht
  ↓
status: "BLOCKED"
  ↓
Orchestrator ontvangt geblokkeerd handoff bericht
  ↓
Orchestrator bepaalt: oplossen / alternatief pad / escaleer naar mens
```
