# Lumio — Feature Analyse (MoSCoW)

> Gebaseerd op volledige code-analyse van alle backend controllers, services, domain models, DTOs,
> frontend pagina's, componenten en configuratie.  
> Beoordeeld vanuit het perspectief van een **productie-waardige digitale nalatenschap-applicatie**.

---

## Beoordelingsmethode

| Categorie | Betekenis |
|-----------|-----------|
| **Must Have** | Zonder deze feature is de app onveilig, onbruikbaar of ongeschikt voor het doel |
| **Should Have** | Belangrijke features die de app significant beter maken, maar zonder welke het nog functioneert |
| **Could Have** | Waardevolle toevoegingen als er tijd/budget is |
| **Won't Have (now)** | Bewust uitgesteld — niet relevant voor v1.0 |

---

## Must Have

### M1 — Automatische sessie-vergrendeling na inactiviteit

**Status:** Ontbreekt volledig  
**Risico:** HOOG (beveiliging)

De app bevat extreem gevoelige informatie (wachtwoorden, seed phrases, financiële gegevens, testament). Er is **geen automatische lock** na inactiviteit. Als de gebruiker wegloopt van zijn computer, blijft alles toegankelijk.

**Implementatie:**
- Frontend: idle-timer (bijv. 5 minuten) die `POST /api/auth/vergrendel` aanroept
- Backend: de `vergrendel` endpoint bestaat al (`AuthController.Vergrendel`)
- Configureerbare timeout in instellingen-pagina
- Waarschuwingsdialoog 30 seconden voor vergrendeling

**Geschatte complexiteit:** Laag (2-4 uur)

---

### M2 — Data backup & restore

**Status:** Ontbreekt volledig  
**Risico:** HOOG (dataverlies)

Er is **geen manier om een backup te maken** van de versleutelde database. Als de schijf faalt of het bestand corrupt raakt, is alle data permanent verloren. Voor een app die expliciet bedoeld is om belangrijke documenten en wensen voor na overlijden vast te leggen, is dit onacceptabel.

**Implementatie:**
- Backend: endpoint `GET /api/backup` dat het SQLCipher `.db` bestand als download aanbiedt
- Backend: endpoint `POST /api/restore` dat een geüpload `.db` bestand valideert en vervangt
- Frontend: backup/restore sectie op instellingen-pagina
- Optioneel: automatische backup bij elke vergrendeling naar een configureerbare locatie

**Geschatte complexiteit:** Middel (4-8 uur)

---

### M3 — Volledige data-verwijdering (account reset)

**Status:** Ontbreekt  
**Risico:** MIDDEL (privacy/GDPR)

Er is geen manier om alle data te wissen en opnieuw te beginnen. De gebruiker kan niet:
- Zijn profiel volledig verwijderen
- De database resetten
- Een "schone start" maken

**Implementatie:**
- Backend: endpoint `DELETE /api/account` dat de database verwijdert na wachtwoord-bevestiging
- Frontend: "Alle data wissen" knop op instellingen-pagina met dubbele bevestiging
- Alternatief: instructie om `lumio.db` handmatig te verwijderen (minder gebruiksvriendelijk)

**Geschatte complexiteit:** Laag (2-3 uur)

---

### M4 — Error boundaries in React

**Status:** Ontbreekt  
**Risico:** MIDDEL (stabiliteit)

Er zijn **geen React Error Boundaries**. Als een component crasht (bijv. door onverwachte API data), wordt het hele scherm wit zonder foutmelding. De gebruiker kan alleen de app herstarten.

**Implementatie:**
- Globale `ErrorBoundary` component rond de authenticated layout
- Per-pagina error boundaries rond data-intensieve secties
- Fallback UI met "Er is iets misgegaan" + "Opnieuw proberen" knop

**Geschatte complexiteit:** Laag (2-3 uur)

---

### M5 — Wachtwoord-sterkte indicatie bij setup

**Status:** Ontbreekt  
**Risico:** MIDDEL (beveiliging)

Het masterwachtwoord is de **enige** beveiliging van alle versleutelde data. Er is geen indicatie van wachtwoord-sterkte bij het instellen. De backend vereist minimaal 8 tekens, maar er is geen visuele feedback.

**Implementatie:**
- Frontend: wachtwoord-sterkte meter (bijv. zxcvbn library)
- Vereisten tonen: minimaal 8 tekens, mix van hoofd/kleine letters, cijfers, speciale tekens
- Waarschuwing bij zwak wachtwoord (maar niet blokkeren)

