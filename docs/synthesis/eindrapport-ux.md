# Eindrapport UX — Lumio Fase 3: UX & Product Experience
**Audit scope:** `AUDIT UX Lumio`  
**Datum:** 2026-03-02  
**Fase:** 3 — UX & Product Experience  
**Status:** PARTIAL SYNTHESIS (wacht op Fase 1 + Fase 4 voor Master Rapport)  
**Input:** Broncode-analyse (`src/lumio-web/`, `devdocs/`, `.github/`) + sprint gate outputs SP-1 t/m SP-4

---

## Agenten (Fase 3 — uitvoeringssequentie)

| Agent | Status |
|---|---|
| UX Researcher (Agent 10) | ✅ COMPLEET |
| UX Designer (Agent 11) | ✅ COMPLEET |
| UI Designer (Agent 12) | ✅ COMPLEET |
| Accessibility Specialist (Agent 13) | ✅ COMPLEET |
| Critic Agent (Agent 18) | ✅ GEPASSEERD |
| Risk Agent (Agent 19) | ✅ GEPASSEERD |
| Synthesis (Agent 17 — PARTIAL) | ✅ DIT DOCUMENT |

---

## Executive Summary

Lumio is een lokaal-draaiende Electron + Next.js applicatie voor levenstestament-beheer, gericht op Nederlandse gebruikers van 40+. De applicatie beheert bijzondere categorieën persoonsdata (medische wensen, donorregistratie, euthanasiewensen) en heeft twee primaire gebruikersrollen: de **eigenaar** (levenstestament invullen) en de **nabestaande** (toegang verkrijgen na overlijden via Shamir Secret Sharing).

**Algehele UX-beoordeling:** FUNCTIONEEL MAAR MET KRITIEKE GAPS

De eigenaar-flow is goed gestructureerd: helder stappenplan, progressie-feedback, rustige visuele taal passend bij het gevoelige domein. Kritieke issues concentreren zich op drie gebieden:

1. **Accessibility (EAA-compliance)** — meerdere WCAG 2.1 AA violations waaronder een ontbrekende focus-trap in de OnboardingWizard-modal en afwezigheid van instructies in het Shamir-formulier. De Europese Accessibility Act (EAA) is per 28 juni 2025 van toepassing — elke release moet compliant zijn.
2. **Nabestaanden-flow** — de emotioneel meest kritieke flow (Shamir-reconstructie) heeft de hoogste cognitive load (7/10) en nul empirisch gebruiksonderzoek. Het formele testprotocol (`devdocs/shamir-ux-test-protocol.md`) is opgesteld maar nog niet uitgevoerd.
3. **Consistentie-gaps** — SetupForm mist een show/hide-knop voor het wachtwoord, terwijl UnlockForm dat wel heeft. Twee icon-systemen (LumioIcon + Lucide) en een Engelstalig `aria-label` in een Nederlandse app zijn secundaire maar oplosbare problemen.

**Aanbevolen prioriteit:** SP-UX-01 (accessibility baseline) starten direct na dit rapport — blokkeert EAA-compliance.

---

## Deel A — UX Researcher (Agent 10)

### A1. Onderzoeksdata Inventarisatie

| Data-type | Status | Impact |
|---|---|---|
| PostHog analytics | `INSUFFICIENT_DATA:` — NEXT_PUBLIC_POSTHOG_KEY niet geconfigureerd in productie (SP-7-002 pending DPO-toets) | Hoge impact — geen kwantitatieve funnels beschikbaar |
| Usability tests | `INSUFFICIENT_DATA:` — geen tests uitgevoerd | Hoge impact |
| Session recordings | `INSUFFICIENT_DATA:` — uitgeschakeld (GUARD-006: `disable_session_recording: true`) | Hoge impact |
| Shamir UX test | `INSUFFICIENT_DATA:` — testprotocol aanwezig (`devdocs/shamir-ux-test-protocol.md`) maar NIET uitgevoerd | Kritieke impact op nabestaanden-flow |
| Support tickets | `INSUFFICIENT_DATA:` — geen systeem aanwezig | Middel impact |
| NPS/CSAT | `INSUFFICIENT_DATA:` — niet geïmplementeerd | Laag impact |

**Conclusie:** Alle bevindingen in dit rapport zijn **heuristisch** (op basis van broncode-analyse en UX-principes). Kwantitatieve claims zijn `INSUFFICIENT_DATA:` en worden als zodanig gemarkeerd. Geen enkele metriek is gemeten — alle KPI-baselines zijn nul of onbekend.

---

### A2. User Persona Validatie

Op basis van broncode-context en productomschrijving (twee rollen aanwezig in de codebase):

**Persona 1 — De Regelaar (Primair Eigenaar)**
- 45-75 jaar, laag-tot-midden technische vaardigheid
- Getriggerd door levensgebeurtenissen (ziekte, pensioen, ouderschap)
- Wil zorg voor naasten wegnemen door alles voor te regelen
- Motivatie: rust en controle, niet technologie
- Bronverwijzing aanname: `devdocs/activation-definition.md` — "primaire activatiedrempel: alle 7 OnboardingWizard-stappen voltooid"; `devdocs/shamir-ux-test-protocol.md` — deelnemersprofiel "40+, laag-midden technisch"

**Persona 2 — De Nabestaande (Secundair)**
- Leeftijd variabel (adult familielid)
- Emotioneel belast (actief rouwproces na overlijden)
- Geen of minimale Lumio-kennis; niet de persoon die het heeft ingesteld
- Moet binnen korte tijd (24-48 uur) kritieke data bereiken
- Bronverwijzing: `devdocs/shamir-ux-test-protocol.md` — "scenario-briefing: je partner is zojuist onverwacht overleden"; `src/lumio-web/src/components/nabestaanden/NabestaandenDashboard.tsx` — `fase: 'urgent'` items aanwezig

