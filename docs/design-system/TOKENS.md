# Lumio Design Tokens

> Architecture reference for the layered token system.

## Token Layers

The token system is split into **6 layers**, defined in two files:

| Layer | File | Purpose |
|-------|------|---------|
| 1 – Base primitives | `src/styles/tokens.css` | Raw color scales, spacing, shadows, motion |
| 2 – Spacing | `src/styles/tokens.css` | 8pt grid (`--space-1` … `--space-7`) |
| 3 – Shadows | `src/styles/tokens.css` | 3-tier elevation (`--shadow-1` … `--shadow-3`) |
| 4 – Motion | `src/styles/tokens.css` | Duration + easing (`--duration-fast`, `--duration-med`) |
| 5 – State tokens | `src/styles/tokens.css` | bg/border/text triplets per status intent |
| 6 – Accessibility | `src/styles/tokens.css` | Focus ring, disabled, min target size |
| Semantic mapping | `src/app/globals.css` `@theme` | Maps primitives → Tailwind utility classes |

## Color Palette

### Primary (teal)

| Token | Light | Dark |
|-------|-------|------|
| `--base-primary-700` | `#2C4A52` | `#7AB5C0` |
| `--base-primary-600` | `#355E68` | `#8CC4CE` |
| `--base-primary-500` | `#4F7A83` | `#9ED3DC` |
| `--base-primary-100` | `#E6EFF1` | `#1A2C30` |
| `--base-primary-50` | `#F3F7F8` | `#0F1A1D` |

### Sage

| Token | Light | Dark |
|-------|-------|------|
| `--base-sage-600` | `#6B8E7A` | `#7AAD8D` |
| `--base-sage-100` | `#E8F0EB` | `#1A2A20` |

### Secure (blue)

| Token | Light | Dark |
|-------|-------|------|
| `--base-secure-600` | `#2563EB` | `#60A5FA` |
| `--base-secure-100` | `#DBEAFE` | `#1E2A40` |

### Status Colors

| Intent | 700 (light) | 600 (light) | 100 (light) | 50 (light) |
|--------|-------------|-------------|-------------|------------|
| Success | `#4A7A4D` | `#5E8C61` | `#E8F5E9` | `#F1F8F1` |
| Warning | `#B8890F` | `#D4A017` | `#FFF8E1` | `#FFFBEB` |
| Danger | `#923C3C` | `#B44A4A` | `#FDE8E8` | `#FEF2F2` |
| Info | `#2C3E50` | `#3A506B` | `#E3EDF5` | `#F0F5FA` |

### Neutral

| Token | Value |
|-------|-------|
| `--base-neutral-900` | `#1F2933` |
| `--base-neutral-700` | `#4B5563` |
| `--base-neutral-500` | `#9CA3AF` |
| `--base-neutral-200` | `#E5E7EB` |
| `--base-neutral-100` | `#F3F4F6` |
| `--base-neutral-50` | `#F9FAFB` |

## Spacing (8pt Grid)

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | `4px` | Tight gaps, icon padding |
| `--space-2` | `8px` | Default element gap |
| `--space-3` | `16px` | Card padding, section gap |
| `--space-4` | `24px` | Section separation |
| `--space-5` | `32px` | Large section gap |
| `--space-6` | `48px` | Page-level separation |
| `--space-7` | `64px` | Major section break |

## Radius

| Token | Value |
|-------|-------|
| `--radius-sm` | `8px` |
| `--radius-md` | `12px` |
| `--radius-lg` | `16px` |

## Shadows

| Token | Value | Use case |
|-------|-------|----------|
| `--shadow-1` | `0 4px 12px rgba(0,0,0,0.08)` | Cards, dropdowns |
| `--shadow-2` | `0 10px 24px rgba(0,0,0,0.12)` | Modals, popovers |
| `--shadow-3` | `0 18px 40px rgba(0,0,0,0.16)` | Full-screen overlays |

## Motion

| Token | Value |
|-------|-------|
| `--duration-fast` | `150ms` |
| `--duration-med` | `250ms` |
| `--easing-default` | `ease-in-out` |

## State Tokens

Each status intent has a **triplet** of bg/border/text for consistent alert/badge/status rendering:

```css
--state-success-bg / --state-success-border / --state-success-text
--state-warning-bg / --state-warning-border / --state-warning-text
--state-danger-bg  / --state-danger-border  / --state-danger-text
--state-info-bg    / --state-info-border    / --state-info-text
--state-security-bg / --state-security-border / --state-security-text
```

## Accessibility Tokens

| Token | Default | Purpose |
|-------|---------|---------|
| `--a11y-focus-ring-color` | primary-500 | Focus outline color |
| `--a11y-focus-ring-width` | `2px` | Focus outline width |
| `--a11y-focus-ring-offset` | `2px` | Focus outline offset |
| `--a11y-disabled-opacity` | `0.5` | Disabled element opacity |
| `--a11y-disabled-cursor` | `not-allowed` | Disabled cursor style |
| `--a11y-min-target` | `44px` | Minimum interactive target size |

## Tailwind Utility Mapping

The `@theme` block in `globals.css` maps semantic tokens to Tailwind utility classes:

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

Dark mode is toggled via the `.dark` class on `<html>`. Both `tokens.css` and `globals.css` define `.dark` overrides. Component code should **never** branch on theme — it must rely solely on token values.

## Rules

1. **No raw hex in component/page code** — use Tailwind utilities or CSS custom properties
2. **No new tokens without updating this doc** — tokens.css is the single source of truth
3. **State rendering must use state triplets** — `--state-{intent}-bg/border/text`
4. **Dark mode = token overrides only** — no conditional rendering for theme
