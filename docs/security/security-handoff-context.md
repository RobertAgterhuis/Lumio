# Security Handoff Context

> Agent: Security Architect (Agent 08)  
> Last updated: 2026-03-03  
> Status: **UP TO DATE** — resolves `SECURITY_HANDOFF_STATUS: UPDATE_REQUIRED` from DEC-108 / reevaluation-report-v2

---

## Purpose

This document tracks structural security constraints that every agent, developer, and sprint must be aware of. It is updated whenever a security-relevant architectural decision is made that changes the attack surface, the authentication boundary, or the trust model of the application.

---

## 1. DatabaseUnlockMiddleware — Unauthenticated Whitelist (AllowedPrefixes)

**File:** `src/Lumio.Api/Middleware/DatabaseUnlockMiddleware.cs` — lines 8–20  
**Decision:** DEC-108 (2026-03-03)  
**Bug that triggered this update:** BUG-SHAMIR-001

### What it does

`DatabaseUnlockMiddleware` intercepts every API request. If the database is locked (no active profile + master password not set), it returns HTTP **423 Locked** — except for paths listed in `AllowedPrefixes`.

### Current AllowedPrefixes

| Path prefix | Reason | Added |
|---|---|---|
| `/api/v1/auth/` | Login / setup flows — must work before unlock | Initial |
| `/api/v1/profielen` | Profile selection — must work before unlock | Initial |
| `/api/v1/backup/restore` | Restoring a backup is the unlock path for new installs | Initial |
| `/swagger` | Developer tooling — non-production | Initial |
| `/api/v1/shamir/drempel` | Public endpoint: heirs need the threshold before entering codes | SP-10-COR-001 |
| `/api/v1/shamir/reconstrueer-en-ontgrendel` | **BUG-SHAMIR-001 fix**: heir unlock endpoint MUST be reachable before DB unlock — otherwise heirs can never unlock by design. Self-validates via Shamir reconstruction + PBKDF2. | SP-1-016 / DEC-108 |

### Security rationale for `/api/v1/shamir/reconstrueer-en-ontgrendel`

Placing this endpoint in `AllowedPrefixes` does **not** reduce security because:
1. The controller (`ShamirController.reconstrueerEnOntgrendel`) accepts Shamir secret shares.
2. It reconstructs the master password via Shamir's Secret Sharing.
3. It then calls `_masterPassword.UnlockAsync(reconstructedPassword)` — which performs PBKDF2 key derivation and verifies the result against the stored salt.
4. Access without valid shares produces HTTP 401. There is no data exposure path.

Unauthenticated bypass of this endpoint without correct Shamir shares is computationally infeasible.

### Structural Constraint (DEC-108)

> **Any future endpoint that must be reachable before DB unlock MUST be explicitly added to `AllowedPrefixes` with a security comment explaining why it is safe to expose unauthenticated.**

Examples: SSO callback, future password reset flow, future B2B provisioning endpoint.

**Failure to add new required endpoints** = HTTP 423 for that functionality (BUG-SHAMIR-001 class of bug).  
**Incorrectly adding endpoints** = unauthenticated data exposure (security regression).

### Regression Guard

`DatabaseUnlockMiddlewareTests.cs` — test `LockedDatabase_AllowedPrefix_PassesThrough` (Theory with InlineData):
- Verifies all `AllowedPrefixes` paths pass through when DB is locked.
- Verifies protected paths return 423 when DB is locked.
- **This test MUST fail if `/api/v1/shamir/reconstrueer-en-ontgrendel` is (accidentally) removed from AllowedPrefixes.**

**REC-SEC-005:** All future changes to `AllowedPrefixes` must update the `[InlineData]` test cases.

---

## 2. ReadOnlyAllowedPrefixes — Heir/Erfgenaam Mode

When a successful Shamir reconstruction unlocks the DB in read-only mode (heir context), a second filter (`ReadOnlyAllowedPrefixes`) applies: only read-oriented and export endpoints pass write-method requests.

**Current ReadOnlyAllowedPrefixes:**

| Path prefix | Reason |
|---|---|
| `/api/v1/auth/` | Session management |
| `/api/v1/export/` | Heir may export the estate overview |
| `/api/v1/status` | Status polling |
| `/api/v1/afhandeling` | Post-death action handlers |
| `/api/v1/profielen` | Profile selection |
| `/api/v1/backup/restore` | Backup restore path |
| `/swagger` | Dev tooling |

All other paths receiving POST / PUT / PATCH / DELETE return HTTP **423** in read-only mode.

**Frontend enforcement:** `ErfgenaamItem.tsx` hides all mutating buttons (`isReadOnly` prop) when `authStore.isReadOnly === true` (set after successful Shamir unlock). This is a UX guard only — the backend is the authoritative gate.

---

## 3. CSP / unsafe-inline Constraint

`unsafe-inline` is present in the Content Security Policy (DEC-105, DEC-106). This is an accepted architectural constraint for Next.js static export with inline hydration scripts. **Must not be removed** until SSR migration (SP-15+).

---

## 4. TruffleHog Pre-Push Hook

Active: `.githooks/pre-push`  
Activated via: SP-1-001 (issue #140)  
Purpose: Scan all commits in a push for secrets before they reach the remote.  
Bypass: git push --no-verify (forbidden except in documented emergencies; must be noted in decisions.md).

---

## 5. Open Security Items

| ID | Risk | Sprint | Status |
|---|---|---|---|
| REC-SEC-005 | Integration test for AllowedPrefixes whitelist completeness | SP-1 | ✅ IMPLEMENTED — `DatabaseUnlockMiddlewareTests.cs` |
| GAP-A11Y-001 | Color contrast / WCAG 2.1 AA — design tokens extracted | SP-1 | ✅ RESOLVED — `docs/brand/design-tokens.json` present |
| DEC-202 | Penetration test | SP-14 | UITGESTELD — after v1.0 |
| REC-SEC-001 | Nonce-based CSP via SSR | Post-v1.0 | ACCEPTED RISK — DEC-106 |
| NEW-002 | Whitelist is a static array — no automated enforcement beyond test | Ongoing | MITIGATED by REC-SEC-005; acceptable for v1.0 |
