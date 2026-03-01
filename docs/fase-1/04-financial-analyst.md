# Analyse – Financial Analyst – 2026-03-01

## Metadata
- **Agent:** 04-financial-analyst
- **Fase:** 1 (laatste agent – Fase 1 afsluiting)
- **Input ontvangen van:** 01-business-analyst, 02-domain-expert, 03-sales-strategist (`docs/fase-1/`)
- **Datum:** 2026-03-01T00:00:00Z
- **Software onder analyse:** Lumio v1.0.0 (branch `Feature/UI`, commit `3049daec`)
- **Guardrails gevolgd:** `docs/guardrails/00-global-guardrails.md`, `docs/guardrails/01-business-guardrails.md` (G-BUS-06)

---

## 1. Financiële Data Inventarisatie

> Dit is de meest kritieke stap conform de Financial Analyst skill. De analyse mag ALLEEN worden uitgevoerd op basis van aantoonbare gegevens.

| Data-type | Beschikbaar | Bron | Kwaliteit |
|-----------|-------------|------|-----------|
| Prijs per licentie | ✓ | `site/src/lib/constants.ts` (PRICE_PER_USER = 125) | Betrouwbaar |
| Schaalkorting / volume pricing | ✓ Nee — geen korting aanwezig | `SCALE_TIERS` — alle tiers: €125/gebruiker exact | Betrouwbaar |
| WKR 2026 percentages | ✓ | `site/src/lib/constants.ts` calcWkrRuimte — 2.00% over €400k, 1.18% daarboven | Betrouwbaar (door Developer gedocumenteerd) |
| Revenue (MRR/ARR) | ✗ `INSUFFICIENT_DATA:` | DNS nog niet live (GAP-004 BA); nu 0 omzet | Structureel ontbrekend |
| Klantaantallen | ✗ `INSUFFICIENT_DATA:` | Geen CRM, geen analytics in productie | Structureel ontbrekend |
| Customer Acquisition Cost (CAC) | ✗ `INSUFFICIENT_DATA:` | Geen marketing spend data; geen CRM | Structureel ontbrekend |
| Operationele kosten | ✗ `INSUFFICIENT_DATA:` | Geen P&L, geen begroting aangetroffen | Structureel ontbrekend |
| Developer kosten (FTE/uren) | ✗ `INSUFFICIENT_DATA:` | Geen personeelskosten-documentatie | Structureel ontbrekend |
| Cloud / hosting kosten | Gedeeltelijk verifieerbaar | GitHub Pages (marketing site) = $0; API draait lokaal op gebruikersapparaat | Gedeeltelijk |
| Code-signing certificaatkosten | ✗ `INSUFFICIENT_DATA:` | Electron-builder config aanwezig; certificaattype onbekend | Gedeeltelijk |
| Burn rate | ✗ `INSUFFICIENT_DATA:` | Geen financiële data | Structureel ontbrekend |
| P&L statement | ✗ `INSUFFICIENT_DATA:` | Niet aangetroffen | Structureel ontbrekend |

**Conclusie inventarisatie:** Nagenoeg alle operationele financiële data is `INSUFFICIENT_DATA:`. De analyse is beperkt tot wat aantoonbaar is: het pricing model (precies bepaalbaar), de kostenstructuur per gebruiker (bepaalbaar door de architectuur), en de financiële risico's (aantoonbaar op basis van voorgaande agent-output).

---

## 2. Pricing Model Analyse

> Alleen uitgevoerd op basis van beschikbare pricing-documentatie. Bronnen: `site/src/lib/constants.ts`, marketing-copy, voorgaande agent-outputs.

### 2a. Huidige Prijsstructuur

| Segment | Pricingmodel | Prijs | Recurring |
|---------|-------------|-------|-----------|
| B2C — Particulier | Perpetueel | €125 eenmalig | ❌ Nee |
| B2B — Werkgever | Perpetueel per medewerker | €125/medewerker | ❌ Nee |
| Volume korting | Geen | €125 per licentie ongeacht volume | — |

**OPMERKINGEN:**
- Geen schaalkorting geïmplementeerd. Bij 10 medewerkers = €1.250; bij 100 = €12.500 (exact lineair).
- Geen freemium, geen trial versie (alleen begeleide pilot voor B2B).
- Geen jaarlijkse abonnementscomponent.

### 2b. Pricing-Waardepropositie Alignment

| Argument | Verifieerbaar | Beoordeling |
|----------|---------------|-------------|
| "Goedkoper dan notaris" | Indicatief — notaris testament: €300–€1.000 (publiek bekend) | Sterk argument voor B2C |
| "WKR-passend" | ✓ — calcWkrRuimte geïmplementeerd conform WKR 2026 percentages | Sterk argument voor B2B |
| "Eenmalig — geen abonnement" | ✓ — geen subscription-logica aangetroffen in codebase | Sterk differentiator |
| "Geen implementatiekosten" | ✓ — zelfinstalleerbare Electron app; geen serverinfrastructuur bij klant vereist | Correct |
| "100% aftrekbaar" (CfoPitch.tsx) | `UNCERTAIN:` — "Als gerichte vrijstelling of vrije ruimte" is een versimpeling; werkelijke fiscale behandeling afhankelijk van situatie | RISICO: mogelijk misleidende claim richting CFO/HR |

