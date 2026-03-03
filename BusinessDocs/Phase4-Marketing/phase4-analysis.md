# Phase 4 — Marketing & Brand Analysis
**Lumio Commercial Software Audit**
**Agents:** Brand Strategist (14) · Growth Marketer (15) · CRO Specialist (16)
**Input:** Phase 1–3 outputs, marketing site source (`site/src/`), session-state.json
**Date:** 2025-07-18
**Status:** COMPLETE — ready for Critic + Risk validation

---

## QUESTIONNAIRE INPUT CHECK
**Questionnaire Agent injected block:** NOT_INJECTED
No questionnaire answers have been provided for Phase 4. All INSUFFICIENT_DATA items will be tagged with QUESTIONNAIRE_REQUEST.

---

## PHASE 4 — AGENT 14: BRAND STRATEGIST

### 1. Brand Touchpoint Inventory

| Touchpoint | Channel | Primary message | Audience |
|---|---|---|---|
| Marketing site – homepage | Web (`lumio-legacy.nl`) | "Alles geregeld als het er echt toe doet" | B2C + B2B |
| Marketing site – voor-jezelf | Web | "Lumio persoonlijke licentie" | B2C |
| Marketing site – werkgevers | Web | "Een benefit dat uw medewerkers nooit vergeten" | B2B HR/CFO |
| Marketing site – prijzen | Web | "€125. Alle functies. Geen verrassingen." | B2C + B2B |
| Marketing site – product | Web | "Alles in één app — voor altijd beschikbaar" | B2C + B2B |
| Marketing site – demo | Web | Demo request page | B2B primary |
| Marketing site – contact | Web | Contact form | B2C + B2B |
| Marketing site – privacy | Web | Privacy statement | Regulatory |
| Application UI – auth flow | Desktop app | Formal "u/uw", calm instructional tone | Active users |
| Application UI – onboarding wizard | Desktop app | Step-by-step instructions (7 steps) | New users |
| Email (purchase/support) | Async | INSUFFICIENT_DATA: no email templates found in codebase | Unknown |
| PDF one-pager | Downloadable | `/werkgevers/one-pager` (route exists) | HR/Finance |
| Social media | External | INSUFFICIENT_DATA: no social presence confirmed in code | Unknown |

**Source:** `site/src/app/*/page.tsx`, `site/src/app/layout.tsx` (metadataBase `lumio-legacy.nl`), `site/src/components/sections/*.tsx`

---

### 2. Brand Consistency Audit

#### 2a. Brand Identity Elements

| Element | Finding | Consistency |
|---|---|---|
| Logo | `logo.svg` referenced in layout.tsx; apple/shortcut icons both point to logo.svg | PASS — consistent across touchpoints |
| Typography | DM Sans (body) + DM Serif Display (headings) — loaded via Google Fonts in layout.tsx | PASS — used consistently |
| Primary colour | `primary-700` (dark teal) used for hero backgrounds, CTAs, icons | PASS — consistent |
| Visual language | Wave divider in HeroSection; rounded-xl cards; serif headings over sans body | PASS — homogeneous style |
| Name | "Lumio" consistent across all pages | PASS |
| Domain | `lumio-legacy.nl` — "legacy" qualifier present in domain name | FLAG: see GAP-BRAND-001 |

**Source:** `site/src/app/layout.tsx` L9–18 (font imports), `site/src/components/sections/HeroSection.tsx`, `site/src/components/layout/Header.tsx` (not read but referenced by layout.tsx)

#### 2b. Tone of Voice Consistency

| Location | Tone | Audience address | Consistency |
|---|---|---|---|
| Homepage hero | Warm, empowering | "je/jij" (informal) | B2C voice |
| Werkgevers page | Professional, ROI-focused | "uw/u" (formal) | B2B voice |
| Pricing page | Direct, transparent | Mixed ("je" and "uw") | ⚠️ INCONSISTENCY |
| Privacy block | Formal to employer | "u/uw" | B2B voice |
| App UI (auth flow) | Formal instruction | "u/uw" | App voice |
| Testimonials | First person | "ik / wij" | Neutral |

**BRAND_CONSISTENCY-001:** Pricing page (`prijzen/page.tsx` meta: "Lumio kost €125 eenmalig — voor jezelf of voor je medewerkers") uses "je/jij" (informal) while the same page hero reads "uw medewerkers" (formal). Cross-channel tone inconsistency within a single page.
**Source:** `site/src/app/prijzen/page.tsx` L11–12, `site/src/components/sections/SchaalTabel.tsx` (not directly read — UNCERTAIN: tone in SchaalTabel)

#### 2c. Cross-Channel Message Alignment

| Message axis | Homepage | Voor-jezelf | Werkgevers | Pricing |
|---|---|---|---|---|
| €125 one-time | ✓ (trust strip) | ✓ (meta) | ✓ (meta) | ✓ (hero) |
| 100% offline | ✓ (trust strip + PrivacyBlok) | ✓ (PrivacyBlok shared) | ✓ (PrivacyBlok shared) | ✗ not mentioned |
| No subscription | ✓ (trust strip) | ✓ (meta) | ✗ not in page hero text | ✓ (hero) |
| WKR | ✗ | ✗ | ✓ (WkrUitleg section) | INSUFFICIENT_DATA: SchaalTabel content not confirmed |
| AVG-proof | ✓ (PrivacyBlok) | ✓ (shared) | ✓ (shared) | ✗ |

**BRAND_CONSISTENCY-002:** "100% offline" trust pillar — present on all content pages but absent from Pricing page. Pricing page is a high-intent conversion page; absence of trust signals here is a brand consistency gap.
**Source:** `site/src/app/prijzen/page.tsx`, `site/src/components/sections/PrivacyBlok.tsx` L1–35

---

### 3. Positioning Analysis

#### 3a. Current Positioning Statement (derived from site copy)

Lumio positions as: **"A private, offline-first life planning tool for Dutch individuals and their employers — a one-time €125 purchase with no subscription, no cloud, no compromise."**

Core pillars from site copy:
1. **Privacy / offline** — "100% offline", "Geen tracking", "AVG-proof" (PrivacyBlok)
2. **Simplicity / completeness** — "Alles op één plek", "één middag alles op orde" (Testimonials)
3. **Price transparency** — "€125. Alle functies. Geen verrassingen." (Pricing hero)
4. **Employer benefit angle** — "WKR-passend", "geen implementatiekosten", ROI calculator

#### 3b. Audience Positioning Conflict

**POSITIONING_GAP-001 — Dual audience without priority hierarchy:**
The homepage serves both B2C and B2B simultaneously (AudienceSplit component referenced, HeroSection addresses both). The default site metaTitle in `layout.tsx` reads `"Lumio — Rust en overzicht voor uw medewerkers"` — a B2B frame — while the homepage hero "Alles geregeld als het er echt toe doet" is B2C-emotional. The primary OG title (`"Rust en overzicht voor uw medewerkers"`) would display on social shares even when a B2C visitor shares the link, misaligning with personal recommendation context.
**Source:** `site/src/app/layout.tsx` L25–31 (OG metadata), `site/src/components/sections/HeroSection.tsx` L18–20

**POSITIONING_GAP-002 — Category ownership absent:**
There is no "category creation" framing. Lumio's competitive category ("nalatenschapsplanning software", "persoonlijk life events platform", "offline wilsverklaring tool") is not explicitly named or owned. Without category naming, SEO discoverability for unbranded terms and word-of-mouth referenceability are structurally limited.
**Source:** Site pages (no category term found in any h1/h2/meta inspected); `site/src/app/product/page.tsx` L13–16

#### 3c. Competitive Positioning

