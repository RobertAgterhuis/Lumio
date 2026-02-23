# 6. Referentie-architectuur

> **Doel:** een concrete, implementeerbare architectuurblauwdruk voor de
> externalisering van business rules in Lumio, inclusief projectstructuur,
> interfaces, en codevoorbeelden.

---

## 6.1 Projectstructuur

```
Lumio.Api/
├── appsettings.json                     ← bestaand
├── appsettings.Development.json         ← bestaand
├── Program.cs                           ← DI-registratie uitbreiden
├── Controllers/
│   ├── StatusController.cs              ← wordt "dun" (delegate naar services)
│   ├── ErfgenamenController.cs          ← idem
│   └── ...
├── Domain/                              ← bestaand, ongewijzigd
├── Rules/                               ← NIEUW: alle geëxternaliseerde logica
│   ├── Configuration/
│   │   ├── LumioRulesOptions.cs         ← Root IOptions-model
│   │   ├── ErfbelastingOptions.cs
│   │   ├── LimietenOptions.cs
│   │   ├── VeldLengtesOptions.cs
│   │   ├── ValidatieOptions.cs
│   │   ├── EncryptieOptions.cs
│   │   ├── ExportOptions.cs
│   │   └── CompleetheidsOptions.cs
│   ├── Services/
│   │   ├── IErfbelastingService.cs
│   │   ├── ErfbelastingService.cs
│   │   ├── INalatenschapService.cs
│   │   ├── NalatenschapService.cs
│   │   ├── ICompleetheidsService.cs
│   │   ├── CompleetheidsService.cs
│   │   ├── IJuridischeCheckService.cs
│   │   ├── JuridischeCheckService.cs
│   │   ├── ILegitimairePortieService.cs
│   │   ├── LegitimairePortieService.cs
│   │   ├── IMeldingService.cs
│   │   ├── MeldingService.cs
│   │   ├── ISuggestieService.cs
│   │   └── SuggestieService.cs
│   ├── Facts/
│   │   ├── ErfbelastingFacts.cs
│   │   ├── NalatenschapFacts.cs
│   │   ├── CompleetFacts.cs
│   │   ├── JuridischeFacts.cs
│   │   ├── MeldingFacts.cs
│   │   └── SuggestieFacts.cs
│   ├── Results/
│   │   ├── PolicyResult.cs              ← generiek wrapper
│   │   ├── ErfbelastingResultaat.cs
│   │   ├── NalatenschapResultaat.cs
│   │   ├── CompleetheidsResultaat.cs
│   │   ├── JuridischeCheckResultaat.cs
│   │   ├── MeldingResultaat.cs
│   │   └── SuggestieResultaat.cs
│   └── Engine/                          ← optioneel (sprint 3)
│       ├── RuleEngineService.cs
│       └── WorkflowLoader.cs
├── Validators/                          ← bestaand, config-aware maken
└── Data/                                ← bestaand, ongewijzigd

rules/                                   ← NIEUW: extern configuratiebestand
├── lumio-rules.json                     ← alle configureerbare parameters
├── lumio-rules.schema.json              ← JSON Schema voor validatie (optioneel)
└── lumio-workflows.json                 ← MS RulesEngine workflows (sprint 3)
```

---

## 6.2 Configuratie-laag (Laag 1)

### 6.2.1 lumio-rules.json

