# Persona 2 — De Erfgenaam (Nabestaande)

> **Naam:** Lisa de Vries (34 jaar)  
> **Situatie:** Dochter van Jan. Haar vader is onverwacht overleden. Lisa weet dat haar vader Lumio gebruikte, maar heeft de app zelf nooit gezien. Ze heeft samen met haar broer Mark elk een Shamir-share ontvangen — een briefje met een code dat haar vader hen eerder heeft gegeven. Ze moet nu zo snel mogelijk uitzoeken: welke verzekeringen er zijn, waar het testament ligt, wie de notaris is, welke wachtwoorden nodig zijn, en wat de uitvaartwensen waren.  
> **Doel:** Toegang krijgen tot de data van haar vader en de nalatenschap ordelijk afhandelen.  
> **Frequentie gebruik:** Eenmalig, intensief gedurende de eerste weken na overlijden.  
> **Technisch niveau:** Gemiddeld — kan software installeren, maar is geen IT-professional.

---

## SWOT-analyse

### Strengths (Sterktes)

| # | Sterkte | Toelichting |
|---|---------|-------------|
| 1 | **Shamir-ontgrendeling** | Lisa en haar broer Mark kunnen samen de database openen door hun shares te combineren. Het systeem is ontworpen om precies dit scenario te faciliteren — toegang na overlijden zonder dat het masterwachtwoord bekend is. |
| 2 | **Noodkaart (PDF)** | Als haar vader de noodkaart heeft uitgeprint, vindt Lisa daar in één oogopslag: wie te bellen, waar het testament ligt, wie de uitvaartondernemer is, wie de notaris is. Dit is exact wat je nodig hebt in de eerste uren na een overlijden. |
| 3 | **Alles op één plek** | Lisa hoeft niet te zoeken in mappen, mapjes, laden en e-mails. Alles staat in Lumio: verzekeringen, bankrekeningen, schulden, wachtwoorden, uitvaartwensen, testament-locatie, donorkeuze. |
| 4 | **Noodcontacten met rollen** | De noodcontacten-pagina toont wie welke rol heeft: huisarts, notaris, uitvaartondernemer, vertrouwenspersoon. Lisa weet direct wie ze moet bellen en in welke volgorde. |
| 5 | **PDF-export per domein** | Lisa kan per sectie een PDF genereren: de bankrekeningen voor de belastingadviseur, de verzekeringen voor de uitvaartondernemer, de digitale accounts om af te sluiten. Ze hoeft niet alles tegelijk te delen. |
| 6 | **Zoekfunctionaliteit** | Als Lisa snel een specifiek account of verzekering zoekt (bijv. "Ziggo" of "Achmea"), vindt ze het direct via Ctrl+K zonder door alle secties te bladeren. |
| 7 | **Toewijzingen per erfgenaam** | Lisa kan zien welke bezittingen specifiek aan haar zijn toegewezen, en welke aan Mark. Dit voorkomt discussies en verwarring over de verdeling. |
| 8 | **Audit log** | Lisa kan controleren wanneer gegevens voor het laatst zijn bijgewerkt. Als ze ziet dat een adres 3 jaar geleden voor het laatst is gewijzigd, weet ze dat het mogelijk verouderd is. |

### Weaknesses (Zwaktes)