**INSUFFICIENT_DATA: competitor benchmark** — No competitive analysis data is available in the codebase or BusinessDocs. Public-source qualitative observation only:
- UNCERTAIN: The Dutch market may include offerings such as notarisplanning tools, Google Drive / password manager setups, or insurance-provided services
- UNCERTAIN: No named competitor identified in any Lumio document or code comment
- **QUESTIONNAIRE_REQUEST [Q-MKT-B-001 REQUIRED]:** Who are the 3 primary competitors Lumio benchmarks against? What is their pricing model and primary positioning axis?

---

### 4. Brand Promise vs. Product Reality Check

| Brand promise (from site copy) | Product reality (from Phase 2 + 3 analysis) | Verdict |
|---|---|---|
| "100% offline" | Confirmed: SQLite local only, LocalOriginValidationMiddleware, no cloud backend | ✓ PASS |
| "AVG-proof — geen persoonsgegevens naar servers" | Confirmed: No data leaves the device. Note: PostHog in-app tracks `lumio_activated` (anonymous, EU endpoint, DEC-102) | ✓ PASS — event is anonymous |
| "Eigen sleutels — Lumio kan er niet bij" | Confirmed: PBKDF2-SHA512 ≥310k iterations, SQLCipher AES-256, key derived from user PIN | ✓ PASS |
| "Geen abonnement, geen jaarkosten" | Confirmed: one-time license model, no recurring charge in code | ✓ PASS |
| "Aankoop, alle functies" | Confirmed: single SKU €125 with all features | ✓ PASS |
| "Windows & macOS" | Confirmed: Electron 40, `electron-builder.yml` targets win/mac | ✓ PASS |
| "In één middag alles op orde" (testimonial) | GAP-UX-001: 7-step wizard, cognitive load score 8/10 for Shamir step. "One afternoon" claim is optimistic for users who need Shamir key distribution. | ⚠️ CRITICAL_MISALIGNMENT-001 |
| "Geen implementatiekosten" (B2B) | RoiCalculator.tsx includes investment calculation. No implementation cost mentioned — but B2B deployment requires HR introduction, licence distribution | ⚠️ CRITICAL_MISALIGNMENT-002: "geen implementatiekosten" may be technically true (no setup fee) but omits HR coordination time cost |
| "Medewerkers waarderen het écht" (testimonial) | INSUFFICIENT_DATA: No NPS or satisfaction data confirmed. Testimonials are hardcoded strings with no source attribution | ⚠️ CRITICAL_MISALIGNMENT-003: Testimonials lack verifiable origin |

**Source:** Phase 2 analysis (security stack), Phase 3 analysis (GAP-UX-001), `site/src/components/sections/TestimonialsSection.tsx` L6–28, `site/src/components/sections/RoiCalculator.tsx`

---

### 5. Identified Brand Gaps

| ID | Description | Severity | Source |
|---|---|---|---|
| GAP-BRAND-001 | Domain `lumio-legacy.nl` — "legacy" connotes death/inheritance, potentially alienating B2C audience seeking "peace of mind" framing | HIGH | `site/src/app/layout.tsx` metadataBase |
| GAP-BRAND-002 | Default OG/Twitter metaTitle is B2B-framed ("Rust en overzicht voor uw medewerkers") — misaligned for B2C social shares | HIGH | `site/src/app/layout.tsx` L26 |
| GAP-BRAND-003 | No competitor positioning documented — brand differentiation axis cannot be formally validated | HIGH | INSUFFICIENT_DATA |
| GAP-BRAND-004 | Testimonials are hardcoded strings — no verifiable social proof (no photos, no company names/logos, no LinkedIn) | MEDIUM | `site/src/components/sections/TestimonialsSection.tsx` |
| GAP-BRAND-005 | EAA (European Accessibility Act, June 2025) non-compliance risk from Phase 3 (GAP-A11Y-001, -006) creates brand credibility risk with B2B HR buyers who have procurement checklists | HIGH | Phase 3 SYSTEM_RISK-P3-006 |
| GAP-BRAND-006 | No brand guidelines document found in repository (`docs/brand/` directory absent) | HIGH | `file_search` — no `docs/brand/` directory exists |
| GAP-BRAND-007 | PDF one-pager route `/werkgevers/one-pager` exists in code but file availability unconfirmed — broken asset risk | MEDIUM | `site/src/app/werkgevers/page.tsx` L61–62 |
| GAP-BRAND-008 | PRICING_INCONSISTENCY: pricing page meta uses "je/voor jezelf" but page body uses "uw" — dual register within one page | MEDIUM | `site/src/app/prijzen/page.tsx` |

---

### 6. Brand Strategist Recommendations

#### REC-B-001 — Register primary domain `lumio.nl` or `mijnlumio.nl`
**References:** GAP-BRAND-001
**Action:** Acquire and redirect from `lumio.nl` or `mijnlumio.nl` to eliminate the death-association of "legacy" in the domain for B2C audience. Maintain `lumio-legacy.nl` as legacy redirect.
**Revenue impact:** INSUFFICIENT_DATA: no conversion baseline available. Hypothesis: domain trust increase improves conversion rate in B2C channel.
**Risk reduction:** Eliminates brand dissonance between "peace of mind" positioning and "legacy/dead" domain connnotation.
**UX impact:** Shorter, more memorable URL for word-of-mouth and print materials.
**Non-execution risk:** B2C word-of-mouth referrals impeded by domain name; marketing materials with "lumio-legacy.nl" require explanation.
**SMART KPI:** Domain trust score (qualitative user test, n≥10) shows ≤ 1 confused participant about "legacy" within 4 weeks of domain change.
**Priority:** P2 | Impact: Medium | Effort: Low (domain acquisition cost)
**Sprint:** SP-04-01

#### REC-B-002 — Fix default OG metaTitle to dual-audience neutral frame
**References:** GAP-BRAND-002
**Action:** Change `layout.tsx` default OG title to neutral "Lumio — Alles geregeld als het er echt toe doet" matching the homepage H1.
**Revenue impact:** Improved B2C social share appearance → higher CTR from organic social shares.
**Risk reduction:** Eliminates B2B framing for B2C social shares.
**UX impact:** None.
**Non-execution risk:** Every B2C user who shares the homepage on WhatsApp/LinkedIn triggers a B2B-framed OG preview.
**SMART KPI:** OG title changed and verified in 1 sprint; measurable via site preview tools (LinkedIn/Facebook debugger).
**Priority:** P1 | Impact: Medium | Effort: Low (1-line code change)
**Sprint:** SP-04-01

#### REC-B-003 — Add verifiable social proof signals to TestimonialsSection
**References:** GAP-BRAND-004, CRITICAL_MISALIGNMENT-003
**Action:** Replace hardcoded testimonials with at minimum (a) real attributed quotes with photo and company/role or (b) clear "representative quote" disclaimer. Add NPS score badge if data available.
**Revenue impact:** INSUFFICIENT_DATA: no A/B baseline. Social proof is a known conversion driver.
**Risk reduction:** Eliminates risk of testimonials being perceived as fabricated; AVG-compliant if consent obtained.
**Non-execution risk:** B2B HR buyers with procurement diligence may question unverifiable testimonials.
**SMART KPI:** All 3 testimonials have source consent documented and one of: real name + role + company, OR explicit "representative quote" label — verified within 2 sprints.
**Priority:** P1 | Impact: High | Effort: Low-Medium (content, legal consent)
**Sprint:** SP-04-01

