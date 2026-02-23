# Implementatieplan Meertaligheid — Sprintoverzicht

> **Versie:** 1.0  
> **Datum:** 23 februari 2026  
> **Referentie:** `Analyse/MultiLanguage/MULTI-LANGUAGE-ANALYSIS.md`  
> **Sprint duur:** 1 week per sprint (flexibel)

---

## Uitgangspunten

1. **Veiligheid boven snelheid** — Elke sprint levert een werkende, volledig functionele app op.
2. **NL-eerst** — De Nederlandse UX blijft op elk moment 100% intact.
3. **Incrementeel** — Per sprint worden specifieke bestanden gemigreerd; niet-gemigreerde bestanden blijven ongewijzigd werken.
4. **Verificatie** — Na elke sprint wordt de NL-versie visueel vergeleken met de huidige UX.

---

## Overzicht

```
Sprint  1: Infrastructuur + i18n framework       (~  40 strings)
Sprint  2: Auth & login flow                      (~  72 strings)
Sprint  3: Dashboard & navigatie                  (~  86 strings)
Sprint  4: Eigenaar (Mijn Profiel)                (~  60 strings)
Sprint  5: Erfgenamen + Erfbelasting              (~  95 strings)
Sprint  6: Testament + Juridische check           (~  82 strings)
Sprint  7: Boedel + Digitaal Bezit                (~ 110 strings)
Sprint  8: Uitvaart + Euthanasie + Donor          (~ 125 strings)
Sprint  9: Documenten + Noodcontacten + Overig    (~ 153 strings)
Sprint 10: Data-bestanden + Resterende componenten(~ 270 strings)  (FRONTEND COMPLEET)
Sprint 11: Backend controllers + middleware + val. (~  96 strings)
Sprint 12: Backend services + PDF                 (~ 155 strings)
Sprint 13: Electron + Engelse vertalingen + QA    (~  10 strings + EN)
────────────────────────────────────────────────────────────────────
Totaal:                                             ~1.354 strings (excl. dubbelen)
                                                    + ~1.354 Engelse vertalingen
```

---

## Sprint 1 — Infrastructuur & framework setup

**Doel:** next-intl geïnstalleerd en werkend. Eerste bestanden gemigreerd als proof of concept. Alle bestaande functionaliteit blijft 100% intact.

### Taken

| # | Taak | Bestanden | Strings |
|---|------|-----------|--------:|
| 1.1 | `npm install next-intl` | package.json | 0 |
| 1.2 | Configureer next-intl plugin | next.config.ts | 0 |
| 1.3 | Maak `i18n/request.ts` configuratie | nieuw bestand | 0 |
| 1.4 | Maak `messages/nl.json` met `common` + `nav` namespaces | nieuw bestand | ~35 |
| 1.5 | Maak `messages/en.json` als kopie (nog niet vertaald) | nieuw bestand | ~35 |
| 1.6 | Wrap root layout met `NextIntlClientProvider` | layout.tsx | 2 |
| 1.7 | Maak `<html lang={locale}>` dynamisch | layout.tsx | 1 |
| 1.8 | Pas `Accept-Language` header toe in api-client.ts | api-client.ts | 1 |
| 1.9 | Migreer Sidebar.tsx | Sidebar.tsx | 15 |
| 1.10 | Migreer Header.tsx | Header.tsx | 4 |
| 1.11 | Migreer SearchDialog.tsx | SearchDialog.tsx | 15 |
| 1.12 | Migreer ErrorBoundary.tsx | ErrorBoundary.tsx | 4 |
| 1.13 | Migreer IdleWarningDialog.tsx | IdleWarningDialog.tsx | 3 |
| 1.14 | Migreer ShortcutsDialog.tsx | ShortcutsDialog.tsx | 1 |
| 1.15 | Build verificatie + visuele test | — | 0 |

**Acceptatiecriteria:**
- [x] `npm run build` slaagt
- [x] App start in NL — alle teksten identiek aan huidige versie
- [x] `useTranslations("nav")` werkt in Sidebar
- [x] ICU interpolatie werkt in IdleWarningDialog
- [x] Accept-Language header wordt meegezonden naar backend
- [x] Type-checking op vertaalkeys werkt

