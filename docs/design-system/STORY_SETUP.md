# Lumio Design System — Storybook Setup

> Auto-generated: 2026-02-23

## Installation

Storybook 10.2.10 installed via `npx storybook@latest init` with:
- Framework: `@storybook/nextjs-vite`
- Addons: `@chromatic-com/storybook`, `@storybook/addon-vitest`, `@storybook/addon-a11y`, `@storybook/addon-docs`

## Commands

```bash
npm run storybook       # Dev server at http://localhost:6006
npm run build-storybook # Static build
```

## Configuration

- `.storybook/main.ts` — discovers `**/*.stories.@(ts|tsx)` + `**/*.mdx` under `src/`
- `.storybook/preview.ts` — imports `globals.css` for design tokens, centered layout default

## Story Conventions

### Directory Structure

```
src/
  components/
    ui/
      __stories__/          # Primitive components
        Button.stories.tsx
        Input.stories.tsx
        Card.stories.tsx
        Badge.stories.tsx
        Alert.stories.tsx
        Checkbox.stories.tsx
        Dialog.stories.tsx
        Select.stories.tsx
        Tabs.stories.tsx
        Textarea.stories.tsx
    security/
      __stories__/          # Security primitives
        ConfirmDestructiveAction.stories.tsx
        SecureValueReveal.stories.tsx
        ...
    layout/
      __stories__/          # Layout patterns
        Header.stories.tsx
        PageShell.stories.tsx
    wizard/
      __stories__/          # Wizard components
        WizardShell.stories.tsx
```

### Naming Convention
- File: `ComponentName.stories.tsx`
- Default export title: `"Primitives/ComponentName"`, `"Security/ComponentName"`, `"Layout/ComponentName"`, `"Wizard/ComponentName"`
- Use play functions for interaction testing where relevant
