# Analyse – Sales Strategist – 2026-03-01

## Metadata
- **Agent:** 03-sales-strategist
- **Fase:** 1
- **Input ontvangen van:** 01-business-analyst, 02-domain-expert (`docs/fase-1/`)
- **Datum:** 2026-03-01T00:00:00Z
- **Software onder analyse:** Lumio v1.0.0 (branch `Feature/UI`, commit `3049daec`)
- **Guardrails gevolgd:** `docs/guardrails/00-global-guardrails.md`, `docs/guardrails/01-business-guardrails.md` (G-BUS-03, G-BUS-07)

---

## 1. Ideal Customer Profile (ICP)

> **BELANGRIJK:** Lumio heeft no CRM-data, geen analytics-data en geen klantinterviews beschikbaar op het moment van analyse. Alle ICP-velden zijn gebaseerd op het product zelf (capabilities, pricing, positioning), de marketing copy (`site/src/`) en de business context (WKR, AVG, erfrecht). Alle kwantitatieve velden zijn `INSUFFICIENT_DATA:`.

---

### ICP-B2C — Particulier

| Dimensie | Waarde | Bron |
|----------|--------|------|
| **Naam persona** | "De Voorbereider" | Product-positioning site/src/components/sections/ConsumerHero.tsx |
| **Leeftijd** | 35–65 jaar | Afgeleid van estate-planning relevantie: eigenwoningbezit + gezin + begin vermogensopbouw |
| **Geografische scope** | Nederland | WTL/WOD/BW 4/SW 1956 — wet- en regelgeving uitsluitend NL |
| **Gezinssituatie** | Partner en/of kinderen aanwezig | Shamir-functie vereist meerdere vertrouwenspersonen; legitimaire portie relevant bij kinderen |
| **Bezit-indicatoren** | Koopwoning, pensioenaanspraken, digitale accounts en wachtwoorden | `PRODUCT_FEATURES` — Boedel, Digitaal bezit, Documenten |
| **Pijnpunten** | (1) "Ik heb het altijd uitgesteld" — estate planning voelt als taak voor later; (2) "Ik vertrouw cloud-diensten niet voor dit soort data"; (3) "De notaris is duur en tijdrovend" | Marketing copy ConsumerHero.tsx: "Alles geregeld als het er echt toe doet" |
| **Koopdrempel** | Laag — €125 is een impulsdrempel (vergelijkbaar met een goede lunch voor twee, ruim onder notariskosten) | `PRICE_PER_USER = 125`; kostenvergelijking met notaris (testament typisch €300–€1.000) |
| **Aankoopproces** | Self-serve — geen sales-contact, directe aankoop via website | ConsumerHero CTA "Koop Lumio — €125"; geen checkout-flow aangetroffen in codebase |
| **Win-criteria** | Offline & privé (geen cloud), eenmalige betaling, eenvoudige UX, volledigheid (testament + donorwilsverklaring + wachtwoorden in één app) | AudienceSplit.tsx tags: "€125 eenmalig", "Geen abonnement", "100% offline" |
| **Betalingsbereidheid** | `INSUFFICIENT_DATA: geen transactiedata beschikbaar` | — |
| **CAC** | `INSUFFICIENT_DATA:` | — |
| **LTV** | €125 (perpetueel; geen herhalingsaankoop by design) | Businessmodel confirmed Business Analyst output |
| **Kanalen** | Organisch: SEO (huidige staat niet beoordeeld); Directheid: word-of-mouth (notarisadvies, pensioenadvies); Social: onbekend | INSUFFICIENT_DATA: geen analytics |

---

### ICP-B2B — Werkgever

| Dimensie | Waarde | Bron |
|----------|--------|------|
| **Naam persona** | "De HR-Manager" (beslisser) + "De CFO/Controller" (budgethouder) | HrPitch.tsx + CfoPitch.tsx |
| **Bedrijfsgrootte** | 10–500 medewerkers (KB tot middelgroot bedrijf) | SCALE_TIERS: 10/25/50/100 medewerkers; boven 100+ is custom |
| **Sector** | Branche-onafhankelijk — WKR is universeel | CfoPitch: "personeelsvoorziening WKR-passend" geldt alle sectoren |
| **Geografische scope** | Nederland | WKR (Werkkostenregeling) is NL-specifiek fiscaal instrument |
| **HR-beslisser pijnpunten** | (1) Medewerkers onprepared bij overlijden/ziekte → HR-operationeel leed; (2) Behoefte aan zinvol, laagdrempelig benefit zonder implementatieproject; (3) Employer branding differentiatie | HrPitch.tsx |
| **CFO pijnpunten** | Resterende WKR-vrije ruimte onbenut; personeelsvoordelen met directe fiscale return (geen loonheffing); eenmalige kost (geen jaarlijkse SaaS-last) | CfoPitch.tsx — €125/m.w. eenmalig |
| **Betalingsbereidheid** | `INSUFFICIENT_DATA: geen contractdata beschikbaar`; indicatief: voor 10 m.w. = €1.250 (schaalbaar via WKR-calculator) | `SCALE_TIERS` in constants.ts |
| **Sales-cycle lengte** | `INSUFFICIENT_DATA:` — schattingsmatig: HR-benefit beslissing = 2–6 weken (intern budgetgoedkeuringscyclus + directie sign-off) | |
| **Koopproces** | (1) Werkgevers-pagina → (2a) Pilot aanvragen (/contact) OF (2b) Demo plannen (/demo) [EXP-003] → (3) Aankoop | ExperimentCtaBanner.tsx |
| **Pilot-aanbod** | Gratis pilot: tot 10 licenties, 30 dagen, inclusief begeleiding | ContactPage hero: "Gratis pilot aanvragen — tot 10 licenties, 30 dagen" |
| **Verwacht B2B deal-volume** | `INSUFFICIENT_DATA:` | — |

---

## 2. Sales Cycle Documentatie

### B2C Sales Cycle

