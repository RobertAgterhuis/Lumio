# Aanbevelingen – UX Research (UX Researcher) – 2026-03-02
> UX Researcher | Agent 10 | Fase 3

## Metadata
- Agent: UX Researcher (10)
- Fase: 3
- Vorige stap: `docs/fase-3/10-ux-researcher-analyse.md`
- Datum: 2026-03-02

---

## Prioriteit 1 — Kritiek / Blocker (vóór v1.0 release)

### REC-UX-001: Voer Shamir UX-test uit per protocol
- **ID:** REC-UX-001
- **Prioriteit:** P1 — Kritiek
- **Gap:** GAP-UX-002 / SYS-RISK-009
- **Beschrijving:** Het testprotocol (`devdocs/shamir-ux-test-protocol.md`) is gereed maar niet uitgevoerd. Er zijn **0/5** testparticipatiesessies afgerond. Het risico is dat nabestaanden onder emotionele druk de Shamir-reconstructie niet kunnen voltooien, wat data permanent ontoegankelijk maakt. Dit is een pre-release blocker.
- **Succes-criterium:** ≥4/5 deelnemers voltooien reconstructie in ≤5 min; stress-score ≤4/7 Likert (conform T-04 in testprotocol)
- **Sprint:** SP-UX-01 (vóór v1.0 feature-freeze)
- **Inspanning:** 3–5 werkdagen (werving + 5 sessies + analyse)
- **Eigenaar:** UX Researcher + product owner
- **Afhankelijkheden:** Scherm-regressie na SP-10 Shamir-drempel-fix (branch `feature/SP-10-COR-001-002-shamir-drempel-fix`) is gemerged
- **Bron:** `devdocs/shamir-ux-test-protocol.md`, SYS-RISK-009

---

### REC-UX-002: Ververbeter nabestaanden-modus ontdekbaarheid
- **ID:** REC-UX-002
- **Prioriteit:** P1 — Kritiek
- **Gap:** GAP-UX-004 / FP-003
- **Beschrijving:** Een nabestaande die de app voor het eerst opent, moet zonder extern instructiedocument de nabestaanden-modus kunnen vinden en gebruiken. `HEURISTIC:` Dit is momenteel niet haalbaar zonder extra UX-ingreep op het opstartscherm of via Lumio-instructiedocument voor erflaters.
- **Aanbevolen aanpak:**
  1. Voeg een expliciete "Ik ben nabestaande" knop toe aan het unlock-scherm
  2. Documenteer instructie in exporteerbaar "Instructiekaartje voor nabestaanden" vanuit de app
- **Succes-criterium:** Nabestaande vindt nabestaanden-modus in ≤60 seconden zonder hulp (t.m.v. usability test)
- **Sprint:** SP-UX-01 (gecombineerd met Shamir-test bevindingen)
- **Inspanning:** 1–2 dagen design + 1 dag implementatie
- **Eigenaar:** UX Designer + Implementation Agent
- **Bron:** FP-003, HEURISTIC journey-analyse

---

## Prioriteit 2 — Hoog / Pre-launch aanbevolen

### REC-UX-003: Herorden wizardstappen — uitvaartwensen naar achter
- **ID:** REC-UX-003
- **Prioriteit:** P2 — Hoog
- **Gap:** FP-002
- **Beschrijving:** `HEURISTIC:` De uitvaartwensen-stap staat vroeg in de 7-staps-wizard. Emotioneel belastend onderwerp in een onboardingflow kan users afschrikken voordat ze het dossier hebben afgerond. Aanbeveling: verplaats uitvaartwensen naar stap 5 of 6 (na erfgenamen), zodat de gebruiker eerst een succeservaring heeft opgebouwd.
- **Succes-criterium:** Gemeten via A/B test of gestructureerde gebruikerstest — activatieratio niet verslechterd
- **Sprint:** SP-UX-02
- **Inspanning:** 1 dag design + 1 dag implementatie + validatietest
- **Eigenaar:** UX Designer + Implementation Agent
- **Bron:** `devdocs/activation-definition.md`, FP-002

