# Persona 4 — De Executeur-Testamentair

> **Naam:** Mr. Pieter van Dijk (48 jaar)  
> **Situatie:** Executeur-testamentair, benoemd in het testament van Jan de Vries. Pieter is Jan's schoonbroer en advocaat. Na Jan's overlijden is het Pieter's wettelijke taak om de nalatenschap af te wikkelen: alle bezittingen inventariseren, schulden betalen, erfgenamen informeren, en de boedel verdelen. Hij heeft via Lisa en Mark (de kinderen/erfgenamen) toegang gekregen tot Lumio middels Shamir-shares.  
> **Doel:** Efficiënt een compleet overzicht krijgen van de nalatenschap, de boedel inventariseren, en de verdeling uitvoeren conform het testament.  
> **Frequentie gebruik:** Dagelijks gedurende de afwikkelingsperiode (3-12 maanden).  
> **Technisch niveau:** Goed — werkt dagelijks met juridische software en digitale dossiers.

---

## SWOT-analyse

### Strengths (Sterktes)

| # | Sterkte | Toelichting |
|---|---------|-------------|
| 1 | **Compleet boedeloverzicht** | Pieter vindt in Lumio alles wat hij nodig heeft: bankrekeningen (met IBAN), verzekeringen (met polisnummers en bedragen), fysieke bezittingen (met geschatte waarde), schulden (met maandlasten en referentienummers). Dit bespaart weken zoekwerk. |
| 2 | **Toewijzingen erfgenaam ↔ bezittingen** | Jan heeft al vastgelegd wie wat krijgt. Pieter hoeft niet te interpreteren — de verdeling staat geregistreerd met instructies per toewijzing. Dit is juridisch waardevol als onderbouwing bij de afwikkeling. |
| 3 | **PDF-export per domein** | Pieter kan een PDF van de bankrekeningen naar de bank sturen, een PDF van de verzekeringen naar de verzekeraar, en een PDF van het boedeloverzicht naar de belastingdienst. Professionele documenten, geen screenshots. |
| 4 | **Complete export** | De "Compleet" PDF-export bundelt alles in één document — ideaal als bijlage bij de boedelbeschrijving die Pieter aan de rechtbank moet overleggen (indien nodig). |
| 5 | **Contactgegevens professionals** | Notaris, uitvaartondernemer, huisarts, verzekeraar — allemaal met telefoon, email en adres. Pieter hoeft niet zelf te zoeken. |
| 6 | **Documentenkluis** | Kopieën van paspoort, testament-akte, verzekeringspolissen, eigendomsaktes — alles versleuteld opgeslagen en downloadbaar. Pieter hoeft niet in laden en kasten te zoeken. |
| 7 | **Zoekfunctie** | Pieter zoekt "hypotheek" en vindt direct de schuld met referentienummer. Of zoekt "ING" en vindt de bankrekening. Efficiënt bij grote datasets. |
| 8 | **Audit trail** | Als er onenigheid is tussen erfgenamen over wanneer gegevens zijn ingevoerd of gewijzigd, biedt het audit-log een verifieerbare tijdlijn. Dit kan juridisch relevant zijn. |

### Weaknesses (Zwaktes)