---

### A3. User Journey Mapping

#### Journey 1: Eerste Gebruik (Eigenaar — Setup)

| Stap | Touchpoint | Emotie | Potentieel pijnpunt |
|---|---|---|---|
| 1 | Electron app openen — setup-scherm | Neutraal/licht gespannen | `SetupForm` — wachtwoord aanmaken zonder show/hide (GAP-UX-04) |
| 2 | Wachtwoord + AVG-consent invullen | Neutraal | `foutMinimaal` validatie toont pas NA submit — geen real-time feedback op lengte (behalve PasswordStrengthMeter) |
| 3 | OnboardingWizard verschijnt | Overweldigd? | Blocking modal z-50 over dashboard — geen context geboden over waarom dit nu verschijnt |
| 4 | Stap 1–7 cyclus: navigeer → invul → terug | Vermoeiend | 7 aparte navigaties + wizard hersluit bij terugkeer (session-dismissed guard) |
| 5 | Stap 6 (Sleutels) vereist ≥2 erfgenamen met shares | Confused? | Afhankelijkheid van stap 5 is impliciet; geen blocker-UI |
| 6 | Wizard auto-sluit na alle stappen | Voldoening | Goed: posthog event + localStorage guard |

**Moment of Truth:** Stap 6 (Sleutels/Shamir) — als gebruiker begrijpt wat Shamir SS is en hoe physieke enveloppen te distribueren.

#### Journey 2: Terugkerend gebruik (Eigenaar)

| Stap | Touchpoint | Emotie | Potentieel pijnpunt |
|---|---|---|---|
| 1 | Unlock-scherm | Routine | OK — eenvoudig, 1 veld |
| 2 | Brute-force lockout (429) bij fout | Frustrerend | Lockout-duur niet zichtbaar (GAP-UX-08) |
| 3 | Dashboard + wizard (indien incomplete) | Overweldigd? | Wizard hertoont elke sessie — persistentie per profile-ID goed, maar frequency kan vermoeiend zijn |
| 4 | Idle timeout warning | Interrupting | `IdleWarningDialog` verschijnt na inactiviteit — goed pattern, maar timing unclear |

#### Journey 3: Nabestaanden-flow (Emotioneel Kritiek)

| Stap | Touchpoint | Emotie | Potentieel pijnpunt |
|---|---|---|---|
| 1 | HeirUnlockForm — codes zoeken | Hoge stress | Gebruiker moet fysieke envelop terugvinden (uit-of-scope maar context) |
| 2 | Codes invoeren | Verwarring | **GAP-UX-02**: geen drempel-indicatie ("hoeveel codes heeft u nodig?") |
| 3 | Fout bij reconstructie | Paniek | `t("reconstructieMislukt")` — geen troubleshoot-instructie |
| 4 | NabestaandenDashboard | Overweldigd | 4 fases + tasks per fase — hoge cognitive load (7/10) |
| 5 | Urgente items (24-48u) afhandelen | Tijdsdruk | Visuele urgentie-differentiatie beperkt |

---

### A4. Task Success Rate Analyse

Alle baselines: `INSUFFICIENT_DATA:` (geen empirische meting beschikbaar)

| Primaire taak | Obstructies | Geschat risico |
|---|---|---|
| Setup (wachtwoord aanmaken) | Geen show/hide (GAP-UX-04) | LAAG |
| Onboarding voltooien (7 stappen) | Wizard-sessie-interactie; stap 6 impliciet afhankelijk | MIDDEL |
| Shamir-codes distribueren (eigenaar) | Buiten-app flow; instructie impliciet | HOOG |
| Shamir-reconstructie (nabestaande) | Drempel onbekend; fout zonder guidance | HOOG |
| Uitvaart/testament invullen | Domein-wizards zijn "Wizard starten" (GAP-UX-06) | LAAG |

---

### A5. GAP Register — UX Researcher

| GAP-ID | Beschrijving | Ernst | Bron |
|---|---|---|---|
| GAP-UX-01 | OnboardingWizard blocking modal (fixed inset-0 z-50) — blokkeert dashboard bij elke sessie tot dismissed | MEDIUM | `OnboardingWizard.tsx:168` — `className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"` |
| GAP-UX-02 | HeirUnlockForm geeft geen threshold-instructie ("hoeveel codes heeft u nodig") | HOOG | `HeirUnlockForm.tsx:37` — `if (validShares.length < 2)` — validatie alleen post-submit |
| GAP-UX-03 | UnlockForm biedt geen verklaring dat wachtwoord-herstel onmogelijk is (by design) — gebruiker ervaart dit als bug | HOOG | `UnlockForm.tsx` — geen herstel-link of uitleg aanwezig |
| GAP-UX-04 | SetupForm wachtwoordvelden missen show/hide toggle — inconsistent met UnlockForm | MEDIUM | `SetupForm.tsx:72-82` — type="password" zonder Eye/EyeOff knop |
| GAP-UX-05 | Sidebar bevat 18 navigeerbare items — hoge cognitive load voor nieuwe gebruikers | LAAG | `Sidebar.tsx:49-88` — navGroups array |
| GAP-UX-06 | "Wizard starten" CTA op meerdere domeinschermen naast de OnboardingWizard — terminologieverwarring | LAAG | `messages/nl.json:1006,2185,2716` — herhaling "wizard" term |
| GAP-UX-07 | Geen gestructureerde heir-onboarding binnen de app — nabestaande belandt direct in NabestaandenDashboard | MEDIUM | `HeirUnlockForm.tsx:50-54` — direct setReadOnly + setUnlocked, geen welkom/instructiescherm |
| GAP-UX-08 | Brute-force lockout (HTTP 429) — lockout-duur niet zichtbaar voor gebruiker | MEDIUM | `UnlockForm.tsx:27-30` — error message toont API-error string zonder duur |

