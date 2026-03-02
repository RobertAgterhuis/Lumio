# Analyse – UX Research (UX Researcher) – 2026-03-02
> UX Researcher | Agent 10 | Fase 3

## Metadata
- Agent: UX Researcher (10)
- Fase: 3
- Input ontvangen: Fase 1 (INSUFFICIENT_DATA — Fase 1 niet uitgevoerd in deze COMBO_AUDIT) + Fase 2 volledige output
- Datum: 2026-03-02

---

## 1. Onderzoeksdata Inventarisatie

| Data-type | Status | Impact op analyse |
|---|---|---|
| Usability test resultaten | `INSUFFICIENT_DATA:` — geen uitgevoerde testresultaten aangetroffen | Alle usability-claims zijn heuristisch; empirische validatie vereist |
| Analytics data (PostHog funnels/drop-offs) | `INSUFFICIENT_DATA:` — pre-launch; PostHog actief maar geen historische event-data beschikbaar | Activation funnel niet meetbaar |
| Session recordings | `INSUFFICIENT_DATA:` — geen opnames | — |
| User interviews / surveys | `INSUFFICIENT_DATA:` — geen aangetroffen | — |
| Support tickets | `INSUFFICIENT_DATA:` — pre-launch | — |
| Formeel testprotocol | ✓ AANWEZIG — `devdocs/shamir-ux-test-protocol.md` | Testprotocol gereed MAAR niet uitgevoerd (0/5 sessies) |
| Activatiedefinitie | ✓ AANWEZIG — `devdocs/activation-definition.md` | Activatieratio KPI gedefinieerd (target ≥50/30 dgn) |

**Consequentie:** Alle observaties in deze analyse zijn **heuristisch** (op basis van codebase + domeinkennis). Geen enkele bewering is gebaseerd op empirische gebruikersdata. Label: `HEURISTIC:` wordt gebruikt voor alle onbekende gebruikersgedrag-claims.

**Bron:** workspace-scan, `devdocs/shamir-ux-test-protocol.md` L1-50

---

## 2. User Persona Validatie

`INSUFFICIENT_DATA:` — Fase 1 (Business & Strategie) is niet uitgevoerd in deze COMBO_AUDIT. Geen formele persona-documenten beschikbaar.

**Afleiding uit codebase (heuristisch):**

| Persona | Heuristisch bewijs | Risico |
|---|---|---|
| **Eindgebruiker (Erflater)** — volwassen Nederlands (40-70 jr), niet technisch, maakt dossier aan | NL/EN i18n, offline-first, Electron (geen cloud), emotionele domein-naming (uitvaart, testament) | INSUFFICIENT_DATA op leeftijd, tech-savviness |
| **Nabestaande** — familie-lid dat na overlijden toegang nodig heeft | Shamir-reconstructie flow, `NabestaandenSection.tsx`, test-protocol deelnemersprofiel: 40+ laag-tech | SYS-RISK-009: geen empirisch bewijs dat flow bruikbaar is |

**Bron:** `devdocs/shamir-ux-test-protocol.md` L34-38 (deelnemersprofiel)

---

## 3. User Journey Mapping

### Journey A: Onboarding (Erflater maakt dossier aan)

| Stap | Scherm/Component | Heuristisch pijnpunt | Ernst |
|---|---|---|---|
| 1. App openen | Unlock-scherm (masterpassword) | HEURISTIC: Complex wachtwoord vereist; geen biometrische optie | Midden |
| 2. Profiel invullen | Wizard stap `profiel` | BSN-veld aanwezig maar optioneel — onduidelijkheid over noodzaak | Laag |
| 3. Noodcontacten | Wizard stap `noodcontacten` | HEURISTIC: "minimaal 1 contactpersoon" — drempel onduidelijk voor gebruiker | Laag |
| 4. Testament | Wizard stap `testament` | `INSUFFICIENT_DATA:` — component niet geïnspecteerd | UNCERTAIN |
| 5. Uitvaartwensen | Wizard stap `uitvaart` | HEURISTIC: emotioneel zwaar onderwerp vroeg in de flow | Hoog |
| 6. Erfgenamen + Shamir | Wizard stap `sleutels` | SYS-RISK-009: **Kritiek UX-risico** — Shamir-concept begrijpen voor niet-technische gebruikers | Kritiek |
| 7. Backup | Wizard stap `backup` | HEURISTIC: Backup-instructie vereist actie buiten de app (USB, cloud-keuze) | Midden |
| Activatie | `lumio_activated` event | HEURISTIC: geen celebration/confirmatie-moment na volledige activatie | Laag |

**Bron:** `devdocs/activation-definition.md` L13-22, `devdocs/shamir-ux-test-protocol.md`

### Journey B: Shamir Reconstructie (Nabestaande gebruikt dossier na overlijden)

| Stap | Scherm/Component | Heuristisch pijnpunt | Ernst |
|---|---|---|---|
| 1. App opstarten | Normaal opstartscherm | HEURISTIC: Nabestaande kent app niet; ingang niet direct zichtbaar | Kritiek |
| 2. Nabestaanden-modus vinden | `NabestaandenSection.tsx` | Ontdekbaarheid — hoe weet nabestaande dat nabestaanden-modus bestaat? | Kritiek |
| 3. ShamirDialog openen | `ShamirDialog.tsx` | Multi-step wizard; deelcodes invoeren | Hoog — SYS-RISK-009 |
| 4. Drempel begrijpen | ShamirDialog (drempel-invoerveld) | HEURISTIC: "Drempel" concept technisch — gebruiker begrijpt niet wat een drempel is | Hoog |
| 5. Deelcodes invoeren | ShamirDialog | Foutmeldingen bij verkeerde code? Volgorde-verwarring? | Hoog — SYS-RISK-009 |
| 6. Toegang verkregen | Ontgrendeld profiel | HEURISTIC: Wat ziet nabestaande na unlock? Navigatie onduidelijk? | Midden |

