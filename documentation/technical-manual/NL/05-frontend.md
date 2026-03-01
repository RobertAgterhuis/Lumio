# 5 — Frontend

## Overzicht

De frontend is een **Next.js 16** applicatie die als **statische export** wordt gebouwd. Er zijn geen server-side functies — alle communicatie gaat via de REST API.

| Eigenschap | Waarde |
|------------|--------|
| Framework | Next.js 16.1.6 |
| React | 19.2.4 |
| Bundler | Turbopack |
| Export | Static (`output: 'export'`) |
| Styling | Tailwind CSS 4 + CVA |
| State | Zustand 5 |
| Formulieren | React Hook Form + Zod 4 |
| i18n | next-intl 4 |
| Iconen | Lucide React |

## Pagina's (22 routes)

### Publiek

| Route | Pagina | Doel |
|-------|--------|------|
| `/` | Login/Setup | Profielselectie, wachtwoord, eerste installatie |

### Geauthenticeerd (route group `(authenticated)`)

| Route | Pagina | Doel |
|-------|--------|------|
| `/dashboard` | Dashboard | Overzicht, voortgang, domeinkaarten, statistieken |
| `/eigenaar` | Mijn Profiel | Persoonsgegevens, foto, contactinfo |
| `/testament` | Testament | Testamentgegevens, begunstigden, executeurs, snapshots |
| `/testament/wizard` | Testament Wizard | Stap-voor-stap invulhulp |
| `/euthanasie` | Wilsverklaring | Euthanasieverklaring, voorwaarden |
| `/euthanasie/wizard` | Euthanasie Wizard | Begeleide invoer |
| `/donor` | Donorregistratie | Donorkeuze |
| `/donor/formulier` | Donor Wizard | Stap-voor-stap donorformulier |
| `/digitaal-bezit` | Digitaal Bezit | Online accounts, wachtwoorden, crypto |
| `/boedel` | Boedel | Bezittingen, bankrekeningen, verzekeringen, schulden |
| `/uitvaart` | Uitvaartwensen | Uitvaart-voorkeuren, ceremonie, genodigden |
| `/uitvaart/wizard` | Uitvaart Wizard | Begeleide invoer |
| `/erfgenamen` | Erfgenamen | Erfgenamenbeheer, toewijzingen, Shamir |
| `/noodcontacten` | Noodcontacten | Noodcontactpersonen, noodkaart-QR |
| `/documenten` | Documenten | Upload, versiebeheer, download |
| `/videoboodschappen` | Videoboodschappen | Persoonlijke videoboodschappen opnemen en uploaden voor erfgenamen |
| `/export` | Exporteren | PDF/JSON/XML/CSV/NUV export |
| `/instellingen` | Instellingen | Wachtwoord, taal, thema, backup |
| `/audit-log` | Activiteitenlog | Beveiligingslog |
| `/tijdlijn` | Tijdlijn Overlijden | Chronologisch overzicht |

### Layout

De `(authenticated)` route group deelt een layout met:
- **Header** — Profielnaam, zoekbalk (Ctrl+K), thema-toggle, vergrendelknop
- **Sidebar** — Navigatie naar alle domeinen
- **Error boundary** — Vangt renderfouten op

