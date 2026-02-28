# 8 — Internationalisering (i18n)

## Overzicht

Lumio ondersteunt **Nederlands** (standaard) en **Engels**. Vertalingen worden op drie niveaus beheerd:

| Laag | Technologie | Bestanden |
|------|-------------|-----------|
| Frontend (Next.js) | next-intl 4 | `messages/nl.json`, `messages/en.json` |
| Desktop (Electron) | Custom `t()` functie | Inline dictionary in `i18n.ts` |
| Backend (.NET) | `IStringLocalizer<T>` + `.resx` | `Resources/` directory |

## Frontend — next-intl

### Configuratie

```
src/lumio-web/
├── src/
│   ├── i18n/
│   │   └── request.ts                         # getRequestConfig() — locale uit localStorage
│   │                                          # laadt alleen root-bundle: shared+ui+auth+dashboard
│   ├── components/providers/
│   │   ├── LocaleProvider.tsx                 # Root NextIntlClientProvider (root-bundle)
│   │   └── DomainMessagesProvider.tsx         # Supplemental provider per domein
│   └── app/(authenticated)/
│       ├── layout.tsx                         # Authenticated shell (root-bundle)
│       ├── boedel/layout.tsx                  # → DomainMessagesProvider met boedel.json
│       ├── testament/layout.tsx               # → DomainMessagesProvider met testament.json
│       └── ... (15 domein-layouts totaal)
├── messages/
│   ├── nl/               # Bron-bestanden per domein (bewerk deze)
│   │   ├── shared.json   # common, nav, enums, feedback, errors, ...
│   │   ├── auth.json
│   │   ├── testament.json
│   │   └── ... (18 bestanden)
│   ├── en/               # Engelstalige equivalenten
│   │   └── ... (18 bestanden)
│   ├── nl.json           # ⚠ GEGENEREERD — niet handmatig bewerken
│   └── en.json           # ⚠ GEGENEREERD — niet handmatig bewerken
├── scripts/
│   └── merge-messages.ts # Combineert nl/* → nl.json, en/* → en.json
└── next.config.ts        # createNextIntlPlugin('./src/i18n/request.ts')
```

> **Belangrijk**: Bewerk altijd de bestanden in `messages/nl/` of `messages/en/`. De root-bestanden `nl.json` en `en.json` worden automatisch gegenereerd bij `npm run dev` en `npm run build` via de `predev`/`prebuild` hooks.

**Path alias**: `@messages/*` wijst naar `./messages/` (root van lumio-web). Gebruik deze alias in imports vanuit broncode:
```ts
import nlMessages from "@messages/nl/boedel.json";
```

**Locale-detectie** (statische export — geen server-side routing):
1. Client-side: lees `localStorage.getItem("lumio-locale")`
2. Build-time: default `"nl"`
3. Geen `middleware.ts` — locale is volledig client-side

### Berichtstructuur

Vertalingen zijn opgesplitst in **18 domeinbestanden** per taal. De root `nl.json`/`en.json` bestanden zijn het gegenereerde merge-resultaat en bevatten alle 46 namespaces.

#### Domeinbestanden en hun namespaces

| Bestand | Namespaces |
|---------|------------|
| `shared.json` | `common`, `nav`, `enums`, `feedback`, `errors`, `idle`, `verwijderBevestiging`, `sectieNotitie`, `domainStatus`, `search`, `shortcuts`, `wizard` |
| `auth.json` | `auth` (incl. alle sub-namespaces) |
| `dashboard.json` | `dashboard` (incl. alle sub-namespaces) |
| `erfgenamen.json` | `erfgenamen`, `erfbelasting`, `nabestaanden` |
| `testament.json` | `testament`, `testamentWizard` |
| `boedel.json` | `boedel` |
| `uitvaart.json` | `uitvaart`, `uitvaartWizard`, `noodkaartQR` |
| `euthanasie.json` | `euthanasie`, `euthanasieWizard` |
| `noodcontacten.json` | `noodcontacten` |
| `documenten.json` | `documenten` |
| `digitaal-bezit.json` | `digitaalBezit` |
| `eigenaar.json` | `eigenaar` |
| `donor.json` | `donor`, `donorWizard` |
| `videoboodschappen.json` | `videoboodschappen`, `voorbeeldData` |
| `instellingen.json` | `instellingen` |
| `export.json` | `exporteren`, `auditLog`, `afsluitInstructies` |
| `ui.json` | `personSelect`, `help`, `hulpteksten`, `legeStaten` |
| `misc.json` | `tijdlijn`, `interview`, `wachtwoordGenerator`, `juridischeCheck`, `dataHandtekening` |

