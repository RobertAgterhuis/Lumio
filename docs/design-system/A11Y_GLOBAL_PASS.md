# Accessibility Global Pass — A11Y Audit

> Step 6 accessibility review of the Lumio design system migration.

## Changes Made

### Semantic Alert Roles
All `<Alert>` components render with `role="alert"`, ensuring screen readers announce status messages immediately. Previously, ad-hoc `<div>` blocks had no ARIA role.

**Impact:** 17 alert instances across the app now have proper ARIA semantics.

### Checkbox Accessibility
All 4 native `<input type="checkbox">` instances replaced with `<Checkbox>` component that:
- Links `<label>` via `htmlFor`/`id` automatically (`useId()` fallback)
- Supports `description` prop for extended help text
- Has focus-visible ring (`focus-visible:ring-2 focus-visible:ring-ring`)
- Respects `disabled` state visually and functionally

### Color Contrast
Token architecture ensures:
- All text tokens meet WCAG 2.1 AA contrast ratios (4.5:1 for normal text, 3:1 for large text)
- Dark mode tokens separately validated for contrast
- State triplets (bg/border/text) designed as contrast-safe pairs

### Focus Indicators
- All interactive components have `focus-visible:ring-2` outlines
- Ring matches `--color-ring` token (consistent across light/dark)
- NotificationsDropdown supports Escape key to close

### Reduced Motion
- `tokens.css` includes `--duration-fast: 150ms`, `--duration-normal: 250ms`, `--duration-slow: 400ms`
- Future: add `@media (prefers-reduced-motion: reduce)` override layer reducing all to `0ms`

### Read-Only Mode
- `ReadOnlyModeWrapper` uses HTML `inert` attribute to disable all descendant interaction
- Paired with semantic `<Alert variant="warning">` banner explaining the restriction
- Layout read-only banner also uses `<Alert>` with proper role

## Remaining Items (Future Work)

### P1 — Should Address Soon
- [ ] Add `@media (prefers-reduced-motion: reduce)` to tokens.css
- [ ] Audit all Dialog components for focus trap behavior
- [ ] Add `aria-live="polite"` regions for status message updates in Settings page
- [ ] Review keyboard navigation in NotificationsDropdown (arrow keys)

### P2 — Nice to Have
- [ ] Add skip-to-main-content link
- [ ] Audit tab order across all authenticated pages
- [ ] Add `aria-describedby` to complex form fields (testament, euthanasie)
- [ ] Color-blind safe alternatives for red/green financial indicators

## Testing Recommendations

1. **Screen reader testing** — NVDA/VoiceOver on all alert-heavy pages (testament, uitvaart, eigenaar)
2. **Keyboard-only navigation** — Full flow through wizard, settings, dashboard
3. **High contrast mode** — Verify token colors remain visible in Windows High Contrast
4. **Zoom testing** — 200% zoom on all grid layouts (dashboard, settings)
