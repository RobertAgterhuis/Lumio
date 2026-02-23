# 6 — Design System

## Overzicht

Het Lumio design system is gelaagd opgebouwd met **Tailwind CSS 4** als basis, een eigen **token-architectuur** voor consistentie, en **Class Variance Authority (CVA)** voor componentvaritanten.

```
tokens.css          → Bron-van-waarheid: kleuren, spacing, schaduwen, animatie
globals.css @theme  → Tailwind semantische mapping (token → utility class)
components/ui/      → Herbruikbare UI-primitieven (Button, Alert, Badge, Card, ...)
components/security/→ Beveiligingscomponenten
```

## Token-lagen

Het tokensysteem bestaat uit 6 lagen, gedefinieerd in twee bestanden:

| Laag | Bestand | Doel |
|------|---------|------|
| 1 — Kleurprimitieven | `tokens.css` | Ruwe kleurschalen (primary, sage, secure, status) |
| 2 — Spacing | `tokens.css` | 8pt grid (`--space-1` t/m `--space-7`) |
| 3 — Schaduwen | `tokens.css` | 3-tier elevatie (`--shadow-1` t/m `--shadow-3`) |
| 4 — Animatie | `tokens.css` | Duur + easing (`--duration-fast`, `--duration-med`) |
| 5 — State tokens | `tokens.css` | bg/border/text drietal per status-intent |
| 6 — Toegankelijkheid | `tokens.css` | Focus ring, disabled, min target size |
| Semantisch | `globals.css @theme` | Mapt primitieven → Tailwind utility classes |

## Kleurenpalet

### Primary (Teal)

| Token | Licht | Donker |
|-------|-------|--------|
| `--base-primary-700` | `#2C4A52` | `#7AB5C0` |
| `--base-primary-600` | `#355E68` | `#8CC4CE` |
| `--base-primary-500` | `#4F7A83` | `#9ED3DC` |
| `--base-primary-100` | `#E6EFF1` | `#1A2C30` |
| `--base-primary-50` | `#F3F7F8` | `#0F1A1D` |

### Statuskleuren

| Intent | 700 (licht) | 600 (licht) | 100 (licht) | 50 (licht) |
|--------|-------------|-------------|-------------|------------|
| Success | `#4A7A4D` | `#5E8C61` | `#E8F5E9` | `#F1F8F1` |
| Warning | `#B8890F` | `#D4A017` | `#FFF8E1` | `#FFFBEB` |
| Danger | `#923C3C` | `#B44A4A` | `#FDE8E8` | `#FEF2F2` |
| Info | `#2C3E50` | `#3A506B` | `#E3EDF5` | `#F0F5FA` |

### Overige kleuren

| Kleur | Token | Licht | Doel |
|-------|-------|-------|------|
| Sage | `--base-sage-600` | `#6B8E7A` | Rustig, natuurlijk accent |
| Secure | `--base-secure-600` | `#2563EB` | Beveiliging, encryptie |
| Neutral | `--base-neutral-900..50` | `#1F2933..#F9FAFB` | Tekst, achtergronden |

## Spacing (8pt Grid)

| Token | Waarde | Gebruik |
|-------|--------|---------|
| `--space-1` | `4px` | Kleine gaps, icon padding |
| `--space-2` | `8px` | Standaard element gap |
| `--space-3` | `16px` | Card padding, sectie gap |
| `--space-4` | `24px` | Sectie-scheiding |
| `--space-5` | `32px` | Grote sectie gap |
| `--space-6` | `48px` | Pagina-niveau scheiding |
| `--space-7` | `64px` | Grote pagina-scheiding |

## Radius

| Token | Waarde |
|-------|--------|
| `--radius-sm` | `8px` |
| `--radius-md` | `12px` |
| `--radius-lg` | `16px` |

## Schaduwen

| Token | Waarde | Gebruik |
|-------|--------|---------|
| `--shadow-1` | `0 4px 12px rgba(0,0,0,0.08)` | Cards, dropdowns |
| `--shadow-2` | `0 10px 24px rgba(0,0,0,0.12)` | Modals, popovers |
| `--shadow-3` | `0 18px 40px rgba(0,0,0,0.16)` | Full-screen overlays |

## Animatie

| Token | Waarde |
|-------|--------|
| `--duration-fast` | `150ms` |
| `--duration-med` | `250ms` |
| `--easing-default` | `ease-in-out` |