**Geschatte complexiteit:** Laag (1-2 uur)

---

### M6 — Volledige adres- en contactgegevens voor alle personen, professionals en organisaties

**Status:** Grotendeels ontbreekt  
**Risico:** HOOG (data-compleetheid)

Vrijwel elke persoon, professional of organisatie in het systeem mist essentiële contact- en adresgegevens. Alleen de **Eigenaar** heeft een volledig profiel. Alle overige registraties slaan hooguit een naam op — onvoldoende voor een nalatenschap-applicatie waar erfgenamen, notarissen of uitvaartondernemers bereikbaar moeten zijn.

#### A. Persoonsregistraties

| Entity | Telefoon/Email | Adres/Postcode/Woonplaats | Geboortedatum |
|--------|:--------------:|:-------------------------:|:-------------:|
| **Eigenaar** | ✅ | ✅ | ✅ |
| **Erfgenaam** | ✅ | ❌ | ❌ |
| **Executeur** | ✅ | ❌ | ❌ |
| **Begunstigde** | ❌ | ❌ | ❌ |

#### B. Professionals en vertegenwoordigers

| Entity (veld op) | Huidige velden | Ontbrekend |
|-------------------|---------------|------------|
| **Notaris** (Eigenaar) | Notaris, NotarisKantoor | Telefoon, Email, Adres, Postcode, Plaats |
| **Notaris** (TestamentInfo) | NotarisNaam, NotarisKantoor | Telefoon, Email, Adres, Postcode, Plaats |
| **UitvaartOndernemer** (UitvaartWensen) | UitvaartOndernemer (naam) | Telefoon, Email, Adres, Postcode, Plaats |
| **Huisarts** (WilsverklaringEuthanasie) | Huisarts, HuisartsPraktijk | Telefoon, Email |
| **Vertegenwoordiger** (WilsverklaringEuthanasie) | Naam, Relatie, Telefoon | Email, Adres, Postcode, Woonplaats |

#### C. Organisaties (financieel)

| Entity | Huidige velden | Ontbrekend |
|--------|---------------|------------|
| **Verzekeraar** (Verzekering) | Verzekeraar (naam) | Telefoon, Email |
| **Schuldeiser** (Schuld) | Schuldeiser (naam) | Telefoon, Email |

> **Noot:** Bankrekening (BankNaam) is bewust uitgesloten — banken zijn eenvoudig online te vinden.

**Implementatie (full-stack, per groep):**

**Groep A — Persoonsregistraties** *(domain model + DTO + frontend formulier)*

| Entity | Toe te voegen velden |
|--------|---------------------|
| **Erfgenaam** | `Adres`, `Postcode`, `Woonplaats`, `Geboortedatum` |
| **Executeur** | `Adres`, `Postcode`, `Woonplaats` |
| **Begunstigde** | `Telefoon`, `Email`, `Adres`, `Postcode`, `Woonplaats` |

**Groep B — Professionals** *(domain model + DTO + frontend formulier)*

| Entity | Toe te voegen velden |
|--------|---------------------|
| **Eigenaar** (notaris-blok) | `NotarisTelefoon`, `NotarisEmail`, `NotarisAdres`, `NotarisPostcode`, `NotarisPlaats` |
| **TestamentInfo** (notaris-blok) | `NotarisTelefoon`, `NotarisEmail`, `NotarisAdres`, `NotarisPostcode`, `NotarisPlaats` |
| **UitvaartWensen** | `UitvaartOndernemerTelefoon`, `UitvaartOndernemerEmail`, `UitvaartOndernemerAdres`, `UitvaartOndernemerPostcode`, `UitvaartOndernemerPlaats` |
| **WilsverklaringEuthanasie** | `HuisartsTelefoon`, `HuisartsEmail`, `VertegenwoordigerEmail`, `VertegenwoordigerAdres`, `VertegenwoordigerPostcode`, `VertegenwoordigerWoonplaats` |

**Groep C — Organisaties** *(domain model + DTO, frontend optioneel)*

| Entity | Toe te voegen velden |
|--------|---------------------|
| **Verzekering** | `VerzekeraarTelefoon`, `VerzekeraarEmail` |
| **Schuld** | `SchuldeiserTelefoon`, `SchuldeiserEmail` |

