# Contract: Session State
> Versie 1.0 | Definieert hoe de Orchestrator en agents de voortgang bijhouden en een onderbroken cyclus hervatten

---

## DOEL

Dit contract definieert:
1. Het formaat van de session state
2. Hoe agents de state bijwerken
3. Hoe een onderbroken sessie wordt gedetecteerd en hervat
4. Hoe conflicten in state worden opgelost

---

## SESSION STATE BESTAND

**Locatie:** `docs/session/session-state.json`
**Eigenaar:** Uitsluitend de Orchestrator schrijft naar dit bestand. Andere agents leveren state-updates **aan** de Orchestrator via hun HANDOFF CHECKLIST.

---

## VOLLEDIG JSON SCHEMA

```json
{
  "schema_version": "1.0",
  "session_id": "string — UUID of [YYYY-MM-DD]T[HH-MM-SS]",
  "cycle_type": "FULL_AUDIT | FEATURE | REEVALUATE",
  "feature_name": "string | null",
  "github_project_name": "string | null — ingevuld tijdens Onboarding",
  "initiated_at": "ISO 8601",
  "last_updated": "ISO 8601",

  "status": "ONBOARDING | FASE-1 | FASE-2 | FASE-3 | FASE-4 | SYNTHESIS | SPRINT_GATE | FASE-5 | REEVALUATE | COMPLETE | BLOCKED | AWAITING_HUMAN",

  "current_phase": "ONBOARDING | FASE-1 | FASE-2 | FASE-3 | FASE-4 | SYNTHESIS | FASE-5 | null",
  "current_agent": "string — agent bestandsnaam zonder extensie | null",

  "completed_phases": ["ONBOARDING", "FASE-1"],
  "completed_agents": ["25-onboarding-agent", "01-business-analyst"],

  "phase_outputs": {
    "onboarding": "docs/onboarding/onboarding-output.md | null",
    "fase-1": {
      "01": "docs/fase-1/01-business-analyst.md | null",
      "02": "docs/fase-1/02-domain-expert.md | null",
      "03": "docs/fase-1/03-sales-strategist.md | null",
      "04": "docs/fase-1/04-financial-analyst.md | null",
      "critic_risk": "docs/fase-1/critic-risk-validatie.md | null"
    },
    "fase-2": {
      "05": "null",
      "06": "null",
      "07": "null",
      "08": "null",
      "09": "null",
      "critic_risk": "null"
    },
    "fase-3": {
      "10": "null",
      "11": "null",
      "12": "null",
      "13": "null",
      "critic_risk": "null"
    },
    "fase-4": {
      "14": "null",
      "15": "null",
      "16": "null",
      "critic_risk": "null"
    },
    "synthesis": "null",
    "sprintplan": "null"
  },

  "sprint_backlog": {
    "path": "null",
    "total_sprints": 0,
    "sprint_statuses": {}
  },

  "open_human_escalations": [
    {
      "escalation_id": "ESC-001",
      "raised_by": "agent naam",
      "raised_at": "ISO 8601",
      "type": "ONBOARDING_BLOCKED | TOOL_INSTALL_REQUEST | SPRINT_IMPACT_FLAG | SCOPE_DECISION | OTHER",
      "question": "string — exacte vraag aan de gebruiker",
      "timeout_action": "PAUSE | CONTINUE_WITH_ASSUMPTION | HALT",
      "timeout_at": "ISO 8601 | null",
      "status": "OPEN | ANSWERED | TIMED_OUT",
      "answer": "string | null",
      "answered_at": "ISO 8601 | null"
    }
  ],

  "insufficient_data_items": [
    {
      "id": "INSUF-001",
      "agent": "string",
      "item": "string — wat er ontbreekt",
      "impact": "string — welke analyses hierdoor onzeker zijn",
      "status": "OPEN | RESOLVED | ACCEPTED_AS_UNKNOWN"
    }
  ],

  "tooling_gaps": [
    {
      "tool": "string",
      "category": "C | D",
      "blocks_phase": "FASE-5 | null",
      "status": "OPEN | RESOLVED"
    }
  ],

  "blockers": [
    {
      "blocker_id": "BLK-001",
      "type": "INTERN | EXTERN | TOOLING | HUMAN_REQUIRED",
      "description": "string",
      "raised_by": "string",
      "blocks": "string — wat er niet kan doorgaan",
      "status": "OPEN | RESOLVED",
      "resolved_at": "ISO 8601 | null"
    }
  ]
}
```