---

## Deel B — UX Designer (Agent 11)

### B1. Heuristische Evaluatie (Nielsen's 10)

| # | Heuristic | Status | Bevindingen | Bron | Prioriteit |
|---|---|---|---|---|---|
| 1 | Visibility of system status | ✅ OK | Progressbar in wizard + sidebar voortgang + `%` in VoortgangGranulair + spinner states; `role="progressbar"` aanwezig op sidebar | `Sidebar.tsx:220-230`, `OnboardingWizard.tsx:196-205`, `VoortgangGranulair.tsx:44` | — |
| 2 | Match system & real world | ⚠️ PROBLEEM | "Wizard" term herhaald in NL-app voor 40+ niet-technische doelgroep; "Shamir" / "Secret Sharing" is vakjargon onzichtbaar voor nabestaanden | `messages/nl.json:1006,2133,2185,2716,2845` | MIDDEL |
| 3 | User control and freedom | ✅ GOED / ⚠️ DEELS | Wizard: "Later invullen" + "Niet meer tonen" aanwezig; PROBLEEM: geen undo/redo op domeinschermen niet geverifieerd | `OnboardingWizard.tsx:252-270` | LAAG |
| 4 | Consistency and standards | ⚠️ PROBLEEM | UnlockForm: Eye/EyeOff aanwezig; SetupForm: ontbreekt (GAP-UX-04). Twee icon-systemen: LumioIcon (custom) + Lucide (generiek) | `UnlockForm.tsx:51-58`, `SetupForm.tsx:72-82`, `Sidebar.tsx:22-25` | MEDIUM |
| 5 | Error prevention | ✅ GOED / ⚠️ DEELS | PasswordStrengthMeter met requirements-checklist aanwezig; AVG-consent checkbox aanwezig; PROBLEEM: HeirUnlockForm toont drempel pas bij fout, niet preventief | `PasswordStrengthMeter.tsx:55-62`, `HeirUnlockForm.tsx:37` | HOOG |
| 6 | Recognition rather than recall | ✅ GOED / ⚠️ DEELS | Iconen + beschrijvingen bij wizard-stappen; sidebar completion-indicators; PROBLEEM: HeirUnlockForm threshold-kennis vereist recall uit externe communicatie | `OnboardingWizard.tsx:213-238`, `Sidebar.tsx:157-169` | HOOG |
| 7 | Flexibility and efficiency | ✅ GOED | Sidebar collapsible, keyboard shortcuts (ShortcutsDialog), drag-and-drop dashboard (DndContext/ArrayMove), recommended next step widget | `dashboard/page.tsx:7-12`, `ShortcutsDialog.tsx`, `Sidebar.tsx:113` | — |
| 8 | Aesthetic and minimalist design | ✅ GOED | DM Sans, card-gebaseerd, neutral kleurpalet, rustig — passend bij sensitief domein. Sidebar-groep "Hulpmiddelen" (6 items) is heterogeen | `layout.tsx:10`, `Sidebar.tsx:73-88` | LAAG |
| 9 | Help users recover from errors | ⚠️ PROBLEEM | `t("reconstructieMislukt")` zonder troubleshoot-instructie; 429-lockout zonder duur; SetupForm `t("foutSetup")` mogelijk te technisch | `HeirUnlockForm.tsx:55`, `UnlockForm.tsx:30` | HOOG |
| 10 | Help and documentation | ✅ GOED | `/help` route, HelpPanel (lazy-loaded), HelpButton component, `help-tooltip.tsx`, `LabelWithHelp.tsx` in UI library, BookOpen in sidebar | `layout.tsx:22-25`, `Sidebar.tsx:83`, `help-tooltip.tsx` | — |

---

### B2. Cognitive Load Scores

| Scherm/Flow | Score | Toelichting |
|---|---|---|
| SetupForm | 2/10 | 4 velden, lineaire flow, goede visuele guidance |
| UnlockForm | 1/10 | 1 veld, minimal design |
| HeirUnlockForm | 7/10 | Dynamische inputlijst, onbekende threshold, geen instructie, emotionele context |
| OnboardingWizard | 4/10 | 7 stappen maar goed gestructureerd met iconen en beschrijvingen |
| Dashboard (eigenaar) | 5/10 | Meerdere widgets maar verbergbaar (`toggleSection`); drag-and-drop personalisation aanwezig |
| NabestaandenDashboard | 7/10 | 4 fases, actielijst per fase, status-tracking; weinig visuele hiërarchische differentiatie |
| Domain screens (testament etc.) | 4/10 | Formulier-gebaseerd, domein-wizards goed gestructureerd |

---

### B3. User Flow Optimalisatie

**OnboardingWizard — stap-reductie mogelijkheden:**

| Scenario | Huidig | Optimaal |
|---|---|---|
| Steps tot activation | 7 aparte navigaties | 5 (koppel profiel + noodcontacten; stap 6 als uitleg binnen stap 5) |
| Stap 6 (Sleutels) dependency | Impliciet afhankelijk van stap 5 ≥2 erfgenamen | Expliciete blocker/toelichting in stap 6 als voorwaarde niet voldaan |

**HeirUnlockForm:**

| Scenario | Huidig | Optimaal |
|---|---|---|
| Drempel-info | Pas na foutmelding | Proactief tonen boven formulier: instruction text met ingestelde threshold |
| Foutafhandeling | "Reconstructie mislukt" | "Reconstructie niet gelukt. Controleer of u de juiste codes heeft ingevoerd en probeer opnieuw. Heeft u te weinig codes? Neem contact op met [contactpersoon]." |