Beide taalbestanden hadden voorheen een identieke structuur met 39 secties (nu 46):

| Sectie | ~Regels | Sectie | ~Regels |
|--------|---------|--------|---------|
| `common` | 10 | `nav` | 17 |
| `search` | 26 | `errors` | 4 |
| `idle` | 4 | `shortcuts` | 21 |
| `auth` | 76 | `dashboard` | 68 |
| `wizard` | 25 | `eigenaar` | 76 |
| `enums` | 148 | `erfgenamen` | 88 |
| `erfbelasting` | 17 | `testament` | 146 |
| `boedel` | 121 | `digitaalBezit` | 97 |
| `uitvaart` | 113 | `euthanasie` | 61 |
| `donor` | 21 | `documenten` | 47 |
| `noodcontacten` | 44 | `noodkaartQR` | 16 |
| `tijdlijn` | 11 | `auditLog` | 10 |
| `exporteren` | 43 | `juridischeCheck` | 14 |
| `sectieNotitie` | 8 | `dataHandtekening` | 4 |
| `wachtwoordGenerator` | 7 | `afsluitInstructies` | 30 |
| `instellingen` | 140 | `nabestaanden` | 37 |
| `interview` | 10 | `voorbeeldData` | 50 |
| `personSelect` | 6 | `domainStatus` | 10 |
| `testamentWizard` | 89 | `euthanasieWizard` | 102 |
| `donorWizard` | 56 | `uitvaartWizard` | 113 |
| `videoboodschappen` | 28 | | |

### Runtime Bundle-splitsing

Om de initiële laadtijd te beperken, wordt de i18n-bundle per route gesplitst:

#### Root-bundle (~36 KB)

De `LocaleProvider` (en `request.ts` voor server-side) laadt altijd de volgende vier bestanden:

| Bestand | Reden |
|---------|-------|
| `shared.json` | Cross-cutting namespaces aanwezig op elke pagina |
| `ui.json` | Generieke UI-componenten (`personSelect`, `help`, etc.) |
| `auth.json` | `auth.sessie` gebruikt in `(authenticated)/layout.tsx` |
| `dashboard.json` | `NotificationsDropdown` (altijd zichtbaar in de Header) |

#### Domein-bundle (per route)

Elk domein-route-segment heeft een eigen `layout.tsx` die een `DomainMessagesProvider` rendert met de bijbehorende domain-JSON statisch geïmporteerd (beide talen):

```tsx
// bijv. src/app/(authenticated)/boedel/layout.tsx
import { DomainMessagesProvider } from "@/components/providers/DomainMessagesProvider";
import nlMessages from "@messages/nl/boedel.json";
import enMessages from "@messages/en/boedel.json";

const MESSAGES = { nl: nlMessages, en: enMessages };

export default function BoedelLayout({ children }) {
  return <DomainMessagesProvider messages={MESSAGES}>{children}</DomainMessagesProvider>;
}
```

#### `DomainMessagesProvider`

`src/components/providers/DomainMessagesProvider.tsx` is een client-component dat:
1. De actieve locale leest via `useLocale()`
2. De volledige parent-berichten leest via `useMessages()` (root-bundle)
3. De domein-namespaces samenvoegt met de parent-berichten (`{ ...parentMessages, ...domainMessages }`)
4. Alles terbeschikking stelt via een geneste `NextIntlClientProvider`

> **Belangrijk**: next-intl v4 merget geneste providers **niet** automatisch. De `DomainMessagesProvider` handelt dit expliciet af via `useMessages()`.

