# Lumio Design System — Stack Analysis

> Auto-generated: 2026-02-23

## Runtime Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js | 16.1.6 |
| UI Library | React | 19.2.4 |
| Language | TypeScript | 5.9.3 |
| Styling | Tailwind CSS v4 | 4.2.0 |
| PostCSS | @tailwindcss/postcss | 4.2.0 |
| Variant System | class-variance-authority (CVA) | 0.7.1 |
| Class Merging | tailwind-merge | 3.5.0 |
| Utility | clsx | 2.1.1 |
| i18n | next-intl | 4.8.3 |
| State | Zustand | 5.0.11 |
| Forms | react-hook-form + @hookform/resolvers | 7.71.1 / 5.2.2 |
| Validation | Zod | 4.3.6 |
| Icons | lucide-react | 0.575.0 |
| Data Fetching | Hand-rolled `api` client (fetch-based) | — |
| Async State | @tanstack/react-query | 5.90.21 |

## Build Configuration

- **Output mode:** `output: "export"` (fully static — no SSR, no API routes)
- **Trailing slash:** enabled
- **Images:** unoptimized (static export)
- **PostCSS:** Tailwind v4 via `@tailwindcss/postcss`
- **Module resolution:** `bundler` (modern, via `tsconfig.json`)
- **Path alias:** `@/*` → `./src/*`

## Theming Model

Tailwind v4 `@theme` directive in `globals.css` defines CSS custom properties:

### Light Theme (`:root` via `@theme`)
- Semantic color tokens: `--color-primary`, `--color-secondary`, `--color-accent`, `--color-destructive`, `--color-muted`, `--color-background`, `--color-foreground`, `--color-card`, `--color-sidebar`, `--color-success`, `--color-warning`
- Foreground counterparts: `--color-*-foreground`
- Form tokens: `--color-border`, `--color-input`, `--color-ring`
- Radius tokens: `--radius-sm`, `--radius-md`, `--radius-lg`

### Dark Theme (`.dark` class selector)
- Overrides all semantic tokens with dark-adapted values
- Uses `.dark` class on `<html>` element (toggled via `useTheme` hook)

### Accessibility
- `grote-tekst` class provides 118% base scaling with overrides for all text size utilities
- No focus ring or contrast tokens currently defined
- No reduced motion support

## UI Primitives (`src/components/ui/`)

| Component | CVA? | Token-based? | Notes |
|-----------|------|-------------|-------|
| `Badge` | ✅ | ✅ | 6 variants (default, secondary, destructive, outline, success, warning) |
| `Button` | ✅ | ✅ | 6 variants × 4 sizes |
| `Card` | ❌ | ✅ | Card + Header + Title + Description + Content |
| `Dialog` | ❌ | ✅ | Custom implementation (not Radix) with Escape/backdrop close |
| `HelpTooltip` | ❌ | ✅ | Click-to-open info popover |
| `Input` | ❌ | ✅ | Standard text input |
| `Label` | ❌ | ✅ | Form label |
| `Select` | ❌ | ✅ | Wraps native `<select>` |
| `Tabs` | ❌ | ✅ | Custom implementation with value prop |
| `Textarea` | ❌ | ✅ | Multi-line text |

### Missing Primitives
- ❌ Alert (banner/callout — currently ad-hoc `div` patterns)
- ❌ Checkbox (native `<input type="checkbox">` used directly in 6 places)
- ❌ Progress (dynamic width bars implemented inline)
- ❌ Switch/Toggle
- ❌ Tooltip (only HelpTooltip exists)
- ❌ Dropdown menu
- ❌ Notification dropdown

## Key Observations

1. **Token usage is good at the primitive level** — all `components/ui/*` use semantic tokens exclusively
2. **Page-level token discipline is poor** — ~220+ direct Tailwind color class usages across pages and higher-level components
3. **Recurring ad-hoc pattern** — alert/status boxes (`border-{color}-200 bg-{color}-50 text-{color}-800`) appear ~40+ times across the codebase with no shared `Alert` component
4. **Dark mode is branched twice** — tokens via `.dark` + many pages include explicit `dark:` utility overrides
5. **Tailwind v4 `@theme`** is used correctly as token source, but token coverage is incomplete (no spacing, shadow, or motion tokens)
6. **No Storybook** — component documentation relies on page usage only
