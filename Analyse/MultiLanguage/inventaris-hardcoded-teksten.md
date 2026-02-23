# Inventarisatie Hardcoded Nederlandse Teksten — Lumio Web Frontend

> **Type:** READ-ONLY analyse — geen bestanden zijn gewijzigd  
> **Scope:** `src/lumio-web/src/` (Next.js frontend) + `src/lumio-desktop/src/` (Electron shell)  
> **Bestanden geanalyseerd:** 55+ bronbestanden, 100% dekking van alle TSX/TS-bestanden

---

## 1. Totaal Overzicht

| Categorie | Geschat aantal strings |
|---|---|
| **UI labels** (knoppen, titels, koppen, placeholders, tabbladen) | ~550 |
| **Form labels & placeholders** | ~200 |
| **Foutmeldingen & toasts** | ~60 |
| **Helpteksten & tooltips** | ~45 |
| **Juridische teksten & disclaimers** | ~25 |
| **Enum/select display-waarden** | ~120 |
| **Statische content (tijdlijn, stappenplan)** | ~80 |
| **Navigatie-items** | ~20 |
| **Sneltoets-beschrijvingen** | ~18 |
| **Voorbeeld-/kennisbankdata** | ~350 |
| **Electron-specifieke teksten** | ~10 |
| **API-veldnamen (response/request)** | ~80 |
| **TOTAAL** | **~1.550–1.600** |

---

## 2. Per-bestand inventarisatie

### 2.1 App Pages (`src/app/`)

#### `app/page.tsx` (~15 strings)
```
"Lumio laden..."
"Uw digitale nalatenschap, veilig bewaard"
"Ik ben een erfgenaam (ontgrendelen met noodcodes)"
"Ontgrendelen met wachtwoord"
"← Ander profiel kiezen"
```

#### `app/layout.tsx` (~5 strings)
```
title: "Lumio — Digitale Nalatenschap"
description: "Beheer uw digitale nalatenschap veilig en offline"
lang="nl"
localStorage keys: "lumio-theme", "lumio-grote-tekst"
```

#### `app/(authenticated)/layout.tsx` (~5 strings)
```
"Sessie controleren..."
"Alleen-lezen modus — U bent ingelogd als erfgenaam. Gegevens kunnen alleen worden bekeken en geëxporteerd, niet gewijzigd."
```

#### `app/(authenticated)/error.tsx` (~5 strings)
```
"Er is iets misgegaan"
"Er is een onverwachte fout opgetreden. Probeer het opnieuw of ga terug naar het dashboard."
"Naar dashboard"
"Opnieuw proberen"
```

#### `app/(authenticated)/dashboard/page.tsx` (~50 strings)
```
Card titles: "Mijn Profiel", "Testament", "Wilsverklaring Euthanasie", "Donorregistratie",
  "Digitaal Bezit", "Boedel", "Uitvaartwensen", "Documenten", "Erfgenamen", "Noodcontacten"
Card descriptions (10x): bijv. "Uw persoonlijke gegevens en identificatie"
Status badges: "Ingevuld", "Beginnen", "Openen"
"Dashboard"
"Welkom terug, {naam}"
"Welkom bij Lumio"
"{compleetheid.percentage}% compleet"
"{compleetheid.aantalIngevuld} van {compleetheid.totaal} onderdelen ingevuld"
Juridische disclaimer: "Lumio is een hulpmiddel... Een notarieel testament blijft vereist..."
"Uw nalatenschap in één oogopslag"
```

#### `app/(authenticated)/eigenaar/page.tsx` (~55 strings)
```
Page title: "Mijn Profiel", subtitle: "Uw persoonlijke gegevens..."
Card titles: "Persoonsgegevens", "Burgerlijke staat", "Identificatie", "Notaris", "Profielfoto"
Labels: "Voornaam", "Tussenvoegsel", "Achternaam", "Geboortedatum", "BSN",
  "Adres", "Postcode", "Woonplaats", "Telefoon", "E-mail"
Select options burgerlijke staat: "Ongehuwd", "Gehuwd", "Geregistreerd partnerschap",
  "Gescheiden", "Weduwe/Weduwnaar"
Select options huwelijksgoederenregime: "Gemeenschap van goederen",
  "Beperkte gemeenschap", "Koude uitsluiting"
Select options ID: "Paspoort", "Identiteitskaart", "Rijbewijs"
Labels notaris: "Naam notaris", "Kantoor", "Telefoon notaris", "E-mail notaris"
Labels ID: "Documentnummer", "Geldig tot"
Photo: "Upload een pasfoto, bijvoorbeeld voor de rouwkaart.",
  "JPG, PNG of WebP. Maximaal 10 MB.", "Foto uploaden", "Verwijderen"
Knoppen: "Opslaan", "Opslaan..."
Toasts: "Profiel opgeslagen.", "Opslaan mislukt."
```

#### `app/(authenticated)/erfgenamen/page.tsx` (~90 strings)
```
Page title: "Erfgenamen", subtitle: "Beheer erfgenamen en verdeel noodcodes."
Tab: "Erfgenamen", "Toewijzingen"
Buttons: "Erfgenaam toevoegen", "Toewijzing toevoegen"
ENTITY_TYPE_LABELS: "Bezitting", "Bankrekening", "Verzekering", "Digitaal Account", "Crypto Wallet"
Relatie options: "Partner", "Kind", "Ouder", "Broer/Zus", "Kleinkind",
  "Neef/Nicht", "Vriend(in)", "Organisatie", "Anders"
Dialog labels: "Erfgenaam toevoegen"/"Erfgenaam bewerken", labels: "Naam", "Relatie",
  "Telefoon", "E-mail", "Adres", "Geboortedatum", "BSN"
Shamir section: "Noodcodes", "Noodcodes Genereren",
  "Verdeel uw hoofdwachtwoord in {n} unieke noodcodes",
  "Drempel: {threshold}", "Aangemaakt: {date}"
  "Noodcode {i} — {naam}", "Code kopiëren", "Gekopieerd!"
Toewijzing: "Toewijzing Toevoegen", "Erfgenaam", "Type", "Item", "Percentage", "Notitie"
Toasts: "Erfgenaam opgeslagen.", "Verwijderen mislukt.", etc.
Empty state: "Nog geen erfgenamen"
Legitimaire portie warning (from JuridischeCheck)
```

