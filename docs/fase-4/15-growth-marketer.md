# Fase 4 — Growth Marketer
**Agent:** 15-growth-marketer  
**Datum:** 2026-03-01  
**Input:** docs/fase-1/ (alle outputs), docs/fase-2/ (alle outputs), docs/fase-3/ (alle outputs), docs/fase-4/14-brand-strategist.md, site/src/, devdocs/posthog-analytics.md  
**Status:** GEREED VOOR HANDOFF

---

## SECTIE 1: Marketing Data Inventarisatie

| Data-type | Beschikbaar | Status | Impact |
|---|---|---|---|
| Web analytics (GA4, Plausible, etc.) | `INSUFFICIENT_DATA:` — geen analytics-configuratie gevonden in `site/` | NIET BESCHIKBAAR | Acquisitie-funnel volledig blind |
| Product analytics (PostHog) | Geïnstalleerd maar **NIET GEACTIVEERD** — DPO-goedkeuring vereist | NIET BESCHIKBAAR | Activatie + retentie volledig blind |
| Advertising data (Google Ads, Meta) | `INSUFFICIENT_DATA:` — geen tracking pixels of ad-account config | NIET BESCHIKBAAR | Acquisitie CPA onbekend |
| Email-marketing / CRM | `INSUFFICIENT_DATA:` — geen e-mail platform gevonden | NIET BESCHIKBAAR | Nurturing en retentie niet meetbaar |
| App stores download data | `INSUFFICIENT_DATA:` — product nog niet gelanceerd | NIET BESCHIKBAAR | — |
| Organisch verkeer (SEO) | `UNCERTAIN:` — `site/public/sitemap.xml` aanwezig, maar crawl-data niet beschikbaar | DEELS AANWEZIG | SEO-infrastructuur aanwezig |

**CONCLUSIE:** Alle marketing KPIs zijn INSUFFICIENT_DATA. Dit is pre-launch en pre-analytics. De AARRR-analyse is volledig heuristisch en hypothetisch. **Alle bevindingen in dit document zijn gelabeld HEURISTISCH:** tenzij expliciet onderbouwd met code/artefact bronnen.

---

## SECTIE 2: AARRR Funnel Analyse

### Acquisition

**Huidig acquisitie-model (HEURISTISCH + codebase-bewijs):**

| Kanaal | Status | Bewijs | CPA |
|---|---|---|---|
| Organisch zoekverkeer (SEO) | `UNCERTAIN:` — site is Next.js static export met `sitemap.xml` + metadata | `site/public/sitemap.xml`, `site/public/robots.txt`, SEO metadata in page.tsx files | `INSUFFICIENT_DATA:` |
| Direct / word-of-mouth | `HEURISTISCH:` waarschijnlijk primair kanaal in pre-launch fase | — | `INSUFFICIENT_DATA:` |
| Werkgevers-kanaal (B2B inbound) | `UNCERTAIN:` — `/werkgevers` landingspagina aanwezig | `site/src/app/werkgevers/` | `INSUFFICIENT_DATA:` |
| Paid advertising | `INSUFFICIENT_DATA:` — geen tracking pixels of ad-config gevonden | — | `INSUFFICIENT_DATA:` |
| PR / media | `INSUFFICIENT_DATA:` — niet te bepalen uit codebase | — | `INSUFFICIENT_DATA:` |
| Referral | **ABSENT** — geen referral-mechanisme geïdentificeerd in codebase | geen referral-component gevonden | `INSUFFICIENT_DATA:` |

**GAP-GR-001 (HOOG):** Geen meetbaar acquisitiekanaal geconfigureerd. Marketing site heeft geen analytics-pixel. Acquisitie-volume en kanaal-effectiviteit volledig onzichtbaar bij lancering.

**GAP-GR-002 (HOOG):** Geen referral-mechanisme aanwezig. In een vertrouwenssensitief product als nalatenschapsbeheer is peer-to-peer referral potentieel het sterkste acquisitiekanaal.

---

### Activation