```json
{
  "$schema": "./lumio-rules.schema.json",
  "versie": "2025.1",
  "laatstGewijzigd": "2025-01-01",

  "erfbelasting": {
    "jaar": 2025,
    "tarieven": {
      "groep1": {
        "beschrijving": "Partner & kinderen",
        "schijven": [
          { "tot": 154197, "percentage": 10 },
          { "tot": 616788, "percentage": 20 },
          { "boven": 616788, "percentage": 30 }
        ]
      },
      "groep1a": {
        "beschrijving": "Kleinkinderen",
        "schijven": [
          { "tot": 154197, "percentage": 18 },
          { "tot": 616788, "percentage": 36 },
          { "boven": 616788, "percentage": 36 }
        ]
      },
      "groep2": {
        "beschrijving": "Overige verkrijgers",
        "schijven": [
          { "tot": 154197, "percentage": 30 },
          { "tot": 616788, "percentage": 40 },
          { "boven": 616788, "percentage": 40 }
        ]
      }
    },
    "vrijstellingen": {
      "partner": 795156,
      "kind": 25187,
      "kleinkind": 25187,
      "ouder": 59643,
      "andereVerkrijger": 2658,
      "gehandicaptKind": 67929,
      "aow": 25187,
      "anbi": 0
    },
    "relatieMapping": {
      "Partner": "groep1",
      "Kind": "groep1",
      "Stiefkind": "groep1",
      "Kleinkind": "groep1a",
      "Ouder": "groep2",
      "Broer/Zus": "groep2",
      "Overig": "groep2"
    }
  },

  "limieten": {
    "maxProfielen": 5,
    "maxErfgenamen": 25,
    "maxDigitaleBezittingen": 100,
    "maxDocumenten": 50,
    "maxShamirShares": 10,
    "minShamirShares": 2,
    "backupVerouderdDagen": 30,
    "maxExportItems": 1000,
    "wachtwoordMinLengte": 8,
    "databaseAutoLockMinuten": 30
  },

  "veldLengtes": {
    "naamMax": 100,
    "emailMax": 254,
    "telefoonMax": 20,
    "adresMax": 200,
    "postcodeMax": 10,
    "plaatsMax": 100,
    "landMax": 100,
    "bsnMax": 9,
    "omschrijvingMax": 500,
    "notitieMax": 2000,
    "urlMax": 2048,
    "bestandsnaamMax": 255
  },

  "validatie": {
    "postcodeRegex": "^[1-9][0-9]{3}\\s?[a-zA-Z]{2}$",
    "bsnRegex": "^[0-9]{9}$",
    "telefoonRegex": "^[+]?[0-9\\s\\-()]{7,20}$",
    "emailRegex": "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$",
    "ibanRegex": "^[A-Z]{2}[0-9]{2}[A-Z0-9]{4,30}$"
  },

  "encryptie": {
    "algoritme": "AES-256-GCM",
    "keyDerivation": "PBKDF2",
    "pbkdf2Iteraties": 600000,
    "saltLengteBits": 128,
    "ivLengteBits": 96,
    "shamirPrime": "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF43"
  },

  "export": {
    "pdfMarginMm": 20,
    "standaardPapierformaat": "A4",
    "maxBestandsgrootteMb": 50,
    "toegestaneBestandstypes": [".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx"]
  },

  "compleetheid": {
    "gewichten": {
      "eigenaar": 15,
      "erfgenamen": 20,
      "testament": 15,
      "uitvaart": 10,
      "donor": 5,
      "euthanasie": 5,
      "digitaleBezittingen": 10,
      "documenten": 10,
      "boedel": 10
    },
    "vereistPerDomein": {
      "eigenaar": ["voornaam", "achternaam", "geboortedatum"],
      "erfgenamen": ["minstens1erfgenaam"],
      "testament": ["heeftTestament"],
      "uitvaart": ["typeUitvaart"],
      "donor": ["donorRegistratie"],
      "euthanasie": ["euthanasieWilsverklaring"],
      "digitaleBezittingen": [],
      "documenten": [],
      "boedel": ["minstens1bezitting"]
    }
  }
}
```

### 6.2.2 C# Options-modellen

```csharp
// Rules/Configuration/LumioRulesOptions.cs
namespace Lumio.Api.Rules.Configuration;

public class LumioRulesOptions
{
    public const string SectionName = "LumioRules";
    
    public string Versie { get; set; } = "0.0.0";
    public DateTime LaatstGewijzigd { get; set; }
    public ErfbelastingOptions Erfbelasting { get; set; } = new();
    public LimietenOptions Limieten { get; set; } = new();
    public VeldLengtesOptions VeldLengtes { get; set; } = new();
    public ValidatieOptions Validatie { get; set; } = new();
    public EncryptieOptions Encryptie { get; set; } = new();
    public ExportOptions Export { get; set; } = new();
    public CompleetheidsOptions Compleetheid { get; set; } = new();
}
```

```csharp
// Rules/Configuration/ErfbelastingOptions.cs
namespace Lumio.Api.Rules.Configuration;

public class ErfbelastingOptions
{
    public int Jaar { get; set; } = 2025;
    public Dictionary<string, TariefGroepOptions> Tarieven { get; set; } = new();
    public Dictionary<string, decimal> Vrijstellingen { get; set; } = new();
    public Dictionary<string, string> RelatieMapping { get; set; } = new();
}

public class TariefGroepOptions
{
    public string Beschrijving { get; set; } = "";
    public List<SchijfOptions> Schijven { get; set; } = new();
}

public class SchijfOptions
{
    public decimal? Tot { get; set; }
    public decimal? Boven { get; set; }
    public int Percentage { get; set; }
}
```