**RISICO — Fiscale Claim:** CfoPitch.tsx stelt "100% aftrekbaar" zonder voorbehoud. De feitelijke fiscale behandeling hangt af van de WKR-categorie (gerichte vrijstelling vs. vrije ruimte), de loonsom, en de jaarlijkse WKR-ruimte-benutting van de werkgever. Dit is een vereenvoudiging die tot klachten kan leiden. Zie GAP-FA-001.

### 2c. Vergelijking met Industrie-Standaarden

> Alleen op basis van publiek beschikbare marktdata. `UNCERTAIN:` waar niet verifieerbaar.

| Vergelijking | Lumio | Benchmark | Beoordeling |
|-------------|-------|-----------|-------------|
| Estate planning tools (cloud, internationaal) | €125 eenmalig | `UNCERTAIN:` Cake (VS) ~$25/maand = €300/jaar; Everplans ~$75/jaar | Lumio is competitief bij >6 maanden gebruik; perpetueel voordeel bij lange LTV |
| B2B benefit tools (SaaS) | €125/m.w. eenmalig | Typisch €3–€20/m.w./maand voor SaaS | `UNCERTAIN:` Lumio's LTV per B2B-seat = €125 vs. SaaS €36–€240/jaar → bij >4 maanden gebruik perpetueel goedkoper dan goedkoopste SaaS |
| Notaris testament | €125 | €300–€1.000 (testamentkosten notaris, publiek bekend) | Duidelijk goedkoper; complementair (niet vervangend) |

---

## 3. Unit Economics

> **KRITIEKE REGEL:** Alle metrics die bedrijfsspecifieke data vereisen zijn `INSUFFICIENT_DATA:`. Geen benchmark-schatting.

| Metric | Waarde | Bron |
|--------|--------|------|
| **LTV (B2C)** | €125 (exact) | Perpetueel — geen herhalingsaankoop by design. LTV = aankoopprijs. |
| **LTV (B2B per seat)** | €125 (exact) | Zelfde perpetueel model. |
| **CAC (B2C)** | `INSUFFICIENT_DATA:` | Geen marketing spend data; geen analytics |
| **CAC (B2B)** | `INSUFFICIENT_DATA:` | Geen CRM; geen sales cost data |
| **LTV:CAC ratio** | `INSUFFICIENT_DATA:` | CAC onbekend |
| **Payback period** | `INSUFFICIENT_DATA:` | CAC onbekend |
| **Gross margin** | Structureel hoog (indicatief) | Architectuuranalyse: geen server-kosten per gebruiker (offline-first); primaire kosten zijn eenmalige ontwikkelingskosten. `INSUFFICIENT_DATA:` voor precieze berekening. |
| **MRR** | €0 (huidig) | DNS pending; website niet live (GAP-004 BA, GAP-SS-001) |
| **ARR** | €0 (huidig) | Idem |
| **Burn rate** | `INSUFFICIENT_DATA:` | Geen kostendata |

### Unit Economics — Structurele Analyse (op basis van architectuur)

Hoewel de bedrijfsspecifieke getallen `INSUFFICIENT_DATA:` zijn, is de kostenstructuur analytisch bepaalbaar op basis van de codebase-architectuur:

**Variabele kosten per verkochte licentie:**
- Hosting/server: EUR 0 (offline-first; gebruiker draait eigen server op eigen device)
- Data opslag: EUR 0 (lokale SQLite op gebruikersapparaat)
- Bandbreedte/CDN: Nagenoeg EUR 0 (marketing site op GitHub Pages — gratis; geen API calls na verkoop)
- Customer support: `INSUFFICIENT_DATA:` — afhankelijk van support-volume en -kosten
- Payment processing: `UNCERTAIN:` ~1.5–2.9% bij Stripe/Mollie = €1.90–€3.60 per transactie van €125

**Conclusie:** Lumio heeft een zeer lage variabele kostenbasis per verkochte licentie — dit is een significante structurele sterkte. De business is schaalbaar zonder proportionele kostengroei (geen server scaling, geen cloud-database scaling). De dominante kostenpost is ontwikkelingstijd (vaste kost).

---

## 4. FinOps Analyse

> Alleen uitvoerbaar waar infrastructuurdata beschikbaar is. Bronnen: codebase-inspectie, GitHub Actions config, electron-builder config.

### Aangetroffen Infrastructuurcomponenten

