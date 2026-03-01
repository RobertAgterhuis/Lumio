# Analyse – Business Analyst – 2026-03-01

## Metadata
- **Agent:** 01-business-analyst
- **Fase:** 1
- **Input ontvangen van:** 25-onboarding-agent (`docs/onboarding/onboarding-output.md`)
- **Datum:** 2026-03-01T00:00:00Z
- **Software onder analyse:** Lumio v1.0.0 (branch `Feature/UI`, commit `3049daec`)
- **Guardrails gevolgd:** `docs/guardrails/00-global-guardrails.md`, `docs/guardrails/01-business-guardrails.md` (G-BUS-01 t/m G-BUS-08)

---

## 1. Current State

### 1.1 Product & Marktpositie

**Bevinding:** Lumio is een **offline-first Electron desktop-applicatie** voor het beheren van digitale nalatenschap. De kernwaardepropositie is: alle persoonlijke nalatenschap-data (testament-wensen, noodcontacten, uitvaartwensen, donorregistratie, euthanasie-wensen, digitaal bezit, boedel, videoboodschappen) wordt **lokaal opgeslagen, AES-256 versleuteld met SQLCipher**, zonder cloud of account.  
**Bron:** `README.md` regel 3–10; `documentation/technical-manual/NL/01-architectuur.md` Systeemoverzicht  
**Impact:** Hoog — dit is de primaire differentiator ten opzichte van cloud-gebaseerde concurrenten (bijv. LifeVault, Everplans).

**Bevinding:** De applicatie richt zich op twee segmenten:
1. **B2C** — particuliere Nederlandse consumenten via directe website-aankoop
2. **B2B** — werkgevers die Lumio aanbieden als arbeidsvoorwaarde/benefit via whitelabel-distributie  
**Bron:** `site/src/app/werkgevers/page.tsx`; `tools/whitelabel/README.md`; `README.md` paragraaf "Corporate Distribution"  
**Impact:** Hoog — twee-segment strategie vereist aparte sales- en marketing-aanpak.

**Bevinding:** De marketingsite (`www.lumio-legacy.nl`) is aangemaakt en in CI/CD opgenomen maar de **DNS-propagatie is nog niet voltooid**. De site is nog niet publiek bereikbaar op het definitieve domein.  
**Bron:** `devdocs/deployment-urls.md` — "STATUS: DNS PROPAGATIE AFWACHTEN"  
**Impact:** Hoog — geen live marketingpresence bemoeilijkt klantacquisitie.

### 1.2 Revenue Model

**Bevinding:** Het pricing-model is **eenmalig (perpetual license), geen abonnement**:
- **B2C:** €125 per licentie, eenmalig, alle functies inbegrepen
- **B2B:** €125 per medewerker, eenmalig, WKR-passend (Werkkostenregeling) als personeelsvoorziening; vaste pakket-lagen: 10 / 25 / 50 / 100 licenties; >100 medewerkers: maatwerkofferte  
**Bron:** `site/src/app/prijzen/page.tsx` regels 14–15 (`€125 eenmalig`), regels 61–63 (B2B €125/mederwerker)  
**Impact:** Hoog — eenmalige aankoop creëert directe ARR-druk: groei afhankelijk van nieuwe klanten, geen recurring revenue buffer.

**Bevinding:** Er is **geen in-app betalingsflow, geen trial-mechanisme en geen freemium-tier** aanwezig in de codebase. Alle betalingstransacties verlopen buiten de applicatie.  
**Bron:** Codebase scan — geen payment gateway controllers aangetroffen in `src/Lumio.Api/Controllers/`; geen Stripe/Mollie/iDEAL-dependency in `src/lumio-web/package.json` of `src/Lumio.Api/Lumio.Api.csproj`  
**Impact:** Middelmatig — lage technische drempel voor aankoop, maar geen meetbare funnel binnen de applicatie.

**Bevinding:** De WKR-invalshoek (Werkkostenregeling) in het B2B-segment is een **fiscale specifieke upsell-driver**: Lumio past binnen de vrije ruimte WKR (1,92% tot €400.000 loonsom), wat het product voor HR-budgethouders interessant maakt zonder extra loonheffing.  
**Bron:** `site/src/app/werkgevers/page.tsx` — sectie `WkrUitleg`, `CfoPitch`; `site/src/app/prijzen/page.tsx` metadata "WKR-passend als personeelsvoorziening"  
**Impact:** Hoog — uniek fiscaal positioneringsargument in het B2B-segment.

### 1.3 Business Capabilities

| ID | Capability | Beschrijving | Volwassenheid | Bron |
|----|-----------|--------------|--------------|------|
| CAP-01 | Digitale Nalatenschap Vastlegging | Vastleggen testament-wensen, wilsverklaringen (euthanasie), donorregistratie, uitvaartwensen — kerndomein | Advanced | `src/Lumio.Api/Controllers/`: TestamentController, EuthanasieController, DonorController, UitvaartController |
| CAP-02 | Boedel & Financieel Beheer | Registreren van bezittingen, schulden, bankrekeningen, verzekeringen, crypto-wallets | Developing | `src/Lumio.Api/Controllers/BoedelController.cs`; `src/Lumio.Api/Domain/AssetRegistry/` |
| CAP-03 | Digitaal Bezit Beheer | Beheer digitale accounts, wachtwoorden, subscription-overzicht | Developing | `src/Lumio.Api/Controllers/DigitaalBezitController.cs`; `src/Lumio.Api/Domain/DigitalEstate/` |
| CAP-04 | Documentenbeheer | Uploaden en beheren van juridische/persoonlijke documenten (max 50 MB/bestand) | Basic | `src/Lumio.Api/Controllers/DocumentenController.cs`, `DocumentenBestandenController.cs` |
| CAP-05 | Videoboodschappen | Opnemen en opslaan van videoberichten voor nabestaanden (max 5 min) | Basic | `src/Lumio.Api/Controllers/VideoboodschappenController.cs`; `devdocs/deployment-urls.md` verwijst naar lokale videopslag |
| CAP-06 | Erfgenamen & Nahuwelijkse Zorg | Beheer erfgenamen (legitimaire portie berekening), noodcontacten | Developing | `src/Lumio.Api/Controllers/ErfgenamenController.cs`, `NoodcontactenController.cs` |
| CAP-07 | Shamir Secret Sharing Toegang | Nalatenschap-overdracht: nabestaanden krijgen elk een sleuteldeel — pas toegang bij gecombineerd minimum | Advanced | `src/Lumio.Api/Controllers/ShamirController.cs`; `SecretSharingDotNet` dependency; `devdocs/shamir-ux-test-protocol.md` |
| CAP-08 | Privacy-by-Design Encryptie | Volledig offline + AES-256 SQLCipher versleuteling per profiel, PBKDF2 100.000 iteraties | Advanced | `src/Lumio.Api/Rules/lumio-rules.json` encryptie-sectie; `documentation/technical-manual/NL/04-beveiliging.md` |
| CAP-09 | Multi-format Export | PDF, CSV, JSON, XML/NUV-formaat, encrypted backup | Developing | `src/Lumio.Api/Controllers/ExportController.cs`, `ExportCsvController.cs`, `ExportBackupController.cs`, `ExportDataController.cs` |
| CAP-10 | Actualisatie & Status Tracking | Completeness score per domeingebied, herinneringsintervallen (90d standaard, 365d testament) | Developing | `src/Lumio.Api/Rules/lumio-rules.json` actualisatieIntervallen; `src/Lumio.Api/Controllers/StatusController.cs`, `StatusActualisatieController.cs` |
| CAP-11 | Multi-Profiel Beheer | Tot 5 profielen per apparaat | Basic | `src/Lumio.Api/Rules/lumio-rules.json` limieten.maxProfielen=5 |
| CAP-12 | Whitelabel B2B Distributie | Volledig gebrandmerkte Electron-build per werkgever (CSS, iconen, naam, splaschscherm) | Developing | `tools/whitelabel/README.md`; `tools/build.ps1` |
| CAP-13 | Audit Logging | Interne audit trail (AuditLog entiteit, 90 d rotatie) | Basic | `src/Lumio.Api/Controllers/AuditLogController.cs`; `devdocs/data-retention-policy.md` §3.4 |
| CAP-14 | Full-text Zoeken | Domein-breed zoeken (min. 2 tekens) | Basic | `src/Lumio.Api/Controllers/ZoekenController.cs`; `lumio-rules.json` limieten.zoekenMinQueryLengte=2 |
| CAP-15 | AVG / DPIA Compliance | Uitdrukkelijke toestemming, cascade-delete, BSN-bescherming, DPIA goedgekeurd | Advanced | `devdocs/dpia-bijzondere-categorieen.md` v1.0 GOEDGEKEURD 2026-03-01; `devdocs/data-retention-policy.md` v1.1 |
| CAP-16 | Internationalisering (NL/EN) | Volledig tweetalig UI + backend .resx resources | Developing | `src/lumio-web/messages/`; `src/Lumio.Api/Resources/`; `documentation/technical-manual/NL/08-internationalisering.md` |

