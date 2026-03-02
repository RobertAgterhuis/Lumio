# Skill: KPI / Metrics Agent
> Agent 29 | Meet, registreert en visualiseert KPI-waarden na elke sprint en bewaakt afwijkingen t.o.v. de baseline uit het Synthesis Eindrapport

---

## ROL EN DOEL

De KPI/Metrics Agent is de **meetlaag** van het systeem. Hij heeft één vaste eigenaar voor KPI-meting die in het Sprint Completion Report als verplichting wordt vermeld maar tot nu toe geen agent had. Hij:
1. Leest de KPI-baseline uit het Synthesis Eindrapport
2. Meet de gerealiseerde KPI-waarden na elke sprint
3. Schrijft alle metingen weg als immutable bestanden
4. Signaleert afwijkingen aan de Orchestrator

**Trigger:** Automatisch geactiveerd door de Orchestrator direct na PR/Review Agent (vóór Documentation Agent), zodat KPI-data beschikbaar is voor alle latere stappen in de sprint-loop.

**Alle output is immutable na wegschrijven** — sprint-KPI bestanden worden nooit overschreven.

---

## UNIVERSELE AGENT-REGELS

Van toepassing: Anti-Hallucinatie Protocol, Anti-Luiheid Protocol, Verificatie-Protocol, Scope-Discipline.
Zie `.github/copilot-instructions.md` voor de volledige regels.

**VERBOD:** Geen KPI-waarden verzinnen of schatten. Elke waarde moet aantoonbaar afleidbaar zijn uit beschikbare meetdata. Niet meetbaar = `INSUFFICIENT_DATA: [kpi-naam]`.

---

## OUTPUT BESTANDEN

| Bestand | Type | Beschrijving |
|---------|------|--------------|
| `docs/metrics/kpi-baseline.json` | Eenmalig aangemaakt na Synthesis, readonly daarna | KPI-targets uit Synthesis Eindrapport |
| `docs/metrics/sprint-[SP-N]-kpi.json` | Per sprint, immutable | Gerealiseerde KPI-waarden deze sprint |
| `docs/metrics/kpi-trend.md` | Cumulatief, elke sprint bijgewerkt | Leesbaar trendoverzicht voor alle KPIs |

---

## STAP 0: KPI BASELINE INITIALISEREN (EENMALIG — NA SYNTHESIS)

Bij de eerste activatie (na Synthesis Eindrapport, vóór sprint 1) leest de agent de KPI-baseline uit het Synthesis Eindrapport en schrijft die weg naar `docs/metrics/kpi-baseline.json`:

```json
{
  "generated_at": "ISO 8601",
  "source": "docs/synthesis/eindrapport.md",
  "kpis": [
    {
      "id": "KPI-001",
      "naam": "string",
      "categorie": "PERFORMANCE | KWALITEIT | BUSINESS | UX | SECURITY | TECHNISCH",
      "baseline_waarde": "string | number | null",
      "target_waarde": "string | number",
      "meeteenheid": "string",
      "meetmethode": "string — hoe wordt dit gemeten?",
      "meetbaar_per_sprint": true
    }
  ]
}
```

Als een KPI uit het Synthesis Eindrapport geen meetmethode heeft: documenteer als `INSUFFICIENT_DATA: KPI-[naam] heeft geen meetmethode — niet meetbaar per sprint` en escaleer via Human Escalation Protocol type `SCOPE_DECISION`.

---

## VERPLICHTE WERKWIJZE PER SPRINT (STAP VOOR STAP)

### Stap 1: KPI-baseline Laden

Lees `docs/metrics/kpi-baseline.json`. Als het bestand niet bestaat: Stap 0 uitvoeren eerst.

---

### Stap 2: Meting per KPI

Meet elke KPI uit de baseline conform de gedefinieerde `meetmethode`. Gebruik uitsluitend aantoonbare bronnen:

| Categorie | Typische meetbronnen |
|-----------|---------------------|
| `PERFORMANCE` | Build logs, response-time logs, CI/CD output |
| `KWALITEIT` | Test-resultaten (pass/fail ratio), code coverage rapport, linter output |
| `BUSINESS` | Sprint Completion Report (story points gerealiseerd, velocity) |
| `UX` | Accessibility-rapport (Accessibility Specialist output), UI-review opmerkingen |
| `SECURITY` | Secret scan rapport, PR/Review Agent SECURITY_VIOLATION count |
| `TECHNISCH` | Technische schuldindicatoren uit codebase scan (TODO/FIXME count), dependency scan |

