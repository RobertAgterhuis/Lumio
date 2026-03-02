# Sprintplan – Fase 3 (UX & Product) – 2026-03-02
> Fase 3 Sprintplan | UX Researcher + UX Designer + UI Designer + Accessibility Specialist

## Metadata
- Fase: 3 — UX & Product Experience
- Input: Fase 3 aanbevelingen (REC-UX-001–006, REC-UXDESIGN-001–006, REC-UIDESIGN-001–004, REC-A11Y-001–006)
- Datum: 2026-03-02

---

## Aannames

- **Team:** `INSUFFICIENT_DATA:` — team-samenstelling en capaciteit onbekend
- **Sprint duur:** 2 weken (default)
- **Story points:** Relatief geschat; calibratie vereist bij team-bekendmaking
- **SP-12/SP-13 overlap:** Design-token violations (REC-UIDESIGN-001) zijn reeds opgenomen in Fase 2 sprintplan — NIET dubbel ingepland
- **SP-UX-01 is release-criterium:** SYS-RISK-009 is score-9 blocker vóór v1.0 release

---

## Sprint SP-UX-01 — Pre-release UX Veiligheid & A11y Fundament

**Sprint doel:** Alle pre-release UX/A11y blockers oplossen vóór v1.0 release: Shamir UX gevalideerd, nabestaanden-entry aanwezig, axe-CI actief voor app.

**KPI-targets:**
- Shamir UX-test: ≥4/5 sessies geslaagd (T-01:≥80%, T-03:≥80%, T-04:≤4/7 stress)
- axe-core CI lumio-web: baseline vastgesteld + zero critical/serious violations
- `aria-live` toast: 0 SC-4.1.3 violations in axe-scan

### Stories

**SP-UX-01-001** (REC-UX-001, REC-UXDESIGN-001)
- Als product owner wil ik dat het Shamir UX-testprotocol wordt uitgevoerd (5 sessies) zodat SYS-RISK-009 empirisch gevalideeerd is voor release.
- Type: `ANALYSIS`
- Team: UX Researcher
- Story points: `INSUFFICIENT_DATA:`
- Acceptatiecriterium: Gegeven het testprotocol (`shamir-ux-test-protocol.md`), wanneer 5 particiaptiesessies zijn afgerond, dan zijn T-01 t/m T-05 resultaten gedocumenteerd en rapporteert ≥4/5 deelnemers succes op T-01.
- Afhankelijkheden: SP-10 (Shamir-drempel-fix) gemerged — DONE
- Blocker: NONE

**SP-UX-01-002** (REC-UXDESIGN-001)
- Als erflater wil ik dat stap 6 van de wizard begrijpelijk is beschreven zodat ik snap wat ik moet doen met mijn erfgenamen.
- Type: `CODE` + `DESIGN`
- Team: UX Designer + Implementation Agent
- Story points: 2 SP
- Acceptatiecriteria:
  - Gegeven de wizard, wanneer stap 6 getoond wordt, dan is het icoon en label vervangen door "Erfgenamen informeren" met `UserCheck`-icoon.
  - Gegeven de gewijzigde copy, wanneer Shamir UX-test (SP-UX-01-001) is uitgevoerd, dan begrijpt ≥80% testdeelnemers de stap zonder toelichting.
- Afhankelijkheden: SP-UX-01-001 valideert resultaat
- Blocker: NONE

**SP-UX-01-003** (REC-UXDESIGN-002)
- Als gebruiker die via de wizard naar een stap-pagina navigeert wil ik een zichtbare terugkeer-CTA zien zodat ik de wizard kan hervatten.
- Type: `CODE`
- Team: Implementation Agent
- Story points: 3 SP
- Acceptatiecriteria:
  - Gegeven een stap-pagina geopend via wizard (URL bevat `?vanWizard=true`), wanneer de pagina laadt, dan is een "Ga verder met wizard →" badge zichtbaar bovenin.
  - Gegeven de badge, wanneer erop geklikt wordt, dan opent de wizard-modal opnieuw.
- Afhankelijkheden: NONE
- Blocker: NONE

