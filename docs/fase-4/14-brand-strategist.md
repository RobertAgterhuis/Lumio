# Fase 4 — Brand Strategist
**Agent:** 14-brand-strategist  
**Datum:** 2026-03-01  
**Input:** docs/fase-1/ (alle outputs), docs/fase-2/ (alle outputs), docs/fase-3/ (alle outputs), site/src/ (marketing site), README.md  
**Status:** GEREED VOOR HANDOFF

---

## SECTIE 1: Brand Touchpoint Inventarisatie

| Touchpoint | Beschikbaar voor analyse | Bevindingen |
|---|---|---|
| Marketing website (`site/`) | ✅ JA — volledig beschikbaar in codebase | Volledig geanalyseerd |
| Product UI (`src/lumio-web/`) | ✅ JA — via Fase 3 agents | Via CROSS_AGENT_INPUT |
| Product documentatie (`documentation/`) | `UNCERTAIN:` — directories aanwezig, content onbekend | INSUFFICIENT_DATA qua inhoud |
| Sales materialen (decks, one-pagers) | `INSUFFICIENT_DATA:` — niet aangetroffen in codebase | Niet beschikbaar |
| Support communicatie | `INSUFFICIENT_DATA:` — geen Intercom/Zendesk config gevonden | Niet beschikbaar |
| Social media | `INSUFFICIENT_DATA:` — geen social links gevonden in code | Niet beschikbaar |
| App store listings | `INSUFFICIENT_DATA:` — app nog niet gelanceerd | Niet beschikbaar |

**Beschikbare merkuitingen voor analyse:** marketing website + product UI/UX (via Fase 3). Alle overige touchpoints INSUFFICIENT_DATA — dit beperkt de scope van de brand consistency audit.

---

## SECTIE 2: Brand Consistency Audit

### Kern merkidentiteit (geëxtraheerd uit beschikbare bronnen)

**Tagline:** "Alles geregeld als het er echt toe doet"  
Bron: `site/src/app/page.tsx` metadata title, `site/src/components/sections/HeroSection.tsx` H1

**Pill badge hero:** "Voor particulieren & werkgevers · €125 · Offline & privé"  
Bron: `HeroSection.tsx` regel 12

**Waardepropositie (B2C):** "testament, wilsverklaring, digitale bezittingen en noodcontacten op één veilige plek te zetten — offline, privé, en klaar voor de mensen die je vertrouwt"  
Bron: `HeroSection.tsx` hero subtext

**Waardepropositie (B2B/werkgevers):** "Geef uw medewerkers een betekenisvol benefit. WKR-passend, geen implementatieproject, geen IT-afdeling nodig — en zichtbaar modern werkgeverschap."  
Bron: `AudienceSplit.tsx` werkgever-card

**Pricingmessaging:** "€125. Alle functies. Geen verrassingen." / "€125 eenmalig, geen abonnement, geen verborgen kosten"  
Bron: `site/src/app/prijzen/page.tsx` metadata + H1

---

### Visuele consistentie

| Kanaal | Kleurpalette | Logo | Typografie | Status |
|---|---|---|---|---|
| Marketing site (`site/`) | Tailwind 4-tokens — teal primary-700 dominante achtergrond, primary-50 kaarten | `UNCERTAIN:` — logo.svg aanwezig in site maar niet geanalyseerd | `UNCERTAIN:` — font-display klasse in hero's maar typeface onbevestigd | `UNCERTAIN:` |
| Product app (`src/lumio-web/`) | `globals.css` teal primary-700, sage #6B8E7A, identical token system | `UNCERTAIN:` (LumioIcon.tsx aanwezig) | Tailwind, font-display klasse aanwezig | `POSITIEF:` Identical token system in marketing + product |
| **Beoordeling** | Tokens gedeeld — `CONSISTENT` | INSUFFICIENT_DATA | INSUFFICIENT_DATA | **Gedeeltelijk verifieerbaar** |

**BEVINDING BRAND-VIS-001:** Marketing site en product app gebruiken dezelfde Tailwind 4 `@theme`-tokens (teal pallette). Visuele consistentie op kleur-niveau WAARSCHIJNLIJK CONSISTENT, maar onbevestigd zonder side-by-side vergelijking en screenshot-analyse.

---

### Toon en Stem (Tone of Voice)

