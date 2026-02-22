# Lumio — Persona-gedreven Feature Roadmap

> Geconsolideerd uit de SWOT-analyses van 6 persona's:
> 1. **De Eigenaar** (Jan, 62) — primaire gebruiker
> 2. **De Erfgenaam** (Lisa, 34) — nabestaande met Shamir-toegang
> 3. **De Partner** (Maria, 59) — minder digitaal vaardige mede-gebruiker
> 4. **De Executeur** (Pieter, 48) — executeur-testamentair
> 5. **De Notaris** (Anneke, 52) — ontvangt Lumio-output als basis voor aktes
> 6. **De Uitvaartondernemer** (Frank, 45) — werkt met uitvaart-PDFs
>
> Features zijn geïdentificeerd vanuit de **Must Have**, **Should Have** en **Could Have** secties
> van elke persona-analyse, gededupliceerd en geprioriteerd op basis van cross-persona impact.

---

## Beoordelingsmethode

| Categorie | Betekenis |
|-----------|-----------|
| **Must Have** | Feature die door ≥1 persona als onmisbaar is beoordeeld voor productiegebruik |
| **Should Have** | Belangrijke verbetering die de bruikbaarheid significant verhoogt |
| **Could Have** | Waardevolle toevoeging als er tijd/budget beschikbaar is |
| **Won't Have (now)** | Bewust uitgesteld — niet relevant voor v2.0 |

| Persona-impact | Notatie |
|----------------|---------|
| 🔴 Must Have door deze persona | Rode prioriteit |
| 🟡 Should Have door deze persona | Gele prioriteit |
| ⚪ Niet relevant voor deze persona | — |

---

## Must Have

### P-M1 — Read-only modus na Shamir-ontgrendeling

**Status:** Ontbreekt  
**Persona-impact:** Erfgenaam 🔴, Executeur 🔴  
**Risico:** HOOG (data-integriteit)

Na Shamir-ontgrendeling heeft elke gebruiker volledige lees- én schrijftoegang. Nabestaanden en executeurs kunnen per ongeluk (of bewust) gegevens wijzigen of verwijderen. In een juridisch gevoelige context ondermijnt dit de bewijskracht van de data.

**Implementatie:**
- Backend: `IsReadOnly` flag op de sessie-context, gezet bij Shamir-unlock
- Middleware: blokkeer alle POST/PUT/DELETE requests wanneer `IsReadOnly = true`
- Frontend: formuliervelden disabled, knoppen verborgen, visuele "alleen-lezen" indicator
- Optioneel: override-mogelijkheid met expliciete bevestiging ("Ik wil wijzigen")

**Geschatte complexiteit:** Middel (6-8 uur)

---

### P-M2 — Nabestaanden-dashboard met stappenplan

**Status:** Ontbreekt  
**Persona-impact:** Erfgenaam 🔴, Executeur 🟡  
**Risico:** HOOG (bruikbaarheid na overlijden)

Na Shamir-ontgrendeling ziet de nabestaande 14 menu-items — overweldigend in een moment van rouw. Er is geen begeleide flow die prioriteert: eerst bellen, dan uitvaart, dan juridisch, dan financieel.

**Implementatie:**
- Frontend: apart dashboard-component dat verschijnt na Shamir-unlock
- Fase-indeling: **Urgent** (noodcontacten, uitvaart) → **Week 1** (notaris, verzekeringen) → **Maand 1** (bankrekeningen, digitale accounts) → **Afronden** (boedelverdeling)
- Per fase: directe links naar relevante secties in Lumio
- Empathische toon: "We begrijpen dat dit een moeilijke tijd is."

**Geschatte complexiteit:** Middel (6-10 uur)

---

### P-M3 — Financieel totaaloverzicht

**Status:** Ontbreekt  
**Persona-impact:** Executeur 🔴  
**Risico:** MIDDEL (kernfunctionaliteit executeur)

Er is geen berekening van: Σ bezittingen + Σ bankrekeningen - Σ schulden = netto nalatenschap. De executeur moet alles handmatig optellen uit losse lijsten.

**Implementatie:**
- Backend: `GET /api/boedel/samenvatting` — berekent totalen per categorie
- Frontend: financieel dashboard-widget met:
  - Totaal bezittingen (geschatte waarde)
  - Totaal bank-saldi
  - Totaal verzekeringen (uitkeringswaarde)
  - Totaal schulden (openstaand)
  - **Netto nalatenschap = activa - passiva**
- Optioneel: grafische weergave (staafdiagram of taart)

**Geschatte complexiteit:** Middel (4-8 uur)

---

### P-M4 — Burgerlijke staat en huwelijksvoorwaarden

**Status:** Ontbreekt  
**Persona-impact:** Notaris 🔴, Executeur 🟡  
**Risico:** HOOG (juridische compleetheid)

Het eigenaar-profiel bevat geen burgerlijke staat, partnerschapsvorm of huwelijksvoorwaarden. Dit bepaalt het toepasselijke erfrecht en is verplicht voor notariële aktes.

**Implementatie:**
- Domain: velden op `Eigenaar`: `BurgerlijkeStaat` (enum: Ongehuwd, Gehuwd, GeregistreerdPartnerschap, Gescheiden, Weduwe/Weduwnaar), `Huwelijksvoorwaarden` (enum: GemeenschapVanGoederen, BeperkteGemeenschap, KoudeUitsluiting, NietVanToepassing), `DatumHuwelijk`
- DTO + frontend: extra sectie op profiel-pagina
- PDF-export: opnemen in testament-concept en boedeloverzicht

