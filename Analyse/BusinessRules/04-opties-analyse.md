# 4. Opties-analyse — Business Rules Externalisering

> **Doel:** de drie relevante opties (1: Configuratie-gedreven, 2: Database/metadata-gedreven,
> 3: Rule Engine library) diepgaand evalueren in de specifieke context van Lumio:
> een offline-first, USB-portable, versleutelde desktop-applicatie.
>
> Opties 4 (Workflow/BPM) en 5 (Externe Business Rules Service) zijn door de opdrachtgever
> reeds uitgesloten — optie 4 is overkill voor Lumio's beslislogica, optie 5 is incompatibel
> met het offline-first uitgangspunt.

---

## 4.1 Beoordelingscriteria

Elke optie wordt beoordeeld op criteria die specifiek relevant zijn voor Lumio:

| Criterium | Gewicht | Toelichting |
|-----------|---------|-------------|
| **Offline-compatibiliteit** | Kritisch | Moet 100% offline werken (USB-stick, geen internet) |
| **Complexiteit implementatie** | Hoog | Klein team, beperkt budget; pragmatisme boven perfectie |
| **Testbaarheid** | Hoog | Business rules moeten unit-testbaar zijn |
| **Onderhoudbaarheid** | Hoog | Regels moeten aanpasbaar zijn zonder grote refactoring |
| **Wijzigbaarheid zonder rebuild** | Middel | Wenselijk maar niet kritisch bij jaarlijkse updates |
| **Leercurve** | Middel | .NET-team moet het snel kunnen oppakken |
| **Performance** | Laag | Lokale app, geen concurrency, <100ms response is ruim voldoende |
| **Auditbaarheid** | Laag-Middel | Wenselijk voor juridische traceerbaarheid |

---

## 4.2 Optie 1: Configuratie-gedreven regels

### Concept

Bedrijfsregels die bestaan uit **waarden, drempels, en parameters** worden
verplaatst naar een configuratiebestand (`appsettings.json`, `rules.json`,
of een aparte SQLite rules-tabel) en geladen via `IOptions<T>`.

### Geschikt voor (Lumio-specifiek)

| Regelgroep | BR-ID's | Voorbeeld |
|-----------|---------|-----------|
| Drempelwaarden | BR-001, BR-017, BR-033, BR-101, BR-110 | Max profielen=5, min wachtwoord=8 |
| Erfbelasting tarieven | BR-042–045 | Vrijstellingen, tarieven, schijfgrens |
| Timing-drempels | BR-189, BR-190 | Backup=30 dagen, actualisatie=90 dagen |
| Encryptie-parameters | BR-177–183 | PBKDF2 iteraties, salt-lengte |
| UI/export constanten | BR-157, BR-162, BR-165 | Min zoekterm, NUV namespace, CSV separator |
| Veldlengtes | BR-026–031, BR-036–038 | Max naam=100, max postcode=10 |

### Voorbeeld implementatie