**Geïdentificeerde tone:** Warm, direct, vertrouwenwekkend, anti-jargon, Nederlandstalig, "jij"-aanspraak voor B2C / "u"-aanspraak voor B2B.

| Toon-indicator | Marketing site | Product app | Consistent? |
|---|---|---|---|
| Persoonlijk aanspreken | "jij/je" (B2C), "u/uw" (B2B) | `UNCERTAIN:` — i18n messages niet volledig gelezen | `UNCERTAIN:` |
| Anti-complexiteit | "Geen implementatieproject" / "€125. Alle functies." | Product heeft 17 routes + Shamir jargon (GAP-UX-002 Fase 3) | **Inconsistentie signaal** — marketing belooft eenvoud, product voelt complex |
| Vertrouwen/privacy uitstraling | "offline & privé" / "100% offline" prominent | `CROSS_AGENT_INPUT:` UI Designer — offline is kern feature-claim | CONSISTENT |
| Urgentie | "als het er echt toe doet" — emotionele urgentie | `UNCERTAIN:` in product UI | INSUFFICIENT_DATA |

**POSITIONING_GAP BS-001:** Marketing belooft radicale eenvoud ("geen implementatieproject", "geen IT-afdeling nodig", "alle functies") maar het product bevat technische features als Shamir secret sharing met jargon-labels. Geen aantoonbare merkbelofte-breuk, maar onboarding-risico: gebruiker die de eenvoud-belofte gelooft kan de Shamir-configuratie als overweldigend ervaren.

---

### Messaging Consistentie

| Kernboodschap | Marketing site bewijs | Product-realiteit (Fase 2/3) | Aligned? |
|---|---|---|---|
| "100% offline" | Prominent in hero pill + audience cards | CROSS_AGENT_INPUT: Electron app, lokale opslag, ASP.NET Core sidecar op localhost | ✅ ALIGNED — technisch correct |
| "Veilig voor je nabestaanden" | Impliciet in "voor de mensen die je vertrouwt" | Shamir secret sharing implementatie | ✅ ALIGNED — technisch onderbouwd MAAR UX ongevalideerd (GAP-UX-002) |
| "Geen abonnement / eenmalig" | "€125 eenmalig" prominent in hero + prijzen | CROSS_AGENT_INPUT: geen subscription-logica in codebase | ✅ ALIGNED |
| "WKR-passend" (B2B) | Expliciet vermeld in audience card | `INSUFFICIENT_DATA:` — geen WKR-calculatie of bulk-licentiebeheer in product codebase geïdentificeerd | **UNCERTAIN:** — niet verifieerbaar zonder fiscal advisory |
| "Geen implementatie nodig" (B2B) | Expliciet vermeld | Electron installer is per-device — werkgever distribueert download-links | `POSITIONING_GAP BS-002:` — B2B belooft "geen implementatie" maar Electron per-device install vereist enige IT-coördinatie voor grotere organisaties |
| "Zichtbaar modern werkgeverschap" (B2B) | Vermeld in werkgever-card | `INSUFFICIENT_DATA:` — geen HR-rapportage of employer-dashboard in product | `POSITIONING_GAP BS-003:` — marketing claimt zichtbaarheid/modern werkgeverschap zonder aantoonbare reporting/dashboard functionaliteit |

---

## SECTIE 3: Positionering Analyse

**Huidig positioneringframe:** "De offline-first digitale nalatenschapsbeheerder voor particulieren die hun zaken willen regelen voor hun dierbaren — eenmalig, privé, simpel."

**Verrijking met B2B-laag:** Werkgeversvoordeel als WKR-benefit = secundair distributiepunt via werkgever-HR.

**Doelgroep aangesproken in marketing:**
- B2C: "Ik wil dat mijn zaken geregeld zijn voor als ik er niet meer ben" — 40+ particulier, proactief
- B2B: HR/personeelszaken-beslisser — "betekenisvol benefit voor medewerkers"

**Vergelijking met ICP (Fase 1 input):**
`CROSS_AGENT_INPUT:` Fase 1 Business Analyst: doelgroep 40+ niet-technisch, NL-focus, vermogensbeheer en nalatenschapsthematiek.  
Marketing-site bevestigt dit segment — "jij vertrouwt" "voor de mensen om je heen" = emo-framing klopt met doelgroep.

