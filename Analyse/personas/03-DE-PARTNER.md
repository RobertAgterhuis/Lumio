# Persona 3 — De Partner

> **Naam:** Maria de Vries-Bakker (59 jaar)  
> **Situatie:** Getrouwd met Jan. Samen hebben ze twee volwassen kinderen. Maria wil haar eigen nalatenschap regelen — los van Jan. Ze heeft een eigen testament, eigen verzekeringen, en een aanvullend pensioen. Maria is minder digitaal vaardig dan Jan: ze gebruikt WhatsApp en email, maar heeft nog nooit een CSV-bestand gezien. Ze gebruikt het Lumio-profiel dat Jan voor haar heeft aangemaakt.  
> **Doel:** Haar eigen digitale nalatenschap beheren in een eigen, privé profiel op dezelfde computer als Jan.  
> **Frequentie gebruik:** Maandelijks, na aansporing van Jan ("Heb je je gegevens al bijgewerkt?").

---

## SWOT-analyse

### Strengths (Sterktes)

| # | Sterkte | Toelichting |
|---|---------|-------------|
| 1 | **Eigen versleuteld profiel** | Maria heeft een volledig gescheiden database met eigen wachtwoord. Jan kan niet bij haar gegevens en zij niet bij die van hem. Privacy binnen het gezin is gegarandeerd. |
| 2 | **Dezelfde installatie** | Maria hoeft niets te installeren. Het profiel is aangemaakt op de gezinscomputer. Ze selecteert haar naam en voert haar eigen wachtwoord in. |
| 3 | **Relatie-indicatie** | Haar profiel toont de relatie "Partner" — dit is duidelijk voor nabestaanden die de profiellijst zien. |
| 4 | **Alle functies beschikbaar** | Maria heeft dezelfde volledige functionaliteit als Jan: testament, uitvaart, documenten, wachtwoorden, Shamir-shares, backup, etc. Er is geen "beperkt" partnerprofiel. |
| 5 | **Eigen Shamir-sleutels** | Maria kan haar eigen masterwachtwoord splitsen en shares verdelen aan de kinderen — onafhankelijk van Jan's shares. |
| 6 | **Eigen backup** | Maria's backup is gescheiden van Jan's. Ze kan haar eigen ZIP downloaden en opslaan. |
| 7 | **Compleetheids-dashboard** | Maria ziet direct hoever ze is met het invullen — dit motiveert, vooral als ze ziet dat 70% nog leeg is. |
| 8 | **Drag & drop documenten** | Maria kan documenten (scans van paspoort, polis) simpelweg slepen naar het scherm. Intuïtiever dan een file-picker. |

### Weaknesses (Zwaktes)

| # | Zwakte | Toelichting |
|---|--------|-------------|
| 1 | **Geen zichtbaarheid in partner-profiel** | Maria en Jan hebben mogelijk overlappende informatie (gezamenlijke bankrekening, dezelfde notaris, gezamenlijk huis). Ze moeten dit dubbel invoeren — elk in hun eigen profiel. Er is geen manier om informatie te delen of te synchroniseren. |
| 2 | **Verwijderen primair profiel niet mogelijk** | Als Jan (primaire gebruiker) zijn account verwijdert, is onduidelijk wat er met Maria's profiel gebeurt. Het primaire profiel kan niet worden verwijderd — maar als Jan overlijdt en de kinderen zijn profiel willen opruimen, is dit een blokkade. |
| 3 | **Maximaal 5 profielen** | Voor een gezin van 6+ is dit limiterend. In de praktijk zal dit zelden voorkomen, maar het is een harde grens. |
| 4 | **Geen begeleiding voor minder digitale gebruikers** | Maria is niet vertrouwd met termen als "Shamir-geheimdeelschema", "AES-256-GCM" of "master-wachtwoord". De UI gebruikt technische termen zonder uitleg in lekentaal. |
| 5 | **Profiel-wisseling vereist opnieuw inloggen** | Als Maria even wil wisselen naar haar profiel terwijl Jan net ingelogd was, wordt Jan's sessie vergrendeld. Er is geen snelle switch. |
| 6 | **Geen gedeelde noodcontacten** | Jan en Maria hebben waarschijnlijk dezelfde huisarts, notaris en uitvaartondernemer. Ze moeten deze gegevens beide apart invoeren en bijhouden. |
| 7 | **CSV-import ontoegankelijk** | Als Maria wachtwoorden wil importeren, moet ze eerst een CSV exporteren uit haar browser — iets dat haar boven de pet gaat. Er is geen eenvoudiger alternatief (bijv. via browser-extensie). |
| 8 | **Geen hulp bij invullen** | Lege velden in een formulier zonder uitleg. Maria weet niet wat "Uitsluitingsclausule" betekent, of wat "Codicil" is. Er zijn geen contextuele tooltip-uitleg of voorbeelden. |

### Opportunities (Kansen)

