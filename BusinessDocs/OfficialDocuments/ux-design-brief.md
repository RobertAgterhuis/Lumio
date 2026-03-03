# UX Design Brief — Lumio
**Document type:** Official Document — Phase 3 output  
**Version:** v1.1
**Completeness:** 65% (was 60% — design tokens resolved)
**Date:** 2026-07-14  
**Owner:** UX Lead  
**Source:** `BusinessDocs/Phase3-UX/phase3-analysis.md`  
**Status:** DRAFT — open items blocked on Q-UX-UI-001 (design tokens), Q-UX-R-001/002 (user research)

> **IMPORTANT:** Sections marked `INSUFFICIENT_DATA:` are incomplete pending questionnaire answers.  
> This document must reach 80% completeness before Sprint 1 UX stories are accepted into a sprint.

---

## 1. Product & Context

**Product:** Lumio — digital legacy management desktop application  
**Platform:** Windows x64 self-contained desktop app (Electron 40 + Next.js 16 / React 19 static export)  
**Primary market:** Netherlands (NL-Dutch)  
**Core proposition:** Secure, offline, encrypted management of end-of-life documentation (testament, donor preferences, euthanasie wishes, estate overview, heir access)

**Emotional context:** High — product deals with mortality, bereavement, and sensitive healthcare decisions. UX must be calm, trustworthy, and clear. No gamification, no urgency patterns, no dark patterns permitted.

---

## 2. User Segments

### Segment A — Eigenaar (Primary)
- Profile: Adults 35–70, managing their digital estate
- Technical proficiency: Moderate
- Emotional context: Personal mortality planning; high stakes
- Language: Dutch (primary)
- Device: Windows desktop/laptop
- `INSUFFICIENT_DATA:` No validated personas — heuristic proto-persona only (Marie, 58)

### Segment B — Erfgenaam (Heir)
- Profile: Adult family member accessing post-bereavement
- Technical proficiency: Low to moderate
- Emotional context: Grief — critical access task under emotional stress
- Usage pattern: Rare / one-time
- Critical: Must succeed on first attempt (irreversible failure risk — RISK-UX-001)
- Source: `devdocs/shamir-ux-test-protocol.md`

### Segment C — Werkgever / B2B (Secondary)
- `INSUFFICIENT_DATA:` No B2B user journey defined

---

## 3. Design Principles

The following principles are derived from Phase 3 analysis findings and must govern all new UX/UI work:

| # | Principle | Rationale |
|---|-----------|-----------|
| 1 | **Calm clarity** | Target users handle emotionally difficult content — no visual noise, no urgency patterns |
| 2 | **Formal respect** | Use formal Dutch ("u/uw") consistently — source: nl.json voice & tone audit |
| 3 | **Progressive disclosure** | Complex flows (Shamir, testament) must be staged; max 3 steps for critical paths (G-UX-02) |
| 4 | **Recovery over prevention** | With encryption-only access, users must understand consequences of forgotten passwords without panic |
| 5 | **Accessibility first** | WCAG 2.1 AA is a non-negotiable minimum; EAA compliance required (post June 2025) |
| 6 | **Consistent system** | Design system (Storybook) must be the single source of truth; no one-off components in sprints |

---

## 4. Information Architecture

**Primary navigation:** 18 sidebar modules  
Current module list (alphabetical): audit-log, boedel, dashboard, digitaal-bezit, documenten, donor, eigenaar, erfgenamen, euthanasie, export, help, instellingen, noodcontacten, testament, tijdlijn, uitvaart, videoboodschappen

**Known IA issues:**
- GAP-UX-008: No documented grouping/priority rationale → recommendation: group into 4 clusters (Identity, Legal wishes, People & keys, Management)
- GAP-UX-009: No contextual cross-links between related modules (e.g., Testament → Erfgenamen suggestion)
- `INSUFFICIENT_DATA:` Q-UX-D-002 required for validated grouping

**Suggested clustering (heuristic — requires validation):**

| Cluster | Modules |
|---------|---------|
| Mijn Profiel | eigenaar, tijdlijn |
| Wensen & Besluiten | testament, donor, euthanasie, uitvaart |
| Mijn Bezit | boedel, digitaal-bezit, documenten, videoboodschappen |
| Mensen & Sleutels | erfgenamen, noodcontacten |
| Beheer | export, backup, instellingen, audit-log, help |