### 1.4 Wettelijke en Regulatory Context

**Bevinding:** Lumio verwerkt **bijzondere categorieën persoonsgegevens** (euthanasie-wensen, donorregistratie, gezondheidsgegevens) conform AVG art. 9. De DPIA is goedgekeurd op 2026-03-01 met als verwerkingsgrond art. 9 lid 2 sub a (uitdrukkelijke toestemming).  
**Bron:** `devdocs/dpia-bijzondere-categorieen.md` §1, §2.1  
**Impact:** Kritiek — non-compliance kan resulteren in boetes tot €20 miljoen of 4% van wereldwijde jaarlijkse omzet (AVG art. 83).

**Bevinding:** AVG **art. 17 (recht op vergetelheid)** is **NIET volledig geïmplementeerd**: er ontbreekt een expliciete `DELETE /api/profiel`-endpoint die alle eigenaar-data inclusief bestanden verwijdert. Dit is intern als TODO gedocumenteerd.  
**Bron:** `devdocs/data-retention-policy.md` §4, tabel rij "Verwijdering (vergetelheid)" — "TODO: frontend + API endpoint"  
**Impact:** Kritiek (zie GAP-001).

**Bevinding:** Het B2B-whitelabeling-model vereist een **verwerkersovereenkomst** tussen Lumio en de werkgever-distributeur. De DPIA benoemt dit als gezamenlijke verwerkersverantwoordelijkheid, maar er is geen standaard VWO-template aangetroffen.  
**Bron:** `devdocs/dpia-bijzondere-categorieen.md` §1.2 — "is de werkgever (als distributeur via het whitelabel-kanaal) gezamenlijk verantwoordelijke en dient een verwerkersovereenkomst of gezamenlijke verwerkersregeling te worden gesloten"  
**Impact:** Hoog — kan B2B-sales blokkeren bij grotere organisaties.

---

## 2. Gaps

### GAP-001 — AVG Art. 17 DELETE-Endpoint Ontbreekt (Recht op Vergetelheid)
- **Beschrijving:** Er is geen `DELETE /api/profiel`-endpoint dat alle eigenaar-data (inclusief bestanden op schijf) verwijdert en de database reset. Hierdoor kan een gebruiker niet volledig gebruikmaken van zijn recht op vergetelheid.
- **Bron:** `devdocs/data-retention-policy.md` §4, rij art. 17 — "TODO: frontend + API endpoint"
- **Risico als niet opgelost:** AVG-handhaving door AP; boete tot €20 miljoen of 4% jaaromzet; reputatieschade; obstakel voor B2B-verkoop aan compliance-bewuste organisaties
- **Prioriteit:** Kritiek

### GAP-002 — Audit Log Rotatie Niet Geautomatiseerd
- **Beschrijving:** De audit log moet na 90 dagen worden gewist conform het retentiebeleid, maar de uitvoering is handmatig of via een "TODO: achtergrondtaak". Er is geen automatische cleanup-mechanisme actief in de codebase.
- **Bron:** `devdocs/data-retention-policy.md` §3.4 — "TODO: achtergrondtaak in toekomstige sprint"
- **Risico als niet opgelost:** Schending opslagbeperking AVG art. 5 lid 1 sub e; data-ophoping in de database; bevindingen bij externe audit
- **Prioriteit:** Hoog

### GAP-003 — Geen Verwerkersovereenkomst-Template voor B2B
- **Beschrijving:** Het B2B-whitelabel-model vereist een verwerkersovereenkomst of gezamenlijke verwerkersregeling per werkgever-klant. Er is geen standaard VWO-template, geen proces en geen contractsflow beschikbaar.
- **Bron:** `devdocs/dpia-bijzondere-categorieen.md` §1.2
- **Risico als niet opgelost:** B2B-sales geblokkeerd bij compliance-afdelingen; aansprakelijkheidsrisico bij AVG-schending door werkgever
- **Prioriteit:** Hoog

### GAP-004 — Marketingsite Niet Live (DNS Pending)
- **Beschrijving:** De marketingsite is volledig ontwikkeld en in CI/CD opgenomen, maar het canonieke domein `www.lumio-legacy.nl` is nog niet actief door uitstaande DNS-configuratie.
- **Bron:** `devdocs/deployment-urls.md` — "STATUS: DNS PROPAGATIE AFWACHTEN"; acties 3–6 nog niet gereed
- **Risico als niet opgelost:** Geen organische vindbaarheid; geen SEO-indexering door Google; verlies van conversie-potentieel; B2B-prospects kunnen website niet bezoeken
- **Prioriteit:** Hoog

### GAP-005 — KPI-Tracking en Conversion Funnel Niet Ingericht
- **Beschrijving:** Er zijn geen meetbare bedrijfsmetrics beschikbaar: geen actieve gebruikersdata, geen conversieratio B2C/B2B, geen retentie- of churn-data. PostHog is aanwezig maar vereist DPO-goedkeuring en aanvullende activering voor productie.
- **Bron:** `devdocs/posthog-analytics.md` — Status tabel: Productie "Vereist instellen GitHub Secret + DPO-goedkeuring"; GUARD-006 constraints
- **Risico als niet opgelost:** Geen datagestuurd product-beslissingsproces; onmogelijkheid om ROI van verbeteringen te meten; investeerderspresentatie zonder basis
- **Prioriteit:** Hoog

### GAP-006 — Geen B2B Sales Proces Gedocumenteerd
- **Beschrijving:** Er is geen gedocumenteerd B2B sales cycle, offerte-proces, of implementatiepad voor werkgevers beschikbaar. De werkgevers-pagina is aanwezig, maar een end-to-end commercieel proces (lead → offerte → VWO → distributie → onboarding) ontbreekt.
- **Bron:** `site/src/app/werkgevers/page.tsx`; afwezigheid van CRM, lead-tracking, of offertetools in de codebase en devdocs
- **Risico als niet opgelost:** Inconsistente verkoopaanpak; langere sales cycles; afhankelijkheid van één persoon (founder)
- **Prioriteit:** Middelmatig

### GAP-007 — Geen Internationale Commercialisatie-Strategie
- **Beschrijving:** De applicatie is tweetalig (NL/EN) maar er is geen aanwijzing van een Engelstalige marktbenadering, internationale pricing of distributieplan. De marketingsite is volledig Nederlandstalig.
- **Bron:** `documentation/technical-manual/NL/08-internationalisering.md`; `site/src/app/` (alle routes NL-gericht); `README.md` (EN sectie aanwezig maar site niet EN)
- **Risico als niet opgelost:** Onbenutte marktexpansie-mogelijkheid; technische EN-investering zonder commerciële return
- **Prioriteit:** Laag

