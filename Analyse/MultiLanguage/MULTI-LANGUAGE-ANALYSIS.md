# Meertaligheidsanalyse — Lumio

> **Versie:** 1.0  
> **Datum:** 23 februari 2026  
> **Auteur:** AI Architect  
> **Status:** Analyse — ter goedkeuring  
> **Referentie:** `Analyse/MultiLanguage/inventaris-hardcoded-teksten.md`

---

## Inhoudsopgave

1. [Managementsamenvatting](#1-managementsamenvatting)
2. [Huidige situatie (IST)](#2-huidige-situatie-ist)
3. [Gewenste situatie (SOLL)](#3-gewenste-situatie-soll)
4. [Scope & afbakening](#4-scope--afbakening)
5. [Technische oplossingsrichting](#5-technische-oplossingsrichting)
6. [Architectuurbeslissingen](#6-architectuurbeslissingen)
7. [Impactanalyse per laag](#7-impactanalyse-per-laag)
8. [Risico's en mitigatie](#8-risicos-en-mitigatie)
9. [Afhankelijkheden](#9-afhankelijkheden)
10. [Aanbevelingen](#10-aanbevelingen)

---

## 1. Managementsamenvatting

Lumio is momenteel een **volledig Nederlandstalige** applicatie. Er zijn ~1.600 hardcoded
Nederlandse teksten verspreid over ~66 bestanden in drie lagen: Next.js frontend (~1.100),
.NET backend (~400) en Electron shell (~10). Er bestaat **geen i18n-infrastructuur**.

Deze analyse beschrijft een **incrementele, veilige aanpak** om meertaligheid toe te voegen
met Nederlands als standaardtaal en Engels als eerste extra taal, waarbij het framework
eenvoudig uitbreidbaar is voor toekomstige talen.

De gebruiker kiest de taal bij **eerste gebruik** (profielselectie/setup-scherm).
De taal kan later via Instellingen worden gewijzigd.

**Kerngetallen:**

| Metriek | Waarde |
|---------|--------|
| Bestanden met hardcoded tekst | ~66 |
| Unieke vertaalbare strings | ~1.600 |
| Frontend strings | ~1.100 |
| Backend strings | ~400 |
| Electron strings | ~10 |
| Hergebruikte strings (Opslaan, Annuleren, etc.) | ~17 patronen, ~100+ voorkomens |
| Dynamische strings (template literals) | ~40 |
| Juridische/domein-specifieke termen | ~50 |

---

## 2. Huidige situatie (IST)

### 2.1 Architectuuroverzicht

```
┌─────────────────────────────────────────────────────┐
│  Electron 35 (lumio-desktop)                        │
│  ┌───────────────────────────────────────────────┐  │
│  │  Next.js 16 SPA (lumio-web)     output:export │  │
│  │  ┌─────────────────────────────────────────┐  │  │
│  │  │ React 19 Components                     │  │  │
│  │  │ - Inline NL strings in JSX              │  │  │
│  │  │ - toLocaleDateString("nl-NL")           │  │  │
│  │  │ - Intl.NumberFormat("nl-NL", {EUR})     │  │  │
│  │  │ - NL enum labels inline                 │  │  │
│  │  └─────────────────────────────────────────┘  │  │
│  └───────────────│────────────────────────────────┘  │
│                  │ fetch /api/*                       │
│  ┌───────────────▼────────────────────────────────┐  │
│  │  .NET 10 API (Lumio.Api)                       │  │
│  │  - NL foutmeldingen in controllers             │  │
│  │  - NL meldingen/suggesties in services         │  │
│  │  - NL PDF-inhoud (LumioPdfService)             │  │
│  │  - NL auditlog-entries                         │  │
│  │  - NL validatiemeldingen (FluentValidation)    │  │
│  │  - NL API-veldnamen (isOntgrendeld, etc.)      │  │
│  └────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### 2.2 Probleempunten

| # | Probleem | Impact | Voorbeelden |
|---|----------|--------|-------------|
| P1 | Alle UI-teksten staan inline in JSX | Geen vertaling mogelijk | `<h1>Mijn Profiel</h1>` in 45+ bestanden |
| P2 | Datum/valuta formatting hardcoded op nl-NL | Verkeerde formatting voor EN gebruikers | `toLocaleDateString("nl-NL")` in 10+ bestanden |
| P3 | Backend retourneert NL foutmeldingen | Frontend kan ze niet vertalen | `"Ongeldig wachtwoord."` via API response |
| P4 | Backend genereert NL PDF-inhoud | PDF altijd in het Nederlands | ~100 strings in LumioPdfService.cs |
| P5 | Enum displaywaarden inline in componenten | Dubbele definitie, niet vertaalbaar | `"Gehuwd"`, `"Partner"`, `"Hypotheek"` in 10+ bestanden |
| P6 | Juridische teksten inline | Complexe vertaling vereist | BW Boek 4, WGBO, Wtl referenties |
| P7 | `<html lang="nl">` hardcoded | Accessibility/SEO onjuist bij EN | layout.tsx |
| P8 | Voorbeeld-data geheel NL | Voorbeeldmodus niet vertaalbaar | voorbeeld-data.ts (~200 strings) |
| P9 | API-veldnamen zijn NL | Breaking change als deze wijzigen | `isOntgrendeld`, `bericht`, etc. |
| P10 | Electron window title NL | Desktop titel niet vertaalbaar | `"Lumio — Digitale Nalatenschap"` |

### 2.3 Bestanden per categorie

| Categorie | Bestanden | Strings | Complexiteit |
|-----------|----------:|--------:|:-------------|
| Pages (app/) | 16 | ~600 | Hoog — veel formulieren |
| Layout components | 6 | ~45 | Middel |
| Auth components | 5 | ~47 | Middel |
| Wizard/Interview | 3 | ~107 | Hoog — stapsgewijs |
| Domain components | 6 | ~103 | Hoog — juridisch |
| Dashboard widgets | 3 | ~19 | Laag |
| Shared components | 2 | ~7 | Laag |
| Lib/data bestanden | 2 | ~500 | Hoog — veel content |
| Controllers (.NET) | 10 | ~80 | Middel |
| Services (.NET) | 8 | ~155 | Hoog — PDF |
| Middleware (.NET) | 2 | ~6 | Laag |
| Rules/Config (.NET) | 4 | ~35 | Middel |
| Electron | 3 | ~10 | Laag |

---

## 3. Gewenste situatie (SOLL)

### 3.1 Functionele eisen

| # | Eis | Prioriteit |
|---|-----|:----------:|
| F1 | Taalkeuze bij eerste gebruik (setup-scherm) | Must |
| F2 | Nederlands en Engels beschikbaar | Must |
| F3 | Taal wijzigbaar via Instellingen | Must |
| F4 | Alle UI-teksten vertaald | Must |
| F5 | Datum/valuta formatting volgt taalinstelling | Must |
| F6 | Backend foutmeldingen vertaald | Must |
| F7 | PDF-export in de gekozen taal | Should |
| F8 | Voorbeeld-data in de gekozen taal | Should |
| F9 | Electron shell volgt taalinstelling | Should |
| F10 | Framework uitbreidbaar voor extra talen | Must |
| F11 | Juridische teksten correct vertaald | Must |
| F12 | Taalinstelling opgeslagen per profiel | Could |

### 3.2 Niet-functionele eisen

| # | Eis |
|---|-----|
| NF1 | Geen zichtbare performance-impact (< 50ms extra laadtijd) |
| NF2 | Type-safe vertaalsleutels (compile-time checking) |
| NF3 | Minimale toename bundlegrootte (< 50KB per taal) |
| NF4 | Vertaalbestanden gemakkelijk te onderhouden door niet-ontwikkelaars |
| NF5 | Bestaande Nederlandse UX blijft 100% intact |
| NF6 | Geen breaking changes in API-contract |

---

## 4. Scope & afbakening

### 4.1 In scope

- Next.js frontend: alle UI-teksten externaliseren naar JSON-resourcebestanden
- i18n framework integratie (next-intl of vergelijkbaar)
- Datum- en valutaformattering locale-aware maken
- Backend: foutmeldingen en meldingen via resource bestanden
- Backend: PDF-generatie meertalig maken
- Electron: window title en dialogen
- Taalkeuze-UI bij setup en in instellingen
- Nederlandse en Engelse vertaalbestanden
- Voorbeeld-data meertalig

### 4.2 Buiten scope

- URL-routing wijzigen (routes blijven `/eigenaar`, `/erfgenamen`, etc.)  
  *Rationale: Lumio is een SPA geserveerd vanuit Electron, geen publieke website. SEO is niet relevant. Route-wijzigingen zouden onnodige complexiteit en breaking changes introduceren.*
- API JSON-veldnamen wijzigen (`isOntgrendeld`, etc.)  
  *Rationale: Dit zijn technische identifiers, niet zichtbaar voor eindgebruikers. Wijziging zou een breaking change zijn voor alle API-consumenten.*
- Juridische validatie van Engelse vertalingen  
  *Rationale: Valt buiten softwareontwikkeling. Vereist een juridisch vertaalbureau.*
- Right-to-left (RTL) ondersteuning  
  *Rationale: Niet vereist voor NL/EN. Kan later worden toegevoegd.*
- Vertaling van database-content (gebruikersinvoer)  
  *Rationale: Gebruikers voeren hun eigen data in; die is taalonafhankelijk.*

### 4.3 Belangrijke beslissing: API-veldnamen

De API retourneert Nederlandse JSON-veldnamen (bijv. `isOntgrendeld`, `bericht`, `melding`).
Deze **blijven ongewijzigd**. De frontend verwerkt ze als technische identifiers:

```typescript
// Huidige situatie — blijft intact
const status = await api.get<{ isOntgrendeld: boolean }>("/api/auth/status");
```

Wat **wel** vertaald wordt zijn de **displaywaarden** die de API retourneert in menselijk-leesbare
velden (foutmeldingen, meldingen, suggesties). Dit gebeurt via een `Accept-Language` header.

---

## 5. Technische oplossingsrichting

### 5.1 Frontend: next-intl

**Keuze: `next-intl`** — de de facto standaard voor i18n in Next.js App Router.

| Criterium | next-intl | react-i18next | react-intl |
|-----------|:---------:|:-------------:|:----------:|
| Next.js App Router ondersteuning | ✅ Excellent | ⚠️ Workarounds nodig | ⚠️ Beperkt |
| Static export (`output: "export"`) | ✅ | ✅ | ✅ |
| Type-safe keys (TypeScript) | ✅ | ⚠️ Plugin nodig | ❌ |
| ICU MessageFormat (plurals, etc.) | ✅ | ✅ | ✅ |
| Bundlegrootte | ~14KB gzip | ~25KB gzip | ~30KB gzip |
| Datum/nummer formatting | ✅ Ingebouwd | ❌ Extern | ✅ Ingebouwd |
| Community & maintenance | ✅ Actief | ✅ Groot | ✅ Mature |
| Lage leercurve | ✅ | ✅ | ⚠️ |

**Waarom next-intl boven react-i18next:**
1. Eerste-klas App Router/RSC integratie (geen client-wrapper nodig)
2. Type-safe keys zonder extra tooling
3. Ingebouwde Intl.DateTimeFormat/NumberFormat wrappers
4. Kleinste bundlegrootte
5. Expliciet ontworpen voor Next.js static export

### 5.2 Frontend: vertaalbestandstructuur

```
src/lumio-web/
├── messages/
│   ├── nl.json         ← Nederlandse vertalingen (primair)
│   └── en.json         ← Engelse vertalingen
├── src/
│   ├── i18n/
│   │   ├── request.ts        ← next-intl configuratie
│   │   └── routing.ts        ← locale routing (indien nodig)
│   ├── app/
│   │   ├── layout.tsx        ← <html lang={locale}>
│   │   └── ...
│   └── ...
└── next.config.ts             ← i18n plugin configuratie
```

### 5.3 Namespace-structuur vertaalbestanden

```json
{
  "common": {
    "opslaan": "Opslaan",
    "annuleren": "Annuleren",
    "verwijderen": "Verwijderen",
    "bewerken": "Bewerken",
    "toevoegen": "Toevoegen",
    "sluiten": "Sluiten",
    "laden": "Laden...",
    "bevestigen": "Bevestigen",
    "ja": "Ja",
    "nee": "Nee",
    "foutOpgetreden": "Er is een fout opgetreden."
  },
  "nav": {
    "dashboard": "Dashboard",
    "mijnProfiel": "Mijn Profiel",
    "testament": "Testament",
    "wilsverklaring": "Wilsverklaring",
    "donorregistratie": "Donorregistratie",
    "digitaalBezit": "Digitaal Bezit",
    "boedel": "Boedel",
    "uitvaartwensen": "Uitvaartwensen",
    "documenten": "Documenten",
    "erfgenamen": "Erfgenamen",
    "noodcontacten": "Noodcontacten",
    "tijdlijn": "Tijdlijn Overlijden",
    "exporteren": "Exporteren",
    "activiteitenlog": "Activiteitenlog",
    "instellingen": "Instellingen"
  },
  "auth": { "..." : "..." },
  "eigenaar": { "..." : "..." },
  "erfgenamen": { "..." : "..." },
  "testament": { "..." : "..." },
  "boedel": { "..." : "..." },
  "digitaalBezit": { "..." : "..." },
  "documenten": { "..." : "..." },
  "donor": { "..." : "..." },
  "euthanasie": { "..." : "..." },
  "uitvaart": { "..." : "..." },
  "noodcontacten": { "..." : "..." },
  "tijdlijn": { "..." : "..." },
  "export": { "..." : "..." },
  "auditLog": { "..." : "..." },
  "instellingen": { "..." : "..." },
  "dashboard": { "..." : "..." },
  "wizard": { "..." : "..." },
  "interview": { "..." : "..." },
  "voorbeeldData": { "..." : "..." },
  "afsluitInstructies": { "..." : "..." },
  "enums": {
    "relatie": {
      "partner": "Partner",
      "kind": "Kind",
      "ouder": "Ouder",
      "broerZus": "Broer/Zus",
      "kleinkind": "Kleinkind",
      "stiefkind": "Stiefkind",
      "overig": "Overig"
    },
    "burgerlijkeStaat": { "..." : "..." },
    "bezitType": { "..." : "..." },
    "schuldType": { "..." : "..." }
  }
}
```

### 5.4 Backend: .NET resource bestanden

**Keuze: `IStringLocalizer<T>`** — het standaard .NET localization framework.

```
Lumio.Api/
├── Resources/
│   ├── Controllers/
│   │   ├── AuthController.nl.resx
│   │   ├── AuthController.en.resx
│   │   └── ...
│   ├── Services/
│   │   ├── MeldingService.nl.resx
│   │   ├── MeldingService.en.resx
│   │   ├── LumioPdfService.nl.resx
│   │   ├── LumioPdfService.en.resx
│   │   └── ...
│   └── Shared/
│       ├── SharedResources.nl.resx
│       └── SharedResources.en.resx
└── Program.cs  ← AddLocalization() + RequestLocalizationMiddleware
```

**Locale-detectie in backend:**
1. Frontend stuurt `Accept-Language: nl` of `Accept-Language: en` header mee
2. Backend gebruikt `RequestLocalizationMiddleware` om de cultuur te bepalen
3. `IStringLocalizer<T>` levert de juiste string op basis van de actieve cultuur

```csharp
// Program.cs
builder.Services.AddLocalization(options => options.ResourcesPath = "Resources");
builder.Services.Configure<RequestLocalizationOptions>(options =>
{
    var supportedCultures = new[] { "nl", "en" };
    options.SetDefaultCulture("nl");
    options.AddSupportedCultures(supportedCultures);
    options.AddSupportedUICultures(supportedCultures);
});

// Controller voorbeeld
public class AuthController(
    IStringLocalizer<AuthController> L,
    // ... bestaande dependencies
)
{
    [HttpPost("ontgrendel")]
    public IActionResult Ontgrendel(OntgrendelRequest req)
    {
        // Was: return BadRequest(new { error = "Ongeldig wachtwoord." });
        return BadRequest(new { error = L["OngeldigWachtwoord"] });
    }
}
```

### 5.5 Electron: runtime language switching

Het Electron-proces heeft minimale teksten (~10 strings). Aanpak:

```typescript
// lumio-desktop/src/main/i18n.ts
const messages = {
  nl: {
    windowTitle: "Lumio — Digitale Nalatenschap",
    backendStartFailed: "Backend kon niet worden gestart.",
    unexpectedError: "Er is een onverwachte fout opgetreden.",
  },
  en: {
    windowTitle: "Lumio — Digital Estate",
    backendStartFailed: "Backend could not be started.",
    unexpectedError: "An unexpected error occurred.",
  },
};
```

De taalinstelliing wordt opgeslagen in de Electron config (dezelfde locatie als auto-backup config)
en gesynchroniseerd met de frontend via IPC.

### 5.6 Taalkeuze flow

```
┌──────────────────────────┐
│   App start              │
│   Lees opgeslagen taal   │──── Taal gevonden? ──── Ja ──→ Gebruik opgeslagen taal
│   uit localStorage       │                                        │
└─────────┬────────────────┘                                        ▼
          │ Nee (eerste keer)                              ┌────────────────┐
          ▼                                                │  App laden in  │
┌──────────────────────────┐                               │  gekozen taal  │
│  Profiel-selectiescherm  │                               └────────────────┘
│  ┌────────────────────┐  │
│  │ 🇳🇱 Nederlands     │  │
│  │ 🇬🇧 English        │  │
│  │ (toekomstig: meer) │  │
│  └────────────────────┘  │
│  profielkeuze / setup    │
└──────────┬───────────────┘
           │ Taal opslaan in localStorage
           │ + Accept-Language header instellen
           ▼
┌──────────────────────────┐
│  App herlaadt in         │
│  gekozen taal            │
└──────────────────────────┘
```

### 5.7 Taalopslag

| Opslaglocatie | Doel | Waarde |
|---------------|------|--------|
| `localStorage["lumio-locale"]` | Frontend taalinstelling | `"nl"` of `"en"` |
| `Accept-Language` header | Backend taalinstelling per request | `"nl"` of `"en"` |
| Electron config | Desktop shell taal | `"nl"` of `"en"` |

**Let op:** De taal wordt **niet** in de database opgeslagen — Lumio is een offline app
zonder gebruikersaccounts. localStorage is de juiste opslaglocatie gezien het per-apparaat karakter.

---

## 6. Architectuurbeslissingen

### 6.1 Beslissing: URL-routing

| Optie | Beschrijving | Keuze |
|-------|-------------|:-----:|
| A) Locale prefix (`/nl/eigenaar`, `/en/eigenaar`) | Standaard i18n routing | ❌ |
| B) Routes ongewijzigd (`/eigenaar`) | Geen URL-wijzigingen | ✅ |

**Rationale:** Lumio is een **lokale desktop-app** geserveerd vanuit Electron. Er is geen SEO,
geen deep-linking van buitenaf, en geen reden om de URL te wijzigen op basis van taal.
De gebruiker ziet nooit de URL in een desktop-app. Route-wijzigingen zouden onnodige complexiteit
en migratie-risico's toevoegen.

### 6.2 Beslissing: API-veldnamen

| Optie | Beschrijving | Keuze |
|-------|-------------|:-----:|
| A) Veldnamen vertalen | `isOntgrendeld` → `isUnlocked` voor EN | ❌ |
| B) Veldnamen behouden | Altijd NL veldnamen, alleen displayteksten vertalen | ✅ |

**Rationale:** API-veldnamen zijn technische identifiers. Wijziging zou een breaking change zijn
voor alle bestaande code (frontend TypeScript types, api-client, stores). De frontend beschouwt
ze als opaque keys — de eindgebruiker ziet ze nooit.

### 6.3 Beslissing: vertaalbestand formaat

| Optie | Beschrijving | Keuze |
|-------|-------------|:-----:|
| A) Eén groot JSON-bestand per taal | `nl.json`, `en.json` | ✅ |
| B) Namespace-per-bestand | `nl/common.json`, `nl/eigenaar.json`, etc. | ❌ |

**Rationale:** Met ~1.100 frontend strings is één bestand per taal (~40-50KB) nog goed
beheersbaar. next-intl laadt het gehele bestand bij app-start (geen lazy loading nodig
voor een static export SPA). Split-bestanden voegen complexiteit toe zonder noemenswaardig
voordeel bij deze schaalgrootte.

### 6.4 Beslissing: taalinstelling opslag

| Optie | Beschrijving | Keuze |
|-------|-------------|:-----:|
| A) Per profiel in database | Taal gekoppeld aan profiel | ❌ |
| B) Per apparaat in localStorage | Taal onafhankelijk van profiel | ✅ |

**Rationale:** Lumio draait op één apparaat (USB-stick). Taalvoorkeur is een apparaat-instelling,
niet een profiel-instelling. Dit voorkomt complexiteit in de API en database. Als er in de
toekomst per-profiel taal gewenst is, kan dit eenvoudig worden toegevoegd door de taal ook
naar de API te sturen bij profielwisseling.

### 6.5 Beslissing: pluralisatie en interpolatie

| Optie | Beschrijving | Keuze |
|-------|-------------|:-----:|
| A) ICU MessageFormat | `"{count, plural, one {# item} other {# items}}"` | ✅ |
| B) Conditionele keys | `items.one`, `items.other` als aparte keys | ❌ |

**Rationale:** ICU MessageFormat is de internationale standaard, ondersteund door next-intl
en .NET. Het handelt pluralisatie, geslacht en nummer-formatting correct af per taal.

Voorbeeld:
```json
{
  "voortgang": "{completed} van {total} voltooid",
  "suggesties": "{count, plural, =0 {Geen suggesties} one {# suggestie gevonden} other {# suggesties gevonden}}"
}
```

---

## 7. Impactanalyse per laag

### 7.1 Frontend — Next.js (lumio-web)

| Aspect | Impact | Toelichting |
|--------|:------:|-------------|
| Package toevoegen | 🟢 Laag | `npm install next-intl` |
| next.config.ts wijzigen | 🟢 Laag | next-intl plugin toevoegen |
| Vertaalbestanden aanmaken | 🟡 Middel | nl.json + en.json (~1.100 keys elk) |
| layout.tsx aanpassen | 🟢 Laag | `NextIntlClientProvider` wrapper + dynamic `lang` |
| Page componenten migreren | 🔴 Hoog | 16 pages met inline strings → `useTranslations()` calls |
| Layout componenten migreren | 🟡 Middel | 6 bestanden (Sidebar, Header, etc.) |
| Auth componenten migreren | 🟡 Middel | 5 bestanden |
| Wizard/Interview migreren | 🔴 Hoog | 3 bestanden, veel dynamische content |
| Domain componenten migreren | 🟡 Middel | 6 bestanden |
| Dashboard widgets migreren | 🟢 Laag | 3 bestanden |
| Data-bestanden migreren | 🟡 Middel | afsluit-instructies.ts, voorbeeld-data.ts |
| Datum/valuta formatting | 🟡 Middel | ~15 voorkomens van `nl-NL` locale strings |
| Hooks aanpassen | 🟢 Laag | useIdleTimer.ts, useKeyboardShortcuts.ts |
| API-client aanpassen | 🟢 Laag | Accept-Language header toevoegen |
| Taalkeuze-UI bouwen | 🟢 Laag | Dropdown op setup + instellingen pagina |

### 7.2 Backend — .NET (Lumio.Api)

| Aspect | Impact | Toelichting |
|--------|:------:|-------------|
| Localization configureren | 🟢 Laag | `AddLocalization()` + middleware in Program.cs |
| Resource-bestanden aanmaken | 🟡 Middel | ~15 .resx-bestandparen (nl + en) |
| Controllers migreren | 🟡 Middel | ~10 controllers met NL foutmeldingen |
| Middleware migreren | 🟢 Laag | 2 bestanden |
| Domain services migreren | 🟡 Middel | MeldingService, SuggestieService, CompleetheidsService |
| PDF-service migreren | 🔴 Hoog | ~100 strings, complexe formatting |
| FluentValidation migreren | 🟡 Middel | 5 validator-bestanden, `.WithMessage()` aanpassen |
| Rules/Config migreren | 🟡 Middel | ErfbelastingOptions labels, disclaimer |

### 7.3 Electron (lumio-desktop)

| Aspect | Impact | Toelichting |
|--------|:------:|-------------|
| i18n module toevoegen | 🟢 Laag | Klein lokaal woordenboek (~10 keys) |
| Window title | 🟢 Laag | 1 string |
| Error dialogen | 🟢 Laag | 2-3 strings |
| Auto-backup labels | 🟢 Laag | 3-4 strings |

### 7.4 Migratiepatroon per component

**Voor elke component volgt de migratie dit patroon:**

```tsx
// VOOR: inline Dutch
export default function EigenaarPage() {
  return (
    <div>
      <h1>Mijn Profiel</h1>
      <label>Voornaam</label>
      <button>Opslaan</button>
    </div>
  );
}

// NA: next-intl
import { useTranslations } from "next-intl";

export default function EigenaarPage() {
  const t = useTranslations("eigenaar");
  const tc = useTranslations("common");
  return (
    <div>
      <h1>{t("titel")}</h1>
      <label>{t("voornaam")}</label>
      <button>{tc("opslaan")}</button>
    </div>
  );
}
```

**Voor dynamische strings:**

```tsx
// VOOR
<p>{`${completed} van ${total} velden ingevuld`}</p>

// NA
<p>{t("voortgang", { completed, total })}</p>
```

```json
// nl.json
{ "voortgang": "{completed} van {total} velden ingevuld" }
// en.json
{ "voortgang": "{completed} of {total} fields completed" }
```

---

## 8. Risico's en mitigatie

| # | Risico | Kans | Impact | Mitigatie |
|---|--------|:----:|:------:|-----------|
| R1 | Regressie in bestaande NL UX door verkeerde key-mapping | Middel | Hoog | Per-pagina migratie met visuele vergelijking. NL.json bevat exacte huidige strings. Sprint-per-sprint verificatie. |
| R2 | Ontbrekende vertalingen in EN tonen als key-fallback | Middel | Middel | next-intl `onError` handler + fallback naar NL. CI-check die vergelijkt of EN dezelfde keys heeft als NL. |
| R3 | Juridische termen incorrect vertaald naar EN | Hoog | Hoog | Juridische termen markeren als "needs review". Waar mogelijk dubbel tonen: `"Legitimate portion (legitimaire portie)"`. |
| R4 | Performance-impact door vertaalframework | Laag | Laag | next-intl is ~14KB. Static export laadt alles bij boot. Bundlesize monitoring. |
| R5 | Template literal migratie introduceert bugs | Middel | Middel | ICU MessageFormat met named parameters. Unit tests per dynamische string. |
| R6 | PDF-inhoud incorrecte taal | Middel | Hoog | Accept-Language header doorgeven aan PDF-service. E2E test per taal. |
| R7 | Nieuwe features vergeten vertalingen toe te voegen | Hoog | Middel | TypeScript type-checking op vertaalkeys. Linting. README-instructie in CONTRIBUTING.md. |
| R8 | Datum/valuta formatting breekt voor edge cases | Laag | Middel | Intl API van de browser/node. Geen eigen formatting. next-intl `useFormatter()`. |

---

## 9. Afhankelijkheden

### 9.1 Nieuwe packages

| Package | Laag | Versie | Grootte | Doel |
|---------|------|--------|---------|------|
| `next-intl` | Frontend | ^4.x | ~14KB gzip | i18n framework |
| *Geen* | Backend | — | — | .NET localization is built-in (`Microsoft.Extensions.Localization`) |
| *Geen* | Electron | — | — | Klein eigen woordenboek |

### 9.2 Bestaande packages die impacted worden

| Package | Impact |
|---------|--------|
| `next` | next.config.ts wijzigt (plugin) |
| `zod` | Validatiemeldingen in componenten moeten vertaald |
| `react-hook-form` | ErrorMessage rendering moet vertaalkeys gebruiken |

### 9.3 Tooling

| Tool | Doel | Prioriteit |
|------|------|:----------:|
| CI key-vergelijking script | Detecteert ontbrekende keys in en.json t.o.v. nl.json | Must |
| VS Code i18n extension | Inline preview van vertaalkeys | Nice |
| JSON schema voor messages | Validatie van vertaalbestanden | Nice |

---

## 10. Aanbevelingen

### 10.1 Aanpak

1. **Incrementele migratie** — Migreer per domein/pagina, niet alles tegelijk.
2. **NL eerst, EN tweede** — Maak eerst de NL vertaalbestanden (= huidige teksten exact kopiëren), controleer dat alles werkt, voeg dan EN toe.
3. **Common namespace eerst** — Begin met hergebruikte strings om direct ~100 voorkomens te vatten.
4. **Geen "big bang"** — Elke sprint levert een werkende app op, ongeacht of de volledige migratie af is.
5. **Visuele regressietests** — Na elke sprint visueel vergelijken met een screenshot van de huidige NL versie.

### 10.2 Naamconventie vertaalkeys

| Conventie | Voorbeeld | Rationale |
|-----------|-----------|-----------|
| camelCase | `mijnProfiel`, `opslaan` | Consistent met TypeScript |
| Namespace.key | `eigenaar.titel` | Georganiseerd per domein |
| Actie-Object | `verwijderenBevestiging` | Leesbaar |
| Geen afkortingen | `wachtwoordMinimumLengte` (niet `wachtwoordMinLen`) | Duidelijk |

### 10.3 Juridische teksten

Nederlandse juridische teksten (BW Boek 4, WGBO, Wtl, Donorwet) vereisen
specialistische vertaling. Aanbeveling:

1. **Initial release:** Juridische paragrafen in het Engels als "informational - based on Dutch law"
   met een disclaimer: *"Legal references are based on Dutch legislation. Consult a local legal professional for advice applicable to your jurisdiction."*
2. **Later:** Professioneel laten vertalen door een juridisch vertaalbureau.

### 10.4 Toekomstige talen toevoegen

Het toevoegen van een nieuwe taal vereist:

1. Kopieer `messages/nl.json` → `messages/xx.json`
2. Vertaal alle waarden (keys blijven identiek)
3. Voeg `xx.resx` bestanden toe in de backend
4. Voeg de taal toe aan de configuratie:
   - `next.config.ts` locales array
   - `Program.cs` supportedCultures array
   - Electron i18n messages object
5. De taal verschijnt automatisch in de taalkeuze-UI

---

## Bijlage A — Overzicht hergebruikte strings

Deze strings komen in 3+ bestanden voor en worden als `common.*` keys gedefinieerd:

| String | Voorkomens | Key |
|--------|:---------:|-----|
| Opslaan | 12 | `common.opslaan` |
| Annuleren | 10 | `common.annuleren` |
| Verwijderen | 8 | `common.verwijderen` |
| Bewerken | 6 | `common.bewerken` |
| Toevoegen | 5 | `common.toevoegen` |
| Sluiten | 5 | `common.sluiten` |
| Laden... | 4 | `common.laden` |
| Naam | 8 | `common.naam` |
| Type | 6 | `common.type` |
| Beschrijving | 5 | `common.beschrijving` |
| Telefoon | 4 | `common.telefoon` |
| E-mail | 4 | `common.email` |
| Ja | 3 | `common.ja` |
| Nee | 3 | `common.nee` |
| Geen resultaten | 3 | `common.geenResultaten` |
| Opnieuw proberen | 3 | `common.opnieuwProberen` |
| Weet u het zeker? | 3 | `common.weetUHetZeker` |

## Bijlage B — Impactmatrix per bestand

| Bestand | Strings | Complexiteit | Sprint |
|---------|--------:|:-------------|:------:|
| `Sidebar.tsx` | 15 | Laag | 1 |
| `Header.tsx` | 4 | Laag | 1 |
| `SearchDialog.tsx` | 15 | Middel | 1 |
| `ErrorBoundary.tsx` | 4 | Laag | 1 |
| `IdleWarningDialog.tsx` | 3 | Laag | 1 |
| `ShortcutsDialog.tsx` | 1 | Laag | 1 |
| `UnlockForm.tsx` | 6 | Middel | 2 |
| `SetupForm.tsx` | 12 | Middel | 2 |
| `HeirUnlockForm.tsx` | 8 | Middel | 2 |
| `ProfileSelector.tsx` | 12 | Middel | 2 |
| `PasswordStrengthMeter.tsx` | 9 | Laag | 2 |
| `page.tsx` (root) | 15 | Middel | 2 |
| `layout.tsx` (root) | 5 | Laag | 2 |
| `(auth) layout.tsx` | 5 | Laag | 2 |
| `dashboard/page.tsx` | 40 | Middel | 3 |
| `ProfielSuggesties.tsx` | 7 | Laag | 3 |
| `StatistiekenWidget.tsx` | 10 | Laag | 3 |
| `VoortgangGranulair.tsx` | 2 | Laag | 3 |
| `OnboardingWizard.tsx` | 20 | Middel | 3 |
| `WizardShell.tsx` | 7 | Laag | 3 |
| `eigenaar/page.tsx` | 60 | Hoog | 4 |
| `erfgenamen/page.tsx` | 80 | Hoog | 5 |
| `ErfbelastingCalculator.tsx` | 15 | Middel | 5 |
| `testament/page.tsx` | 70 | Hoog | 6 |
| `JuridischeCheck.tsx` | 12 | Hoog | 6 |
| `boedel/page.tsx` | 50 | Hoog | 7 |
| `digitaal-bezit/page.tsx` | 60 | Hoog | 7 |
| `uitvaart/page.tsx` | 70 | Hoog | 8 |
| `euthanasie/page.tsx` | 40 | Hoog | 8 |
| `donor/page.tsx` | 15 | Middel | 8 |
| `documenten/page.tsx` | 40 | Middel | 9 |
| `noodcontacten/page.tsx` | 40 | Middel | 9 |
| `NoodkaartQR.tsx` | 8 | Laag | 9 |
| `tijdlijn/page.tsx` | 60 | Middel | 9 |
| `audit-log/page.tsx` | 15 | Laag | 9 |
| `export/page.tsx` | 30 | Middel | 9 |
| `instellingen/page.tsx` | 120 | Hoog | 10 |
| `InterviewWizard.tsx` | 80 | Hoog | 10 |
| `PasswordGenerator.tsx` | 5 | Laag | 10 |
| `VoorbeeldDialog.tsx` | 2 | Laag | 10 |
| `DataHandtekening.tsx` | 2 | Laag | 10 |
| `NabestaandenDashboard.tsx` | 60 | Hoog | 10 |
| `afsluit-instructies.ts` | 300 | Middel | 10 |
| `voorbeeld-data.ts` | 200 | Middel | 10 |
| `useIdleTimer.ts` | 0 | — | — |
| `useKeyboardShortcuts.ts` | 18 | Laag | 10 |
| `authStore.ts` | 0 | — | — |
| `api-client.ts` | 1 | Laag | 1 |
| Controllers (10) | 80 | Middel | 11 |
| Middleware (2) | 6 | Laag | 11 |
| Services (8) | 155 | Hoog | 12 |
| Validators (5) | 10 | Laag | 11 |
| Electron (3) | 10 | Laag | 13 |
