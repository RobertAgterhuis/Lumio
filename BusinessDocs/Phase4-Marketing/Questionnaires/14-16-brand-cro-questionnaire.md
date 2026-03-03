# Phase 4 Questionnaire — Brand Strategist & CRO Specialist
**Lumio Commercial Software Audit — Phase 4**
**Agents:** Brand Strategist (14) · CRO Specialist (16)
**Status:** OPEN — awaiting client answers
**Date generated:** 2025-07-18

---

## INSTRUCTIONS FOR CLIENT
Please answer the questions below as completely as possible. Your answers will be used to resolve INSUFFICIENT_DATA items in the Phase 4 analysis and to update the official documents (`brand-brief.md`, `market-positioning.md`). Questions marked **REQUIRED** are blocking for full recommendations; OPTIONAL questions improve quality but do not block progress.

---

## Q-MKT-B-001 — Competitive Landscape [REQUIRED]
**Agent:** Brand Strategist
**References:** GAP-BRAND-003, POSITIONING_GAP-002
**Context:** No competitor data was found in the codebase or existing documentation. To validate and sharpen Lumio's positioning, we need to understand the competitive context.

**Question:** Who are the 3 primary competitors or alternative solutions that Lumio benchmarks against or that prospects compare Lumio to?

For each, please provide:
1. Name / URL
2. Pricing model (one-time / subscription / freemium)
3. Primary audience (B2C / B2B / both)
4. Key positioning axis (e.g., "privacy-first", "notary integration", "cloud-based estate planning")

**If there are no known direct competitors**, describe the alternative/workaround most prospects use today (e.g., "paper binder from notary", "Google Drive folder", "nothing").

**Answer:** _[client to fill in]_

---

## Q-MKT-B-002 — Domain Strategy [REQUIRED]
**Agent:** Brand Strategist
**References:** GAP-BRAND-001
**Context:** The current domain `lumio-legacy.nl` contains the word "legacy" which in Dutch/English carries associations with death and inheritance. For a product positioned around "peace of mind" and "preparing for life events", this may create a negative initial impression for B2C visitors. The analysis recommends evaluating a domain change.

**Question:** Is the team open to acquiring a shorter or non-"legacy" primary domain (e.g., `lumio.nl`, `mijnlumio.nl`, `lumio.app`)?

Please answer:
1. Has `lumio.nl` been checked for availability? (if yes, is it available or registered by another party?)
2. What is the approximate budget for domain acquisition (€0 / <€1k / €1k–€10k / no budget constraint)?
3. Is there a brand or legal reason why "legacy" was chosen that should be preserved?

**Answer:** `ANSWERED 2026-03-04` — Domain stays **lumio-legacy.nl**. All alternative domains (lumio.nl, mijnlumio.nl, lumio.app) are taken. The team has evaluated the domain and considers "legacy" an acceptable and intentional brand choice in the context of life planning. No domain migration will be pursued. GAP-BRAND-001 and BLK-014 are **RESOLVED** — no DNS/redirect work needed.

---

## Q-MKT-B-003 — Testimonial Origin [REQUIRED]
**Agent:** Brand Strategist · Legal Counsel (cross-reference)
**References:** GAP-BRAND-004, CRITICAL_MISALIGNMENT-003, RISK-MKT-003
**Context:** The marketing site displays three testimonials attributed to "Marieke van den Berg (Lerares, 54 jaar)", "Thomas Kleijn (HR-directeur, 250 medewerkers)", and "Pieter Hoogenbosch (Zelfstandig ondernemer, 61 jaar)". A Critic review could not confirm whether these are real attributed quotes (with consent) or representative/fictional quotes. Under Dutch consumer law (Wet Misleidende Handelspraktijken), publishing fabricated testimonials as real is a violation.

**Question:** Please confirm the origin of these three testimonials:

For each testimonial:
1. Is this a real person who gave consent to be quoted? (Y/N)
2. Is written consent documented? (Y/N / form or email?)
3. If not a real person: was this quote explicitly labelled as "representative" in any internal documentation?

**Answer — Marieke van den Berg:** _[client to fill in]_
**Answer — Thomas Kleijn:** _[client to fill in]_
**Answer — Pieter Hoogenbosch:** _[client to fill in]_

---

