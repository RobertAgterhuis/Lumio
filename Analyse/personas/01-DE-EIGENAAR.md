# Persona 1 — De Eigenaar (Primaire Gebruiker)

> **Naam:** Jan de Vries (62 jaar)  
> **Situatie:** Gepensioneerd, getrouwd, twee volwassen kinderen. Wil zijn digitale en fysieke nalatenschap ordenen nu hij nog helder van geest is. Heeft 40+ online accounts, een testament bij de notaris, diverse verzekeringen en een koophuis. Is niet bijzonder technisch onderlegd maar kan goed overweg met een computer.  
> **Doel:** Alle belangrijke informatie over zijn nalatenschap op één plek vastleggen, zodat zijn nabestaanden niet voor verrassingen komen te staan.  
> **Frequentie gebruik:** Wekelijks bij eerste inrichting, daarna maandelijks om bij te werken.

---

## SWOT-analyse

### Strengths (Sterktes)

| # | Sterkte | Toelichting |
|---|---------|-------------|
| 1 | **Alles op één plek** | Jan kan testament, donor, euthanasie, uitvaart, digitale accounts, wachtwoorden, bezittingen, schulden, verzekeringen én documenten allemaal in één applicatie beheren. Hij hoeft niet op 10 verschillende plekken informatie bij te houden. |
| 2 | **Sterke beveiliging** | SQLCipher-encryptie, AES-256-GCM voor wachtwoorden, auto-lock na inactiviteit — Jan hoeft zich geen zorgen te maken dat zijn gevoelige data (bankgegevens, wachtwoorden, seed phrases) in verkeerde handen valt. |
| 3 | **Offline & privacy-first** | Geen cloud, geen account aanmaken bij een externe dienst, data verlaat nooit zijn computer. Dit geeft Jan vertrouwen: niemand — ook geen techbedrijf — kan bij zijn meest persoonlijke informatie. |
| 4 | **Shamir's Secret Sharing** | Jan kan zijn masterwachtwoord splitsen in delen voor zijn kinderen. Geen van hen kan alleen bij de data, maar samen wel. Dit lost het "bus-probleem" op: als Jan overlijdt, kunnen zijn erfgenamen bij de informatie zonder dat het wachtwoord ergens op papier staat. |
| 5 | **Meerdere profielen** | Jan's partner kan een eigen profiel aanmaken met eigen wachtwoord. Beide partners regelen hun eigen nalatenschap, op dezelfde installatie. |
| 6 | **Compleetheid-dashboard** | Het dashboard toont Jan direct hoever hij is: welke secties zijn ingevuld, welke nog niet. Dit motiveert hem om alles af te ronden. De slimme notificaties waarschuwen als er lang geen backup is gemaakt of als secties leeg zijn. |
| 7 | **Wachtwoord-importfunctie** | Jan hoeft zijn 40+ wachtwoorden niet handmatig over te typen. Hij kan een CSV export uit Bitwarden, 1Password, LastPass, KeePass of Chrome importeren. |
| 8 | **PDF-generatie** | Jan kan een compleet document laten genereren — testament-concept, wilsverklaring, noodkaart — en meenemen naar de notaris of huisarts. De noodkaart kan hij printen en in zijn portemonnee bewaren. |
| 9 | **Documentversioning** | Als Jan een nieuw paspoort krijgt, uploadt hij de kopie onder dezelfde naam. Het systeem bewaart automatisch de vorige versie. Niets gaat verloren. |
| 10 | **Backup & restore** | Jan kan een versleutelde backup downloaden (ZIP met database + salt). Als zijn laptop crasht, kan hij herstellen op een nieuwe machine. De reminder na 30 dagen herinnert hem eraan. |

### Weaknesses (Zwaktes)

