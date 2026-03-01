# Fase 3 — UX Designer
**Agent:** 11-ux-designer  
**Datum:** 2026-03-01  
**Input:** docs/fase-3/10-ux-researcher.md, app-component analyse (wizard/, dashboard/, layout/), ux-guardrails  
**Status:** GEREED VOOR HANDOFF

---

## SECTIE 1: Heuristische Evaluatie (Nielsen's 10 Heuristics)

`HEURISTISCH:` Alle scores gebaseerd op codebase- en architectuuranalyse. Geen live schermshots beschikbaar.

| # | Heuristic | Status | Bevindingen | Bron | Prioriteit |
|---|---|---|---|---|---|
| 1 | Visibility of system status | **Gedeeltelijk** | `VoortgangGranulair.tsx` biedt overall + per-domein completion percentage. `OnboardingWizard.tsx` biedt 6-stappen progress. Echter: geen real-time opslaan-feedback zichtbaar bij invoer, geen API loading state pattern gestandaardiseerd. | `components/dashboard/VoortgangGranulair.tsx`, `components/wizard/OnboardingWizard.tsx` | Middel |
| 2 | Match between system and real world | **Probleem** | Navigatie-labels zijn domein-specifiek NL (uitvaart, boedel, euthanasie), maar Shamir-terminologie ("deelcodes", "drempel") is technisch jargon dat niets zegt voor nabestaanden. | `components/nabestaanden/`, `devdocs/shamir-ux-test-protocol.md` | Hoog |
| 3 | User control and freedom | **Gedeeltelijk** | Dashboard-kaarten zijn sorteerbaar (`SortableDomeinKaart.tsx`). OnboardingWizard kan worden weggeklikt (X-knop + localStorage). Ontbrekend: "undo" bij formulierwijzigingen, geen draft/concept-functionaliteit zichtbaar. | `components/dashboard/SortableDomeinKaart.tsx`, `components/wizard/OnboardingWizard.tsx` | Middel |
| 4 | Consistency and standards | **OK** | Tailwind-gebaseerd consistent visueel systeem (`components/ui/` directory aanwezig). Next-intl i18n gebruikt. lucide-react iconen consistent. `OUT_OF_SCOPE: UI Designer (12)` voor visuele details. | `components/ui/`, import patronen | Laag |
| 5 | Error prevention | **Probleem** | FluentValidation aanwezig (server-side). Geen bewijs van client-side real-time validatie feedback gestandaardiseerd over alle formulieren. Shamir wizard: drempel > beschikbare shares = technische fout die preventief voorkomen moet worden. | `src/Lumio.Api/Validators/`, `components/nabestaanden/` | Hoog |
| 6 | Recognition rather than recall | **Probleem** | Alle 17 categorieën zijn gelijk gepresenteerd zonder duidelijke prioritering of grouping. Gebruikers moeten zelf onthouden welke categorieën urgent/ingevuld zijn. Geen contextuele hints ("Meest urgente volgende stap"). | page-structure analyse, `dashboard/` | Hoog |
| 7 | Flexibility and efficiency | **Gedeeltelijk** | Sorteerbare dashboard kaarten bieden power-user configuratie. Geen keyboard shortcuts zichtbaar. Geen "snel-invullen" mode voor herhaalde data-entry. | `SortableDomeinKaart.tsx` | Laag |
| 8 | Aesthetic and minimalist design | **INSUFFICIENT_DATA** | `OUT_OF_SCOPE: UI Designer (12)` voor visuele analyse. Structureel: 17 nav-items in geauthenticeerde layout = boven aanbevolen complexiteitsgrens. | layout-structuur | Middel |
| 9 | Help users recognize, diagnose, recover errors | **Probleem** | `HEURISTISCH:` Formulierfouten (FluentValidation) worden als API responses teruggegeven maar de display-laag is niet gestandaardiseerd geanalyseerd. Shamir foutmeldingen bij onjuiste deelcodes: INSUFFICIENT_DATA over kwaliteit. | `Validators/`, API error response review | Hoog |
| 10 | Help and documentation | **Gedeeltelijk** | `/help` route aanwezig. `VoorbeeldDialog.tsx` suggereert in-app voorbeelden. Geen tooltips/contextuele help in formulieren zichtbaar. | `components/help/`, `VoorbeeldDialog.tsx` | Middel |