**Database:** EF migratie nodig (SQLCipher → database recreatie vereist). Alle groepen in één migratie batchen.

**Geschatte complexiteit:** Middel-Hoog (8-14 uur — 10 entities × domain/DTO/frontend)

---

### M7 — Meerdere persoonlijke databases (gezinsprofiel, max 5)

**Status:** Ontbreekt volledig  
**Risico:** HOOG (kernfunctionaliteit)

De applicatie ondersteunt momenteel slechts **één database** (`lumio.db`). Er is geen mogelijkheid voor een partner, kind of ander familielid om een **eigen versleutelde database** aan te maken met eigen wachtwoord. Dit is een fundamentele beperking — digitale nalatenschap is per definitie een gezinsaangelegenheid.

**Vereisten:**
- Maximaal **5 profielen** (databases) per installatie
- Elk profiel heeft een **eigen masterwachtwoord** en **eigen versleutelde database**
- De eerste profiel-aanmaker is de **primaire gebruiker**
- Bij aanmaken van profiel 2-5 moet de relatie tot de primaire gebruiker worden opgegeven:
  - Partner
  - Kind
  - Ouder
  - Overig (vrij tekstveld)
- Profielen zijn **volledig gescheiden** — geen data-deling tussen databases
- Profiel-selectie vóór het wachtwoord-scherm
- Profiel kan worden verwijderd (na wachtwoord-bevestiging)

**Huidige architectuur-beperkingen:**

| Component | Huidig | Nodig |
|-----------|--------|-------|
| **DB pad** | Hardcoded `lumio.db` | Dynamisch: `data/{profielId}.db` |
| **MasterPasswordService** | Singleton, één `_currentPassword` | "Actief profiel"-patroon met profielId |
| **IsFirstRun** | `!File.Exists(dbPath)` | Profiel-register (`profiles.json`) |
| **DbContext factory** | Vast `dbPath` uit config | Resolve op basis van actief profiel |
| **EncryptionService** | Eén `.salt` bestand | Per profiel een eigen `.salt` → `{profielId}.salt` |
| **DatabaseUnlockMiddleware** | Binair vergrendeld/ontgrendeld | Check actief profiel-status |
| **AuthController** | Setup/unlock voor één DB | Nieuwe profiel-endpoints |
| **Frontend authStore** | `isUnlocked: boolean` | `activeProfile`, `profiles[]`, profiel-selector |

**Implementatie:**

*Backend — nieuw:*
- `ProfileService.cs` — beheert `data/profiles.json` (onversleuteld manifest)
- `ProfileController.cs` — CRUD endpoints: `GET /api/profiles`, `POST /api/profiles`, `DELETE /api/profiles/{id}`
- Profile model: `{ id, naam, relatie, dbBestand, aangemaaaktOp }`
- `POST /api/auth/select-profile/{id}` — stel actief profiel in

*Backend — wijzigen:*
- `MasterPasswordService` → `ActiveProfileId`, `ActiveDbPath` properties toevoegen
- `Program.cs` → dynamisch DB pad op basis van actief profiel
- `EncryptionService` → salt-pad per profiel resolven
- `DatabaseUnlockMiddleware` → geen profiel geselecteerd = blokkeren

*Frontend — wijzigen:*
- `authStore.ts` → `activeProfile`, `profiles` state toevoegen
- `page.tsx` → profiel-kiezer vóór wachtwoord-scherm
- Profielbeheer-pagina in instellingen (aanmaken, verwijderen)
- Header/sidebar: actief profiel tonen met switch-optie

*Bestanden:*
- `data/profiles.json` — onversleuteld register: `[{ id, naam, relatie, dbBestand }]`
- `data/{profielId}.db` — per profiel een eigen SQLCipher database
- `data/{profielId}.salt` — per profiel een eigen AES-256-GCM salt

**Geschatte complexiteit:** Hoog (16-24 uur — architecturele wijziging, full-stack)

---

## Should Have

### S1 — Zoekfunctionaliteit

**Status:** Ontbreekt  
**Impact:** Gebruikerservaring

Naarmate de database groeit (tientallen accounts, wachtwoorden, documenten, bezittingen), wordt het moeilijker om specifieke items te vinden. Er is geen zoekfunctie.

