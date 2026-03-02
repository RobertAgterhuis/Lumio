# Sprint Retrospective — SP-UX-02: Heir Experience & Foutafhandeling
**Sprint ID:** SP-UX-02  
**Datum:** 2026-03-02  
**Agent:** Sprint Retrospective Agent (Agent 28)  
**Status:** COMPLETE ✅

---

## Sprint Samenvatting

| Attribuut | Waarde |
|---|---|
| Sprint naam | SP-UX-02 Heir Experience & Foutafhandeling |
| Scope | Fase 3 UX — Heir experience + foutafhandeling |
| Geplande stories | 4 (UX-007, UX-008, UX-009, UX-010) — 7 SP totaal |
| Geleverde stories | 4 ✅ |
| PR | #71 `feature/sp-ux-02-heir-experience` → `main` — gemerged (47bd971) |
| Issues | #72, #74, #75, #76 — gesloten ✅ |
| CI op PR | ✅ GROEN na 3 runs (2 hersteliterations) |
| Besluit | DEC-101: Chromatic permanent uitgeschakeld |

---

## Geleverde Stories

### UX-007 — HeirUnlockForm verbeterde foutmelding
**Issue:** #72 — Gesloten ✅  
**Bestand:** `src/lumio-web/src/components/auth/HeirUnlockForm.tsx`

**Wat is gebouwd:**
- `"FAILED"` sentinel detectie → `Alert variant="danger"` met `AlertTitle` en genummerd stappenplan (3 herstelstappen)
- Overige fouten behouden als plain `<p>` fallback
- i18n-sleutels: `reconstructieMisluktTitel`, `reconstructieMisluktStap1`, `reconstructieMisluktStap2`, `reconstructieMisluktStap3`

**Verificatie:** TypeScript clean, CI a11y PASSED

---

### UX-008 — UnlockForm uitleg vergeten wachtwoord
**Issue:** #76 — Gesloten ✅  
**Bestand:** `src/lumio-web/src/components/auth/UnlockForm.tsx`

**Wat is gebouwd:**
- Altijd-zichtbare info-sectie onder submit-knop: `Info`-icon + titel + instructietekst
- i18n-sleutels: `wachtwoordVergetenTitel`, `wachtwoordVergetenTekst`
- 429-foutmelding geïntegreerd (zie UX-010)

**Verificatie:** TypeScript clean

---

### UX-009 — HeirUnlockForm intro-scherm
**Issue:** #74 — Gesloten ✅  
**Bestand:** `src/lumio-web/src/components/auth/HeirUnlockForm.tsx`

**Wat is gebouwd:**
- `type Step = "intro" | "codes"` + `useState<Step>("intro")`
- Intro-scherm met Shamir 3-staps uitleg (`introStap1/2/3`) conform LL-005 (geen hardcoded aantallen)
- "Noodcodes invoeren" knop als stap-overgang
- `profileLink` geëxtraheerd als constante (herbruikbaar op beide stappen)
- i18n-sleutels: `introTitel`, `introBeschrijving`, `introHoeWerktHet`, `introStap1`, `introStap2`, `introStap3`, `introStarten`

**Verificatie:** TypeScript clean, UI-flow correct

---

### UX-010 — Brute-force lockout duur zichtbaar in UI
**Issue:** #75 — Gesloten ✅  
**Bestanden:** `src/lumio-web/src/lib/api-client.ts`, `src/lumio-web/src/components/auth/UnlockForm.tsx`

**Wat is gebouwd:**
- `api-client.ts`: 429-interceptie blok — parseert `{ error, lockoutRemainingSeconds }` uit response body
- `Object.assign(err, { lockoutRemainingSeconds })` op `ApiError` instantie
- `UnlockForm.tsx`: `ApiError` import + catch 429 → ICU plural i18n `geblokkerd` (minuten)
- i18n-sleutel: `geblokkerd` met `{minuten, plural, one {1 minuut} other {# minuten}}`
- 3 nieuwe unit tests in `api-client.test.ts` (18 tests totaal)

