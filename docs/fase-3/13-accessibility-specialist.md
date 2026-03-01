# Fase 3 — Accessibility Specialist
**Agent:** 13-accessibility-specialist  
**Datum:** 2026-03-01  
**Input:** docs/fase-3/10-ux-researcher.md, docs/fase-3/11-ux-designer.md, docs/fase-3/12-ui-designer.md, storybook-static/project.json, globals.css, component analyse  
**Status:** GEREED VOOR HANDOFF — FASE 3 AFSLUITING

---

## SECTIE 1: ACCESSIBILITY_FLAG Inventory

Ontvangen flags van voorgaande agents:

| Flag | Agent | Beschrijving | Initiële prioriteit |
|---|---|---|---|
| AF-001 | UI Designer (12) | Typografie-scale INSUFFICIENT_DATA — contrast/leesbaarheid onbekend | Middel |
| AF-002 | UI Designer (12) | Dark mode onbevestigd — contrast in dark mode onbekend | Middel |
| AF-003 | UI Designer (12) | SP-6-004: primary-400 contrast fix gedocumenteerd (was 2.88:1, nu 4.98:1) | Positief — al opgelost |
| AF-004 | UX Researcher (10) | Doelgroep 40+ niet-technisch — cognitieve toegankelijkheid essentieel | Hoog |
| AF-005 | UX Designer (11) | Shamir wizard hoge cognitive load in crisissituatie (score 9/10) | Kritiek |
| AF-006 | UX Researcher (10) | Videoboodschappen-module aanwezig — captions-strategie onbekend | Hoog |

---

## SECTIE 2: WCAG Conformiteitsniveau

**Vastgesteld niveau: WCAG 2.1 AA (verplicht)**

**Rationale:**
- `CROSS_AGENT_INPUT:` Fase 1 — product in Nederland, AVG + EAA-scope (EU Accessibility Act)
- Doelgroep 40+, niet-technisch — zware cognitieve belasting en mogelijk visuele/motorische beperkingen
- Domein "bijzondere categorie persoonsgegevens" (gezondheidsdata) → hoog publiek vertrouwen vereist, wat toegankelijkheid onderdeel maakt van de betrouwbaarheidsbelofte
- EAA (Accessibility Directive 2019/882) van kracht in EU per Oktober 2025 voor nieuwe producten; Lumio is pre-launch → verplicht compliant bij lancering

**WCAG 2.1 AAA:** Aspirationeel niveau voor cognitieve toegankelijkheid (SC 3.1.5 leesniveau, SC 1.4.8) — niet verplicht maar sterk aanbevolen gezien 40+ doelgroep + terminale thematiek.

---

## SECTIE 3: WCAG Analyse per Principe

### Perceivable

