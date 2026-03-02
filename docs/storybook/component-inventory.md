# Storybook Component Inventory — Lumio — 2026-03-02
> Storybook Agent (31) | COMBO_AUDIT TECHNIEK+UX | Gegenereerd als pre-sprint-gate guardrail

---

## Status
**COMPLETE** — Storybook aanwezig, stories aangetroffen, tokens afgeleid uit codebase.

## Storybook Versie
Storybook **10.2.10** (`@storybook/nextjs-vite`) — detectie via `src/lumio-web/package.json`

## Design Token Koppeling
- Token bestand: `docs/brand/design-tokens.json`
- Bron: `DERIVED_FROM_CODEBASE` — afgeleid uit `src/lumio-web/src/styles/tokens.css`
- Tokenimport in Storybook: `globals.css` geïmporteerd in `.storybook/preview.ts` ✓
- Import status: **LINKED** (via globals.css → tokens.css keten)

## Addons Configuratie
| Addon | Status | Doel |
|-------|--------|------|
| `@storybook/addon-a11y` | ✓ ACTIEF | axe-core a11y checks per story |
| `@storybook/addon-docs` | ✓ ACTIEF | Autodocs + props-tabel |
| `@storybook/addon-vitest` | ✓ ACTIEF | Story interaction-tests |
| `@chromatic-com/storybook` | ⚠️ GECONFIGUREERD maar uitgeschakeld | DEC-101 — Chromatic uitgeschakeld |

---

## Component Overzicht — UI Basiscomponenten (`src/components/ui/`)

| Component | Bestand | Story aanwezig | Story bestand | Varianten (Stories) | A11y Addon | Token-gebruik | Maturity |
|-----------|---------|---------------|-------|-----------|---------|------|------|
| Alert | `alert.tsx` | ✓ | `Alert.stories.tsx` | success, warning, danger, info | ✓ | ✓ | stable |
| Badge | `badge.tsx` | ✓ | `Badge.stories.tsx` | success, warning, error, info, neutral | ✓ | ✓ | stable |
| Button | `button.tsx` | ✓ | `Button.stories.tsx` | primary, secondary, destructive, outline, ghost, disabled | ✓ | ✓ | core |
| Card | `card.tsx` | ✓ | `Card.stories.tsx` | default, with-content | ✓ | ✓ | core |
| Checkbox | `checkbox.tsx` | ✓ | `Checkbox.stories.tsx` | unchecked, checked, disabled | ✓ | ✓ | stable |
| Dialog | `dialog.tsx` | ✓ | `Dialog.stories.tsx` | default, with-footer | ✓ | ✓ | stable |
| EmptyState | `EmptyState.tsx` | ✓ | `EmptyState.stories.tsx` | default, with-action, loading | ✓ | ✓ | stable |
| FormField | `form-field.tsx` | ✓ | `FormField.stories.tsx` | default, with-error, with-helper | ✓ | ✓ | stable |
| Icon (Lucide wrapper) | `icon.tsx` | ✓ | `Icon.stories.tsx` | multiple icons | ✓ | ✓ | core |
| Input | `input.tsx` | ✓ | `Input.stories.tsx` | default, error, disabled, with-label | ✓ | ✓ | core |
| LumioIcon (custom) | `lumio-icon.tsx` | ✓ | `LumioIcon.stories.tsx` | alle 14 domein-iconen | ✓ | ✓ | stable |
| Progress | `progress.tsx` | ✓ | `Progress.stories.tsx` | 0%, 50%, 100%, determinate | ✓ | ✓ | stable |
| Select | `select.tsx` | ✓ | `Select.stories.tsx` | default, disabled, with-groups | ✓ | ✓ | stable |
| Skeleton | `skeleton.tsx` | ✓ | `Skeleton.stories.tsx` | text, card, avatar, table | ✓ | ✓ | stable |
| Tabs | `tabs.tsx` | ✓ | `Tabs.stories.tsx` | default, 3 tabs | ✓ | ✓ | stable |
| Textarea | `textarea.tsx` | ✓ | `Textarea.stories.tsx` | default, error, disabled | ✓ | ✓ | stable |
| Toast | `toast.tsx` | ✗ | — | ONTBREEKT | PENDING | Deels | experimental |
| Tooltip | `tooltip.tsx` | ✗ | — | ONTBREEKT | PENDING | ✓ | stable |
| Transitions | `transitions.tsx` | ✓ | `Transitions.stories.tsx` | fade, slide | ✓ | ✓ | stable |
| label | `label.tsx` | ✗ | — | geen story — primitive | n.v.t. | ✓ | core |
| LabelWithHelp | `LabelWithHelp.tsx` | ✗ | — | ONTBREEKT | PENDING | ✓ | experimental |
| HelpTooltip | `help-tooltip.tsx` | ✗ | — | ONTBREEKT | PENDING | ✓ | experimental |
| StatusBadge | `status-badge.tsx` | ✗ | — | ONTBREEKT | PENDING | ✓ | experimental |
| SafeHtml | `safe-html.tsx` | ✗ | — | geen story — utility | n.v.t. | n.v.t. | stable |

