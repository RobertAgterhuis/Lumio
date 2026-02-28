# Guardrails Output Contract
> Versie: 1.0 | Van toepassing op alle guardrail-deliverables van alle agents

---

## DOEL
Dit contract definieert de structuur voor de **Guardrails**-deliverable per discipline.
Een guardrail is een TESTBARE, BINDENDE beslissingsregel — GEEN vage richtlijn.

---

## DEFINITIE VAN EEN GUARDRAIL
Een guardrail:
- Formuleert een **verbod** of **verplichting** in concrete termen
- Is **testbaar**: je kunt vaststellen of een beslissing of artefact de guardrail schendt
- Heeft een **schending-actie**: wat er gebeurt als de guardrail wordt overtreden
- Heeft een **scope**: voor wie en wanneer geldt de guardrail
- Heeft een **rationale**: waarom is dit een guardrail

**NIET geldig als guardrail:** "Zorg voor goede code kwaliteit"  
**WEL geldig:** "Code mag niet in production gemerged worden zonder 80% testdekking (G-ARCH-10)"

---

## VERPLICHT SCHEMA

### MARKDOWN STRUCTUUR

```markdown
# Guardrails – [Discipline] – [Datum]

## Metadata
- Agent: [naam]
- Fase: [1 / 2 / 3 / 4]
- Datum: [ISO 8601]
- Gebaseerd op analyse: [referentie]

## Guardrail [G-DISC-NNN]

### Titel
[Korte, beschrijvende naam]

### Scope
- Van toepassing op: [welke agents / fasen / artefacten]
- Tijdshorizon: [permanent / tot sprint N / review datum]

### Regel
[Concrete, testbare formulering. Begin met een werkwoord: "Mag niet", "Moet altijd", "Vereist", etc.]

### Schending Actie
[Wat gebeurt er bij overtreding? Bijv: "Markeer als GUARDRAIL_VIOLATION: G-DISC-NNN, blokkeer handoff, escaleer naar Orchestrator"]

### Rationale
[Waarom is dit een guardrail? Gebaseerd op welke bevinding of risico? Verwijs naar RISK-NNN of GAP-NNN]

### Verificatiemethode
[Hoe verifieer je of een artefact voldoet? Bijv: "Automated test aanwezig in CI", "Code review checklist item", "Handmatige audit bij elke sprint review"]

---

## Guardrail Overzicht

| ID | Titel | Scope | Prioriteit | Verificatie |
|----|-------|-------|------------|-------------|
| G-DISC-001 | [...] | [...] | Kritiek / Hoog / Midden | [...] |

## HANDOFF CHECKLIST
- [ ] Alle guardrails zijn testbaar geformuleerd
- [ ] Alle guardrails hebben een schending-actie
- [ ] Alle guardrails hebben een rationale met bronverwijzing
- [ ] Alle guardrails hebben een verificatiemethode
- [ ] Overzichtstabel is volledig
- [ ] Geen duplicaten met bestaande guardrails in /docs/guardrails/
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
    "based_on_analysis": "string"
  },
  "guardrails": [
    {
      "id": "G-DISC-001",
      "title": "string",
      "scope": {
        "applies_to": ["string"],
        "time_horizon": "string"
      },
      "rule": "string",
      "violation_action": "string",
      "rationale": "string",
      "analysis_reference": ["RISK-001", "GAP-001"],
      "verification_method": "string",
      "priority": "Critical | High | Medium"
    }
  ],
  "handoff_checklist": {
    "all_testable": true,
    "all_have_violation_action": true,
    "all_have_rationale": true,
    "all_have_verification": true,
    "overview_complete": true,
    "no_duplicates_with_existing": true,
    "json_valid": true,
    "ready_for_handoff": true
  }
}
```

---

## AFWIJZINGSCRITERIA
Een guardrail-document wordt AFGEWEZEN als:
- Een guardrail niet testbaar is geformuleerd
- Een schending-actie ontbreekt
- Een rationale niet verwijst naar een analyse-bevinding
- Een verificatiemethode ontbreekt
