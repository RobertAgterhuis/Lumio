# 5. Aanbeveling — Hybride Architectuur

> **Doel:** een concrete, pragmatische aanbeveling voor de externalisering van
> business rules in Lumio, gebaseerd op de analyse uit de voorgaande hoofdstukken.

---

## 5.1 Gekozen strategie: Hybride (Config + Domain Services + Rule Engine)

Na evaluatie van alle opties is de aanbeveling een **drielaags hybride model**
dat de sterktes van elke optie combineert:

```
    ┌─────────────────────────────────────────────────┐
    │         Configuratie (lumio-rules.json)          │
    │                                                 │
    │  • Drempels, limieten, tarieven                 │
    │  • Veldlengtes, regex-patronen                  │
    │  • Timing-parameters                            │
    │  • Versie-informatie                             │
    │                                                 │
    │  Scope: 57 regels (Score A)                     │
    │  Technologie: IOptions<T> + JSON                │
    ├─────────────────────────────────────────────────┤
    │        Domain Services (C# klassen)             │
    │                                                 │
    │  • BelastingService (erfbelasting)               │
    │  • NalatenschapService (netto berekening)        │
    │  • CompleetheidsService (scoring)                │
    │  • JuridischeCheckService (testament checks)     │
    │  • LegitimairePortieService                      │
    │                                                 │
    │  Scope: 48 regels (Score A2 + B + C)            │
    │  Technologie: Pure C# services + DI             │
    ├─────────────────────────────────────────────────┤
    │     Rule Engine (lumio-workflows.json)           │  ← Optioneel (Fase 3)
    │                                                 │
    │  • Meldingsregels (16 regels)                    │
    │  • Suggestieregels (7 regels)                    │
    │  • Compleetheid-definities (10 domeinen)         │
    │                                                 │
    │  Scope: ~33 regels (Score B)                    │
    │  Technologie: Microsoft RulesEngine + JSON      │
    └─────────────────────────────────────────────────┘
```

---

## 5.2 Waarom deze keuze

### A. Pragmatisch over dogmatisch

Lumio is een **klein product met een klein team**. De oplossing moet:
- Snel te implementeren zijn (weken, niet maanden)
- Geen grote leercurve introduceren
- De bestaande code niet fundamenteel herschrijven
- Incrementeel leverbaar zijn (sprint voor sprint)

Een volledige migratie naar een rule engine (optie 3 alleen) zou **overkill** zijn
voor de 57 simpele parameter-regels. Omgekeerd is pure configuratie (optie 1 alleen)
**onvoldoende** voor de 33 beslislogica-regels.

### B. Offline-first compatibel

Alle drie de lagen werken 100% offline:
- **Config:** JSON-bestand op USB
- **Services:** C#-code in de applicatie
- **Rule Engine:** JSON-workflows op USB, geen netwerk nodig

### C. Faseerbaarheid

Het model kan **sprint voor sprint** worden ingevoerd:
1. **Sprint 1:** Configuratie-laag (quick wins, hoge ROI)
2. **Sprint 2:** Domain services (refactoring, testbaarheid)
3. **Sprint 3:** Rule engine (indien gewenst, optioneel)

Als na sprint 2 de situatie voldoende is, kan sprint 3 worden uitgesteld.

---

## 5.3 Gekozen aanpak per regelgroep

### Laag 1: Configuratie (57 regels)

| Regelgroep | BR-ID's | Config-sectie | Prioriteit |
|-----------|---------|---------------|-----------|
| Erfbelasting tarieven | BR-042–045 | `erfbelasting` | 🔴 Hoog (jaarlijks!) |
| Applicatie-limieten | BR-001,017,033,101,110,157 | `limieten` | 🟡 Middel |
| Timing-drempels | BR-189,190 | `limieten` | 🟡 Middel |
| Veldlengtes | BR-026–031,036–038 | `veldLengtes` | 🟢 Laag |
| Validatie-patronen | BR-084,019 | `validatie` | 🟢 Laag |
| Encryptie-parameters | BR-177–183 | `encryptie` | 🟢 Laag |
| Export-constanten | BR-162,165 | `export` | 🟢 Laag |
| Compleetheid-veldaantallen | BR-123–132 | `compleetheid` | 🟡 Middel |
| Relatie-mapping | BR-041,052 | `erfbelasting.relatieMapping` | 🔴 Hoog |

