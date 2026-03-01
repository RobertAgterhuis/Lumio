# Fase 3 — UX Researcher
**Agent:** 10-ux-researcher  
**Datum:** 2026-03-01  
**Input:** Alle Fase 1 + Fase 2 outputs, devdocs/posthog-analytics.md, devdocs/shamir-ux-test-protocol.md, app-structure analyse  
**Status:** GEREED VOOR HANDOFF

---

## SECTIE 1: Onderzoeksdata Inventarisatie

### Beschikbare data per categorie

| Data-type | Status | Impact op analyse |
|---|---|---|
| Usability tests (resultaten) | AFWEZIG | INSUFFICIENT_DATA: geen task success rates meetbaar |
| Shamir UX test | Protocol aanwezig, uitvoering AFWEZIG | INSUFFICIENT_DATA: protocol gepland maar niet uitgevoerd |
| Analytics (PostHog) | Geïmplementeerd maar NIET geactiveerd | INSUFFICIENT_DATA: nul behavioral data beschikbaar |
| Session recordings | AFWEZIG | INSUFFICIENT_DATA |
| User interviews | AFWEZIG | INSUFFICIENT_DATA |
| Surveys / NPS / CSAT | AFWEZIG | INSUFFICIENT_DATA |
| Support tickets | AFWEZIG (pre-launch) | INSUFFICIENT_DATA |

**Conclusie:** NULPUNT — Er is **nul empirische gebruikersdata** beschikbaar.  
Alle UX-bevindingen in dit document zijn gebaseerd op:
1. **Heuristische analyse** van app-structuur en navigatie (17 screens, page.tsx inventory)
2. **Domein-analyse** van emotionele context (estate planning, terminale situaties)
3. **Cross-agent input** uit Fase 1 (ICP, customer journey intent) en Fase 2 (technische beperkingen)

Alle claims zijn gelabeld als `HEURISTISCH:` of `CROSS_AGENT_INPUT:`. Geen enkele claim is empirisch.

---

## SECTIE 2: User Persona Validatie

### Fase 1 ICP Review

`CROSS_AGENT_INPUT:` Fase 1 Business Analyst + Domain Expert identificeerden:
- **Primaire gebruiker (Eigenaar):** Volwassene 35–70 jaar, bezit vermogen, wil orde op zaken stellen, hogere mate van privacy-bewustzijn, lage-middel digitale vaardigheid
- **Secundaire gebruiker (Nabestaanden):** 40+ jaar, niet-technisch, in crisissituatie na overlijden, eerste aanraking met Lumio in stressvolle omgeving

**Persona-validatie:**
- `INSUFFICIENT_DATA:` Geen gebruikersinterviews of observationele data beschikbaar om Fase 1 ICP te bevestigen of weerspreken
- `HEURISTISCH:` De Shamir test-protocol aanname ("40+, geen IT-professional") is consistent met domein-verwachting — niet-technische oudere doelgroep verwerkt digitale nalatenschap
- `HEURISTISCH:` Emotionele lading van het domein (testament, euthanasie, uitvaart) vereist onboarding die psychologische veiligheid creëert — dit is niet zichtbaar in de huidige navigatiestructuur

**Gaps in persona-kennis:**
- `INSUFFICIENT_DATA:` Digitale vaardigheid van de specifieke doelgroep is niet gemeten
- `INSUFFICIENT_DATA:` Frequentie van terugkerend gebruik (éénmalige invuller vs regelmatige updater) is onbekend
- `INSUFFICIENT_DATA:` Welke devices en besturingssystemen de doelgroep gebruikt zijn niet onderzocht

---

## SECTIE 3: User Journey Mapping

### Primaire flows (geïdentificeerd via page-structure)

**Geïdentificeerde schermen (src/lumio-web/src/app):**

