# 6 — Design System

## Overview

The Lumio design system is built in layers with **Tailwind CSS 4** as the foundation, a custom **token architecture** for consistency, and **Class Variance Authority (CVA)** for component variants.

```
tokens.css          → Source of truth: colors, spacing, shadows, animation
globals.css @theme  → Tailwind semantic mapping (token → utility class)
components/ui/      → Reusable UI primitives (Button, Alert, Badge, Card, ...)
components/security/→ Security components
```

## Token Layers

The token system consists of 6 layers, defined in two files:

| Layer | File | Purpose |
|-------|------|---------|
| 1 — Color primitives | `tokens.css` | Raw color scales (primary, sage, secure, status) |
| 2 — Spacing | `tokens.css` | 8pt grid (`--space-1` through `--space-7`) |
| 3 — Shadows | `tokens.css` | 3-tier elevation (`--shadow-1` through `--shadow-3`) |
| 4 — Animation | `tokens.css` | Duration + easing (`--duration-fast`, `--duration-med`) |
| 5 — State tokens | `tokens.css` | bg/border/text triplet per status intent |
| 6 — Accessibility | `tokens.css` | Focus ring, disabled, min target size |
| Semantic | `globals.css @theme` | Maps primitives → Tailwind utility classes |

## Color Palette

### Primary (Teal)

| Token | Light | Dark |
|-------|-------|------|
| `--base-primary-700` | `#2C4A52` | `#7AB5C0` |
| `--base-primary-600` | `#355E68` | `#8CC4CE` |
| `--base-primary-500` | `#4F7A83` | `#9ED3DC` |
| `--base-primary-100` | `#E6EFF1` | `#1A2C30` |
| `--base-primary-50` | `#F3F7F8` | `#0F1A1D` |

### Status Colors

| Intent | 700 (light) | 600 (light) | 100 (light) | 50 (light) |
|--------|-------------|-------------|-------------|------------|
| Success | `#4A7A4D` | `#5E8C61` | `#E8F5E9` | `#F1F8F1` |
| Warning | `#B8890F` | `#D4A017` | `#FFF8E1` | `#FFFBEB` |
| Danger | `#923C3C` | `#B44A4A` | `#FDE8E8` | `#FEF2F2` |
| Info | `#2C3E50` | `#3A506B` | `#E3EDF5` | `#F0F5FA` |

### Other Colors

| Color | Token | Light | Purpose |
|-------|-------|-------|---------|
| Sage | `--base-sage-600` | `#6B8E7A` | Calm, natural accent |
| Secure | `--base-secure-600` | `#2563EB` | Security, encryption |
| Neutral | `--base-neutral-900..50` | `#1F2933..#F9FAFB` | Text, backgrounds |

## Spacing (8pt Grid)

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | `4px` | Small gaps, icon padding |
| `--space-2` | `8px` | Default element gap |
| `--space-3` | `16px` | Card padding, section gap |
| `--space-4` | `24px` | Section separation |
| `--space-5` | `32px` | Large section gap |
| `--space-6` | `48px` | Page-level separation |
| `--space-7` | `64px` | Large page separation |

## Radius

| Token | Value |
|-------|-------|
| `--radius-sm` | `8px` |
| `--radius-md` | `12px` |
| `--radius-lg` | `16px` |

## Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-1` | `0 4px 12px rgba(0,0,0,0.08)` | Cards, dropdowns |
| `--shadow-2` | `0 10px 24px rgba(0,0,0,0.12)` | Modals, popovers |
| `--shadow-3` | `0 18px 40px rgba(0,0,0,0.16)` | Full-screen overlays |

## Animation

| Token | Value |
|-------|-------|
| `--duration-fast` | `150ms` |
| `--duration-med` | `250ms` |
| `--easing-default` | `ease-in-out` |

## Typography

| Token | Value | Purpose |
|-------|-------|---------|
| `--text-xs` | `0.75rem` (12px) | Small text, captions |
| `--text-sm` | `0.875rem` (14px) | Secondary text |
| `--text-base` | `1rem` (16px) | Body text |
| `--text-lg` | `1.125rem` (18px) | Large body |
| `--text-xl` | `1.25rem` (20px) | Subheadings |
| `--text-2xl` | `1.5rem` (24px) | Headings |
| `--text-3xl` | `1.875rem` (30px) | Large headings |
| `--text-4xl` | `2.25rem` (36px) | Display text |

### Font Weights

| Token | Value |
|-------|-------|
| `--font-normal` | 400 |
| `--font-medium` | 500 |
| `--font-semibold` | 600 |
| `--font-bold` | 700 |

### Line Heights

| Token | Value |
|-------|-------|
| `--leading-none` | 1 |
| `--leading-tight` | 1.25 |
| `--leading-snug` | 1.375 |
| `--leading-normal` | 1.5 |
| `--leading-relaxed` | 1.625 |
| `--leading-loose` | 2 |

## Z-Index Scale