#### `app/(authenticated)/boedel/page.tsx` (~80 strings)
```
Page title: "Boedel", subtitle: "Overzicht van uw bezittingen en schulden"
Tabs: "Bezittingen", "Rekeningen", "Verzekeringen", "Schulden"
Categories bezittingen: "Onroerend goed", "Voertuig", "Sieraden", "Kunst",
  "Elektronica", "Meubels", "Overig"
Categories rekeningen: "Betaalrekening", "Spaarrekening", "Beleggingsrekening", "Deposito"
Categories verzekeringen: "Levensverzekering", "Uitvaartverzekering",
  "Overlijdensrisicoverzekering", "Arbeidsongeschiktheidsverzekering",
  "Aansprakelijkheidsverzekering", "Zorgverzekering", "Overig"
Categories schulden: "Hypotheek", "Persoonlijke lening", "Studielening",
  "Creditcard", "Zakelijke lening", "Overig"
Financial: "Bruto nalatenschap", "Netto nalatenschap"
Vermogenssoort: "Privé", "Gemeenschap"
Dialog labels per tab (~20 form labels)
Toasts: "Opgeslagen.", "Verwijderen mislukt."
```

#### `app/(authenticated)/digitaal-bezit/page.tsx` (~85 strings)
```
Page title: "Digitaal Bezit"
Tabs: "Accounts", "Wachtwoorden", "Crypto"
Account categories: "Social Media", "Email", "Banking", "Shopping",
  "Streaming", "Gaming", "Cloud", "Werk", "Overheid", "Overig"
Gewenste actie: "Verwijderen", "Herdenkingsstatus", "Overdragen aan erfgenaam", "Geen actie"
Crypto types: "Bitcoin (BTC)", "Ethereum (ETH)", "Solana (SOL)", "Cardano (ADA)", "Overig"
Import dialog: "CSV Importeren", "Ondersteunt CSV-export van 1Password, Bitwarden,
  LastPass, KeePass en Chrome.", "Bestand kiezen", "Importeren"
Labels accounts (~12), passwords (~8), crypto (~10)
Toasts, empty states, buttons
Afsluitinstructies link: "Afsluiten/overdragen", fallback: "Geen specifieke instructie gevonden"
```

#### `app/(authenticated)/documenten/page.tsx` (~40 strings)
```
Page title: "Documenten"
Drag & drop: "Bestanden hier loslaten", "Sleep bestanden hierheen of klik om te uploaden"
Categories: "Testament", "Identiteitsbewijs", "Akte", "Verzekeringspolis",
  "Medisch document", "Financieel document", "Overig"
Labels: "Bestandsnaam", "Categorie", "Opmerkingen"
Upload status: "Uploaden...", "Geüpload", "Mislukt"
Buttons: "Uploaden", "Downloaden", "Verwijderen"
```

#### `app/(authenticated)/donor/page.tsx` (~15 strings)
```
Page title: "Donorregistratie", subtitle: "Uw keuze conform de Donorwet"
Tip: "Controleer ook uw registratie op donorregister.nl"
Labels + radio buttons for donor choices
```

#### `app/(authenticated)/euthanasie/page.tsx` (~40 strings)
```
Page title: "Wilsverklaring Euthanasie", subtitle: "Uw wensen conform de WGBO"
Legal references to Wtl (Wet toetsing levensbeëindiging)
Sections: "Dementieclausule", "Behandelverbod", "Huisarts", "Vertegenwoordiger"
Multiple paragraph-length Dutch texts with legal content
Labels, buttons, toasts
```

#### `app/(authenticated)/testament/page.tsx` (~100 strings)
```
Page title: "Testament"
Card: "Notaris Gegevens" — labels: Type, Notaris, Kantoor, Telefoon, E-mail,
  Adres, Datum, CTR Nummer, Locatie
Check: "Uitsluitingsclausule" — "Ja"/"Nee"
Sections: "Legaten", "Algemene wensen", "Bijzondere bepalingen"
Tabs: "Begunstigden", "Executeurs"
Dialog labels for begunstigden CRUD: Naam, Relatie, Erfdeel %, Legaat
Dialog labels for executeurs CRUD: Naam, Email, Telefoon, Relatie
Versiegeschiedenis: "Snapshot aanmaken", "Versies vergelijken",
  "Opmerking (optioneel)", comparison table headers: "Veld", "Versie A", "Versie B"
HelpTooltips: multi-sentence Dutch legal explanations of begunstigde, executeur,
  uitsluitingsclausule, CTR, legitimaire portie
Legitimaire portie warning: "Mogelijke schending legitimaire portie"
  + BW Boek 4, art. 4:63-4:69 reference
```

#### `app/(authenticated)/uitvaart/page.tsx` (~90 strings)
```
Page title: "Uitvaartwensen"
Cards: "Uitvaart", "Ceremonie", "Locatie-voorkeuren"
Sub-sections: "Begraafplaats", "Crematorium", "Aula"
Ceremonieverloop CRUD: "Onderdeel", "Spreker", "Muziek"
Genodigdenlijst CRUD: "Naam", "Relatie"
Labels: "Ondernemer", "Tel. ondernemer", "E-mail ondernemer", "Kleding", "Budget",
  "Soort", "Locatie", "Muziekwensen", "Bloemen", "Sprekers",
  "Rouwkaarttekst", "Rouwadvertentietekst", "Condoleance", "Overige wensen"
Checkbox: "Heeft uitvaartverzekering"
Select options: "Begraving", "Crematie", "Natuurbegraving", "Anders"
```

