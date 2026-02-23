# 10. Instellingen & Tips

Dit hoofdstuk behandelt de instellingenpagina, sneltoetsen, het activiteitenlogboek, de tijdlijn na overlijden en veelgestelde vragen.

> **Navigatie:** Klik in de zijbalk op **Instellingen** of gebruik sneltoets `G` → `I`.

---

## 10.1 Auto-vergrendeling

Lumio vergrendelt automatisch na een periode van inactiviteit om uw gegevens te beschermen.

Kies een time-out:

| Optie | Toelichting |
|-------|-------------|
| **1 minuut** | Extra veilig — vergrendelt snel |
| **2 minuten** | — |
| **5 minuten** | Standaardinstelling |
| **10 minuten** | — |
| **15 minuten** | — |
| **30 minuten** | Langste time-out |
| **Uitgeschakeld** | Niet vergrendelen bij inactiviteit |

> **Tip:** Voor maximale veiligheid wordt een time-out van 5 minuten aanbevolen. U kunt altijd handmatig vergrendelen met **Ctrl+L**.

---

## 10.2 Grote-tekst modus

Schakel tussen twee weergavemodi:

| Modus | Beschrijving |
|-------|-------------|
| **Normaal** | Standaard tekstgrootte |
| **Grote tekst** | Grotere letters voor betere leesbaarheid |

De instelling wordt direct toegepast — geen herstart nodig.

---

## 10.3 Periodieke actualisatie

Lumio herinnert u eraan om uw gegevens periodiek te controleren. Per onderdeel ziet u wanneer u de gegevens voor het laatst als actueel heeft bevestigd.

### Gegevens bevestigen

1. Klik op **Bevestigen** bij een individueel onderdeel om aan te geven dat de informatie nog klopt
2. Of klik op **Alles als actueel bevestigen** om alle onderdelen in één keer te bevestigen

> **Tip:** Controleer uw gegevens minimaal één keer per jaar, of na belangrijke levensgebeurtenissen (huwelijk, geboorte, verhuizing, aankoop, etc.).

---

## 10.4 Profielbeheer

Beheer uw Lumio-profielen:

### Profielen bekijken

De lijst toont alle profielen met naam, relatie en een markering voor het actieve profiel.

### Nieuw profiel toevoegen

1. Klik op **Nieuw profiel toevoegen**
2. Voer een **naam** in
3. Kies een **relatie** (Partner, Kind, Ouder of Overig)
4. Klik op **Aanmaken**

Er geldt een maximum van **5 profielen**.

### Profiel verwijderen

1. Klik op het **prullenbak-icoon** naast het profiel
2. Bevestig de verwijdering

> **Let op:** U kunt het primaire profiel en het actieve profiel niet verwijderen.

---

## 10.5 Wachtwoord wijzigen

Wijzig uw hoofdwachtwoord:

1. Voer uw **huidige wachtwoord** in
2. Voer het **nieuwe wachtwoord** in (minimaal 8 tekens)
3. De **wachtwoordsterktemeter** toont de sterkte
4. **Bevestig** het nieuwe wachtwoord
5. Klik op **Opslaan**

> ⚠️ **Belangrijk:** Na het wijzigen van uw wachtwoord worden eventueel eerder gegenereerde **noodcodes ongeldig**. Genereer nieuwe noodcodes voor uw erfgenamen via de erfgenamenpagina.

---

## 10.6 Backup & Herstel

### Backup downloaden

Klik op **Download backup** om een versleuteld backup-bestand te downloaden. Dit bestand bevat uw volledige database.

### Backup herstellen

1. Klik op **Backup herstellen**
2. Selecteer het **backup-bestand**
3. Voer het **wachtwoord** in waarmee de backup is gemaakt
4. Bevestig dat u de huidige gegevens wilt overschrijven
5. Klik op **Ja, herstel backup**

> ⚠️ **Let op:** Herstellen overschrijft alle huidige gegevens. Dit kan niet ongedaan worden gemaakt.

### Automatische backup (alleen desktop)

Als u Lumio als desktop-applicatie gebruikt, kunt u automatische backups instellen:

1. Schakel **Automatische backup** in
2. Kies een **backup-map** via de knop "Bladeren"
3. Stel de **frequentie** in:

| Frequentie | Beschrijving |
|-----------|-------------|
| **Dagelijks** | Elke dag een backup |
| **Wekelijks** | Elke week een backup |
| **Maandelijks** | Elke maand een backup |

4. Klik op **Opslaan**
5. Test met **Nu backup maken** of het werkt

---

## 10.7 Beveiliging

De beveiligingskaart toont informatie over hoe uw gegevens worden beschermd:

| Aspect | Bescherming |
|--------|------------|
| **Database** | SQLCipher AES-256-CBC versleuteling |
| **Gevoelige velden** | Extra AES-256-GCM versleuteling (BSN, wachtwoorden, seed phrases) |
| **Netwerk** | Alleen localhost — geen externe verbindingen |
| **Internet** | Niet vereist — volledig offline |

### Digitale handtekening

De component **Digitale handtekening** berekent een hash van uw gegevens. Hiermee kunt u controleren of uw gegevens niet zijn gemanipuleerd.

---

## 10.8 Over Lumio

Een korte beschrijving van de applicatie met juridische disclaimer.

---

## 10.9 Alle gegevens wissen

De knop **Alle gegevens permanent verwijderen** wist uw volledige database. Dit is een destructieve actie:

1. Klik op **Alle gegevens wissen**
2. Lees de waarschuwing zorgvuldig
3. Voer uw **wachtwoord** in ter bevestiging
4. Klik op **Ja, verwijder alles permanent**

> ⚠️ **Waarschuwing:** Deze actie kan niet ongedaan worden gemaakt. Maak eerst een backup als u twijfelt.

---

## 10.10 Activiteitenlogboek

Het **activiteitenlogboek** registreert alle acties die in Lumio zijn uitgevoerd.

> **Navigatie:** Klik in de zijbalk op **Activiteitenlog** of gebruik sneltoets `G` → `A`.

### Wat wordt gelogd?

| Actie | Kleur | Beschrijving |
|-------|-------|-------------|
| **Aangemaakt** | Groen | Een nieuw item is toegevoegd |
| **Gewijzigd** | Blauw | Een bestaand item is aangepast |
| **Verwijderd** | Rood | Een item is verwijderd |
| **Ontgrendeld** | Smaragd | De database is ontgrendeld |
| **Vergrendeld** | Amber | De database is vergrendeld |
| **Wachtwoord gewijzigd** | Oranje | Het wachtwoord is gewijzigd |
| **Export** | Paars | Er is een export gemaakt |

### Filteren

Gebruik het dropdown-menu om te filteren op een specifiek actietype (bijv. alleen "Verwijderd").

### Vernieuwen

Klik op **Vernieuwen** om de nieuwste activiteiten op te halen.

---

## 10.11 Tijdlijn na overlijden

De pagina **Tijdlijn Overlijden** biedt een informatief overzicht van wat er geregeld moet worden na een overlijden, opgedeeld in vier fasen:

### Eerste 24 uur (rood)

| Stap | Actie |
|------|-------|
| 1 | Huisarts bellen |
| 2 | Uitvaartondernemer inschakelen |
| 3 | Noodcontacten informeren |
| 4 | Donorregistratie raadplegen |
| 5 | Wilsverklaring raadplegen |

### Eerste week (amber)

| Stap | Actie |
|------|-------|
| 6 | Notaris inschakelen |
| 7 | Werkgever(s) informeren |
| 8 | Overlijdensaangifte doen |
| 9 | Documenten verzamelen |

### Eerste maand (blauw)

| Stap | Actie |
|------|-------|
| 10 | Verzekeringen afhandelen |
| 11 | Bankzaken regelen |
| 12 | Abonnementen opzeggen |
| 13 | Uitkeringen en toeslagen stopzetten |
| 14 | Digitaal bezit afhandelen |

### Eerste 3 maanden (violet)

| Stap | Actie |
|------|-------|
| 15 | Erfbelasting aangeven |
| 16 | Aanvaarding of verwerping nalatenschap |
| 17 | Boedelverdeling uitvoeren |
| 18 | Inkomstenbelasting (F-formulier) |
| 19 | Social media-accounts afhandelen |

> **Let op:** Dit overzicht is informatief en geen juridisch advies. Raadpleeg een notaris voor juridische begeleiding.

---

## 10.12 Sneltoetsen

Lumio ondersteunt sneltoetsen voor snelle navigatie en veelgebruikte acties:

### Directe acties

| Sneltoets | Actie |
|-----------|-------|
| **Ctrl+L** | Direct vergrendelen |
| **Ctrl+N** | Nieuw item aanmaken |
| **Ctrl+K** | Zoeken |
| **?** | Sneltoetsen-overzicht tonen |

### Navigatie (G → letter)

Druk op **G** en daarna binnen 1,5 seconde op de bijbehorende letter:

| Letter | Bestemming |
|--------|-----------|
| **D** | Dashboard |
| **P** | Mijn Profiel |
| **T** | Testament |
| **W** | Wilsverklaring |
| **O** | Donorregistratie |
| **B** | Digitaal Bezit |
| **E** | Boedel |
| **U** | Uitvaartwensen |
| **F** | Documenten |
| **R** | Erfgenamen |
| **N** | Noodcontacten |
| **X** | Exporteren |
| **A** | Activiteitenlog |
| **I** | Instellingen |

> **Let op:** Sneltoetsen werken niet wanneer u in een tekstveld aan het typen bent.

---

## 10.13 Veelgestelde vragen

### Wat gebeurt er als ik mijn wachtwoord vergeet?

Lumio kan uw wachtwoord **niet herstellen**. Zonder wachtwoord (of voldoende noodcodes) is de data niet toegankelijk. Bewaar uw wachtwoord daarom op een veilige plek.

### Kan ik Lumio op meerdere computers gebruiken?

Ja, via een USB-stick. Sluit de USB-stick aan op een andere computer en start Lumio.exe. Al uw gegevens zitten in de versleutelde database op de USB-stick.

### Hoe veilig zijn mijn gegevens?

Zeer veilig. Uw database is versleuteld met AES-256 (via SQLCipher). Gevoelige velden zoals BSN-nummers, wachtwoorden en seed phrases worden extra versleuteld met AES-256-GCM. Lumio maakt geen internetverbindingen en verzendt geen gegevens.

### Hoeveel profielen kan ik aanmaken?

Maximaal **5 profielen**. Elk profiel heeft een eigen versleutelde database.

### Wat als mijn USB-stick kapotgaat?

Maak regelmatig **backups** via Instellingen → Backup & Herstel. Bewaar de backup op een veilige plek (bijv. een tweede USB-stick of een externe harde schijf).

### Heeft Lumio een donkere modus?

Ja, Lumio respecteert de systeeminstelling van uw computer. Als u in Windows of macOS de donkere modus heeft ingeschakeld, past Lumio zich daar automatisch op aan.

### Hoe weten erfgenamen dat ze Lumio moeten gebruiken?

Informeer uw erfgenamen vooraf dat u Lumio gebruikt en waar de USB-stick wordt bewaard. Geef hen hun noodcode en leg uit dat ze gezamenlijk Lumio kunnen ontgrendelen. De **Noodprocedure & Instructie** PDF (via Exporteren) bevat stap-voor-stap instructies die u kunt meegeven.

### Kan ik mijn gegevens importeren vanuit een ander programma?

Op dit moment ondersteunt Lumio het importeren van **wachtwoorden** vanuit 1Password, Bitwarden, LastPass, KeePass en Chrome. Overige gegevens voert u handmatig in.

### Hoe vaak moet ik mijn gegevens bijwerken?

Wij raden aan om uw gegevens **minimaal jaarlijks** te controleren via de functie Periodieke actualisatie in Instellingen. Belangrijke levensgebeurtenissen (huwelijk, geboorte, scheiding, verhuizing, aankoop, etc.) zijn een goed moment om uw nalatenschap bij te werken.

### Waar kan ik een testamentconcept laten opstellen?

Lumio genereert **concept-documenten** die u kunt bespreken met uw notaris. Ga naar Exporteren → **Testament Concept (wettelijk)** om een formeel opgesteld concept te downloaden. Een notaris kan dit als basis gebruiken voor een notarieel testament.

---

## 10.14 Checklist voor nieuwe gebruikers

Gebruik deze checklist als leidraad bij het inrichten van uw digitale nalatenschap:

- [ ] Profiel aangemaakt met persoonsgegevens
- [ ] Profielfoto geüpload
- [ ] Notarisgegevens ingevuld
- [ ] Testament informatie vastgelegd
- [ ] Wilsverklaring euthanasie ingevuld
- [ ] Donorkeuze geregistreerd
- [ ] Online accounts geïnventariseerd
- [ ] Wachtwoorden overgezet of ingevoerd
- [ ] Crypto wallets vastgelegd
- [ ] Bezittingen geregistreerd
- [ ] Bankrekeningen vastgelegd
- [ ] Verzekeringen vastgelegd
- [ ] Schulden vastgelegd
- [ ] Uitvaartwensen beschreven
- [ ] Erfgenamen geregistreerd
- [ ] Noodcodes verdeeld onder erfgenamen
- [ ] Noodcontacten toegevoegd
- [ ] Belangrijke documenten geüpload
- [ ] Eerste backup gemaakt
- [ ] Erfgenamen geïnformeerd over Lumio en noodcodes

---

*Vorige: [Hoofdstuk 9 — Documenten & Exporteren](09-documenten-export.md) · Terug naar: [Inhoudsopgave](README.md)*