**SP-UX-01-004** (REC-UX-002 + REC-UXDESIGN-003)
- Als nabestaande wil ik op het unlock-scherm een duidelijk secundaire toegangsknop zien zodat ik de nabestaanden-modus kan vinden zonder het hoofdwachtwoord.
- Type: `CODE`
- Team: Implementation Agent
- Story points: 3 SP
- Acceptatiecriteria:
  - Gegeven het unlock-scherm, wanneer een gebruiker het opent, dan is er een "Ik heb geen wachtwoord — ik ben een erfgenaam" knop zichtbaar onder het wachtwoordveld.
  - Gegeven de knop, wanneer erop geklikt wordt, dan navigeert de app direct naar de Shamir-reconstructie flow.
- Afhankelijkheden: NONE
- Blocker: NONE

**~~SP-UX-01-005~~** (REC-UX-004) — **VERVALLEN — DEC-102**
- ~~Als productowner wil ik per wizard-stap een PostHog event ontvangen zodat funnel drop-off meetbaar is.~~
- **Status:** VERVALLEN. Geen nieuwe PostHog events implementeren (DEC-102). REC-UX-004 (`lumio_partial_activation`) is gecanceld. Funnel-meting via PostHog is uitgesteld totdat product owner besluit dit te heropenen buiten de reguliere sprint-cyclus.
- Afhankelijkheden: n.v.t.
- Blocker: DEC-102

**SP-UX-01-006** (REC-A11Y-001)
- Als developer wil ik een axe-core CI-gate op de Electron-app zodat a11y-regressies voor productie worden gesignaleerd.
- Type: `CODE` + `INFRA`
- Team: Implementation Agent + DevOps Engineer
- Story points: 4 SP
- Acceptatiecriteria:
  - Gegeven CI-pipeline, wanneer een PR wordt aangemaakt, dan draait axe-scan op ≥3 primaire flows van lumio-web.
  - Gegeven de scan, wanneer ≥1 critical/serious violation wordt gevonden, dan faalt CI en wordt PR geblokkeerd.
- Afhankelijkheden: NONE
- Blocker: NONE

**SP-UX-01-007** (REC-A11Y-002)
- Als screen reader-gebruiker wil ik toast-meldingen horen zodat ik op de hoogte ben van succes/foutmeldingen.
- Type: `CODE`
- Team: Implementation Agent
- Story points: 1 SP
- Acceptatiecriteria:
  - Gegeven een foutmelding-toast, wanneer deze verschijnt, dan is `aria-live="assertive"` aanwezig op de container.
  - Gegeven een succes-toast, wanneer deze verschijnt, dan is `aria-live="polite"` aanwezig.
  - Gegeven axe-scan (SP-UX-01-006), dan 0 SC-4.1.3-violations voor toast.
- Afhankelijkheden: SP-UX-01-006 (axe-CI)
- Blocker: NONE

**SP-UX-01-008** (REC-A11Y-003)
- Als screen reader-gebruiker wil ik niet lastiggevallen worden door decoratieve iconen zodat de focus op inhoud ligt.
- Type: `CODE`
- Team: Implementation Agent
- Story points: 3 SP
- Acceptatiecriteria:
  - Gegeven elke decoratieve Lucide-icoon naast tekst-label, dan is `aria-hidden="true"` aanwezig.
  - Gegeven elke informatieve Lucide-icoon zonder tekst-label, dan is `aria-label` aanwezig.
  - axe scan: 0 SC-1.1.1-violations.
- Afhankelijkheden: NONE
- Blocker: NONE

**SP-UX-01-009** (REC-UIDESIGN-002)
- Als UI designer/developer wil ik de OnboardingWizard als Storybook-story hebben zodat visuele regressies detecteerbaar zijn.
- Type: `CODE`
- Team: Implementation Agent + UI Designer
- Story points: 2 SP
- Acceptatiecriteria:
  - Gegeven Storybook, wanneer het gesstart wordt, dan is `OnboardingWizard` story aanwezig met ≥3 varianten (leeg, deels, volledig).
  - Gegeven `@storybook/addon-a11y`, wanneer story geselecteerd wordt, dan toont a11y-panel geen critical violations.
