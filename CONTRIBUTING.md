# Contributing to Lumio

Thank you for your interest in contributing to Lumio! This document provides guidelines and information for contributors.

## 🏗️ Development Setup

See the [technical documentation](docs/technical-manual/EN/10-development-environment.md) for detailed setup instructions.

### Quick Start

```powershell
# Start all development services
./start-dev.ps1
```

This starts:
- Backend API (http://localhost:5123)
- Frontend (http://localhost:3000)
- Storybook (http://localhost:6007)

## 📋 PR Review Checklist

Before submitting a PR, ensure the following items are addressed:

### Code Quality
- [ ] All TypeScript/ESLint errors are resolved (`npm run lint`)
- [ ] No `any` types added without justification
- [ ] No `eslint-disable` comments without explanation
- [ ] Functions are reasonably sized (< 50 lines preferred)
- [ ] Complex logic is documented with comments

### Design System Compliance
- [ ] Uses design tokens from `tokens.css` (no hardcoded colors/spacing)
- [ ] Token validation passes (`npm run validate-tokens`)
- [ ] No arbitrary Tailwind values (e.g., `p-[20px]` → use `p-5`)
- [ ] Component follows existing patterns in the codebase

### Testing
- [ ] Unit tests added for new logic (`npm run test`)
- [ ] Tests pass locally
- [ ] Edge cases are covered
- [ ] Storybook stories added for new components

### API Changes
- [ ] Breaking change detection passes (`npm run detect-breaking-changes`)
- [ ] If intentionally breaking: baseline updated and frontend adapted
- [ ] DTO changes reflected in OpenAPI spec
- [ ] Validators updated for new fields
- [ ] If API contract changed: `openapi.json` and `src/lib/api/` regenerated (see below)

### Regenerating the OpenAPI Client (SP-1-004)

The committed `src/lumio-web/openapi.json` documents the API contract. `src/lumio-web/src/lib/api/` contains the generated TypeScript client. Regenerate whenever the API changes:

```powershell
# 1. Start the backend API (Development mode)
cd src/Lumio.Api
$env:ASPNETCORE_ENVIRONMENT = "Development"
dotnet run

# 2. In a second terminal: export the live spec, then regenerate the TS client
cd src/lumio-web
npm run export-spec        # saves openapi.json from http://127.0.0.1:5123/swagger/v1/swagger.json
npm run generate-api       # regenerates src/lib/api/ from openapi.json

# 3. Commit both files
git add openapi.json src/lib/api/
git commit -m "chore(api): regenerate OpenAPI spec and TypeScript client"
```

> **CI drift detection** (future): once CI is active, a lint step will compare the committed `openapi.json`
> against the live spec to catch uncommitted contract drift.

### Security (Electron)
- [ ] No `nodeIntegration: true` in webPreferences
- [ ] No `contextIsolation: false`
- [ ] IPC channels have input validation
- [ ] External URLs only opened via `https://`
- [ ] CSP headers enforced

### Accessibility
- [ ] Interactive elements are keyboard accessible
- [ ] Form fields have associated labels
- [ ] Color contrast meets WCAG 2.1 AA
- [ ] Screen reader tested for complex interactions

### Internationalization
- [ ] All user-visible strings use `next-intl` (`useTranslations`)
- [ ] Translation keys added to both `nl.json` and `en.json`
- [ ] No hardcoded Dutch/English text in components
- [ ] Backend validation errors are translatable

### Documentation
- [ ] README updated if setup steps changed
- [ ] Technical docs updated for architectural changes
- [ ] JSDoc comments for public functions/components
- [ ] Breaking changes noted in commit message

## 🔀 Git Conventions

### Branch Naming
- `feature/description` - New features
- `fix/description` - Bug fixes
- `refactor/description` - Code improvements
- `docs/description` - Documentation changes
- `ci/description` - CI/CD changes

### Commit Messages
Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(testament): add PDF export option
fix(auth): handle expired tokens gracefully
refactor(wizard): extract progress hook
docs(readme): update setup instructions
ci(github): add breaking change detection
```

### Breaking Changes
For breaking changes, add `!` after the type:

```
feat(api)!: rename /erfgenamen to /heirs

BREAKING CHANGE: The endpoint /api/erfgenamen has been renamed to /api/heirs.
Update all API client calls accordingly.
```

## 🧪 Running CI Checks Locally

Before pushing, run the full CI suite:

```powershell
# In src/lumio-web
npm run lint          # ESLint + TypeScript
npm run test          # Unit tests
npm run validate-tokens   # Design token sync
npm run detect-breaking-changes  # API compatibility (requires API running)
npm run build         # Production build
npm run size          # Bundle size check
```

## 🎨 Design System

### Using Tokens
```tsx
// ✅ Good - uses design tokens
<div className="bg-surface-primary text-content-primary p-4" />

// ❌ Bad - hardcoded values
<div className="bg-[#ffffff] text-[#1a1a1a] p-[16px]" />
```

### Adding New Tokens
1. Add CSS custom property to `src/styles/tokens.css`
2. Add Tailwind mapping to `src/styles/globals.css` @theme
3. Run `npm run validate-tokens` to verify sync
4. Document in Storybook

## 🔒 Security Guidelines

### TruffleHog Pre-Push Hook (Required)

This repo ships a Git hook that blocks pushes containing verified secrets (API keys, passwords, tokens).

**Activate once per clone:**
```powershell
git config core.hooksPath .githooks
```

**Install TruffleHog** (required; hook warns but does not block if missing):
```powershell
# Windows (winget)
winget install trufflesecurity.trufflehog

# macOS / Linux (brew)
brew install trufflehog
```

If TruffleHog finds a secret, the push is blocked. Rotate the exposed credential immediately, then rewrite history with `git rebase -i` or `git filter-repo` before retrying.

### Electron IPC
All IPC channels must:
1. Be defined in `preload/index.ts`
2. Have input validation
3. Use `ipcRenderer.invoke` (not `send`) for request/response
4. Never expose `ipcRenderer` directly to renderer

### Content Security Policy
The CSP is enforced via `session.defaultSession.webRequest`. Never:
- Allow `unsafe-eval` in production
- Load external scripts
- Use `javascript:` URLs

## 📦 Dependencies

- Avoid adding new dependencies without discussion
- Check bundle size impact: `npm run size:why`
- Prefer tree-shakeable ESM packages
- Security audit: `npm audit`

## 🐛 Reporting Issues

When reporting bugs, include:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Environment (OS, Node version, etc.)
5. Screenshots/logs if applicable

## 💬 Questions?

Open a GitHub Discussion or contact the maintainers.
