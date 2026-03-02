# Aanbevelingen – UX Design (UX Designer) – 2026-03-02
> UX Designer | Agent 11 | Fase 3

## Metadata
- Agent: UX Designer (11)
- Fase: 3
- Vorige stap: `docs/fase-3/11-ux-designer-analyse.md`
- Datum: 2026-03-02

---

## Prioriteit 1 — Kritiek / Pre-release Blocker

### REC-UXDESIGN-001: Vervang Shamir-iconografie en terminologie
- **ID:** REC-UXDESIGN-001
- **Prioriteit:** P1
- **Gap:** GAP-UXDESIGN-002 / Nielsen Heuristic 2 / SYS-RISK-009
- **Beschrijving:** Stap 6 van de wizard gebruikt `KeyRound` icoon en label "sleutels". Dit is een technische metafoor die niet aansluit bij het mentale model van de gebruiker. Aanbeveling: vervang door "Erfgenamen informeren" met een `UserCheck` icoon; schrijf de Shamir-uitleg in plain Dutch via begeleide copy ("Je vraagt X personen om jouw digitale erfenis te beheren").
- **Succes-criterium (SMART):** ≥80% testdeelnemers begrijpt stap 6 concept zonder toelichting na wijziging (t.m.v REC-UX-001 Shamir-test)
- **Impact:** UX: verkleint SYS-RISK-009 kritiek risico; Risk Reductie: direct; Revenue: `INSUFFICIENT_DATA:`
- **Risico van niet-uitvoeren:** Shamir-wizard faalt bij niet-technische gebruikers → data permanent ontoegankelijk voor nabestaanden
- **Sprint:** SP-UX-01 (parallel met Shamir-test voorbereiding)
- **Inspanning:** 1–2 SP (copywriter + component-aanpassing)
- **Afhankelijkheden:** REC-UX-001 (Shamir-test) — test valideert het resultaat
- **Bron:** `OnboardingWizard.tsx` L38; Heuristic 2 bevinding

---

### REC-UXDESIGN-002: Voeg terugkeerpad toe aan wizard (sticky CTA na navigate)
- **ID:** REC-UXDESIGN-002
- **Prioriteit:** P1
- **Gap:** GAP-UXDESIGN-001 / Heuristic 3
- **Beschrijving:** Na `handleNavigate()` navigeert de user naar een stap-pagina maar heeft geen visueel terugkeerpad. Voeg een floating "Ga verder met wizard →" badge toe op de doelpagina na wizard-navigate. Implementeer via een URL-query-parameter `?vanWizard=true` waarmee de stap-pagina een terugkeer-CTA rendert.
- **Succes-criterium (SMART):** ≤10% bounce van stap-pagina terug naar dashboard (geen wizard-voltooiing) t.o.v. baseline; gemeten via PostHog page-view events na implementatie
- **Impact:** UX: direct; activatieconversie: hoog `HEURISTIC`; Revenue: `INSUFFICIENT_DATA:`
- **Risico van niet-uitvoeren:** Activatieratio daalt doordat gebruikers stap beginnen maar niet terugkeren → wizard onvoltooid
- **Sprint:** SP-UX-01
- **Inspanning:** 2–3 SP (query-param routing + badge component)
- **Bron:** `OnboardingWizard.tsx` L177-L182 (`handleNavigate`); Heuristic 3

---

## Prioriteit 2 — Hoog / Pre-launch Aanbevolen

### REC-UXDESIGN-003: Voeg nabestaanden-entry-point toe aan unlock-scherm
- **ID:** REC-UXDESIGN-003
- **Prioriteit:** P2
- **Gap:** FP-003 (UX Researcher) / Heuristic 10
- **Beschrijving:** Nabestaanden die de app openen na overlijden vinden geen prominente toegangspoort. Implementeer een secundaire "Ik heb geen wachtwoord — ik ben een erfgenaam" knop op het unlock-scherm. Dit opent de nabestaandenroute (Shamir-reconstructie) direct.
- **Succes-criterium (SMART):** Nabestaande vindt nabestaandenflow binnen 60 seconden zonder zijdelingse instructie (t.m.v. usability-test REC-UX-001)
- **Impact:** UX: kritiek voor product-waardepropositie; Risk Reductie: hoog; Revenue: `INSUFFICIENT_DATA:`
- **Risico van niet-uitvoeren:** Nabestaanden bereiken de reconstructiefunctie niet → product-kernbelofte mislukt
- **Sprint:** SP-UX-01
- **Inspanning:** 2–3 SP (Electron unlock-screen + routing)
- **Bron:** FP-003; Heuristic 10

---

