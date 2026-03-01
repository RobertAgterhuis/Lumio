# Aanbevelingen Template
> Gebruik dit template voor de aanbevelingen-deliverable van elke agent.
> Zie `docs/contracts/recommendations-output-contract.md` voor de volledige eisen.

---

```markdown
# Aanbevelingen – [DISCIPLINE INVULLEN] – [DATUM ISO 8601]

## Metadata
- **Agent:** [naam]
- **Fase:** [1 / 2 / 3 / 4]
- **Gebaseerd op analyse:** [referentie naar analyse-document]
- **Datum:** [YYYY-MM-DD]

---

## REC-001 – [Korte titel van de aanbeveling]

### Probleem
[Concrete beschrijving van het probleem dat deze aanbeveling oplost]  
**Analyse referentie:** [GAP-NNN] en/of [RISK-NNN] en/of [CS-NNN]

### Oplossing
[Concrete, specifieke oplossing. NIET generiek. NIET "verbeter X".]

**Implementatie-aanpak:**
1. **Stap 1:** [Wat, Hoe, Door wie, Wanneer]
2. **Stap 2:** [...]
3. **Stap 3:** [...]

### Impact

| Dimensie | Verwacht effect | Rationale / Databron |
|----------|----------------|---------------------|
| Revenue | [bedrag / % / INSUFFICIENT_DATA:] | [onderbouwing – of reden voor INSUFFICIENT_DATA] |
| Risk Reductie | [beschrijving + voor/na niveau] | [onderbouwing] |
| Cost | [bedrag / % besparing / INSUFFICIENT_DATA:] | [onderbouwing] |
| UX | [beschrijving] | [onderbouwing] |

### Rationale
[Theoretisch kader óf bewezen aanpak óf data die de keuze onderbouwt.  
Verwijs naar frameworks, literatuur, of meetdata. GEEN "dit is best practice" zonder toelichting.]

### Afhankelijkheden
- **Vereist vóór uitvoering:** [andere aanbeveling ID / technische vereiste / externe factor]
- **Geblokkeerd door:** [indien van toepassing – anders "geen"]
- **Afhankelijk van output van:** [agent naam – indien van toepassing]

### Risico van NIET uitvoeren
[Wat zijn de concrete gevolgen als deze aanbeveling niet wordt geïmplementeerd?]

### Meetcriterium
- **KPI:** [specifieke, meetbare KPI]
- **Baseline:** [huidige waarde of INSUFFICIENT_DATA:]
- **Target:** [beoogde waarde na implementatie]
- **Meetmethode:** [hoe en waar meten]
- **Tijdshorizon:** [wanneer is het resultaat meetbaar – bijv. "na 1 sprint", "na 3 maanden"]

---

## REC-002 – [Korte titel]

[Herhaal bovenstaande structuur]

---

## REC-NNN – [...]

[...]

---

## PRIORITEITENMATRIX (VERPLICHT)

> Sorteer op prioriteit. Motiveer elke Impact en Effort schatting.

| Aanbeveling ID | Beschrijving | Impact | Effort | Prioriteit | Gesuggereerde Sprint |
|----------------|-------------|--------|--------|------------|---------------------|
| REC-001 | [...] | Hoog / Midden / Laag | Hoog / Midden / Laag | P1 / P2 / P3 | Sprint [N] |

**Impact rationale:**  
- REC-001: [waarom Hoog/Midden/Laag impact]  
- REC-002: [...]

**Effort rationale:**  
- REC-001: [waarom Hoog/Midden/Laag effort]  
- REC-002: [...]

---

## HANDOFF CHECKLIST

- [ ] Elke aanbeveling verwijst naar een analyse-bevinding (GAP/RISK/CS ID)
- [ ] Geen lege impact-cellen (of expliciet INSUFFICIENT_DATA:)
- [ ] Alle impacts hebben een rationale of databron
- [ ] Alle meetcriteria zijn SMART (Specifiek, Meetbaar, Acceptabel, Realistisch, Tijdgebonden)
- [ ] Afhankelijkheden zijn volledig gedocumenteerd
- [ ] Prioriteitenmatrix is volledig ingevuld
- [ ] Geen aanbevelingen buiten het competentiedomein van deze agent
- [ ] JSON export aanwezig en syntactisch valide
- [ ] Geen gegenereerde/geschatte impact-getallen zonder databron
- [ ] Zelfcontrole uitgevoerd

**STATUS: GEREED VOOR HANDOFF / GEBLOKKEERD**

---

## JSON EXPORT

```json
{
  "metadata": {
    "agent": "",
    "phase": "",
    "date": "",
    "based_on_analysis": ""
  },
  "recommendations": [],
  "priority_matrix": [],
  "handoff_checklist": {
    "ready_for_handoff": false
  }
}
```
```
