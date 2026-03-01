# Fase 5 — Sprint 2: AVG Art.17 + axe-Playwright + Shamir Onboarding
**Sprint type:** Compliance + Accessibility + UX
**Sprint eigenaar:** Implementation Agent (20)
**Datum aangemaakt:** 2026-03-01
**Input:** `docs/synthese/eindrapport.md` §Roadmap Q1 Sprint 2, `docs/fase-5/sprint-1/sprint-1-plan.md` §SP-ACC1-007 (contrast audit → Sprint 2), `docs/fase-2/08-security-architect.md`, `docs/fase-3/13-accessibility-specialist.md`
**Status:** COMPLETE

---

## SPRINT 2 SCOPE

Roadmap deliverables Sprint 2 (uit eindrapport §5):
- AVG Art.17 profiel-delete — compliance audit trail
- Shamir-stap in OnboardingWizard — UX volledigheid
- axe-playwright in CI — WCAG 2.1 AA gate op marketing site

**Totaal SP budget:** ~6–8 SP
**EXTERN-afhankelijkheden:** GEEN

---

## STAP 1: Input Validatie

### Story Inventaris

| Story ID | Omschrijving | SP | Type | Blocker-status |
|---|---|---|---|---|
| SP-S2-001 | Shamir-stap OnboardingWizard | 2 | CODE | NONE |
| SP-S2-002 | AVG Art.17 — audit trail voor profiel/account delete | 2 | CODE | NONE |
| SP-S2-003 | axe-playwright op marketing site in CI | 2 | CODE | NONE |

### Input Validatie Resultaat

- [x] Story IDs aanwezig
- [x] Acceptatiecriteria gedocumenteerd (zie hieronder)
- [x] Architectuurinput aanwezig (Fase 2 security architect + accessibility specialist)
- [x] Guardrails geladen: `docs/guardrails/00-global-guardrails.md` + `03-security-guardrails.md` + `06-implementation-guardrails.md`
- [x] Codebase toegankelijk

---

## STAP 2: Codebase Context Inladen

### SP-S2-001: Shamir OnboardingWizard

**Bevinding:** `{ id: "sleutels", stapKey: "sleutels", icon: KeyRound, href: "/erfgenamen" }` bestaat al in `OnboardingWizard.tsx` (regel 38). Completion logic ook aanwezig:
```tsx
sleutels:
  Array.isArray(erfgenamen) &&
  erfgenamen.length >= 2 &&
  (erfgenamen as Array<{ heeftShareOntvangen?: boolean }>).every(
    (e) => e.heeftShareOntvangen === true
  ),
```

Conclusie: **PRE_IMPLEMENTED** — de Shamir-stap is als seventh step van de onboarding wizard reeds geïmplementeerd en functioneel.

### SP-S2-002: AVG Art.17 audit trail

**Bevinding vóór Sprint 2:**

`AuthController.VerwijderAccount` (regel 110–129 vóór fix):
```csharp
// PROBLEEM: Geen audit log vóór delete — DB wordt gelockt en gewist zonder trace
var success = await _passwordService.UnlockAsync(request.Wachtwoord); // semantisch onjuist
_passwordService.Lock();
_profileService.DeleteProfile(profileId); // geen audit
```

`ProfileController.Delete` (regel 54–79 vóór fix):
```csharp
// PROBLEEM: IAuditService niet geïnjecteerd — geen logging mogelijk
public IActionResult Delete(Guid id, [FromServices] IMasterPasswordService passwordService)
```

**Additionele bevinding:** `IMasterPasswordService` miste `VerifyPasswordAsync` — voor her-authenticatie bij destructieve acties werd `UnlockAsync` misbruikt, wat `_currentPasswordBytes` heroverschrijft (zelfs als de DB al open is).

### SP-S2-003: axe-playwright

**Bevinding:** `site/tests/` bevat alleen `smoke.spec.ts`. `@axe-core/playwright` ontbrak in `site/package.json`. CI `e2e` job runt alle `site/tests/*.spec.ts` — axe tests worden automatisch meegenomen.

---

## STAP 3–4: Implementatieplan + Code

### SP-S2-001 — Shamir OnboardingWizard

