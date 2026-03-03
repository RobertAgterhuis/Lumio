# Questionnaire: Sales Strategist
> Phase: Phase 1 – Business & Strategy | Generated: 2026-03-03T00:00:00Z | Version: v1
> **Instructions:** Please fill in your answers directly below each question.
> For yes/no questions, delete the option that does not apply.
> Questions marked [REQUIRED] must be answered for the audit to proceed.
> Questions marked [OPTIONAL] improve analysis quality but are not blocking.
> When done, save this file — the audit system will pick up your answers automatically.

---

## Section 1: Ideal Customer Profile (B2C)

### Q-03-001 [REQUIRED]
**Question:** Who is the primary target user for Lumio (B2C)? Please describe in terms of age, profession, and life stage.
**Why we need this:** Without a defined Ideal Customer Profile, the audit cannot evaluate whether the product's features, pricing, and channels are aligned with the people most likely to buy and use it.
**Expected format:** Free text — describe age range, life situation, profession
**Example:** "Adults aged 45–65, approaching retirement, with dependants and assets to pass on; living in the Netherlands"

**Your answer:**
> Adults aged 40–70, approaching retirement, with dependants and assets to pass on; living in the Netherlands

---

### Q-03-002 [REQUIRED]
**Question:** Which industries or types of employers are the primary targets for Lumio B2B whitelabel partnerships?
**Why we need this:** Knowing the target industries determines which partner acquisition strategy, pricing tier, and contractual model is most appropriate.
**Expected format:** List of industries or company types
**Example:** "Funeral service providers, notaries, insurance companies, HR benefits platforms"

**Your answer:**
> HR benefits platforms

---

### Q-03-003 [REQUIRED]
**Question:** How many active B2B partner conversations or negotiations are currently in progress?
**Why we need this:** The number of active conversations determines how mature the B2B pipeline is and whether commercial model recommendations are urgent or exploratory.
**Expected format:** Number (or "None", "Unknown")
**Example:** "3 conversations, all at early interest stage"

**Your answer:**
> None

---

### Q-03-004 [OPTIONAL]
**Question:** Is Lumio currently available or in use in any country outside the Netherlands?
**Why we need this:** Expansion beyond the Dutch market would significantly change the compliance, localization, and go-to-market recommendations.
**Expected format:** Yes / No — if yes, which countries?
**Example:** "No — Netherlands only at this point"

**Your answer:**
> No — Netherlands only at this point

---

### Q-03-005 [REQUIRED]
**Question:** Is there any existing customer research, user interviews, or usability test data available (even informally)?
**Why we need this:** Evidence of user validation changes the risk profile of the product. Without it, assumptions about user needs must be treated as unverified hypotheses.
**Expected format:** Yes / No — if yes, briefly describe what exists
**Example:** "Yes — 5 informal user interviews conducted in November 2025, no formal report"

**Your answer:**
> No

---

## Section 2: Sales & Go-to-Market

### Q-03-006 [REQUIRED]
**Question:** What is the current primary channel through which new users discover and sign up for Lumio?
**Why we need this:** Understanding the current acquisition channel is the baseline for go-to-market planning. If there is no current channel, this informs the urgency of the GTM recommendation.
**Expected format:** Free text (e.g. word of mouth, social media, referral, direct search, B2B rollout)
**Example:** "Word of mouth from early testers; no paid acquisition yet"

**Your answer:**
> Word of mouth from early testers, LinkedIn, Facebook

---

### Q-03-007 [REQUIRED]
**Question:** Is there a defined target launch date for the v1.0 public release of Lumio?
**Why we need this:** The presence or absence of a launch date determines the urgency and sequencing of all sprint recommendations, especially the compliance-blocking ones (legal disclaimers).
**Expected format:** Specific date or quarter, or "Not yet defined"
**Example:** "Q3 2026" or "No date set yet"

**Your answer:**
> End Q3 2026

---

### Q-03-008 [OPTIONAL]
**Question:** What is the planned marketing budget for the v1.0 launch?
**Why we need this:** The marketing budget determines which acquisition channels are feasible and helps size the expected ROI of go-to-market activities.
**Expected format:** Amount in euros (total budget or monthly), or "Not yet defined"
**Example:** "€5.000 total for the first 3 months post-launch"

**Your answer:**
> 0 using existing channels

---

### Q-03-009 [REQUIRED]
**Question:** Are there any existing signed agreements or letters of intent with B2B whitelabel partners?
**Why we need this:** Signed agreements provide the only external validation of the B2B channel's commercial viability. Without any agreements, the B2B model must be treated as unproven.
**Expected format:** Yes / No — if yes, how many?
**Example:** "Yes — 1 signed Letter of Intent with a Dutch funeral chain"

