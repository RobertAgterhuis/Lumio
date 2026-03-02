# Eindrapport UX & Product Experience — Lumio — 2026-03-02
> Synthesis Agent | COMBO_AUDIT: TECHNIEK + UX | Fase 3 gevalideerd

⚠️ **PARTIAL_AUDIT:** Cross-team blocker analyse is onvolledig. Ontbrekende fasen: Fase 1 (Business & Strategie), Fase 4 (Brand, Marketing & Growth). Voer `AUDIT SYNTHESIS` uit na aanvulling van de ontbrekende fase(n) voor een volledig beeld.

---

## Besluitenregister (Stap 0)

`docs/decisions.md` geladen. Actieve besluiten:
- **DEC-101:** Chromatic uitgeschakeld — REC-UIDESIGN-004 definitief VERVALLEN
- **DEC-102:** Geen nieuwe PostHog-implementatie — REC-UX-004 (`lumio_partial_activation`) GECANCELD/VERVALLEN
- **DEC-103:** Feature branch strategie (max. 1 actief)
- **DEC-104:** Main branch protected via Ruleset "ProtectLumio"
- **DEC-105:** `unsafe-inline` CSP is harde architectuurconstraint (DEC-105)

---

## 1. Samenvatting voor het UX/Product-team

**Lumio** bedient een emotioneel gevoelig domein: digitale nalatenschap voor Nederlandse burgers (primair 40+). De product-propositie steunt op twee kernbeloften: (1) de erflater kan zijn/haar wensen veilig vastleggen, en (2) nabestaanden kunnen na overlijden toegang krijgen via Shamir Secret Sharing.

**Sterktes:** De activatiefunnel is geoperationaliseerd via een 7-staps OnboardingWizard met focus-trap, Escape-to-close, en per-stap DataQuery. Een rijke design-token architectuur (8 kleurgroepen, layered tokens, Tailwind 4 mapping, WCAG AA-fixes SP-ACC1-007) is aanwezig. Keyboard-shortcuts, skip-nav, aria-modal zijn geïmplementeerd. `@storybook/addon-a11y` aanwezig in Storybook setup.

**Kritieke kwetsbaarheid:** De Shamir-reconstructieflow (kernbelofte 2) is **nooit getest met echte gebruikers** (SYS-RISK-009: score 9). 0/5 sessies uitgevoerd per testprotocol. Axe-core CI-verificatie exists alleen voor de marketingsite, niet voor de Electron-app. De toast-meldingen missen `aria-live`. De iconografie van stap 6 (Shamir/sleutels) matcht het mentale model van niet-technische gebruikers niet.

Primair risico: product launch met gevalideerde techniek maar ongevalideerde gebruikerservaring voor de meest kritische flow (nabestaanden-modus).

---

## 2. Aanbevelingen (geprioriteerd)

