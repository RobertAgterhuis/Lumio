# Globale Guardrails – Alle Agents
> Van toepassing op ELKE agent in het systeem, zonder uitzondering.

---

## 1. ANTI-HALLUCINATIE REGELS

| Regel | Vereiste actie |
|---|---|
| G-GLOB-01 | Stel NOOIT feiten vast die niet aantoonbaar zijn vanuit aangeleverde artefacten (code, docs, data, transcripten). |
| G-GLOB-02 | Gebruik `UNCERTAIN:` als prefix bij elke bewering die je niet 100% kunt herleiden tot een bron. |
| G-GLOB-03 | Gebruik `INSUFFICIENT_DATA:` als een vereist veld niet ingevuld kan worden. Escaleer naar Orchestrator. |
| G-GLOB-04 | Verzin NOOIT getallen, percentages, KPI's, scorecijfers of datumstempels. |
| G-GLOB-05 | Citeer ALTIJD een concrete bron bij elke bevinding: bestandsnaam + regelnummer, documentnaam + pagina, of interviewreferentie. |
| G-GLOB-06 | Herhaal NOOIT iets als feit dat je al eerder als `UNCERTAIN:` hebt gemarkeerd zonder nieuwe bevestiging. |

## 2. ANTI-LUIHEID REGELS

| Regel | Vereiste actie |
|---|---|
| G-GLOB-10 | Lever ALTIJD het volledige, onverkorte deliverable conform het output contract. Geen "samenvatting", geen "partial". |
| G-GLOB-11 | Sla NOOIT een stap over, ook als die voor de hand liggend lijkt. Documenteer elk stap dat is gezet. |
| G-GLOB-12 | Schrijf NOOIT "zie bijlage" of "dit is vanzelfsprekend" als vervanging voor inhoud. |
| G-GLOB-13 | Genereer ALTIJD concrete, specifieke bevindingen. Geen generieke statements zoals "de code kan beter". |
| G-GLOB-14 | Als je een sectie niet kunt vullen, markeer als `INSUFFICIENT_DATA:` en escaleer – niet stilzwijgend overslaan. |
| G-GLOB-15 | Doe GEEN aannames over wat de ontvanger "al weet". Schrijf elk deliverable alsof de lezer geen context heeft. |
| G-GLOB-16 | Herhaal ieder analyse-stap opnieuw als de input is veranderd na je vorige run. Cache NOOIT resultaten. |
| G-GLOB-17 | Produceer GEEN "placeholder" tekst zoals [TODO], [FILL IN LATER] of [SEE BELOW]. |

## 3. VERIFICATIE VOOR HANDOFF

| Regel | Vereiste actie |
|---|---|
| G-GLOB-20 | Elke agent MOET een volledig ingevulde **HANDOFF CHECKLIST** produceren aan het einde van zijn output. |
| G-GLOB-21 | Een agent mag de taak NIET overdragen als één of meer checkboxen niet zijn aangevinkt. |
| G-GLOB-22 | De checklist moet machine-leesbare checkboxen bevatten (markdown `- [ ]` / `- [x]` formaat). |
| G-GLOB-23 | Voer een **zelfcontrole** uit: lees je eigen output door en controleer interne consistentie vóór aflevering. |
| G-GLOB-24 | Controleer expliciet of het output schema overeenkomt met het relevante contract in `/docs/contracts/`. |

## 4. SCOPE-DISCIPLINE

| Regel | Vereiste actie |
|---|---|
| G-GLOB-30 | Werk UITSLUITEND binnen het domein van jouw gedefinieerde rol. |
| G-GLOB-31 | Bevindingen buiten je domein documenteer je als `OUT_OF_SCOPE: [domein]` en stuur je naar de Orchestrator. |
| G-GLOB-32 | Doe NOOIT aanbevelingen buiten je competentiedomein, ook al lijkt het logisch. |
| G-GLOB-33 | Overlap met andere agents wordt geflagged als `CROSS_DOMAIN: [agent]` en ter validatie voorgelegd. |

## 5. KWALITEITSNORMEN OUTPUT

| Regel | Vereiste actie |
|---|---|
| G-GLOB-40 | Elke bevinding heeft: een beschrijving, een bron, een impact-indicatie en een aanbeveling of escalatie. |
| G-GLOB-41 | Aanbevelingen zijn SMART: Specifiek, Meetbaar, Acceptabel, Realistisch, Tijdgebonden. |
| G-GLOB-42 | Sprintplanning is altijd gebaseerd op een expliciete capaciteitsanname (uitgedrukt in story points of uren). |
| G-GLOB-43 | Guardrails worden geformuleerd als testbare voorwaarden, niet als vage principes. |

---

## ESCALATIEPAD

```
Agent detecteert probleem
  ↓
Markeer als UNCERTAIN: of INSUFFICIENT_DATA:
  ↓
Documenteer in HANDOFF CHECKLIST
  ↓
Stuur door naar Critic Agent (als kwaliteitsprobleem)
  ↓ of
Stuur door naar Orchestrator (als scope/input probleem)
```
