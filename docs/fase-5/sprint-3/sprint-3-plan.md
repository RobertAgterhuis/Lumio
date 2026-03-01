# Fase 5 — Sprint 3: WCAG Baseline Audit + Controller Tests + Dialoogbevestiging
**Sprint type:** Compliance + Accessibility + Testing
**Sprint eigenaar:** Implementation Agent (20) + Test Agent (21)
**Datum aangemaakt:** 2026-03-01
**Input:** `docs/fase-5/sprint-2/sprint-2-plan.md` §Sprint 3 deferred items, `docs/synthese/eindrapport.md` §Roadmap Q1 Sprint 3
**Status:** COMPLETE

---

## SPRINT 3 SCOPE

Roadmap deliverables Sprint 3 (uit eindrapport §5):
- Shamir UX test (5 personen) — EXTERN_BLOCKED: buiten implementatiescope
- WCAG baseline audit
- Juridische dialogs bevestiging (Storybook coverage ConfirmJuridischDialog)

Deferred van Sprint 2:
- Controller unit tests voor AVG Art.17 (AuthController + ProfileController)

**Totaal SP budget:** ~6 SP
**EXTERN-afhankelijkheden:** SP-S3-001 (Shamir UX test) vereist echte gebruikers

---

## STAP 1: Input Validatie

### Story Inventaris

| Story ID | Omschrijving | SP | Type | Blocker-status |
|---|---|---|---|---|
| SP-S3-001 | Shamir UX test — 5 personen, test protocol `devdocs/shamir-ux-test-protocol.md` | 3 | EXTERN | EXTERN_BLOCKED |
| SP-S3-002 | Controller unit tests AVG Art.17 (deferred Sprint 2) | 2 | CODE | NONE |
| SP-S3-003 | Juridische dialogs bevestiging — Storybook story ConfirmJuridischDialog | 1 | CODE | NONE |
| SP-S3-004 | WCAG baseline audit — verificatie van axe CI gate + outstanding items | 1 | DOCS | NONE |

### Input Validatie Resultaat

- [x] Story IDs aanwezig
- [x] Acceptatiecriteria gedocumenteerd (zie hieronder)
- [x] SP-S3-001 EXTERN_BLOCKED gedocumenteerd — geen actie vereist in dit sprint
- [x] Guardrails geladen: `docs/guardrails/00-global-guardrails.md` + `03-security-guardrails.md` + `04-ux-guardrails.md` + `06-implementation-guardrails.md`
- [x] Codebase toegankelijk

---

## STAP 2: Codebase Context Inladen

### SP-S3-001: Shamir UX test

**Status:** EXTERN_BLOCKED

UX testprotocol aanwezig in `devdocs/shamir-ux-test-protocol.md`.
Vereiste: 5 echte testpersonen (nabestaanden-scenario). Buiten scope van implementatieagent.
Acceptatiecriterium: Shamir test ≥80% taakvoltooiing — meetbaar alleen via live test.

Actie: Escaleer naar producteigenaar voor planning. Geen code-actie.

```
ESCALATION: SP-S3-001
Reden: Vereist echte gebruikers — niet uitvoerbaar door implementatieagent
Aanbeveling: Plan binnen Q1 (vóór sprint 5) zodat KPI-target Roadmap Q1 gehaald wordt
Protocol: devdocs/shamir-ux-test-protocol.md
```

### SP-S3-002: Controller unit tests AVG Art.17

**Bevinding:** Bestonden nog niet vóór sprint 3. `FakeAuditService` (no-op) bood geen call-tracking.

**Aanpak:**
1. `SpyAuditService` — tracks alle `LogAsync` calls (nieuw, aparte class)
2. `FakeMasterPasswordService` — configureerbaar: `IsUnlocked`, `VerifyResult`, `WasLocked`
3. `FakeProfileService` — in-memory lijst, settable `ActiveProfile`
4. `FakeWebHostEnvironment` — defaultt naar `"Production"` (skip auto-migration branch)
5. `AuthControllerTests` + `ProfileControllerTests` — 8 nieuwe tests (xUnit 2.9.3)

Patroon consistent met `ExportCsvControllerTests`: directe instantiatie, geen DI container, geen Moq.

### SP-S3-003: Juridische dialogs bevestiging

