# Lumio Whitelabel Brand Governance

**Status:** v1.0 (Maand 12 – Whitelabel Commercieel)  
**Eigenaar:** Product Owner / Brand Owner  
**Laatste update:** Maart 2026  
**Referentie:** REC-BRAND-005, SP-4-301, GUARD-BRAND-003  
**Goedkeuring vereist:** Product Owner + Legal Counsel vóór eerste partner-onboarding

---

## 1. Doel

Dit document regelt welke brand-elementen een whitelabel-partner **mag aanpassen**, welke **niet mogen worden gewijzigd**, en welke **kwaliteitsdrempel** geldt voor een Lumio-whitelabel distributie.

Het doel is tweeledig:
1. Partners de vrijheid geven hun eigen merkidentiteit te voeren
2. De Lumio-kernkwaliteit beschermen — juridische compliance, privacy-belofte en UX-veiligheid blijven onveranderlijk

---

## 2. Aanpasbare elementen (partner-vrij)

| Element | Configuratiesleutel | Opmerkingen |
|---------|---------------------|-------------|
| Bedrijfsnaam | `companyName` | Verschijnt op splash screen en about-dialoog |
| Productnaam | `productName` | Verschijnt in Windows taskbar, macOS dock, installer |
| App-ID (reverse domain) | `appId` | Uniek per partner; must conform to `^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*){2,}$` |
| Primaire merkkleur | `colors.primaryBase` | Enige verplichte kleur; andere shades worden automatisch afgeleid |
| Volledige kleurenpalet | `colors.*` | Zie schema voor alle 7 kleurwaarden; WCAG-compliance vereist (zie §4) |
| Titelbalk kleur (Windows) | `titleBarColor` | Standaard: `colors.primaryDark` |
| Titelbalk symboolkleur | `titleBarSymbolColor` | Standaard: `#ffffff` |
| Splash-achtergrondkleur | `splashColor` | Standaard: `colors.primaryDark` |
| Logo bestand | `logo.file` | SVG (aanbevolen) of PNG ≥512×512 px |
| Logo hoogte in app | `logo.height` | 16–128 px; standaard 32 px |
| Logo dekking | `logo.opacity` | 0.1–1.0; standaard 0.70 |
| Logo op splash tonen | `logo.showOnSplash` | Boolean; standaard `true` |
| App-icoon genereren van logo | `logo.useAsAppIcon` | Boolean; standaard `true` |
| Dashboard-bericht | `dashboardMessage` | Korte footer op dashboardpagina; max 320 tekens; optioneel |

---

## 3. Niet-aanpasbare elementen (absoluut beschermd)

De volgende elementen zijn **structureel niet aanpasbaar** via de whitelabel engine en mogen niet worden omzeild via aanvullende bestanden, patches of post-build modificaties.

### 3.1 Juridische disclaimers (GUARD-BRAND-001)

De volgende disclaimer-teksten zijn verplicht aanwezig op alle juridisch-gevoelige schermen:

> *"Lumio is geen juridisch advies en vervangt geen notaris of arts. Raadpleeg altijd een gekwalificeerde professional voor juridisch bindende documenten."*

**Betrokken schermen:** Testament, Wilsverklaring, Donorregistratie, Euthanasie-sectie.

**Reden:** AVG art. 9, aansprakelijkheidsrisico, GUARD-001. Partners mogen de tekst vertalen maar niet inhoudelijk verzwakken of verwijderen.

### 3.2 Shamir UX-flow kopijtekst

De instructieteksten in de Shamir Secret Sharing flow (noodcodes genereren, delen, herstellen) mogen **niet worden herschreven** zonder formele review door Lumio Product Owner én een UX-expert gespecialiseerd in crisisgebruik.

**Reden:** Deze flow wordt gebruikt door nabestaanden in rouwsituaties. Verkeerd geformuleerde instructies verhogen faalrisico op het meest gevoelige moment (SYS-RISK-009, SYS-RISK-010).

**Partneroptie:** De flow mag worden vertaald naar een andere taal mits Lumio Product Owner de vertaling goedkeurt.

