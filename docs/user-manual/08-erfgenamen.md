# 8. Erfgenamen & Noodcodes

Op de pagina **Erfgenamen** registreert u uw erfgenamen, wijst u bezittingen toe en verdeelt u **noodcodes** waarmee erfgenamen na uw overlijden gezamenlijk toegang kunnen krijgen tot Lumio.

> **Navigatie:** Klik in de zijbalk op **Erfgenamen** of gebruik sneltoets `G` → `R`.

---

## 8.1 Overzicht

De pagina bevat:

- **Erfgenamenlijst** — alle geregistreerde erfgenamen met hun gegevens
- **Bezit toewijzen** — koppel bezittingen aan specifieke erfgenamen
- **Noodcodes verdelen** — genereer Shamir-codes voor erfgenaam-toegang
- **Erfbelastingcalculator** — bereken een indicatie van de erfbelasting
- **Exportopties** — PDF en HTML per erfgenaam

---

## 8.2 Erfgenaam toevoegen

1. Klik op **Erfgenaam toevoegen**
2. Vul de gegevens in:

| Veld | Verplicht | Toelichting |
|------|-----------|-------------|
| **Voornaam** | ✅ Ja | Voornaam van de erfgenaam |
| **Tussenvoegsel** | Nee | Bijv. "van", "de" |
| **Achternaam** | ✅ Ja | Achternaam |
| **Relatie** | ✅ Ja | Kies uit de lijst (zie hieronder) |
| **E-mail** | Nee | E-mailadres |
| **Telefoon** | Nee | Telefoonnummer |
| **Geboortedatum** | Nee | Geboortedatum |
| **BSN** | Nee | Burgerservicenummer (versleuteld opgeslagen) |
| **Adres, Postcode, Woonplaats** | Nee | Adresgegevens |
| **Legitimatie** | Nee | Soort, nummer, datum afgifte en geldigheid |

3. Klik op **Opslaan**

### Relaties

| Relatie | Toelichting |
|---------|------------|
| **Partner** | Echtgeno(o)t(e) of levenspartner |
| **Kind** | Zoon of dochter |
| **Ouder** | Vader of moeder |
| **Broer/Zus** | Broer of zuster |
| **Kleinkind** | Kleinkind |
| **Neef/Nicht** | Neef of nicht |
| **Vriend(in)** | Goede vriend of vriendin |
| **Organisatie** | Stichting, vereniging of goed doel |
| **Anders** | Andere relatie |

### Legitimatie

Als u een **soort legitimatie** selecteert (Paspoort, Identiteitskaart of Rijbewijs), verschijnen extra velden:

- **Documentnummer**
- **Datum afgifte**
- **Geldig tot**

> **Waarom BSN en legitimatie?** Deze gegevens zijn nodig voor notariële aktes. Het BSN wordt versleuteld opgeslagen.

---

## 8.3 Erfgenaam bewerken of verwijderen

Elke erfgenaam in de lijst toont actieknoppen:

| Knop | Actie |
|------|-------|
| ✏️ Potlood | Gegevens bewerken |
| 📦 Pakket | Bezit toewijzen |
| 📄 PDF | Erfgenaam-PDF downloaden |
| 🔗 HTML | Erfgenaam-informatie als HTML downloaden |
| 🗑 Prullenbak | Erfgenaam verwijderen |

---

## 8.4 Bezit toewijzen

U kunt specifieke bezittingen, rekeningen of accounts toewijzen aan een erfgenaam.

### Toewijzing maken

1. Klik op het **pakket-icoon** (📦) bij een erfgenaam, of klik op **Bezit toewijzen**
2. In het venster dat verschijnt:
   - Selecteer de **erfgenaam**
   - Kies het **type bezit**:

| Type | Bron |
|------|------|
| **Fysiek bezit** | Items uit de Boedel (Bezittingen) |
| **Bankrekening** | Items uit de Boedel (Rekeningen) |
| **Verzekering** | Items uit de Boedel (Verzekeringen) |
| **Digitaal account** | Items uit Digitaal Bezit (Accounts) |
| **Crypto wallet** | Items uit Digitaal Bezit (Crypto) |

   - Selecteer het **specifieke item**
   - Voeg optioneel **instructies** toe
3. Klik op **Toewijzen**

### Toewijzingen bekijken

Klik op een erfgenaam om de rij uit te klappen. U ziet dan alle toegewezen items met type-labels. U kunt een toewijzing verwijderen via het kruisje.

> **Let op:** Items die al zijn toegewezen aan een erfgenaam zijn niet beschikbaar voor andere toewijzingen.

---

## 8.5 Noodcodes verdelen (Shamir's Secret Sharing)

Het meest unieke kenmerk van Lumio: **noodcodes** waarmee erfgenamen gezamenlijk toegang kunnen krijgen tot uw gegevens na uw overlijden, zonder dat één persoon uw wachtwoord kent.

### Hoe werkt het?

Lumio splitst uw hoofdwachtwoord op in meerdere unieke **noodcodes** (één per erfgenaam). Alleen wanneer een minimaal aantal erfgenamen hun codes samenvoegen, kan het wachtwoord worden gereconstrueerd.

**Voorbeeld:** U heeft 4 erfgenamen en stelt de drempel in op 3. Elk krijgt een unieke code. Pas als minimaal 3 van de 4 erfgenamen hun code invoeren, kan Lumio worden ontgrendeld.

