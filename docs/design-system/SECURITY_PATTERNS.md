# Security Patterns

> Security-first UI component patterns for the Lumio design system.

## Overview

Lumio handles sensitive estate planning data. These security primitives enforce consistent, safe UI patterns for destructive actions, data exposure, access control, and session management.

## Components

### ConfirmDestructiveAction

**Purpose:** Prevents accidental data loss by requiring explicit confirmation and optional password re-entry.

```tsx
import { ConfirmDestructiveAction } from "@/components/security";

<ConfirmDestructiveAction
  open={showDelete}
  onOpenChange={setShowDelete}
  title="Account verwijderen"
  description="Alle gegevens worden permanent verwijderd."
  confirmLabel="Verwijderen"
  requirePassword
  onConfirm={async (password) => {
    await api.deleteAccount(password);
  }}
/>
```

**When to use:**
- Account deletion
- Data wiping / factory reset
- Backup overwriting
- Shamir key regeneration
- Any action that cannot be undone

**Key features:**
- Dialog blocks interaction until resolved
- Optional password re-entry (`requirePassword`)
- Loading state during async confirmation
- Error display if confirmation fails
- ShieldAlert icon for visual severity

---

### SecureValueReveal

**Purpose:** Prevents casual shoulder-surfing of sensitive values.

```tsx
import { SecureValueReveal } from "@/components/security";

<SecureValueReveal
  value="shamir-key-abc-123"
  autoHideMs={10000}
/>
```

**When to use:**
- Shamir secret shares
- Encryption keys
- Recovery codes
- Any sensitive string that should default to masked

**Key features:**
- Eye/EyeOff toggle
- Auto-hide timer (default 10s, configurable, `0` = never)
- Accessible toggle label
- Mono-spaced revealed value

---

### ReadOnlyModeWrapper

**Purpose:** Disables all interaction for heir/read-only mode views.

```tsx
import { ReadOnlyModeWrapper } from "@/components/security";

<ReadOnlyModeWrapper isReadOnly={isHeirMode}>
  <ProfileForm />
</ReadOnlyModeWrapper>
```

**When to use:**
- Heir (nabestaande) login mode
- Shared view-only access
- Audit trail review

**Key features:**
- HTML `inert` attribute (native browser support)
- `pointer-events-none` + reduced opacity
- Warning Alert banner (configurable message)
- Banner can be hidden via `showBanner={false}`

---

### ActivityLogItem

**Purpose:** Displays a single audit log entry with severity coloring.

```tsx
import { ActivityLogItem } from "@/components/security";
import { LogIn } from "lucide-react";

<ActivityLogItem
  icon={LogIn}
  action="Ingelogd via wachtwoord"
  timestamp={new Date()}
  severity="info"
  detail="IP: 192.168.1.1"
/>
```

**Severity levels:** `info`, `success`, `warning`, `danger`

**Key features:**
- Relative time display (native `Intl.RelativeTimeFormat("nl")`)
- Severity-colored icon background
- Optional detail text

---

### SecurityStatusIndicator

**Purpose:** Displays a badge indicating security posture.

```tsx
import { SecurityStatusIndicator } from "@/components/security";

<SecurityStatusIndicator status="secure" label="Database versleuteld" />
```

**Statuses:** `secure`, `warning`, `critical`, `unknown`

**Key features:**
- Shield icon variant per status
- CVA-based styling
- Inline badge format

---

### SessionTimeoutWarning

**Purpose:** Warns users before auto-lock due to inactivity.

```tsx
import { SessionTimeoutWarning } from "@/components/security";

<SessionTimeoutWarning
  open={showWarning}
  secondsLeft={countdown}
  onDismiss={resetTimer}
  onLock={lockNow}
/>
```

**Key features:**
- mm:ss countdown display
- Red text when ≤30 seconds
- "Doorgaan" (continue) button extends session
- Optional "Nu vergrendelen" (lock now) button
- Dialog prevents other interaction

## Security UX Principles

1. **Default to hidden** — Sensitive values masked by default
2. **Confirm destructive** — No data deletion without explicit confirmation
3. **Time-box exposure** — Auto-hide revealed values
4. **Visual severity** — Color and icon convey risk level
5. **Explicit read-only** — Heir mode clearly communicated
6. **Audit everything** — All security events logged with severity
