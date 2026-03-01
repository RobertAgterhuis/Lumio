# Guardrails: Implementatie (Fase 5)
> Versie 1.0 | Van toepassing op: Implementation Agent, Test Agent, PR/Review Agent

---

## DOEL

Deze guardrails bewaken de kwaliteit, veiligheid en traceerbaarheid van elke autonome code-implementatie. Ze zijn aanvullend op de globale guardrails (`00-global-guardrails.md`) en de fase-specifieke guardrails uit de analyseperiode.

---

## SECTIE 1: SCOPE DISCIPLINE

**IMPL-GUARD-01 (KRITIEK):** Een Implementation Agent implementeert UITSLUITEND de sprint story waarvoor hij is geactiveerd (SP-N-NNN). Wijzigingen buiten de story scope vereisen een expliciete `SCOPE_EXTENSION:` melding met goedkeuring van de Orchestrator.

**IMPL-GUARD-02 (KRITIEK):** De implementatie MOET traceerbaar zijn naar een goedgekeurde aanbeveling (REC-NNN) via het sprintplan. Geen code zonder aanbevelings-referentie.

**IMPL-GUARD-03:** Bij twijfel over scope: HALT, documenteer als `UNCERTAIN: scope`, escaleer naar Orchestrator. NOOIT zelf de scope uitbreiden.

---

## SECTIE 2: ARCHITECTUUR INTEGRITEIT

**IMPL-GUARD-04 (KRITIEK):** Elke architectuurkeuze in de implementatie MOET consistent zijn met de beslissingen in de Fase 2 output (Software Architect + Senior Developer). Bij conflict: HALT + `ARCH_CONFLICT: [beschrijving]` + escaleer.

**IMPL-GUARD-05:** Geen nieuwe externe dependencies introduceren zonder:
- Expliciete vermelding in de sprint story of architectuurbeslissing
- `DEPENDENCY_ADDED: [naam, versie, reden]` melding in de output

**IMPL-GUARD-06:** Bestaande API-contracten (intern en extern) mogen NIET gebroken worden door implementatie. Breaking changes vereisen `BREAKING_CHANGE: [beschrijving, impact, migratie-pad]`.

**IMPL-GUARD-07:** Database schema-wijzigingen vereisen:
- Voorwaartse compatibiliteit (migration up)
- Terugwaartse compatibiliteit (migration down) TENZIJ expliciet vrijgesteld door Data Architect output
- `SCHEMA_CHANGE: [tabel, kolom/index, reden]` documentatie

---

## SECTIE 3: CODE KWALITEIT

**IMPL-GUARD-08:** De implementation MOET de bestaande code-conventies volgen die zijn geïdentificeerd in de Fase 2 Senior Developer analyse. Geen afwijkende stijl zonder `STYLE_EXCEPTION: [reden]`.

**IMPL-GUARD-09:** Geen hardcoded credentials, API keys, tokens, of secrets in code. Bij detectie: HALT, `SECURITY_VIOLATION: hardcoded secret`, escaleer onmiddellijk naar Security Architect.

**IMPL-GUARD-10:** Geen `TODO`, `FIXME`, `HACK`, of `XXX` comments in geïmplementeerde code tenzij voorzien van een story-referentie en geschatte oplostermijn.

**IMPL-GUARD-11:** Dead code (unreachable code, unused variables, unused imports) mag niet worden geïntroduceerd.

---

## SECTIE 4: TEST VEREISTEN

**IMPL-GUARD-12 (KRITIEK):** Elk acceptatiecriterium van de sprint story MOET gedekt zijn door minimaal één geautomatiseerde test. Geen uitzondering.

**IMPL-GUARD-13 (KRITIEK):** Regressie is NIET toegestaan. Als bestaande tests falen na de implementatie: HALT, analyseer oorzaak, herstel VOORDAT handoff.

**IMPL-GUARD-14:** Test-types per acceptatiecriterium:
- Unit test: voor geïsoleerde logica
- Integratietest: voor interactie tussen componenten
- End-to-end test: voor gebruikersflows (indien van toepassing)
- Kies het meest passende type — documenteer de keuze

**IMPL-GUARD-15:** Test coverage mag niet dalen t.o.v. de baseline. `COVERAGE_DELTA` in IMPL-OUTPUT-B MOET ≥ 0 zijn.

---

## SECTIE 5: SECURITY

**IMPL-GUARD-16 (KRITIEK):** Alle input van buiten de systeemgrens (gebruikersinput, API responses, bestandsuploads) MOET gevalideerd en gesanitized worden.

**IMPL-GUARD-17 (KRITIEK):** Geen SQL string concatenation met user input. Gebruik altijd parameterized queries of ORM.

**IMPL-GUARD-18:** Authenticatie en autorisatie checks mogen niet worden omzeild of uitgeschakeld, ook niet in test/debug code.

