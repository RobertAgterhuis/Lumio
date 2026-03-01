# Sprintplan Output Contract
> Versie: 1.2 | Van toepassing op alle sprintplan-deliverables van alle agents

---

## DOEL
Dit contract definieert de verplichte structuur voor het **Sprintplan**-deliverable per agent.
Een sprintplan zonder capaciteitsaanname, team-toewijzing, story-type classificatie, afhankelijkheden, parallelle tracks, blocker-register, of meetbare outcomes is NIET geldig.

---

## FUNDAMENTEEL PRINCIPE: TRACK-ONAFHANKELIJKHEID

**KRITIEKE REGEL:** Een blocker in een CONTENT-, DESIGN- of ANALYSIS-story mag NOOIT een CODE-story in dezelfde sprint blokkeren, en vice versa.

Elke story heeft een `story_type`. Dit type bepaalt via welke **execution pipeline** de story loopt:

| Story Type | Omschrijving | Execution Pipeline |
|------------|-------------|-------------------|
| `CODE` | Productiecode wijzigen of toevoegen | Implementation Agent → Test Agent → PR/Review Agent |
| `INFRA` | Infrastructuur, CI/CD, configuratie | Implementation Agent → Test Agent → PR/Review Agent |
| `DESIGN` | Ontwerp, wireframes, prototypes, stijlgidsen | Handmatig of design-tooling |
| `CONTENT` | Copy, campagnes, marketingmateriaal, teksten | Handmatig of content-tooling |
| `ANALYSIS` | Onderzoek, data-analyse, rapportage, strategiedocumenten | Handmatig |

**Blockers zijn track-gebonden:**
- Een EXTERN-blocker op story type `CONTENT` (bijv. wachten op client-goedkeuring van campagnetekst) **blokkeert NOOIT** een `CODE`-story in dezelfde sprint.
- Parallel tracks worden ALTIJD per story-type gegroepeerd, zodat het code-team nooit afhankelijk is van de voortgang van niet-technische tracks.
- De Orchestrator routeert automatisch op basis van `story_type`. CODE- en INFRA-stories gaan naar de autonome implementatie-pipeline. Andere types volgen hun eigen doorlooptijd.

---

## VERPLICHTE AANNAMES VÓÓR SPRINTPLAN

Voordat een sprintplan wordt opgesteld, MOETEN de volgende aannames EXPLICIET worden gedocumenteerd:

