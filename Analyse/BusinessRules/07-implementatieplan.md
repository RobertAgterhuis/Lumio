# 7. Implementatieplan — Gefaseerde Sprints

> **Doel:** een concreet, gefaseerd sprintplan voor de stapsgewijze externalisering
> van business rules in Lumio. Elke sprint is onafhankelijk releasbaar.

---

## 7.1 Overzicht

```
Sprint 1 ──── Sprint 2 ──── Sprint 3 ──── Sprint 4
  2 wk           2 wk           2 wk           1 wk
                                              
Config &      Domain        Rule Engine     Afronding
Quick Wins    Services      (optioneel)     & Docs
                                              
57 regels     48 regels     33 regels       Polish
Score A       Score A2+B    Score B         Tests
```

**Totale doorlooptijd:** 6-7 weken (sprint 3 optioneel → 4-5 weken minimaal)

---

## 7.2 Sprint 1 — Configuratie & Quick Wins (2 weken)

### Doel
Alle hardcoded constanten, drempels en parameters verplaatsen naar een extern
JSON-configuratiebestand met `IOptions<T>` binding.

### Scope

| Taak | BR-ID's | Effort | Risico |
|------|---------|--------|--------|
| Projectstructuur Rules/ aanmaken | — | 1u | Laag |
| `lumio-rules.json` bestand schrijven | — | 2u | Laag |
| Options-modellen schrijven (7 klassen) | — | 3u | Laag |
| DI-registratie in Program.cs | — | 1u | Laag |
| Startup-validatie toevoegen | — | 1u | Laag |
| ErfbelastingOptions migratie | BR-042–045 | 2u | Middel |
| LimietenOptions migratie | BR-001,017,033,101,110,157 | 2u | Laag |
| VeldLengtesOptions migratie | BR-026–031,036–038 | 1u | Laag |
| ValidatieOptions migratie (regex) | BR-084,019 | 1u | Laag |
| EncryptieOptions migratie | BR-177–183 | 1u | Middel |
| ExportOptions migratie | BR-162,165 | 1u | Laag |
| CompleetheidsOptions migratie | BR-123–132 | 2u | Laag |
| Code-duplicaten verwijderen (3×) | BR-048/095/096 | 2u | Middel |
| Unit tests voor Options-binding | — | 3u | Laag |
| Regressietest (handmatig) | — | 2u | — |

### Deliverables

1. `Rules/Configuration/` map met 7 Options-klassen
2. `rules/lumio-rules.json` extern configuratiebestand
3. Alle hardcoded constanten vervangen door `IOptions<T>` injecties
4. 3 code-duplicaten geëlimineerd (netto nalatenschap, wachtwoord-lengte, Shamir threshold)
5. Startup-validatie: app weigert te starten bij ongeldige config
6. Unit tests: ≥10 tests voor Options-binding en fallback-defaults

### Acceptatiecriteria

- [x] Applicatie start zonder `lumio-rules.json` (fallback naar defaults)
- [x] Applicatie start met `lumio-rules.json` en leest juiste waarden
- [x] Wijziging in erfbelasting-tarieven in JSON → direct effect in berekening
- [x] Geen hardcoded `795156m` of `25187m` meer in C#-code
- [x] Netto nalatenschap formule is nog maar 1× geïmplementeerd
- [x] Alle bestaande functionaliteit werkt ongewijzigd (regressie)

### Geschat effort: **22 uur** (~3 werkdagen)

---

## 7.3 Sprint 2 — Domain Services (2 weken)

### Doel
Business logica extraheren uit controllers naar testbare domain services met
het Facts-in-Results-out patroon.

### Scope

