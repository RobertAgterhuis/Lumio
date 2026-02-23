# Lumio Design System — Baseline UI Audit

> Auto-generated: 2026-02-23  
> Scope: `src/lumio-web/src/app/(authenticated)/**` + `src/lumio-web/src/components/**`

## 1. Raw Hex Colors

Only **1 occurrence** across the entire codebase (outside `globals.css` token definitions):

| File | Context |
|------|---------|
| `components/noodcontacten/NoodkaartQR.tsx` | QR code color config `{ dark: "#1e3a5f", light: "#ffffff" }` |

**Assessment:** Minimal — the QR library requires hex values directly.

---

## 2. Direct Tailwind Color Utility Classes (Non-Token)

**~220+ occurrences** across 17 authenticated pages and 14 component files.

### Recurring Patterns

#### Pattern A — Status Alert Boxes (~40 occurrences)
```
border-{color}-200 bg-{color}-50 text-{color}-800
```
Used for: error banners, warnings, info callouts, success messages  
Colors used: `red`, `amber`, `blue`, `green`, `purple`, `indigo`, `cyan`

**Files affected:** Nearly every authenticated page + WizardShell, JuridischeCheck, InterviewWizard, SectieNotitie, ProfielSuggesties, StatistiekenWidget

#### Pattern B — Destructive Icon Tinting (~15 occurrences)
```
text-red-500 (on Trash2 icons)
```
**Files:** boedel, testament, uitvaart, digitaal-bezit, documenten, noodcontacten, erfgenamen

#### Pattern C — Status Dots/Badges (~12 occurrences)
```
bg-{color}-100 text-{color}-800 (status badges)
bg-{color}-500 (status dots)
```
**Files:** audit-log, instellingen, dashboard, donor/formulier

#### Pattern D — Dashboard Section Colors (~20 occurrences)
```
text-{color}-600 bg-{color}-50 (section icon/background pairs)
```
Colors: gray, blue, purple, red, green, amber, stone, cyan, indigo, pink  
**Files:** dashboard/page.tsx, StatistiekenWidget

#### Pattern E — Success/Error Status Text (~20 occurrences)
```
text-green-600 / text-red-600 (boolean status indicators)
```
**Files:** instellingen (×6), donor/formulier, documenten, PasswordGenerator, DataHandtekening

### Full File Coverage

| Page/Component | Approx. Count | Dominant Pattern |
|---------------|---------------|-----------------|
| dashboard/page.tsx | ~25 | D (section colors) + A (alerts) |
| instellingen/page.tsx | ~18 | E (status) + A (warnings) |
| testament/page.tsx | ~15 | A (errors/warnings) + B (delete) |
| digitaal-bezit/page.tsx | ~12 | A (alerts) + B (delete) |
| boedel/page.tsx | ~10 | A + B + E |
| documenten/page.tsx | ~10 | A + status colors |
| erfgenamen/page.tsx | ~8 | A + B |
| tijdlijn/page.tsx | ~8 | Severity-mapped colors |
| noodcontacten/page.tsx | ~6 | A + B |
| uitvaart/page.tsx | ~6 | A + B |
| euthanasie/page.tsx + wizard | ~8 | A |
| testament/wizard/page.tsx | ~6 | A |
| audit-log/page.tsx | ~8 | C (action type badges) |
| eigenaar/page.tsx | ~5 | A |
| donor/page.tsx + formulier | ~5 | A + E |
| export/page.tsx | ~3 | A |
| NabestaandenDashboard.tsx | ~25 | A + C + D |
| StatistiekenWidget.tsx | ~15 | D + A |
| JuridischeCheck.tsx | ~12 | A (multi-severity) |
| ProfielSuggesties.tsx | ~10 | A |
| ErfbelastingCalculator.tsx | ~6 | A + E |
| PasswordStrengthMeter.tsx | ~5 | Strength gradient |
| HeirUnlockForm.tsx | ~4 | Branding + error |
| PersonSelect.tsx | ~1 | Link color |
| Other components | ~8 | Mixed patterns |

---

## 3. Native HTML Controls Bypassing System

**6 native `<input type="checkbox">` elements** — no `Checkbox` UI component exists.

| File | Lines | Context |
|------|-------|---------|
| uitvaart/page.tsx | L903 | "Heeft uitvaartverzekering" toggle |
| testament/page.tsx | L779, L883 | "Uitsluitingsclausule" + other checkbox |
| euthanasie/page.tsx | L303, L379 | "Wil euthanasie" + "Dementie clausule" |
| noodcontacten/page.tsx | L410–L415 | Noodkaart consent checkbox |

All native `<select>` and `<textarea>` usage goes through the UI components.

---

## 4. Inline Styles

**5 occurrences** — all for dynamic progress bar widths (unavoidable):

| File | Context |
|------|---------|
| dashboard/page.tsx | Completeness bar width |
| OnboardingWizard.tsx | Progress bar width |
| NabestaandenDashboard.tsx | Progress bar width |
| VoortgangGranulair.tsx (×2) | Granular progress widths + dynamic `backgroundColor` using `var(--color-success)` |

**Assessment:** Acceptable — dynamic widths require inline styles. VoortgangGranulair already uses CSS custom properties correctly.

---

## 5. Layout Issues

### Dashboard
- Full-width stacked blocks with significant unused horizontal space
- All stat cards in vertical stack regardless of viewport width
- Notifications embedded as inline card (no header dropdown)

### Instellingen (Settings)
- Single-column card stack — wastes horizontal space on wide screens
- Many small settings cards that could be grouped side-by-side

### General Page Layout
- Most pages use a simple `max-w-4xl mx-auto p-6` container (consistent but single-column)
- No responsive grid utilization for two-column layouts where appropriate
- Vertical rhythm varies across pages (some use `space-y-6`, others `space-y-4`)

---

## 6. Priority Remediation Plan

### High Priority — Create/Extend Components
1. **`Alert` component** with variants: `error`, `warning`, `info`, `success`, `security` → eliminates ~40 ad-hoc alert boxes
2. **`Checkbox` component** → replaces 6 native inputs
3. **`StatusBadge` extension** → standardize audit-log / status indicators

### Medium Priority — Token Migration
4. Replace Pattern B (`text-red-500` on icons) with semantic `text-destructive`
5. Replace Pattern E (`text-green-600` / `text-red-600`) with semantic status tokens
6. Introduce section color tokens for dashboard category icons

### Lower Priority — Layout
7. Dashboard responsive grid
8. Settings two-column layout
9. Notification header dropdown