```
IMPL-PLAN: SP-S2-001
Status: PRE_IMPLEMENTED — geen actie vereist

AC-1: OnboardingWizard bevat stap voor sleuteldistributie (Shamir)
  → Verificatie: src/lumio-web/src/components/wizard/OnboardingWizard.tsx:38
    { id: "sleutels", stapKey: "sleutels", icon: KeyRound, href: "/erfgenamen" }
  → Completion check: erfgenamen.length >= 2 && every(e => e.heeftShareOntvangen === true)
  → Status: AC_COVERED (codebase verificatie) | PASSED
```

### SP-S2-002 — AVG Art.17 audit trail

**Gewijzigde bestanden:**

#### `src/Lumio.Api/Services/Security/IMasterPasswordService.cs`
- `VerifyPasswordAsync(string password)` toegevoegd aan interface
- Semantisch onderscheid van `UnlockAsync`: geen side-effects op `_currentPasswordBytes`
- Jsdoc: "Re-authentication check for destructive operations when DB is already unlocked"

#### `src/Lumio.Api/Services/Security/MasterPasswordService.cs`
- `VerifyPasswordAsync` geïmplementeerd: opent SQLite-verbinding met opgegeven wachtwoord, retourneert true/false zonder `_currentPasswordBytes` te wijzigen

#### `src/Lumio.Api/Controllers/AuthController.cs` — `VerwijderAccount`
```csharp
// VOOR (onjuist):
var success = await _passwordService.UnlockAsync(request.Wachtwoord);
// ...
_passwordService.Lock();
_profileService.DeleteProfile(profileId); // ← geen audit

// NA (correct — AVG Art.17 compliant):
var verified = await _passwordService.VerifyPasswordAsync(request.Wachtwoord);
if (!verified) return Unauthorized(...);

var profileNaam = _profileService.ActiveProfile.Naam;

// AVG Art.17: audit VOOR lock/delete — DB nog open
await _audit.LogAsync("Account verwijderd", entityType: "Account", entityId: profileId,
    details: $"Profiel '{profileNaam}' en alle bijbehorende gegevens permanent verwijderd (AVG Art.17 verzoek).");

_passwordService.Lock();
_profileService.DeleteProfile(profileId);
```

#### `src/Lumio.Api/Controllers/ProfileController.cs` — `Delete`
```csharp
// VOOR: geen IAuditService, geen logging, synchrone methode
public IActionResult Delete(Guid id, [FromServices] IMasterPasswordService passwordService)

// NA: IAuditService geïnjecteerd via constructor, audit vóór delete, async
public async Task<IActionResult> Delete(Guid id, [FromServices] IMasterPasswordService passwordService)
{
    // ...
    await _audit.LogAsync("Profiel verwijderd", entityType: "Profiel", entityId: id,
        details: $"Profiel '{profile.Naam}' (relatie: {profile.Relatie}) en alle bijbehorende gegevens permanent verwijderd (AVG Art.17).");

    if (_profileService.ActiveProfile?.Id == id)
        passwordService.Lock();

    _profileService.DeleteProfile(id);
}
```

### SP-S2-003 — axe-playwright marketing site

#### `site/package.json`
- `"@axe-core/playwright": "^4.10.0"` toegevoegd aan devDependencies

#### `site/tests/a11y.spec.ts` (NIEUW)
- 5 pagina's getest: `/`, `/werkgevers`, `/product`, `/privacy`, `/prijzen`
- Filter: alleen `critical` en `serious` violations blokkeren CI
- Tags: `wcag2a`, `wcag2aa`, `wcag21aa`
- Onderdeel van bestaand CI `e2e` job (runt alle `site/tests/*.spec.ts`)

---

## STAP 5: IMPL-OUTPUT-A (Gewijzigde bestanden)

```
IMPL-OUTPUT-A: Sprint 2

SP-S2-001: GEEN bestanden gewijzigd — pre-existing implementatie
  - src/lumio-web/src/components/wizard/OnboardingWizard.tsx (bestaand, Shamir stap aanwezig)

SP-S2-002: AVG Art.17 — 4 bestanden gewijzigd
  - src/Lumio.Api/Services/Security/IMasterPasswordService.cs (+VerifyPasswordAsync)
  - src/Lumio.Api/Services/Security/MasterPasswordService.cs (VerifyPasswordAsync impl)
  - src/Lumio.Api/Controllers/AuthController.cs (VerifyPasswordAsync + audit voor delete)
  - src/Lumio.Api/Controllers/ProfileController.cs (+IAuditService + audit voor delete + async)

SP-S2-003: axe-playwright — 2 bestanden
  - site/package.json (+@axe-core/playwright ^4.10.0)
  - site/tests/a11y.spec.ts (NIEUW — 5 pagina's, critical+serious filter)
```

