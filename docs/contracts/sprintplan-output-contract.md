# Sprintplan Output Contract
> Versie: 1.0 | Van toepassing op alle sprintplan-deliverables van alle agents

---

## DOEL
Dit contract definieert de verplichte structuur voor het **Sprintplan**-deliverable per agent.
Een sprintplan zonder capaciteitsanname, afhankelijkheden, of meetbare outcomes is NIET geldig.

---

## VERPLICHTE AANNAMES VÓÓR SPRINTPLAN

Voordat een sprintplan wordt opgesteld, MOETEN de volgende aannames EXPLICIET worden gedocumenteerd:

```markdown
## Sprintplan Aannames
- Team samenstelling: [rollen + aantal personen]
- Sprint duur: [n weken]
- Capaciteit per sprint: [story points of uren]
- Technologie stack: [relevant voor de sprint]
- Randvoorwaarden: [wat moet aanwezig zijn vóór sprint 1 start]
- Geblokkeerde items: [wat kan NIET starten zonder externe input]
```

Als deze aannames NIET beschikbaar zijn: markeer als `INSUFFICIENT_DATA:` en stel GEEN fictief sprintplan op.

---

## VERPLICHT SCHEMA

### MARKDOWN STRUCTUUR

```markdown
# Sprintplan – [Discipline] – [Datum]

## Metadata
- Agent: [naam]
- Fase: [1 / 2 / 3 / 4]
- Gebaseerd op aanbevelingen: [referentie document]
- Datum: [ISO 8601]
- Totale scope: [n sprints]

## Aannames
[Zie verplichte aannames hierboven]

## Sprint [N] – [Sprint naam]

### Doel
[Wat is het outcome van deze sprint – niet de output, maar het resultaat voor de business/gebruiker]

### Stories

| Story ID | Beschrijving | Acceptatiecriteria | Story Points | Afhankelijkheden | Risico |
|----------|-------------|-------------------|--------------|-----------------|--------|
| SP-N-001 | [concrete taak] | [SMART, testbaar] | [getal] | [story ID of extern] | [optioneel] |

### Sprint KPI's
| KPI | Baseline | Target na sprint | Meetmethode |
|-----|----------|-----------------|-------------|
| [naam] | [waarde] | [waarde] | [methode] |

### Definition of Done (Sprint N)
- [ ] Alle stories compleet (acceptatiecriteria behaald)
- [ ] Code review uitgevoerd
- [ ] Tests geslaagd
- [ ] KPI-meting uitgevoerd
- [ ] Documentatie bijgewerkt
- [ ] Geen nieuwe CRITICAL_FINDING geïntroduceerd

## Afhankelijkheidsoverzicht
[Visueel of tabellair overzicht van story-afhankelijkheden over sprints]

## Risicolog Sprintplan
| Risico | Kans | Impact | Mitigatie | Sprint |
|--------|------|--------|-----------|--------|

## HANDOFF CHECKLIST
- [ ] Sprintplan-aannames zijn expliciet gedocumenteerd
- [ ] Elke story heeft acceptatiecriteria
- [ ] Elke story heeft een story point schatting (of INSUFFICIENT_DATA:)
- [ ] Sprint KPI's zijn SMART geformuleerd
- [ ] Afhankelijkheden zijn volledig gedocumenteerd
- [ ] Definition of Done is aanwezig per sprint
- [ ] Geen fictieve capaciteitsaannames
- [ ] JSON export is valide
```

---

## JSON EXPORT SCHEMA

```json
{
  "metadata": {
    "agent": "string",
    "phase": "1 | 2 | 3 | 4",
    "date": "ISO 8601",
    "based_on_recommendations": "string",
    "total_sprints": 0
  },
  "assumptions": {
    "team_composition": "string | INSUFFICIENT_DATA",
    "sprint_duration_weeks": 2,
    "capacity_per_sprint": "string | INSUFFICIENT_DATA",
    "prerequisites": ["string"],
    "blocked_items": ["string"]
  },
  "sprints": [
    {
      "sprint_number": 1,
      "name": "string",
      "goal": "string",
      "stories": [
        {
          "id": "SP-1-001",
          "description": "string",
          "acceptance_criteria": ["string"],
          "story_points": 0,
          "dependencies": ["string"],
          "risk": "string | null",
          "recommendation_ref": "REC-001"
        }
      ],
      "kpis": [
        {
          "kpi": "string",
          "baseline": "string | null",
          "target": "string",
          "measurement_method": "string"
        }
      ],
      "definition_of_done": ["string"]
    }
  ],
  "dependency_map": [
    {
      "story_id": "SP-1-001",
      "depends_on": ["SP-1-000"]
    }
  ],
  "risk_log": [
    {
      "risk": "string",
      "probability": "High | Medium | Low",
      "impact": "High | Medium | Low",
      "mitigation": "string",
      "sprint": 0
    }
  ],
  "handoff_checklist": {
    "assumptions_documented": true,
    "all_stories_have_ac": true,
    "story_points_estimated": true,
    "smart_kpis": true,
    "dependencies_documented": true,
    "dod_present": true,
    "no_fictional_capacity": true,
    "json_valid": true,
    "ready_for_handoff": true
  }
}
```

---

## AFWIJZINGSCRITERIA
Een sprintplan wordt AFGEWEZEN als:
- Capaciteitsaannames ontbreken (niet als INSUFFICIENT_DATA: gemarkeerd)
- Stories geen acceptatiecriteria hebben
- Story points ontbreken zonder markering
- Sprint KPI's niet SMART zijn
- Afhankelijkheden niet gedocumenteerd zijn