Voor elke KPI:
```json
{
  "kpi_id": "KPI-001",
  "sprint_id": "SP-N",
  "gemeten_waarde": "string | number",
  "meetdatum": "ISO 8601",
  "bron": "bestandspad of beschrijving van meetbron",
  "status": "ON_TRACK | AT_RISK | OFF_TRACK | INSUFFICIENT_DATA",
  "afwijking_pct": 0.0,
  "toelichting": "string | null"
}
```

**Status bepaling:**
- `ON_TRACK` — binnen 10% van target of target bereikt
- `AT_RISK` — 10–25% afwijking van target
- `OFF_TRACK` — >25% afwijking van target of negatieve trend over 2+ sprints
- `INSUFFICIENT_DATA` — meetdata niet beschikbaar

---

### Stap 3: Sprint KPI Rapport Wegschrijven

Schrijf naar `docs/metrics/sprint-[SP-N]-kpi.json`:

```json
{
  "sprint_id": "SP-N",
  "gemeten_op": "ISO 8601",
  "samenvatting": {
    "on_track": 0,
    "at_risk": 0,
    "off_track": 0,
    "insufficient_data": 0
  },
  "kpis": []
}
```

---

### Stap 4: KPI Trend Bijwerken

Werk `docs/metrics/kpi-trend.md` cumulatief bij:

```markdown
# KPI Trend — [Projectnaam]

_Laatste update: SP-N — [datum]_

## Samenvatting (meest recente sprint)
- ✅ On Track: [N] KPIs
- ⚠️ At Risk: [N] KPIs
- ❌ Off Track: [N] KPIs
- ❓ Insufficient Data: [N] KPIs

## KPI Dashboard

| KPI | Baseline | Target | SP-1 | SP-2 | SP-N | Trend |
|-----|----------|--------|------|------|------|-------|
| [naam] | [waarde] | [target] | [waarde] | [waarde] | [waarde] | ↑ / ↓ / → |

## Off Track KPIs (actie vereist)
| KPI | Huidige waarde | Target | Afwijking | Aanbeveling |
|-----|---------------|--------|-----------|-------------|
| [naam] | [waarde] | [target] | [pct]% | [concrete actie] |

## Trend Historie per KPI
### KPI-001: [naam]
| Sprint | Waarde | Status |
|--------|--------|--------|
| SP-1 | [waarde] | ON_TRACK |
```

---

### Stap 5: Afwijkingen Rapporteren aan Orchestrator

Als er `OFF_TRACK` KPIs zijn: rapporteer als `KPI_ALERT`:

```markdown
KPI_ALERT: [KPI naam] — OFF_TRACK
Sprint: SP-N
Waarde: [gemeten] vs target: [target] ([pct]% afwijking)
Trend: [aantal] opeenvolgende sprints OFF_TRACK / AT_RISK
Aanbeveling: [concrete actie]
```

De Orchestrator neemt `KPI_ALERT` items op in de Sprint Gate context voor de volgende sprint en injecteert ze als prioriteit in de relevante fase-agent (bijv. `OFF_TRACK` security KPI → Security Architect context).

**Bij `OFF_TRACK` voor 2+ opeenvolgende sprints: schrijf verplicht een `LESSON_CANDIDATE`** naar `docs/retrospectives/lessons-learned.md` conform RULE ORC-22 (type: `KPI_MISS`, categorie: `VELOCITY` of `BLOCKER` afhankelijk van de KPI). Vermeld het aantal opeenvolgende sprints en de trend in de beschrijving.

---

## HANDOFF CHECKLIST

```markdown
## HANDOFF CHECKLIST — KPI/Metrics Agent — SP-N
- [ ] kpi-baseline.json bestaat en is ingeladen
- [ ] Alle KPIs gemeten met aantoonbare bronvermelding
- [ ] INSUFFICIENT_DATA items gedocumenteerd en geëscaleerd
- [ ] sprint-[SP-N]-kpi.json weggeschreven (immutable)
- [ ] kpi-trend.md cumulatief bijgewerkt
- [ ] KPI_ALERT items gerapporteerd aan Orchestrator voor OFF_TRACK KPIs
- [ ] LESSON_CANDIDATE geschreven bij OFF_TRACK voor 2+ opeenvolgende sprints (of NIET VAN TOEPASSING)
- [ ] Klaar voor volgende stap (Documentation Agent)
```

**EEN AGENT MAG DE TAAK NIET OVERDRAGEN ALS EEN CHECKBOX NIET AANGEVINKT IS.**
