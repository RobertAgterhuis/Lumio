# Phase 2 Questionnaires — DevOps & Infrastructure
> Agent: Questionnaire Agent (36) | Phase: PHASE-2 | Date: 2026-03-03
> Source: `BusinessDocs/Phase2-Tech/phase2-analysis.md` QUESTIONNAIRE_REQUEST items Q-05-001 through Q-05-003

---

## Purpose

These questions address gaps identified by the DevOps Engineer and Software Architect. Your answers will be used to:
- Determine when and how CI quality gates can be re-enabled
- Plan the EV Code Signing timeline for the v1.0 release
- Scope the future SSR migration decision

---

## Questions

### Q-05-001 [REQUIRED]
**CI billing/spending limit — resolution timeline**

The full CI pipeline (`ci.yml`) has been disabled since 2026-03-02 due to a GitHub Actions spending limit. While disabled, no automated quality gates run on merges to `main` (no secret scan, no unit tests, no linting, no npm audit).

What is the current situation with the spending limit?

- [ ] We expect to resolve the billing issue within **1–2 weeks** — re-enable the full CI pipeline
- [ ] We are switching to **GitHub-hosted runners with a monthly budget cap** (specify: _____ minutes/month)
- [ ] We are considering **self-hosted runners** — this is being investigated
- [x] We will keep CI manual (`workflow_dispatch`) and instead invest in **stronger pre-commit hooks** as the primary gate
- [ ] Other: _____________________________

**Your answer / timeline:** We will keep CI manual (`workflow_dispatch`) and instead invest in **stronger pre-commit hooks** as the primary gate
---

### Q-05-002 [OPTIONAL]
**SSR migration — future roadmap decision**

The current Next.js setup uses `output: "export"` (static export), which requires `unsafe-inline` in the Content Security Policy. Migrating to SSR (Next.js server runtime) would allow a strict nonce-based CSP, but is currently not planned (DEC-106).

Is an SSR migration being considered for a future SaaS or web variant of Lumio?

- [ ] **Yes** — planned for a specific release: _____
- [ ] **Yes** — planned for a future SaaS variant (no specific date yet)
- [ ] **Not currently planned** — desktop-only remains the focus beyond v1.0
- [ ] **Undecided** — depends on market response / funding

**Your answer:** **Not currently planned** — desktop-only remains the focus beyond v1.0

---

### Q-05-003 [REQUIRED]
**EV Code Signing — v1.0 release gate decision**

EV (Extended Validation) Code Signing for the Windows installer has been deferred (DEC-201). Without it, Windows Defender SmartScreen warns new users when downloading and running the installer, which can significantly impact the first-run conversion rate.

When should EV Code Signing be in place?

- [ ] **Before v1.0 GA** — it is required for the first public release
- [ ] **After v1.0** — we accept the SmartScreen warning for the initial release period
- [ ] **Only needed for B2B distribution** — target B2B launch milestone
- [ ] **Not needed** — our distribution channel does not go through direct download (e.g., only USB distribution to known recipients)

**Your answer:** **After v1.0** — we accept the SmartScreen warning for the initial release period

---

## Answer Status

| Q-ID | Question | Status | Answered Date |
|------|----------|--------|---------------|
| Q-05-001 | CI billing resolution timeline |  ANSWERED | — |
| Q-05-002 | SSR migration roadmap |  ANSWERED  | — |
| Q-05-003 | EV Code Signing release gate |  ANSWERED  | — |