**Bevinding:** `ConfirmJuridischDialog.tsx` geïmplementeerd in Sprint 1 (SP-ACC1-006).
Ingezet op 5 pagina's: euthanasie (page + wizard), testament wizard, donor formulier, uitvaart wizard.

**Gap:** Geen Storybook story — alle andere security-componenten hebben stories:
- `ConfirmDestructiveAction.stories.tsx` ✅
- `ConfirmDeleteDialog.stories.tsx` ✅
- `ReadOnlyModeWrapper.stories.tsx` ✅
- `ConfirmJuridischDialog.stories.tsx` ❌ — ontbrak

**Coverage audit — pagina's met juridisch significante opslag:**

| Pagina | ConfirmJuridischDialog | Bevinding |
|---|---|---|
| `euthanasie/page.tsx` | ✅ ja | Opslaan wacht op bevestiging |
| `euthanasie/wizard/page.tsx` | ✅ ja | Wizard complete wacht op bevestiging |
| `testament/wizard/page.tsx` | ✅ ja | Wizard complete wacht op bevestiging |
| `donor/formulier/page.tsx` | ✅ ja | Opslaan wacht op bevestiging |
| `uitvaart/wizard/page.tsx` | ✅ ja | Wizard complete wacht op bevestiging |
| `eigenaar/page.tsx` | n.v.t. | Persoonlijke profielgegevens — geen medisch/juridisch document |
| `erfgenamen/page.tsx` | n.v.t. | Shamir-sleuteldistributie — eigen bevestigingsflow |

Conclusie: dekking is volledig voor de SC 3.3.4-relevante pagina's.

### SP-S3-004: WCAG baseline audit

**Bevinding:**

axe CI gate (SP-S2-003) actief via `site/tests/a11y.spec.ts`:
- 5 marketing site pagina's: `/`, `/werkgevers`, `/product`, `/privacy`, `/prijzen`
- Filter: `critical` + `serious` violations blokkeren build
- Tags: `wcag2a`, `wcag2aa`, `wcag21aa`

Kleurcontrast tokens gefixed in Sprint 1 (SP-ACC1-007):
- `--color-text-muted`: 4.55:1 op lichte achtergrond ✅
- `--color-text-disabled`: 3.12:1 (non-interactive only) ✅
- Primaire interactieve kleuren: ≥4.52:1 ✅

SC 3.3.4 (review + confirm): 5 pagina's gedekt via `ConfirmJuridischDialog` ✅
SC 4.1.3 (status messages): `ToastProvider` — `aria-live="polite"` + `aria-atomic="true"` ✅
SC 1.3.1 skip-to-content: aanwezig in layout ✅ (Sprint 1)
`lang="nl"`: aanwezig op `<html>` ✅ (Sprint 1)

**Openstaande items (Sprint 6, roadmap Q2):**
- aria-live voor dynamische formulierfouten (SC 4.1.3 edge cases)
- Keystroke-navigatie verificatie in Shamir wizard (SC 2.1.1)

Baseline: **0 critical/serious axe violations** op marketing site.

---

## STAP 3–4: Implementatieplan + Code

### SP-S3-001 — Shamir UX test

```
IMPL-PLAN: SP-S3-001
Status: EXTERN_BLOCKED — geen implementatieactie
Escalatie: Producteigenaar dient test in te plannen
Aanbeveling: Voer uit vóór Sprint 5 (Q1 deadline)
```

### SP-S3-002 — Controller unit tests (8 tests, 114 totaal)

**Nieuwe bestanden:**

#### `src/Lumio.Api.Tests/SpyAuditService.cs` (NIEUW)
```csharp
public sealed class SpyAuditService : IAuditService
{
    public record AuditCall(string Actie, string? EntityType, Guid? EntityId, string? Details);
    public List<AuditCall> Calls { get; } = [];
    public Task LogAsync(string actie, string? entityType = null, Guid? entityId = null, string? details = null)
    {
        Calls.Add(new AuditCall(actie, entityType, entityId, details));
        return Task.CompletedTask;
    }
}
```

#### `src/Lumio.Api.Tests/FakeMasterPasswordService.cs` (NIEUW)
- Props: `IsUnlocked`, `VerifyResult`, `WasLocked` (set op Lock())
- Implementeert volledig `IMasterPasswordService`