#### `app/(authenticated)/noodcontacten/page.tsx` (~40 strings)
```
Page title: "Noodcontacten"
ROLLEN: "Vertrouwenspersoon", "Huisarts", "Notaris", "Uitvaartondernemer",
  "Advocaat", "Financieel adviseur", "Overig"
Dialog labels: "Naam", "Telefoon", "E-mail", "Adres", "Relatie", "Rol"
Shared contacts: "Gedeelde contacten", "Partners delen vaak dezelfde huisarts..."
Checkbox: "Gedeeld contact — ook relevant voor partner/andere profielen"
Import result: "${n} contact(en) geïmporteerd, ${n} overgeslagen (duplicaat)."
Buttons: "Exporteren", "Importeren"
```

#### `app/(authenticated)/tijdlijn/page.tsx` (~80 strings, ENTIRELY STATIC)
```
Title: "Tijdlijn na Overlijden"
4 fasen, 19 stappen — elk met titel + beschrijving (paragraph-length Dutch):
  Fase 1 "Eerste 24 uur" (5 stappen): arts bellen, naasten informeren, etc.
  Fase 2 "Eerste week" (4 stappen): uitvaart regelen, etc.
  Fase 3 "Eerste maand" (5 stappen): erfenis, bankzaken, etc.
  Fase 4 "Eerste 3 maanden" (5 stappen): belastingaangifte, etc.
Disclaimer: "Dit overzicht is informatief en geen juridisch advies."
```

#### `app/(authenticated)/audit-log/page.tsx` (~15 strings)
```
Title: "Activiteitenlogboek"
Filter options: "Alle acties", "Aangemaakt", "Gewijzigd", "Verwijderd",
  "Ontgrendeld", "Vergrendeld", "Wachtwoord gewijzigd", "Export"
Button: "Vernieuwen"
Empty state: "Nog geen activiteiten geregistreerd."
```

#### `app/(authenticated)/export/page.tsx` (~45 strings)
```
Title: "Exporteren"
14 PDF export options: "Mijn Profiel", "Testament", "Euthanasie Wilsverklaring",
  "Donorregistratie", "Boedel & Financiën", "Uitvaartwensen", "Erfgenamen",
  "Noodcontacten", "Digitale Accounts", "Wachtwoorden", "Crypto Wallets",
  "Documenten", "Activiteitenlog", "Tijdlijn na Overlijden"
"Compleet overzicht": "Alles exporteren als PDF", "Compleet pakket (ZIP)"
"Gestructureerde export": "Downloaden als JSON", "Downloaden als XML"
"CSV-export (Excel)": "Erfgenamen", "Bezittingen", "Bankrekeningen",
  "Verzekeringen", "Schulden", "Noodcontacten"
"NUV-standaard export": "Nederlandse Uitvaart Verzorgers"
Error: "Export mislukt."
```

#### `app/(authenticated)/instellingen/page.tsx` (~110 strings)
```
Title: "Instellingen"
Sections:
  "Auto-vergrendeling" — TIMEOUT_OPTIONS: "1 minuut", "2 minuten", "5 minuten (standaard)",
    "10 minuten", "15 minuten", "30 minuten", "Uitgeschakeld"
  "Grote-tekst modus" — "Normaal", "Grote tekst"
  "Periodieke actualisatie" — "Alles als actueel bevestigen",
    "Nog niet gecontroleerd", "Gecontroleerd: {date}"
  "Profielen" — "Beheer profielen voor uzelf en uw naasten"
    Relatie options: "Partner", "Kind", "Ouder", "Overig"
    "Maximaal 5 profielen bereikt"
    "Profiel verwijderen?", "Alle gegevens van dit profiel worden permanent verwijderd."
  "Wachtwoord wijzigen" — "Huidig wachtwoord", "Nieuw wachtwoord",
    "Bevestig nieuw wachtwoord"
    Validation: "Wachtwoorden komen niet overeen.", "Wachtwoord moet minimaal 8 tekens bevatten."
    "Wachtwoord gewijzigd."
  "Backup & Herstel" — "Backup downloaden", "Backup herstellen",
    "Wachtwoord van de backup"
  "Automatische backup" (Electron only) — "Dagelijks", "Wekelijks", "Maandelijks",
    "Bladeren", "Nu backup maken", "Backup locatie", "Frequentie",
    "Automatische backup inschakelen", "Automatische backup uitschakelen",
    "Backup locatie niet gevonden"
  "Beveiliging" — info lines about AES-256-CBC, SQLCipher, etc.
  "Over Lumio" — version info, description
  "Alle gegevens wissen" — "Alle gegevens permanent verwijderen?",
    "Typ VERWIJDER om te bevestigen", confirmation dialog
```

### 2.2 Layout Components (`src/components/layout/`)

#### `Sidebar.tsx` (~17 strings)
```
15 nav items: "Dashboard", "Mijn Profiel", "Testament", "Wilsverklaring",
  "Donorregistratie", "Digitaal Bezit", "Boedel", "Uitvaartwensen",
  "Documenten", "Erfgenamen", "Noodcontacten", "Tijdlijn Overlijden",
  "Exporteren", "Activiteitenlog", "Instellingen"
"Lumio" (brand in sidebar header)
```

#### `Header.tsx` (~5 strings)
```
"Zoeken" (button/shortcut label)
"Licht thema" / "Donker thema" (title attribute)
"Vergrendelen" (button title)
```

#### `SearchDialog.tsx` (~20 strings)
```
domeinLabels map (10 items): "Erfgenamen", "Noodcontacten", "Digitale Accounts",
  "Wachtwoorden", "Crypto Wallets", "Bezittingen", "Bankrekeningen",
  "Verzekeringen", "Schulden", "Documenten"
"Zoeken in alle gegevens..."
"Zoeken..."
"Geen resultaten gevonden voor"
"Typ minimaal 2 tekens om te zoeken"
"resultaten"
"Zoek in erfgenamen, accounts, bezittingen..."
"om te openen" (keyboard hint)
```

#### `ShortcutsDialog.tsx` (~3 strings)
```
Title: "Sneltoetsen"
(Content comes from SHORTCUT_LIST in hooks)
```