```
STAP 1 — AWARENESS
  Kanaal: Organisch (SEO), word-of-mouth
  Doel: Bezoeker bereikt lumio-legacy.nl
  Verantwoordelijke: Marketing (ongedefinieerd)
  Status: GEBLOKKEERD — DNS pending (GAP-004 BA; zie GAP-SS-001)
  Conversie: INSUFFICIENT_DATA:
  Gemiddelde doorlooptijd: INSUFFICIENT_DATA:

STAP 2 — OVERWEGING
  Kanaal: Homepage, /voor-jezelf, /product, /demo
  Doel: Bezoeker begrijpt waardepropositie en bekijkt demo
  CTA: "Bekijk alle functies" / "Live demo" 
  Conversie: INSUFFICIENT_DATA:
  Frictie: Demo is web-gebaseerde preview (niet de echte desktop app) —
           product is een Electron desktop app die gedownload moet worden

STAP 3 — INTENT / PRIJS
  Kanaal: /prijzen#particulier (ConsumerPricing)
  Doel: Bezoeker ziet prijs €125 en besluit tot aankoop
  CTA: "Koop Lumio — €125"
  Conversie: INSUFFICIENT_DATA:
  Frictie: KRITIEK — geen in-app/in-browser checkout aangetroffen in codebase;
           aankoop-flow onvolledig (zie GAP-SS-003)

STAP 4 — AANKOOP
  Kanaal: Onbekend — checkout-implementatie niet aangetroffen
  Doel: Betaling + licentie-delivery
  Status: ONVOLLEDIG — zie GAP-SS-003
  Conversie: INSUFFICIENT_DATA:

STAP 5 — ACTIVATIE / INSTALLATIE
  Kanaal: Electron desktop app download + setup-wizard
  Doel: Gebruiker installeert app en stelt eerste profiel in
  Status: Aanwezig (electron-builder + USB-install)
  Conversie: INSUFFICIENT_DATA:
```

**Samenvatting B2C Frictie:**
- Stap 1 geblokkeerd door DNS (extern blocker)
- Stap 4 onvolledig — checkout-implementatie niet aangetroffen
- Conversie van alle stappen: INSUFFICIENT_DATA: (geen PostHog in productie)

---

### B2B Sales Cycle

```
STAP 1 — AWARENESS
  Kanaal: Organisch, referral, werkgevers-pagina
  Doel: HR-manager of CFO bereikt lumio-legacy.nl/werkgevers
  Status: GEBLOKKEERD — DNS pending (GAP-004 BA; zie GAP-SS-001)
  Gemiddelde doorlooptijd: INSUFFICIENT_DATA:

STAP 2 — INTERESSE
  Kanaal: /werkgevers (HrPitch, CfoPitch, WkrUitleg, RoiCalculator)
  Inhoud: HR-pitch + CFO-pitch + WKR-calculator + employer branding argumenten
  CTA: EXP-003 — "Vraag gratis pilot aan" (CONTROL) of "Plan een demo" (VARIANT)
  Frictie: geen: geen vergelijk met concurrenten; CfoPitch bevat geen ROI-calculatie op terugkeer
  Gemiddelde doorlooptijd: INSUFFICIENT_DATA:

STAP 3 — PILOTAANVRAAG / DEMO
  Kanaal: /contact (pilot) of /demo (web preview)
  Inhoud: Contactformulier → interne opvolging door founder/sales
  Responsetijd: "binnen één werkdag" (ContactPage)
  Frictie: Geen CRM — opvolging handmatig, mogelijk verloren leads; zie GAP-SS-002
  Gemiddelde doorlooptijd: INSUFFICIENT_DATA:

STAP 4 — PILOT (PROOF OF VALUE)
  Inhoud: Tot 10 licenties, 30 dagen, inclusief begeleiding
  Offboarding-proces: Niet gedefinieerd — zie GAP-SS-005
  Conversie van Pilot → Betaalde licentie: INSUFFICIENT_DATA:
  Gemiddelde doorlooptijd: 30 dagen (pilot-lengte)

STAP 5 — AANKOOP / CONTRACT
  Kanaal: Onbekend — geen orderproces gedefinieerd voor >10 licenties
  Status: ONVOLLEDIG — geen VWO (verwerkersovereenkomst) template aanwezig (GAP-003 BA);
  geen B2B orderproces gedefinieerd; zie GAP-SS-006
  Gemiddelde doorlooptijd: INSUFFICIENT_DATA:

STAP 6 — ONBOARDING B2B
  Inhoud: Whitelabel-distributie via `tools/whitelabel/`; medewerkers installeren zelf
  Frictie: Whitelabel-tooling aanwezig maar niet als self-service gedocumenteerd voor werkgever
  Status: Aanwezig maar ongedocumenteerd als klant-facing proces
```

**Samenvatting B2B Frictie:**
- Stap 1 geblokkeerd door DNS (extern blocker)
- Stap 3: Geen CRM → handmatige opvolging → verloren leads
- Stap 4 → 5: Pilot-offboarding ongedefinieerd
- Stap 5: Geen definitief orderproces voor B2B; geen VWO template
- EXP-003 test loopt maar heeft nog geen data (PostHog niet live)

---

## 3. Conversion Analyse

| Funnel Stap | B2C Conversie | B2B Conversie | Status |
|-------------|---------------|---------------|--------|
| Websitebezoek | `INSUFFICIENT_DATA:` | `INSUFFICIENT_DATA:` | DNS pending |
| Bezoek → Demo/Product pagina | `INSUFFICIENT_DATA:` | `INSUFFICIENT_DATA:` | — |
| Demo/Product → Prijzen | `INSUFFICIENT_DATA:` | `INSUFFICIENT_DATA:` | — |
| Prijzen → Aankoop/Pilot | `INSUFFICIENT_DATA:` | `INSUFFICIENT_DATA:` | Checkout onvolledig |
| Pilot → Betaalde licentie | n.v.t. | `INSUFFICIENT_DATA:` | Pilot-offboarding ongedefinieerd |
| Overall win rate | `INSUFFICIENT_DATA:` | `INSUFFICIENT_DATA:` | — |