**HEURISTIC:** Alle bovenstaande journey-claims zijn observationeel — niet empirisch gevalideerd.  
**SYS-RISK-009 STATUS:** Open. Test niet uitgevoerd (0/5 sessies).

---

## 4. Task Success Rate Analyse

| Primaire Taak | Meetbaar | Baseline Success Rate | Obstructies |
|---|---|---|---|
| Dossier activeren (7/7 stappen) | Ja via PostHog | `INSUFFICIENT_DATA:` — pre-launch | Shamir-stap (sleutels) is known drop-off risk |
| Nabestaanden-reconstructie | Nee — niet gemeten | `INSUFFICIENT_DATA:` | SYS-RISK-009 open |
| PDF-rapport genereren | `INSUFFICIENT_DATA:` | `INSUFFICIENT_DATA:` | — |
| Videoboodschap opnemen | `INSUFFICIENT_DATA:` | `INSUFFICIENT_DATA:` | — |

---

## 5. Friction Point Inventarisatie

| ID | Pijnpunt | Impact | Frequentie | Bron |
|---|---|---|---|---|
| FP-001 | Shamir-concept uitleg onvoldoende voor niet-technische gebruikers (drempel, deelcodes) | Kritiek — blokkeert wizard-voltooiing voor segment | `INSUFFICIENT_DATA:` | `devdocs/shamir-ux-test-protocol.md` — SYS-RISK-009 |
| FP-002 | Emotionele timing: uitvaartwensen invullen vroeg in onboarding flow zonder context | Hoog — kan flow-afbraak veroorzaken | `INSUFFICIENT_DATA:` | HEURISTIC: domeinkennis + activation-definition.md |
| FP-003 | Nabestaanden-modus ontdekbaarheid: geen prominente alternative-entry voor nabestaanden | Kritiek — nabestaande kan app niet gebruiken zonder expliciet weten van de modus | `INSUFFICIENT_DATA:` | HEURISTIC: component-structuur |
| FP-004 | Backup-stap vereist externe actie (USB/cloud-beslissing) op een emotioneel moment | Midden — kan wizard-afronding vertragen | `INSUFFICIENT_DATA:` | HEURISTIC: activation-definition.md stap 7 |
| FP-005 | Geen activatie-celebration na 7/7 stappen — verlies van positief bekrachtigingsmoment | Laag | `INSUFFICIENT_DATA:` | HEURISTIC |
| FP-006 | Masterpassword zonder biometrische optie — friction bij herhaaldelijk openen | Midden | `INSUFFICIENT_DATA:` | HEURISTIC |

---

## 6. Technische Haalbaarheidscheck

| Friction Point | Technisch haalbaar? | Dependency |
|---|---|---|
| FP-001: Shamir uitleg verbeteren | ✓ JA — copy/UI-aanpassing | UX Designer + copywriter |
| FP-002: Volgorde uitvaartwensen | ✓ JA — wizard-volgorde aanpassen | CODE: `OnboardingWizard.tsx` |
| FP-003: Nabestaanden-modus ontdekbaarheid | ✓ JA — UI-aanpassing Electron login-scherm | CODE: Electron main + login screen |
| FP-004: Backup step guidance | ✓ JA — in-app uitleg verbeteren | UX Designer |
| FP-005: Activatie celebration | ✓ JA — low effort UI-toevoeging | CODE: `OnboardingWizard.tsx` |
| FP-006: Biometrie | `DEPENDENT_ON_TECH:` Electron biometrische integratie (Windows Hello / TouchID) — medium effort | CODE: Electron main + OS API |

---

## 7. Gaps & Risico's

| ID | Omschrijving | Ernst |
|---|---|---|
| GAP-UX-001 | Geen uitgevoerde gebruikersonderzoeken — alle UX-claims zijn heuristisch | Hoog |
| GAP-UX-002 | Shamir UX-test niet uitgevoerd (SYS-RISK-009 open) | Kritiek |
| GAP-UX-003 | OnboardingWizard niet gevalideerd met echte gebruikers | Hoog |
| GAP-UX-004 | Nabestaanden-modus ontdekbaarheid niet getest | Hoog |
| RISK-UX-001 | Shamir reconstructie mislukt voor nabestaanden onder emotionele druk → data permanent ontoegankelijk | Kritiek |
| RISK-UX-002 | Onboarding drop-off door emotionele timing van uitvaartwensen → activatieratio onder target (50%) | Hoog |

---

## 8. KPI Baseline

| KPI | Waarde | Methode |
|---|---|---|
| Activatieratio | `INSUFFICIENT_DATA:` — pre-launch | PostHog `lumio_activated` events |
| Shamir-test uitgevoerd | 0/5 sessies | `shamir-ux-test-protocol.md` status |
| Task success Shamir | `INSUFFICIENT_DATA:` | Formeel test per protocol |
| Friction points geïdentificeerd (heuristisch) | 6 | Deze analyse |

---

## HANDOFF CHECKLIST — Analyse UX Researcher
- [x] Onderzoeksdata inventarisatie compleet (INSUFFICIENT_DATA correct gemarkeerd)
- [x] HEURISTIC labels aanwezig op alle empirisch niet-onderbouwde claims
- [x] User journey mapping voor twee primaire flows
- [x] SYS-RISK-009 doorgeleid als kritiek UX-risico
- [x] Technische haalbaarheid gecontroleerd per friction point
- [x] Status: READY voor UX Researcher Aanbevelingen