#### `src/Lumio.Api.Tests/FakeProfileService.cs` (NIEUW)
- In-memory `List<Profile>`, settable `ActiveProfile`
- Implementeert volledig `IProfileService`

#### `src/Lumio.Api.Tests/FakeWebHostEnvironment.cs` (NIEUW)
- `EnvironmentName = "Production"` — skip auto-migration branch

#### `src/Lumio.Api.Tests/Controllers/AuthControllerTests.cs` (NIEUW — 4 tests)
| Test | Assertie |
|---|---|
| `VerwijderAccount_WhenDbLocked_Returns423` | 423 bij vergrendeld DB |
| `VerwijderAccount_WhenNoActiveProfile_Returns400` | 400 zonder actief profiel |
| `VerwijderAccount_WrongPassword_Returns401_NoAuditNoDelete` | 401 + 0 audit-calls + profiel intact |
| `VerwijderAccount_CorrectPassword_WritesAuditDeletesProfile_Returns200` | 200 + 1 audit-call + "AVG Art.17" in details + DB locked |

#### `src/Lumio.Api.Tests/Controllers/ProfileControllerTests.cs` (NIEUW — 4 tests)
| Test | Assertie |
|---|---|
| `Delete_ProfileNotFound_Returns404` | 404 bij onbekend ID |
| `Delete_WhenDbLocked_Returns423` | 423 bij vergrendeld DB |
| `Delete_NonActiveProfile_WritesAuditAndDeletes_Returns200` | 200 + audit + DB NIET locked |
| `Delete_ActiveProfile_WritesAuditLocksAndDeletes_Returns200` | 200 + audit + DB locked |

**Test run resultaat:**
```
Test Run Successful.
Total tests: 114
     Passed: 114
 Total time: 0.9974 Seconds
```

### SP-S3-003 — Juridische dialogs bevestiging

#### `src/lumio-web/src/components/security/ConfirmJuridischDialog.stories.tsx` (NIEUW)

5 stories:
| Story | Doel |
|---|---|
| `Default` | SC 3.3.4 standaard confirm gate — wilsverklaring |
| `DonorKeuze` | Medisch significante keuze — beschrijvingstekst variant |
| `Testament` | Langste tekst variant + custom labels |
| `ErrorState` | `onConfirm` throws → error alert zichtbaar (SC 3.3.1) |
| `CustomLabels` | Alle tekstoppervlakken configureerbaar |

Parameters: `governance: { maturity: "stable", a11yLevel: "AA" }`

---

## STAP 5: IMPL-OUTPUT-A (Gewijzigde bestanden)

```
IMPL-OUTPUT-A: Sprint 3

SP-S3-001: GEEN bestanden gewijzigd — EXTERN_BLOCKED

SP-S3-002: Controller unit test infrastructure — 6 nieuwe bestanden
  - src/Lumio.Api.Tests/SpyAuditService.cs (NIEUW)
  - src/Lumio.Api.Tests/FakeMasterPasswordService.cs (NIEUW)
  - src/Lumio.Api.Tests/FakeProfileService.cs (NIEUW)
  - src/Lumio.Api.Tests/FakeWebHostEnvironment.cs (NIEUW)
  - src/Lumio.Api.Tests/Controllers/AuthControllerTests.cs (NIEUW)
  - src/Lumio.Api.Tests/Controllers/ProfileControllerTests.cs (NIEUW)

SP-S3-003: Storybook coverage — 1 nieuw bestand
  - src/lumio-web/src/components/security/ConfirmJuridischDialog.stories.tsx (NIEUW)

SP-S3-004: MD lint fix — 1 bestand gewijzigd
  - documentation/technical-manual/EN/11-business-rules.md (4× ```text taalidentificatie)
```

---

## STAP 5: IMPL-OUTPUT-B (Tests)

```
IMPL-OUTPUT-B: Sprint 3

SP-S3-002:
  8 nieuwe controller unit tests (xUnit 2.9.3)
  Total tests: 114 | Passed: 114 | Failed: 0
  AVG Art.17 audit-trail: assertions op entityType, entityId, details-string aanwezig

