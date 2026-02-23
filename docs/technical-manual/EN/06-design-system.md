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
| `Alert` | info, success, warning, danger, security |
| `SecurityStatusIndicator` | secure, warning, critical, unknown |

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