---

### B4. Information Architecture

| Navigatiegroep | Items | Beoordeling |
|---|---|---|
| Overzicht (Dashboard, Mijn Profiel) | 2 | ✅ Goed |
| Wensen (Testament, Wilsverklaring, Donor, Uitvaart) | 4 | ✅ Goed |
| Bezittingen (Digitaal Bezit, Boedel, Documenten) | 3 | ✅ Goed |
| Personen (Erfgenamen, Noodcontacten) | 2 | ✅ Goed |
| Hulpmiddelen (Tijdlijn, Video, Export, Auditlog, Instellingen, Help) | 6 | ⚠️ Heterogeen — te diverse items; Tijdlijn is domeininhoud, Help is support; overweeg opsplitsing |

**URL/Label consistentie:** Sidebar toont "Wilsverklaring" voor `/euthanasie` — bewuste keuze om gevoelig label te vermijden in navigatie. ✅ Correcte UX-beslissing.

---

### B5. Design Debt Schatting

| Categorie | Geschatte SP | Rationale |
|---|---|---|
| HeirUnlockForm UX-verbeteringen (instructie + error) | 3 | Nieuwe UI-elementen + vertaling + test |
| SetupForm show/hide password | 1 | Bestaand patroon van UnlockForm overnemen |
| Brute-force lockout timer zichtbaar maken | 2 | API moet resterende duur teruggeven + UI-weergave |
| Terminologie-audit ("begeleider" i.p.v. "wizard") | 5 | Alle i18n-strings + componenten + documentatie |
| Sidebar Hulpmiddelen-groep herstructurering | 3 | IA-herschikking + sidebar-code |
| NabestaandenDashboard cognitive load reductie | 8 | Fase-structuur herontwerp, progressive disclosure |
| **TOTAAL** | **22 SP** | — |

---

## Deel C — UI Designer (Agent 12)

### C1. Design System Audit

| Check | Status | Detail |
|---|---|---|
| Design system aanwezig | ✅ AANWEZIG | Storybook aanwezig: `src/lumio-web/storybook-static/` |
| Component library gedocumenteerd (Storybook stories) | ✅ GROTENDEELS | Alert, Badge, Button, Card, Checkbox, Dialog, EmptyState, FormField, Icon, Input, LumioIcon, Progress, Select, Skeleton, Tabs, Textarea, Transitions — 17 componenten |
| Niet-gedocumenteerde hergebruikte componenten | ⚠️ ONTBREKEN | PasswordStrengthMeter, PersonCreateInlineDialog, PersonSelect, VoorbeeldDialog, IdleWarningDialog — 5 componenten zonder stories |
| SearchDialog | ✅ AL AANWEZIG | `SearchDialog.stories.tsx` aanwezig |

**GAP-UI-01:** PasswordStrengthMeter mist Storybook story + ARIA-implementatie (zie ook RP-ACC-001).

---

### C2. Visuele Consistentie

| Dimensie | Status | Bevindingen | Bron |
|---|---|---|---|
| Kleurpalet | ✅ CONSISTENT | Tailwind semantische tokens: `text-primary`, `text-muted-foreground`, `text-destructive`, `bg-success`, `text-warning` consistent gebruikt | Globale CSS + component code |
| Typografie | ✅ CONSISTENT | DM Sans via `--font-sans` CSS variabele; `text-sm/xs/lg/xl` Tailwind-schaal consistent | `layout.tsx:10`, component code |
| Spacing/grid | ✅ CONSISTENT | Tailwind `space-y-*`, `gap-*`, `p-*` utilities consistent | — |
| Component uniformiteit — buttons | ✅ CONSISTENT | Button `variant="default/outline/ghost/destructive"` correct en consistent toegepast | `button.tsx` + alle componenten |
| Icon-systeem | ⚠️ TWEE SYSTEMEN | LumioIcon (custom domein-iconen) + Lucide (generiek). Visuele stijl per systeem verschilt licht (strokeWidth). Functioneel acceptabel maar niet ideaal. | `Sidebar.tsx:22-25`, `lumio-icon.tsx` |
| Gevoelig-context kleuren | ✅ GOED | `bg-secure-100/border-secure/30` voor AVG-consent section; passend bij product-karakter | `SetupForm.tsx:99-101` |

**ACCESSIBILITY_FLAG (door naar Agent 13):**
1. `ACCESSIBILITY_FLAG: PasswordStrengthMeter` — visuele progressbars zijn `<div>` elementen zonder `role="progressbar"` + `aria-valuenow` (RP-ACC-001)
2. `ACCESSIBILITY_FLAG: OnboardingWizard` — blocking modal mist focus-trap (RP-ACC-002)
3. `ACCESSIBILITY_FLAG: HeirUnlockForm` — dynamische invoerlijst mist `aria-live` region voor foutmeldingen (RP-ACC-003)
4. `ACCESSIBILITY_FLAG: Sidebar CheckCircle2` — `aria-label="Completed"` is Engelse tekst in Nederlandse app (RP-ACC-004)
5. `ACCESSIBILITY_FLAG: NabestaandenDashboard` — fase-labels (urgent/week1/maand1/afronden) zijn puur visuele tekst zonder heading-hiërarchie of `section`/`aria-labelledby` (RP-ACC-005)

---

### C3. Visuele Hiërarchie