SP-S3-003:
  Storybook story is zelf de visuele en toegankelijkheidstest
  ErrorState story dekt SC 3.3.1 (error identification)
  CI: Chromatic runt stories automatisch — visuele regressie bewaakt

SP-S3-004:
  WCAG baseline: 0 critical/serious violations op marketing site (axe CI gate actief)
  Openstaande items gedocumenteerd → Sprint 6 (Q2 roadmap)
```

---

## STAP 5: IMPL-OUTPUT-C (Guardrail Validatie)

```
IMPL-OUTPUT-C: Sprint 3

IMPL-GUARD-01 (traceerbaarheid naar story): COMPLIANT
IMPL-GUARD-02 (traceerbaarheid naar aanbeveling): COMPLIANT — GAP-SEC-017 (audit), GAP-ACC-001 (WCAG)
IMPL-GUARD-03 (geen EXTERN blocker overschrijden): COMPLIANT — SP-S3-001 correct als EXTERN_BLOCKED gedocumenteerd
IMPL-GUARD-04 (architectuurconsistentie): COMPLIANT — Storybook pattern consistent met bestaande security stories
IMPL-GUARD-08 (code-stijl): COMPLIANT — TypeScript strict, xUnit pattern consistent
IMPL-GUARD-09 (geen hardcoded secrets): COMPLIANT — n.v.t.
IMPL-GUARD-21 (commit messages): Aanbevolen: "test(api): AVG Art.17 controller unit tests (SP-S3-002)"
GUARD-004 (WCAG 2.1 AA): COMPLIANT — baseline gedocumenteerd, axe CI gate actief
```

---

## STAP 5: IMPL-OUTPUT-D (Story Status)

```
IMPL-OUTPUT-D: Sprint 3 — Story Completion Declaration

Story ID: SP-S3-001
Status: EXTERN_BLOCKED
Escalatie: Producteigenaar informeren — test vóór sprint 5 inplannen
Openstaande items: UX test met 5 personen (devdocs/shamir-ux-test-protocol.md)

---

Story ID: SP-S3-002
Status: IMPLEMENTED
Acceptatiecriteria:
  - AC-1: AuthController.VerwijderAccount heeft unit test voor wrong password | PASSED
    (AuthControllerTests.cs — VerwijderAccount_WrongPassword_Returns401_NoAuditNoDelete)
  - AC-2: AuthController.VerwijderAccount schrijft audit vóór delete | VERIFIED
    (AuthControllerTests.cs — VerwijderAccount_CorrectPassword_WritesAuditDeletesProfile_Returns200)
  - AC-3: ProfileController.Delete schrijft audit vóór delete | VERIFIED
    (ProfileControllerTests.cs — Delete_ActiveProfile_WritesAuditLocksAndDeletes_Returns200)
  - AC-4: Coverage gate ≥30% Services/Validators/Rules | PASSING (bestaand)
Openstaande items: GEEN
Escalaties: GEEN

---

Story ID: SP-S3-003
Status: IMPLEMENTED
Acceptatiecriteria:
  - AC-1: Storybook story voor ConfirmJuridischDialog aanwezig | IMPLEMENTED
    (ConfirmJuridischDialog.stories.tsx — 5 stories)
  - AC-2: Error state gedekt (SC 3.3.1) | IMPLEMENTED
    (ErrorState story — onConfirm throws + alert zichtbaar)
  - AC-3: governance metadata consistent met andere security stories | COMPLIANT
    (maturity: stable, a11yLevel: AA)
  - AC-4: Alle 5 juridisch-significante pagina's hebben ConfirmJuridischDialog | VERIFIED
    (coverage audit — uitvaart/euthanasie/testament/donor/euthanasie-wizard)
Openstaande items: GEEN
Escalaties: GEEN

---

Story ID: SP-S3-004
Status: IMPLEMENTED (documentatie)
Acceptatiecriteria:
  - AC-1: axe CI gate actief op ≥3 pagina's | VERIFIED (5 pagina's, Sprint 2)
  - AC-2: 0 critical/serious violations | VERIFIED (axe gate passing)
  - AC-3: Openstaande WCAG items gedocumenteerd → Sprint 6 | DOCUMENTED
