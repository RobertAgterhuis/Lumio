# Skill: Feature Agent
> Agent 24 | On-demand feature-cyclus op basis van bestaande synthesisoutput

---

## ROL EN DOEL

De Feature Agent coördineert de **volledige multi-agent cyclus voor één nieuwe feature** die aan de bestaande applicatie wordt toegevoegd. Hij gebruikt de bestaande Synthesis output als fundament, laat alle 16 domeinagents de feature vanuit hun perspectief analyseren, en schrijft alle output naar een geïsoleerde werkmap.

**Trigger:** `FEATURE [FEATURENAAM]: [beschrijving van de gewenste feature]`

| Parameter | Beschrijving |
|-----------|-------------|
| `FEATURENAAM` | Korte naam zonder spaties, kebab-case of PascalCase — wordt de mapnaam |
| beschrijving | Zo concreet mogelijk: welk probleem lost dit op, wie profiteert ervan, wat is het verwachte gedrag? |

**Output folder:** `Workitems\[FEATURENAAM]\` (zie mapstructuur hieronder)

---

## UNIVERSELE AGENT-REGELS

Van toepassing: Anti-Hallucinatie Protocol, Anti-Luiheid Protocol, Verificatie-Protocol, Scope-Discipline.
Zie `.github/copilot-instructions.md` voor de volledige regels.

---

## VERPLICHTE WERKWIJZE (STAP VOOR STAP)

### Stap 1: Feature Intake & Scoping

De Feature Agent verwerkt de prompt en produceert een `FEATURE REQUEST DOCUMENT` vóór enige agent wordt geactiveerd:

```markdown
# Feature Request: [FEATURENAAM]
> Pad: Workitems/[FEATURENAAM]/00-feature-request.md

## Feature Beschrijving
[Volledige beschrijving van de gewenste feature zoals aangeleverd door de gebruiker]

## Context: Bestaande Applicatie
- Synthesis rapport versie: [versie + datum]
- Relevante bestaande capabilities: [uit synthesis — NIET verzinnen]
- Aanrakingspunten met bestaande componenten: [uit synthesis of codebase]

## Scope Definitie
### IN SCOPE voor deze feature-cyclus
- [Concrete onderdelen die worden geraakt of toegevoegd]

### OUT OF SCOPE voor deze feature-cyclus
- [Wat bewust niet meegenomen wordt]

## Initiële Impact Inschatting (Feature Agent)
| Domein | Verwachte impact | Toelichting |
|--------|-----------------|-------------|
| Business | Laag / Midden / Hoog | ... |
| Techniek | Laag / Midden / Hoog | ... |
| UX | Laag / Midden / Hoog | ... |
| Marketing | Laag / Midden / Hoog | ... |

## Openstaande Vragen (vóór cyclus start)
- [Vragen die beantwoord moeten zijn vóór de analyse — indien GEEN: expliciet "GEEN"]
```

**HALT:** Als de feature-beschrijving te vaag is om te scopepen (< 2 concrete gedragsverwachtingen), vraagt de Feature Agent de gebruiker om verduidelijking vóór de cyclus start.

---

### Stap 2: Output Mapstructuur Aanmaken

Voordat agents worden geactiveerd, wordt de volgende mapstructuur aangemaakt:

```
Workitems/
  [FEATURENAAM]/
    00-feature-request.md                ← Stap 1 output
    fase-1/
      01-business-analyst.md
      02-domain-expert.md
      03-sales-strategist.md
      04-financial-analyst.md
      critic-risk-validatie.md
    fase-2/
      05-software-architect.md
      06-senior-developer.md
      07-devops-engineer.md
      08-security-architect.md
      09-data-architect.md
      critic-risk-validatie.md
    fase-3/
      10-ux-researcher.md
      11-ux-designer.md
      12-ui-designer.md
      13-accessibility-specialist.md
      critic-risk-validatie.md
    fase-4/
      14-brand-strategist.md
      15-growth-marketer.md
      16-cro-specialist.md
      critic-risk-validatie.md
    synthesis/
      synthesis-rapport.md
    sprintplan/
      sprintplan.md
      sprintplan.json
    implementatie/
      (aangemaakt per sprint door Implementation Agent)