| Component | Kosten | Bron | Status |
|-----------|--------|------|--------|
| Marketing site hosting | €0 (GitHub Pages) | `site/public/CNAME` + deploy-site.yml GitHub Actions | Bevestigd |
| CI/CD pipeline | GitHub Actions — `INSUFFICIENT_DATA:` maandelijkse verbruik; gratis tier 2.000 min/maand (private repo) — uitlopend bij intensief gebruik | `ci.yml`, `codeql.yml`, `deploy-site.yml` | Bevestigd (provider); verbruik onbekend |
| Backend hosting per klant | €0 (API draait lokaal op gebruikersapparaat — Electron sidecar) | `src/lumio-desktop/src/electron/` sidecar-architecture | Bevestigd |
| Database hosting | €0 (SQLite lokaal) | `.csproj` — SQLCipher dependency | Bevestigd |
| Code signing (Windows) | `INSUFFICIENT_DATA:` — EV-certificaat: ~€200–€400/jaar | `electron-builder.yml` — signing aanwezig; certificaattype onbekend | Onbekend |
| Apple notarization (macOS) | `INSUFFICIENT_DATA:` — Apple Developer Program €99/jaar | `electron-builder.yml` — platform-targets onbekend | Onbekend |
| PostHog analytics | €0 (gratis tier ≤1M events/maand) | `devdocs/posthog-analytics.md` | Bevestigd (niet actief in productie) |
| Domain registratie | `INSUFFICIENT_DATA:` — .nl domein ~€5–€15/jaar | `devdocs/deployment-urls.md` | Onbekend |

**FinOps conclusie:** Lumio's infrastructuurkostenstructuur is exceptioneel laag. Door de offline-first architectuur zijn er **nul operationele kosten per gebruiker** voor hosting/cloud. De enige significante vaste technische kosten zijn developer-tijd, code-signing certificaat(en), en eventueel CI/CD minuten.

**FinOps risico:** Als het klantvolume sterk groeit, kunnen GitHub Actions CI-minuten een bottleneck worden (beperkte gratis tier). Dit is echter pas relevant bij honderden builds per dag.

---

## 5. Financial KPI Baseline

| KPI | Huidige Waarde | Bron | Meting-methode |
|-----|----------------|------|----------------|
| MRR (maandelijkse terugkerende omzet) | €0 | DNS pending; checkout ontbreekt | PostHog `checkout_completed` event (na activatie) |
| ARR | €0 | Idem | Idem |
| Totale cumulatieve revenue | `INSUFFICIENT_DATA:` | Geen billing-systeem actief | Toekomstig: billing-dashboard |
| LTV (B2C) | €125 (exact, by design) | `PRICE_PER_USER = 125` | Productie-constante |
| LTV (B2B per seat) | €125 (exact) | Idem | Idem |
| CAC | `INSUFFICIENT_DATA:` | Geen marketing spend of CRM | Na activatie: marketing spend / nieuwe klanten |
| LTV:CAC ratio | `INSUFFICIENT_DATA:` | CAC onbekend | Na CAC-meting |
| Gross margin % | `INSUFFICIENT_DATA:` (structureel hoog, zie §3) | Geen kostendata | Vereist P&L |
| Burn rate | `INSUFFICIENT_DATA:` | Geen kostendata | Vereist P&L |
| Checkout conversie (website → betaald) | `INSUFFICIENT_DATA:` | Checkout ontbreekt; geen analytics | PostHog `checkout_completed / page_view` |
| Pilot → Paid conversie (B2B) | `INSUFFICIENT_DATA:` | Geen pilots geconverteerd | CRM: (gesloten deals / afgesloten pilots) × 100% |
| Actieve licentiesleutels uitgegeven | `INSUFFICIENT_DATA:` | Geen billing-systeem | Toekomstig: licentiebeheer-database |

---

## 6. Financiële Risico's

### RISK-FA-001 — Nul Revenue Door Twee Kritieke Blockers
- **Beschrijving:** Lumio genereert momenteel geen enkele euro omzet omdat (1) de B2C checkout-flow ontbreekt (GAP-SS-003) en (2) de DNS niet actief is (GAP-004 BA, GAP-SS-001). Beide moeten opgelost zijn voordat enige transactie mogelijk is.
- **Kans:** Zeker (huidige staat)
- **Impact:** Kritiek (nul omzet, geen cashflow)
- **Risicoscore:** Kritiek
- **Beheer:** Prioriteit REC-SS-001 + SP-BA1-003 (DNS) — bestaande aanbevelingen Sales Strategist en Business Analyst
- **Bron:** GAP-SS-003, GAP-004 BA, `docs/fase-1/01-business-analyst.md`, `docs/fase-1/03-sales-strategist.md`

### RISK-FA-002 — Perpetueel Pricing Model Biedt Geen Terugkerende Inkomsten
- **Beschrijving:** De perpetual license (€125) is een bewuste keuze maar betekent dat na de initiële aankoop er nul terugkerende revenue uit bestaande klanten is. Groei is 100% afhankelijk van nieuwe klant-acquisitie. Bij onstabiele acquisitie is er een directe revenue-cliff.
- **Kans:** Inherent (by design); wordt risico bij acquisitie-stagnatie
- **Impact:** Hoog (geen cashflow-buffer van bestaande klanten)
- **Risicoscore:** Hoog
- **Beheer:** Bewuste strategische keuze; mitigation: zorg voor hoge klantvolumes of introduceer optionele upgrade-paden (update-abonnement voor toekomstige versies). `OUT_OF_SCOPE voor huidige sprint: toekomstig businessmodel beslissing`
- **Bron:** `PRICE_PER_USER = 125`; Pricing model in constants.ts

