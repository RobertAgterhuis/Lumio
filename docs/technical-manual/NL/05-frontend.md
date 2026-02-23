# 5. Frontend (Next.js)

## 5.1 Overzicht

De frontend is een Next.js 16.1.6 applicatie met `output: "export"` (statische generatie). De gebouwde bestanden worden door de .NET-backend geserveerd als statische bestanden.

### Kernafhankelijkheden

| Package | Versie | Doel |
|---------|--------|------|
| `next` | 16.1.6 | React framework (App Router) |
| `react` | 19.2.4 | UI-framework |
| `tailwindcss` | 4.2.0 | Utility-first CSS (v4 syntax) |
| `zustand` | 5.0.11 | Globale state management |
| `react-hook-form` | 7.71.1 | Formulierbeheer |
| `zod` | 4.3.6 | Schema-validatie |
| `@hookform/resolvers` | 5.1.0 | Zod-integratie voor react-hook-form |
| `lucide-react` | 0.575.0 | Iconen |
| `clsx` + `tailwind-merge` | — | CSS class utilities |
| `qrcode` | 1.5.4 | QR-code generatie |
| `date-fns` | 4.1.0 | Datumformattering |

## 5.2 Projectstructuur

```
src/lumio-web/src/
├── app/
│   ├── globals.css                 ← Design tokens & thema
│   ├── global-error.tsx            ← Globale error boundary
│   ├── layout.tsx                  ← Root layout
│   ├── page.tsx                    ← Login/unlock pagina
│   └── (authenticated)/
│       ├── layout.tsx              ← Auth guard, sidebar, header
│       ├── error.tsx               ← Error boundary
│       ├── audit-log/page.tsx
│       ├── boedel/page.tsx
│       ├── dashboard/page.tsx
│       ├── digitaal-bezit/page.tsx
│       ├── documenten/page.tsx
│       ├── donor/
│       │   ├── page.tsx
│       │   └── formulier/page.tsx
│       ├── eigenaar/page.tsx
│       ├── erfgenamen/page.tsx
│       ├── euthanasie/
│       │   ├── page.tsx
│       │   └── wizard/page.tsx
│       ├── export/page.tsx
│       ├── instellingen/page.tsx
│       ├── noodcontacten/page.tsx
│       ├── testament/
│       │   ├── page.tsx
│       │   └── wizard/page.tsx
│       ├── tijdlijn/page.tsx
│       └── uitvaart/
│           ├── page.tsx
│           └── wizard/page.tsx
├── components/
│   ├── PasswordGenerator.tsx
│   ├── VoorbeeldDialog.tsx
│   ├── auth/          (5 componenten)
│   ├── dashboard/     (3 componenten)
│   ├── erfgenamen/    (1 component)
│   ├── instellingen/  (1 component)
│   ├── interview/     (1 component)
│   ├── layout/        (6 componenten)
│   ├── nabestaanden/  (1 component)
│   ├── noodcontacten/ (1 component)
│   ├── notities/      (1 component)
│   ├── testament/     (1 component)
│   ├── ui/            (10 componenten)
│   └── wizard/        (2 componenten)
├── hooks/
│   ├── useIdleTimer.ts
│   ├── useKeyboardShortcuts.ts
│   └── useTheme.ts
├── lib/
│   ├── api-client.ts
│   ├── utils.ts
│   ├── afsluit-instructies.ts
│   └── voorbeeld-data.ts
└── stores/
    └── authStore.ts
```

## 5.3 Routing & pagina's

### Route-groep: (authenticated)

Alle pagina's behalve de loginpagina zijn genest in de `(authenticated)` route-groep. Deze groep deelt een layout die:

1. **Auth guard:** Controleert `GET /api/auth/status` bij refresh — redirect naar `/` als niet ontgrendeld
2. **Idle timer:** `useIdleTimer` bewaakt inactiviteit en vergrendelt automatisch
3. **Keyboard shortcuts:** `useKeyboardShortcuts` activeert navigatie- en actiesneltoetsen
4. **Sidebar + Header:** Vast navigatiekader
5. **Read-only banner:** Toont waarschuwing bij erfgenaam-modus
6. **Onboarding wizard:** `OnboardingWizard` voor nieuwe gebruikers