```csharp
// Rules/Configuration/LimietenOptions.cs
namespace Lumio.Api.Rules.Configuration;

public class LimietenOptions
{
    public int MaxProfielen { get; set; } = 5;
    public int MaxErfgenamen { get; set; } = 25;
    public int MaxDigitaleBezittingen { get; set; } = 100;
    public int MaxDocumenten { get; set; } = 50;
    public int MaxShamirShares { get; set; } = 10;
    public int MinShamirShares { get; set; } = 2;
    public int BackupVerouderdDagen { get; set; } = 30;
    public int MaxExportItems { get; set; } = 1000;
    public int WachtwoordMinLengte { get; set; } = 8;
    public int DatabaseAutoLockMinuten { get; set; } = 30;
}
```

### 6.2.3 Registratie in Program.cs

```csharp
// In Program.cs — configuratie laden
var rulesPath = Path.Combine(AppContext.BaseDirectory, "rules", "lumio-rules.json");

if (File.Exists(rulesPath))
{
    builder.Configuration.AddJsonFile(rulesPath, optional: true, reloadOnChange: false);
}

builder.Services.Configure<LumioRulesOptions>(
    builder.Configuration.GetSection(LumioRulesOptions.SectionName));
builder.Services.Configure<ErfbelastingOptions>(
    builder.Configuration.GetSection($"{LumioRulesOptions.SectionName}:erfbelasting"));
builder.Services.Configure<LimietenOptions>(
    builder.Configuration.GetSection($"{LumioRulesOptions.SectionName}:limieten"));
// ... etc.
```

### 6.2.4 Startup-validatie

```csharp
// In Program.cs — validatie bij opstarten
builder.Services.AddOptionsWithValidateOnStart<LumioRulesOptions>()
    .Validate(opts =>
    {
        if (string.IsNullOrEmpty(opts.Versie))
            return false;
        if (opts.Erfbelasting.Tarieven.Count == 0)
            return false;
        if (opts.Limieten.MaxProfielen < 1)
            return false;
        return true;
    }, "lumio-rules.json bevat ongeldige configuratie");
```

---

## 6.3 Domain Services-laag (Laag 2)

### 6.3.1 Generiek PolicyResult

```csharp
// Rules/Results/PolicyResult.cs
namespace Lumio.Api.Rules.Results;

public record PolicyResult<T>
{
    public required T Resultaat { get; init; }
    public required string RegelVersie { get; init; }
    public DateTime BerekendOp { get; init; } = DateTime.UtcNow;
    public List<string> Waarschuwingen { get; init; } = [];
    public List<string> ToegepasteRegels { get; init; } = [];
}
```

### 6.3.2 Facts-modellen

```csharp
// Rules/Facts/ErfbelastingFacts.cs
namespace Lumio.Api.Rules.Facts;

public record ErfbelastingFacts(
    decimal TotaleNalatenschap,
    decimal TotaleSchulden,
    decimal UitvaartKosten,
    List<ErfgenaamFact> Erfgenamen);

public record ErfgenaamFact(
    int ErfgenaamId,
    string Naam,
    string Relatie,
    decimal? Erfdeel,
    decimal? LegitimairePortie,
    bool IsOnterfd);
```

```csharp
// Rules/Facts/MeldingFacts.cs
namespace Lumio.Api.Rules.Facts;

public record MeldingFacts(
    bool HeeftEigenaar,
    bool EigenaarCompleet,
    bool HeeftErfgenamen,
    int AantalErfgenamen,
    decimal TotaalErfdeelPercentage,
    bool HeeftTestament,
    bool HeeftCodicil,
    bool HeeftUitvaartWensen,
    bool HeeftDonorRegistratie,
    bool HeeftEuthanasieWilsverklaring,
    DateTime? LaatsteBackup,
    bool HeeftShamirShares,
    int AantalShamirShares,
    int MinShamirShares);
```

### 6.3.3 Service-interfaces

```csharp
// Rules/Services/IErfbelastingService.cs
namespace Lumio.Api.Rules.Services;

public interface IErfbelastingService
{
    PolicyResult<ErfbelastingResultaat> Bereken(ErfbelastingFacts facts);
    string GetTariefGroep(string relatie);
    decimal GetVrijstelling(string relatie);
}
```

```csharp
// Rules/Services/INalatenschapService.cs
namespace Lumio.Api.Rules.Services;

public interface INalatenschapService
{
    PolicyResult<NalatenschapResultaat> BerekenNetto(NalatenschapFacts facts);
}
```

```csharp
// Rules/Services/IMeldingService.cs
namespace Lumio.Api.Rules.Services;

public interface IMeldingService
{
    PolicyResult<MeldingResultaat> Evalueer(MeldingFacts facts);
}
```

### 6.3.4 Voorbeeld service-implementatie

