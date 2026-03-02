# Sprint Gate — SP-UX-02: Heir Experience & Foutafhandeling

**Sprint ID:** SP-UX-02  
**Branch:** `feature/sp-ux-02-heir-experience`  
**Status:** COMPLETED ✅ — PR #71 merged (47bd971), CI green, issues #72/#74/#75/#76 gesloten  
**Datum start:** 2026-03-02  
**PR:** #71

---

## Definition of Ready (DoR)

- [x] SP-UX-01 gemerged (pre-condition voldaan — PR #70)
- [x] Source files volledig gelezen: HeirUnlockForm.tsx, UnlockForm.tsx, api-client.ts, api-error.ts, AuthController.cs (lockout mechanic)
- [x] i18n-sleutels geïnventariseerd (nl.json + en.json auth.erfgenaam + auth.ontgrendel)
- [x] Alert component beschikbaarheid gecheckt (AlertTitle + AlertDescription beschikbaar)
- [x] 429 response body geïnspecteerd: `{ error, lockoutRemainingSeconds }` — lockoutDuration = 15 min
- [x] Geen externe blockers (Shamir UX test aanbevolen, niet blokkerend)
- [x] Guardrails `docs/guardrails/06-implementation-guardrails.md` van toepassing
- [x] `docs/decisions.md` gecheckt op BESLOTEN constraints

---

## Geïnjecteerde Lessons Learned

| ID | Label | Impact op sprint |
|----|-------|-----------------|
| LL-001 | Geen `useEffect` voor derived state | Intro-step state is gewone useState, geen derived |
| LL-002 | i18n-sleutels altijd in beide talen | Elk nieuw nl.json-sleutel simultaan in en.json |
| LL-005 | Shamir-drempel is variabel | UX-009 intro: geen hardcoded aantallen |
| LL-006 | Secret scan verplicht voor elke PR | PR: geen secrets in diffs |

---

## Stories

| Story | Titel | GAP/REC | Prioriteit | SP |
|-------|-------|---------|------------|-----|
| UX-007 | HeirUnlockForm verbeterde foutmelding | REC-UX-07 | P2 | 1 |
| UX-008 | UnlockForm: uitleg vergeten wachtwoord | REC-UX-08 | P2 | 1 |
| UX-009 | HeirUnlockForm: intro-scherm vóór codes invoer | REC-UX-09 | P2 | 3 |
| UX-010 | Brute-force lockout duur zichtbaar in UI | REC-UX-10 | P2 | 2 |

**Totaal: 7 SP**

---

## Bestanden

| Bestand | Stories | Wijziging |
|---------|---------|-----------|
| `src/lumio-web/src/components/auth/HeirUnlockForm.tsx` | UX-007, UX-009 | Intro-scherm + verbeterde foutmelding |
| `src/lumio-web/src/components/auth/UnlockForm.tsx` | UX-008, UX-010 | Wachtwoord-vergeten info + lockout duur |
| `src/lumio-web/src/lib/api-client.ts` | UX-010 | 429-interceptie met lockoutRemainingSeconds |
| `src/lumio-web/messages/nl.json` | UX-007–010 | Nieuwe i18n-sleutels |
| `src/lumio-web/messages/en.json` | UX-007–010 | Nieuwe i18n-sleutels (EN) |

---

## Acceptatiecriteria

### UX-007 — HeirUnlockForm verbeterde foutmelding
- [x] Bij mislukte reconstructie: Alert variant `danger` getoond (geen plain `<p>`)
- [x] Alert bevat titel + 3 actionable stappen
- [x] Stap 3 verwijst naar contact opnemen met een andere erfgenaam
- [x] i18n-sleutels aanwezig in nl.json + en.json

### UX-008 — UnlockForm uitleg vergeten wachtwoord
- [x] Sectie "Wachtwoord vergeten?" zichtbaar op de ontgrendelscherm
- [x] Tekst: onomkeerbaar-karakter van wachtwoordverlies uitgelegd
- [x] Altijd zichtbaar (niet alleen na fout)
- [x] i18n-sleutels aanwezig in nl.json + en.json

### UX-009 — HeirUnlockForm intro-scherm
- [x] Stap 1 (intro): titel + beschrijving + 3-stappen uitleg + "Noodcodes invoeren" knop
- [x] Stap 2 (codes): bestaand formulier
- [x] Geen hardcoded aantallen codes in intro (LL-005)
- [x] "← Ander profiel" beschikbaar op beide stappen
- [x] i18n-sleutels aanwezig in nl.json + en.json

### UX-010 — Brute-force lockout duur in UI
- [x] Bij 429-respons: resterende lockout-duur zichtbaar in foutmelding
- [x] Weergave in minuten (afgerond naar boven)
- [x] `api-client.ts`: 429 onderschept vóór `!res.ok`, `lockoutRemainingSeconds` doorgegeven
- [x] i18n-sleutels aanwezig in nl.json + en.json (ICU plural)
- [x] Geen hardcoded "15 minuten" in de frontend

---