| # | Zwakte | Toelichting |
|---|--------|-------------|
| 1 | **Geen automatische backup naar extern medium** | Jan moet handmatig een backup downloaden en zelf naar een externe schijf of USB-stick kopiëren. Er is geen optie om automatisch naar een map (bijv. USB, NAS) te back-uppen. Vergeet Jan dit, dan is de data kwetsbaar bij schijfuitval. |
| 2 | **Geen herinneringen voor document-verloop** | Hoewel er notificaties zijn voor ontbrekende secties, is er geen mechanisme dat Jan herinnert dat zijn paspoort over 3 maanden verloopt, of dat zijn verzekeringspolis vernieuwd moet worden. Documenten hebben geen verloopdatum-veld. |
| 3 | **Geen gedeelde toegang met partner** | Hoewel beide partners een eigen profiel hebben, kunnen ze niet elkaars informatie inzien. Jan kan niet zien welke verzekeringen zijn vrouw heeft geregistreerd. Er is geen "meekijk"-functie voor partners. |
| 4 | **Alleen desktop** | Jan kan de app alleen op zijn desktop/laptop gebruiken. Als hij bij de notaris zit en iets wil opzoeken, heeft hij geen mobiele toegang. |
| 5 | **Geen print-optimalisatie per sectie** | Jan kan een compleet PDF-rapport genereren, maar niet snel één specifieke pagina (bijv. alleen zijn noodcontacten) uitprinten in een compact formaat. |
| 6 | **Geen import van bestaande documenten-metadata** | Jan heeft al documenten in mappen op zijn computer staan. Er is geen manier om een hele map in één keer te importeren met automatische categorie-detectie. Elk document moet apart ge-uploadt worden (of via drag & drop, maar nog steeds met handmatige naam/categorie-invoer per bestand). |
| 7 | **Wizards zijn éénrichting** | De testament- en euthanasie-wizards leiden Jan stap-voor-stap, maar als hij later één veld wil aanpassen, moet hij door de hele wizard navigeren. Er is geen direct-edit modus voor individuele velden. |

### Opportunities (Kansen)

| # | Kans | Toelichting |
|---|------|-------------|
| 1 | **Automatische backup naar configureerbare locatie** | Bij elke vergrendeling of op schema automatisch een versleutelde backup wegschrijven naar een door Jan gekozen map (USB, NAS, OneDrive-map). Dit elimineert het risico van vergeten backups. |
| 2 | **Verloopdatum-tracking op documenten** | Een optioneel `VerlooptOp`-veld op documenten (paspoort, rijbewijs, verzekeringspolis) met notificaties wanneer vernieuwing nodig is. |
| 3 | **Periodieke "check-up" herinnering** | Maandelijkse of kwartaal-herinnering: "Controleer of uw gegevens nog actueel zijn." Met een checklist die Jan afvinkt. |
| 4 | **Snelle afdrukweergave per sectie** | Een "Print" knop per pagina die een compacte, afdrukbare versie toont — bijv. alleen de noodcontacten, of alleen de bankrekeningen. |
| 5 | **Template-bibliotheek** | Vooraf ingevulde voorbeelden/instructies per sectie zodat Jan weet wat hij moet invullen. Bijv. "welke gegevens heeft uw notaris nodig?" |
| 6 | **Progressieve onboarding-wizard** | Een guided setup die Jan bij eerste gebruik stap-voor-stap door alle secties leidt, in volgorde van urgentie. Nu moet Jan zelf ontdekken welke secties bestaan. |

### Threats (Bedreigingen)

| # | Bedreiging | Toelichting |
|---|------------|-------------|
| 1 | **Vergeten masterwachtwoord** | Als Jan zijn masterwachtwoord vergeet én geen Shamir shares heeft verdeeld, is alle data permanent verloren. Er is geen "wachtwoord vergeten"-functie (by design, maar risicovol). |
| 2 | **Eén punt van falen: de lokale machine** | Zonder externe backup is de laptop het enige opslagmedium. Diefstal, brand of hardwarefalen betekent totaal dataverlies. |
| 3 | **Concurrentie van cloud-diensten** | Diensten als Everplans, Lantern of MyWishes bieden cloudopslag met automatische sync en mobiele apps. Jan's kinderen kunnen zeggen: "Waarom niet gewoon in de cloud?" |
| 4 | **Wetgeving verandert** | Nederlandse wetgeving rond euthanasie, testamenten en donorregistratie kan wijzigen. De ingebouwde juridische templates (testament-concept, wilsverklaring) kunnen verouderen als ze niet worden bijgewerkt. |
| 5 | **Technische kennis vereist bij restore** | Als Jan overlijdt en zijn kinderen zijn laptop erven, moeten zij de applicatie installeren, de backup vinden, en Shamir-shares combineren. Dit vereist technische vaardigheid die niet alle nabestaanden hebben. |
| 6 | **Geen onderhoud na v1.0** | Als de app niet actief wordt onderhouden, kunnen Electron/OS-updates de werking breken. Er is geen auto-update mechanisme beschreven. |