#### REC-B-004 — Create brand guidelines document (`docs/brand/brand-guidelines.md`)
**References:** GAP-BRAND-006, GAP-BRAND-008
**Action:** Produce brand guidelines covering: logo usage, typography scale, colour palette with hex/hsl values and contrast ratios, tone of voice per audience (B2B formal / B2C informal), naming conventions.
**Revenue impact:** None direct; prerequisite for consistent scaling of marketing materials.
**Risk reduction:** Prevents further tone inconsistencies (BRAND_CONSISTENCY-001).
**Non-execution risk:** Each new marketing touchpoint risks tone/visual drift.
**SMART KPI:** `docs/brand/brand-guidelines.md` published with sections 1–6 per system Definition of Done within 2 sprints.
**Priority:** P2 | Impact: Medium | Effort: Medium
**Sprint:** SP-04-02

#### REC-B-005 — Publish verified B2B employer case study
**References:** GAP-BRAND-003, GAP-BRAND-004
**Action:** Produce one real employer pilot case study with: company name (or anonymised with consent), employee count, implementation time, employee adoption rate, HR director quote.
**Revenue impact:** INSUFFICIENT_DATA: no B2B pipeline data available. Case studies are primary B2B purchase enablers.
**Risk reduction:** Provides fact-based evidence for ROI calculator assumptions.
**Non-execution risk:** B2B HR buyers have no third-party validation; ROI calculator assumptions remain unverifiable.
**SMART KPI:** 1 published case study on site or as downloadable PDF within 4 sprints; includes at minimum: employer name, employee count, timeframe, one attributed quote.
**Priority:** P2 | Impact: High | Effort: High (requires employer partner)
**Sprint:** SP-04-03

---

### 7. Brand Sprint Plan

#### Sprint Assumptions
- **INSUFFICIENT_DATA: team composition** — No team names, headcount, or sprint velocity available from BusinessDocs.
- Assumed team: Team Marketing — 1 brand strategist, 1 content writer, 1 developer (for code changes) — `INSUFFICIENT_DATA: actual capacity`
- Sprint duration: 2 weeks
- Prerequisites for sprint 1: OG metaTitle change requires developer access; testimonial update requires client approval of consent process.

#### Sprint Stories — SP-04-01

| ID | Description | Type | Team | SP | Blocker | Rec |
|---|---|---|---|---|---|---|
| SP-04-001 | As a B2C visitor sharing the Lumio homepage, I want the social preview to reflect the B2C positioning so that the preview does not confuse my contacts with a B2B message | CODE | Team Marketing + Developer | INSUFFICIENT_DATA | NONE | REC-B-002 |
| SP-04-002 | As an HR buyer reading testimonials, I want to see attributed, verifiable social proof so that I trust that the benefit works for real employers | CONTENT | Team Marketing | INSUFFICIENT_DATA | INTERN: client consent for testimonial use; owner: Product Owner | REC-B-003 |

**Acceptance criteria SP-04-001:**
- Given a logged-in LinkedIn user shares `https://lumio-legacy.nl`, when the OG preview renders, then the title reads "Lumio — Alles geregeld als het er echt toe doet" (not a B2B variant)
- Given the `layout.tsx` OG metadata is updated, when `next build` completes without errors, then the change passes smoke tests

**Acceptance criteria SP-04-002:**
- Given a testimonial is displayed, when an HR buyer reads it, then the quote includes: full name, role, company size (or "representative quote" disclaimer)
- Given the testimonial source is real, when legal review is complete, then written consent from the quoted person is documented

#### Sprint Stories — SP-04-02

| ID | Description | Type | Team | SP | Blocker | Rec |
|---|---|---|---|---|---|---|
| SP-04-003 | As a marketing author creating new content, I want a brand guidelines document so that I produce on-brand copy without needing to check existing pages for reference | CONTENT | Team Marketing | INSUFFICIENT_DATA | NONE | REC-B-004 |

**Acceptance criteria SP-04-003:**
- Given the guidelines document is drafted, when published to `docs/brand/brand-guidelines.md`, then it contains sections: Logo, Typography, Colour, Tone of Voice (B2B), Tone of Voice (B2C), Naming conventions
- Given the B2C/B2B tone sections exist, when a random pricing page paragraph is assessed, then tone register inconsistency (BRAND_CONSISTENCY-001) is resolvable using the guidelines

#### Sprint Stories — SP-04-03

| ID | Description | Type | Team | SP | Blocker | Rec |
|---|---|---|---|---|---|---|
| SP-04-004 | As a B2B HR buyer evaluating Lumio, I want to read a real employer case study so that I can validate the ROI calculator assumptions with evidence | CONTENT | Team Marketing | INSUFFICIENT_DATA | EXTERN: requires employer pilot partner consent | owner: CEO/Sales | escalation: Orchestrator | REC-B-005 |

**Acceptance criteria SP-04-004:**
- Given the case study is published, when an HR director visits `/werkgevers`, then a link to the case study is visible
- Given the case study contains ROI claims, when legal reviews it, then all figures are sourced

#### Parallel Tracks
- SP-04-01: SP-04-001 and SP-04-002 can run in parallel (independent: code vs. content)
- SP-04-02: SP-04-003 is sequential post-SP-04-001 (needs approved tone to write guidelines against)
- SP-04-03: SP-04-004 is EXTERN blocked; runs asynchronously when employer partner available

#### Blocker Register

| ID | Type | Owner | Escalation |
|---|---|---|---|
| BLK-04-001 | INTERN | Product Owner (testimonial consent) | Brand Strategist → Orchestrator if no consent in sprint |
| BLK-04-002 | EXTERN | CEO/Sales (employer case study partner) | Orchestrator → decision: proceed with anonymised case study as interim |

#### Sprint KPIs
- SP-04-01: OG title B2C-neutral on production (`lumio-legacy.nl`) ✓ verified via LinkedIn debugger within sprint
- SP-04-02: Brand guidelines doc published, tone inconsistency resolved
- SP-04-03: Case study blocked by EXTERN — milestone: letter of intent from employer partner

#### Traceability Table (P1 Recommendations)

| Rec ID | Priority | Story ID | Status |
|---|---|---|---|
| REC-B-001 | P2 | — | SKIPPED: P2, scheduled conceptually in SP-04-01 but no story — requires business decision on domain acquisition before story |
| REC-B-002 | P1 | SP-04-001 | ✓ |
| REC-B-003 | P1 | SP-04-002 | ✓ |
| REC-B-004 | P2 | SP-04-003 | ✓ |
| REC-B-005 | P2 | SP-04-004 | ✓ |

Note: REC-B-001 (domain acquisition) requires a business decision (cost, legal, DNS) before a CODE/INFRA story can be written. Raised as QUESTIONNAIRE_REQUEST [Q-MKT-B-002 REQUIRED].

---

### 8. Brand Guardrails

#### G-BRAND-NEW-001 — Tone Register Consistency per Audience
**Formulation:** Must always use formal "u/uw" for B2B-addressed copy and informal "je/jij" for B2C-addressed copy; never mix registers within a single page section.
**Scope:** All marketing site pages, email templates, PDF materials.
**References:** GAP-BRAND-008, BRAND_CONSISTENCY-001
**Violation action:** Mark as CRITICAL_FINDING; block PR merge until corrected.
**Verification method:** Code review checklist item on all marketing content PRs; quarterly content audit by content owner.
**Overlap check:** Addition to G-MKT-05 (consistent messaging framework) — more specific than existing guardrail.

#### G-BRAND-NEW-002 — Social Proof Attribution
**Formulation:** Must not publish testimonials without either (a) documented written consent from the attributed person, or (b) explicit "representative quote" disclaimer visible to the user.
**Scope:** All public-facing testimonial sections, case studies, marketing materials.
**References:** GAP-BRAND-004, CRITICAL_MISALIGNMENT-003
**Violation action:** Escalate to legal counsel; block publication; mark as CRITICAL_FINDING.
**Verification method:** PR review checklist: each testimonial PR must include consent document or disclaimer reference.
**Overlap check:** New guardrail; not addressed in existing `docs/guardrails/05-marketing-guardrails.md`.

