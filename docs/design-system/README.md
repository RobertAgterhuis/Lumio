# Lumio Design System

> Living documentation for the Lumio web application design system.

## Overview

Lumio uses a layered design system built on **Tailwind CSS v4** with custom token architecture, **CVA** for component variants, and **Storybook 10** as the living contract.

## Architecture

```
tokens.css          → Source-of-truth primitives (colors, spacing, shadows, motion)
globals.css @theme  → Tailwind semantic mappings (token → utility class)
components/ui/      → Reusable UI primitives (Button, Alert, Badge, Card, etc.)
components/security/→ Security-first patterns (ConfirmDestructiveAction, etc.)
components/layout/  → Layout orchestration (Header, NotificationsDropdown)
```

## Documentation Index

| Document | Description |
|----------|-------------|
| [TOKENS.md](TOKENS.md) | Complete token reference — colors, spacing, radius, shadows, motion |
| [STATE_TOKENS.md](STATE_TOKENS.md) | State triplets and semantic status tokens |
| [SECURITY_PATTERNS.md](SECURITY_PATTERNS.md) | Security component patterns and usage |
| [A11Y.md](A11Y.md) | Accessibility guidelines and compliance |
| [REFACTOR_AUDIT.md](REFACTOR_AUDIT.md) | Global refactor audit trail |
| [EXCEPTIONS.md](EXCEPTIONS.md) | Allowed raw color exceptions |
| [A11Y_GLOBAL_PASS.md](A11Y_GLOBAL_PASS.md) | A11Y pass results and remaining items |

## Quick Start

### Running Storybook

```bash
cd src/lumio-web
npm run storybook
```

### Using Components

```tsx
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ConfirmDestructiveAction } from "@/components/security";

// Button with variants
<Button variant="destructive" size="sm">Verwijderen</Button>

// Alert with semantic variant
<Alert variant="warning">
  <AlertTitle>Let op</AlertTitle>
  <AlertDescription>Controleer uw gegevens.</AlertDescription>
</Alert>
```

### Token Usage Rules

1. **Never use raw hex colors** in app/component files — use Tailwind utility classes mapped to tokens
2. **Use semantic tokens** (`text-primary`, `bg-danger`, `border-warning-100`) not raw Tailwind colors (`text-blue-500`)
3. **Use the 8pt spacing grid** — `space-1` (8px), `space-2` (16px), etc.
4. **Dark mode is automatic** — tokens map to dark values via `.dark` class

### Component Variants

| Component | Variants |
|-----------|----------|
| `Button` | default, destructive, outline, secondary, ghost, link × sm/default/lg/icon |
| `Badge` | default, secondary, destructive, outline, success, warning, security, info, danger |
| `Alert` | info, success, warning, danger, security |
| `SecurityStatusIndicator` | secure, warning, critical, unknown |

## Storybook Structure

```
Primitives/
  Button, Badge, Alert, Card, Input, Checkbox, Progress, Textarea, Select, Tabs, Dialog
Security/
  ConfirmDestructiveAction, SecureValueReveal, ReadOnlyModeWrapper,
  ActivityLogItem, SecurityStatusIndicator, SessionTimeoutWarning
```
