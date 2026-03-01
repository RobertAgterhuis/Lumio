# Contract: Implementation Output
> Versie 1.0 | Fase 5 – Autonome Implementatie

---

## DOEL VAN DIT CONTRACT

Dit contract definieert wat een **volledig geïmplementeerde sprint story** betekent in het autonome implementatiesysteem. Elke output van de Implementation Agent, Test Agent, en PR/Review Agent MOET aan dit contract voldoen voordat een handoff plaatsvindt.

---

## INVOER (VERPLICHT AANWEZIG VÓÓR IMPLEMENTATIE START)

> **SCOPE:** Dit contract is uitsluitend van toepassing op stories met `story_type` **`CODE`** of **`INFRA`**. Stories van type `DESIGN`, `CONTENT` of `ANALYSIS` worden **NIET** verwerkt door de Implementation Agent pipeline. Bij ontvangst van een story met een ander type: `ROUTING_ERROR` → escaleer naar Orchestrator.

| Veld | Bron | Verplicht |
|------|------|-----------|
| Sprint story (SP-N-NNN) | Goedgekeurd sprintplan uit Fasen 1–4 | JA |
| story_type | Sprint story veld 3 — MOET `CODE` of `INFRA` zijn | JA |
| sprint_status | Sprint veld `sprint_status` — MOET `IN_PROGRESS` zijn | JA |
| Architectuurbeslissingen | Fase 2 output (Software Architect + Senior Developer) | JA |
| Tech stack definitie | Fase 2 output | JA |
| Guardrails (alle fasen) | `docs/guardrails/00-06` | JA |
| Acceptatiecriteria | Sprint story veld 4 | JA |
| Blocker status | Sprint story veld 7 — MOET `NONE` zijn of INTERN opgelost | JA |
| Codebase toegang | Git repository (lees + schrijf) | JA |

**HALT:** Als één van bovenstaande verplichte inputs ontbreekt, als `story_type` niet `CODE` of `INFRA` is, als `sprint_status` niet `IN_PROGRESS` is, of als de Blocker-status `EXTERN: [open]` is → GEEN implementatie starten. Escaleer naar Orchestrator.

---

## OUTPUT PER STORY (VERPLICHT)

### A. Code Wijzigingen
```
IMPL-OUTPUT-A:
- Gewijzigde bestanden: lijst van absolute paden
- Toegevoegde bestanden: lijst van absolute paden
- Verwijderde bestanden: lijst van absolute paden
- Reden per wijziging: één zin per bestand gekoppeld aan acceptatiecriterium
```

**VERBOD:** Geen code wijzigen buiten de scope van de story zonder expliciete `SCOPE_EXTENSION: [reden]` melding.

### B. Test Coverage
```
IMPL-OUTPUT-B:
- Nieuwe tests: bestandspad + testnaam + welk acceptatiecriterium het dekt
- Gewijzigde tests: bestandspad + reden
- Coverage delta: [voor implementatie] → [na implementatie]
- Alle bestaande tests: PASSED / FAILED (met details bij FAILED)
```

**VERBOD:** Een story is NIET compleet als bestaande tests door de implementatie breken.  
**VERBOD:** Een story is NIET compleet als er geen test is voor elk acceptatiecriterium.

### C. Guardrail Validatie
```
IMPL-OUTPUT-C:
Per guardrail-bestand (00–06):
- Status: COMPLIANT / VIOLATION / NOT_APPLICABLE
- Bij VIOLATION: beschrijf precies welke regel, waarom, en wat de herstelactie is
```

**VERBOD:** Een story met een VIOLATION die niet is opgelost mag NIET naar Test Agent gaan.

### D. Story Completion Declaration
```
IMPL-OUTPUT-D:
Story ID: SP-N-NNN
Aanbeveling referentie: REC-NNN
Status: IMPLEMENTED / PARTIAL / BLOCKED
Acceptatiecriteria:
  - AC-1: COVERED BY [testnaam] | PASSED/FAILED
  - AC-2: COVERED BY [testnaam] | PASSED/FAILED
Openstaande items: [NONE of beschrijving]
Escalaties: [NONE of ESCALATE: beschrijving]
```

---

## OUTPUT PER SPRINT (VERPLICHT NA ALLE STORIES)

