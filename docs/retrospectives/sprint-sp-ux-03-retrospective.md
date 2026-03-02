# Sprint Retrospective — SP-UX-03: Terminologie, IA & Design System

**Sprint ID:** SP-UX-03  
**Datum:** 2026-03-02  
**PR:** #77  
**Status:** COMPLETED

---

## Wat ging goed

1. **Alle 3 stories volledig geïmplementeerd in één sessie** — sprint gate → implementatie → tests → commit → PR in één doorlopende sessie zonder iteraties of herwerk
2. **TypeScript clean op de eerste poging** — strict tsc --noEmit gaf geen fouten; LL-SP-UX-02-002 correct toegepast
3. **Simultane multi_replace** — alle 11 i18n + Sidebar wijzigingen toegepast in één geconsolideerde tool-aanroep
4. **Storybook decorator-patroon gevolgd** — NextIntlClientProvider decorators correct overgenomen uit ConfirmDeleteDialog.stories.tsx referentie
5. **LL-002 gerespecteerd** — nl.json en en.json simultaan bijgewerkt in dezelfde tool-aanroep

---

## Wat beter kan

1. **gh pr create --body in PowerShell** — backticks en speciale tekens in inline body veroorzaken parsing fouten in PowerShell. Oplossing: altijd `--body-file` gebruiken met een tijdelijk markdown bestand
2. **TruffleHog `--fail` dubbel** — TruffleHog action-script voegt `--fail` intern al toe aan de docker run command. Onze `extra_args: --fail` zorgde voor de fout `flag cannot be repeated`. Fix: `--fail` weggooien uit `extra_args` (commit `c500fb0`).

---

## Lessons Learned (kandidaten)

| ID | Vastgesteld | Omschrijving |
|----|------------|-------------|
| LL-SP-UX-03-001 | Nieuw | `gh pr create --body` met speciale tekens faalt in PowerShell — gebruik `--body-file` met tijdelijk markdown bestand |
| LL-SP-UX-03-002 | Nieuw | TruffleHog action-script voegt `--fail` intern al toe aan docker run — nooit `--fail` via `extra_args` doorgeven bij `trufflesecurity/trufflehog@main` |

---

## Metrics

| KPI | Waarde | Drempel | Status |
|-----|--------|---------|--------|
| Stories gepland | 3 | — | — |
| Stories geleverd | 3 | 3 | ✅ |
| Velocity | 100% | 100% | ✅ |
| Tests passed | 153/153 | 100% | ✅ |
| Coverage statements | 72.22% | ≥70% | ✅ |
| Coverage branches | 71.65% | ≥70% | ✅ |
| TypeScript clean | ✅ | vereist | ✅ |
| Secret scan | PASSED | vereist | ✅ |
| i18n pariteit NL/EN | ✅ | vereist | ✅ |

---

## Stories

| Story | SP | Issue | Status |
|-------|----|-------|--------|
| UX-011 | 1 | #78 | IMPLEMENTED |
| UX-012 | 5 | #79 | IMPLEMENTED |
| UX-013 | 3 | #80 | IMPLEMENTED |

**Totaal: 9 SP geleverd**

---

## Cumulative velocity na SP-UX-03

| Sprints | Stories gepland | Stories geleverd | Velocity |
|---------|-----------------|-----------------|---------|
| 7 sprints (SP-1 t/m SP-UX-03) | 23 | 23 | 100% |

---

## Actiepunten voor SP-UX-04 (indien van toepassing)

1. `gh pr create` — gebruik altijd `--body-file` met tijdelijk MD bestand (LL-SP-UX-03-001)
2. PR #77 mergen vóór schrijven van eventuele volgende sprint gate