**Your answer:**
> None
---

## Section 3: Competitive Landscape

### Q-03-010 [OPTIONAL]
**Question:** Which competing products or services are most often mentioned or compared to Lumio by potential users or in the market?
**Why we need this:** Knowing the competitive reference points allows the audit to assess positioning, differentiation, and pricing benchmarks.
**Expected format:** List of product or service names
**Example:** "Ik Wil Alles Regelen, notarial will services, Google Keep (informal)"

**Your answer:**
> Geen directe digitale concurrent bekend in de Nederlandse markt die hetzelfde doet. De meest genoemde substituten zijn: papieren map / notarispakket (traditioneel), Google Drive / Dropbox (informele digitale opslag), wachtwoordmanager (1Password/Bitwarden — alleen wachtwoorden), notariële digitale kluis (duur, provider-lock-in). Geen product combineert offline opslag + Shamir erfgenaamentoegang + volledige Nederlandse documentatiemodules.
> Bron: product-positionering site, testimonials, marktkennis founder. UNCERTAIN: geen formele marktanalyse uitgevoerd.

---

### Q-03-011 [REQUIRED]
**Question:** What is Lumio's primary differentiator compared to existing alternatives? Why would a user choose Lumio over current options?
**Why we need this:** Without a clearly articulated differentiator, sales and marketing recommendations cannot be scoped properly, and the product–market fit assessment will remain INSUFFICIENT_DATA.
**Expected format:** Free text — 1–3 key differentiators
**Example:** "Offline privacy (no cloud sync), legal completeness (all document types), encryption by default"

**Your answer:**
> 1. **100% offline** — alle data blijft lokaal op het eigen apparaat. Geen cloud, geen server, geen abonnement. Lumio kan er niet bij — niemand anders ook. Geen enkel alternatief (Google Drive, 1Password, notariskluis) biedt dit in combinatie met gestructureerde nalatenschapsdocumentatie.
> 2. **Geen abonnement — éénmalig €125** — geen jaarkosten, geen account aanmaken, geen maillijst. Altijd eigenaar van je data en licentie.
> 3. **Shamir erfgenamen-toegang** — wiskundige zekerheid dat naasten toegang krijgen als genoeg erfgenamen hun code invoeren. Geen alternatief op de Nederlandse consumentenmarkt biedt cryptografisch gegarandeerde erfgenaamentoegang zonder centrale server.
> 4. **Volledige Nederlandse nalatenschapsdocumentatie in één product** — testament, wilsverklaring (inclusief euthanasie/orgaandonatie), digitale nalatenschap, noodcontacten, video's — alles in één AES-256 versleuteld profiel.
> Bron: `site/src/lib/constants.ts` (feature descriptions L64–69, L150–162); `site/src/app/product/page.tsx` meta + features; founder marktkennis.

---

### Q-03-012 [OPTIONAL]
**Question:** Has any formal or informal win/loss analysis been performed — e.g. asking users or prospects why they chose Lumio or a competitor?
**Why we need this:** Win/loss data provides the most reliable evidence of competitive position and reduces the need for estimated assumptions in the audit.
**Expected format:** Yes / No — if yes, briefly describe the findings
**Example:** "No formal analysis; informally, the main reason mentioned is privacy"

**Your answer:**
> Geen formele win/loss-analyse uitgevoerd. Informeel: privacy (offline opslag, geen cloud) en het gebrek aan een goed alternatief zijn de meest genoemde redenen in early-user feedback en testimonials. Geen gestructureerde data beschikbaar.

---

## Answer Status
| Question ID | Status | Last updated |
|-------------|--------|--------------|
| Q-03-001    | ANSWERED | 2026-03-03   |
| Q-03-002    | ANSWERED | 2026-03-03   |
| Q-03-003    | ANSWERED | 2026-03-03   |
| Q-03-004    | ANSWERED | 2026-03-03   |
| Q-03-005    | ANSWERED | 2026-03-03   |
| Q-03-006    | ANSWERED | 2026-03-03   |
| Q-03-007    | ANSWERED | 2026-03-03   |
| Q-03-008    | ANSWERED | 2026-03-03   |
| Q-03-009    | ANSWERED | 2026-03-03   |
| Q-03-010    | ANSWERED (UNCERTAIN — geen formele analyse) | 2026-03-03   |
| Q-03-011    | ANSWERED | 2026-03-03   |
| Q-03-012    | ANSWERED (UNCERTAIN — geen formele analyse) | 2026-03-03   |

---
*This questionnaire was automatically generated by the audit system. Do not modify question IDs or headings.*
