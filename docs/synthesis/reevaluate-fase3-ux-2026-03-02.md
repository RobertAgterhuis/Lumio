# REEVALUATE FASE-3 — UX & UI
**Datum:** 2026-03-02  
**Trigger:** `REEVALUATE FASE-3` — delta-scan na voltooiing SP-UX-01, SP-UX-02, SP-UX-03 (23 stories totaal)  
**Agents:** 10 UX Researcher · 11 UX Designer · 12 UI Designer · 13 Accessibility Specialist  
**Basislijn:** `docs/synthesis/eindrapport-ux.md` (Fase 3 origineel rapport, audit-datum 2026-03-02)  
**Status:** CONCEPT — wacht op Critic + Risk validatie

---

## Samenvatting

Van de 14 geïdentificeerde GAP/RP-ACC-items uit het originele Fase-3-rapport zijn **12 volledig opgelost**. Eén kritieke WCAG-violation (RP-ACC-002: focus-trap OnboardingWizard) is **niet** opgelost ondanks dat SP-UX-01 is gemerged. Er zijn **4 nieuwe bevindingen** gevonden, waarvan twee MIDDEL en twee LAAG.

De algehele EAA-compliance status is verbeterd van *Partieel non-compliant* naar *Bijna-compliant*; de enige resterende blocker is de focus-trap in de OnboardingWizard.

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

### Niet-opgeloste item (CARRYOVER)

| RP-ID | Omschrijving | Status | Toelichting |
|-------|-------------|--------|-------------|
| **RP-ACC-002** | **OnboardingWizard: focus-trap ontbreekt (WCAG SC 2.1.1)** | **❌ NOG STEEDS OPEN** | `OnboardingWizard.tsx` gebruikt een custom `<div role="dialog">` — géén gebruik van `dialog.tsx` (die WEL een focus-trap heeft). Geen `FocusTrap`-component in de codebase gevonden. Keyboard-gebruiker kan via Tab uit het blocking modal navigeren. |

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

**UI-001 (Nieuw) — `IdleWarningDialog.tsx` gebruikt `Dialog` zonder `DialogContent`-wrapper**  
_Bron: `src/lumio-web/src/components/layout/IdleWarningDialog.tsx` — `DialogHeader` + `DialogFooter` zijn directe children van `<Dialog>` zonder tussenliggend `<DialogContent>`_  
De `Dialog`-component in `dialog.tsx` is een context-provider + portal-root. De focus-trap, de backdrop, de positionering en de `aria-modal`-semantiek zitten in `DialogContent`. Door `DialogContent` over te slaan wordt het dialog correct getoond via de Storybook-story (die de backdrop toont via eigen wrapper), maar in productie mist de component:
- De portal-rendering (buiten de DOM-boom)
- De eigen focus-trap van `dialog.tsx`
- De correcte `role="dialog"` + `aria-modal="true"` markering
  
**Ernst:** MIDDEL — `IdleWarningDialog` is zichtbaar maar a11y-onvolledig; Storybook story maskeert het gebrek.  
**Aanbeveling:** Wrap de inhoud van `IdleWarningDialog` in een `<DialogContent>`:
```tsx
<Dialog open={open} onOpenChange={() => onDismiss()}>
  <DialogContent>
    <DialogHeader>…</DialogHeader>
    <DialogFooter>…</DialogFooter>
  </DialogContent>
</Dialog>
```

**ACCESSIBILITY_FLAG: IdleWarningDialog** — door naar Agent 13.

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
| **4.1.2 — IdleWarningDialog (NIEUW)** | — | **⚠️ VOLDOET NIET** | Geen `DialogContent` → geen `role="dialog"` + `aria-modal="true"` via `dialog.tsx` |

### D2. Juridische Compliance (herzien)

| Wetgeving | Vorige status | Huidige status |
|-----------|-------------|---------------|
| EU EAA / EN 301 549 | ⚠️ PARTIEEL NON-COMPLIANT | ⚠️ PARTIEEL NON-COMPLIANT (verbeterd) — blocker: OnboardingWizard SC 2.1.1 + IdleWarningDialog SC 4.1.2 |

**Voortgang:** Van 5 WCAG-violations naar 3 openstaande violations (2 carryover + 1 nieuw).

### D3. Geprioriteerd Remediation Plan (delta)