| # | Kans | Toelichting |
|---|------|-------------|
| 1 | **Gedeelde items tussen profielen** | Optie om specifieke items (noodcontacten, notarisgegevens) te markeren als "gedeeld" zodat ze in beide profielen verschijnen en één keer onderhouden worden. |
| 2 | **Vereenvoudigde modus** | Een "eenvoudige weergave" die jargon vermijdt, grote knoppen toont, en stap-voor-stap begeleiding biedt. Niet minder functionaliteit, maar een andere presentatie. |
| 3 | **Contextuele uitleg per veld** | Info-icoontjes naast complexe velden: "Een uitsluitingsclausule voorkomt dat het erfdeel van uw kinderen in een gemeenschap van goederen valt bij een scheiding van uw kind." |
| 4 | **Gekoppelde profielen** | Maria en Jan kunnen hun profielen "koppelen", waardoor ze optioneel (met wederzijdse toestemming) elkaars noodcontacten en bankrekeningen kunnen inzien. |
| 5 | **Guided invulfunctie** | Interviewstijl: "Heeft u een testament?" → Ja/Nee → "Bij welke notaris?" → invulveld. In plaats van een leeg formulier met 15 velden. |
| 6 | **Wachtwoord-import vanuit browser** | Directe kopie van Chrome/Edge opgeslagen wachtwoorden detecteren en importeren, zonder handmatige CSV-export. |

### Threats (Bedreigingen)

| # | Bedreiging | Toelichting |
|---|------------|-------------|
| 1 | **"Ik doe het later"-syndroom** | Maria stelt het invullen uit omdat het overweldigend is. Zonder periodieke push (bijv. Electron-notificatie) raakt de app in onbruik. |
| 2 | **Wachtwoord vergeten** | Maria gebruikt de app minder frequent dan Jan. Na 3 maanden is ze haar wachtwoord vergeten. Zonder eigen Shamir-shares is haar data verloren. |
| 3 | **Afhankelijkheid van Jan** | Jan heeft de app geïnstalleerd en Maria's profiel aangemaakt. Als Jan er niet meer is, weet Maria mogelijk niet hoe ze backups maakt of herstelt. |
| 4 | **Dubbel werk** | Het apart invoeren van dezelfde noodcontacten, bankrekeningen (gezamenlijke rekening) en notaris in twee profielen zal Maria frustreren. "Waarom moet ik dit allemaal dubbel doen?" |
| 5 | **Complexe terminologie** | Als Maria "Shamir-geheimdeelschema genereren" ziet, haakt ze af. De drempel voelt te technisch. |

---

## Featurebeoordeling

### Must Have (voor productiegebruik door Maria)

| # | Feature | Rationale |
|---|---------|-----------|
| 1 | **Contextuele veld-uitleg (tooltips/helptext)** | Bij elk complex veld een begrijpelijke uitleg in lekentaal. Maria moet begrijpen wát ze invult en waaróm, zonder juridische kennis. |
| 2 | **Vereenvoudigde terminologie** | "Vergrendelen" in plaats van "Sessie vergrendelen". "Noodcode verdelen" in plaats van "Shamir-geheimdeelschema". Technische termen zijn een toegangsdrempel. |
| 3 | **Herinnering aan invullen** | Als Maria 2 weken niet heeft ingelogd op haar profiel, een melding bij de volgende inlog: "U bent 65% klaar. Vul vandaag de verzekeringen aan?" |
| 4 | **Instructie-document per profiel** | Een afprintbaar document: "Beste Maria, dit is hoe u Lumio gebruikt, hoe u een backup maakt, en wat Shamir-shares zijn." Persoonlijk, niet-technisch. |

### Should Have

| # | Feature | Rationale |
|---|---------|-----------|
| 1 | **Gedeelde noodcontacten** | Optie om noodcontacten tussen gekoppelde profielen te delen. Vermijdt dubbel werk en voorkomt inconsistenties. |
| 2 | **Interviewstijl-invullen** | Vraag-antwoord flow in plaats van lege formulieren: "Wilt u begraven of gecremeerd worden?" → keuze → volgende vraag. |
| 3 | **Voorbeeld-data** | "Bekijk een ingevuld voorbeeld" knop per sectie, zodat Maria ziet wat er verwacht wordt. |
| 4 | **Profiel-onboarding** | Bij eerste inlog op een nieuw profiel: een korte rondleiding met 5-6 highlights: "Hier vult u uw profiel in, hier staan uw documenten, hier maakt u een backup." |

### Nice to Have (Could Have)

| # | Feature | Rationale |
|---|---------|-----------|
| 1 | **Grote-tekst modus** | Schaalbare font-grootte voor oudere gebruikers. |
| 2 | **Voortgangsbalk per sectie** | Niet alleen "Ingevuld" maar "3 van 8 velden ingevuld" — granulaire voortgang. |
| 3 | **Automatische suggestie invoer** | Als Jan dezelfde notaris heeft ingevoerd en profielen zijn gekoppeld: "Uw partner heeft Notaris Jansen ingevoerd. Wilt u dezelfde gebruiken?" |

### Won't Have (voor deze persona)

| # | Feature | Rationale |
|---|---------|-----------|
| 1 | **Keyboard shortcuts** | Maria navigeert met de muis. Shortcuts zijn voor power users. |
| 2 | **CSV wachtwoord-import** | Te technisch. Maria voert haar 5 wachtwoorden handmatig in. |
| 3 | **Dark mode** | Geen behoefte — Maria werkt overdag bij daglicht. |
| 4 | **Audit-log** | Te technisch. Maria hoeft niet te weten welke entiteit wanneer is gewijzigd. |
