# Business Guardrails – Fase 1 Agents
> Van toepassing op: Business Analyst, Domain Expert, Sales Strategist, Financial Analyst

---

## DOMEIN: BUSINESS & STRATEGIE

### G-BUS-01 – Revenue Hypothese Vereist
**Regel:** Geen feature of aanbeveling mag worden opgenomen in het sprintplan zonder een expliciete, toetsbare revenue-hypothese.  
**Format:** "Als we [actie] uitvoeren, verwachten we [meting] te verbeteren met [range] op basis van [rationale]."  
**Schending:** Markeer als `GUARDRAIL_VIOLATION: G-BUS-01` en verwijder uit sprintplan.

### G-BUS-02 – Gecentraliseerde Business Rules
**Regel:** Business rules worden NOOIT geïmplementeerd als hardcoded logica. Ze worden geïdentificeerd en gedocumenteerd in een centrale rule inventory.  
**Verificatie:** Controleer of geïdentificeerde business rules traceerbaar zijn naar een authoritative source (BPMN, decision table, of specification document).  
**Schending:** Markeer als `GUARDRAIL_VIOLATION: G-BUS-02`.

### G-BUS-03 – ICP Validatie
**Regel:** Aanbevelingen voor product of sales mogen NIET worden gedaan voordat het Ideal Customer Profile (ICP) is vastgesteld op basis van aantoonbare data.  
**Bronvereiste:** ICP moet gebaseerd zijn op: bestaande klantdata, interviews, CRM-data of marktonderzoek – NIET op aannames.

### G-BUS-04 – Gap Analyse Volledigheid
**Regel:** De gap-analyse MOET alle vier dimensies dekken: Markt, Product, Revenue, Operations.  
**Schending:** Als één dimensie ontbreekt, is de gap-analyse onvolledig en mag het document NIET als gereed worden gemarkeerd.

### G-BUS-05 – Prioriteitenmatrix Verplicht
**Regel:** Elke set aanbevelingen moet vergezeld gaan van een impact-effort matrix.  
**Format:** 2x2 matrix (high/low impact × high/low effort), ingevuld met concrete items – geen generieke categorieën.

### G-BUS-06 – Financial Analyse Onafhankelijkheid
**Regel:** De Financial Analyst baseert alle KPI-schattingen UITSLUITEND op aangeleverde financiële data.  
**Verbod:** Gebruik NOOIT industrie-benchmarks als vervanging voor ontbrekende bedrijfsdata. Markeer als `INSUFFICIENT_DATA:` en escaleer.

### G-BUS-07 – Sales Cycle Documentatie
**Regel:** De Sales Strategist documenteert ALTIJD de volledige, actuele sales cycle met alle stappen, handoffs, en frictie-punten – gebaseerd op aangeleverd bewijsmateriaal.

### G-BUS-08 – Geen Strategische Sprong
**Regel:** Strategische aanbevelingen die niet direct herleidbaar zijn tot een bevinding uit de Analyse worden geblokkeerd.  
**Schending:** Markeer als `UNSUBSTANTIATED_RECOMMENDATION` en verwijder uit deliverable.

---

## HANDOFF VEREISTEN (FASE 1 SPECIFIEK)
Na Fase 1 MOET de output beschikbaar zijn als gestructureerde JSON of Markdown met de volgende velden (conform `analysis-output-contract.md`):
- `capabilities[]`
- `business_rules[]`
- `risk_assessment[]`
- `kpi_baseline{}`
- `gap_analysis{}`
- `priority_matrix[]`

Elke ontbrekende veld blokkeert de start van Fase 2.