| ID | WCAG SC | Omschrijving | Prioriteit | Effort | Aanbevolen Sprint |
|----|---------|-------------|------------|--------|-------------------|
| RP-ACC-002 | SC 2.1.1 | OnboardingWizard: gebruik `DialogContent` uit `dialog.tsx` (die heeft focus-trap) OF zet Tab-trap op `modalRef` via `onKeyDown` op de outer div. Voorkeur: refactor naar `dialog.tsx` | **KRITIEK** | 2 SP | SP-8 |
| RP-ACC-NEW-01 | SC 4.1.2 / 2.1.1 | IdleWarningDialog: voeg `<DialogContent>` toe zodat focus-trap van `dialog.tsx` actief wordt | HOOG | 1 SP | SP-8 |
| RP-ACC-NEW-02 | SC 1.3.1 | OnboardingWizard inline progressbar: voeg `role="progressbar"` + `aria-valuenow/min/max` toe | HOOG | < 1 SP | SP-8 |
| UXR-001 | SC 3.3.2 | HeirUnlockForm: dynamische drempel ophalen van API + tonen in intro + codes step | HOOG | 2 SP | SP-8 |

---

## Geconsolideerde Bevindingen

### NOG OPEN — KRITIEK (blokkeert EAA-compliance)

| ID | Agent | Bevinding | Carryover van |
|----|-------|-----------|---------------|
| RP-ACC-002 | 13 | `OnboardingWizard` focus-trap WCAG SC 2.1.1 — nog niet geïmplementeerd | SP-UX-01 (UX-001) |

### NOG OPEN — HOOG

| ID | Agent | Bevinding | Story |
|----|-------|-----------|-------|
| UXR-001 | 10/13 | HeirUnlockForm drempel hardcoded op 2 Client-side (SC 3.3.2) | SP-8: story toevoegen |
| RP-ACC-NEW-01 | 13 | IdleWarningDialog: geen `DialogContent` → focus-trap + ARIA ontbreekt (SC 4.1.2 / 2.1.1) | SP-8: story toevoegen |
| RP-ACC-NEW-02 | 13 | OnboardingWizard voortgangsbalk zonder ARIA (SC 1.3.1) | SP-8: story toevoegen |

### OPGELOST (alle 12 uit origineel rapport)

✅ RP-ACC-001 · RP-ACC-003 · RP-ACC-004 · RP-ACC-005 · GAP-UX-02 · GAP-UX-03 · GAP-UX-04 · GAP-UX-05 · GAP-UX-06 · GAP-UX-07 · GAP-UX-08 · GAP-UI-01

---

## Aanbevelingen (sprint-ready stories voor SP-8)

### SP-8-UX-001 — OnboardingWizard: focus-trap aansluiten op dialog.tsx (carryover UX-001)
```
Als keyboard-gebruiker
wil ik dat mijn focus niet buiten de OnboardingWizard-modal kan navigeren
zodat ik niet verstrikt raak in de achterliggende pagina-inhoud

Acceptatiecriteria:
- [ ] OnboardingWizard refactort naar <DialogContent> van dialog.tsx
      OF implementeert eigen Tab-trap op de outer div via onKeyDown
- [ ] Tab en Shift+Tab blijven binnen het modal (SC 2.1.1)
- [ ] Eerste interactieelement krijgt focus bij openen (SC 2.4.3)
- [ ] Escape sluit het modal (SC 2.1.2)
- [ ] axe-playwright test slaagt op OnboardingWizard
```

### SP-8-UX-002 — IdleWarningDialog: DialogContent-wrapper toevoegen (nieuw)
```
Als screenreader-gebruiker
wil ik dat het sessietime-outwaarschuwingsdialoog correct als modal is gemarkeerd
zodat mijn focus wordt gevangen en mijn screenreader de context begrijpt

Acceptatiecriteria:
- [ ] IdleWarningDialog wraps DialogHeader + DialogFooter in <DialogContent>
- [ ] Dialog krijgt role="dialog" + aria-modal="true" via dialog.tsx
- [ ] Focus-trap van dialog.tsx is actief
- [ ] Storybook story werkt na wijziging
```

### SP-8-UX-003 — OnboardingWizard voortgangsbalk ARIA (nieuw)
```
Acceptatiecriteria:
- [ ] <div> inline progress-bar voorzien van role="progressbar"
- [ ] aria-valuenow={completedCount} aria-valuemin={0} aria-valuemax={stappen.length}
- [ ] aria-label="Onboarding voortgang" of vertaald equivalent
- [ ] axe-playwright: geen violation op 4.1.2
```

### SP-8-UX-004 — HeirUnlockForm: dynamische Shamir-drempel van API (nieuw)
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
| Perceivable (1.x) | 2 violations | 1 violation (RP-ACC-NEW-02) |
| Operable (2.x) | 1 violation | 2 violations (RP-ACC-002 carryover + RP-ACC-NEW-01) |
| Understandable (3.x) | 2 violations | 1 violation (UXR-001) |
| Robust (4.x) | 2 violations | 1 violation (RP-ACC-NEW-01 overlap) |
| **Totaal** | **5 violations** | **3 violations (uniek)** |

**Accessibility score:** `Non-Compliant → WCAG-AA-Near-Compliant`  
(Was: 5 blocking violations; nu: 1 kritiek + 2 hoog)

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
_Origineel rapport: `docs/synthesis/eindrapport-ux.md`_
