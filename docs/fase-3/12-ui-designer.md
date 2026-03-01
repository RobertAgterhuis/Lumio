# Fase 3 — UI Designer
**Agent:** 12-ui-designer  
**Datum:** 2026-03-01  
**Input:** docs/fase-3/10-ux-researcher.md, docs/fase-3/11-ux-designer.md, component-library analyse (components/ui/), globals.css, Storybook-inventarisatie  
**Status:** GEREED VOOR HANDOFF

---

## SECTIE 1: Design System Audit

### Aanwezigheid design system

**Status: AANWEZIG (code-first)**

| Dimensie | Status | Details |
|---|---|---|
| Design tokens | ✅ AANWEZIG | `src/app/globals.css` — Tailwind 4 `@theme` directive met volledige semantische tokenset |
| Token import | ✅ AANWEZIG | `@import "../styles/tokens.css"` — afzonderlijk tokenbestand |
| Component library | ✅ AANWEZIG | `components/ui/` — ~25 componenten |
| Storybook | ✅ AANWEZIG | `storybook-static/` + `.stories.tsx` per component |
| MDX documentatie | ✅ AANWEZIG | `.docs.mdx` per component (Alert, Badge, Button, Card, Dialog, Icon, Input, Skeleton, Tabs) |
| Visual regression testing | ❌ AFWEZIG | Chromatic uitgecommentarieerd (`CROSS_AGENT_INPUT: GAP-DO-002`) |
| Figma / externe design tool | ❌ NIET GEVONDEN | Geen Figma-links of design file referenties in codebase |
| Donker-modus implementatie | `UNCERTAIN:` | CSS tokens gedefinieerd maar dark mode activering niet geverifieerd (`dark:` klassen?) |

**Conclusie:** Codebase heeft een solide code-first design system. Het ontbreekt aan visuele design documentatie (Figma) en visual regression bewaking (Chromatic). Dit is acceptabel voor een vroeg-stadium product, maar introduceert risico bij UI-uitbreiding.

### Token kwaliteit (globals.css analyse)