| Route | Domein | Type use case |
|---|---|---|
| `/` (page.tsx) | Auth/Onboarding | Initieel setup of unlock |
| `/dashboard` | Overzicht | Centrale hub |
| `/eigenaar` | Profiel | Persoonlijke gegevens |
| `/testament` | Testament | Inhoud-creatie |
| `/uitvaart` | Uitvaart | Inhoud-creatie |
| `/euthanasie` | Euthanasie-verklaring | Inhoud-creatie |
| `/donor` | Donorregistratie | Inhoud-creatie |
| `/erfgenamen` | Erfgenamen | Relatiebeheer |
| `/noodcontacten` | Noodcontacten | Relatiebeheer |
| `/digitaal-bezit` | Digitale bezittingen | Inventarisatie |
| `/documenten` | Documenten | Document upload |
| `/boedel` | Boedel | Waarde-inventarisatie |
| `/tijdlijn` | Tijdlijn | Chronologisch overzicht |
| `/videoboodschappen` | Video | Media content |
| `/export` | Export | Backup / PDF |
| `/instellingen` | Instellingen | App + Shamir config |
| `/help` | Help | Support |
| `/audit-log` | Audit | Beheerinfo |

**Totaal primaire flows: 17 schermen — aanzienlijke navigatieomvang voor een personal-data app**

---

### Journey 1: Eerste setup (Onboarding)

`HEURISTISCH:`

| Stap | Scherm | Touchpoint | Pijnpunt | Emotie |
|---|---|---|---|---|
| 1 | `/` | App downloaden + installeren | Geen onboarding wizard zichtbaar | Onzeker — "wat verwacht de app van mij?" |
| 2 | `/` | Profiel aanmaken + wachtwoord instellen | Master password eisen niet getoond | Laag vertrouwen |
| 3 | `/instellingen` | Shamir shares instellen | Concept "Shamir" is onbekend voor leken | Hoog cognitieve belasting |
| 4 | `/eigenaar` | Persoonsgegevens invullen | Onduidelijk welke data verplicht is | Neutraal |
| 5 | `/dashboard` | Eerste view na setup | 16 open categorieën onmiddellijk zichtbaar | Overweldigend — "waar begin ik?" |

**Kritieke moment (Mom of Truth):** Stap 3 — Shamir-configuratie. Dit is de meest cognitief veeleisende stap in onboarding, en de app biedt geen contextgevoelige uitleg op de pagina zelf.

**Drop-off risico:** `HEURISTISCH:` Hoog. Gebruikers die onboarding niet afronden verliezen alle voordelen van het product.

---

### Journey 2: Content invullen (Inhoud-creatie)

`HEURISTISCH:`

| Stap | Scherm | Touchpoint | Pijnpunt | Emotie |
|---|---|---|---|---|
| 1 | `/dashboard` | Kies een categorie | Geen completeness indicator per categorie | Onzekerheid over voortgang |
| 2 | bijv. `/testament` | Open categorieformulier | Inhoud is emotioneel zwaar (overlijden) | Confronterend, mogelijk moeizaam |
| 3 | bijv. `/testament` | Sla gegevens op | Feedbackmechanisme na opslaan is onduidelijk | Angst voor dataverlies |
| 4 | `/dashboard` | Terugkeer naar overzicht | Geen visuele bevestiging van voltooiing | INSUFFICIENT_DATA over visuele state |
| 5 | `/export` | Genereer PDF/backup | Exportproces en verwacht formaat onbekend | INSUFFICIENT_DATA |

**Kritieke moment:** Elke invoervorm bevat emotioneel zware beslissingen (wie zijn mijn erfgenamen, hoe wil ik uitvaart). De UX moet rust en vertrouwen uitstralen, niet efficiëntie-focus.

---

### Journey 3: Nabestaanden-toegang (Shamir Reconstruct)

`HEURISTISCH:` gebaseerd op Shamir UX protocol + component inventarisatie

| Stap | Scherm | Touchpoint | Pijnpunt | Emotie |
|---|---|---|---|---|
| 1 | Buiten app | Ontvang instructiebrief met Shamir-deelcodes | Brief formaat en aanwezigheid = ONBEKEND | Overweldigd (rouwsituatie) |
| 2 | `/` | Open Lumio voor het eerst | Nabestaanden-modus vs. owner-modus onderscheid onduidelijk | Verward |
| 3 | `/instellingen` → Nabestaanden | Navigeer naar Shamir reconstruct wizard | Navigatie niet intuïtief voor eerste-gebruiker | Gefrustreerd |
| 4 | ShamirDialog.tsx | Voer drempel en deelcodes in | Multi-step wizard, drempelconcept uitleggen | Hoge stress |
| 5 | App-unlock | Toegang verkregen of fout | Foutmeldingen begrijpelijk? | Rouwend, tijdsdruk |