---

## 3. Risks

### RISK-001 — AVG Non-Compliance: Recht op Vergetelheid
- **Beschrijving:** Het ontbreken van het DELETE-endpoint maakt het product technisch non-compliant met AVG art. 17. Bij een klacht of controle door de AP is dit een aantoonbare tekortkoming.
- **Kans:** Hoog (is direct aantoonbaar bij audit)
- **Impact:** Hoog (boetes, reputatieschade, B2B-blokkering)
- **Risicoscore:** Kritiek
- **Mitigatie-opties:** Implementeer `DELETE /api/profiel` inclusief bestandssysteem-cleanup in eerstvolgende sprint (zie REC-001)
- **Bron:** GAP-001; `devdocs/data-retention-policy.md` §4

### RISK-002 — AVG Non-Compliance: Audit Log Opslagbeperking
- **Beschrijving:** Audit log entries worden niet automatisch gewist na 90 dagen. Bij gebruik op langere termijn groeit de AuditLog-tabel onbeperkt, in strijd met AVG art. 5 lid 1 sub e (opslagbeperking).
- **Kans:** Hoog (al aangemerkt als TODO in productie)
- **Impact:** Middelmatig (secundaire AVG-overtreding; geen directe high-profile risico maar cumulatief)
- **Risicoscore:** Hoog
- **Mitigatie-opties:** Implementeer achtergrondtaak (bijv. .NET `IHostedService`) voor automatische 90-daags rotatie (zie REC-002)
- **Bron:** GAP-002; `devdocs/data-retention-policy.md` §3.4

### RISK-003 — Business Continuity: One-Time Revenue Model zonder Recurring Income
- **Beschrijving:** Het eenmalig betaalmodel zonder abonnement of renewals creëert een direct afhankelijkheid van continue klantinstroom. Bij stagnatie van nieuwe sales is er geen recurring revenue-buffer.
- **Kans:** Middelmatig (voor een solo-founder product in een niche markt)
- **Impact:** Hoog (product-continuiteit, product-updates, support)
- **Risicoscore:** Hoog
- **Mitigatie-opties:**  UNCERTAIN: Potentiële toekomstige update/onderhoudsabonnement-laag; B2B-enterprise volume deals als stabilisator — vereist strategische keuze (zie REC-003)
- **Bron:** `site/src/app/prijzen/page.tsx`; afwezigheid van abonnementslogica in codebase
- `UNCERTAIN: Risicoscore is deels afhankelijk van huidige klantaantallen die niet beschikbaar zijn (zie INSUFFICIENT_DATA-001)`

### RISK-004 — B2B Blokkering door Ontbrekende Verwerkersovereenkomst
- **Beschrijving:** Compliance-afdelingen van grotere werkgevers (50+ medewerkers) zullen standaard een VWO vereisen voordat enig softwareproduct mag worden ingezet. Het ontbreken hiervan blokkeert de B2B-pipeline bij de target groep.
- **Kans:** Hoog (marktstandaard bij B2B-software)
- **Impact:** Hoog (volledige B2B-segment ontoegankelijk voor grotere klanten)
- **Risicoscore:** Hoog
- **Mitigatie-opties:** Maak een standaard VWO-template in samenwerking met een privacyadvocaat; beschikbaar stellen op werkgevers-pagina (zie REC-004)
- **Bron:** GAP-003; `devdocs/dpia-bijzondere-categorieen.md` §1.2

### RISK-005 — Markt Onbereikbaar: No Live Marketing Site
- **Beschrijving:** Zolang `www.lumio-legacy.nl` niet via DNS bereikbaar is, heeft het product geen publieke web-aanwezigheid. B2C-conversie en B2B-leads zijn niet mogelijk.
- **Kans:** Hoog (DNS-stap is uitstaand)
- **Impact:** Hoog (volledige go-to-market geblokkeerd)
- **Risicoscore:** Hoog
- **Mitigatie-opties:** Complete de DNS-configuratiestappen uit `devdocs/deployment-urls.md` (zie REC-005)
- **Bron:** GAP-004; `devdocs/deployment-urls.md`

---

## 4. KPI Baseline

| KPI | Huidige waarde | Bron | Meetmethode |
|-----|----------------|------|-------------|
| MRR (Monthly Recurring Revenue) | INSUFFICIENT_DATA: geen abonnement / geen data beschikbaar | — | Toekomstig: Stripe/Mollie dashboard |
| ARR (Annual Recurring Revenue) | INSUFFICIENT_DATA | — | — |
| Totaal verkochte licenties (B2C) | INSUFFICIENT_DATA | — | Toekomstig: betaalplatform |
| Totaal verkochte licenties (B2B) | INSUFFICIENT_DATA | — | Toekomstig: betaalplatform |
| CAC (Customer Acquisition Cost) | INSUFFICIENT_DATA | — | Toekomstig: ad spend ÷ conversies |
| LTV (Lifetime Value) | €125 max (één aankoop, geen renewals) | `site/src/app/prijzen/page.tsx` | Eenmalige aankoopprijs |
| Churn (B2C) | N.v.t. — geen abonnement | — | — |
| Churn (B2B) | N.v.t. — geen abonnement | — | — |
| Actieve gebruikers (DAU/MAU) | INSUFFICIENT_DATA | — | Toekomstig: PostHog na activering |
| Website conversieratio | INSUFFICIENT_DATA (site niet live) | — | Toekomstig: PostHog |
| B2B pipeline (aanvragen) | INSUFFICIENT_DATA | — | Toekomstig: CRM |
| Product completeness score (gemiddeld) | INSUFFICIENT_DATA | — | Toekomstig: `StatusController` analytics |

---

## 5. UNCERTAIN Items

- `UNCERTAIN: Erfbelasting-tarieven in lumio-rules.json zijn gedateerd op "2025-01-01"` — Reden: De applicatie bevat Nederlandse erfbelastingpercentages en vrijstellingen (Belastingdienst 2025). Het is onzeker of de tarieven per 2026 zijn bijgewerkt. — Escalatie: Domain Expert (02) verificeert actualiteit van fiscale regels.
- `UNCERTAIN: Exacte klantaantallen en omzetcijfers` — Reden: Niet beschikbaar in codebase of devdocs. — Escalatie: Stakeholder/founder input vereist voor Financial Analyst (04).

---

## 6. INSUFFICIENT_DATA Items

- `INSUFFICIENT_DATA: INSUF-001` — MRR/ARR/CAC/LTV-waarden — Ontbrekend: alle financiële performancemetrics — Gevolg: KPI Baseline volledig blanco; Financial Analyst (04) kan geen ROI-modellen bouwen zonder stakeholder-input
- `INSUFFICIENT_DATA: INSUF-002` — Actieve gebruikersaantallen — Ontbrekend: PostHog niet geactiveerd in productie; geen alternatieve analytics — Gevolg: Geen product-adoptie data beschikbaar voor Fase 1–2
- `INSUFFICIENT_DATA: INSUF-003` — B2B sales pipeline en klantenlijst — Ontbrekend: geen CRM of lead-tracker — Gevolg: Gap Analyse revenue-dimensie gebaseerd op structurele beoordeling, niet op data
- `INSUFFICIENT_DATA: INSUF-004` — Concurrenten-analyse / marktaandeel — Ontbrekend: geen marktonderzoek aangetroffen — Gevolg: Domain Expert (02) dient dit te onderzoeken

---

## AANBEVELINGEN

