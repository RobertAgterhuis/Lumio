# Brand Brief — Lumio
**Document type:** Official Document
**Version:** v1.1 | Completeness: 70% | Status: DRAFT
**Owner:** Brand Strategist (Phase 4)
**Last updated:** 2026-03-03
**INSUFFICIENT_DATA items:** Domain decision (Q-MKT-B-002), testimonial consent (Q-MKT-B-003), audience priority (Q-MKT-B-004)
**RESOLVED this update:** Competitive landscape (RESOLVED_BY_QUESTIONNAIRE: Q-03-010/Q-03-011), design tokens (RESOLVED SP-1-005), testimonial disclaimer (RESOLVED SP-MKT-01)

---

## 1. Brand Identity

### 1.1 Name
**Lumio**

No subtitle or tagline has been formally adopted. The homepage headline "Alles geregeld als het er echt toe doet" functions as a de facto brand tagline.
**Source:** `site/src/components/sections/HeroSection.tsx` L18–20

### 1.2 Domain
**Primary domain (current):** `lumio-legacy.nl`
**Note:** GAP-BRAND-001 — "legacy" carries death/inheritance associations that may be misaligned with the brand's peace-of-mind positioning. Domain strategy pending Q-MKT-B-002 answer.
**Source:** `site/src/app/layout.tsx` L23 (metadataBase)

### 1.3 Visual Identity

| Element | Specification | Source |
|---|---|---|
| Primary typeface (body) | DM Sans, variable weight | `layout.tsx` L9–12 |
| Display typeface (headings) | DM Serif Display, weight 400 | `layout.tsx` L13–17 |
| Primary colour | `primary-700` — `#2C4A52` (9.51:1 on white) / `primary-600` — `#355E68` (7.11:1) | `docs/brand/design-tokens.json` |
| Background accent | `primary-50` — `#F3F7F8` | `PrivacyBlok.tsx` |
| Neutral body text | `neutral-900` — `#1F2933` (14.76:1 on white) | `docs/brand/design-tokens.json` |
| Logo | `logo.svg` (vector) | `layout.tsx` icons |
| Icon style | Lucide icons, strokeWidth 1.5 | `PrivacyBlok.tsx` |

**Design tokens:** `docs/brand/design-tokens.json` — BLOCKING-P3-002 resolved (SP-1-005, 2026-03-03).

### 1.4 Brand Promise
**"Alles geregeld als het er echt toe doet"**
— Everything arranged when it truly matters.

Core guarantee: When a life event (illness, death, incapacitation) occurs, the people you trust will find everything they need — testament, wilsverklaring, donorregistratie, digital assets, emergency contacts — in one secure, offline place.

### 1.5 Brand Values (derived from site copy + product reality)

| Value | Evidence |
|---|---|
| **Privacy by design** | "100% offline", "Lumio kan er niet bij", SQLCipher AES-256 |
| **Simplicity** | "één middag alles op orde", one-time setup |
| **Transparency** | "€125. Alle functies. Geen verrassingen." |
| **Trust** | Formal tone, privacy guarantees, offline architecture |
| **Reliability** | "voor altijd beschikbaar" (local storage, no cloud dependency) |

---

## 2. Target Audiences

### 2.1 B2C — Individual User
**Profile (hypothesis — INSUFFICIENT_DATA: no formal ICP document):**
- Dutch resident, 40–65 years
- Life event trigger: recent diagnosis, bereavement in family, becoming a parent, retirement planning
- Digital comfort: moderate (desktop app, not cloud-native)
- Primary motivation: peace of mind; "I want my family to know what to do"
- Price sensitivity: €125 one-time at low sensitivity when motivated; high sensitivity for subscriptions

**Source:** Phase 1 Sales Strategist INSUFFICIENT_DATA findings; testimonials (`TestimonialsSection.tsx` — Marieke 54yr, Pieter 61yr)