**Kritieke moment (Mom of Truth):** Stap 4. Dit is het UX-moment met de grootste impact op product-betrouwbaarheid bij de doelgroep. **Formeel Shamir UX-testprotocol is opgesteld maar NIET uitgevoerd.**

---

## SECTIE 4: Task Success Rate Analyse

`INSUFFICIENT_DATA:` Alle waarden hieronder zijn `NIET GEMETEN` door afwezigheid van user research en analytics.

| Taak | Baseline success rate | Obstructies (Heuristisch) |
|---|---|---|
| Eerste account aanmaken | INSUFFICIENT_DATA | Geen onboarding wizard, Shamir-concept onbekend |
| Profiel volledig invullen | INSUFFICIENT_DATA | 17 categorieën, geen progressie-indicator |
| Testament invullen | INSUFFICIENT_DATA | Emotioneel zware content, geen auto-save feedback |
| Shamir shares instellen | INSUFFICIENT_DATA | Hoog cognitieve belasting, uitleg in app onbekend |
| PDF exporteren | INSUFFICIENT_DATA | Exportscenario en UX niet geanalyseerd |
| Nabestaanden-toegang via Shamir | INSUFFICIENT_DATA | UX-test niet uitgevoerd (SYS-RISK-009 open) |

**Aanbeveling:** Alle zes taken zijn kandidaten voor de eerste formele usability test vóór launch.

---

## SECTIE 5: Friction Point Inventarisatie

| ID | Friction Point | Bron | Impact | Frequentie |
|---|---|---|---|---|
| FP-001 | Geen onboarding wizard / progress indicator bij eerste setup | HEURISTISCH: 17 routes zichtbaar na login | Hoog — verlies engagement in onboarding | Elke nieuwe gebruiker |
| FP-002 | Shamir-concept niet uitgelegd in context | HEURISTISCH: devdocs/shamir-ux-test-protocol.md — "concept onbekend voor leken" | KRITIEK — foutieve configuratie blokkeert nabestaanden | Elke setup-stap |
| FP-003 | 17 categorieën direct zichtbaar zonder prioritering | HEURISTISCH: page-structure analyse | Hoog — cognitive overload voor nieuwe gebruiker | First-time visit dashboard |
| FP-004 | Nabestaanden-modus toegangspunt niet intuïtief (via Instellingen) | HEURISTISCH: Shamir test protocol stap 3 | Hoog — verkeerd pad → frustratie in rouwsituatie | Elke nabestaanden-interactie |
| FP-005 | Geen completeness feedback per categorie op dashboard | HEURISTISCH: geen visuele progress tracking vermeld | Middel — gebruiker weet niet wat reeds ingevuld is | Terugkerende gebruik |
| FP-006 | Emotioneel zware content zonder psychologische ademruimte | HEURISTISCH: domein estate planning | Middel — content abandonment risico | Elke content-invoer sessie |
| FP-007 | PostHog niet geactiveerd — nul behavioral feedback loop | CROSS_AGENT_INPUT: devdocs/posthog-analytics.md | Hoog — geen data voor iteratieve UX verbetering | Structureel / permanent |
| FP-008 | Shamir wizard UX niet gevalideerd met echte gebruikers | CROSS_AGENT_INPUT: shamir-ux-test-protocol.md | KRITIEK — SYS-RISK-009 open | Pre-launch blocker |

---

## SECTIE 6: Technische Haalbaarheidscheck