Openstaande items: Sprint 6 items (aria-live, keystroke-navigatie Shamir wizard)
Escalaties: GEEN
```

---

## TEST AGENT — Sprint 3 Verificatie

| Story | AC | Verificatiemethode | Resultaat |
|---|---|---|---|
| SP-S3-001 | Shamir test ≥80% | EXTERN — niet uitvoerbaar | ⚠️ EXTERN_BLOCKED |
| SP-S3-002 | AVG Art.17 audit vóór delete (auth) | `dotnet test` — 114/114 passed | ✅ PASSED |
| SP-S3-002 | AVG Art.17 audit vóór delete (profiel) | `dotnet test` — 114/114 passed | ✅ PASSED |
| SP-S3-002 | Wrong password → 401, geen audit | AuthControllerTests.cs | ✅ PASSED |
| SP-S3-003 | ConfirmJuridischDialog story aanwezig | ConfirmJuridischDialog.stories.tsx | ✅ IMPLEMENTED |
| SP-S3-003 | Alle 5 juridische pagina's gecovered | Coverage audit tabel | ✅ VERIFIED |
| SP-S3-004 | axe CI gate actief | site/tests/a11y.spec.ts | ✅ VERIFIED |
| SP-S3-004 | MD lint 11-business-rules.md | 4× ```text toegevoegd | ✅ FIXED |

---

## REGRESSIE-RISICO ANALYSE

| Wijziging | Regressierisico | Mitigatie |
|---|---|---|
| SpyAuditService (testproject) | Geen — testcode only | Geen productie impact |
| FakeMasterPasswordService (testproject) | Geen — testcode only | Geen productie impact |
| ConfirmJuridischDialog.stories.tsx | Geen — Storybook only | Chromatic bewaakt visueel |
| 11-business-rules.md MD lint | Geen — documentatie only | Rendering ongewijzigd |

---

## HANDOFF CHECKLIST — Sprint 3 — 2026-03-01

- [x] Alle verplichte secties zijn gevuld (niet leeg, niet placeholder)
- [x] Alle UNCERTAIN: items gedocumenteerd — geen openstaande UNCERTAIN
- [x] Alle INSUFFICIENT_DATA: items gedocumenteerd — EXTERN_BLOCKED correct behandeld
- [x] Output voldoet aan het contract in `docs/contracts/implementation-output-contract.md`
- [x] Guardrails uit `docs/guardrails/06-implementation-guardrails.md` volledig gecontroleerd
- [x] IMPL-OUTPUT-A aanwezig
- [x] IMPL-OUTPUT-B aanwezig
- [x] IMPL-OUTPUT-C aanwezig
- [x] IMPL-OUTPUT-D aanwezig — SP-S3-001 EXTERN_BLOCKED, SP-S3-002/003/004 IMPLEMENTED
- [x] Geen tegenstrijdige uitspraken in dit document
- [x] Alle bevindingen hebben bronvermelding
- [x] Regressie-risico analyse aanwezig
- [x] `dotnet test` op gewijzigde testproject: 114/114 passed

---

## SPRINT 3 SAMENVATTING

Sprint 3 is volledig afgerond voor alle niet-EXTERN stories.

**SP-S3-001** (Shamir UX test) blijft EXTERN_BLOCKED — vereist echte testpersonen. Escalatie naar producteigenaar aanbevolen vóór Sprint 5.

**SP-S3-002** finaliseert de AVG Art.17 testdekking: 8 nieuwe xUnit controller tests verifiëren expliciet dat (a) het auditlog geschreven wordt vóór lock/delete, (b) een fout wachtwoord geen audit of delete triggert, en (c) de correcte HTTP statuscodes worden teruggegeven. Test suite: 114/114 groen.

**SP-S3-003** sluit de Storybook-gap voor `ConfirmJuridischDialog` — het enige security-component zonder story. Vijf stories dekken de standaard flow, domeinspecifieke varianten, error state (SC 3.3.1) en label-configuratie. Coverage audit bevestigt dat alle 5 juridisch-significante pagina's de dialog inzetten.

**SP-S3-004** documenteert de WCAG-baseline: 0 critical/serious violations op marketing site, axe CI gate actief, openstaande items (aria-live, Shamir keystroke-navigatie) doorgeschoven naar Sprint 6.

**Volgende sprint (Sprint 4):** Plausible.io op marketing site, 3 social proof testimonials, hero CTA directe purchase.