**Implementatie:**
- Globale zoekbalk in de header/sidebar
- Backend: `GET /api/zoeken?q=...` dat over alle entities zoekt
- Frontend: resultaten gegroepeerd per domein (accounts, wachtwoorden, bezittingen, documenten)
- Keyboard shortcut: `Ctrl+K` of `/`

**Geschatte complexiteit:** Middel (6-10 uur)

---

### S2 — Audit log / activiteitenlogboek

**Status:** Ontbreekt  
**Impact:** Beveiliging & traceerbaarheid

Er is geen registratie van wie wanneer wat heeft gedaan. Belangrijk voor:
- Detectie van ongeautoriseerde toegang
- Overzicht van wijzigingen
- Forensisch onderzoek bij problemen

**Implementatie:**
- Backend: `AuditLog` entity met `Tijdstip`, `Actie`, `EntityType`, `EntityId`, `Details`
- Middleware of EF `SaveChanges` interceptor die automatisch logt
- Frontend: audit log pagina in instellingen
- Log minimaal: ontgrendelen, vergrendelen, CRUD-acties, wachtwoord wijzigen, export, Shamir generatie

**Geschatte complexiteit:** Middel (6-10 uur)

---

### S3 — Categorisering en tags voor digitale accounts

**Status:** Ontbreekt  
**Impact:** Organisatie

Digitale accounts hebben geen categorisering. Bij 50+ accounts (social media, email, banking, streaming, etc.) wordt de lijst onoverzichtelijk.

**Implementatie:**
- Voeg `Categorie` veld toe aan `DigitaalAccount` (Social Media, Email, Banking, Shopping, Streaming, etc.)
- Filter/groepeer per categorie in de UI
- Optioneel: gebruiker-gedefinieerde tags

**Geschatte complexiteit:** Laag (3-5 uur)

---

### S4 — Instructies per erfgenaam (wie krijgt wat)

**Status:** Gedeeltelijk (testament begunstigden)  
**Impact:** Kernfunctionaliteit

De app kan begunstigden registreren bij het testament, maar er is geen directe koppeling "erfgenaam X krijgt digitaal account Y" of "erfgenaam X krijgt bezitting Z". Dit is een kernbehoefte bij digitale nalatenschap.

**Implementatie:**
- Koppeltabel `ErfgenaamToewijzing` met `ErfgenaamId`, `EntityType`, `EntityId`, `Instructies`
- Per bezitting/account/wachtwoord: dropdown "Toewijzen aan erfgenaam"
- Overzichtspagina per erfgenaam: "Dit ontvangt deze persoon"
- PDF export per erfgenaam met alleen hun toewijzingen

**Geschatte complexiteit:** Hoog (12-20 uur)

---

### S5 — Notificaties en herinneringen

**Status:** Ontbreekt  
**Impact:** Gebruikersbetrokkenheid

De app heeft geen mechanisme om de gebruiker te herinneren aan:
- Verlopen documenten (paspoort, verzekeringspolis)
- Periodieke check of gegevens nog actueel zijn
- Ontbrekende secties die nog niet zijn ingevuld

**Implementatie:**
- Backend: scheduler die periodiek controleert (of bij elke ontgrendeling)
- Dashboard-widget met waarschuwingen/herinneringen
- Optioneel: Electron desktop notifications

**Geschatte complexiteit:** Middel (6-10 uur)

---

### S6 — Meerdere noodcontacten / vertrouwenspersonen

**Status:** Alleen via Shamir shares  
**Impact:** Praktisch gebruik

Naast erfgenamen (juridisch) is er behoefte aan "noodcontacten" — mensen die in een noodsituatie (niet persé overlijden) moeten worden gecontacteerd. Bijv. arts, notaris, uitvaartondernemer.

**Implementatie:**
- Nieuw domain: `Noodcontact` met naam, relatie, telefoon, email, rol, instructies
- Frontend pagina met CRUD
- Opname in PDF export

**Geschatte complexiteit:** Laag (3-5 uur)

---

### S7 — Afdrukbare "Noodkaart" of samenvatting

**Status:** PDF export bestaat maar is technisch  
**Impact:** Praktisch nut

De huidige PDF export is een technisch document. Erfgenamen hebben behoefte aan een **beknopte noodkaart**: wie te bellen, waar het testament ligt, welke verzekeraar, etc. Eén A4 met de essentie.

**Implementatie:**
- Backend: nieuw PDF template `GenerateNoodkaartPdf()` — compact, overzichtelijk
- Inhoud: eigenaar gegevens, noodcontacten, locatie testament, uitvaartondernemer, verzekeraar
- Bedoeld om af te drukken en in een kluis/portemonnee te bewaren