### 3.3 AVG-verwijzingen en privacyverklaring

Verwerkingsgrondslagen (AVG art. 9), datalocatie-informatie ("uw data verlaat nooit uw apparaat"), en de link naar het privacydocument zijn verplicht aanwezig en mogen niet worden verwijderd.

**Reden:** GUARD-001, wettelijke verwerkingsgrondslag AVG.

### 3.4 Offline-first veiligheidsbelofte

De mededeling dat data lokaal en versleuteld wordt opgeslagen (AES-256 SQLCipher) mag alleen worden geclaimd wanneer:
- SEC-RISK-001 (master password als cleartext `string`) is opgelost (GUARD-002)
- De meest recente vulnerability scan clean is

**Actie voor partners:** Vraag bij signing van de partnerovereenkomst altijd een actuele security sign-off op van Lumio.

### 3.5 Kern-UX architectuur

Partners mogen de applicatielay-out, navigatiestructuur, kleurcodering van kritieke statussen (rood = ontbrekend, groen = compleet), en icoonkeuze voor juridisch-gevoelige secties **niet aanpassen** via post-build modificaties of eigen Electron-patches.

---

## 4. Kwaliteitsdrempel — WCAG-compliance (GUARD-003)

Het primaire merkkleur (`primaryBase`) moet WCAG 2.1 AA-contrast behalen:

| Gebruik | Eis | Controlemethode |
|---------|-----|-----------------|
| Tekst op `primaryBase` achtergrond | Contrastverhouding ≥ 4.5:1 (normale tekst) of ≥ 3:1 (grote tekst) | WebAIM Contrast Checker |
| `primaryBase` op witte achtergrond | ≥ 3:1 (UI-component) | Storybook a11y addon |
| `primaryForeground` op `primaryBase` | ≥ 4.5:1 | WebAIM Contrast Checker |