```csharp
// Rules/Services/ErfbelastingService.cs
namespace Lumio.Api.Rules.Services;

using Microsoft.Extensions.Options;
using Lumio.Api.Rules.Configuration;
using Lumio.Api.Rules.Facts;
using Lumio.Api.Rules.Results;

public class ErfbelastingService : IErfbelastingService
{
    private readonly ErfbelastingOptions _options;
    private readonly string _regelVersie;

    public ErfbelastingService(
        IOptions<ErfbelastingOptions> options,
        IOptions<LumioRulesOptions> rootOptions)
    {
        _options = options.Value;
        _regelVersie = rootOptions.Value.Versie;
    }

    public PolicyResult<ErfbelastingResultaat> Bereken(ErfbelastingFacts facts)
    {
        var waarschuwingen = new List<string>();
        var toegepasteRegels = new List<string>();
        var perErfgenaam = new List<ErfgenaamBelasting>();

        var nettoNalatenschap = facts.TotaleNalatenschap
                              - facts.TotaleSchulden
                              - facts.UitvaartKosten;
        
        toegepasteRegels.Add("BR-048: Netto nalatenschap berekening");

        if (nettoNalatenschap < 0)
        {
            waarschuwingen.Add("Netto nalatenschap is negatief; geen erfbelasting verschuldigd.");
            nettoNalatenschap = 0;
        }

        foreach (var erfgenaam in facts.Erfgenamen.Where(e => !e.IsOnterfd))
        {
            var tariefGroep = GetTariefGroep(erfgenaam.Relatie);
            var vrijstelling = GetVrijstelling(erfgenaam.Relatie);
            var erfdeel = erfgenaam.Erfdeel ?? (nettoNalatenschap / facts.Erfgenamen.Count);
            var belastbaar = Math.Max(0, erfdeel - vrijstelling);
            var belasting = BerekenProgressief(belastbaar, tariefGroep);

            perErfgenaam.Add(new ErfgenaamBelasting(
                erfgenaam.ErfgenaamId,
                erfgenaam.Naam,
                erfdeel,
                vrijstelling,
                belastbaar,
                belasting,
                tariefGroep));
            
            toegepasteRegels.Add($"BR-046: Erfbelasting {erfgenaam.Naam} ({tariefGroep})");
        }

        return new PolicyResult<ErfbelastingResultaat>
        {
            Resultaat = new ErfbelastingResultaat(
                perErfgenaam,
                perErfgenaam.Sum(e => e.Belasting),
                nettoNalatenschap,
                $"Berekend op basis van tarieven {_options.Jaar}"),
            RegelVersie = _regelVersie,
            Waarschuwingen = waarschuwingen,
            ToegepasteRegels = toegepasteRegels
        };
    }

    public string GetTariefGroep(string relatie)
    {
        return _options.RelatieMapping.TryGetValue(relatie, out var groep)
            ? groep
            : "groep2"; // default: overige verkrijgers
    }

    public decimal GetVrijstelling(string relatie)
    {
        var key = relatie.ToLowerInvariant() switch
        {
            "partner" => "partner",
            "kind" or "stiefkind" => "kind",
            "kleinkind" => "kleinkind",
            "ouder" => "ouder",
            _ => "andereVerkrijger"
        };

        return _options.Vrijstellingen.TryGetValue(key, out var bedrag)
            ? bedrag
            : _options.Vrijstellingen.GetValueOrDefault("andereVerkrijger", 0);
    }

    private decimal BerekenProgressief(decimal belastbaar, string tariefGroep)
    {
        if (!_options.Tarieven.TryGetValue(tariefGroep, out var tariefGroepOptions))
            return 0;

        decimal belasting = 0;
        decimal resterend = belastbaar;

        foreach (var schijf in tariefGroepOptions.Schijven)
        {
            if (resterend <= 0) break;

            decimal schijfBedrag;
            if (schijf.Tot.HasValue)
            {
                schijfBedrag = Math.Min(resterend, schijf.Tot.Value);
            }
            else
            {
                schijfBedrag = resterend;
            }

            belasting += schijfBedrag * schijf.Percentage / 100m;
            resterend -= schijfBedrag;
        }

        return Math.Round(belasting, 2);
    }
}
```

### 6.3.5 Resultaat-modellen

```csharp
// Rules/Results/ErfbelastingResultaat.cs
namespace Lumio.Api.Rules.Results;

public record ErfbelastingResultaat(
    List<ErfgenaamBelasting> PerErfgenaam,
    decimal TotaalBelasting,
    decimal NettoNalatenschap,
    string Disclaimer);

public record ErfgenaamBelasting(
    int ErfgenaamId,
    string Naam,
    decimal Erfdeel,
    decimal Vrijstelling,
    decimal BelastbaarBedrag,
    decimal Belasting,
    string TariefGroep);
```

