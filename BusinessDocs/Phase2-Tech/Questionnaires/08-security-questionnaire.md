# Phase 2 Questionnaires — Security
> Agent: Questionnaire Agent (36) | Phase: PHASE-2 | Date: 2026-03-03
> Source: `BusinessDocs/Phase2-Tech/phase2-analysis.md` QUESTIONNAIRE_REQUEST items Q-08-001 through Q-08-002

---

## Purpose

These questions address security gaps identified by the Security Architect. Your answers will be used to:
- Document and validate the session timeout behaviour for in-memory key material
- Determine whether a penetration test is in scope for an upcoming sprint

---

## Questions

### Q-08-001 [REQUIRED]
**Session timeout — idle duration and behaviour specification**

The application uses a `SessionTimeoutManager` in the Electron main process, but the exact behaviour is not documented in any specification file. This is important because:
- The master password and database key are held in memory while the session is active
- An unattended unlocked session exposes all personal and health data on the device

Please specify the current session timeout configuration:

| Parameter | Value |
|-----------|-------|
| Idle timeout duration (minutes) | 1 |
| What counts as "user activity" (e.g., mouse move, keypress, API call)? | only user activity |
| What happens on timeout: UI locked only, or database key cleared from memory? | ui locked |
| Can the user configure the timeout duration? | Yes  |
| Default timeout duration if user has not configured it | 5 minutes |

**Any additional notes:** ___________________________

---

### Q-08-002 [OPTIONAL]
**Penetration test — scope and timeline**

A penetration test has been deferred (DEC-202) with the note "not blocking; to be performed at the end of the development cycle if applicable."

Given that Lumio processes special-category health data (art. 9 AVG), a penetration test before v1.0 public release is highly advisable for both security assurance and customer trust when targeting B2B.

- [ ] **Scope confirmed — planned before v1.0 GA**: target date _____
- [ ] **Agreed in principle — no date yet**: expected in sprint _____ or release _____
- [ ] **Deferred further — conditions for triggering it**: _____
- [x] **Not planned for v1.0** — deliberate decision; rationale: cost to high to do independent penetration test

**Your answer:** ___________________________

---

## Answer Status

| Q-ID | Question | Status | Answered Date |
|------|----------|--------|---------------|
| Q-08-001 | Session timeout specification |  ANSWERED  | — |
| Q-08-002 | Penetration test scope/timeline |  ANSWERED  | — |