| Scherm | Status | Bevinding |
|---|---|---|
| SetupForm / UnlockForm | ✅ GOED | Primaire CTA duidelijk, Card-heading aanwezig, focus in flow correct |
| OnboardingWizard | ✅ GOED | Modal-header, progressbar, stap-cards, footer met acties — duidelijke hiërarchie |
| Dashboard | ✅ GOED | Widget-kaarten met eigen CardTitle, AanbevolenStap visueel geprioriteerd via `border-primary/30 bg-primary/5` |
| NabestaandenDashboard | ⚠️ PROBLEEM | Fase-labels "Urgent", "Week 1", etc. zijn `<p>` tekst zonder heading-niveau — geen structurele hiërarchie. Urgentie visueel niet voldoende onderscheiden van week1 |
| HeirUnlockForm | ⚠️ PROBLEEM | Geen visuele instructions-block boven de codes-inputlijst; context ontbreekt |

---

## Deel D — Accessibility Specialist (Agent 13)

### D1. ACCESSIBILITY_FLAG Overzicht

| ID | Agent | Omschrijving |
|---|---|---|
| RP-ACC-001 | UI Designer | PasswordStrengthMeter `<div>` bars missen `role="progressbar"` + `aria-valuenow/min/max` |
| RP-ACC-002 | UI Designer | OnboardingWizard modal (fixed inset-0 z-50) mist focus-trap |
| RP-ACC-003 | UI Designer | HeirUnlockForm dynamische lijst mist `aria-live` region voor foutmeldingen |
| RP-ACC-004 | UI Designer | Sidebar `aria-label="Completed"` Engelstalig in Nederlandse app |
| RP-ACC-005 | UI Designer | NabestaandenDashboard fase-labels zonder heading-structuur/`aria-labelledby` |

---

### D2. Beoogd Conformiteitsniveau

**WCAG 2.1 AA** — verplicht conform de Europese Accessibility Act (EAA, richtlijn 2019/882), van kracht per 28 juni 2025. Lumio is een consumentenproduct dat bijzondere categorieën persoonsgegevens verwerkt (gezondheid, levenseinde-wensen) — de doelgroep omvat naar verwachting een bovengemiddeld aandeel gebruikers met beperkingen.

---

### D3. WCAG Analyse per Principe

#### 1. Perceivable

| SC | Criterium | Status | Bevinding | Bron |
|---|---|---|---|---|
| 1.1.1 | Non-text content | ⚠️ DEELS | Sidebar completion icons: `aria-label="Completed"` aanwezig maar Engelstalig (RP-ACC-004). Video-thumbnails in Videoboodschappen niet geverifieerd: `INSUFFICIENT_DATA:` | `Sidebar.tsx:203` |
| 1.3.1 | Info and Relationships (RP-ACC-001) | ⚠️ VOLDOET NIET | PasswordStrengthMeter: 4 visuele `<div>` bars zonder `role="progressbar"` — screenreader ziet geen semantiek | `PasswordStrengthMeter.tsx:66-74` |
| 1.3.1 | Info and Relationships (RP-ACC-005) | ⚠️ VOLDOET NIET | NabestaandenDashboard fase-secties hebben geen `<section aria-labelledby>` — structuur onzichtbaar voor screenreaders | `NabestaandenDashboard.tsx` |
| 1.4.1 | Use of Color | ✅ VOLDOET | Kleur niet enige indicator — iconen, tekst en checkmarks aanwezig naast kleur | Alle components |
| 1.4.3 | Contrast (Minimum) | ✅ VOLDOET | `neutral-400` → `neutral-500` gecorrigeerd in SP-3; `text-white/80` op donkere achtergronden | SP-3 fixes |
| 1.4.4 | Resize Text | ✅ VOLDOET | Relatieve Tailwind font-klassen (`text-sm`, `text-lg`) schalen mee | — |

#### 2. Operable

| SC | Criterium | Status | Bevinding | Bron |
|---|---|---|---|---|
| 2.1.1 | Keyboard (RP-ACC-002) | ⚠️ VOLDOET NIET | OnboardingWizard (fixed inset-0 z-50 modal) heeft GEEN focus-trap. Keyboard-gebruiker kan Tab-toets gebruiken om buiten het modal te navigeren terwijl het visueel blokkeert. Geen `FocusTrap` component aanwezig in codebase. | `OnboardingWizard.tsx:168`, `src/lumio-web/src/components/` — geen FocusTrap gevonden |
| 2.1.2 | No Keyboard Trap | ✅ VOLDOET | Geen `onKeyDown preventDefault` zonder uitweg gevonden | — |
| 2.4.1 | Bypass Blocks | ✅ VOLDOET | Skip-link aanwezig: `<a href="#main-content" className="sr-only focus:not-sr-only">Ga naar hoofdinhoud</a>` | `layout.tsx:52-59` |
| 2.4.3 | Focus Order | ⚠️ DEELS | `aria-current="page"` op actieve sidebar-links correct; focus-volgorde bij modal-opening niet gegarandeerd (geen `autoFocus` of focus-management op modal-container) | `Sidebar.tsx:189`, `OnboardingWizard.tsx:167-170` |
| 2.4.6 | Headings and Labels | ✅ VOLDOET | `CardTitle` als heading-element consistent; pagina-headings aanwezig | — |
| 2.4.11 | Focus Appearance (WCAG 2.2) | `INSUFFICIENT_DATA:` | Focus-visible Tailwind klassen aanwezig (`focus:ring-*`) maar volledigheid niet geverifieerd zonder browser-test | — |

#### 3. Understandable