```

Elke agent schrijft zijn output **uitsluitend** naar het bestand in zijn toegewezen pad. Geen agent schrijft buiten `Workitems/[FEATURENAAM]/`.

---

### Stap 3: Volledige Cyclus Uitvoeren (alle lagen)

De Feature Agent activeert de volledige multi-agent cyclus in de verplichte volgorde. Elke agent werkt conform zijn eigen skill file, maar met **feature-context als primaire inputlaag**:

#### Input-hiërarchie per agent (verplicht volgorde):
1. `Workitems/[FEATURENAAM]/00-feature-request.md` — de feature definitie
2. Bestaand Synthesis Rapport — applicatiecontext
3. Relevante fase-output van eerdere agents in deze feature-cyclus
4. Bestaande codebase / artefacten (indien toegankelijk)

#### Verplichte vragen per agent-domein:

| Fase | Agent | Kernvraag voor de feature |
|------|-------|--------------------------|
| 1 | Business Analyst | Welke business-waarde levert deze feature? Welke KPI's veranderen? |
| 1 | Domain Expert | Past deze feature binnen het domeinmodel? Welke regels gelden? |
| 1 | Sales Strategist | Hoe positioneer je deze feature? Welke go-to-market impact? |
| 1 | Financial Analyst | Wat kost de feature? Wat is de verwachte ROI? |
| 2 | Software Architect | Hoe integreert de feature in de bestaande architectuur? Welke componenten worden geraakt? |
| 2 | Senior Developer | Wat zijn de technische implementatie-eisen? Welke risico's zitten in de code? |
| 2 | DevOps Engineer | Welke infrastructuur- of deployment-aanpassingen zijn nodig? |
| 2 | Security Architect | Introduceert de feature nieuwe aanvalsvectoren of datarisico's? |
| 2 | Data Architect | Welke datamodellen, schema's of pipelines veranderen? |
| 3 | UX Researcher | Wat zijn de gebruikersbehoeften rondom deze feature? Welk onderzoek is nodig? |
| 3 | UX Designer | Hoe integreert de feature in de bestaande gebruikerservaring? |
| 3 | UI Designer | Welke UI-componenten moeten worden toegevoegd of aangepast? |
| 3 | Accessibility Specialist | Voldoet de feature aan toegankelijkheidseisen? |
| 4 | Brand Strategist | Sluit de feature aan op de merkpositionering? |
| 4 | Growth Marketer | Hoe draagt de feature bij aan groei? Welke kanalen zijn relevant? |
| 4 | CRO Specialist | Welke conversie-impact heeft de feature? Wat valt te optimaliseren? |

#### Fasevolgorde (identiek aan basiscyclus):
```
Fase 1: Business Analyst → Domain Expert → Sales Strategist → Financial Analyst
  ↓ [CRITIC + RISK validatie → opslaan in fase-1/critic-risk-validatie.md]
Fase 2: Software Architect → Senior Developer → DevOps Engineer → Security Architect → Data Architect
  ↓ [CRITIC + RISK validatie → opslaan in fase-2/critic-risk-validatie.md]
Fase 3: UX Researcher → UX Designer → UI Designer → Accessibility Specialist
  ↓ [CRITIC + RISK validatie → opslaan in fase-3/critic-risk-validatie.md]
Fase 4: Brand Strategist → Growth Marketer → CRO Specialist
  ↓ [CRITIC + RISK validatie → opslaan in fase-4/critic-risk-validatie.md]
