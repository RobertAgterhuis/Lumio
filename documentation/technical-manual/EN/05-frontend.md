# 5 — Frontend

## Overview

The frontend is a **Next.js 16** application built as a **static export**. There are no server-side functions — all communication goes through the REST API.

| Property | Value |
|----------|-------|
| Framework | Next.js 16.1.6 |
| React | 19.2.4 |
| Bundler | Turbopack |
| Export | Static (`output: 'export'`) |
| Styling | Tailwind CSS 4 + CVA |
| State | Zustand 5 |
| Forms | React Hook Form + Zod 4 |
| i18n | next-intl 4 |
| Icons | Lucide React |

## Pages (22 routes)

### Public

| Route | Page | Purpose |
|-------|------|---------|
| `/` | Login/Setup | Profile selection, password, first-time setup |

### Authenticated (route group `(authenticated)`)

| Route | Page | Purpose |
|-------|------|---------|
| `/dashboard` | Dashboard | Overview, progress, domain cards, statistics |
| `/eigenaar` | My Profile | Personal data, photo, contact info |
| `/testament` | Will | Will data, beneficiaries, executors, snapshots |
| `/testament/wizard` | Will Wizard | Step-by-step guided entry |
| `/euthanasie` | Advance Directive | Euthanasia directive, conditions |
| `/euthanasie/wizard` | Euthanasia Wizard | Guided entry |
| `/donor` | Organ Donation | Donor choice |
| `/donor/formulier` | Donor Wizard | Step-by-step donor form |
| `/digitaal-bezit` | Digital Assets | Online accounts, passwords, crypto |
| `/boedel` | Estate | Possessions, bank accounts, insurance, debts |
| `/uitvaart` | Funeral Wishes | Funeral preferences, ceremony, guests |
| `/uitvaart/wizard` | Funeral Wizard | Guided entry |
| `/erfgenamen` | Heirs | Heir management, assignments, Shamir |
| `/noodcontacten` | Emergency Contacts | Emergency contact persons, QR emergency card |
| `/documenten` | Documents | Upload, version management, download |
| `/videoboodschappen` | Video Messages | Upload, record, and manage personal video messages for heirs |
| `/export` | Export | PDF/JSON/XML/CSV/NUV export |
| `/instellingen` | Settings | Password, language, theme, backup |
| `/audit-log` | Activity Log | Security log |
| `/tijdlijn` | Death Timeline | Chronological overview |

### Layout

The `(authenticated)` route group shares a layout with:
- **Header** — Profile name, search bar (Ctrl+K), theme toggle, lock button
- **Sidebar** — Navigation to all domains
- **Error boundary** — Catches render errors