#### G-BRAND-NEW-003 — Brand Promise Verifiability
**Formulation:** Must not publish quantitative claims in marketing copy ("in één middag", "altijd beschikbaar") without either an internal usability test backing the claim or a qualified disclaimer.
**Scope:** All marketing site copy, packaging, PR materials.
**References:** CRITICAL_MISALIGNMENT-001
**Violation action:** Copy review by product owner required; non-compliant copy blocked at PR stage.
**Verification method:** Manual copy audit per release; checklist item: "all time/outcome claims backed by data or marked as estimate."
**Overlap check:** New guardrail.

---

## PHASE 4 — AGENT 15: GROWTH MARKETER

### 1. Marketing Data Inventory

| Data source | Available | Notes |
|---|---|---|
| Plausible analytics | Deployed on site | `site/src/app/layout.tsx` L57–62: `data-domain="lumio-legacy.nl"` Plausible script. No custom events confirmed. |
| PostHog (in-app) | Deployed in app | `devdocs/posthog-analytics.md` — `lumio_activated` event only; DEC-102 blocks new events; GUARD-006 disables auto-capture and session recording |
| Google Analytics / GA4 | INSUFFICIENT_DATA | Not visible in marketing site codebase |
| Google Search Console | INSUFFICIENT_DATA | Not confirmed in documentation |
| Email marketing | INSUFFICIENT_DATA | No email platform confirmed |
| CRM / pipeline | INSUFFICIENT_DATA | No CRM integration found |
| Social media analytics | INSUFFICIENT_DATA | No social accounts confirmed in codebase |

**IMPORTANT CONSTRAINT:** No web analytics raw data is available to this agent. All AARRR quantitative figures are `INSUFFICIENT_DATA:`. All funnel observations below are qualitative/structural, explicitly labelled as "hypothesis" or "structural gap".

---

### 2. AARRR Funnel Analysis

#### 2a. Acquisition

**Organic Search:**
- Site has `sitemap.xml` with 7 priority URLs submitted (`lumio-legacy.nl/`) — **PASS: sitemap present**
- `robots.txt`: Allow all — **PASS: crawlable**
- Primary keyword targeting: **INSUFFICIENT_DATA** — no keyword research data available. Qualitative observation: homepage H1 "Alles geregeld als het er echt toe doet" is brand-awareness copy, not keyword-optimised.
- `SEO_TECH_ISSUE: SCHEMA — OUT_OF_SCOPE: TECH` — No structured data (JSON-LD) found in any page (no Product, FAQPage, Organization schema). This is a missed opportunity for rich results in Google Search.
- Internal linking: 7 priority pages; `NAV_LINKS` from `constants.ts` confirms all 6 anchor nav items. Internal link structure supports crawlability.
- `SEO_TECH_ISSUE: CWV — OUT_OF_SCOPE: TECH` — Core Web Vitals not assessable without live measurement.
- Blog / content SEO: **GAP-GROWTH-001**: No blog, no FAQ long-form pages (FaqAccordion exists inline but not as dedicated SEO-indexable URLs), no case studies published as indexable content. Zero organic content funnel.

**INSUFFICIENT_DATA: keyword position data** — requires Google Search Console or SEMrush/Ahrefs access.
**INSUFFICIENT_DATA: backlink profile** — no tooling access available.
**INSUFFICIENT_DATA: organic traffic volume** — Plausible dashboard not accessible.
**INSUFFICIENT_DATA: paid acquisition** — No paid channels confirmed.

**Qualitative observation (hypothesis):** The domain `lumio-legacy.nl` may suppress CTR in organic search results for B2C queries where "legacy" signals death/inheritance handling rather than personal planning tools. Labelled: `HYPOTHESIS-ACQU-001`.

#### 2b. Activation

**Funnel path:** Marketing site → purchase (CTA) → download/install → onboarding wizard (7 steps) → `lumio_activated` event.

**STRUCTURAL GAP — GAP-GROWTH-002:** EXP-003 (`ExperimentCtaBanner.tsx`) is a localStorage-based A/B test measuring "pilot request" vs "demo request" CTA clicks. The experiment fires DOM events (`lumio:experiment_impression` / `lumio:experiment_conversion`). However:
- PostHog auto-capture is DISABLED (GUARD-006, DEC-102)
- Plausible on the marketing site does not natively capture custom DOM events without extra configuration
- **Consequence:** EXP-003 is instrumenting experiment events that are never recorded by any analytics system. The experiment is effectively blind.

**STRUCTURAL GAP — GAP-GROWTH-003:** Activation (first meaningful use = completing onboarding wizard) is proxied by `lumio_activated` PostHog event. But SYSTEM_RISK-P3-005 from Phase 3 flags that the 7-step wizard has an unknown drop-off rate — no per-step funnel events exist. Per DEC-102, new PostHog events cannot be added without decision reversal.

**INSUFFICIENT_DATA: activation rate** — No data available.

#### 2c. Retention

**Product model:** One-time license. Traditional "retention" (return sessions) does not apply to a one-time purchase SaaS model. Relevant retention analogues:
- **Active use rate:** INSUFFICIENT_DATA — no regular-use events tracked
- **Content update rate:** Does the user return to update their testament/contacts after initial setup? INSUFFICIENT_DATA
- **Heir access scenario:** Retention for heirs is a downstream event not yet tracked
- **Re-purchase / gifting:** INSUFFICIENT_DATA — no referral or gifting mechanic confirmed

**GAP-GROWTH-004:** No retention mechanic exists in the product model. There is no notification system (desktop) to prompt users to review/update their data. For a product where "life events" drive usage, scheduled update reminders would be the primary retention driver.

#### 2d. Revenue

**INSUFFICIENT_DATA: revenue data** — SYS-RISK-001 from Phase 1 flags that no revenue model is formally defined. From code: `PRICE_PER_USER = 125` (`constants.ts` L26). Payment:
- B2C: `BUY_CONSUMER_HREF = "/voor-jezelf#particulier"` → `BUY_CONSUMER_MAILTO` (mailto fallback) — **critical: no checkout flow**
- B2B: Contact form → manual quote/invoice process assumed
- **GAP-CRO-001 (also: GROWTH):** No automated payment processing confirmed. Purchase is manually facilitated via email or demo request.

**INSUFFICIENT_DATA: revenue volume, LTV, CAC** — No financial data available.

#### 2e. Referral

**INSUFFICIENT_DATA: referral mechanism** — No referral programme found in code or documentation. No affiliate links, no share-with-colleague feature, no NPS-triggered referral prompt.

**Hypothesis:** The employer B2B channel may have a natural referral dynamic (HR → employees), but this is not captured or incentivised. `HYPOTHESIS-REFERRAL-001`.

---

### 3. SEO Assessment

| SEO element | Finding | Status |
|---|---|---|
| sitemap.xml | Present, 7 URLs, valid format | PASS |
| robots.txt | Allow all + Sitemap reference | PASS |
| `lang="nl"` on `<html>` | Confirmed in `layout.tsx` L65 | PASS |
| Title tags | Unique per page (confirmed: layout.tsx template `"%s | Lumio"`) | PASS |
| Meta descriptions | Present on all 5 inspected pages | PASS |
| Canonical tags | INSUFFICIENT_DATA: not confirmed in code |
| Structured data (JSON-LD) | None found | SEO_TECH_ISSUE: SCHEMA — OUT_OF_SCOPE: TECH |
| Core Web Vitals | Not assessable without live measurement | SEO_TECH_ISSUE: CWV — OUT_OF_SCOPE: TECH |
| Blog / content | None | GAP-GROWTH-001 |
| Keyword targeting | Homepage H1 not keyword-optimised | GAP-GROWTH-001 |
| OpenGraph | Present but default title is B2B-framed | GAP-BRAND-002 (escalated to Brand Strategist) |