---

## STATE MACHINE — GELDIGE OVERGANGEN

```
ONBOARDING
  → FASE-1          (na ONBOARDING_COMPLETE)
FASE-1
  → FASE-2          (na Critic + Risk PASSED)
FASE-2
  → FASE-3          (na Critic + Risk PASSED)
FASE-3
  → FASE-4          (na Critic + Risk PASSED)
FASE-4
  → SYNTHESIS       (na Critic + Risk PASSED)
SYNTHESIS
  → SPRINT_GATE     (na Synthesis APPROVED)
SPRINT_GATE
  → FASE-5          (na Sprint Gate keuze IMPLEMENTEER)
  → SPRINT_GATE     (volgende sprint — iteratief)
FASE-5
  → SPRINT_GATE     (na Sprint Completion Report APPROVED)
  → COMPLETE        (alle sprints COMPLETED of BACKLOG met gebruikersbeslissing)

Elk status → AWAITING_HUMAN   (bij open human escalation)
AWAITING_HUMAN → [vorige status]  (na antwoord ontvangen)
Elk status → BLOCKED          (bij onoplosbaar blokker)
BLOCKED → [vorige status]     (na blokker opgelost)
```

**VERBOD:** Geen fase overslaan. Geen terugspringen naar een eerdere fase zonder expliciete `REEVALUATE` trigger.

---

## SESSIE HERVATTEN NA ONDERBREKING

### Detectie
Bij elke nieuwe interactie controleert de Orchestrator:
1. Bestaat `docs/session/session-state.json`?
2. Is `status` iets anders dan `COMPLETE`?

→ Ja: **Resumable session gedetecteerd.** Presenteer aan gebruiker:

```
SESSIE HERVAT
Session ID: [id]
Gestart: [datum]
Laatste activiteit: [datum]
Status: [status]
Laatste agent: [agent]
Open escalaties: [N]

Kies:
  [1] HERVAT — ga verder waar gestopt
  [2] RESET — start nieuwe sessie (bestaande state wordt gearchiveerd)
```

### Bij HERVAT:
- Laad alle `phase_outputs` die niet `null` zijn als context
- Ga door vanaf `current_agent` in `current_phase`
- Heropen alle `open_human_escalations` met status `OPEN` — bied ze opnieuw aan
- Laad alle `insufficient_data_items` met status `OPEN` als context-warnings

### Bij RESET:
- Hernoem huidige `session-state.json` naar `session-state-[session_id]-archived.json`
- Initialiseer nieuwe session state via Onboarding Agent

---

## STATE UPDATE PROTOCOL (VOOR AGENTS)

Elke agent rapporteert aan het eind van zijn HANDOFF CHECKLIST:

```markdown
## STATE UPDATE
- Agent: [naam]
- Output pad: [pad naar output bestand]
- Status: COMPLETE | PARTIAL | BLOCKED
- Nieuwe INSUFFICIENT_DATA items: [lijst of GEEN]
- Nieuwe open escalaties: [lijst of GEEN]
- Volgende agent (suggestie): [naam]
```

De Orchestrator verwerkt dit en schrijft de state update naar `session-state.json`.

---

## ARCHIVERING

Na `COMPLETE`:
- Hernoem `session-state.json` naar `session-state-[session_id]-complete.json`
- Bewaar in `docs/session/archive/`
- Voor feature-cycli: bewaar ook in `Workitems/[FEATURENAAM]/session/`
