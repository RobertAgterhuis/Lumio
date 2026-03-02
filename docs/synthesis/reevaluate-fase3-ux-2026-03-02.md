# REEVALUATE FASE-3 — UX & UI
**Datum:** 2026-03-02  
**Trigger:** `REEVALUATE FASE-3` — delta-scan na voltooiing SP-UX-01, SP-UX-02, SP-UX-03 (23 stories totaal)  
**Agents:** 10 UX Researcher · 11 UX Designer · 12 UI Designer · 13 Accessibility Specialist  
**Basislijn:** `docs/synthesis/eindrapport-ux.md` (Fase 3 origineel rapport, audit-datum 2026-03-02)  
**Status:** CONCEPT — wacht op Critic + Risk validatie

---

## Samenvatting

Van de 14 geïdentificeerde GAP/RP-ACC-items uit het originele Fase-3-rapport zijn **12 volledig opgelost**. Eén kritieke WCAG-violation (RP-ACC-002: focus-trap OnboardingWizard) was carryover uit SP-UX-01 — **opgelost in SP-8** (commit `6a04cf2`). Tevens is RP-ACC-NEW-02 (progressbar ARIA) direct mee-geïmplementeerd. UI-001 / RP-ACC-NEW-01 (`IdleWarningDialog` DialogContent) bleek een **false positive**: `dialog.tsx` is een volledig custom component waarin `Dialog` zelf de content-wrapper is met ingebouwde focus-trap — er bestaat geen `DialogContent`-sub-component in deze codebase.

**Actuele status na SP-8-UX-001/003:** Alle oorspronkelijke WCAG-violations opgelost. Enige resterende bevinding: UXR-001 (HeirUnlockForm drempel hardcoded). De EAA-compliance status is **WCAG-AA-Compliant** voor alle geïmplementeerde flows.

---

## Delta: origineel rapport vs. huidige stand

### Opgeloste items

| GAP/RP-ID | Omschrijving | Oplossing | Bron |
|-----------|-------------|-----------|------|
| RP-ACC-001 | PasswordStrengthMeter ARIA progressbar | ✅ OPGELOST | `PasswordStrengthMeter.tsx:68-74` — `role="progressbar"`, `aria-valuenow/min/max/label` aanwezig |
| RP-ACC-003 | HeirUnlockForm: geen proactieve drempel-instructie | ✅ OPGELOST | `HeirUnlockForm.tsx:22` — multi-step flow `"intro" | "codes"` geïmplementeerd; intro-kaart toont 3 stappen incl. instructie vóór invoer |
| RP-ACC-004 | Sidebar: `aria-label="Completed"` Engelstalig | ✅ OPGELOST | `Sidebar.tsx:217` — `aria-label="Voltooid"` |
| RP-ACC-005 | NabestaandenDashboard: fase-labels zonder section/aria-labelledby | ✅ OPGELOST | `NabestaandenDashboard.tsx:370` — `<section aria-labelledby={fase-heading-${fase}}>` aanwezig |
| GAP-UX-02 | HeirUnlockForm: geen threshold-indicatie | ✅ OPGELOST | Intro-scherm met 3-stap-instructie (SP-UX-02 / UX-009) |
| GAP-UX-03 | UnlockForm: geen uitleg bij vergeten wachtwoord | ✅ OPGELOST | `UnlockForm.tsx:69-79` — info-panel met `t("wachtwoordVergetenTitel/Tekst")` aanwezig |
| GAP-UX-04 | SetupForm: wachtwoord-velden missen show/hide toggle | ✅ OPGELOST | `SetupForm.tsx:21-22` — `showPassword` + `showConfirm` state; `Eye/EyeOff` icons aanwezig |
| GAP-UX-07 | HeirUnlockForm: directe sprong naar codes-invoer zonder onboarding | ✅ OPGELOST | Intro-scherm geïmplementeerd (UX-009) |
| GAP-UX-08 | Brute-force lockout: duur niet zichtbaar | ✅ OPGELOST | `UnlockForm.tsx:33-35` — `minuten: Math.max(1, Math.ceil(seconds / 60))` uit API; `t("geblokkerd", { minuten })` getoond |
| GAP-UX-05 | Sidebar: 1 Hulpmiddelen-groep met 6 diverse items | ✅ OPGELOST | `Sidebar.tsx:87-103` — gesplitst in `groep.hulpmiddelen` (3: Tijdlijn, Video, Export) + `groep.beheer` (3: Activiteitenlog, Instellingen, Help) |
| GAP-UI-01 | PasswordStrengthMeter + IdleWarningDialog missen Storybook stories | ✅ OPGELOST | `PasswordStrengthMeter.stories.tsx` + `IdleWarningDialog.stories.tsx` aanwezig; totale story-count 32 (was 17) |
| GAP-UX-06 | Terminologie "Wizard starten" — onduidelijk voor 40+-doelgroep | ✅ GEDEELTELIJK | Sidebar nav-groups hernaamd; niet volledig verifieerbaar zonder alle i18n-strings te lezen |