**Definitie "geactiveerde gebruiker" (HEURISTISCH):**
Een geactiveerde Lumio-gebruiker heeft:
1. De app gedownload en geïnstalleerd
2. Een profiel aangemaakt
3. De OnboardingWizard voltooid (6 stappen incl. Shamir-configuratie — `CROSS_AGENT_INPUT:` GAP-UXD-001: Shamir stap ONTBREEKT in OnboardingWizard)
4. Minimaal één inhoud-module (bijv. testament, noodcontacten) ingevuld

**Activatieblokkades geïdentificeerd:**

| Blokkade | Ernst | Bron |
|---|---|---|
| Shamir-configuratiestap ontbreekt in OnboardingWizard → gebruiker bereikt nooit "veilig beveiligde" staat | KRITIEK | `CROSS_AGENT_INPUT:` GAP-UXD-001 Fase 3 |
| Shamir-wizard jargon overweldigend voor 40+ niet-technische gebruikers | KRITIEK | `CROSS_AGENT_INPUT:` GAP-UX-002, CONV-F3-001 |
| 17 navigatie-items bij eerste lancering → cognitive overload | HOOG | `CROSS_AGENT_INPUT:` GAP-UX-005 Fase 3 |
| Geen activatie-metric gedefinieerd of meetbaar | STRUCTUREEL | `GAP-GR-003`: geen PostHog + geen activatiedefinitie |

**HEURISTISCH activatieratio:** `INSUFFICIENT_DATA:` — niet meetbaar zonder PostHog. Risico op lage activatie wegens bovenstaande blokkades.

**GAP-GR-003 (KRITIEK):** Activatiedefinitie bestaat niet als gedocumenteerde metric. Dit is een fundamenteel growth-probleem — zonder definitie is verbetering onmeetbaar.

---

### Retention

**HEURISTISCH analyse:**

| Factor | Overweging | Status |
|---|---|---|
| Product-type | Estate planning = "set and forget" — gebruikers werken niet dagelijks | Laag engagement by design |
| Trigger voor terugkeer | Levensgebeurtenissen: huwelijk, kind, huis kopen, ziekte | `UNCERTAIN:` — geen lifecycle-trigger-systeem gevonden (bijv. e-mail nudges) |
| Desktop-app pushback | Geen push-notificaties in Electron-app (tenzij geconfigureerd) | `UNCERTAIN:` |
| "Compleetheid" motivator | `VoortgangGranulair.tsx` biedt per-domein voortgang — psychologische trigger voor terugkeer | ✅ POSITIEF — aanwezig, `CROSS_AGENT_INPUT:` Fase 3 UX Designer |
| Update-motivatie | Shamir codes bijwerken na levensverandering (bijv. nieuwe nabestaande) | `UNCERTAIN:` — geen update-reminder systeem gevonden |

**GAP-GR-004 (HOOG):** Geen lifecycle-communicatie systeem (bijv. jaarlijkse check-in e-mail, life-event notificaties). Voor een "set and forget" product is een gestructureerde terugkeer-trigger essentieel voor latente waardebeleving.

**NOTE:** Lage dagelijkse retentie is bij dit product-type NORMAAL en NIET per se een failure signal. De juiste retentiemetric is "jaarlijkse actieve gebruiker" of "update bij levensgebeurtenis", niet dagelijkse/wekelijkse retentie.

---

### Revenue

**Model:** €125 eenmalig per licentie (geen abonnement).  
Bron: `site/src/app/prijzen/page.tsx` en `HeroSection.tsx`.

| Revenue-metric | Status |
|---|---|
| Prijs per licentie | €125 (verifieerbaar uit marketing site) |
| ARPU (Average Revenue per User) | €125 one-time (geen expansion revenue model) |
| LTV | €125 per individuele B2C gebruiker (eenmalig) |
| B2B volume pricing | `UNCERTAIN:` — SchaalTabel component aanwezig in pricing page (volume korting mogelijk), details INSUFFICIENT_DATA |
| Checkout implementatie | **ABSENT in codebase** — `CROSS_AGENT_INPUT:` SYSTEM_RISK-F2-001 Fase 2 |
| MRR/ARR | Niet van toepassing (geen subscription) |
| Expansion revenue | `INSUFFICIENT_DATA:` — geen upgrade-pad of add-ons geïdentificeerd |