Elk domein-route-segment heeft daarnaast een eigen `layout.tsx` met een `DomainMessagesProvider` die de domein-specifieke vertaalnamespaces laadt (zie [Hoofdstuk 8 — Internationalisering](./08-internationalisering.md#runtime-bundle-splitsing)).

## Componenten (14 groepen)

### UI Primitieven (`components/ui/`)

Herbruikbare basisbouwstenen, elk met Storybook-story:

| Component | Varianten |
|-----------|-----------|
| `Button` | default, destructive, outline, secondary, ghost, link × sm/default/lg/icon |
| `Badge` | default, secondary, destructive, outline, success, warning, security, info, danger |
| `StatusBadge` | CVA-gebaseerde statusindicator: actief, inactief, concept, voltooid, waarschuwing, fout |
| `Alert` | info, success, warning, danger, security |
| `Card` | CardHeader, CardTitle, CardDescription, CardContent, CardFooter |
| `Dialog` | DialogHeader, DialogTitle, DialogDescription, DialogFooter |
| `FormField` | Formulierveldwrapper met label, foutmelding, hulptekst |
| `Input` | Standaard tekstveld |
| `Textarea` | Meerdere regels |
| `Select` | Native select met styling |
| `Checkbox` | Met label |
| `Label` | Formulier-label |
| `Tabs` | TabsList, TabsTrigger, TabsContent |
| `Progress` | Voortgangsbalk |
| `Skeleton` | Laadplaatshouder (pulse/shimmer varianten, vormpresets: line/circle/card/button) |
| `SkeletonText` | Meerregelige tekst laadstatus |
| `SkeletonAvatar` | Avatar + tekst laadstatus |
| `SkeletonCard` | Kaartcontent laadstatus |
| `Toast` | Toast-notificatieweergave (success/error/warning/info) |
| `HelpTooltip` | Informatie-tooltip |

### Layout (`components/layout/`)

| Component | Doel |
|-----------|------|
| `Header` | Applicatie-header met zoeken, thema, vergrendelen |
| `Sidebar` | Navigatiemenu |
| `SearchDialog` | Command palette (Ctrl+K) met zoeken, snelnavigatie, recente zoekopdrachten |
| `ShortcutsDialog` | Sneltoetsenoverzicht |
| `NotificationsDropdown` | Meldingen |
| `IdleWarningDialog` | Inactiviteitswaarschuwing |
| `ErrorBoundary` | Foutafhandeling |

### Authenticatie (`components/auth/`)

| Component | Doel |
|-----------|------|
| `ProfileSelector` | Profielkeuze |
| `SetupForm` | Eerste installatie |
| `UnlockForm` | Wachtwoordinvoer |
| `HeirUnlockForm` | Shamir-ontgrendeling (erfgenamen) |
| `PasswordStrengthMeter` | Wachtwoordsterkte-indicator |

### Dashboard (`components/dashboard/`)

| Component | Doel |
|-----------|------|
| `ProfielSuggesties` | Aanbevelingen voor ontbrekende gegevens |
| `StatistiekenWidget` | Samenvattende statistieken |
| `VoortgangGranulair` | Gedetailleerde voortgang per veld |
| `MeldingenWidget` | Meldingen-widget op het dashboard |
| `BackupStatusWidget` | Indicator voor recente backup |
| `AanbevolenStapWidget` | Volgende aanbevolen domein om in te vullen |
| `DocumentenVerloopdatumWidget` | Documenten die bijna verlopen |
| `SortableDomeinKaart` | Versleepbare domeinkaart (DnD sorteerbaar) |
| `SortableSection` | Versleepbare dashboardsectie-wrapper |

### Domein (`components/domain/`)

| Component | Doel |
|-----------|------|
| `DomainStatusBanner` | Status- en actualisatiebanner per domein |

### Beveiliging (`components/security/`)

Zie hoofdstuk 4 (Beveiliging) voor de volledige lijst.

### Wizards (`components/wizard/`)

| Component | Doel |
|-----------|------|
| `WizardShell` | Herbruikbare wizard-container met stappen, voortgang, navigatie |
| `OnboardingWizard` | Introductie-wizard voor nieuwe gebruikers |
| `InterviewWizard` | Begeleid-invullen modus |

**WizardShell Props (localStorage-persistentie):**

| Prop | Type | Doel |
|------|------|------|
| `initialStep` | number | Startstap-index (uit opgeslagen staat) |
| `onStepChange` | (step: number, data: FormData) => void | Callback bij stapwisseling (voor persistentie) |
| `wasRestored` | boolean | Toon "hervat waar je gebleven was" banner |
| `onClearProgress` | () => void | Callback om opgeslagen voortgang te wissen |

### Overige componentgroepen

| Groep | Componenten |
|-------|-------------|
| `common/` | `LanguageSelector` |
| `erfgenamen/` | `ErfbelastingCalculator` |
| `testament/` | `JuridischeCheck` |
| `instellingen/` | `DataHandtekening` |
| `notities/` | `SectieNotitie` |
| `nabestaanden/` | `NabestaandenDashboard` |
| `noodcontacten/` | `NoodkaartQR` |
| `tijdlijn/` | `TijdlijnStapRow` |
| `videoboodschappen/` | `VideoboodschapDialog`, `VideoRecorder`, `VideoboodschapSpeler` |
| `providers/` | `LocaleProvider`, `DomainMessagesProvider` |
| Root | `PasswordGenerator`, `PersonSelect`, `PersonCreateInlineDialog`, `VoorbeeldDialog` |

## Stores (Zustand)

### `authStore`

Beheert authenticatie- en ontgrendelstatus:

| State | Type | Doel |
|-------|------|------|
| `isUnlocked` | boolean | Database ontgrendeld? |
| `isFirstRun` | boolean | Eerste keer opstarten (nog geen profiel)? |
| `isReadOnly` | boolean | Nabestaandenmodus (alleen-lezen)? |
| `isLoading` | boolean | Applicatie aan het initialiseren? |
| `profiles` | Profile[] | Beschikbare profielen |
| `activeProfile` | Profile \| null | Huidig actief profiel |
| `profileSelected` | boolean | Is er een profiel geselecteerd? |
| `profileNeedsSetup` | boolean | Eerste installatie vereist voor dit profiel? |
| `profileFotoVersion` | number | Teller die foto-refresh afdwingt na upload |

### `preferencesStore`

Beheert gebruikersvoorkeuren (localStorage-gepersisteerd, per profiel-ID):

| State | Type | Doel |
|-------|------|------|
| `showVoortgang` | boolean | Voortgangsindicator tonen |
| `showStatistieken` | boolean | Statistieken-widget tonen |
| `showVoortgangGranulair` | boolean | Gedetailleerde voortgang tonen |
| `showSuggesties` | boolean | Suggesties-widget tonen |
| `showMeldingen` | boolean | Meldingen-widget tonen |
| `showBackup` | boolean | Backup-statuswidget tonen |
| `showAanbevolen` | boolean | Aanbevolen volgende stap tonen |
| `showVerloopdatum` | boolean | Documenten-verloopdatumwidget tonen |
| `hiddenDomeinKaarten` | string[] | Namen van verborgen domeinkaarten |
| `domeinKaartenVolgorde` | string[] | Aangepaste volgorde van domeinkaarten |
| `sectieVolgorde` | string[] | Aangepaste volgorde van dashboardsecties |
| `instellingenVolgordeLinks` | string[] | Volgorde van de linkerkolom in Instellingen |
| `instellingenVolgordeRechts` | string[] | Volgorde van de rechterkolom in Instellingen |
| `sidebarCollapsed` | boolean | Zijbalk ingeklapt? |

### `toastStore`

Beheert toast-notificaties:

| State | Type | Doel |
|-------|------|------|
| `toasts` | Toast[] | Actieve toast-berichten |
| `addToast` | Function | Voeg nieuwe toast toe |
| `removeToast` | Function | Verwijder toast op ID |
| `clearToasts` | Function | Verwijder alle toasts |

**Convenience API:** `toast.success()`, `toast.error()`, `toast.warning()`, `toast.info()`

### `helpStore`

Beheert de staat van het help-paneel:

| State | Type | Doel |
|-------|------|------|
| `isOpen` | boolean | Help-paneel zichtbaar? |
| `activeSection` | string \| null | Actief help-onderwerp |
| `openHelp` | Function | Open het paneel (optioneel met sectie) |
| `closeHelp` | Function | Sluit het paneel |

## Data Fetching (React Query)

De applicatie gebruikt [TanStack Query](https://tanstack.com/query) (React Query) voor server state management, met custom domein-specifieke hooks.

### Query Hooks

| Hook | Doel |
|------|------|
| `useDomainQuery<T>(endpoint)` | Haal domein-entiteitlijst op met caching |
| `useDomainDetailQuery<T>(endpoint, id)` | Haal enkele entiteit op per ID |

```tsx
// Voorbeeld: Haal bezittingenlijst op
const { data: bezittingen, isLoading } = useDomainQuery<FysiekBezit[]>("boedel/bezittingen");

// Voorbeeld: Haal enkel item op
const { data: bezit } = useDomainDetailQuery<FysiekBezit>("boedel/bezittingen", id);
```

### Mutation Hooks

| Hook | Doel |
|------|------|
| `useDomainCreate<T, V>(endpoint)` | Maak nieuwe entiteit |
| `useDomainUpdate<T, V>(endpoint)` | Werk bestaande entiteit bij |
| `useDomainDelete(endpoint)` | Verwijder entiteit per ID |
| `useDomainMutations<T, V>(endpoint)` | Gecombineerde create/update/delete |

```tsx
// Convenience hook die alle drie de mutaties retourneert
const { create, update, remove } = useDomainMutations<FysiekBezit, BezitFormData>(
  "boedel/bezittingen"
);

await create.mutateAsync(formData);
await update.mutateAsync({ id, data: formData });
await remove.mutateAsync(id);
```

### Query Key Factory

```ts
domainKeys.all(domain)           // ['domain', 'boedel/bezittingen']
domainKeys.detail(domain, id)    // ['domain', 'boedel/bezittingen', '123']
domainKeys.list(domain, params)  // ['domain', 'boedel/bezittingen', 'list', {...}]
```

## Toast-notificaties

Globaal toast-notificatiesysteem met Zustand.

### Toast Store (`stores/toastStore.ts`)

```tsx
import { toast } from "@/stores/toastStore";

// Toon notificaties
toast.success("Succesvol opgeslagen");
toast.error("Er ging iets mis");
toast.warning("Controleer uw invoer");
toast.info("Nieuwe update beschikbaar");

// Met aangepaste duur (ms)
toast.success("Opgeslagen!", 5000);
```

### Toast Varianten

| Variant | Doel |
|---------|------|
| `success` | Bevestiging van geslaagde actie |
| `error` | Foutmeldingen |
| `warning` | Waarschuwingen |
| `info` | Informatiemeldingen |

### ToastProvider Component

Rendert actieve toasts rechtsonder. Wordt gewrapped in de app-layout.

## Hooks

| Hook | Doel |
|------|------|
| `useDomainQuery` | React Query-wrapper voor domein data ophalen |
| `useDomainDetailQuery` | Haal enkele entiteit op per ID |
| `useDomainCreate` | Create-mutatie met cache-invalidatie |
| `useDomainUpdate` | Update-mutatie met cache-invalidatie |
| `useDomainDelete` | Delete-mutatie met cache-invalidatie |
| `useDomainMutations` | Gecombineerde CRUD-mutaties |
| `useDocumenten` | Documenten ophalen, uploaden en verwijderen |
| `useFieldHelp` | Contextgevoelige help per formulierveld |
| `useHelpSearch` | Zoeken door help-inhoud |
| `useIdleTimer` | Detecteert inactiviteit, auto-lock na timeout |
| `useKeyboardShortcuts` | Globale sneltoetsen (Ctrl+K zoeken, etc.) |
| `useTheme` | Thema-toggle (licht/donker), localStorage-persistent |
| `useWizardProgress` | Wizard stap/formulier-persistentie in localStorage |

### useWizardProgress

Persisteert wizard-voortgang (huidige stap, formuliergegevens) naar localStorage voor hervat-functionaliteit.

```tsx
const {
  currentStep,
  setCurrentStep,
  formData,
  updateFormData,
  wasRestored,
  clearProgress,
  markComplete,
  hasSavedProgress,
} = useWizardProgress({
  wizardId: "testament",
  totalSteps: 5,
  initialFormData: {},
  clearOnComplete: true,
});
```

**Utility functies:**
- `getWizardsWithProgress()` — Retourneert array van wizard-IDs met opgeslagen voortgang
- `clearAllWizardProgress()` — Wist alle wizard-voortgang uit localStorage

## API Client (`lib/api-client.ts`)

Dunne `fetch`-wrapper rond de backend API:

| Methode | Doel |
|---------|------|
| `api.get<T>(url)` | GET met JSON-parsing |
| `api.post<T>(url, body)` | POST met JSON |
| `api.put<T>(url, body)` | PUT met JSON |
| `api.delete(url)` | DELETE |
| `api.deleteWithBody(url, body)` | DELETE met body |
| `api.upload<T>(url, formData)` | POST FormData |
| `api.download(url, body?)` | Download blob + bestandsnaam |

**Speciale afhandeling:**
- HTTP 423 → Database is vergrendeld (speciale foutmelding)
- HTTP 204 → Retourneert `undefined`
- `Accept-Language` header wordt automatisch meegezonden (uit localStorage)

---

## Toegankelijkheid (WCAG 2.1 AA)

Lumio richt zich op **WCAG 2.1 AA** als minimumnorm, vereist door de EU Accessibility Act (EAA) per 28 juni 2025.

### Taalattribuut

```tsx
// src/lumio-web/src/app/layout.tsx
<html lang={locale}  // default: "nl" via i18n/request.ts
```

De `lang`-attribuut wordt dynamisch ingesteld via `getLocale()` (next-intl). Standaardwaarde is `"nl"` (zie `src/i18n/request.ts`). Screen readers gebruiken dit attribuut om de juiste taal-engine te activeren (SC 3.1.1).

### skip-to-content

Alle layouts bevatten een skip-navigatielink die zichtbaar wordt bij tab-focus (SC 2.4.1):

```tsx
// Zichtbaar patroon in root layout, authenticated layout en marketing site layout
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] ..."
>
  {t("skipNaarInhoud")}   {/* of "Ga naar hoofdinhoud" */}
</a>
// ...
<main id="main-content" className="...">   {/* SC 2.4.1 target */}
```

Implementatielocaties:

| Bestand | Skip-link | Target |
|---|---|---|
| `src/lumio-web/src/app/layout.tsx` | regel 51-56 | regel 59 (`div#main-content`) |
| `src/lumio-web/src/app/(authenticated)/layout.tsx` | regel 120-123 | regel 139 (`main#main-content`) |
| `site/src/app/layout.tsx` | regel 60-65 | regel 66 (`main#main-content`) |

### axe-playwright / Storybook a11y (CI)

Automatische WCAG-detectie draait in CI via het `a11y` job in `.github/workflows/ci.yml`. Het job gebruikt `@storybook/addon-vitest` + `@storybook/addon-a11y` om alle Storybook stories te scannen met axe-core (SC-evaluatie per component):

```bash
# Lokaal draaien:
npm run test:storybook    # src/lumio-web

# CI: automatisch getriggerd op elke PR/push naar main (needs: [frontend])
```

Geïmplementeerd in Sprint 1 (SP-ACC1-001).

### ARIA live regio's — Toast notificaties

Toasts gebruiken gedifferentieerde ARIA-rollen per variant (SC 4.1.3):

```tsx
// src/lumio-web/src/components/ui/toast.tsx
<div
  role={variant === "error" || variant === "warning" ? "alert" : "status"}
  ...
>
```

| Variant | Role | ARIA live | Reden |
|---|---|---|---|
| `error`, `warning` | `role="alert"` | assertive | Kritiek — onderbreekt screenreader |
| `success`, `info` | `role="status"` | polite | Niet-kritiek — wacht op stilte |

De ToastProvider container heeft aanvullend `aria-live="polite"` + `aria-atomic="true"` op de regio.
Geïmplementeerd in Sprint 1 (SP-ACC1-003).

### Formulierfouten (role="alert")

`FormField.Error` gebruikt `role="alert"` zodat screenreaders foutmeldingen direct aankondigen (SC 4.1.3):

```tsx
// src/lumio-web/src/components/ui/form-field.tsx
<p role="alert" id={errorId} className="text-sm text-danger">
  {children}
</p>
```

Inputs hebben tevens `aria-invalid`, `aria-describedby` (Error ID), en `aria-required` — volledig WCAG-conform compound-patroon. Pre-existing implementatie, bevestigd Sprint 1 (SP-ACC1-004).

### Bevestigingsdialogs voor juridisch significante bewerkingen (SC 3.3.4)

Juridisch/medisch significante bewerkingen (testament, wilsverklaring euthanasie, donorkeuze) vereisen een expliciete bevestiging vóór opslaan. Component: `ConfirmJuridischDialog`:

```tsx
// src/lumio-web/src/components/security/ConfirmJuridischDialog.tsx
<ConfirmJuridischDialog
  open={confirmOpen}
  onOpenChange={setConfirmOpen}
  title={t("bevestigenTitel")}
  description={t("bevestigenBeschrijving")}
  onConfirm={executeComplete}
/>
```

Geïmplementeerd op:

| Pagina | Trigger | 
|---|---|
| `(authenticated)/euthanasie/page.tsx` | "Opslaan" knop in bewerkdialoog |
| `(authenticated)/testament/wizard/page.tsx` | "Afronden" knop in WizardShell |
| `(authenticated)/donor/formulier/page.tsx` | "Afronden" knop in WizardShell |

Geïmplementeerd in Sprint 1 (SP-ACC1-006).

### Openstaande items (Sprint 2+)

| Item | Sprint | SC | Prioriteit |
|---|---|---|---|
| Kleurtoken contrast-correcties: `warning`, `danger`, `success`, `muted-foreground` (zie audit) | Sprint 2 | SC 1.4.3 | **KRITIEK** (warning: 2.19:1) |
| lang-attribuut E2E test | Sprint 2 | SC 3.1.1 | P2 |
| Skip-link Playwright test | Sprint 2 | SC 2.4.1 | P2 |

**Contrast audit bevindingen (Sprint 1 SP-ACC1-007):**

| Token | Fg | Bg | Ratio | Status |
|---|---|---|---|---|
| `--color-warning` op `--color-warning-100` | #D4A017 | #FFF8E1 | ~2.19:1 | ❌ FAIL |
| `--color-danger` op `--color-danger-100` | #B44A4A | #FDE8E8 | ~4.24:1 | ⚠️ FAIL normaal |
| `--color-success` op `--color-success-100` | #5E8C61 | #E8F5E9 | ~3.30:1 | ⚠️ FAIL normaal |
| `--color-muted-foreground` op card/bg | #6B7280 | #FFF/#F3F7F8 | ~4.14-4.29:1 | ⚠️ FAIL normaal |
| `--color-foreground` op background | #1F2933 | #F3F7F8 | ~11.9:1 | ✅ PASS |
| `--color-info` op `--color-info-100` | #3A506B | #E3EDF5 | ~6.32:1 | ✅ PASS |