| # | Zwakte | Toelichting |
|---|--------|-------------|
| 1 | **Geen specifiek executeur-dashboard** | Pieter ziet hetzelfde dashboard als Jan. Er is geen overzicht specifiek voor executeurs: totale boedelwaarde, openstaande schulden, saldo na verdeling, lijst van afgehandelde vs. openstaande posten. |
| 2 | **Geen boedelbeschrijving-generator** | Een executeur moet een formele boedelbeschrijving opstellen (Art. 4:146 BW). Lumio bevat alle data hiervoor, maar genereert dit document niet. Pieter moet het handmatig samenstellen. |
| 3 | **Geen financieel totaaloverzicht** | Er is geen berekening van: totale waarde bezittingen + saldi bankrekeningen - totale schulden = netto nalatenschap. Pieter moet dit zelf optellen. |
| 4 | **Geen status-tracking per actie** | Pieter moet bijhouden: bankrekening bij ING → afgesloten ✓, verzekering bij Achmea → claim ingediend, digitaal account bij Google → memorialisatie aangevraagd. Deze workflow-tracking bestaat niet. |
| 5 | **Geen read-only modus** | Pieter kan per ongeluk (of bewust) gegevens wijzigen. In een juridisch gevoelige context (onenigheid tussen erfgenamen) is het belangrijk dat de data na overlijden niet gewijzigd kan worden. |
| 6 | **Geen meervoudige gebruikerstoegang** | Als Pieter de app op zijn laptop heeft geïnstalleerd, kunnen de erfgenamen niet gelijktijdig meekijken op hun eigen apparaat. Er is geen gedeelde toegang. |
| 7 | **Export bevat geen totalen** | De PDF-exports tonen individuele items maar geen subtotalen, totalen of samenvatting. Een executeur heeft een financieel overzicht nodig, geen opsomming. |
| 8 | **Geen onderscheid tussen eigen en gemeenschappelijke goederen** | Bij een getrouwde overledene is het onderscheid tussen privé-vermogen en gemeenschap van goederen cruciaal. Lumio maakt dit onderscheid niet. |
| 9 | **Geen koppeling met Kadaster/KvK/RDW** | Onroerend goed, bedrijfsaandelen en voertuigen moeten worden geverifieerd via externe registers. Lumio biedt geen integratie of zelfs maar velden voor kadastrale nummers, KvK-nummers. |

### Opportunities (Kansen)

| # | Kans | Toelichting |
|---|------|-------------|
| 1 | **Boedelbeschrijving-PDF** | Automatisch genereren van een formele boedelbeschrijving conform Art. 4:146 BW, met alle activa en passiva, totalen, en ondertekenplek. |
| 2 | **Financieel dashboard** | Automatische berekening: Σ bezittingen + Σ bankrekeningen + Σ verzekeringen - Σ schulden = netto nalatenschap. Grafisch weergegeven. |
| 3 | **Afwikkelings-workflow** | Per item een status: "Open → In behandeling → Afgehandeld". Met mogelijkheid om notities toe te voegen per stap. |
| 4 | **Executeur-rapport** | Een apart PDF-rapport specifiek voor de executeur: totaaloverzicht, ontvangsten, uitgaven, verdelingsvoorstel, ondertekenplek voor erfgenamen. |
| 5 | **Vermogensscheiding** | Veld per bezitting/bankrekening: "Privé" of "Gemeenschap van goederen". Essentieel voor correcte boedelverdeling. |
| 6 | **Registerreferenties** | Extra velden voor: Kadastraal nummer (onroerend goed), Kenteken (voertuigen), KvK-nummer (bedrijfsaandelen). |
| 7 | **Erfbelasting-schatting** | Op basis van de netto nalatenschap en de erfgenamen (relatie, vrijstelling): een indicatieve berekening van de erfbelasting per erfgenaam. |

### Threats (Bedreigingen)

| # | Bedreiging | Toelichting |
|---|------------|-------------|
| 1 | **Juridische aansprakelijkheid** | Als Pieter besluiten baseert op gegevens in Lumio die verouderd of onvolledig zijn (bijv. een niet-geregistreerde schuld), kan dit leiden tot aansprakelijkheidsrisico's. De app biedt geen garantie van volledigheid. |
| 2 | **Bewijskracht** | In een juridisch geschil kan de tegenpartij betwijfelen of gegevens in Lumio betrouwbaar zijn. Er is geen digitale handtekening, geen notariële bevestiging, geen blockchain-timestamp. Het audit-log is intern en manipuleerbaar. |
| 3 | **Geen professionele standaard** | Executeurs werken normaliter met gespecialiseerde boedelsoftware (bijv. Successie.nl, Boedelnotaris). Lumio is geen professioneel boedelmanagementsysteem. De data is waardevol, maar de tooling is beperkt. |
| 4 | **GDPR-compliance bij delen** | Als Pieter PDFs exporteert met persoonlijke gegevens van derden (erfgenamen, begunstigden) en deze deelt met banken of verzekeraars, is hij verantwoordelijk voor correcte verwerking onder de AVG. Lumio geeft hier geen waarschuwing over. |
| 5 | **Data-integriteit na Shamir-ontgrendeling** | Na ontgrendeling kan iedereen met toegang gegevens wijzigen. Als er onenigheid ontstaat ("Vader heeft mij het huis beloofd, niet jou"), is er geen garantie dat de data niet is gemanipuleerd na het overlijden. |

