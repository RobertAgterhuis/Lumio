# Design System — Allowed Exceptions

> Raw Tailwind color classes and non-token values that are intentionally kept.  
> Every exception must have a documented reason.

## Domain-Specific Color Mappings

### Phase/Timeline Colors
- **`NabestaandenDashboard.tsx`** — `faseConfig` object with `bg-red-50`, `bg-amber-50`, `bg-blue-50`, `bg-green-50` for phase card styling. These represent domain-specific life-event phases and are data-driven from a configuration object.
- **`tijdlijn/page.tsx`** — Hardcoded color configs per timeline phase. Same rationale.

**Reason:** Phase colors are semantic to the domain (grief phases), not UI state. Creating dedicated tokens for 4 one-off domain concepts adds abstraction without benefit.

### Financial Amount Colors
- **`boedel/page.tsx`** — `text-red-600` / `text-green-600` for negative/positive financial amounts.
- **`StatistiekenWidget.tsx`** — `text-red-600` / `text-green-600` and `bg-red-50` / `bg-green-50` for financial summary cards (bezittingen vs schulden).

**Reason:** Red/green for financial positive/negative is a universal convention. These are data display colors, not UI component state.

### Donor Form Indicators
- **`donor/formulier/page.tsx`** — `text-green-600` / `text-red-600` for Ja/Nee display.

**Reason:** Boolean yes/no indicator styling, not an alert or status message.

## Component-Internal Patterns

### Password Strength Meter
- **`PasswordStrengthMeter.tsx`** — `bg-red-500`, `bg-amber-500`, `bg-green-500` segments for strength levels. `text-green-600` for checklist pass items.

**Reason:** Gradient-like strength visualization with 3+ colors. These are intrinsic to the component's visual meaning.

### Password Generator
- **`PasswordGenerator.tsx`** — `text-green-600` on Check icon for "copied" feedback.

**Reason:** Ephemeral feedback indicator, single-use.

### Data Handtekening
- **`DataHandtekening.tsx`** — `text-green-600` on Check icon for "copied" feedback.

**Reason:** Same pattern as PasswordGenerator.

### Onboarding Wizard
- **`OnboardingWizard.tsx`** — `bg-green-50/50 border-green-200` for completed step cards, `bg-green-100 text-green-600` for completed step circles.

**Reason:** Step completion state in a wizard visual, not a status message.

### Document Upload Status
- **`documenten/page.tsx`** — `border-green-200 bg-green-50` / `border-red-200 bg-red-50` conditional upload item styling.

**Reason:** File upload item status indicator (uploaded vs failed).

## Sticky Note Styling
- **`SectieNotitie.tsx`** — `border-amber-200 bg-amber-50` for sticky note appearance.

**Reason:** Intentional amber "sticky note" visual metaphor. Not a warning alert.

## Error Page
- **`global-error.tsx`** — `text-red-600` on error SVG icon.

**Reason:** Error boundary page, minimal styling.

## Auth Error
- **`HeirUnlockForm.tsx`** — `text-red-600` inline error text.

**Reason:** Simple inline form error, not a block alert. Could be upgraded to Alert in future.

## Badge Colors in NabestaandenDashboard
- **`NabestaandenDashboard.tsx`** — `bg-green-100 text-green-800`, `bg-amber-100 text-amber-800`, `bg-blue-100 text-blue-800` Badge className overrides.

**Reason:** Domain-specific phase badges. The Badge component's built-in variants don't cover these domain-specific phase meanings. Could be extended with domain variants in the future.

## Dashboard Icon Colors
- **`dashboard/page.tsx`** — `color: "text-red-600"` and `color: "text-green-600"` in domain category icon configs.

**Reason:** Visual differentiation of dashboard categories, not status state.

---

## Rules for Adding Exceptions

1. Must not be achievable with existing token/component variants
2. Must be restricted to a single file or tightly-scoped component
3. Must be documented here with a reason
4. Must be reviewed when new token variants are added