#### `IdleWarningDialog.tsx` (~3 strings)
```
"Sessie verloopt"
"Uw sessie wordt over {secondsLeft} seconden automatisch vergrendeld wegens inactiviteit."
"Actief blijven"
```

#### `ErrorBoundary.tsx` (~4 strings)
```
(Same as error.tsx — duplicated Dutch strings)
```

### 2.3 Auth Components (`src/components/auth/`)

#### `UnlockForm.tsx` (~10 strings)
```
"Lumio Ontgrendelen"
"Voer uw wachtwoord in om toegang te krijgen tot uw digitale nalatenschap."
"Wachtwoord"
"Voer uw wachtwoord in" (placeholder)
"Ontgrendelen" / "Ontgrendelen..."
Fallback error: "Ontgrendelen mislukt"
```

#### `SetupForm.tsx` (~12 strings)
```
"Welkom bij Lumio"
"Kies een sterk wachtwoord om uw digitale nalatenschap te beveiligen.
  Dit wachtwoord versleutelt al uw gegevens."
"Wachtwoord"
"Minimaal 8 tekens" (placeholder)
"Bevestig wachtwoord"
"Herhaal uw wachtwoord" (placeholder)
"Wachtwoord moet minimaal 8 tekens bevatten."
"Wachtwoorden komen niet overeen."
"Database aanmaken..." / "Database Aanmaken"
"Uw gegevens worden versleuteld opgeslagen. Bewaar uw wachtwoord goed..."
Fallback: "Setup mislukt"
```

#### `HeirUnlockForm.tsx` (~12 strings)
```
"Erfgenaam Toegang"
"Voer de noodcodes in om het hoofdwachtwoord te reconstrueren..."
"Code {i}" (label), "Plak hier de noodcode..." (placeholder)
"Nog een code toevoegen"
"Minimaal 2 noodcodes zijn vereist."
"Reconstructie mislukt. Controleer of u genoeg geldige noodcodes heeft ingevoerd."
"Reconstrueren..." / "Ontgrendelen met noodcodes"
```

#### `ProfileSelector.tsx` (~15 strings)
```
"Profiel kiezen"
"Maak uw eerste profiel aan om te beginnen." / "Selecteer een profiel om door te gaan."
"Naam" (label), "Bijv. Jan, Mijn profiel" (placeholder)
"Relatie" (label)
Relatie options: "Partner", "Kind", "Ouder", "Overig"
"Aanmaken..." / "Profiel aanmaken"
"Annuleren"
"Nieuw profiel toevoegen"
"Maximaal 5 profielen bereikt."
Fallback errors: "Profiel selecteren mislukt", "Profiel aanmaken mislukt"
```

#### `PasswordStrengthMeter.tsx` (~10 strings)
```
Strength labels: "Zeer zwak", "Zwak", "Matig", "Sterk", "Zeer sterk"
Checks: "Minimaal 8 tekens", "Hoofd- en kleine letters",
  "Minimaal 1 cijfer", "Minimaal 1 speciaal teken"
```

### 2.4 Wizard Components (`src/components/wizard/`)

#### `OnboardingWizard.tsx` (~30 strings)
```
"Welkom bij Lumio"
"Doorloop deze stappen om uw nalatenschap in te richten"
"Wizard sluiten" (title)
"{n} van {n} voltooid"
6 steps with titel + beschrijving:
  "Mijn Profiel" — "Sla uw persoonlijke gegevens op als basis..."
  "Noodcontacten" — "Wie moet er gebeld worden in geval van nood?"
  "Testament" — "Leg testamentaire informatie vast..."
  "Uitvaartwensen" — "Beschrijf hoe u wilt dat uw uitvaart wordt geregeld."
  "Erfgenamen" — "Registreer uw erfgenamen en verdeel eventueel noodcodes."
  "Backup maken" — "Maak een eerste backup om uw gegevens veilig te stellen."
"Later invullen"
"Afronden"
```

#### `WizardShell.tsx` (~8 strings)
```
"Stap {n} van {n}: {titel}"
"Opslaan mislukt." (fallback error)
"Annuleren"
"Vorige"
"Volgende"
"Opslaan..." / "Opslaan"
```

### 2.5 Interview Component (`src/components/interview/`)

#### `InterviewWizard.tsx` (~70 strings)
```
Wizard titel: "Uw nalatenschap vastleggen"
Stap 1 "Over uzelf": "Laten we beginnen..."
  "Hoe heet u?", "Uw volledige naam zoals op uw identiteitsbewijs."
  Labels: "Voornaam", "Achternaam"
  "Wat is uw geboortedatum?"
  "Waar woont u?"
  "Hoe kunnen nabestaanden u bereiken?", "Optioneel — wordt gebruikt voor uw noodkaart."
  Labels: "Telefoon", "E-mail"
  Placeholders: "Jan", "de Vries", "Amsterdam", "06-12345678", "jan@voorbeeld.nl"
Stap 2 "Vertrouwenspersoon": "Wie is de allerbelangrijkste persoon..."
  "Wie is uw eerste contactpersoon?", "Dit kan uw partner, kind, vriend(in) of buurvrouw zijn."
  "Op welk nummer is deze persoon bereikbaar?"
  "Welke rol heeft deze persoon?", "U kunt later meer contacten toevoegen..."
  Rol options: "Vertrouwenspersoon", "Huisarts", "Notaris", "Uitvaartondernemer", "Overig"
  Placeholder: "Maria de Vries", "Partner, kind, vriend"
Stap 3 "Testament": "Heeft u al een testament? En zo ja, wat voor soort?"
  "Ja, ik heb een testament", "Nee, (nog) niet", "Ik weet het niet zeker"
  "Wat voor soort testament heeft u?", "Notarieel testament", "Codicil (handgeschreven)",
    "Holografisch testament", "Selecteer..."
  "Bij welke notaris ligt uw testament?"
  Tip: "U kunt dit controleren via het Centraal Testamentenregister (CTR)..."
Stap 4 "Uitvaartwensen": "Heeft u al nagedacht over uw uitvaartwensen?"
  "Begraven", "Cremeren", "Natuurbegraven", "Nog geen voorkeur"
  "Heeft u een voorkeur voor een locatie?", "Bijv. een kerk, aula, thuis..."
  "Is er muziek die u graag wilt laten spelen?"
  Placeholder: "Bijv. Nieuwe Kerk, Amsterdam",
    "Bijv. 'Aan de Amsterdamse grachten' van Wim Sonneveld"
Stap 5 "Digitaal bezit": "Heeft u belangrijke online accounts?"
  "Welk online account is voor u het belangrijkst?"
  Labels: "Naam / dienst", "Type"
  Type options: "E-mail", "Social media", "Cloud-opslag", "Bankieren", "Overig"
  "Wat moeten nabestaanden met dit account doen?"
  Tip: "U kunt later onbeperkt accounts, bezittingen en wachtwoorden toevoegen..."
  Placeholders: "Bijv. Gmail, Facebook", "Bijv. 'Account sluiten na overlijden'..."
```

