# Lumio Whitelabel Partner Onboarding

**Status:** v1.0 (Maand 12 – Eerste Pilot-Partner)  
**Eigenaar:** Lumio Onboarding Contact  
**Laatste update:** Maart 2026  
**Leestijd:** ~20 minuten

---

## Welkom

Dit document begeleidt u door de volledige technische en commerciële onboarding als Lumio whitelabel-partner. U heeft na het lezen een werkende branded distributie en weet welke stappen leiden tot productie-distributie bij uw medewerkers.

**Vereiste voorkennis:** Basis PowerShell; toegang tot de Lumio repository of een door Lumio aangeleverd build-pakket.

---

## Fase 0 — Eerste gesprek (intake)

Vóór de technische configuratie voert Lumio met elke pilot-partner een intake uit.  
Onderstaande checklist bereidt u voor op dat gesprek.

### Intake vragenlijst

**Organisatie**
- [ ] Wat is de juridische naam van uw organisatie?
- [ ] Wat is het gewenste `productName` (bijv. "ACME Nalatenschap")?
- [ ] Heeft u een unieke reverse-domain identifier beschikbaar (bijv. `com.acme.nalatenschap`)?

**Branding**
- [ ] Is er een merkkleur (primaire hex-waarde) beschikbaar?  
      Neem bij voorkeur een HEX-waarde mee uit uw Brand Identity Guide.
- [ ] Is er een logo-bestand beschikbaar in SVG of PNG (≥512×512 px)?
- [ ] Wenst u een app-icoon gegenereerd van uw logo?
- [ ] Heeft u een kort dashboardbericht ("Aangeboden door [Bedrijf]. Vragen? hr@bedrijf.nl")?

**Distributie**
- [ ] Hoeveel medewerkers ontvangt de app in de pilot? (indicatie)
- [ ] Via welk kanaal distribueert u de installer? (e-mail / software deployment tool / Intranet)
- [ ] Heeft u een IT-afdeling die de installatie kan coördineren?

**Compliance**
- [ ] Bent u bekend met de niet-aanpasbare elementen in `BRAND-GOVERNANCE.md`?
- [ ] Heeft u een functionaris gegevensbescherming (FG/DPO) voor AVG-vereisten?
- [ ] Is er een intern privacybeleid aanwezig dat de verwerking van nalatenschaftsdata van werknemers dekt?

---

## Fase 1 — Technische configuratie

### Stap 1: Repositorytoegang

Vraag Lumio om read-only toegang tot de relevante branches, of ontvang een ZIP-archive van `tools/whitelabel/` met de engine en het schema.

### Stap 2: Maak een config-directory

```powershell
mkdir tools\whitelabel\configs\<uw-bedrijfsslug>
```

Gebruik lowercase kebab-case voor de slug (bijv. `acme-corp`, `mijnbedrijf-nl`).

### Stap 3: Kopieer de starter-template

Kopieer het bestand `tools/whitelabel/configs/new-partner-template/whitelabel.json`  
naar uw nieuwe directory en vul de waarden in:

```powershell
Copy-Item tools\whitelabel\configs\new-partner-template\whitelabel.json `
          tools\whitelabel\configs\<slug>\whitelabel.json
```

### Stap 4: Voeg uw logo toe

Kopieer uw logo naar de config-directory:

```powershell
Copy-Item "C:\pad\naar\logo.svg" "tools\whitelabel\configs\<slug>\logo.svg"
```

Ondersteunde formaten: **SVG** (aanbevolen), PNG ≥512×512 px, JPG/WebP.

### Stap 5: Valideer de configuratie

```powershell
# Installeer ajv-cli eenmalig (Node.js vereist):
npm install -g ajv-cli

# Valideer:
ajv validate -s tools\whitelabel\schema.json `
             -d tools\whitelabel\configs\<slug>\whitelabel.json
```

Of gebruik de engine met `--validate-only`:

```powershell
node tools\whitelabel\engine.mjs `
     --config tools\whitelabel\configs\<slug> `
     --validate-only
```

### Stap 6: Build uitvoeren

```powershell
# Vanuit de repository-root:
.\tools\build.ps1 -Whitelabel ".\tools\whitelabel\configs\<slug>"
```

De build duurt typisch 2–5 minuten. De output verschijnt in `dist\Lumio\win-unpacked\`.

### Stap 7: Verifieer de build

Na de build voert u de volgende snelle visuele controles uit:

| Wat controleren | Verwacht resultaat |
|---|---|
| Splash-schermkleur | Uw `splashColor` (niet Lumio teal `#2C4A52`) |
| Splash logo | Uw bedrijfslogo gecentreerd |
| App-headerbalk | Uw `primaryBase` kleur |
| In-app logo overlay | Uw logo fixed linksonder op elke pagina |
| Dashboardbericht | Zichtbaar op homepage (indien geconfigureerd) |
| Juridische disclaimer | Aanwezig op testament-/wilsverklaring-/donor-/euthanasie-schermen |
| Windows taakbalk | Uw `productName` |

Volledige verificatiestappen: zie `tools/whitelabel/README.md` — sectie "Verifying Build Output".

---

