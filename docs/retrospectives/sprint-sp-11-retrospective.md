# Sprint Retrospective — SP-11: Beveiligingsfundament & CI Hygiene

**Sprint ID:** SP-11  
**Datum:** 2026-03-02  
**PR:** [#92](https://github.com/RobertAgterhuis/Lumio/pull/92) — gemerged `ea03027`  
**Agent:** Sprint Retrospective Agent (skill 28)

---

## Sprint Samenvatting

| KPI | Waarde |
|-----|--------|
| Stories gepland | 4 |
| Stories geland | 4 (100%) |
| Backend tests | 274 passed, 0 failed |
| Frontend tests | 153 passed, 0 failed |
| Frontend coverage | 71.96% (gate: 70%) |
| CI secret-scan | PASSED |
| Issues gesloten | #88, #89, #90, #91 |

---

## Wat ging goed ✅

1. **Alle 4 stories in één sprint geland** — TruffleHog CI, PostHog EU, API v1 en controller-tests zijn compleet zonder backlog-carry-over.
2. **v1() helper principe** — Door `api-client.ts` als enkel punt aan te passen werden alle 100+ call sites automatisch geversioned — nul handmatige aanpassingen in componenten nodig.
3. **Test-infrastructuur uitgebreid** — `FakeShamirService` en `FakeSqlCipherKdfService` zijn herbruikbaar voor toekomstige sprints; `FakeMasterPasswordService.UnlockResult` maakt fout-scenario's configureerbaar.
4. **CI-gate werkt als bedoeld** — Secret-scan blokkeert alle andere jobs; bewezen door de foutloze merge na TruffleHog versie-fix.

---

## Leerpunten 🔁

1. **LESSON_CANDIDATE: GitHub Actions major-version aliases bestaan niet altijd**  
   `trufflesecurity/trufflehog` publiceert geen `@v3` alias — alleen expliciete semver-tags (`v3.93.6`).  
   **Actie:** Bij elke nieuwe action-integratie: altijd een specifieke `vX.Y.Z` pinnen, nooit `@vN` of `@main`.

2. **LESSON_CANDIDATE: Dev-server kan build-output locken**  
   `Lumio.Api.exe` wordt gelocked door `start-dev.ps1`; `dotnet build` faalt dan met "cannot copy app host".  
   **Workaround:** `--no-self-contained` of `-p:UseAppHost=false` bij CI-achtige lokale builds.

---

## Technische schuld (nieuw gesignaleerd)

| Item | Prioriteit | Bron |
|------|------------|------|
| `SP-11-002` (CORS wildcard) — nog niet geïmplementeerd | Hoog | Sprintplan SP-11 |
| Controller-tests batch 2 (export, status, boedel) | Middel | SP-11-005 scope |
| `api-client.ts` v1() helper verwijderen zodra OpenAPI-client gegenereerd wordt | Laag | OPENAPI_TODO |

---

## Beslissingen vastgelegd

- **DEC-SP11-001:** TruffleHog gepind op `v3.93.6`; bij volgende versiebump bewust upgraden en opnieuw pinnen.
- **DEC-SP11-002:** PostHog blijft EU-only; CSP update is hard constraint — geen US-endpoints toestaan.

---

## Status bij afsluiting

- Branch `feature/SP-11-beveiliging-ci-hygiene` gemerged in `main` (squash, `ea03027`)
- Issues #88, #89, #90, #91 gesloten
- `docs/metrics/sprint-SP-11-kpi.json` aangemaakt
- `docs/metrics/velocity-log.json` aangemaakt
- Technische manuals bijgewerkt (NL + EN: api, beveiliging, deployment)
- `session-state.json` → `SPRINT_COMPLETE`

---

## HANDOFF CHECKLIST

- [x] Alle secties gevuld
- [x] Leerpunten gedocumenteerd
- [x] LESSON_CANDIDATE items gemarkeerd
- [x] Beslissingen vastgelegd
- [x] KPI-rapport aanwezig (`sprint-SP-11-kpi.json`)
- [x] Velocity-log bijgewerkt
- [x] Geen open UNCERTAIN: of INSUFFICIENT_DATA: items
- [x] Output klaar als input voor volgende sprint / Orchestrator
