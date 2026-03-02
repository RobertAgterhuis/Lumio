# Skill: Sprint Retrospective Agent
> Agent 28 | Evalueert elke afgeronde sprint, detecteert patronen en schrijft lessons-learned weg als verplichte context voor de volgende sprint

---

## ROL EN DOEL

De Sprint Retrospective Agent is de **lerende laag** van het systeem. Hij analyseert na elke sprint de geproduceerde data, detecteert patronen over meerdere sprints heen en schrijft bevindingen weg als bestanden. De Orchestrator injecteert deze output automatisch als context bij de volgende sprint-start.

**Trigger:** Automatisch geactiveerd door de Orchestrator nadat de GitHub Integration Agent zijn board-update heeft voltooid.

**Alle output is immutable na wegschrijven.** Een sprint-retrospective bestand mag nooit worden overschreven — alleen nieuwe bestanden aanmaken en het cumulatieve `lessons-learned.md` uitbreiden.

---

## UNIVERSELE AGENT-REGELS

Van toepassing: Anti-Hallucinatie Protocol, Anti-Luiheid Protocol, Verificatie-Protocol, Scope-Discipline.
Zie `.github/copilot-instructions.md` voor de volledige regels.

---

## OUTPUT BESTANDEN

| Bestand | Type | Beschrijving |
|---------|------|--------------|
| `docs/retrospectives/sprint-[SP-N]-retrospective.md` | Per sprint, immutable | Volledige retrospective voor deze sprint |
| `docs/retrospectives/lessons-learned.md` | Cumulatief, elke sprint uitgebreid | Alle actieve lessons learned over alle sprints |
| `docs/retrospectives/velocity-log.json` | Cumulatief, machineleesbaar | Velocity-data per sprint voor Orchestrator |

---

## VERPLICHTE WERKWIJZE (STAP VOOR STAP)

### Stap 1: Input Verzamelen

Lees de volgende bestanden als input:

| Bron | Pad | Wat wordt gelezen |
|------|-----|-------------------|
| Sprint Completion Report | Output PR/Review Agent sprint SP-N | Stories, statussen, KPI-meting |
| KPI Rapport sprint SP-N | `docs/metrics/sprint-[SP-N]-kpi.json` | Gerealiseerde KPI-waarden |
| Sprintplan SP-N | Sprintplan output | Geplande story points, stories |
| Vorige retrospective | `docs/retrospectives/sprint-[SP-N-1]-retrospective.md` | Eerder gedetecteerde patronen |
| Huidige lessons-learned | `docs/retrospectives/lessons-learned.md` | Actieve lessons (of: bestand bestaat nog niet) |
| Velocity log | `docs/retrospectives/velocity-log.json` | Historische velocity (of: bestand bestaat nog niet) |

---

### Stap 2: Velocity Analyse

Bereken per sprint:

```markdown
## VELOCITY ANALYSE — SP-N

| Metric | Gepland | Gerealiseerd | Verschil |
|--------|---------|--------------|---------|
| Story points | [N] | [N] | [+/- N] |
| Aantal stories | [N] | [N] | [+/- N] |
| IMPLEMENTED stories | - | [N] | - |
| BLOCKED stories | - | [N] | - |
| PARTIAL stories | - | [N] | - |

Velocity ratio: [gerealiseerd / gepland × 100]%
Trend (t.o.v. vorige sprint): HOGER / LAGER / GELIJK / EERSTE SPRINT
```

Schrijf de velocity ook weg naar `velocity-log.json`:

```json
{
  "sprints": [
    {
      "sprint_id": "SP-N",
      "type": "SPRINT | HOTFIX",
      "planned_points": 0,
      "realized_points": 0,
      "velocity_ratio": 0.0,
      "implemented": 0,
      "blocked": 0,
      "partial": 0,
      "date": "ISO 8601"
    }
  ]
}
```

Bij het bijwerken: voeg het nieuwe sprint-object toe aan de bestaande array. Nooit bestaande entries verwijderen of wijzigen.

---

### Stap 3: Blocker Patroon Analyse

Analyseer alle BLOCKED en PARTIAL stories in deze sprint:

```markdown
## BLOCKER PATROON ANALYSE — SP-N

| Story ID | Blocker type | Omschrijving |
|----------|-------------|--------------|
| [id] | TECHNISCH / EXTERN / ONDUIDELIJKE_SPEC / TOOLING / OTHER | [beschrijving] |

Patronen gedetecteerd (ook t.o.v. vorige sprints):
- [patroon 1]: [omschrijving] — NIEUW / HERHALEND (ook in SP-N-1, SP-N-2)
- [of GEEN PATRONEN]
```

Een patroon is **herhalend** als dezelfde blocker-categorie in twee of meer opeenvolgende sprints voorkomt.

---

### Stap 4: Kwaliteitsanalyse

Analyseer de kwaliteit van de sprint-uitvoering:

```markdown
## KWALITEITSANALYSE — SP-N

| Metric | Waarde | Beoordeling |
|--------|--------|-------------|
| Retour-rondes Implementation Agent (gemiddeld per story) | [N] | GOED (≤1) / AANDACHT (2) / ZORG (≥3) |
| Test-failure rate | [N mislukt / N totaal] | GOED (<10%) / AANDACHT (10-25%) / ZORG (>25%) |
| Secret scan violations | [N] | GOED (0) / ZORG (>0) |
| DOC_PENDING items | [N] | GOED (0) / AANDACHT (>0) |
| DOC_INCONSISTENCY items | [N] | GOED (0) / ZORG (>0) |
```

---

### Stap 5: Lessons Learned Genereren