### Laag 2: Domain Services (48 regels → 6 services)

| Service | Verantwoordelijkheid | BR-ID's | Regels code |
|---------|---------------------|---------|-------------|
| `ErfbelastingService` | Tariefgroep + berekening | BR-041,046,047 | ~40 |
| `NalatenschapService` | Netto nalatenschap (gecentraliseerd) | BR-048,049,095,096 | ~15 |
| `CompleetheidsService` | Domein- en veld-scoring | BR-120–122 | ~80 |
| `JuridischeCheckService` | Testament checks | BR-054–060 | ~80 |
| `LegitimairePortieService` | Portie berekening | BR-050–053 | ~30 |
| `MeldingService` | Meldingen evaluatie | BR-133–148 | ~50 |
| `SuggestieService` | Cross-entity suggesties | BR-149–155 | ~40 |

**Totaal:** ~335 regels business-logica in 7 testbare services.

### Laag 3: Rule Engine (optioneel, 33 regels)

| Workflow | Regels | Huidige locatie |
|----------|-------|-----------------|
| `MeldingenWorkflow` | 16 | StatusController.GetMeldingen() |
| `SuggestiesWorkflow` | 7 | StatusController.GetSuggesties() |
| `CompleetDefinities` | 10 | StatusController.GetCompleetheid() |

> **Opmerking:** Laag 3 is pas relevant als de regels **vaker wijzigen dan de code**.
> Voor Lumio is dit op korte termijn onwaarschijnlijk — de meldingen en suggesties
> zijn redelijk stabiel. Daarom is Laag 3 **optioneel** en alleen aanbevolen
> als de business dit actief vraagt.

---

## 5.4 Wat NIET externaliseren

De volgende 62 regels blijven in de huidige laag:

| Categorie | Regels | Waarom niet externaliseren |
|-----------|--------|---------------------------|
| Veldvalidatie (FluentValidation) | 30 | Werkt goed, consistente patronen; evt. config-driven |
| Middleware toegangscontrole | 6 | HTTP-pipeline specifiek, geen standalone logica |
| Database/EF regels | 7 | `SaveChangesAsync` override, cascade deletes |
| Encryptie-logica | 7 | Security-primitieven, niet doorsnee business rules |
| Singleton/existentie checks | 12 | Simpele guards, overhead van externalisering > waarde |

---

## 5.5 Ontwerpprincipes

### Principe 1: "Policy-aware, not policy-embedded"

Controllers definiëren **wat** nodig is, niet **hoe** het berekend wordt:

```csharp
// ❌ Nu (policy-embedded)
var vrijstelling = relatie switch
{
    "partner" => 795156m,
    "kind" => 25187m,
    // ... 15 regels hardcoded logica
};

// ✅ Straks (policy-aware)  
var resultaat = _erfbelastingService.BerekenBelasting(erfdeel, relatie);
```

### Principe 2: "Facts in, decisions out"

Services ontvangen een **facts-object** en retourneren een **beslisresultaat**:

```csharp
public record ErfbelastingFacts(
    decimal NettoNalatenschap,
    int AantalErfgenamen,
    List<ErfgenaamFact> Erfgenamen);

public record ErfbelastingResultaat(
    List<ErfgenaamBelasting> PerErfgenaam,
    decimal TotaalBelasting,
    string Disclaimer,
    string GebruikteRegelVersie);
```

### Principe 3: "Configuratie als eersteklas burger"

Configuratie wordt **versioned**, **gesigneerd** (optioneel), en **gevalideerd**:

```
USB-stick/
├── data/
│   └── (databases per profiel)
├── rules/
│   ├── lumio-rules.json          ← versie 2025.1
│   ├── lumio-rules.json.sha256   ← optionele hash
│   └── lumio-workflows.json      ← (optioneel, laag 3)
└── frontend/
    └── ...
```