**Root cause ontbrekende conversion data:** PostHog analytics niet actief in productie (DPO-goedkeuring vereist — GUARD-006); DNS niet actief. Alle conversion data is inherent INSUFFICIENT_DATA: totdat beide geblokkeerders zijn opgelost.

---

## 4. Sales-Product Alignment

### Capabilities Verkocht maar Onvoldoende Ontwikkeld

| Capability | Verkoopbelofte | Product-realiteit | Risico |
|-----------|---------------|-------------------|--------|
| CAP-07 Shamir Secret Sharing | "Wiskundige zekerheid, geen enkel risico op ongeautoriseerde toegang" (PRODUCT_FEATURES in constants.ts) | Technisch correct, maar UX van de Shamir-onboarding is complex (meerdere co-houders moeten app installeren en codes uitwisselen) — onboarding-probleem bij laagdrempelige B2C gebruiker | Churn of support als gebruikers Shamir niet correct inrichten |
| CAP-14 Full-text Zoeken | Aanwezig als feature | Niet als verkoopargument gepromoot — correct; geen overbelofte | Geen risico |

### Capabilities Aanwezig maar Niet Verkocht

| Capability | Aanwezigheid | Marketing | Gap |
|-----------|-------------|-----------|-----|
| CAP-12 Whitelabel | Aanwezig in `tools/whitelabel/` | Niet prominent op /werkgevers-pagina vermeld | `SALES_PRODUCT_GAP: Whitelabel-mogelijkheid (incl. eigen logo/huisstijl) wordt niet als differentiator gepromoot aan B2B klanten` |
| CAP-09 Export (PDF/NUV) | Aanwezig | Niet vermeld in marketing copy | `SALES_PRODUCT_GAP: Export-functie (levensboek, NUV voor notaris) is een directe waardepropositie richting notarissen/uitvaartondernemers als potentiële B2B kanalen` |

### Misalignment Gevonden

| ID | Misalignment | Impact |
|----|-------------|--------|
| SALIGN-001 | Geen in-app aankoop (B2C): marketing leidt naar website maar checkout niet aangetroffen | Potentieel conversie-lek: gebruiker die app al bekijkt moet terug naar website om te kopen |
| SALIGN-002 | Demo-pagina toont web-preview maar product is Electron desktop app | Verwachtingsmanagement probleem: demo geeft geen getrouwe indruk van desktop-product |
| SALIGN-003 | EXP-003 test loopt (Pilot vs. Demo CTA) maar PostHog is niet in productie → nul data | Experiment levert geen bruikbare inzichten totdat analytics actief zijn |

---

## 5. Competitive Landscape (Sales Perspectief)

> `INSUFFICIENT_DATA:` Er zijn geen win/loss analyses, CRM-data of klantinterviews beschikbaar. De analyse hieronder is gebaseerd op product-positionering en publiek bekende marktcategorie-context. Alle beweringen zijn `UNCERTAIN:` tenzij anders vermeld.

| Concurrenttype | Beschrijving | Lumio differentiatie |
|---------------|-------------|---------------------|
| **Notaris (primair)** | Testament en wilsverklaring opstellen via notaris. Kosten: €300–€1.000 voor testament; jaarlijkse actualiseringskosten. | Lumio is informeel/voorbereidend, niet als notaris-vervanging gepositioneerd. Prijsverschil groot. `UNCERTAIN: of notariskosten als primaire vergelijksbasis door doelgroep worden ervaren` |
| **Cloud estate planning tools** | Internationaal: Cake (VS), Everplans (VS), LifeVault. Geen NL-specifieke grote speler aangetroffen. | Lumio: 100% offline, NL-recht, geen cloud. Directe differentiator op privacy. `UNCERTAIN: marktpenetratie van cloud-alternatieven in NL` |
| **Papier/spreadsheet** | Grootste competitor: mensen doen het niet of bewaren het in een map/la. | Lumio positioneert zich hier impliciet tegenover: "je hebt het nooit geregeld" = de default competitor |
| **Passwoordmanagers (LastPass, Bitwarden)** | Overlappend met "digitaal bezit" / wachtwoorden functie | Lumio combineert wachtwoorden+testament+donorwilsverklaring in één; andere doelgroep-context (familie/erfgenamen vs. dagelijks gebruik) |
| **HR Benefit platforms (YoungCapital benefits, etc.)** | B2B: bestaande benefit-platformen met bredere catalogus | Lumio is niet in een platform; direct license; WKR-specifiek; geen jaarkosten = lagere TCO |

---

## 6. Sales Gaps

### GAP-SS-001 — DNS Pending Blokkeert Alle Sales Funnels
- **Beschrijving:** De canonical domain `www.lumio-legacy.nl` is niet live. Alle marketing en sales-funnels (B2C en B2B) zijn inherent niet bereikbaar voor nieuwe bezoekers.
- **Bron:** `devdocs/deployment-urls.md`; GAP-004 Business Analyst output
- **Impact:** Geen organisch verkeer, geen conversie, go-to-market volledig geblokkeerd
- **Prioriteit:** Kritiek

### GAP-SS-002 — Geen CRM of Lead-Management Systeem
- **Beschrijving:** B2B leads komen via een contactformulier (/contact) maar worden niet gevolgd in een CRM of gestructureerd leadbeheersysteem. Opvolging is handmatig.
- **Bron:** `site/src/components/sections/ContactForm.tsx` — geen externe CRM-integratie aangetroffen in codebase (INSUFFICIENT_DATA: backend van ContactForm niet geïnspecteerd, maar geen CRM-documentatie in devdocs)
- **Impact:** Verloren leads; geen pipeline inzicht; geen conversie-meting B2B
- **Prioriteit:** Hoog