### 6.3.6 DI-registratie

```csharp
// In Program.cs of via extension method
builder.Services.AddScoped<IErfbelastingService, ErfbelastingService>();
builder.Services.AddScoped<INalatenschapService, NalatenschapService>();
builder.Services.AddScoped<ICompleetheidsService, CompleetheidsService>();
builder.Services.AddScoped<IJuridischeCheckService, JuridischeCheckService>();
builder.Services.AddScoped<ILegitimairePortieService, LegitimairePortieService>();
builder.Services.AddScoped<IMeldingService, MeldingService>();
builder.Services.AddScoped<ISuggestieService, SuggestieService>();

// Optioneel: extension method
public static class RuleServiceExtensions
{
    public static IServiceCollection AddLumioRules(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Configuratie
        services.Configure<LumioRulesOptions>(
            configuration.GetSection(LumioRulesOptions.SectionName));
        
        // Services
        services.AddScoped<IErfbelastingService, ErfbelastingService>();
        services.AddScoped<INalatenschapService, NalatenschapService>();
        services.AddScoped<ICompleetheidsService, CompleetheidsService>();
        services.AddScoped<IJuridischeCheckService, JuridischeCheckService>();
        services.AddScoped<ILegitimairePortieService, LegitimairePortieService>();
        services.AddScoped<IMeldingService, MeldingService>();
        services.AddScoped<ISuggestieService, SuggestieService>();
        
        return services;
    }
}
```

---

## 6.4 Controller-integratie (voor/na)

### 6.4.1 StatusController — Meldingen (voor)

```csharp
// ❌ HUIDIGE SITUATIE (vereenvoudigd)
[HttpGet("meldingen")]
public async Task<IActionResult> GetMeldingen()
{
    var eigenaar = await _context.Eigenaren.FirstOrDefaultAsync();
    var erfgenamen = await _context.Erfgenamen.ToListAsync();
    var testament = await _context.Testamenten.FirstOrDefaultAsync();
    // ... 15+ database calls ...

    var meldingen = new List<MeldingDto>();
    
    if (eigenaar == null)
        meldingen.Add(new("Geen eigenaar", "error", "..."));
    
    if (erfgenamen.Count == 0)
        meldingen.Add(new("Geen erfgenamen", "warning", "..."));
    
    if (erfgenamen.Sum(e => e.ErfdeelPercentage) != 100)
        meldingen.Add(new("Erfdelen niet 100%", "error", "..."));
    
    // ... 30+ regels business checks ...
    
    return Ok(meldingen);
}
```

### 6.4.2 StatusController — Meldingen (na)

```csharp
// ✅ NA REFACTORING
[HttpGet("meldingen")]
public async Task<IActionResult> GetMeldingen()
{
    // Stap 1: Data ophalen (controller-verantwoordelijkheid)
    var facts = await BuildMeldingFacts();
    
    // Stap 2: Regels evalueren (service-verantwoordelijkheid)
    var resultaat = _meldingService.Evalueer(facts);
    
    // Stap 3: Resultaat mappen naar DTO (controller-verantwoordelijkheid)
    return Ok(new
    {
        meldingen = resultaat.Resultaat.Meldingen,
        regelVersie = resultaat.RegelVersie,
        berekendOp = resultaat.BerekendOp
    });
}

private async Task<MeldingFacts> BuildMeldingFacts()
{
    var eigenaar = await _context.Eigenaren.FirstOrDefaultAsync();
    var erfgenamen = await _context.Erfgenamen.ToListAsync();
    var testament = await _context.Testamenten.FirstOrDefaultAsync();
    var laatsteBackup = await _context.Backups.MaxAsync(b => (DateTime?)b.DatumTijd);
    var shamir = await _context.ShamirShares.ToListAsync();

    return new MeldingFacts(
        HeeftEigenaar: eigenaar != null,
        EigenaarCompleet: eigenaar?.Voornaam != null && eigenaar?.Achternaam != null,
        HeeftErfgenamen: erfgenamen.Count > 0,
        AantalErfgenamen: erfgenamen.Count,
        TotaalErfdeelPercentage: erfgenamen.Sum(e => e.ErfdeelPercentage ?? 0),
        HeeftTestament: testament != null,
        HeeftCodicil: testament?.HeeftCodicil == true,
        HeeftUitvaartWensen: await _context.UitvaartWensen.AnyAsync(),
        HeeftDonorRegistratie: await _context.DonorRegistraties.AnyAsync(),
        HeeftEuthanasieWilsverklaring: await _context.EuthanasieDirectieven.AnyAsync(),
        LaatsteBackup: laatsteBackup,
        HeeftShamirShares: shamir.Count > 0,
        AantalShamirShares: shamir.Count,
        MinShamirShares: _limietenOptions.MinShamirShares);
}
```