---

### 4. Funnel Bottleneck Identification

| Stage | Bottleneck | Type |
|---|---|---|
| Acquisition | No SEO content, no structured data, no keyword-optimised H1s | Structural gap |
| Acquisition | "legacy" domain may suppress B2C organic CTR | Hypothesis |
| Consideration | No case studies, no verifiable testimonials | Structural gap |
| Conversion | No automated checkout — B2C purchase is mailto | Critical structural gap |
| Activation | 7-step wizard with unknown per-step drop-off; no per-step analytics | Structural gap |
| Retention | No update reminder / retention mechanic | Structural gap |
| Referral | No referral mechanism | Structural gap |

---

### 5. Growth Hypotheses

| ID | Hypothesis | KPI | Baseline | Target | Measurement | Priority |
|---|---|---|---|---|---|---|
| H-GROWTH-001 | If we add structured data (FAQPage + Product + Organization JSON-LD) to key pages, then organic CTR from Google rich results will increase, because rich results increase average CTR by 20–30% (industry benchmark) | Organic CTR (Search Console) | INSUFFICIENT_DATA | +20% CTR on rich result pages | Google Search Console — 8 weeks post-deploy | P1 |
| H-GROWTH-002 | If we publish 4 SEO-optimised articles (testament, wilsverklaring, digitale nalatenschap, werkgeversbenefit), then unbranded organic traffic will increase, because content pages rank for long-tail queries | Organic non-brand sessions/month | INSUFFICIENT_DATA | 200 non-brand sessions/month after 6 months | Plausible analytics filter | P2 |
| H-GROWTH-003 | If we fix the B2C purchase flow from mailto to an automated checkout (Odoo or Stripe), then B2C conversion rate will increase, because frictionless purchase reduces abandonment | B2C purchase completion rate | ~0% (mailto = manual) | ≥2% visitor-to-purchase | Plausible goal tracking on checkout completion | P1 |
| H-GROWTH-004 | If we add per-step analytics to the onboarding wizard (step completion events), then we can identify and optimise the highest drop-off step, leading to activation rate improvement | Wizard completion rate (step N→N+1) | INSUFFICIENT_DATA | Identify top drop-off step within 4 weeks | PostHog step events (requires DEC-102 reversal) | P2 |
| H-GROWTH-005 | If we implement a "remind me to update" calendar prompt at wizard completion, then active use rate at 90 days will be measurable, because the product has no current retention mechanic | 90-day return rate | INSUFFICIENT_DATA | Measurable baseline within 1 quarter | PostHog event `lumio_update_reminder_triggered` | P2 |

---

### 6. Retention Recommendations

**Principal observation:** Lumio is a one-time purchase product. True SaaS retention (daily/weekly active sessions) is not the relevant metric. Retention for Lumio means: users keep their data current over years. Without a reminder mechanism, users who complete the wizard but never return have "abandoned" the product value — their data becomes stale; heirs may find outdated information.

**REC-G-001 — Implement annual life event review reminder**
**References:** GAP-GROWTH-004
**Action:** Implement an optional desktop notification (opt-in at wizard completion: "Remind me to review my information in 12 months") using Electron's notification API.
**Revenue impact:** None direct. Indirect: reduces likelihood of product being "forgotten" → supports positive word-of-mouth.
**Risk reduction:** Reduces liability risk of stale estate information; strengthens brand promise "alles geregeld".
**UX impact:** Positive — proactive care for user's long-term goal.
**SMART KPI:** % of first-time users who enable reminder at wizard Step 7 ≥ 40% within 2 sprints of feature launch.
**Priority:** P2 | Impact: Medium | Effort: Medium | Sprint: SP-04-04

**REC-G-002 — Fix EXP-003 analytics instrumentation**
**References:** GAP-GROWTH-002
**Action:** Connect EXP-003 DOM events to Plausible custom event API (`plausible('experiment_conversion', {props: ...})`) so A/B test data is actually collected.
**Revenue impact:** Enables data-driven CTA optimisation → improved B2B demo request rate.
**Risk reduction:** Closes analytics blind spot; avoids operating a fake experiment.
**SMART KPI:** EXP-003 conversion events appear in Plausible dashboard within 1 sprint of fix; n≥100 impressions within 6 weeks.
**Priority:** P1 | Impact: Medium | Effort: Low | Sprint: SP-04-01

**REC-G-003 — Publish SEO content foundation (4 articles)**
**References:** GAP-GROWTH-001
**Action:** Publish 4 SEO-targeted content pages: (1) testament opmaken, (2) wilsverklaring opstellen, (3) digitale nalatenschap organiseren, (4) werkgeversbenefit persoonlijke financiën. Target NL long-tail keywords with ≥200 monthly search volume.
**Revenue impact:** INSUFFICIENT_DATA: no organic traffic baseline. Potential: 200+ unbranded sessions/month in 6 months.
**Risk reduction:** Reduces acquisition dependence on brand-awareness channels.
**SMART KPI:** ≥1 content page ranking in Google positions 1–30 for primary target keyword within 3 months of publication (measured via Search Console).
**Priority:** P2 | Impact: High | Effort: High | Sprint: SP-04-05

---

### 7. Growth Sprint Plan

#### Sprint Assumptions
- `INSUFFICIENT_DATA: team composition — Team Growth`
- Sprint duration: 2 weeks
- Prerequisites: Search Console access required for H-GROWTH-001 measurement; DEC-102 reversal required for H-GROWTH-004; Odoo/Stripe setup for H-GROWTH-003

#### Selected Sprint Stories

**SP-04-005 (SP-04-01 context):**
- Description: As a site maintainer, I want EXP-003 to fire Plausible custom events, so that A/B test impressions and conversions are recorded
- Type: CODE | Team: Developer | SP: INSUFFICIENT_DATA | Blocker: NONE | Rec: REC-G-002
- AC: Given EXP-003 renders a CTA variant, when a user clicks the CTA, then `plausible('experiment_conversion')` fires with correct props and appears in Plausible dashboard within 24h

**SP-04-006 (SP-04-05 context):**
- Description: As a content strategist, I want the first SEO content page ("testament opmaken") published, so that Lumio captures organic traffic from decision-stage searchers
- Type: CONTENT | Team: Team Marketing | SP: INSUFFICIENT_DATA | Blocker: NONE | Rec: REC-G-003
- AC: Given the article is published, when Google Search Console is verified, then the page is indexed within 2 weeks; word count ≥ 800; primary keyword in H1 and first 100 words

#### Traceability Table (P1 Recommendations — Growth)

| Rec ID | Priority | Story ID | Status |
|---|---|---|---|
| REC-G-001 | P2 | (SP-04-04 — dedicated Retention sprint) | Deferred to SP-04-04 |
| REC-G-002 | P1 | SP-04-005 | ✓ |
| REC-G-003 | P2 | SP-04-006 | ✓ |

---

### 8. Growth Guardrails

#### G-GROWTH-NEW-001 — Analytics Instrumentation Before Deployment
**Formulation:** Must not deploy a new A/B experiment or marketing feature without confirming that its conversion events are collected by an active analytics system.
**Scope:** All CRO experiments, landing page variants, CTA variants on the marketing site.
**References:** GAP-GROWTH-002
**Violation action:** Block experiment activation; mark as CRITICAL_FINDING; escalate to Growth Marketer.
**Verification method:** Pre-launch checklist item: "Verify experiment event appears in analytics dashboard before release." Manual check per experiment.
**Overlap check:** New guardrail; complements G-MKT-01 (measurement-first principle).