Each domain route segment also has its own `layout.tsx` containing a `DomainMessagesProvider` that loads domain-specific translation namespaces (see [Chapter 8 — Internationalization](./08-internationalization.md#runtime-bundle-splitting)).

## Components (14 groups)

### UI Primitives (`components/ui/`)

Reusable building blocks, each with a Storybook story:

| Component | Variants |
|-----------|----------|
| `Button` | default, destructive, outline, secondary, ghost, link × sm/default/lg/icon |
| `Badge` | default, secondary, destructive, outline, success, warning, security, info, danger |
| `StatusBadge` | CVA-based status indicator: actief, inactief, concept, voltooid, waarschuwing, fout |
| `Alert` | info, success, warning, danger, security |
| `Card` | CardHeader, CardTitle, CardDescription, CardContent, CardFooter |
| `Dialog` | DialogHeader, DialogTitle, DialogDescription, DialogFooter |
| `FormField` | Form field wrapper with label, error, help text |
| `Input` | Standard text field |
| `Textarea` | Multi-line |
| `Select` | Native select with styling |
| `Checkbox` | With label |
| `Label` | Form label |
| `Tabs` | TabsList, TabsTrigger, TabsContent |
| `Progress` | Progress bar |
| `Skeleton` | Loading placeholder (pulse/shimmer variants, shape presets: line/circle/card/button) |
| `SkeletonText` | Multi-line text loading state |
| `SkeletonAvatar` | Avatar + text loading state |
| `SkeletonCard` | Card content loading state |
| `Toast` | Toast notification display (success/error/warning/info) |
| `HelpTooltip` | Information tooltip |

### Layout (`components/layout/`)

| Component | Purpose |
|-----------|---------|
| `Header` | Application header with search, theme, lock |
| `Sidebar` | Navigation menu |
| `SearchDialog` | Command palette (Ctrl+K) with search, quick navigation, recent searches |
| `ShortcutsDialog` | Keyboard shortcuts overview |
| `NotificationsDropdown` | Notifications |
| `IdleWarningDialog` | Inactivity warning |
| `ErrorBoundary` | Error handling |

### Authentication (`components/auth/`)

| Component | Purpose |
|-----------|---------|
| `ProfileSelector` | Profile selection |
| `SetupForm` | First-time setup |
| `UnlockForm` | Password entry |
| `HeirUnlockForm` | Shamir unlock (heirs) |
| `PasswordStrengthMeter` | Password strength indicator |

### Dashboard (`components/dashboard/`)

| Component | Purpose |
|-----------|---------|
| `ProfielSuggesties` | Recommendations for missing data |
| `StatistiekenWidget` | Summary statistics |
| `VoortgangGranulair` | Detailed per-field progress |
| `MeldingenWidget` | Dashboard notifications widget |
| `BackupStatusWidget` | Backup recency indicator |
| `AanbevolenStapWidget` | Next recommended domain to complete |
| `DocumentenVerloopdatumWidget` | Documents approaching expiry |
| `SortableDomeinKaart` | Draggable domain card (DnD sortable) |
| `SortableSection` | Draggable dashboard section wrapper |

### Domain (`components/domain/`)

| Component | Purpose |
|-----------|---------|
| `DomainStatusBanner` | Status and actualization banner per domain |

### Security (`components/security/`)

See chapter 4 (Security) for the full list.

### Wizards (`components/wizard/`)

| Component | Purpose |
|-----------|---------|
| `WizardShell` | Reusable wizard container with steps, progress, navigation |
| `OnboardingWizard` | Introduction wizard for new users |
| `InterviewWizard` | Guided entry mode |

**WizardShell Props (localStorage persistence):**

| Prop | Type | Purpose |
|------|------|---------|
| `initialStep` | number | Starting step index (from persisted state) |
| `onStepChange` | (step: number, data: FormData) => void | Callback when step changes (for persistence) |
| `wasRestored` | boolean | Show "resume from where you left off" banner |
| `onClearProgress` | () => void | Callback to clear saved progress |

### Other Component Groups

| Group | Components |
|-------|------------|
| `common/` | `LanguageSelector` |
| `erfgenamen/` | `ErfbelastingCalculator` |
| `testament/` | `JuridischeCheck` |
| `instellingen/` | `DataHandtekening` |
| `notities/` | `SectieNotitie` |
| `nabestaanden/` | `NabestaandenDashboard` |
| `noodcontacten/` | `NoodkaartQR` |
| `tijdlijn/` | `TijdlijnStapRow` |
| `videoboodschappen/` | `VideoboodschapDialog`, `VideoRecorder`, `useVideoboodschappen` |
| `providers/` | `LocaleProvider`, `DomainMessagesProvider` |
| Root | `PasswordGenerator`, `PersonSelect`, `PersonCreateInlineDialog`, `VoorbeeldDialog` |

## Stores (Zustand)

### `authStore`

Manages authentication and unlock status:

| State | Type | Purpose |
|-------|------|---------|
| `isUnlocked` | boolean | Database unlocked? |
| `isFirstRun` | boolean | First launch (no profile yet)? |
| `isReadOnly` | boolean | Heir mode (read-only)? |
| `isLoading` | boolean | Application initialising? |
| `profiles` | Profile[] | All profiles for this Lumio installation |
| `activeProfile` | Profile \| null | Currently active profile |
| `profileSelected` | boolean | Whether a profile has been selected |
| `profileNeedsSetup` | boolean | First-time setup required? |
| `profileFotoVersion` | number | Incremented to force photo refresh |

### `preferencesStore`

Manages user preferences (localStorage-persisted, keyed by profile ID):

| State | Type | Purpose |
|-------|------|---------|
| `showVoortgang` | boolean | Show progress widget |
| `showStatistieken` | boolean | Show statistics widget |
| `showVoortgangGranulair` | boolean | Show detailed per-field progress |
| `showSuggesties` | boolean | Show smart suggestions widget |
| `showMeldingen` | boolean | Show notifications widget |
| `showBackup` | boolean | Show backup status widget |
| `showAanbevolen` | boolean | Show recommended next step widget |
| `showVerloopdatum` | boolean | Show document expiry widget |
| `hiddenDomeinKaarten` | string[] | Domain card names that are hidden |
| `domeinKaartenVolgorde` | string[] | Custom order of domain cards |
| `sectieVolgorde` | string[] | Custom order of dashboard sections |
| `instellingenVolgordeLinks` | string[] | Order of left column in Settings |
| `instellingenVolgordeRechts` | string[] | Order of right column in Settings |
| `sidebarCollapsed` | boolean | Sidebar collapsed state |

### `toastStore`

Manages toast notifications:

| State | Type | Purpose |
|-------|------|---------|
| `toasts` | Toast[] | Active toast messages |
| `addToast` | Function | Add a new toast |
| `removeToast` | Function | Remove toast by ID |
| `clearToasts` | Function | Remove all toasts |

**Convenience API:** `toast.success()`, `toast.error()`, `toast.warning()`, `toast.info()`

### `helpStore`

Manages the state of the help panel:

| State | Type | Purpose |
|-------|------|---------|
| `isOpen` | boolean | Help panel visible? |
| `activeSection` | string \| null | Currently active help topic |
| `openHelp` | Function | Open the panel (optionally with a section) |
| `closeHelp` | Function | Close the panel |

## Data Fetching (React Query)

The application uses [TanStack Query](https://tanstack.com/query) (React Query) for server state management, with custom domain-specific hooks.

### Query Hooks

| Hook | Purpose |
|------|---------|
| `useDomainQuery<T>(endpoint)` | Fetch domain entity list with caching |
| `useDomainDetailQuery<T>(endpoint, id)` | Fetch single entity by ID |

```tsx
// Example: Fetch bezittingen list
const { data: bezittingen, isLoading } = useDomainQuery<FysiekBezit[]>("boedel/bezittingen");

// Example: Fetch single item
const { data: bezit } = useDomainDetailQuery<FysiekBezit>("boedel/bezittingen", id);
```

### Mutation Hooks

| Hook | Purpose |
|------|---------|
| `useDomainCreate<T, V>(endpoint)` | Create new entity |
| `useDomainUpdate<T, V>(endpoint)` | Update existing entity |
| `useDomainDelete(endpoint)` | Delete entity by ID |
| `useDomainMutations<T, V>(endpoint)` | Combined create/update/delete |

```tsx
// Convenience hook returning all three mutations
const { create, update, remove } = useDomainMutations<FysiekBezit, BezitFormData>(
  "boedel/bezittingen"
);

await create.mutateAsync(formData);
await update.mutateAsync({ id, data: formData });
await remove.mutateAsync(id);
```

### Query Key Factory

```ts
domainKeys.all(domain)           // ['domain', 'boedel/bezittingen']
domainKeys.detail(domain, id)    // ['domain', 'boedel/bezittingen', '123']
domainKeys.list(domain, params)  // ['domain', 'boedel/bezittingen', 'list', {...}]
```

## Toast Notifications

Global toast notification system using Zustand.

### Toast Store (`stores/toastStore.ts`)

```tsx
import { toast } from "@/stores/toastStore";

// Show notifications
toast.success("Saved successfully");
toast.error("Something went wrong");
toast.warning("Please review your input");
toast.info("New update available");

// With custom duration (ms)
toast.success("Saved!", 5000);
```

### Toast Variants

| Variant | Purpose |
|---------|---------|
| `success` | Confirmation of successful action |
| `error` | Error messages |
| `warning` | Warning/caution messages |
| `info` | Informational messages |

### ToastProvider Component

Renders active toasts in bottom-right corner. Wrapped in app layout.

## Hooks

| Hook | Purpose |
|------|---------|
| `useDomainQuery` | React Query wrapper for domain data fetching |
| `useDomainDetailQuery` | Fetch single entity by ID |
| `useDomainCreate` | Create mutation with cache invalidation |
| `useDomainUpdate` | Update mutation with cache invalidation |
| `useDomainDelete` | Delete mutation with cache invalidation |
| `useDomainMutations` | Combined CRUD mutations |
| `useDocumenten` | Documents fetch, upload, and delete |
| `useFieldHelp` | Context-sensitive help text per form field |
| `useHelpSearch` | Full-text search in help content |
| `useIdleTimer` | Detects inactivity, auto-lock after timeout |
| `useKeyboardShortcuts` | Global keyboard shortcuts (Ctrl+K search, etc.) |
| `useTheme` | Theme toggle (light/dark), localStorage-persistent |
| `useWizardProgress` | Wizard step/form persistence in localStorage |

### useWizardProgress

Persists wizard progress (current step, form data) to localStorage for resume capability.

```tsx
const {
  currentStep,
  setCurrentStep,
  formData,
  updateFormData,
  wasRestored,
  clearProgress,
  markComplete,
  hasSavedProgress,
} = useWizardProgress({
  wizardId: "testament",
  totalSteps: 5,
  initialFormData: {},
  clearOnComplete: true,
});
```

**Utility functions:**
- `getWizardsWithProgress()` — Returns array of wizard IDs with saved progress
- `clearAllWizardProgress()` — Clears all wizard progress from localStorage

## API Client (`lib/api-client.ts`)

Thin `fetch` wrapper around the backend API:

| Method | Purpose |
|--------|---------|
| `api.get<T>(url)` | GET with JSON parsing |
| `api.post<T>(url, body)` | POST with JSON |
| `api.put<T>(url, body)` | PUT with JSON |
| `api.delete(url)` | DELETE |
| `api.deleteWithBody(url, body)` | DELETE with body |
| `api.upload<T>(url, formData)` | POST FormData |
| `api.download(url, body?)` | Download blob + filename |

**Special handling:**
- HTTP 423 → Database is locked (special error message)
- HTTP 204 → Returns `undefined`
- `Accept-Language` header is automatically included (from localStorage)

---

## Accessibility (WCAG 2.1 AA)

Lumio targets **WCAG 2.1 AA** as the minimum standard, required by the EU Accessibility Act (EAA) as of 28 June 2025.

### Language attribute

```tsx
// src/lumio-web/src/app/layout.tsx
<html lang={locale}  // default: "nl" via i18n/request.ts
```

The `lang` attribute is set dynamically via `getLocale()` (next-intl). Default value is `"nl"` (see `src/i18n/request.ts`). Screen readers use this attribute to activate the correct language engine (SC 3.1.1).

### skip-to-content

All layouts include a skip-navigation link that becomes visible on tab focus (SC 2.4.1):

```tsx
// Pattern present in root layout, authenticated layout, and marketing site layout
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] ..."
>
  {t("skipNaarInhoud")}   {/* or "Ga naar hoofdinhoud" */}
</a>
// ...
<main id="main-content" className="...">   {/* SC 2.4.1 target */}
```

Implementation locations:

| File | Skip-link | Target |
|---|---|---|
| `src/lumio-web/src/app/layout.tsx` | line 51-56 | line 59 (`div#main-content`) |
| `src/lumio-web/src/app/(authenticated)/layout.tsx` | line 120-123 | line 139 (`main#main-content`) |
| `site/src/app/layout.tsx` | line 60-65 | line 66 (`main#main-content`) |

### axe-playwright / Storybook a11y (CI)

Automatic WCAG detection runs in CI via the `a11y` job in `.github/workflows/ci.yml`. The job uses `@storybook/addon-vitest` + `@storybook/addon-a11y` to scan all Storybook stories with axe-core:

```bash
# Run locally:
npm run test:storybook    # src/lumio-web

# CI: triggered automatically on every PR/push to main (needs: [frontend])
```

Implemented in Sprint 1 (SP-ACC1-001).

### ARIA live regions — Toast notifications

Toasts use differentiated ARIA roles per variant (SC 4.1.3):

```tsx
// src/lumio-web/src/components/ui/toast.tsx
<div
  role={variant === "error" || variant === "warning" ? "alert" : "status"}
  ...
>
```

| Variant | Role | ARIA live | Reason |
|---|---|---|---|
| `error`, `warning` | `role="alert"` | assertive | Critical — interrupts screen reader |
| `success`, `info` | `role="status"` | polite | Non-critical — waits for silence |

Implemented in Sprint 1 (SP-ACC1-003).

### Form errors (role="alert")

`FormField.Error` uses `role="alert"` so screen readers announce errors immediately (SC 4.1.3). Inputs additionally carry `aria-invalid`, `aria-describedby`, and `aria-required`. Pre-existing, confirmed Sprint 1 (SP-ACC1-004).

### Confirmation dialogs for legally significant operations (SC 3.3.4)

Legally/medically significant saves (testament, euthanasia advance directive, donor preference) require explicit confirmation before committing. Component: `ConfirmJuridischDialog` at `src/lumio-web/src/components/security/ConfirmJuridischDialog.tsx`.

Applied to: euthanasie/page.tsx, testament/wizard/page.tsx, donor/formulier/page.tsx. Implemented Sprint 1 (SP-ACC1-006).

### Remaining items (Sprint 2+)

| Item | Sprint | SC | Priority |
|---|---|---|---|
| Color token contrast corrections: `warning`, `danger`, `success`, `muted-foreground` | Sprint 2 | SC 1.4.3 | **CRITICAL** (warning: 2.19:1) |
| lang attribute E2E test | Sprint 2 | SC 3.1.1 | P2 |
| Skip-link Playwright test | Sprint 2 | SC 2.4.1 | P2 |

**Contrast audit findings (Sprint 1 SP-ACC1-007):**

| Token | Fg | Bg | Ratio | Status |
|---|---|---|---|---|
| `--color-warning` on `--color-warning-100` | #D4A017 | #FFF8E1 | ~2.19:1 | ❌ FAIL |
| `--color-danger` on `--color-danger-100` | #B44A4A | #FDE8E8 | ~4.24:1 | ⚠️ FAIL normal text |
| `--color-success` on `--color-success-100` | #5E8C61 | #E8F5E9 | ~3.30:1 | ⚠️ FAIL normal text |
| `--color-muted-foreground` on card/bg | #6B7280 | #FFF/#F3F7F8 | ~4.14-4.29:1 | ⚠️ FAIL normal text |
| `--color-foreground` on background | #1F2933 | #F3F7F8 | ~11.9:1 | ✅ PASS |
| `--color-info` on `--color-info-100` | #3A506B | #E3EDF5 | ~6.32:1 | ✅ PASS |