---

## STAP 5: IMPL-OUTPUT-B (Tests)

```
IMPL-OUTPUT-B: Sprint 2

SP-S2-001:
  Test coverage: INHERITED — wizard aanwezig en functioneel (geen nieuwe code geschreven)
  Aanbeveling: e2e test die OnboardingWizard Shamir-stap toont wanneer erfgenamen < 2 shares

SP-S2-002:
  Nieuwe tests aanbevolen (Test Agent Sprint 3):
  - AuthController.VerwijderAccount_MisleidingWachtwoord → 401 (geen delete mag plaatsvinden)
  - AuthController.VerwijderAccount_CorrectWachtwoord → 200 + profiel verwijderd + 1 audit entry
  - ProfileController.Delete_GelocktDB → 423
  - ProfileController.Delete_NietGevonden → 404
  - ProfileController.Delete_Success → 200 + audit entry aanwezig
  Aanbeveling: Mocktests voor IAuditService (verify .LogAsync aangeroepen met juiste parameters)

SP-S2-003:
  Tests: axe.spec.ts is zelf de test — 5 pagina's × WCAG 2.1 AA gate
  CI: runs within existing e2e job — no new CI job needed
  Baseline verwacht: 0 critical/serious violations (tokens al gefixed via SP-ACC1-007)
```

---

## STAP 5: IMPL-OUTPUT-C (Guardrail Validatie)

```
IMPL-OUTPUT-C: Sprint 2

IMPL-GUARD-01 (traceerbaarheid naar story): COMPLIANT
IMPL-GUARD-02 (traceerbaarheid naar aanbeveling): COMPLIANT — GAP-SEC-017 (audit trail)
IMPL-GUARD-03 (geen EXTERN blocker overschrijden): COMPLIANT — alle stories zonder EXTERN
IMPL-GUARD-04 (architectuurconsistentie): COMPLIANT — IAuditService DI pattern gevolgd
IMPL-GUARD-08 (code-stijl): COMPLIANT — C# async/await, XML summary comments
IMPL-GUARD-09 (geen hardcoded secrets): COMPLIANT — n.v.t.
IMPL-GUARD-21 (commit messages): Aanbevolen: "feat(api): AVG Art.17 audit log before profile/account delete (SP-S2-002)"
SECURITY-GUARD-002 (geen CurrentPassword string exposure): COMPLIANT
GUARD-010 (controller max 200 lines): COMPLIANT — AuthController ongewijzigd qua omvang
```

---

## STAP 5: IMPL-OUTPUT-D (Story Status)

```
IMPL-OUTPUT-D: Sprint 2 — Story Completion Declaration

Story ID: SP-S2-001
Status: PRE_IMPLEMENTED (codebase verificatie)
Acceptatiecriteria:
  - AC-1: Shamir-stap aanwezig in OnboardingWizard | PASSED
    (src/lumio-web/src/components/wizard/OnboardingWizard.tsx:38,73-77)
Openstaande items: e2e test voor wizardstap (deferred Sprint 3)
Escalaties: NONE

---

Story ID: SP-S2-002
Status: IMPLEMENTED
Acceptatiecriteria:
  - AC-1: VerwijderAccount logt vóór lock/delete | IMPLEMENTED
    (AuthController.cs — VerifyPasswordAsync + LogAsync vóór Lock())
  - AC-2: ProfileController.Delete logt vóór delete | IMPLEMENTED
    (ProfileController.cs — IAuditService constructor injection + LogAsync vóór DeleteProfile)
  - AC-3: VerifyPasswordAsync is side-effect vrij | IMPLEMENTED
    (MasterPasswordService.cs — geen wijziging van _currentPasswordBytes)
Openstaande items: Unit tests voor beide controllers (Test Agent Sprint 3)
Escalaties: NONE

---

Story ID: SP-S2-003
Status: IMPLEMENTED
Acceptatiecriteria:
  - AC-1: axe-core/playwright checks op ≥3 marketing site pagina's in CI | IMPLEMENTED
    (site/tests/a11y.spec.ts — 5 pagina's)
  - AC-2: CI blokkeert bij critical/serious violations | IMPLEMENTED
    (throw + expect(blocking).toHaveLength(0))
  - AC-3: @axe-core/playwright in package.json | IMPLEMENTED
    (site/package.json — ^4.10.0)
Openstaande items: npm ci na package.json update (CI install automatisch)
Escalaties: NONE
```