#### G-GROWTH-NEW-002 — SEO Content Readability Standard
**Formulation:** Must always target B1/B2 reading level (Flesch-Kincaid or equivalent) for SEO content pages intended for the Dutch general public.
**Scope:** All new content pages on `lumio-legacy.nl`.
**References:** GAP-GROWTH-001; aligns with Phase 3 GAP-CONTENT-003 (B1/B2 readability mandate)
**Violation action:** Content team review required; non-compliant articles blocked from publishing.
**Verification method:** Readability score check (Hemingway App or similar NL tool) per content article; score history logged in content calendar.
**Overlap check:** Addition to G-MKT-02 (evidence-based claims); not duplicate.

---

## PHASE 4 — AGENT 16: CRO SPECIALIST

### 1. Conversion Baseline

**INSUFFICIENT_DATA: all conversion baselines** — No web analytics access. No checkout system confirmed. No funnel tracking beyond `lumio_activated` PostHog event (in-app only).

All experiment sample size calculations below use `INSUFFICIENT_DATA` for baseline rates and note required minimum n per alpha=0.05, power=0.80 standard.

---

### 2. Top-5 Conversion Opportunities

| # | Opportunity | Conversion point | Current state | Estimated impact |
|---|---|---|---|---|
| 1 | B2C checkout — replace mailto with automated payment | `/voor-jezelf#particulier` → purchase | Mailto fallback (`BUY_CONSUMER_MAILTO`) | Critical: any conversion improvement from ~0% manual baseline | 
| 2 | Add structured data (Product + FAQPage JSON-LD) | Google SERP → site click | None present | Rich result CTR uplift |
| 3 | Add trust signals to Pricing page (privacy pillar missing) | `/prijzen` → purchase click | PrivacyBlok not on pricing page | INSUFFICIENT_DATA: no baseline |
| 4 | Fix EXP-003 analytics so CTA A/B test data is collected | `/werkgevers` CTA | Blind experiment | Required before any CRO insight |
| 5 | Verifiable testimonials / social proof upgrade | All pages | Hardcoded, unverifiable | INSUFFICIENT_DATA: no A/B baseline |

**Source:** `site/src/lib/constants.ts` L34–38 (mailto fallback), Phase 4 Brand Strategist findings, `site/src/components/sections/PrivacyBlok.tsx`

---

### 3. Messaging Alignment Score

**INSUFFICIENT_DATA: messaging alignment score (data-driven)** — No conversion rate data available. Qualitative assessment:

| Dimension | Observation | Score (0-10) |
|---|---|---|
| Hero headline ↔ buyer intent | "Alles geregeld als het er echt toe doet" — emotional, high relevance for target life-event context | 8/10 |
| Value proposition clarity | €125 one-time, offline, all features — clear, differentiated | 9/10 |
| CTA relevance B2C | "Koop nu — €125" → leads to mailto — HIGH FRICTION mismatch between confidence-inspiring CTA and manual purchase process | 3/10 |
| CTA relevance B2B | "Vraag een gratis pilot aan" (EXP-003 control) / "Plan een demo" (variant) — appropriate for B2B evaluation stage | 7/10 |
| Trust signals on conversion pages | Privacy page exists; PrivacyBlok on most pages; absent on pricing page | 6/10 |
| Social proof credibility | 3 hardcoded unverifiable testimonials | 4/10 |

**Overall messaging alignment (qualitative composite): 6.2/10** — UNCERTAIN: estimate; no A/B data available.

---

### 4. Experiment Backlog

#### EXP-001 — B2C CTA Destination (post-Odoo checkout)
**Prerequisite:** Odoo/Stripe checkout live (SP-CRO1-001 — referenced in `constants.ts` comment)
**Hypothesis:** Direct "Koop nu" button to live checkout vs. current `/voor-jezelf#particulier` anchor increases purchase completion.
**Variants:** CONTROL: anchor link to pricing section | VARIANT: direct checkout URL
**Primary metric:** B2C purchase completion rate
**Null hypothesis:** No difference in completion rate
**Success criterion:** Variant ≥ 1.5× control completion rate
**Required n:** `INSUFFICIENT_DATA: baseline rate unknown` — minimum n calculation requires baseline. If baseline = 1% → n ≈ 2,000 visitors per variant (alpha=0.05, power=0.80). If baseline = 3% → n ≈ 700 per variant.
**Priority:** P1 (post checkout launch prerequisite)

#### EXP-002 — Pricing Page Privacy Trust Signal
**Hypothesis:** Adding PrivacyBlok to `/prijzen` page or a condensed 2-line privacy statement near pricing CTA increases pricing page conversion.
**Variants:** CONTROL: current pricing page (no PrivacyBlok) | VARIANT: inline privacy micro-copy ("100% offline — uw data verlaat nooit uw apparaat") near buy button
**Primary metric:** `/prijzen` → buy CTA click rate
**Null hypothesis:** No difference in CTA click rate
**Success criterion:** Variant CTR ≥ 1.2× control
**Required n:** `INSUFFICIENT_DATA: baseline CTR unknown` — If baseline = 5% CTR → n ≈ 1,200 visitors per variant.
**Priority:** P1 | Low effort (inline component change)

#### EXP-003 (existing) — CTA Variant on Werkgevers
**Status:** Already instrumented in code but analytics collection is broken (see GAP-GROWTH-002). Restore analytics first; then this experiment can provide data.
**Hypothesis:** "Plan een demo" CTA outperforms "Vraag een gratis pilot aan" CTA for demo conversion
**Required fix before re-enabling:** Plausible custom events (REC-G-002, SP-04-005)
**Required n per variant:** If baseline = 3% demo request rate → n ≈ 700 per variant (alpha=0.05, power=0.80)
**Priority:** P1 (analytics fix prerequisite)

#### EXP-004 — Testimonial Social Proof Format
**Hypothesis:** Testimonials with company logo + photo outperform initials-only format for HR buyer trust.
**Variants:** CONTROL: current initials avatar | VARIANT: real employer logo (B2B section) / headshot-style avatar (B2C section)
**Primary metric:** Demo request rate (B2B) / purchase CTA click (B2C) for visitors who scroll past testimonials
**Prerequisite:** Consent for real testimonial use (BLK-04-001)
**Required n:** `INSUFFICIENT_DATA: no baseline scroll-depth or conversion data`
**Priority:** P2

#### EXP-005 — Werkgevers Hero CTA Position
**Hypothesis:** Moving the primary CTA button above the fold (visible without scroll) on `/werkgevers` increases demo request rate.
**Variants:** CONTROL: current layout | VARIANT: sticky CTA bar on mobile or above-fold inline button
**Primary metric:** Demo request click rate (mobile visitors to `/werkgevers`)
**Required n:** `INSUFFICIENT_DATA: no mobile visitor split available`
**Priority:** P2

---

### 5. GAP Summary — CRO

| ID | Description | Severity | Source |
|---|---|---|---|
| GAP-CRO-001 | B2C purchase CTA leads to mailto fallback — no automated checkout | CRITICAL | `site/src/lib/constants.ts` L34–38 |
| GAP-CRO-002 | No structured data on any page — missed rich results (FAQPage, Product, Organization) | HIGH | Qualitative code scan |
| GAP-CRO-003 | EXP-003 exists in code but cannot record data (analytics misconfiguration) | HIGH | `site/src/components/sections/ExperimentCtaBanner.tsx` L1–19 |
| GAP-CRO-004 | Testimonials have no verifiable social proof signals | MEDIUM | `site/src/components/sections/TestimonialsSection.tsx` |
| GAP-CRO-005 | Pricing page missing PrivacyBlok — trust signals absent at highest-intent page | MEDIUM | `site/src/app/prijzen/page.tsx` (PrivacyBlok not in component list) |
| GAP-CRO-006 | No conversion event tracking on marketing site (Plausible configured but no custom goals confirmed) | HIGH | `site/src/app/layout.tsx` L57–62 |