### GAP-SS-003 — Checkout-Flow Niet Aangetroffen
- **Beschrijving:** De B2C marketing leidt to "Koop Lumio — €125" maar een daadwerkelijke checkout-implementatie is niet aangetroffen in de codebase (`site/src/` of `src/lumio-web/`). Hoe een klant de licentie aanschaft is onduidelijk.
- **Bron:** ConsumerHero.tsx CTA `href="/prijzen#particulier"`; PricingCard.tsx; geen checkout-route, geen payment provider, geen licentiesleutel-delivery aangetroffen
- **Impact:** Nul B2C-conversie als checkout ontbreekt; kritieke blocker voor go-to-market
- **Prioriteit:** Kritiek

### GAP-SS-004 — EXP-003 A/B Test Heeft Geen Data
- **Beschrijving:** Het A/B-experiment op de werkgevers-pagina (EXP-003: Pilot vs. Demo CTA) is volledig geïmplementeerd inclusief tracking-events, maar omdat PostHog niet actief is in productie (wacht op DPO-goedkeuring — GUARD-006), verzamelt het experiment nul data.
- **Bron:** `ExperimentCtaBanner.tsx`; `devdocs/posthog-analytics.md`; GAP-005 Business Analyst (geen KPI-tracking)
- **Impact:** Geen inzichten over B2B CTA-effectiviteit; investering in A/B-functionaliteit levert niks op
- **Prioriteit:** Hoog (wordt opgelost zodra GAP-005 BA is opgelost)

### GAP-SS-005 — Pilot-Offboarding Ongedefinieerd
- **Beschrijving:** De pilot (10 licenties, 30 dagen) heeft geen gedefinieerd offboarding-proces: hoe wordt een pilot-deelnemer na 30 dagen geconverteerd naar een betaalde klant? Er is geen follow-up sequence, geen automatische herinnering, geen upgrade-flow aangetroffen.
- **Bron:** ContactPage hero copy ("30 dagen pilot"); afwezigheid van pilot-offboarding documentatie
- **Impact:** Pilot-conversie verschilt van een non-event; verloren B2B-omzet
- **Prioriteit:** Hoog

### GAP-SS-006 — Geen Formeel B2B Orderproces
- **Beschrijving:** Voor B2B-aankopen boven de pilotdrempel is er geen formeel orderproces: geen offertedocument, geen VWO (Verwerkersovereenkomst) template (GAP-003 BA), geen betalingsproces voor bulk-licenties.
- **Bron:** GAP-003 Business Analyst; `docs/fase-1/01-business-analyst.md`; afwezigheid van orderproces in codebase of devdocs
- **Impact:** Zelfs als een werkgever wil kopen, is het onduidelijk hoe — sales-friction maximaal
- **Prioriteit:** Hoog

---

## AANBEVELINGEN

### REC-SS-001 — Implementeer Checkout-Flow voor B2C Licentie-Aankoop
- **Verwijzing:** GAP-SS-003
- **Beschrijving:** Implementeer een volledige B2C checkout-flow: (1) kies payment provider (Mollie of Stripe; voorkeur Mollie voor NL-markt iDEAL); (2) implementeer licentie-levering na betaling (e-mail met downloadlink + licentiesleutel); (3) koppel aan de bestaande Electron licentie-validatie.
- **Impact — Revenue:** Kritiek — zonder checkout is er nul B2C-omzet
- **Impact — Risk Reductie:** n.v.t.
- **Impact — Cost:** Laag (Mollie/Stripe integratie is 2-5 SP; licentie-delivery is standaard patroon)
- **Impact — UX:** Positief — completeert de koopervaring; `OUT_OF_SCOPE: UX-flow checkout → 11-ux-designer`
- **Risico van niet-uitvoeren:** Nul B2C-omzet. Elke marketing-investering zonder checkout heeft geen ROI.
- **SMART meetcriterium:**
  - KPI: "B2C checkout aanwezig" — Target: Betaalde licentie succesvol afgerond via website
  - Baseline: Niet aanwezig
  - Target: Checkout live met ten minste één succesvolle testtransactie
  - Meetmethode: Integratietest + handmatige end-to-end betaling; PostHog `checkout_completed` event
  - Tijdshorizon: Sprint SS-1
- **Prioriteit:** P1 | Impact: Kritiek | Effort: Middelmatig | Sprint: SS-1

### REC-SS-002 — Definieer Pilot-Offboarding Procedure en B2B Orderproces
- **Verwijzing:** GAP-SS-005, GAP-SS-006
- **Beschrijving:** (1) Stel een pilot-offboarding sequence op: e-mail op dag 20 (t-10), dag 28 (t-2) met conversie-CTA naar betaalde licentie; (2) Definieer een formeel B2B orderproces: offertefunctionaliteit (simpele PDF-offerte met licentieaantallen, prijs, WKR-referentie), betalingsroute, licentie-bulk-delivery; (3) VWO-template klaar per deze sprint (aansluiting op GAP-003 BA).
- **Impact — Revenue:** Hoog — pilot-conversie is de primaire B2B-omzetbron; zonder offboarding-procedure geen B2B-omzet
- **Impact — Risk Reductie:** Middelmatig — VWO vereist voor B2B contractering conform AVG
- **Impact — Cost:** Laag (process-documentatie + simpel e-mailtemplate + VWO-sjabloon)
- **Impact — UX:** `OUT_OF_SCOPE: pilot-offboarding UX → 11-ux-designer`
- **Risico van niet-uitvoeren:** Pilots worden niet omgezet naar betaalde klanten; B2B-omzetpotentieel verloren; AVG-risico zonder VWO (zie GUARD-BA-001)
- **SMART meetcriterium:**
  - KPI: "Pilot-offboarding procedure actief" — Target: E-mailsequentie actief; VWO-template gereed; offerte-PDF beschikbaar
  - Baseline: Niet aanwezig
  - Target: Procedure gereed en getest vóór sprint-einde
  - Meetmethode: Test-pilot-account: controleer e-mailafleveringsdata en VWO-sjabloon aanwezig in template-map
  - Tijdshorizon: Sprint SS-1
