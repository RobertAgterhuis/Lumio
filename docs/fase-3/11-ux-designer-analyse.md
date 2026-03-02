# Analyse – UX Design (UX Designer) – 2026-03-02
> UX Designer | Agent 11 | Fase 3

## Metadata
- Agent: UX Designer (11)
- Fase: 3
- Input ontvangen: UX Researcher analyse + aanbevelingen (`docs/fase-3/10-ux-researcher-*.md`)
- Datum: 2026-03-02

---

## 1. Heuristische Evaluatie (Nielsen's 10 Heuristics)

| # | Heuristic | Status | Bevindingen | Bron | Prioriteit |
|---|---|---|---|---|---|
| 1 | Visibility of system status | ⚠️ Deels OK | Wizard toont stap-voltooiing (✓ per stap, teller "X/7 stappen"). IdleWarningDialog toont afteltimer. **Probleem:** Geen globale laad-indicator tijdens pagina-transitie na wizard-navigate. Geen progress-indicator op dashboard voor gedeeltelijke activatie buiten wizard. | `OnboardingWizard.tsx` L193-L196 (`completedCount`); `(authenticated)/layout.tsx` L12 (`IdleWarningDialog`) | P2 |
| 2 | Match between system and real world | ⚠️ Deels OK | Domein-labeling NL ✓ (testament, erfgenamen, uitvaart). Iconen matchen concept (Church=uitvaart, Users=erfgenamen). **Probleem:** `KeyRound` icoon voor "sleutels/Shamir" — abstracte technische metafoor; het mentale model van gebruiker is "erfgenamen informeren", niet "sleutels distribueren". | `OnboardingWizard.tsx` L38 (`sleutels`, `KeyRound`); SYS-RISK-009 | P1 |
| 3 | User control and freedom | ⚠️ Deels OK | Wizard: X-knop ✓, Escape ✓, "Niet meer tonen"-optie ✓, sessie-dismiss ✓. **Probleem:** Na navigate via wizard sluit de modal (`handleNavigate`) maar gebruiker is op de doel-pagina zonder terugkeerpad naar wizard-overzicht (geen "Terug naar wizard"). Backup-stap navigeert naar `/instellingen` — gebruiker moet zelf terugnavigeren. | `OnboardingWizard.tsx` L177-L182 (`handleNavigate`) | P2 |
| 4 | Consistency and standards | ⚠️ Deels OK | Radix UI + Tailwind CSS 4 + design system component library ✓. **Probleem:** 224 ESLint `design-system/no-raw-colors` violations → raw kleurwaarden buiten design-tokens → visuele inconsistentie risico in detail-schermen. | `src/lumio-web/eslint-out.txt` (224 violations); Fase 2 REC-DEV-002 | P2 |
| 5 | Error prevention | `INSUFFICIENT_DATA:` | FluentValidation backend aanwezig (Fase 2). Shamir-drempel-fix SP-10 recent uitgevoerd. **Status:** Frontend form-validatie en inline error-states niet geïnspecteerd in detail; `INSUFFICIENT_DATA` op specifieke veld-validatiefeedback per formulier. | `INSUFFICIENT_DATA:` — geen directe inzage in elke formulier-component | P2 |
| 6 | Recognition rather than recall | ✓ OK | Wizard: stap-iconen + labels altijd zichtbaar ✓. Sidebar (aanwezig in authenticated layout) biedt navigatielabels. Dashboard status-meldingen aanwezig (`statusMeldingen` query). Help-panel aanwezig. | `(authenticated)/layout.tsx` L6 (`Sidebar`), L11 (`OnboardingWizard`) | — |
| 7 | Flexibility and efficiency | ✓ OK met kanttekening | `useKeyboardShortcuts` hook actief ✓. ShortcutsDialog aanwezig ✓. **Kanttekening:** `HEURISTIC:` Wizard is modal-overlay; geen directe deep-link naar specifieke stap. Power users kunnen wizard niet skip-to-step uitvoeren. | `(authenticated)/layout.tsx` L46 (`useKeyboardShortcuts`) | P3 |
| 8 | Aesthetic and minimalist design | ⚠️ Deels OK | Wizard modal: clean card-layout, backdrop-blur, stap-iconen ✓. **Probleem:** 224 raw-color violations risiceren visuele non-conformiteit in niet-wizard schermen. `HEURISTIC:` 26 componentdirectories suggereren rijk UI — risico op feature-creep / informatiedichtheid buiten wizard. | `OnboardingWizard.tsx` L200-L220 (markup); Fase 2 REC-DEV-002 | P2 |
| 9 | Help users recognize, diagnose, recover errors | ⚠️ Deels OK | `global-error.tsx` aanwezig ✓. ErrorBoundary aanwezig ✓. **Probleem:** `INSUFFICIENT_DATA:` kwaliteit van inline formulier-foutmeldingen (specifiek vs. generiek). `HEURISTIC:` Shamir-drempel-inputfouten zijn recent gefixed (SP-10) maar post-fix UX-kwaliteit niet empirisch geverifieerd. | `src/lumio-web/src/app/global-error.tsx` (aanwezig); REC-UX-001 | P1 |
| 10 | Help and documentation | ✓ OK met kanttekening | HelpPanel aanwezig (lazy-loaded) ✓. Keyboard shortcuts dialog ✓. **Kanttekening:** `INSUFFICIENT_DATA:` dekking van help-content per domein-sectie niet geverifieerd. Nabestaanden-flow heeft geen aantoonbaar help-kanaal of instructiedocument in-app. | `(authenticated)/layout.tsx` L22 (`HelpPanel`) | P2 |

---

## 2. Cognitive Load Analyse

### Onboarding Flow (7-staps wizard modal)