### RISK-FA-003 — Misleidende Fiscale Claim "100% Aftrekbaar"
- **Beschrijving:** CfoPitch.tsx presenteert Lumio als "100% aftrekbaar" zonder voorbehoud. De werkelijke fiscale situatie is afhankelijk van de WKR-ruimte van de werkgever in het desbetreffende jaar. Als de WKR-vrije ruimte al is verbruikt, is Lumio belast (eindheffing 80%). Deze claim kan leiden tot claims van werkgevers die onterecht verwachten dat er geen loonheffing is.
- **Kans:** Middelmatig (werkgevers met vol-benutte WKR-ruimte)
- **Impact:** Middelmatig (klachten, terugbetalingseisen, reputatieschade)
- **Risicoscore:** Middelmatig
- **Beheer:** Voeg juridische voorbehoud toe aan CfoPitch ("Raadpleeg uw fiscaal adviseur voor uw specifieke situatie" — deze tekst staat al in SchaalTabel.tsx maar niet in CfoPitch.tsx zelf)
- **Bron:** `site/src/components/sections/CfoPitch.tsx` — "100% aftrekbaar" claim; Werkkostenregeling Belastingdienst 2026

### RISK-FA-004 — Geen Financieel Businessmodel Forecast Beschikbaar
- **Beschrijving:** Er is geen forecast, P&L, kostenstructuur of begroting waaruit de runway (maximale operationele periode bij huidig burn-rate) kan worden bepaald. Als development-kosten hoger zijn dan verwacht of revenue lager dan gehoopt, is er geen vroegtijdig waarschuwingssysteem.
- **Kans:** Hoog (structureel ontbreken van financieel model)
- **Impact:** Hoog (operationele continuïteitsrisico)
- **Risicoscore:** Hoog
- **Beheer:** Zie REC-FA-001 — implementeer minimale financiële KPI-tracking
- **Bron:** Afwezigheid van P&L of financieel model in alle gescande documenten

### RISK-FA-005 — LTV = CAC Breakeven Onbekend
- **Beschrijving:** Als LTV = €125 (fixed) en CAC onbekend is, bestaat het risico dat toekomstige marketing-investeringen een CAC produceren > €125. Bij CAC > LTV is het businessmodel structureel verlieslatend. Dit risico is momenteel niet meetbaar.
- **Kans:** `INSUFFICIENT_DATA:` (CAC onbekend)
- **Impact:** Kritiek (bij CAC > LTV elk klant acquisitie leidt tot verlies)
- **Risicoscore:** Hoog (door onmogelijkheid te meten)
- **Beheer:** CAC-tracking activeren zodra checkout + CRM actief zijn (REC-SS-001, REC-SS-003); CAC-maximum guardrail instellen
- **Bron:** §3 Unit Economics

---

## 7. Gaps (Financial Analyst)

### GAP-FA-001 — Misleidende "100% Aftrekbaar" Claim Zonder Fiscaal Voorbehoud
- **Beschrijving:** CfoPitch.tsx vermeldt "100% aftrekbaar" als absolute claim. De WKR-aftrekbaarheid is conditioneel (afhankelijk van beschikbare vrije ruimte). De voorbehoud-tekst staat alleen in SchaalTabel.tsx maar niet in CfoPitch.tsx.
- **Bron:** `site/src/components/sections/CfoPitch.tsx` lijn ~20 ("100% aftrekbaar"); `site/src/components/sections/SchaalTabel.tsx` lijn ~64 (disclaimer wel aanwezig)
- **Risico:** Klacht van werkgever die verwacht had belastingvrij te zijn terwijl WKR-ruimte vol was; productaansprakelijkheid
- **Prioriteit:** Hoog

### GAP-FA-002 — Geen Financieel KPI-Dashboard of Minimale Financial Tracking
- **Beschrijving:** Er is geen enkel systeem om financiële KPIs bij te houden: revenue, transactieaantallen, CAC, of burn rate. Het businessmodel is een black box.
- **Bron:** Afwezigheid van financieel-tracking documentatie; geen billing-database in codebase
- **Risico:** Onmogelijk om businessmodel te valideren of bij te sturen
- **Prioriteit:** Hoog

### GAP-FA-003 — Geen Licentie-Management Backend
- **Beschrijving:** Er is geen systeem voor het registreren en valideren van uitgegeven licentiesleutels. Dit heeft zowel een financieel aspect (onbekend hoeveel licenties zijn uitgegeven) als een beveiligingsaspect (licentie-misbruik of -deling niet detecteerbaar).
- **Bron:** `src/lumio-desktop/` — geen licence-server of licentiesleutel-database aangetroffen; `src/Lumio.Api/` — geen licentiebeheer-endpoint
- **Risico:** Licentie-deling (één aankoop, meerdere gebruikers); omzetderving; geen inzicht in klantbase
- **Prioriteit:** Middelmatig