---

### 6. CRO Recommendations

#### REC-CRO-001 — Implement automated B2C checkout (block SP-CRO1-001)
**References:** GAP-CRO-001
**Action:** Unblock SP-CRO1-001 (Odoo/Stripe checkout integration). Replace `BUY_CONSUMER_MAILTO` with live checkout URL across all B2C CTAs (`constants.ts` line 38).
**Revenue impact:** INSUFFICIENT_DATA: no baseline. Hypothesis: eliminates ~100% of purchase friction; expected material revenue increase.
**Risk reduction:** Eliminates manual purchase bottleneck; removes dependency on sales person handling email quotes.
**Non-execution risk:** B2C revenue remains gated by manual process; all marketing spend drives traffic with no automated return.
**SMART KPI:** B2C checkout page live within 4 sprints; ≥1 automated purchase confirmed within 1 week of launch.
**Priority:** P1 | Impact: Critical | Effort: High (external dependency) | Sprint: blocked by EXTERN

#### REC-CRO-002 — Add structured data to top-5 pages
**References:** GAP-CRO-002
**Action:** Add JSON-LD structured data: `Organization` on homepage, `Product` on pricing page, `FAQPage` on all pages with FaqAccordion.
**Revenue impact:** INSUFFICIENT_DATA: no CTR baseline. Industry data: rich results improve CTR +20-30%.
**Risk reduction:** None.
**SMART KPI:** Structured data validated (Google Rich Results Test) on ≥3 pages within 1 sprint; Search Console shows eligible pages within 4 weeks.
**Priority:** P1 | Impact: Medium | Effort: Low | Sprint: SP-04-01

#### REC-CRO-003 — Add Plausible custom conversion goals
**References:** GAP-CRO-006, GAP-GROWTH-002
**Action:** Configure Plausible custom events for: (a) B2C Buy CTA click, (b) Demo request form submit, (c) Contact form submit, (d) EXP-003 experiment_conversion. Implement via `plausible()` API calls.
**Revenue impact:** No direct revenue. Prerequisite for all conversion measurement.
**Risk reduction:** Closes analytics blind spot; enables data-driven decisions.
**SMART KPI:** ≥4 custom goals firing in Plausible dashboard and confirmed with test clicks within 1 sprint.
**Priority:** P1 | Impact: High (enabler) | Effort: Low | Sprint: SP-04-01

#### REC-CRO-004 — Add inline privacy micro-copy to Pricing page
**References:** GAP-CRO-005
**Action:** Add a compact privacy trust strip near the buy button on `/prijzen`: "100% offline · uw data verlaat nooit uw apparaat · AVG-proof".
**Revenue impact:** INSUFFICIENT_DATA: EXP-002 designed to measure this.
**SMART KPI:** EXP-002 launched within 2 sprints; n≥500 visitors per variant collected; result reported.
**Priority:** P1 | Impact: Medium | Effort: Low | Sprint: SP-04-02

---

### 7. CRO Sprint Plan

#### Sprint Assumptions
- `INSUFFICIENT_DATA: Team CRO composition and capacity`
- Sprint duration: 2 weeks
- Prerequisites: Plausible custom events require developer access; checkout requires EXTERN dependency (Odoo/Stripe)

#### Sprint Stories

**SP-04-007:**
- Description: As a product manager, I want FAQPage + Product + Organization JSON-LD on the marketing site, so that Google rich results index Lumio and CTR improves
- Type: CODE | Team: Developer | SP: INSUFFICIENT_DATA | Blocker: NONE | Rec: REC-CRO-002
- AC: Given JSON-LD is deployed, when Google Rich Results Test runs, then 0 errors on homepage, pricing page, werkgevers page

**SP-04-008:**
- Description: As a product manager, I want Plausible custom goals configured for CTA clicks and form submits, so that I can measure conversion rate baseline
- Type: CODE | Team: Developer | SP: INSUFFICIENT_DATA | Blocker: NONE | Rec: REC-CRO-003
- AC: Given a test user clicks "Koop nu" on homepage, when Plausible dashboard is checked, then `Outbound Link: Click` or custom `cta_buy_click` event appears; same for demo form submit

**SP-04-009:**
- Description: As a B2C visitor on the pricing page, I want to see a privacy trust strip near the buy CTA, so that my concern about data safety is addressed at the point of purchase decision
- Type: CODE | Team: Developer | SP: INSUFFICIENT_DATA | Blocker: NONE | Rec: REC-CRO-004
- AC: Given the pricing page is loaded, when user scrolls to buy CTA, then a trust strip reading "100% offline · uw data verlaat nooit uw apparaat · AVG-proof" is visible within 100px of the button

#### Traceability Table (P1 Recommendations — CRO)

| Rec ID | Priority | Story ID | Status |
|---|---|---|---|
| REC-CRO-001 | P1 | No story — EXTERN blocked (checkout dependency) | MISSING_STORY — EXTERN_BLOCKED: Odoo/Stripe. Raised as QUESTIONNAIRE_REQUEST [Q-MKT-CRO-001 REQUIRED] |
| REC-CRO-002 | P1 | SP-04-007 | ✓ |
| REC-CRO-003 | P1 | SP-04-008 | ✓ (merged with SP-04-005 — same developer action) |
| REC-CRO-004 | P1 | SP-04-009 | ✓ |

Note on REC-CRO-001: Story cannot be written because the EXTERN blocker (payment provider integration) has no confirmed owner or timeline. Traceable as `EXTERN_BLOCKED` with owner: CEO/Sales. Escalation: Orchestrator.

#### CRO Blocker Register

| ID | Type | Owner | Escalation |
|---|---|---|---|
| BLK-04-003 | EXTERN | CEO/Sales (payment provider decision: Odoo vs Stripe) | Orchestrator → business decision required as prerequisite for any B2C checkout story |

---

### 8. CRO Guardrails

#### G-CRO-NEW-001 — Experiment Statistical Validity
**Formulation:** Must not declare an A/B experiment result without: (a) pre-defined success criterion, (b) minimum sample size justification (alpha=0.05, power=0.80), and (c) full sample size reached before result interpretation.
**Scope:** All CRO experiments on the marketing site.
**References:** GAP-CRO-003, GAP-GROWTH-002
**Violation action:** Experiment result marked as INVALID; decision not actionable; escalate to CRO Specialist.
**Verification method:** Experiment backlog document (`BusinessDocs/Phase4-Marketing/experiment-backlog.md`) required per experiment; reviewed by CRO Specialist before result publication.
**Overlap check:** New guardrail; complements G-MKT-06 (data-driven CRO framework).

#### G-CRO-NEW-002 — No Production CTA Without Conversion Tracking
**Formulation:** Must not deploy or modify a conversion CTA without confirming its conversion event is captured by an active analytics system.
**Scope:** All marketing site CTAs targeting purchase, demo request, or contact form.
**References:** GAP-CRO-003, GAP-CRO-006
**Violation action:** Block PR; mark as CRITICAL_FINDING; require analytics instrumentation proof.
**Verification method:** PR checklist: "Analytics event confirmed in staging/localhost Plausible or test dashboard before merge."
**Overlap check:** Addition to G-GROWTH-NEW-001 (same principle; CRO-specific scope narrowing).

---

## QUESTIONNAIRE_REQUEST — PHASE 4

The following INSUFFICIENT_DATA items require client answers to progress to full recommendations. To be processed by Questionnaire Agent.

