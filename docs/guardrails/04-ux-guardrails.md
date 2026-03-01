# UX Guardrails – Fase 3 Agents
> Van toepassing op: UX Researcher, UX Designer, UI Designer, Accessibility Specialist

---

## DOMEIN: UX & PRODUCT EXPERIENCE

### G-UX-01 – Design System Verplicht
**Regel:** Elke UI-aanbeveling MOET worden gerelateerd aan het bestaan (of ontbreken) van een formeel design system.  
**Als ontbreekt:** Documenteer als `CRITICAL_GAP: Design System ontbreekt` en voeg op als prioriteit 1 aanbeveling.  
**Bronvereiste:** Design system claim moet herleidbaar zijn naar een Figma-bestand, Storybook instantie, of equivalent.

### G-UX-02 – Maximaal 3 Interactiestappen per Primaire Flow
**Regel:** Elke primaire gebruikersflow (onboarding, checkout, activatie, core action) MOET worden geëvalueerd op het aantal benodigde interactiestappen.  
**Norm:** Meer dan 3 stappen voor een primaire actie is een `UX_FRICTION_FLAG`.  
**Bronvereiste:** Meting gebaseerd op heuristische evaluatie of usability test – NOOIT op aanname.

### G-UX-03 – User Journey Gedocumenteerd
**Regel:** UX Researcher documenteert ALTIJD de volledige user journey met: touchpoints, pijnpunten, emotiecurve, en drop-off momenten.  
**Verbod:** Geen journey-analyse op basis van "wie we denken dat de gebruiker is". Baseer op aantoonbare data (analytics, session recordings, interviews).

### G-UX-04 – Cognitive Load Scoring
**Regel:** Cognitive load wordt gescoord per scherm/flow op een schaal van 1–10 met expliciete criteria:  
- Informatiedichtheid  
- Beslissingspunten  
- Visuele complexiteit  
**Verbod:** Geen subjectieve uitspraken over "te complex" zonder onderliggende scoring.

### G-UX-05 – Heuristische Evaluatie Compleet
**Regel:** De heuristische evaluatie van Nielsen's 10 Usability Heuristics is VERPLICHT en VOLLEDIG.  
**Format:** Per heuristic: status (OK / Probleem / Kritiek) + bewijs + aanbeveling.  
**Verbod:** Geen "niet van toepassing" zonder onderbouwing.

### G-UX-06 – WCAG Compliance Level Vastgesteld
**Regel:** Accessibility Specialist MOET het beoogde WCAG-niveau vaststellen (AA of AAA) VOORDAT de analyse begint.  
**Analyse vereist:** Elk van de vier WCAG-principes (Perceivable, Operable, Understandable, Robust) wordt apart beoordeeld.  
**Verbod:** Geen "voldoet grotendeels aan WCAG" zonder specifieke SC-referenties.

### G-UX-07 – Design Debt Kwantificering
**Regel:** Geïdentificeerde design debt wordt gekwantificeerd in geschatte hersteluren of story points – NIET als vage "technische schuld".

### G-UX-08 – UX Aanbevelingen Technisch Haalbaar
**Regel:** Elke UX-aanbeveling MOET worden getoetst aan de Fase 2 technische output. Aanbevelingen die technisch niet haalbaar zijn binnen de bestaande architectuur worden geflagged als `DEPENDENT_ON_TECH: [vereiste]`.

### G-UX-09 – Task Success Rate Baseline
**Regel:** Voor elke primaire taak MOET een baseline task success rate worden gedocumenteerd (of als `INSUFFICIENT_DATA:` worden gemarkeerd als geen testdata beschikbaar is).

---

## FASE 3 HANDOFF VEREISTEN
Output moet bevatten:
- `journey_gaps[]`
- `cognitive_load_scores{flow: string, score: 1-10, criteria: {}}`
- `accessibility_score: "WCAG-A" | "WCAG-AA" | "WCAG-AAA" | "Non-Compliant"`
- `heuristic_evaluation[10 items]`
- `design_debt_estimate{hours: number, items: []}`
- `friction_points[]`
