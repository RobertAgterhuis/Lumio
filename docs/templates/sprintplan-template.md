# Sprintplan Template
> Gebruik dit template voor de sprintplan-deliverable van elke agent.
> Zie `docs/contracts/sprintplan-output-contract.md` voor de volledige eisen.

---

```markdown
# Sprintplan – [DISCIPLINE INVULLEN] – [DATUM ISO 8601]

## Metadata
- **Agent:** [naam]
- **Fase:** [1 / 2 / 3 / 4]
- **Gebaseerd op aanbevelingen:** [referentie naar aanbevelingen-document]
- **Datum:** [YYYY-MM-DD]
- **Totale scope:** [N sprints]

---

## ⚠️ VERPLICHTE AANNAMES (INVULLEN VÓÓR SPRINTPLAN)

> Als deze aannames niet beschikbaar zijn: markeer als INSUFFICIENT_DATA: en stel GEEN fictief plan op.

- **Team samenstelling:** [rollen + aantal personen – bijv. "2 backend developers, 1 designer"]
- **Sprint duur:** [N weken – standaard 2 weken]
- **Capaciteit per sprint:** [story points of uren – bijv. "40 story points per sprint"]
- **Technologie stack:** [relevant voor de uitvoering]
- **Randvoorwaarden:** [wat moet aanwezig zijn vóór sprint 1 start]
- **Geblokkeerde items:** [wat kan NIET starten zonder externe input of beslissing]

**Aanname-status:** Volledig beschikbaar / Gedeeltelijk beschikbaar (INSUFFICIENT_DATA: [items]) / Niet beschikbaar (HALT)

---

## SPRINT 1 – [Sprint naam]

### Sprint Doel
> Wat is het OUTCOME (resultaat voor de business/gebruiker), niet alleen de output?

[Beschrijf het concrete resultaat dat na deze sprint zichtbaar is voor een gebruiker of stakeholder]

### Stories

| Story ID | Beschrijving | Acceptatiecriteria | Story Points | Afhankelijkheden | Aanbeveling Ref |
|----------|-------------|-------------------|--------------|-----------------|-----------------|
| SP-1-001 | [concrete, specifieke taak] | [SMART, testbaar – minimaal 1 criterium] | [getal] | [story ID of "geen"] | REC-NNN |
| SP-1-002 | [...] | [...] | [...] | [...] | [...] |

> **Acceptatiecriteria format:** "Gegeven [context], wanneer [actie], dan [verwacht resultaat]"

### Sprint KPI's

| KPI | Baseline | Target na sprint | Meetmethode | Meetverantwoordelijke |
|-----|----------|-----------------|-------------|----------------------|
| [naam] | [waarde of INSUFFICIENT_DATA:] | [concrete waarde] | [hoe meten] | [rol] |

### Definition of Done – Sprint 1
- [ ] Alle stories hebben hun acceptatiecriteria behaald
- [ ] Code review uitgevoerd voor alle gewijzigde code
- [ ] Geautomatiseerde tests geslaagd
- [ ] KPI-meting uitgevoerd en gedocumenteerd
- [ ] Documentatie bijgewerkt waar van toepassing
- [ ] Geen nieuwe `CRITICAL_FINDING` geïntroduceerd
- [ ] Demo uitgevoerd voor stakeholder

---

## SPRINT 2 – [Sprint naam]

### Sprint Doel
[...]

### Stories

| Story ID | Beschrijving | Acceptatiecriteria | Story Points | Afhankelijkheden | Aanbeveling Ref |
|----------|-------------|-------------------|--------------|-----------------|-----------------|
| SP-2-001 | [...] | [...] | [...] | SP-1-001 | REC-NNN |

### Sprint KPI's
[...]

### Definition of Done – Sprint 2
[Herhaal DoD-structuur]

---

## AFHANKELIJKHEIDSOVERZICHT

> Documenteer alle cross-story afhankelijkheden.

| Story | Afhankelijk van | Reden |
|-------|----------------|-------|
| SP-2-001 | SP-1-001 | [waarom deze volgorde vereist is] |

---

## RISICOLOG SPRINTPLAN

| Risico | Kans | Impact | Mitigatie | Sprint |
|--------|------|--------|-----------|--------|
| [beschrijving] | Hoog/Midden/Laag | Hoog/Midden/Laag | [concrete actie] | [sprint N] |

---

## HANDOFF CHECKLIST

- [ ] Verplichte aannames zijn expliciet gedocumenteerd (of INSUFFICIENT_DATA:)
- [ ] Elke story heeft minimaal één SMART acceptatiecriterium
- [ ] Elke story heeft een story point schatting (of INSUFFICIENT_DATA: met reden)
- [ ] Sprint KPI's zijn SMART geformuleerd
- [ ] Sprint doelen zijn outcome-gericht (niet alleen output)
- [ ] Afhankelijkheden zijn volledig gedocumenteerd
- [ ] Definition of Done is aanwezig per sprint
- [ ] Geen fictieve capaciteitsaannames (of expliciet als aanname gelabeld)
- [ ] Risicolog aanwezig
- [ ] JSON export aanwezig en syntactisch valide
- [ ] Zelfcontrole uitgevoerd

**STATUS: GEREED VOOR HANDOFF / GEBLOKKEERD**

---

## JSON EXPORT

```json
{
  "metadata": {
    "agent": "",
    "phase": "",
    "date": "",
    "based_on_recommendations": "",
    "total_sprints": 0
  },
  "assumptions": {
    "team_composition": "",
    "sprint_duration_weeks": 2,
    "capacity_per_sprint": "",
    "prerequisites": [],
    "blocked_items": []
  },
  "sprints": [],
  "dependency_map": [],
  "risk_log": [],
  "handoff_checklist": {
    "ready_for_handoff": false
  }
}
```
```