**GAP-GR-005 (KRITIEK):** Er is geen checkout-implementatie in de product-codebase (SYSTEM_RISK-F2-001 uit Fase 2). De volledige revenue-realisatie — hoe €125 daadwerkelijk geïnd wordt — is `INSUFFICIENT_DATA:`. Dit is een fundamenteel lanceringsrisico.

**HEURISTISCH:** Checkout verloopt mogelijk via een extern platform (bijv. Gumroad, Paddle, of Stripe.com standalone) buiten de geanalyseerde codebase. `INSUFFICIENT_DATA:` — verifieer met Product Owner.

---

### Referral

| Factor | Status |
|---|---|
| Referral-mechanisme in product | **ABSENT** — niet geïdentificeerd in codebase |
| Referral-incentive | `INSUFFICIENT_DATA:` |
| Word-of-mouth potentieel | `HEURISTISCH:` HOOG — estate planning is emotioneel product, gebruikers die het succesvol gebruiken zijn sterk gemotiveerd om het te delen met familie/vrienden ("mijn kind weet nu altijd wat te doen") |
| NPS-mechanisme | `INSUFFICIENT_DATA:` |

**GAP-GR-006 (MIDDEL):** Geen referral-programma of NPS-meting. Het product heeft hoog word-of-mouth potentieel (emotionele categorie) maar benut dit niet structureel.

---

## SECTIE 3: Funnel Bottleneck Identificatie

**HEURISTISCH op basis van product + marketing analyse:**

| Funnel-stap | Hypothetische drop-off | Oorzaak hypothese |
|---|---|---|
| Site-bezoek → begin checkout | `INSUFFICIENT_DATA:` — hero CTA leidt naar audience split, niet direct naar koop | GAP-BS-004 (Brand Strategist): extra klik voor kopers |
| Checkout → download | `INSUFFICIENT_DATA:` — checkout extern, flow onbekend | SYSTEM_RISK-F2-001: checkout niet in codebase |
| Download → installatie voltooid | `INSUFFICIENT_DATA:` | Electron-installer vereist admin rechten op sommige systemen |
| Installatie → profiel aangemaakt | `HEURISTISCH:` potentieel hoge drop-off bij Shamir-stap | GAP-UXD-001: Shamir stap ontbreekt in wizard |
| Profiel → eerste content ingevoerd | `HEURISTISCH:` drop-off wegens 17-item navigatie + leeg gevoel | GAP-UX-005: te veel routes |
| Content ingevoerd → Shamir geconfigureerd | `HEURISTISCH:` HOOG drop-off — kritieke stap, moeilijkste UX | GAP-UX-002, CONV-F3-001 |

**Grootste hypothetische bottleneck:** Shamir-configuratie en activatie-flow (stap profiel → veilig geconfigureerd). Dit is waar de merkbelofte het hardst wordt getest.

---

## SECTIE 4: Growth Hypothesen

**KRITIEKE REGEL:** Alle hypothesen zijn HEURISTISCH en vereisen validatie met werkelijke data na PostHog-activering.

| ID | Hypothese | Primaire KPI | Rationale |
|---|---|---|---|
| HYP-GR-001 | Als we de Shamir-onboarding vereenvoudigen en in de OnboardingWizard opnemen, verwachten we de activatieratio te verhogen met ≥20% omdat de huidige missende stap gebruikers achterhaalt | Shamir-wizard voltooiingsratio | CONV-F3-001: 3 disciplines signaleren dit als bottleneck |
| HYP-GR-002 | Als we een directe "Koop voor €125" CTA toevoegen als primaire hero-knop, verwachten we een hogere CTR naar checkout wegens minder klikken | Hero CTA click-through rate | GAP-BS-004 — extra kwalificatiekliks kosten kopers |
| HYP-GR-003 | Als we een referral-mechanisme toevoegen ("Geef Lumio cadeau aan een vriend — €10 korting voor jou"), verwachten we een ×2 woord-mond acquisitie wegens het emotionele product-karakter | Referral conversie % | GAP-GR-006 — hoog word-of-mouth potentieel onbenut |
| HYP-GR-004 | Als we een jaarlijkse check-in herinnering implementeren (e-mail of in-app), verwachten we hogere heractivatie van "slapende" gebruikers die hun testament hebben aangepast na een levensgebeurtenis | Heractivatieratio na 12 maanden | GAP-GR-004 — geen lifecycle trigger |
| HYP-GR-005 | Als we het B2B-kanaal uitrusten met een simpele werkgevers-bestelling-flow (bijv. "Bestel X licenties, ontvang download-codes"), verwachten we hogere B2B conversie wegens lagere drempel voor HR-beslissers | B2B order completion rate | CRITICAL_MISALIGNMENT BS-002 — B2B UX is ongedocumenteerd |