**Geschatte complexiteit:** Laag (3-5 uur)

---

### S8 — Wettelijk conforme document-generatie (Testament & Wilsverklaring)

**Status:** Ontbreekt — wizards slaan alleen metadata op  
**Impact:** Kernfunctionaliteit

De huidige wizards voor Testament en Wilsverklaring Euthanasie registreren alleen *gegevens over* het document (notarisnaam, locatie, type). Ze genereren **geen daadwerkelijk juridisch document** dat kan worden ondertekend en vastgelegd via de officiële kanalen.

Voor veel gebruikers is het opstellen van een testament of wilsverklaring een drempel. De app kan die drempel verlagen door:
1. Een **wettelijk goedgekeurde template** te laden die de gebruiker invult
2. Een **uitgebreide wizard** die de gebruiker stap voor stap meeneemt door alle juridisch vereiste onderdelen
3. Een **compleet PDF-document** te genereren dat alleen nog ondertekend hoeft te worden

#### Testament

Nederlandse wet (Boek 4 BW) kent drie vormen:

| Vorm | Vereisten | Kan app genereren? |
|------|-----------|:------------------:|
| **Notarieel testament** | Opgesteld door notaris, getekend ten overstaan van notaris | Nee — app kan wel een *concept-document* genereren als voorbereiding op notarisbezoek |
| **Onderhands/codicil** | Geheel eigenhandig geschreven, gedateerd en ondertekend. Alleen voor legaten van roerende goederen, kleding, sieraden, meubels | Gedeeltelijk — app kan een ingevulde template tonen die de gebruiker vervolgens *met de hand* moet overschrijven |
| **Depot testament** | Onderhands, in bewaring bij notaris | Idem codicil |

**Wizard-stappen (uitbreiding huidige 5-stap wizard):**
1. Type testament kiezen (notarieel / codicil) + uitleg wettelijke vereisten
2. Persoonlijke gegevens (pre-filled vanuit Eigenaar)
3. Erfgenamen & verdeling — wie krijgt wat, percentages, legitieme portie
4. Executeur aanwijzen + bevoegdheden (beheer, beschikking, bezit)
5. Legaten & specifieke wensen (roerende goederen, digitale nalatenschap)
6. Uitsluitingsclausule (standaard aanbevolen)
7. Bijzondere bepalingen (vruchtgebruik, tweetrapstestament, etc.)
8. Notaris-gegevens & bewaarlocatie
9. **Preview** — volledig opgemaakt concept-document
10. **Genereer PDF** — klaar om af te drukken en mee te nemen naar notaris

#### Wilsverklaring Euthanasie

De NVVE (Nederlandse Vereniging voor een Vrijwillig Levenseinde) biedt standaard-templates. De Wet toetsing levensbeeindiging (Wtl) vereist:
- Schriftelijk vastgelegd
- Vrijwillig en weloverwogen
- Uitzichtloos en ondraaglijk lijden beschreven
- Arts en patiënt hebben alternatieven besproken
- Onafhankelijke arts-SCEN geraadpleegd

**Wizard-stappen (uitbreiding huidige 5-stap wizard):**
1. Keuze: wil euthanasie ja/nee + uitleg wettelijk kader
2. Situatiebeschrijving — onder welke omstandigheden (conform NVVE-template)
3. Dementie-clausule — optioneel, specifieke bepalingen bij wilsonbekwaamheid
4. Behandelverbod — welke behandelingen weigeren (reanimatie, beademing, kunstmatige voeding)
5. Huisarts-gegevens (pre-filled indien bekend)
6. Vertegenwoordiger(s) — wie spreekt namens de patiënt bij wilsonbekwaamheid
7. Aanvullende wensen
8. **Preview** — volledig opgemaakt document conform NVVE-standaard
9. **Genereer PDF** — klaar om te ondertekenen en te overhandigen aan huisarts

**Implementatie:**

*Backend:*
- Nieuwe PDF templates in `LumioPdfService`: `GenerateTestamentConceptPdf()`, `GenerateWilsverklaringPdf()`
- QuestPDF templates met correcte juridische opmaak, clausules en verplichte tekstblokken
- Uitbreiding domain models voor extra wizard-velden (behandelverbod, dementie-clausule, uitsluitingsclausule, etc.)
- Template-teksten als embedded resources (niet hardcoded in service)

