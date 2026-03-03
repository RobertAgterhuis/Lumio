# Phase 2 Questionnaires — Legal & Privacy
> Agent: Questionnaire Agent (36) | Phase: PHASE-2 | Date: 2026-03-03
> Source: `BusinessDocs/Phase2-Tech/phase2-analysis.md` QUESTIONNAIRE_REQUEST items Q-33-001 through Q-33-003

---

## Purpose

These questions address legal and privacy compliance gaps identified by Legal Counsel. The risk assessment elevated GAP-LEGAL-001 (no privacy policy) to CRITICAL — AVG art. 13 applies from the moment personal data is collected. Your answers will determine sprint priority and whether external legal counsel is required.

---

## Questions

### Q-33-001 [REQUIRED]
**PostHog Data Processing Agreement (DPA)**

Lumio uses PostHog for analytics (`posthog-js`, sending data to `https://eu.i.posthog.com`). Under AVG art. 28, any third-party processor must operate under a documented Data Processing Agreement.

PostHog BV provides a standard DPA as part of their service. Has this been signed or accepted?

- [ ] **Yes** — DPA accepted/signed. Date: _____ · Reference/confirmation number: _____
- [ ] **Not yet** — we need to complete this. (Action: log into PostHog account → Settings → Privacy → DPA)
- [x] **PostHog is being removed** — as an alternative to the DPA process

**Your answer:** **PostHog is being removed** — as an alternative to the DPA process
---

### Q-33-002 [REQUIRED]
**Privacy policy and B2B agreement — authorship and legal support**

Two legal documents need to be created (both rated P1 in the Phase 2 analysis):
1. **User-facing privacy statement** (AVG art. 13 obligation — CRITICAL)
2. **B2B joint-controller/data processing agreement template** (AVG art. 26 — required before first B2B customer)

Who will author and review these documents?

**Privacy policy:**
- [ ] Self-authored (founder/developer), no external review
- [x] Self-authored + reviewed by a privacy lawyer before publishing
- [ ] Commissioned to a privacy attorney / legal firm
- [ ] Using a legal document template service (e.g., iubenda, Cookiebot, Termly) + customization

**B2B joint-controller agreement:**
- [ ] Self-authored using a standard template from VNO-NCW / MKB-Nederland
- [x] Self-authored + reviewed by a lawyer
- [ ] Commissioned to a commercial law attorney
- [ ] Not yet determined

**Estimated budget for legal services (if applicable):** ___________________________

---

### Q-33-003 [OPTIONAL]
**AP controller registration**

In the Netherlands, registration with the Autoriteit Persoonsgegevens (AP) is not automatically required for all controllers. However, for special-category data processing (art. 9 AVG — euthanasia directives, donor registration), the AP recommends voluntary notification in some contexts.

Has Lumio been registered with or notified to the Autoriteit Persoonsgegevens?

- [ ] **Yes** — registration reference: _____
- [x] **No** — we have assessed that registration is not required in our context
- [ ] **Not known** — this has not been investigated
- [ ] **In progress** — target date: _____

**Your answer:** ___________________________

---

## Answer Status

| Q-ID | Question | Status | Answered Date |
|------|----------|--------|---------------|
| Q-33-001 | PostHog DPA status | ANSWERED | — |
| Q-33-002 | Privacy policy and B2B agreement authorship |  ANSWERED  | — |
| Q-33-003 | AP controller registration |  ANSWERED  | — |
