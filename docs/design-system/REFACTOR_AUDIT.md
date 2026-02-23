# Global Refactor Audit

> Step 6 of the design-system migration. Tracks every ad-hoc pattern replaced.

## Checkbox Replacements (4)

All native `<input type="checkbox">` instances replaced with `<Checkbox>` from `@/components/ui/checkbox`.

| File | Field | Line |
|------|-------|------|
| `uitvaart/page.tsx` | `heeftUitvaartVerzekering` | ~903 |
| `testament/page.tsx` | `uitsluitingsClausule` | ~779 |
| `euthanasie/page.tsx` | `wilEuthanasie` | ~303 |
| `euthanasie/page.tsx` | `dementieClausule` | ~379 |

## Alert Replacements (17)

All ad-hoc `<div className="rounded-lg border border-{color}-200 bg-{color}-50 ...">` alert blocks replaced with `<Alert>` from `@/components/ui/alert`.

| File | Variant | Description |
|------|---------|-------------|
| `WizardShell.tsx` | `danger` | Error display |
| `JuridischeCheck.tsx` | `danger` | Error display |
| `JuridischeCheck.tsx` | `success` | Validation passed |
| `InterviewWizard.tsx` | `warning` | Testament tip |
| `InterviewWizard.tsx` | `info` | Digital estate info |
| `ErfbelastingCalculator.tsx` | `warning` | Disclaimer |
| `NabestaandenDashboard.tsx` | `info` | Helper text |
| `ProfielSuggesties.tsx` | `danger` | Error display |
| `ProfielSuggesties.tsx` | `success` | Complete profile |
| `ProfielSuggesties.tsx` | `info` | Suggestion card |
| `uitvaart/page.tsx` | `danger` | Form error (×2) |
| `testament/page.tsx` | `warning` | Legitimaire portie warning |
| `testament/page.tsx` | `danger` | Form error |
| `testament/wizard/page.tsx` | `info` | Wettelijk kader (×2) |
| `testament/wizard/page.tsx` | `warning` | Uitsluitingsclausule |
| `erfgenamen/page.tsx` | `success` | Shamir shares generated |
| `eigenaar/page.tsx` | `danger` | Error display |
| `eigenaar/page.tsx` | `success` | Success message |
| `layout.tsx` | `warning` | Read-only mode banner |

## Token Color Replacements

### Status Message Colors (instellingen/page.tsx)

All `text-green-600` → `text-success` and `text-red-600` → `text-danger` in ternary status message patterns:

- Actualisatie result message
- Profile save message
- Password change message
- Backup download message
- Restore message
- Auto-backup message
- Delete account message

### Security Indicator Dots (instellingen/page.tsx)

All `bg-green-500` → `bg-success` for security status indicator dots.

## Remaining Raw Color Usages (Documented Exceptions)

See [EXCEPTIONS.md](EXCEPTIONS.md) for the full list of allowed raw color usages.

## Build Status

✅ All 22 pages build successfully after refactor.
