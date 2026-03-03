# Phase 4 Questionnaire — Growth Marketer
**Lumio Commercial Software Audit — Phase 4**
**Agent:** Growth Marketer (15)
**Status:** OPEN — awaiting client answers
**Date generated:** 2025-07-18

---

## INSTRUCTIONS FOR CLIENT
Please answer the questions below as completely as possible. Your answers will resolve INSUFFICIENT_DATA items in the AARRR funnel and SEO analysis. Questions marked **REQUIRED** are blocking for full growth recommendations; OPTIONAL questions improve quality and prioritisation.

---

## Q-MKT-G-001 — Google Search Console Access [REQUIRED]
**References:** GAP-GROWTH-001 (SEO content gap), H-GROWTH-001 (structured data CTR hypothesis)
**Context:** No keyword position data or organic traffic search-intent data is available. Google Search Console is the minimum data source required to understand whether Lumio currently gets organic visibility for any target queries and to prioritise content production.

**Question:** Does the team currently have access to Google Search Console for `lumio-legacy.nl`?

If YES:
1. What are the top 5 search queries by impression volume? (Copy from Performance → Queries tab)
2. What is the total organic click volume in the last 28 days?
3. Are there any queries where Lumio ranks position 11–30 ("low-hanging fruit" for optimisation)?

If NO:
1. Is Google Search Console set up but access needs to be granted? Or is it not configured at all?
2. Who should receive access to review Search Console data for this audit?

**Answer:** _[client to fill in]_

---

## Q-MKT-G-002 — Plausible Analytics Data [REQUIRED]
**References:** GAP-CRO-006, GAP-GROWTH-002 (EXP-003 analytics blindness), RISK-MKT-002
**Context:** Plausible analytics is deployed on the site (`data-domain="lumio-legacy.nl"`), but no dashboard data is accessible. Understanding current pageview volume and traffic patterns determines whether the site has sufficient traffic to reach A/B test sample sizes and to prioritise growth initiatives.

**Question:** Please provide the following from the Plausible dashboard for `lumio-legacy.nl`:

1. Total unique visitors in the last 30 days (approximate order of magnitude: <100 / 100–500 / 500–2000 / 2000+)
2. Top 3 pages by pageview volume
3. Top 3 traffic sources (direct / organic search / referral / social)
4. Are any custom goals currently configured in Plausible? If yes, which events are tracked?

**Answer:** _[client to fill in]_

---

## Q-MKT-G-003 — DEC-102 Reversal Consideration [OPTIONAL]
**References:** GAP-GROWTH-003, H-GROWTH-004 (per-step wizard analytics)
**Context:** Decision DEC-102 (documented in `devdocs/posthog-analytics.md`) blocks adding new PostHog events to the app. This prevents per-step wizard funnel tracking, which is the only method to identify where users drop off during onboarding. Without this data, SYSTEM_RISK-P3-005 (activation drop-off) cannot be diagnosed or resolved.

**Question:** Is the team open to reconsidering DEC-102 to allow per-step completion events on the onboarding wizard?

Please answer:
1. What was the original reason for DEC-102? (privacy concern / scope freeze / billing / other)
2. Would adding anonymous, non-PII funnel events (e.g., `step_completed: {step: 3}`, no user identifier) be acceptable within the spirit of DEC-102?
3. Is there a decision owner who should review this? (name or role)

**Answer:** _[client to fill in]_

---

## Q-MKT-G-004 — Email Marketing [OPTIONAL]
**References:** AARRR — Referral stage (INSUFFICIENT_DATA)
**Context:** No email marketing platform or post-purchase email sequence was found in the codebase or documentation. For a one-time purchase product, post-purchase email is the primary referral activation channel (e.g., "Share with a colleague", "Annual review reminder").

**Question:** Does Lumio currently use any email marketing tooling for post-purchase communication?

1. Is there a post-purchase email sequence today? (Y/N — if yes, what platform: Mailchimp / Klaviyo / Postmark / other)
2. Is there a plan to implement post-purchase email? (Y/N / timeline?)
3. Does the checkout process (even manual/email-based today) collect the buyer's email address for future communication?

**Answer:** _[client to fill in]_

---

## SUMMARY TABLE

| Q-ID | Agent | Priority | Topic | Status |
|---|---|---|---|---|
| Q-MKT-G-001 | Growth Marketer | REQUIRED | Search Console / organic data | OPEN |
| Q-MKT-G-002 | Growth Marketer | REQUIRED | Plausible analytics data | OPEN |
| Q-MKT-G-003 | Growth Marketer | OPTIONAL | DEC-102 reversal for funnel analytics | OPEN |
| Q-MKT-G-004 | Growth Marketer | OPTIONAL | Email marketing / post-purchase sequence | OPEN |