**`rules/lumio-rules.json`** (meegeleverd op USB):
```json
{
  "versie": "2025.1",
  "geldigVanaf": "2025-01-01",
  "limieten": {
    "maxProfielen": 5,
    "minWachtwoordLengte": 8,
    "maxDocumentUploadMB": 50,
    "maxProfielFotoMB": 10,
    "shamirMinDrempel": 2,
    "minZoektermLengte": 2,
    "auditLogDefaultLimiet": 200,
    "backupWaarschuwingDagen": 30,
    "actualisatieIntervalDagen": 90,
    "documentVerlooWaarschuwingDagen": 30
  },
  "erfbelasting": {
    "jaar": 2025,
    "schijfGrens": 154197,
    "groepen": {
      "partner":    { "vrijstelling": 795156, "tarief1": 0.10, "tarief2": 0.20 },
      "kind":       { "vrijstelling": 25187,  "tarief1": 0.10, "tarief2": 0.20 },
      "kleinkind":  { "vrijstelling": 25187,  "tarief1": 0.18, "tarief2": 0.36 },
      "ouder":      { "vrijstelling": 56724,  "tarief1": 0.10, "tarief2": 0.20 },
      "overig":     { "vrijstelling": 2658,   "tarief1": 0.30, "tarief2": 0.40 }
    },
    "relatieMapping": {
      "partner": ["partner", "echtgenoot", "echtgenote"],
      "kind": ["kind", "zoon", "dochter", "stiefkind", "stiefzoon", "stiefdochter"],
      "kleinkind": ["kleinkind"],
      "ouder": ["ouder", "vader", "moeder"],
      "overig": []
    }
  },
  "veldLengtes": {
    "maxNaamLengte": 100,
    "maxTussenvoegselLengte": 20,
    "maxPostcodeLengte": 10
  },
  "validatie": {
    "ibanRegex": "^[A-Z]{2}\\d{2}[A-Z0-9]{4,30}$",
    "toegestaneProfielRelaties": ["Partner", "Kind", "Ouder", "Overig"],
    "geldige ImageContentTypes": ["image/jpeg", "image/png", "image/gif", "image/webp"]
  },
  "encryptie": {
    "pbkdf2Iteraties": 100000,
    "saltLengte": 32,
    "nonceLengte": 12,
    "tagLengte": 16
  }
}
```

**C#-binding:**
```csharp
public class LumioRulesOptions
{
    public string Versie { get; set; } = "2025.1";
    public LimietenOptions Limieten { get; set; } = new();
    public ErfbelastingOptions Erfbelasting { get; set; } = new();
    public VeldLengtesOptions VeldLengtes { get; set; } = new();
    public ValidatieOptions Validatie { get; set; } = new();
    public EncryptieOptions Encryptie { get; set; } = new();
}

// Registratie in Program.cs:
builder.Services.Configure<LumioRulesOptions>(
    builder.Configuration.GetSection("LumioRules"));
```

### Beoordeling Optie 1

| Criterium | Score | Toelichting |
|-----------|-------|-------------|
| Offline-compatibiliteit | ⭐⭐⭐⭐⭐ | JSON/config op USB — perfect |
| Complexiteit implementatie | ⭐⭐⭐⭐⭐ | `IOptions<T>` is standaard .NET, minimale effort |
| Testbaarheid | ⭐⭐⭐⭐ | Options kunnen in tests worden ge-mocked |
| Onderhoudbaarheid | ⭐⭐⭐⭐ | Duidelijk, transparant, bekende patronen |
| Wijzigbaarheid zonder rebuild | ⭐⭐⭐⭐ | JSON-bestand aanpassen = geen code-wijziging |
| Leercurve | ⭐⭐⭐⭐⭐ | Elke .NET-developer kent Options pattern |
| Performance | ⭐⭐⭐⭐⭐ | In-memory na laden, verwaarloosbaar |
| Auditbaarheid | ⭐⭐⭐ | Versie in bestand; geen automatisch audit trail |

### Beperkingen

- **Geen beslislogica:** je kunt met JSON niet zeggen "als codicil EN onroerend goed → waarschuwing"
- **Geen cross-entity evaluatie:** suggesties, meldingen, juridische checks zijn *logica*, niet *parameters*
- **Scope:** alleen geschikt voor Score-A regels (~57 van 190)

---

## 4.3 Optie 2: Database/metadata-gedreven regels

### Concept

Business rules worden opgeslagen als **evalueerbare records** in een database
(of SQLite op USB). Een eigen evaluator interpreteert deze regels runtime.

### Geschikt voor (Lumio-specifiek)

| Regelgroep | BR-ID's | Voorbeeld |
|-----------|---------|-----------|
| Meldingen | BR-133–148 | "Als geen testament → toon info-melding" |
| Suggesties | BR-149–155 | "Als erfgenaam niet noodcontact → suggestie" |
| Compleetheid | BR-120–132 | "Eigenaar is compleet als Voornaam + Achternaam + ... ingevuld" |

### Voorbeeld schema

