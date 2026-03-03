# Vragenlijst — Fase 3 UX & Product Experience: UX-Onderzoek
**Project:** Lumio  
**Aangemaakt door:** Questionnaire Agent (overeenkomstig `docs/contracts/questionnaire-output-contract.md`)  
**Datum:** 2026-07-14  
**Bron:** `BusinessDocs/Phase3-UX/phase3-analysis.md` — Agent 10 UX Researcher  
**Status:** OPEN

---

## Instructies voor de invuller

Beantwoord de VEREISTE vragen zo volledig mogelijk. Optionele vragen mogen overgeslagen worden maar verbeterd de kwaliteit van het advies significant. Er zijn geen "foute" antwoorden — eerlijkheid over wat (nog) niet bekend is, is voldoende.

---

## VEREISTE vragen

### Q-UX-R-001 — Gebruikerstests
**Achtergrond:** De analyse heeft geen formele gebruikstestresultaten gevonden. Om betrouwbare UX-aanbevelingen te geven, is het noodzakelijk te weten of eindgebruikers al met het systeem getest zijn.

**Vraag:** Zijn er ooit formele of informele gebruikbaarheidstests uitgevoerd met echte eindgebruikers (eigenaren of erfgenamen)? Zo ja: wat waren de voornaamste bevindingen? Wat ging goed; waar liepen gebruikers vast?

**Gewenste informatie:** Testmethode (lab, remote, guerrilla), doelgroep, n-aantallen, kernbevindingen, eventuele opnamen/rapporten.  
**INSUFFICIENT_DATA indien niet beantwoord:** Alle empirische UX-claim blijven als heuristisch gemarkeerd.

---

### Q-UX-R-002 — Activatiegraad
**Achtergrond:** Activatie is gedefinieerd als het afronden van de 7-staps OnboardingWizard (`devdocs/activation-definition.md`). Alleen het `lumio_activated` PostHog-event is beschikbaar als meting. Drop-off per stap is onbekend.

**Vraag:** Wat is de bekende of gemeten activatiegraad — het percentage gebruikers dat de OnboardingWizard volledig afrondt? Is er enig inzicht in welke stap gebruikers afhaken?

**Gewenste informatie:** Percentage, tijdsperiode, hoe gemeten, eventuele onderverdeling per stap.  
**INSUFFICIENT_DATA indien niet beantwoord:** Baseline voor activatiedoelstellingen ontbreekt; aanbevelingen worden zonder benchmark geformuleerd.

---

## OPTIONELE vragen

### Q-UX-R-003 — Shamir erfgenaamdoelstelling
**Achtergrond:** De Shamir-erfgenaam-ontgrendelingsstroom is nog nooit formeel getest (SYS-RISK-009). Een succespercentage bij eerste poging is onbekend.

**Vraag:** Is er een gewenst succespercentage vastgesteld voor het Shamir-ontgrendelingsproces — het percentage erfgenamen dat toegang verkrijgt bij de eerste poging?

**Gewenste informatie:** Doel (bijv. ≥ 90% bij eerste poging), tijdshorizon.

---

## Status tracking

| Q-ID | Status | Beantwoord door | Datum |
|------|--------|----------------|-------|
| Q-UX-R-001 | OPEN | — | — |
| Q-UX-R-002 | OPEN | — | — |
| Q-UX-R-003 | OPEN | — | — |