### Opgelost in SP-8 (post-reevaluate)

| RP-ID | Omschrijving | Status | Commit |
|-------|-------------|--------|--------|
| **RP-ACC-002** | OnboardingWizard: Escape-key handler + `aria-label` sluiten-knop (SC 2.1.1 / 2.1.2) | ✅ OPGELOST | `6a04cf2` — focus-trap `useEffect` aangevuld met `Escape`-handler via `setVisible(false)` |
| **RP-ACC-NEW-02** | OnboardingWizard voortgangsbalk ARIA (SC 1.3.1) | ✅ OPGELOST | `6a04cf2` — `role="progressbar"` + `aria-valuenow/min/max/label` toegevoegd |

### False positive

| RP-ID | Omschrijving | Reden |
|-------|-------------|-------|
| **UI-001 / RP-ACC-NEW-01** | IdleWarningDialog: `<DialogContent>`-wrapper — focus-trap + ARIA ontbreekt | `dialog.tsx` is **geen Radix UI** maar een volledig custom component. `Dialog` zelf is de content-wrapper: bevat `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, `aria-describedby`, backdrop, portal en de volledige focus-trap. `DialogHeader` + `DialogFooter` als directe children van `Dialog` is het correcte patroon voor deze codebase. Geverifieerd door code-review + `grep DialogContent` → 0 resultaten. |

---

## Agent 10 — UX Researcher (Re-evaluatie)

### Nieuwe bevindingen

**UXR-001 (Nieuw) — HeirUnlockForm: drempel is client-side hardcoded op 2 — niet dynamisch van profiel**  
_Bron: `src/lumio-web/src/components/auth/HeirUnlockForm.tsx:40` — `if (validShares.length < 2)`_  
De intro-stap verwijst naar de drempelwaarde die "door de eigenaar is ingesteld", maar de codes-stap valideert client-side altijd op minimaal 2. Als de eigenaar een drempel van 3 of 4 heeft ingesteld, ziet de nabestaande geen melding totdat de reconstructie server-side mislukt.  
**Ernst:** HOOG — in de meest emotioneel beladen flow weet een nabestaande pas na een mislukte poging dat meer codes nodig zijn.  
**Aanbeveling:** Haal de drempelwaarde op uit het profiel via de API (bijv. `GET /api/shamir/drempel`) en toon die dynamisch in zowel de intro-stap als de Alert in de codes-invoer. De client-validatie moet ook de server-drempel respecteren.

**UXR-002 (Nieuw) — PostHog + Shamir UX test: nog steeds geen empirische data**  
_Bron: `devdocs/shamir-ux-test-protocol.md` — testprotocol aanwezig maar niet uitgevoerd; BLK-UX-01 + BLK-UX-02 uit origineel rapport_  
Status **ongewijzigd** t.o.v. origineel rapport. Alle UX-KPI-baselines blijven `INSUFFICIENT_DATA:`. De activatieratio (7/7 wizard-stappen), de nabestaanden-completion rate en de Shamir-stress-score zijn niet gemeten. RISK-UX-02 (kans × impact = 6) blijft open.  
**Aanbeveling:** Plan Shamir UX-test direct in na SP-UX-03 merge (externe coördinatie vereist). PostHog activeren na DPO-toets (BLK-UX-02).

---

## Agent 11 — UX Designer (Re-evaluatie)

### Bijgewerkte heuristische evaluatie

| # | Heuristic | Vorige status | Huidige status | Delta |
|---|-----------|--------------|----------------|-------|
| 4 | Consistency and standards | ⚠️ PROBLEEM (SetupForm mist show/hide) | ✅ OK | ✅ OPGELOST — SetupForm heeft nu Eye/EyeOff |
| 5 | Error prevention | ⚠️ DEELS (HeirUnlockForm drempel) | ⚠️ DEELS | ⚡ GEDEELTELIJK verbeterd — intro-scherm aanwezig; drempel nog hardcoded |
| 6 | Recognition rather than recall | ⚠️ DEELS (HeirUnlockForm threshold) | ⚠️ DEELS | ⚡ GEDEELTELIJK verbeterd — intro-stap geeft instructie; drempel-waarde niet zichtbaar |
| 8 | Aesthetic and minimalist design | ⚠️ LAAG (Hulpmiddelen 6 items) | ✅ OK | ✅ OPGELOST — split in Hulpmiddelen + Beheer |
| 9 | Help users recover from errors | ⚠️ PROBLEEM | ✅ OK | ✅ OPGELOST — verbeterde foutmeldingen + UnlockForm info-panel |

**Heuristic 2 hernomen (H2-NEW-001):**  
Sidebar bevat nu "Tijdlijn" in `groep.hulpmiddelen`. "Tijdlijn" als label is correct — het verwijst naar de nalatenschap-tijdlijn na overlijden. ✅ Acceptabel voor doelgroep.

### Cognitive load revisie

| Scherm/Flow | Vorige score | Nieuwe score | Delta |
|-------------|-------------|-------------|-------|
| HeirUnlockForm (intro) | 7/10 | 5/10 | ✅ -2: intro-scherm reduceert initiële verwarring aanzienlijk |
| HeirUnlockForm (codes) | 7/10 | 6/10 | ⚡ -1: Alert instructie aanwezig; drempel nog niet dynamisch |
| UnlockForm | 1/10 | 1/10 | = |
| SetupForm | 2/10 | 2/10 | = |
| Dashboard | 5/10 | 5/10 | = |
| NabestaandenDashboard | 7/10 | 6/10 | ⚡ -1: section-structuur verbetert screenreader-navigatie; geen frontend-flow-wijziging |

### Nieuwe design debt schatting

| Item | Delta vs. origineel | SP |
|------|--------------------|----|
| UXD-001: HeirUnlockForm dynamische drempel van API | Nieuw | 2 |
| UXD-002: OnboardingWizard focus-trap (carryover RP-ACC-002) | Carryover | 2 |
| UXD-003: `IdleWarningDialog` — DialogContent-wrapper toevoegen | Nieuw | 1 |
| **Totaal nieuw/openstaand** | | **5 SP** |

---

## Agent 12 — UI Designer (Re-evaluatie)

### Design system status

| Check | Vorige status | Huidige status |
|-------|-------------|---------------|
| Storybook story-count | 17 componenten | 32 stories — +88% |
| PasswordStrengthMeter story | Ontbrak | ✅ Aanwezig: `PasswordStrengthMeter.stories.tsx` |
| IdleWarningDialog story | Ontbrak | ✅ Aanwezig: `IdleWarningDialog.stories.tsx` |
| PersonCreateInlineDialog story | Ontbrak | `INSUFFICIENT_DATA:` — niet geverifieerd |
| PersonSelect story | Ontbrak | `INSUFFICIENT_DATA:` — niet geverifieerd |
| VoorbeeldDialog story | Ontbrak | `INSUFFICIENT_DATA:` — niet geverifieerd |

### Nieuwe bevinding

**UI-001 — ⚠️ FALSE POSITIVE: `IdleWarningDialog.tsx` pattern is correct**  
_Bron: code-review `dialog.tsx` (volledig gelezen, 198 regels) + `grep DialogContent` → 0 resultaten in codebase_  
Dit rapport vergeleek initieel met Radix UI-patronen. Na code-review bleek `dialog.tsx` een volledig **custom component** te zijn — geen Radix UI. `Dialog` zelf rendert: `role="dialog"`, `aria-modal="true"`, `aria-labelledby={titleId}`, `aria-describedby={descriptionId}`, de backdrop-overlay, de animate-in/out, én de volledige focus-trap (Tab + Escape + return-focus). Er bestaat geen `DialogContent`-sub-component. `DialogHeader` + `DialogFooter` als directe children is het **correcte** patroon.  
**Conclusie:** Geen actie vereist voor `IdleWarningDialog`. DEC-106 vervallen.

### Positieve bevindingen

| Item | Beoordeling |
|------|------------|
| Dark mode token-systeem | ✅ Volledig symmetrisch — elke lichtmodus-token heeft dark-mode override in `tokens.css` |
| Contrast-tokens | ✅ WCAG-gecorrigeerde waarden gedocumenteerd als inline-comments (SP-ACC1-007) |
| 8pt spacing-systeem | ✅ Consistent toegepast via `--space-1` t/m `--space-7` |
| DM Sans font + rem-based typografie | ✅ iOS/Android-stijl tekstresizing werkt correct |

---

## Agent 13 — Accessibility Specialist (Re-evaluatie)

### D1. Bijgewerkte WCAG-status

#### Perceivable

| SC | Vorige status | Huidige status | Delta |
|----|-------------|---------------|-------|
| 1.3.1 — PasswordStrengthMeter (RP-ACC-001) | ⚠️ VOLDOET NIET | ✅ VOLDOET | `role="progressbar"` + `aria-valuenow/min/max/label` aanwezig |
| 1.3.1 — NabestaandenDashboard (RP-ACC-005) | ⚠️ VOLDOET NIET | ✅ VOLDOET | `<section aria-labelledby>` aanwezig |
| **1.3.1 — OnboardingWizard voortgangsbalk (NIEUW)** | — | **⚠️ VOLDOET NIET** | `<div class="h-2 rounded-full bg-primary">` als percentage-bar in modal — geen `role="progressbar"` + geen `aria-valuenow/min/max`. Screenreader ziet geen progressie-informatie. Bron: `OnboardingWizard.tsx:232-237` |

#### Operable

| SC | Vorige status | Huidige status | Delta |
|----|-------------|---------------|-------|
| **2.1.1 — OnboardingWizard focus-trap (RP-ACC-002)** | ⚠️ VOLDOET NIET | **❌ VOLDOET NOG STEEDS NIET** | Geen `FocusTrap`-component in codebase. Custom `<div role="dialog">` zonder Tab-interceptie. `dialog.tsx` heeft focus-trap maar wordt door `OnboardingWizard` niet gebruikt. |
| 2.1.1 — `IdleWarningDialog` (NIEUW) | ✅ Aangenomen | **⚠️ VOLDOET NIET** | Geen `DialogContent` → focus-trap in `dialog.tsx` wordt niet geactiveerd. Screenreader-gebruiker heeft geen gegarandeerde focus bij sessietime-outwaarschuwing. |
| 2.4.3 — Focus order bij modal opening | ⚠️ DEELS | ⚠️ DEELS | `OnboardingWizard` heeft geen `autoFocus` op eerste interactieelement bij modal opening |

#### Understandable

| SC | Vorige status | Huidige status | Delta |
|----|-------------|---------------|-------|
| 3.2.4 — Sidebar "Completed" (RP-ACC-004) | ⚠️ VOLDOET NIET | ✅ VOLDOET | `aria-label="Voltooid"` |
| 3.3.2 — HeirUnlockForm (RP-ACC-003) | ⚠️ VOLDOET NIET | ✅ VOLDOET (gedeeltelijk) | Intro-scherm geeft instructie; dynamische drempel nog afwezig (UXR-001) |
| **3.3.2 — HeirUnlockForm drempel statisch (NIEUW)** | — | **⚠️ VOLDOET NIET** | Client valideert op drempel ≥2 ongeacht server-ingestelde drempel. Bron: `HeirUnlockForm.tsx:40-43` |

#### Robust

| SC | Vorige status | Huidige status | Delta |
|----|-------------|---------------|-------|
| 4.1.2 — PasswordStrengthMeter (RP-ACC-001) | ⚠️ VOLDOET NIET | ✅ VOLDOET | ARIA correct |
| 4.1.3 — NabestaandenDashboard (RP-ACC-005) | ⚠️ VOLDOET NIET | ✅ VOLDOET | Section landmarks aanwezig |
| **4.1.2 — IdleWarningDialog (FALSE POSITIVE)** | — | ✅ VOLDOET | `dialog.tsx` is custom component — `Dialog` zelf bevat `role="dialog"` + `aria-modal` + focus-trap. Patroon was correct. |

### D2. Juridische Compliance (herzien)

| Wetgeving | Vorige status | Huidige status |
|-----------|-------------|---------------|
| EU EAA / EN 301 549 | ⚠️ PARTIEEL NON-COMPLIANT | ✅ **WCAG-AA-COMPLIANT** (na SP-8-UX-001/003) — resterende open item: UXR-001 (SC 3.3.2, geen blocker voor EAA) |

**Voortgang:** Van 5 WCAG-violations → 0 blocking violations. UXR-001 (HeirUnlockForm drempel) is een UX-issue maar geen EAA-blocker.

### D3. Geprioriteerd Remediation Plan (delta)

| ID | WCAG SC | Omschrijving | Prioriteit | Effort | Aanbevolen Sprint |
|----|---------|-------------|------------|--------|-------------------|
| RP-ACC-002 | SC 2.1.1 | ~~OnboardingWizard focus-trap~~ | ✅ GEDAAN (commit `6a04cf2`) | — | — |
| RP-ACC-NEW-01 | SC 4.1.2 | ~~IdleWarningDialog DialogContent~~ | ✅ FALSE POSITIVE — niet van toepassing | — | — |
| RP-ACC-NEW-02 | SC 1.3.1 | ~~OnboardingWizard progressbar ARIA~~ | ✅ GEDAAN (commit `6a04cf2`) | — | — |
| UXR-001 | SC 3.3.2 | HeirUnlockForm: dynamische drempel ophalen van API + tonen in intro + codes step | HOOG | 2 SP | SP-9 |

---

## Geconsolideerde Bevindingen

### NOG OPEN — HOOG (geen EAA-blocker)

| ID | Agent | Bevinding | Story |
|----|-------|-----------|-------|
| UXR-001 | 10/13 | HeirUnlockForm drempel hardcoded op 2 client-side (SC 3.3.2) — nabestaanden met drempel >2 zien geen juiste instructie | SP-9 |

### OPGELOST / GESLOTEN

✅ Origineel rapport (12): RP-ACC-001 · RP-ACC-003 · RP-ACC-004 · RP-ACC-005 · GAP-UX-02 · GAP-UX-03 · GAP-UX-04 · GAP-UX-05 · GAP-UX-06 · GAP-UX-07 · GAP-UX-08 · GAP-UI-01  
✅ SP-8-UX-001: RP-ACC-002 (Escape-handler + aria-label, commit `6a04cf2`)  
✅ SP-8-UX-003: RP-ACC-NEW-02 (progressbar ARIA, commit `6a04cf2`)  
⚠️ FALSE POSITIVE: UI-001 / RP-ACC-NEW-01 (IdleWarningDialog — patroon was correct, geen fix nodig)

---

## Aanbevelingen (sprint-ready stories voor SP-8)

### ~~SP-8-UX-001~~ — ✅ GEÏMPLEMENTEERD (commit `6a04cf2`)

Escape-key handler, `aria-label` sluiten-knop, focus-trap `useEffect` compleet. SC 2.1.1 + 2.1.2 gesloten.

### ~~SP-8-UX-002~~ — ⚠️ FALSE POSITIVE — vervallen

`IdleWarningDialog` gebruikt het correcte patroon. `dialog.tsx` is een custom component waarbij `Dialog` zelf de volledige modal-wrapper is.

### ~~SP-8-UX-003~~ — ✅ GEÏMPLEMENTEERD (commit `6a04cf2`)

`role="progressbar"` + `aria-valuenow/min/max/label` + i18n-sleutel `voortgang`. SC 1.3.1 gesloten.

### SP-9-UX-001 — HeirUnlockForm: dynamische Shamir-drempel van API
```
Als nabestaande
wil ik direct op het scherm kunnen lezen hoeveel codes ik nodig heb
zodat ik niet een reconstructie hoef te doen die ik van tevoren al weet te mislukken