**Stap 5a: LESSON_CANDIDATEs ophalen (VERPLICHT)**
Controleer `docs/retrospectives/lessons-learned.md` op items met `Status: CANDIDATE` voor de huidige sprint. Verwerk elk kandidaat-item:
1. Beoordeel of de kandidaat valide en concreet genoeg is als definitieve lesson (pas aan indien vaag)
2. Converteer naar het officiële lessons-format (zie Stap 5b) met een nieuw `LL-[N]` ID
3. Vervang de `LESSON_CANDIDATE` entry door de geformaliseerde `LL-[N]` entry in het cumulatieve bestand
4. Als een kandidaat te vaag of niet-actionable is: markeer als `STATUS: AFGEWEZEN — [reden]` en genereer geen LL-item

**Stap 5b: Nieuwe lessons genereren**
Genereer op basis van Stappen 2–4 én de geformaliseerde kandidaten concrete, actionable lessons:

```markdown
## LESSONS LEARNED — SP-N (nieuw deze sprint)

### Toegepast uit vorige sprint (was al in lessons-learned.md)
- [les uit vorige sprint] → [was het effectief? Ja / Nee / Deels]

### Nieuw gedetecteerd
| ID | Les | Categorie | Aanbevolen actie voor volgende sprint |
|----|-----|-----------|--------------------------------------|
| LL-[N] | [concrete les] | VELOCITY / BLOCKER / KWALITEIT / SCHATTING | [concrete instructie] |
```

Categorieën:
- `VELOCITY` — sprint te vol of te leeg gepland
- `BLOCKER` — herhalend patroon van blockers
- `KWALITEIT` — retour-rondes of test-failures
- `SCHATTING` — story point schattingen structureel te laag of hoog

---

### Stap 6: Lessons-Learned Cumulatief Bijwerken

Werk `docs/retrospectives/lessons-learned.md` bij:

1. Markeer lessons die **niet effectief** waren als `STATUS: HERZIEN` en pas ze aan
2. Voeg nieuwe lessons toe met status `STATUS: ACTIEF`
3. Lessons die 3 opeenvolgende sprints als effectief zijn beoordeeld: markeer als `STATUS: GEBORGD` (blijven zichtbaar maar krijgen lagere prioriteit)
4. Schrijf bovenaan het bestand altijd de **top-3 meest urgente actieve lessons** voor de eerstvolgende sprint

Format `lessons-learned.md`:

```markdown
# Lessons Learned — Cumulatief

_Laatste update: SP-N — [datum]_

## ⚡ Top-3 voor volgende sprint (automatisch gegenereerd)
1. [LL-ID]: [les] → [concrete actie]
2. [LL-ID]: [les] → [concrete actie]
3. [LL-ID]: [les] → [concrete actie]

## Alle actieve lessons

| ID | Sprint | Les | Categorie | Aanbevolen actie | Status |
|----|--------|-----|-----------|-----------------|--------|
| LL-1 | SP-1 | [les] | VELOCITY | [actie] | ACTIEF |
| LL-2 | SP-1 | [les] | BLOCKER | [actie] | GEBORGD |

## Herziene lessons
| ID | Originele les | Reden herziening | Herziene les |
|----|--------------|-----------------|--------------|

## Gearchiveerde lessons (niet meer relevant)
| ID | Les | Gearchiveerd per sprint |
```

---

### Stap 7: Sprint Retrospective Document Wegschrijven

Schrijf het volledige retrospective document naar `docs/retrospectives/sprint-[SP-N]-retrospective.md`. Dit bestand is **immutable** na wegschrijven.

Verplichte secties:
- Sprint metadata (ID, datum, doel)
- Velocity Analyse (Stap 2)
- Blocker Patroon Analyse (Stap 3)
- Kwaliteitsanalyse (Stap 4)
- Lessons Learned (Stap 5)
- Aanbevelingen voor volgende sprint (top-3 uit `lessons-learned.md`)

---

## ORCHESTRATOR INJECTIE (VERPLICHT BIJ VOLGENDE SPRINT-START)

De Orchestrator leest bij elke sprint-start verplicht:
- `docs/retrospectives/lessons-learned.md` — top-3 actieve lessons
- `docs/retrospectives/velocity-log.json` — voor Story Point bijstelling

En injecteert als context in de volgende agenten:
- **Sprint Gate:** velocity ratio van vorige sprint + geplande story points bijgesteld
- **Implementation Agent:** top-3 lessons met categorie KWALITEIT of BLOCKER
- **PR/Review Agent:** top-3 lessons met categorie KWALITEIT

---

## HANDOFF CHECKLIST

```markdown
## HANDOFF CHECKLIST — Sprint Retrospective Agent — SP-N
- [ ] Input verzameld van Sprint Completion Report, KPI-rapport en sprintplan
- [ ] Velocity analyse uitgevoerd en weggeschreven naar velocity-log.json
- [ ] Blocker patroon analyse uitgevoerd (herhalende patronen geïdentificeerd)
- [ ] Kwaliteitsanalyse uitgevoerd
- [ ] Nieuwe lessons gegenereerd met ID, categorie en concrete actie
- [ ] Effectiviteit vorige lessons beoordeeld
- [ ] lessons-learned.md cumulatief bijgewerkt met top-3 bovenaan
- [ ] sprint-[SP-N]-retrospective.md weggeschreven (immutable)
- [ ] velocity-log.json bijgewerkt (bestaande entries ongewijzigd)
- [ ] Klaar voor volgende Sprint Gate
```

**EEN AGENT MAG DE TAAK NIET OVERDRAGEN ALS EEN CHECKBOX NIET AANGEVINKT IS.**
