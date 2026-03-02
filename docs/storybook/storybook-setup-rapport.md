# Storybook Setup Rapport — Lumio — 2026-03-02
> Storybook Agent (31) | COMBO_AUDIT TECHNIEK+UX

---

## Configuratie

| Attribuut | Waarde |
|-----------|--------|
| Storybook versie | 10.2.10 |
| Framework | `@storybook/nextjs-vite` |
| Config pad | `src/lumio-web/.storybook/` |
| Stories glob | `src/lumio-web/src/**/*.stories.@(js\|jsx\|mjs\|ts\|tsx)` |
| Token CSS | `src/lumio-web/src/styles/tokens.css` (via `globals.css`) |
| Token JSON | `docs/brand/design-tokens.json` (DERIVED_FROM_CODEBASE) |
| Storybook static build | `src/lumio-web/storybook-static/` (aanwezig) |

## Addons

| Addon | Versie | Doel |
|-------|--------|------|
| `@storybook/addon-a11y` | aanwezig | axe-core accessibility checks |
| `@storybook/addon-docs` | aanwezig | Autodocs + props-tabellen |
| `@storybook/addon-vitest` | aanwezig | Interaction tests |
| `@chromatic-com/storybook` | aanwezig maar geconfigureerd als uitgeschakeld | DEC-101 — Chromatic disabled |

## Autodocs
Tag `autodocs` is global ingesteld in `preview.ts` — alle stories genereren automatisch een docs-pagina.

## Component Governance
Maturity labels (core / stable / experimental) zijn geconfigureerd in `preview.ts` als badges met kleurcodering:
- **core** → groen (`#22c55e`)
- **stable** → teal (`#14b8a6`)
- **experimental** → amber (`#f59e0b`)

## Stories Gegenereerd (aangetroffen)

**33 stories** voor **39 componenten** verspreid over:
- `src/components/ui/` — 18 stories (17 `.stories.tsx`, 1 ontbreekt voor Toast/Tooltip/StatusBadge/LabelWithHelp/HelpTooltip)
- `src/components/security/` — 8 stories
- `src/components/layout/` — 2 stories
- `src/components/help/` — 4 stories
- `src/components/auth/` — 1 story

## A11y Configuratie

`a11y.test: "todo"` (preview.ts L40) — de test-modus staat op `todo` (niet `error`).

> ⚠️ **AANBEVELING SP-UX-01-006:** Wijzig naar `a11y.test: "error"` na het instellen van een CI axe-gate voor lumio-web, zodat a11y-fouten in Storybook als hard errors worden gerapporteerd.

## Openstaande Items

| Item | Type | Actie | Sprint |
|------|------|-------|--------|
| `Toast` story ontbreekt | STORY_MISSING | Aanmaken als onderdeel van SP-UX-01-007 (aria-live) | SP-UX-01 |
| `Tooltip` story ontbreekt | STORY_MISSING | Aanmaken vóór v1.0 | SP-UX-02 |
| `StatusBadge` story ontbreekt | STORY_MISSING | Aanmaken vóór v1.0 | SP-UX-02 |
| `OnboardingWizard` story ontbreekt | STORY_MISSING | Aanmaken als REC-UIDESIGN-002 — SP-UX-02 | SP-UX-02 |
| `a11y.test` staat op `todo` | CONFIG | Wijzigen naar `error` na CI axe-gate (SP-UX-01-006) | SP-UX-01 |
| Icon aria-hidden niet consistent | MANUAL_CHECK | SP-UX-01-008 — aria-hidden op decoratieve Lucide-iconen | SP-UX-01 |

## Run Commando

```bash
cd src/lumio-web
npm run storybook
```

Storybook draait op `http://localhost:6006` (default Storybook port).

## Relatie met Sprint Stories

| Story | Component | Sprint |
|-------|-----------|--------|
| SP-UX-01-006 (axe CI) | Alle stories | SP-UX-01 |
| SP-UX-01-007 (aria-live toast) | Toast.stories.tsx (aanmaken) | SP-UX-01 |
| SP-UX-01-008 (aria-hidden iconen) | Icon.stories.tsx + LumioIcon.stories.tsx | SP-UX-01 |
| SP-UX-02-003 (OnboardingWizard story) | OnboardingWizard.stories.tsx (aanmaken) | SP-UX-02 |