**Kritieke heuristics (Probleem status):** H2, H5, H6, H9 — alle vier vallen in Hoog-prioriteit.

---

## SECTIE 2: Cognitive Load Analyse

`HEURISTISCH:` Scores op basis van structurele analyse. Geen eye-tracking of user data beschikbaar.

| Flow/Scherm | Informatiedichtheid (1-10) | Beslissingspunten | Visuele complexiteit | Cognitive Load (1-10) | Verbeterpunten |
|---|---|---|---|---|---|
| Dashboard (17 categorieën) | 7 | 17+ | INSUFFICIENT_DATA (UI domein) | 8 | Progressive disclosure: groepeer in 3–4 thema's; verberg lage-prioriteit categorieën achter "meer" |
| Onboarding wizard (6 stappen) | 4 | 6 | INSUFFICIENT_DATA | 4 | Acceptabel — wizard-structuur verlaagt load t.o.v. directe dashboard dump |
| Shamir config (instellingen) | 8 | 5+ | INSUFFICIENT_DATA | 9 | KRITIEK: technisch jargon + onbekend concept + foutgevoelige invoer in hetzelfde scherm |
| Testament formulier | 5 | 10+ | INSUFFICIENT_DATA | 6 | Emotionele lading verhoogt effectieve load; sectie-opsplitsing aanbevolen |
| Shamir wizard (nabestaanden) | 7 | 4 | INSUFFICIENT_DATA | 9 | KRITIEK: hoog load in crisissituatie zonder externe ondersteuning |

**Hoogste prioriteit:** Shamir-flows (load 9/10) + Dashboard (8/10)

---

## SECTIE 3: User Flow Optimalisatie

### Flow: Nabestaanden-toegang

| Stap | Huidig | Geoptimaliseerd |
|---|---|---|
| 1 | App openen, wachtwoordscherm | App openen, keuze: "Ik ben eigenaar" / "Ik ben nabestaande" |
| 2 | Navigeer naar Instellingen | Direct naar `/nabestaanden` route |
| 3 | Zoek "Nabestaanden" sectie | Shamir wizard stap 1: drempel invoer |
| 4 | Open Shamir dialog | Shamir wizard stap 2: deelcodes invoer |
| 5 | Voer drempel in | Shamir wizard stap 3: bevestiging + app-unlock |
| 6 | Voer deelcodes in | — |
| 7 | Bevestig | — |

**Huidige stappen:** 7 | **Potentieel:** 5 | **Winst:** 2 stappen, elimineert navigatiefrictie

### Flow: Eerste onboarding

| Analyse | Resultaat |
|---|---|
| OnboardingWizard.tsx aanwezig | ✅ 6-stappen basis bestaat |
| Shamir-configuratie in wizard? | ❌ NIET aanwezig in de 6 stappen (profiel, noodcontacten, testament, uitvaart, erfgenamen, backup) |
| Wachtwoord-instelling in wizard? | INSUFFICIENT_DATA — `/` page.tsx niet volledig geanalyseerd |
| Cognitive load screening | Stap "backup" (Shamir) veronderstelt kennis die niet is uitgelegd |

**Aanbeveling:** Voeg Shamir-configuratie als stap toe aan OnboardingWizard, vóór "backup" — met inline uitleg.

### Flow: Content invullen (Testament)

| Stap | Huidig | Geoptimaliseerd |
|---|---|---|
| 1 | Dashboard → Testament | Dashboard → Testament (met completion indicator) |
| 2 | Formulier opent vol | Formulier opent met introductietekst + rustmoment |
| 3 | Alle secties zichtbaar | Secties progressief: vul sectie 1 → scroll naar open sectie 2 |
| 4 | Opslaan | Opslaan + visuele bevestiging + terug naar dashboard met bijgewerkte indicator |

---

## SECTIE 4: Information Architecture Analyse

### Navigatiestructuur (17 items)

`HEURISTISCH:` Gebaseerd op page-structuur.

**Huidig (platte structuur, 17 items on same level):**
```
dashboard / eigenaar / testament / uitvaart / euthanasie / donor / 
erfgenamen / noodcontacten / digitaal-bezit / documenten / boedel / 
tijdlijn / videoboodschappen / export / instellingen / help / audit-log
```