| FP ID | UX Oplossing | Technische Haalbaarheid | Afhankelijkheden |
|---|---|---|---|
| FP-001 | Onboarding wizard (multi-step) | HAALBAAR — Next.js component toevoeging | `DEPENDENT_ON_TECH:` vereist setup-completion tracking in state |
| FP-002 | In-app Shamir uitleg (tooltip/modal) | HAALBAAR — component toevoeging | NONE — ShamirDialog.tsx al aanwezig |
| FP-003 | Progressive disclosure dashboard (categorieën groeperen) | HAALBAAR — UI restructuring | `DEPENDENT_ON_TECH:` category grouping, klaar na UI Designer sprint |
| FP-004 | Dedicated nabestaanden-landingspagina (los van Instellingen) | HAALBAAR — nieuwe route | `DEPENDENT_ON_TECH:` SA zou architectuur moeten bekijken (GAP-SEC-001 context) |
| FP-005 | Per-categorie completeness indicators | HAALBAAR — completeness API endpoint of frontend-logic | `DEPENDENT_ON_TECH:` vereist backend completeness query per Eigenaar |
| FP-006 | Section spacing, content warnings, pauze-flow | HAALBAAR — CSS + UX copy | NONE |
| FP-007 | PostHog activeren na DPO-goedkeuring | NIET VOLLEDIG IN UX-DOMEIN — `OUT_OF_SCOPE: DevOps + Data Architect (voor DPO process)` | `DEPENDENT_ON_TECH:` GAP-DA-001 + GAP-SEC-001 moeten opgelost zijn voor analytics activering |
| FP-008 | Shamir UX test uitvoeren | NIET TECHNISCH — organisatorisch | NONE (protocol klaar) |

---

## SECTIE 7: Gap Analyse

| ID | Gap | Prioriteit | Bron |
|---|---|---|---|
| GAP-UX-001 | Nul user research uitgevoerd in emotioneel sensitief domein | KRITIEK | HEURISTISCH + CROSS_AGENT_INPUT (geen analytics, geen tests) |
| GAP-UX-002 | Shamir wizard NIET gevalideerd voor doelgroep (40+, niet-technisch, in crisis) | KRITIEK | devdocs/shamir-ux-test-protocol.md — protocol gepland maar AFWEZIG resultaat |
| GAP-UX-003 | PostHog niet geactiveerd — nul behavioral data | HOOG | devdocs/posthog-analytics.md — DPO-gating blokkeert activering |
| GAP-UX-004 | Geen onboarding wizard / completeness guidance bij eerste setup | HOOG | HEURISTISCH: 17 categorieën direct zichtbaar na login |
| GAP-UX-005 | Cognitieve overload dashboard — 17 categorieën zonder prioritering of grouping | HOOG | HEURISTISCH: page-structure analyse |
| GAP-UX-006 | Nabestaanden-entry point niet intuïtief (verborgen in Instellingen) | HOOG | devdocs/shamir-ux-test-protocol.md Taak 1 — navigatie als pijnpunt vermeld |
| GAP-UX-007 | Geen completeness feedback per inhoudsgebied | MIDDEL | HEURISTISCH: geen progress indicator in page-structure |
| GAP-UX-008 | Emotioneel zware content zonder psychologische ondersteuning in UX flow | MIDDEL | HEURISTISCH: domein estate planning + 40+ doelgroep |
| GAP-UX-009 | Export flow UX ongeanalyseerd | LAAG | INSUFFICIENT_DATA: /export route aanwezig maar leeg in analyse |
| GAP-UX-010 | Visuele stijl + typografie ongeanalyseerd | LAAG | `OUT_OF_SCOPE: UI Designer (12)` |

---

## SECTIE 8: Aanbevelingen

### REC-UX-001 — Voer formele usability tests uit vóór launch
**Referentie:** GAP-UX-001, GAP-UX-002  
**Omschrijving:** Voer het bestaande Shamir UX-testprotocol uit (minimaal 5 deelnemers: 40+, niet-technisch, geen prior Lumio ervaring). Breid uit met task walkthrough voor onboarding-flow en één inhoudscategorie.  
**Impact:** Vermindert SYS-RISK-009 naar score ≤3 + valideert onboarding completion rate  
**KPI:** Shamir wizard task completion rate ≥80%, gemiddelde stress-score ≤4/7  
**Baseline:** INSUFFICIENT_DATA  
**Meetmethode:** Directe observatie + Likert-schaal + think-aloud protocol  
**Tijdshorizon:** 3 weken (voor launch)  
**Prioriteit:** P1 — RELEASE BLOCKER voor emotioneel kritisch domein  
**Effort:** Middel  

---

