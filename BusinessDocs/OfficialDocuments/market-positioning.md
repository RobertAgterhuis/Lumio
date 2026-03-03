# Market Positioning — Lumio
**Document type:** Official Document
**Version:** v1 | Completeness: 45% | Status: DRAFT
**Owner:** Growth Marketer (15) · Brand Strategist (14)
**Last updated:** 2025-07-18
**INSUFFICIENT_DATA items:** Competitor data (Q-MKT-B-001), organic traffic (Q-MKT-G-001, Q-MKT-G-002), revenue model (SYS-RISK-001 Phase 1), B2B lead volume (Q-MKT-CRO-002)

---

## 1. Market Definition

### 1.1 Market Category
**Working category name (unconfirmed):** Persoonlijke nalatenschapsplanning software / Offline life events platform

**Context:** Lumio operates in the intersection of:
- Personal legacy / estate planning (testament, wilsverklaring, donorregistratie)
- Digital asset management (wachtwoorden, crypto, abonnementen)
- Family communication at life events (noodcontacten, video messages, heir access)
- Employee wellbeing benefits (B2B employer channel)

No formal market category or category name has been established by Lumio. This is both a risk (SEO discoverability) and an opportunity (first-mover category ownership in NL).
**Source:** `site/src/app/product/page.tsx` meta description, Phase 1 Domain Expert analysis

### 1.2 Geographic Market
**Primary market:** Netherlands (NL)
- Marketing site: Dutch language (`lang="nl"`)
- Regulatory framing: Dutch AVG, WKR benefit system references
- Currency: EUR
- DNS: `.nl` TLD

**Secondary market:** INSUFFICIENT_DATA — Phase 3 Localization Specialist noted English translations exist (`messages/en/`), Phase 3 Q-UX-L10N-002 asks about expansion plans.

---

## 2. Target Market Segments

### 2.1 Segment 1 — "Bewuste Voorbereider" (B2C)
|  | Detail |
|---|---|
| Demographics | NL resident, 40–65 years, moderate digital literacy |
| Trigger events | Family bereavement, personal illness/diagnosis, retirement planning, becoming a parent |
| Job-to-be-done | "I want my family to find everything they need when I can no longer tell them" |
| Willingness to pay | €125 one-time — acceptable; monthly subscription — likely resistant |
| Channel | Organic search, word-of-mouth, social share |
| Confidence | UNCERTAIN: based on testimonials (unverified origin) and product positioning inference |

### 2.2 Segment 2 — "Modern Werkgever" (B2B HR)
|  | Detail |
|---|---|
| Decision maker | HR director or Head of Benefits |
| Influencer | CFO (budget/WKR), CEO (employer brand) |
| Company size | 25–500 employees (UNCERTAIN: no ICP confirmed) |
| Industry | Any Dutch SME/mid-market |
| Trigger | Benefits review, employee wellbeing programme, ESG/employer branding initiative |
| Decision criteria | WKR-passend (fiscal compliance), no data liability, no IT implementation project, demonstrable employee value |
| Price model | €125/employee one-time from WKR budget |
| Channel | Direct outreach (demo), referral from HR networks, LinkedIn |
| Confidence | UNCERTAIN: based on site copy and ROI calculator assumptions |

### 2.3 Segment Priority
**INSUFFICIENT_DATA:** Q-MKT-B-004 pending. This document will be updated when client confirms B2B/B2C priority.

---

## 3. Competitive Landscape

**INSUFFICIENT_DATA: competitor data** — Q-MKT-B-001 sent to client.

### 3.1 Substitute Categories (qualitative hypothesis only)
The following are hypothetical substitutes that prospects may use instead of Lumio:

| Substitute | Why chosen instead | Lumio advantage |
|---|---|---|
| Paper binder / notary package | Familiar, no tech required | Not accessible offline digitally; not searchable by heirs |
| Google Drive / Dropbox folder | Free, already in use | No structured format; cloud = privacy concern; no Shamir access control |
| Password manager (1Password etc.) | Already owns passwords | No testament/wilsverklaring module; subscription model; cloud |
| Notary digital vault | Legal professional backing | Expensive; locked to one provider; not self-managed |
| Nothing (inaction) | Effort avoidance | Lumio addresses inertia with one-time low-effort setup |

**Confidence level on all above:** UNCERTAIN — without competitor analysis this is assumption-based.
**Source:** Phase 4 analysis GAP-BRAND-003; no competitor names confirmed in codebase or documentation.

### 3.2 Competitive Differentiation Axes

| Axis | Lumio position | Notes |
|---|---|---|
| Storage model | 100% offline | Differentiator vs cloud competitors |
| Privacy | No data leaves device | Differentiator vs cloud |
| Pricing | One-time €125 | Differentiator vs subscription |
| Feature completeness | Testament + passwords + video + Shamir | INSUFFICIENT_DATA: competitor scope |
| B2B benefit angle | WKR-passend employer benefit | INSUFFICIENT_DATA: B2B competitor landscape |
| Platform | Windows + macOS desktop app | Limitation vs. web-based alternatives |