### REC-UXDESIGN-004: Herorden wizardstap "uitvaart" naar positie 5 of 6
- **ID:** REC-UXDESIGN-004
- **Prioriteit:** P2
- **Gap:** FP-002 (UX Researcher) / Heuristic 8
- **Beschrijving:** Uitvaartwensen staat op stap 4 van 7. Emotioneel zwaar onderwerp vroeg in de flow. Verplaats naar positie 5 of 6 (na erfgenamen) zodat de gebruiker eerst minder emotioneel beladen stappen voltooit en een gevoel van voortgang opbouwt.
- **Succes-criterium (SMART):** Wizard-voltooiingsrate stap 4 neemt niet af na herordening; gemeten via REC-UX-004 (`lumio_partial_activation`)
- **Impact:** UX: hoog `HEURISTIC`; activatieratio: verbeterend; Revenue: `INSUFFICIENT_DATA:`
- **Risico van niet-uitvoeren:** Drop-off op stap 4 → lagere activatieratio
- **Sprint:** SP-UX-02 (na Shamir-test resultaten — stap-volgorde afstemmen op bevindingen)
- **Inspanning:** 0,5 SP (array-aanpassing + verificatie)
- **Bron:** `OnboardingWizard.tsx` L30-L42 (`stappen`-array); FP-002

---

### REC-UXDESIGN-005: Genereer exporteerbaar nabestaanden-instructiekaartje
- **ID:** REC-UXDESIGN-005
- **Prioriteit:** P2
- **Gap:** GAP-UXDESIGN-001 / FP-003
- **Beschrijving:** Implementeer een in-app exporteerbare PDF/printvriendelijke pagina ("Instructiekaartje voor mijn erfgenamen") die stap-voor-stap uitlegt hoe de nabestaanden-reconstructie werkt. Erflater kan dit fysiek bewaren of e-mailen. QuestPDF is al aanwezig in de backend stack.
- **Succes-criterium (SMART):** ≥80% testnabestaanden voltooit flow na lezen van kaartje zonder extra hulp
- **Impact:** UX: kritiek voor core value-prop; Cost: `INSUFFICIENT_DATA:`; Revenue: `INSUFFICIENT_DATA:`
- **Risico van niet-uitvoeren:** Nabestaanden zonder digitale instructie — product-kernbelofte gedeeltelijk onvervuld
- **Sprint:** SP-UX-02
- **Inspanning:** 4–6 SP (QuestPDF template + frontend trigger + i18n)
- **Bron:** FP-003; REC-UX-002; QuestPDF aanwezig in `Lumio.Api.csproj`

---

## Prioriteit 3 — Nice-to-have

### REC-UXDESIGN-006: Voeg activatie-dashboard-widget toe na voltooiing wizard
- **ID:** REC-UXDESIGN-006
- **Prioriteit:** P3
- **Gap:** FP-005 (UX Researcher) / Heuristic 1
- **Beschrijving:** Na wizardvoltooiing (alle 7 stappen) geen dashboardfeedback. Voeg een "Dossier volledig" status-widget toe op het dashboard — persistent positieve feedback na activatie.
- **Succes-criterium (SMART):** ≥70% gebruikers rapporteert "duidelijk gevoel van afsluiting" in kwalitatieve test
- **Sprint:** SP-UX-03
- **Inspanning:** 1–2 SP

---

## Samenvatting Aanbevelingen

| ID | Beschrijving | Prioriteit | Sprint | Effort |
|---|---|---|---|---|
| REC-UXDESIGN-001 | Shamir-icoon & terminologie vervangen | P1 | SP-UX-01 | 1–2 SP |
| REC-UXDESIGN-002 | Terugkeerpad naar wizard na stap-navigate | P1 | SP-UX-01 | 2–3 SP |
| REC-UXDESIGN-003 | Nabestaanden entry-point op unlock-scherm | P2 | SP-UX-01 | 2–3 SP |
| REC-UXDESIGN-004 | Wizard uitvaart-stap herordenen | P2 | SP-UX-02 | 0,5 SP |
| REC-UXDESIGN-005 | Exporteerbaar nabestaanden-instructiekaartje | P2 | SP-UX-02 | 4–6 SP |
| REC-UXDESIGN-006 | Dashboard activatie-widget | P3 | SP-UX-03 | 1–2 SP |

---

## HANDOFF CHECKLIST — UX Designer Aanbevelingen
- [x] Elke aanbeveling verwijst naar GAP/RISK analyse-bevinding
- [x] P1 items zijn pre-release blockers
- [x] SMART meetcriteria per aanbeveling
- [x] Impact-velden ingevuld of als INSUFFICIENT_DATA: gemarkeerd
- [x] Risico van niet-uitvoeren gedocumenteerd
- [x] Buiten-scope items verwezen naar andere agents
- [x] Output klaar als input voor UI Designer (12) en Accessibility Specialist (13)