```sql
CREATE TABLE RuleSet (
    Id          TEXT PRIMARY KEY,
    Naam        TEXT NOT NULL,
    Versie      TEXT NOT NULL,
    GeldigVanaf TEXT,
    GeldigTot   TEXT,
    IsActief    INTEGER DEFAULT 1
);

CREATE TABLE Rule (
    Id          TEXT PRIMARY KEY,
    RuleSetId   TEXT REFERENCES RuleSet(Id),
    Naam        TEXT NOT NULL,
    Prioriteit  INTEGER DEFAULT 0,
    Type        TEXT NOT NULL,  -- 'melding', 'suggestie', 'compleetheid'
    Conditie    TEXT NOT NULL,  -- JSON expression
    Actie       TEXT NOT NULL,  -- JSON action definition
    IsActief    INTEGER DEFAULT 1
);
```

**Voorbeeld rule-data:**
```json
{
  "id": "melding-geen-testament",
  "type": "melding",
  "conditie": {
    "operator": "niet_bestaat",
    "entiteit": "TestamentInfo"
  },
  "actie": {
    "type": "info",
    "melding": "Overweeg uw testament vast te leggen",
    "domein": "testament"
  }
}
```

### Evaluator (mini rule-engine)

```csharp
public class RuleEvaluator
{
    public async Task<List<RuleResultaat>> Evalueer(
        RuleSet ruleSet,
        Dictionary<string, object> facts)
    {
        var resultaten = new List<RuleResultaat>();
        foreach (var rule in ruleSet.Rules.OrderBy(r => r.Prioriteit))
        {
            if (EvalueerConditie(rule.Conditie, facts))
                resultaten.Add(VoerActieUit(rule.Actie, facts));
        }
        return resultaten;
    }
}
```

### Beoordeling Optie 2

| Criterium | Score | Toelichting |
|-----------|-------|-------------|
| Offline-compatibiliteit | ⭐⭐⭐⭐⭐ | SQLite op USB — perfect |
| Complexiteit implementatie | ⭐⭐⭐ | Je bouwt een mini-engine; niet triviaal |
| Testbaarheid | ⭐⭐⭐⭐ | Rules als data = gemakkelijk variaties testen |
| Onderhoudbaarheid | ⭐⭐⭐ | Onderhoud van eigen engine + rule-data |
| Wijzigbaarheid zonder rebuild | ⭐⭐⭐⭐⭐ | Rules in DB/file = 0 code-wijziging |
| Leercurve | ⭐⭐⭐ | Eigen DSL/expression format leren |
| Performance | ⭐⭐⭐⭐ | Afhankelijk van evaluator-optimalisatie |
| Auditbaarheid | ⭐⭐⭐⭐⭐ | Versies + geldigheidsperioden + audit trail |

### Beperkingen

- **DIY-effort:** je bouwt in feite een mini-rule-engine; je hebt dit onderhoud
- **Expression-taal:** moet je zelf ontwerpen of een beperkte subset gebruiken
- **Complexe regels:** de juridische check met 6 sub-condities over 6 entiteiten is moeilijk als metadata uit te drukken
- **Validatie van rules:** wie controleert dat de rule-data geldig is?

---

## 4.4 Optie 3: Rule Engine Library

### Concept

Een bestaande, bewezen rule-engine library interpreteert extern gedefinieerde
regels. De twee voornaamste opties voor .NET:

### 4.4.1 Microsoft RulesEngine

- **GitHub:** github.com/microsoft/RulesEngine
- **Type:** Expression-based (Lambda expressions in JSON)
- **Licentie:** MIT
- **NuGet:** `RulesEngine` (~500K downloads)

**Kenmerken:**
- Regels als JSON-workfiles met C#-achtige expressions
- Ingebouwde support voor nested rules, scoped parameters, custom actions
- Workflow-concept met meerdere rule-sets