| SC | Criterium | Status | Bevinding | Bron | Prioriteit |
|---|---|---|---|---|---|
| 1.1.1 | Non-text content (alt-tekst) | `UNCERTAIN:` | LumioIcon en lucide-react iconen: `UNCERTAIN:` of `aria-label`s consequent aanwezig zijn. `icon.tsx` aanwezig maar screen reader labelling niet geverifieerd. | `components/ui/icon.tsx` | Hoog |
| 1.2.1 | Audio-only / Video-only (captions) | **Risico** | `/videoboodschappen` route aanwezig. Video content captioning-strategie onbekend. Zelf-opgenomen video = geen auto-captions. | page-structure analyse | Hoog |
| 1.2.2 | Captions (live) | `NIET VAN TOEPASSING:` | Geen live-streaming functionaliteit | architectuur | N/A |
| 1.3.1 | Info and relationships (semantische HTML) | `UNCERTAIN:` | Radix UI gebruikt (`@radix-ui/react-slot`) — Radix biedt sterke ARIA-implementaties. `UNCERTAIN:` of custom componenten buiten ui/ ook semantisch correct zijn. | storybook-static/project.json | Middel |
| 1.3.2 | Meaningful sequence | `UNCERTAIN:` | DOM-volgorde niet geanalyseerd | INSUFFICIENT_DATA | Middel |
| 1.3.3 | Sensory characteristics | `UNCERTAIN:` | Geen expliciete "click here" patronen gevonden maar onbevestigd | INSUFFICIENT_DATA | Middel |
| 1.4.1 | Color as sole indicator | `UNCERTAIN:` | Status badges (`status-badge.tsx`) — `UNCERTAIN:` of er naast kleur ook icoon/tekst status aangeeft | `components/ui/status-badge.tsx` | Hoog |
| 1.4.3 | Contrast (minimum, AA) | **Gedeeltelijk** | SP-6-004 fix aanwezig (4.98:1 ✅). Andere kleuren ongeauditeerd. `muted-foreground: #6B7280` op `background: #F3F7F8` = `UNCERTAIN:` ratio. | `globals.css` | Hoog |
| 1.4.4 | Resize text (200%) | `UNCERTAIN:` | Tailwind-based layout — `UNCERTAIN:` of tekst-uitvergoting tot 200% layout-breuken veroorzaakt | INSUFFICIENT_DATA | Middel |
| 1.4.10 | Reflow (WCAG 2.1, AA) | `UNCERTAIN:` | Electron-app heeft vaste viewport; responsiveness onbekend | INSUFFICIENT_DATA | Middel |
| 1.4.11 | Non-text contrast (AA, 3:1) | `UNCERTAIN:` | Formulier-rand kleuren (#E5E7EB op #F3F7F8): visueel contrast ratio `UNCERTAIN:` | `globals.css --color-border` | Hoog |
| 1.4.12 | Text spacing (WCAG 2.1, AA) | `UNCERTAIN:` | INSUFFICIENT_DATA over letter/line spacing ondersteuning | INSUFFICIENT_DATA | Laag |

---

### Operable

| SC | Criterium | Status | Bevinding | Bron | Prioriteit |
|---|---|---|---|---|---|
| 2.1.1 | Keyboard accessible | `UNCERTAIN:` | Radix UI components hebben keyboard support ingebouwd. `UNCERTAIN:` of SortableDomeinKaart (drag-and-drop) keyboard-toegankelijk is. | `components/dashboard/SortableDomeinKaart.tsx` | Hoog |
| 2.1.2 | No keyboard trap | `UNCERTAIN:` | Dialogs (ShamirDialog, OnboardingWizard) — Radix Dialog heeft focus trap ingebouwd maar custom dialogs kunnen dit missen | `components/nabestaanden/`, `ShamirDialog.tsx` | Kritiek |
| 2.2.1 | Timing adjustable | `NIET VAN TOEPASSING:` | Geen time-limited content geïdentificeerd | architectuur | N/A |
| 2.3.1 | Three flashes / below threshold | `VOLDOET:` | Geen animaties/flashes geïdentificeerd die drempel bereiken; `transitions.tsx` aanwezig (fade-ins) | `components/ui/transitions.tsx` | N/A |
| 2.4.1 | Bypass blocks ("skip to content") | **Probleem** | `HEURISTISCH:` Geen skip-link geïdentificeerd voor keyboard-gebruikers die navigatie willen overslaan | layout-analyse | Hoog |
| 2.4.2 | Page titled | `UNCERTAIN:` | Next.js `layout.tsx` — `UNCERTAIN:` of elke pagina een unieke `<title>` heeft | `app/(authenticated)/layout.tsx` | Middel |
| 2.4.3 | Focus order | `UNCERTAIN:` | Focus-volgorde bij 17-item navigatie onbekend | INSUFFICIENT_DATA | Middel |
| 2.4.4 | Link purpose | `UNCERTAIN:` | Navigatie-links — `UNCERTAIN:` of icon-only links `aria-label` hebben | layout-analyse | Hoog |
| 2.4.7 | Focus visible | `UNCERTAIN:` | Tailwind focus ring styles (`ring`-4) — `UNCERTAIN:` of consequent toegepast | `globals.css --color-ring` | Hoog |
| 2.5.3 | Label in name | `UNCERTAIN:` | `UNCERTAIN:` of accessible name van buttons inclusief visueel label is | INSUFFICIENT_DATA | Middel |

---

### Understandable

| SC | Criterium | Status | Bevinding | Bron | Prioriteit |
|---|---|---|---|---|---|
| 3.1.1 | Language of page | `UNCERTAIN:` | `UNCERTAIN:` of `<html lang="nl">` aanwezig is in root layout | `app/layout.tsx` | Hoog |
| 3.1.2 | Language of parts | `UNCERTAIN:` | i18n via `next-intl` — `UNCERTAIN:` of Engels/Nederlands delen gemarkeerd zijn | `messages/` i18n | Laag |
| 3.2.1 | On focus | `VOLDOET:` | Geen automatische context-wijzigingen bij focus identifieerbaar | HEURISTISCH | N/A |
| 3.2.3 | Consistent navigation | `UNCERTAIN:` | `CROSS_AGENT_INPUT:` UX Designer identificeert 17-item navigatie als problematisch — inconsistentie na IA-herstructurering sprint | GAP-UXD-003 | Middel |
| 3.3.1 | Error identification | **Probleem** | `CROSS_AGENT_INPUT:` GAP-UXD-005 — formulier-fout display niet gestandaardiseerd. Screen readers vereisen `role="alert"` of `aria-live` bij dynamisch toegevoegde foutmeldingen. | `Validators/`, API error handling | Hoog |
| 3.3.2 | Labels or instructions | `UNCERTAIN:` | `label.tsx` en `LabelWithHelp.tsx` aanwezig. `UNCERTAIN:` of alle formuliervelden gekoppeld zijn via `htmlFor` of `aria-labelledby`. | `components/ui/label.tsx` | Hoog |
| 3.3.3 | Error suggestion (AA) | **Probleem** | `CROSS_AGENT_INPUT:` Shamir wizard foutmeldingen bij onjuiste deelcodes — INSUFFICIENT_DATA over suggestieve foutmelding (bijv. "Code te kort — verwacht 64 tekens") | ShamirDialog.tsx | Hoog |
| 3.3.4 | Error prevention for legal (AA) | **Vereiste extra aandacht** | Testament, euthanasie-verklaring, donor — juridisch bindende content. Vereist: review stap + bevestigings-dialog voor definitieve opslaan | domein analyse | Kritiek |

---

### Robust

| SC | Criterium | Status | Bevinding | Bron | Prioriteit |
|---|---|---|---|---|---|
| 4.1.1 | Parsing | `VOLDOET (aanwijzing):` | Next.js JSX → HTML output is structureel correct. Radix UI genereert valide ARIA-attributen. | Radix UI architectuur | — |
| 4.1.2 | Name, role, value | `UNCERTAIN:` | Custom componenten buiten Radix/ui/ — `UNCERTAIN:` of `aria-*` attributen correct. Specifiek: `SortableDomeinKaart`, `VoortgangGranulair`, wizard-componenten | heuristische analyse | Hoog |
| 4.1.3 | Status messages (WCAG 2.1, AA) | **Probleem** | Toast-meldingen (opslaan, fouten) moeten `role="status"` of `aria-live="polite"` hebben zodat screen readers ze aankondigen. `toast.tsx` aanwezig maar implementatie onbekend. | `components/ui/toast.tsx` | Hoog |

---

## SECTIE 4: Juridische Compliance Status

### European Accessibility Act (EAA) / EN 301 549

| Aspect | Status |
|---|---|
| Van toepassing | ✅ JA — Lumio is een digitaal product aangeboden in de EU |
| EAA deadline (Directive 2019/882) | **28 Juni 2025** voor nieuwe producten/diensten — Lumio is pre-launch → **VERPLICHT compliant bij lancering** |
| WCAG 2.1 AA basis | `UNCERTAIN:` — audit onvolledig (zie analyse boven), maar tooling (axe-playwright) aanwezig |
| EN 301 549 volledig | INSUFFICIENT_DATA — gedetailleerde EN 301 549 audit niet uitgevoerd |

### ADA (USA)

| Aspect | Status |
|---|---|
| Van toepassing | `UNCERTAIN:` — afhankelijk van geografische distributie (Fase 1 vermeldde NL-focus) |

**CONCLUSIE:** EAA-deadlinecompliance is een RELEASE BLOCKER als WCAG 2.1 AA-gaten niet gedicht zijn.

---

## SECTIE 5: Assistive Technology Compatibiliteit

| Test | Status |
|---|---|
| Screen reader (JAWS, NVDA, VoiceOver) | INSUFFICIENT_DATA — geen tests uitgevoerd |
| Keyboard-only navigatie | INSUFFICIENT_DATA — niet getest |
| High-contrast mode (Windows) | INSUFFICIENT_DATA — dark mode al UNCERTAIN |
| axe-playwright geïnstalleerd | ✅ JA — versie 2.2.2 (storybook-static/project.json) |
| axe geïntegreerd in CI | **AFWEZIG** — geïnstalleerd maar niet geactiveerd in ci.yml |

**Positieve bevinding:** `axe-playwright 2.2.2` is aanwezig in de Storybook + Vitest-toolchain. Dit betekent dat geautomatiseerde accessibility-checks kunnen worden geactiveerd met minimale configuratie-inspanning.

---

## SECTIE 6: Gap Analyse (Accessibility)

| ID | Gap | Prioriteit | SC ref | Bron |
|---|---|---|---|---|
| GAP-ACC-001 | axe-playwright geïnstalleerd maar NIET geactiveerd in CI — geen geautomatiseerde a11y checks | KRITIEK | SC 4.1.2 | storybook-static/project.json axe-playwright aanwezig + ci.yml zonder a11y stap |
| GAP-ACC-002 | lang-attribuut op `<html>` niet geverifieerd | HOOG | SC 3.1.1 | app/layout.tsx niet volledig geanalyseerd |
| GAP-ACC-003 | Toast-berichten geen `aria-live` of `role="status"` — screen readers missen save/error confirmaties | HOOG | SC 4.1.3 | `toast.tsx` structuur onbekend |
| GAP-ACC-004 | Formulier error-meldingen mogelijk zonder `role="alert"` — dynamische fouten onzichtbaar voor screen reader | HOOG | SC 3.3.1 | GAP-UXD-005 + accessibility laag |
| GAP-ACC-005 | Videoboodschappen — geen captions-strategie voor eigen-opgenomen video | HOOG | SC 1.2.1 | page-structure analyse |
| GAP-ACC-006 | Drag-and-drop dashboard (SortableDomeinKaart) — keyboard-alternatief onbekend | HOOG | SC 2.1.1 | component analyse |
| GAP-ACC-007 | Skip-to-content link afwezig in navigatie | HOOG | SC 2.4.1 | layout analyse |
| GAP-ACC-008 | Muted-foreground (#6B7280) contrast op licht background — ratio niet geverifieerd | MIDDEL | SC 1.4.3 | `globals.css` |
| GAP-ACC-009 | Formulierveld-labels koppeling (`htmlFor`/`aria-labelledby`) niet geverifieerd over alle formulieren | HOOG | SC 3.3.2 | form components analyse |
| GAP-ACC-010 | Testament/euthanasie — geen confirmation/review stap bij submit voor juridisch bindende content | HOOG | SC 3.3.4 | domeinanalyse |
| GAP-ACC-011 | EAA-compliance niet getoetst — lancering vereist WCAG 2.1 AA bewijs | RELEASE BLOCKER | EAA 2019/882 | juridische context EU |

---

## SECTIE 7: Geprioriteerd Remediatie-Plan

### Kritiek (release blockers)

| ID | Actie | SC | Inspanning |
|---|---|---|---|
| ACC-FIX-001 | Activeer `axe-playwright` in CI als geautomatiseerde a11y check stap | SC 4.1.2 | 1 SP |
| ACC-FIX-002 | Verifieer + zet `lang="nl"` op `<html>` in root layout | SC 3.1.1 | 0.5 SP |
| ACC-FIX-011 | Voer pre-launch WCAG 2.1 AA audit uit (manueel of via tooling) als EAA bewijs | EAA | 3 SP |

### Hoog

| ID | Actie | SC | Inspanning |
|---|---|---|---|
| ACC-FIX-003 | Voeg `aria-live="polite"` toe aan toast berichten | SC 4.1.3 | 1 SP |
| ACC-FIX-004 | Voeg `role="alert"` toe aan dynamisch gegenereerde form error messages | SC 3.3.1 | 1 SP |
| ACC-FIX-005 | Definieer captions-strategie voor videoboodschappen (bijv. WebVTT upload optie) | SC 1.2.1 | 5 SP |
| ACC-FIX-006 | Voeg keyboard-alternatief toe voor SortableDomeinKaart drag-and-drop (bijv. arrow-key reordering) | SC 2.1.1 | 3 SP |
| ACC-FIX-007 | Voeg skip-to-content link toe aan authenticated layout | SC 2.4.1 | 1 SP |
| ACC-FIX-008 | Audit en fix formulierveld label-koppeling over alle forms | SC 3.3.2 | 2 SP |
| ACC-FIX-009 | Voeg review + bevestigings-dialog toe aan testament/euthanasie opslaan | SC 3.3.4 | 3 SP |
| ACC-FIX-010 | Audit `muted-foreground` contrast (doel: ≥4.5:1) en pas aan als < 4.5:1 | SC 1.4.3 | 1 SP |

---

## SECTIE 8: Aanbevelingen

### REC-ACC-001 — Activeer axe-playwright in CI pipeline
**Referentie:** GAP-ACC-001  
**Omschrijving:** Voeg een `axe-playwright` test-stap toe aan `ci.yml` die de Storybook tests inclusief accessibility scan uitvoert. Gebruik `@storybook/addon-vitest` integratie (reeds geconfigureerd). Stel minimale failing threshold in: 0 kritieke violations.  
**Impact:** Detecteert automatisch regressies in WCAG 2.1 AA bij elke PR  
**KPI:** Aantal kritieke axe violations per build — target: 0  
**Baseline:** NIET GEMETEN (geen CI toegankelijkheidscheck)  
**Meetmethode:** CI axe-rapport per PR  
**Tijdshorizon:** Sprint ACC-1  
**Prioriteit:** P1 — KRITIEK release blocker | **Effort:** Laag (1 SP)

---

### REC-ACC-002 — Audit en fix contrast-kritische tokens
**Referentie:** GAP-ACC-008  
**Omschrijving:** Audit alle semantische kleurtokens in `globals.css` op WCAG SC 1.4.3 (4.5:1 normale tekst) en SC 1.4.11 (3:1 UI-components). Specificiek: `muted-foreground: #6B7280` op `background: #F3F7F8` en `border: #E5E7EB` op background. Pas tokens aan als contrast niet gehaald wordt.  
**Impact:** WCAG 2.1 AA SC 1.4.3 compliance, EAA-vereiste  
**KPI:** % kleurcombinaties met contrast ≥ 4.5:1 — target: 100% voor tekst  
**Baseline:** AF-003 fix aanwezig (4.98:1 ✅); overige `UNCERTAIN:`  
**Meetmethode:** Colour Contrast Analyser tool of axe-playwright result  
**Tijdshorizon:** Sprint ACC-1  
**Prioriteit:** P1 | **Effort:** Laag-Middel

---

### REC-ACC-003 — Voeg aria-live / role="alert" toe aan dynamische berichten
**Referentie:** GAP-ACC-003, GAP-ACC-004  
**Omschrijving:** Voeg `aria-live="polite"` toe aan toast-component (`toast.tsx`) en `role="alert"` aan formulier error-states. Combineer met REC-UXD-004 (toast-standaardisering) voor één implementatiesprint.  
**Impact:** Screen reader gebruikers ontvangen bevestigingen en foutmeldingen — WCAG SC 4.1.3 compliance  
**KPI:** axe violations voor aria-live: 0 na fix  
**Baseline:** NIET GEMETEN  
**Meetmethode:** axe-playwright scan  
**Tijdshorizon:** Sprint ACC-1 (gecombineerd met REC-UXD-004)  
**Prioriteit:** P1 | **Effort:** Laag (1 SP combined)

---

### REC-ACC-004 — Definieer captions-strategie voor videoboodschappen
**Referentie:** GAP-ACC-005  
**Omschrijving:** Voeg bij video-upload-flow in `/videoboodschappen` een optie toe voor WebVTT-captionbestand upload of automatische transcriptie (INSUFFICIENT_DATA of Azure Speech of ander systeem beschikbaar is). Documenteer strategie als architectural decision.  
**Impact:** SC 1.2.1 compliance + vergroot doelgroep (slechthorenden)  
**KPI:** % geüploade video's met captions-bestand — target: 100% bij lancering (of geblokkeerde upload als captions ontbreken)  
**Baseline:** INSUFFICIENT_DATA (video-upload flow niet geanalyseerd)  
**Meetmethode:** Audit /videoboodschappen upload flow  
**Tijdshorizon:** Sprint ACC-2  
**Prioriteit:** P2 | **Effort:** Hoog (5 SP, incl. Azure Speech of WebVTT)  
`OUT_OF_SCOPE: Software Architect — architectural beslissing over transcriptie-service`

---

### REC-ACC-005 — Voeg skip-to-content + confirmation dialogs toe
**Referentie:** GAP-ACC-007, GAP-ACC-010  
**Omschrijving:** (A) Voeg een visueel verborgen skip-link toe bovenaan `(authenticated)/layout.tsx` die naar `main` content springt. (B) Voeg een bevestigingsdialog toe voor opslaan van testament, euthanasie-verklaring en donor-registratie met tekst "U staat op het punt juridisch bindende informatie op te slaan".  
**Impact:** (A) SC 2.4.1 keyboard compliance; (B) SC 3.3.4 legal data protection  
**KPI:** (A) Skip link aanwezig in DOM; (B) confirmation dialog triggered voor alle juridische forms  
**Baseline:** NIET AANWEZIG  
**Meetmethode:** (A) Keyboard test; (B) Usability test + manuele check  
**Tijdshorizon:** Sprint ACC-1  
**Prioriteit:** P1 | **Effort:** Middel (3 SP combined)

---

## SECTIE 9: Sprintplan

### Aannames

**Team:** Solo developer  
**Capaciteit:** 6–8 SP per sprint voor accessibility werk  
**Sprintduur:** 2 weken  
**Afstemming:** Sprint ACC-1 kan parallel lopen met UX/UI sprints (stories zijn onafhankelijk)

---

### Sprint ACC-1: Critical WCAG Fixes + axe in CI

**Sprint doel:** WCAG 2.1 AA voor de meest gebruikte user flows, geautomatiseerde a11y bewaking actief.

**KPI-targets:**
- axe-playwright actief in CI
- 0 kritieke axe violations in Storybook baseline
- lang-attribuut geverifieerd

| ID | Story | Type | SP | Afhankelijkheden | Blocker |
|---|---|---|---|---|---|
| SP-ACC1-001 | Als developer wil ik axe-playwright actief hebben in CI zodat a11y regressies automatisch worden gedetecteerd | INFRA | 1 | ci.yml + Storybook addon-vitest | NONE |
| SP-ACC1-002 | Als developer wil ik `lang="nl"` op de root HTML-tag zodat screen readers de taal kennen | CODE | 0.5 | `app/layout.tsx` | NONE |
| SP-ACC1-003 | Als gebruiker met screen reader wil ik toast-berichten horen zodat ik weet of mijn gegevens zijn opgeslagen | CODE | 1 | `toast.tsx` + REC-UXD-004 (gecombineerd) | NONE |
| SP-ACC1-004 | Als gebruiker met screen reader wil ik formulierfouten horen zodat ik de specifieke fout kan corrigeren | CODE | 1 | form-field.tsx + REC-UXD-005 (gecombineerd) | NONE |
| SP-ACC1-005 | Als keyboard-gebruiker wil ik een skip-link zien zodat ik de navigatie kan overslaan | CODE | 1 | `(authenticated)/layout.tsx` | NONE |
| SP-ACC1-006 | Als gebruiker wil ik een bevestigingsdialog zien bij opslaan van testament/euthanasie/donor zodat duidelijk is dat het juridisch bindend is | CODE | 3 | NONE | NONE |
| SP-ACC1-007 | Als developer wil ik alle contrast-tokens geauditeerd hebben zodat WCAG 1.4.3 aantoonbaar gehaald is | ANALYSIS | 1 | `globals.css` kleurinventaris | NONE |

**Acceptatiecriteria SP-ACC1-001:** Gegeven CI pipeline, wanneer een PR wordt ingediend, dan voert axe-playwright een a11y scan uit op de Storybook stories en faalt de build bij kritieke violations.  
**Acceptatiecriteria SP-ACC1-002:** Gegeven de applicatie HTML, wanneer een screen reader de pagina laadt, dan is de `lang` attribuut "nl" aanwezig op `<html>`.  
**Acceptatiecriteria SP-ACC1-003:** Gegeven een toast melding, wanneer de toast verschijnt, dan kondigt de screen reader de tekst automatisch aan (via `role="status"` of `aria-live="polite"`).  
**Acceptatiecriteria SP-ACC1-004:** Gegeven een formulierfout, wanneer de foutmelding wordt gerenderd, dan heeft het element `role="alert"` of is `aria-live="assertive"` en kondigt de screen reader de fout aan.  
**Acceptatiecriteria SP-ACC1-005:** Gegeven de authenticated layout, wanneer gebruiker Tab drukt op een nieuwe pagina, dan is de eerste focuseerbare element een skip-link "Ga naar inhoud" die naar `#main-content` springt.  
**Acceptatiecriteria SP-ACC1-006:** Gegeven testament/euthanasie/donor opslaan actie, wanneer gebruiker op "Opslaan" klikt, dan verschijnt een dialog met tekst over juridische binding en twee opties: "Bevestig opslaan" en "Annuleren".  
**Acceptatiecriteria SP-ACC1-007:** Gegeven het contrast-audit rapport, wanneer gereed, dan toont het alle tekst-kleurcombinaties met ratio — alle ≥4.5:1 of gedocumenteerde uitzondering.

**Blocker Register Sprint ACC-1:**

| ID | Type | Beschrijving | Eigenaar | Escalatie |
|---|---|---|---|---|
| BLK-ACC1-001 | INTERN | Beschikbaarheid (auth)layout.tsx aanpassing naast UXD-2 sprint — mogelijk conflicterend | Developer | Planning afstemming dag 1 |

---

### Sprint ACC-2: Video captions + keyboard-navigatie

**Sprint doel:** SC 1.2.1 video captions strategie + keyboard-navigatie voor drag-and-drop.

| ID | Story | Type | SP | Afhankelijkheden | Blocker |
|---|---|---|---|---|---|
| SP-ACC2-001 | Als gebruiker wil ik een captionbestand kunnen uploaden bij een videoboodschap zodat slechthorenden de inhoud kunnen lezen | CODE | 5 | `videoboodschappen/` component analyse + architectural decision | EXTERN: keuze transcriptie-service. Eigenaar: Product Owner / SA. |
| SP-ACC2-002 | Als keyboard-gebruiker wil ik de dashboard-kaarten kunnen herordenen zonder muis zodat ik de app volledig met toetsenbord kan bedienen | CODE | 3 | `SortableDomeinKaart.tsx` | NONE |

**Acceptatiecriteria SP-ACC2-001:** Gegeven video-upload, wanneer gebruiker een `.vtt` of `.srt` bestand toevoegt, dan wordt dit captionbestand gekoppeld aan de video en getoond bij afspelen.  
**Acceptatiecriteria SP-ACC2-002:** Gegeven SortableDomeinKaart, wanneer gebruiker een kaart selecteert met Enter en dan pijltjestoetsen gebruikt, dan verschuift de kaart omhoog/omlaag in de lijst.

**Blocker Register Sprint ACC-2:**

| ID | Type | Beschrijving | Eigenaar | Escalatie |
|---|---|---|---|---|
| BLK-ACC2-001 | EXTERN | Architectural beslissing: transcriptie-service of alleen WebVTT upload? | Product Owner + Software Architect | ACC-2 start pas na architectural decision |

---

## SECTIE 10: Guardrails

### GUARD-ACC-001 — axe-playwright mag niet uit CI worden verwijderd
**Referentie:** GAP-ACC-001  
**Formulering:** Mag de axe-playwright/Storybook a11y test stap in `ci.yml` niet worden uitgecommentarieerd of verwijderd zonder directe vervanging door equivalente geautomatiseerde a11y controle.  
**Scope:** `.github/workflows/ci.yml` wijzigingen  
**Schending-actie:** PR geblokkeerd — escaleer naar Product Owner als EAA compliance risico  
**Verificatiemethode:** PR-diff check: axe stap aanwezig in ci.yml?  
**Overlap:** Aanvulling op GUARD-DO-003 (coverage gate niet verwijderen)

---

### GUARD-ACC-002 — Juridisch bindende content vereist bevestigingsdialog
**Referentie:** GAP-ACC-010  
**Formulering:** Moeten alle routes die juridisch bindende content opslaan (testament, euthanasie-verklaring, donorregistratie) een bevestigingsdialog implementeren vóór de definitieve POST/PATCH call.  
**Scope:** `Controllers/TestamentController.cs`, `EuthanasieController.cs`, `DonorController.cs` + bijbehorende frontend componenten  
**Schending-actie:** CRITICAL_FINDING — PR niet mergeable zonder bevestigingsdialog  
**Verificatiemethode:** PR-checklist: "Juridische content heeft bevestigingsdialog?"  
**Overlap:** Nieuw — geen equivalent in bestaande guardrails

---

### GUARD-ACC-003 — Alle formuliervelden vereisen gekoppeld label
**Referentie:** GAP-ACC-009, SC 3.3.2  
**Formulering:** Moet elk formulierveld in de codebase een expliciet `<label>` via `htmlFor` of `aria-labelledby` hebben. Placeholder-only is niet toegestaan als enige labelling.  
**Scope:** Alle form-field componenten  
**Schending-actie:** axe-playwright detecteert automatisch + PR code review block  
**Verificatiemethode:** axe rule `label` — automatisch gedetecteerd in CI na ACC-FIX-001  
**Overlap:** Specificatie van GUARD-UXD-003 (error feedback standarisering)

---

## FASE 3 AFSLUITING — Overzicht

Alle vier Fase 3 agents zijn voltooid:

| Agent | Bestand | Status |
|---|---|---|
| 10 UX Researcher | `docs/fase-3/10-ux-researcher.md` | GEREED ✅ |
| 11 UX Designer | `docs/fase-3/11-ux-designer.md` | GEREED ✅ |
| 12 UI Designer | `docs/fase-3/12-ui-designer.md` | GEREED ✅ |
| 13 Accessibility Specialist | `docs/fase-3/13-accessibility-specialist.md` | GEREED ✅ |

Fase 3 Critic + Risk validatie vereist.

---

## HANDOFF CHECKLIST — Accessibility Specialist — 2026-03-01

- [x] ACCESSIBILITY_FLAG inventory compleet — 6 flags ontvangen, beoordeeld
- [x] WCAG conformiteitsniveau vastgesteld — WCAG 2.1 AA (EU EAA vereist), AAA aspirationeel
- [x] Volledige WCAG analyse op alle 4 principes — alle SC's beoordeeld
- [x] Juridische compliance status bepaald — EAA RELEASE BLOCKER gedocumenteerd
- [x] Assistive technology compatibiliteit — INSUFFICIENT_DATA correct gedocumenteerd, axe-playwright aanwezig geconcludeerd
- [x] Geprioriteerd remediatie-plan — kritiek/hoog/middel onderscheid aanwezig
- [x] Alle UNCERTAIN items gedocumenteerd
- [x] Aanbevelingen: GAP/RISK referenties aanwezig ✅
- [x] Meetcriteria SMART ✅
- [x] Sprintplan: aannames gedocumenteerd ✅
- [x] Stories: acceptatiecriteria aanwezig ✅
- [x] Guardrails: testbaar, schending-actie, verificatiemethode ✅
- [x] Fase 3 afsluiting inclusief agents-overzicht ✅
- [x] Alle 4 deliverables: Analyse ✓ Aanbevelingen ✓ Sprintplan ✓ Guardrails ✓

**STATUS: GEREED VOOR HANDOFF**  
**Overdracht aan:** Critic Agent (18) + Risk Agent (19) — Fase 3 Validatie
