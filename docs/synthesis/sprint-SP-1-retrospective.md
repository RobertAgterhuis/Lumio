# Sprint SP-1 Retrospektive
> Sprint: SP-1 — "Stabilize, Unblock, Comply"  
> Agent: 28-retrospective-agent  
> Datum: 2026-03-03  
> Branch: feature/sprint-1-stabilize-unblock-comply  

---

## Sprint Summary

| Metric | Waarde |
|---|---|
| Stories gepland | 17 |
| Stories geleverd | 14 |
| Stories VERVALLEN (besluit) | 3 |
| Effectieve delivery rate | 100% (van actionable scope) |
| Backend tests | 423 / 423 PASS |
| Middleware whitelist tests | 14 / 14 PASS |
| Frontend build | PASS |
| Secret scan | PASS (TruffleHog) |
| Kritieke bugs gevonden | 1 (BUG-SHAMIR-001) |
| Kritieke bugs opgelost | 1 (BUG-SHAMIR-001) |
| High bugs gevonden | 2 |
| High bugs opgelost | 2 |

---

## Blockers Opgelost

| Blocker | Status |
|---|---|
| BLOCKING-P3-001: Shamir heir unlock (BUG-SHAMIR-001) | ✅ OPGELOST |
| BLOCKING-P3-002: Design tokens ontbraken | ✅ OPGELOST (SP-1-005) |
| BLOCKING-P3-003: AVG consent C1-niveau | ✅ OPGELOST (SP-1-011) |
| COMPLIANCE_RISK-003: Juridische disclaimers | ✅ OPGELOST (SP-1-004) |
| GAP-LEGAL-001: Privacybeleid ontbrak | ✅ OPGELOST (SP-1-003) |
| CGAP-004: Audit log rotatie | ✅ OPGELOST (SP-1-006) |

---

## Wat Ging Goed ✅

1. **Volledige delivery van actionable scope** — Alle 14 actionable stories geleverd in één sessie. De 3 VERVALLEN stories zijn het gevolg van expliciete sturing (DEC-109, DEC-110), geen falen.

2. **BUG-SHAMIR-001 geïdentificeerd en gerepareerd** — Een kritieke bug die erfgenamen definitief blokkeerde van het ontgrendelen van de kluis. Gevonden via UX-test, root-cause direct geanalyseerd, fix + regressietest geleverd (REC-SEC-005). Dit was een sprint-1-launchblocker die anders de v1.0-release zou blokkeren.

3. **Alle 6 sprint-1-blockers opgelost** — Zes BLOCKING items (juridisch, UX, compliance, security) zijn volledig afgehandeld. Er zijn geen openstaande BLOCKING items die naar Sprint 2 doorlopen.

4. **423/423 tests slagen** — Geen enkele bestaande test werd gebroken door de sprint-implementaties.

5. **TruffleHog pre-push hook actief** — SP-1-001 zorgt ervoor dat secrets nooit meer per ongeluk gepusht kunnen worden. Eerste gebruik direct succesvol.

6. **Design-tokens.json aangeleverd** — Maakt WCAG-verificatie en consistente UI-implementatie mogelijk in Sprint 2+.

---

## Wat Kon Beter ⚠️

### LESSON_CANDIDATE-001 — Splits vs. monolithische vertaalbestanden

**Wat er fout ging:** Vertalingen werden eerder bewerkt in `messages/nl.json` en `messages/en.json` (monolithische legacy-bestanden). De applicatie laadt op runtime uitsluitend `messages/nl/*.json` per-domain via de `DomainMessagesProvider`. De monolithische bestanden worden nooit geladen. Dit veroorzaakte een volledige sessie aan vruchteloos werk die een extra correctiesessie vereiste.

**Structurele oorzaak:** De split-architectuur was niet gedocumenteerd in de onboarding of de coding conventions. Er bestaat geen lint/CI-regel die verbiedt om de monolithische bestanden te bewerken.

**Aanbeveling:** Voeg een duidelijke `README.md` toe aan de `messages/` map die uitlegt welke bestanden actief zijn. Overweeg de monolithische bestanden te verwijderen of te hernoemen naar `*.reference.json` om toekomstige verwarring te voorkomen.

---

### LESSON_CANDIDATE-002 — AllowedPrefixes whitelist had geen test

**Wat er fout ging:** BUG-SHAMIR-001 bestond onopgemerkt doordat er geen regressietest was voor de `AllowedPrefixes` whitelist. Het endpoint `/api/v1/shamir/reconstrueer-en-ontgrendel` was nooit opgenomen — waardoor erfgenamen nooit hadden kunnen inloggen.

**Structurele oorzaak:** De whitelist is een statische array in `DatabaseUnlockMiddleware.cs`. Er was geen test die vérifieert dat specifieke endpoints erin staan. Bij het toevoegen van het endpoint (SP-10-COR-001) is de whitelist-consistentie niet gecheckt.

**Aanbeveling (geïmplementeerd):** REC-SEC-005 is geleverd als `DatabaseUnlockMiddlewareTests.LockedDatabase_AllowedPrefix_PassesThrough`. Voor elke toekomstige whitelist-wijziging MOET de `[InlineData]` lijst worden bijgewerkt.

---

### LESSON_CANDIDATE-003 — Security handoff werd uitgesteld

**Wat er fout ging:** Na het fixen van BUG-SHAMIR-001 werd `security-handoff-context.md` niet direct bijgewerkt. Dit veroorzaakte een `SECURITY_HANDOFF_STATUS: UPDATE_REQUIRED` blokkade op de Sprint Gate die apart opgelost moest worden.

**Aanbeveling:** Bij elke wijziging aan `DatabaseUnlockMiddleware`, de CSP-configuratie, of andere security-boundary-code: update `docs/security/security-handoff-context.md` in hetzelfde commit als de fix.

---

## Openstaande Acties voor Sprint 2

| Actie | Type | Prioriteit | Bron |
|---|---|---|---|
| Voeg README.md toe aan `src/lumio-web/messages/` | LESSON | HOOG | LESSON_CANDIDATE-001 |
| WCAG 2.1 AA geautomatiseerde tests (18 authenticated routes) | TECH | HOOG | GAP-A11Y-006 |
| Testimonial consent documenteren of disclaimer toevoegen | PO-ACTIE | HOOG | RISK-MKT-003 |
| CI billingbesluit hernemen (DEC-110) | PO-ACTIE | MIDDEL | DEC-203 |
| B2C checkout automation (mailto fallback vervangen) | TECH/BIZ | HOOG | RISK-MKT-001 |
| Security handoff bijwerken in hetzelfde commit als security-fixes | PROCESS | HOOG | LESSON_CANDIDATE-003 |

---

## Sprint Gate Beslissing

**STATUS: ✅ PASS**

Alle Sprint 1 close-out criteria zijn voldaan:
- [x] 14/14 actionable stories IMPLEMENTED of VERVALLEN (besluit)
- [x] 0 open BLOCKING items die naar Sprint 2 doorlopen
- [x] 423/423 backend tests PASS
- [x] Frontend build PASS
- [x] Secret scan PASS
- [x] `docs/security/security-handoff-context.md` bijgewerkt (SECURITY_HANDOFF_STATUS: **RESOLVED**)
- [x] REC-SEC-005 whitelist regressietest geïmplementeerd (14/14 PASS)
- [x] KPI report aanwezig (`docs/session/sprint-SP-1-kpi.json`)
- [x] velocity-log.json bijgewerkt
- [x] Retrospective COMPLETE

**Gereed voor merge naar `main`.**