**Geschatte complexiteit:** Laag (3-5 uur)

---

### P-M5 — Auto-backup naar configureerbare locatie

**Status:** Ontbreekt (handmatige backup bestaat)  
**Persona-impact:** Eigenaar 🔴  
**Risico:** HOOG (dataverlies)

De eigenaar moet handmatig een backup downloaden en opslaan. Zonder automatisering wordt dit vergeten, met dataverlies als gevolg.

**Implementatie:**
- Backend/Electron: configureerbaar backup-pad in instellingen (USB, NAS, lokale map)
- Trigger: bij vergrendeling, of op schema (dagelijks/wekelijks)
- Electron main process: `fs.copyFile` naar geconfigureerd pad
- Fallback: als pad niet beschikbaar is, melding tonen bij volgende ontgrendeling
- Instellingen-UI: mapkiezer + frequentie-instelling

**Geschatte complexiteit:** Middel (6-10 uur)

---

### P-M6 — Verloopdatum-tracking op documenten

**Status:** Ontbreekt  
**Persona-impact:** Eigenaar 🔴, Erfgenaam 🟡  
**Risico:** MIDDEL (actualitieit)

Documenten (paspoort, rijbewijs, verzekeringspolis) hebben geen verloopdatum. De eigenaar merkt pas te laat dat een document verlopen is.

**Implementatie:**
- Domain: optioneel `VerlooptOp` (DateTime?) veld op `PersoonlijkDocument`
- Frontend: datumkiezer bij upload, waarschuwingsindicator bij verlopen/bijna-verlopen documenten
- Notificatie: opnemen in bestaand notificatie-systeem ("Uw paspoort verloopt over 30 dagen")
- Dashboard: verlopen documenten tonen in compleetheids-widget

**Geschatte complexiteit:** Laag (3-5 uur)

---

### P-M7 — Onboarding-wizard bij eerste gebruik

**Status:** Ontbreekt  
**Persona-impact:** Eigenaar 🔴, Partner 🔴  
**Risico:** MIDDEL (adoptie/retentie)

Nieuwe gebruikers openen de app en zien 14 menu-items zonder begeleiding. Zonder stap-voor-stap introductie haakt de gebruiker af of vult secties willekeurig in.

**Implementatie:**
- Frontend: multi-stap wizard na eerste ontgrendeling
- Stappen: Profiel → Noodcontacten → Testament-basis → Uitvaartwensen → Backup instellen → Shamir uitleg
- "Later invullen" optie per stap
- Voortgangsindicator: "Stap 3 van 6"
- Opslaan in `localStorage`: `onboardingCompleted = true`

**Geschatte complexiteit:** Middel (6-10 uur)

---

### P-M8 — Contextuele veld-uitleg (tooltips / helptext)

**Status:** Ontbreekt  
**Persona-impact:** Partner 🔴, Eigenaar 🟡  
**Risico:** MIDDEL (toegankelijkheid)

Complexe velden (uitsluitingsclausule, codicil, Shamir-geheimdeelschema) worden zonder uitleg getoond. Minder digitaal vaardige gebruikers begrijpen niet wat ze invullen.

**Implementatie:**
- Frontend: info-icoontje (ℹ️) naast complexe velden met popover-uitleg
- Uitleg in lekentaal, bijv.: "Een uitsluitingsclausule voorkomt dat het erfdeel van uw kinderen in een gemeenschap van goederen valt bij een scheiding van uw kind."
- Uitleg-teksten als constanten/configuratie, niet hardcoded in componenten
- Prioriteit: wizard-velden, Shamir-pagina, testament-velden

**Geschatte complexiteit:** Middel (6-10 uur — veel velden)

---

### P-M9 — Noodprocedure-document & installatie-instructie

**Status:** Ontbreekt  
**Persona-impact:** Eigenaar 🔴, Erfgenaam 🔴  
**Risico:** HOOG (toegankelijkheid na overlijden)

Er is geen duidelijke instructie voor nabestaanden: "Hoe open ik Lumio na overlijden?" Zonder dit document is de hele applicatie nutteloos als de eigenaar overlijdt.

**Implementatie:**
- Backend: nieuwe PDF template `GenerateNoodprocedurePdf()`:
  - Stap 1: Installeer Lumio (download-link/QR-code)
  - Stap 2: Klik "Herstellen" en selecteer het backup-bestand (locatie vermelden)
  - Stap 3: Voer de Shamir-shares in (uitleg wat shares zijn, hoeveel nodig)
  - Stap 4: Navigeer naar het nabestaanden-dashboard
- Automatisch genereren bij Shamir-share aanmaak
- Optie om mee te printen met de noodkaart

**Geschatte complexiteit:** Laag-Middel (4-6 uur)

---

### P-M10 — Compleet export-pakket (ZIP met alles)

**Status:** Gedeeltelijk (individuele PDFs bestaan)  
**Persona-impact:** Erfgenaam 🔴, Executeur 🟡  
**Risico:** MIDDEL (praktisch nut)

Nabestaanden moeten per sectie apart een PDF exporteren. Er is geen "download alles" functie die alle PDFs én alle geüploade documenten bundelt in één ZIP.

