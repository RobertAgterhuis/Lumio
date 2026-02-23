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
| `/export` | Export | PDF/JSON/XML/CSV/NUV export |
| `/instellingen` | Settings | Password, language, theme, backup |
| `/audit-log` | Activity Log | Security log |
| `/tijdlijn` | Death Timeline | Chronological overview |

### Layout

The `(authenticated)` route group shares a layout with:
- **Header** — Profile name, search bar (Ctrl+K), theme toggle, lock button
- **Sidebar** — Navigation to all domains
- **Error boundary** — Catches render errors

## Components (14 groups)

### UI Primitives (`components/ui/`)

Reusable building blocks, each with a Storybook story:

| Component | Variants |
|-----------|----------|
| `Button` | default, destructive, outline, secondary, ghost, link × sm/default/lg/icon |
| `Badge` | default, secondary, destructive, outline, success, warning, security, info, danger |
| `Alert` | info, success, warning, danger, security |
| `Card` | CardHeader, CardTitle, CardDescription, CardContent, CardFooter |
| `Dialog` | DialogHeader, DialogTitle, DialogDescription, DialogFooter |
| `Input` | Standard text field |
| `Textarea` | Multi-line |
| `Select` | Native select with styling |
| `Checkbox` | With label |
| `Label` | Form label |
| `Tabs` | TabsList, TabsTrigger, TabsContent |
| `Progress` | Progress bar |
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
| `providers/` | `LocaleProvider` |
| Root | `PasswordGenerator`, `PersonSelect`, `VoorbeeldDialog` |

## Stores (Zustand)

### `authStore`

Manages authentication and unlock status:

| State | Type | Purpose |
|-------|------|---------|
| `isLocked` | boolean | Database locked? |
| `isReadOnly` | boolean | Heir mode? |
| `profileId` | string | Current profile ID |
| `profileName` | string | Profile name |

### `preferencesStore`

Manages user preferences (localStorage-persisted):

| State | Type | Purpose |
|-------|------|---------|
| `showVoortgang` | boolean | Show dashboard progress indicator |
| `showVoortgangGranulair` | boolean | Show detailed progress |
| `showSuggesties` | boolean | Show suggestions |
| `showDomeinKaarten` | boolean | Show domain cards |
| `finishedDomains` | Record<string, string> | Domain → ISO date when completed |

## Hooks

| Hook | Purpose |
|------|---------|
| `useIdleTimer` | Detects inactivity, auto-lock after timeout |
| `useKeyboardShortcuts` | Global keyboard shortcuts (Ctrl+K search, etc.) |
| `useTheme` | Theme toggle (light/dark), localStorage-persistent |

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
