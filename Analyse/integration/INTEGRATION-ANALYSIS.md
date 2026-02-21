# Lumio — Frontend-Backend Integration Analysis

## Executive Summary

After reading **every file** in the solution (backend API, frontend web app, Electron desktop shell), the root cause for the inability to save items (Accounts, Passwords, Insurance, and all other domain entities) has been identified.

**There are two critical interrelated bugs:**

1. **MISSING EIGENAAR PAGE** — The backend requires an "Eigenaar" (owner profile) to exist before ANY domain data can be saved. The frontend has **no page to create this profile**. Every POST endpoint returns HTTP 400 with the message *"Maak eerst een eigenaar profiel aan."* — but this error is never shown to the user.

2. **SILENT ERROR SWALLOWING** — All save handlers use `try/finally` without `catch`. When the API returns 400 (or any error), the error is thrown but never caught or displayed. The user sees the save button briefly loading, then nothing happens. No feedback whatsoever.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Root Cause #1: Missing Eigenaar Profile Page](#2-root-cause-1-missing-eigenaar-profile-page)
3. [Root Cause #2: Silent Error Handling in Save Operations](#3-root-cause-2-silent-error-handling-in-save-operations)
4. [Root Cause #3: No Onboarding Flow After First Setup](#4-root-cause-3-no-onboarding-flow-after-first-setup)
5. [Complete List of Affected Endpoints and Pages](#5-complete-list-of-affected-endpoints-and-pages)
6. [Fix Instructions for LLM](#6-fix-instructions-for-llm)
7. [File Inventory](#7-file-inventory)

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│  Electron Shell (lumio-desktop)                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │  .NET 10 Backend (Lumio.Api)                      │  │
│  │  - SQLCipher encrypted database                   │  │
│  │  - REST API on http://127.0.0.1:{port}            │  │
│  │  - Serves Next.js static export as static files   │  │
│  │  - Middleware: DatabaseUnlock → ExceptionHandling  │  │
│  ├───────────────────────────────────────────────────┤  │
│  │  Next.js Frontend (lumio-web, static export)      │  │
│  │  - React 19, Zustand, Tailwind CSS 4              │  │
│  │  - output: "export" (static HTML)                 │  │
│  │  - Relative API calls (/api/...)                  │  │
│  │  - Custom UI components (not Radix)               │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Flow

1. Electron spawns the .NET backend as a sidecar process
2. Backend starts on `http://127.0.0.1:{port}` (default 5123)
3. Backend serves the Next.js static export from `LUMIO_FRONTEND_DIR`
4. Electron's BrowserWindow loads the backend URL
5. Frontend makes API calls using relative paths (`/api/...`)
6. Database is encrypted with SQLCipher; user must unlock with master password
7. Middleware blocks all `/api/*` requests (except `/api/auth/*` and `/api/status`) when locked (HTTP 423)

### Authentication Flow

1. First run: User creates master password → `POST /api/auth/setup`
2. Subsequent runs: User unlocks with password → `POST /api/auth/ontgrendel`
3. After unlock: User is redirected to `/dashboard`
4. **PROBLEM**: There is no step to create the Eigenaar (owner) profile

---

## 2. Root Cause #1: Missing Eigenaar Profile Page

### The Problem

The backend `EigenaarController` provides full CRUD at `api/eigenaar`:
- `GET /api/eigenaar` — returns the owner profile (or 404 if not created)
- `POST /api/eigenaar` — creates the owner profile
- `PUT /api/eigenaar` — updates the owner profile

**However, the frontend has NO page that calls these endpoints.**

Looking at the sidebar navigation (`src/lumio-web/src/components/layout/Sidebar.tsx`):

```tsx
const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/testament", label: "Testament", icon: ScrollText },
  { href: "/euthanasie", label: "Wilsverklaring", icon: Stethoscope },
  { href: "/donor", label: "Donorregistratie", icon: Heart },
  { href: "/digitaal-bezit", label: "Digitaal Bezit", icon: Globe },
  { href: "/boedel", label: "Boedel", icon: Wallet },
  { href: "/uitvaart", label: "Uitvaartwensen", icon: Church },
  { href: "/documenten", label: "Documenten", icon: FileText },
  { href: "/erfgenamen", label: "Erfgenamen", icon: Users },
  { href: "/export", label: "Exporteren", icon: Download },
  { href: "/instellingen", label: "Instellingen", icon: Settings },
];
```

**No "Eigenaar" or "Profiel" link exists.** There is no `src/lumio-web/src/app/(authenticated)/eigenaar/page.tsx` file.

### The Impact

Every controller that creates domain data checks if an Eigenaar exists first:

| Controller | Endpoint | Error when no Eigenaar |
|---|---|---|
| `DigitaalBezitController` | `POST /api/digitaal-bezit/accounts` | 400: "Maak eerst een eigenaar profiel aan." |
| `DigitaalBezitController` | `POST /api/digitaal-bezit/wachtwoorden` | 400: "Maak eerst een eigenaar profiel aan." |
| `DigitaalBezitController` | `POST /api/digitaal-bezit/crypto` | 400: "Maak eerst een eigenaar profiel aan." |
| `BoedelController` | `POST /api/boedel/bezittingen` | 400: "Maak eerst een eigenaar profiel aan." |
| `BoedelController` | `POST /api/boedel/bankrekeningen` | 400: "Maak eerst een eigenaar profiel aan." |
| `BoedelController` | `POST /api/boedel/verzekeringen` | 400: "Maak eerst een eigenaar profiel aan." |
| `BoedelController` | `POST /api/boedel/schulden` | 400: "Maak eerst een eigenaar profiel aan." |
| `TestamentController` | `PUT /api/testament` (upsert) | 400: "Maak eerst een eigenaar profiel aan." |
| `EuthanasieController` | `PUT /api/euthanasie` (upsert) | 400: "Maak eerst een eigenaar profiel aan." |
| `UitvaartController` | `PUT /api/uitvaart` (upsert) | 400: "Maak eerst een eigenaar profiel aan." |
| `DonorController` | `PUT /api/donor` (upsert) | 400: "Maak eerst een eigenaar profiel aan." |
| `DocumentenController` | `POST /api/documenten/uploaden` | 400: "Maak eerst een eigenaar profiel aan." |

**Result**: After setup and unlock, the user can navigate to any page, but saving ANYTHING fails silently because no Eigenaar profile exists.

### Controllers that DO NOT require Eigenaar

Only `ErfgenamenController` and `ShamirController` work without an Eigenaar. These are the only controllers where saving would succeed.

---

## 3. Root Cause #2: Silent Error Handling in Save Operations

### The Pattern

All CRUD pages follow this pattern for save operations:

```tsx
const saveAccount = async () => {
  setSaving(true);
  try {
    const payload = { /* ... */ };
    if (editId) {
      await api.put(`/api/digitaal-bezit/accounts/${editId}`, payload);
    } else {
      await api.post("/api/digitaal-bezit/accounts", payload);  // ← THROWS on 400
    }
    setDialogType(null);  // ← NEVER REACHED on error
    loadData();           // ← NEVER REACHED on error
  } finally {
    setSaving(false);     // ← Always runs — button stops loading
  }
};
```

**Critical observation**: There is NO `catch` block. When `api.post()` throws (because the API returns HTTP 400), the error propagates as an **unhandled promise rejection**. The `finally` block runs, resetting the saving state, but:
- The dialog stays open (good, but confusing)
- No error message is shown to the user
- The browser console may show an error, but users don't look there
- The user has NO idea why saving failed

### The API Client

The API client (`src/lumio-web/src/lib/api-client.ts`) correctly extracts error messages:

```typescript
if (!res.ok) {
  const body = await res.json().catch(() => ({}));
  throw new Error(body.error || `HTTP ${res.status}`);
}
```

So when the backend returns `{ error: "Maak eerst een eigenaar profiel aan." }`, the Error object contains this message. **But no frontend code ever catches or displays it.**

### Pages Affected

| Page | Save Function | Has `catch`? | Shows Error? |
|---|---|---|---|
| `digitaal-bezit/page.tsx` | `saveAccount()` | ❌ No | ❌ No |
| `digitaal-bezit/page.tsx` | `saveWachtwoord()` | ❌ No | ❌ No |
| `digitaal-bezit/page.tsx` | `saveCrypto()` | ❌ No | ❌ No |
| `boedel/page.tsx` | `saveBezit()` | ❌ No | ❌ No |
| `boedel/page.tsx` | `saveRekening()` | ❌ No | ❌ No |
| `boedel/page.tsx` | `saveVerzekering()` | ❌ No | ❌ No |
| `boedel/page.tsx` | `saveSchuld()` | ❌ No | ❌ No |
| `erfgenamen/page.tsx` | `handleSave()` | ❌ No | ❌ No |
| `documenten/page.tsx` | `handleUpload()` | ❌ No | ❌ No |
| `testament/wizard/page.tsx` | `onComplete()` | ❌ No | ❌ No |
| `euthanasie/wizard/page.tsx` | `onComplete()` | ❌ No | ❌ No |
| `uitvaart/wizard/page.tsx` | `onComplete()` | ❌ No | ❌ No |
| `donor/formulier/page.tsx` | `onComplete()` | ❌ No | ❌ No |

**Only these pages have proper error handling:**
- `instellingen/page.tsx` — password change (has `catch`, displays error message)
- Auth forms (UnlockForm, SetupForm, HeirUnlockForm) — have `catch`, display errors

---

## 4. Root Cause #3: No Onboarding Flow After First Setup

After the user creates their master password (SetupForm), they are redirected to `/dashboard`. There is no onboarding wizard or prompt to:

1. Create their Eigenaar (owner) profile first
2. Understand that the profile is required before any data can be saved
3. Guide them through the initial setup steps

The dashboard simply shows cards linking to all domain areas, leading the user to believe they can start entering data immediately.

---

## 5. Complete List of Affected Endpoints and Pages

### Backend Controllers — Eigenaar Dependency Map

```
EigenaarController (/api/eigenaar)
  └── POST creates the Eigenaar profile ← THIS IS NEVER CALLED BY FRONTEND

DigitaalBezitController (/api/digitaal-bezit/*)
  ├── POST /accounts      → requires Eigenaar ❌
  ├── POST /wachtwoorden  → requires Eigenaar ❌
  └── POST /crypto        → requires Eigenaar ❌

BoedelController (/api/boedel/*)
  ├── POST /bezittingen    → requires Eigenaar ❌
  ├── POST /bankrekeningen → requires Eigenaar ❌
  ├── POST /verzekeringen  → requires Eigenaar ❌
  └── POST /schulden       → requires Eigenaar ❌

TestamentController (/api/testament)
  └── PUT /                → requires Eigenaar ❌

EuthanasieController (/api/euthanasie)
  └── PUT /                → requires Eigenaar ❌

UitvaartController (/api/uitvaart)
  └── PUT /                → requires Eigenaar ❌

DonorController (/api/donor)
  └── PUT /                → requires Eigenaar ❌

DocumentenController (/api/documenten)
  └── POST /uploaden       → requires Eigenaar ❌

ErfgenamenController (/api/erfgenamen)
  └── POST /               → does NOT require Eigenaar ✅

ShamirController (/api/shamir)
  └── POST /genereer       → does NOT require Eigenaar ✅
```

---

## 6. Fix Instructions for LLM

### Fix 1: Create Eigenaar Profile Page (CRITICAL)

**Create file**: `src/lumio-web/src/app/(authenticated)/eigenaar/page.tsx`

This page must:
- Call `GET /api/eigenaar` on mount to check if profile exists
- If NOT found (404): show a creation form
- If found: show the existing profile with edit capability
- Form fields matching `EigenaarUpsertRequest`:
  - `voornaam` (string, required)
  - `achternaam` (string, required)
  - `tussenvoegsel` (string, optional)
  - `geboortedatum` (DateOnly, required — send as `"YYYY-MM-DD"`)
  - `bsn` (string, optional)
  - `adres` (string, optional)
  - `postcode` (string, optional)
  - `woonplaats` (string, optional)
  - `telefoon` (string, optional)
  - `email` (string, optional)
  - `notaris` (string, optional)
  - `notarisKantoor` (string, optional)
- Use `POST /api/eigenaar` for creation, `PUT /api/eigenaar` for update
- Show success/error messages (unlike other pages)
- Follow the same component patterns as other pages (use Card, CardHeader, CardContent, Button, Input, Label, etc.)

**Backend DTO (for reference)**:
```csharp
public record EigenaarUpsertRequest(
    string Voornaam,
    string Achternaam,
    string? Tussenvoegsel,
    DateOnly Geboortedatum,
    string? BSN,
    string? Adres,
    string? Postcode,
    string? Woonplaats,
    string? Telefoon,
    string? Email,
    string? Notaris,
    string? NotarisKantoor);
```

**Note on case**: The API client sends JSON. C# record properties are PascalCase but ASP.NET Core's default JSON serializer (System.Text.Json) is configured in `Program.cs` without explicit case policy. Check the `Program.cs` configuration — the builder uses default settings which means **camelCase** serialization. The frontend must send properties in camelCase.

### Fix 2: Add Eigenaar Link to Sidebar

**Modify file**: `src/lumio-web/src/components/layout/Sidebar.tsx`

Add a new navigation item, ideally at the top (after Dashboard) or in a prominent position:

```tsx
{ href: "/eigenaar", label: "Mijn Profiel", icon: User }, // import User from lucide-react
```

### Fix 3: Add Error Handling to All Save Operations

**Modify ALL save handlers** in these files to add proper `catch` blocks with error display:

1. `src/lumio-web/src/app/(authenticated)/digitaal-bezit/page.tsx`
   - Functions: `saveAccount`, `saveWachtwoord`, `saveCrypto`
2. `src/lumio-web/src/app/(authenticated)/boedel/page.tsx`
   - Functions: `saveBezit`, `saveRekening`, `saveVerzekering`, `saveSchuld`
3. `src/lumio-web/src/app/(authenticated)/erfgenamen/page.tsx`
   - Function: `handleSave`
4. `src/lumio-web/src/app/(authenticated)/documenten/page.tsx`
   - Function: `handleUpload`
5. `src/lumio-web/src/app/(authenticated)/testament/wizard/page.tsx`
   - The `onComplete` handler passed to WizardShell
6. `src/lumio-web/src/app/(authenticated)/euthanasie/wizard/page.tsx`
   - The `onComplete` handler passed to WizardShell
7. `src/lumio-web/src/app/(authenticated)/uitvaart/wizard/page.tsx`
   - The `onComplete` handler passed to WizardShell
8. `src/lumio-web/src/app/(authenticated)/donor/formulier/page.tsx`
   - The `onComplete` handler passed to WizardShell

**Pattern to apply in each save handler:**

Each page needs:
1. A state variable for error messages: `const [error, setError] = useState<string | null>(null);`
2. Clear error at start of save: `setError(null);`
3. A `catch` block that extracts and displays the error message
4. Error display in the dialog/form UI

**Example transformation for `digitaal-bezit/page.tsx` `saveAccount`:**

```tsx
// BEFORE (broken):
const saveAccount = async () => {
  setSaving(true);
  try {
    const payload = { /* ... */ };
    if (editId) {
      await api.put(`/api/digitaal-bezit/accounts/${editId}`, payload);
    } else {
      await api.post("/api/digitaal-bezit/accounts", payload);
    }
    setDialogType(null);
    loadData();
  } finally {
    setSaving(false);
  }
};

// AFTER (fixed):
const saveAccount = async () => {
  setSaving(true);
  setError(null);
  try {
    const payload = { /* ... */ };
    if (editId) {
      await api.put(`/api/digitaal-bezit/accounts/${editId}`, payload);
    } else {
      await api.post("/api/digitaal-bezit/accounts", payload);
    }
    setDialogType(null);
    loadData();
  } catch (err) {
    setError(err instanceof Error ? err.message : "Opslaan mislukt.");
  } finally {
    setSaving(false);
  }
};
```

**Error display in dialog (add before DialogFooter):**

```tsx
{error && (
  <p className="text-sm text-red-600 mt-2">{error}</p>
)}
```

Also clear the error when opening or closing dialogs.

### Fix 4: Add Onboarding / Profile Check

**Option A: Dashboard redirect (recommended)**

Modify `src/lumio-web/src/app/(authenticated)/dashboard/page.tsx`:
- On mount, call `GET /api/eigenaar`
- If 404, show a prominent banner: "Vul eerst uw profiel in om te beginnen" with a link to `/eigenaar`
- This guides new users to create their profile first

**Option B: Authenticated layout check**

Modify `src/lumio-web/src/app/(authenticated)/layout.tsx`:
- On mount, check if Eigenaar exists via `GET /api/eigenaar`
- If not, redirect to `/eigenaar` with a setup message
- This forces profile creation before accessing any page

### Fix 5: Add Error Handling to Delete and Wizard Operations

**Delete operations** also lack error handling in several pages:

```tsx
// BEFORE:
const handleDelete = async (id: string) => {
  await api.delete(`/api/erfgenamen/${id}`);  // ← unhandled if fails
  loadData();
};

// AFTER:
const handleDelete = async (id: string) => {
  try {
    await api.delete(`/api/erfgenamen/${id}`);
    loadData();
  } catch (err) {
    setError(err instanceof Error ? err.message : "Verwijderen mislukt.");
  }
};
```

**WizardShell `onComplete`:** The WizardShell component wraps the `onComplete` in try/finally but has no error display. Either:
- Make `onComplete` handlers catch errors themselves, OR
- Add an `onError` prop to WizardShell that receives and displays error messages

### Fix 6: Export Page — Missing Error Display

The export page (`src/lumio-web/src/app/(authenticated)/export/page.tsx`) uses `fetch()` directly (not the `api` client) for PDF downloads. It has `catch {}` blocks that swallow errors. Add error display for failed exports.

### Summary of Changes Required

| Priority | What | File(s) | Effort |
|---|---|---|---|
| 🔴 Critical | Create Eigenaar profile page | New: `eigenaar/page.tsx` | Medium |
| 🔴 Critical | Add Eigenaar to sidebar | `Sidebar.tsx` | Trivial |
| 🔴 Critical | Add `catch` + error display to all save handlers | 8 page files | Medium |
| 🟡 Important | Add onboarding check on dashboard | `dashboard/page.tsx` | Small |
| 🟡 Important | Add error display to delete operations | 4 page files | Small |
| 🟢 Nice | Add `onError` support to WizardShell | `WizardShell.tsx` | Small |
| 🟢 Nice | Fix export page error handling | `export/page.tsx` | Small |

---

## 7. File Inventory

### Backend Files (all read and analyzed)

| File | Purpose |
|---|---|
| `src/Lumio.Api/Program.cs` | Entry point, DI, middleware, CORS, static files |
| `src/Lumio.Api/Data/LumioDbContext.cs` | EF Core context, 16 DbSets, relationships |
| `src/Lumio.Api/Middleware/DatabaseUnlockMiddleware.cs` | Blocks API when locked (423) |
| `src/Lumio.Api/Middleware/ExceptionHandlingMiddleware.cs` | Global error handler |
| `src/Lumio.Api/Controllers/AuthController.cs` | Setup, unlock, lock, password change |
| `src/Lumio.Api/Controllers/EigenaarController.cs` | Owner profile CRUD |
| `src/Lumio.Api/Controllers/ErfgenamenController.cs` | Heirs CRUD |
| `src/Lumio.Api/Controllers/DigitaalBezitController.cs` | Accounts, passwords, crypto CRUD |
| `src/Lumio.Api/Controllers/BoedelController.cs` | Assets, bank accounts, insurance, debts CRUD |
| `src/Lumio.Api/Controllers/TestamentController.cs` | Testament upsert, beneficiaries, executors |
| `src/Lumio.Api/Controllers/EuthanasieController.cs` | Euthanasia directive upsert, conditions |
| `src/Lumio.Api/Controllers/UitvaartController.cs` | Funeral wishes upsert, ceremony details |
| `src/Lumio.Api/Controllers/DonorController.cs` | Donor registration upsert, organ choices |
| `src/Lumio.Api/Controllers/DocumentenController.cs` | File upload/download/delete |
| `src/Lumio.Api/Controllers/ExportController.cs` | PDF export per domain |
| `src/Lumio.Api/Controllers/ShamirController.cs` | Shamir secret sharing |
| `src/Lumio.Api/Controllers/StatusController.cs` | Health check |
| `src/Lumio.Api/Services/Security/MasterPasswordService.cs` | SQLCipher password manager |
| `src/Lumio.Api/Services/Security/EncryptionService.cs` | AES-256-GCM field encryption |
| `src/Lumio.Api/Services/Security/ShamirService.cs` | Shamir secret sharing |
| `src/Lumio.Api/Services/Pdf/LumioPdfService.cs` | QuestPDF document generation |
| All Domain models (21 files) | Entity classes |
| All DTOs (11 files) | Request/response records |

### Frontend Files (all read and analyzed)

| File | Purpose |
|---|---|
| `src/lumio-web/src/app/layout.tsx` | Root layout (html, body) |
| `src/lumio-web/src/app/page.tsx` | Auth gate (setup/unlock/heir) |
| `src/lumio-web/src/app/(authenticated)/layout.tsx` | Sidebar + Header wrapper, auth guard |
| `src/lumio-web/src/app/(authenticated)/dashboard/page.tsx` | Card grid linking to all domains |
| `src/lumio-web/src/app/(authenticated)/digitaal-bezit/page.tsx` | 3-tab CRUD (accounts, passwords, crypto) |
| `src/lumio-web/src/app/(authenticated)/boedel/page.tsx` | 4-tab CRUD (assets, banks, insurance, debts) |
| `src/lumio-web/src/app/(authenticated)/erfgenamen/page.tsx` | Heirs CRUD + Shamir generation |
| `src/lumio-web/src/app/(authenticated)/testament/page.tsx` | Overview + wizard link |
| `src/lumio-web/src/app/(authenticated)/testament/wizard/page.tsx` | 5-step testament wizard |
| `src/lumio-web/src/app/(authenticated)/euthanasie/page.tsx` | Overview + wizard link |
| `src/lumio-web/src/app/(authenticated)/euthanasie/wizard/page.tsx` | 5-step euthanasia wizard |
| `src/lumio-web/src/app/(authenticated)/uitvaart/page.tsx` | Overview + wizard link |
| `src/lumio-web/src/app/(authenticated)/uitvaart/wizard/page.tsx` | 5-step funeral wizard |
| `src/lumio-web/src/app/(authenticated)/donor/page.tsx` | Overview + form link |
| `src/lumio-web/src/app/(authenticated)/donor/formulier/page.tsx` | Multi-step donor form |
| `src/lumio-web/src/app/(authenticated)/documenten/page.tsx` | File upload/download/delete |
| `src/lumio-web/src/app/(authenticated)/export/page.tsx` | PDF export per domain |
| `src/lumio-web/src/app/(authenticated)/instellingen/page.tsx` | Password change, security info |
| `src/lumio-web/src/lib/api-client.ts` | Fetch wrapper (get, post, put, delete, upload) |
| `src/lumio-web/src/lib/utils.ts` | cn() utility (clsx + tailwind-merge) |
| `src/lumio-web/src/stores/authStore.ts` | Zustand auth state |
| `src/lumio-web/src/components/ui/dialog.tsx` | Custom modal dialog |
| `src/lumio-web/src/components/ui/button.tsx` | Button with variants |
| `src/lumio-web/src/components/ui/input.tsx` | Styled input |
| `src/lumio-web/src/components/ui/select.tsx` | Styled native select |
| `src/lumio-web/src/components/ui/card.tsx` | Card components |
| `src/lumio-web/src/components/ui/badge.tsx` | Badge with variants |
| `src/lumio-web/src/components/ui/label.tsx` | Styled label |
| `src/lumio-web/src/components/ui/tabs.tsx` | Custom tabs (not Radix) |
| `src/lumio-web/src/components/ui/textarea.tsx` | Styled textarea |
| `src/lumio-web/src/components/layout/Sidebar.tsx` | Navigation sidebar |
| `src/lumio-web/src/components/layout/Header.tsx` | Lock button header |
| `src/lumio-web/src/components/auth/UnlockForm.tsx` | Password unlock form |
| `src/lumio-web/src/components/auth/SetupForm.tsx` | First-run setup form |
| `src/lumio-web/src/components/auth/HeirUnlockForm.tsx` | Shamir reconstruction form |
| `src/lumio-web/src/components/wizard/WizardShell.tsx` | Reusable multi-step wizard |

### Desktop Files (all read and analyzed)

| File | Purpose |
|---|---|
| `src/lumio-desktop/src/main/index.ts` | Electron entry point |
| `src/lumio-desktop/src/main/paths.ts` | Path resolution (dev vs packaged) |
| `src/lumio-desktop/src/main/sidecar.ts` | Backend process management |
| `src/lumio-desktop/src/main/window.ts` | BrowserWindow creation |
| `src/lumio-desktop/src/preload/index.ts` | Context bridge (lumio.platform, lumio.isElectron) |
| `src/lumio-desktop/electron-builder.yml` | Build configuration |
| `src/lumio-desktop/package.json` | Dependencies (Electron 35, get-port) |

---

## Appendix: Additional Minor Issues Observed

1. **`openapi-ts.config.ts`** exists in lumio-web but is not used — no generated API client types are imported anywhere. All types are manually defined inline in page components.

2. **`react-hook-form` and `zod`** are installed as dependencies but never used. All forms use plain `useState` for form state.

3. **Duplicate type definitions** — Each page file defines its own TypeScript interfaces for API responses inline. These are duplicated across files (e.g., `Erfgenaam` type defined in erfgenamen page, but also needed if referenced elsewhere).

4. **No loading/error states on initial data fetch** — When `loadData()` is called and the GET request fails (e.g., `.catch(() => [])`), the page shows an empty state with no error indication.

5. **Download in export page uses raw `fetch()`** instead of the api client, missing the base URL handling that would be needed if `NEXT_PUBLIC_API_URL` were configured.

6. **The `documenten/page.tsx` download handler** also uses raw `fetch()` without base URL.