**Opgeleverd:** ~40 strings gemigreerd, framework operationeel.

**Technische details:**

```typescript
// src/i18n/request.ts
import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async () => {
  // Static export: lees locale uit localStorage (client-side)
  // Fallback naar 'nl' als eerste keer
  const locale = typeof window !== "undefined"
    ? localStorage.getItem("lumio-locale") ?? "nl"
    : "nl";

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
```

```typescript
// next.config.ts
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default withNextIntl(nextConfig);
```

```typescript
// api-client.ts — Accept-Language header toevoegen
function getLocale(): string {
  if (typeof window !== "undefined") {
    return localStorage.getItem("lumio-locale") ?? "nl";
  }
  return "nl";
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...options?.headers,
      "Accept-Language": getLocale(),
    },
  });
  // ... rest ongewijzigd
}
```

---

## Sprint 2 — Auth & login flow

**Doel:** Het complete login- en setupproces is meertalig. De taalkeuze verschijnt voor het eerst.

### Taken

| # | Taak | Bestanden | Strings |
|---|------|-----------|--------:|
| 2.1 | Voeg `auth` namespace toe aan nl.json/en.json | messages/*.json | ~72 |
| 2.2 | Bouw taalkeuze-dropdown (LanguageSelector component) | nieuw bestand | 2 |
| 2.3 | Integreer taalkeuze in ProfileSelector (eerste scherm) | ProfileSelector.tsx | 12 |
| 2.4 | Migreer SetupForm.tsx | SetupForm.tsx | 12 |
| 2.5 | Migreer UnlockForm.tsx | UnlockForm.tsx | 6 |
| 2.6 | Migreer HeirUnlockForm.tsx | HeirUnlockForm.tsx | 8 |
| 2.7 | Migreer PasswordStrengthMeter.tsx | PasswordStrengthMeter.tsx | 9 |
| 2.8 | Migreer page.tsx (root) | page.tsx | 15 |
| 2.9 | Migreer authenticated layout.tsx | (auth)/layout.tsx | 5 |
| 2.10 | Migreer root layout.tsx metadata | layout.tsx | 5 |
| 2.11 | Build verificatie + visuele test | — | 0 |

**Acceptatiecriteria:**
- [x] Taalkeuze dropdown zichtbaar op het profielscherm
- [x] Na taalkeuze herlaadt de app in de gekozen taal
- [x] Login, setup en heir-unlock werken in beide talen
- [x] Wachtwoordsterkte-indicator werkt in beide talen
- [x] `localStorage["lumio-locale"]` wordt correct opgeslagen

**Taalkeuze-component ontwerp:**

```tsx
// components/common/LanguageSelector.tsx
import { useTranslations } from "next-intl";

const LANGUAGES = [
  { code: "nl", label: "Nederlands", flag: "🇳🇱" },
  { code: "en", label: "English", flag: "🇬🇧" },
  // Toekomstige talen hier toevoegen
] as const;

export function LanguageSelector() {
  const handleChange = (locale: string) => {
    localStorage.setItem("lumio-locale", locale);
    window.location.reload(); // Herlaad om nieuwe locale te laden
  };
  // ...
}
```

> **Let op:** Taalnamen staan in de **eigen taal** (Nederlands, English) — niet vertaald.
> Dit is internationaal de standaard (een Duitser zoekt "Deutsch", niet "German").

---

## Sprint 3 — Dashboard & navigatie

**Doel:** Het dashboard en alle navigatie-elementen zijn meertalig.

### Taken

| # | Taak | Bestanden | Strings |
|---|------|-----------|--------:|
| 3.1 | Voeg `dashboard` + `wizard` namespaces toe | messages/*.json | ~86 |
| 3.2 | Migreer dashboard/page.tsx | dashboard/page.tsx | 40 |
| 3.3 | Migreer ProfielSuggesties.tsx | ProfielSuggesties.tsx | 7 |
| 3.4 | Migreer StatistiekenWidget.tsx | StatistiekenWidget.tsx | 10 |
| 3.5 | Migreer VoortgangGranulair.tsx | VoortgangGranulair.tsx | 2 |
| 3.6 | Migreer OnboardingWizard.tsx | OnboardingWizard.tsx | 20 |
| 3.7 | Migreer WizardShell.tsx | WizardShell.tsx | 7 |
| 3.8 | Verifieer datum/valuta formatting op dashboard | — | 0 |
| 3.9 | Build verificatie + visuele test | — | 0 |

**Acceptatiecriteria:**
- [x] Dashboard toont alle 10 domeinkkaarten in de juiste taal
- [x] Voortgangspercentage gebruikt ICU interpolatie
- [x] Valutabedragen formatteren correct (€1.234,56 vs €1,234.56)
- [x] Onboarding wizard werkt in beide talen
- [x] Suggesties-widget toont correcte pluralisatie

---

## Sprint 4 — Eigenaar (Mijn Profiel)

**Doel:** De profielpagina is volledig meertalig, inclusief alle formuliervelden en toasts.

### Taken

| # | Taak | Bestanden | Strings |
|---|------|-----------|--------:|
| 4.1 | Voeg `eigenaar` namespace toe | messages/*.json | ~60 |
| 4.2 | Voeg `enums` namespace toe (burgerlijkeStaat, legitimatie) | messages/*.json | ~12 |
| 4.3 | Migreer eigenaar/page.tsx | eigenaar/page.tsx | 60 |
| 4.4 | Verifieer react-hook-form validatiemeldingen | eigenaar/page.tsx | — |
| 4.5 | Verifieer foto-upload foutmeldingen | eigenaar/page.tsx | — |
| 4.6 | Build verificatie + visuele test | — | 0 |

**Acceptatiecriteria:**
- [x] Alle formulierlabels vertaald
- [x] Select-opties (burgerlijke staat, legitimatie) in juiste taal
- [x] Toast-meldingen (opslaan, fout) vertaald
- [x] Datumvelden formatteren correct per locale
- [x] Help-tooltips vertaald

---

## Sprint 5 — Erfgenamen + Erfbelasting

**Doel:** De erfgenamenpagina inclusief Shamircodes en erfbelastingcalculator is meertalig.

### Taken

| # | Taak | Bestanden | Strings |
|---|------|-----------|--------:|
| 5.1 | Voeg `erfgenamen` namespace toe | messages/*.json | ~80 |
| 5.2 | Voeg `enums.relatie` namespace toe | messages/*.json | ~7 |
| 5.3 | Migreer erfgenamen/page.tsx | erfgenamen/page.tsx | 80 |
| 5.4 | Migreer ErfbelastingCalculator.tsx | ErfbelastingCalculator.tsx | 15 |
| 5.5 | Verifieer Shamir-sectie meldingen | erfgenamen/page.tsx | — |
| 5.6 | Verifieer valuta-formatting in erfbelastingtabel | — | — |
| 5.7 | Build verificatie + visuele test | — | 0 |

**Acceptatiecriteria:**
- [x] Relatie-dropdown vertaald
- [x] Shamir noodcode-instructies vertaald
- [x] Erfbelastingtabel labels en waarden correct per taal
- [x] Bezittingstoewijzing interface vertaald
- [x] Tariefgroep-namen vertaald

---

## Sprint 6 — Testament + Juridische check

**Doel:** Testament en juridische controle meertalig, met correcte behandeling van NL juridische termen.

### Taken

| # | Taak | Bestanden | Strings |
|---|------|-----------|--------:|
| 6.1 | Voeg `testament` namespace toe | messages/*.json | ~70 |
| 6.2 | Migreer testament/page.tsx | testament/page.tsx | 70 |
| 6.3 | Migreer JuridischeCheck.tsx | JuridischeCheck.tsx | 12 |
| 6.4 | Vertaal juridische disclaimers met NL-referentie behoud | — | — |
| 6.5 | Build verificatie + visuele test | — | 0 |

**Acceptatiecriteria:**
- [x] Testamentpagina volledig vertaald
- [x] Juridische check meldingen vertaald
- [x] NL wetsartikelen behouden als referentie in EN versie (bijv. "Civil Code Book 4 (BW Boek 4)")
- [x] CTR-nummer label vertaald
- [x] Versiegeschiedenis correct vertaald
- [x] Severity labels (Hoog/Middel/Informatief) vertaald

**Juridische vertaaladviezen:**

| NL term | EN vertaling | Notities |
|---------|-------------|----------|
| legitimaire portie | legitimate portion (legitimaire portie) | NL term behouden als referentie |
| uitsluitingsclausule | exclusion clause | — |
| codicil | codicil | Zelfde term in EN |
| executeur | executor | — |
| CTR | CTR | Acroniem blijft |
| BW Boek 4 | Civil Code Book 4 (BW Boek 4) | NL referentie behouden |

---

## Sprint 7 — Boedel + Digitaal Bezit

**Doel:** Financiële pagina's meertalig, inclusief valuta-formatting.

### Taken

| # | Taak | Bestanden | Strings |
|---|------|-----------|--------:|
| 7.1 | Voeg `boedel` + `digitaalBezit` namespaces toe | messages/*.json | ~110 |
| 7.2 | Voeg `enums.bezitType`, `schuldType`, `rekeningType` toe | messages/*.json | ~20 |
| 7.3 | Migreer boedel/page.tsx | boedel/page.tsx | 50 |
| 7.4 | Migreer digitaal-bezit/page.tsx | digitaal-bezit/page.tsx | 60 |
| 7.5 | Verifieer valuta-formatting op boedelpagina | — | — |
| 7.6 | Verifieer IBAN-label en crypto-sectie | — | — |
| 7.7 | Build verificatie + visuele test | — | 0 |

**Acceptatiecriteria:**
- [x] Alle boedel-tabs vertaald (Bankrekeningen, Bezittingen, etc.)
- [x] Vermogenssoort (Privé/Gemeenschap) vertaald
- [x] Digitale accounts categorieën vertaald
- [x] Gewenste actie opties vertaald
- [x] Password import instructies vertaald
- [x] Valuta correct geformateerd per locale

---

## Sprint 8 — Uitvaart + Euthanasie + Donor

**Doel:** Drie juridisch gevoelige pagina's meertalig.

### Taken

| # | Taak | Bestanden | Strings |
|---|------|-----------|--------:|
| 8.1 | Voeg `uitvaart`, `euthanasie`, `donor` namespaces toe | messages/*.json | ~125 |
| 8.2 | Migreer uitvaart/page.tsx | uitvaart/page.tsx | 70 |
| 8.3 | Migreer euthanasie/page.tsx | euthanasie/page.tsx | 40 |
| 8.4 | Migreer donor/page.tsx | donor/page.tsx | 15 |
| 8.5 | Vertaal juridische disclaimers (WGBO, Wtl, Donorwet) | — | — |
| 8.6 | Build verificatie + visuele test | — | 0 |

**Acceptatiecriteria:**
- [x] Uitvaart-wensen volledig vertaald
- [x] Ceremonieverloop CRUD vertaald
- [x] Genodigdenlijst vertaald
- [x] Euthanasie wilsverklaring vertaald met WGBO/Wtl referenties
- [x] Donor-pagina met Donorwet referenties vertaald
- [x] Disclaimers over NL-specifieke wetgeving toegevoegd in EN

---

## Sprint 9 — Documenten + Noodcontacten + Overige pagina's

**Doel:** Alle overige pagina's meertalig.

### Taken

| # | Taak | Bestanden | Strings |
|---|------|-----------|--------:|
| 9.1 | Voeg namespaces toe voor 6 pagina's | messages/*.json | ~153 |
| 9.2 | Migreer documenten/page.tsx | documenten/page.tsx | 40 |
| 9.3 | Migreer noodcontacten/page.tsx | noodcontacten/page.tsx | 40 |
| 9.4 | Migreer NoodkaartQR.tsx | NoodkaartQR.tsx | 8 |
| 9.5 | Migreer tijdlijn/page.tsx | tijdlijn/page.tsx | 60 |
| 9.6 | Migreer audit-log/page.tsx | audit-log/page.tsx | 15 |
| 9.7 | Migreer export/page.tsx | export/page.tsx | 30 |
| 9.8 | Verifieer datumformattering audit-log | — | — |
| 9.9 | Build verificatie + visuele test | — | 0 |

**Acceptatiecriteria:**
- [x] Documentencategorieën vertaald
- [x] Noodcontact-rollen vertaald
- [x] QR-code inhoud vertaald
- [x] Volledige tijdlijn (19 stappen) vertaald
- [x] Auditlog-filters en actie-labels vertaald
- [x] Export-formaten en labels vertaald
- [x] Datums formatteren correct in auditlog

---

## Sprint 10 — Data-bestanden + resterende componenten

**Doel:** Alle overige frontend-bestanden meertalig. **Frontend migratie is hierna 100% compleet.**

### Taken

| # | Taak | Bestanden | Strings |
|---|------|-----------|--------:|
| 10.1 | Migreer afsluit-instructies.ts → namespace `afsluitInstructies` | afsluit-instructies.ts | ~300 |
| 10.2 | Migreer voorbeeld-data.ts → namespace `voorbeeldData` | voorbeeld-data.ts | ~200 |
| 10.3 | Migreer instellingen/page.tsx | instellingen/page.tsx | 120 |
| 10.4 | Migreer InterviewWizard.tsx | InterviewWizard.tsx | 80 |
| 10.5 | Migreer NabestaandenDashboard.tsx | NabestaandenDashboard.tsx | 60 |
| 10.6 | Migreer PasswordGenerator.tsx | PasswordGenerator.tsx | 5 |
| 10.7 | Migreer VoorbeeldDialog.tsx | VoorbeeldDialog.tsx | 2 |
| 10.8 | Migreer DataHandtekening.tsx | DataHandtekening.tsx | 2 |
| 10.9 | Migreer SectieNotitie.tsx | SectieNotitie.tsx | 6 |
| 10.10 | Migreer useKeyboardShortcuts.ts | useKeyboardShortcuts.ts | 18 |
| 10.11 | Voeg taalkeuze toe aan instellingen | instellingen/page.tsx | 3 |
| 10.12 | Volledige frontend build + regressietest | — | 0 |

**Acceptatiecriteria:**
- [x] Instellingenpagina volledig vertaald inclusief profiel CRUD
- [x] Taalkeuze beschikbaar in instellingen
- [x] Interview wizard (alle 5 secties) vertaald
- [x] Nabestaandendashboard vertaald
- [x] Afsluit-instructies voor 28 platforms vertaald
- [x] Voorbeeld-data voor 9 domeinen vertaald
- [x] Sneltoetsbeschrijvingen vertaald
- [x] **Alle frontend strings zijn geëxternaliseerd** ✅
- [x] Volledige NL regressietest: visueel identiek aan referentiescreenshots

---

## Sprint 11 — Backend controllers + middleware + validators

**Doel:** Alle backend foutmeldingen, middleware-berichten en validatiemeldingen zijn meertalig via `IStringLocalizer`.

### Taken

| # | Taak | Bestanden | Strings |
|---|------|-----------|--------:|
| 11.1 | Configureer `AddLocalization()` + `RequestLocalizationMiddleware` | Program.cs | 0 |
| 11.2 | Maak `Resources/` mappenstructuur | meerdere .resx | 0 |
| 11.3 | Migreer AuthController | AuthController.cs + .resx paar | ~20 |
| 11.4 | Migreer overige controllers (9 stuks) | 9 controllers + .resx paren | ~60 |
| 11.5 | Migreer DatabaseUnlockMiddleware | Middleware + .resx paar | ~3 |
| 11.6 | Migreer ExceptionHandlingMiddleware | Middleware + .resx paar | ~3 |
| 11.7 | Migreer FluentValidation WithMessage strings | 5 validators | ~10 |
| 11.8 | Build verificatie + test met Accept-Language: en | — | 0 |

**Acceptatiecriteria:**
- [x] API retourneert NL foutmeldingen bij `Accept-Language: nl`
- [x] API retourneert EN foutmeldingen bij `Accept-Language: en`
- [x] API retourneert NL als fallback zonder header
- [x] Validatiemeldingen vertaald
- [x] Middleware-meldingen vertaald

**Technische details:**

```csharp
// Program.cs
builder.Services.AddLocalization(options => options.ResourcesPath = "Resources");

// Middleware volgorde
app.UseRequestLocalization(); // ← NA UseRouting, VOOR endpoints

// Controller patroon
public class AuthController(
    LumioDbContext db,
    IStringLocalizer<AuthController> L,
    IOptions<LimietenOptions> limieten
) : ControllerBase
{
    [HttpPost("ontgrendel")]
    public IActionResult Ontgrendel(OntgrendelRequest req)
    {
        if (!valid)
            return BadRequest(new { error = L["OngeldigWachtwoord"].Value });
        return Ok(new { bericht = L["DatabaseOntgrendeld"].Value });
    }
}
```

```xml
<!-- Resources/Controllers/AuthController.nl.resx -->
<data name="OngeldigWachtwoord" xml:space="preserve">
  <value>Ongeldig wachtwoord.</value>
</data>
<data name="DatabaseOntgrendeld" xml:space="preserve">
  <value>Database ontgrendeld.</value>
</data>

<!-- Resources/Controllers/AuthController.en.resx -->
<data name="OngeldigWachtwoord" xml:space="preserve">
  <value>Invalid password.</value>
</data>
<data name="DatabaseOntgrendeld" xml:space="preserve">
  <value>Database unlocked.</value>
</data>
```

---

## Sprint 12 — Backend services + PDF

**Doel:** Alle backend-services en de volledige PDF-generatie zijn meertalig.

### Taken

| # | Taak | Bestanden | Strings |
|---|------|-----------|--------:|
| 12.1 | Migreer MeldingService | MeldingService.cs + .resx paar | ~15 |
| 12.2 | Migreer SuggestieService | SuggestieService.cs + .resx paar | ~20 |
| 12.3 | Migreer CompleetheidsService | CompleetheidsService.cs + .resx paar | ~10 |
| 12.4 | Migreer ErfbelastingOptions labels | ErfbelastingOptions.cs + .resx paar | ~8 |
| 12.5 | Migreer ProfileService | ProfileService.cs + .resx paar | ~5 |
| 12.6 | Migreer overige services | 3 services + .resx paren | ~12 |
| 12.7 | Migreer LumioPdfService | LumioPdfService.cs + .resx paar | ~100 |
| 12.8 | Verifieer PDF in beide talen | — | 0 |
| 12.9 | Build verificatie + integratietest | — | 0 |

**Acceptatiecriteria:**
- [x] Meldingen/suggesties retourneren in juiste taal
- [x] Compleetheids-domeinnamen vertaald
- [x] Erfbelasting-groepnamen vertaald
- [x] PDF-export in NL bij NL-instelling
- [x] PDF-export in EN bij EN-instelling
- [x] Alle section headers, labels en fallbacktekst in PDF vertaald

**PDF-migratie patroon:**

```csharp
// LumioPdfService — huidige situatie
AddRow(table, "Naam", eigenaar.Naam);
AddSectionHeader(table, "Testament");

// LumioPdfService — na migratie
AddRow(table, L["Naam"], eigenaar.Naam);
AddSectionHeader(table, L["Testament"]);
```

> **Let op:** De *data* (bijv. eigenaar.Naam = "Pieter de Vries") wordt **niet** vertaald.
> Alleen labels, headers en fallbacktekst worden vertaald.

---

## Sprint 13 — Electron + Engelse vertalingen + QA

**Doel:** Electron shell meertalig. Alle Engelse vertalingen volledig en geverifieerd. Volledige QA.

### Taken

| # | Taak | Bestanden | Strings |
|---|------|-----------|--------:|
| 13.1 | Maak Electron i18n module | nieuw bestand i18n.ts | ~10 |
| 13.2 | Migreer window.ts title | window.ts | 1 |
| 13.3 | Migreer error dialogen | index.ts | 3 |
| 13.4 | Migreer autobackup labels | autobackup.ts | 4 |
| 13.5 | Synchroniseer taalinstelling frontend ↔ Electron | preload.ts | 2 |
| 13.6 | **Volledige review messages/en.json** | en.json | ~1.100 |
| 13.7 | **Volledige review backend .en.resx bestanden** | ~15 .resx | ~400 |
| 13.8 | Schrijf CI-script: key-vergelijking nl ↔ en | nieuw script | 0 |
| 13.9 | E2E test: volledige app-flow in NL | — | 0 |
| 13.10 | E2E test: volledige app-flow in EN | — | 0 |
| 13.11 | E2E test: taalwisseling NL → EN → NL | — | 0 |
| 13.12 | Build verificatie (desktop + web) | — | 0 |

**Acceptatiecriteria:**
- [x] Electron window title in juiste taal
- [x] Error dialogen in juiste taal
- [x] Alle EN vertalingen zijn betekenisvol (geen copy-paste van NL)
- [x] Juridische termen hebben correcte EN vertalingen met NL-referenties
- [x] CI-script detecteert ontbrekende keys
- [x] **Volledige app werkt foutloos in NL ✅**
- [x] **Volledige app werkt foutloos in EN ✅**
- [x] Taalwisseling mid-sessie werkt correct

---

## Post-implementatie: nieuwe taal toevoegen (handleiding)

Na Sprint 13 is het framework compleet. Een nieuwe taal toevoegen vereist:

### Stap 1: Frontend

```bash
# Kopieer NL als basis
cp messages/nl.json messages/de.json
# Vertaal alle waarden in de.json
```

### Stap 2: Backend

```bash
# Voor elke .nl.resx, maak een .de.resx kopie
# Vertaal alle <value> elementen
```

### Stap 3: Configuratie (3 plaatsen)

```typescript
// 1. next.config.ts — geen wijziging nodig (next-intl detecteert bestanden automatisch)

// 2. Program.cs
var supportedCultures = new[] { "nl", "en", "de" }; // ← voeg toe

// 3. Electron i18n.ts
const messages = {
  nl: { ... },
  en: { ... },
  de: { ... },  // ← voeg toe
};

// 4. LanguageSelector.tsx
const LANGUAGES = [
  { code: "nl", label: "Nederlands", flag: "🇳🇱" },
  { code: "en", label: "English",    flag: "🇬🇧" },
  { code: "de", label: "Deutsch",    flag: "🇩🇪" },  // ← voeg toe
];
```

**Geschatte doorlooptijd per extra taal:** 2-3 dagen (vertalingswerk) + 1 dag (testen)

---

## Risicomatrix per sprint

| Sprint | Risico | Kans | Impact | Mitigatie |
|:------:|--------|:----:|:------:|-----------|
| 1 | next-intl config werkt niet met static export | Laag | Hoog | POC eerst, rollback plan |
| 2 | Taalkeuze bij reload verliest state | Middel | Middel | localStorage + fallback |
| 4-10 | Ontbrekende vertaalkey toont key als tekst | Middel | Laag | onError handler + NL fallback |
| 5-6 | Juridische vertaling onjuist | Hoog | Hoog | Disclaimer + NL term behouden |
| 11 | Accept-Language header wordt niet doorgegeven | Laag | Hoog | Middleware test |
| 12 | PDF layout breekt door langere EN teksten | Middel | Middel | Flexible cell widths |
| 13 | E2E test ontdekt inconsistenties | Middel | Laag | Buffer in sprint 13 |

---

## Totaaloverzicht

| Metriek | Waarde |
|---------|--------|
| Totaal sprints | 13 |
| Geschatte doorlooptijd | 13 weken (1 sprint/week) |
| Frontend strings | ~1.100 |
| Backend strings | ~400 |
| Electron strings | ~10 |
| Nieuwe bestanden (frontend) | ~5 (config, messages, LanguageSelector) |
| Nieuwe bestanden (backend) | ~30 (.resx paren) |
| Gewijzigde bestanden (frontend) | ~50 |
| Gewijzigde bestanden (backend) | ~25 |
| Nieuwe dependency | 1 (next-intl) |
| Breaking changes | 0 |

---

## Bijlage: Checklist per sprint

Elk sprint moet aan deze checklist voldoen voordat het wordt afgerond:

- [ ] `npm run build` slaagt (frontend)
- [ ] `dotnet build` slaagt (backend, vanaf sprint 11)
- [ ] Alle gemigreerde pagina's visueel identiek in NL
- [ ] Alle gemigreerde pagina's correct in EN
- [ ] Geen vertaalkeys zichtbaar als tekst in de UI
- [ ] Dynamische strings (interpolatie, pluralisatie) werken correct
- [ ] Datum- en valutaformattering correct per locale
- [ ] Geen regressie in niet-gemigreerde pagina's