### Pagina-overzicht

| Route | Pagina | Beschrijving |
|-------|--------|-------------|
| `/` | Login | Profiel selectie, wachtwoord invoer, setup, erfgenaam-unlock |
| `/dashboard` | Dashboard | Overzicht met voortgang, statistieken, suggesties |
| `/eigenaar` | Persoonsgegevens | Eigenaargegevens beheren |
| `/testament` | Testament | Testamentgegevens, begunstigden, executeurs |
| `/testament/wizard` | Testament wizard | Stapsgewijze testamentinvoer |
| `/euthanasie` | Euthanasie | Wilsverklaring euthanasie |
| `/euthanasie/wizard` | Euthanasie wizard | Stapsgewijze invoer |
| `/donor` | Donorregistratie | Donorkeuzes |
| `/donor/formulier` | Donorformulier | Gedetailleerd donorformulier |
| `/digitaal-bezit` | Digitaal bezit | Accounts, wachtwoorden, crypto |
| `/boedel` | Boedel | Bezittingen, bankrekeningen, verzekeringen, schulden |
| `/uitvaart` | Uitvaart | Uitvaartwensen |
| `/uitvaart/wizard` | Uitvaart wizard | Stapsgewijze invoer |
| `/erfgenamen` | Erfgenamen | Erfgenamen & Shamir-beheer |
| `/noodcontacten` | Noodcontacten | Noodcontacten beheren |
| `/documenten` | Documenten | Document upload & beheer |
| `/export` | Export | PDF/backup export |
| `/audit-log` | Audit log | Audit trail inzien |
| `/tijdlijn` | Tijdlijn | Chronologisch activiteitenoverzicht |
| `/instellingen` | Instellingen | Wachtwoord wijzigen, thema, timeout, grote tekst |

## 5.4 Componenten

### Auth-componenten

| Component | Beschrijving |
|-----------|-------------|
| `ProfileSelector` | Profiel selectie/aanmaken bij opstarten |
| `SetupForm` | Eerste wachtwoord instellen voor nieuw profiel |
| `UnlockForm` | Wachtwoord invoer voor bestaand profiel |
| `HeirUnlockForm` | Shamir-shares invoer voor erfgenaam-toegang |
| `PasswordStrengthMeter` | Visuele wachtwoordsterkte-indicator |

### Dashboard-componenten

| Component | Beschrijving |
|-----------|-------------|
| `VoortgangGranulair` | Gedetailleerde voortgangsbalk per sectie |
| `StatistiekenWidget` | Numeriek overzicht van alle secties |
| `ProfielSuggesties` | Suggesties voor ontbrekende gegevens |

### Layout-componenten

| Component | Beschrijving |
|-----------|-------------|
| `Sidebar` | Navigatiebalk met secties en iconen |
| `Header` | Bovenste balk met profiel, vergrendel-knop |
| `ErrorBoundary` | Vangt fouten op en toont foutmelding |
| `IdleWarningDialog` | Waarschuwing bij naderende auto-lock |
| `SearchDialog` | Ctrl+K zoekdialoog voor navigatie |
| `ShortcutsDialog` | Overzicht van sneltoetsen (?) |

### Domein-componenten

| Component | Beschrijving |
|-----------|-------------|
| `ErfbelastingCalculator` | Erfbelasting berekening per erfgenaam |
| `JuridischeCheck` | Juridische validatie van testamentgegevens |
| `NoodkaartQR` | QR-code generatie voor noodcontactkaart |
| `SectieNotitie` | Herbruikbare notitie-editor per sectie |
| `DataHandtekening` | SHA-256 integriteitscontrole van database |
| `NabestaandenDashboard` | Dashboard voor erfgenaam-modus |
| `InterviewWizard` | Gespreksvorm voor gegevensinvoer |

### Wizard-componenten

| Component | Beschrijving |
|-----------|-------------|
| `OnboardingWizard` | Eerste-gebruik stappenwizard |
| `WizardShell` | Herbruikbare wizard-wrapper (stappen, navigatie) |

