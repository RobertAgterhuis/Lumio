# Aanbevelingen Output Contract
> Versie: 1.0 | Van toepassing op alle aanbevelingen-deliverables van alle agents

---

## DOEL
Dit contract definieert de verplichte structuur en kwaliteitseisen voor de **Aanbevelingen**-deliverable.
Elke aanbeveling moet onderbouwd, meetbaar en afhankelijkheidsbewust zijn.

---

## VERPLICHT SCHEMA

### MARKDOWN STRUCTUUR

```markdown
# Aanbevelingen – [Discipline] – [Datum]

## Metadata
- Agent: [naam]
- Fase: [1 / 2 / 3 / 4]
- Gebaseerd op analyse: [referentie naar analyse-document]
- Datum: [ISO 8601]

## Aanbeveling [REC-NNN]

### Probleem
[Concrete beschrijving van het probleem – verwijs naar bevinding ID uit analyse]
**Analyse referentie:** [GAP-NNN / RISK-NNN / CS-NNN]

### Oplossing
[Concrete, specifieke oplossing – niet generiek]
**Implementatie-aanpak:**
1. Stap 1: [wat, hoe, door wie, wanneer]
2. Stap 2: [...]

### Impact
| Dimensie | Verwacht effect | Rationale |
|----------|----------------|-----------|
| Revenue | [bedrag / % / INSUFFICIENT_DATA:] | [onderbouwing of databron] |
| Risk Reductie | [beschrijving + niveau] | [onderbouwing] |
| Cost | [bedrag / % / INSUFFICIENT_DATA:] | [onderbouwing] |
| UX | [beschrijving] | [onderbouwing] |

### Rationale
[Theoretisch kader, bewezen aanpak, of data die de keuze onderbouwt]

### Afhankelijkheden
- Vereist: [andere aanbeveling / technische vereiste / externe factor]
- Geblokkeerd door: [als van toepassing]
- Afhankelijk van output van: [agent naam als van toepassing]

### Risico's van niet uitvoeren
[Wat zijn de gevolgen als deze aanbeveling NIET wordt geïmplementeerd]

### Meetcriterium
- KPI: [specifieke KPI]
- Baseline: [huidige waarde of INSUFFICIENT_DATA:]
- Target: [beoogde waarde]
- Meetmethode: [hoe gemeten]
- Tijdshorizon: [wanneer te meten]

---

## PRIORITEITENMATRIX (VERPLICHT)

| Aanbeveling ID | Impact | Effort | Prioriteit | Sprint |
|----------------|--------|--------|------------|--------|
| REC-001 | Hoog | Laag | P1 | Sprint 1 |
| REC-002 | [...] | [...] | [...] | [...] |

Impact en Effort: Hoog / Midden / Laag (met expliciete rationale in bijlage)

## HANDOFF CHECKLIST
- [ ] Alle aanbevelingen verwijzen naar een analyse-bevinding (GAP/RISK/CS ID)
- [ ] Alle impacts hebben rationale (geen lege cellen)
- [ ] Alle INSUFFICIENT_DATA: items zijn gedocumenteerd
- [ ] Meetcriteria zijn SMART geformuleerd
- [ ] Prioriteitenmatrix is volledig ingevuld
- [ ] Afhankelijkheden zijn gedocumenteerd
- [ ] Geen aanbevelingen buiten competentiedomein
- [ ] JSON export is valide en compleet
```

---

## JSON EXPORT SCHEMA

```json
{
  "metadata": {
    "agent": "string",
    "phase": "1 | 2 | 3 | 4",
    "date": "ISO 8601",
    "based_on_analysis": "string"
  },
  "recommendations": [
    {
      "id": "REC-001",
      "problem": "string",
      "analysis_reference": ["GAP-001", "RISK-001"],
      "solution": {
        "description": "string",
        "steps": ["string"]
      },
      "impact": {
        "revenue": "string | null",
        "risk_reduction": "string",
        "cost": "string | null",
        "ux": "string | null",
        "rationale": "string"
      },
      "rationale": "string",
      "dependencies": {
        "requires": ["string"],
        "blocked_by": ["string"],
        "depends_on_agent": ["string"]
      },
      "risk_of_not_implementing": "string",
      "measurement": {
        "kpi": "string",
        "baseline": "string | null",
        "target": "string",
        "method": "string",
        "horizon": "string"
      },
      "priority": "P1 | P2 | P3",
      "effort": "High | Medium | Low",
      "sprint": "string"
    }
  ],
  "priority_matrix": [
    {
      "id": "REC-001",
      "impact": "High | Medium | Low",
      "effort": "High | Medium | Low",
      "priority": "P1 | P2 | P3",
      "sprint": "string"
    }
  ],
  "handoff_checklist": {
    "all_recs_reference_analysis": true,
    "all_impacts_have_rationale": true,
    "insufficient_data_documented": true,
    "smart_criteria": true,
    "priority_matrix_complete": true,
    "dependencies_documented": true,
    "no_out_of_scope_recs": true,
    "json_valid": true,
    "ready_for_handoff": true
  }
}
```

---

## AFWIJZINGSCRITERIA
Een aanbevelingen-document wordt AFGEWEZEN als:
- Een aanbeveling geen verwijzing heeft naar een analyse-bevinding
- Impact-velden leeg zijn zonder `INSUFFICIENT_DATA:` markering
- Meetcriteria ontbreken of niet SMART zijn
- De prioriteitenmatrix ontbreekt
- Een aanbeveling buiten het competentiedomein valt