### REC-UX-002 — Implementeer onboarding wizard met setup-completeness tracking
**Referentie:** GAP-UX-004, GAP-UX-005  
**Omschrijving:** Voeg een multi-step onboarding wizard toe die nieuwe gebruikers begeleidt door: (1) profiel aanmaken, (2) wachtwoord, (3) Shamir-uitleg + configuratie, (4) eerste categorie invullen. Toon dashboard pas na voltooiing van minimaal stappen 1–3.  
**Impact:** Verhoogt setup completion rate, vermindert Shamir-configuratiefouten  
**KPI:** Onboarding completion rate (stap 1–3) ≥75% van eerste sessies  
**Baseline:** INSUFFICIENT_DATA  
**Meetmethode:** PostHog funnel tracking (na activering)  
**Tijdshorizon:** 4 weken na PostHog-activering  
**Prioriteit:** P1 — Hoog impact voor product-adoptie  
**Effort:** Middel  

---

### REC-UX-003 — Verbeter Shamir uitleg in-app (contextual help)
**Referentie:** GAP-UX-002, FP-002  
**Omschrijving:** Voeg een inline uitlegmodal toe aan ShamirDialog.tsx en de configuratiepagina: "Wat zijn deelcodes?", "Wat betekent drempel?", "Wat als ik een code verlies?". Gebruik begrijpelijke analogieën (bijv. bankkluis + meerdere sleutels).  
**Impact:** Vermindert Shamir-configuratiefouten (T-02 in UX-test: 0 fouten bij 3 pogingen)  
**KPI:** Foutrate bij Shamir-invoer ≤1 per deelnemer in usability test  
**Baseline:** INSUFFICIENT_DATA  
**Meetmethode:** Usability test event logging  
**Tijdshorizon:** Sprint UX-1  
**Prioriteit:** P1  
**Effort:** Laag  

---

### REC-UX-004 — Maak dedicate nabestaanden-landingspagina buiten Instellingen
**Referentie:** GAP-UX-006, FP-004  
**Omschrijving:** Verplaats de nabestaanden-reconstructie flow naar een eigen route (bijv. `/nabestaanden`) die toegankelijk is via het wachtwoordscherm als alternatief login-pad ("Ik ben een nabestaande"). Mag geen eigenaar-login vereisen.  
**Impact:** Verlaagt navigatietijd voor nabestaanden; vermindert frustratie in crissis  
**KPI:** Time-on-task voor Shamir wizard ≤5 min (Taak 2 in UX-test)  
**Baseline:** INSUFFICIENT_DATA  
**Meetmethode:** Usability test stopwatch  
**Tijdshorizon:** Sprint UX-2  
**Prioriteit:** P1  
**Effort:** Hoog — nieuwe route + auth-flow aanpassing  

---

### REC-UX-005 — Implementeer per-categorie completeness indicators op dashboard
**Referentie:** GAP-UX-007, FP-005  
**Omschrijving:** Toon per categorie-kaart op het dashboard een completeness indicator: leeg (0%), gestart (>0%), volledig (100%). Definieer "volledig" per categorie als minimaal vereiste velden ingevuld.  
**Impact:** Geeft gebruiker richting, vermindert cognitive overload  
**KPI:** Gemiddeld percentage categorieën ingevuld per gebruiker na 30 dagen  
**Baseline:** INSUFFICIENT_DATA  
**Meetmethode:** Backend query per eigenaar (na PostHog + completeness endpoint)  
**Tijdshorizon:** Sprint UX-2  
**Prioriteit:** P2  
**Effort:** Middel  

---

### REC-UX-006 — Activeer PostHog analytics (na DPO-goedkeuring)
**Referentie:** GAP-UX-003, FP-007  
**Omschrijving:** Initieer DPO-goedkeuringsproces voor PostHog activering conform `devdocs/posthog-analytics.md`. Definieer minimale event-set: onboarding_step_completed, category_opened, export_generated, shamir_wizard_started, shamir_wizard_completed.  
**Impact:** Creëert data-gedreven feedback loop voor UX-iteratie na launch  
**KPI:** Funnel dropout-percentage per onboarding stap < 30% per stap  
**Baseline:** INSUFFICIENT_DATA  
**Meetmethode:** PostHog funnel-analyse  
**Tijdshorizon:** Pre-launch + 30 dagen post-launch  
**Prioriteit:** P2  
**Effort:** Laag technisch / Middel organisatorisch (DPO-traject)  
`OUT_OF_SCOPE: DevOps (activering CI/CD), Data Architect (DPO-gating)` — coördinatie vereist  