| # | Zwakte | Toelichting |
|---|--------|-------------|
| 1 | **Geen stap-voor-stap "nabestaanden-modus"** | Lisa opent de app en ziet 14 menu-items. In een moment van rouw is dit overweldigend. Er is geen speciale modus die zegt: "Stap 1: Bel deze mensen eerst. Stap 2: Regel de uitvaart. Stap 3: Check de verzekeringen." Het systeem toont alles tegelijk. |
| 2 | **Installatie vereist** | Lisa moet eerst de Electron-app installeren op haar eigen computer (of de laptop van haar vader gebruiken). Dan de backup vinden (waar staat die?), restoren, en twee Shamir-shares invoeren. Voor een niet-technische nabestaande in rouw is dit een substantiële drempel. |
| 3 | **Shamir-shares zijn papieren codes** | De shares zijn aan Lisa en Mark "uitgedeeld" — vermoedelijk op papier of digitaal. Als Lisa haar share is kwijtgeraakt, of als Mark op vakantie is en niet bereikbaar, is er geen alternatief. Er is geen fallback-mechanisme. |
| 4 | **Geen read-only modus** | Na ontgrendeling heeft Lisa volledige lees- én schrijftoegang. Ze kan per ongeluk gegevens wijzigen of verwijderen. Er is geen "alleen-lezen" modus voor nabestaanden. |
| 5 | **Wachtwoorden worden individueel ontsleuteld** | Lisa moet per wachtwoord klikken om het te ontsluiten. Bij 40+ accounts is dit omslachtig. Er is geen "toon alle wachtwoorden"-functie voor het geval je snel alle accounts moet doorlopen. |
| 6 | **Geen begeleiding bij account-afsluiting** | Lisa ziet welke digitale accounts haar vader had, maar er is geen informatie over hóé je een account van een overledene sluit. Bijv. Facebook memorial-pagina, Google Inactive Account Manager, bankrekening-afsluitprocedure. |
| 7 | **Geen communicatie-tool naar mede-erfgenamen** | Lisa kan niet vanuit de app informatie delen met Mark (bijv. "Ik heb de verzekeraar gebeld, dat is geregeld"). De toewijzingen zijn statisch, zonder status-tracking. |
| 8 | **Geen tijdlijn "wat moet wanneer"** | Er is geen overzicht van wat wanneer geregeld moet worden na een overlijden (eerste 24 uur: arts en uitvaart bellen, eerste week: notaris, eerste maand: verzekeringen, etc.). |

### Opportunities (Kansen)

| # | Kans | Toelichting |
|---|------|-------------|
| 1 | **Nabestaanden-modus / Erfgenaam-dashboard** | Een apart landing-scherm na Shamir-ontgrendeling: "U heeft de nalatenschap van Jan de Vries geopend." Met een gestructureerd stappenplan: Urgente acties → Uitvaart → Juridisch → Financieel → Digitaal opruimen. |
| 2 | **Read-only modus na Shamir-ontgrendeling** | Standaard alleen-lezen na Shamir-unlock, zodat nabestaanden niets per ongeluk kunnen wijzigen of verwijderen. Optioneel te overrulen voor beheer. |
| 3 | **"Hoe sluit ik dit account"-instructies** | Per type digitaal account: links naar de afsluitprocedure van grote platforms (Google, Facebook, Microsoft, banken). Community-bijgedragen of handmatig onderhouden kennisbank. |
| 4 | **Status-tracking per toewijzing** | Lisa kan per toewijzing markeren: "Afgehandeld", "In behandeling", "Nog te doen". Zo houden meerdere erfgenamen bij wat er al geregeld is. |
| 5 | **Exporteer alles in één keer** | "Download alles" knop die een ZIP genereert met alle PDFs, alle documenten, en een overzicht. Lisa hoeft niet per sectie apart te exporteren. |
| 6 | **QR-code op noodkaart** | De gedrukte noodkaart bevat een QR-code die verwijst naar installatie-instructies voor Lumio + uitleg hoe Shamir-shares te gebruiken. |
| 7 | **Bulkwijziging digitale accounts** | "Markeer alle accounts als 'te sluiten'" — Lisa kan in bulk de gewenste actie instellen (sluiten, memorialiseren, overdragen). |

### Threats (Bedreigingen)