Domein-routes waarvoor **geen** eigen layout nodig is (namespaces zitten al in root-bundle):
- `dashboard/` — `dashboard.json` is onderdeel van de root-bundle
- `help/` — `help` en `hulpteksten` zitten in `ui.json` (root-bundle)

### Gebruik in Componenten

```tsx
import { useTranslations } from "next-intl";

function MijnComponent() {
  const t = useTranslations("dashboard");
  return <h1>{t("titel")}</h1>;
}
```

## Desktop — Electron

`src/lumio-desktop/src/main/i18n.ts` bevat een compacte vertaalmodule:

- **Inline dictionary** met sleutels: `windowTitle`, `errorStartTitle`, `errorStartBody`, `noAutoBackupConfigured`, `backupDirNotFound`, `backupApiError`, `backupTimeout`, `selectBackupLocation`
- **`loadLocale(dataDir)`** — leest `locale.txt` uit de data-directory
- **`persistLocale(dataDir, locale)`** — schrijft locale naar schijf
- **`t(key, params?)`** — vertaalfunctie met `{placeholder}` ondersteuning

De taalinstelling wordt gesynchroniseerd met de frontend: het preload script schrijft `locale.txt` bij een taalwissel.

## Backend — .NET Localization

### Configuratie in Program.cs

```csharp
builder.Services.AddLocalization(options => options.ResourcesPath = "Resources");

app.UseRequestLocalization(options =>
{
    options.SetDefaultCulture("nl")
        .AddSupportedCultures(supportedCultures)
        .AddSupportedUICultures(supportedCultures);
});
```

De backend bepaalt de taal op basis van het `Accept-Language` HTTP-header dat de frontend meestuurt.

### Resource-bestanden (16 .resx bestanden)

| Pad | Doel |
|-----|------|
| `Resources/Services/Pdf/LumioPdfService.resx` (+`.en.resx`) | PDF-export labels |
| `Resources/Rules/Services/SuggestieService.resx` (+`.en.resx`) | Suggestieberichten |
| `Resources/Rules/Services/MeldingService.resx` (+`.en.resx`) | Waarschuwingen en herinneringen |
| `Resources/Rules/Services/CompleetheidsService.resx` (+`.en.resx`) | Compleetheids-domeinlabels |
| `Resources/Controllers/TestamentController.resx` (+`.en.resx`) | Testament-controllerberichten |
| `Resources/Controllers/StatusController.resx` (+`.en.resx`) | Status-controllerberichten |
| `Resources/Controllers/ExportController.resx` (+`.en.resx`) | Export-controllerberichten |
| `Resources/Controllers/AfhandelingController.resx` (+`.en.resx`) | Afhandeling-checklistlabels |

### Gebruik in Services/Controllers

```csharp
public class MeldingService
{
    private readonly IStringLocalizer<MeldingService> _localizer;

    public MeldingService(IStringLocalizer<MeldingService> localizer)
    {
        _localizer = localizer;
    }

    public string GetWarning() => _localizer["GeenTestament"];
}
```

## Taalwissel Flow

```
Gebruiker kiest taal in Instellingen
  ├── Frontend: localStorage.setItem("lumio-locale", "en")
  ├── Frontend: pagina herlaadt met nieuwe locale
  ├── Electron: IPC → persistLocale() → locale.txt
  └── Backend: Accept-Language header bij elk request
```

## Nieuwe Vertalingen Toevoegen

### Frontend (Next.js)

1. Voeg de sleutel toe aan het juiste domeinbestand in `messages/nl/<domein>.json`
2. Voeg de Engelse vertaling toe aan hetzelfde bestand in `messages/en/<domein>.json`
3. De `predev`-hook merget automatisch bij `npm run dev`; of voer handmatig uit: `npm run merge-messages`
4. Gebruik altijd `useTranslations("namespace")` in componenten — nooit hardcoded tekst

> **Nieuwe namespace**: Als je een compleet nieuwe namespace toevoegt, maak dan een nieuw domeinbestand aan of voeg de namespace toe aan het meest passende bestaande domeinbestand.

### Backend (.NET)

1. Voeg de sleutel toe aan het juiste `.resx`-bestand én het `.en.resx`-equivalent