---

## 5. Key Flows

### 5.1 Activation Flow (OnboardingWizard)
- Status: 7 steps — violates G-UX-02 (GAP-UX-001)
- Target: Redesign to ≤3 gated stages with optional deep-fill later
- Critical: Must preserve all current data capture; no regression to legal completeness
- Dependency: BLOCKING-P3-001 (Shamir UX test must be executed before Shamir step redesign)

### 5.2 Heir Unlock Flow (Shamir)
- Status: Functional but untested with real users (RISK-UX-001 CRITICAL)
- Action required: Execute `devdocs/shamir-ux-test-protocol.md` — 5-person minimum test
- `INSUFFICIENT_DATA:` Success rate on first attempt

### 5.3 Dashboard
- Status: Drag-and-drop personalization present (DnD Kit), keyboard accessible
- Finding: Widget density may be overwhelming; no default view priority set
- Action: Define a recommended default widget set for new users

---

## 6. Design System Status

**Tool:** Storybook 10 (`src/lumio-web/src/components/ui/`)  
**Coverage:** 68% (17/25 UI components documented)  
**A11y addon:** Present (`@storybook/addon-a11y`)

**Gaps to close:**
- Missing stories: `status-badge`, `toast`, `tooltip`, `help-tooltip`, `LabelWithHelp`
- Missing complex-flow stories: `OnboardingWizard`, `InterviewWizard`, `IdleWarningDialog`
- ~~`INSUFFICIENT_DATA:` Design tokens file — Q-UX-UI-001 required~~ **RESOLVED:** `docs/brand/design-tokens.json` aanwezig (SP-1-005, 2026-03-03)

**Target design system completeness:** 100% component story coverage + design-tokens.json committed

---

## 7. Accessibility Requirements

**Mandatory standard:** WCAG 2.1 Level AA  
**Legal framework:** EAA (Directive 2019/882) — in force June 28, 2025  
**`UNCERTAIN:` EAA scope** for USB-portable delivery model — legal confirmation required (Q-UX-A11Y-002)

**Open compliance gaps (all must be resolved):**
- GAP-A11Y-001: Color contrast ratios unverified (design-tokens.json beschikbaar sinds SP-1-005; contrast-verificatie vs. WCAG 2.1 AA nog nodig)
- GAP-A11Y-002: No skip-to-main link in authenticated layout
- GAP-A11Y-003: Focus trap behavior in IdleWarningDialog/ShamirDialog unverified
- GAP-A11Y-004: `<html lang>` in static export not verified
- GAP-A11Y-005: Toast notifications — no `aria-live` region confirmed
- GAP-A11Y-006: No automated WCAG tests for 18 authenticated routes (CRITICAL)

---

## 8. Open Items (INSUFFICIENT_DATA)

| Item | Required for | Q-ID | Status |
|------|-------------|------|--------|
| Validated user personas | Segment targeting, journey validation | Q-UX-R-001 | OPEN |
| Activation completion rate | Conversion baseline, ROI of wizard redesign | Q-UX-R-002 | OPEN |
| ~~Design tokens~~ | ~~Color contrast verification~~ | Q-UX-UI-001 | ✅ RESOLVED: `docs/brand/design-tokens.json` (SP-1-005) |
| Figma bronbestanden | Exacte design specs per component | Q-UX-UI-001 (rest) | OPEN |
| Backup/export flow step count | G-UX-02 compliance check | Q-UX-D-001 | OPEN |
| IA grouping rationale | Validated sidebar redesign | Q-UX-D-002 | OPEN |
| WCAG audit results | A11y baseline | Q-UX-A11Y-001 | OPEN |

---

## 9. Document History

| Version | Date | Changes |
|---------|------|---------|
| v1 (DRAFT) | 2026-07-14 | Initiële aanmaak vanuit Phase 3-analyse. 60% compleet. |
| v1.1 | 2026-03-03 | Design tokens RESOLVED (SP-1-005); GAP-A11Y-001 bijgewerkt (tokens beschikbaar); open-items-tabel bijgewerkt. 65% compleet. |
