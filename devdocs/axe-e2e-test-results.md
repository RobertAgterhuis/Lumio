# Playwright Axe E2E Test Results — SP-UX-04-003

> **SP-UX-04-003** | GAP-A11Y-006 — WCAG 2.1 AA automated audit via Playwright + axe-core  
> **Infra status:** `READY` — axe e2e infrastructure delivered by SP-2-006  
> **Test status:** `PENDING_LIVE_API` — tests not yet executed against production-equivalent environment

---

## Prerequisites

| Tool | Status | Notes |
|---|---|---|
| Playwright + axe-playwright | ✅ Installed | `npm run test:e2e` in `src/lumio-web/` |
| `.env.test` template | ✅ Present | `LUMIO_TEST_PASSWORD` required |
| Next.js dev server | Requires `npm run dev` | Port 3000 |
| Lumio API (dotnet) | Requires `dotnet run --project src/Lumio.Api` | Port 5001 |

---

## How to Run

```powershell
# 1. Start API
Start-Process -NoNewWindow dotnet -ArgumentList "run --project D:\repositories\Lumio\src\Lumio.Api --no-build"

# 2. Start Next.js dev server (separate terminal)
Set-Location D:\repositories\Lumio\src\lumio-web
npm run dev

# 3. In a third terminal — set PIN + run tests
$env:LUMIO_TEST_PASSWORD = "your-pin-here"   # 6-digit PIN
npm run test:e2e
```

---

## Routes Under Test (18 authenticated routes)

| Route | WCAG Level | Notes |
|---|---|---|
| `/dashboard` | AA | Primary overview, progress bar |
| `/eigenaar` | AA | Form-heavy, LabelWithHelp components |
| `/testament` | AA | Complex form with dialogs |
| `/testament/wizard` | AA | Multi-step wizard flow |
| `/euthanasie` | AA | Sensitive content with legal disclaimers |
| `/euthanasie/wizard` | AA | Multi-step wizard |
| `/donor` | AA | Donor registration form |
| `/donor/formulier` | AA | Form-heavy |
| `/uitvaart` | AA | Funeral wishes |
| `/uitvaart/wizard` | AA | Multi-step wizard |
| `/boedel` | AA | Asset management, data tables |
| `/digitaal-bezit` | AA | Digital assets |
| `/documenten` | AA | Document upload area |
| `/erfgenamen` | AA | Heir management, ShamirDialog flow |
| `/noodcontacten` | AA | Emergency contacts |
| `/tijdlijn` | AA | Timeline visualization |
| `/videoboodschappen` | AA | Video management |
| `/export` | AA | Export functionality |

---

## Known Pre-Test Findings (from Storybook axe + manual audit)

| Gap ID | Component / Route | Issue | Severity |
|---|---|---|---|
| GAP-A11Y-001 | All | Color contrast unverified — no design tokens spec | CRITICAL |
| GAP-A11Y-006 | 18 authenticated routes | No automated WCAG scan results on record | CRITICAL |
| — | `status-badge.tsx` | Icon `aria-hidden` not set when `showIcon=true` — **needs code fix if confirmed** | HIGH |
| — | `help-tooltip.tsx` | Info icon has no `aria-hidden` attribute | MEDIUM |

---

## Acceptance Criteria for SP-UX-04-003

- [ ] All 18 routes scanned with Playwright axe (no hard blockers preventing scan)
- [ ] Zero **critical** violations (WCAG 2.1 AA rule set)
- [ ] Violations at **serious** level documented with GitHub issue references
- [ ] Results table filled in the "Results" section below

---

## Results

> **STATUS: PENDING_LIVE_API**  
> This section will be updated after first e2e run against live API.

| Route | Critical | Serious | Moderate | Minor | Run date |
|---|---|---|---|---|---|
| `/dashboard` | — | — | — | — | not run |
| `/eigenaar` | — | — | — | — | not run |
| `/testament` | — | — | — | — | not run |
| `/erfgenamen` | — | — | — | — | not run |
| `/euthanasie` | — | — | — | — | not run |
| `/donor` | — | — | — | — | not run |
| `/uitvaart` | — | — | — | — | not run |
| `/boedel` | — | — | — | — | not run |
| `/digitaal-bezit` | — | — | — | — | not run |
| `/documenten` | — | — | — | — | not run |
| `/noodcontacten` | — | — | — | — | not run |
| `/tijdlijn` | — | — | — | — | not run |
| `/videoboodschappen` | — | — | — | — | not run |
| `/export` | — | — | — | — | not run |
| `/audit-log` | — | — | — | — | not run |
| `/instellingen` | — | — | — | — | not run |
| `/help` | — | — | — | — | not run |
| `/testament/wizard` | — | — | — | — | not run |

---

## Next Steps

1. PO/dev schedules a test session with live API running (prerequisite: valid profile + PIN)
2. Run `npm run test:e2e` and capture console output
3. Update the Results table above with actual violation counts
4. Open GitHub issues for any critical/serious violations found
5. Mark SP-UX-04-003 as `DONE` once zero critical violations confirmed

---

## References

- Infrastructure implementation: SP-2-006 (axe playwright config, 18-route test)
- Test config: `src/lumio-web/playwright.config.ts`
- Axe test file: `src/lumio-web/tests/a11y-authenticated.spec.ts` (created by SP-2-006)  
- Phase 3 analysis: `BusinessDocs/Phase3-UX/phase3-analysis.md` → GAP-A11Y-006