| # | Bedreiging | Toelichting |
|---|------------|-------------|
| 1 | **Toegangsdrempel te hoog** | Als Lisa haar share kwijt is, als de laptop van haar vader gestolen is, als er geen externe backup is — dan is alle informatie ontoegankelijk. De beveiliging die bedoeld is als sterkte, wordt een bedreiging. |
| 2 | **Tijdsdruk** | Na een overlijden zijn er acute deadlines (uitvaart regelen, werkgever informeren, verzekeringen melden). Als Lisa 30 minuten nodig heeft om de app werkend te krijgen, is dat 30 minuten te veel. |
| 3 | **Emotionele last** | Door alle persoonlijke details van haar vader bladeren — wachtwoorden, notities, wensen — kan emotioneel zwaar zijn. De app toont alles zakelijk, zonder empathie. |
| 4 | **Verouderde informatie** | Als Jan al maanden niet heeft ingelogd, kunnen gegevens verouderd zijn. Lisa weet niet of de informatie actueel is tenzij ze het audit-log checkt. |
| 5 | **Juridische waarde onduidelijk** | Lisa vindt een "testament-concept" PDF. Is dit rechtsgeldig? Waarschijnlijk niet (het moet notarieel bekrachtigd zijn), maar deze nuance kan verloren gaan. |

---

## Featurebeoordeling

### Must Have (voor productiegebruik door Lisa)

| # | Feature | Rationale |
|---|---------|-----------|
| 1 | **Nabestaanden-dashboard / stappenplan** | Na Shamir-ontgrendeling een gefocust overzicht: urgente acties (uitvaart, arts), contactpersonen, eerst te regelen zaken. Niet 14 menu-items maar een begeleide flow. |
| 2 | **Read-only modus** | Na Shamir-ontgrendeling standaard geen schrijftoegang. Lisa kan niets per ongeluk verwijderen. |
| 3 | **Installatie & herstel-instructie** | Een duidelijke, niet-technische handleiding: "Stap 1: Installeer Lumio. Stap 2: Klik 'Herstellen'. Stap 3: Selecteer het backup-bestand. Stap 4: Voer beide shares in." Idealiter meegeleverd met de noodkaart. |
| 4 | **Compleet export-pakket** | Eén knop die alle PDFs + alle geüploade documenten in een ZIP bundelt. Lisa wil alles offline beschikbaar hebben, niet afhankelijk zijn van de app. |

### Should Have

| # | Feature | Rationale |
|---|---------|-----------|
| 1 | **Status-tracking per item** | "Afgehandeld / In behandeling / Nog te doen" per account, verzekering, bankrekening. Zodat Lisa (en Mark) bijhouden wat er al geregeld is. |
| 2 | **Tijdlijn: "Wat moet wanneer na een overlijden"** | Een ingebouwde checklist met tijdsindicaties. Niet juridisch advies, maar praktische begeleiding. |
| 3 | **Account-afsluitinstructies** | Per digitaal account een link naar de provider's procedure voor accounts van overledenen. |
| 4 | **Verloopdatum-waarschuwing op informatie** | "Deze bankrekening is 2 jaar geleden voor het laatst bijgewerkt — controleer of dit nog klopt." |

### Nice to Have (Could Have)

| # | Feature | Rationale |
|---|---------|-----------|
| 1 | **Empathisch ontwerp** | Een rustigere UI na Shamir-ontgrendeling. Minder zakelijk, meer begeleiding. "We begrijpen dat dit een moeilijke tijd is." |
| 2 | **Delen met mede-erfgenamen** | Lisa kan een export of link delen met Mark zodat hij ook kan meekijken zonder een eigen Lumio-installatie. |
| 3 | **Herinneringen instellen** | Lisa kan zichzelf herinneringen instellen: "Over 3 maanden: check of alle bankrekeningen zijn afgesloten." |

### Won't Have (voor deze persona)

| # | Feature | Rationale |
|---|---------|-----------|
| 1 | **Registratie / eigen data invullen** | Lisa is geen eigenaar. Ze beheert haar vader's nalatenschap, niet haar eigen. |
| 2 | **Wachtwoord-generator** | Irrelevant — Lisa slaat geen nieuwe wachtwoorden op. |
| 3 | **Dark mode / keyboard shortcuts** | Comfortfeatures die irrelevant zijn bij eenmalig, taakgericht gebruik. |