---

## 4. Positioning Statement

### 4.1 Current Formal Positioning (derived from Phase 4 analysis)

> **For** Dutch individuals and HR teams at Dutch employers,
> **who** need to ensure their dependants or employees are prepared for unexpected life events,
> **Lumio** is the only offline-first personal life planning platform
> **that** combines testament, wilsverklaring, digital assets, and heir access into one AES-256 encrypted desktop application,
> **unlike** cloud-based alternatives or paper-based solutions,
> **because** Lumio keeps all sensitive data locally on the user's own device with zero cloud dependency, at a one-time price of €125 with no subscription.

**Completeness note:** "unlike [alternatives]" clause is INSUFFICIENT_DATA until Q-MKT-B-001 is answered.

### 4.2 Positioning Risks

| Risk ID | Description | Impact |
|---|---|---|
| POSITIONING_GAP-001 | No primary audience hierarchy — both B2C and B2B addressed simultaneously, OG default is B2B | MEDIUM — channel confusion |
| POSITIONING_GAP-002 | No category name — Lumio cannot be the leader of a category it has not named | HIGH — SEO and referral friction |
| GAP-BRAND-001 | "lumio-legacy.nl" domain — "legacy" may repel B2C audience | HIGH |
| RISK-MKT-004 | "in één middag" claim contradicted by 7-step wizard complexity | HIGH — credibility risk |

---

## 5. Growth Strategy Overview

### 5.1 Acquisition Priorities (Phase 5 Sprint 1 input)

| Channel | Current state | Recommended action | Priority |
|---|---|---|---|
| Organic SEO (NL) | sitemap present; no content; no structured data | Add JSON-LD + 4 SEO content articles | P1 |
| Direct B2C | Mailto purchase flow | Automated checkout (BLOCKING-P4-001) | P1 EXTERN |
| B2B direct / demo | Demo page + contact form | Fix EXP-003 analytics; publish case study | P2 |
| Content marketing | None | 4 long-form articles targeting life event queries | P2 |
| Paid acquisition | INSUFFICIENT_DATA | Not recommended until organic baseline established | P3 |
| Referral | None | Post-purchase referral prompt (desktop notification) | P3 |

### 5.2 Conversion Funnel Status

| Stage | Current state | Biggest bottleneck |
|---|---|---|
| Acquisition | Unknown traffic volume | No SEO content, no structured data |
| Consideration | Privacy block + testimonials exist | Testimonials unverifiable; social proof weak |
| Conversion (B2C) | Mailto fallback | CRITICAL: no automated checkout |
| Conversion (B2B) | Demo/contact form | EXP-003 blind; case study absent |
| Activation | 7-step wizard | Unknown drop-off; DEC-102 blocks analytics |
| Retention | None | No update reminder mechanic |
| Referral | None | No referral mechanism implemented |

---

## 6. Key Performance Indicators

All baselines are INSUFFICIENT_DATA: pending Plausible and Search Console access.

| KPI | Definition | Target (12-month) | Measurement |
|---|---|---|---|
| B2C checkout conversion rate | Visitors to `/voor-jezelf` → purchase complete | INSUFFICIENT_DATA: baseline → ≥2% (post-checkout launch) | Plausible goal |
| B2B demo request rate | Visitors to `/werkgevers` → demo form submit | INSUFFICIENT_DATA: baseline → ≥5% | Plausible goal |
| Organic non-brand sessions | Google clicks on non-brand queries | INSUFFICIENT_DATA → 200/month in 6 months | Search Console |
| Activation rate | `lumio_activated` events / licences sold | INSUFFICIENT_DATA | PostHog |
| EXP-003 demo CTA winner | Variant vs. control demo request rate | ≥1.25× control at n≥100 per variant | Plausible custom event |

---

## Document Completeness Note

This document is **45% complete**. The following sections require answers to open questionnaires before they can be fully populated:

| Section | Missing data | Questionnaire |
|---|---|---|
| Competitive landscape (Section 3.1, 3.2) | Competitor names, pricing, axes | Q-MKT-B-001 |
| KPI baselines (Section 6) | Plausible + Search Console data | Q-MKT-G-001, Q-MKT-G-002 |
| Segment priority (Section 2.3) | B2B vs B2C primary | Q-MKT-B-004 |
| Revenue model (Section 5.1 paid) | Revenue targets, CAC/LTV | SYS-RISK-001 (Phase 1) |
| B2B lead volume (Section 5.2) | Current demo request volume | Q-MKT-CRO-002 |
| Checkout funnel (Section 5.2) | Payment provider decision | Q-MKT-CRO-001 |
