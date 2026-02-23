# State Tokens

> Semantic state triplets for consistent user feedback across Lumio.

## State Triplets

Each state provides three coordinated tokens: background, border, and text.

| State | Background | Border | Text |
|-------|-----------|--------|------|
| **Success** | `--state-success-bg` | `--state-success-border` | `--state-success-text` |
| **Warning** | `--state-warning-bg` | `--state-warning-border` | `--state-warning-text` |
| **Danger** | `--state-danger-bg` | `--state-danger-border` | `--state-danger-text` |
| **Info** | `--state-info-bg` | `--state-info-border` | `--state-info-text` |
| **Security** | `--state-security-bg` | `--state-security-border` | `--state-security-text` |

## Tailwind Usage

```tsx
// Use the Alert component for block messages
<Alert variant="success">...</Alert>

// Use Badge for inline status
<Badge variant="warning">Aandacht</Badge>

// Use raw tokens for custom state styling
<div className="bg-success-100 border-success text-success">
  Positief resultaat
</div>
```

## Semantic Color Tokens

These are available as Tailwind utilities via `@theme`:

| Token | Light | Purpose |
|-------|-------|---------|
| `--color-success` | `#5E8C61` | Positive outcomes, completions |
| `--color-warning` | `#D4A017` | Attention needed, pending items |
| `--color-danger` | `#B44A4A` | Errors, destructive actions, negative values |
| `--color-info` | `#3A506B` | Informational, neutral guidance |
| `--color-sage` | `#6B8E7A` | Calm, nature-inspired accents |
| `--color-secure` | `#2563EB` | Security-specific, encryption, trust |

### Muted Variants (-100)

Each color has a `-100` variant for backgrounds and subtle borders:

| Token | Light | Usage |
|-------|-------|-------|
| `--color-success-100` | `#E8F5E9` | Success backgrounds |
| `--color-warning-100` | `#FFF8E1` | Warning backgrounds |
| `--color-danger-100` | `#FFEBEE` | Error backgrounds |
| `--color-info-100` | `#E3F2FD` | Info backgrounds |

## Dark Mode Mapping

All state tokens have dark mode overrides in `tokens.css` — no manual dark mode classes needed in components.

| State | Dark background | Dark text |
|-------|----------------|-----------|
| Success | `#1a2e1a` | `#86C088` |
| Warning | `#2d2a1a` | `#E8B93C` |
| Danger | `#2e1a1a` | `#D47070` |
| Info | `#1a1a2e` | `#7B9DB5` |
| Security | `#1a1a2e` | `#5B8DEF` |

## When to Use What

| Pattern | Component | Token approach |
|---------|-----------|---------------|
| Block notification | `<Alert variant="...">` | Automatic |
| Inline status label | `<Badge variant="...">` | Automatic |
| Status indicator dot | `<SecurityStatusIndicator>` | Automatic |
| Custom status UI | Manual classes | `bg-{state}-100 border-{state} text-{state}` |
| Success/error text | Inline | `text-success` / `text-danger` |