---

## SECTIE 9: Sprintplan

### Aannames

**Team:** Solo developer (Product Owner + Developer + Designer in één persoon)  
**Capaciteit:** 8–10 SP per sprint (UX-gerelateerd werk naast technische sprints)  
**Sprintduur:** 2 weken  
**Randvoorwaarden sprint UX-1:**  
- Shamir UX test deelnemers geworven (extern, organisatorisch)
- ShamirDialog.tsx code toegankelijk (✅ aanwezig)
- Beschikbaarheid testlocatie / screensharing  

---

### Sprint UX-1: Research uitvoering + Critical UX fixes

**Sprint doel:** Elimineer de twee KRITIEKE UX-risico's (nul user research + Shamir wizard niet gevalideerd) én lever in-app contextual help voor Shamir.

**KPI-targets:**
- Shamir wizard task completion rate ≥80% (na test)
- Shamir stress-score gemiddeld ≤4/7 (na test)

**Stories:**

| ID | Story | Type | SP | Afhankelijkheden | Blocker |
|---|---|---|---|---|---|
| SP-UX1-001 | Als product owner wil ik de Shamir UX-test uitvoeren conform het bestaande protocol zodat SYS-RISK-009 wordt gemitigeerd vóór launch | ANALYSIS | 3 | devdocs/shamir-ux-test-protocol.md gereed (✅) | EXTERN: 5 test-deelnemers werven. Eigenaar: Product Owner. Escalatie: launch blokkeren indien niet geworven. |
| SP-UX1-002 | Als nieuwe gebruiker wil ik bij de Shamir-configuratie inline uitleg zien zodat ik begrijp wat deelcodes en drempel betekenen | CODE | 2 | ShamirDialog.tsx aanwezig | NONE |
| SP-UX1-003 | Als nabestaande wil ik op het wachtwoordscherm een knop "Ik ben nabestaande" zien zodat ik direct naar de Shamir-reconstructie word geleid | CODE | 3 | `DEPENDENT_ON_TECH:` auth flow aanpassing (vereist SA input voor GAP routing) | INTERN: SA-2 checkout architectuur kent gerelateerde auth routing — overleg vereist. Eigenaar: Developer. |
| SP-UX1-004 | Als gebruiker wil ik op het dashboard een voortgangsindicatie per categorie zien zodat ik weet wat ik nog moet invullen | CODE | 2 | Completeness-query backend (nieuw endpoint) | INTERN: backendquery vereist — Developer. |

**Acceptatiecriteria SP-UX1-001:** Gegeven 5 deelnemers die het protocol volgen, wanneer allen taak 2 (Shamir wizard) uitvoeren, dan slaagt ≥4/5 zonder ondersteuning (completion ≥80%).  
**Acceptatiecriteria SP-UX1-002:** Gegeven ShamirDialog, wanneer gebruiker hover/tap op "?" naast deelcode-veld, dan verschijnt modal met uitleg van ≤50 woorden in begrijpelijk Nederlands.  
**Acceptatiecriteria SP-UX1-003:** Gegeven het wachtwoordscherm, wanneer een nabestaande op "Ik ben nabestaande" klikt, dan navigeert de app naar `/nabestaanden` route zonder eigenaar-wachtwoord vereist.  
**Acceptatiecriteria SP-UX1-004:** Gegeven het dashboard, wanneer alle verplichte velden van een categorie zijn ingevuld, dan toont de categorie-kaart een groen vinkje/100% indicator.

**Blocker Register Sprint UX-1:**

| ID | Type | Beschrijving | Eigenaar | Escalatie |
|---|---|---|---|---|
| BLK-UX1-001 | EXTERN | 5 test-deelnemers werven (40+, niet-technisch) | Product Owner | Uitgestelde launch als niet opgelost vóór sprint-einde |
| BLK-UX1-002 | INTERN | Backend completeness-endpoint voor dashboard indicators | Developer | Sprint UX-1 day 5 samenkomst met backlog prioritering |

---

### Sprint UX-2: Onboarding wizard + PostHog activering