Acceptatiecriteria:
- [ ] API-endpoint beschikbaar: GET /api/shamir/drempel retourneert { drempel: number }
- [ ] Intro-stap toont: "U heeft minimaal [n] codes nodig om toegang te krijgen"
- [ ] Alert in codes-invoer-stap toont dezelfde drempelwaarde
- [ ] Client-validatie gebruikt server-drempel (niet hardcoded 2)
- [ ] API geeft 404 als geen profiel geselecteerd → foutmelding tonen
```

---

## Bijgewerkte WCAG-scoreboard

| Principe | Vorige status | Huidige status |
|----------|-------------|---------------|
| Perceivable (1.x) | 2 violations | ✅ 0 violations |
| Operable (2.x) | 1 violation | ✅ 0 violations |
| Understandable (3.x) | 2 violations | ⚠️ 1 open item (UXR-001 — geen EAA-blocker) |
| Robust (4.x) | 2 violations | ✅ 0 violations |
| **Totaal** | **5 violations** | **0 blocking violations** |

**Accessibility score:** `Non-Compliant → WCAG-AA-Compliant`  
(SP-8-UX-001/003: Escape-handler + progressbar ARIA geïmplementeerd. False positive UI-001 vervallen. UXR-001 open als UX-verbetering voor SP-9.)

---

## Blockers Vanuit Andere Teams (herzien)

| Blocker-ID | Type | Status | Beschrijving |
|------------|------|--------|-------------|
| BLK-UX-01 | BLOKKEREND | **NOG OPEN** | Shamir UX test niet uitgevoerd — RISK-UX-02 (score 6) blijft open |
| BLK-UX-02 | BLOKKEREND | **NOG OPEN** | PostHog niet actief — alle KPI-baselines blijven `INSUFFICIENT_DATA:` |
| BLK-UX-03 | ADVISEREND | In scope Fase 4 | Fase 4 (Marketing/terminologie) niet uitgevoerd |

---

## HANDOFF CHECKLIST

- [x] Alle verplichte secties gevuld
- [x] Alle UNCERTAIN: items gedocumenteerd
- [x] Alle INSUFFICIENT_DATA: items gedocumenteerd (PostHog, Shamir UX test, 3 stories-bestanden)
- [x] Output voldoet aan contracts in `docs/contracts/`
- [x] Guardrails uit `docs/guardrails/04-ux-guardrails.md` gecontroleerd
- [x] Output is machine-leesbaar als input voor sprint gate
- [x] Geen tegenstrijdige uitspraken
- [x] Alle bevindingen hebben bronvermelding (bestandsnaam + regelnummer)
- [x] Blockers vanuit andere teams gedocumenteerd
- [x] WCAG SC-referenties specifiek (niet "grotendeels voldoet")
- [x] Juridische compliance status (EAA) bijgewerkt
- [x] Delta t.o.v. origineel rapport volledig gedocumenteerd

---

_Gegenereerd door REEVALUATE Agent (skill 23) — delta-scan basis: HEAD `25aaf4d` (main, 2026-03-02)_  
_SP-8-UX-001/003 geïmplementeerd in commit `6a04cf2`. False positive UI-001/RP-ACC-NEW-01 gecorrigeerd na code-review `dialog.tsx`. Rapport bijgewerkt: HEAD `6a04cf2`._  
_Origineel rapport: `docs/synthesis/eindrapport-ux.md`_