| Prioriteit | Aanbeveling | Bron agent/ID | Effort | Impact |
|---|---|---|---|---|
| HOOG | Shamir UX-test uitvoeren (5 sessies, protocol gereed) | UX Researcher REC-UX-001 | M (5 dgn) | Kritiek — SYS-RISK-009 |
| HOOG | Nabestaanden entry-point op unlock-scherm ("ik ben een erfgenaam") | UX Researcher/Designer REC-UX-002/REC-UXDESIGN-003 | S | Kritiek — core value prop |
| HOOG | Shamir-iconografie + terminologie vervangen (stap 6) | UX Designer REC-UXDESIGN-001 | S | Kritiek — begrijpelijkheid |
| HOOG | Terugkeerpad wizard na stap-navigate | UX Designer REC-UXDESIGN-002 | S | Hoog — activation conversie |
| HOOG | axe-core CI-gate voor Electron-app (lumio-web) | A11y REC-A11Y-001 | M | Hoog — a11y borging |
| HOOG | `aria-live` op toast-systeem | A11y REC-A11Y-002 | XS | Hoog — SC 4.1.3 compliance |
| HOOG | `aria-hidden` standaardiseren op decoratieve iconen | A11y REC-A11Y-003 | M | Hoog — SC 1.1.1 |
| ~~HOOG~~ | ~~`lumio_partial_activation` PostHog event per wizard-stap~~ | UX Researcher REC-UX-004 | XS | Hoog — funnel zichtbaarheid | **VERVALLEN — DEC-102. Geen nieuwe PostHog events.** |
| MIDDEN | Wizardvolgorde herorden (uitvaart naar pos. 5/6) | UX Researcher/Designer REC-UX-003/REC-UXDESIGN-004 | XS | Midden — drop-off preventie |
| MIDDEN | Exporteerbaar nabestaanden-instructiekaartje | UX Designer REC-UXDESIGN-005 | M | Midden — product afronding |
| MIDDEN | Onboarding usability-test (5 deelnemers) | UX Researcher REC-UX-005 | M | Midden — activatieratio validatie |
| MIDDEN | OnboardingWizard Storybook-story | UI Designer REC-UIDESIGN-002 | S | Midden — design system dekking |
| MIDDEN | Screen reader test (NVDA/VoiceOver) | A11y REC-A11Y-005 | M | Midden — AT-compatibiliteit |
| LAAG | Storybook nabestaanden + security flows | UI Designer REC-UIDESIGN-003 | M | Midden — visuele regressie |
| ~~LAAG~~ | ~~Visual regression testing (Chromatic/alternatief)~~ | UI Designer REC-UIDESIGN-004 | M | Midden — DEC-101 herbeoordeling | **VERVALLEN — DEC-101 BESLOTEN. Chromatic/visual regression niet in huidige cyclus.** |
| LAAG | Activatie celebration-moment | UX Researcher/Designer REC-UX-006/REC-UXDESIGN-006 | XS | Laag — positive reinforcement |

---

## 3. Roadmap-items voor dit team (12 maanden)

| Kwartaal | Item | Afhankelijk van | KPI target |
|---|---|---|---|
| Q1 (SP-UX-01) | Shamir UX-test, icoon/copy fix, nabestaanden-entry, wizard terugkeer CTA, axe-CI, aria-live, aria-hidden, Wizard story | SP-10 gemerged (✓) | Shamir test ≥4/5; axe-CI baseline 0 critical/serious |
| Q1–Q2 (SP-UX-02) | Wizardvolgorde, instructiekaartje, nabestaanden Storybook, video-captions onderzoek, screen reader test, heading audit, onboarding usability test | SP-UX-01 aanbevelingen verwerkt | Voltooiingsrate ≥80% usability test |
| Q2–Q3 (SP-UX-03) | Celebration moment | Geen blockers | n.v.t. |
| Q3–Q4 | Continuïteit: halfjaarlijkse usability-test cycle | SP-UX-02 baseline | NPS/activatieratio stabiel of stijgend |

---

## 4. KPI's voor dit team

| KPI | Baseline | 6-maands target | 12-maands target | Meetmethode |
|---|---|---|---|---|
| Shamir UX-test (T-01 succes) | 0/5 sessies | ≥4/5 (≥80%) | ≥4/5 per halfjaar | Formeel testprotocol |
| Activatieratio (lumio_activated) | `INSUFFICIENT_DATA:` — pre-launch | ≥50% binnen 30 dgn post-launch | ≥60% | PostHog funnel |
| Wizard per-stap drop-off | `INSUFFICIENT_DATA:` | **VERVALLEN** — `lumio_partial_activation` gecanceld (DEC-102) | n.v.t. | n.v.t. |
| axe-core violations (Electron-app) | `INSUFFICIENT_DATA:` — nooit gemeten | Baseline vastgesteld na SP-UX-01 | 0 critical/serious | axe-playwright CI |
| SC 4.1.3 (toast aria-live) | Aanwezig (niet geverifieerd) | Geverifieerd PASSED | 0 violations | axe-scan |
| OnboardingWizard Storybook-dekking | 0% (geen story bestaand) | ≥1 story aanwezig | ≥3 varianten + a11y OK | Storybook |