**IMPL-GUARD-19:** Logging mag NOOIT persoonlijk identificeerbare informatie (PII), passwords, of tokens bevatten.

**IMPL-GUARD-20:** Security findings uit Fase 2 (Security Architect) die als P1 of P2 zijn geclassificeerd, worden bij aanraking van gerelateerde code NIET genegeerd. `SEC_FINDING_PRESENT: [id]` documenteren als de story de aangrenzende code wijzigt.

---

## SECTIE 6: TRACEERBAARHEID EN DOCUMENTATIE

**IMPL-GUARD-21:** Elke commit MOET een duidelijke conventionele commit message bevatten met story-referentie:
- Format: `[type](scope): beschrijving [SP-N-NNN]`
- Typen: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`

**IMPL-GUARD-22:** Publieke API wijzigingen (endpoints, SDK interfaces, events) vereisen bijgewerkte documentatie in dezelfde commit.

**IMPL-GUARD-23:** De Sprint Completion Report JSON MOET machine-leesbaar en valide zijn voor overdracht naar het Eindrapport.

---

## SECTIE 7: AUTONOME BESLISSINGSLIMIETEN

**IMPL-GUARD-24 (KRITIEK):** De Implementation Agent mag ZELFSTANDIG beslissen over:
- Keuze van algoritmische implementatie binnen de story scope
- Interne structuur van nieuwe bestanden
- Testnaming en testopbouw
- Refactoring van code BINNEN de gewijzigde bestanden (geen scope-uitbreiding)

**IMPL-GUARD-25 (KRITIEK):** De Implementation Agent MOET ALTIJD escaleren bij:
- Architectuurkeuzes die de Fase 2 beslissingen tegenspreken
- Ontdekking van een nieuw CRITICAL_FINDING (security, data, architectuur)
- Conflict tussen twee guardrails
- Onduidelijkheid over acceptatiecriteria
- Een blocker die tijdens implementatie ontstaat

**IMPL-GUARD-26:** Escalatie-format:
```
ESCALATE:
  Type: ARCH_CONFLICT | CRITICAL_FINDING | GUARDRAIL_CONFLICT | AC_UNCLEAR | NEW_BLOCKER
  Story: SP-N-NNN
  Beschrijving: [exact wat er is ontdekt]
  Impactschatting: [welke andere stories/systemen geraakt worden]
  Aanbevolen actie: [wat de agent denkt dat er moet gebeuren]
  Status: HALT — wacht op Orchestrator beslissing
```

---

## SECTIE 8: KPI EN METING

**IMPL-GUARD-27:** Na voltooiing van een sprint MOET de Sprint KPI gemeten worden conform de SMART doelen uit het sprintplan. Geen schatting — werkelijke meting of `MEASUREMENT_IMPOSSIBLE: [reden]` met escalatie.

**IMPL-GUARD-28:** Als een KPI-target NIET gehaald is na sprint: documenteer als `KPI_MISS: [id, target, gerealiseerd, analyse]` in het Sprint Completion Report. Geen verberg-acties.

---

## GUARD 29–30: TRACK-ONAFHANKELIJKHEID (KRITIEK)

**IMPL-GUARD-29 (KRITIEK):** De Implementation Agent verwerkt UITSLUITEND stories met `story_type` `CODE` of `INFRA`. Bij ontvangst van een story met type `DESIGN`, `CONTENT` of `ANALYSIS`: **HALT**, `ROUTING_ERROR: story_type [type] hoort niet in de implementatie-pipeline`, escaleer naar Orchestrator.

**IMPL-GUARD-30 (KRITIEK):** Een blocker op een DESIGN-, CONTENT- of ANALYSIS-story mag NOOIT worden geregistreerd als blocker op een CODE- of INFRA-story. Bij detectie: `CROSS_TRACK_BLOCKER: [story-id van blocker-bron] heeft type [type] en mag story [code-story-id] niet blokkeren`, escaleer naar Orchestrator.

---

## VIOLATED? DAN DIT:

| Guardcode | Bij schending |
|-----------|--------------|
| IMPL-GUARD-01/02 | HALT, documenteer, wacht op Orchestrator |
| IMPL-GUARD-04 | HALT, `ARCH_CONFLICT:`, escaleer |
| IMPL-GUARD-09 | HALT, `SECURITY_VIOLATION:`, escaleer onmiddellijk |
| IMPL-GUARD-12 | Story is NIET done, schrijf test |
| IMPL-GUARD-13 | HALT, herstel regressie VOOR handoff |
| IMPL-GUARD-25 | HALT, escaleer per IMPL-GUARD-26 format |
| IMPL-GUARD-29 | HALT, `ROUTING_ERROR:`, escaleer naar Orchestrator |
| IMPL-GUARD-30 | HALT, `CROSS_TRACK_BLOCKER:`, escaleer naar Orchestrator |
