# Product Vision Document
> Version: v1 | Last updated: 2026-03-03T00:00:00Z | Status: DRAFT
> Source phases: Phase 1
> Completeness: 55% — 5 of 6 sections have partial verified content; Revenue Model and Success Metrics are INSUFFICIENT_DATA pending questionnaire answers

---

## Product Purpose

Lumio is an offline-first desktop application that enables individuals to document, organise, and securely store their complete digital and physical estate — including health directives, financial accounts, legal documents, insurance policies, and family communications — so that this information is accessible to trusted persons when it is needed most.

The product operates on a fully local architecture: user data is encrypted at rest using SQLCipher and never transmitted to external servers (source: `devdocs/dpia-bijzondere-categorieen.md`, architecture overview). This positions Lumio as a privacy-by-design solution in a market where digital estate organisation is typically handled via cloud-based services or paper-based notarial tools.

> Source: `README.md`, `devdocs/dpia-bijzondere-categorieen.md`, `BusinessDocs/Phase1-Business/phase1-analysis.md` §Business Model

---

## Target Users

**Primary market:** Dutch-speaking adults preparing their personal estate documentation. Based on code analysis and whitelabel infrastructure, two user segments are evident:

- **B2C — Individual end-users:** Adults (inferred: 40–70 years) managing personal estate wishes, living in the Netherlands. The presence of Dutch-law-specific document types (euthanasiewens, orgaandonatieverklaring, testament guidance) confirms primary market is the Netherlands.
- **B2B — Employer/partner ecosystem:** Organisations that distribute Lumio to employees or customers under a whitelabelled instance with their own branding and logo (source: `tools/whitelabel/` directory, `src/lumio-web/src/app/[locale]/(unauthenticated)/partner-onboarding/`).

INSUFFICIENT_DATA: Precise age range, income segment, profession, or family situation of the primary B2C user has not been documented by the product owner. See Q-03-001.

> Source: `BusinessDocs/Phase1-Business/phase1-analysis.md` §Ideal Customer Profile

---

## Core Problem Being Solved

Most people with assets, dependants, or health wishes have not organised their estate documentation in a single accessible location. This creates three distinct problems:

1. **Emergency access failure:** When a person is incapacitated, family members cannot find critical documents (insurance, accounts, health wishes) quickly enough to act.
2. **Legal wishes not communicated:** Health directives (euthanasia wishes, organ donation) are often verbally expressed but not formally recorded in a shareable format, creating legal and emotional risk for families.
3. **Cloud privacy risk:** Existing digital services require uploading sensitive personal and financial data to third-party servers. Offline-first, local-first storage eliminates this risk.

> Source: `devdocs/activation-definition.md`, `devdocs/dpia-bijzondere-categorieen.md`, `BusinessDocs/Phase1-Business/phase1-analysis.md` §Domain Model

---

## Key Features

Based on the codebase scan and Phase 1 analysis (source: `src/lumio-web/src/app/`, `BusinessDocs/Phase1-Business/phase1-analysis.md` §Business Capability Map):

| Feature | Capability | Status |
|---------|-----------|--------|
| Profile management | Create and manage personal profiles | CAP-001 |
| Document storage | Upload and organise documents by category | CAP-002 |
| Health directives | Record euthanasiewens, orgaandonatieverklaring | CAP-005, CAP-006 |
| Financial account registry | List bank accounts, investments, pensions | CAP-007 |
| Insurance registry | Document all insurance policies | CAP-008 |
| Video message recording | Record personal video messages for loved ones | CAP-009 — offline only |
| Emergency access (Shamir) | Share access via Shamir Secret Sharing (cryptographic) | CAP-014 |
| Whitelabel B2B configuration | Custom branding per partner | CAP-013 |
| Export to print | Non-digital export of estate summary (QuestPDF) | CAP-010 |
| Offline-first | All data stays local; no cloud sync required | CAP-004 |
| Lumio activation | Triggered by designated person in emergency | `devdocs/activation-definition.md` |

---

## Success Metrics

| KPI | Target | Source |
|-----|--------|--------|
| Activation rate | ≥ 50% of registered users reach "activated" state within 30 days | `devdocs/activation-definition.md` |
| Open compliance gaps | 0 before public launch | Phase 1 compliance analysis |
| CI green rate | ≥ 90% of PRs pass CI first run | DEC-CI (re-enable first) |
| Monetization model documented | Boolean: TRUE before v1.0 | REC-BIZ-001 |
| B2B partners with signed agreements | ≥ 1 before v1.0 | REC-SALES-001 |

INSUFFICIENT_DATA: Revenue targets, MAU targets, churn targets, and NPS baseline are not yet defined. These depend on answers to Q-01-004 (target price), Q-04-006 (break-even), and Q-04-007 (B2B target). See `BusinessDocs/Phase1-Business/Questionnaires/04-financial-analyst-questionnaire.md`.

---

## Roadmap Direction

Based on Phase 1 analysis sprint plans (source: `BusinessDocs/Phase1-Business/phase1-analysis.md` §Sprint Plans):

### Sprint 1 — Compliance & Foundations (Pre-launch critical)
- Re-enable GitHub Actions CI (SP-BIZ-01-001)
- Implement GDPR-compliant audit log rotation (SP-BIZ-01-002)
- Define monetization model (SP-BIZ-01-003)
- Add legal disclaimers: euthanasiewens (SP-BIZ-01-004), orgaandonatie (SP-BIZ-01-005), testament (SP-BIZ-01-006) — **launch blockers**

### Sprint 2 — Privacy, GTM, Commercial (Post-compliance sprint)
- Add privacy policy + analytics opt-out UI (SP-BIZ-02-001, SP-BIZ-02-002)
- Develop go-to-market strategy (SP-BIZ-02-003)
- Define B2B commercial model (SP-BIZ-02-004)
- Financial model documentation (SP-BIZ-02-005)

INSUFFICIENT_DATA: Launch date is unknown. See Q-03-007.

---

<details>
<summary>Previous versions</summary>

*No previous versions — this is v1.*

</details>