### REC-001 — Implementeer `DELETE /api/profiel` voor AVG Art. 17 Compliance
- **Verwijzing:** GAP-001, RISK-001
- **Beschrijving:** Implementeer een `DELETE /api/profiel/{id}`-endpoint dat cascade-deletes uitvoert op alle eigenaar-data, bestanden van schijf verwijdert en optioneel de database-file wist. Koppel een frontend "Profiel verwijderen"-functie in instellingen.
- **Impact — Risk Reductie:** Kritiek — sluit de enige bekende AVG art. 17 tekortkoming
- **Impact — Revenue:** INSUFFICIENT_DATA: Geen directe revenue-impact, maar verwijdert een B2B-blokkade
- **Impact — Cost:** Laag (eenmalige implementatie ~1 sprint)
- **Impact — UX:** Middelmatig — voegt een destructieve maar noodzakelijke actie toe aan de instellingen
- **Risico van niet-uitvoeren:** AVG-boete, negatieve persaandacht, onverkoopbaar aan compliance-bewuste werkgevers
- **SMART meetcriterium:**
  - KPI: "AVG art. 17 endpoint beschikbaar" — Target: `DELETE /api/profiel` geïmplementeerd en getest
  - Baseline: Niet aanwezig (2026-03-01)
  - Target: Aanwezig en getest voor einde Sprint BA-1
  - Meetmethode: Integratitest slaagt; handmatige verificatie bestandssysteem opgeruimd
  - Tijdshorizon: Sprint BA-1 (2 weken)
- **Prioriteit:** P1 | Impact: Hoog | Effort: Laag | Sprint: BA-1

### REC-002 — Automatiseer Audit Log Rotatie (90-daags)
- **Verwijzing:** GAP-002, RISK-002
- **Beschrijving:** Implementeer een `IHostedService` (.NET background service) die dagelijks audit log-entries ouder dan 90 dagen verwijdert conform het retentiebeleid. Controleer of de 90-dagentermijn in `lumio-rules.json` configureerbaar is.
- **Impact — Risk Reductie:** Hoog — sluit de AVG art. 5 lid 1 sub e opslagbeperkingsrisk
- **Impact — Revenue:** N.v.t.
- **Impact — Cost:** Laag (kleine background service)
- **Impact — UX:** Geen directe impact voor de gebruiker
- **Risico van niet-uitvoeren:** Cumulatieve AVG-overtreding bij langdurig gebruik; data-ophoping
- **SMART meetcriterium:**
  - KPI: "Audit log laatste cleanup datum" — Target: Dagelijkse achtergrondtaak draait aantoonbaar
  - Baseline: Handmatig / niet geautomatiseerd
  - Target: Geautomatiseerd, aantoonbaar via AuditLog-count na 90+ dagen
  - Meetmethode: Integratietest simuleert records ouder dan 90 dagen en verifieert verwijdering
  - Tijdshorizon: Sprint BA-1
- **Prioriteit:** P1 | Impact: Hoog | Effort: Laag | Sprint: BA-1

### REC-003 — Maak Standaard Verwerkersovereenkomst-Template voor B2B
- **Verwijzing:** GAP-003, RISK-004
- **Beschrijving:** Stel een standaard VWO-template op (conform AVG art. 28) in samenwerking met een privacyadvocaat. Publiceer op de werkgevers-pagina als downloadbaar PDF. Definieer een helder B2B-onboardingproces inclusief VWO-signing.
- **Impact — Risk Reductie:** Hoog — verwijdert juridische blokkade bij compliance-afdelingen
- **Impact — Revenue:** Hoog — opent B2B-segment voor grotere organisaties
- **Impact — Cost:** INSUFFICIENT_DATA: Kosten privacyadvocaat onbekend
- **Impact — UX:** Laag — alleen relevant voor B2B-kopers
- **Risico van niet-uitvoeren:** B2B-pipeline stagnatie; aansprakelijkheid bij B2B-incident
- **SMART meetcriterium:**
  - KPI: "VWO beschikbaar op werkgevers-pagina" — Target: downloadbaar template aanwezig
  - Baseline: Niet aanwezig
  - Target: Beschikbaar vóór eerste B2B-deal >25 medewerkers
  - Meetmethode: Aanwezig op website + ondertekend door eerste B2B-klant
  - Tijdshorizon: Sprint BA-2 (4 weken)
- **Prioriteit:** P1 | Impact: Hoog | Effort: Middelmatig | Sprint: BA-2
- `OUT_OF_SCOPE: Legal — advies specifieke VWO-inhoud → externe jurist; structuur/publicatie valt binnen dit domein`

### REC-004 — Voer DNS-Configuratie Door en Activeer Marketing Site
- **Verwijzing:** GAP-004, RISK-005
- **Beschrijving:** Voltooi de DNS-configuratiestappen voor `www.lumio-legacy.nl` conform `devdocs/deployment-urls.md` (stap 3–6). Voer Search Console-registratie en sitemap-inzending uit na activering.
- **Impact — Revenue:** Kritiek voor go-to-market — zonder live site is acquisitie onmogelijk
- **Impact — Risk Reductie:** Hoog — verwijdert go-to-market blokkade
- **Impact — Cost:** Nihil (DNS-aanpassing is geen software-wijziging)
- **Impact — UX:** N.v.t.
- **Risico van niet-uitvoeren:** Geen organische klantacquisitie; SEO-vertraging; product onvindbaar
- **SMART meetcriterium:**
  - KPI: "www.lumio-legacy.nl bereikbaar via HTTPS" — Target: 200 OK op canonieke URL
  - Baseline: Site niet bereikbaar op canonieke URL (2026-03-01)
  - Target: Bereikbaar, HTTPS actief, Google Search Console geregistreerd
  - Meetmethode: `curl -I https://www.lumio-legacy.nl` retourneert 200; GSC gewenst
  - Tijdshorizon: Sprint BA-1 (deze week)
- **Prioriteit:** P1 | Impact: Hoog | Effort: Laag | Sprint: BA-1

### REC-005 — Activeer PostHog Analytics met DPO-Goedkeuring voor KPI-Meting
- **Verwijzing:** GAP-005
- **Beschrijving:** Vraag DPO-goedkeuring aan voor PostHog-activering in productie. Stel de GitHub Secrets in en implementeer minimale funnel-events (app-start, profiel-aangemaakt, completeness-score-bereikt). Blokkeer implementatie zonder DPO-akkoord.
- **Impact — Revenue:** Hoog — maakt datagestuurd product-management mogelijk
- **Impact — Risk Reductie:** Middelmatig — compliance-gated activering
- **Impact — Cost:** Laag (PostHog free tier beschikbaar)
- **Impact — UX:** Nihil voor eindgebruiker (GUARD-006: no auto-capture, no session recording)
- **Risico van niet-uitvoeren:** Productontwikkeling zonder gebruiksdata; onmogelijkheid om REC-ROI te bewijzen
- **SMART meetcriterium:**
  - KPI: "PostHog events actief in productie" — Target: ≥3 key events getrackt
  - Baseline: Uitgeschakeld
  - Target: DPO-akkoord + GitHub Secrets ingesteld + ≥3 events actief
  - Meetmethode: PostHog dashboard toont events vanuit productiebuild
  - Tijdshorizon: Sprint BA-2
- **Prioriteit:** P2 | Impact: Hoog | Effort: Laag | Sprint: BA-2

