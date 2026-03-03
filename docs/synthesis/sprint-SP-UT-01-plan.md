# Sprint Plan – SP-UT-01 – User Test & Test Execution Sprint

## Metadata
- Agent: 20-implementation-agent (User Research track)
- Sprint ID: SP-UT-01
- Sprint name: Shamir UX Retest & E2E Test Execution
- Based on: BLOCKING-P3-001, RISK-UX-001, GAP-A11Y-006, SP-UX-04-003 (carry-over)
- Date: 2026-03-04
- Sprint type: **USER RESEARCH / TEST EXECUTION** — runs in parallel with development sprints
- Isolation rationale: All user-test and test-execution work is moved to this sprint so that development sprints (SP-3 and later) are no longer blocked on research scheduling.

---

## Sprint Plan Assumptions

- Team composition:
  - **Team UX/Research** — UX Lead + PO: ANALYSIS / CONTENT stories — capacity: ~3 days scheduling + facilitation
  - **Team Dev** — 1 developer: INFRA story (SP-UT-01-003 axe e2e setup) — capacity: ~1 day
- Sprint duration: **on-demand** — no fixed cadence; all stories can start as soon as prerequisites are met and are independent of each other.
- Technology stack: Lumio Electron-app or staging web (`site/`) · Playwright (`npm run test:e2e`) · Lumio.Api (.NET 9)
- Prerequisites:
  - BUG-SHAMIR-001 fix is live on main (✅ merged SP-1)
  - Lumio.Api can be started locally for axe e2e run
  - Shamir test participants recruited (PO action — see SP-UT-01-000 below)

---

## Why a Separate Sprint?

All items below are **ANALYSIS** or **INFRA** stories that depend on human scheduling, participant recruitment, or a live API session — none of them are code-implementation work. Keeping them in a development sprint created a scheduling coupling that blocked unrelated code work indefinitely.

**Effect of isolation:**
- SP-3 and later development sprints can start immediately without waiting for user test results.
- Wizard redesign (GAP-UX-001) moves to its own sprint (SP-WIZ-01) and lists SP-UT-01 as an external pre-requisite — not a blocker on dev sprints that contain independent stories.
- BLOCKING-P3-001 status changes from *blocks-dev-sprint* to *owned-by-SP-UT-01*.

---

## Sprint SP-UT-01 – Shamir UX Retest & E2E Test Execution

### Goal
Establish empirical quality baselines for two safety-critical test activities:
1. The Shamir heir unlock flow — validate that non-technical users can complete it successfully (≥80% task success), and produce the findings needed to trigger the wizard redesign sprint.
2. The full-app WCAG axe e2e scan — establish a zero-critical-violation baseline across all 18 authenticated routes.

### Stories

| Story ID | Description | Type | Team | Acceptance Criteria | Story Points | Dependencies | Blocker | Risk |
|----------|-------------|------|------|---------------------|--------------|--------------|---------|------|
| SP-UT-01-000 | Recruit 5 Shamir UX test participants (40+, non-technical, not in active grief) | ANALYSIS | Team UX/Research | 5 confirmed participants with test date(s), communicated to team | 2 | None | EXTERN: PO recruits / schedules participants | HIGH — safety-critical flow depends on this |
| SP-UT-01-001 | Execute Shamir UX retest — 5 moderated sessions using `devdocs/shamir-ux-test-protocol.md` | ANALYSIS | Team UX/Research | All 5 sessions run, think-aloud recorded, T-01…T-05 metrics filled in | 3 | SP-UT-01-000 complete | INTERN: SP-UT-01-000 (scheduling) | HIGH — RISK-UX-001 |
| SP-UT-01-002 | Publish Shamir UX test findings report + update risk register | ANALYSIS | Team UX/Research | `devdocs/shamir-ux-test-protocol.md` results section filled · RISK-UX-001 status updated in `final-report-ux.md` · SYS-RISK-009 score updated · Wizard redesign sprint (SP-WIZ-01) unblocked if ≥80% pass | 2 | SP-UT-01-001 complete | INTERN: SP-UT-01-001 | MEDIUM |
| SP-UT-01-003 | Run Playwright axe e2e scan across 18 authenticated routes | INFRA | Team Dev | `npm run test:e2e` exits 0 · `devdocs/axe-e2e-test-results.md` results table fully populated · Zero critical axe violations (or all violations documented as known exceptions with JIRA/issue reference) | 2 | Lumio.Api running locally · Valid test profile + PIN available | INTERN: Requires live API session | MEDIUM — PENDING_LIVE_API carry-over from SP-UX-04-003 |