### 6.4.3 ErfgenamenController — Erfbelasting (voor)

```csharp
// ❌ HUIDIGE SITUATIE (vereenvoudigd)
[HttpGet("erfbelasting")]
public async Task<IActionResult> GetErfbelasting()
{
    var eigenaar = await _context.Eigenaren.FirstOrDefaultAsync();
    var erfgenamen = await _context.Erfgenamen.ToListAsync();
    var boedel = await _context.Boedel.ToListAsync();
    
    var totaal = boedel.Sum(b => b.Waarde);
    var schulden = boedel.Where(b => b.Waarde < 0).Sum(b => b.Waarde);
    var netto = totaal + schulden; // 3× gedupliceerd!
    
    var resultaten = new List<object>();
    foreach (var e in erfgenamen)
    {
        var groep = e.Relatie switch
        {
            "Partner" => "groep1",
            "Kind" => "groep1",
            // ... hardcoded mapping
        };
        
        var vrijstelling = e.Relatie switch
        {
            "partner" => 795156m,
            // ... hardcoded bedragen
        };
        
        // ... 40 regels berekening
    }
    
    return Ok(resultaten);
}
```

### 6.4.4 ErfgenamenController — Erfbelasting (na)

```csharp
// ✅ NA REFACTORING
[HttpGet("erfbelasting")]
public async Task<IActionResult> GetErfbelasting()
{
    var facts = await BuildErfbelastingFacts();
    var resultaat = _erfbelastingService.Bereken(facts);
    return Ok(resultaat);
}

private async Task<ErfbelastingFacts> BuildErfbelastingFacts()
{
    var boedel = await _context.Boedel.ToListAsync();
    var erfgenamen = await _context.Erfgenamen.ToListAsync();
    
    return new ErfbelastingFacts(
        TotaleNalatenschap: boedel.Where(b => b.Waarde > 0).Sum(b => b.Waarde),
        TotaleSchulden: Math.Abs(boedel.Where(b => b.Waarde < 0).Sum(b => b.Waarde)),
        UitvaartKosten: 0, // evt. uit UitvaartWensen ophalen
        Erfgenamen: erfgenamen.Select(e => new ErfgenaamFact(
            e.Id,
            $"{e.Voornaam} {e.Achternaam}",
            e.Relatie,
            e.ErfdeelPercentage,
            e.LegitimairePortie,
            e.IsOnterfd ?? false
        )).ToList());
}
```

---

## 6.5 Unit-test voorbeeld

```csharp
// Tests/Rules/ErfbelastingServiceTests.cs
namespace Lumio.Tests.Rules;

using Microsoft.Extensions.Options;
using Lumio.Api.Rules.Configuration;
using Lumio.Api.Rules.Facts;
using Lumio.Api.Rules.Services;

public class ErfbelastingServiceTests
{
    private readonly ErfbelastingService _sut;

    public ErfbelastingServiceTests()
    {
        var erfOptions = Options.Create(new ErfbelastingOptions
        {
            Jaar = 2025,
            Tarieven = new()
            {
                ["groep1"] = new TariefGroepOptions
                {
                    Schijven =
                    [
                        new() { Tot = 154197, Percentage = 10 },
                        new() { Tot = 616788, Percentage = 20 },
                        new() { Boven = 616788, Percentage = 30 }
                    ]
                }
            },
            Vrijstellingen = new()
            {
                ["partner"] = 795156m,
                ["kind"] = 25187m,
                ["andereVerkrijger"] = 2658m
            },
            RelatieMapping = new()
            {
                ["Partner"] = "groep1",
                ["Kind"] = "groep1"
            }
        });

        var rootOptions = Options.Create(new LumioRulesOptions { Versie = "2025.1" });
        _sut = new ErfbelastingService(erfOptions, rootOptions);
    }

    [Fact]
    public void Partner_krijgt_groep1_tarief()
    {
        Assert.Equal("groep1", _sut.GetTariefGroep("Partner"));
    }

    [Fact]
    public void Partner_vrijstelling_is_795156()
    {
        Assert.Equal(795156m, _sut.GetVrijstelling("Partner"));
    }

    [Fact]
    public void Geen_belasting_bij_negatieve_nalatenschap()
    {
        var facts = new ErfbelastingFacts(
            TotaleNalatenschap: 100_000m,
            TotaleSchulden: 200_000m,
            UitvaartKosten: 0m,
            Erfgenamen: [new(1, "Test", "Partner", null, null, false)]);

        var resultaat = _sut.Bereken(facts);

        Assert.Equal(0m, resultaat.Resultaat.TotaalBelasting);
        Assert.Contains(resultaat.Waarschuwingen, 
            w => w.Contains("negatief"));
    }

    [Fact]
    public void Kind_progressief_tarief_eerste_schijf()
    {
        var kindErfdeel = 154197m + 25187m; // vrijstelling + eerste schijf
        var facts = new ErfbelastingFacts(
            TotaleNalatenschap: kindErfdeel,
            TotaleSchulden: 0m,
            UitvaartKosten: 0m,
            Erfgenamen: [new(1, "Kind A", "Kind", kindErfdeel, null, false)]);

        var resultaat = _sut.Bereken(facts);

        // 154197 belastbaar × 10% = 15419.70
        Assert.Equal(15419.70m, resultaat.Resultaat.TotaalBelasting);
    }

    [Fact]
    public void PolicyResult_bevat_regelversie()
    {
        var facts = new ErfbelastingFacts(0, 0, 0, []);
        var resultaat = _sut.Bereken(facts);
        Assert.Equal("2025.1", resultaat.RegelVersie);
    }
}
```

