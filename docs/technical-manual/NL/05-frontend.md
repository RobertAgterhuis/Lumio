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
| `/export` | Exporteren | PDF/JSON/XML/CSV/NUV export |
| `/instellingen` | Instellingen | Wachtwoord, taal, thema, backup |
| `/audit-log` | Activiteitenlog | Beveiligingslog |
| `/tijdlijn` | Tijdlijn Overlijden | Chronologisch overzicht |

### Layout

De `(authenticated)` route group deelt een layout met:
- **Header** — Profielnaam, zoekbalk (Ctrl+K), thema-toggle, vergrendelknop
- **Sidebar** — Navigatie naar alle domeinen
- **Error boundary** — Vangt renderfouten op

## Componenten (14 groepen)

### UI Primitieven (`components/ui/`)

Herbruikbare basisbouwstenen, elk met Storybook-story:

| Component | Varianten |
|-----------|-----------|
| `Button` | default, destructive, outline, secondary, ghost, link × sm/default/lg/icon |
| `Badge` | default, secondary, destructive, outline, success, warning, security, info, danger |
| `Alert` | info, success, warning, danger, security |
| `Card` | CardHeader, CardTitle, CardDescription, CardContent, CardFooter |
| `Dialog` | DialogHeader, DialogTitle, DialogDescription, DialogFooter |
| `Input` | Standaard tekstveld |
| `Textarea` | Meerdere regels |
| `Select` | Native select met styling |
| `Checkbox` | Met label |
| `Label` | Formulier-label |
| `Tabs` | TabsList, TabsTrigger, TabsContent |
| `Progress` | Voortgangsbalk |
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
| `providers/` | `LocaleProvider` |
| Root | `PasswordGenerator`, `PersonSelect`, `VoorbeeldDialog` |

## Stores (Zustand)

### `authStore`

Beheert authenticatie- en ontgrendelstatus:

| State | Type | Doel |
|-------|------|------|
| `isLocked` | boolean | Database vergrendeld? |
| `isReadOnly` | boolean | Nabestaandenmodus? |
| `profileId` | string | Huidig profiel-ID |
| `profileName` | string | Profielnaam |

### `preferencesStore`

Beheert gebruikersvoorkeuren (localStorage-gepersisteerd):

| State | Type | Doel |
|-------|------|------|
| `showVoortgang` | boolean | Dashboard voortgangsindicator tonen |
| `showVoortgangGranulair` | boolean | Gedetailleerde voortgang tonen |
| `showSuggesties` | boolean | Suggesties tonen |
| `showDomeinKaarten` | boolean | Domeinkaarten tonen |
| `finishedDomains` | Record<string, string> | Domein → ISO-datum wanneer afgerond |

## Hooks

| Hook | Doel |
|------|------|
| `useIdleTimer` | Detecteert inactiviteit, auto-lock na timeout |
| `useKeyboardShortcuts` | Globale sneltoetsen (Ctrl+K zoeken, etc.) |
| `useTheme` | Thema-toggle (licht/donker), localStorage-persistent |

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