- **Prioriteit:** P1 | Impact: Hoog | Effort: Laag | Sprint: SS-1

### REC-SS-003 — Implementeer CRM-Lite voor B2B Lead Management
- **Verwijzing:** GAP-SS-002
- **Beschrijving:** Integreer een lichtgewicht CRM-oplossing voor B2B lead management (advies: HubSpot Free of Notion + make.com webhook van ContactForm). Alle pilot-aanvragen, demo-aanvragen en e-mails moeten in een pipeline met statussen terechtkomen (Nieuw → Contact opgenomen → Pilot → Deal gesloten/verloren).
- **Impact — Revenue:** Hoog — zonder pipeline inzicht is B2B-omzet onbeheerbaar
- **Impact — Risk Reductie:** Laag
- **Impact — Cost:** Laag (HubSpot Free is gratis; Notion pipeline is gratis)
- **Impact — UX:** n.v.t. (intern sales process)
- **Risico van niet-uitvoeren:** Leads gaan verloren in e-mail; geen forecasting; geen conversie-meting
- **SMART meetcriterium:**
  - KPI: "CRM-pipeline actief" — Target: 100% van inkomende contactformulier-inzendingen verschijnen in CRM binnen 1 uur
  - Baseline: Geen CRM
  - Target: CRM actief met pipeline-stages; webhook-integratie actief
  - Meetmethode: Testinzending contactformulier → controleer CRM-entry aangemaakt
  - Tijdshorizon: Sprint SS-2
- **Prioriteit:** P2 | Impact: Hoog | Effort: Laag | Sprint: SS-2

### REC-SS-004 — Voeg Whitelabel als Expliciet Verkoop-Argument toe op Werkgevers-Pagina
- **Verwijzing:** SALIGN-001 (Whitelabel SALES_PRODUCT_GAP)
- **Beschrijving:** Voeg een sectie toe op de /werkgevers-pagina die de whitelabel-mogelijkheid (logo + huisstijl + bedrijfsnaam in de app) expliciet communiceert als benefit voor grotere werkgevers. Dit is een differentiator ten opzichte van generieke tools.
- **Impact — Revenue:** Middelmatig — extra perceived value bij middelgrote werkgevers die employer branding serieus nemen
- **Impact — Risk Reductie:** n.v.t.
- **Impact — Cost:** Nihil (copy-wijziging op bestaande pagina; whitelabel-tooling bestaat al)
- **Impact — UX:** `OUT_OF_SCOPE: plaatsing en ontwerp → 11-ux-designer`
- **Risico van niet-uitvoeren:** Whitelabel-capability onzichtbaar; potentieel hogere contractwaarden gemist
- **SMART meetcriterium:**
  - KPI: "Whitelabel-vermelding op werkgevers-pagina aanwezig" — Target: Sectie of bullet aanwezig
  - Baseline: Niet aanwezig
  - Target: Aanwezig Sprint SS-2
  - Meetmethode: Handmatige UI-inspectie /werkgevers
  - Tijdshorizon: Sprint SS-2
- **Prioriteit:** P2 | Impact: Middelmatig | Effort: Laag | Sprint: SS-2

### REC-SS-005 — Activeer PostHog Analytics Zodra DPO-Goedkeuring Beschikbaar Is
- **Verwijzing:** GAP-SS-004; GAP-005 BA
- **Beschrijving:** Zodra de DPO PostHog in productie goedkeurt (GUARD-006), activeer als eerste de volgende events: `page_view`, `checkout_started`, `checkout_completed`, `pilot_request_submitted`, `demo_request_submitted`, `experiment_impression` (EXP-003), `experiment_conversion` (EXP-003). Dit geeft direct funnel-inzicht.
- **Impact — Revenue:** Hoog — data-gedreven verbetering van conversionfunnel
- **Impact — Risk Reductie:** Laag
- **Impact — Cost:** Nihil (code al aanwezig in ExperimentCtaBanner.tsx)
- **Impact — UX:** n.v.t. (backend analytics)
- **Risico van niet-uitvoeren:** Geen funnel-inzicht; iteratie op sales-flow is blind
- **SMART meetcriterium:**
  - KPI: "PostHog actief met 5 key events" — Target: ≥5 events actief in productie
  - Baseline: 0 events in productie
  - Target: 5 events actief binnen 1 week na DPO-goedkeuring
  - Meetmethode: PostHog dashboard — events aanwezig met non-zero volume
  - Tijdshorizon: Sprint SS-2 (afhankelijk van DPO-goedkeuring)
- **Prioriteit:** P2 | Impact: Hoog | Effort: Laag | Sprint: SS-2 (INTERN blocker: DPO-goedkeuring)

---

## PRIORITEITENMATRIX

```
                LAGE EFFORT          HOGE EFFORT
               ┌──────────────────────────────────────┐
KRITIEKE       │ P1 — Sprint SS-1:                    │
IMPACT         │ REC-SS-001 (checkout B2C)            │
               │ REC-SS-002 (pilot-offboarding + B2B) │
               ├──────────────────────────────────────┤
HOGE IMPACT    │ P2 — Sprint SS-2:                    │
               │ REC-SS-003 (CRM-lite)                │
               │ REC-SS-005 (PostHog activatie)       │
               │ REC-SS-004 (whitelabel vermelding)   │
               └──────────────────────────────────────┘
```

---

## SPRINTPLAN

### Aannames

**Teams:** INSUFFICIENT_DATA: team-samenstelling onbekend. Aanname conform BA: 1 FTE full-stack developer (10 SP/sprint); 1 founder (sales-/contenttaken).  
**Sprint duur:** 2 weken  
**Randvoorwaarden Sprint SS-1:**
1. B2C checkout vereist keuze payment provider (Mollie/Stripe) — door founder vóór sprint-start
2. VWO-juridische review vóór oplevering — door juridisch adviseur of founder

---

### Sprint SS-1 — "Sales Fundament: Checkout & B2B Conversie"

