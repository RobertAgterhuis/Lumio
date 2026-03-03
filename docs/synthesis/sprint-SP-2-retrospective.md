# Sprint SP-2 Retrospektive
> Sprint: SP-2 — "SEO, Content & A11y Baseline"  
> Agent: 28-retrospective-agent  
> Datum: 2026-03-03  
> Branch: feature/sprint-2-seo-content-a11y-baseline  

---

## Sprint Summary

| Metric | Waarde |
|---|---|
| Stories gepland | 6 |
| Stories geleverd | 6 |
| Stories VERVALLEN (besluit) | 0 |
| Effectieve delivery rate | 100% |
| Backend tests | 423 / 423 PASS |
| Site build | PASS |
| lumio-web build | PASS |
| TypeScript (site + lumio-web) | PASS |
| Secret scan | PASS (TruffleHog) |
| Kritieke bugs gevonden | 0 |
| High bugs gevonden | 3 |
| High bugs opgelost | 3 |

---

## Blockers Opgelost / Gemitigeerd

| Blocker | Status |
|---|---|
| GAP-A11Y-006: Geen geautomatiseerde WCAG-tests voor authenticated routes | ✅ INFRASTRUCTUUR GELEVERD (SP-2-006) |
| RISK-MKT-003: Testimonial consent onbevestigd | ✅ GEMITIGEERD — disclaimer toegevoegd (SP-2-003); PO-bevestiging originele toestemming nog OPEN |

---

## Wat Ging Goed ✅

1. **100% delivery van alle 6 geplande stories** — Alle stories geleverd in één sessie, inclusief bugfixes die tijdens de build ontdekt werden.

2. **GAP-A11Y-006 volledig geadresseerd** — SP-2-006 levert een complete Playwright e2e axe-infrastructuur voor 17 geauthenticeerde routes. Zodra de API draait en `LUMIO_TEST_PASSWORD` is ingesteld, zijn alle routes testbaar. Dit lost een Q3-scope-item op in Sprint 2.

3. **JSON-LD + OG structureel opgelost** — SP-2-001 en SP-2-002 zorgen dat alle marketingpagina's correcte Open Graph metadata en gestructureerde data hebben. Dit is direct SEO-waarde zonder latere rework.

4. **Beide builds groen** — `site/` (11 statische routes) en `lumio-web` bouwen foutloos. TypeScript clean voor beide codebases.

5. **Technische documentatie simultaan bijgewerkt** — EN en NL technische manual zijn in dezelfde sessie bijgewerkt met de volledige e2e axe-instructies, inclusief prerequisites en stap-voor-stap uitleg.

6. **RISK-MKT-003 gemitigeerd** — Testimonial disclaimer toegevoegd, waardoor het juridische risico is gereduceerd ook als de PO-bevestiging van de originele toestemming nog uitstaat.

---

## Wat Kon Beter ⚠️

### LESSON_CANDIDATE-004 — Interface-uitbreidingen vereisen directe update van alle test-stubs

**Wat er fout ging:** `IProfileService` werd uitgebreid met `UpdateShamirDrempel(Guid, int)` in een eerdere sprint, maar 5 `FakeProfileService`-implementaties in het testproject werden niet bijgehouden. Dit veroorzaakte 5 compile-errors bij de start van de build-verificatie van Sprint 2.

**Betrokken bestanden:**
- `FakeProfileService.cs`
- `BackupControllerTests.cs` (`FakeProfileServiceWithDbPath`)
- `DatabaseUnlockMiddlewareTests.cs` (`NoProfileService` + `ActiveProfileService`)
- `MasterPasswordServiceLoggingTests.cs` (`FixedPathProfileService`)

**Structurele oorzaak:** Er is geen compile-time enforcement dat alle stubbingklassen de interface volledig implementeren op het moment van de interface-wijziging. De testfases draaien niet automatisch bij elke interface-toevoeging in de implementatieflow.

**Aanbeveling:** Bij elke uitbreiding van `IProfileService` (of enige ander gedeeld interface): grep onmiddellijk op alle `IProfileService`-implementaties in `Lumio.Api.Tests/` en voeg de stub toe in hetzelfde commit als de interface-uitbreiding.

---

### LESSON_CANDIDATE-005 — Test-methodesignaturen worden stale bij refactoring van async naar sync

**Wat er fout ging:** `ShamirController.GetDrempel` was eerder een `async Task<IActionResult>` maar werd refactored naar een synchrone `IActionResult`. De bijbehorende test was `async Task GetDrempel_WhenGeenEigenaar_ReturnsConfigMinDrempel()` met een `await ctrl.GetDrempel()` — dit heeft geen runtime-effect maar compileert niet met Playwright-typed `IActionResult`.

**Aanbeveling:** Bij refactoring van async → sync in controllers: check direct alle tests die die controller method aanroepen en verwijder het `await` + pas de testmethodesignatuur aan.

---

### LESSON_CANDIDATE-006 — SP-04-005 (analytics events) niet gepland in Sprint 2

**Wat er fout ging:** SP-04-005 (PostHog custom events + EXP-003 fix) staat als Q1 P1 item in de roadmap maar werd niet opgepikt in Sprint 2. De sprint was volledig gericht op SEO/content/a11y-scope — analytics paste conceptueel niet maar is wel het laatste openstaande P1 Q1 dev-item.

**Aanbeveling:** In de Sprint 3 planning direct als eerste story opnemen; niet opnieuw doorschuiven.

---

## Openstaande Acties voor Sprint 3

| Actie | Type | Prioriteit | Bron |
|---|---|---|---|
| SP-04-005: PostHog analytics custom events + EXP-003 fix | TECH | HOOG (Q1 P1) | roadmap |
| Q-MKT-B-003: Testimonial originele consent bevestigen of opnieuw aanvragen | PO-ACTIE | HOOG | RISK-MKT-003 |
| REC-DEVOPS-001: CI/CD re-enablen (GitHub Actions) | PO-ACTIE | MIDDEL | DEC-110 |
| Playwright e2e axe-tests uitvoeren met live omgeving | DEV/QA | HOOG | SP-2-006 infrastructure ready |
| B2C checkout automation | TECH/BIZ | HOOG (geblokkeerd) | RISK-MKT-001 / BLK-001 |

---

## Sprint Gate Beslissing

**STATUS: ✅ PASS**

Alle Sprint 2 close-out criteria zijn voldaan:
- [x] 6/6 stories IMPLEMENTED
- [x] 0 open BLOCKING items die naar Sprint 3 doorlopen
- [x] 423/423 backend tests PASS
- [x] site/ build PASS
- [x] lumio-web build PASS
- [x] TypeScript clean (beide codebases)
- [x] Secret scan PASS (TruffleHog pre-push hook)
- [x] `docs/security/security-handoff-context.md` ongewijzigd en up-to-date (geen security-boundary changes in SP-2)
- [x] KPI report aanwezig (`docs/session/sprint-SP-2-kpi.json`)
- [x] velocity-log.json bijgewerkt
- [x] Retrospective COMPLETE
- [x] EN + NL technische documentatie bijgewerkt

**Gereed voor merge naar `main`.**