---

## Featurebeoordeling

### Must Have (voor productiegebruik door Jan)

| # | Feature | Rationale |
|---|---------|-----------|
| 1 | **Automatische backup naar configureerbare locatie** | Jan zal vergeten handmatig te back-uppen. Zonder automatische backup naar een extern medium is dataverlies een realistisch scenario. De huidige 30-dagen-reminder is onvoldoende — de reminder verdwijnt na wegklikken. |
| 2 | **Verloopdatum op documenten** | Jan uploadt zijn paspoort, rijbewijs en verzekeringspolis. Zonder verloopdatum-notificatie merkt hij pas te laat dat een document verlopen is. Dit is fundamenteel voor de "herinneringen"-functie. |
| 3 | **Noodprocedure-document voor nabestaanden** | Een duidelijke, afprintbare instructie: "Hoe opent u Lumio na mijn overlijden?" met uitleg over Shamir-shares, installatie, en restore. Nu bestaat dit niet en moeten nabestaanden het zelf uitzoeken. |
| 4 | **Onboarding-wizard bij eerste gebruik** | Jan opent de app en ziet 14 menu-items. Hij weet niet waar te beginnen. Een stap-voor-stap setup ("Laten we beginnen met uw profiel, dan uw noodcontacten...") verlaagt de drempel enorm. |

### Should Have

| # | Feature | Rationale |
|---|---------|-----------|
| 1 | **Direct-edit modus voor wizard-secties** | Na initiële invulling wil Jan snel één veld wijzigen zonder de hele wizard te doorlopen. Een formulier-weergave naast de wizard-weergave. |
| 2 | **Bulk-import documenten** | Jan heeft 20 gescande documenten in een map. Drag & drop ondersteunt meerdere bestanden, maar elk moet individueel benoemd worden. Een batch-import met automatische naamgeving (bestandsnaam → documentnaam) zou veel tijd schelen. |
| 3 | **Periodieke actualisatie-herinnering** | Kwartaalherinnering: "Zijn uw gegevens nog actueel?" met een checklist per domein. |
| 4 | **Export per erfgenaam** | Een PDF met alleen de informatie die relevant is voor een specifieke erfgenaam, inclusief hun toewijzingen. Scheelt nabestaanden het doorlezen van irrelevante secties. |

### Nice to Have (Could Have)

| # | Feature | Rationale |
|---|---------|-----------|
| 1 | **Notities per sectie** | Vrije tekst-notities per domein (bijv. "Let op: de kluis in de slaapkamer bevat ook de originele aktes.") |
| 2 | **Contactkaart-integratie** | QR-code op de noodkaart die direct belt of een vCard importeert. |
| 3 | **Template-suggesties** | Bij het invullen van het testament: "Vergeet niet een uitsluitingsclausule op te nemen." Contextuele tips. |
| 4 | **Statistieken-widget** | Dashboard toont totalen: "3 erfgenamen, 42 wachtwoorden, 7 documenten, totale waarde bezittingen: €..." |

### Won't Have (voor deze persona)

| # | Feature | Rationale |
|---|---------|-----------|
| 1 | **Cloud synchronisatie** | Jan wil expliciet geen cloudopslag — dat is waarom hij Lumio koos. |
| 2 | **Mobiele app** | Nice maar niet essentieel. Jan vult alles in achter zijn bureau. |
| 3 | **AI-suggesties / juridisch advies** | Te riskant. Jan gaat naar de notaris voor advies. |
| 4 | **Meertaligheid** | Jan is Nederlands en de app is in het Nederlands. Geen behoefte. |