**Sprint Doel:** Na Sprint SS-1 is er een werkende B2C checkout-flow, is er een pilot-offboarding procedure, en is er een VWO-template klaar. Lumio is verkoopbaar.

**KPI-targets:**
- Checkout: succesvolle end-to-end testtransactie (€125) ✓
- Pilot-offboarding: e-mailsequentie actief (dag 20 + dag 28) ✓
- VWO-template: goedgekeurd door founder ✓

**Definition of Done:** Alle stories IMPLEMENTED; integratietests geslaagd; geen nieuwe CRITICAL_FINDING

---

#### SP-SS1-001 — B2C Checkout Implementeren

| Veld | Waarde |
|------|--------|
| **Beschrijving** | Als bezoeker wil ik Lumio kunnen kopen via de website (€125, iDEAL/creditcard) zodat ik direct na betaling de app kan downloaden en mijn licentiesleutel ontvang |
| **Team** | Team Techniek |
| **Story type** | CODE |
| **Story points** | 5 SP |
| **Aanbeveling-referentie** | REC-SS-001 |
| **Afhankelijkheden** | SP-BA1-003 (DNS live) — aankoop via externe website vereist werkende domain |
| **Blocker** | EXTERN: keuze payment provider (Mollie/Stripe) \| eigenaar: founder \| escalatie: bij uitblijven keuze na sprint-dag 2 → stap over op Stripe als standaard |

**Acceptatiecriteria:**
- Gegeven de prijzenpagina, wanneer de gebruiker klikt op "Koop Lumio — €125", dan wordt de gebruiker doorgeleid naar een checkout-pagina met iDEAL als standaard betaalmethode
- Gegeven een succesvolle betaling, wanneer de transactie is afgerond, dan ontvangt de gebruiker een e-mail met downloadlink voor de Electron-installer en een licentiesleutel
- Gegeven een niet-succesvolle betaling, wanneer de transactie mislukt, dan wordt de gebruiker correct geïnformeerd en kan hij/zij het opnieuw proberen
- Gegeven de integratietest, wanneer een test-betaling van €0,01 wordt uitgevoerd (Mollie/Stripe testmode), dan worden alle stappen correct doorlopen

---

#### SP-SS1-002 — Pilot-Offboarding E-mailSequentie

| Veld | Waarde |
|------|--------|
| **Beschrijving** | Als account manager wil ik dat pilot-deelnemers automatisch worden herinnerd aan het einde van hun 30-dagen pilot zodat ik geen opvolgkansen mis |
| **Team** | Team Techniek (+ founder content) |
| **Story type** | CONTENT + CODE |
| **Story points** | 2 SP |
| **Aanbeveling-referentie** | REC-SS-002 |
| **Afhankelijkheden** | NONE |
| **Blocker** | NONE |

**Acceptatiecriteria:**
- Gegeven een pilot-aanvraag ontvangen, wanneer dag 20 is bereikt (pilot start + 20 dagen), dan ontvangt de contactpersoon een e-mail met "Uw pilot eindigt over 10 dagen — zo gaat u verder"
- Gegeven dag 28 (t-2), wanneer de gebruiker nog geen betaalde licentie heeft aangeschaft, dan ontvangt hij/zij een herinnerings-e-mail met directe link naar offerte/aankoop
- Gegeven de e-mailtemplates, wanneer ze worden geïnspecteerd, dan bevatten ze een directe CTA naar het B2B orderproces en de prijs (€125 × aantal licenties)

---

#### SP-SS1-003 — VWO-Template + B2B Offerte-PDF

| Veld | Waarde |
|------|--------|
| **Beschrijving** | Als werkgever wil ik een offertedocument ontvangen met prijsopgave en een verwerkersovereenkomst zodat ik de aankoop intern kan goedkeuren en juridisch correct kan contracteren |
| **Team** | Founder (CONTENT/ANALYSIS) |
| **Story type** | CONTENT |
| **Story points** | 3 SP |
| **Aanbeveling-referentie** | REC-SS-002 |
| **Afhankelijkheden** | NONE |
| **Blocker** | INTERN: juridische review VWO-template \| eigenaar: founder \| escalatie: indien juridisch adviseur niet beschikbaar, gebruik standaard KNB/AFNOR VWO-model als basis met aanpassing |

**Acceptatiecriteria:**
- Gegeven een pilot-offboarding e-mail, wanneer de werkgever klikt op "Stuur mij een offerte", dan ontvangt hij/zij een PDF met: aantal licenties, totaalprijs, WKR-categorie-vermelding, geldigheid 30 dagen
- Gegeven de VWO-template, wanneer die wordt geïnspecteerd, dan voldoet hij aan AVG art. 28 vereisten (verwerker, verantwoordelijke, verwerkingsdoeleinden, beveiliging, sub-verwerkers, rechten betrokkenen); conform DPIA-bevindingen
- Gegeven de VWO, wanneer door founder ondertekend en door werkgever terugontvangen, dan is de aankoop juridisch correct verankerd

---

### Sprint SS-2 — "Sales Versterking: CRM & Conversie-Inzicht"

**Sprint Doel:** Na Sprint SS-2 is er een CRM-pipeline actief, zijn er key PostHog events live (afhankelijk van DPO-goedkeuring), en is whitelabel als benefit op werkgevers-pagina gecommuniceerd.

**KPI-targets:**
- CRM-webhook actief: 100% contactformulier-inzendingen in CRM ✓
- PostHog events actief: ≥5 events (afhankelijk DPO-goedkeuring) ✓ (conditioneel)
- Whitelabel-vermelding op /werkgevers aanwezig ✓

---

#### SP-SS2-001 — CRM-Integratie Contactformulier