## Fase 2 — Compliance-review

Vóór productiedistributie voert Lumio een **eenmalige compliance-review** uit van uw configuratie.

### Wat Lumio controleert

1. Schema-validatie (`whitelabel.json` voldoet aan `schema.json`)
2. WCAG 2.1 AA contrastcheck van uw primaire kleur(en)
3. Aanwezigheid en volledigheid van juridische disclaimers in de build
4. Geen verwijderde of gewijzigde Shamir UX-flow kopij
5. Geldig `appId` (uniek, geen conflicten met bestaande partners)

### Aanlevering aan Lumio

Lever het volgende aan bij uw Lumio-contactpersoon:

```
tools/whitelabel/configs/<slug>/
├── whitelabel.json        ← uw configuratie
└── logo.svg               ← uw logo
```

Stuur tevens een screenshot van uw WCAG-contrastcheck (zie `BRAND-GOVERNANCE.md §4`).

---

## Fase 3 — Partnerovereenkomst

Onderteken de whitelabel partnerovereenkomst met Lumio (separaat juridisch document). Hierin worden vastgelegd:

- Licentieomvang en distributierecht
- Verbodsbepalingen (zie `BRAND-GOVERNANCE.md §6.4`)
- AVG-verwerkersovereenkomst (indien van toepassing)
- SLA-afspraken (geen uptime-SLA — offline product; wel software-update cadans)
- Prijsafspraken (INSUFFICIENT_DATA: te bepalen per partner; zie OI-005 in synthesis agent output)

---

## Fase 4 — Productiedistributie

Na goedkeuring en ondertekening:

1. **Distribueer de installer** (`dist\Lumio\win-unpacked\<ProductName>.exe`) via uw IT-kanaal
2. **Informeer medewerkers** met uw communicatieplan
3. **Registreer het build-versienummer** in uw interne IT-beheer

### Updates ontvangen

Bij een nieuwe Lumio-versie ontvangt u een notificatie. U voert dan opnieuw `.\tools\build.ps1 -Whitelabel` uit met uw bestaande config-directory. Geen aanpassingen aan uw `whitelabel.json` nodig tenzij de schema-versie is verhoogd.

---

## Fase 5 — Pilot-evaluatie (na 4–8 weken)

Na de pilot vraagt Lumio u om feedback via een kort evaluatiegesprek:

| Onderwerp | Doel |
|-----------|------|
| Activatiegraad medewerkers | % installaties voltooid |
| Primaire gebruikspatronen | Welke secties worden het meest ingevuld |
| Technische problemen | Installatiefouten, compatibiliteitsproblemen |
| Merkervaring | Voldoet de branding aan uw verwachting |
| Shamir-flow bruikbaarheid | Hebben medewerkers noodcodes ingesteld (anoniem) |

Feedback wordt gebruikt voor product-roadmap en engine-verbeteringen.

---

## Veelgestelde vragen

**Kan ik de app-tekst (bijv. "Testament") hernoemen?**  
Nee. Interface-kopij is onderdeel van de niet-aanpasbare kern (zie §3.3 in `BRAND-GOVERNANCE.md`). Taalvertalingen (NL → EN etc.) zijn op aanvraag met Lumio-review mogelijk.

**Kan ik extra pagina's of functies toevoegen?**  
Nee. De whitelabel-distributie is gebaseerd op de standaard Lumio-functionaliteitenset. Maatwerk-feature-ontwikkeling valt buiten het standaard whitelabel-programma.

**Kunnen medewerkers de data exporteren naar andere systemen?**  
Ja. Via `/api/export/json`, `/api/export/xml`, `/api/export/backup/encrypted` kunnen medewerkers hun eigen data exporteren. Dit is AVG-compliant (recht op dataportabiliteit).

**Is de data van onze medewerkers zichtbaar voor Lumio?**  
Nee. Lumio heeft geen toegang tot de data van eindgebruikers. De database bevindt zich uitsluitend op het apparaat van de medewerker (local-first architectuur, AES-256 SQLCipher).

**Hoe werkt een medewerker die de app wil verwijderen?**  
De medewerker deïnstalleert de applicatie via Windows. De versleutelde database wordt **niet automatisch verwijderd** — de medewerker is verantwoordelijk voor het verwijderen van het data-bestand. Dit moet in uw privacyinformatie aan medewerkers worden vermeld.

---

## Contactinformatie

| Vraag | Contactpersoon |
|-------|---------------|
| Technische configuratie, build-problemen | Lumio Onboarding Contact |
| Compliance, juridische vragen | Lumio Legal / Product Owner |
| WCAG-contrastcheck hulp | Lumio UX |
| Pricing, piloteringsovereenkomst | Lumio Sales |

---

## Bijlagen

- [BRAND-GOVERNANCE.md](BRAND-GOVERNANCE.md) — Volledig governance framework
- [README.md](README.md) — Technische engine-documentatie
- [schema.json](schema.json) — JSON Schema voor whitelabel.json
- [configs/new-partner-template/](configs/new-partner-template/) — Starter-template voor uw configuratie
- [configs/example-corp/](configs/example-corp/) — Referentie-implementatie (paarse corporate stijl)
