# Content Strategy Brief — Lumio
**Document type:** Official Document — Phase 3 output  
**Version:** v1  
**Completeness:** 55%  
**Date:** 2026-07-14  
**Owner:** Content Lead / UX Writer  
**Source:** `BusinessDocs/Phase3-UX/phase3-analysis.md` — Agent 32 Content Strategist + Agent 35 Localization Specialist  
**Status:** DRAFT — open items blocked on Q-UX-C-001/002 (activation/Shamir content), Q-UX-C-003 (owner)

> **IMPORTANT:** Sections marked `INSUFFICIENT_DATA:` are incomplete pending questionnaire answers.  
> Domain-module copy (18 modules) has not been inventoried — significantly limits completeness.

---

## 1. Voice & Tone Guidelines

### 1.1 Detected Voice (NL — primary language)
Source: `src/lumio-web/messages/nl.json` — full auth flow copy audit

| Attribute | Current standard | Rationale |
|-----------|-----------------|-----------|
| Formality | HIGH — formal "u/uw" throughout | Target audience (35–70, legal/medical context) expects formal address |
| Tone | Calm, authoritative, supportive | Emotional context (mortality) requires trust, not urgency |
| Voice | Active voice in CTAs ("Ontgrendelen", "Aanmaken") | Action-oriented without being pushy |
| Jargon | Legal NL terms used (boedel, erfgenamen, euthanasiedossier) | Correct for legal domain; needs plain-language alternatives for onboarding |
| Consistency | Consistent within auth flow | Domain modules not yet audited |

### 1.2 Voice Consistency Rules
1. **Always use "u/uw"** — not "jij/je" — across all UI copy, notifications, and help text
2. **CTAs: imperative verbs** — "Ontgrendelen", "Opslaan", "Bevestigen" — not "Klik hier om te ontgrendelen"
3. **Error messages: acknowledge + direct** — "Wachtwoord onjuist. Probeer opnieuw." — not "Er is een fout opgetreden."
4. **No catastrophizing** — especially for encryption/password warnings: accurate, calm, not alarming
5. **Technical terms on first use:** introduce with a brief parenthetical explanation for onboarding contexts

### 1.3 `INSUFFICIENT_DATA:` Voice for domain modules
Domain module copy (testament, boedel, erfgenamen, etc.) not fully inventoried. Consistency between auth-flow voice and domain-module voice cannot be confirmed without reviewing `src/lumio-web/messages/nl/` subdirectory contents.

---

## 2. Content Governance

### 2.1 Translation Structure
- **Primary language:** NL (`src/lumio-web/messages/nl.json` + `src/lumio-web/messages/nl/`)
- **Secondary language:** EN (`src/lumio-web/messages/en.json` + `src/lumio-web/messages/en/`)
- **System:** next-intl 4.8.3 with ICU MessageFormat pluralization
- **Maintenance:** Manual — no TMS (GAP-CONTENT-005, GAP-L10N-001)

### 2.2 Content Owner
`INSUFFICIENT_DATA:` No assigned content owner identified. Required: Q-UX-C-003.

**Interim recommendation:** Assign a single named owner for NL and EN translations before next sprint. Dual-key a PR review step for all i18n changes.

### 2.3 Translation Sync Validation
`INSUFFICIENT_DATA:` No sync script confirmed — Q-UX-L10N-001.  
**Minimum required:** A script or CI check that verifies all NL keys exist in EN (and vice versa) before each release.

---

## 3. Readability Standards

**Target language level:** B1/B2 (Dutch) for all user-facing copy  
**Exception:** Legal consent copy must be reviewed by a legal expert for minimum B2 while preserving legal validity

| Content area | Current level | Target level | Action required |
|-------------|--------------|-------------|-----------------|
| Auth unlock | B1 | B1 | PASS — no change |
| AVG consent (setup) | C1 | B1/B2 | GAP-CONTENT-003 — REWRITE + legal review |
| Heir intro text | B1 | B1 | PASS |
| Shamir post-key guidance | `INSUFFICIENT_DATA:` | B1 | Q-UX-C-002 |
| Error messages | B1 | B1 | Recovery wording to improve — GAP-CONTENT-001 |

---

## 4. Microcopy Patterns