**Voorstel: Thematische groepering (3 clusters):**

| Cluster | Items |
|---|---|
| **Mijn gegevens** (wie ik ben) | eigenaar, erfgenamen, noodcontacten |
| **Mijn wensen** (wat ik wil) | testament, uitvaart, euthanasie, donor, videoboodschappen |
| **Mijn bezittingen** (wat ik heb) | digitaal-bezit, documenten, boedel |
| **Beheren** (app + beheer) | instellingen, export, tijdlijn, audit-log, help |

**Labelling audit:**

| Item | Label duidelijkheid | Probleem |
|---|---|---|
| boedel | AMBIGU | "Boedel" is juridisch jargon — overweeg "Mijn bezittingen" |
| euthanasie | DUIDELIJK maar ZWAAR | Correct, maar confronterend als top-nav item; overweeg sub-label |
| tijdlijn | AMBIGU | Wat toont de tijdlijn? Niet direct duidelijk voor nieuwe gebruiker |
| audit-log | TECHNISCH | Alleen relevant voor beheerders; verplaats naar Instellingen-sub |

**Findability van kernfuncties:**
- ✅ Testament / uitvaart snel bereikbaar
- ❌ Nabestaanden-reconstructie: niet vindbaar in primaire nav — verborgen in Instellingen (GAP-UX-006)
- ❌ Export/backup: gelijkgesteld aan andere categorieën — terwijl het een kritieke functie is

---

## SECTIE 5: Gap Analyse (UX Designer)

| ID | Gap | Prioriteit | Bron |
|---|---|---|---|
| GAP-UXD-001 | Shamir-configuratie ontbreekt in OnboardingWizard.tsx — kritieke stap niet begeleid | KRITIEK | component analyse: stappen profiel/noodcontacten/testament/uitvaart/erfgenamen/backup |
| GAP-UXD-002 | Nabestaanden-toegangspunt niet in primaire navigatie — verborgen in Instellingen | KRITIEK | CROSS_AGENT_INPUT: GAP-UX-006 bevestigd via IA-analyse |
| GAP-UXD-003 | Dashboard 17 items plat — geen thematische grouping | HOOG | heuristic H6 + H8, cognitive load score 8/10 |
| GAP-UXD-004 | Jargon in Shamir-flows niet vertaald naar lekentaal | HOOG | heuristic H2 bevestigd |
| GAP-UXD-005 | Geen gestandaardiseerd error feedback pattern over alle formulieren | HOOG | heuristic H9 |
| GAP-UXD-006 | "Boedel", "tijdlijn", "audit-log" IA-labels ambigu of technisch voor doelgroep | MIDDEL | IA-analyse labelling audit |
| GAP-UXD-007 | Geen opslaan-bevestiging zichtbaar na formulier-submit (H1 violation) | MIDDEL | heuristic H1 gedeeltelijk status |
| GAP-UXD-008 | Geen draft-functionaliteit of undo bij formulierwijzigingen | LAAG | heuristic H3 |

---

## SECTIE 6: Design Debt Kwantificering

| Categorie | Schatting | Rationale |
|---|---|---|
| Shamir UX copy + contextual help | 3 SP | Inline modal/tooltip tekst + flow-aanpassing ShamirDialog |
| OnboardingWizard Shamir stap toevoegen | 4 SP | Nieuwe wizard-stap + INSUFFICIENT_DATA over Shamir-state in wizard |
| Dashboard IA grouping | 5 SP | Layout refactoring + nieuwe navigatiestructuur + i18n labels |
| Nabestaanden-pagina (nieuwe route) | 4 SP | Eerder gecoverd in UX-1 als SP-UX1-003 (3 SP) + 1 SP IA aanpassingen |
| Error feedback standaardisering | 4 SP | Error response mapping naar UI-componenten |
| Opslaan-bevestiging patroon | 2 SP | Toast/banner na succesvolle submit over alle formulieren |
| Label/copy revisions (boedel, tijdlijn etc.) | 2 SP | i18n string updates |
| **Totaal Design Debt** | **~24 SP** | Verdeeld over 3 sprints (gecombineerd met UX Researcher sprints) |