**Implementatie:**
- Backend: `GET /api/export/alles` → ZIP-bestand met:
  - Alle domein-PDFs (testament, uitvaart, donor, euthanasie, noodkaart, boedel, etc.)
  - Alle geüploade documenten (persoonlijke documenten)
  - `INHOUD.txt` — index van alle bestanden
- Frontend: "Alles downloaden" knop op export-pagina

**Geschatte complexiteit:** Middel (4-8 uur)

---

### P-M11 — Boedelbeschrijving-export (Art. 4:146 BW)

**Status:** Ontbreekt  
**Persona-impact:** Executeur 🔴  
**Risico:** MIDDEL (juridische verplichting)

Een executeur is wettelijk verplicht een boedelbeschrijving op te stellen. Lumio bevat alle data maar genereert dit document niet.

**Implementatie:**
- Backend: `GenerateBoedelbeschrijvingPdf()` — formeel document met:
  - Persoonsgegevens overledene + burgerlijke staat
  - Activa: onroerend goed, bankrekeningen, verzekeringen, bezittingen (met waarden)
  - Passiva: schulden, hypotheek (met bedragen)
  - Totalen: bruto nalatenschap, schulden, netto nalatenschap
  - Erfgenamen met erfdelen
  - Ondertekenplek voor executeur en erfgenamen
- QuestPDF template met correcte juridische opmaak

**Geschatte complexiteit:** Middel (6-10 uur)

---

### P-M12 — Status-tracking per item

**Status:** Ontbreekt  
**Persona-impact:** Executeur 🔴, Erfgenaam 🔴  
**Risico:** MIDDEL (workflow)

Na overlijden moeten tientallen zaken worden afgehandeld (bankrekeningen sluiten, verzekeringen melden, accounts opruimen). Er is geen status-tracking: Open → In behandeling → Afgehandeld.

**Implementatie:**
- Domain: `AfhandelingsStatus` enum (Open, InBehandeling, Afgehandeld) + `StatusNotitie` op relevante entities
- Alleen beschikbaar na Shamir-unlock (nabestaanden-context)
- Frontend: status-badge per item, filter op status, voortgangsindicator
- Overzichtspagina: "12 van 34 items afgehandeld"

**Geschatte complexiteit:** Middel (6-10 uur)

---

### P-M13 — Gestructureerde export (JSON/XML)

**Status:** Ontbreekt (alleen PDF)  
**Persona-impact:** Notaris 🔴  
**Risico:** MIDDEL (interoperabiliteit)

De notaris moet alle gegevens handmatig overtypen uit PDFs naar eigen software. Een gestructureerd exportformaat bespaart uren werk en voorkomt fouten.

**Implementatie:**
- Backend: `GET /api/export/json` en `GET /api/export/xml`
- Schema: alle eigenaar-gegevens, erfgenamen, bezittingen, bankrekeningen, testament-info
- Exclusief: wachtwoorden, seed phrases, Shamir-shares (privacy)
- Content-negotiation of aparte endpoints

**Geschatte complexiteit:** Middel (4-8 uur)

---

### P-M14 — Locatie-voorkeuren uitvaart

**Status:** Ontbreekt  
**Persona-impact:** Uitvaartondernemer 🔴  
**Risico:** MIDDEL (praktisch nut)

De eigenaar kiest "begraven" of "cremeren" maar specificeert geen locatie (begraafplaats, crematorium, aula). De uitvaartondernemer moet dit alsnog uitvragen.

**Implementatie:**
- Domain: velden op `UitvaartWensen`: `VoorkeurBegraafplaats`, `VoorkeurCrematorium`, `VoorkeurAula`, elk met naam + adres
- Frontend: extra sectie in uitvaart-wizard
- PDF-export: opnemen in uitvaartwensen-document

**Geschatte complexiteit:** Laag (2-4 uur)

---

### P-M15 — "Laatste actualisatie"-datum op PDFs

**Status:** Ontbreekt  
**Persona-impact:** Uitvaartondernemer 🔴, Notaris 🟡  
**Risico:** LAAG (vertrouwen)

PDFs tonen geen datum van laatste bijwerking. Ontvangers weten niet of de informatie actueel is.

**Implementatie:**
- Backend: bij PDF-generatie de `LaatsteWijziging` datum van de relevante entities ophalen
- Prominent op elke PDF: "Gegevens voor het laatst bijgewerkt op [datum]"
- Per sectie indien mogelijk (bijv. "Uitvaartwensen bijgewerkt: 15-01-2026, Testament bijgewerkt: 03-11-2025")

**Geschatte complexiteit:** Laag (2-3 uur)

---

### P-M16 — Pasfoto / profielfoto opslag

**Status:** Ontbreekt  
**Persona-impact:** Uitvaartondernemer 🔴  
**Risico:** LAAG (gemak)

De uitvaartondernemer heeft een pasfoto nodig voor de rouwkaart. Lumio slaat geen foto van de eigenaar op.

**Implementatie:**
- Domain: `ProfielFoto` (byte[], optioneel) op `Eigenaar`, of als apart `PersoonlijkDocument` met categorie "Pasfoto"
- Frontend: foto-upload op profiel-pagina met preview
- PDF-export: optioneel opnemen in noodkaart en uitvaart-PDF
- Versleuteld opgeslagen via `IEncryptionService`

**Geschatte complexiteit:** Laag (3-5 uur)

---

### P-M17 — Legitimatiegegevens

**Status:** Ontbreekt  
**Persona-impact:** Notaris 🔴  
**Risico:** MIDDEL (juridische compleetheid)

