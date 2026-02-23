# Lumio — Autonomous UI System Migration (Repo-Specific)

## ROLE
You are GitHub Copilot using Claude Opus 4.6, working autonomously in this repository.

Your mission is to execute a **safe, phased, architecture-first design system migration** for Lumio’s web UI.

This is not cosmetic styling.  
This is a **design-token + component-governance + layout-normalization migration**.

---

## PROJECT CONTEXT (MUST READ FIRST)

Target app is:  
`src/lumio-web` (Next.js + React + Tailwind-style utility usage + custom UI primitives)

Important existing files:
- `src/lumio-web/src/app/globals.css`
- `src/lumio-web/src/components/ui/*`
- `src/lumio-web/src/components/layout/Header.tsx`
- `src/lumio-web/src/app/(authenticated)/*`

Do NOT assume folder `src/lumioweb`; correct folder is `src/lumio-web`.

Lumio characteristics:
- Offline-first
- Privacy/security-sensitive
- Form-heavy
- Wizard-driven
- Status/badge-heavy
- Used by older audience (readability and predictability first)

Visual direction:
- Calm trust
- High readability
- Strong but non-aggressive security signaling
- Consistent status semantics

---

## NON-NEGOTIABLE IMPLEMENTATION STRATEGY

1. **Phased migration with checkpoints** (avoid giant unstable rewrite).
2. Reuse and evolve existing primitives in `src/components/ui` before creating new ones.
3. Token-first. No new raw color/spacing values in UI code.
4. Dark mode must be token-driven only (component logic should not branch on theme).
5. Security interaction patterns become first-class primitives.
6. Every new/changed reusable component must have Storybook stories.

---

## STEP 1 — STACK & BASELINE AUDIT

Detect and document:
- Stack details (Next.js/React/Tailwind/CVA/etc.)
- Existing theming model in `globals.css`
- Existing UI primitives and where raw styles are still used

Create:
- `docs/design-system/STACK_ANALYSIS.md`
- `docs/design-system/BASELINE_UI_AUDIT.md`

Audit must include:
- Raw hex usage
- Direct utility color usage in pages (`bg-red-50`, `text-blue-800`, etc.)
- Native controls bypassing shared components
- Page-level layouts wasting horizontal space

---

## STEP 2 — STORYBOOK SETUP / VERIFY

If Storybook already exists, validate and use it.
If not, install latest stable Storybook for Next.js.

Create:
- `docs/design-system/STORY_SETUP.md`

Set up stories folder conventions for:
- primitives
- composed components
- page layout patterns

---

## STEP 3 — TOKEN ARCHITECTURE (LAYERED)

Create token files under:
- `src/lumio-web/src/styles/tokens.css` (or equivalent central token entry)
- integrate with existing `globals.css` without breaking app boot

### 3.1 Base tokens
Include at minimum:
- Color primitives
- Spacing (8pt grid)
- Radius
- Shadows
- Motion
- Typography scale + line-height + font-weights

Use this color family as base direction:

- Primary:
  - `--color-primary-700: #2C4A52;`
  - `--color-primary-600: #355E68;`
  - `--color-primary-500: #4F7A83;`
  - `--color-primary-100: #E6EFF1;`
- Sage:
  - `--color-sage-600: #6B8E7A;`
  - `--color-sage-100: #E8F0EB;`
- Secure:
  - `--color-secure-600: #2563EB;`
  - `--color-secure-100: #DBEAFE;`
- Status:
  - `--color-success-600: #5E8C61;`
  - `--color-warning-600: #D4A017;`
  - `--color-danger-600:  #B44A4A;`
  - `--color-info-600:    #3A506B;`
- Neutral:
  - `--color-neutral-900: #1F2933;`
  - `--color-neutral-700: #4B5563;`
  - `--color-neutral-500: #9CA3AF;`
  - `--color-neutral-200: #E5E7EB;`
  - `--color-neutral-100: #F3F4F6;`
  - `--color-white:       #FFFFFF;`

Spacing:
- `--space-1: 4px;`
- `--space-2: 8px;`
- `--space-3: 16px;`
- `--space-4: 24px;`
- `--space-5: 32px;`
- `--space-6: 48px;`
- `--space-7: 64px;`

Radius:
- `--radius-sm: 8px;`
- `--radius-md: 12px;`
- `--radius-lg: 16px;`

Shadows:
- `--shadow-1: 0 4px 12px rgba(0,0,0,0.08);`
- `--shadow-2: 0 10px 24px rgba(0,0,0,0.12);`
- `--shadow-3: 0 18px 40px rgba(0,0,0,0.16);`

Motion:
- `--duration-fast: 150ms;`
- `--duration-med: 250ms;`
- `--easing-default: ease-in-out;`