### 2.2 B2B — Employer (HR/CFO Decision-Maker)
**Profile (hypothesis — INSUFFICIENT_DATA: no formal ICP):**
- HR director or CFO at Dutch employer, 25–500 employees
- Trigger: employee wellbeing programme, modern benefits package, reduce absenteeism around life events
- Decision criteria: WKR-passend, no implementation project, no data liability, ROI measurable
- Primary objection: "we already have a pension provider"
- Entry point: `/werkgevers` page, demo request, one-pager

**Source:** `site/src/app/werkgevers/page.tsx` hero, `RoiCalculator.tsx`, `WkrUitleg.tsx` (referenced component)

### 2.3 Audience Priority
**INSUFFICIENT_DATA:** Q-MKT-B-004 sent to client. Until answered, both audiences are treated as co-equal in this brief.

---

## 3. Tone of Voice

### 3.1 B2B Tone
- Register: Formal, "u/uw"
- Style: Professional, ROI-focused, reassuring
- Avoid: Emotional language about death/grief
- Examples: "Lumio helpt medewerkers voorbereid te zijn op de grote momenten in het leven"; "Zinvol, fiscaal slim en eenvoudig te implementeren"

### 3.2 B2C Tone
- Register: Informal, "je/jij" (de/het-neutral)
- Style: Warm, empowering, calm
- Avoid: Clinical, technical, insurance-like language
- Examples: "Lumio helpt je testament, wilsverklaring, digitale bezittingen en noodcontacten op één veilige plek te zetten"

### 3.3 App Tone (authenticated UI)
- Register: Formal, "u/uw" (consistent with Phase 3 content-strategy-brief.md)
- Style: Calm instructional, clear action labels
- Note: Formal register in app implies B2B-first assumption — may create B2C tone mismatch if individual user is addressed formally in-app after informal marketing site

### 3.4 Known Inconsistency
**BRAND_CONSISTENCY-001:** Pricing page (`/prijzen`) mixes "je/voor jezelf" (B2C) in meta description and "uw medewerkers" (B2B) in page hero. Resolved by REC-B-004 (brand guidelines) and REC-B-002 (OG fix).

---

## 4. Positioning

### 4.1 Current Positioning Statement (derived)
> "For Dutch individuals and their employers, Lumio is the only offline-first personal life planning tool that guarantees complete privacy — a one-time €125 investment with no subscription, no cloud, and no compromise."

### 4.2 Positioning Axes

> Source: RESOLVED_BY_QUESTIONNAIRE Q-03-010/Q-03-011 (2026-03-03). Confidence: UNCERTAIN (derived from site copy + founder knowledge; no external market research).

| Axis | Lumio | Papieren map | Google Drive / Dropbox | 1Password / Bitwarden | Notariskluis | Niets doen |
|---|---|---|---|---|---|---|
| Storage | 100% offline, lokaall | Fysiek (brandgevaar, verlies) | Cloud (VS servers, CLOUD Act risico) | Cloud (VS servers) | Fysiek bij notaris | — |
| Pricing | €125 eenmalig | Gratis | €0–24/jaar | €36–120/jaar | €50–200/jaar | Gratis |
| Privacy | AVG-proof, niets verlaat apparaat | Volledig privé, maar onbeveiligd | AVG-risico (derde partij, VS) | Cloud-afhankelijk | Beperkt (notaris heeft inzage) | N/A |
| Volledigheid | Testament + wilsv. + donor + wachtwoorden + digitale bezittingen + video's + noodcontacten | Juridisch beperkt, ongestructureerd | Ongestructureerd, geen templates | Alleen wachtwoorden | Beperkt tot notariële documenten | Nihil |
| Nederlandse modules | ✅ Alle NL juridische documenten ingebouwd | ❌ | ❌ | ❌ | Deels | ❌ |
| Erfgenaamentoegang | Shamir — cryptografisch gegarandeerd | Afhankelijk van fysieke overdracht | Afhankelijk van account-overdracht | Afhankelijk van account-overdracht | Via notariële procedure | — |
| Doelgroep | B2C (40–65) + B2B (werkgevers) | B2C | B2C/B2B | B2C/B2B | B2C | — |