| Token | Value | Purpose |
|-------|-------|---------|
| `--z-base` | 0 | Default |
| `--z-dropdown` | 50 | Dropdown menus |
| `--z-sticky` | 100 | Sticky elements (header) |
| `--z-modal` | 200 | Modals, dialogs |
| `--z-toast` | 300 | Toast notifications |
| `--z-tooltip` | 400 | Tooltips |
| `--z-max` | 9999 | Emergency overlay |

## Border Width

| Token | Value |
|-------|-------|
| `--border-0` | 0 |
| `--border-1` | 1px |
| `--border-2` | 2px |
| `--border-4` | 4px |
| `--border-8` | 8px |

## State Tokens (Triplets)

Each status intent has three coordinated tokens:

```css
--state-{intent}-bg      /* Background color */
--state-{intent}-border  /* Border color */
--state-{intent}-text    /* Text color */
```

Available intents: `success`, `warning`, `danger`, `info`, `security`

Always use these triplets for alerts, badges, and status indicators — never standalone colors.

## Tailwind Utility Mapping

The `@theme` block in `globals.css` maps semantic tokens to Tailwind utilities:

| Utility prefix | Token | Example class |
|----------------|-------|---------------|
| `bg-primary` | `--color-primary` | `bg-primary`, `bg-primary/10` |
| `text-foreground` | `--color-foreground` | `text-foreground` |
| `border-border` | `--color-border` | `border-border` |
| `bg-success` | `--color-success` | `bg-success` |
| `bg-danger` | `--color-danger` | `bg-danger` |
| `bg-secure` | `--color-secure` | `bg-secure` |
| `bg-sage` | `--color-sage` | `bg-sage` |
| `rounded-md` | `--radius-md` | `rounded-md` |

## Dark Mode

Dark mode is activated via the `.dark` class on `<html>`. Both `tokens.css` and `globals.css` define `.dark` overrides.

**Rule:** Component code must **never** branch on theme — use only token values that switch automatically.

## Component Variants (CVA)

| Component | Variants |
|-----------|----------|
| `Button` | default, destructive, outline, secondary, ghost, link × sm/default/lg/icon |
| `Badge` | default, secondary, destructive, outline, success, warning, security, info, danger |
| `StatusBadge` | complete, success, warning, attention, info, pending, error, danger, inactive, neutral |
| `Alert` | info, success, warning, danger, security |
| `SecurityStatusIndicator` | secure, warning, critical, unknown |

### StatusBadge

Semantic badge for status indicators with optional icons. Uses design system tokens for consistent styling.

```tsx
import { StatusBadge } from "@/components/ui/status-badge";

<StatusBadge status="complete">Afgehandeld</StatusBadge>
<StatusBadge status="warning" showIcon>Actie vereist</StatusBadge>
<StatusBadge status="pending" showIcon>In behandeling</StatusBadge>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `status` | `complete | success | warning | attention | info | pending | error | danger | inactive | neutral` | `neutral` | Status variant |
| `showIcon` | `boolean` | `false` | Show status-appropriate icon |

## Accessibility (A11Y)

### Tokens

| Token | Default | Purpose |
|-------|---------|---------|
| `--a11y-focus-ring-color` | primary-500 | Focus outline color |
| `--a11y-focus-ring-width` | `2px` | Focus outline width |
| `--a11y-focus-ring-offset` | `2px` | Focus outline offset |
| `--a11y-disabled-opacity` | `0.5` | Disabled element opacity |
| `--a11y-disabled-cursor` | `not-allowed` | Disabled cursor |
| `--a11y-min-target` | `44px` | Minimum interactive target size |

### Guidelines

1. **Visible focus** — All interactive elements have a visible focus ring
2. **Contrast** — Minimum WCAG AA contrast ratio (4.5:1 text, 3:1 UI)
3. **Target size** — Minimum 44×44px for touch targets
4. **Keyboard navigation** — All features accessible via keyboard
5. **ARIA labels** — Descriptive labels where visual context is absent
6. **Color not sole indicator** — Always supplementary icon or text

## Storybook

All UI primitives and security components have Storybook stories:

```bash
cd src/lumio-web
npm run storybook    # Starts on port 6006
```

### Structure

```
Primitives/
  Button, Badge, Alert, Card, Input, Checkbox, Progress,
  Textarea, Select, Tabs, Dialog
Security/
  ConfirmDestructiveAction, SecureValueReveal, ReadOnlyModeWrapper,
  ActivityLogItem, SecurityStatusIndicator, SessionTimeoutWarning
```

## Rules for Developers

1. **No raw hex colors** in component/page code — use Tailwind utilities
2. **Use semantic tokens** (`bg-primary`, `text-danger`) — not Tailwind colors (`text-blue-500`)
3. **Use the 8pt spacing grid** — `space-1` (4px) through `space-7` (64px)
4. **State rendering via triplets** — `--state-{intent}-bg/border/text`
5. **Dark mode = token overrides only** — no conditional rendering for theme
6. **Document new tokens** — `tokens.css` is the single source of truth

## Token Enforcement

### Token Validation Script

The `validate-tokens` script ensures `tokens.css` and `globals.css @theme` stay synchronized:

```bash
npm run validate-tokens
```

This script:
1. Extracts CSS custom properties from `tokens.css`
2. Extracts `@theme` entries from `globals.css`
3. Reports any orphaned or missing mappings
4. Runs in CI to prevent drift

### ESLint Rules

Custom ESLint rules enforce design system consistency:

#### `no-raw-colors`

Prevents raw color values in favor of design tokens:

```tsx
// ❌ Bad - ESLint error
<div style={{ color: '#FF0000' }}>
<div className="text-[#FF0000]">