### REC-006 — Definieer B2B Sales Cycle en Implementeer Eenvoudig Lead-Proces
- **Verwijzing:** GAP-006
- **Beschrijving:** Documenteer de end-to-end B2B sales cycle (lead → contact → demo → offerte → VWO → distributie → onboarding). Implementeer een simpel lead-formulier op de werkgevers-pagina en een gestructureerd opvolgproces (bijv. Notion CRM of HubSpot free tier).
- **Impact — Revenue:** Hoog — gestructureerd B2B-proces verkort sales cycles
- **Impact — Risk Reductie:** Middelmatig — vermindert founder-afhankelijkheid
- **Impact — Cost:** INSUFFICIENT_DATA: CRM-tool kosten afhankelijk van keuze (free tiers beschikbaar)
- **Impact — UX:** Laag — alleen B2B-buyer journey
- **Risico van niet-uitvoeren:** Niet-schaalbare B2B-acquisitie; leads vallen weg bij hoog volume
- **SMART meetcriterium:**
  - KPI: "B2B leads per maand" — Target: ≥5 leads/maand na go-live site
  - Baseline: INSUFFICIENT_DATA
  - Target: ≥5 B2B-aanvragen per maand (na site live-gang)
  - Meetmethode: CRM-dashboard + contactformulier-submissions
  - Tijdshorizon: Sprint BA-2
- **Prioriteit:** P2 | Impact: Hoog | Effort: Middelmatig | Sprint: BA-2

---

## PRIORITEITENMATRIX (IMPACT × EFFORT)

```
                LAGE EFFORT          HOGE EFFORT
               ┌─────────────────┬──────────────────┐
HOGE IMPACT    │ KWADRANT 1      │ KWADRANT 2       │
(Quick wins)   │ REC-001 (AVG17) │ REC-003 (VWO)    │
               │ REC-002 (Audit) │ REC-006 (Sales)  │
               │ REC-004 (DNS)   │                  │
               │ REC-005 (PH)    │                  │
               ├─────────────────┼──────────────────┤
LAGE IMPACT    │ KWADRANT 3      │ KWADRANT 4       │
(Nice-to-have) │ (geen items)    │ (geen items)     │
               └─────────────────┴──────────────────┘
```

**Toelichting:** Alle zes aanbevelingen vallen in Kwadrant 1 of 2. Er zijn geen Kwadrant 3 of 4 items — het product is functioneel volwassen maar kent kritieke compliance- en go-to-market-blockers die prioriteit vereisen.

---

## SPRINTPLAN

### Aannames (VERPLICHT GEDOCUMENTEERD VOOR SPRINTPLAN)

**Teams:**

| Team | Samenstelling | Capaciteit |
|------|--------------|-----------|
| Team Techniek | INSUFFICIENT_DATA: op basis van `package.json` author-veld is dit vermoedelijk 1 full-stack developer (Robert Agterhuis). Exacte teamgrootte en beschikbaarheid zijn niet documenteerbaar zonder stakeholder-input. Aanname: 1 FTE full-stack, 10 SP/sprint (conservatief voor solo developer) — **markeer als INSUFFICIENT_DATA, wordt bevestigd door stakeholder** | INSUFFICIENT_DATA: 10 SP/sprint (aanname — stakeholder bevestiging vereist) |
| Team Business/Ops | INSUFFICIENT_DATA: Geen aparte business- of ops-rol aangetroffen. Aanname: founder vervult ook product owner + DPO rol | INSUFFICIENT_DATA |

**Sprint duur:** 2 weken (standaard conform systeem-default)  
**Stack (relevant voor dit sprintplan):** .NET 10, ASP.NET Core, EF Core, Next.js 15, Electron 35  
**Randvoorwaarden Sprint BA-1:**  
- DNS-toegang tot registrar `lumio-legacy.nl` (voor REC-004) — eigenaar: founder
- DPO beschikbaar voor VWO-advies (voor REC-003 in BA-2)

---

### Sprint BA-1 — "AVG-Compliance Fundament + Go-to-Market Opening"

**Sprint Doel:** Na afloop van Sprint BA-1 is het product AVG art. 17 compliant, de audit log rotatieautomatisering actief, en de marketingsite live op het canonieke domein.

**KPI-targets Sprint BA-1:**
- `DELETE /api/profiel` integratietest slaagt ✓
- AuditLog achtergrondtaak aantoonbaar actief ✓
- `https://www.lumio-legacy.nl` bereikbaar, HTTP 200 ✓

**Definition of Done:**
- Alle stories IMPLEMENTED of BLOCKED met escalatie
- Tests geslaagd voor CODE-stories
- KPI-meting uitgevoerd
- Geen nieuwe CRITICAL_FINDING geïntroduceerd
- Alle INTERN-blockers opgelost

---

#### SP-BA1-001 — AVG Art. 17 DELETE-Endpoint

| Veld | Waarde |
|------|--------|
| **Beschrijving** | Als gebruiker wil ik mijn profiel volledig kunnen verwijderen (inclusief alle data en bestanden) zodat mijn recht op vergetelheid (AVG art. 17) wordt gewaarborgd |
| **Team** | Team Techniek |
| **Story type** | CODE |
| **Story points** | 3 SP |
| **Aanbeveling-referentie** | REC-001 |
| **Afhankelijkheden** | SP-BA1-002 (audit log cleanup-service kan helpen bij testen van cascade), SP-BA1-003 (DNS) — geen blokkerende afhankelijkheid |
| **Blocker** | NONE |