Notariële aktes vereisen identificatiegegevens: soort legitimatiebewijs, documentnummer, datum afgifte, geldig tot. Lumio registreert dit niet.

**Implementatie:**
- Domain: velden op `Eigenaar` en `Erfgenaam`: `LegitimatieSoort` (enum: Paspoort, Identiteitskaart, Rijbewijs), `LegitimatiNummer`, `LegitimatieDatumAfgifte`, `LegitimatieGeldigTot`
- Frontend: sectie "Identificatie" op profiel-pagina en erfgenaam-formulier
- PDF: opnemen in testament-concept en boedelbeschrijving

**Geschatte complexiteit:** Laag (3-5 uur)

---

### P-M18 — Vereenvoudigde terminologie

**Status:** Ontbreekt  
**Persona-impact:** Partner 🔴  
**Risico:** MIDDEL (toegankelijkheid)

Technische termen als "Shamir-geheimdeelschema", "AES-256-GCM" en "sessie vergrendelen" zijn ontoegankelijk voor minder digitaal vaardige gebruikers.

**Implementatie:**
- Frontend: lekentaal-labels in de UI:
  - "Shamir-geheimdeelschema" → "Noodcode verdelen"
  - "Sessie vergrendelen" → "Vergrendelen"
  - "Auto-lock timeout" → "Automatisch vergrendelen na"
  - "Master-wachtwoord" → "Hoofdwachtwoord"
- Technische termen alleen in tooltips/help-tekst
- Audit: alle labels doorlopen op jargon

**Geschatte complexiteit:** Laag (3-5 uur)

---

### P-M19 — Versiebewuste juridische disclaimer

**Status:** Gedeeltelijk (disclaimer bestaat, maar zonder versie)  
**Persona-impact:** Notaris 🔴  
**Risico:** LAAG (juridische correctheid)

Het testament-concept vermeldt niet op welke datum/wetgeving het is gebaseerd. Bij wetswijzigingen is onduidelijk of het concept actueel is.

**Implementatie:**
- PDF-footer: "Opgesteld op [generatiedatum] op basis van Boek 4 BW, geldend per [wetgevingsdatum]."
- Backend: wetgevings-referentiedatum als configuratie (bijv. `appsettings.json`)
- Voeg toe aan: testament-concept, wilsverklaring, boedelbeschrijving

**Geschatte complexiteit:** Laag (1-2 uur)

---

## Should Have

### P-S1 — Privé / gemeenschap van goederen markering

**Status:** Ontbreekt  
**Persona-impact:** Executeur 🟡, Notaris 🟡

Per bezitting, bankrekening en schuld aangeven: "Privé" of "Gemeenschap van goederen". Essentieel voor correcte boedelverdeling bij gehuwde overledenen.

**Implementatie:**
- Domain: `VermogensSoort` enum (Prive, Gemeenschap) op bezittingen, bankrekeningen, schulden
- Frontend: toggle/dropdown per item
- Boedelbeschrijving: gescheiden weergave activa/passiva privé vs. gemeenschap

**Geschatte complexiteit:** Laag (3-5 uur)

---

### P-S2 — Executeur-rapport PDF

**Status:** Ontbreekt  
**Persona-impact:** Executeur 🟡

Samenvatting specifiek voor de executeur: boedelomschrijving, activa, passiva, verdelingsvoorstel, handtekeningblokken voor erfgenamen.

**Geschatte complexiteit:** Middel (6-8 uur)

---

### P-S3 — Registerreferenties (kadaster, KvK, kenteken)

**Status:** Ontbreekt  
**Persona-impact:** Executeur 🟡

Extra velden per bezitting: Kadastraal nummer (onroerend goed), Kenteken (voertuigen), KvK-nummer (bedrijfsaandelen). Zodat de executeur direct de juiste registers kan benaderen.

**Geschatte complexiteit:** Laag (2-4 uur)

---

### P-S4 — Notities per item

**Status:** Ontbreekt  
**Persona-impact:** Executeur 🟡, Eigenaar 🟡

Vrije-tekst notities per bezitting, bankrekening, verzekering, schuld. Bijv.: "Hypotheek bij ING: contact opgenomen 15-03, aflossing gestopt per 01-04."

**Geschatte complexiteit:** Laag (3-5 uur)

---

### P-S5 — Direct-edit modus voor wizard-secties

**Status:** Ontbreekt  
**Persona-impact:** Eigenaar 🟡

Na initiële invulling wil de eigenaar snel één veld wijzigen zonder de hele wizard te doorlopen. Een formulier-weergave naast de wizard-weergave.

**Geschatte complexiteit:** Middel (6-10 uur)

---

### P-S6 — Export per erfgenaam

**Status:** Ontbreekt  
**Persona-impact:** Eigenaar 🟡, Erfgenaam 🟡

Een PDF met alleen de informatie die relevant is voor een specifieke erfgenaam, inclusief hun toewijzingen. Scheelt nabestaanden het doorlezen van irrelevante secties.

**Geschatte complexiteit:** Middel (4-8 uur)

---

### P-S7 — Periodieke actualisatie-herinnering

**Status:** Gedeeltelijk (notificaties bestaan, maar geen periodieke check)  
**Persona-impact:** Eigenaar 🟡, Partner 🔴

Kwartaalherinnering: "Zijn uw gegevens nog actueel?" met checklist per domein. Cruciaal voor partner die de app minder frequent gebruikt.