**ICP MISSEND in marketing:** Geen specifieke sociale segmentatie zichtbaar (geen gezin vs. single vs. ondernemer). Pricing-positionering (€125 one-time) is neutraal over vermogensniveau — dit kan zowel massa-markt als premium werken.

---

## SECTIE 4: Merkbelofte vs Product-realiteit

| Merkbelofte | Product-realiteit | Status |
|---|---|---|
| Eenvoudig in gebruik ("geen IT-afdeling nodig") | Shamir secret sharing configuratie vereist technisch begrip — `CROSS_AGENT_INPUT:` Fase 3 UX Designer GAP-UXD-001 | `CRITICAL_MISALIGNMENT BS-001:` Merkbelofte van eenvoud vs product-complexiteit in kritieke flow |
| Offline & privé ("100% offline") | Electron sidecar, lokale SQLite — `CROSS_AGENT_INPUT:` Fase 2 SA | ✅ ALIGNED |
| "Alles geregeld" (volledigheid-claim) | Modules aanwezig: testament, euthanasie, donor, noodcontacten, digitaal bezit, videoboodschappen — `CROSS_AGENT_INPUT:` Fase 1 Domain Expert | ✅ ALIGNED op feature-niveau; `UNCERTAIN:` op content-volledigheid (vereist juridisch advies per module?) |
| "€125. Alle functies." | Één pricingpoint, geen free tier, geen freemium | ✅ ALIGNED |
| "Voor werkgevers: geen implementatieproject" | Electron per-device install + `UNCERTAIN:` licentiebeheer | `CRITICAL_MISALIGNMENT BS-002:` Belofte van zero-effort B2B deploy vs werkelijkheid van Electron-per-device voor grotere organisaties |

---

## SECTIE 5: Competitive Positionering

**Methodologie:** Publiek beschikbare bronnen, heuristische analyse (HEURISTISCH: — geen directe concurrentenanalyse data beschikbaar).

**HEURISTISCH:** Nederlandse markt voor digitale nalatenschapsbeheer:
- **Exact Online / AFAS:** HR/administratie-gericht, geen nalatenschapsfocus
- **Vitabox / nalatenschapsvault-apps:** Vergelijkbare categorie, `INSUFFICIENT_DATA:` over individuele features
- **Testament.nl / notarisplatforms:** Online testament-diensten, maar notaris-geavanceerd, niet offline
- **Aevitas (BE):** `INSUFFICIENT_DATA:`
- **MijnNalatenschap:** `INSUFFICIENT_DATA:`

**Onderscheidende factoren Lumio (heuristische inschatting):**
1. **100% offline + privacy-first:** Sterk differentiator vs cloud-based alternatieven
2. **Shamir secret sharing voor nabestaanden:** Uniek technisch veiligheidsmechanisme — `UNCERTAIN:` of concurrenten dit bieden
3. **Eenmalige betaling €125:** Anti-subscription is een sterk psychologisch voordeel in markt vol abonnementen
4. **WKR-passend werkgeverskanaal:** `HEURISTISCH:` weinig nalatenschapstools aanbieden een HR/WKR-channel
5. **Desktop-app (Electron):** Offline werking is UX belofte — sommige gebruikers vertrouwen cloud-based oplossingen niet voor gevoelige documenten

**Differentiatiemogelijkheid:** Lumio kan de enige speler zijn die privacy-first / offline-first nalatenschapsbeheer combineert met een WKR-werkgeverskanaal in Nederland. Dit is een sterke niche-positionering als technisch goed uitgevoerd.

---

## SECTIE 6: Brand Gap Analyse

| ID | Gap | Prioriteit |
|---|---|---|
| GAP-BS-001 | CRITICAL_MISALIGNMENT: Merkbelofte eenvoud vs Shamir-complexiteit in product | KRITIEK |
| GAP-BS-002 | POSITIONING_GAP: B2B "geen implementatie" vs Electron per-device werkelijkheid voor grotere organisaties | HOOG |
| GAP-BS-003 | MISSING BRAND ASSET: Geen verifieerbare social proof (reviews, case studies, gebruikerscijfers) in beschikbaar materiaal | HOOG |
| GAP-BS-004 | Hero-CTA leidt naar audience split pagina, NIET naar directe conversie — kopers moeten extra klik maken | MIDDEL |
| GAP-BS-005 | B2B "zichtbaar modern werkgeverschap" claim zonder employer dashboard / HR-rapportage in product | MIDDEL |
| GAP-BS-006 | Typografie + logo alignment marketing↔product INSUFFICIENT_DATA | LAAG |