**Acceptatiecriteria:**
- Gegeven een geauthenticeerde gebruiker, wanneer `DELETE /api/profiel/{id}` wordt aangeroepen met geldig token, dan worden alle eigenaar-gerelateerde records cascade-gewist uit de database
- Gegeven een profiel met geüploade bestanden (documenten, video's), wanneer het profiel wordt verwijderd, dan zijn alle bijhorende bestanden van het bestandssysteem verwijderd
- Gegeven een voltooide DELETE, wanneer de database wordt geïnspecteerd, dan zijn GEEN resteringen gevonden in de Eigenaren-tabel of gekoppelde tabellen
- Gegeven de frontend instellingen-pagina, wanneer de gebruiker "Profiel verwijderen" selecteert, dan wordt een bevestigingsdialoog getoond met duidelijke waarschuwing voor onomkeerbaarheid

---

#### SP-BA1-002 — Audit Log Achtergrond-Rotatie

| Veld | Waarde |
|------|--------|
| **Beschrijving** | Als systeem wil ik automatisch audit log entries ouder dan 90 dagen verwijderen zodat de opslagbeperking conform AVG art. 5 lid 1 sub e wordt nageleefd |
| **Team** | Team Techniek |
| **Story type** | CODE |
| **Story points** | 2 SP |
| **Aanbeveling-referentie** | REC-002 |
| **Afhankelijkheden** | NONE |
| **Blocker** | NONE |

**Acceptatiecriteria:**
- Gegeven de applicatie is gestart, wanneer de achtergrondtaak draait, dan worden AuditLog-records ouder dan 90 dagen verwijderd
- Gegeven een geconfigureerde retentietermijn in `lumio-rules.json` (`auditLogRetentieDagen` of gelijkwaardig), wanneer de waarde wordt aangepast, dan hanteert de achtergrondtaak de nieuwe waarde
- Gegeven een integratietest met testrecords > 90 dagen oud, wanneer de taak wordt uitgevoerd, dan worden alleen de overlimit-records verwijderd en recente records bewaard
- Gegeven de applicatie draait, wanneer de log wordt geïnspecteerd via Serilog, dan is een logmelding aanwezig na elke uitvoering met het aantal verwijderde records

---

#### SP-BA1-003 — DNS Activering Marketingsite

| Veld | Waarde |
|------|--------|
| **Beschrijving** | Als potentiële klant wil ik `www.lumio-legacy.nl` kunnen bezoeken zodat ik informatie over Lumio kan vinden en het product kan aanschaffen |
| **Team** | Team Business/Ops |
| **Story type** | INFRA |
| **Story points** | 1 SP |
| **Aanbeveling-referentie** | REC-004 |
| **Afhankelijkheden** | NONE |
| **Blocker** | EXTERN: DNS-toegang bij registrar lumio-legacy.nl vereist \| eigenaar: founder (Robert Agterhuis) \| escalatie: als DNS-toegang niet beschikbaar is, blokkeert story tot volgende sprint |

**Acceptatiecriteria:**
- Gegeven de CNAME-record `www → <org>.github.io` is ingesteld bij de registrar, wanneer DNS is gepropageerd (max 24u), dan is `https://www.lumio-legacy.nl` bereikbaar met HTTP 200
- Gegeven de site live is, wanneer Google Search Console wordt geopend, dan is de site geregistreerd en de sitemap-URL `https://www.lumio-legacy.nl/sitemap.xml` ingezonden
- Gegeven de site live is, wanneer `https://www.lumio-legacy.nl` wordt bezocht, dan is HTTPS actief en het certificaat geldig

---

### Sprint BA-2 — "B2B Enablement + Datagedreven Product-Fundament"

**Sprint Doel:** Na Sprint BA-2 is de B2B pipeline-blokkade (VWO) opgeheven, is PostHog actief voor product-analytics, en is een gedocumenteerd B2B-salesproces beschikbaar.

**KPI-targets Sprint BA-2:**
- VWO-template beschikbaar op werkgevers-pagina ✓
- PostHog min. 3 key events actief in productie ✓
- B2B leadformulier operationeel ✓

**Definition of Done:** zelfde als Sprint BA-1

---

#### SP-BA2-001 — Verwerkersovereenkomst Template Publiceren

| Veld | Waarde |
|------|--------|
| **Beschrijving** | Als werkgever-klant wil ik een standaard verwerkersovereenkomst kunnen downloaden zodat ik Lumio kan inzetten zonder eigen juridisch onderzoek |
| **Team** | Team Business/Ops |
| **Story type** | CONTENT |
| **Story points** | 3 SP |
| **Aanbeveling-referentie** | REC-003 |
| **Afhankelijkheden** | NONE |
| **Blocker** | EXTERN: Juridische review VWO-tekst vereist door privacyadvocaat \| eigenaar: DPO (founder) \| escalatie: juridische review kan in parallel lopen met site-publicatie; publiceer pas na review |

**Acceptatiecriteria:**
- Gegeven de werkgevers-pagina, wanneer een werkgever deze bezoekt, dan is een downloadlink voor een VWO-template zichtbaar als PDF
- Gegeven de VWO inhoud, wanneer gereviewed door DPO, dan is de inhoud conform AVG art. 28 vereisten (verplichte clausules aanwezig)
- Gegeven het B2B-onboardingproces, wanneer een werkgever de VWO downloadt, dan is er een duidelijk contact/signing-instructie aanwezig

---

#### SP-BA2-002 — PostHog Activeren in Productie

| Veld | Waarde |
|------|--------|
| **Beschrijving** | Als product owner wil ik gebruiksdata ontvangen vanuit de Lumio-applicatie zodat ik product-beslissingen kan nemen op basis van data |
| **Team** | Team Techniek |
| **Story type** | INFRA |
| **Story points** | 2 SP |
| **Aanbeveling-referentie** | REC-005 |
| **Afhankelijkheden** | NONE |
| **Blocker** | INTERN: DPO-goedkeuring voor PostHog-activering in productie vereist (conform `devdocs/posthog-analytics.md`) \| eigenaar: DPO (founder) |

**Acceptatiecriteria:**
- Gegeven DPO-goedkeuring voor productie-analytics, wanneer de Next.js build wordt gemaakt met `NEXT_PUBLIC_POSTHOG_KEY` ingesteld, dan worden events verstuurd naar PostHog EU-regio
- Gegeven de GUARD-006 constraints, wanneer PostHog actief is, dan zijn `autocapture: false` en `disable_session_recording: true` gehandhaafd
- Gegeven de productie-applicatie, wanneer een gebruiker een nieuw profiel aanmaakt, dan wordt een `profiel_aangemaakt`-event gelogd in PostHog zonder PII
- Gegeven de productie-applicatie, wanneer een gebruiker een completeness-drempel bereikt (bijv. 80%), dan wordt een `completeness_mijlpaal`-event gelogd

---

#### SP-BA2-003 — B2B Lead Formulier en Sales Proces Documentatie

| Veld | Waarde |
|------|--------|
| **Beschrijving** | Als werkgever wil ik een aanvraagformulier invullen zodat ik snel een offerte kan ontvangen voor Lumio-licenties voor mijn organisatie |
| **Team** | Team Techniek + Team Business/Ops |
| **Story type** | CODE |
| **Story points** | 3 SP |
| **Aanbeveling-referentie** | REC-006 |
| **Afhankelijkheden** | SP-BA1-003 (DNS live — site bereikbaar) |
| **Blocker** | NONE |

**Acceptatiecriteria:**
- Gegeven de werkgevers-pagina, wanneer een prospect het contactformulier invult (naam, organisatie, aantal medewerkers, email), dan ontvangt de founder/sales een notificatie via email
- Gegeven een ingevuld formulier, wanneer verzonden, dan ontvangt de prospect een bevestigingsmail met volgende stappen
- Gegeven het sales-proces, wanneer gedocumenteerd in een intern doc (bijv. Notion), dan zijn alle stappen (lead → offerte → VWO → distributie → onboarding) beschreven met verantwoordelijke en tijdlijn

---

### Parallelle Tracks Sprint BA-1

| Track | Stories | Team | Startvoorwaarde |
|-------|---------|------|----------------|
| Track A — AVG Implementatie | SP-BA1-001, SP-BA1-002 | Team Techniek | Geen — kan direct starten |
| Track B — Go-to-Market | SP-BA1-003 | Team Business/Ops | DNS-toegang bij registrar |

**Parallel mogelijk:** Track A en Track B zijn volledig onafhankelijk en kunnen simultaan lopen.

### Blocker Register Sprint BA-1

| ID | Story | Type | Beschrijving | Eigenaar | Escalatieroute |
|----|-------|------|--------------|----------|----------------|
| BLK-BA1-001 | SP-BA1-003 | EXTERN | DNS-toegang bij registrar lumio-legacy.nl | Founder | Als DNS-configuratie niet mogelijk is in sprint BA-1: doorschuiven naar BA-2; go-to-market vertraging documenteren als CRITICAL_FINDING |

### Parallelle Tracks Sprint BA-2

| Track | Stories | Team | Startvoorwaarde |
|-------|---------|------|----------------|
| Track A — Legal/Content | SP-BA2-001 | Team Business/Ops | Privacyadvocaat beschikbaar |
| Track B — Analytics | SP-BA2-002 | Team Techniek | DPO-goedkeuring |
| Track C — Sales | SP-BA2-003 | Beide teams | SP-BA1-003 afgerond (site live) |

### Blocker Register Sprint BA-2

| ID | Story | Type | Beschrijving | Eigenaar | Escalatieroute |
|----|-------|------|--------------|----------|----------------|
| BLK-BA2-001 | SP-BA2-001 | EXTERN | Juridische review VWO-tekst | Privacyadvocaat | Founders schakelt advocaat in; als niet beschikbaar in BA-2: VWO zonder juridische review NIET publiceren — doorschuiven naar BA-3 |
| BLK-BA2-002 | SP-BA2-002 | INTERN | DPO-goedkeuring PostHog productie | DPO (founder) | DPO keurt goed vóór sprint-start BA-2; anders story BLOCKED tot goedkeuring |

---

## GUARDRAILS

### GUARD-BA-001 — AVG Art. 17 DELETE Verplicht Vóór B2B Sales aan >10 Medewerkers Organisaties

- **Formulering:** Lumio mag NIET worden aangeboden of gedistribueerd aan B2B-klanten met meer dan 10 medewerkers zolang `DELETE /api/profiel` niet is geïmplementeerd en getest.
- **Scope:** Sales, Business Development, Product Launch
- **Verwijzing:** GAP-001, RISK-001
- **Schending-actie:** Markeer als `GUARDRAIL_VIOLATION: GUARD-BA-001`; blokkeer contracttekening; escaleer naar DPO en founder
- **Verificatiemethode:** Pre-release checklist in `devdocs/data-retention-policy.md` moet GUARD-BA-001 bevatten als checkpoint; implementatie-agent verifieert endpoint aanwezig vóór release
- **Overlap check:** Nieuw (aanvulling op bestaande GUARD-001 in data-retention-policy.md)

### GUARD-BA-002 — Audit Log Retentie Mag Niet Handmatig Zijn in Productie

- **Formulering:** Lumio mag NIET worden aangeboden aan betalende klanten zonder een actieve, geautomatiseerde audit log rotatie (90 dagen conform retentiebeleid).
- **Scope:** Release-proces, implementatie
- **Verwijzing:** GAP-002, RISK-002
- **Schending-actie:** Markeer als `GUARDRAIL_VIOLATION: GUARD-BA-002`; blokkeer productie-release; documenteer als CRITICAL_FINDING
- **Verificatiemethode:** Integratietest in CI/CD verifieert dat achtergrondtaak aanwezig is; test controleert rotatie-gedrag
- **Overlap check:** Nieuw (aanvulling op GUARD-001 data-retention)

### GUARD-BA-003 — B2B Deal Vereist Ondertekende VWO Vóór Softwarelevering

- **Formulering:** Lumio mag NIET worden geleverd (installer, licentie-sleutel, whitelabel-build) aan een werkgever zolang geen verwerkersovereenkomst is ondertekend.
- **Scope:** B2B Sales
- **Verwijzing:** GAP-003, RISK-004
- **Schending-actie:** Markeer als `GUARDRAIL_VIOLATION: GUARD-BA-003`; blokkeer levering; escaleer naar DPO
- **Verificatiemethode:** B2B-checklist in verkoop-/administratieproces; VWO-signing is harde gate vóór distributie
- **Overlap check:** Nieuw; aanvulling op DPIA §1.2

### GUARD-BA-004 — ProductAnalytics Vereist DPO-Akkoord Vóór Productie-Activering

- **Formulering:** PostHog of enige andere analytics-tool mag NIET worden geactiveerd in productie-builds zonder gedocumenteerde DPO-goedkeuring.
- **Scope:** Analytics, Engineering, Release
- **Verwijzing:** GAP-005; `devdocs/posthog-analytics.md` GUARD-006
- **Schending-actie:** Markeer als `GUARDRAIL_VIOLATION: GUARD-BA-004`; bouw analytics-activering uit productie-build; escaleer naar DPO
- **Verificatiemethode:** CI/CD controleert: als `NEXT_PUBLIC_POSTHOG_KEY` aanwezig en DPO-sign-off niet aanwezig in devdocs → bouw mislukt
- **Overlap check:** Aanvulling op `GUARD-006` (die GUARD-006 constraints beperkt maar geen go/no-go definieert)

---

## JSON EXPORT

```json
{
  "capabilities": [
    { "id": "CAP-01", "name": "Digitale Nalatenschap Vastlegging", "maturity": "Advanced" },
    { "id": "CAP-02", "name": "Boedel & Financieel Beheer", "maturity": "Developing" },
    { "id": "CAP-03", "name": "Digitaal Bezit Beheer", "maturity": "Developing" },
    { "id": "CAP-04", "name": "Documentenbeheer", "maturity": "Basic" },
    { "id": "CAP-05", "name": "Videoboodschappen", "maturity": "Basic" },
    { "id": "CAP-06", "name": "Erfgenamen & Nahuwelijkse Zorg", "maturity": "Developing" },
    { "id": "CAP-07", "name": "Shamir Secret Sharing Toegang", "maturity": "Advanced" },
    { "id": "CAP-08", "name": "Privacy-by-Design Encryptie", "maturity": "Advanced" },
    { "id": "CAP-09", "name": "Multi-format Export", "maturity": "Developing" },
    { "id": "CAP-10", "name": "Actualisatie & Status Tracking", "maturity": "Developing" },
    { "id": "CAP-11", "name": "Multi-Profiel Beheer", "maturity": "Basic" },
    { "id": "CAP-12", "name": "Whitelabel B2B Distributie", "maturity": "Developing" },
    { "id": "CAP-13", "name": "Audit Logging", "maturity": "Basic" },
    { "id": "CAP-14", "name": "Full-text Zoeken", "maturity": "Basic" },
    { "id": "CAP-15", "name": "AVG / DPIA Compliance", "maturity": "Advanced" },
    { "id": "CAP-16", "name": "Internationalisering (NL/EN)", "maturity": "Developing" }
  ],
  "business_rules": [
    { "id": "BR-001", "description": "Max 5 profielen per apparaat", "type": "Operational", "impl": "Configureerbaar (lumio-rules.json limieten.maxProfielen=5)", "source": "src/Lumio.Api/Rules/lumio-rules.json:63" },
    { "id": "BR-002", "description": "Wachtwoord minimaal 8 karakters", "type": "Operational", "impl": "Configureerbaar (lumio-rules.json wachtwoordMinLengte=8)", "source": "src/Lumio.Api/Rules/lumio-rules.json:64" },
    { "id": "BR-003", "description": "Shamir minimale drempelwaarde 2 sleutels", "type": "Core Business Rule", "impl": "Configureerbaar (lumio-rules.json shamirMinDrempel=2)", "source": "src/Lumio.Api/Rules/lumio-rules.json:65" },
    { "id": "BR-004", "description": "Backup geldt als verouderd na 30 dagen", "type": "Operational", "impl": "Configureerbaar (lumio-rules.json backupVerouderdDagen=30)", "source": "src/Lumio.Api/Rules/lumio-rules.json:66" },
    { "id": "BR-005", "description": "Actualisatie-herinneringsintervallen per domein (90d standaard, 365d testament, 730d wilsverklaring)", "type": "Core Business Rule", "impl": "Configureerbaar (lumio-rules.json actualisatieIntervallen)", "source": "src/Lumio.Api/Rules/lumio-rules.json:72-80" },
    { "id": "BR-006", "description": "Wilsverklaring-herbevestiging verplicht na 1825 dagen (5 jaar)", "type": "Regulatory", "impl": "Configureerbaar (lumio-rules.json wilsverklaringHerbevestigingDagen=1825)", "source": "src/Lumio.Api/Rules/lumio-rules.json:83" },
    { "id": "BR-007", "description": "Video maximaal 300 seconden (5 minuten)", "type": "Operational", "impl": "Configureerbaar (lumio-rules.json videoMaxDuurSeconden=300)", "source": "src/Lumio.Api/Rules/lumio-rules.json:69" },
    { "id": "BR-008", "description": "Foto max 10 MB, document max 50 MB", "type": "Operational", "impl": "Configureerbaar (lumio-rules.json fotoMaxBytes=10485760, documentMaxBytes=52428800)", "source": "src/Lumio.Api/Rules/lumio-rules.json:67-68" },
    { "id": "BR-009", "description": "Audit log maximum 200 items per query; rotatie na 90 dagen", "type": "Regulatory", "impl": "Gedeeltelijk configureerbaar; rotatie is handmatig (TODO)", "source": "src/Lumio.Api/Rules/lumio-rules.json:70; devdocs/data-retention-policy.md §3.4" },
    { "id": "BR-010", "description": "PBKDF2 100.000 iteraties, salt 32 bytes, AES-256-GCM", "type": "Core Business Rule", "impl": "Configureerbaar (lumio-rules.json encryptie-sectie)", "source": "src/Lumio.Api/Rules/lumio-rules.json:91-97" },
    { "id": "BR-011", "description": "Nederlandse erfbelasting 2025: partner vrijstelling €795.156, kind €25.187, Tariefgroep 1 schijf 10%/20%", "type": "Regulatory", "impl": "Configureerbaar (lumio-rules.json erfbelasting)", "source": "src/Lumio.Api/Rules/lumio-rules.json:8-50; UNCERTAIN: actualiteit 2026 niet bevestigd" },
    { "id": "BR-012", "description": "BSN validatie via mod-11 elf-proef", "type": "Regulatory", "impl": "Hardcoded in validators", "source": "devdocs/data-retention-policy.md §3.2; EigenaarUpsertRequestValidator, ErfgenaamUpsertRequestValidator" },
    { "id": "BR-013", "description": "Zoekopdracht minimaal 2 karakter", "type": "Operational", "impl": "Configureerbaar (lumio-rules.json zoekenMinQueryLengte=2)", "source": "src/Lumio.Api/Rules/lumio-rules.json:71" },
    { "id": "BR-014", "description": "Completeness score caps: digitaalBezit=3, documenten=3, erfgenamen=2, noodcontacten=2", "type": "Core Business Rule", "impl": "Configureerbaar (lumio-rules.json compleetheid)", "source": "src/Lumio.Api/Rules/lumio-rules.json:104-114" },
    { "id": "BR-015", "description": "Legitimatiebewijs verloopwaarschuwing: 180 dagen van tevoren", "type": "Operational", "impl": "Configureerbaar (lumio-rules.json legitimatieVerloopWaarschuwingDagen=180)", "source": "src/Lumio.Api/Rules/lumio-rules.json:82" }
  ],
  "risk_assessment": [
    { "id": "RISK-001", "title": "AVG Non-Compliance: Recht op Vergetelheid", "score": "Kritiek", "chance": "Hoog", "impact": "Hoog" },
    { "id": "RISK-002", "title": "AVG Non-Compliance: Audit Log Opslagbeperking", "score": "Hoog", "chance": "Hoog", "impact": "Middelmatig" },
    { "id": "RISK-003", "title": "Business Continuity: One-Time Revenue zonder Recurring Income", "score": "Hoog", "chance": "Middelmatig", "impact": "Hoog" },
    { "id": "RISK-004", "title": "B2B Blokkering door Ontbrekende Verwerkersovereenkomst", "score": "Hoog", "chance": "Hoog", "impact": "Hoog" },
    { "id": "RISK-005", "title": "Markt Onbereikbaar: No Live Marketing Site", "score": "Hoog", "chance": "Hoog", "impact": "Hoog" }
  ],
  "kpi_baseline": {
    "mrr": "INSUFFICIENT_DATA",
    "arr": "INSUFFICIENT_DATA",
    "cac": "INSUFFICIENT_DATA",
    "ltv": "€125 (eenmalig, perpetual license)",
    "churn": "N.v.t. (geen abonnement)",
    "active_users": "INSUFFICIENT_DATA",
    "b2c_licenses_sold": "INSUFFICIENT_DATA",
    "b2b_licenses_sold": "INSUFFICIENT_DATA",
    "website_conversion_rate": "INSUFFICIENT_DATA"
  },
  "gap_analysis": {
    "market": [
      { "id": "GAP-004", "description": "Marketingsite niet live — geen publieke web-aanwezigheid", "priority": "Hoog" },
      { "id": "GAP-007", "description": "Geen internationale commercialisatie-strategie ondanks EN-documentatie", "priority": "Laag" }
    ],
    "product": [
      { "id": "GAP-001", "description": "AVG Art. 17 DELETE-endpoint ontbreekt", "priority": "Kritiek" },
      { "id": "GAP-002", "description": "Audit log rotatie niet geautomatiseerd", "priority": "Hoog" }
    ],
    "revenue": [
      { "id": "GAP-005", "description": "Geen KPI-tracking of conversie funnel", "priority": "Hoog" },
      { "id": "GAP-006", "description": "Geen gedocumenteerd B2B sales proces", "priority": "Middelmatig" }
    ],
    "operations": [
      { "id": "GAP-003", "description": "Geen VWO-template voor B2B-distributie", "priority": "Hoog" }
    ]
  },
  "priority_matrix": [
    { "id": "REC-001", "impact": "Hoog", "effort": "Laag", "quadrant": 1, "priority": "P1", "sprint": "BA-1" },
    { "id": "REC-002", "impact": "Hoog", "effort": "Laag", "quadrant": 1, "priority": "P1", "sprint": "BA-1" },
    { "id": "REC-003", "impact": "Hoog", "effort": "Middelmatig", "quadrant": 2, "priority": "P1", "sprint": "BA-2" },
    { "id": "REC-004", "impact": "Hoog", "effort": "Laag", "quadrant": 1, "priority": "P1", "sprint": "BA-1" },
    { "id": "REC-005", "impact": "Hoog", "effort": "Laag", "quadrant": 1, "priority": "P2", "sprint": "BA-2" },
    { "id": "REC-006", "impact": "Hoog", "effort": "Middelmatig", "quadrant": 2, "priority": "P2", "sprint": "BA-2" }
  ]
}
```

---

## HANDOFF CHECKLIST – Business Analyst – 2026-03-01

- [x] Input inventarisatie volledig gedocumenteerd
- [x] Business Capability Map compleet (16 capabilities, bronnen aanwezig)
- [x] Business Rules Inventory compleet (15 rules, alle met bron)
- [x] Revenue Model gedocumenteerd (€125 perpetual, B2C + B2B, WKR-passend)
- [x] Gap Analyse op alle 4 dimensies compleet (Markt, Product, Revenue, Operations)
- [x] KPI Baseline gedocumenteerd (alle INSUFFICIENT_DATA: expliciet gemarkeerd)
- [x] Prioriteitenmatrix ingevuld met concrete items (6 aanbevelingen, kwadrant bepaald)
- [x] Alle bevindingen hebben bronvermelding
- [x] Alle UNCERTAIN: items zijn gedocumenteerd (2 items)
- [x] Alle INSUFFICIENT_DATA: items zijn gedocumenteerd en geëscaleerd (4 items INSUF + 9 KPI velden)
- [x] JSON export aanwezig en syntactisch valide
- [x] Geen lege secties of placeholders
- [x] Geen aanbevelingen buiten domein (1 OUT_OF_SCOPE: gemarkeerd bij REC-003)
- [x] Global guardrails nageleefd
- [x] Business guardrails nageleefd (G-BUS-01 t/m G-BUS-08 gecontroleerd)
- [x] Zelfcontrole uitgevoerd (output doorgelezen)
- [x] Aanbevelingen: elke aanbeveling verwijst naar GAP/RISK analyse-bevinding
- [x] Aanbevelingen: alle impact-velden gevuld of als INSUFFICIENT_DATA: gemarkeerd
- [x] Aanbevelingen: alle meetcriteria zijn SMART
- [x] Sprintplan: aannames (team, capaciteit, randvoorwaarden) gedocumenteerd (INSUFFICIENT_DATA gemarkeerd)
- [x] Sprintplan: alle stories hebben minimaal 1 acceptatiecriterium
- [x] Guardrails: alle guardrails zijn testbaar geformuleerd
- [x] Guardrails: alle guardrails hebben schending-actie én verificatiemethode
- [x] Guardrails: alle guardrails verwijzen naar GAP/RISK analyse-bevinding
- [x] Alle 4 deliverables aanwezig: Analyse ✓ Aanbevelingen ✓ Sprintplan ✓ Guardrails ✓

**STATUS: GEREED VOOR HANDOFF → 02-domain-expert**
