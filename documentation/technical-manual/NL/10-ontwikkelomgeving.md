# 10 — Ontwikkelomgeving

## Vereisten

| Software | Versie | Doel |
|----------|--------|------|
| .NET SDK | 10.0+ | Backend API bouwen |
| Node.js | 22+ (LTS) | Frontend en Electron |
| npm | 10+ | Package management |
| PowerShell | 7+ | Build- en startscripts |
| Git | 2.40+ | Versiebeheer |

## Eerste Keer Opzetten

```powershell
# 1. Repository klonen
git clone <repo-url> Lumio
cd Lumio

# 2. Backend dependencies herstellen
cd src/Lumio.Api
dotnet restore

# 3. Frontend dependencies installeren
cd ../lumio-web
npm install

# 4. Electron dependencies installeren
cd ../lumio-desktop
npm install

# 5. Terug naar root en starten
cd ../..
.\start-dev.ps1
```

Na het starten opent de browser automatisch:
- **Applicatie**: `http://127.0.0.1:5123`
- **Storybook**: `http://127.0.0.1:6006`

## API Client Genereren

De frontend gebruikt een getypeerde API-client, gegenereerd uit de Swagger/OpenAPI-specificatie:

```powershell
cd src/lumio-web
npm run generate-api
```

**Configuratie** (`openapi-ts.config.ts`):

```typescript
defineConfig({
    client: "@hey-api/client-fetch",
    input: "http://127.0.0.1:5123/swagger/v1/swagger.json",
    output: { path: "src/lib/api", format: "prettier" }
})
```

> **Let op**: De backend moet draaien voordat je de API-client genereert.

De gegenereerde bestanden staan in `src/lumio-web/src/lib/api/` en bevatten getypeerde functies voor alle API-endpoints.

## Storybook

Storybook 10 draait als component-catalogus en visuele testomgeving.

### Configuratie

```
src/lumio-web/.storybook/
├── main.ts          # Framework, addons, story-patronen
├── preview.ts       # Globals CSS, control matchers
└── vitest.setup.ts  # A11y + project annotations
```

**Framework**: `@storybook/nextjs-vite`

**Addons**:
- `@chromatic-com/storybook` — visuele regressietests
- `@storybook/addon-vitest` — testruns in Storybook
- `@storybook/addon-a11y` — toegankelijkheidscontroles
- `@storybook/addon-docs` — documentatie

**Story locaties**: `src/**/*.stories.@(js|jsx|mjs|ts|tsx)` en `src/**/*.mdx`

### Starten

```powershell
cd src/lumio-web
npm run storybook
# → http://localhost:6006
```

## Testen

### Vitest (Unit & Component Tests)

Vitest draait via de Storybook-plugin met browser-mode:

```
vitest.config.ts
├── Plugin: @storybook/addon-vitest/vitest-plugin
├── Project: "storybook"
├── Browser: Playwright (Chromium, headless)
└── Setup: .storybook/vitest.setup.ts
```