**Geschatte complexiteit:** Laag (3-5 uur)

---

### P-S8 — Tijdlijn: wat moet wanneer na overlijden

**Status:** Ontbreekt  
**Persona-impact:** Erfgenaam 🟡

Ingebouwde checklist met tijdsindicaties: eerste 24 uur (arts, uitvaart), eerste week (notaris, werkgever), eerste maand (verzekeringen, bank), eerste 3 maanden (belasting, accounts).

**Geschatte complexiteit:** Laag (3-5 uur)

---

### P-S9 — Account-afsluitinstructies per platform

**Status:** Ontbreekt  
**Persona-impact:** Erfgenaam 🟡

Per type digitaal account: links naar de afsluitprocedure bij grote platforms (Google, Facebook, Microsoft, banken). Kennisbank met instructies.

**Geschatte complexiteit:** Middel (6-10 uur — onderzoek + onderhoud)

---

### P-S10 — Gedeelde noodcontacten tussen profielen

**Status:** Ontbreekt  
**Persona-impact:** Partner 🟡

Partners delen dezelfde huisarts, notaris en uitvaartondernemer. Nu moeten ze deze dubbel invoeren. Optie om items te markeren als "gedeeld" tussen gekoppelde profielen.

**Geschatte complexiteit:** Hoog (8-12 uur — cross-database sync)

---

### P-S11 — Interviewstijl invullen (guided flow)

**Status:** Ontbreekt  
**Persona-impact:** Partner 🟡

Vraag-antwoord flow in plaats van lege formulieren: "Heeft u een testament?" → Ja/Nee → "Bij welke notaris?" → invulveld. Verlaagt de drempel voor minder digitale gebruikers.

**Geschatte complexiteit:** Hoog (10-16 uur — volledig alternatieve UI-flow)

---

### P-S12 — Voorbeeld-data per sectie

**Status:** Ontbreekt  
**Persona-impact:** Partner 🟡, Eigenaar 🟡

"Bekijk een ingevuld voorbeeld" knop per sectie, zodat de gebruiker ziet wat verwacht wordt. Bijv. een fictief profiel "Familie de Voorbeeld".

**Geschatte complexiteit:** Middel (4-6 uur)

---

### P-S13 — BSN-registratie (optioneel, versleuteld)

**Status:** Ontbreekt  
**Persona-impact:** Notaris 🟡

Optioneel BSN-veld (field-level encrypted) voor eigenaar en erfgenamen. Maakt output direct bruikbaar voor notariële aktes.

**Geschatte complexiteit:** Laag (2-4 uur)

---

### P-S14 — Legitimaire portie-signalering

**Status:** Ontbreekt  
**Persona-impact:** Notaris 🟡

Waarschuwing (geen berekening) wanneer de gewenste verdeling mogelijk de legitimaire portie (wettelijk minimum voor kinderen) schendt.

**Geschatte complexiteit:** Middel (4-6 uur)

---

### P-S15 — Uitgebreide ceremonie-details

**Status:** Ontbreekt  
**Persona-impact:** Uitvaartondernemer 🟡

Per moment (inloop, herdenking, afscheid): muziekkeuze, spreker, tekstlezing, dresscode, receptie-locatie.

**Geschatte complexiteit:** Middel (4-8 uur)

---

### P-S16 — Budgetrichting uitvaart

**Status:** Ontbreekt  
**Persona-impact:** Uitvaartondernemer 🟡

Optioneel veld: "Globaal budget voor uitvaart" — of keuze uit categorieën (eenvoudig, gemiddeld, uitgebreid). Geeft de uitvaartondernemer direct kaders.

**Geschatte complexiteit:** Laag (1-2 uur)

---

### P-S17 — Rouwadvertentie-tekst (apart van rouwkaart)

**Status:** Ontbreekt  
**Persona-impact:** Uitvaartondernemer 🟡

Naast de rouwkaarttekst ook een apart veld voor de rouwadvertentie-tekst (voor de krant). Inhoudelijk verschillend van de rouwkaart.

**Geschatte complexiteit:** Laag (1-2 uur)

---

### P-S18 — Genodigdenlijst uitvaart

**Status:** Ontbreekt  
**Persona-impact:** Uitvaartondernemer 🟡

Een lijst van mensen die uitgenodigd worden voor de ceremonie, met contactgegevens. Niet identiek aan erfgenamen — kan buren, collega's, vrienden bevatten.

**Geschatte complexiteit:** Middel (4-6 uur)

---

### P-S19 — Bulk-import documenten

**Status:** Ontbreekt  
**Persona-impact:** Eigenaar 🟡

Meerdere documenten tegelijk uploaden met automatische naamgeving op basis van bestandsnaam. Nu moet elk document apart benoemd worden.

**Geschatte complexiteit:** Laag (3-5 uur)

---

### P-S20 — Concept-vergelijking (testament-versies)

**Status:** Ontbreekt  
**Persona-impact:** Notaris 🟡

Meerdere versies van het testament-concept bewaren en vergelijken. De notaris kan de evolutie van wensen volgen.

**Geschatte complexiteit:** Middel (6-8 uur)

---

## Could Have

### P-C1 — Notities per sectie (vrije tekst)

**Persona-impact:** Eigenaar 🟡

Vrije tekst-notities per domein: "Let op: de kluis in de slaapkamer bevat ook de originele aktes."