## Q-MKT-B-004 — Target Audience Priority [OPTIONAL]
**Agent:** Brand Strategist
**References:** POSITIONING_GAP-001
**Context:** The marketing site serves both B2C (voor-jezelf) and B2B (werkgevers) audiences. The homepage hero is positioned with B2C emotional copy, but the default OG metaTitle is B2B-framed. Understanding the primary commercial priority helps resolve the OG metadata design choice and informs content strategy.

**Question:** What is the primary commercial priority for the next 12 months?
- [ ] B2C (individual licences) is primary; B2B is secondary
- [ ] B2B (employer benefits) is primary; B2C is secondary
- [x] Both channels are equally prioritised
- [ ] Other: _[please describe]_

**Answer:** `ANSWERED 2026-03-04` — **Both channels are equally prioritised.** No single primary audience. To handle this cleanly on the marketing site, a dynamic dual-audience `HeroSection` component was implemented (`site/src/components/sections/HeroSection.tsx`): visitors toggle between "Voor mezelf" (B2C) and "Voor werkgevers" (B2B) tabs, each with audience-specific headline, sub-copy, and CTAs. Default view is B2C. Navigation from `/werkgevers` context auto-selects the B2B tab via URL hash. BLK-003 **RESOLVED**.

---

## Q-MKT-CRO-001 — Payment Integration Status [REQUIRED]
**Agent:** CRO Specialist
**References:** GAP-CRO-001, RISK-MKT-001, BLOCKING-P4-001
**Context:** The B2C purchase flow currently leads to a mailto fallback (`BUY_CONSUMER_MAILTO = "mailto:info@lumio.app?subject=Lumio kopen"`). This is documented in the codebase as a temporary solution pending SP-CRO1-001 (Odoo checkout integration). This means all B2C marketing efforts currently have no automated conversion path. This is classified as CRITICAL risk.

**Question:** What is the current status of the automated payment integration?

Please answer:
1. Has a payment provider been decided? (Odoo / Stripe / Mollie / other / not decided)
2. Who is the owner of the payment integration project?
3. Is there a target completion date or sprint for the checkout integration?
4. Is there a specific blocker preventing completion today? (technical / legal / budget / resource)

**Answer:** _[client to fill in]_

---

## Q-MKT-CRO-002 — B2B Lead Volume [OPTIONAL]
**Agent:** CRO Specialist
**References:** GAP-CRO-006, GAP-GROWTH-002
**Context:** No baseline conversion volume is available from the marketing site. Understanding current B2B lead volume helps prioritise CRO experiments (e.g., whether EXP-003 can reach n≥100 impressions in a reasonable timeframe).

**Question:** Approximately how many demo/pilot requests does Lumio currently receive per month through the website contact form or `/demo` page? (Order of magnitude is sufficient: <5 / 5–20 / 20–50 / 50+)

**Answer:** _[client to fill in]_

---

## Q-MKT-B-005 — PDF One-Pager Availability [OPTIONAL]
**Agent:** Brand Strategist
**References:** GAP-BRAND-007
**Context:** The werkgevers page contains a download link pointing to `/werkgevers/one-pager`. It is unclear whether the actual PDF exists and is accessible (a missing file would result in a 404 for HR prospects downloading the one-pager at a critical B2B evaluation stage).

**Question:** Does the one-pager PDF at `/werkgevers/one-pager` currently resolve to an existing downloadable file? If yes, when was it last updated?

**Answer:** _[client to fill in]_

---

## SUMMARY TABLE

| Q-ID | Agent | Priority | Topic | Status |
|---|---|---|---|---|
| Q-MKT-B-001 | Brand Strategist | REQUIRED | Competitive landscape | OPEN |
| Q-MKT-B-002 | Brand Strategist | REQUIRED | Domain strategy | ✅ ANSWERED 2026-03-04 |
| Q-MKT-B-003 | Brand Strategist | REQUIRED | Testimonial consent | OPEN |
| Q-MKT-B-004 | Brand Strategist | OPTIONAL | Audience priority | ✅ ANSWERED 2026-03-04 |
| Q-MKT-CRO-001 | CRO Specialist | REQUIRED | Payment integration | OPEN |
| Q-MKT-CRO-002 | CRO Specialist | OPTIONAL | B2B lead volume | OPEN |
| Q-MKT-B-005 | Brand Strategist | OPTIONAL | One-pager availability | OPEN |