## State Tokens (Drietallen)

Elke status-intent heeft drie gecoördineerde tokens:

```css
--state-{intent}-bg      /* Achtergrondkleur */
--state-{intent}-border  /* Randkleur */
--state-{intent}-text    /* Tekstkleur */
```

Beschikbare intents: `success`, `warning`, `danger`, `info`, `security`

Gebruik altijd deze drietallen voor alerts, badges en statusindicatoren — nooit losse kleuren.

## Tailwind Utility Mapping

Het `@theme`-blok in `globals.css` mapt semantische tokens naar Tailwind utilities:

| Utility prefix | Token | Voorbeeld class |
|----------------|-------|-----------------|
| `bg-primary` | `--color-primary` | `bg-primary`, `bg-primary/10` |
| `text-foreground` | `--color-foreground` | `text-foreground` |
| `border-border` | `--color-border` | `border-border` |
| `bg-success` | `--color-success` | `bg-success` |
| `bg-danger` | `--color-danger` | `bg-danger` |
| `bg-secure` | `--color-secure` | `bg-secure` |
| `bg-sage` | `--color-sage` | `bg-sage` |
| `rounded-md` | `--radius-md` | `rounded-md` |

## Donkere Modus

Donkere modus wordt geactiveerd via de `.dark` class op `<html>`. Zowel `tokens.css` als `globals.css` definiëren `.dark` overrides.

**Regel:** Componentcode mag **nooit** branchen op thema — gebruik uitsluitend tokenwaarden die automatisch wisselen.

## Componentvarianten (CVA)

| Component | Varianten |
|-----------|-----------|
| `Button` | default, destructive, outline, secondary, ghost, link × sm/default/lg/icon |
| `Badge` | default, secondary, destructive, outline, success, warning, security, info, danger |
| `Alert` | info, success, warning, danger, security |
| `SecurityStatusIndicator` | secure, warning, critical, unknown |

## Toegankelijkheid (A11Y)

### Tokens

| Token | Standaard | Doel |
|-------|-----------|------|
| `--a11y-focus-ring-color` | primary-500 | Focus outline kleur |
| `--a11y-focus-ring-width` | `2px` | Focus outline breedte |
| `--a11y-focus-ring-offset` | `2px` | Focus outline offset |
| `--a11y-disabled-opacity` | `0.5` | Disabled element transparantie |
| `--a11y-disabled-cursor` | `not-allowed` | Disabled cursor |
| `--a11y-min-target` | `44px` | Minimale interactieve doelgrootte |

### Richtlijnen

1. **Focus zichtbaar** — Alle interactieve elementen hebben een zichtbare focus ring
2. **Contrast** — Minimaal WCAG AA contrast ratio (4.5:1 tekst, 3:1 UI)
3. **Doelgrootte** — Minimaal 44×44px voor touch targets
4. **Toetsenbordnavigatie** — Alle functies bereikbaar via toetsenbord
5. **ARIA labels** — Beschrijvende labels waar visuele context ontbreekt
6. **Kleur niet als enige indicator** — Altijd aanvullend icoon of tekst

## Storybook

Alle UI-primitieven en beveiligingscomponenten hebben Storybook-stories:

```bash
cd src/lumio-web
npm run storybook    # Start op poort 6006
```

### Structuur

```
Primitives/
  Button, Badge, Alert, Card, Input, Checkbox, Progress,
  Textarea, Select, Tabs, Dialog
Security/
  ConfirmDestructiveAction, SecureValueReveal, ReadOnlyModeWrapper,
  ActivityLogItem, SecurityStatusIndicator, SessionTimeoutWarning
```

## Regels voor ontwikkelaars

1. **Geen ruwe hex-kleuren** in component/pagina-code — gebruik Tailwind utilities
2. **Gebruik semantische tokens** (`bg-primary`, `text-danger`) — niet Tailwind-kleuren (`text-blue-500`)
3. **Gebruik het 8pt spacing grid** — `space-1` (4px) t/m `space-7` (64px)
4. **State rendering via drietallen** — `--state-{intent}-bg/border/text`
5. **Dark mode = alleen token overrides** — geen conditionele rendering voor thema
6. **Nieuwe tokens documenteren** — `tokens.css` is de single source of truth