**Geschatte complexiteit:** Laag (2-4 uur)

---

### P-C2 — QR-code op noodkaart

**Persona-impact:** Eigenaar 🟡, Erfgenaam 🟡

QR-code die verwijst naar installatie-instructies voor Lumio + uitleg Shamir-shares. Of die direct belt naar een noodcontact.

**Geschatte complexiteit:** Laag (2-3 uur)

---

### P-C3 — Statistieken-widget op dashboard

**Persona-impact:** Eigenaar 🟡

Dashboard toont totalen: "3 erfgenamen, 42 wachtwoorden, 7 documenten, totale waarde bezittingen: €..."

**Geschatte complexiteit:** Laag (2-4 uur)

---

### P-C4 — Empathisch ontwerp nabestaanden-UI

**Persona-impact:** Erfgenaam 🟡

Rustigere UI na Shamir-ontgrendeling. Minder zakelijk, meer begeleiding en warmere toon.

**Geschatte complexiteit:** Laag (3-5 uur)

---

### P-C5 — Erfbelasting-calculator (indicatief)

**Persona-impact:** Executeur 🟡

Indicatieve berekening op basis van netto nalatenschap, relatie-erfgenaam en actuele vrijstellingen/tarieven. Niet bindend.

**Geschatte complexiteit:** Middel (6-8 uur)

---

### P-C6 — Export naar Excel/CSV

**Persona-impact:** Executeur 🟡

Naast PDF ook CSV/Excel-export van bezittingen, bankrekeningen, schulden. De executeur kan direct verwerken in eigen tooling.

**Geschatte complexiteit:** Laag (3-5 uur)

---

### P-C7 — Digitale handtekening op data-snapshot

**Persona-impact:** Executeur 🟡

Een hash van de database op het moment van Shamir-ontgrendeling, als bewijs dat de data niet is gewijzigd na overlijden.

**Geschatte complexiteit:** Middel (4-6 uur)

---

### P-C8 — Grote-tekst modus / schaalbare fonts

**Persona-impact:** Partner 🟡

Schaalbare font-grootte in instellingen voor oudere gebruikers.

**Geschatte complexiteit:** Laag (2-3 uur)

---

### P-C9 — Voortgangsbalk per sectie (granulair)

**Persona-impact:** Partner 🟡

Niet alleen "Ingevuld ✅" maar "3 van 8 velden ingevuld" — per sectie een voortgangsbalk.

**Geschatte complexiteit:** Laag (3-5 uur)

---

### P-C10 — Notaris-specifieke PDF-template

**Persona-impact:** Notaris 🟡

Opmaak in standaard-briefpapier formaat met ruimte voor kanttekeningen, referentienummers en handtekeningblokken.

**Geschatte complexiteit:** Middel (4-6 uur)

---

### P-C11 — Juridische terminologie-check in wizard

**Persona-impact:** Notaris 🟡

Waarschuwing bij inconsistente keuzes: "U kiest voor een codicil maar verdeelt onroerend goed — dit is alleen geldig via een notarieel testament."

**Geschatte complexiteit:** Middel (4-6 uur)

---

### P-C12 — NUV-standaard export

**Persona-impact:** Uitvaartondernemer 🟡

Export in sectorstandaard-formaat van de Nederlandse Uitvaart Verzorgers voor directe import in bedrijfssoftware.

**Geschatte complexiteit:** Middel (6-8 uur)

---

### P-C13 — Delen met mede-erfgenamen (link/export)

**Persona-impact:** Erfgenaam 🟡

Lisa kan een export delen met Mark zodat hij ook kan meekijken zonder eigen Lumio-installatie.

**Geschatte complexiteit:** Middel (4-6 uur)

---

### P-C14 — Automatische suggestie bij gekoppelde profielen

**Persona-impact:** Partner 🟡

"Uw partner heeft Notaris Jansen ingevoerd. Wilt u dezelfde gebruiken?" Cross-profiel suggesties.

**Geschatte complexiteit:** Hoog (8-12 uur)

---

---

## Won't Have (v2.0)

| Feature | Reden voor uitstel |
|---------|-------------------|
| **Cloud synchronisatie** | Conflicteert met offline-first, privacy-by-design filosofie. Alle personas bevestigen dit. |
| **Mobiele app** | Desktop-only is bewuste keuze. Eigenaar vult in achter bureau, nabestaanden gebruiken eenmalig. |
| **AI-suggesties / juridisch advies** | Te riskant. Eigenaar gaat naar de notaris. App biedt sjablonen, geen advies. |
| **Directe app-toegang voor professionals** | Notaris en uitvaartondernemer werken met eigen tools. Ze ontvangen output, installeren geen Lumio. |
| **Meertaligheid (i18n)** | Expliciet uitgesloten. Nederlandse doelgroep, Nederlandse wetgeving. |
| **Kadaster/KvK/RDW-integratie** | Vereist externe API's en authenticatie. Alleen referentievelden toevoegen (P-S3). |
| **Notaris-portal / webportaal** | Buiten scope offline-app. Notaris ontvangt exports. |
| **Automatische account-detectie** | Privacy-invasief en platform-afhankelijk. |

---

## Prioriteitsmatrix