### UI-primitieven

| Component | Gebaseerd op |
|-----------|-------------|
| `badge` | span met kleurvarianten |
| `button` | button met variant/size |
| `card` | Container met header/content/footer |
| `dialog` | Modal overlay |
| `help-tooltip` | Tooltip met vraagteken-icoon |
| `input` | Gestileerd text input |
| `label` | Form label |
| `select` | Native HTML select (geen radix) |
| `tabs` | Tab-navigatie |
| `textarea` | Multi-line text input |

### Gedeelde componenten

| Component | Beschrijving |
|-----------|-------------|
| `PasswordGenerator` | Willekeurig wachtwoord genereren met opties |
| `VoorbeeldDialog` | Toon voorbeeldgegevens per sectie |

## 5.5 State Management

### Zustand Store: `authStore`

Globale authenticatiestatus, persistent in geheugen (niet in localStorage).

```typescript
interface AuthState {
  isUnlocked: boolean;        // Database ontgrendeld?
  isFirstRun: boolean;        // Eerste keer?
  isReadOnly: boolean;        // Erfgenaam-modus?
  isLoading: boolean;         // Status wordt gecontroleerd?
  profiles: Profile[];        // Beschikbare profielen
  activeProfile: Profile | null; // Actief profiel
  profileSelected: boolean;   // Profiel geselecteerd?
  profileNeedsSetup: boolean; // Profiel heeft setup nodig?
  lock: () => void;           // Reset alle auth state
}
```

Bij page refresh gaat de Zustand-state verloren. De authenticated layout herstelt dit door `GET /api/auth/status` te bellen bij mount.

### Geen client-side routing state

Elke pagina haalt data direct op via de API-client. Er is geen centrale data-cache of query-library (zoals React Query). Dit houdt de architectuur simpel maar betekent dat elke paginanavigatie opnieuw data ophaalt.

## 5.6 API-client

### Implementatie

Dunne `fetch()` wrapper in `lib/api-client.ts`:

```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export const api = {
  get:    <T>(path) => request<T>(path),
  post:   <T>(path, body?) => request<T>(path, { method: "POST", ... }),
  put:    <T>(path, body?) => request<T>(path, { method: "PUT", ... }),
  delete: <T>(path) => request<T>(path, { method: "DELETE" }),
  deleteWithBody: <T>(path, body?) => request<T>(path, { ... }),
  upload: <T>(path, formData) => request<T>(path, { method: "POST", body: formData }),
  download: async (path) => { ... },  // Returns { blob, filename }
};
```

### Same-origin patroon

In productie is `API_BASE` leeg — alle requests gaan naar dezelfde origin (de .NET-backend serveert de frontend). In ontwikkeling kan `NEXT_PUBLIC_API_URL=http://127.0.0.1:5123` worden ingesteld.

### Error handling

- **HTTP 423** → Gooit `Error("LOCKED")` — frontend redirected naar login
- **Andere fouten** → Gooit `Error(body.error || "HTTP {status}")`
- **HTTP 204** → Retourneert `undefined`
- **Download** → Parsed `Content-Disposition` header voor bestandsnaam

## 5.7 Hooks

### useIdleTimer