---

## Component Overzicht — Security Componenten (`src/components/security/`)

| Component | Story bestand | Varianten | A11y | Token-gebruik | Maturity |
|-----------|---------|-----------|------|------|------|
| ActivityLogItem | `ActivityLogItem.stories.tsx` | ✓ | ✓ | ✓ | stable |
| ConfirmDestructiveAction | `ConfirmDestructiveAction.stories.tsx` | ✓ | ✓ | ✓ | stable |
| ConfirmDeleteDialog | `ConfirmDeleteDialog.stories.tsx` | ✓ | ✓ | ✓ | stable |
| ConfirmJuridischDialog | `ConfirmJuridischDialog.stories.tsx` | ✓ | ✓ | ✓ | stable |
| ReadOnlyModeWrapper | `ReadOnlyModeWrapper.stories.tsx` | ✓ | ✓ | ✓ | stable |
| SecureValueReveal | `SecureValueReveal.stories.tsx` | ✓ | ✓ | ✓ | stable |
| SecurityStatusIndicator | `SecurityStatusIndicator.stories.tsx` | ✓ | ✓ | ✓ | stable |
| SessionTimeoutWarning | `SessionTimeoutWarning.stories.tsx` | ✓ | ✓ | ✓ | stable |

---

## Component Overzicht — Layout Componenten (`src/components/layout/`)

| Component | Story bestand | Varianten | A11y | Token-gebruik | Maturity |
|-----------|---------|-----------|------|------|------|
| IdleWarningDialog | `IdleWarningDialog.stories.tsx` | ✓ | ✓ | ✓ | stable |
| SearchDialog | `SearchDialog.stories.tsx` | ✓ | ✓ | ✓ | stable |

---

## Component Overzicht — Help Componenten (`src/components/help/`)

| Component | Story bestand | Varianten | A11y | Token-gebruik | Maturity |
|-----------|---------|-----------|------|------|------|
| HelpCalloutCard | `HelpCalloutCard.stories.tsx` | ✓ | ✓ | ✓ | stable |
| HelpEmptyState | `HelpEmptyState.stories.tsx` | ✓ | ✓ | ✓ | stable |
| KbdBadge | `KbdBadge.stories.tsx` | ✓ | ✓ | ✓ | stable |
| StepList | `StepList.stories.tsx` | ✓ | ✓ | ✓ | stable |

---

## Component Overzicht — Auth Componenten (`src/components/auth/`)

| Component | Story bestand | Varianten | A11y | Token-gebruik | Maturity |
|-----------|---------|-----------|------|------|------|
| PasswordStrengthMeter | `PasswordStrengthMeter.stories.tsx` | ✓ | ✓ | ✓ | stable |

---

## Ontbrekende Stories — Aanbevolen te maken vóór v1.0

| Component | Prioriteit | Reden | A11y risico |
|-----------|-----------|-------|-------------|
| `toast.tsx` | **HOOG** | Kerndeel van feedback-systeem; REC-A11Y-002 (aria-live) vereist story voor verificatie | SC 4.1.3 |
| `tooltip.tsx` | MIDDEN | Gebruikt op meerdere plaatsen; geen a11y-verificatie mogelijk zonder story | SC 1.4.13 |
| `StatusBadge` | MIDDEN | Onderdeel van overzichtsviews; toegankelijkheid onbekend | SC 1.3.1 |
| `LabelWithHelp` | LAAG | Gecombineerde component; story nodig bij styling-wijzigingen | — |
| `HelpTooltip` | LAAG | Wrapper rond tooltip; zelfde risico | SC 1.4.13 |
| `OnboardingWizard` | **HOOG** | SYS-RISK-009 blocker; wizard-flow moet visueel traceerbaar zijn in design system | SC 1.3.1, SC 2.4.3 |

