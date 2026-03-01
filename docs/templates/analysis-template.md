# Analyse Template
> Gebruik dit template voor de analyse-deliverable van elke agent.
> Zie `docs/contracts/analysis-output-contract.md` voor de volledige eisen.

---

```markdown
# Analyse – [DISCIPLINE INVULLEN] – [DATUM ISO 8601]

## Metadata
- **Agent:** [naam van de agent]
- **Fase:** [1 / 2 / 3 / 4]
- **Input ontvangen van:** [naam vorige agent of "initieel – geen vorige agent"]
- **Datum:** [YYYY-MM-DD]
- **Software onder analyse:** [naam + versie als beschikbaar, anders INSUFFICIENT_DATA:]
- **Analyse-scope:** [wat is wel en niet geanalyseerd, en waarom]

---

## 1. INPUT INVENTARISATIE

> Documenteer ALLE beschikbare artefacten. Dit is verplicht vóór enige analyse.

| Artefact type | Beschikbaar | Beschrijving/Locatie | Impact als ontbreekt |
|---------------|-------------|---------------------|---------------------|
| [type] | Ja / Nee | [pad of beschrijving] | [impact] |

**Ontbrekende artefacten die analyse-kwaliteit beïnvloeden:**
- `INSUFFICIENT_DATA: [artefact]` – Gevolg: [beschrijving]

---

## 2. CURRENT STATE

> Minimaal 5 bevindingen. Elke bevinding MOET een bronvermelding hebben.

### CS-001 – [Titel bevinding]
- **Bevinding:** [Concrete, specifieke beschrijving – geen generieke statements]
- **Bron:** `[bestandsnaam:regelnummer]` of `[documentnaam, pagina N]` of `[interview: naam, datum]`
- **Impact:** Hoog / Midden / Laag
- **Toelichting:** [aanvullende context indien nodig]

### CS-002 – [Titel bevinding]
- **Bevinding:** 
- **Bron:** 
- **Impact:** 

### CS-003 – [Titel bevinding]
[...]

---

## 3. GAPS

> Per gap: wat ontbreekt of tekortschiet, aantoonbaar gemaakt met bron.

### GAP-001 – [Gap titel]
- **Beschrijving:** [wat ontbreekt of suboptimaal is]
- **Bron:** [hoe is dit aangetoond?]
- **Risico als niet opgelost:** [beschrijving van consequentie]
- **Prioriteit:** Kritiek / Hoog / Midden / Laag

### GAP-002 – [Gap titel]
[...]

---

## 4. RISKS

> Per risico: kans × impact scoring, mitigatie-optie.

### RISK-001 – [Risico titel]
- **Beschrijving:** [wat kan er misgaan]
- **Kans:** Hoog / Midden / Laag
- **Impact:** Hoog / Midden / Laag
- **Risicoscore:** Kritiek / Hoog / Midden / Laag
- **Mitigatie-optie(s):**
  1. [concrete mitigatie]
- **Bron:** [waarop is dit risico gebaseerd]

---

## 5. KPI BASELINE

> Gebruik ONLY data die aantoonbaar beschikbaar is. Nooit schatten.

| KPI | Huidige waarde | Bron | Meetmethode | Status |
|-----|----------------|------|-------------|--------|
| [naam] | [waarde of INSUFFICIENT_DATA:] | [bron of n.v.t.] | [methode] | Available / INSUFFICIENT_DATA |

---

## 6. UNCERTAIN ITEMS

> Elke bewering waarbij je niet 100% zeker bent van de bron.

- `UNCERTAIN: [beschrijving]`
  - **Reden van onzekerheid:** [...]
  - **Escalatie-actie:** [naar wie, voor wat]

---

## 7. INSUFFICIENT DATA ITEMS

> Verplichte secties die niet gevuld konden worden wegens ontbrekende input.

- `INSUFFICIENT_DATA: [sectie/veld]`
  - **Ontbrekend:** [wat]
  - **Gevolg voor analyse:** [impact op de volledigheid]
  - **Escalatie:** [actie]

---

## HANDOFF CHECKLIST

> Alle items moeten aangevinkt zijn vóór handoff. Geen uitzonderingen.

- [ ] Input inventarisatie volledig gedocumenteerd
- [ ] Current State: minimaal 5 bevindingen, alle met bronvermelding
- [ ] Gaps: alle gaps geprioriteerd, alle met bron
- [ ] Risks: alle risks gescoord met mitigatie
- [ ] KPI Baseline: alle bekende KPI's gedocumenteerd, ontbrekende als INSUFFICIENT_DATA:
- [ ] Alle UNCERTAIN: items gedocumenteerd en geëscaleerd
- [ ] Alle INSUFFICIENT_DATA: items gedocumenteerd en geëscaleerd
- [ ] JSON export hieronder aanwezig en syntactisch valide
- [ ] Geen lege secties of placeholder tekst ([TODO], [FILL IN], etc.)
- [ ] Geen tegenstrijdige uitspraken in dit document
- [ ] Global guardrails (00-global-guardrails.md) nageleefd
- [ ] Domein-specifieke guardrails nageleefd
- [ ] Zelfcontrole uitgevoerd: output doorgelezen van begin tot eind

**STATUS: GEREED VOOR HANDOFF / GEBLOKKEERD**  
**Openstaande items:** [lijst of "geen"]

---

## JSON EXPORT

> Plak hier de valide JSON export conform analysis-output-contract.md

```json
{
  "metadata": {
    "agent": "",
    "phase": "",
    "date": "",
    "software_name": null,
    "input_from": ""
  },
  "current_state": [],
  "gaps": [],
  "risks": [],
  "kpi_baseline": [],
  "uncertain_items": [],
  "insufficient_data_items": [],
  "handoff_checklist": {
    "ready_for_handoff": false
  }
}
```
```
