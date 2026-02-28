# Guardrail Template
> Gebruik dit template voor de guardrail-deliverable van elke agent.
> Zie `docs/contracts/guardrails-output-contract.md` voor de volledige eisen.

---

```markdown
# Guardrails – [DISCIPLINE INVULLEN] – [DATUM ISO 8601]

## Metadata
- **Agent:** [naam]
- **Fase:** [1 / 2 / 3 / 4]
- **Gebaseerd op analyse:** [referentie naar analyse-document]
- **Datum:** [YYYY-MM-DD]

---

> ⚠️ HERINNERING: Een guardrail is een TESTBARE, BINDENDE beslissingsregel.
> Formuleer als verbod of verplichting. Begin met een werkwoord.
> Elke guardrail MOET een schending-actie en verificatiemethode hebben.
>
> NIET geldig: "Zorg voor goede codekwaliteit"
> WEL geldig: "Code mag niet worden gemerged zonder code review door een senior (G-DISC-001)"

---

## G-[DISC]-001 – [Guardrail titel]

### Scope
- **Van toepassing op:** [welke agents / fasen / artefacten / beslissingen]
- **Tijdshorizon:** [permanent / tot sprint N / review datum YYYY-MM-DD]

### Regel
> Begin met een werkwoord. Formuleer concreet en testbaar.

[Bijv: "Mag niet worden gemerged" / "Moet altijd bevatten" / "Vereist goedkeuring van" / "Is verboden tenzij"]

### Schending Actie
> Wat gebeurt er concreet als deze guardrail wordt overtreden?

1. Markeer als `GUARDRAIL_VIOLATION: G-[DISC]-001`
2. [Concrete vervolgactie – bijv. "Blokkeer handoff", "Escaleer naar Orchestrator", "Revert de wijziging"]
3. [Herstelstap]

### Rationale
> Waarom is dit een guardrail? Verwijs naar een concrete bevinding.

**Gebaseerd op:** [RISK-NNN] / [GAP-NNN] / [CS-NNN]  
[Beschrijving: welk risico of gap rechtvaardigt deze guardrail?]

### Verificatiemethode
> Hoe verifieer je of een artefact aan deze guardrail voldoet?

[Bijv: "Automated test in CI-pipeline", "Checklist-item in code review", "Handmatige audit bij sprint review", "Automated linting rule"]

---

## G-[DISC]-002 – [Guardrail titel]

### Scope
[...]

### Regel
[...]

### Schending Actie
[...]

### Rationale
[...]

### Verificatiemethode
[...]

---

## G-[DISC]-NNN – [...]

[Herhaal bovenstaande structuur voor elke guardrail]

---

## GUARDRAIL OVERZICHT

| ID | Titel | Van toepassing op | Prioriteit | Verificatiemethode |
|----|-------|------------------|------------|-------------------|
| G-[DISC]-001 | [...] | [...] | Kritiek / Hoog / Midden | [...] |
| G-[DISC]-002 | [...] | [...] | [...] | [...] |

---

## HANDOFF CHECKLIST

- [ ] Alle guardrails zijn testbaar geformuleerd (begin met werkwoord, concrete conditie)
- [ ] Alle guardrails hebben een expliciete schending-actie
- [ ] Alle guardrails hebben een rationale met verwijzing naar een analyse-bevinding
- [ ] Alle guardrails hebben een concrete verificatiemethode
- [ ] Overzichtstabel is volledig en consistent met de individuele guardrails
- [ ] Geen duplicaten met bestaande guardrails in `/docs/guardrails/`
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
    "based_on_analysis": ""
  },
  "guardrails": [
    {
      "id": "G-DISC-001",
      "title": "",
      "scope": {
        "applies_to": [],
        "time_horizon": "permanent"
      },
      "rule": "",
      "violation_action": "",
      "rationale": "",
      "analysis_reference": [],
      "verification_method": "",
      "priority": "Critical | High | Medium"
    }
  ],
  "handoff_checklist": {
    "ready_for_handoff": false
  }
}
```
```