**Voorbeeld regel (Lumio-specifiek):**
```json
{
  "WorkflowName": "MeldingenCheck",
  "Rules": [
    {
      "RuleName": "GeenTestament",
      "Expression": "heeftTestament == false",
      "SuccessEvent": "info:Overweeg uw testament vast te leggen",
      "RuleExpressionType": "LambdaExpression"
    },
    {
      "RuleName": "BackupVerouderd",
      "Expression": "laatsteBackupDagen > backupDrempel",
      "SuccessEvent": "waarschuwing:Er is al meer dan {backupDrempel} dagen geen backup gemaakt",
      "RuleExpressionType": "LambdaExpression"
    },
    {
      "RuleName": "CodicilOnroerendGoed",
      "Expression": "testamentType.Contains(\"codicil\") && heeftOnroerendGoed == true",
      "SuccessEvent": "waarschuwing:Een codicil is niet geldig voor onroerend goed (BW 4:97)",
      "RuleExpressionType": "LambdaExpression"
    }
  ]
}
```

**C#-integratie:**
```csharp
var rulesEngine = new RulesEngine.RulesEngine(workflows);

var facts = new RuleParameter("input", new {
    heeftTestament = false,
    laatsteBackupDagen = 45,
    backupDrempel = 30,
    testamentType = "codicil",
    heeftOnroerendGoed = true
});

var results = await rulesEngine.ExecuteAllRulesAsync("MeldingenCheck", facts);
```

### 4.4.2 NRules

- **GitHub:** github.com/NRules/NRules
- **Type:** Rete-algoritme (production rules)
- **Licentie:** MIT
- **NuGet:** `NRules` (~300K downloads)

**Kenmerken:**
- Regels als C#-klassen (niet JSON-extern)
- Rete-algoritme voor efficiënte evaluatie bij veel regels
- Forward-chaining: regels kunnen andere regels triggeren

**Voorbeeld regel:**
```csharp
public class GeenTestamentRule : Rule
{
    public override void Define()
    {
        LumioFacts facts = null;
        When()
            .Match(() => facts, f => !f.HeeftTestament);
        Then()
            .Do(ctx => ctx.Insert(new Melding("info", "Overweeg uw testament vast te leggen")));
    }
}
```

### Vergelijking MS RulesEngine vs NRules

| Aspect | Microsoft RulesEngine | NRules |
|--------|----------------------|--------|
| Regels extern (JSON) | ✅ Ja — core feature | ❌ Nee — C#-klassen |
| Offline-first | ✅ JSON op USB | ✅ Maar niet extern configureerbaar |
| Wijzigbaar zonder rebuild | ✅ Ja | ❌ Nee (code-compilatie) |
| Forward chaining | ❌ Nee | ✅ Ja |
| Complexiteit | Middel | Hoog |
| Leercurve | Middel (JSON expressions) | Hoog (Rete-concept) |
| Community / ondersteuning | Microsoft-backed, actief | Kleiner, minder actief |
| Geschikt voor Lumio | ✅ **Ja** | ❌ Nee (overkill, niet extern) |

### Beoordeling Optie 3 (Microsoft RulesEngine)

| Criterium | Score | Toelichting |
|-----------|-------|-------------|
| Offline-compatibiliteit | ⭐⭐⭐⭐⭐ | JSON-workflows op USB |
| Complexiteit implementatie | ⭐⭐⭐ | "Facts" model bouwen en rules migreren |
| Testbaarheid | ⭐⭐⭐⭐⭐ | Engine + rules als data = perfect testbaar |
| Onderhoudbaarheid | ⭐⭐⭐⭐ | Bewezen library, geen eigen DSL |
| Wijzigbaarheid zonder rebuild | ⭐⭐⭐⭐⭐ | JSON-workflows updaten = geen code |
| Leercurve | ⭐⭐⭐ | Expression-syntax + facts-model leren |
| Performance | ⭐⭐⭐⭐ | Expression compilatie; voor Lumio ruim voldoende |
| Auditbaarheid | ⭐⭐⭐⭐ | Rule-versies + resultaat-logging ingebouwd |

### Beperkingen

- **Expression sandboxing:** bij user-managed rules moet je expressions valideren
- **Geen cross-entity joins:** de engine evalueert één "facts"-object; je moet data vooraf aggregeren
- **Leercurve:** expression-syntax kan cryptisch zijn voor niet-developers
- **Overkill voor simpele parameters:** voor "max profielen = 5" is een rule engine overbodig

---

## 4.5 Vergelijkingstabel

