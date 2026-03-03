# Phase 2 Questionnaires — Data Architecture
> Agent: Questionnaire Agent (36) | Phase: PHASE-2 | Date: 2026-03-03
> Source: `BusinessDocs/Phase2-Tech/phase2-analysis.md` QUESTIONNAIRE_REQUEST items Q-09-001 through Q-09-002

---

## Purpose

These questions address gaps identified by the Data Architect. Your answers will directly determine the implementation approach for video file encryption and the timing of a legacy database cleanup task.

---

## Questions

### Q-09-001 [REQUIRED]
**Video message file size — encryption approach decision**

Video messages recorded in Lumio are stored as files in the `data/videos/` directory (outside the encrypted SQLite database). This means video content is not encrypted at rest, which is inconsistent with the product's privacy-first positioning.

To decide between two encryption approaches, we need to understand typical video sizes:

| Parameter | Your estimate |
|-----------|--------------|
| Typical video message duration (minutes) | 5 |
| Approximate file size per video (MB) | 50 |
| Maximum expected videos per profile | 10 |

**Based on file size, which approach do you prefer?**
- [x] **Filesystem encryption**: encrypt each video file using the master password-derived key. Pros: no memory pressure, works for large files. Cons: extra complexity, key management.
- [ ] **SQLite BLOB storage**: store video content directly in the encrypted SQLite database. Pros: simplicity, single encrypted container. Cons: large BLOBs can cause memory pressure and backup complexity.
- [ ] **No preference — let the technical team decide** based on the file sizes above.

**Your answer:** ___________________________

---

### Q-09-002 [REQUIRED]
**Legacy databases — ADR-001 cleanup eligibility**

ADR-001 documents a "belt-and-suspenders" database bridge (`EnsureSchuldKolommenAsync`) for databases that were created before EF Core migrations were introduced. This bridge is no longer needed once all active databases have run the official EF migration.

Do any active user-installed databases still predate EF migrations (i.e., were created using `EnsureCreated` before migration tracking was introduced)?

- [x] **No** — all known installations have run the EF migrations. The ADR-001 cleanup can be scheduled.
- [ ] **Yes** — there are known installations that have not yet migrated. (Estimated number: _____ )
- [ ] **Unknown** — we have no visibility into the installed base.

**Your answer + any known production database file dates:** ___________________________

---

## Answer Status

| Q-ID | Question | Status | Answered Date |
|------|----------|--------|---------------|
| Q-09-001 | Video file size / encryption approach |  ANSWERED  | — |
| Q-09-002 | Legacy database cleanup eligibility |  ANSWERED  | — |
