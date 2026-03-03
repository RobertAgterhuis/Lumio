# Sprint Retrospective — SP-UX-02: Onboarding Optimalisatie & Nabestaanden Tooling

**Sprint ID:** SP-UX-02  
**Datum:** 2026-03-03  
**PR:** [#127](https://github.com/RobertAgterhuis/Lumio/pull/127) — open  
**Agent:** Sprint Retrospective Agent (skill 28)

---

## Sprint Samenvatting

| KPI | Waarde |
|-----|--------|
| Code stories gepland | 4 |
| Code stories geland | 4 (100%) |
| Analysis stories gepland | 3 |
| Analysis stories geland | 0 (niet-code, open) |
| Backend tests | 409 passed, 0 failed |
| Frontend tests | 354 passed, 0 failed (49 files) |
| TypeScript typecheck | PASSED |
| Issues gesloten | #120, #121, #122, #125 |
| Issues open (analysis) | #123, #124, #126 |

---

## Wat ging goed ✅

1. **Alle 4 code stories 100% geland** — wizard volgorde, QuestPDF-export, Storybook stories en a11y heading-fix zijn compleet en gecommit in afzonderlijke commits met duidelijke scope.

2. **QuestPDF-infrastructuur moeiteloos uitbreidbaar** — `NabestaandenInstructieGenerator` sloot naadloos aan op het bestaande patroon (IPdfPageGenerator, DI, resx, endpoint). Geen rework van bestaande code vereist.

3. **Testbaarheid onboarding wizard** — Door `stappen` en `OnboardingStap` te exporteren uit `OnboardingWizard.tsx` is de stapvolgorde unit-testbaar geworden. 6 gerichte tests voorkomen regressie bij toekomstige volgordwijzigingen.

4. **Storybook stories verhogen componentdekking** — `ShamirDialog` en `HeirUnlockForm` waren toegankelijkheid- en visueel-ongedekte componenten. Stories met play-functions documenteren het volledige interactieprofiel en zijn direct bruikbaar als basis voor Chromatic-snapshots.

5. **heading-order a11y-regel nu als systeem-gate** — De `heading-order` rule is expliciet toegevoegd aan Storybook's axe-config; toekomstige heading-fouten worden vroeg gevangen in CI.

---

## Leerpunten 🔁

1. **LESSON_CANDIDATE: Exporteer logica-state uit React-components voor testbaarheid**  
   De `stappen`-array in `OnboardingWizard.tsx` was private — niet testbaar. Door `export const stappen` en `export interface OnboardingStap` toe te voegen is de volgorde direct unit-testbaar.  
   **Actie:** Bij complexe volgorde-logica (wizard steps, route guards, state machines) altijd de data-laag exporteren, gescheiden van de presentatie-laag.

2. **LESSON_CANDIDATE: Heading-hiërarchie mist in bijna elke nieuwe pagina**  
   De heading-audit (SP-UX-02-006) vond systematische h1→h3 skips op minimaal 8 ongeauditeerde pagina's buiten scope. Elke sprint introduceert nieuwe componenten die card-headings als `<h3>` implementeren terwijl de pagina-h1 ontbreekt of `<h2>` wordt overgeslagen.  
   **Actie:** Voeg een heading-lint rule toe aan de ESLint configuratie (bijv. `jsx-a11y/heading-has-content` + custom rule of `eslint-plugin-jsx-a11y`). Escalatie naar SP-UX-03: resterende 8+ pagina's auditen en fixen.

3. **LESSON_CANDIDATE: downloadZip-sleutel ontbrak in NL/EN messages**  
   `NabestaandenDashboard.tsx` gebruikte `t("downloadZip")` terwijl de sleutel niet in nl.json/en.json stond — de component viel terug op de rauwe key-string als displaytekst. Niet opgemerkt door TypeScript (next-intl types zijn niet strikt in alle versies).  
   **Actie:** Na het toevoegen van `t()`-calls altijd checken of de sleutel bestaat in beide locale-bestanden. Overweeg `next-intl` strict typing te activeren via `IntlMessages` augmentatie in `global.d.ts`.

4. **LESSON_CANDIDATE: Analysis stories blokkeren sprint-sluiting niet**  
   SP-UX-02-004/005/007 zijn analysis-only stories zonder code deliverable. Ze blijven open na code-complete.  
   **Actie:** Label analysis-stories bij aanmaak als `type:analysis` zodat de sprint-gate ze automatisch kan uitsluiten van de completion-check.

---

## Technische schuld (nieuw gesignaleerd)

| Item | Prioriteit | Bron |
|------|------------|------|
| Heading-hiërarchie resterende 8+ pagina's (sidebar h1, videoboodschappen etc.) | Hoog | SP-UX-02-006 audit |
| `next-intl` strict typing via `IntlMessages` augmentatie | Middel | LESSON SP-UX-02 |
| Videoboodschappen caption-support (analyse nog niet gedaan) | Middel | SP-UX-02-004 open |
| NVDA/VoiceOver screen reader test (niet uitgevoerd) | Hoog | SP-UX-02-005 open |

---

## Beslissingen vastgelegd

- **DEC-SP-UX-02-001:** `stappen`-array en `OnboardingStap`-interface zijn public API van `OnboardingWizard.tsx`; volgorde-aanpassingen vereisen update van bijbehorende unit-tests.
- **DEC-SP-UX-02-002:** Nabestaanden-instructiekaartje bevat bewust geen BSN of medische gegevens (AVG constraint blijft gelden voor alle toekomstige uitbreidingen van dit PDF).
- **DEC-SP-UX-02-003:** Analysis stories (004, 005, 007) blijven open; worden meegenomen naar SP-UX-03 als input voor prioritering.

---

## Status bij afsluiting

- Branch `feature/SP-UX-02-onboarding-optimalisatie-nabestaanden` — PR [#127](https://github.com/RobertAgterhuis/Lumio/pull/127) open
- Issues #120, #121, #122, #125 gesloten
- Issues #123, #124, #126 open (ANALYSIS — geen code)
- Test gate: 409 backend + 354 frontend = 763 tests, 0 failures
- `docs/metrics/sprint-SP-UX-02-kpi.json` aangemaakt
- `docs/metrics/velocity-log.json` bijgewerkt
- Gebruikershandleiding bijgewerkt (NL + EN: 01-aan-de-slag, 14-nabestaanden)
- Technische handleiding bijgewerkt (NL + EN: 02-backend-api)
- `session-state.json` → `SPRINT_COMPLETE_SP-UX-02` (na merge)

---

## HANDOFF CHECKLIST

- [x] Alle secties gevuld
- [x] Leerpunten gedocumenteerd met LESSON_CANDIDATE
- [x] Beslissingen vastgelegd
- [x] KPI-rapport aanwezig (`sprint-SP-UX-02-kpi.json`)
- [x] Velocity-log bijgewerkt
- [x] Documentatie bijgewerkt (NL + EN user manual, NL + EN technical manual)
- [x] Geen open UNCERTAIN: of INSUFFICIENT_DATA: items zonder resolutie
- [x] Output klaar als input voor volgende sprint / Orchestrator