---

## 5. ⚠️ Blockers vanuit andere teams (ACTIE VEREIST)

| Blocker ID | Blokkerend team | Wat is nodig | Prioriteit | Aanbevolen deadline |
|---|---|---|---|---|
| BLK-UX-001 | Engineering | Session auto-lock timing (REC-SEC-003) — UX moet waarschuwingstekst + timing afstemmen vóór SP-12 implementatie | HOOG | Vóór SP-12 start |
| BLK-UX-002 | Engineering | Unlock-scherm wijziging voor nabestaanden-entry-point (REC-UXDESIGN-003) vereist Electron main-process aanpassing | HOOG | SP-UX-01 |
| ~~BLK-UX-003~~ | ~~Business/Product Owner~~ | ~~DEC-101 (Chromatic) herbeoordeling nodig vóór visual regression sprint SP-UX-03~~ | ~~MIDDEN~~ | ~~Vóór SP-UX-03~~ | **VERVALLEN: DEC-101 definitief BESLOTEN.** |

---

## 6. Afstemming gewenst met andere teams (ADVISEREND)

| Item | Betrokken team | Reden | Urgentie |
|---|---|---|---|
| SSR-migratie impact (SP-15) | Engineering | Overgang static export → SSR raakt Next.js rendering, alle frontend routes | LAAG — lange termijn |
| ~~PostHog event implementatie~~ | ~~Engineering~~ | ~~`lumio_partial_activation` event per wizard-stap (REC-UX-004)~~ | ~~HOOG — SP-UX-01~~ | **VERVALLEN: DEC-102 (geen nieuwe PostHog events).** |
| Nabestaanden-instructiekaartje (QuestPDF) | Engineering | PDF-generatie via QuestPDF backend — UX levert template-specificaties | MIDDEN — SP-UX-02 |

---

## 7. Open items (UNCERTAIN / INSUFFICIENT_DATA)

| ID | Beschrijving | Originating Agent | Actie |
|---|---|---|---|
| INSUFFICIENT_DATA: gebruikersonderzoek | Alle UX-claims zijn heuristisch — geen empirische data | UX Researcher | Uitvoeren na launch (REC-UX-005) |
| INSUFFICIENT_DATA: activatieratio baseline | Pre-launch — geen historische data | UX Researcher | Meten direct na launch via PostHog |
| UNCERTAIN: video-captions vereist | videoboodschappen/ component — scope onbekend | A11y Specialist | SP-UX-02-004 onderzoek |
| UNCERTAIN: EAA juridische scope | Electron-desktop mogelijk buiten EAA formele scope | A11y Specialist | Juridisch advies aanbevolen |
| INSUFFICIENT_DATA: screen reader test | Nooit uitgevoerd | A11y Specialist | REC-A11Y-005 SP-UX-02 |
| INSUFFICIENT_DATA: formulier-validatie UX | Inline error message kwaliteit niet geïnspecteerd | UX Designer | Follow-up in volgende sprint |

---

## 8. Guardrails voor dit team

Uit `docs/fase-3/guardrails.md` — bindend voor alle Implementation Agents en UX designers:

| ID | Guardrail |
|---|---|
| G-UX-101 | Shamir-reconstructie flow niet live zonder ≥4/5 usability test succes (SYS-RISK-009) |
| G-UX-102 | `aria-live="polite/assertive"` verplicht op alle statusberichten/toast-containers |
| G-UX-103 | Decoratieve iconen: `aria-hidden="true"` verplicht; informatieve iconen: `aria-label` verplicht |
| G-UX-104 | `lumio_partial_activation` PostHog event verplicht per wizard-stap na SP-UX-01-005 |
| G-UX-105 | Nieuwe primaire interactie-componenten vereisen Storybook-story + a11y-addon PASSED |
| G-UX-106 | axe-core CI-gate op lumio-web verplicht na SP-UX-01-006: zero critical/serious violations |