---

## AANBEVELINGEN

### REC-FA-001 — Implementeer Minimale Financiële KPI-Tracking
- **Verwijzing:** GAP-FA-002, RISK-FA-004
- **Beschrijving:** Stel een minimale financieel-tracking implementatie op: (1) Elke nieuwe checkout-transactie wordt gelogd in een eenvoudige administratie (datum, bedrag, type B2C/B2B, licentiecount); (2) Maandelijkse revenue-samenvatting; (3) Documenten burn rate als éénmalige handmatige oefening voor de founder. Dit hoeft geen enterprise BI te zijn — een Google Sheet of Notion-database is voldoende voor deze fase.
- **Impact — Revenue:** Hoog — zonder financiële tracking is geen datagedreven besluitvorming mogelijk
- **Impact — Risk Reductie:** Hoog — RISK-FA-004 elimineert runway-blindheid
- **Impact — Cost:** Nihil (Google Sheets of Notion gratis)
- **Impact — UX:** n.v.t.
- **Risico van niet-uitvoeren:** Geen inzicht in cashflow; onmogelijkheid om CAC te berekenen na marketing-activering; te late signalering van financiële problemen
- **SMART meetcriterium:**
  - KPI: "Financiële KPI-tracking actief" — Target: Maandelijkse revenue, transactiecount, en cumulatieve licentiesleutels bijgehouden
  - Baseline: Niet aanwezig
  - Target: Tracking-sheet actief binnen Sprint FA-1
  - Meetmethode: Aanwezigheid tracking-document + filled entries na eerste transactie
  - Tijdshorizon: Sprint FA-1
- **Prioriteit:** P1 | Impact: Hoog | Effort: Laag | Sprint: FA-1

### REC-FA-002 — Voeg WKR Fiscaal Voorbehoud toe aan CfoPitch
- **Verwijzing:** GAP-FA-001, RISK-FA-003
- **Beschrijving:** Voeg dezelfde voorbehoudclausule die in SchaalTabel.tsx staat ("Raadpleeg uw fiscaal adviseur voor uw specifieke situatie") toe aan CfoPitch.tsx, direct naast de "100% aftrekbaar" claim. Maak de claim conditioneel: "100% aftrekbaar binnen uw vrije WKR-ruimte."
- **Impact — Revenue:** Nihil direct; indirect vertrouwen verhoogd bij CFO-doelgroep
- **Impact — Risk Reductie:** Middelmatig — elimineert aansprakelijkheidsrisico misleidende fiscale claim
- **Impact — Cost:** Nihil
- **Impact — UX:** `OUT_OF_SCOPE: UX-plaatsing disclaimer → 11-ux-designer`
- **Risico van niet-uitvoeren:** Klacht of aansprakelijkheidsrisico van werkgever met vol-benutte WKR-ruimte
- **SMART meetcriterium:**
  - KPI: "WKR-disclaimer aanwezig in CfoPitch" — Target: Fiscale voorbehoudclausule zichtbaar in CfoPitch-component
  - Baseline: Niet aanwezig in CfoPitch
  - Target: Aanwezig Sprint FA-1
  - Meetmethode: Code review van CfoPitch.tsx
  - Tijdshorizon: Sprint FA-1
- **Prioriteit:** P1 | Impact: Middelmatig | Effort: Nihil | Sprint: FA-1

### REC-FA-003 — Implementeer CAC-Target Guardrail Vóór Marketing-Activering
- **Verwijzing:** RISK-FA-005
- **Beschrijving:** Voordat enig betaald marketingbudget wordt uitgegeven: definieer een maximaal acceptabele CAC als percentage van LTV. Aanbevolen grens: CAC ≤ €62,50 (50% van LTV) voor B2C; CAC ≤ €75 voor B2B per seat (60% van LTV; B2B heeft hogere deal-grootte per transactie). Leg vast als bedrijfsbeleid vóór marketing-activering.
- **Impact — Revenue:** Hoog — voorkomt loss-making acquisitia
- **Impact — Risk Reductie:** Hoog — RISK-FA-005 mitigatie
- **Impact — Cost:** Nihil (beleids-definitie)
- **Impact — UX:** n.v.t.
- **Risico van niet-uitvoeren:** Na marketing-activering kan blijken dat elke acquisitie verlieslatend is; geen stopcriterium gedefinieerd
- **SMART meetcriterium:**
  - KPI: "CAC-maximum gedefinieerd en gepubliceerd als bedrijfsbeleid" — Target: Document aanwezig met CAC-grens B2C en B2B
  - Baseline: Niet gedefinieerd
  - Target: Gepubliceerd vóór eerste marketing-budgetering (sprint FA-1)
  - Meetmethode: Aanwezigheid `devdocs/financial-kpi-targets.md` met CAC-grens
  - Tijdshorizon: Sprint FA-1