### 2.6 Nabestaanden Component (`src/components/nabestaanden/`)

#### `NabestaandenDashboard.tsx` (~65 strings)
```
Title: "Nabestaanden Dashboard"
Empathisch: "Gecondoleerd met uw verlies. Dit dashboard helpt u stap voor stap..."
"Alle gegevens zijn beschikbaar in alleen-lezen modus..."
Quick actions: "Alles exporteren", "Noodcontacten bekijken"
Hulptekst: "Hulp nodig? Het is normaal als dit overweldigend voelt..."
Voortgang: "Voortgang afhandeling", "{n} van {n} onderdelen afgehandeld"
faseConfig labels: "Direct — eerste 24 uur", "Week 1 — eerste week",
  "Maand 1 — eerste maand", "Afronden"
11 stappenplan items with titel + beschrijving each
Status badges: "Afgehandeld", "In behandeling", "Beschikbaar", "Niet ingevuld"
Buttons: "Start", "Afgehandeld", "Bekijken"
```

### 2.7 Feature Components

#### `VoorbeeldDialog.tsx` (~3 strings)
```
"Bekijk voorbeeld"
Disclaimer: "Dit is fictieve voorbeelddata van 'Familie de Voorbeeld'.
  Geen echte personen of gegevens."
```

#### `PasswordGenerator.tsx` (~8 strings)
```
"Wachtwoord generator"
"Lengte:"
"Opties": checkbox labels for character types
"Nieuw" (knop)
"Gebruik dit wachtwoord"
"Wachtwoord kopiëren"
"Gekopieerd!"
```

#### `ProfielSuggesties.tsx` (~8 strings)
```
"Slimme suggesties"
"Analyseer uw profiel en ontvang suggesties voor ontbrekende of inconsistente gegevens."
"Profiel analyseren"
"Geen suggesties" / "Uw profiel is goed ingevuld en alle gegevens zijn consistent."
"Kon de analyse niet uitvoeren."
"{n} suggestie(s) gevonden:"
```

#### `VoortgangGranulair.tsx` (~3 strings)
```
"Gedetailleerde voortgang"
"{totaalIngevuld} van {totaalVelden} velden ingevuld"
```

#### `StatistiekenWidget.tsx` (~12 strings)
```
Labels: "Erfgenamen", "Digitale accounts", "Documenten",
  "Boedelitems", "Noodcontacten"
"Statistieken"
"Totale waarde", "Schulden", "Netto nalatenschap"
Currency: nl-NL EUR formatting
```

#### `ErfbelastingCalculator.tsx` (~12 strings)
```
"Erfbelasting berekenen"
"Berekenen..." (loading)
"Indicatieve erfbelasting"
"Netto nalatenschap"
"Per erfgenaam"
Table headers: "Naam", "Tariefgroep", "Erfdeel", "Vrijstelling",
  "Belastbaar", "Erfbelasting", "Netto"
"Totaal erfbelasting"
"Voeg eerst erfgenamen toe om de erfbelasting te berekenen."
```

#### `SectieNotitie.tsx` (~6 strings)
```
"Notitie toevoegen"
"Notitie" (label)
Placeholder: "bijv. Let op: de originele aktes liggen in de kluis in de slaapkamer."
"Annuleren", "Opslaan", "Opslaan..."
```

#### `JuridischeCheck.tsx` (~10 strings)
```
"Juridische controle"
"Controleer uw testamentaire keuzes op juridische inconsistenties..."
"Controle uitvoeren"
"Geen waarschuwingen gevonden" / "Uw testamentaire keuzes bevatten geen bekende inconsistenties."
Ernst labels: "Hoog", "Middel", "Informatief"
Disclaimer about notaris
```

#### `NoodkaartQR.tsx` (~10 strings)
```
QR text: "LUMIO NOODKAART", "Bij overlijden, neem contact op met:",
  "Gegevens opgeslagen in Lumio. Gebruik de Shamir-sleutels..."
Dialog: "Noodkaart QR-code"
"Print of bewaar deze QR-code bij uw noodkaart."
"De QR-code bevat de namen, telefoonnummers en rollen van uw noodcontacten."
"Downloaden", "Sluiten"
```

#### `DataHandtekening.tsx` (~3 strings)
```
"Digitale handtekening genereren"
nl-NL date formatting
```

### 2.8 UI Components (`src/components/ui/`)

#### `help-tooltip.tsx` (~1 string)
```
aria-label: "Meer informatie"
```

> De overige UI-componenten (badge, button, card, dialog, input, label, select, tabs, textarea) bevatten **geen** hardcoded Nederlandse tekst — het zijn generieke shadcn/ui-wrappers.

---

### 2.9 Hooks (`src/hooks/`)