**Verificatie:** TypeScript clean, 18/18 unit tests ✅

---

## CI Iteraties

| Run | Commit | Resultaat | Root cause |
|-----|--------|-----------|-----------|
| 22566214528 | `42ba08a` (implementatie) | ❌ | Coverage-drempel niet gehaald: api-client.ts lines 128-131, 149-155 niet gedekt; functions < 70% |
| 22566539910 | `1d446f3` (test toevoeging) | ❌ | TS18046: `catch (e) => e` typed als `unknown`, CI `tsc --noEmit` strict mode |
| 22566781979 | `ec65b5c` (TS cast fix) | ✅ | Alle checks groen |

**Oorzaak analyse:**
1. **Coverage**: Lokale vitest-run includeerde storybook-project (327 tests) met hogere false positives voor functiocoverage. CI gebruikt `vitest run --project unit --coverage` — alleen unit-project. Leidt tot schijnbaar lagere lokale coverage maar hogere CI-pass rate.
2. **TS18046**: `vitest` compile werkt zonder strict catch-typing; `tsc --noEmit` CI-stap wél strict. Vereiste `(e: unknown) => e) as { ... }` cast-patroon.

---

## Besluit Vastgelegd

| ID | Besluit | Impact |
|---|---|---|
| DEC-101 | Chromatic niet gebruikt — CI job uitgeschakeld (`if: false`) | Geen false-positive CI failures meer op elk PR wegens `PROJECT_ID_PLACEHOLDER` |

---

## Lessons Learned (kandidaten voor velocity-log.json)

| ID | Label | Toepassing |
|----|-------|-----------|
| LL-SP-UX-02-001 | Lokale coverage-scope matcht CI niet | Gebruik altijd `npm run test:coverage` (= `vitest run --project unit --coverage`) voor lokale coverage-check vóór push — niet `vitest run --coverage` (includeert storybook) |
| LL-SP-UX-02-002 | `catch (e) => e` met property access → TS18046 in strict tsc | Gebruik `(e: unknown) => e) as { prop: type }` of try/catch met typed variabele; Vitest runtime accepteert het wel maar `tsc --noEmit` faalt |

---

## Kwaliteit & Guardrails

| Check | Status |
|-------|--------|
| TypeScript clean (`tsc --noEmit`) | ✅ |
| Unit tests 18/18 | ✅ |
| Accessibility (axe-core CI) | ✅ |
| Secret scan | ✅ |
| i18n pariteit NL/EN (LL-002) | ✅ — 14 sleutels simultaan toegevoegd |
| Geen hardcoded Shamir-drempel (LL-005) | ✅ |
| Alert variant="danger" (niet "destructive") | ✅ — SP-UX-01 lesson toegepast |
| DEC-101 Chromatic uitgeschakeld | ✅ |

---

## Volgende Sprint

**SP-UX-03 — Terminologie, IA & Design System** (gepland, ~9 SP)  
Stories: UX-011, UX-012, UX-013  
Pre-condition: SP-UX-02 gemerged ✅

**FASE-4 (Marketing)** — BLK-UX-03 in eindrapport-ux.md; aanvang na SP-UX-03 of parallel.

---

## HANDOFF CHECKLIST
- [x] Alle verplichte secties zijn gevuld
- [x] Geen UNCERTAIN: of INSUFFICIENT_DATA: items zonder gedocumenteerde reden
- [x] KPI-rapport `docs/metrics/sprint-SP-UX-02-kpi.json` aangemaakt
- [x] Velocity-log bijgewerkt (zie session-state update)
- [x] Sprint gate status → COMPLETED
- [x] Session state → COMPLETED
- [x] GitHub issues #72, #74, #75, #76 gesloten
- [x] PR #71 gemerged (47bd971)
- [x] Alle lessons learned gedocumenteerd
