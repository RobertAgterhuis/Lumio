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
├── src/i18n/
│   └── request.ts       # getRequestConfig() — locale uit localStorage
├── messages/
│   ├── nl.json           # ~1800 vertalingen
│   └── en.json           # ~1800 vertalingen
└── next.config.ts        # createNextIntlPlugin('./src/i18n/request.ts')
```

**Locale-detectie** (statische export — geen server-side routing):
1. Client-side: lees `localStorage.getItem("lumio-locale")`
2. Build-time: default `"nl"`
3. Geen `middleware.ts` — locale is volledig client-side

### Berichtstructuur

Beide taalbestanden hebben een identieke structuur met 39 secties:

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

1. Voeg de sleutel toe aan zowel `nl.json` als `en.json`
2. Voor backend-berichten: voeg toe aan het juiste `.resx`-bestand en het `.en.resx`-equivalent
3. Gebruik altijd `useTranslations()` in componenten — nooit hardcoded tekst