---

## SECTIE 7: Aanbevelingen

### REC-BS-001 — Shamir Onboarding Simplificatie als Merk-prioriteit
**Referentie:** GAP-BS-001, CRITICAL_MISALIGNMENT BS-001  
**Omschrijving:** De kern-merkbelofte "eenvoud" is het meest bedreigd door de Shamir-configuratiestap. Maak van Shamir-onboarding een merk-prioriteit: hernoem Shamir-gerelateerde termen in UI naar gewone taal ("Herstelcodes voor je nabestaanden"), ontwerp een stap-voor-stap wizard conform de merkbelofte, en maak de voordelen uitlegbaar in één zin op de productpagina.  
**Impact risico niet-uitvoeren:** Eerste gebruikers melden verwarring → negatieve reviews → brand reputatieschade bij lancering  
**KPI:** Shamir-wizard voltooiingsratio ≥80% (conform Shamir UX-testprotocol devdocs/shamir-ux-test-protocol.md)  
**Baseline:** INSUFFICIENT_DATA — niet gemeten  
**Tijdshorizon:** Voor lancering — gecombineerd met Sprint UXD-1  
**Prioriteit:** P1 | **Effort:** Middel (5 SP gecombineerd met UXD en ACC sprints)

---

### REC-BS-002 — B2B Merkbelofte Scherp Stellen of Product Uitbreiden
**Referentie:** GAP-BS-002, GAP-BS-005, CRITICAL_MISALIGNMENT BS-002  
**Omschrijving:** Kies één van twee strategieën: (A) preciseer de B2B-merkbelofte op basis van huidige product-realiteit ("distribueer download-links aan medewerkers, 5 minuten moeite") — eerlijk en accuraat; OF (B) ontwikkel een minimaal employer dashboard (licentie-overzicht, distributiebeheer) als product-uitbreiding die de "implementatieloze" merkbelofte onderbouwt.  
**Impact risico niet-uitvoeren:** Eerste werkgeversklant verwacht "zero-effort" maar ervaart download-distributie handwerk → churn + negatieve word-of-mouth in HR-kring  
**KPI:** B2B klanttevredenheidsscore bij onboarding — target: ≥4/5 Likert  
**Baseline:** INSUFFICIENT_DATA  
**Tijdshorizon:** Pre-launch beslissing (A) of Sprint 3-4 (B)  
**Prioriteit:** P1 | **Effort:** Laag (A: tekstwijziging 1 SP) of Hoog (B: 10+ SP)  
`OUT_OF_SCOPE: Software Architect (B-optie architectuurbeslissing)`

---

### REC-BS-003 — Voeg Social Proof toe aan Marketing Site
**Referentie:** GAP-BS-003  
**Omschrijving:** Voeg vóór lancering tenminste 3 quotes of testimonials toe van beta-gebruikers aan de marketing site. Gebruik een eenvoudig testimonial-component in `site/src/components/sections/`. Betrek acceptatie-gebruikers (familie, vrienden, pilot-werkgevers) voor vroege quotes.  
**Impact risico niet-uitvoeren:** Marketing site wekt vertrouwen maar mist sociale validatie — hogere bounce-rate in premium segment  
**KPI:** Aanwezigheid van ≥3 testimonials op homepage/product-pagina bij lancering  
**Baseline:** 0 testimonials geïdentificeerd  
**Tijdshorizon:** Pre-launch — Sprint BS-1  
**Prioriteit:** P2 | **Effort:** Laag (1-2 SP)

---