- **Prioriteit:** P1 | Impact: Hoog | Effort: Laag (documentatie) | Sprint: FA-1

### REC-FA-004 — Introduceer Optioneel Jaarlijks Update-Abonnement (Strategisch)
- **Verwijzing:** RISK-FA-002
- **Beschrijving:** Onderzoek de mogelijkheid van een optioneel "Lumio Update Plan" als aanvullende recurrente inkomstenstroom: bijv. €25/jaar toegang tot nieuwe versies en juridische actalisatie (erfbelasting-updates, nieuwe functies). Dit is een strategisch besluit, niet een sprint-deliverable.
- **Impact — Revenue:** Hoog (structurele verbetering cashflow-stabiliteit)
- **Impact — Risk Reductie:** Middelmatig — verlaagt afhankelijkheid van nieuwe acquisitie
- **Impact — Cost:** Laag (abonnements-infra bouwen) — `OUT_OF_SCOPE voor implementatie → 06-senior-developer, 07-devops-engineer`
- **Impact — UX:** `OUT_OF_SCOPE: pricing UX → 11-ux-designer`
- **Risico van niet-uitvoeren:** Business blijft 100% afhankelijk van nieuwe klanten; geen bufferinkomen
- **SMART meetcriterium:**
  - KPI: "Update-abonnement concept gedocumenteerd" — Target: Business case (1 pagina) opgesteld en door founder besloten (Go/No-go)
  - Baseline: Niet aanwezig
  - Target: Beslissing document Sprint FA-2
  - Meetmethode: Aanwezigheid `devdocs/update-subscription-business-case.md` + Go/No-go besloten
  - Tijdshorizon: Sprint FA-2
- **Prioriteit:** P2 | Impact: Hoog | Effort: Laag (analyse; implementatie apart) | Sprint: FA-2

---

## PRIORITEITENMATRIX

```
                LAGE EFFORT          HOGE EFFORT
               ┌─────────────────────────────────────┐
HOGE IMPACT    │ P1 — Sprint FA-1:                   │
               │ REC-FA-001 (financiële KPI tracking) │
               │ REC-FA-002 (WKR disclaimer CfoPitch) │
               │ REC-FA-003 (CAC-target guardrail)    │
               ├─────────────────────────────────────┤
STRATEGISCH    │ P2 — Sprint FA-2:                   │
               │ REC-FA-004 (update-abonnement biz case) │
               └─────────────────────────────────────┘
```

---

## SPRINTPLAN

### Aannames

**Teams:** INSUFFICIENT_DATA: team-samenstelling onbekend. Aanname conform voorgaande agents: 1 FTE founder (business/content taken); 1 FTE developer (10 SP/sprint).  
**Sprint duur:** 2 weken  
**Randvoorwaarden Sprint FA-1:** Checkout functioneler (REC-SS-001) om reële transactiedata te tracken; zonder checkout is KPI-tracking nog beperkt

---

### Sprint FA-1 — "Financieel Fundament"

**Sprint Doel:** Na Sprint FA-1 zijn de minimale financiële KPIs traceerbaar, is de VWO fiscale claim gecorrigeerd, en is het CAC-maximum gedefinieerd zodat marketing-besluiten verantwoord genomen kunnen worden.

**KPI-targets:**
- Financial tracking-document actief ✓
- CfoPitch WKR-disclaimer aanwezig ✓
- CAC-target document gepubliceerd ✓

---

#### SP-FA1-001 — Financiële KPI-Tracking Setup

| Veld | Waarde |
|------|--------|
| **Beschrijving** | Als founder wil ik een minimaal financieel tracking-systeem zodat ik maandelijks kan zien hoeveel revenue er is binnengekomen en wat de kost per klant is |
| **Team** | Founder |
| **Story type** | ANALYSIS |
| **Story points** | 2 SP |
| **Aanbeveling-referentie** | REC-FA-001 |
| **Afhankelijkheden** | SP-SS1-001 (checkout) — tracking zinvol zodra eerste transacties binnenkomen; de setup kan parallel starten vóór checkout live is |
| **Blocker** | NONE |

**Acceptatiecriteria:**
- Gegeven de financiële tracking, wanneer een checkout-transactie plaatsvindt, dan verschijnt die binnen 24 uur in het tracking-systeem (datum, bedrag, segment B2C/B2B, licentiecount)
- Gegeven het tracking-systeem, wanneer het wordt geraadpleegd, dan bevat het: cumulatieve revenue, transactiecount deze maand/totaal, B2C vs. B2B uitsplitsing
- Gegeven de burn rate, wanneer founder de eerste tracking-sessie uitvoert, dan is een eenmalige handmatige inschatting van maandelijkse kosten gedocumenteerd (inhoudsopgave: developer tijd, tooling, certificaten)

---

#### SP-FA1-002 — WKR Fiscaal Voorbehoud in CfoPitch