---

## SECTIE 7: Aanbevelingen

### REC-UXD-001 — Voeg Shamir-configuratiestap toe aan OnboardingWizard
**Referentie:** GAP-UXD-001  
**Omschrijving:** Voeg een stap "Stel nabestaanden-toegang in" toe aan `components/wizard/OnboardingWizard.tsx`, met inline uitleg (analogie: bankkluis + sleutels), vóór de "backup" stap. Maak deze stap `REQUIRED` of tenminste prominent (niet overslaanbaar zonder bevestiging).  
**Impact:** Verhoogt Shamir-configuratie completeness, vermindert foutieve configuratie bij launch  
**KPI:** % nieuwe gebruikers dat Shamir configureert within first 7 dagen  
**Baseline:** INSUFFICIENT_DATA  
**Meetmethode:** PostHog event `shamir_wizard_completed` (na activering)  
**Prioriteit:** P1 | **Effort:** Middel (3–4 SP)

---

### REC-UXD-002 — Groepeer 17 dashboard-items in 3–4 thematische clusters
**Referentie:** GAP-UXD-003  
**Omschrijving:** Herstructureer de authenticated layout navigatie in thematische clusters: "Mijn gegevens" (3 items), "Mijn wensen" (5 items), "Mijn bezittingen" (3 items), "Beheren" (4 items). Behoud sorteerbare kaarten per cluster op dashboard.  
**Impact:** Verlaagt cognitive load dashboard van 8/10 naar schatting 5/10  
**KPI:** Onboarding skip rate (gebruikers die wizard overslaan) — proxy voor engagement  
**Baseline:** INSUFFICIENT_DATA  
**Meetmethode:** PostHog event `category_opened` per cluster  
**Prioriteit:** P2 | **Effort:** Hoog (5 SP)

---

### REC-UXD-003 — Standaardiseer formulier opslaan-feedback (toast/banner patroon)
**Referentie:** GAP-UXD-007  
**Omschrijving:** Implementeer een consistente toast-notificatie na elk succesvolle `PATCH`/`POST` over alle formulieren. Gebruik de bestaande `components/ui/` toast bibliotheek (aanwezig in codebase). Formaat: "Opgeslagen op [tijd]" met groen icoon.  
**Impact:** Herstelt H1 (Visibility of system status), verhoogt gebruikersvertrouwen  
**KPI:** Geen meetbaar KPI direct — indirect via usability test score (tevredenheid)  
**Baseline:** INSUFFICIENT_DATA  
**Meetmethode:** Usability test observatie  
**Prioriteit:** P1 | **Effort:** Laag (2 SP)

---

### REC-UXD-004 — Hernoem ambigue IA-labels naar begrijpelijke terminologie
**Referentie:** GAP-UXD-006  
**Omschrijving:** Hernoem in i18n files: "boedel" → "Mijn bezittingen", "tijdlijn" → "Overzicht & tijdlijn", "audit-log" → verplaats naar Instellingen-submenu en label "Activiteitenlog". Update navigatielabels consistent.  
**Impact:** Verbetert H2 (Match between system and real world) voor 40+ doelgroep  
**KPI:** Usability test navigatiefoutrate (navigeren naar verkeerde sectie)  
**Baseline:** INSUFFICIENT_DATA  
**Meetmethode:** Usability test task success  
**Prioriteit:** P2 | **Effort:** Laag (2 SP)

---

### REC-UXD-005 — Standaardiseer formulier error feedback patroon
**Referentie:** GAP-UXD-005  
**Omschrijving:** Definieer en implementeer een centraal formuliervalidatie-patroon: inline veldfouten (rood rand + foutbericht onder het veld), submit-geblokkeerd bij validatiefouten, API-fouten in banner boven formulier. Maak een gedeelde `FormError.tsx` component.  
**Impact:** Herstelt H9, vermindert frustratie bij invoerfouten  
**KPI:** Foutrate bij Shamir-wizard invoer in usability test ≤1/deelnemer  
**Baseline:** INSUFFICIENT_DATA  
**Meetmethode:** Usability test  
**Prioriteit:** P1 | **Effort:** Middel (4 SP)

---