---

## Featurebeoordeling

### Must Have (voor productiegebruik door Pieter)

| # | Feature | Rationale |
|---|---------|-----------|
| 1 | **Financieel totaaloverzicht** | Σ activa - Σ passiva = netto nalatenschap. Fundamenteel voor elke executeur. Nu moet Pieter dit handmatig berekenen. |
| 2 | **Read-only modus na Shamir-ontgrendeling** | Juridisch noodzakelijk: na overlijden mag de data niet meer wijzigbaar zijn. Wijzigingen zouden de bewijskracht ondermijnen. |
| 3 | **Status-tracking per boedelitem** | "Open / In behandeling / Afgehandeld" per bankrekening, verzekering, bezitting, schuld. Dit is de kern van executeur-werk. |
| 4 | **Boedelbeschrijving-export** | Formeel document met activa, passiva, totalen — conform Art. 4:146 BW. De data is al aanwezig; het document-formaat ontbreekt. |

### Should Have

| # | Feature | Rationale |
|---|---------|-----------|
| 1 | **Privé/gemeenschap-markering** | Per vermogensbestanddeel aangeven of het privé is of in gemeenschap van goederen valt. Cruciaal bij gehuwde overledenen. |
| 2 | **Executeur-rapport PDF** | Samenvatting met: boedelomschrijving, verdelingsvoorstel, handtekeningblokken voor erfgenamen. |
| 3 | **Registerreferenties** | Kadastrale nummers, kentekens, KvK-nummers — zodat Pieter direct de juiste registers kan benaderen. |
| 4 | **Notities per item** | "Hypotheek bij ING: contact opgenomen 15-03, laatste termijn betaald, aflossing gestopt per 01-04." Werknotities voor de executeur. |

### Nice to Have (Could Have)

| # | Feature | Rationale |
|---|---------|-----------|
| 1 | **Erfbelasting-calculator** | Indicatieve berekening op basis van actuele vrijstellingen en tarieven. Niet bindend, maar informatief. |
| 2 | **Tijdlijn-visualisatie** | Wanneer is elk item voor het laatst gewijzigd, op een tijdlijn. Geeft Pieter snel inzicht in de actualiteit van de data. |
| 3 | **Export naar Excel** | Naast PDF ook CSV/Excel-export van bezittingen, bankrekeningen, schulden — Pieter kan dit direct verwerken in zijn eigen tooling. |
| 4 | **Digitale handtekening op data-snapshot** | Een hash van de database op het moment van ontgrendeling, als bewijs dat de data niet is gewijzigd. |

### Won't Have (voor deze persona)

| # | Feature | Rationale |
|---|---------|-----------|
| 1 | **Invullen van gegevens** | Pieter hoeft geen testament, donor of euthanasie-gegevens in te vullen — hij leest wat Jan heeft vastgelegd. |
| 2 | **Wachtwoord-generator / import** | Irrelevant voor de executeur-rol. |
| 3 | **Dark mode / keyboard shortcuts** | De executeur focust op inhoud, niet op UI-preferenties. |
| 4 | **Shamir-generatie** | Pieter genereert geen nieuwe shares — hij gebruikt de bestaande om te ontgrendelen. |
