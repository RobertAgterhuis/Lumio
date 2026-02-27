# 12 — Noodcontacten & Noodkaart

## Noodcontacten

Leg de personen vast die in geval van nood gecontacteerd moeten worden.

### Contactgegevens

| Veld | Beschrijving |
|------|--------------|
| Naam | Naam van het contact |
| Relatie | Verwantschap |
| Telefoon | Telefoonnummer |
| E-mail | E-mailadres |
| Adres, Postcode, Woonplaats | Woonadres |

### Rollen

Geef elk contact een rol:
- **Vertrouwenspersoon** — Eerste aanspreekpunt
- **Huisarts** — Medisch contact
- **Notaris** — Juridisch contact
- **Uitvaartondernemer** — Uitvaart regelen
- **Advocaat** — Juridische bijstand
- **Financieel adviseur** — Financieel advies
- **Overig** — Andere rollen

### Instructies

Per contact kunt u **instructies** vastleggen — wat dit contact moet doen of weten in geval van nood.

### Gedeeld Contact

Markeer een contact als **gedeeld** als het een contact is dat ook door anderen kan worden gezien (bijv. een gezamenlijke huisarts).

### Exporteren en Importeren

- **Exporteer** noodcontacten als JSON-bestand om te delen
- **Importeer** noodcontacten vanuit een JSON-bestand

## QR-Noodkaart

Lumio kan een **QR-code** genereren met uw noodcontactgegevens.

### Wat staat op de noodkaart?

De QR-code bevat:
- Namen en rollen van uw noodcontacten
- Telefoonnummers en e-mailadressen
- Een verwijzing naar Shamir-noodcodes

### Noodkaart Maken

1. Ga naar de noodcontactenpagina
2. Klik op **Noodkaart QR**
3. De QR-code wordt gegenereerd
4. Download de QR-code als **PNG-afbeelding**

### Gebruik

Print de QR-code en bewaar deze bij uw identiteitsbewijs, in uw portemonnee, of op een andere plek waar hulpverleners het kunnen vinden. Iedereen met een smartphone kan de QR-code scannen om uw noodcontacten te zien.

## Slimme Suggesties

Lumio analyseert uw noodcontacten in relatie tot gegevens in andere secties en genereert suggesties op het dashboard:

| Trigger | Suggestie | Regel |
|---------|-----------|-------|
| Noodcontact heeft geen telefoonnummer | Voeg een telefoonnummer toe — noodcontacten moeten bereikbaar zijn | BR-SUG-14 |
| Executeur (uit testament) niet als noodcontact geregistreerd | Voeg uw executeur toe als noodcontact | BR-SUG-13 |
| Vertegenwoordiger (uit wilsverklaring) niet als noodcontact geregistreerd | Voeg uw vertegenwoordiger toe als noodcontact (KNMG Richtlijn 2022) | BR-SUG-20 |
| Huisarts uit wilsverklaring niet als noodcontact geregistreerd | Voeg uw huisarts toe met rol ‘Huisarts’ | BR-SUG-22 |
| Aangewezen donor-beslisser niet als noodcontact geregistreerd | Voeg de beslisser toe als noodcontact (Wet orgaandonatie art. 9) | BR-SUG-23 |
