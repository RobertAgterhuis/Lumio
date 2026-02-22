# Persona 5 — De Notaris

> **Naam:** Mr. Anneke Vermeer (52 jaar)  
> **Situatie:** Notaris met een praktijk in middelgroot dorp. Jan de Vries is al 20 jaar cliënt. Jan komt bij haar met een "testament-concept" PDF dat hij via Lumio heeft gegenereerd. Hij wil dit concept laten omzetten naar een notarieel testament. Later, na Jan's overlijden, komt executeur Pieter langs met Lumio-exports om de boedelverdeling te bespreken.  
> **Doel:** De informatie uit Lumio gebruiken als basis voor notariële aktes en boedelafwikkeling.  
> **Frequentie gebruik:** Indirect — Anneke gebruikt Lumio niet zelf, maar werkt met de output ervan (PDFs, mondelinge informatie).  
> **Technisch niveau:** Goed, maar werkt met eigen notariële software (bijv. WebBase, Acto).

---

## SWOT-analyse

### Strengths (Sterktes)

| # | Sterkte | Toelichting |
|---|---------|-------------|
| 1 | **Gestructureerd testament-concept** | Jan komt niet met losse briefjes, maar met een doorwrocht concept-document dat alle relevante rubrieken bevat: erfgenamen, verdeling, executeur, uitsluitingsclausule, legaten. Dit bespaart Anneke het uitvraagwerk. |
| 2 | **Correcte juridische structuur** | Het testament-concept volgt de structuur van Boek 4 BW: het benoemt het type (notarieel/codicil), de executeur met bevoegdheden, de uitsluitingsclausule, en verwijst naar de juiste wetsartikelen. Anneke hoeft niet vanaf nul te beginnen. |
| 3 | **Prominente disclaimer** | Het concept is duidelijk gemarkeerd als "concept-document — raadpleeg uw notaris voor officiële vastlegging." Dit voorkomt dat Jan denkt dat het PDF al rechtsgeldig is. |
| 4 | **Complete persoonsinformatie** | Erfgenamen staan vermeld met naam, adres, postcode, woonplaats, relatie en geboortedatum. Dit is exact wat Anneke nodig heeft voor een notariële akte. |
| 5 | **Boedeloverzicht voor afwikkeling** | Na overlijden brengt Pieter een compleet boedeloverzicht mee: bezittingen met geschatte waarde, bankrekeningen met IBAN, verzekeringen met polisnummers, schulden. Dit versnelt de Verklaring van Erfrecht en de boedelafwikkeling. |
| 6 | **Toewijzingen (wie krijgt wat)** | De geregistreerde toewijzingen geven Anneke inzicht in de wensen van de erflater. Dit is waardevol als basis voor de verdeling — ook al is het niet juridisch bindend tenzij opgenomen in het testament. |
| 7 | **Wilsverklaring-document** | Het euthanasie-wilsverklaringformat volgt de NVVE-standaard. Hoewel dit niet notarieel hoeft, vraagt de KNMG om een schriftelijke vastlegging. Anneke kan Jan adviseren hoe hiermee om te gaan. |

### Weaknesses (Zwaktes)

| # | Zwakte | Toelichting |
|---|--------|-------------|
| 1 | **Geen integratie met notariële software** | Anneke kan de gegevens uit Lumio niet importeren in haar eigen systemen (WebBase, Acto, Quantenna). Ze moet alles overtypen. Een gestructureerd exportformaat (JSON, XML) zou dit verhelpen. |
| 2 | **BSN ontbreekt** | Voor notariële aktes is het BSN (Burgerservicenummer) van alle betrokkenen verplicht. Lumio registreert dit niet — waarschijnlijk bewust (privacy), maar het maakt de output onvolledig voor notarieel gebruik. |
| 3 | **Geen legitimatiegegevens** | Notariële aktes vereisen identificatie: soort legitimatiebewijs, documentnummer, datum afgifte, geldig tot. Lumio slaat dit niet op (het uploadt een kopie, maar de metadata ontbreekt). |
| 4 | **Toewijzingen niet juridisch geformuleerd** | De toewijzingen ("erfgenaam X krijgt bezitting Y") zijn in informatieve taal, niet in de juridische formulering die Anneke nodig heeft ("Ik legateer aan..."). Ze zijn een startpunt, maar Anneke moet alles herformuleren. |
| 5 | **Geen vastlegging burgerlijke staat** | Het testament-concept vermeldt niet de burgerlijke staat van de erflater (gehuwd, geregistreerd partnerschap, samenwonend) of de huwelijksvoorwaarden. Dit is essentieel voor de bepaling van het erfrecht. |
| 6 | **Geen legitimaire portie-berekening** | Lumio berekent niet of de gewenste verdeling de legitimaire portie (wettelijk minimum voor kinderen) respecteert. Anneke moet dit zelf controleren. |
| 7 | **Beperkte PDF-opmaak** | De PDF is functioneel maar niet opgemaakt in het standaard "notariële template"-formaat dat Anneke gewend is. Het verschil in opmaak kan bij cliënten verwarring veroorzaken ("Is dit definitief?"). |
| 8 | **Geen digitale overdracht** | Anneke ontvangt een PDF op papier of per email. Er is geen manier om de data digitaal gestructureerd (JSON) te ontvangen voor import in haar systemen. |

### Opportunities (Kansen)