| Taak | Service | Regels | Effort | Risico |
|------|---------|--------|--------|--------|
| PolicyResult<T> generiek model | — | — | 1u | Laag |
| Facts-modellen schrijven (6) | — | — | 2u | Laag |
| Result-modellen schrijven (6) | — | — | 2u | Laag |
| ErfbelastingService | IErfbelastingService | ~40 | 4u | Middel |
| NalatenschapService | INalatenschapService | ~15 | 2u | Laag |
| CompleetheidsService | ICompleetheidsService | ~80 | 4u | Middel |
| JuridischeCheckService | IJuridischeCheckService | ~80 | 4u | Middel |
| LegitimairePortieService | ILegitimairePortieService | ~30 | 3u | Middel |
| MeldingService | IMeldingService | ~50 | 3u | Middel |
| SuggestieService | ISuggestieService | ~40 | 3u | Laag |
| Controller-refactoring (StatusCtrl) | — | — | 4u | Hoog |
| Controller-refactoring (ErfgenamenCtrl) | — | — | 3u | Middel |
| Controller-refactoring (TestamentCtrl) | — | — | 3u | Middel |
| DI-registratie (AddLumioRules ext) | — | — | 1u | Laag |
| Unit tests services | — | — | 6u | Laag |
| Integratietests | — | — | 3u | Middel |
| Regressietest (handmatig) | — | — | 3u | — |

### Deliverables

1. `Rules/Services/` map met 7 services + 7 interfaces
2. `Rules/Facts/` map met 6 facts-models
3. `Rules/Results/` map met 7 result-models (incl. PolicyResult<T>)
4. `RuleServiceExtensions.AddLumioRules()` extension method
5. Gerefactorde controllers (StatusController: 603 → ~150 regels)
6. Unit tests: ≥30 tests voor alle services
7. Integratietests: ≥5 end-to-end tests

### Acceptatiecriteria

- [x] StatusController bevat geen business logica meer (alleen data ophalen + service aanroepen)
- [x] ErfgenamenController bevat geen belasting-berekening meer
- [x] TestamentController bevat geen juridische checks meer
- [x] Alle services zijn unit-testbaar zonder database
- [x] PolicyResult bevat regelversie bij elke berekening
- [x] Alle API-responses zijn backward-compatible (geen breaking changes)
- [x] Performance: geen meetbare vertraging (<5ms overhead)

### Geschat effort: **48 uur** (~6 werkdagen)

### Dependencies op Sprint 1
- Options-modellen moeten beschikbaar zijn (services gebruiken IOptions<T>)
- `lumio-rules.json` structuur moet definitief zijn

---

## 7.4 Sprint 3 — Rule Engine Integratie (2 weken, OPTIONEEL)

### Doel
Microsoft RulesEngine integreren voor de evaluatie van meldingen en suggesties,
zodat deze volledig extern configureerbaar worden via JSON-workflows.

### Voorwaarde voor uitvoering
Sprint 3 wordt **alleen uitgevoerd** als:
1. De meldingen/suggesties **vaker wijzigen** dan nieuwe app-versies worden uitgebracht
2. Er behoefte is aan **niet-developer configuratie** van meldingsregels
3. Sprint 1+2 zijn succesvol afgerond en stabiel

### Scope

| Taak | Effort | Risico |
|------|--------|--------|
| NuGet-pakket toevoegen: `RulesEngine` | 0.5u | Laag |
| `lumio-workflows.json` schrijven | 3u | Middel |
| RuleEngineService implementeren | 3u | Middel |
| WorkflowLoader implementeren | 2u | Laag |
| MeldingService aanpassen → delegate naar engine | 3u | Middel |
| SuggestieService aanpassen → delegate naar engine | 2u | Middel |
| CompleetheidsService aanpassen → deels delegate | 3u | Middel |
| Fallback-mechanisme (engine faalt → domain service) | 2u | Middel |
| Unit tests engine | 3u | Laag |
| Integratietests met workflows | 3u | Middel |
| Performance-benchmark | 1u | Laag |
| Regressietest (handmatig) | 3u | — |

### Deliverables

1. `Rules/Engine/` map met RuleEngineService + WorkflowLoader
2. `rules/lumio-workflows.json` met MeldingenWorkflow + SuggestiesWorkflow
3. NuGet dependency: `Microsoft.RulesEngine` (>= 5.x)
4. Fallback: als engine faalt, valt terug op hardcoded service-logica
5. Unit tests: ≥10 tests voor engine + workflow evaluatie
6. Performance rapport: <5ms per workflow-evaluatie