Zie [Hoofdstuk 4.6](04-beveiliging.md#46-idle-timeout--automatisch-vergrendelen).

### useKeyboardShortcuts

Vim-stijl sneltoetsen met twee modi:

**Directe sneltoetsen:**

| Sneltoets | Actie |
|-----------|-------|
| `Ctrl+L` | Database vergrendelen |
| `Ctrl+N` | Nieuw item toevoegen |
| `Ctrl+K` | Zoekdialoog openen |
| `?` | Sneltoetsen-overzicht |

**G + letter navigatie** (1.5s timeout):

| Toets | Route |
|-------|-------|
| `G D` | /dashboard |
| `G P` | /eigenaar |
| `G T` | /testament |
| `G W` | /euthanasie |
| `G O` | /donor |
| `G B` | /digitaal-bezit |
| `G E` | /boedel |
| `G U` | /uitvaart |
| `G F` | /documenten |
| `G R` | /erfgenamen |
| `G N` | /noodcontacten |
| `G X` | /export |
| `G A` | /audit-log |
| `G I` | /instellingen |

Toetsaanslagen in input-, textarea-, select- of contentEditable-elementen worden genegeerd.

### useTheme

Light/dark mode toggle:

- Opgeslagen in `localStorage` key `lumio-theme`
- Fallback naar `prefers-color-scheme: dark`
- Past `.dark` class toe op `<html>` element
- Retourneert `{ theme, setTheme, toggle }`

## 5.8 Design System

### Theming

Gedefinieerd in `globals.css` met CSS custom properties (Tailwind CSS v4 `@theme` syntax):

**Licht thema (standaard):**

| Token | Waarde | Gebruik |
|-------|--------|--------|
| `--color-primary` | `#1e3a5f` | Primaire kleur (donkerblauw) |
| `--color-accent` | `#2d6a9f` | Accentkleur |
| `--color-background` | `#f5f5f0` | Achtergrond |
| `--color-foreground` | `#1a1a1a` | Tekstkleur |
| `--color-card` | `#ffffff` | Kaart-achtergrond |
| `--color-muted` | `#e8e8e0` | Gedempt element |
| `--color-destructive` | `#b91c1c` | Verwijder/fout kleur |
| `--color-success` | `#166534` | Succeskleur |
| `--color-warning` | `#92400e` | Waarschuwingskleur |

**Donker thema** (`.dark` class):
- Achtergrond: slate-900 → slate-950 tonen
- Voorgrond: slate-100
- Kaart: slate-800/900

### Lettertype

```css
body { font-family: "Segoe UI", system-ui, -apple-system, sans-serif; }
```

### Grote-tekst modus

De `.grote-tekst` class schaalt alle tekst ~18% omhoog voor visueel beperkte gebruikers:

```css
.grote-tekst {
  font-size: 118%;
  .text-sm  { font-size: 0.975rem; }
  .text-xs  { font-size: 0.85rem; }
  .text-lg  { font-size: 1.25rem; }
  /* etc. */
}
```

Activeerbaar via de instellingenpagina. Opgeslagen in `localStorage` key `lumio-grote-tekst`.

### FOUC-preventie

De root layout bevat een inline script dat voorkomt dat de pagina even zonder thema knippert bij laden:

```html
<script dangerouslySetInnerHTML={{ __html: `
  try {
    if (localStorage.getItem('lumio-theme') === 'dark' || ...)
      document.documentElement.classList.add('dark');
    if (localStorage.getItem('lumio-grote-tekst') === 'true')
      document.documentElement.classList.add('grote-tekst');
  } catch {}
` }} />
```

## 5.9 Kennisbanken

### Afsluit-instructies

`lib/afsluit-instructies.ts` bevat instructies voor het afsluiten/overdragen van accounts bij verschillende platforms na overlijden:

```typescript
interface AfsluitInstructie {
  platform: string;          // "Facebook / Meta"
  zoekwoorden: string[];     // Zoekwoorden voor filtering
  beschrijving: string;      // Procedure-beschrijving
  url: string;               // Officiële URL
  categorie?: string;        // "Social Media", "Email", etc.
}
```

### Voorbeelddata

`lib/voorbeeld-data.ts` bevat complete voorbeeldgegevens voor een fictief gezin ("Familie de Voorbeeld"). Wordt gebruikt door de `VoorbeeldDialog` component om gebruikers te laten zien hoe een volledig ingevuld profiel eruitziet.

```typescript
interface VoorbeeldData {
  domein: string;            // "eigenaar"
  titel: string;
  beschrijving: string;
  secties: VoorbeeldSectie[];
}
```

## 5.10 Build-configuratie

### next.config.ts

```typescript
const nextConfig: NextConfig = {
  output: "export",          // Statische HTML/JS/CSS export
  trailingSlash: true,       // Vereist voor statische hosting
  images: { unoptimized: true },  // Geen image optimization bij export
};
```

### Resultaat

`next build` produceert statische bestanden in `out/` die door de .NET-backend worden geserveerd als embedded frontend.
