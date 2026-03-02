# Sprint Gate — SP-UX-01: Accessibility & UX Kritieke Fixes

**Sprint ID:** SP-UX-01  
**Branch:** `feature/sp-ux-01-accessibility`  
**Status:** IN_PROGRESS  
**Datum start:** 2026-03-02  
**Velocity:** 7.5 SP  
**Bron:** `docs/synthesis/eindrapport-ux.md` (GAP-UX-01, 03, 04, 05, 06, 08 + RP-ACC-001..005)

---

## Definition of Ready (DoR)

- [x] Alle source files volledig gelezen voor aanpassing
- [x] i18n-sleutels geïnventariseerd (nl.json + en.json)
- [x] `@radix-ui` package-beschikbaarheid gecheckt (focus-scope niet aanwezig → custom impl)
- [x] Geen externe blockers
- [x] Lessons learned LL-001..LL-006 geïnjecteerd
- [x] Guardrails `docs/guardrails/06-implementation-guardrails.md` geladen
- [x] `docs/decisions.md` gecheckt op BESLOTEN constraints

---

## Geïnjecteerde Lessons Learned

| ID | Label | Impact op sprint |
|----|-------|-----------------|
| LL-001 | Geen `useEffect` voor derived state | UX-001: focus-trap cleanup correct in useEffect |
| LL-002 | i18n-sleutels altijd in beide talen | UX-002/006: nl.json + en.json simultaan |
| LL-003 | Radix-slot pattern bij wrappers | UX-004: Eye-button niet breken via slot |
| LL-004 | WCAG 1.3.1 + 4.1.2 vereisen role/aria | UX-003: progressbar role verplicht |
| LL-005 | Shamir-drempel is variabel | UX-002: geen hardcoded "2" in UI |
| LL-006 | Secret scan verplicht voor elke PR | PR: geen secrets in diffs |

---

## Stories

| Story | Titel | Prioriteit | SP | WCAG |
|-------|-------|------------|-----|------|
| UX-001 | Focus-trap OnboardingWizard | KRITIEK | 2 | 2.1.1, 2.1.2 |
| UX-002 | HeirUnlockForm proactieve drempel-instructie | KRITIEK | 1 | 3.3.1 |
| UX-003 | PasswordStrengthMeter ARIA progressbar | HOOG | 1 | 1.3.1, 4.1.2 |
| UX-004 | SetupForm show/hide wachtwoord | HOOG | 1 | 1.3.3 |
| UX-005 | Sidebar `aria-label` NL | HOOG | 0.5 | 2.4.6 |
| UX-006 | NabestaandenDashboard fase-secties markup | HOOG | 2 | 1.3.1, 2.4.1 |

---

## Acceptatiecriteria

### UX-001
- [ ] Tab toets verlaat de wizard NIET
- [ ] Shift+Tab werkt correct rond (circulair)
- [ ] Focus op eerste focusbaar element bij openen
- [ ] `role="dialog"` + `aria-modal="true"` aanwezig
- [ ] axe-playwright test: geen "scrollable-region-focusable" violation

### UX-002
- [ ] Instructie zichtbaar VÓÓR eerste submit-poging
- [ ] Geen hardcoded drempelgetal in de tekst (LL-005)
- [ ] i18n-sleutel `instructie` in nl.json + en.json

### UX-003
- [ ] Buitenste bar-container: `role="progressbar"` + `aria-valuenow` + `aria-valuemin=0` + `aria-valuemax=4` + `aria-label`
- [ ] Segmentdivs blijven visueel ongewijzigd

### UX-004
- [ ] Wachtwoord input: toggle Eye/EyeOff
- [ ] Bevestig input: toggle Eye/EyeOff
- [ ] Knoppen hebben `aria-label` + `type="button"`

### UX-005
- [ ] `aria-label="Completed"` vervangen door `aria-label="Voltooid"`

### UX-006
- [ ] Elke fase in `<section aria-labelledby="fase-heading-{fase}">`
- [ ] `<h2>` heeft `id="fase-heading-{fase}"`
- [ ] Visuele stijl ongewijzigd

---

## Sprint Review Criterium

Alle acceptatiecriteria groene CI + `axe-playwright` a11y-suite slaagt zonder nieuwe violations.
