# Analyse Output Contract
> Versie: 1.0 | Van toepassing op alle analyse-deliverables van alle agents

---

## DOEL
Dit contract definieert de verplichte structuur en kwaliteitseisen voor de **Analyse**-deliverable van elke agent.
Een analyse die niet aan dit contract voldoet wordt **teruggestuurd** door de Critic Agent.

---

## VERPLICHT SCHEMA (Markdown + JSON)

Elke analyse-deliverable bestaat uit twee delen:
1. **Markdown rapport** (leesbaar voor mens)
2. **JSON data export** (machine-leesbaar, voor agent-handoff)

---

## DEEL 1: MARKDOWN STRUCTUUR

```markdown
# Analyse – [Discipline] – [Datum]

## Metadata
- Agent: [naam van de agent]
- Fase: [1 / 2 / 3 / 4]
- Input ontvangen van: [vorige agent of "initieel"]
- Datum: [ISO 8601]
- Software onder analyse: [naam + versie als beschikbaar]

## 1. Current State
### 1.1 [Onderwerp A]
- Bevinding: [concrete beschrijving]
- Bron: [bestandsnaam:regelnummer / document:pagina / interview:referentie]
- Impact: [Hoog / Midden / Laag]

### 1.2 [Onderwerp B]
[...]

## 2. Gaps
### 2.1 [Gap titel]
- Beschrijving: [wat ontbreekt of tekortschiet]
- Bron: [aantoonbaar gemaakt via...]
- Risico als niet opgelost: [beschrijving]
- Prioriteit: [Kritiek / Hoog / Midden / Laag]

## 3. Risks
### 3.1 [Risico titel]
- Beschrijving: [wat kan er misgaan]
- Kans: [Hoog / Midden / Laag]
- Impact: [Hoog / Midden / Laag]
- Risicoscore: [Hoog × Hoog = Kritiek, etc.]
- Mitigatie-opties: [minimaal 1 concrete optie]
- Bron: [...]

## 4. KPI Baseline
| KPI | Huidige waarde | Bron | Meetmethode |
|-----|----------------|------|-------------|
| [naam] | [waarde of INSUFFICIENT_DATA:] | [bron] | [hoe gemeten] |

## 5. UNCERTAIN Items
- `UNCERTAIN: [beschrijving]` – Reden: [waarom onzeker] – Escalatie: [actie]

## 6. INSUFFICIENT_DATA Items
- `INSUFFICIENT_DATA: [sectie/veld]` – Ontbrekend: [wat] – Gevolg: [impact op analyse]

## HANDOFF CHECKLIST
- [ ] Alle secties (1-4) zijn volledig ingevuld
- [ ] Alle bevindingen hebben een bronvermelding
- [ ] Geen lege secties of placeholders
- [ ] Alle UNCERTAIN: items zijn gedocumenteerd
- [ ] Alle INSUFFICIENT_DATA: items zijn gedocumenteerd en geëscaleerd
- [ ] JSON export hieronder is valide en compleet
- [ ] Geen tegenstrijdige bevindingen
- [ ] Output voldoet aan global guardrails (00-global-guardrails.md)
- [ ] Domein-specifieke guardrails zijn gecontroleerd
```

---

## DEEL 2: JSON EXPORT SCHEMA

```json
{
  "metadata": {
    "agent": "string",
    "phase": "1 | 2 | 3 | 4",
    "date": "ISO 8601",
    "software_name": "string | null",
    "input_from": "string"
  },
  "current_state": [
    {
      "id": "CS-001",
      "topic": "string",
      "finding": "string",
      "source": "string",
      "impact": "High | Medium | Low"
    }
  ],
  "gaps": [
    {
      "id": "GAP-001",
      "title": "string",
      "description": "string",
      "source": "string",
      "risk_if_unresolved": "string",
      "priority": "Critical | High | Medium | Low"
    }
  ],
  "risks": [
    {
      "id": "RISK-001",
      "title": "string",
      "description": "string",
      "probability": "High | Medium | Low",
      "impact": "High | Medium | Low",
      "score": "Critical | High | Medium | Low",
      "mitigations": ["string"],
      "source": "string"
    }
  ],
  "kpi_baseline": [
    {
      "kpi": "string",
      "value": "string | null",
      "source": "string | null",
      "measurement_method": "string",
      "data_status": "Available | INSUFFICIENT_DATA"
    }
  ],
  "uncertain_items": [
    {
      "id": "UNC-001",
      "description": "string",
      "reason": "string",
      "escalation_action": "string"
    }
  ],
  "insufficient_data_items": [
    {
      "id": "IND-001",
      "section": "string",
      "missing": "string",
      "consequence": "string"
    }
  ],
  "handoff_checklist": {
    "all_sections_complete": true,
    "all_findings_sourced": true,
    "no_empty_sections": true,
    "uncertain_documented": true,
    "insufficient_data_documented": true,
    "json_export_valid": true,
    "no_contradictions": true,
    "global_guardrails_checked": true,
    "domain_guardrails_checked": true,
    "ready_for_handoff": true
  }
}
```

---

## KWALITEITSEISEN

| Eis | Norm |
|-----|------|
| Minimaal aantal bevindingen | 5 per sectie (Current State, Gaps, Risks) tenzij INSUFFICIENT_DATA |
| Bronvermelding | Aanwezig bij elke bevinding |
| KPI-velden | Minimaal 3 KPI's of expliciete INSUFFICIENT_DATA per ontbrekende |
| JSON validatie | Valide JSON zonder syntax-fouten |
| Handoff checklist | Alle items aangevinkt (`true`) of escalatie gedocumenteerd |

---

## AFWIJZINGSCRITERIA (Critic Agent gebruikt deze)
Een analyse wordt AFGEWEZEN als:
- Één of meer secties leeg zijn of placeholders bevatten
- Een bevinding geen bronvermelding heeft
- De JSON export ontbreekt of niet valide is
- De Handoff Checklist niet volledig is
- `ready_for_handoff: false`
