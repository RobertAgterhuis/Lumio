# 8 — Internationalization (i18n)

## Overview

Lumio supports **Dutch** (default) and **English**. Translations are managed at three levels:

| Layer | Technology | Files |
|-------|------------|-------|
| Frontend (Next.js) | next-intl 4 | `messages/nl.json`, `messages/en.json` |
| Desktop (Electron) | Custom `t()` function | Inline dictionary in `i18n.ts` |
| Backend (.NET) | `IStringLocalizer<T>` + `.resx` | `Resources/` directory |

## Frontend — next-intl

### Configuration

```
src/lumio-web/
├── src/i18n/
│   └── request.ts       # getRequestConfig() — locale from localStorage
├── messages/
│   ├── nl.json           # ~1800 translations
│   └── en.json           # ~1800 translations
└── next.config.ts        # createNextIntlPlugin('./src/i18n/request.ts')
```

**Locale detection** (static export — no server-side routing):
1. Client-side: read `localStorage.getItem("lumio-locale")`
2. Build-time: default `"nl"`
3. No `middleware.ts` — locale is entirely client-side

### Message Structure

Both language files have an identical structure with 39 sections:

| Section | ~Lines | Section | ~Lines |
|---------|--------|---------|--------|
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

### Usage in Components

```tsx
import { useTranslations } from "next-intl";

function MyComponent() {
  const t = useTranslations("dashboard");
  return <h1>{t("titel")}</h1>;
}
```

## Desktop — Electron

`src/lumio-desktop/src/main/i18n.ts` contains a compact translation module:

- **Inline dictionary** with keys: `windowTitle`, `errorStartTitle`, `errorStartBody`, `noAutoBackupConfigured`, `backupDirNotFound`, `backupApiError`, `backupTimeout`, `selectBackupLocation`
- **`loadLocale(dataDir)`** — reads `locale.txt` from the data directory
- **`persistLocale(dataDir, locale)`** — writes locale to disk
- **`t(key, params?)`** — translation function with `{placeholder}` support

The language setting is synchronized with the frontend: the preload script writes `locale.txt` on a language switch.

## Backend — .NET Localization

### Configuration in Program.cs

```csharp
builder.Services.AddLocalization(options => options.ResourcesPath = "Resources");

app.UseRequestLocalization(options =>
{
    options.SetDefaultCulture("nl")
        .AddSupportedCultures(supportedCultures)
        .AddSupportedUICultures(supportedCultures);
});
```

The backend determines the language based on the `Accept-Language` HTTP header sent by the frontend.

### Resource Files (16 .resx files)

| Path | Purpose |
|------|---------|
| `Resources/Services/Pdf/LumioPdfService.resx` (+`.en.resx`) | PDF export labels |
| `Resources/Rules/Services/SuggestieService.resx` (+`.en.resx`) | Suggestion messages |
| `Resources/Rules/Services/MeldingService.resx` (+`.en.resx`) | Warnings and reminders |
| `Resources/Rules/Services/CompleetheidsService.resx` (+`.en.resx`) | Completeness domain labels |
| `Resources/Controllers/TestamentController.resx` (+`.en.resx`) | Testament controller messages |
| `Resources/Controllers/StatusController.resx` (+`.en.resx`) | Status controller messages |
| `Resources/Controllers/ExportController.resx` (+`.en.resx`) | Export controller messages |
| `Resources/Controllers/AfhandelingController.resx` (+`.en.resx`) | Settlement checklist labels |

### Usage in Services/Controllers

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

## Language Switch Flow

```
User selects language in Settings
  ├── Frontend: localStorage.setItem("lumio-locale", "en")
  ├── Frontend: page reloads with new locale
  ├── Electron: IPC → persistLocale() → locale.txt
  └── Backend: Accept-Language header on every request
```

## Adding New Translations

1. Add the key to both `nl.json` and `en.json`
2. For backend messages: add to the appropriate `.resx` file and the `.en.resx` equivalent
3. Always use `useTranslations()` in components — never hardcoded text