- Afhankelijkheden: NONE
- Blocker: NONE

---

## Sprint SP-UX-02 — Onboarding Optimalisatie & Nabestaanden Tooling

**Sprint doel:** Onboarding flow verbeterd (volgorde, nabestaanden-instructie), Storybook uitgebreid met kritieke flows, a11y-gapdekking verhoogd.

**KPI-targets:**
- Wizard-voltooiingsrate stap "uitvaart" onveranderd of beter na volgorde-aanpassing (alternatieve meting via productanalyse — SP-UX-01-005 VERVALLEN per DEC-102)
- Nabestaanden-instructiekaartje beschikbaar voor export
- ShamirDialog + nabestaanden component in Storybook

### Stories

**SP-UX-02-001** (REC-UX-003, REC-UXDESIGN-004)
- Als erflater wil ik uitvaartwensen pas later in de wizard invullen zodat ik niet direct geconfronteerd word met emotioneel moeilijk onderwerp.
- Type: `CODE`
- Team: Implementation Agent + UX Designer  
- Story points: 1 SP
- Acceptatiecriteria:
  - Gegeven de wizard, wanneer gestard, dan staat "uitvaart" op positie 5 of 6 (na erfgenamen).
  - Gegeven REC-UX-004 data, wanneer ≥1 week na deployment geanalyseerd, dan is drop-off op nieuwe positie niet slechter.
- Afhankelijkheden: SP-UX-01-005 VERVALLEN (DEC-102) — drop-off meting via alternatieve methode of handmatig
- Blocker: NONE

**SP-UX-02-002** (REC-UXDESIGN-005)
- Als erflater wil ik een instructiekaartje kunnen exporteren voor mijn erfgenamen zodat ze weten hoe ze de nabestaanden-modus kunnen gebruiken.
- Type: `CODE`
- Team: Implementation Agent
- Story points: 5 SP (QuestPDF template)
- Acceptatiecriteria:
  - Gegeven de instellingen-pagina, wanneer "Exporteer erfgenamen-instructie" geklikt wordt, dan genereert QuestPDF een PDF in NL + EN.
  - Gegeven de PDF, wanneer geprint, dan bevat het per-stap instructie voor Shamir-reconstructie.
- Afhankelijkheden: NONE
- Blocker: NONE

**SP-UX-02-003** (REC-UIDESIGN-003)
- Als UI designer wil ik de ShamirDialog en nabestaanden-component als Storybook-stories zodat ze visueel en a11y-getest kunnen worden.
- Type: `CODE`
- Team: Implementation Agent + UI Designer
- Story points: 3 SP
- Acceptatiecriteria:
  - Gegeven Storybook, wanneer gestart, dan zijn ShamirDialog en nabestaanden-entry aanwezig met ≥2 varianten elk.
  - a11y-addon: geen critical violations.
- Afhankelijkheden: SP-UX-01-009
- Blocker: NONE

**SP-UX-02-004** (REC-A11Y-004)
- Als team wil ik weten of videoboodschappen-component caption-support vereist zodat we compliant zijn met SC 1.2.2.
- Type: `ANALYSIS`
- Team: UX Researcher + Implementation Agent
- Story points: 1 SP
- Acceptatiecriteria:
  - Gegeven een analyse van `videoboodschappen/`-component, wanneer video-playback aanwezig is, dan is een follow-up story aangemaakt voor caption-implementatie.
- Afhankelijkheden: NONE
- Blocker: NONE

**SP-UX-02-005** (REC-A11Y-005)
- Als Accessibility Specialist wil ik een handmatige screen reader test uitvoeren zodat echte AT-compatibiliteit gecertificeerd is.
- Type: `ANALYSIS`
- Team: Accessibility Specialist
- Story points: 3 dagen
- Acceptatiecriteria:
  - Gegeven NVDA op Windows, wanneer 3 primaire flows doorlopen, dan zijn bevindingen gedocumenteerd inclusief pass/fail per flow.