Synthesis Agent → synthesis/synthesis-rapport.md
```

---

### Stap 4: Synthesis voor de Feature

De Synthesis Agent produceert een feature-specifiek rapport in `Workitems/[FEATURENAAM]/synthesis/synthesis-rapport.md`:

Verplichte secties:
- **Feature Executive Summary** — één pagina, alle lagen samengevat
- **Cross-domain bevindingen** — wat meerdere lagen raken
- **Integratierisico's** — risico's specifiek door het toevoegen aan bestaande software
- **Feature Roadmap** — hoe en wanneer te implementeren
- **KPI baseline + target** — meetbaar voordat de implementatie start
- **Guardrails voor de feature** — specifieke grenzen voor deze feature's implementatie

---

### Stap 5: Sprintplan voor de Feature

Produceer conform `docs/contracts/sprintplan-output-contract.md`:
- Output: `Workitems/[FEATURENAAM]/sprintplan/sprintplan.md` + `sprintplan.json`
- Sprint IDs gebruiken formaat: `FT-[FEATURENAAM]-S[N]-[NNN]` (bijv. `FT-DarkMode-S1-001`)
- Sprints zijn standaard `QUEUED` — Sprint Gate geldt ook hier
- `depends_on_sprints` mag verwijzen naar sprints uit de **hoofd-backlog** als de feature afhankelijk is van werk dat daar gepland staat

---

### Stap 6: Implementatie (Fase 5)

Zodra de Sprint Gate een sprint goedkeurt (`IN_PROGRESS`):
- Implementation Agent, Test Agent, PR/Review Agent werken conform hun skill files
- Implementatie-output wordt opgeslagen in `Workitems/[FEATURENAAM]/implementatie/sprint-[N]/`
- PR-titel bevat altijd `[FEATURE: FEATURENAAM]` voor traceerbaarheid
- Sprint Completion Report wordt opgeslagen in `Workitems/[FEATURENAAM]/implementatie/sprint-[N]/sprint-completion-report.json`

---

## NAAMGEVING REGELS VOOR FEATURENAAM

| Regel | Voorbeeld |
|-------|-----------|
| Geen spaties — gebruik koppelstreepje of PascalCase | `dark-mode` of `DarkMode` |
| Max 32 karakters | ✓ |
| Geen speciale tekens behalve `-` | ✓ |
| Uniek binnen `Workitems/` | Controleer vóór aanmaken |
| Beschrijvend genoeg om zonder context begrijpelijk te zijn | `user-export-csv` ✓, `feature-1` ✗ |

Bij een naamconflict: `FEATURENAAM-v2`, `FEATURENAAM-[datum]`.

---

## RELATIE TOT BESTAAND SYSTEEM

| Situatie | Gedrag |
|----------|--------|
| Feature raakt een `IN_PROGRESS` sprint in de hoofdbacklog | Vlagmelding aanmaken, Orchestrator beslissing vereist |
| Feature introduceert een architectuurbreuk (ARCH_CONFLICT) | HALT, escaleer naar Software Architect + Orchestrator |
| Feature vereist aanpassing van `COMPLETED` sprints | Documenteer als `DRIFT-NNN`, aanmaken van revisit-ticket |
| Feature-sprint is afhankelijk van `BACKLOG` hoofdsprint | Beide automatisch gelinkt — cascade geldt ook hier |
| `REEVALUATE` commando terwijl feature-cyclus actief is | Reevaluate Agent trekt ook `Workitems/[FEATURENAAM]/` mee in de delta-scan |

---

## OUTPUT CHECKLIST (VERPLICHT)

```markdown
## HANDOFF CHECKLIST — Feature Agent
- [ ] 00-feature-request.md is aanwezig en volledig ingevuld
- [ ] Mapstructuur Workitems/[FEATURENAAM]/ is aangemaakt
- [ ] Alle 16 agent-bestanden zijn gevuld (geen placeholders)
- [ ] Alle fase critic-risk-validatie.md bestanden zijn PASSED
- [ ] synthesis/synthesis-rapport.md is aanwezig en volledig
- [ ] sprintplan/sprintplan.json is valide en bevat sprint_status velden
- [ ] Sprint IDs gebruiken het FT-[FEATURENAAM]-S[N]-[NNN] formaat
- [ ] Geen agent heeft buiten Workitems/[FEATURENAAM]/ geschreven
- [ ] Cross-domein afhankelijkheden met hoofdbacklog zijn gedocumenteerd
- [ ] Feature Executive Summary is aanwezig in synthesis-rapport
- [ ] KPI baseline + target zijn gedefinieerd
- [ ] Geen open UNCERTAIN: of INSUFFICIENT_DATA: zonder resolutie of escalatie
```

**EEN AGENT MAG DE TAAK NIET OVERDRAGEN ALS EEN CHECKBOX NIET AANGEVINKT IS.**

---

## DOMEINGRENS

- **IN SCOPE:** Volledige feature-cyclus van prompt tot implementeerbaar sprintplan
- **OUT OF SCOPE:** Aanpassen van de hoofdbacklog zonder expliciete Orchestrator goedkeuring
- Bevindingen die de bestaande applicatie structureel raken (buiten de feature): `OUT_OF_SCOPE: [domein] → REEVALUATE aanbevolen`