> **Opmerking (SP-2):** `src/lumio-web` heeft nu ook een eigen `playwright.config.ts` voor toegankelijkheids-e2e-tests. Zie [Playwright E2E Axe Tests](#playwright-e2e-axe-tests-lumio-web) hieronder.

### Tests Uitvoeren

```powershell
cd src/lumio-web
npx vitest run           # Alle tests eenmalig
npx vitest --watch       # Watch-mode
npx vitest --coverage    # Met code coverage
```

### Playwright E2E Axe Tests (lumio-web)

Toegevoegd in SP-2 (GAP-A11Y-006). Voert WCAG 2.1 AA axe-controles uit op alle 17 geauthenticeerde routes via een echte browser met een actieve API-sessie.

**Vereisten — alle drie moeten actief zijn voordat de testsuite wordt gestart:**

| Vereiste | Commando | Toelichting |
|---|---|---|
| ASP.NET Core API | `cd src/Lumio.Api && dotnet run` | Moet draaien op de poort ingesteld in `NEXT_PUBLIC_API_URL` (standaard `http://localhost:5000`) |
| lumio-web dev server | `cd src/lumio-web && npm run dev` | Moet bereikbaar zijn op `http://localhost:3000` |
| PIN-omgevingsvariabele | `$env:LUMIO_TEST_PASSWORD = "<pin>"` | De numerieke PIN waarmee een profiel in de app wordt ontgrendeld |

**Tests uitvoeren:**

```powershell
# Stel de PIN in (vervang 1234 door de daadwerkelijke profiel-PIN)
$env:LUMIO_TEST_PASSWORD = "1234"

# Voer alle e2e axe-tests uit
cd src/lumio-web
npm run test:e2e

# Open het HTML-rapport na een testrun
npm run test:e2e:report
```

**Hoe het werkt:**

De testsuite bestaat uit drie Playwright-projecten die in volgorde worden uitgevoerd:

1. **`setup`** (`e2e/auth.setup.ts`) — navigeert naar `/`, selecteert de eerste profielkaart, vult `LUMIO_TEST_PASSWORD` in het PIN-veld in, verzendt het formulier, wacht op doorverwijzing naar `/dashboard`, en slaat daarna het ASP.NET Core-sessiecookie op in `e2e/auth.json`.
2. **`public`** (`e2e/a11y-public.spec.ts`) — axe-test van het root-inlogscherm (geen sessie vereist).
3. **`authenticated`** (`e2e/a11y-authenticated.spec.ts`) — laadt `e2e/auth.json` als `storageState`, navigeert naar elk van de 17 geauthenticeerde routes, voert axe uit met tags `wcag2a / wcag2aa / wcag21aa`, en gooit een fout bij kritieke of ernstige schendingen.

**Geteste routes (geauthenticeerd):**
`/dashboard`, `/boedel`, `/digitaal-bezit`, `/documenten`, `/donor`, `/eigenaar`, `/erfgenamen`, `/euthanasie`, `/export`, `/help`, `/instellingen`, `/noodcontacten`, `/testament`, `/tijdlijn`, `/uitvaart`, `/videoboodschappen`, `/audit-log`

**Beveiligingsopmerking:** `e2e/auth.json` bevat een actief sessiecookie. Het bestand is uitgesloten van git via `src/lumio-web/e2e/.gitignore` en mag nooit worden gecommit.

## TypeScript

### Frontend (`tsconfig.json`)

| Instelling | Waarde |
|------------|--------|
| `target` | ES2017 |
| `module` | esnext |
| `moduleResolution` | bundler |
| `strict` | true |
| `jsx` | react-jsx |
| `incremental` | true |
| **Path alias** | `@/*` → `./src/*`, `@messages/*` → `./messages/*` |
| **Plugin** | `next` |

### Desktop (`tsconfig.json`)

| Instelling | Waarde |
|------------|--------|
| `target` | ES2022 |
| `module` | ESNext |
| `moduleResolution` | bundler |
| `strict` | true |
| `outDir` | `./dist` |

## ESLint

ESLint is geconfigureerd met een custom plugin voor het design system:

**`eslint.config.mjs`**:
- Basis: `eslint-config-next`
- Custom plugin: `design-system` met regel `no-raw-colors` (waarschuwingsniveau)
- Scope: `src/app/**/*.{ts,tsx}` en `src/components/**/*.{ts,tsx}`
- Uitzonderingen: `*.stories.tsx`

De `no-raw-colors` regel (`eslint-rules/no-raw-colors.mjs`) dwingt het gebruik van semantische design-tokens af. Directe Tailwind-kleuren zoals `text-red-500` zijn niet toegestaan — gebruik in plaats daarvan `text-primary` of andere semantische tokens.

## Key Dependencies

### Frontend (lumio-web)

| Package | Versie | Doel |
|---------|--------|------|
| next | ^16.1.6 | React framework |
| react | ^19.2.4 | UI library |
| next-intl | ^4.8.3 | Internationalisering |
| zustand | ^5.0.11 | State management |
| zod | ^4.3.6 | Schema validatie |
| react-hook-form | ^7.71.1 | Formulierbeheer |
| @tanstack/react-query | ^5.90.21 | Server state |
| class-variance-authority | - | Component variants |
| tailwind-merge | - | Tailwind class merging |
| lucide-react | - | Iconen |
| qrcode | - | QR-code generatie |

### Desktop (lumio-desktop)

| Package | Versie | Doel |
|---------|--------|------|
| electron | ^35.2.1 | Desktop shell |
| electron-builder | ^26.0.12 | Packaging |
| typescript | ^5.9.3 | TypeScript compiler |
| get-port | ^7.1.0 | Vrije poort vinden |

## Directorystructuur (Samenvatting)

```
Lumio/
├── start-dev.ps1          # Ontwikkelomgeving starten
├── tools/
│   └── build.ps1          # Productie build
├── src/
│   ├── Lumio.Api/         # .NET 10 backend
│   ├── lumio-web/         # Next.js 16 frontend
│   └── lumio-desktop/     # Electron 35 shell
├── data/                  # Runtime data (profielen, db)
└── docs/                  # Documentatie
```