### REC-BS-004 — Hero CTA Direct op Conversie Richten
**Referentie:** GAP-BS-004  
**Omschrijving:** Wijzig de primaire hero CTA van "Bekijk voor wie Lumio is" (audience-kwalificatie) naar een directe conversie-CTA: "Start vandaag — €125 eenmalig" OF "Probeer Lumio gratis" (als er een trial-model is). Behoud de audience split als secundaire navigatie. Alternatief: A/B test beide varianten (zie CRO Specialist aanbevelingen).  
**Impact risico niet-uitvoeren:** Kopers die overtuigd zijn van het product moeten een extra onnodige klik maken → conversie-verlies  
**KPI:** Click-through rate hero CTA — target: +20% vs baseline  
**Baseline:** INSUFFICIENT_DATA  
**Tijdshorizon:** Sprint BS-1 of A/B test gecombineerd met CRO sprint  
**Prioriteit:** P2 | **Effort:** Laag (0.5 SP)

---

## SECTIE 8: Sprintplan

### Sprint BS-1: Brand Alignment Fixes + Social Proof

| ID | Story | Type | SP |
|---|---|---|---|
| SP-BS1-001 | Als marketeer wil ik de Shamir-terminologie op de productpagina vervangen door begrijpelijke termen zodat de eenvoud-belofte niet wordt ondergraven | CONTENT | 1 |
| SP-BS1-002 | Als marketeer wil ik de hero CTA primair richten op directe download/koopactie zodat de conversieratio verbetert | CODE | 0.5 |
| SP-BS1-003 | Als marketeer wil ik ≥3 testimonials toevoegen aan de site zodat de merkbelofte door anderen bevestigd wordt | CONTENT | 2 |
| SP-BS1-004 | Als brand owner wil ik de B2B-merkbelofte herzien (strategie A of B kiezen) zodat werkgeversklanten een correcte verwachting hebben | BESLISSING | Product Owner input vereist |

**Acceptatiecriteria SP-BS1-001:** Gegeven de product-pagina en prijzen-pagina, wanneer een niet-technische bezoeker de inhoud leest, dan mogen de termen "Shamir", "secret sharing" en "cryptografisch" niet aanwezig zijn zonder directe, simpele uitleg ("Veilig gesplitste herstelcodes").

**Blocker SP-BS1-004:** Product Owner moet kiezen tussen merkbelofte-aanpassing (kort) of employer dashboard bouwen (lang) — dit blokkeert alle B2B sprint-planning.

---

## SECTIE 9: Guardrails

### GUARD-BS-001 — Technische jargon-termen verboden in marketing copy
**Formulering:** Mogen termen als "Shamir", "cryptografisch", "key splitting", "secret sharing" niet onverklaard worden gebruikt in marketing-teksten (`site/`). Als technische termen worden gebruikt, moeten ze onmiddellijk gevolgd worden door een simpele Nederlandse uitleg tussen haakjes of in een tooltip.  
**Scope:** `site/src/` alle marketing-teksten  
**Schending-actie:** Content review geblokkeerd — copywriter herziet vóór publicatie

### GUARD-BS-002 — B2B claims vereisen product-bewijs
**Formulering:** Mogen marketing-claims over B2B functionaliteit (bijv. "employer dashboard", "medewerker-rapportage", "licentiebeheer") enkel worden gepubliceerd als de betreffende functionaliteit daadwerkelijk is geïmplementeerd en gedocumenteerd in `documentation/`.  
**Scope:** `site/src/app/werkgevers/`, `site/src/components/sections/` B2B-content  
**Schending-actie:** Content niet gepubliceerd zonder Product Owner APPROVED + verwijzing naar feature in codebase

---

## HANDOFF CHECKLIST — Brand Strategist — 2026-03-01

- [x] Brand touchpoint inventarisatie compleet (INSUFFICIENT_DATA correct gedocumenteerd)
- [x] Brand consistency audit — visueel, tone, messaging per kanaal
- [x] CRITICAL_MISALIGNMENT items gedocumenteerd (BS-001, BS-002)
- [x] POSITIONING_GAP items gedocumenteerd (BS-001 t/m BS-003)
- [x] Competitive positionering uitgewerkt (heuristische basis, INSUFFICIENT_DATA correct)
- [x] Aanbevelingen: SMART, GAP-referenties aanwezig
- [x] Sprintplan — stories + acceptatiecriteria
- [x] Guardrails — meetbaar, schending-actie aanwezig
- [x] OUT_OF_SCOPE escalaties aanwezig (SA voor B2B dashboard)
- [x] Alle bevindingen geciteerd met bronbestand

**STATUS: GEREED VOOR HANDOFF**  
**Overdracht aan:** 15-growth-marketer