*Frontend:*
- Uitbreiding testament wizard: van 5 naar 10 stappen
- Uitbreiding euthanasie wizard: van 5 naar 9 stappen
- PDF preview component (inline of download)
- Duidelijke disclaimer: *"Dit is een concept-document. Raadpleeg uw notaris/huisarts voor officiële vastlegging."*

*Juridisch:*
- Templates baseren op actuele Nederlandse wetgeving (Boek 4 BW, Wtl)
- NVVE wilsverklaring-template als referentie
- **Disclaimer prominent tonen** — de app vervangt geen juridisch advies

> **Let op:** Het bestaande Won't Have item "Juridisch advies / AI-suggesties" blijft staan.
> Deze feature geeft géén juridisch advies — het biedt een *gestructureerd invulformulier*
> gebaseerd op wettelijk vastgestelde templates. Het verschil: een formulier invullen vs. advies geven.

**Geschatte complexiteit:** Hoog (20-30 uur — juridisch onderzoek + uitgebreide wizards + PDF templates)

---

## Could Have

### C1 — Dark mode

**Status:** Ontbreekt  
**Impact:** UX comfort

Tailwind CSS 4 ondersteunt dark mode out-of-the-box. De huidige UI is alleen light mode.

**Implementatie:**
- Tailwind `dark:` varianten toevoegen aan alle componenten
- Toggle in sidebar/header
- Voorkeur opslaan in localStorage

**Geschatte complexiteit:** Middel (4-8 uur, veel componenten)

---

### C2 — Import van wachtwoorden uit password managers

**Status:** Ontbreekt  
**Impact:** Onboarding gemak

Handmatig alle wachtwoorden invoeren is tijdrovend. Import vanuit gangbare formaten zou de adoptie versnellen.

**Implementatie:**
- CSV import (universeel export-formaat van 1Password, Bitwarden, LastPass, KeePass)
- Mapping wizard: welke kolom is gebruikersnaam, wachtwoord, URL, etc.
- Versleuteling bij import via `IEncryptionService`

**Geschatte complexiteit:** Middel (6-10 uur)

---

### C3 — Meerdere talen (i18n)

**Status:** Alleen Nederlands  
**Impact:** Bereik

De app is volledig in het Nederlands. Voor internationaal gebruik zou meertaligheid nuttig zijn.

**Implementatie:**
- `next-intl` of `react-i18next` integratie
- Vertalingsbestanden per taal
- Taalwissel in instellingen

**Geschatte complexiteit:** Hoog (20+ uur — elke string in de app moet worden ge-extracted)

---

### C4 — Drag & drop voor documenten upload

**Status:** Alleen file picker  
**Impact:** UX comfort

Documenten uploaden vereist nu klikken op een file input. Drag & drop zou intuïtiever zijn.

**Implementatie:**
- Drop zone component met visuele feedback
- Meerdere bestanden tegelijk uploaden
- Voortgangsindicator per bestand

**Geschatte complexiteit:** Laag (2-4 uur)

---

### C5 — Keyboard shortcuts

**Status:** Ontbreekt  
**Impact:** Power users

Geen keyboard shortcuts voor navigatie of acties.

**Implementatie:**
- `Ctrl+K` → zoeken
- `Ctrl+L` → vergrendelen
- `Ctrl+N` → nieuw item (context-afhankelijk)
- Navigatie met `G` + letter (bijv. `G D` → dashboard)

**Geschatte complexiteit:** Laag (2-4 uur)

---

### C6 — Wachtwoord generator

**Status:** Ontbreekt  
**Impact:** Beveiligingsgemak

Bij het opslaan van wachtwoorden is er geen mogelijkheid om een sterk wachtwoord te genereren.

**Implementatie:**
- Generator-knop naast het wachtwoord-invoerveld
- Configureerbaar: lengte, speciale tekens, hoofdletters, cijfers
- Kopieer naar klembord

**Geschatte complexiteit:** Laag (2-3 uur)

---

### C7 — Verificatie-status per sectie

**Status:** Ontbreekt  
**Impact:** Compleetheid

Het dashboard toont geen overzicht van welke secties zijn ingevuld en welke niet. De gebruiker weet niet hoe "compleet" zijn digitale nalatenschap is.