### Principe 4: "Wijzigingen traceerbaar"

Elke berekening logt welke regelversie is gebruikt:

```csharp
public record PolicyResult<T>
{
    public T Resultaat { get; init; }
    public string RegelVersie { get; init; }     // "2025.1"
    public DateTime BerekendOp { get; init; }
    public List<string> Waarschuwingen { get; init; }
}
```

---

## 5.6 Verwachte voordelen

| Voordeel | Impact |
|----------|--------|
| **Erfbelasting jaarlijks wijzigbaar zonder code** | Bespaart ~4 uur per jaar + risicoverlaging |
| **Netto nalatenschap 1× geïmplementeerd** | Elimineert 3 duplicaten, voorkomt fouten |
| **StatusController van 600 → ~100 regels** | Onderhoudbaarheid ↑↑ |
| **~335 regels unit-testbaar** | Vertrouwen in correctheid ↑ |
| **Regelversie in audit trail** | Juridische traceerbaarheid |
| **Validators config-driven** | Flexibiliteit bij wijzigingen |

### Verwachte afname coderegels per controller

| Controller | Nu | Na refactoring | Reductie |
|------------|:--:|:--------------:|:--------:|
| StatusController | 603 | ~150 | −75% |
| TestamentController | 310 | ~130 | −58% |
| ErfgenamenController | 159 | ~50 | −69% |
| BoedelController | 203 | ~160 | −21% |
| AuthController | 164 | ~120 | −27% |

---

## 5.7 Risico's en mitigatie

| Risico | Waarschijnlijkheid | Impact | Mitigatie |
|--------|-------------------|--------|-----------|
| Configuratiebestand corrupt/ontbreekt | Laag | Hoog | Fallback naar hardcoded defaults |
| Rule engine library abandonware | Laag | Middel | MS RulesEngine is actief onderhouden; alternatief: eigen evaluator |
| Over-engineering | Middel | Middel | Fasering: stop na sprint 2 als het genoeg is |
| Performance impact rule engine | Zeer laag | Laag | Lumio is single-user, <5ms overhead acceptabel |
| Team-weerstand (nieuw patroon) | Middel | Laag | Incrementele introductie, goede documentatie |
| Inconsistentie config vs code | Laag | Middel | Startupvalidatie + unit tests op config-binding |

### Fallback-strategie

Als Microsoft RulesEngine onverhoopt niet voldoet (laag 3), is het alternatief:
- **Meldingen en suggesties** als domain services (laag 2) implementeren
- Dit is slechts ~50 regels extra C#-code
- Besluit uitstellen tot sprint 3 gestart wordt

---

## 5.8 Scope-afbakening

### In scope

- Alle 190 geïnventariseerde business rules
- Configuratie-bestandsstructuur
- Domain services met interfaces
- Unit tests voor geëxtraheerde logica
- Migratie van hardcoded constanten
- Verwijderen van code-duplicaten

### Buiten scope

- Meertaligheid (i18n) — apart project
- Frontend-side validatie — apart project
- UI voor rules-beheer — niet nodig (developer-only)
- Online rule-distributie — niet relevant (offline-first)
- Backward-compatibiliteit met bestaande databases — geen impact (rules raken niet het DB-schema)

---

## 5.9 Samenvattende beslismatrix

| Vraag | Antwoord |
|-------|----------|
| Hoeveel regels externaliseren? | **128 van 190 (67%)** |
| Welke aanpak voor parameters? | **Optie 1 — JSON + IOptions** |
| Welke aanpak voor business logica? | **Domain Services (C# + DI)** |
| Welke aanpak voor meldingen/suggesties? | **Domain Services (sprint 2) + evt. Rule Engine (sprint 3)** |
| Welke aanpak voor infra/security? | **Laten in huidige laag** |
| Hoeveel sprints? | **3 sprints (sprint 3 optioneel)** |
| Wat als we na sprint 2 stoppen? | **85% van de voordelen behaald, 100% bruikbaar** |