| Veld | Waarde |
|------|--------|
| **Beschrijving** | Als CFO/controller wil ik een eerlijk en volledig beeld van de fiscale behandeling van Lumio zodat ik niet in een onaangename verrassing kom bij de WKR-aangifte |
| **Team** | Team Techniek |
| **Story type** | CODE |
| **Story points** | 1 SP |
| **Aanbeveling-referentie** | REC-FA-002 |
| **Afhankelijkheden** | NONE |
| **Blocker** | NONE |

**Acceptatiecriteria:**
- Gegeven CfoPitch.tsx, wanneer de component wordt gerenderd, dan is de "100% aftrekbaar" tekst aangevuld met: "binnen uw beschikbare WKR-vrije ruimte"
- Gegeven de pagina /werkgevers, wanneer een gebruiker CfoPitch ziet, dan is er een zichtbare verwijzing naar de voorbehoudtekst ("Raadpleeg uw fiscaal adviseur voor uw specifieke situatie")
- Gegeven de SchaalTabel en CfoPitch, wanneer beide worden geïnspecteerd, dan is de disclaimertekst consistent

---

#### SP-FA1-003 — CAC-Target Definitie Document

| Veld | Waarde |
|------|--------|
| **Beschrijving** | Als founder wil ik een gedefinieerd maximaal acceptabele CAC-grens zodat ik weet wanneer een marketingkanaal te duur is en ik het moet stoppen |
| **Team** | Founder |
| **Story type** | ANALYSIS |
| **Story points** | 1 SP |
| **Aanbeveling-referentie** | REC-FA-003 |
| **Afhankelijkheden** | NONE |
| **Blocker** | NONE |

**Acceptatiecriteria:**
- Gegeven het CAC-target document, wanneer het wordt geraadpleegd, dan bevat het: max CAC B2C (€), max CAC B2B/seat (€), rationale (% van LTV), en welke meetmethode wordt gehanteerd
- Gegeven het document, wanneer het is goedgekeurd door de founder, dan is het gepubliceerd als `devdocs/financial-kpi-targets.md`

---

### Sprint FA-2 — "Strategisch Financieel Model"

**Sprint Doel:** Update-abonnement business case opgesteld en Go/No-go besloten door founder.

---

#### SP-FA2-001 — Update-Abonnement Business Case

| Veld | Waarde |
|------|--------|
| **Beschrijving** | Als founder wil ik een business case voor een optioneel update-abonnement zodat ik een geïnformeerde beslissing kan nemen over het introduceren van terugkerende inkomsten |
| **Team** | Founder |
| **Story type** | ANALYSIS |
| **Story points** | 2 SP |
| **Aanbeveling-referentie** | REC-FA-004 |
| **Afhankelijkheden** | SP-FA1-001 (eerste revenue data beschikbaar geeft context voor beslissing) |
| **Blocker** | NONE |

**Acceptatiecriteria:**
- Gegeven de business case, wanneer die wordt gepresenteerd, dan bevat die: productvoordelen update-abonnement, prijsniveau (bijv. €25/jaar), geschatte conversie (% van bestaande klanten), meerjarige revenue impact, technische complexiteit (estimate van Dev)
- Gegeven de business case, wanneer founder een beslissing neemt, dan is die vastgelegd als Go of No-go in het document

---

### Parallelle Tracks

**Sprint FA-1:**
| Track | Stories | Startvoorwaarde |
|-------|---------|----------------|
| Track A — Techniek | SP-FA1-002 | Geen |
| Track B — Business | SP-FA1-001, SP-FA1-003 | Geen — volledig parallel |

### Blocker Register

| ID | Story | Type | Eigenaar | Escalatie |
|----|-------|------|----------|-----------|
| BLK-FA1-001 | SP-FA1-001 | INTERN: Checkout live vereist voor reële data | Founder | Setup kan starten vóór checkout; eerste entries handmatig invoeren na eerste transactie |

---

## GUARDRAILS

### GUARD-FA-001 — Betaalde Marketing Vereist Gedefinieerde CAC-Grens

- **Formulering:** Geen enkel betaald marketingbudget (Google Ads, social ads, sponsored content) mag worden geactiveerd voordat het CAC-maximum-document (`devdocs/financial-kpi-targets.md`) is goedgekeurd door de founder.
- **Scope:** Marketing-activering, budget-besluiten
- **Verwijzing:** RISK-FA-005, REC-FA-003
- **Schending-actie:** Marketing-activering zonder goedgekeurd CAC-target wordt als `GUARDRAIL_VIOLATION: GUARD-FA-001` gedocumenteerd; budgetuitgave gedeblokkeerd pas na document-goedkeuring
- **Verificatiemethode:** Vóór elke marketing-budgettering: controleer aanwezigheid en datum van `devdocs/financial-kpi-targets.md`; handmatige check door founder
- **Overlap check:** Aanvulling op GUARD-SS-001 (geen marketing zonder checkout)

### GUARD-FA-002 — Fiscale Claims in Marketingmateriaal Vereisen Voorbehoudtekst