### Acceptatiecriteria

- [x] Meldingen worden gegenereerd vanuit JSON-workflows
- [x] Suggesties worden gegenereerd vanuit JSON-workflows
- [x] Wijziging in workflow-JSON → direct ander resultaat (zonder rebuild)
- [x] App werkt als `lumio-workflows.json` ontbreekt (fallback naar services)
- [x] Performance: <5ms per workflow-evaluatie (gemeten)
- [x] Geen breaking changes in API-responses

### Geschat effort: **28 uur** (~3.5 werkdagen)

### Dependencies op Sprint 2
- MeldingService en SuggestieService moeten bestaan als domain services
- Facts-modellen moeten definitief zijn (engine evalueert dezelfde facts)

---

## 7.5 Sprint 4 — Afronding & Documentatie (1 week)

### Doel
Code opschonen, documentatie bijwerken, configuratie-validatie verstevigen.

### Scope

| Taak | Effort | Risico |
|------|--------|--------|
| Config-driven FluentValidation (optioneel) | 4u | Middel |
| lumio-rules.schema.json schrijven | 2u | Laag |
| Technische documentatie bijwerken | 3u | Laag |
| README + changelog bijwerken | 1u | Laag |
| Code-review & cleanup | 2u | Laag |
| Eindtest volledig | 3u | — |
| Fallback-tests (ontbrekende bestanden) | 2u | Laag |

### Deliverables

1. Optioneel: FluentValidation die veldlengtes leest uit IOptions
2. `rules/lumio-rules.schema.json` voor IDE-ondersteuning
3. Bijgewerkte technische en gebruikershandleiding
4. Alle oude TODO's en hardcoded constanten verwijderd
5. Clean code review afgerond

### Geschat effort: **17 uur** (~2 werkdagen)

---

## 7.6 Totaal-overzicht

| Sprint | Focus | Regels | Effort | Cumulatief |
|--------|-------|--------|--------|-----------|
| Sprint 1 | Config & Quick Wins | 57 (Score A) | 22u (~3d) | 30% regels extern |
| Sprint 2 | Domain Services | 48 (Score A2+B+C) | 48u (~6d) | 67% regels extern |
| Sprint 3 | Rule Engine (optioneel) | 33 (Score B) | 28u (~3.5d) | 72% regels extern |
| Sprint 4 | Afronding & Docs | — | 17u (~2d) | Final polish |
| **Totaal** | | **138 regels** | **115u (~14d)** | |
| **Zonder Sprint 3** | | **105 regels** | **87u (~11d)** | |

### Effort-verdeling

```
Sprint 1 ████████░░░░░░░░░░░░ 19%
Sprint 2 ████████████████████ 42%
Sprint 3 ███████████░░░░░░░░░ 24% (optioneel)
Sprint 4 ██████░░░░░░░░░░░░░░ 15%
```

---

## 7.7 Risicomanagement per sprint

### Sprint 1 — Laag risico
- **Risico:** JSON niet gevonden bij startup
- **Mitigatie:** Defaults in Options-klassen, startup-validatie
- **Go/no-go:** Alle bestaande tests slagen

### Sprint 2 — Middel risico
- **Risico:** Controller-refactoring introduceert regressie
- **Mitigatie:** Eén controller per keer refactoren, na elke controller volledig testen
- **Volgorde:** TestamentController → ErfgenamenController → StatusController (kleinst → grootst)
- **Go/no-go:** Elke controller apart goedkeuren voor merge

### Sprint 3 — Middel risico
- **Risico:** RulesEngine library werkt niet zoals verwacht
- **Mitigatie:** Eerst een proof-of-concept met 2-3 regels; bij problemen sprint cancelen
- **Go/no-go:** PoC binnen 4 uur succesvol → doorgaan; anders → cancelen

### Sprint 4 — Laag risico
- **Risico:** Geen significante risico's
- **Go/no-go:** Sprint 1+2 afgesloten en stabiel

---

## 7.8 Suggereerde ontwikkelvolgorde binnen sprints