| Veld | Waarde |
|------|--------|
| **Beschrijving** | Als sales-verantwoordelijke wil ik dat alle inkomende pilot- en demo-aanvragen automatisch in een CRM-pipeline terechtkomen zodat ik geen leads mis |
| **Team** | Team Techniek |
| **Story type** | INFRA + CODE |
| **Story points** | 2 SP |
| **Aanbeveling-referentie** | REC-SS-003 |
| **Afhankelijkheden** | SP-SS1-003 (B2B offerte → CRM-stage "Offerte verzonden") |
| **Blocker** | INTERN: keuze CRM-tool (HubSpot Free / Notion) \| eigenaar: founder \| escalatie: standaard HubSpot Free bij geen keuze |

**Acceptatiecriteria:**
- Gegeven een inzending via het contactformulier, wanneer de webhook wordt aangeroepen, dan verschijnt er binnen 5 minuten een entry in de CRM-pipeline met status "Nieuw"
- Gegeven een CRM-entry, wanneer die wordt geïnspecteerd, dan bevat hij: naam, e-mail, bedrijfsnaam, aantal medewerkers, aanvraagdatum, bron (pilot/demo)
- Gegeven een follow-upactie na 1 werkdag door founder, wanneer die is uitgevoerd, dan wordt de CRM-status bijgewerkt naar "Contact opgenomen"

---

#### SP-SS2-002 — PostHog Key Events Activatie (conditioneel)

| Veld | Waarde |
|------|--------|
| **Beschrijving** | Als product-manager wil ik inzicht in de B2C en B2B conversiefunnel via PostHog zodat ik datagedreven beslissingen kan nemen over optimalisaties |
| **Team** | Team Techniek |
| **Story type** | CODE |
| **Story points** | 2 SP |
| **Aanbeveling-referentie** | REC-SS-005 |
| **Afhankelijkheden** | NONE (code-gereed; wacht op DPO-goedkeuring) |
| **Blocker** | INTERN: DPO-goedkeuring PostHog productie-activatie \| eigenaar: founder \| escalatie: als DPO approval niet beschikbaar voor sprint-einde → story rol naar Sprint SS-3 |

**Acceptatiecriteria:**
- Gegeven PostHog in productie (DPO-goedkeuring verkregen), wanneer een bezoeker door de funnel gaat, dan worden de volgende events getrackt: `page_view`, `checkout_started`, `checkout_completed`, `pilot_request_submitted`, `demo_request_submitted`, `experiment_impression` (EXP-003), `experiment_conversion` (EXP-003)
- Gegeven het PostHog-dashboard, wanneer het wordt geraadpleegd na 7 dagen live, dan zijn er non-zero waarden voor ≥5 van de 7 events

---

#### SP-SS2-003 — Whitelabel Vermelding op Werkgevers-Pagina

| Veld | Waarde |
|------|--------|
| **Beschrijving** | Als HR-manager wil ik weten dat ik Lumio in de huisstijl van mijn bedrijf kan aanbieden zodat ik een professionelere benefit-ervaring kan bieden aan mijn medewerkers |
| **Team** | Founder (CONTENT) |
| **Story type** | CONTENT |
| **Story points** | 1 SP |
| **Aanbeveling-referentie** | REC-SS-004 |
| **Afhankelijkheden** | NONE |
| **Blocker** | NONE |

**Acceptatiecriteria:**
- Gegeven de /werkgevers-pagina, wanneer een HR-manager deze bezoekt, dan ziet hij/zij een vermelding van de whitelabel-mogelijkheid (eigen logo/bedrijfsnaam in app)
- Gegeven de vermelding, wanneer die wordt geïnspecteerd, dan bevat ze een beschrijving van het proces (één CSS-variabele bestand + logo-upload) en een verwijzing naar de one-pager voor details

---

### Parallelle Tracks

**Sprint SS-1:**
| Track | Stories | Startvoorwaarde |
|-------|---------|----------------|
| Track A — Checkout | SP-SS1-001 | Payment provider keuze (founder) |
| Track B — Offboarding + VWO | SP-SS1-002, SP-SS1-003 | Geen — kan direct starten |

**Sprint SS-2:**
| Track | Stories | Startvoorwaarde |
|-------|---------|----------------|
| Track A — CRM | SP-SS2-001 | CRM-tool keuze (founder) |
| Track B — PostHog | SP-SS2-002 | DPO-goedkeuring (conditioneel) |
| Track C — Content | SP-SS2-003 | Geen — kan direct starten |

### Blocker Register

| ID | Story | Type | Eigenaar | Escalatie |
|----|-------|------|----------|-----------|
| BLK-SS1-001 | SP-SS1-001 | EXTERN: Payment provider keuze | Founder | Default: Stripe bij geen keuze dag 2 |
| BLK-SS1-002 | SP-SS1-001 | EXTERN: DNS live (SP-BA1-003) | Extern (DNS provider) | Checkout kan getest worden op testdomain; DNS is geen vereiste voor sprint-deliverable |
| BLK-SS1-003 | SP-SS1-003 | INTERN: Juridische VWO-review | Founder | Gebruik standaard AVG art. 28 model-VWO als juridisch adviseur niet beschikbaar |
| BLK-SS2-001 | SP-SS2-001 | INTERN: CRM-tool keuze | Founder | Default: HubSpot Free |
| BLK-SS2-002 | SP-SS2-002 | INTERN: DPO-goedkeuring PostHog | Founder / DPO | Story rolt naar Sprint SS-3 als niet opgelost |

---

## GUARDRAILS

### GUARD-SS-001 — Geen Marketing-Activering Zonder Werkende Checkout

- **Formulering:** Lumio mag geen betaalde marketing of PR-activiteiten starten (social ads, Google Ads, PR-campagnes, influencer) zolang de B2C checkout-flow niet functioneel en getest is.
- **Scope:** Marketing-besluiten, PR, paid advertising
- **Verwijzing:** GAP-SS-003, REC-SS-001
- **Schending-actie:** Elke marketing-activering die leidt tot betaalde of grootschalige organische traffic vóór checkout live is, wordt als `GUARDRAIL_VIOLATION: GUARD-SS-001` gemarkeerd en teruggeroepen
- **Verificatiemethode:** Vóór marketing-besluit: controleer of checkout-integratietest geslaagd is (SP-SS1-001 acceptatiecriterium 4); handmatige check door founder
- **Overlap check:** Nieuw