---

## SECTIE 5: Retentie Aanbevelingen

### REC-GR-001 — Jaarlijkse Levens-Check-In als Retentie-ankerpunt
**Referentie:** GAP-GR-004  
**Omschrijving:** Ontwikkel een jaarlijkse in-app herinnering (bijv. "Het is bijna een jaar geleden dat u Lumio voor het laatst heeft bijgewerkt — heeft er iets gewijzigd in uw leven?") met deep-link naar de vaakst verouderende modules (testament, erfgenamen). Combineer met optionele e-mail notificatie als e-mail bij aankoop verzameld is.  
**Impact risico niet-uitvoeren:** Slapende gebruikers ervaren geen waarde-herinnering → geen mond-tot-mond aanbeveling → lage organische referral  
**KPI:** % gebruikers actief na 12 maanden — target: ≥40% (HEURISTISCH target, geen baseline)  
**Baseline:** INSUFFICIENT_DATA  
**Tijdshorizon:** Post-launch sprint 5-6  
**Prioriteit:** P2

---

## SECTIE 6: Gap Lijst (Growth)

| ID | Gap | Prioriteit |
|---|---|---|
| GAP-GR-001 | Geen analysepixel op marketing site — acquisitie volledig blind | HOOG |
| GAP-GR-002 | Geen referral-mechanisme | MIDDEL |
| GAP-GR-003 | Geen activatiedefinitie gedocumenteerd | KRITIEK |
| GAP-GR-004 | Geen lifecycle-communicatie systeem (jaarlijkse check-in) | HOOG |
| GAP-GR-005 | Checkout-implementatie niet in codebase — revenue-realisatie pad INSUFFICIENT_DATA | KRITIEK |
| GAP-GR-006 | Geen NPS-meting of referral-programma | MIDDEL |
| GAP-GR-007 | PostHog DPO-goedkeuring geblokkeerd — product analytics zonder tijdlijn | HOOG |

---

## SECTIE 7: Aanbevelingen

### REC-GR-002 — Definieer en implementeer Activatie-metric
**Referentie:** GAP-GR-003  
**Omschrijving:** Definieer de activatie-definitie formeel ("een geactiveerde gebruiker heeft: profiel aangemaakt + Shamir geconfigureerd + ≥1 module ingevuld") en implementeer deze als server-side event in PostHog zodra DPO-goedkeuring beschikbaar is. Documenteer definitie in `docs/metrics/`.  
**KPI:** Activatieratio (geactiveerd/totaal gedownload) — target: ≥60%  
**Baseline:** INSUFFICIENT_DATA  
**Tijdshorizon:** Sprint GR-1 (definitie), PostHog sprint (implementatie)  
**Prioriteit:** P1

---

### REC-GR-003 — SEO Basisinfrastructuur Verifiëren op Marketing Site
**Referentie:** GAP-GR-001  
**Omschrijving:** Controleer en verbeter de SEO-implementatie van de marketing site: (1) `sitemap.xml` volledigheid, (2) metadata per pagina, (3) structured data voor relevant schema (Product, Organization). Voeg een privacy-first analytics-tool toe (bijv. Plausible.io — GDPR-conform, geen cookies) als snelle tussenoplossing terwijl PostHog DPO-gated is.  
**KPI:** Organisch verkeer volume — target: >500 bezoekers/maand na 3 maanden  
**Baseline:** INSUFFICIENT_DATA  
**Tijdshorizon:** Sprint GR-1  
**Prioriteit:** P1

---