#### `useKeyboardShortcuts.ts` (~18 strings)
```
SHORTCUT_LIST — 18 items with Dutch 'beschrijving' field:
  "Zoeken", "Vergrendelen", "Nieuw item", "Sneltoetsen tonen",
  "Ga naar Dashboard", "Ga naar Profiel", "Ga naar Testament",
  "Ga naar Wilsverklaring", "Ga naar Donorregistratie",
  "Ga naar Digitaal Bezit", "Ga naar Boedel", "Ga naar Uitvaartwensen",
  "Ga naar Documenten", "Ga naar Erfgenamen", "Ga naar Noodcontacten",
  "Ga naar Exporteren", "Ga naar Activiteitenlog", "Ga naar Instellingen"
```

#### `useIdleTimer.ts` — Geen hardcoded Nederlandse tekst
#### `useTheme.ts` — Geen hardcoded Nederlandse tekst

### 2.10 Stores (`src/stores/`)

#### `authStore.ts` (~5 Dutch interface fields)
```
Profile interface: { naam, relatie, isPrimair, aangemaaktOp }
(These are data field names from API, not UI text)
```

### 2.11 Lib (`src/lib/`)

#### `api-client.ts` — Geen hardcoded Nederlandse tekst
#### `utils.ts` — Geen hardcoded Nederlandse tekst

#### `afsluit-instructies.ts` (~120 strings)
```
28 platform entries, each with:
  platform: Dutch platform name (e.g. "Facebook / Meta")
  zoekwoorden: Dutch search terms
  beschrijving: Dutch instruction paragraph (1-2 sentences each)
  categorie: Dutch category name
  url: links to Dutch-language help pages (.nl domains)

Platforms: Facebook, Instagram, X (Twitter), LinkedIn, TikTok, Snapchat,
  Google, Microsoft, Apple, Yahoo, ING, Rabobank, ABN AMRO, SNS Bank,
  PayPal, Bol.com, Amazon, Coolblue, Netflix, Spotify, Disney+,
  Steam, PlayStation, Xbox, DigiD, MijnOverheid, Slack, Zoom

Function names: zoekAfsluitInstructie(), zoekAfsluitInstructiesVoorCategorie()
```

#### `voorbeeld-data.ts` (~350 strings)
```
Complete fictional dataset "Familie de Voorbeeld" across 8 domains:
  eigenaar: 15+ label/waarde pairs (persoonsgegevens, adres, etc.)
  testament: notaris, begunstigden, executeur, bepalingen
  euthanasie: wensen, dementieclausule, vertegenwoordiger
  donor: orgaankeuze
  boedel: bezittingen, rekeningen, verzekeringen, schulden with values
  uitvaart: type, locatie, ceremonie, muziek, rouwkaart
  erfgenamen: names, relaties, contact details
  digitaal-bezit: accounts, wachtwoorden, crypto

Intro text: "Hieronder ziet u een voorbeeld van hoe Lumio eruit ziet
  wanneer alle gegevens zijn ingevuld."

Each domain has `titel`, `beschrijving`, multiple `secties` with `label`
and `velden` arrays containing `{label, waarde}` objects.
```

---

## 3. Backend API — Nederlandse Veld- en Padnamen

### 3.1 API Endpoints (Dutch paths)
```
/api/auth/ontgrendel          POST  (wachtwoord)
/api/auth/vergrendel          POST
/api/auth/setup               POST  (wachtwoord)
/api/auth/status              GET   → { isOntgrendeld, isEersteKeer, isAlleenLezen,
                                         profielGeselecteerd, profielHeeftSetupNodig }
/api/auth/selecteer-profiel   POST  (profielId)
/api/auth/wijzig-wachtwoord   POST  (huidigWachtwoord, nieuwWachtwoord)
/api/profielen                GET/POST
/api/eigenaar                 GET/POST/PUT   (voornaam, achternaam, tussenvoegsel, etc.)
/api/eigenaar/foto            POST (upload)
/api/erfgenamen               GET/POST/PUT/DELETE
/api/boedel/bezittingen       GET/POST/PUT/DELETE
/api/boedel/rekeningen        GET/POST/PUT/DELETE
/api/boedel/verzekeringen     GET/POST/PUT/DELETE
/api/boedel/schulden          GET/POST/PUT/DELETE
/api/digitaal-bezit/accounts  GET/POST/PUT/DELETE
/api/digitaal-bezit/wachtwoorden GET/POST/PUT/DELETE
/api/digitaal-bezit/crypto    GET/POST/PUT/DELETE
/api/digitaal-bezit/importeer POST
/api/documenten               GET/POST/DELETE
/api/donor                    GET/POST/PUT
/api/euthanasie               GET/POST/PUT
/api/testament                GET/POST/PUT
/api/testament/begunstigden   GET/POST/PUT/DELETE
/api/testament/executeurs     GET/POST/PUT/DELETE
/api/testament/snapshots      GET/POST
/api/uitvaart                 GET/POST/PUT
/api/uitvaart/ceremonieverloop GET/POST/PUT/DELETE
/api/uitvaart/genodigden      GET/POST/PUT/DELETE
/api/noodcontacten            GET/POST/PUT/DELETE
/api/noodcontacten/importeer  POST
/api/noodcontacten/exporteer  GET
/api/toewijzingen             GET/POST/PUT/DELETE
/api/shamir/genereer          POST  → { delen, drempel }
/api/shamir/reconstrueer      POST  (delen) → { wachtwoord }
/api/notities                 GET/POST/PUT/DELETE
/api/zoeken                   GET   ?q=
/api/audit-log                GET
/api/status/compleetheid      GET   → { percentage, aantalIngevuld, totaal, domeinen }
/api/status/compleetheid/granulair GET
/api/status/meldingen         GET   → { meldingen: [{ categorie }] }
/api/status/actualisatie      GET/POST
/api/export/pdf/{domein}      GET
/api/export/pdf/compleet      GET
/api/export/zip               GET
/api/export/json              GET
/api/export/xml               GET
/api/export/csv/{type}        GET
/api/export/nuv               GET
/api/backup                   GET
/api/backup/herstel            POST
/api/afhandeling               GET/POST
/api/afhandeling/initialiseer  POST
/api/afhandeling/{id}          PUT
/api/juridische-check          GET
/api/suggesties                GET
/api/erfbelasting/bereken      GET
/api/handtekening/genereer     POST
```