```markdown
## Sprintplan Aannames
- Team samenstelling: [per team: naam, rollen, aantal personen]
  - Team A – [naam]: [rollen] – [n personen] – capaciteit: [SP of uren/sprint]
  - Team B – [naam]: [rollen] – [n personen] – capaciteit: [SP of uren/sprint]
  (voeg teams toe op basis van beschikbare data, of markeer als INSUFFICIENT_DATA:)
- Sprint duur: [n weken]
- Technologie stack: [relevant voor de sprint]
- Randvoorwaarden: [wat moet aanwezig zijn vóór sprint 1 start]
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

| Story ID | Beschrijving | Type | Team | Acceptatiecriteria | Story Points | Afhankelijkheden | Blocker | Risico |
|----------|-------------|------|------|-------------------|--------------|-----------------|---------|--------|
| SP-N-001 | [concrete taak] | CODE | [Team A] | [SMART, testbaar] | [getal] | [story ID of extern] | [NONE / INTERN: beschrijving / EXTERN: beschrijving + eigenaar] | [optioneel] |

> **Type**: verplicht. Kies uit: `CODE`, `INFRA`, `DESIGN`, `CONTENT`, `ANALYSIS`. Bepaalt de execution pipeline.  
> **Team**: verplicht per story. Gebruik de teamnamen uit de aannames, of `INSUFFICIENT_DATA:`.  
> **Blocker**: gebruik `NONE` als er geen blocker is. Intern = oplosbaar binnen het project. Extern = buiten projectcontrole (leverancier, klant, wetgeving). Vermeld altijd de eigenaar + escalatieroute bij EXTERN.  
> **TRACK-ONAFHANKELIJKHEID:** Een blocker van een CONTENT/DESIGN/ANALYSIS-story mag NOOIT als blocker staan op een CODE/INFRA-story.

### Parallel Tracks
Identificeer expliciet welke stories **parallel** kunnen worden uitgevoerd (geen onderlinge afhankelijkheid). Groepeer eerst per story-type, dan per team:

| Track | Type | Stories | Team(s) | Startvoorwaarde |
|-------|------|---------|---------|----------------|
| Track 1 (Code) | CODE | SP-N-001, SP-N-002 | Team Dev | Sprint N start |
| Track 2 (Design) | DESIGN | SP-N-003 | Team UX | Sprint N start |
| Track 3 (Content) | CONTENT | SP-N-004 | Team Marketing | Sprint N start |

> **VERBOD:** Geen parallel track claimen als er een verborgen afhankelijkheid bestaat. Documenteer twijfel als `UNCERTAIN:`.  
> **REGEL:** CODE/INFRA-tracks en DESIGN/CONTENT/ANALYSIS-tracks zijn per definitie onafhankelijk van elkaars blockers. Documenteer dit expliciet.

### Blocker Register (Sprint N)
Alle blockers uit de stories van deze sprint geconsolideerd:

| Blocker ID | Type | Omschrijving | Eigenaar | Verwachte Oplossing | Escalatie als niet opgelost voor |
|------------|------|-------------|---------|--------------------|---------------------------------|
| BLK-N-001 | INTERN / EXTERN | [beschrijving] | [naam/rol] | [datum of sprint] | [escalatieroute] |

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
Tabellair of visueel overzicht van story-afhankelijkheden over sprints:

| Story | Afhankelijk van | Type | Blokkerend? |
|-------|----------------|------|------------|
| SP-2-001 | SP-1-003 | Interne story | Ja |
| SP-2-002 | Externe API-levering | EXTERN | Ja – BLK-2-001 |

## Parallelle Tracks Overzicht
Overzicht van alle parallelle werkstromen over alle sprints:

| Sprint | Track | Stories | Teams |
|--------|-------|---------|-------|
| Sprint 1 | Track 1 | SP-1-001, SP-1-002 | Team A |
| Sprint 1 | Track 2 | SP-1-003 | Team B |

## Risicolog Sprintplan
| Risico | Kans | Impact | Mitigatie | Sprint |
|--------|------|--------|-----------|--------|

## Geconsolideerd Blocker Register
Alle blockers over alle sprints:

| Blocker ID | Sprint | Type | Omschrijving | Eigenaar | Escalatie als niet opgelost voor |
|------------|--------|------|-------------|---------|----------------------------------|

## HANDOFF CHECKLIST
- [ ] Sprintplan-aannames zijn expliciet gedocumenteerd (inclusief teams met capaciteit)
- [ ] Elke story heeft een story-type classificatie (CODE/INFRA/DESIGN/CONTENT/ANALYSIS)
- [ ] Elke story heeft een team-toewijzing (of INSUFFICIENT_DATA:)
- [ ] Elke story heeft acceptatiecriteria
- [ ] Elke story heeft een story point schatting (of INSUFFICIENT_DATA:)
- [ ] Elke story heeft een Blocker-veld (minimaal NONE)
- [ ] Alle EXTERN-blockers hebben een eigenaar én escalatieroute
- [ ] Parallel tracks zijn geïdentificeerd per sprint
- [ ] Sprint KPI's zijn SMART geformuleerd
- [ ] Afhankelijkheidsoverzicht is ingevuld
- [ ] Geconsolideerd Blocker Register is aanwezig
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
    "teams": [
      {
        "name": "string",
        "roles": ["string"],
        "capacity_per_sprint": "string | INSUFFICIENT_DATA"
      }
    ],
    "sprint_duration_weeks": 2,
    "prerequisites": ["string"]
  },
  "sprints": [
    {
      "sprint_number": 1,
      "name": "string",
      "goal": "string",
      "sprint_status": "QUEUED | IN_PROGRESS | COMPLETED | BACKLOG | BACKLOG (CASCADE van SP-N)",
      "depends_on_sprints": ["SP-N"],
      "parallel_tracks": [
        {
          "track": "Track 1 (Code)",
          "story_type": "CODE | INFRA | DESIGN | CONTENT | ANALYSIS",
          "stories": ["SP-1-001", "SP-1-002"],
          "teams": ["Team Dev"],
          "start_condition": "string"
        }
      ],
      "stories": [
        {
          "id": "SP-1-001",
          "description": "string",
          "story_type": "CODE | INFRA | DESIGN | CONTENT | ANALYSIS",
          "team": "string | INSUFFICIENT_DATA",
          "acceptance_criteria": ["string"],
          "story_points": 0,
          "dependencies": ["string"],
          "blocker": {
            "type": "NONE | INTERN | EXTERN",
            "description": "string | null",
            "owner": "string | null",
            "escalation_if_unresolved_by": "string | null"
          },
          "risk": "string | null",
          "recommendation_ref": "REC-001"
        }
      ],
      "blocker_register": [
        {
          "id": "BLK-1-001",
          "type": "INTERN | EXTERN",
          "description": "string",
          "owner": "string",
          "expected_resolution": "string",
          "escalation_route": "string"
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
      "depends_on": ["SP-1-000"],
      "blocking": true
    }
  ],
  "parallel_tracks_overview": [
    {
      "sprint": 1,
      "track": "Track 1",
      "stories": ["SP-1-001"],
      "teams": ["Team A"]
    }
  ],
  "consolidated_blocker_register": [
    {
      "id": "BLK-1-001",
      "sprint": 1,
      "type": "INTERN | EXTERN",
      "description": "string",
      "owner": "string",
      "escalation_route": "string"
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
- Capaciteitsaannames per team ontbreken (niet als INSUFFICIENT_DATA: gemarkeerd)
- Stories geen team-toewijzing hebben
- Stories geen story-type classificatie hebben (CODE/INFRA/DESIGN/CONTENT/ANALYSIS)
- Een CODE/INFRA-story een blocker heeft die afkomstig is uit een DESIGN/CONTENT/ANALYSIS-story
- Stories geen acceptatiecriteria hebben
- Story points ontbreken zonder markering
- Sprint KPI's niet SMART zijn
- Afhankelijkheden niet gedocumenteerd zijn
- Blocker-veld ontbreekt op een story (zelfs NONE moet expliciet staan)
- EXTERN-blockers geen eigenaar of escalatieroute hebben
- Parallelle tracks niet geïdentificeerd zijn (of ontbreken zonder motivatie)