| Criterium | Optie 1: Config | Optie 2: DB-driven | Optie 3: MS RulesEngine |
|-----------|:-:|:-:|:-:|
| Offline-compatibiliteit | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Complexiteit implementatie | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| Testbaarheid | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Onderhoudbaarheid | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| Wijzigbaarheid zonder rebuild | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Leercurve | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| Performance | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Auditbaarheid | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Geschikt voor hoeveel regels** | **~57 (30%)** | **~70 (37%)** | **~70 (37%)** |
| **Niet geschikt voor** | Beslislogica | Complexe cross-entity | Simpele parameters |

---

## 4.6 Optie 2 vs. Optie 3 — Nadere vergelijking

Aangezien optie 2 en 3 dezelfde regelgroep adresseren, is de kernvraag:

> **Bouw je je eigen evaluator (optie 2) of gebruik je Microsoft RulesEngine (optie 3)?**

| Factor | Eigen evaluator (2) | MS RulesEngine (3) |
|--------|:-------------------:|:-------------------:|
| Controle over DSL | ✅ Volledig | 🟡 Beperkt tot C# expression syntax |
| Onderhoudslast | ❌ Hoog (bug-fixes, edge cases) | ✅ Community-maintained |
| Tijd tot productie | ❌ Weken (ontwerpen, bouwen, testen) | ✅ Dagen (NuGet + JSON configureren) |
| Maturiteit | ❌ Nieuw, onbewezen | ✅ Microsoft-backed, 6+ jaar |
| Security (expression injection) | ✅ Zelf beheersbaar | 🟡 Expression evaluation = risico bij user-input |
| Team-kennis | ✅ Eigen code = eigen kennis | 🟡 Externe library-kennis nodig |

**Voor Lumio:** regels worden uitsluitend door **ontwikkelaars** beheerd, niet door
eindgebruikers. Daarmee vervalt het security-risico van expression injection.
De maturiteits- en tijdswinst van optie 3 weegt zwaarder dan de controle van optie 2.

---

## 4.7 Conclusie opties-analyse

### Geen van de drie opties is alleen voldoende

De 190 business rules van Lumio verdelen zich over **drie categorieën**
die elk een andere optie vereisen:

| Categorie | Aantal | Beste optie |
|-----------|--------|-------------|
| Parameters en drempelwaarden | 57 | **Optie 1** — Configuratie (JSON + IOptions) |
| Beslislogica en evaluaties | ~70 | **Optie 3** — Microsoft RulesEngine (JSON workflows) |
| Infrastructurele/security regels | ~32 | **Geen** — laten in huidige laag |
| Veldvalidatie | ~30 | **Optie 1** — config-driven FluentValidation |

### Aanbeveling: Hybride aanpak (Optie 1 + 3)

De optimale strategie is een **gelaagd model**:

```
┌─────────────────────────────────────────────────────────┐
│  Laag 1: Configuratie (Optie 1)                         │
│  — lumio-rules.json (parameters, drempels, tarieven)    │
│  — IOptions<LumioRulesOptions>                          │
│  — FluentValidation met config-waarden                  │
├─────────────────────────────────────────────────────────┤
│  Laag 2: Rule Engine (Optie 3)                          │
│  — lumio-workflows.json (meldingen, suggesties, checks) │
│  — Microsoft RulesEngine                                │
│  — Facts-model als interface tussen data en regels       │
├─────────────────────────────────────────────────────────┤
│  Laag 3: Pure Domain Services                           │
│  — BelastingService, NalatenschapService                │
│  — Unit-testbare berekeningen                           │
│  — Lezen configuratie uit Laag 1                        │
├─────────────────────────────────────────────────────────┤
│  Laag 4: Infrastructure (niet geëxternaliseerd)         │
│  — Encryptie, Middleware, DB-operaties                   │
│  — Structureel verbeterd (geen business rules inline)   │
└─────────────────────────────────────────────────────────┘
```

Dit hybride model wordt in **05-aanbeveling.md** uitgewerkt tot een concrete
architectuur en in **07-implementatieplan.md** gefaseerd over meerdere sprints.