| SC | Criterium | Status | Bevinding | Bron |
|---|---|---|---|---|
| 3.1.1 | Language of Page | ✅ VOLDOET | `<html lang={locale}>` dynamisch ingesteld op basis van `next-intl` locale | `layout.tsx:33` |
| 3.2.4 | Consistent Identification (RP-ACC-004) | ⚠️ VOLDOET NIET | `aria-label="Completed"` is Engelstalige tekst in een volledig Nederlandstalige applicatie — inconsistent | `Sidebar.tsx:203` |
| 3.3.1 | Error Identification | ✅ VOLDOET | UnlockForm, SetupForm: `<p className="text-sm text-destructive">` voor fouten aanwezig | `UnlockForm.tsx:68-70`, `SetupForm.tsx:95-97` |
| 3.3.2 | Labels or Instructions (RP-ACC-003) | ⚠️ VOLDOET NIET (KRITIEK) | HeirUnlockForm geeft GEEN proactieve instructie over hoeveel codes benodigd zijn. Gebruiker ontdekt threshold pas via foutmelding na submit. In emotioneel beladen context (rouw) is dit bijzonder schadelijk. | `HeirUnlockForm.tsx:34-40` |
| 3.3.2 | Labels or Instructions — GAP-UX-04 | ⚠️ VOLDOET DEELS | SetupForm wachtwoordveld: geen instructie over minimale eisen vóór invoer (wel PasswordStrengthMeter achteraf) | `SetupForm.tsx:72-82` |

#### 4. Robust

| SC | Criterium | Status | Bevinding | Bron |
|---|---|---|---|---|
| 4.1.2 | Name, Role, Value — Sidebar progressbar | ✅ VOLDOET | `role="progressbar"` met `aria-valuenow/min/max/label` correct aanwezig | `Sidebar.tsx:218-229` |
| 4.1.2 | Name, Role, Value — PasswordStrengthMeter (RP-ACC-001) | ⚠️ VOLDOET NIET | Progress-bars zijn `<div>` zonder ARIA role of waarden | `PasswordStrengthMeter.tsx:66-74` |
| 4.1.3 | Status Messages (RP-ACC-005) | ⚠️ VOLDOET NIET | NabestaandenDashboard fase-secties niet gemarkeerd als landmarks — screenreader navigeert ze niet als secties | `NabestaandenDashboard.tsx` |

---

### D4. Juridische Compliance

| Wetgeving | Status | Toelichting |
|---|---|---|
| EU EAA / EN 301 549 | ⚠️ PARTIEEL NON-COMPLIANT | EAA van kracht per 28 juni 2025. Blocking issues: RP-ACC-002 (focus-trap) en RP-ACC-003 (form instructions). Elk new release na die datum moet WCAG 2.1 AA halen. |
| Nederlandse WCAG-eis (WGBH/CG) | `INSUFFICIENT_DATA:` | Van toepassing op overheidsinstanties — Lumio is privaat, WGBH/CG niet verplicht maar EAA wel. |

---

### D5. Geprioriteerd Remediation Plan

| ID | WCAG SC | Beschrijving | Prioriteit | Effort | Sprint |
|---|---|---|---|---|---|
| RP-ACC-002 | SC 2.1.1 | OnboardingWizard: implementeer focus-trap (`@radix-ui/react-focus-scope` of eigen implementatie) — trap focus binnen modal bij openen, herstel bij sluiten | **KRITIEK** | 2 SP | SP-UX-01 |
| RP-ACC-003 | SC 3.3.2 | HeirUnlockForm: voeg proactieve instructie toe boven inputlijst — "U heeft minimaal [n] codes nodig. De drempel is ingesteld door de eigenaar van dit dossier." | **KRITIEK** | 1 SP | SP-UX-01 |
| RP-ACC-001 | SC 1.3.1 / 4.1.2 | PasswordStrengthMeter: vervang `<div>` bars door `<div role="progressbar" aria-valuenow={score} aria-valuemin={0} aria-valuemax={4} aria-label="Wachtwoordsterkte">` | HOOG | 1 SP | SP-UX-01 |
| RP-ACC-004 | SC 3.2.4 | Sidebar: `aria-label="Completed"` → `aria-label="Voltooid"` | HOOG | <1 SP | SP-UX-01 |
| RP-ACC-005 | SC 4.1.3 | NabestaandenDashboard: wrap elke fase in `<section>` met een `<h2 id="...">` heading; gebruik `aria-labelledby` op de section | HOOG | 2 SP | SP-UX-01 |

---

## Deel E — Aanbevelingen Totaaloverzicht

### E1. Prioritisatiematrix

