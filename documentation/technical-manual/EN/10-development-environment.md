# 10 — Development Environment

## Prerequisites

| Software | Version | Purpose |
|----------|---------|---------|
| .NET SDK | 10.0+ | Build backend API |
| Node.js | 22+ (LTS) | Frontend and Electron |
| npm | 10+ | Package management |
| PowerShell | 7+ | Build and start scripts |
| Git | 2.40+ | Version control |

## First-time Setup

```powershell
# 1. Clone repository
git clone <repo-url> Lumio
cd Lumio

# 2. Restore backend dependencies
cd src/Lumio.Api
dotnet restore

# 3. Install frontend dependencies
cd ../lumio-web
npm install

# 4. Install Electron dependencies
cd ../lumio-desktop
npm install

# 5. Return to root and start
cd ../..
.\start-dev.ps1
```

After starting, the browser opens automatically:
- **Application**: `http://127.0.0.1:5123`
- **Storybook**: `http://127.0.0.1:6006`

## API Client Generation

The frontend uses a typed API client, generated from the Swagger/OpenAPI specification:

```powershell
cd src/lumio-web
npm run generate-api
```

**Configuration** (`openapi-ts.config.ts`):

```typescript
defineConfig({
    client: "@hey-api/client-fetch",
    input: "http://127.0.0.1:5123/swagger/v1/swagger.json",
    output: { path: "src/lib/api", format: "prettier" }
})
```

> **Note**: The backend must be running before generating the API client.

The generated files are in `src/lumio-web/src/lib/api/` and contain typed functions for all API endpoints.

## Storybook

Storybook 10 runs as a component catalog and visual testing environment.

### Configuration

```
src/lumio-web/.storybook/
├── main.ts          # Framework, addons, story patterns
├── preview.ts       # Globals CSS, control matchers
└── vitest.setup.ts  # A11y + project annotations
```

**Framework**: `@storybook/nextjs-vite`

**Addons**:
- `@chromatic-com/storybook` — visual regression tests
- `@storybook/addon-vitest` — test runs in Storybook
- `@storybook/addon-a11y` — accessibility checks
- `@storybook/addon-docs` — documentation

**Story locations**: `src/**/*.stories.@(js|jsx|mjs|ts|tsx)` and `src/**/*.mdx`

### Running

```powershell
cd src/lumio-web
npm run storybook
# → http://localhost:6006
```

## Testing

### Vitest (Unit & Component Tests)

Vitest runs via the Storybook plugin with browser mode:

```
vitest.config.ts
├── Plugin: @storybook/addon-vitest/vitest-plugin
├── Project: "storybook"
├── Browser: Playwright (Chromium, headless)
└── Setup: .storybook/vitest.setup.ts
```

There is no separate `playwright.config.ts` — Playwright runs via Vitest browser mode.

### Running Tests

```powershell
cd src/lumio-web
npx vitest run           # All tests, single run
npx vitest --watch       # Watch mode
npx vitest --coverage    # With code coverage
```

## TypeScript

### Frontend (`tsconfig.json`)

| Setting | Value |
|---------|-------|
| `target` | ES2017 |
| `module` | esnext |
| `moduleResolution` | bundler |
| `strict` | true |
| `jsx` | react-jsx |
| `incremental` | true |
| **Path alias** | `@/*` → `./src/*`, `@messages/*` → `./messages/*` |
| **Plugin** | `next` |

### Desktop (`tsconfig.json`)

| Setting | Value |
|---------|-------|
| `target` | ES2022 |
| `module` | ESNext |
| `moduleResolution` | bundler |
| `strict` | true |
| `outDir` | `./dist` |

## ESLint

ESLint is configured with a custom plugin for the design system:

**`eslint.config.mjs`**:
- Base: `eslint-config-next`
- Custom plugin: `design-system` with rule `no-raw-colors` (warning level)
- Scope: `src/app/**/*.{ts,tsx}` and `src/components/**/*.{ts,tsx}`
- Exceptions: `*.stories.tsx`

The `no-raw-colors` rule (`eslint-rules/no-raw-colors.mjs`) enforces the use of semantic design tokens. Direct Tailwind colors like `text-red-500` are not allowed — use `text-primary` or other semantic tokens instead.

## Key Dependencies

### Frontend (lumio-web)

| Package | Version | Purpose |
|---------|---------|---------|
| next | ^16.1.6 | React framework |
| react | ^19.2.4 | UI library |
| next-intl | ^4.8.3 | Internationalization |
| zustand | ^5.0.11 | State management |
| zod | ^4.3.6 | Schema validation |
| react-hook-form | ^7.71.1 | Form management |
| @tanstack/react-query | ^5.90.21 | Server state |
| class-variance-authority | - | Component variants |
| tailwind-merge | - | Tailwind class merging |
| lucide-react | - | Icons |
| qrcode | - | QR code generation |

### Desktop (lumio-desktop)

| Package | Version | Purpose |
|---------|---------|---------|
| electron | ^35.2.1 | Desktop shell |
| electron-builder | ^26.0.12 | Packaging |
| typescript | ^5.9.3 | TypeScript compiler |
| get-port | ^7.1.0 | Find free port |

## Directory Structure (Summary)

```
Lumio/
├── start-dev.ps1          # Start development environment
├── tools/
│   └── build.ps1          # Production build
├── src/
│   ├── Lumio.Api/         # .NET 10 backend
│   ├── lumio-web/         # Next.js 16 frontend
│   └── lumio-desktop/     # Electron 35 shell
├── data/                  # Runtime data (profiles, db)
└── docs/                  # Documentation
```