### 3.2 Semantic tokens
Map base tokens to intent:
- surfaces, text, border, interactive, muted, card, sidebar, etc.

### 3.3 State tokens (required)
- success / warning / danger / info / security
- each with bg/border/text token triplets

### 3.4 Accessibility tokens (required)
- focus ring color/width/offset
- disabled opacity/cursor
- min interactive target 44x44
- contrast targets

### 3.5 Theme mapping
- light: `:root`
- dark: `[data-theme="dark"]` (or existing `.dark` strategy, but unify and document)
Dark mode must override tokens only.

---

## STEP 4 — COMPONENT SYSTEM (REUSE-FIRST)

Use `src/lumio-web/src/components/ui` as base and upgrade it.

Required components (with stories + docs):
- Button
- TextField/Input
- TextArea
- Select
- Card
- Alert
- Badge (include Security variant)
- Progress
- WizardShell
- Topbar/Header actions area
- Dialog/Modal

Each requires states:
- default, hover, focus, disabled, loading (if relevant), error (if relevant)

Also build first-class **security primitives**:
- `ConfirmDestructiveAction` (password re-entry pattern)
- `SecureValueReveal` (eye toggle + auto-hide timeout)
- `ReadOnlyModeWrapper` (heir/read-only mode treatment)
- `ActivityLogItem`
- `SecurityStatusIndicator`
- `SessionTimeoutWarning`

---

## STEP 5 — PAGE LAYOUT NORMALIZATION (CRITICAL)

Do a layout pass over all authenticated pages in:
`src/lumio-web/src/app/(authenticated)`

### Must-fix now:
1. **Dashboard**  
   Current issue: many full-width stacked blocks with unused horizontal space.  
   Implement responsive page-level grid for top widgets while preserving readability.

2. **Instellingen (Settings)**  
   Current issue: almost entirely single-column card stack.  
   Implement responsive two-column desktop layout with sensible card grouping.

3. **Notifications UX change**  
   Move notifications from dashboard card to **header dropdown bell**.
   Keep optional dashboard summary section (hybrid model) for discoverability.

### Then review and normalize:
- boedel
- digitaal-bezit
- documenten
- erfgenamen
- noodcontacten
- export
- donor/testament/euthanasie/uitvaart overview pages
- keep timeline and wizard pages mostly linear where appropriate

Rules:
- Use consistent page containers and vertical rhythm
- No arbitrary layout magic numbers
- Respect 8pt spacing system
- Preserve current functionality and routing

---

## STEP 6 — GLOBAL REFACTOR ENFORCEMENT

Perform repo scan and replace:
- raw hex colors
- ad-hoc color utility classes for status messages
- duplicated ad-hoc alerts
- native `<select>` / `<input>` / `<textarea>` usages that bypass system components (except documented exceptions)

Create:
- `docs/design-system/REFACTOR_AUDIT.md`
- `docs/design-system/EXCEPTIONS.md`
- `docs/design-system/A11Y_GLOBAL_PASS.md`

Allowed exceptions only:
- 1px hairline rendering constraints
- forced third-party values
- intrinsic SVG sizing
All exceptions must be documented.

---

## STEP 7 — STORYBOOK AS LIVING CONTRACT

Add stories for:
- all primitives and security primitives
- key layout templates:
  - authenticated dashboard
  - settings layout
  - read-only/heir mode
  - wizard shell flow
  - destructive confirmation flow
  - notification dropdown behavior

Create:
- `docs/design-system/README.md`
- `docs/design-system/TOKENS.md`
- `docs/design-system/STATE_TOKENS.md`
- `docs/design-system/SECURITY_PATTERNS.md`
- `docs/design-system/A11Y.md`

---

## STEP 8 — CI GUARDRAILS

If compatible with project tooling:
- add lint rule preventing raw hex in app/components
- add stylelint/token usage guard
- optionally add visual regression baseline (Playwright/Storybook test runner)

---

## STEP 9 — EXECUTION DISCIPLINE

- Work in coherent commits per phase.
- After each phase:
  - run lint/typecheck/tests/build/storybook checks
  - record what changed and why
- Do not leave partially migrated mixed patterns in touched files.
- Prefer updating existing components over creating parallel duplicates.

---

## DEFINITION OF DONE

- Token layers implemented (base, semantic, state, accessibility)
- Dark mode purely token-mapped
- Required components + security primitives exist with stories
- Dashboard and Settings layout normalized responsively
- Notifications available from header dropdown (with optional dashboard summary)
- Raw styling debt significantly removed and documented
- Docs complete and accurate
- Build/lint/typecheck/storybook all pass