**Conclusie:** Lumio is de enige aanbieder die offline opslag, NL juridische modules, Shamir-erfgenaamentoegang en een eenmalige prijs combineert. Geen directe concurrent heeft alle zes assen tegelijk.

### 4.3 Category
**INSUFFICIENT_DATA: no category name has been established.** Candidate terms: "persoonlijke nalatenschapsplanning", "life event voorbereiding", "digitale nalatenschap app". Category ownership strategy pending Phase 4 questionnaire answers.

---

## 5. Key Messages by Channel

| Channel | Primary message | Secondary message | CTA |
|---|---|---|---|
| Homepage | "Alles geregeld als het er echt toe doet" | "Voor particulieren & werkgevers · €125 · Offline & privé" | "Koop nu — €125" |
| `/voor-jezelf` | "Lumio persoonlijke licentie" | "€125 eenmalig, geen abonnement" | Purchase |
| `/werkgevers` | "Een benefit dat uw medewerkers nooit vergeten" | "WKR-passend, geen implementatiekosten" | Demo request |
| `/prijzen` | "€125. Alle functies. Geen verrassingen." | "Eenmalig · geen abonnement" | Buy / Demo |
| `/product` | "Alles in één app — voor altijd beschikbaar" | "100% offline, privacyveilig" | General CTA |

---

## 6. Identified Brand Risks

| ID | Risk | Severity | Mitigation |
|---|---|---|---|
| GAP-BRAND-001 | Domain "legacy" negative B2C associations | HIGH | Q-MKT-B-002 → domain decision |
| GAP-BRAND-002 | OG metaTitle B2B-framed for all social shares | HIGH | REC-B-002 (1-line code fix, SP-04-001) |
| GAP-BRAND-005 | EAA non-compliance risks B2B procurement | HIGH | Phase 3 BLOCKING-P3-002 |
| GAP-BRAND-006 | No design tokens — colour palette unverifiable | ~~HIGH~~ **RESOLVED** | `docs/brand/design-tokens.json` committed SP-1-005 (2026-03-03) |
| CRITICAL_MISALIGNMENT-001 | "In één middag" vs 7-step wizard complexity | HIGH | Disclaimer + Phase 3 BLOCKING-P3-001 |
| CRITICAL_MISALIGNMENT-003 | Testimonials unverifiable | **PARTIALLY RESOLVED** | Per-card disclaimer toegevoegd SP-MKT-01 (d1a8c2f); formele consent Q-MKT-B-003 nog open |

---

## Document Completeness Note

This document is **70% complete** (was 55% — competitive table filled, design tokens resolved, testimonial disclaimer added). The following sections still require questionnaire answers:

| Section | Missing data | Questionnaire | Status |
|---|---|---|---|
| ~~Competitive positioning table (Section 4.2)~~ | ~~Competitor names, pricing, positioning~~ | Q-03-010/011 | ✅ RESOLVED |
| Domain decision (Section 1.2) | Domain acquisition plan | Q-MKT-B-002 | OPEN |
| Testimonial legal consent (Section 5) | Formele toestemming getuigen | Q-MKT-B-003 | OPEN |
| Audience priority (Section 2.3) | B2B vs B2C primary | Q-MKT-B-004 | OPEN |
| ~~Colour palette hex values (Section 1.3)~~ | ~~Design tokens~~ | SP-1-005 | ✅ RESOLVED |

### Document History
| Version | Date | Changes |
|---------|------|---------|
| v1 | 2025-07-18 | Initiële DRAFT door audit-systeem (Phase 4) |
| v1.1 | 2026-03-03 | Competitive positioning axes ingevuld (Q-03-010/011); GAP-BRAND-006 gesloten (design-tokens.json); CRITICAL_MISALIGNMENT-003 gedeeltelijk opgelost (SP-MKT-01) |