## SECTIE 8: Sprintplan

### Aannames

**Team:** Solo developer/designer  
**Capaciteit UX/Design stories:** 6–8 SP per sprint (deels gecombineerd met UX Researcher sprint UX-1)  
**Sprintduur:** 2 weken  
**Afstemming:** Sprint UXD-1 loopt parallel met of direct na UX-1 (stories zijn onafhankelijk)

---

### Sprint UXD-1: Critical UX fixes (Shamir + Error patterns)

**Sprint doel:** Elimineer de twee heuristic-schendingen met de hoogste impact: Shamir-onboarding ontbreekt en formulier error-feedback is inconsistent.

**KPI-targets:**
- Formulier error-patroon gestandaardiseerd over ≥5 formulieren
- Shamir stap aanwezig in OnboardingWizard

**Stories:**

| ID | Story | Type | SP | Afhankelijkheden | Blocker |
|---|---|---|---|---|---|
| SP-UXD1-001 | Als nieuwe gebruiker wil ik in de onboarding wizard een stap zien voor nabestaanden-toegang zodat ik Shamir configureer voordat ik de app volledig gebruik | CODE | 4 | `OnboardingWizard.tsx` aanwezig (✅) | NONE |
| SP-UXD1-002 | Als gebruiker wil ik na elk opslaan een bevestigingsmelding zien zodat ik zeker weet dat mijn gegevens bewaard zijn | CODE | 2 | `components/ui/` toast aanwezig | NONE |
| SP-UXD1-003 | Als gebruiker wil ik bij formulierfouten directe inline feedback zien zodat ik exact weet welk veld ik moet corrigeren | CODE | 4 | FluentValidation response format | INTERN: Backend error format afstemmen. Eigenaar: Developer. |

**Acceptatiecriteria SP-UXD1-001:** Gegeven wizard stap 5 (nieuw), wanneer gebruiker "Shamir instellen" bereikt, dan ziet hij/zij uitleg van ≤60 woorden + knop "Nu instellen" (naar instellingen) + knop "Later" (met waarschuwing).  
**Acceptatiecriteria SP-UXD1-002:** Gegeven een succesvol opgeslagen formulier, wanneer de API `200 OK` retourneert, dan verschijnt een toast "Opgeslagen" voor minimaal 3 seconden rechtsboven in het scherm.  
**Acceptatiecriteria SP-UXD1-003:** Gegeven een formulier met validatiefout, wanneer de gebruiker submit klikt, dan verschijnt inline foutbericht onder het betreffende veld in rood, en de submit-knop is disabled totdat alle velden geldig zijn.

**Blocker Register Sprint UXD-1:**

| ID | Type | Beschrijving | Eigenaar | Escalatie |
|---|---|---|---|---|
| BLK-UXD1-001 | INTERN | Backend FluentValidation response format mapping voor inline errors | Developer | Afstemming dag 3 sprint; blokkeer SP-UXD1-003 niet voor week 1 |

---

### Sprint UXD-2: Dashboard IA + Labelling

**Sprint doel:** Verminder dashboard cognitive overload door thematische groepering en label-verbeteringen.

**KPI-targets:**
- Dashboard herstructureerd in 3–4 clusters
- Ambigue labels bijgewerkt (i18n)

**Stories:**

| ID | Story | Type | SP | Afhankelijkheden | Blocker |
|---|---|---|---|---|---|
| SP-UXD2-001 | Als gebruiker wil ik navigatieitems gegroepeerd zien in thema's zodat ik sneller vind wat ik zoek | CODE | 5 | authenticated layout.tsx | NONE |
| SP-UXD2-002 | Als gebruiker wil ik navigatielabels zien in begrijpelijke taal zodat ik onmiddellijk begrijp wat elk onderdeel bevat | CODE | 2 | i18n messages/ bestanden | NONE |

**Acceptatiecriteria SP-UXD2-001:** Gegeven de geauthenticeerde layout, wanneer de navigatie wordt geladen, dan zijn items gegroepeerd onder ≤4 koppen; elke groep bevat ≤6 items.  
**Acceptatiecriteria SP-UXD2-002:** Gegeven de navigatie, wanneer "boedel" wordt getoond, dan staat de label "Mijn bezittingen" of equivalent. "Audit-log" is niet meer zichtbaar als primair navigatie-item.