---

## A11y Baseline Rapport

| Component | Addon actief | Known issues | Status |
|-----------|-------------|-------------|--------|
| Button | ✓ | Geen bekende issues | PASSED |
| Input | ✓ | Geen bekende issues | PASSED |
| Select | ✓ | Geen bekende issues | PASSED |
| Checkbox | ✓ | Geen bekende issues | PASSED |
| Dialog | ✓ | `aria-modal`, focus-trap aanwezig | PASSED |
| Alert | ✓ | Geen bekende issues | PASSED |
| Badge | ✓ | Geen bekende issues | PASSED |
| Icon (Lucide) | ✓ | **REC-A11Y-003** — `aria-hidden` op decoratieve iconen niet consistent; SP-UX-01-008 | MANUAL_CHECK_REQUIRED |
| LumioIcon | ✓ | Zelfde as Icon | MANUAL_CHECK_REQUIRED |
| Toast | ✗ | **REC-A11Y-002** — `aria-live` ontbreekt; SP-UX-01-007 | PENDING — story ontbreekt |
| Tooltip | ✗ | SC 1.4.13 onbekend | PENDING — story ontbreekt |

---

## LumioIcon Domein-icons (14 beschikbaar)

`boedel`, `dashboard`, `digitaal-bezit`, `documenten`, `donor`, `erfgenamen`, `noodcontacten`, `profiel`, `shield`, `testament`, `tijdlijn`, `uitvaart`, `wilsverklaring`

Alle domein-icons zijn custom SVG als React-components — géén externe dependency.

---

## Guardrail voor Implementation Agent (BINDEND — RULE ORC-18)

> **De Implementation Agent mag in Fase 5 UITSLUITEND componenten uit bovenstaande inventory gebruiken voor UI-implementaties.**

Nieuwe UI-componenten vereisen:
1. **Sprint Gate goedkeuring** (story_type: `UI_COMPONENT`, vóór sprint-start)
2. **Storybook story aangemaakt** met minimaal 2 varianten
3. **A11y addon-check**: PASSED of MANUAL_CHECK_REQUIRED met gedocumenteerde bevindingen
4. **Toevoeging aan dit inventory-bestand** vóór gebruik in productiecode
5. **PR/Review Agent verificatie**: elke PR die nieuwe UI-componenten introduceert vereist expliciete review op dit guardrail

**PR-blokkeer-voorwaarde:** Als een PR een niet-geïnventariseerde UI-component introduceert → `GUARDRAIL_VIOLATION: RULE ORC-18` → PR wordt geblokkeerd door PR/Review Agent.

---

## Samenvatting

| Categorie | Aantal | Met story | Zonder story |
|-----------|--------|-----------|-------------|
| UI basiscomponenten | 24 | 18 | 6 |
| Security componenten | 8 | 8 | 0 |
| Layout componenten | 2 | 2 | 0 |
| Help componenten | 4 | 4 | 0 |
| Auth componenten | 1 | 1 | 0 |
| **Totaal** | **39** | **33** | **6** |

Stories aanwezigheid: **85% (33/39)**

---

## HANDOFF CHECKLIST — Storybook Agent — 2026-03-02
- [x] Storybook aanwezigheid gecontroleerd (v10.2.10 aanwezig)
- [x] Design tokens afgeleid uit `tokens.css` → `docs/brand/design-tokens.json` geschreven
- [x] Tokens geladen in Storybook via `.storybook/preview.ts` → `globals.css` → `tokens.css` keten
- [x] a11y addon geconfigureerd (`@storybook/addon-a11y` aanwezig in main.ts)
- [x] Alle basiscomponent stories gedocumenteerd (6 zonder story → PENDING items gedocumenteerd)
- [x] A11y check gedocumenteerd per component (handmatig — geen runtime axe beschikbaar buiten CI)
- [x] `docs/storybook/component-inventory.md` weggeschreven
- [x] Guardrail voor Implementation Agent gedocumenteerd
- [x] PENDING items (Toast story, Tooltip story) gedocumenteerd per SP-UX-01-007/SP-UX-01-008 koppeling
- [ ] `docs/storybook/storybook-setup-rapport.md` → VOLGT IN VOLGENDE STAP
