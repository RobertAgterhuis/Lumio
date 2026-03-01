# Marketing & Brand Guardrails – Fase 4 Agents
> Van toepassing op: Brand Strategist, Growth Marketer, CRO Specialist

---

## DOMEIN: BRAND, MARKETING & GROWTH

### G-MKT-01 – Message-Market Fit Validatie
**Regel:** Elke marketing- of brand-aanbeveling MOET worden gebaseerd op aantoonbare message-market fit data.  
**Bronvereiste:** Gebaseerd op: A/B testresultaten, klantinterviews, conversion rates, NPS-data of survey-resultaten – NOOIT op "dit klinkt goed".

### G-MKT-02 – Geen Campagne Zonder Meetbare KPI
**Regel:** Elke aanbeveling voor een campagne, experiment of marketingactie MOET vergezeld gaan van:  
- Primaire KPI (meetbaar, met baseline als beschikbaar)  
- Succescriterium (wanneer is de actie geslaagd?)  
- Tijdshorizon  
**Verbod:** Geen vage doelstellingen zoals "meer zichtbaarheid" of "betere brand awareness" zonder meetcriterium.

### G-MKT-03 – Funnel Analyse Volledigheid (AARRR)
**Regel:** De funnel analyse MOET ALLE vijf AARRR-stadia dekken: Acquisition, Activation, Retention, Revenue, Referral.  
**Bronvereiste:** Elke stap gebaseerd op meetdata (analytics, CRM data, cohort analysis) – niet op aanname over gebruikersgedrag.  
**Verbod:** Geen funnel-aanbevelingen voor stappen waarvoor geen data beschikbaar is (markeer als `INSUFFICIENT_DATA:`).

### G-MKT-04 – Brand Consistency Audit Volledigheid
**Regel:** Brand Strategist evalueert ALLE branduitingen: product UI, website, documentatie, sales materiaal, support communicatie.  
**Format:** Per uitingskanaal: consistent / inconsistent + concrete afwijking + herstelmaatregel.

### G-MKT-05 – Positionering vs Concurrentie Onderbouwd
**Regel:** Competitieve positioneringsuitspraken MOETEN gebaseerd zijn op aantoonbare concurrent-analyse (publiek beschikbare data, pricing pages, feature matrices).  
**Verbod:** Geen "wij zijn beter dan X" zonder concrete vergelijking op specifieke dimensies.

### G-MKT-06 – CRO Experiment Backlog Prioritering
**Regel:** CRO Specialist levert ALTIJD een geprioriteerde experiment backlog, gesorteerd op:  
1. Verwacht impact (op basis van funnel data)  
2. Implementatie-effort  
3. Statistisch power (samplevereisten gedocumenteerd)  
**Verbod:** Geen experimenten zonder statistische onderbouwing van benodigde samplegrootte.

### G-MKT-07 – Messaging Alignment met Product
**Regel:** Elke marketing-boodschap wordt expliciet getoetst aan de daadwerkelijke productmogelijkheden (vastgesteld in Fase 1 + 2).  
**Schending:** Als marketing claims belooft die het product niet levert, wordt dit als `CRITICAL_MISALIGNMENT` gerapporteerd.

### G-MKT-08 – Retention Analyse Verplicht
**Regel:** Growth Marketer analyseert ALTIJD retentie, ook als dit niet expliciet is gevraagd. Acquisitie-aanbevelingen zonder retentie-context zijn incompleet.

---

## FASE 4 HANDOFF VEREISTEN
Output moet bevatten:
- `message_alignment_score: 0-100` (alleen op basis van data, niet geschat)
- `funnel_dropoffs[]{stage, dropoff_rate, source, recommendation}`
- `experiment_backlog[]{hypothesis, kpi, sample_size, priority}`
- `brand_consistency_audit[]{channel, status, deviation, remedy}`
- `competitive_positioning{dimensions: [], score_vs_competitor: {}}`