### REC-GR-004 — Verifieer en Documenteer Checkout Flow
**Referentie:** GAP-GR-005, SYSTEM_RISK-F2-001  
**Omschrijving:** Verifieer met Product Owner hoe de €125 aankoop daadwerkelijk verloopt. Als een extern platform (Gumroad, Paddle, Stripe) wordt gebruikt: documenteer de volledige funnel, test de download-to-install flow, en zorg dat het platform AVG-conform is (AVG Art.13 informatieverplichting bij aankoop). Documenteer als architectural decision.  
**KPI:** Checkout completion rate — target: ≥70%  
**Baseline:** INSUFFICIENT_DATA  
**Tijdshorizon:** Pre-launch — blocker  
**Prioriteit:** P1 — RELEASE BLOCKER  
`OUT_OF_SCOPE: Software Architect + Financial Analyst (payment provider selectie en AVG compliance checkout)`

---

## SECTIE 8: Sprintplan

### Sprint GR-1: Funnelmeting Activeren + Activatiedefinitie

| ID | Story | Type | SP |
|---|---|---|---|
| SP-GR1-001 | Als product owner wil ik een formele activatiedefinitie gedocumenteerd hebben zodat growth experimenten meetbaar zijn | ANALYSE | 2 |
| SP-GR1-002 | Als developer wil ik Plausible.io (of gelijkwaardig privacy-first tool) installeren op marketing site zodat acquisitie-data beschikbaar is vóór PostHog DPO-goedkeuring | CODE | 2 |
| SP-GR1-003 | Als product owner wil ik de checkout-flow gedocumenteerd en getest hebben zodat de complete aankoopervaring verifieeerbaar is | VERIFICATIE | 3 |

**Blocker:** SP-GR1-003 vereist Product Owner input over checkout-platform.

### Sprint GR-2: PostHog Activatie + Retention Infrastructure
(PENDING: DPO-goedkeuring als trigger)

| ID | Story | Type | SP |
|---|---|---|---|
| SP-GR2-001 | Als analytics engineer wil ik PostHog activatie-events implementeren conform activatiedefinitie | CODE | 3 |
| SP-GR2-002 | Als product manager wil ik een jaarlijkse check-in melding implementeren zodat slapende gebruikers worden geheractiveerd | CODE | 3 |

---

## SECTIE 9: Guardrails

### GUARD-GR-001 — Geen lancering zonder werkende checkout flow
**Formulering:** Mag het product niet worden gelanceerd zonder getest en gedocumenteerd checkout-pad (download-trigger na succesvolle betaling, AVG-conforme payment page).  
**Scope:** Release gate — pre-launch checklist  
**Schending-actie:** Release geblokkeerd — escaleer naar Product Owner + Financial Analyst

### GUARD-GR-002 — Privacy-first analytics verplicht vóór PostHog activatie
**Formulering:** Moeten alle analytics-implementaties GDPR-conform zijn. Geen tracking pixels of session recording zonder dokumentatie in `devdocs/posthog-analytics.md` of equivalent.  
**Scope:** `site/` en `src/lumio-web/` analytics-integraties  
**Schending-actie:** PR geblokkeerd — escaleer naar DPO

---

## HANDOFF CHECKLIST — Growth Marketer — 2026-03-01

- [x] Marketing data inventarisatie compleet — alle INSUFFICIENT_DATA correct gedocumenteerd
- [x] AARRR alle vijf stadia geanalyseerd — incl. INSUFFICIENT_DATA met impact-beschrijving
- [x] Alle claims gelabeld HEURISTISCH: of CROSS_AGENT_INPUT:
- [x] Funnel bottlenecks geïdentificeerd
- [x] 5+ growth hypothesen geproduceerd (HYP-GR-001 t/m HYP-GR-005)
- [x] Retentie aanbevelingen aanwezig
- [x] Aanbevelingen conform contract (SMART, GAP-referenties)
- [x] Sprintplan aanwezig
- [x] Guardrails aanwezig
- [x] Release blockers geïdentificeerd (GAP-GR-005 checkout)
- [x] OUT_OF_SCOPE escalaties gedocumenteerd

**STATUS: GEREED VOOR HANDOFF**  
**Overdracht aan:** 16-cro-specialist