### Sprint Completion Report
```json
{
  "sprint_id": "SP-N",
  "stories": [
    {
      "story_id": "SP-N-NNN",
      "status": "IMPLEMENTED | PARTIAL | BLOCKED",
      "acceptance_criteria_passed": true,
      "tests_added": 0,
      "tests_passed": 0,
      "tests_failed": 0,
      "guardrail_violations": [],
      "changed_files": []
    }
  ],
  "sprint_kpi_measurement": {
    "kpi_id": "KPI-NNN",
    "baseline": null,
    "measured_after_sprint": null,
    "target_met": null
  },
  "blockers_resolved": [],
  "blockers_open": [],
  "parallel_tracks_executed": [],
  "new_critical_findings": []
}
```

**VERBOD:** `new_critical_findings` mag NOOIT gevuld zijn zonder escalatie naar Orchestrator.

---

## DEFINITION OF DONE (PER STORY)

Een story is DONE wanneer:
- [ ] Alle code wijzigingen zijn doorgevoerd
- [ ] Alle acceptatiecriteria zijn gedekt door tests
- [ ] Alle bestaande tests PASSED (geen regressie)
- [ ] Guardrail validatie: COMPLIANT of gedocumenteerde VIOLATION met herstelactie
- [ ] Story Completion Declaration is ingevuld
- [ ] Code review door PR/Review Agent is APPROVED

## DEFINITION OF DONE (PER SPRINT)

Een sprint is DONE wanneer:
- [ ] Alle stories in de sprint zijn DONE (of BLOCKED met escalatie)
- [ ] Sprint KPI-meting is uitgevoerd en gedocumenteerd
- [ ] Sprint Completion Report JSON is machine-leesbaar en compleet
- [ ] Alle INTERN-blockers zijn opgelost
- [ ] Geen nieuwe CRITICAL_FINDING zonder resolutie
- [ ] Critic Agent validatie PASSED
- [ ] Risk Agent validatie PASSED

---

## HANDOFF CHECKLIST (IMPLEMENTATION AGENT → TEST AGENT)
```
## IMPLEMENTATION HANDOFF CHECKLIST – [Story ID] – [Datum]
- [ ] IMPL-OUTPUT-A aanwezig (gewijzigde bestanden gedocumenteerd)
- [ ] IMPL-OUTPUT-B aanwezig (tests geschreven per acceptatiecriterium)
- [ ] IMPL-OUTPUT-C aanwezig (guardrail validatie compleet)
- [ ] IMPL-OUTPUT-D aanwezig (story completion declaration)
- [ ] Geen scope-uitbreiding zonder SCOPE_EXTENSION melding
- [ ] Geen EXTERN-open blockers
- [ ] Geen nieuwe CRITICAL_FINDING zonder escalatie
```

## HANDOFF CHECKLIST (TEST AGENT → PR/REVIEW AGENT)
```
## TEST HANDOFF CHECKLIST – [Sprint ID] – [Datum]
- [ ] Alle stories: acceptatiecriteria tests PASSED
- [ ] Alle bestaande tests PASSED (geen regressie)
- [ ] Coverage delta gedocumenteerd
- [ ] Sprint Completion Report JSON aanwezig
- [ ] Geen VIOLATION in IMPL-OUTPUT-C zonder resolutie
```

## HANDOFF CHECKLIST (PR/REVIEW AGENT → ORCHESTRATOR)
```
## PR HANDOFF CHECKLIST – [Sprint ID] – [Datum]
- [ ] PR aangemaakt met correcte beschrijving en story referenties
- [ ] Alle checks groen (CI/CD, tests, linting)
- [ ] Guardrail review COMPLIANT
- [ ] Sprint Completion Report bijgevoegd aan PR
- [ ] KPI-meting gedocumenteerd
- [ ] Orchestrator Log bijgewerkt
```

---

## AFWIJZINGSCRITERIA (AUTOMATIC REJECT)

Een output wordt automatisch afgewezen als:
1. Één of meer acceptatiecriteria niet gedekt zijn door een test
2. Bestaande tests breken door de implementatie (regressie)
3. Een VIOLATION in guardrail-validatie is zonder herstelactie gedocumenteerd
4. Story Completion Declaration ontbreekt
5. Nieuwe `CRITICAL_FINDING` zonder escalatie aanwezig is
6. Sprint KPI-meting ontbreekt in Sprint Completion Report