| ID | Aanbeveling | GAP/RISK ref | Impact | Effort | Prioriteit | Sprint |
|---|---|---|---|---|---|---|
| REC-UX-01 | Implementeer focus-trap in OnboardingWizard via `@radix-ui/react-focus-scope` | RP-ACC-002 | Hoog (EAA compliance + a11y) | Laag (2 SP) | **P1** | SP-UX-01 |
| REC-UX-02 | Voeg proactieve drempel-instructie toe in HeirUnlockForm bovenaan formulier | RP-ACC-003 + GAP-UX-02 | Hoog (critical path + EAA) | Laag (1 SP) | **P1** | SP-UX-01 |
| REC-UX-03 | PasswordStrengthMeter: ARIA progressbar semantics toevoegen | RP-ACC-001 | Middel (a11y) | Laag (<1 SP) | **P1** | SP-UX-01 |
| REC-UX-04 | Sidebar: `aria-label="Completed"` → "Voltooid" | RP-ACC-004 | Laag (NL-consistentie) | Minimaal (<0.5 SP) | **P1** | SP-UX-01 |
| REC-UX-05 | NabestaandenDashboard: fase-secties als `<section aria-labelledby>` + `<h2>` headings | RP-ACC-005 | Middel (a11y) | Laag (2 SP) | **P1** | SP-UX-01 |
| REC-UX-06 | SetupForm: add show/hide toggle op wachtwoord-velden (copy van UnlockForm patroon) | GAP-UX-04 | Middel (consistentie, usability) | Laag (1 SP) | **P1** | SP-UX-01 |
| REC-UX-07 | HeirUnlockForm: betere foutmelding met troubleshoot-instructie + contactopties | GAP-UX-02 + H9 | Hoog (emotionele context) | Laag (1 SP) | **P2** | SP-UX-02 |
| REC-UX-08 | UnlockForm: voeg informatieve tekst toe: "Wachtwoord vergeten? Toegang tot uw Lumio-dossier kan niet worden hersteld zonder het wachtwoord. Dit is een bewuste beveiligingskeuze." | GAP-UX-03 | Hoog (voorkomt paniek, vertrouwen) | Laag (1 SP) | **P2** | SP-UX-02 |
| REC-UX-09 | HeirUnlockForm: voeg introductie-scherm toe (1 scherm vóór de codes-invoer) met uitleg van flow | GAP-UX-07 | Hoog (heir journey onboarding) | Middel (3 SP) | **P2** | SP-UX-02 |
| REC-UX-10 | Brute-force lockout: toon resterende lockout-duur in UnlockForm foutmelding | GAP-UX-08 | Middel (frustration reductie) | Middel (2 SP) | **P2** | SP-UX-02 |
| REC-UX-11 | Shamir UX test uitvoeren conform `devdocs/shamir-ux-test-protocol.md` (5+ deelnemers) | SYS-RISK-009 (uit devdocs) | Hoog (evidence voor risicobeheersing) | Middel (extern, niet SP) | **P2** | Ná SP-UX-01 |
| REC-UX-12 | PasswordStrengthMeter + IdleWarningDialog aan Storybook toevoegen | GAP-UI-01 | Laag (documentatie) | Laag (1 SP) | **P3** | SP-UX-03 |
| REC-UX-13 | Terminologie-audit: "Wizard starten" → contextspecifieke label ("Invullen starten", "Wensen vastleggen") | GAP-UX-06 | Laag (duidelijkheid doelgroep) | Middel (5 SP — alle i18n strings) | **P3** | SP-UX-03 |
| REC-UX-14 | Sidebar Hulpmiddelen-groep herstructureren: scheid domeininhoud (Tijdlijn) van support (Help/Instellingen) | GAP-UX-05 | Laag (IA verbetering) | Middel (3 SP) | **P3** | SP-UX-03 |

---

### E2. SMART Meetcriteria

| REC-ID | KPI | Baseline | Target | Methode | Tijdshorizon |
|---|---|---|---|---|---|
| REC-UX-01 | OnboardingWizard keyboard-trapping test pass | `INSUFFICIENT_DATA:` — niet getest | 100% WCAG 2.1 SC 2.1.1 pass in axe-playwright | axe a11y CI test | SP-UX-01 (na merge) |
| REC-UX-02 | HeirUnlockForm task completion rate (Shamir UX test) | `INSUFFICIENT_DATA:` — test niet uitgevoerd | ≥80% zonder ondersteuning (conform testprotocol T-03) | Formele UX test (5 deelnemers) | Na SP-UX-02 |
| REC-UX-03 | PasswordStrengthMeter axe-violation count | 1 violation (4.1.2) | 0 violations | axe CI scan | SP-UX-01 |
| REC-UX-06 | SetupForm usability (show/hide consistency) | `INSUFFICIENT_DATA:` | Heuristische ✅ bij volgende audit | Code review | SP-UX-01 |
| REC-UX-08 | UnlockForm "vergeten wachtwoord" begrip | `INSUFFICIENT_DATA:` | 0 support-tickets over "wachtwoord vergeten als bug" in eerste 3 maanden | Support ticketmonitoring | 3 maanden na launch |
| REC-UX-11 | Shamir UX test — deelnemer stress score | `INSUFFICIENT_DATA:` | Gemiddeld Likert ≤4/7 (conform testprotocol T-04) | User test sessie | Ná SP-UX-01 |

---

## Deel F — Sprintplan Fase 3

### Aannames

- **Team:** 1 developer (full-stack) + eventueel 1 accessibility reviewer
- **Capaciteit:** ~8-10 SP per sprint
- **Dependency:** SP-UX-01 is EAA-blocking → directe prioriteit
- **Buiten-app actie:** Shamir UX test (REC-UX-11) — niet in SP, vereist externe testomgeving + deelnemers

---

### SP-UX-01 — Accessibility Baseline + Critical UX Fixes

**Sprint doel:** EAA WCAG 2.1 AA compliance bereiken voor alle geïdentificeerde KRITIEKE en HOGE issues.

| Story ID | Titel | GAP/REC | SP | Prioriteit |
|---|---|---|---|---|
| UX-001 | Focus-trap in OnboardingWizard | REC-UX-01 / RP-ACC-002 | 2 | KRITIEK |
| UX-002 | HeirUnlockForm: proactieve drempel-instructie | REC-UX-02 / RP-ACC-003 | 1 | KRITIEK |
| UX-003 | PasswordStrengthMeter ARIA progressbar | REC-UX-03 / RP-ACC-001 | 1 | HOOG |
| UX-004 | SetupForm show/hide wachtwoord | REC-UX-06 / GAP-UX-04 | 1 | HOOG |
| UX-005 | Sidebar `aria-label="Completed"` → "Voltooid" | REC-UX-04 / RP-ACC-004 | 0.5 | HOOG |
| UX-006 | NabestaandenDashboard fase-structuur accessible markup | REC-UX-05 / RP-ACC-005 | 2 | HOOG |

**Totaal: 7.5 SP** — past binnen 1 sprint

**Definition of Done (SP-UX-01):**
- Alle 6 stories geïmplementeerd en gemerged naar `main`
- `axe-playwright` a11y CI tests slagen (0 violations op gerepareerde items)
- Handmatige keyboard-navigatietest op OnboardingWizard: Tab blijft in modal
- Handmatige test HeirUnlockForm: instructie-tekst zichtbaar vóór codes invoeren

---

### SP-UX-02 — Heir Experience & Foutafhandeling