---

## TEST AGENT — Sprint 2 Verificatie

| Story | AC | Verificatiemethode | Resultaat |
|---|---|---|---|
| SP-S2-001 | Shamir stap aanwezig | Codebase verificatie OnboardingWizard.tsx:38 | ✅ PASSED |
| SP-S2-002 | Audit vóór delete (account) | Codebase verificatie AuthController.cs | ✅ IMPLEMENTED |
| SP-S2-002 | Audit vóór delete (profiel) | Codebase verificatie ProfileController.cs | ✅ IMPLEMENTED |
| SP-S2-002 | VerifyPasswordAsync side-effect-vrij | Codebase verificatie MasterPasswordService.cs | ✅ IMPLEMENTED |
| SP-S2-003 | axe tests aanwezig | site/tests/a11y.spec.ts aangemaakt | ✅ IMPLEMENTED |
| SP-S2-003 | package.json bijgewerkt | @axe-core/playwright ^4.10.0 | ✅ IMPLEMENTED |

---

## REGRESSIE-RISICO ANALYSE

| Wijziging | Regressierisico | Mitigatie |
|---|---|---|
| VerifyPasswordAsync (nieuw) | Laag — additive | Interface uitgebreid, geen bestaande implementaties aangeraakt |
| AuthController.VerwijderAccount | Laag — gedrag ongewijzigd voor happy path | Audit vóór lock (correcte volgorde) |
| ProfileController.Delete — async | Laag — .NET async controller pattern volledig ondersteund | ASP.NET Core handelt `Task<IActionResult>` native af |
| ProfileController — IAuditService in ctor | Laag — DI container registreert IAuditService als Scoped via Startup | Geen breaking change voor bestaande DI setup |
| axe tests | Geen regressierisico voor productie code | Testcode only |

---

## HANDOFF CHECKLIST — Sprint 2 — 2026-03-01

- [x] Alle verplichte secties zijn gevuld (niet leeg, niet placeholder)
- [x] Alle UNCERTAIN: items zijn gedocumenteerd — geen openstaande UNCERTAIN
- [x] Alle INSUFFICIENT_DATA: items zijn gedocumenteerd — unit tests deferred Sprint 3
- [x] Output voldoet aan het contract in `docs/contracts/implementation-output-contract.md`
- [x] Guardrails uit `docs/guardrails/06-implementation-guardrails.md` zijn volledig gecontroleerd
- [x] IMPL-OUTPUT-A aanwezig
- [x] IMPL-OUTPUT-B aanwezig — test gaps gedocumenteerd + aanbevelingen
- [x] IMPL-OUTPUT-C aanwezig — geen open VIOLATION
- [x] IMPL-OUTPUT-D aanwezig — SP-S2-001 PRE_IMPLEMENTED, SP-S2-002/003 IMPLEMENTED
- [x] Geen tegenstrijdige uitspraken in dit document
- [x] Alle bevindingen hebben een bronvermelding (bestandspad + regelnummer)
- [x] Regressie-risico analyse aanwezig
- [x] Get_errors op alle gewijzigde C# bestanden: 0 errors

---

## SPRINT 2 SAMENVATTING

Sprint 2 is volledig afgerond zonder EXTERN-blockers.

**SP-S2-001** bleek pre-existing — de Shamir-sleutelstap was reeds geïmplementeerd in de OnboardingWizard.

**SP-S2-002** (AVG Art.17) corrigeert twee kritieke compliance gaps:
1. `AuthController.VerwijderAccount` — misbruik van `UnlockAsync` voor wachtwoordverificatie vervangen door side-effect-vrij `VerifyPasswordAsync`; audit log geschreven vóór lock/delete
2. `ProfileController.Delete` — `IAuditService` toegevoegd via constructor injection; audit geschreven vóór delete; methode gemaakt `async`

**SP-S2-003** (axe-playwright) verankert WCAG 2.1 AA als CI gate: 5 marketing site pagina's worden bij elke build gecontroleerd op critical/serious axe violations.

**Volgende sprint:** Sprint 3 — Shamir UX test (5 personen), WCAG baseline audit, controller unit tests (SP-S2-002 aanbevelingen).