### 4.1 Error Messages
**Current pattern (auth flow):** `"[Action] mislukt"` — terse, no recovery guidance  
**Required pattern:** `"[Action] mislukt. [Reason if known]. [Recovery action]"`

Examples of required improvement (illustrative direction — not production copy):
- `BEFORE:` "Ontgrendelen mislukt"  
  `DIRECTION:` "Ontgrendelen mislukt — controleer uw wachtwoord en probeer opnieuw. [Bij 5 mislukte pogingen geldt 15 min. blokkade.]"

- `BEFORE:` "Profiel aanmaken mislukt"  
  `DIRECTION:` "Profiel aanmaken niet gelukt — controleer de invoer en probeer opnieuw."

Source: `src/lumio-web/messages/nl.json#auth.ontgrendel.mislukt`, `#auth.profiel.aanmakenMislukt`

### 4.2 Capitalization Convention
**Detected inconsistency (CONTENT_INCONSISTENCY-001):**
- "Database Aanmaken" (title case) vs "Ontgrendelen" (sentence case)
- **Standard to adopt:** Sentence case for all UI elements (buttons, labels, page titles) except proper nouns and brand names. This aligns with NL style conventions.

### 4.3 Empty States
`INSUFFICIENT_DATA:` Copy for empty states (e.g., first time viewing testament module — no data yet) not inventoried.  
**Required:** Empty states must include a motivating CTA, not just "Geen gegevens beschikbaar."

### 4.4 Post-Onboarding Content
`INSUFFICIENT_DATA:` Q-UX-C-001 — activation success state content unknown.  
`INSUFFICIENT_DATA:` Q-UX-C-002 — post-Shamir key generation guidance unknown.

---

## 5. Content Gaps Register

| Gap ID | Location | Description | Priority |
|--------|----------|-------------|---------|
| GAP-CONTENT-001 | auth.ontgrendel.mislukt, auth.profiel.aanmakenMislukt | Non-specific error messages — no recovery guidance | MEDIUM |
| GAP-CONTENT-002 | Domain modules (nl/) | Error copy completeness unknown | MEDIUM |
| GAP-CONTENT-003 | auth.setup.avgConsent | C1-level AVG consent text — informed consent validity risk | HIGH |
| GAP-CONTENT-004 | Post-Shamir key generation | No confirmed in-app distribution guidance for noodcodes | HIGH |
| GAP-CONTENT-005 | messages/ governance | No TMS, no content owner, no sync validation | LOW |
| CONTENT_INCONSISTENCY-001 | Button labels | Title case vs sentence case inconsistency | LOW |
| READABILITY_ISSUE-001 | auth.setup.avgConsent | C1 language level for B1/B2 audience | HIGH |

---

## 6. Localization Strategy

### 6.1 Current Coverage
- **NL:** Full (primary language)
- **EN:** Present (completeness vs. NL unverified — Q-UX-L10N-001)

### 6.2 Expansion Readiness
- Technical architecture (next-intl + ICU): Ready for additional languages
- Content readiness: NL only at 100%; EN at `INSUFFICIENT_DATA:` %
- Priority expansion languages: DE, FR (P3 — not within 12-month horizon unless Q-UX-L10N-002 indicates otherwise)

### 6.3 Cultural Considerations for EN Expansion
- "euthanasie" → EN expansion requires reframing as "end-of-life care choices" — cultural connotation difference
- "boedel" → "estate" (acceptable direct translation)
- Donor registration → Netherlands-specific context requires explanation for non-NL markets

---

## 7. Open Items (INSUFFICIENT_DATA)

| Item | Impact | Q-ID |
|------|--------|------|
| AVG consent simplified text | Legal validity of consent | Q-UX-C-001 (indirectly), legal review required |
| Post-activation success state | User orientation after wizard | Q-UX-C-001 |
| Post-Shamir distribution guidance | Critical access failure prevention | Q-UX-C-002 |
| Content owner assignment | Ongoing governance | Q-UX-C-003 |
| EN/NL sync status + validation | Release quality | Q-UX-L10N-001 |
| Domain module copy audit | Full voice & tone consistency | Not covered in Q-UX |

---

## 8. Document History

| Version | Date | Changes |
|---------|------|---------|
| v1 (DRAFT) | 2026-07-14 | Initial creation from Phase 3 analysis. 55% complete. |