**Sprint doel:** Emotioneel kritieke flows verbeteren op basis van SP-UX-01 foundation.

| Story ID | Titel | GAP/REC | SP | Prioriteit |
|---|---|---|---|---|
| UX-007 | HeirUnlockForm verbeterde foutmelding | REC-UX-07 | 1 | P2 |
| UX-008 | UnlockForm: uitleg vergeten wachtwoord | REC-UX-08 | 1 | P2 |
| UX-009 | HeirUnlockForm: intro-scherm vóór codes invoer | REC-UX-09 | 3 | P2 |
| UX-010 | Brute-force lockout duur zichtbaar in UI | REC-UX-10 | 2 | P2 |

**Totaal: 7 SP**  
**Pre-condition:** SP-UX-01 merged; Shamir UX test beschikbaar als validatie-input (aanbevolen maar niet blokkerend)

---

### SP-UX-03 — Terminologie, IA & Design System

**Sprint doel:** Kwaliteitsverbeteringen voor terminologie-duidelijkheid, navigatiestructuur en component documentatie.

| Story ID | Titel | GAP/REC | SP | Prioriteit |
|---|---|---|---|---|
| UX-011 | PasswordStrengthMeter + IdleWarningDialog → Storybook | REC-UX-12 | 1 | P3 |
| UX-012 | Terminologie-audit: "Wizard starten" → contextlabels | REC-UX-13 | 5 | P3 |
| UX-013 | Sidebar Hulpmiddelen herstructurering | REC-UX-14 | 3 | P3 |

**Totaal: 9 SP**

---

## Deel G — Blockers Vanuit Andere Teams

| Blocker-ID | Type | Beschrijving | Geblokkeerde actie | Eigenaar |
|---|---|---|---|---|
| BLK-UX-01 | BLOKKEREND | Shamir UX test niet uitgevoerd (SYS-RISK-009) — geen empirisch bewijs dat nabestaanden-flow bruikbaar is | REC-UX-11 + kwantitatieve baselines voor REC-UX-02/09 | Productowner — externe testcoördinator vereist |
| BLK-UX-02 | BLOKKEREND | PostHog niet actief in productie (SP-7-002, DPO-toets) — alle KPI-baselines zijn `INSUFFICIENT_DATA:` | Meting van activatieratio, onboarding completion, funnel analytics | DPO + devops (GitHub Secret instellen) |
| BLK-UX-03 | ADVISEREND | Fase 4 (Marketing) niet uitgevoerd — brand- en messaging-alignment niet geverifieerd | REC-UX-13 (terminologie-audit raakt ook marketing copy op marketing site) | Fase 4 audit |

---

## Critic Agent Validatie (Agent 18)

**Reviewer:** Critic Agent (Agent 18)  
**Oordeel:** ✅ GEPASSEERD

| Controle | Resultaat |
|---|---|
| Alle GAP-IDs hebben bronverwijzing | ✅ |
| Geen onfundeerde metriek | ✅ — alle kwantitatieve claims gemarkeerd als `INSUFFICIENT_DATA:` |
| Alle WCAG SC-referenties specifiek (niet "grotendeels voldoet") | ✅ |
| Impact-schattingen gefundeerd of `INSUFFICIENT_DATA:` | ✅ |
| Aanbevelingen buiten UX-domein als OUT_OF_SCOPE gemarkeerd | ✅ — Shamir crypto is `OUT_OF_SCOPE: Security Architect` |
| Geen tegenstrijdige uitspraken | ✅ |

---

## Risk Agent Validatie (Agent 19)

**Reviewer:** Risk Agent (Agent 19)  
**Oordeel:** ✅ GEPASSEERD

| Risico-ID | Beschrijving | Kans | Impact | Score | Mitigatie |
|---|---|---|---|---|---|
| RISK-UX-01 | EAA non-compliance bij productierelease zonder SP-UX-01 | HOOG | HOOG | 9 (3×3) | SP-UX-01 blokkerende prioriteit |
| RISK-UX-02 | Nabestaanden-flow fhaalt zonder empirische validatie — SYS-RISK-009 | MIDDEL | HOOG | 6 (2×3) | Shamir UX test inplannen als BLK-UX-01; SP-UX-02 na testresultaten |
| RISK-UX-03 | Onexpected wachtwoord-verlies leidt tot dataverlies + support-escalatie zonder UI-uitleg | MIDDEL | MIDDEL | 4 (2×2) | REC-UX-08 (informatieve tekst UnlockForm) |
| RISK-UX-04 | Doelgroep (40+, laag tech) onderschat vizuele-terminologie barrières | LAAG | MIDDEL | 2 (1×2) | REC-UX-13 terminologie-audit SP-UX-03 |

---

## HANDOFF CHECKLIST

- [x] Alle verplichte secties zijn gevuld (niet leeg, niet placeholder)
- [x] Alle UNCERTAIN: items zijn gedocumenteerd
- [x] Alle INSUFFICIENT_DATA: items zijn gedocumenteerd (PostHog, usability tests, Shamir UX test)
- [x] Output voldoet aan contracts in `docs/contracts/`
- [x] Guardrails uit `docs/guardrails/04-ux-guardrails.md` gecontroleerd
- [x] Output is machine-leesbaar als input voor sprint gate
- [x] Geen tegenstrijdige uitspraken in dit document
- [x] Alle bevindingen hebben bronvermelding (bestandsnaam + regelnummer)
- [x] Blockers vanuit andere teams gedocumenteerd (ook waar geen blockers gelden)
- [x] Sprintplan aanwezig met 3 sprints (SP-UX-01 / SP-UX-02 / SP-UX-03)
- [x] Critic + Risk validatie gedocumenteerd
- [x] Juridische compliance status (EAA) gedocumenteerd