---

## 6.6 Rule Engine-laag (Laag 3, optioneel)

### 6.6.1 lumio-workflows.json (MS RulesEngine formaat)

```json
[
  {
    "WorkflowName": "MeldingenWorkflow",
    "Rules": [
      {
        "RuleName": "GeenEigenaar",
        "Expression": "facts.HeeftEigenaar == false",
        "RuleExpressionType": "LambdaExpression",
        "SuccessEvent": "{\"type\":\"error\",\"titel\":\"Geen eigenaar\",\"tekst\":\"Vul je persoonlijke gegevens in.\"}",
        "ErrorMessage": ""
      },
      {
        "RuleName": "ErfdelenNiet100Procent",
        "Expression": "facts.HeeftErfgenamen && facts.TotaalErfdeelPercentage != 100",
        "RuleExpressionType": "LambdaExpression",
        "SuccessEvent": "{\"type\":\"warning\",\"titel\":\"Erfdelen niet 100%\",\"tekst\":\"De erfdeel-percentages tellen niet op tot 100%.\"}"
      },
      {
        "RuleName": "BackupVerouderd",
        "Expression": "facts.LaatsteBackup != null && (DateTime.UtcNow - facts.LaatsteBackup.Value).TotalDays > 30",
        "RuleExpressionType": "LambdaExpression",
        "SuccessEvent": "{\"type\":\"warning\",\"titel\":\"Backup verouderd\",\"tekst\":\"Je laatste backup is meer dan 30 dagen oud.\"}"
      },
      {
        "RuleName": "GeenShamirShares",
        "Expression": "facts.HeeftShamirShares == false",
        "RuleExpressionType": "LambdaExpression",
        "SuccessEvent": "{\"type\":\"info\",\"titel\":\"Geen noodtoegang\",\"tekst\":\"Overweeg Shamir shares in te stellen voor noodtoegang.\"}"
      }
    ]
  },
  {
    "WorkflowName": "SuggestiesWorkflow",
    "Rules": [
      {
        "RuleName": "TestamentAangeraden",
        "Expression": "facts.HeeftErfgenamen && !facts.HeeftTestament",
        "RuleExpressionType": "LambdaExpression",
        "SuccessEvent": "{\"type\":\"suggestie\",\"titel\":\"Testament overwegen\",\"tekst\":\"Je hebt erfgenamen maar geen testament vastgelegd.\"}"
      },
      {
        "RuleName": "CodicilVoorOnroerendGoed",
        "Expression": "facts.HeeftTestament && !facts.HeeftCodicil",
        "RuleExpressionType": "LambdaExpression",
        "SuccessEvent": "{\"type\":\"suggestie\",\"titel\":\"Codicil overwegen\",\"tekst\":\"Een codicil kan aanvullende wensen vastleggen naast je testament.\"}"
      }
    ]
  }
]
```

### 6.6.2 RuleEngineService

