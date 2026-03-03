# Questionnaire Index
> Last updated: 2026-03-03T00:00:00Z

| File | Phase | Agent | Questions | Answered | Status |
|------|-------|-------|-----------|----------|--------|
| Phase1-Business/Questionnaires/01-business-analyst-questionnaire.md | Phase 1 | Business Analyst | 5 | 5 | COMPLETE |
| Phase1-Business/Questionnaires/03-sales-strategist-questionnaire.md | Phase 1 | Sales Strategist | 12 | 9 | PARTIAL (Q-03-010/011/012 open) |
| Phase1-Business/Questionnaires/04-financial-analyst-questionnaire.md | Phase 1 | Financial Analyst | 8 | 0 | OPEN |
| Phase2-Tech/Questionnaires/05-devops-questionnaire.md | Phase 2 | DevOps Engineer | 3 | 3 | COMPLETE |
| Phase2-Tech/Questionnaires/08-security-questionnaire.md | Phase 2 | Security Architect | 2 | 2 | COMPLETE |
| Phase2-Tech/Questionnaires/09-data-questionnaire.md | Phase 2 | Data Architect | 2 | 2 | COMPLETE |
| Phase2-Tech/Questionnaires/33-legal-questionnaire.md | Phase 2 | Legal Counsel | 3 | 3 | COMPLETE |
| Phase3-UX/Questionnaires/10-ux-researcher-questionnaire.md | Phase 3 | UX Researcher | 3 | 0 | OPEN |
| Phase3-UX/Questionnaires/12-ui-designer-questionnaire.md | Phase 3 | UI Designer + UX Designer | 4 | 0 | OPEN |
| Phase3-UX/Questionnaires/13-accessibility-questionnaire.md | Phase 3 | Accessibility Specialist | 2 | 0 | OPEN |
| Phase3-UX/Questionnaires/32-content-l10n-questionnaire.md | Phase 3 | Content Strategist + L10n | 5 | 0 | OPEN |
| Phase4-Marketing/Questionnaires/14-16-brand-cro-questionnaire.md | Phase 4 | Brand Strategist + CRO | 7 | 0 | OPEN |
| Phase4-Marketing/Questionnaires/15-growth-marketer-questionnaire.md | Phase 4 | Growth Marketer | 4 | 0 | OPEN |

## Summary
- Total questionnaire files: 13
- Total questions: 60 (42 REQUIRED, 18 OPTIONAL)
- Answered: 24 (40%)
- Required + open: 27
- Last scan: 2026-03-03

## Required questions by agent
| Phase | Agent | Required | Optional | Total |
|-------|-------|----------|----------|-------|
| 1 | Business Analyst | 4 | 1 | 5 |
| 1 | Sales Strategist | 8 | 4 | 12 |
| 1 | Financial Analyst | 7 | 1 | 8 |
| 2 | DevOps Engineer | 2 | 1 | 3 |
| 2 | Security Architect | 1 | 1 | 2 |
| 2 | Data Architect | 2 | 0 | 2 |
| 2 | Legal Counsel | 2 | 1 | 3 |
| 3 | UX Researcher | 2 | 1 | 3 |
| 3 | UI Designer + UX Designer | 2 | 2 | 4 |
| 3 | Accessibility Specialist | 1 | 1 | 2 |
| 3 | Content Strategist + L10n | 2 | 3 | 5 |
| 4 | Brand Strategist + CRO | 4 | 3 | 7 |
| 4 | Growth Marketer | 2 | 2 | 4 |

## Priority questions (REQUIRED + blocking)
| Q-ID | Agent | Blocking for |
|------|-------|-------------|
| Q-01-001/002/004/005 | Business Analyst | Revenue model, financial model completeness |
| Q-03-007 | Sales Strategist | Sprint plan scheduling |
| Q-04-006 | Financial Analyst | REC-FIN-001 scoping |
| Q-05-001 | DevOps | CI re-enablement timeline |
| Q-05-003 | DevOps | v1.0 GA release gate (EV signing) |
| Q-09-001 | Data Architect | Video encryption sprint planning |
| Q-33-001 | Legal Counsel | PostHog DPA compliance |
| Q-33-002 | Legal Counsel | Privacy policy + B2B agreement authorship |
| Q-UX-R-002 | UX Researcher | Activation baseline for conversion recommendations |
| Q-UX-UI-001 | UI Designer | Design tokens → WCAG contrast verification (BLOCKING-P3-002) |
| Q-UX-A11Y-001 | A11y Specialist | WCAG 2.1 AA audit baseline |
| Q-UX-C-001 | Content Strategist | Activation success state copy (post-wizard) |
| Q-UX-C-002 | Content Strategist | Post-Shamir key distribution guidance (BLOCKING-P3-003 related) |
| Q-MKT-B-001 | Brand Strategist | Competitive landscape — required for positioning validation |
| Q-MKT-B-002 | Brand Strategist | Domain strategy decision (GAP-BRAND-001) |
| Q-MKT-B-003 | Brand Strategist | Testimonial consent — legal exposure RISK-MKT-003 |
| Q-MKT-CRO-001 | CRO Specialist | Payment integration status — BLOCKING-P4-001 |
| Q-MKT-G-001 | Growth Marketer | Search Console access / organic data baseline |
| Q-MKT-G-002 | Growth Marketer | Plausible analytics data baseline |

## Notes
- Domain Expert (02), Product Manager (34), Software Architect (05 — Q-05-002 OPTIONAL), and Senior Developer (06) had no REQUIRED questionnaire items in Phase 2.
- GAP-LEGAL-001 (no privacy policy) is elevated to CRITICAL by Phase 2 Risk Agent. Q-33-002 is the prerequisite for REC-LEGAL-001.
- Q-09-001 must be answered before REC-DATA-001 (video encryption) can be scoped.
- Phase 3 adds 3 BLOCKING-P3 mandatory mitigations: Shamir UX test (Q-UX-R-001 context), design tokens (Q-UX-UI-001), AVG consent rewrite (Q-UX-C-002 context).
- RISK-UX-001 CRITICAL: Shamir heir flow never tested. Q-UX-R-001 provides context; actual Shamir UX test execution is a separate action item (BLOCKING-P3-001).
- Phase 4 adds 2 BLOCKING mitigations: BLOCKING-P4-001 (payment integration — Q-MKT-CRO-001), BLOCKING-P4-002 (testimonial consent — Q-MKT-B-003). BLOCKING-P4-003 (analytics fix) is INTERN and does not require questionnaire.
- RISK-MKT-001 CRITICAL: B2C purchase is mailto-only — no automated checkout. Q-MKT-CRO-001 determines unblocking path.
- RISK-MKT-003 HIGH: Testimonials may constitute misleading commercial practice under Dutch consumer law if unattributed. Q-MKT-B-003 is LEGAL_RISK prerequisite.

---
*Auto-generated. Updated each time a questionnaire file is created, answered, or deferred.*