- Afhankelijkheden: SP-UX-01-006 (axe-CI actief)
- Blocker: NONE

**SP-UX-02-006** (REC-A11Y-006)
- Als developer wil ik dat heading-hiërarchie gevalideerd is zodat screen reader-gebruikers kunnen navigeren per heading.
- Type: `CODE` + `ANALYSIS`
- Team: Implementation Agent
- Story points: 2 SP
- Acceptatiecriteria:
  - Gegeven axe-scan met `heading-order` rule, wanneer gedraaid op ≥5 domein-secties, dan 0 violations.
  - Handmatige audit PASSED voor testament, uitvaart, erfgenamen, noodcontacten, instellingen.
- Afhankelijkheden: SP-UX-01-006 (axe-CI)
- Blocker: NONE

**SP-UX-02-007** (REC-UX-005)
- Als product owner wil ik dat de volledige onboarding wizard getest is met 5 gebruikers zodat de activatieratio-voorspelling empirisch onderbouwd is.
- Type: `ANALYSIS`
- Team: UX Researcher
- Story points: `INSUFFICIENT_DATA:`
- Acceptatiecriteria:
  - Gegeven 5 testdeelnemers (profiel: 40-70 jr, niet-technisch), wanneer wizard doorlopen, dan is voltooiingsrate gedocumenteerd.
  - Target: ≥80% eerste-poging voltooiing.
- Afhankelijkheden: SP-UX-01-001 + SP-UX-01-002 + SP-UX-02-001 klaar
- Blocker: NONE

---

## Sprint SP-UX-03 — Kwaliteitsverbetering & Visual Regression (optioneel)

**Sprint doel:** Nice-to-have UX verbeteringen. Visual regression via Chromatic uitgesteld (DEC-101); alternatieve tooling optioneel na v1.0.

### Stories

**SP-UX-03-001** (REC-UX-006, REC-UXDESIGN-006)
- Als gebruiker wil ik een celebration-moment na wizardvoltooiing zodat ik weet dat mijn dossier compleet is.
- Type: `CODE`
- Story points: 2 SP
- Acceptatiecriteria: Gegeven alle 7 stappen voltooid, wanneer de wizard sluit, dan toont het dashboard gedurende 5 seconden een "Dossier volledig" toast/banner.
- Blocker: NONE

**~~SP-UX-03-002~~** (REC-UIDESIGN-004) — **VERVALLEN — DEC-101**
- ~~Als development team wil ik visual regression testing hersteld zodat design-token-wijzigingen geen stille regressies veroorzaken.~~
- **Status:** VERVALLEN. Chromatic uitgeschakeld (DEC-101). Visual regression tooling wordt niet geactiveerd in huidige sprint-cyclus. Heroverwegen na v1.0 met alternatieve tooling indien gewenst.
- Blocker: DEC-101

---

## Traceability P1-aanbevelingen

| REC | Prioriteit | Story |
|---|---|---|
| REC-UX-001 | P1 | SP-UX-01-001 |
| REC-UX-002 | P1 | SP-UX-01-004 |
| REC-UXDESIGN-001 | P1 | SP-UX-01-002 |
| REC-UXDESIGN-002 | P1 | SP-UX-01-003 |
| REC-A11Y-001 | P1 | SP-UX-01-006 |
| REC-A11Y-002 | P1 | SP-UX-01-007 |
| REC-A11Y-003 | P1 | SP-UX-01-008 |

**Alle P1-aanbevelingen gedekt door minstens 1 story ✓**

---

## HANDOFF CHECKLIST — Sprintplan Fase 3
- [x] Aannames gedocumenteerd (INSUFFICIENT_DATA team)
- [x] Alle P1-aanbevelingen gedekt (traceability tabel)
- [x] Alle stories hebben acceptatiecriteria
- [x] Story-type geclassificeerd per story
- [x] Blocker-veld aanwezig op elke story
- [x] KPI-targets per sprint
- [x] SP-12/SP-13 overlap (raw colors) niet dubbel ingepland