| # | Kans | Toelichting |
|---|------|-------------|
| 1 | **Gestructureerde export (JSON/XML)** | Een gestandaardiseerd exportformaat naast PDF, dat notariskantoren kunnen importeren in hun eigen software. Dit zou Lumio positioneren als "aanleverings-tool" voor de notaris. |
| 2 | **BSN-veld (optioneel, versleuteld)** | Optioneel BSN-veld (field-level encrypted) voor eigenaar en erfgenamen. Met duidelijke waarschuwing over de gevoeligheid. Maakt de output direct bruikbaar voor notariële aktes. |
| 3 | **Legitimaire portie-indicator** | Een informele berekening: "Let op: een verdeling van 70/30 voor kind 1/kind 2 kan een inbreuk op de legitimaire portie zijn." Niet juridisch, maar als signalering. |
| 4 | **Burgerlijke staat en huwelijksvoorwaarden** | Extra velden op het eigenaar-profiel: burgerlijke staat, partnerschapsvorm, huwelijksvoorwaarden (gemeenschap/koude uitsluiting/beperkt). Essentieel voor correcte testament-concepten. |
| 5 | **Notaris-portal (toekomst)** | Een webportaal waar de notaris (na autorisatie door de eigenaar) de relevante gegevens kan inzien. Zonder de gevoelige data (wachtwoorden, etc.). |
| 6 | **Concept-in-stadia** | Meerdere versies van het testament-concept bewaren en vergelijken: "Versie 1: alles naar partner → Versie 2: 60/40 partner/kinderen." Dit geeft Anneke inzicht in de geëvolueerde wensen. |

### Threats (Bedreigingen)

| # | Bedreiging | Toelichting |
|---|------------|-------------|
| 1 | **Schijnzekerheid bij cliënt** | Jan denkt dat zijn "testament-concept PDF" rechtsgeldig is en stelt het notarisbezoek uit. De disclaimer helpt, maar sommige cliënten lezen die niet. |
| 2 | **Verouderde juridische templates** | Als de wetgeving wijzigt (bijv. herziening Boek 4 BW, WLV-wijzigingen) en de app-templates niet worden bijgewerkt, adviseert de app impliciet op basis van verouderd recht. |
| 3 | **Onjuiste interpretatie van juridische termen** | Termen als "uitsluitingsclausule", "vruchtgebruik" en "tweetrapstestament" worden in de wizard gepresenteerd als keuze-opties. Cliënten kunnen keuzes maken zonder de implicaties te begrijpen. |
| 4 | **Aansprakelijkheid bij fouten** | Als Jan een testament-concept genereert met een foutieve erfdeel-verdeling en Anneke neemt dit ongecontroleerd over, wie is aansprakelijk? De app kan een vals gevoel van nauwkeurigheid geven. |
| 5 | **Datakwaliteit** | Anneke heeft geen garantie dat de gegevens in Lumio correct of actueel zijn. Een adres dat 3 jaar geleden is ingevoerd, kan verouderd zijn. Er is geen verificatie-mechanisme. |

---

## Featurebeoordeling

### Must Have (om bruikbaar te zijn voor Anneke)

| # | Feature | Rationale |
|---|---------|-----------|
| 1 | **Burgerlijke staat en huwelijksvoorwaarden** | Zonder dit is het testament-concept per definitie onvolledig voor notarieel gebruik. Het bepaalt het toepasselijke erfrecht. |
| 2 | **Legitimatiegegevens** | Soort ID, documentnummer, geldigheidsdatum — verplicht voor elke notariële akte. Zonder dit moet Anneke alles uitvragen. |
| 3 | **Gestructureerde export** | Naast PDF ook een JSON/XML-export met alle relevante velden, zodat Anneke de data kan importeren in notariële software zonder overtypen. |
| 4 | **Versiebewuste disclaimer** | Duidelijk vermelden op welke datum en wetgeving-versie het concept is gebaseerd. "Opgesteld op [datum] o.b.v. Boek 4 BW, geldend per [datum wetgeving]." |

### Should Have

| # | Feature | Rationale |
|---|---------|-----------|
| 1 | **BSN-registratie (optioneel)** | Versleuteld, optioneel BSN-veld. Maakt de output direct bruikbaar zonder dat Anneke aparte identificatie moet opvragen. |
| 2 | **Legitimaire portie-signalering** | Geen berekening, maar een waarschuwing: "Let op: uw verdeling wijkt af van de wettelijke erfdelen." Voorkomt verrassing bij de notaris. |
| 3 | **Concept-vergelijking** | Mogelijkheid om meerdere concepten te bewaren en te vergelijken. Anneke kan dan de evolutie van Jan's wensen volgen. |
| 4 | **"Laatste actualisatie"-indicator** | Per veld of per sectie tonen wanneer de gegevens voor het laatst zijn bijgewerkt. Anneke weet dan of ze kan vertrouwen op de data. |

### Nice to Have (Could Have)

| # | Feature | Rationale |
|---|---------|-----------|
| 1 | **Notaris-specifieke PDF-template** | Opmaak in standaard-briefpapier formaat met ruimte voor kanttekeningen, referentienummers en handtekeningblokken. |
| 2 | **Juridische terminologie-check** | Waarschuwing bij inconsistente keuzes: "U kiest voor een codicil maar verdeelt onroerend goed — dit is alleen geldig via een notarieel testament." |
| 3 | **Koppeling Centraal Testamentenregister (CTR)** | Informatie over het CTR: "Uw notaris registreert uw testament bij het CTR." Niet een integratie, maar uitleg. |

### Won't Have (voor deze persona)

| # | Feature | Rationale |
|---|---------|-----------|
| 1 | **Directe app-toegang voor de notaris** | Anneke wil geen Lumio installeren. Ze werkt met haar eigen tools en ontvangt documenten van de cliënt. |
| 2 | **Wachtwoord-/accountbeheer** | Irrelevant voor notarieel werk. |
| 3 | **Donorregistratie / euthanasie** | Valt buiten notarieel domein. |
| 4 | **Uitvaartwensen** | Niet-juridisch. Anneke werkt met het testament, niet met ceremoniekeuzes. |