---

### REC-UX-004: Implementeer `lumio_partial_activation` PostHog event
- **ID:** REC-UX-004
- **Prioriteit:** P2 — Hoog
- **Gap:** GAP-UX-003 / FP-004
- **Beschrijving:** PostHog `lumio_activated` event bestaat al. Maar er is **geen** tussenmeting per stap (`lumio_partial_activation`). Zonder dit zijn funnel-drop-offs onzichtbaar. Implementeer per wizardstap een event met property `step: 1..7` zodat drop-off per stap meetbaar is.
- **Succes-criterium:** PostHog dashboard toont per-stap een funnel; drop-off points identificeerbaar binnen 7 dagen na launch
- **Sprint:** SP-UX-01
- **Inspanning:** 2–4 uur (frontend event fire per stap + PostHog funnel setup)
- **Eigenaar:** Senior Developer
- **Bron:** `devdocs/activation-definition.md` L31-35, GAP-UX-003

---

### REC-UX-005: Voer onboarding-wizard usability-test uit (5 deelnemers)
- **ID:** REC-UX-005
- **Prioriteit:** P2 — Hoog
- **Gap:** GAP-UX-001 / GAP-UX-003
- **Beschrijving:** De volledige 7-staps OnboardingWizard is niet gevalideerd met echte gebruikers. Voer een gemoderate usability-test uit met 5 deelnemers (profiel: 40-70 jr, niet-technisch, NL). Meting: wizard-voltooiingsrate, gemiddelde tijd, kwalitative pijnpunten.
- **Succes-criterium:** ≥80% voltooiingsrate eerste poging (conform activatie-target)
- **Sprint:** SP-UX-02 (na Shamir-test resultaten)
- **Inspanning:** 5 werkdagen
- **Eigenaar:** UX Researcher
- **Bron:** GAP-UX-001, GAP-UX-003

---

## Prioriteit 3 — Laag / Nice-to-have

### REC-UX-006: Voeg activatie-celebration toe na 7/7 stappen
- **ID:** REC-UX-006
- **Prioriteit:** P3 — Laag
- **Gap:** FP-005
- **Beschrijving:** `HEURISTIC:` Na activatie (stap 7/7) is er geen visueel bevestigingsmoment. Positive reinforcement (confetti/toast/samenvatting) vergroot perceived value en kan retention verhogen.
- **Succes-criterium:** Gebruikers rapporteren "duidelijk gevoel van voltooid zijn" in kwalitatieve test
- **Sprint:** SP-UX-03
- **Inspanning:** 2–4 uur
- **Eigenaar:** UI Designer + Implementation Agent

---

## Samenvatting Aanbevelingen

| ID | Beschrijving | Prioriteit | Sprint |
|---|---|---|---|
| REC-UX-001 | Shamir UX-test uitvoeren (5 sessies, protocol gereed) | P1 | SP-UX-01 |
| REC-UX-002 | Nabestaanden-modus ontdekbaarheid (knop + instructiekaartje) | P1 | SP-UX-01 |
| REC-UX-003 | Wizardvolgorde herorden (uitvaart naar achter) | P2 | SP-UX-02 |
| REC-UX-004 | `lumio_partial_activation` PostHog event implementeren | P2 | SP-UX-01 |
| REC-UX-005 | Onboarding wizard usability-test (5 deelnemers) | P2 | SP-UX-02 |
| REC-UX-006 | Activatie-celebration na 7/7 stappen | P3 | SP-UX-03 |

---

## HANDOFF CHECKLIST — Aanbevelingen UX Researcher
- [x] Alle P1 aanbevelingen gaan naar sprint SP-UX-01 (pre-release)
- [x] SYS-RISK-009 als P1 blocker doorgegeven
- [x] Elke aanbeveling heeft: ID, prioriteit, sprints, inspect-criterium, eigenaar
- [x] Twee P1 items zijn pre-release blockers conform SYS-RISK-009
- [x] Output klaar als input voor UX Designer (11)