### 3.2 Nederlandse DTO veldnamen (selectie)
```
voornaam, achternaam, tussenvoegsel, geboortedatum, woonplaats, telefoon, email
burgerlijkeStaat, huwelijksgoederenregime, bsn
soortIdentiteitsbewijs, documentnummer, geldigTot
naam, relatie, rol, adres, postcode
soortTestament, notaris, kantoor, ctrNummer, uitsluitingsclausule
erfdeel, legaat, begunstigden, executeurs
typeUitvaart, muziekWensen, bloemen, sprekers, rouwkaarttekst, rouwadvertentietekst
bezittingen, rekeningen, verzekeringen, schulden
categorie, beschrijving, waarde, vermogenssoort
gewensteActie, gebruikersnaam, platformNaam
walletType, walletNaam, adresOfSleutel
delen, drempel, isGedeeld
percentage, aantalIngevuld, totaal, domeinen, ingevuld
```

---

## 4. Routestructuur (volledig Nederlands)

```
/                              → Login / Profiel selectie
/dashboard                     → Dashboard
/eigenaar                      → Mijn Profiel
/testament                     → Testament
/euthanasie                    → Wilsverklaring Euthanasie
/donor                         → Donorregistratie
/digitaal-bezit                → Digitaal Bezit
/boedel                        → Boedel (Bezittingen & Schulden)
/uitvaart                      → Uitvaartwensen
/documenten                    → Documenten
/erfgenamen                    → Erfgenamen
/noodcontacten                 → Noodcontacten
/tijdlijn                      → Tijdlijn na Overlijden
/audit-log                     → Activiteitenlogboek
/export                        → Exporteren
/instellingen                  → Instellingen
```

---

## 5. Patronen & Observaties voor i18n

### 5.1 Huidige situatie — Geen i18n

- **Geen** i18n-framework (geen next-intl, react-i18next, of vergelijkbaar)
- **Geen** vertaalbestanden, locale-configuratie, of taalwisselaar
- `<html lang="nl">` is hardcoded in `layout.tsx`
- Alle UI-teksten staan direct inline in JSX als string literals
- Alle API-velden gebruiken Nederlandse namen

### 5.2 Categorieën hardcoded tekst

| Category | Pattern | Example | Count |
|---|---|---|---|
| **JSX string literals** | `"Tekst"` in TSX | `<CardTitle>Mijn Profiel</CardTitle>` | ~500 |
| **Template literals** | `` `${var} tekst` `` | `` `${n} van ${total} ingevuld` `` | ~40 |
| **Select/option values** | `<option value="">Label</option>` | `<option>Gehuwd</option>` | ~120 |
| **Placeholder attributes** | `placeholder="..."` | `placeholder="Voer uw wachtwoord in"` | ~50 |
| **Title/aria attributes** | `title="..."` / `aria-label="..."` | `title="Vergrendelen"` | ~10 |
| **Const arrays/objects** | Named data structures | `SHORTCUT_LIST`, `ROLLEN`, `stappen` | ~200 |
| **Toast/error messages** | `setError("...")`  | `"Opslaan mislukt."` | ~60 |
| **Multi-sentence content** | Paragraph text | Legal disclaimers, tijdlijn steps | ~80 |
| **Data file content** | voorbeeld-data, afsluit-instructies | Knowledge base entries | ~450 |

### 5.3 Veelvoorkomende herhaalde strings (kandidaten voor gedeelde keys)

| String | Voorkomens (approx.) |
|---|---|
| `"Opslaan"` / `"Opslaan..."` | 12+ |
| `"Annuleren"` | 10+ |
| `"Verwijderen"` | 10+ |
| `"Toevoegen"` | 8+ |
| `"Bewerken"` | 8+ |
| `"Naam"` | 15+ |
| `"Telefoon"` | 10+ |
| `"E-mail"` | 10+ |
| `"Relatie"` | 8+ |
| `"Adres"` | 6+ |
| `"Laden..."` / `"Laden"` | 5+ |
| `"Opslaan mislukt."` | 8+ |
| `"Verwijderen mislukt."` | 6+ |
| `"Overig"` | 12+ |
| `"Wachtwoord"` | 6+ |
| `"Selecteer..."` | 5+ |
| `"Geen resultaten"` | 3+ |

### 5.4 Dynamische tekst met interpolatie

Patronen die speciale i18n-aandacht vereisen (ICU MessageFormat of equivalent):

```tsx
// Pluralisatie
`${n} suggestie(s) gevonden:`
`${n} contact(en) geïmporteerd, ${n} overgeslagen (duplicaat).`
`${n} van ${total} onderdelen ingevuld`
`${n} van ${total} velden ingevuld`

// Conditionele tekst
`Stap ${n} van ${total}: ${titel}`
`Gecontroleerd: ${datum}`
`Noodcode ${i} — ${naam}`

// Geslachtsspecifiek (potentieel bij andere talen)
"Weduwe/Weduwnaar"
"Vriend(in)"
"Broer/Zus"
"Neef/Nicht"
```

### 5.5 Juridische & domein-specifieke teksten

Bijzonder complexe vertalingen — juridische termen gebonden aan Nederlands recht:

```
- BW Boek 4 (Burgerlijk Wetboek — erfrecht)
- WGBO (Wet op de geneeskundige behandelingsovereenkomst)
- Wtl (Wet toetsing levensbeëindiging)
- Donorwet
- CTR (Centraal Testamentenregister)
- NUV (Nederlandse Uitvaart Verzorgers)
- Legitimaire portie (art. 4:63-4:69)
- Uitsluitingsclausule
- Huwelijksgoederenregime
- Koude uitsluiting
- Dementieclausule
- Behandelverbod
```

---

## 6. Electron-specifieke teksten (`src/lumio-desktop/`)

#### `main/index.ts` (~2 strings)
```
Dialog title: "Lumio — Fout bij opstarten"
Dialog body: "Lumio kon niet worden gestart.\n\n{err}\n\nBackend: {path}\nFrontend: {path}"
```