### Sprint 1 — Dagplanning

| Dag | Activiteit |
|-----|-----------|
| Dag 1 | Projectstructuur + Options-modellen + JSON-bestand |
| Dag 2 | Controller-migraties (constanten → IOptions) + duplicaten verwijderen |
| Dag 3 | Unit tests + startup-validatie + regressietest |

### Sprint 2 — Dagplanning

| Dag | Activiteit |
|-----|-----------|
| Dag 1 | PolicyResult + Facts + Results modellen |
| Dag 2 | ErfbelastingService + NalatenschapService + LegitimairePortieService |
| Dag 3 | JuridischeCheckService + CompleetheidsService |
| Dag 4 | MeldingService + SuggestieService |
| Dag 5 | TestamentController refactoring + tests |
| Dag 6 | ErfgenamenController + StatusController refactoring + tests |

### Sprint 3 — Dagplanning (indien uitgevoerd)

| Dag | Activiteit |
|-----|-----------|
| Dag 1 | NuGet + RuleEngineService + PoC (2-3 regels) → **Go/no-go besluit** |
| Dag 2 | lumio-workflows.json voltooien + MeldingService aanpassen |
| Dag 3 | SuggestieService + CompleetheidsService aanpassen + fallback |
| Dag 3.5 | Tests + performance-benchmark |

---

## 7.9 Kwaliteitspoorten (gates)

Elke sprint wordt afgesloten met een kwaliteitspoort:

| Gate | Criterium | Sprint |
|------|----------|--------|
| G1 | Alle unit tests slagen (≥95% coverage op Rules/) | 1,2,3,4 |
| G2 | Geen regressie in bestaande API-endpoints | 1,2,3 |
| G3 | App start zonder extern configbestand (fallback) | 1,3 |
| G4 | App start met corrupt configbestand (graceful error) | 1,3 |
| G5 | Performance: geen endpoint duurt >100ms langer | 2,3 |
| G6 | PolicyResult.RegelVersie is gevuld bij alle business responses | 2 |
| G7 | Code review door tweede persoon | 2 |

---

## 7.10 Afhankelijkheden en randvoorwaarden

### Technische afhankelijkheden

```
Sprint 1 ─┐
           ├──► Sprint 2 ──► Sprint 3 ──► Sprint 4
           │                    ↑
           │                    │ (PoC go/no-go)
           └────────────────────┘
```

### Nieuwe NuGet-pakketten

| Pakket | Sprint | Versie | Licentie |
|--------|--------|--------|----------|
| `Microsoft.Extensions.Options` | 1 | Reeds aanwezig | MIT |
| `Microsoft.Extensions.Options.ConfigurationExtensions` | 1 | Reeds aanwezig | MIT |
| `RulesEngine` | 3 | ≥ 5.0.3 | MIT |

### Bestandssysteem-wijzigingen

| Wijziging | Sprint |
|-----------|--------|
| `rules/` directory aanmaken in build-output | 1 |
| `lumio-rules.json` meekopiëren in publish | 1 |
| `lumio-workflows.json` meekopiëren in publish | 3 |
| Electron build-config aanpassen voor rules/ | 1 |

---

## 7.11 Wat als we stoppen na Sprint 2?

Als sprint 3 (Rule Engine) niet wordt uitgevoerd, is het resultaat:

| Aspect | Status na Sprint 2 |
|--------|-------------------|
| Constanten configureerbaar | ✅ Volledig |
| Business logica testbaar | ✅ Volledig |
| Code-duplicaten verwijderd | ✅ Volledig |
| Controllers "dun" | ✅ Volledig |
| PolicyResult met versie | ✅ Volledig |
| Meldingen extern configureerbaar | ❌ Nee (maar wel in service) |
| Suggesties extern configureerbaar | ❌ Nee (maar wel in service) |
| **Percentage voordelen behaald** | **~85%** |

> **Conclusie:** Sprint 1+2 leveren het overgrote deel van de voordelen.
> Sprint 3 is een "nice-to-have" voor toekomstige flexibiliteit.