| Dimensie | Score (1-10) | Onderbouwing |
|---|---|---|
| Informatiedichtheid | 5 | Wizard toont 7 rijen met icoon, label, status, CTA — overzichtelijk maar dicht voor eerste bezoek |
| Beslissingspunten | 3 | Per scherm: 1 beslissing (stap uitvoeren of overslaan) — low friction |
| Visuele complexiteit | 4 | Card-layout, backdrop, icons → clean. Risico: individuele stap-pagina's (niet geïnspecteerd) |
| **Totale cognitive load** | **4** | HEURISTIC — acceptabel voor geïnformeerde gebruiker; HOOG RISICO bij stap 6 (Shamir) |

**Kritiek punt stap 6 (sleutels/Shamir):** Cognitive load op de stap-uitvoeringsscherm is `INSUFFICIENT_DATA` — maar domeinkennis + SYS-RISK-009 geven hoge risicoscore.

### Shamir Reconstructie Flow (Nabestaanden)

| Dimensie | Score | Onderbouwing |
|---|---|---|
| Informatiedichtheid | `INSUFFICIENT_DATA:` | ShamirDialog component niet direct geïnspecteerd |
| Beslissingspunten | `INSUFFICIENT_DATA:` | Aantal invoervelden / drempel-keuze niet geïnspecteerd |
| Emotionele context | **Kritiek** | Gebruiker in rouw; elk extra beslissingspunt vergroot risico op falen |

---

## 3. User Flow Optimalisatie

### Flow: Onboarding (wizard → stap → terug)

| Aspect | Huidig | Aanbevolen | Rationale |
|---|---|---|---|
| Terugkeerpad na stap-navigate | Geen expliciete terugkeerknop | Floating "Terug naar wizard" badge / sticky CTA op elke wizard-stap-pagina | Gebruiker weet niet altijd dat wizard beschikbaar blijft; `handleNavigate` sluit modal |
| Stap-volgorde (stap 4: uitvaart) | Stap 4 van 7 | Verplaats naar stap 5 of 6 | Conform REC-UX-003 — emotionele timing |
| Wizard activatie na close | Heropent bij elk app-herstart (tenzij dismiss "permanent") | `HEURISTIC:` OK — gecombineerd met session-dismiss logica al aanwezig | — |

### Flow: Masterpassword unlock → app

| Aspect | Huidig | Aanbevolen |
|---|---|---|
| Stappen naar primaire content | 1 (unlock) + automatisch redirect | ✓ Acceptabel |
| IdleWarningDialog timing | Aanwezig — secondsLeft zichtbaar | ✓ OK |

---

## 4. Information Architecture Analyse

| Aspect | Status | Bevinding |
|---|---|---|
| Navigatiestructuur | `INSUFFICIENT_DATA:` — Sidebar-items niet geïnspecteerd | Authentitated routes: 19 top-level pagina's — risico op overvolle navigatie |
| Labelling | Deels ✓ — NL labels voor 7 wizard-stappen | `INSUFFICIENT_DATA:` Sidebar-labels |
| Findability nabestaanden-modus | ⚠️ Probleem | Geen aantoonbaar prominente entry-point op unlock-scherm (FP-003) |
| Findability help | ✓ — HelpPanel aanwezig | `INSUFFICIENT_DATA:` content-dekking per sectie |
| Thematische organisatie | 19 routes zichtbaar | HEURISTIC: boedel, digitaal-bezit, documenten, donor, euthanasie, tijdlijn — zijde aan rijke IA |
| Diepe nesting | `INSUFFICIENT_DATA:` | — |

---

## 5. Design Debt Kwantificering

| Categorie | Omvang | Geschatte inspanning | Rationale |
|---|---|---|---|
| Design-token violations (224 ESLint) | 224 overtredingen | 8–16 SP (Fase 2 REC-DEV-002 SP-12–13) | Mechanische search-replace + verificatie per component |
| Missing terugkeerpath in wizard | 1 pattern | 1–2 SP | 1 component aanpassing + session-storage logica |
| Nabestaanden entry-point UX | 1 scherm | 2–4 SP | Unlock-scherm UI aanpassing + routing |
| Stap-volgorde wizard | 1 config-wijziging | 0,5 SP | Array-volgorde aanpassen + visuele retest |
| In-app nabestaanden instructiekaartje | Nieuw component | 2–4 SP | PDF-generatie of statisch scherm |

**Totale design debt:** 13,5–23,5 SP (`INSUFFICIENT_DATA:` op team-capaciteit)

---

## 6. Gaps & Risico's (UX Designer scope)

| ID | Omschrijving | Ernst |
|---|---|---|
| GAP-UXDESIGN-001 | Geen terugkeerpad in wizard na stap-navigate | Hoog |
| GAP-UXDESIGN-002 | Shamir-icoon (`KeyRound`) matcht mentale model gebruiker niet | Hoog |
| GAP-UXDESIGN-003 | Sidebar IA en afzonderlijke formulier UX niet geïnspecteerd | Midden |
| RISK-UXDESIGN-001 | 224 design-token violations → visuele inconsistentie raakt perceived quality en brand trust | Midden |

---

## HANDOFF CHECKLIST — UX Designer Analyse
- [x] Alle 10 heuristics beoordeeld (INSUFFICIENT_DATA correct gemarkeerd)
- [x] HEURISTIC-labels aanwezig op niet-empirisch onderbouwde claims
- [x] Cognitive load scores per flow
- [x] User flow optimalisatie per primaire flow
- [x] Information architecture analyse
- [x] Design debt gekwantificeerd
- [x] Alle bevindingen bronverwezen
- [x] STATUS: READY voor UX Designer Aanbevelingen