**Sprint doel:** Elimineer onboarding-drop-off risico en creëer data feedback loop voor post-launch UX-iteratie.

**KPI-targets:**
- Onboarding wizard geïmplementeerd en manueel getest
- PostHog DPO-goedkeuringsproces gestart (eventueel niet voltooid in sprint)

**Stories:**

| ID | Story | Type | SP | Afhankelijkheden | Blocker |
|---|---|---|---|---|---|
| SP-UX2-001 | Als nieuwe gebruiker wil ik een multi-step onboarding wizard zien zodat ik stap voor stap word begeleid door de eerste setup | CODE | 4 | SP-UX1-003 (nabestaanden route) gereed | NONE |
| SP-UX2-002 | Als product owner wil ik DPO-goedkeuring initiëren voor PostHog activering zodat we na launch behavioral data kunnen verzamelen | ANALYSIS | 1 | devdocs/posthog-analytics.md + dpia-bijzondere-categorieen.md | EXTERN: DPO beschikbaarheid. Eigenaar: Product Owner. Escalatie: launch met nul analytics als niet tijdig. |
| SP-UX2-003 | Als gebruiker wil ik emotioneel zware categorieën (testament, euthanasie) inleiden met een rustige introductietekst zodat ik psychologisch voorbereid ben op de inhoud | CODE | 2 | NONE | NONE |
| SP-UX2-004 | Als product owner wil ik een minimale PostHog event set gedefinieerd hebben zodat we na activering direct UX-funnels kunnen meten | ANALYSIS | 1 | SP-UX2-002 | NONE |

**Acceptatiecriteria SP-UX2-001:** Gegeven een nieuwe gebruiker, wanneer de app voor het eerst wordt geopend, dan doorloopt de gebruiker 3 verplichte stappen (profiel, wachtwoord, Shamir) vóór het dashboard worden getoond.  
**Acceptatiecriteria SP-UX2-002:** Gegeven dat DPO-toetsverzoek is verzonden, wanneer DPO goedkeuring geeft, dan kan NEXT_PUBLIC_POSTHOG_KEY worden ingesteld conform devdocs/posthog-analytics.md.  
**Acceptatiecriteria SP-UX2-003:** Gegeven een gebruiker die `/testament` opent, wanneer de pagina laadt, dan toont de eerste seconde een rustige introductietekst (≤30 woorden) met context over why this matters.  
**Acceptatiecriteria SP-UX2-004:** Gegeven de PostHog event-definitielijst, wanneer gereed, dan bevat deze minimaal: onboarding_step_completed, shamir_wizard_started, shamir_wizard_completed, category_opened, export_generated.

**Blocker Register Sprint UX-2:**

| ID | Type | Beschrijving | Eigenaar | Escalatie |
|---|---|---|---|---|
| BLK-UX2-001 | EXTERN | DPO beschikbaarheid voor PostHog goedkeuring | Product Owner / DPO | Launch met analytics-disabled als DPO niet tijdig beschikbaar |

---

## SECTIE 10: Guardrails

### GUARD-UX-001 — Geen UX-wijziging aan Shamir wizard zonder usability test
**Referentie:** GAP-UX-002  
**Formulering:** Mag de Shamir reconstruct wizard (ShamirDialog.tsx) niet worden gewijzigd in UI/UX zonder first een verificatie dat de wijziging niet negatief scoort op task completion rate bij de doelgroep (40+, niet-technisch).  
**Scope:** Alle PR's die ShamirDialog.tsx, NabestaandenSection.tsx of gerelateerde Shamir-flows raken  
**Schending-actie:** PR geblokkeerd — escaleer naar Product Owner voor user research validatie  
**Verificatiemethode:** PR-checklist item: "Shamir UX impact beoordeeld?" — bij twijfel: usability test voor merge  
**Overlap:** Aanvulling op `04-ux-guardrails.md` (G-UX-03: kritieke user flows)

---