**Validatietool:** Gebruik [webaim.org/resources/contrastchecker](https://webaim.org/resources/contrastchecker/) vóór het indienen van uw configuratie.

**Schending:** Een partner-build met een WCAG-ondoorzichtig kleurenpaar wordt geweigerd. Lumio behoudt het recht een build te blokkeren tot het contrast is gecorrigeerd.

---

## 5. Kwaliteitschecklist voor partner-review

Vul onderstaande checklist in **vóór** het indienen van een whitelabel-configuratie bij Lumio.

### 5.1 Technische checklist

- [ ] `whitelabel.json` valideert succesvol tegen `tools/whitelabel/schema.json`
  ```
  ajv validate -s tools\whitelabel\schema.json -d tools\whitelabel\configs\<slug>\whitelabel.json
  ```
- [ ] Logo-bestand aanwezig op het pad dat in `logo.file` is opgegeven
- [ ] Logo-formaat: SVG of PNG ≥512×512 px
- [ ] `appId` is uniek en volgt reverse-domain notatie (`com.bedrijf.product`)
- [ ] Alle kleuren zijn geldige hex-waarden (`#RRGGBB`)
- [ ] Primaire kleurcontrast WCAG 2.1 AA gecontroleerd en geslaagd (zie §4)

### 5.2 Brand qua inhoud

- [ ] `companyName` is de officiële handelsnaam (geen afkortingen tenzij gewenst)
- [ ] `productName` is door het bedrijf intern goedgekeurd
- [ ] `dashboardMessage` is syntactisch correct en bevat contactinformatie (optioneel maar aanbevolen)
- [ ] `dashboardMessage` bevat geen privacy-gevoelige data (geen BSN, adressen)

### 5.3 Compliance

- [ ] Partner heeft de partnerovereenkomst ondertekend (zie §6)
- [ ] Partner heeft kennis genomen van de niet-aanpasbare elementen (§3) en bevestigt naleving
- [ ] Partner heeft de WCAG-contrastcheck gedaan en gedocumenteerd
- [ ] Als taalvertaling gewenst: vertaalreview aangevraagd bij Lumio Product Owner

### 5.4 Build-verificatie

Na het draaien van `.\tools\build.ps1 -Whitelabel ".\tools\whitelabel\configs\<slug>"`:

- [ ] `src\lumio-desktop\build\icon.ico` bestaat
- [ ] `src\lumio-desktop\build\whitelabel\whitelabel.json` bestaat
- [ ] `src\lumio-desktop\build\whitelabel\splash.html` bestaat en bevat de splash-kleur
- [ ] App opent met partner splashkleur (niet Lumio teal `#2C4A52`)
- [ ] In-app logo zichtbaar bottom-center op iedere pagina
- [ ] Dashboard-bericht zichtbaar op het dashboard (indien geconfigureerd)
- [ ] Juridische disclaimers aanwezig op testament-, wilsverklaring-, donor- en euthanasie-schermen

---

## 6. Merklicentie-model (commercieel kader)

> **Status:** v1.0 — conceptkader voor pilot-fase. Nader te formaliseren via juridisch contract met legal counsel.

### 6.1 Licentievorm

Lumio biedt whitelabel als een **software-as-a-service distributieprogramma**:

| Model | Omschrijving | Doelgroep |
|-------|-------------|-----------|
| **Enterprise Whitelabel** | Volledige branded desktop-distributie; partner distribueert installer aan medewerkers | HR-afdelingen, werkgeversplatforms (WKR-eligible) |
| **Pilot Whitelabel** | Tijdelijke branded configuratie voor beoordeling; max. termijn 3 maanden; geen productie-distributie | Proefpartners |

### 6.2 Wat is inbegrepen

- Toegang tot `tools/whitelabel/` engine en schema
- Technische onboarding via `tools/whitelabel/PARTNER-ONBOARDING.md`
- Eénmalige configuratiereview door Lumio
- Updates mee-ontvangen bij nieuwe engine-versies

### 6.3 Wat is niet inbegrepen

- Aanpassingen aan de API (`src/Lumio.Api`) of de web-app (`src/lumio-web`)
- Witte-label van de online/cloud-variant (niet beschikbaar)
- SLA of uptime-garantie (offline-first product; eindgebruiker beheert installatie)
- Notaris- of juridisch advies namens de partner

### 6.4 Verboden gebruik

- Distributing a whitelabeled build met verwijderde of verkorte juridische disclaimers
- Gebruik van de Lumio-naam of Lumio-logo in externe marketing zonder schriftelijke toestemming
- Aanpassen van de Shamir UX-flow zonder goedkeuring van Lumio Product Owner
- Sub-licentieren van de whitelabel engine aan derde partijen

### 6.5 Aansprakelijkheid

Partners zijn volledig verantwoordelijk voor de AVG-compliance van hun specifieke distributie (eigen werknemers als betrokkenen). Lumio is niet aansprakelijk voor AVG-schendingen die voortkomen uit:
- Post-build modificaties door de partner
- Onjuiste privacyverklaringen door de partner
- Verlies van versleutelde backups door eindgebruikers van de partner

---

## 7. Contactpunten

| Rol | Verantwoordelijkheid |
|-----|---------------------|
| **Lumio Product Owner** | Eindverantwoordelijk voor whitelabel goedkeuring, Shamir-vertaalreview |
| **Security Architect** | Sign-off veiligheidsbelofte (SEC-RISK-001 status) |
| **Legal Counsel** | Merklicentie-contract, AVG-grondslag partner |
| **Onboarding contactpersoon** | Technische configuratiebegeleiding (zie `PARTNER-ONBOARDING.md`) |

---

## 8. Versiebeheer

| Versie | Datum | Wijziging |
|--------|-------|-----------|
| 1.0 | Maart 2026 | Initieel document — Maand 12 Whitelabel Commercieel |

---

## 9. Goedkeuring

Dit document wordt van kracht na ondertekening van:

| Rol | Naam | Handtekening | Datum |
|-----|------|-------------|-------|
| Product Owner | _(invullen)_ | _(handtekening)_ | _(datum)_ |
| Legal Counsel | _(invullen)_ | _(handtekening)_ | _(datum)_ |

> Vóór beide handtekeningen is dit document **conceptversie** en mag het niet aan externe partners worden verstrekt.