### Noodcodes genereren

1. Zorg dat u **minimaal 2 erfgenamen** heeft geregistreerd
2. Klik op **Noodcodes verdelen**
3. In het venster dat verschijnt:

   a. **Lees de waarschuwing:** De codes worden NIET opgeslagen in Lumio. Na het sluiten van het venster zijn ze niet meer terug te halen.

   b. **Voer uw wachtwoord in** ter bevestiging

   c. **Stel de drempel in:** Kies hoeveel codes er nodig zijn om te ontgrendelen
      - Bijv. "3 van 4 personen" = minimaal 3 van de 4 codes zijn nodig
      - Hoe hoger de drempel, hoe veiliger (maar ook hoe meer coördinatie nodig)

   d. Klik op **Genereren**

4. De codes verschijnen in het scherm, elk gelabeld met de naam van de erfgenaam
5. **Kopieer elke code** via de knop "Kopiëren"
6. **Deel elke code** persoonlijk met de betreffende erfgenaam

### Veiligheidsregels voor noodcodes

| Regel | Toelichting |
|-------|-------------|
| ⚠️ Codes worden **niet opgeslagen** | Na sluiten van het venster zijn ze weg |
| 🔒 Deel codes **persoonlijk** | Stuur ze niet via e-mail of chat |
| 📝 Laat erfgenamen hun code **veilig bewaren** | Bijv. in een kluis of verzegelde envelop |
| 🔄 Bij **wachtwoord wijziging** worden codes ongeldig | Genereer daarna nieuwe codes |
| 👁 Erfgenaam-toegang is **alleen-lezen** | Gegevens bekijken maar niet wijzigen |

> **Tip:** Print de codes uit en doe ze in afzonderlijke verzegelde enveloppen. Bewaar een overzicht bij uw notaris.

---

## 8.6 Erfbelastingcalculator

Wanneer u erfgenamen heeft geregistreerd, toont Lumio een **erfbelastingcalculator** die een indicatie geeft van de verschuldigde erfbelasting per erfgenaam, op basis van:

- De relatie (partner, kind, etc.)
- Het aandeel in de nalatenschap
- De geldende vrijstellingen en tarieven

> **Let op:** Dit is een indicatieve berekening. Raadpleeg een belastingadviseur of notaris voor de exacte berekening.

---

## 8.7 Export per erfgenaam

U kunt per erfgenaam een overzicht downloaden:

| Formaat | Bestandsnaam | Inhoud |
|---------|-------------|--------|
| **PDF** | `lumio-erfgenaam-{voornaam}.pdf` | Overzicht van alle gegevens en toewijzingen |
| **HTML** | `lumio-deel-{voornaam}.html` | Deelbaar overzicht in HTML-formaat |

---

## 8.8 Noodcontacten

Naast erfgenamen kunt u op de pagina **Noodcontacten** vertrouwenspersonen en hulpverleners registreren.

> **Navigatie:** Klik in de zijbalk op **Noodcontacten** of gebruik sneltoets `G` → `N`.

### Noodcontact toevoegen

1. Klik op **Toevoegen**
2. Vul de gegevens in:

| Veld | Verplicht | Toelichting |
|------|-----------|-------------|
| **Naam** | ✅ Ja | Volledige naam |
| **Relatie** | ✅ Ja | Bijv. partner, broer, buurvrouw |
| **Rol** | ✅ Ja | Kies uit de lijst (zie hieronder) |
| **Telefoon** | Nee | Telefoonnummer |
| **E-mail** | Nee | E-mailadres |
| **Adres, Postcode, Woonplaats** | Nee | Adresgegevens |
| **Instructies** | Nee | Speciale instructies voor nabestaanden |
| **Gedeeld contact** | Nee | Aanvinken als dit contact ook relevant is voor uw partner |

3. Klik op **Opslaan**

### Rollen

| Rol | Beschrijving |
|-----|-------------|
| **Vertrouwenspersoon** | Eerste aanspreekpunt in noodsituaties |
| **Huisarts** | Uw huisarts |
| **Notaris** | Uw notaris |
| **Uitvaartondernemer** | Uw uitvaartondernemer |
| **Advocaat** | Uw advocaat |
| **Financieel adviseur** | Uw financieel adviseur |
| **Overig** | Andere contactpersoon |

### Gedeelde contacten

Contacten gemarkeerd als **"Gedeeld"** kunnen worden gedeeld tussen profielen (bijv. partners die dezelfde huisarts hebben):

1. Klik op **Exporteer** bij "Gedeelde contacten"
2. Een JSON-bestand wordt gedownload
3. Open het andere profiel in Lumio
4. Klik op **Importeer** en selecteer het JSON-bestand
5. Lumio toont hoeveel contacten zijn geïmporteerd en hoeveel er zijn overgeslagen (duplicaten)

### Noodkaart-QR

In de header van de contactenkaart vindt u een **QR-code** voor uw noodkaart. Deze bevat de essentiële contactgegevens die in een noodsituatie direct beschikbaar moeten zijn.

---

## 8.9 Voorbeeld en notitie

- **Voorbeeld bekijken** — bekijk een voorbeeld
- **Sectienotitie** — voeg een persoonlijke notitie toe

---

*Vorige: [Hoofdstuk 7 — Uitvaartwensen](07-uitvaart.md) · Volgende: [Hoofdstuk 9 — Documenten & Exporteren](09-documenten-export.md)*