### GUARD-SS-002 — B2B Contractering Vereist Getekende VWO

- **Formulering:** Geen B2B-klant mag meer dan 10 pilot-licenties ontvangen zonder een getekende VWO conform AVG art. 28.
- **Scope:** B2B sales, contractering
- **Verwijzing:** GAP-SS-006, REC-SS-002; GUARD-BA-001 (Business Analyst)
- **Schending-actie:** Licentie-delivery voor >10 medewerkers geblokkeerd zonder getekende VWO; markeer als `GUARDRAIL_VIOLATION: GUARD-SS-002`
- **Verificatiemethode:** Handmatige check bij elke B2B-order >10 licenties: VWO aanwezig en getekend vóór levering; founder verantwoordelijk
- **Overlap check:** Aanvulling op GUARD-BA-001

### GUARD-SS-003 — Conversiedata Mogen Niet op Aannames Worden Gebaseerd

- **Formulering:** Sales-besluiten (pricing changes, funnel-wijzigingen, CTA-test-uitkomsten) mogen NIET worden genomen op basis van geschatte of aangenomen conversiedata. Beslissingen vereisen aantoonbare data uit PostHog of CRM.
- **Scope:** Product, marketing, sales besluitvorming
- **Verwijzing:** GAP-SS-004, SALIGN-003; Anti-Hallucinatie Protocol (copilot-instructions.md)
- **Schending-actie:** Sales-besluit op basis van aanname wordt als `GUARDRAIL_VIOLATION: GUARD-SS-003` gedocumenteerd en teruggedraaid totdat data beschikbaar is
- **Verificatiemethode:** Elk sales-besluit document bevat een bronvermelding naar analytics-data; ontbreekt de bron → escaleer naar Orchestrator
- **Overlap check:** Aanvulling op globale guardrail G-BUS-07 (evidence-based decisions)

---

## JSON EXPORT

```json
{
  "agent": "03-sales-strategist",
  "icp_b2c": {
    "persona": "De Voorbereider",
    "age_range": "35-65",
    "geography": "Nederland",
    "ltv_eur": 125,
    "cac_eur": "INSUFFICIENT_DATA",
    "checkout_available": false
  },
  "icp_b2b": {
    "persona": "HR-Manager + CFO",
    "company_size_range": "10-500",
    "geography": "Nederland",
    "price_per_user_eur": 125,
    "pilot_length_days": 30,
    "pilot_max_users": 10
  },
  "sales_gaps": [
    { "id": "GAP-SS-001", "priority": "Kritiek", "name": "DNS pending" },
    { "id": "GAP-SS-002", "priority": "Hoog", "name": "Geen CRM" },
    { "id": "GAP-SS-003", "priority": "Kritiek", "name": "Checkout ontbreekt" },
    { "id": "GAP-SS-004", "priority": "Hoog", "name": "EXP-003 geen data" },
    { "id": "GAP-SS-005", "priority": "Hoog", "name": "Pilot-offboarding ongedefinieerd" },
    { "id": "GAP-SS-006", "priority": "Hoog", "name": "Geen B2B orderproces" }
  ],
  "recommendations": [
    { "id": "REC-SS-001", "priority": "P1", "sprint": "SS-1" },
    { "id": "REC-SS-002", "priority": "P1", "sprint": "SS-1" },
    { "id": "REC-SS-003", "priority": "P2", "sprint": "SS-2" },
    { "id": "REC-SS-004", "priority": "P2", "sprint": "SS-2" },
    { "id": "REC-SS-005", "priority": "P2", "sprint": "SS-2" }
  ],
  "guardrails": [
    { "id": "GUARD-SS-001", "name": "Geen marketing zonder checkout" },
    { "id": "GUARD-SS-002", "name": "B2B contractering vereist VWO" },
    { "id": "GUARD-SS-003", "name": "Conversiedata op basis van feiten" }
  ]
}
```

---

## HANDOFF CHECKLIST – Sales Strategist – 2026-03-01

- [x] ICP gedefinieerd op basis van product-data (B2C + B2B); alle kwantitatieve velden INSUFFICIENT_DATA: correct gemarkeerd
- [x] Sales cycle volledig gedocumenteerd: B2C (5 stappen) + B2B (6 stappen)
- [x] Conversion metrics gedocumenteerd als INSUFFICIENT_DATA: (correct — geen data beschikbaar)
- [x] Sales-product alignment analyse compleet (SALIGN-001, SALIGN-002, SALIGN-003; 2 SALES_PRODUCT_GAP gevonden)
- [x] Competitive landscape gedocumenteerd met UNCERTAIN: markeringen
- [x] Aanbevelingen conform contract (5 aanbevelingen, alle P1/P2)
- [x] Alle bevindingen hebben bronvermelding
- [x] Zelfcontrole uitgevoerd
- [x] Aanbevelingen: elke aanbeveling verwijst naar GAP/RISK analyse-bevinding
- [x] Aanbevelingen: alle impact-velden gevuld of als INSUFFICIENT_DATA: gemarkeerd
- [x] Aanbevelingen: alle meetcriteria zijn SMART
- [x] Sprintplan: aannames (team, capaciteit, randvoorwaarden) gedocumenteerd
- [x] Sprintplan: alle stories hebben minimaal 1 acceptatiecriterium
- [x] Guardrails: alle guardrails zijn testbaar geformuleerd
- [x] Guardrails: alle guardrails hebben schending-actie én verificatiemethode
- [x] Guardrails: alle guardrails verwijzen naar GAP/RISK analyse-bevinding
- [x] Alle 4 deliverables aanwezig: Analyse ✓ Aanbevelingen ✓ Sprintplan ✓ Guardrails ✓

**STATUS: GEREED VOOR HANDOFF → 04-financial-analyst**