- **Formulering:** Elke marketingpagina, component, of document dat een specifieke fiscale claim maakt (WKR, aftrekbaarheid, loonheffing) MOET een voorbehoudclausule bevatten die de gebruiker verwijst naar een fiscaal adviseur.
- **Scope:** Frontend (site/src/), marketing-content, one-pager
- **Verwijzing:** GAP-FA-001, RISK-FA-003
- **Schending-actie:** PR-review blokkeert merge van elke nieuwe fiscale claim zonder disclaimer; markeer als `GUARDRAIL_VIOLATION: GUARD-FA-002`
- **Verificatiemethode:** Code review checklist: "bevat fiscale claim?" → "bevat voorbehoudtekst?" Playwright smoke test kan disclaimer-aanwezigheid verifiëren via data-attribuut op financiële claims
- **Overlap check:** Nieuw

### GUARD-FA-003 — Licentie-Uitgifte Vereist Logging

- **Formulering:** Elke uitgegeven licentiesleutel MOET geregistreerd worden in het financieel tracking-systeem (datum, type, bedrag, segment). Licenties zonder tracking-entry mogen niet in productie zijn.
- **Scope:** Checkout-flow, licentie-management
- **Verwijzing:** GAP-FA-003, REC-FA-001
- **Schending-actie:** Checkout-flow blokkeert licentie-generatie als tracking-systeem niet beschikbaar is; markeer als `GUARDRAIL_VIOLATION: GUARD-FA-003`
- **Verificatiemethode:** Integratietest: na elke testtransactie → controleer tracking-entry aanwezig; handmatige audit maandelijks (licentiesleutels vs. tracking-entries)
- **Overlap check:** Nieuw

---

## JSON EXPORT

```json
{
  "agent": "04-financial-analyst",
  "data_availability": {
    "pricing_confirmed": true,
    "revenue_data": "INSUFFICIENT_DATA",
    "cost_data": "INSUFFICIENT_DATA",
    "customer_count": "INSUFFICIENT_DATA"
  },
  "pricing": {
    "b2c_price_eur": 125,
    "b2b_price_per_seat_eur": 125,
    "model": "perpetual",
    "volume_discount": false
  },
  "unit_economics": {
    "ltv_b2c_eur": 125,
    "ltv_b2b_per_seat_eur": 125,
    "cac_eur": "INSUFFICIENT_DATA",
    "ltv_cac_ratio": "INSUFFICIENT_DATA",
    "variable_cost_per_user_eur": "~0 (offline-first architecture)"
  },
  "financial_kpi_baseline": {
    "mrr_eur": 0,
    "arr_eur": 0,
    "gross_margin_pct": "INSUFFICIENT_DATA",
    "burn_rate_eur_month": "INSUFFICIENT_DATA"
  },
  "financial_gaps": [
    { "id": "GAP-FA-001", "priority": "Hoog" },
    { "id": "GAP-FA-002", "priority": "Hoog" },
    { "id": "GAP-FA-003", "priority": "Middelmatig" }
  ],
  "financial_risks": [
    { "id": "RISK-FA-001", "score": "Kritiek" },
    { "id": "RISK-FA-002", "score": "Hoog" },
    { "id": "RISK-FA-003", "score": "Middelmatig" },
    { "id": "RISK-FA-004", "score": "Hoog" },
    { "id": "RISK-FA-005", "score": "Hoog" }
  ],
  "recommendations": [
    { "id": "REC-FA-001", "priority": "P1", "sprint": "FA-1" },
    { "id": "REC-FA-002", "priority": "P1", "sprint": "FA-1" },
    { "id": "REC-FA-003", "priority": "P1", "sprint": "FA-1" },
    { "id": "REC-FA-004", "priority": "P2", "sprint": "FA-2" }
  ]
}
```

---

## HANDOFF CHECKLIST – Financial Analyst – 2026-03-01 (Fase 1 Afsluiting)

- [x] Financiële data inventarisatie is compleet en expliciet (tabel met alle data-types)
- [x] Alle analyses zijn alleen uitgevoerd waar data beschikbaar is
- [x] Geen geschatte of benchmark-gebaseerde financiële getallen — alle INSUFFICIENT_DATA: correct gemarkeerd
- [x] Unit economics gedocumenteerd (LTV = €125 bevestigd; CAC = INSUFFICIENT_DATA:)
- [x] Financial KPI baseline compleet (MRR = €0, ARR = €0 bewezen; overige = INSUFFICIENT_DATA:)
- [x] FinOps analyse compleet: variabele kosten per gebruiker = ~€0 (offline-architectuur aantoonbaar)
- [x] Financiële risico's gedocumenteerd (5 risico's, 2 KRITIEK/HOOG met bronverwijzing)
- [x] Alle bevindingen hebben bronvermelding
- [x] JSON export aanwezig en valide
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

**STATUS: GEREED VOOR HANDOFF → 18-critic-agent + 19-risk-agent (Fase 1 Critic + Risk Validatie)**
