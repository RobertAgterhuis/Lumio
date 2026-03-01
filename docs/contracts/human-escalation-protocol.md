# Contract: Human Escalation Protocol
> Versie 1.0 | Definieert hoe agents vragen stellen aan de gebruiker, hoe antwoorden worden verwerkt en hoe de cyclus hervat na menselijke input

---

## DOEL

Agents werken autonoom maar botsen soms op situaties die een menselijke beslissing vereisen. Dit protocol zorgt dat:
1. Elke vraag aan de gebruiker gestandaardiseerd en volledig is
2. De cyclus correct wacht of doorgaat afhankelijk van het escalatietype
3. Timeouts expliciet worden afgehandeld
4. Antwoorden traceerbaar worden verwerkt in de session state

---

## WANNEER ESCALEREN (VERPLICHTE TRIGGERS)

| Trigger | Type | Timeout-actie |
|---------|------|--------------|
| Verplichte input ontbreekt (ONBOARDING_BLOCKED) | `ONBOARDING_BLOCKED` | `HALT` |
| Tool-installatie vereist (TOOL_INSTALL_REQUEST) | `TOOL_INSTALL_REQUEST` | `HALT` |
| Sprint Gate beslissing (IMPLEMENTEER / BACKLOG) | `SPRINT_GATE` | `PAUSE` — stel opnieuw voor bij volgende interactie |
| Sprint Impact Vlag op IN_PROGRESS sprint | `SPRINT_IMPACT_FLAG` | `PAUSE` |
| Scope-definitie onduidelijk (< 2 concrete gedragsverwachtingen) | `SCOPE_DECISION` | `HALT` |
| Onoplosbaar conflict tussen agents (> 2 retours zonder resolutie) | `AGENT_CONFLICT` | `PAUSE` |
| Security-gerelateerde beslissing vereist (SECURITY_DECISION) | `SECURITY_DECISION` | `HALT` |
| Destructieve git-operatie vereist bevestiging | `DESTRUCTIVE_GIT_OP` | `HALT` |
| Overige — agent kan niet autonoom beslissen | `OTHER` | `PAUSE` |

### Timeout-acties:

| Actie | Betekenis |
|-------|-----------|
| `HALT` | Cyclus stopt volledig. Geen verdere agent-activiteit. Wacht op antwoord. |
| `PAUSE` | Huidige stap pauzeren. Onafhankelijke parallelstappen mogen doorgaan. |
| `CONTINUE_WITH_ASSUMPTION` | Alleen toegestaan als de agent expliciet een veilige default documenteert — NOOIT bij HALT-types |

---

## ESCALATIE FORMAAT (VERPLICHT VOOR ALLE AGENTS)

```markdown
---
## ❓ MENSELIJKE INPUT VEREIST

**Escalatie ID:** ESC-[NNN]
**Type:** [type uit tabel hierboven]
**Gesteld door:** [agent naam]
**Tijdstip:** [ISO 8601]

**Situatie:**
[Korte, feitelijke beschrijving van wat er speelt — max 4 regels. GEEN mening, GEEN aanbeveling.]

**Vraag:**
[Één duidelijke vraag. Als er meerdere opties zijn, geef ze genummerd:]
  [1] [optie A] — [wat dit betekent voor de cyclus]
  [2] [optie B] — [wat dit betekent voor de cyclus]

**Impact van geen antwoord (timeout-actie: [HALT / PAUSE]):**
[Wat er gebeurt als de gebruiker niet reageert]

**Informatie die helpt bij beslissing:**
[Relevante context — pad naar document, bevinding-ID, etc. — of GEEN]

---
```

---

## ANTWOORD VERWERKING

### Formaat geldig antwoord:
De gebruiker antwoordt met het nummer van de keuze, of een vrije tekst als er geen opties zijn.

### Orchestrator verwerkt het antwoord:

1. Koppel het antwoord aan `escalation_id` in `open_human_escalations`
2. Zet `status` op `ANSWERED`, vul `answer` en `answered_at` in
3. Verwerk de beslissing:
   - Bij Sprint Gate: update `sprint_status` conform keuze
   - Bij ONBOARDING_BLOCKED: herstart Onboarding Agent nadat invoer aangeleverd is
   - Bij TOOL_INSTALL_REQUEST: wacht op bevestiging, verifieer tool, update tooling status
   - Bij SCOPE_DECISION: update `00-feature-request.md` of intake-document
   - Bij AGENT_CONFLICT: geef de beslissing mee aan de betreffende agents als tiebreaker-instructie
4. Update session state: verwijder escalatie uit `open_human_escalations`, log in session history
5. Hervat de cyclus vanaf het gepauzeerde/geblokkeerde punt

---

## TIMEOUT AFHANDELING

Als de gebruiker niet binnen de gestelde timeout reageert:

| Timeout-actie | Orchestrator gedrag |
|--------------|---------------------|
| `HALT` | Zet status op `AWAITING_HUMAN`. Log: `ESCALATION_TIMEOUT: ESC-[NNN]`. Niets verder. Wacht. |
| `PAUSE` | Log: `ESCALATION_TIMEOUT: ESC-[NNN] — paused, dependent steps waiting`. Parallelstappen zonder afhankelijkheid mogen doorgaan. |
| `CONTINUE_WITH_ASSUMPTION` | Log aanname expliciet: `ASSUMPTION: [wat aangenomen wordt]. Reden: geen antwoord binnen [timeout].` Zet `status` op `TIMED_OUT`. Documenteer als `UNCERTAIN:` in downstream output. |

**VERBOD:** `CONTINUE_WITH_ASSUMPTION` is NOOIT toegestaan bij type `HALT`. Een HALT-escalatie wacht altijd op menselijke bevestiging, hoe lang het ook duurt.

---

## MEERDERE OPEN ESCALATIES

Als er meerdere open escalaties zijn:

1. Presenteer ze **in volgorde van urgentie**: `HALT`-types eerst, dan `PAUSE`-types
2. Stel ze **één voor één** voor — niet bundelen in één prompt
3. Na elk antwoord: verwerk, update state, dan volgende escalatie
4. Als alle `HALT`-escalaties beantwoord zijn en alleen `PAUSE`-escalaties open staan: cyclus mag hervatten, `PAUSE`-escalaties worden bij de volgende interactie aangeboden

---

## TRACEERBAARHEID

Elke escalatie wordt permanent gelogd in:

```json
{
  "escalation_log": [
    {
      "escalation_id": "ESC-001",
      "type": "SPRINT_GATE",
      "agent": "00-orchestrator",
      "raised_at": "ISO 8601",
      "question": "Wil je sprint SP-1 implementeren of op de backlog plaatsen?",
      "answer": "BACKLOG",
      "answered_at": "ISO 8601",
      "cascade_effect": "SP-2 en SP-3 ook op BACKLOG gezet"
    }
  ]
}
```

Locatie: `docs/session/escalation-log.json`
Voor feature-cycli: ook `Workitems/[FEATURENAAM]/session/escalation-log.json`

---

## ANTI-SPAM PROTOCOL

Agents mogen NIET escaleren voor:
- Beslissingen die ze autonoom kunnen nemen conform hun skill file
- Vragen waarvan het antwoord aantoonbaar uit de beschikbare input afgeleid kan worden
- Bevestigingen van acties die geen risico of scope-impact hebben

**VERBOD:** Geen escalatie aanmaken puur om "zekerheid te hebben". Alleen escaleren als autonome beslissing aantoonbaar buiten de agent-bevoegdheid valt.