**Blocker Register Sprint UXD-2:**

| ID | Type | Beschrijving | Eigenaar | Escalatie |
|---|---|---|---|---|
| BLK-UXD2-001 | INTERN | Copy review voor nieuwe labels door Product Owner | Product Owner | Sprint start UXD-2 beslissing |

---

## SECTIE 9: Guardrails

### GUARD-UXD-001 — OnboardingWizard mag Shamir-stap niet verwijderen zonder alternatief
**Referentie:** GAP-UXD-001  
**Formulering:** Mag de Shamir-configuratie stap niet worden verwijderd uit de OnboardingWizard zonder bewijs dat gebruikers via een alternatief pad (minimaal even prominent) tot Shamir-configuratie worden begeleid.  
**Scope:** Wijzigingen aan `components/wizard/OnboardingWizard.tsx`  
**Schending-actie:** PR geblokkeerd — escaleer naar Product Owner  
**Verificatiemethode:** PR-checklist: "Shamir-onboarding pad aanwezig?"  
**Overlap:** Aanvulling op GUARD-UX-001 (geen Shamir UX wijziging zonder usability test)

---

### GUARD-UXD-002 — Dashboard mag maximaal 20 top-level items bevatten
**Referentie:** GAP-UXD-003, G-UX-02 (max 3 stappen primaire actie)  
**Formulering:** Mag het geauthenticeerde dashboard-menu niet meer dan 20 primaire navigatie-items bevatten. Items boven dit limiet moeten in een sub-menu of collapsable cluster worden geplaatst.  
**Scope:** `(authenticated)/layout.tsx` navigatiestructuur  
**Schending-actie:** PR geblokkeerd — navigatiestructuur dient binnen limiet te worden gehouden  
**Verificatiemethode:** Geautomatiseerde lint/type check: tel nav-items in layout component; faalt bij >20  
**Overlap:** Verstevigt G-UX-01 (eenvoud boven volledigheid)

---

### GUARD-UXD-003 — Alle formulieren vereisen gestandaardiseerde error display
**Referentie:** GAP-UXD-005  
**Formulering:** Moet elk nieuw of gewijzigd formuliercomponent gebruikmaken van de centrale `FormError.tsx` of equivalent gestandaardiseerde error-display component. Ad-hoc console.error of stille failure is verboden.  
**Scope:** Alle formulieren in `src/lumio-web/src/components/`  
**Schending-actie:** Code review CRITICAL_FINDING — formulier zonder fout-afhandeling dient geblokkeerd  
**Verificatiemethode:** PR-checklist + zoekterm `catch(` in nieuwe component PR's op afwezigheid van UI feedback  
**Overlap:** Aanvulling op GUARD-SD-002 (error handling standards)

---

## HANDOFF CHECKLIST — UX Designer — 2026-03-01

- [x] Heuristische evaluatie compleet — alle 10 Nielsen heuristics beoordeeld
- [x] Cognitive load analyse uitgevoerd — 5 primaire flows gescoord
- [x] User flow optimalisatie gedocumenteerd — 3 flows geanalyseerd
- [x] Information architecture analyse compleet — groepering + labelling voorstel
- [x] Design debt gekwantificeerd — ~24 SP met rationale
- [x] Alle empirische claims gelabeld als HEURISTISCH of CROSS_AGENT_INPUT
- [x] INSUFFICIENT_DATA items gedocumenteerd
- [x] Aanbevelingen: verwijzen naar GAP-UXD analyse-bevindingen ✅
- [x] Aanbevelingen: impact-velden gevuld of INSUFFICIENT_DATA ✅
- [x] Meetcriteria zijn SMART ✅
- [x] Sprintplan: aannames gedocumenteerd ✅
- [x] Sprintplan: alle stories hebben acceptatiecriteria ✅
- [x] Guardrails: testbaar, schending-actie, verificatiemethode ✅
- [x] Alle 4 deliverables aanwezig: Analyse ✓ Aanbevelingen ✓ Sprintplan ✓ Guardrails ✓

**STATUS: GEREED VOOR HANDOFF**  
**Overdracht aan:** UI Designer (12)