```csharp
// Rules/Engine/RuleEngineService.cs
namespace Lumio.Api.Rules.Engine;

using RulesEngine.Models;
using System.Text.Json;

public class RuleEngineService
{
    private readonly RulesEngine.RulesEngine _engine;

    public RuleEngineService(string workflowsPath)
    {
        var json = File.ReadAllText(workflowsPath);
        var workflows = JsonSerializer.Deserialize<Workflow[]>(json);
        _engine = new RulesEngine.RulesEngine(workflows);
    }

    public async Task<List<RuleResultTree>> EvalueerWorkflow(
        string workflowNaam,
        object facts)
    {
        var results = await _engine.ExecuteAllRulesAsync(
            workflowNaam,
            new RuleParameter("facts", facts));
        
        return results
            .Where(r => r.IsSuccess)
            .ToList();
    }
}
```

---

## 6.7 Architectuurdiagram

```
┌────────────────────────────────────────────────────────────────────┐
│                        HTTP Request                               │
└──────────────────────────┬─────────────────────────────────────────┘
                           ▼
┌────────────────────────────────────────────────────────────────────┐
│                    Controllers (dun)                               │
│                                                                    │
│  1. Data ophalen → EF Core / DbContext                            │
│  2. Facts bouwen → Record objects                                  │
│  3. Service aanroepen → IXxxService.Xxx(facts)                    │
│  4. Resultaat mappen → DTO                                         │
│  5. Return response                                                │
└──────────┬──────────────────────────┬──────────────────────────────┘
           │                          │
           ▼                          ▼
┌──────────────────────┐  ┌──────────────────────────────────────────┐
│  IOptions<T>          │  │         Domain Services                  │
│                      │  │                                          │
│ lumio-rules.json     │  │  ErfbelastingService                     │
│  → ErfbelastingOpts  │──│  NalatenschapService                     │
│  → LimietenOpts      │  │  CompleetheidsService                    │
│  → VeldLengtesOpts   │  │  JuridischeCheckService                  │
│  → ValidatieOpts     │  │  LegitimairePortieService                │
│  → EncryptieOpts     │  │  MeldingService                          │
│  → ExportOpts        │  │  SuggestieService                        │
│  → CompleetheidsOpts │  │                                          │
└──────────────────────┘  │  Input:  Facts (pure data)               │
                          │  Output: PolicyResult<T>                 │
                          └──────────────────────────────────────────┘
                                        │
                                        ▼ (optioneel, sprint 3)
                          ┌──────────────────────────────────────────┐
                          │         Rule Engine                       │
                          │                                          │
                          │  lumio-workflows.json                    │
                          │  → MeldingenWorkflow                     │
                          │  → SuggestiesWorkflow                    │
                          │                                          │
                          │  Microsoft.RulesEngine                   │
                          └──────────────────────────────────────────┘
```

---

## 6.8 Bestandenlocatie en distributie

### USB-stick layout (na implementatie)

```
USB/
├── lumio-desktop/                   ← Electron app
│   ├── Lumio Desktop.exe
│   └── resources/
│       └── sidecar/
│           └── Lumio.Api/           ← .NET API
│               ├── Lumio.Api.dll
│               └── rules/           ← NIEUW
│                   ├── lumio-rules.json
│                   └── lumio-workflows.json  (optioneel)
├── data/                            ← SQLCipher databases
└── lumio-web/                       ← Next.js frontend (static)
```

### Pad-resolutie

```csharp
// paths.cs equivalent in .NET
public static class RulesPaths
{
    public static string GetRulesDirectory()
    {
        // Relatief aan de executable
        return Path.Combine(AppContext.BaseDirectory, "rules");
    }

    public static string GetRulesFilePath()
    {
        return Path.Combine(GetRulesDirectory(), "lumio-rules.json");
    }

    public static string GetWorkflowsFilePath()
    {
        return Path.Combine(GetRulesDirectory(), "lumio-workflows.json");
    }
}
```

---

## 6.9 Versioning-strategie

### Versie-formaat

```
YYYY.N     — bijv. "2025.1", "2025.2", "2026.1"
```

### Migratie-pad

1. **Nieuwe versie** van `lumio-rules.json` wordt meegeleverd met app-update
2. **Bestaande configuratie** wordt niet overschreven (gebruiker kan aanpassen)
3. **Fallback:** als `lumio-rules.json` ontbreekt, gebruikt de app de **defaults**
   die zijn ingebouwd in de `Options`-klassen (via default property values)

### Fallback-mechanisme

```csharp
// De Options-klassen hebben altijd defaults:
public class LimietenOptions
{
    public int MaxProfielen { get; set; } = 5;        // ← fallback
    public int MaxErfgenamen { get; set; } = 25;       // ← fallback
    // ...
}

// Als lumio-rules.json ontbreekt, werkt de app met deze defaults
// → Geen crashes, geen afhankelijkheid van extern bestand
```