```
                       IMPACT
              Laag            Hoog
         ┌─────────────┬─────────────┐
  Laag   │ P-M15,      │ P-M4, P-M6, │
         │ P-M16,      │ P-M14,      │
         │ P-M19,      │ P-M17,      │
         │ P-S3, P-S13,│ P-M18,      │
EFFORT   │ P-S16, P-S17│ P-S1, P-S7  │
         │             │             │
         ├─────────────┼─────────────┤
  Hoog   │ P-C5, P-C7, │ P-M1, P-M2, │
         │ P-C10,P-C11,│ P-M3, P-M5, │
         │ P-C12,P-C14 │ P-M7, P-M8, │
         │ P-S10,P-S11 │ P-M9, P-M10,│
         │             │ P-M11,P-M12,│
         │             │ P-M13,      │
         │             │ P-S5, P-S6, │
         │             │ P-S9, P-S14,│
         │             │ P-S15       │
         └─────────────┴─────────────┘

Quick wins (laag effort, hoog impact):
  → P-M4, P-M6, P-M14, P-M17, P-M18, P-S1, P-S7

Strategische investeringen (hoog effort, hoog impact):
  → P-M1, P-M2, P-M3, P-M5, P-M7, P-M8, P-M11, P-M12, P-M13
```

---

## Aanbevolen Roadmap

### Sprint 1 — Nabestaanden-ervaring *(hoogste cross-persona waarde)*

De meest unieke waardepropositie van Lumio is het functioneren ná overlijden. Zonder deze features is de app een informatieopslagplaats maar geen nalatenschap-tool.

| # | Feature | Complexiteit | Persona's |
|---|---------|:------------:|-----------|
| 1 | **P-M1** — Read-only modus na Shamir-ontgrendeling | Middel | Erfgenaam, Executeur |
| 2 | **P-M2** — Nabestaanden-dashboard met stappenplan | Middel | Erfgenaam, Executeur |
| 3 | **P-M9** — Noodprocedure-document & installatie-instructie | Laag-Middel | Eigenaar, Erfgenaam |
| 4 | **P-M12** — Status-tracking per item | Middel | Executeur, Erfgenaam |
| 5 | **P-M10** — Compleet export-pakket (ZIP) | Middel | Erfgenaam, Executeur |

**Geschatte doorlooptijd:** 28-42 uur

---

### Sprint 2 — Juridische compleetheid *(Notaris + Executeur)*

De output van Lumio moet bruikbaar zijn voor juridische professionals. Zonder deze velden is de data incompleet voor notariële aktes en boedelafwikkeling.

| # | Feature | Complexiteit | Persona's |
|---|---------|:------------:|-----------|
| 6 | **P-M4** — Burgerlijke staat en huwelijksvoorwaarden | Laag | Notaris, Executeur |
| 7 | **P-M17** — Legitimatiegegevens | Laag | Notaris |
| 8 | **P-M11** — Boedelbeschrijving-export | Middel | Executeur |
| 9 | **P-M3** — Financieel totaaloverzicht | Middel | Executeur |
| 10 | **P-S1** — Privé/gemeenschap-markering | Laag | Executeur, Notaris |
| 11 | **P-M19** — Versiebewuste juridische disclaimer | Laag | Notaris |
| 12 | **P-M15** — Laatste actualisatie-datum op PDFs | Laag | Uitvaartondernemer, Notaris |

**Geschatte doorlooptijd:** 24-40 uur

---

### Sprint 3 — Onboarding & Toegankelijkheid *(Eigenaar + Partner)*

De eerste indruk en dagelijks gebruik moeten soepeler. Zonder onboarding en begrijpelijke taal haken minder digitale gebruikers af.

| # | Feature | Complexiteit | Persona's |
|---|---------|:------------:|-----------|
| 13 | **P-M7** — Onboarding-wizard bij eerste gebruik | Middel | Eigenaar, Partner |
| 14 | **P-M8** — Contextuele veld-uitleg (tooltips) | Middel | Partner, Eigenaar |
| 15 | **P-M18** — Vereenvoudigde terminologie | Laag | Partner |
| 16 | **P-M5** — Auto-backup naar configureerbare locatie | Middel | Eigenaar |
| 17 | **P-M6** — Verloopdatum-tracking op documenten | Laag | Eigenaar, Erfgenaam |

**Geschatte doorlooptijd:** 22-38 uur

---

### Sprint 4 — Uitvaart & Export verrijking *(Uitvaartondernemer + Notaris)*

De professionele output van Lumio completer maken voor beide doelgroepen die met de exports werken.

| # | Feature | Complexiteit | Persona's |
|---|---------|:------------:|-----------|
| 18 | **P-M14** — Locatie-voorkeuren uitvaart | Laag | Uitvaartondernemer |
| 19 | **P-M16** — Pasfoto / profielfoto opslag | Laag | Uitvaartondernemer |
| 20 | **P-M13** — Gestructureerde export (JSON/XML) | Middel | Notaris |
| 21 | **P-S15** — Uitgebreide ceremonie-details | Middel | Uitvaartondernemer |
| 22 | **P-S16** — Budgetrichting uitvaart | Laag | Uitvaartondernemer |
| 23 | **P-S17** — Rouwadvertentie-tekst | Laag | Uitvaartondernemer |
| 24 | **P-S6** — Export per erfgenaam | Middel | Eigenaar, Erfgenaam |

**Geschatte doorlooptijd:** 20-36 uur

---

### Sprint 5 — Verdieping & Workflow *(Should Haves)*

Features die de dagelijkse bruikbaarheid verbeteren voor alle persona's.