#### `main/window.ts` (~1 string)
```
Window title: "Lumio — Digitale Nalatenschap"
```

#### `main/autobackup.ts` (~5 strings)
```
Dialog title: "Selecteer backup locatie"
Error messages: "Geen auto-backup geconfigureerd.",
  "Backupdirectory niet gevonden: {pad}",
  "Backup API retourneerde status {code}. Is de database ontgrendeld?",
  "Backup timeout (30s)."
Frequentie matching: "dagelijks", "wekelijks", "maandelijks"
```

#### `preload/index.ts` — Geen directe tekst (exposeert IPC API)
#### `main/sidecar.ts` — Alleen Engelse console-logs
#### `main/paths.ts` — Geen tekst

#### `electron-builder.yml` (~2 strings)
```
appId: "nl.lumio.desktop"
productName: "Lumio"
copyright: "Copyright © 2026 Lumio"
```

#### `package.json` (~1 string)
```
description: "Lumio — Digitale Nalatenschap (Electron shell)"
```

---

## 7. Configuratiebestanden

#### `lumio-web/package.json`
```
name: "lumio-web" (niet vertaalbaar)
Geen Nederlandse teksten
```

#### `lumio-web/next.config.ts`
```
Niet gelezen — standaard Next.js config, geen tekst verwacht
```

#### `lumio-desktop/electron-builder.yml`
```
appId: "nl.lumio.desktop"
productName: "Lumio"
copyright: "Copyright © 2026 Lumio"
```

---

## 8. localStorage keys (Dutch naming)

```
"lumio-theme"              — "light" | "dark"
"lumio-grote-tekst"        — boolean
"lumio-idle-timeout"       — number (minutes)
"lumio_onboarding_completed" — "true"
```

---

## 9. Aanbevelingen voor i18n-implementatie

### 9.1 Voorgestelde aanpak

1. **Framework:** `next-intl` (beste Next.js App Router integratie) of `react-i18next`
2. **Bestandsstructuur:** `src/messages/nl.json`, `src/messages/en.json`, etc.
3. **Namespace-indeling:**
   - `common` — gedeelde strings (Opslaan, Annuleren, Verwijderen, etc.)
   - `auth` — login, setup, unlock
   - `dashboard` — dashboard labels
   - `eigenaar` — profielformulier
   - `testament` — testamentpagina
   - `erfgenamen` — erfgenamenbeheer
   - `boedel` — boedelpagina
   - `digitaal` — digitaal bezit
   - `documenten` — documentenbeheer
   - `uitvaart` — uitvaartwensen
   - `donor` — donorregistratie
   - `euthanasie` — wilsverklaring
   - `noodcontacten` — noodcontacten
   - `tijdlijn` — tijdlijn content
   - `export` — exportpagina
   - `instellingen` — instellingenpagina
   - `search` — zoekfunctie
   - `onboarding` — wizard en interview
   - `nabestaanden` — nabestaandendashboard
   - `legal` — juridische teksten
   - `afsluit` — platformafsluitinstructies
   - `voorbeeld` — voorbeelddata

### 9.2 Complexiteitsfactoren

| Factor | Impact | Toelichting |
|---|---|---|
| **Juridische teksten** | Hoog | Nederlandse wetten; vertaling vereist juridische expertise |
| **API-veldnamen** | Hoog | Backend retourneert Nederlandse veldnamen — vereist backend-aanpassing of mapping-laag |
| **Route-paden** | Middel | URL-paden zijn Nederlands — i18n routing nodig of behouden |
| **Enum display values** | Middel | ~120 waarden verspreid over 10+ pagina's — centraliseren |
| **Template literals** | Laag-Middel | ~40 strings met interpolatie — ICU MessageFormat |
| **voorbeeld-data.ts** | Laag | Gehele bestand per taal — of dynamisch laden |
| **afsluit-instructies.ts** | Laag | Platform-instructies zijn taalspecifiek — aparte bestanden per locale |
| **Electron strings** | Laag | Slechts ~10 strings |

### 9.3 Prioriteitsvolgorde

1. **Fase 1 — Framework installeren + gedeelde strings** (~50 strings)
   - Installeer next-intl, configureer middleware, locale detection
   - Extract `common` namespace (Opslaan, Annuleren, Laden, etc.)

2. **Fase 2 — Auth flow + navigatie** (~80 strings)
   - UnlockForm, SetupForm, HeirUnlockForm, ProfileSelector, PasswordStrengthMeter
   - Sidebar, Header, SearchDialog, ShortcutsDialog, IdleWarningDialog

3. **Fase 3 — Pagina's per domein** (~800 strings)
   - Vertaal pagina voor pagina, begin met de meest bezochte (dashboard, eigenaar)

4. **Fase 4 — Complexe content** (~450 strings)
   - voorbeeld-data.ts, afsluit-instructies.ts, tijdlijn-content
   - Juridische teksten (met juridische review)

5. **Fase 5 — API-laag** (~80 veldnamen)
   - Backend DTO-mapping of frontend field-name mapping
   - Route i18n (optioneel)

---

## 10. Samenvatting

| Metriek | Waarde |
|---|---|
| Totaal geschatte vertaalbare strings | **~1.550–1.600** |
| Bestanden met Nederlandse tekst | **~45** |
| Bestanden zonder Nederlandse tekst | **~10** (utils, hooks, API client, UI primitives) |
| Bestaand i18n-framework | **Geen** |
| Taal HTML tag | `nl` (hardcoded) |
| API-veldnamen taal | **Nederlands** |
| Route-paden taal | **Nederlands** |
| Enum/select waarden | **~120 unieke waarden** |
| Juridische referenties | **6+ Nederlandse wetten** |
| Kennisbank-entries (afsluitinstructies) | **28 platforms** |
| Voorbeelddata-entries | **~350 strings** |
| Herhaalde strings (kandidaten voor `common`) | **~17 unieke strings, ~100+ voorkomens** |