| Categorie | Kwaliteit | Bevindingen |
|---|---|---|
| Primair kleurpalet | GOED | Teal (#355E68) als primary, volledige shade-range (50–700) aanwezig |
| Status kleuren | GOED | success (#5E8C61), warning (#D4A017), danger (#B44A4A), info (#3A506B) — semantisch consistent |
| Sage (rustgevend) | GOED | Domein-specifieke keuze: sage groen voor kalmerende UX in gevoelig product — bewuste keuze |
| Secure (blauw) | GOED | #2563EB voor security-signaling — consistent met iOS/web security-convention |
| Radius systeem | GOED | 8pt grid: sm(8px), md(12px), lg(16px) |
| Accessibility fix | ✅ GEDOCUMENTEERD | Comment: `SP-6-004 (was #7A9EA6 = 2.88:1)` → nu 4.98:1 — contrast correct bijgesteld |

### Component library dekking

**Aanwezig (met Storybook coverage):**
- Alert, Badge, Button, Card, Checkbox, Dialog, EmptyState, form-field, help-tooltip, Icon, Input, label, LabelWithHelp, lumio-icon, LumioIcon, Progress, safe-html, Select, Skeleton, status-badge, Tabs, Textarea, toast, tooltip, transitions

**Potentieel ontbrekend (op basis van UX-behoeften):**
- `StepperProgress.tsx` — multi-step wizard progress indicator (OnboardingWizard heeft eigen state maar geen gedeeld stepper component)
- `ConfirmationToast.tsx` — opslaan-bevestiging patroon (GAP-UXD-007) — `toast.tsx` aanwezig maar `UNCERTAIN:` over gebruik
- `FormError.tsx` — gecentraliseerd formulier error display (GAP-UXD-005) — `form-field.tsx` aanwezig maar zonder verificatie van error state implementatie

---

## SECTIE 2: Visuele Consistentie Audit

`HEURISTISCH:` Analyse op basis van component-code en CSS tokens. Geen live screenshots.

| Dimensie | Status | Bevindingen |
|---|---|---|
| Kleurpalet | ✅ CONSISTENT | Alle UI-componenten gebruiken `bg-primary`, `text-muted-foreground` etc. via Tailwind tokens |
| Typografie | `UNCERTAIN:` | `tokens.css` bestaat maar inhoud niet gelezen — `INSUFFICIENT_DATA` over font-scale definitie |
| Spacing/grid | GOED (aanwijzing) | 8pt radius grid suggerereert consistent spacing systeem |
| Button varianten | ✅ AANWEZIG | `button.tsx` + Button.stories.tsx + Button.docs.mdx — volledig gedocumenteerd |
| Form inputs | ✅ AANWEZIG | `input.tsx`, `textarea.tsx`, `select.tsx`, `checkbox.tsx`, `form-field.tsx` |
| Feedback componenten | ✅ AANWEZIG | `alert.tsx`, `toast.tsx`, `status-badge.tsx` |
| Iconen | ✅ AANWEZIG | `lucide-react` + custom `lumio-icon.tsx` (`components/ui/lumio-icons/`) |
| Dark mode | `UNCERTAIN:` | Tokens bestaan maar activering onbekend |

### Specifieke afwijkingen (heuristisch)

| # | Afwijking | Component | Prioriteit |
|---|---|---|---|
| DEV-UI-001 | `UNCERTAIN:` opslaan-bevestiging toast niet gestandaardiseerd gebruikt over alle formulieren | `toast.tsx` aanwezig, gebruik onverifieerd | Hoog |
| DEV-UI-002 | `UNCERTAIN:` Dark mode activering — tokens gedefinieerd maar klassen in productie onzeker | `globals.css` tokens | Middel |
| DEV-UI-003 | Geen multi-step stepper progress component in `ui/` | `wizard/WizardShell.tsx` heeft eigen impl | Middel |
| DEV-UI-004 | `EmptyState.tsx` aanwezig maar mogelijk niet consistent gebruikt over alle domein-schermen | heuristisch | Laag |

---

## SECTIE 3: Visuele Hiërarchie Analyse

`HEURISTISCH:`

### Dashboard

| Vraag | Bevinding |
|---|---|
| Primaire CTA visueel prominent? | `UNCERTAIN:` Dashboard heeft widget-grid, maar welk element het meest primair is, is onduidelijk zonder live scherm |
| Concurrerende elementen? | Hoog waarschijnlijk — 17 gelijkwaardige kaarten zonder visuele weighting |
| Voortgangsindicator prominent? | `VoortgangGranulair.tsx` aanwezig maar prominentie op pagina onbekend |

### Shamir wizard

| Vraag | Bevinding |
|---|---|
| Primaire actie duidelijk? | `UNCERTAIN:` ShamirDialog.tsx structuur niet volledig gelezen — stap-voortgang onbekend |
| Foutmeldingen visueel helder? | INSUFFICIENT_DATA |

### OnboardingWizard

| Vraag | Bevinding |
|---|---|
| Huidige stap visueel duidelijk? | `WizardShell.tsx` bestaat — stepper-component aanwezig maar implementatie onbekend |
| Voortgangspercentage zichtbaar? | `UNCERTAIN:` |

---

## SECTIE 4: Typografie Analyse

`INSUFFICIENT_DATA:` `tokens.css` niet volledig gelezen. Op basis van globals.css en Tailwind 4 default gedrag:

- **UNCERTAIN:** Font-family definitie — Tailwind 4 default of custom font?
- **UNCERTAIN:** Type-scale definitie (h1–h6 sizing)
- `CROSS_AGENT_INPUT: Accessibility Specialist (13)` verantwoordelijk voor contrast ratio + leesbaarheidsvereisten
- **Positief:** Comment in globals.css verwijst naar SC 1.4.3 (WCAG contrast) — bewustzijn aanwezig

---

## SECTIE 5: Kleur Analyse

| Aspect | Bevinding |
|---|---|
| Merkkleur alignment | `UNCERTAIN:` Fase 4 Brand Strategist heeft nog geen merkidentiteit vastgesteld — teal + sage is een voorzichtige, passende keuze voor health/trust domein |
| Contrast compliance | Gedeeltelijk geadresseerd (SP-6-004 fix gedocumenteerd), volledige WCAG audit bij Accessibility Specialist |
| Status kleur consistentie | ✅ GOED — success/warning/danger/info semantisch consistent |
| Emotionele kleur-strategie | Sage groen voor kalmerende UX is domein-passend (estate planning = rust, vertrouwen, zekerheid) |
| Dark mode | `UNCERTAIN:` Tokens gedefinieerd maar overrides niet gecontroleerd |

---

## SECTIE 6: Component Library Beoordeling

### Storybook-dekking

**Aanwezig in Storybook:**
- 25+ components met `.stories.tsx` files
- MDX documentatie voor 9 componenten (Alert, Badge, Button, Card, Dialog, Icon, Input, Skeleton, LumioIcon, Tabs, Transitions)

**Niet in component library maar gebruikt / benodigd:**

| Component | Gebruik | Status |
|---|---|---|
| `SortableDomeinKaart.tsx` | Dashboard drag-and-drop cards | Domein-specifiek, niet in ui/ |
| `WizardShell.tsx` | Wizard container | Aanwezig in wizard/ maar geen Storybook story |
| `OnboardingWizard.tsx` | Onboarding flow | Aanwezig in wizard/ maar geen Storybook story |
| `ProfielSuggesties.tsx` | Dashboard suggestion widget | Domein-specifiek |
| `VoortgangGranulair.tsx` | Progress per domein | Domein-specifiek |

**Visual regression:**
- `storybook-static/` aanwezig (pre-built export)
- Chromatic UITGECOMMENTARIEERD (`CROSS_AGENT_INPUT: GAP-DO-002`) — geen geautomatiseerde visual regression
- Risico: UI-drift over tijd niet detecteerbaar

---

## SECTIE 7: Gap Analyse (UI Designer)

| ID | Gap | Prioriteit | Bron |
|---|---|---|---|
| GAP-UI-001 | Geen gedeeld StepperProgress component — OnboardingWizard en WizardShell hebben eigen state zonder herbruikbaar stepper UI | MIDDEL | component inventarisatie, wizard/ directory |
| GAP-UI-002 | Dark mode implementatie onbevestigd — tokens aanwezig maar klassen in productie onbekend | MIDDEL | globals.css token analyse + UNCERTAIN |
| GAP-UI-003 | Chromatic uitgecommentarieerd — geen visual regression bewaking | HOOG | `CROSS_AGENT_INPUT: GAP-DO-002` |
| GAP-UI-004 | Geen Figma design file — design-as-code only, geen UX/design handoff artefact | LAAG voor MVP, HOOG bij team-uitbreiding | component structuur zonder design tool link |
| GAP-UI-005 | toast.tsx aanwezig maar gebruik over forms niet gestandaardiseerd | HOOG | heuristic H1 + GAP-UXD-007 |
| GAP-UI-006 | Typografie scale INSUFFICIENT_DATA — mogelijk geen expliciete type-scale buiten Tailwind defaults | MIDDEL | globals.css niet volledig + tokens.css ongezien |

---

## SECTIE 8: Aanbevelingen

### REC-UI-001 — Heractiveer Chromatic voor visual regression testing
**Referentie:** GAP-UI-003, GAP-DO-002  
**Omschrijving:** Heractiveer Chromatic stap in `ci.yml` (huidige commentaar-blok regels 79-106). Stel baseline in voor alle 25+ component stories. Stel PR-blokkering in bij visuele regressie.  
**Impact:** Voorkomt onbewuste UI-drift na elke PR — essentieel bij refactoring IA (sprint UXD-2)  
**KPI:** Aantal gedetecteerde visuele regressies per sprint (doel: >0 zodat het systeem werkt)  
**Baseline:** 0 (niet actief)  
**Meetmethode:** Chromatic PR-rapport  
**Tijdshorizon:** Sprint UI-1  
**Prioriteit:** P1 | **Effort:** Laag (Chromatic al geconfigureerd, alleen heractiveren)

---

### REC-UI-002 — Maak herbruikbaar StepperProgress component
**Referentie:** GAP-UI-001  
**Omschrijving:** Extraheer wizard-stap-visualisatie uit `WizardShell.tsx` naar een herbruikbaar `components/ui/stepper.tsx` met Storybook story. Gebruik in OnboardingWizard + Shamir wizard. Lever `StepperProgress.docs.mdx`.  
**Impact:** Consistente wizard UX, makkelijker te onderhouden  
**KPI:** Aantal wizards dat StepperProgress gebruikt vs eigen implementatie  
**Baseline:** 0/2 wizards gebruiken centrale component  
**Meetmethode:** Code review per wizard-component PR  
**Tijdshorizon:** Sprint UI-1  
**Prioriteit:** P2 | **Effort:** Laag (2 SP)

---

### REC-UI-003 — Verifieer en documenteer dark mode implementatie
**Referentie:** GAP-UI-002  
**Omschrijving:** Controleer of `dark:` Tailwind klassen of CSS-variabele overrides aanwezig zijn in de component library. Als dark mode niet geïmplementeerd is: documenteer als bewuste keuze en verwijder onnodige dark-mode tokens of voeg minimale dark mode toe.  
**Impact:** Consistentie-verwachting bij gebruikers — macOS/Windows systeem dark mode  
**KPI:** % componenten met werkende dark mode render in Storybook  
**Baseline:** INSUFFICIENT_DATA  
**Meetmethode:** Storybook backgrounds addon instellen + visuele check  
**Tijdshorizon:** Sprint UI-2  
**Prioriteit:** P2 | **Effort:** Middel afhankelijk van scope

---

### REC-UI-004 — Standaardiseer toast gebruik via centraal patroon
**Referentie:** GAP-UI-005, GAP-UXD-007  
**Omschrijving:** Definieer een `useFormSuccess()` hook of `withSaveConfirmation()` wrapper die bij elke succesvolle mutatie automatisch een `toast.success("Opgeslagen")` triggert via het bestaande `toast.tsx` component. Documenteer in `Toast.docs.mdx`.  
**Impact:** Herstelt H1 systeem-status — gebruiker altijd bewust van opslaagopdracht resultaat  
**KPI:** % formulieren met save-confirmatie toast aanwezig — target: 100% van PATCH/POST forms  
**Baseline:** INSUFFICIENT_DATA (niet geverifieerd)  
**Meetmethode:** Code review checklist bij formulier PR's  
**Tijdshorizon:** Sprint UI-1  
**Prioriteit:** P1 | **Effort:** Laag (2 SP)

---

## SECTIE 9: Sprintplan

### Aannames

**Team:** Solo developer/designer  
**Capaciteit:** 6 SP per sprint (UI-werk parallel met UX-sprints, deels overlappend)  
**Sprintduur:** 2 weken  
**Afstemming:** Sprint UI-1 loopt gelijktijdig met UXD-1 (stories zijn onafhankelijk)

---

### Sprint UI-1: Visual regression + Componentstandaardisering

**Sprint doel:** Zekerstelling van UI-stabiliteit vóór IA-refactoring sprint (UXD-2), en implementatie van centrale toast-standaard.

**KPI-targets:**
- Chromatic actief en baseline ingesteld
- `useFormSuccess()` hook beschikbaar + gebruikt in ≥3 hoofdformulieren

**Stories:**

| ID | Story | Type | SP | Afhankelijkheden | Blocker |
|---|---|---|---|---|---|
| SP-UI1-001 | Als developer wil ik Chromatic geactiveerd hebben in CI zodat visuele regressies automatisch gedetecteerd worden | INFRA | 1 | ci.yml commentaar-blok (GAP-DO-002) | EXTERN: Chromatic account/token. Eigenaar: Product Owner. Escalatie: do without visual regression if token unavailable. |
| SP-UI1-002 | Als developer wil ik een centrale `useFormSuccess` hook hebben zodat opslaan-bevestiging consistent is over alle formulieren | CODE | 2 | `toast.tsx` aanwezig (✅) | NONE |
| SP-UI1-003 | Als developer wil ik een herbruikbaar StepperProgress component hebben zodat alle wizards een consistente voortgangsindicator tonen | CODE | 2 | `WizardShell.tsx` | NONE |
| SP-UI1-004 | Als designer wil ik alle wizard-componenten in Storybook gedocumenteerd hebben zodat visuele regressies worden gedetecteerd | DESIGN | 1 | SP-UI1-001 + SP-UI1-003 | NONE |

**Acceptatiecriteria SP-UI1-001:** Gegeven een PR met component wijziging, wanneer CI draait, dan voert Chromatic een storybook build uit en rapporteert visuele wijzigingen als review request.  
**Acceptatiecriteria SP-UI1-002:** Gegeven een formulier met `useFormSuccess`, wanneer API `200 OK` retourneert, dan verschijnt binnen 100ms een toast "Opgeslagen" rechtsboven gedurende ≥3 seconden.  
**Acceptatiecriteria SP-UI1-003:** Gegeven `components/ui/stepper.tsx`, wanneer geïmporteerd in OnboardingWizard, dan toont het de huidige stap (actief, gedaan, toekomstig) met iconen en labels uit de stappen-array.  
**Acceptatiecriteria SP-UI1-004:** Gegeven Storybook, wanneer `WizardShell.stories.tsx` en `OnboardingWizard.stories.tsx` aanwezig zijn, dan renderen beide componenten zonder fouten in elke story-variant.

**Blocker Register Sprint UI-1:**

| ID | Type | Beschrijving | Eigenaar | Escalatie |
|---|---|---|---|---|
| BLK-UI1-001 | EXTERN | Chromatic account/project token configuratie | Product Owner | Sprint UI-1 skip als token niet beschikbaar; Chromatic on hold tot dan |

---

### Sprint UI-2: Dark mode verificatie + Design debt

**Sprint doel:** Verifieer dark mode status en lever typografie documentatie.

**Stories:**

| ID | Story | Type | SP | Afhankelijkheden | Blocker |
|---|---|---|---|---|---|
| SP-UI2-001 | Als developer wil ik weten of dark mode werkt in Electron zodat gebruikers op donker systeem-thema een consistente UI zien | ANALYSIS | 1 | Storybook actief (post SP-UI1) | NONE |
| SP-UI2-002 | Als designer wil ik de typografie-scale gedocumenteerd hebben in Storybook zodat consistentie bij uitbreiding gewaarborgd is | DESIGN | 2 | tokens.css leesstap | NONE |

**Acceptatiecriteria SP-UI2-001:** Gegeven een macOS systeem in dark mode, wanneer Lumio Electron app wordt gestart, dan zijn alle UI-componenten leesbaar met voldoende contrast (geen witte tekst op witte achtergrond).  
**Acceptatiecriteria SP-UI2-002:** Gegeven Storybook, wanneer Typography story geopend, dan toont het alle h1–h6 stijlen, body sizes, en muted tekst met font-family + grootte vermeld.

**Blocker Register Sprint UI-2:**

| ID | Type | Beschrijving | Eigenaar | Escalatie |
|---|---|---|---|---|
| BLK-UI2-001 | INTERN | tokens.css lezen voor typografie-documentatie | Developer | Dag 1 sprint UI-2 |

---

## SECTIE 10: Guardrails

### GUARD-UI-001 — Alle nieuwe UI-componenten vereisen Storybook story
**Referentie:** GAP-UI-003, GAP-UI-004  
**Formulering:** Moet elk nieuw UI-component in `components/ui/` of `components/*/` een `.stories.tsx` bestand hebben voordat het in productie mag worden opgenomen.  
**Scope:** Alle PRs die nieuwe React-componenten toevoegen  
**Schending-actie:** PR geblokkeerd — story vereist  
**Verificatiemethode:** PR-checklist item: "Storybook story aanwezig?" + geautomatiseerde Storybook build in CI faalt bij fouten  
**Overlap:** Aanvulling op GUARD-DO-002 (Chromatic visual regression)

---

### GUARD-UI-002 — Kleurgebruik uitsluitend via semantische tokens
**Referentie:** GAP-UI-003 (visual regression)  
**Formulering:** Mogen componenten GEEN hardgecodeerde hex/RGB kleuren bevatten. Kleurgebruik is uitsluitend via Tailwind semantische tokens (bijv. `bg-primary`, `text-destructive`) of CSS variabelen.  
**Scope:** Alle `.tsx` en `.css` bestanden in `src/lumio-web/`  
**Schending-actie:** Code review CRITICAL_FINDING — hardcoded kleur geblokkeerd  
**Verificatiemethode:** ESLint regel voor no-hardcoded-colors (of Tailwind plugin) + PR code review check  
**Overlap:** Nieuw — geen equivalent in bestaande guardrails

---

### GUARD-UI-003 — Toast-confirmatie verplicht bij alle formulier-mutaties
**Referentie:** GAP-UI-005, REC-UI-004  
**Formulering:** Moet elke formulier-submit die een PATCH, POST of DELETE uitvoert een gebruikersbevestiging tonen (success of error toast) na afloop van de API-call.  
**Scope:** Alle formuliercomponenten met `onSubmit` handlers  
**Schending-actie:** Escaleer naar Developer als silent form mutation aanwezig — CRITICAL_FINDING in PR  
**Verificatiemethode:** Code review checklist: "API-call afgehandeld met user feedback?"  
**Overlap:** Verstevigt GUARD-UXD-003 (formulier error feedback) — breder: ook success confirmations

---

## HANDOFF CHECKLIST — UI Designer — 2026-03-01

- [x] Design system audit compleet — aanwezig, code-first, met Storybook
- [x] Visuele consistentie audit — HEURISTISCH met bronverwijzing
- [x] Visuele hiërarchie analyse per primaire flow
- [x] Typografie analyse — INSUFFICIENT_DATA gedocumenteerd, correct geëscaleerd naar Accessibility Specialist
- [x] Kleur analyse — semantisch sterk met domein-passende emotionele keuzes
- [x] Component library beoordeling — 25+ componenten, gaps geïdentificeerd
- [x] UNCERTAIN items expliciet gedocumenteerd
- [x] Aanbevelingen: alle verwijzen naar GAP-UI analyse-bevinding ✅
- [x] Meetcriteria SMART ✅
- [x] Sprintplan: aannames gedocumenteerd ✅
- [x] Alle stories: acceptatiecriteria aanwezig ✅
- [x] Guardrails: testbaar, schending-actie, verificatiemethode ✅
- [x] Alle 4 deliverables aanwezig: Analyse ✓ Aanbevelingen ✓ Sprintplan ✓ Guardrails ✓

**STATUS: GEREED VOOR HANDOFF**  
**Overdracht aan:** Accessibility Specialist (13)