| Q-ID | Agent | Priority | Question |
|---|---|---|---|
| Q-MKT-B-001 | Brand Strategist | REQUIRED | Who are the 3 primary competitors Lumio benchmarks against, and what is their pricing model and primary positioning axis? |
| Q-MKT-B-002 | Brand Strategist | REQUIRED | Is the team open to acquiring a shorter or non-"legacy" domain (e.g., `lumio.nl`, `mijnlumio.nl`)? If yes: what is the budget? |
| Q-MKT-B-003 | Brand Strategist | REQUIRED | Are the three testimonials on the site (Marieke, Thomas, Pieter) real attributed quotes with written consent, or are they representative/fictional? |
| Q-MKT-G-001 | Growth Marketer | REQUIRED | Does Lumio currently have access to Google Search Console? If yes, what are the top 5 queries by impression volume? |
| Q-MKT-G-002 | Growth Marketer | REQUIRED | What is the current Plausible analytics pageview volume on `lumio-legacy.nl` (last 30 days)? Is Plausible configured with any custom goals today? |
| Q-MKT-G-003 | Growth Marketer | OPTIONAL | Is there a planned decision date for reversing DEC-102 (PostHog new events) to allow per-step wizard funnel tracking? |
| Q-MKT-CRO-001 | CRO Specialist | REQUIRED | What is the status of the Odoo/Stripe checkout integration (SP-CRO1-001)? Who is the owner, and is there a target date? |
| Q-MKT-CRO-002 | CRO Specialist | OPTIONAL | What is the current demo request volume per month (B2B contact/demo form submissions)? |

---

## PHASE 4 — CONSOLIDATED FINDINGS SUMMARY

| ID | Category | Severity | Description |
|---|---|---|---|
| GAP-BRAND-001 | Brand | HIGH | Domain `lumio-legacy.nl` — "legacy" creates negative B2C associations |
| GAP-BRAND-002 | Brand | HIGH | Default OG metaTitle is B2B-framed; B2C social shares receive wrong message |
| GAP-BRAND-003 | Brand | HIGH | No competitor positioning data available |
| GAP-BRAND-004 | Brand | MEDIUM | Testimonials lack verifiable social proof signals |
| GAP-BRAND-005 | Brand | HIGH | EAA non-compliance (from Phase 3) is a brand credibility risk for B2B HR buyers |
| GAP-BRAND-006 | Brand | HIGH | No brand guidelines document in repository |
| GAP-BRAND-007 | Brand | MEDIUM | PDF one-pager route exists but file availability unconfirmed |
| GAP-BRAND-008 | Brand | MEDIUM | Tone register inconsistency on pricing page (je/uw mix) |
| GAP-GROWTH-001 | Growth | HIGH | No SEO content, no blog, no content funnel — acquisition is pure brand-awareness |
| GAP-GROWTH-002 | Growth | HIGH | EXP-003 is blind — experiment events not collected by any analytics system |
| GAP-GROWTH-003 | Growth | HIGH | No per-step wizard funnel analytics (DEC-102 blocks) |
| GAP-GROWTH-004 | Growth | MEDIUM | No retention mechanic — no reminder to update data over time |
| GAP-CRO-001 | CRO | CRITICAL | B2C purchase CTA leads to mailto — no automated checkout |
| GAP-CRO-002 | CRO | HIGH | No structured data (JSON-LD) on any page |
| GAP-CRO-003 | CRO | HIGH | EXP-003 experiment blind — analytics misconfigured |
| GAP-CRO-004 | CRO | MEDIUM | Testimonials have no verifiable social proof |
| GAP-CRO-005 | CRO | MEDIUM | Pricing page missing PrivacyBlok trust signals |
| GAP-CRO-006 | CRO | HIGH | No Plausible custom conversion goal events configured |
| CRITICAL_MISALIGNMENT-001 | Brand | HIGH | "In één middag alles op orde" vs. 7-step wizard with cognitive load issues at Step 6 |
| CRITICAL_MISALIGNMENT-002 | Brand | MEDIUM | "Geen implementatiekosten" omits HR coordination time |
| CRITICAL_MISALIGNMENT-003 | Brand | HIGH | Testimonials claimed as real; origin unverifiable |
| POSITIONING_GAP-001 | Brand | HIGH | Dual audience without hierarchy; OG default misconfigured |
| POSITIONING_GAP-002 | Brand | MEDIUM | No category naming or ownership |

---

## HANDOFF CHECKLIST — Phase 4 All Agents

### Brand Strategist (14)
- [x] Brand touchpoints inventoried
- [x] Brand consistency audit performed per channel
- [x] Positioning analysis complete
- [x] Brand promise vs product reality check performed
- [x] CRITICAL_MISALIGNMENT items documented
- [x] Competitive positioning documented (INSUFFICIENT_DATA: noted)
- [x] Recommendations conform to contract
- [x] All findings have source references
- [x] Self-review performed
- [x] Recommendations: every recommendation references a GAP/RISK analysis finding
- [x] Recommendations: all impact fields filled or marked as INSUFFICIENT_DATA:
- [x] Recommendations: all measurement criteria are SMART
- [x] Sprint Plan: assumptions documented (INSUFFICIENT_DATA: team capacity)
- [x] Sprint Plan: all stories have at least 1 acceptance criterion
- [x] Sprint Plan: all P1 recs have stories (except REC-B-001 EXTERN_BLOCKED — decision needed)
- [x] Guardrails: formulated testably with violation action and verification method
- [x] All 4 deliverables present: Analysis ✓ Recommendations ✓ Sprint Plan ✓ Guardrails ✓
- [x] QUESTIONNAIRE_REQUEST list compiled
- **STATUS: READY FOR HANDOFF**

### Growth Marketer (15)
- [x] Marketing data inventory complete
- [x] AARRR all 5 stages analyzed (all marked INSUFFICIENT_DATA: where applicable)
- [x] SEO organic channel assessment performed
- [x] Keyword position analysis: INSUFFICIENT_DATA: documented
- [x] Backlink profile: INSUFFICIENT_DATA: documented
- [x] Content SEO gap analysis performed (GAP-GROWTH-001)
- [x] Technical SEO issues documented as SEO_TECH_ISSUE: + OUT_OF_SCOPE: TECH
- [x] Funnel bottlenecks identified
- [x] Minimum 5 growth hypotheses formulated (H-GROWTH-001 through -005)
- [x] Retention recommendations present
- [x] All claims labeled data-driven or hypothesis
- [x] All findings have source references
- [x] Self-review performed
- [x] All 4 deliverables present: Analysis ✓ Recommendations ✓ Sprint Plan ✓ Guardrails ✓
- [x] QUESTIONNAIRE_REQUEST list compiled
- **STATUS: READY FOR HANDOFF**

### CRO Specialist (16)
- [x] Conversion baseline documented (INSUFFICIENT_DATA: all)
- [x] Top-5 conversion opportunities identified
- [x] Minimum 5 experiments in backlog (EXP-001 through EXP-005)
- [x] All experiments have statistical sample size justification (INSUFFICIENT_DATA: baselines noted; n estimated for assumed baselines)
- [x] Messaging alignment score present (qualitative, 6.2/10, UNCERTAIN: labelled)
- [x] Landing page / funnel entry analysis complete
- [x] Priority matrix completed
- [x] All findings have source references
- [x] Self-review performed
- [x] All 4 deliverables present: Analysis ✓ Recommendations ✓ Sprint Plan ✓ Guardrails ✓
- [x] PHASE 4 OUTPUT: Combined output of all 3 Phase 4 agents complete
- [x] QUESTIONNAIRE_REQUEST list compiled
- **STATUS: READY FOR HANDOFF TO CRITIC AGENT**