// ✅ Good - uses design tokens
<div className="text-danger">
<div className="bg-primary">
```

#### `no-raw-spacing`

Prevents arbitrary spacing values in favor of design tokens:

```tsx
// ❌ Bad - ESLint error
<div className="p-[17px] m-[23px]">
<div className="gap-[15px]">

// ✅ Good - uses spacing scale
<div className="p-4 m-6">
<div className="gap-spacing-3">
```

**Configuration:** Both rules are enabled in `eslint.config.mjs` with `error` severity.
---

## Icon System

Lumio ships two parallel icon systems:

| System | Component | Source | Usage |
|--------|-----------|--------|-------|
| Lucide | `<Icon icon={X} />` via `icon.tsx` | `lucide-react` npm package | Generic utility icons (close, search, settings, arrows, …) |
| LumioIcon | `<LumioIcon name="testament" />` via `lumio-icon.tsx` | Custom SVG in `lumio-icons/` | 16 domain & security icons |

### LumioIcon component

```tsx
import { LumioIcon } from "@/components/ui/lumio-icon";

// Decorative
<LumioIcon name="testament" size="md" className="text-primary" />

// Accessible
<LumioIcon name="shield-alert" size="lg" label="Security warning" />
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `LumioIconName` | — | Required icon identifier |
| `size` | `"sm" \| "md" \| "lg" \| "xl"` | `"md"` | 16 / 20 / 24 / 32 px |
| `label` | `string` | — | `aria-label` for non-decorative usage |
| `className` | `string` | — | Tailwind text utilities |
| `ref` | `Ref<SVGSVGElement>` | — | Forwarded to the `<svg>` element |

### The 16 custom icons

#### Domain icons

| Name | Domain | Visual concept |
|------|--------|----------------|
| `dashboard` | Dashboard | 2×2 grid of rounded tiles |
| `profiel` | Profile | Person silhouette with dashed halo ring |
| `testament` | Will | Scroll with title rule, content lines and wax seal |
| `wilsverklaring` | Advance directive | Stethoscope with heart at chest piece |
| `donor` | Organ donation | Filled heart with a life-sprout |
| `uitvaart` | Funeral wishes | Circle above a soft arch — universal, respectful |
| `digitaal-bezit` | Digital assets | Globe with padlock overlay |
| `boedel` | Estate | House inside a portfolio rectangle |
| `documenten` | Documents | Document with folded corner and content lines |
| `erfgenamen` | Heirs | Two person shapes, depth through size |
| `noodcontacten` | Emergency contacts | Phone handset with heartbeat pulse |
| `tijdlijn` | Timeline | Three dots on vertical line: future → present → past |

#### Security icons

| Name | State | Inner symbol |
|------|-------|-------------|
| `shield` | Neutral / protected | Shield base only |
| `shield-check` | Verified / secure | Check mark |
| `shield-alert` | Warning / caution | Exclamation mark |
| `shield-x` | Critical / blocked | Diagonal X |

All four shield variants share the same base path — consistent visual weight across states.

### Design principles

1. **`currentColor`** — All icons inherit text color. Use `className="text-primary"` etc.
2. **Stroke weight 1.5** — Softer than Lucide (2px), matching `--radius-md` design language.
3. **ViewBox `0 0 24 24`** — Icons align optically with Lucide at the same pixel size.
4. **`aria-hidden` by default** — Pass `label` prop only when the icon conveys meaning.
5. **`forwardRef` enabled** — Ref is forwarded to the underlying `<svg>` element.

### Rules for developers

- **Use `LumioIcon`** for all 16 domain and security icon names listed above.
- **Use Lucide** (`<Icon icon={X} />`) for all other icons.
- **Never import** `Shield`, `ShieldCheck`, `ShieldAlert`, `ShieldX`,
  `LayoutDashboard`, `ScrollText`, `Church`, `Heart` (domain use), `Globe`
  or `Wallet` from `lucide-react` in production page components.
- The CI `icon-guard` job enforces this automatically.

### Storybook documentation

All 16 icons are documented in Storybook under **UI › LumioIcon**:

- `AllIcons` — full grid at size `lg`
- `Sizes` — sm / md / lg / xl comparison
- `Colors` — token-based color states
- `SecurityIcons` — four shield variants
- `ShieldStates` — animated shield state transitions
- `Accessibility` — labelled vs decorative usage

A dedicated MDX page (`LumioIcon.docs.mdx`) is also available in the Storybook docs tab.