### GUARD-UX-002 — Geen nieuwe navigatie-item toevoegen zonder UX-architect review
**Referentie:** GAP-UX-005  
**Formulering:** Moet elk nieuw primair navigatie-item (≥ L1 navigatie) eerst worden goedgekeurd door een usability review, gegeven dat het huidige menu al 17 items bevat.  
**Scope:** Alle wijzigingen aan de (authenticated)/layout.tsx navigatiestructuur  
**Schending-actie:** Markeer als CRITICAL_FINDING in PR-review — blokkeer merge tot UX-motivatie gedocumenteerd  
**Verificatiemethode:** PR-beschrijving vereist: "Reden voor nieuw nav-item + alternatief overwogen?"  
**Overlap:** Nieuw — geen bestaand guardrail dekt navigatiecomplexiteit expliciet

---

### GUARD-UX-003 — PostHog events mogen NOOIT gevoelige data bevatten
**Referentie:** GAP-UX-003, devdocs/posthog-analytics.md GUARD-006  
**Formulering:** Mag een PostHog event nooit bevatten: naam, BSN, gezondheidsdata, financiële waarden, wachtwoordindicators, Shamir-deelcodes.  
**Scope:** Alle `posthog.capture(...)` aanroepen in codebase  
**Schending-actie:** CRITICAL_FINDING — onmiddellijke revert + DPIA-rapportage aan DPO  
**Verificatiemethode:** Code review checklist per PostHog-capture implementatie + geautomatiseerde linting (pattern check op `posthog.capture` parameters)  
**Overlap:** Aanvulling op `03-security-guardrails.md` GUARD-SEC-002 (geen PII logging) — uitgebreid naar analytics

---

### GUARD-UX-004 — Emotioneel zware categorieën vereisen respectvolle UX-copy review
**Referentie:** GAP-UX-008, FP-006  
**Formulering:** Moeten alle content-toevoegingen of wijzigingen in routes `/testament`, `/euthanasie`, `/uitvaart`, `/donor` worden gereviewed door een UX-copywriter of product owner met oog op toon (respectvol, niet klinisch).  
**Scope:** Copy in formulierlabels, validatiefouten, helptext, introductieteksten  
**Schending-actie:** Escaleer naar UX Researcher / Product Owner voor copy review  
**Verificatiemethode:** Sprint Definition of Done bevat: "Copy in emotioneel gevoelige categorieën goedgekeurd?"  
**Overlap:** Nieuw guardrail — geen equivalent in bestaande docs

---

## HANGOFF CHECKLIST — UX Researcher — 2026-03-01

- [x] Onderzoeksdata inventarisatie compleet — NULSTAND gedocumenteerd
- [x] Persona's/gebruikerssegmenten alleen op basis van data — `INSUFFICIENT_DATA:` + `HEURISTISCH:` labels consequent gebruikt
- [x] User journeys gedocumenteerd voor alle primaire flows — 3 journeys (onboarding, inhoud, nabestaanden)
- [x] Task success rate gedocumenteerd — alle als `INSUFFICIENT_DATA:` gemarkeerd
- [x] Friction points geïnventariseerd met bronvermelding — 8 FP's, alle met bron
- [x] Technische haalbaarheidscheck uitgevoerd — alle FP's gelinkt aan technische context/agent
- [x] Alle empirische claims duidelijk gelabeld — `HEURISTISCH:` of `CROSS_AGENT_INPUT:` aanwezig
- [x] Zelfcontrole uitgevoerd
- [x] Aanbevelingen: elke aanbeveling verwijst naar GAP/RISK analyse-bevinding ✅
- [x] Aanbevelingen: alle impact-velden gevuld of als `INSUFFICIENT_DATA:` gemarkeerd ✅
- [x] Aanbevelingen: alle meetcriteria zijn SMART ✅
- [x] Sprintplan: aannames (team, capaciteit, randvoorwaarden) gedocumenteerd ✅
- [x] Sprintplan: alle stories hebben minimaal 1 acceptatiecriterium ✅
- [x] Guardrails: alle guardrails zijn testbaar geformuleerd ✅
- [x] Guardrails: alle guardrails hebben schending-actie én verificatiemethode ✅
- [x] Guardrails: alle guardrails verwijzen naar GAP/RISK analyse-bevinding ✅
- [x] Alle 4 deliverables aanwezig: Analyse ✓ Aanbevelingen ✓ Sprintplan ✓ Guardrails ✓

**STATUS: GEREED VOOR HANDOFF**  
**Overdracht aan:** UX Designer (11)