### Story Type Breakdown
- **ANALYSIS** (SP-UT-01-000, -001, -002): Human-led research activities. Scheduled and run by UX Lead + PO. No code changes.
- **INFRA** (SP-UT-01-003): Developer runs existing test infra against live API. No new code unless violations found that require bug-fix stories.

### Parallel Tracks

| Track | Type | Stories | Team | Start condition |
|-------|------|---------|------|-----------------|
| Track 1 (Research) | ANALYSIS | SP-UT-01-000 → SP-UT-01-001 → SP-UT-01-002 | Team UX/Research | Immediately — PO begins recruiting |
| Track 2 (Test Infra) | INFRA | SP-UT-01-003 | Team Dev | Any time Lumio.Api + Next.js are running; completely independent of Track 1 |

> Track 1 and Track 2 are fully independent. SP-UT-01-003 can be completed before or after the Shamir UX sessions.

### Blocker Register (SP-UT-01)

| Blocker ID | Story | Type | Description | Owner | Escalation | Status |
|------------|-------|------|-------------|-------|------------|--------|
| BLK-UT-001 | SP-UT-01-000 | EXTERN | Participant recruitment — 5 non-technical users 40+, not in active grief — requires network outreach | PO | Orchestrator if not started within 5 business days | OPEN |
| BLK-UT-002 | SP-UT-01-003 | INTERN | Requires live Lumio.Api session + test profile with valid PIN | Team Dev | PO if API won't start | OPEN — see run instructions in `devdocs/axe-e2e-test-results.md` |

---

## Run Instructions — SP-UT-01-003 (Axe E2E)

```powershell
# Terminal 1 — Start the .NET API (from repo root)
cd D:\repositories\Lumio\src\Lumio.Api
dotnet run --no-build

# Terminal 2 — Start Next.js dev server
cd D:\repositories\Lumio\site
npm run dev

# Terminal 3 — Run Playwright e2e tests with PIN
$env:LUMIO_TEST_PASSWORD = "<your-test-profile-pin>"
cd D:\repositories\Lumio\site
npm run test:e2e
```

Update `devdocs/axe-e2e-test-results.md` with results. If any critical violations are found, create a new story (SP-UT-01-003a etc.) per violation, tagged `type: CODE`, to be picked up by the next dev sprint.

---

## Downstream Dependencies (what SP-UT-01 unlocks)

| Downstream Sprint | Trigger | Condition |
|-------------------|---------|-----------|
| **SP-WIZ-01** — Shamir/Wizard redesign | SP-UT-01-002 DONE | Task success ≥80%? → close RISK-UX-001; or if < 80%? → scope redesign stories from findings |
| **RISK-MKT-004 validation** | SP-UT-01-002 DONE | "In één middag" brand claim can be validated or disclaimed based on measured cognitive load |
| **GAP-CONTENT-004** — Post-Shamir key distribution guidance | SP-UT-01-002 DONE | Content gaps identified in test can be addressed in next content sprint |
| **Shamir flow KPI baseline** | SP-UT-01-002 DONE | `INSUFFICIENT_DATA:` on "Shamir flow completion rate" KPI resolved |

**Development sprints SP-3 and later are NOT blocked by SP-UT-01.** They can run immediately on any independent backlog items.

---

## Definition of Done — SP-UT-01

- [ ] SP-UT-01-000: 5 participants confirmed + test date(s) set
- [ ] SP-UT-01-001: 5 moderated Shamir UX sessions completed, recordings stored
- [ ] SP-UT-01-002: Findings report published in `devdocs/shamir-ux-test-protocol.md` (Results section) + RISK-UX-001 status updated
- [ ] SP-UT-01-003: `devdocs/axe-e2e-test-results.md` fully populated (zero critical violations OR documented exceptions)
- [ ] All ANALYSIS findings fed into backlog as scoped CODE/DESIGN stories before sprint close
- [ ] `docs/session/velocity-log.json` entry added for SP-UT-01

---

## Handoff to SP-WIZ-01

Once SP-UT-01-002 is DONE, the Orchestrator should:
1. Copy the "Top-3 usability issues" from the findings report
2. Scope SP-WIZ-01 stories from those findings (REC-UX-003/004)
3. Remove BLOCKING-P3-001 from the cross-team-blocker-matrix (replace with BLK-009: RESOLVED)

---

## HANDOFF CHECKLIST
- [x] All required sections are filled (not empty, not placeholder)
- [x] All UNCERTAIN: items are documented and escalated
- [x] All INSUFFICIENT_DATA: items are documented and escalated
- [x] Output complies with the contract in /docs/contracts/sprintplan-output-contract.md
- [x] Guardrails from /docs/guardrails/ have been checked (G-UX-003: Shamir changes gated on test)
- [x] Output is machine-readable and ready as input for the next agent
- [x] No contradictory statements in this document
- [x] All findings include a source reference