**Implementatie:**
- Dashboard progress-indicator per domein (testament ✅, donor ❌, uitvaart ⚠️)
- Percentage "compleetheid" berekening
- Suggesties voor ontbrekende informatie

**Geschatte complexiteit:** Laag (3-5 uur)

---

### C8 — Versiegeschiedenis van documenten

**Status:** Ontbreekt  
**Impact:** Traceerbaarheid

Als een document wordt geüpload met dezelfde naam, wordt het oude overschreven. Er is geen versiegeschiedenis.

**Implementatie:**
- `Versie` veld op `PersoonlijkDocument`
- Bij upload van bestaande naam: nieuwe versie aanmaken, oude bewaren
- UI: versie-dropdown om oudere versies te bekijken/downloaden

**Geschatte complexiteit:** Middel (4-8 uur)

---

## Won't Have (v1.0)

| Feature | Reden voor uitstel |
|---------|-------------------|
| **Cloud synchronisatie** | Conflicteert met de offline-first, privacy-by-design filosofie van de app. De data verlaat nooit het apparaat. |
| **Mobiele app (iOS/Android)** | De Electron desktop-shell is de primaire distribution. Een mobiele versie is een apart project. |
| **Juridisch advies / AI-suggesties** | Buiten scope — de app registreert wensen, geeft geen juridisch advies. |
| **Automatische account-detectie** | Privacy-invasief en technisch complex. Gebruiker voert accounts handmatig in. |
| **Sociale media "memorial" functie** | Te platform-afhankelijk, API's wijzigen constant. |

---

## Prioriteitsmatrix

```
                    IMPACT
              Laag         Hoog
         ┌──────────┬──────────┐
  Laag   │ C1, C4,  │ M4, M5,  │
         │ C5, C6   │ S6, S7,  │
EFFORT   │          │ C7       │
         ├──────────┼──────────┤
  Hoog   │ C3, C8   │ M1, M2,  │
         │          │ M6, M7,  │
         │          │ S1, S2,  │
         │          │ S4, S5,  │
         │          │ S8       │
         └──────────┴──────────┘

Quick wins (laag effort, hoog impact):
  → M4, M5, S6, S7, C7

Strategische investeringen (hoog effort, hoog impact):
  → M1, M2, M6, M7, S1, S2, S4, S8
```

---

## Aanbevolen roadmap

### Sprint 1 — Database & data-model (Must Haves — vroeg doen)
1. **M7** — Meerdere persoonlijke databases *(architecturele wijziging, eerst doen)*
2. **M6** — Adres/contactgegevens alle personen *(database-schema, batchen met M7)*

### Sprint 2 — Beveiliging & stabiliteit (Must Haves)
3. **M1** — Auto-lock na inactiviteit
4. **M2** — Backup & restore *(nu per profiel!)*
5. **M4** — Error boundaries
6. **M5** — Wachtwoord-sterkte meter
7. **M3** — Account reset *(nu per profiel!)*

### Sprint 3 — Kernfunctionaliteit (Should Haves — hoge waarde)
8. **S8** — Wettelijk conforme document-generatie *(groot, vroeg starten)*
9. **S4** — Toewijzing erfgenaam ↔ bezittingen
10. **S7** — Noodkaart PDF
11. **S6** — Noodcontacten
12. **S3** — Account categorisering

### Sprint 4 — Gebruikerservaring (Should Haves + Quick wins)
13. **S1** — Zoekfunctionaliteit
14. **S2** — Audit log
15. **C7** — Compleetheid-indicator dashboard
16. **C6** — Wachtwoord generator

### Sprint 5 — Nice to haves
17. **S5** — Notificaties/herinneringen
18. **C2** — Wachtwoord import
19. **C4** — Drag & drop upload
20. **C1** — Dark mode
21. **C5** — Keyboard shortcuts

### Later
22. **C8** — Document versiegeschiedenis
23. **C3** — Meertaligheid

---

## Totaal geschatte inspanning

| Categorie | Items | Geschatte uren |
|-----------|:-----:|:--------------:|
| Must Have | 7 | 35-58 uur |
| Should Have | 8 | 57-95 uur |
| Could Have | 8 | 24-46 uur |
| **Totaal** | **23** | **116-199 uur** |

> **Opmerking:** Dit is exclusief de 20 bug-fixes uit het Implementatieplan.
> Los **eerst het implementatieplan** op voordat nieuwe features worden gebouwd.