| # | Feature | Complexiteit | Persona's |
|---|---------|:------------:|-----------|
| 25 | **P-S3** — Registerreferenties (kadaster/KvK/kenteken) | Laag | Executeur |
| 26 | **P-S4** — Notities per item | Laag | Executeur, Eigenaar |
| 27 | **P-S7** — Periodieke actualisatie-herinnering | Laag | Eigenaar, Partner |
| 28 | **P-S8** — Tijdlijn: wat moet wanneer na overlijden | Laag | Erfgenaam |
| 29 | **P-S13** — BSN-registratie (optioneel, versleuteld) | Laag | Notaris |
| 30 | **P-S19** — Bulk-import documenten | Laag | Eigenaar |
| 31 | **P-S2** — Executeur-rapport PDF | Middel | Executeur |
| 32 | **P-S12** — Voorbeeld-data per sectie | Middel | Partner, Eigenaar |

**Geschatte doorlooptijd:** 24-40 uur

---

### Sprint 6 — Advanced & Polish *(Should + Could Haves)*

Geavanceerde features en afwerking.

| # | Feature | Complexiteit | Persona's |
|---|---------|:------------:|-----------|
| 33 | **P-S5** — Direct-edit modus voor wizard-secties | Middel | Eigenaar |
| 34 | **P-S9** — Account-afsluitinstructies | Middel | Erfgenaam |
| 35 | **P-S14** — Legitimaire portie-signalering | Middel | Notaris |
| 36 | **P-S18** — Genodigdenlijst uitvaart | Middel | Uitvaartondernemer |
| 37 | **P-S20** — Concept-vergelijking testament | Middel | Notaris |

**Geschatte doorlooptijd:** 24-38 uur

---

### Later — Nice to Haves

| # | Feature | Complexiteit |
|---|---------|:------------:|
| 38 | **P-C1** — Notities per sectie | Laag |
| 39 | **P-C2** — QR-code op noodkaart | Laag |
| 40 | **P-C3** — Statistieken-widget | Laag |
| 41 | **P-C4** — Empathisch ontwerp nabestaanden-UI | Laag |
| 42 | **P-C5** — Erfbelasting-calculator | Middel |
| 43 | **P-C6** — Export naar Excel/CSV | Laag |
| 44 | **P-C7** — Digitale handtekening data-snapshot | Middel |
| 45 | **P-C8** — Grote-tekst modus | Laag |
| 46 | **P-C9** — Voortgangsbalk per sectie (granulair) | Laag |
| 47 | **P-C10** — Notaris-specifieke PDF-template | Middel |
| 48 | **P-C11** — Juridische terminologie-check | Middel |
| 49 | **P-C12** — NUV-standaard export | Middel |
| 50 | **P-C13** — Delen met mede-erfgenamen | Middel |
| 51 | **P-C14** — Automatische suggestie gekoppelde profielen | Hoog |
| 52 | **P-S10** — Gedeelde noodcontacten profielen | Hoog |
| 53 | **P-S11** — Interviewstijl invullen | Hoog |

---

## Totaal geschatte inspanning

| Sprint | Items | Geschatte uren |
|--------|:-----:|:--------------:|
| Sprint 1 — Nabestaanden | 5 | 28-42 uur |
| Sprint 2 — Juridisch | 7 | 24-40 uur |
| Sprint 3 — Onboarding | 5 | 22-38 uur |
| Sprint 4 — Uitvaart & Export | 7 | 20-36 uur |
| Sprint 5 — Verdieping | 8 | 24-40 uur |
| Sprint 6 — Advanced | 5 | 24-38 uur |
| Later — Nice to Haves | 16 | 48-80 uur |
| **Totaal** | **53** | **190-314 uur** |

---

## Cross-persona samenvattingsmatrix

| Feature-thema | Eigenaar | Erfgenaam | Partner | Executeur | Notaris | Uitvaart |
|---------------|:--------:|:---------:|:-------:|:---------:|:-------:|:--------:|
| Read-only modus | — | 🔴 | — | 🔴 | — | — |
| Nabestaanden-dashboard | — | 🔴 | — | 🟡 | — | — |
| Financieel overzicht | — | — | — | 🔴 | — | — |
| Burgerlijke staat | — | — | — | 🟡 | 🔴 | — |
| Auto-backup extern | 🔴 | — | — | — | — | — |
| Verloopdatum docs | 🔴 | 🟡 | — | — | — | — |
| Onboarding-wizard | 🔴 | — | 🔴 | — | — | — |
| Tooltips/helptext | 🟡 | — | 🔴 | — | — | — |
| Noodprocedure-doc | 🔴 | 🔴 | — | — | — | — |
| Export-pakket (ZIP) | — | 🔴 | — | 🟡 | — | — |
| Boedelbeschrijving | — | — | — | 🔴 | — | — |
| Status-tracking | — | 🔴 | — | 🔴 | — | — |
| JSON/XML export | — | — | — | — | 🔴 | — |
| Locatie uitvaart | — | — | — | — | — | 🔴 |
| Datum op PDF | — | — | — | — | 🟡 | 🔴 |
| Pasfoto | — | — | — | — | — | 🔴 |
| Legitimatiegegevens | — | — | — | — | 🔴 | — |
| Terminologie | — | — | 🔴 | — | — | — |
| Disclaimer versie | — | — | — | — | 🔴 | — |

> **Legenda:** 🔴 = Must Have door deze persona | 🟡 = Should Have | — = Niet relevant
