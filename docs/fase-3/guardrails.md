# Guardrails – Fase 3 (UX & Product) – 2026-03-02
> Bindende UX guardrails voor implementation agents en designers

## Metadata
- Fase: 3 — UX & Product Experience
- Datum: 2026-03-02

---

## G-UX-101: SYS-RISK-009 Blocker — Shamir flow niet live zonder usability validatie

**Formulering:** Mag niet — geen nieuwe Shamir-reconstructie flow (nabestaanden-modus) worden uitgerold of gewijzigd zonder aantoonbaar usabilityresultaat van ≥4/5 testdeelnemers conform testprotocol.

**Scope:** Alle code-wijzigingen in nabestaanden-gerelateerde componenten en Shamir-wizard.

**Bron:** SYS-RISK-009; GAP-UX-002; `devdocs/shamir-ux-test-protocol.md`

**Schending-actie:** PR wordt geblokkeerd door review-gate; reviewer escaleert naar product owner en UX Researcher voor uitvoering test.

**Verificatiemethode:** PR-checklist: "Is SP-UX-01-001 (Shamir UX-test) afgerond? → Koppel testresultaat-document." Handmatige check bij code review.

**Overlap check:** Aanvulling op `docs/guardrails/04-ux-guardrails.md` (G-UX-05); nieuw voor SYS-RISK-009-specifieke eis.

---

## G-UX-102: aria-live verplicht bij alle statusberichten

**Formulering:** Moet altijd — toastberichten, error-banners en status-meldingcontainers hebben `aria-live="polite"` (succes/info) of `aria-live="assertive"` (fout/kritiek).

**Scope:** Alle nieuwe en gewijzigde UI-componenten die dynamische status tonen.

**Bron:** REC-A11Y-002; SC 4.1.3; A11Y-GAP-001.

**Schending-actie:** Axe-core CI (SP-UX-01-006) faalt — PR geblokkeerd tot aria-live toegevoegd.

**Verificatiemethode:** Geautomatiseerd via axe-core CI gate (SP-UX-01-006). Zero SC-4.1.3-violations vereist.

**Overlap check:** Nieuw — niet gedekt in bestaande guardrails.

---

## G-UX-103: Decoratieve iconen vereisen aria-hidden

**Formulering:** Moet altijd — Lucide React-iconen en andere decoratieve SVG-elementen naast zichtbare tekst-labels hebben `aria-hidden="true"`; informatieve iconen zonder tekst-label hebben `aria-label`.

**Scope:** Alle TSX-componenten die Lucide of custom SVG icons renderen.

**Bron:** REC-A11Y-003; SC 1.1.1.

**Schending-actie:** Code review blokt PR; axe SC-1.1.1-violation detecteerbaar in CI.

**Verificatiemethode:** Axe-core CI gate + code review checklist: "Icons: aria-hidden of aria-label aanwezig?"

**Overlap check:** Aanvulling op `docs/guardrails/04-ux-guardrails.md`.

---

## G-UX-104: OnboardingWizard voortgang gemeten via PostHog events

**Formulering:** Mag niet — wizardstap volledig als genavigeerd zonder `lumio_partial_activation` event te firen per stap (na SP-UX-01-005 implementatie).

**Scope:** `OnboardingWizard.tsx` en toekomstige wizard-componenten.

**Bron:** REC-UX-004; GAP-UX-003.

**Schending-actie:** Zie CI-linting of handmatige codereview; PostHog funnel-rapport bevestigt dekking op ≥7 steps.

**Verificatiemethode:** Handmatig: controleer in PostHog na elke deployment dat funnel per stap zichtbaar is; structurele verificatie via unit-test op `posthog.capture` calls.

**Overlap check:** Aanvullend — niet gedekt in bestaande guardrails.

---

## G-UX-105: Nieuwe UX-flows vereisen Storybook-story voor merge

**Formulering:** Mag niet — een nieuw scherm of primaire interactie-component (wizard, dialog, onboarding-sectie) mergen zonder bijbehorende Storybook-story met ≥1 `@storybook/addon-a11y` PASSED-variant.

**Scope:** Alle nieuwe componenten in `src/components/` die een volledige gebruikersinteractie uitbeelden.

**Bron:** GAP-UIDESIGN-002; GAP-UIDESIGN-004; REC-UIDESIGN-002.

**Schending-actie:** PR-reviewer blokkeert merge — voegt label `missing-storybook-story` toe; story verplicht vóór approval.

**Verificatiemethode:** Code review checklist: "Story aanwezig in Storybook? a11y-addon PASSED?" Handmatige controle.

**Overlap check:** Aanvulling op `docs/guardrails/04-ux-guardrails.md` (G-UX-01 design system coverage).

---

## G-UX-106: Axe-core CI gate verplicht voor lumio-web

**Formulering:** Moet altijd — CI-pipeline faalt bij ≥1 critical of serious axe-core violation in `src/lumio-web/` Playwright-tests na SP-UX-01-006 implementatie.

**Scope:** Alle PRs naar main branch voor `src/lumio-web/`.

**Bron:** GAP-A11Y-001; REC-A11Y-001.

**Schending-actie:** CI failt automatisch — PR-merge geblokkeerd totdat violations opgelost zijn.

**Verificatiemethode:** Geautomatiseerd via CI-job (axe-playwright). Zero false-negatives via strikte `.withTags(["wcag2a", "wcag2aa", "wcag21aa"])` scope.

**Overlap check:** Aanvulling op `docs/guardrails/06-implementation-guardrails.md` — specifiek UX/a11y domein.

---

## HANDOFF CHECKLIST — Guardrails Fase 3
- [x] 6 guardrails geformuleerd (G-UX-101 t/m G-UX-106)
- [x] Elke guardrail heeft schending-actie
- [x] Elke guardrail heeft verificatiemethode
- [x] Elke guardrail verwijst naar GAP/RISK of SC-referentie
- [x] Overlap met bestaande guardrails (`04-ux-guardrails.md`) gecontroleerd
- [x] Geautomatiseerde verificatie waar mogelijk (axe-CI gates)
