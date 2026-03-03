# Financial Model Overview
> Version: v2 | Last updated: 2026-03-03T00:00:00Z | Status: APPROVED — PO
> Source phases: Phase 1 audit + PO decision SP-1-012
> Completeness: 80% — Revenue model, pricing, tiers, and B2B proposition confirmed by PO. Cost structure and KPI targets remain partially estimated; full KPI baseline tracked in sprint reports.

---

## Revenue Model

**Model type:** One-time perpetual licence — geen abonnement, geen freemium.

Lumio kiest bewust voor een eenmalige aankoop in plaats van een maandelijkse abonnementsstructuur. De kernredenen:

1. **Product-markt fit:** De doelgroep (40–65 jaar, nalatenschapsplanning) heeft weerstand tegen terugkerende kosten voor persoonlijke documenten. Men verwacht dit eenmalig in orde te maken — niet maandelijks te beheren.
2. **Privacy-positionering:** Een abonnementsmodel vereist een actieve klantrelatie en betaalverwerking die botst met de offline-first architectuur en het *zero-cloud* principe.
3. **WKR-compatibiliteit (B2B):** Een eenmalige kosten per werknemer is direct te verwerken als onbelaste vergoeding via de werkkostenregeling (WKR). Een abonnement complicerende de administratie voor HR.
4. **Concurrentiedifferentiatie:** Alle directe cloud-alternatieven werken met subscriptions. Eenmalig €125 is een krachtig onderscheidend punt.

**Huidige status:** Pre-revenue. Geen betaalintegratie aanwezig in de codebase (vastgesteld in Phase 1 audit). Activering van betaalmuur is een Post-Sprint-1 prioriteit.

---

## Pricing Structure

### Tiers

| Tier | Doelgroep | Prijs | Kanaal | Notities |
|------|-----------|-------|--------|----------|
| **Lumio Persoonlijk** | B2C — individu | **€125 eenmalig** | Direct (website) | Volledige functionaliteit, één profiel |
| **Lumio Gezin** | B2C — huishouden | **€175 eenmalig** | Direct (website) | Tot 3 profielen (bijv. gebruiker + partner) |
| **Lumio Zakelijk** | B2B — werkgever | **€125 p.p. eenmalig** | Direct outreach / HR-netwerken | Per werknemer; whitelabel optioneel; WKR-passend |

> **Noot prijsbepaling:** €125 is de ankerprijs die consistent wordt gebruikt in alle positioneringsdocumenten en de site-copy. Dit tarief is bewust gelijkgehouden tussen B2C en de B2B per-employee rate zodat werkgevers geen meerprijs hoeven te rechtvaardigen versus directe aanschaf.

### Wat is inbegrepen bij alle tiers

- Volledige toegang tot alle modules (testament, wilsverklaring, donorregistratie, digitaal bezit, erfgenamen, videoboodschappen, export)
- Shamir Secret Sharing toegangsbeheer
- Toekomstige updates voor de aangekochte major versie
- Nederlandse en Engelse interface

### Wat is **niet** inbegrepen

- Cross-device synchronisatie (architectureel uitgesloten — bewuste keuze)
- Cloud backup (zelfverantwoordelijkheid gebruiker)
- Notarieel advies of juridische services

---

## B2B-propositie

### Wie betaalt?

De **werkgever** betaalt Lumio namens de werknemer. Dit verloopt via de **Werkkostenregeling (WKR)** als onbelaste vergoeding in natura. De fiscale ruimte voor WKR-vergoedingen is 1,7% van de eerste €400.000 loonsom + 1,18% daarboven (cijfers 2025). Een eenmalige licentiebetaling van €125 per werknemer past ruimschoots binnen dit budget voor de meeste werkgevers.

### Wat krijgt de werkgever?

| Deliverable | Details |
|-------------|---------|
| Licentiecodes | Unieke activatiecode per werknemer; distribueren via HR-portaal of e-mail |
| Whitelabel branding | Bedrijfslogo en naam in de applicatie-headerbar; configureerbaar via `tools/whitelabel/` |
| Bulk-onboarding flow | Werknemers doorlopen een vereenvoudigde `partner-onboarding` route met bedrijfsnaam pre-ingevuld |
| Rapportage | INSUFFICIENT_DATA: activatiedashboard voor werkgevers bestaat nog niet — Post-Sprint-1 roadmap item |
| Geen IT-project | Standalone desktop app — geen SSO vereist, geen IT-afdeling nodig |

### Wat krijgt de werknemer?

Dezelfde product-ervaring als Lumio Persoonlijk, aangevuld met:
- Bedrijfsnaam zichtbaar als "aangeboden door [Werkgever]" in de app
- Optionele noodcontact-QR voor in personeelsdossier
- Handleiding op naam van de werkgever (optioneel via whitelabel config)

### B2B-beslissers

| Rol | Motivatie |
|-----|-----------|
| HR Director / Head of Benefits | Onderscheidende employee benefit, past in wellbeing-budget, geen beheerlast |
| CFO | WKR-passend, eenmalige kosten, geen jaarlijkse budgetpost |
| CEO / Employer Brand | ESG/employer branding — Lumio als bewijs van zorgzame werkgever |

### Minimale contractgrootte

Geen formele minimum; commercieel interessant vanaf **25 werknemers** (€3.125 per cohort). Doelgroep: Nederlandse MKB en mid-market (25–500 medewerkers).

---

## Kosten­structuur

| Kostenpost | Schatting | Zekerheid | Bron |
|------------|-----------|-----------|------|
| GitHub Actions CI | Gepauzeerd (billing limiet bereikt 2026-03-02); heractivering gepland | HOOG | DEC-110 |
| Chromatic visual testing | Uitgeschakeld (DEC-101) | HOOG | `decisions.md` |
| PostHog analytics | Gratis plan (EU-hosted) | HOOG | `devdocs/posthog-analytics.md` |
| Domein + hosting marketing site | INSUFFICIENT_DATA (Q-04-001) | — | — |
| Code signing (EV-certificaat) | Uitgesteld (DEC-201) — vereist vóór public launch | HOOG | `decisions.md` |
| Penetratietest | Uitgesteld (DEC-202) — vereist vóór public launch | HOOG | `decisions.md` |
| Betaalverwerking (Stripe/Mollie) | ~1,4–1,9% + €0,25 per transactie | MEDIUM | Marktstandaard NL |
| Ontwikkeltijd (founder) | INSUFFICIENT_DATA (Q-04-003) | — | — |

**Totale geschatte maandelijkse cashuitgaven (infrastractuur + SaaS):** INSUFFICIENT_DATA — naar verwachting < €50/maand in pre-revenue fase; domein en code-signing zijn eenmalige kosten.

---

## KPI Baseline

| KPI | Huidige waarde | Target | Notities |
|-----|---------------|--------|---------|
| Maandelijkse infrastructuurkosten | < €50 (schatting) | < €200 bij 500 gebruikers | Op te volgen na heractivering CI |
| Maandelijkse omzet | €0 (pre-revenue) | €5.000/maand binnen 6 mnd na launch | Richtgetal; validatie via eerste B2B-deal |
| Break-even maandelijkse omzet | INSUFFICIENT_DATA (Q-04-006) | TBD | Afhankelijk van feitelijke vaste lasten + dev-uren |
| B2B-contracten getekend | 0 | ≥ 1 vóór v1.0 public launch | Vereiste per REC-SALES-001 |
| Gemiddelde contractwaarde B2B | n.v.t. | €3.000–€7.500 (25–60 medewerkers) | Aanname op basis van targetsegment |
| LTV B2C | n.v.t. | €125 (eenmalig, geen churn) | Voordeel one-time model: geen churn-risico |
| Conversie website → aankoop | 0% (geen betaalmuur) | ≥ 2% van organisch verkeer | Post-Sprint-1 actie |

---

## Financiële risico's

| Risk ID | Omschrijving | Ernst | Status |
|---------|-------------|-------|--------|
| FIN-RISK-001 | Geen betaalintegratie in codebase | CRITICAL | Open — Post-Sprint-1 prioriteit |
| FIN-RISK-002 | Geen getekende B2B-overeenkomsten | HIGH | Open — actief prospecteren vereist |
| FIN-RISK-003 | CI billing limiet — dev-velocity risico | HIGH | Tijdelijk gemitigeerd door DEC-110; heractivering gepland |
| FIN-RISK-004 | Ontwikkeltijd niet geboekt — echte kostprijs onbekend | HIGH | INSUFFICIENT_DATA (Q-04-003) |
| FIN-RISK-005 | Geen externe financiering bevestigd — runway onbekend | MEDIUM | INSUFFICIENT_DATA (Q-04-004) |
| FIN-RISK-006 | Geen lauchdatum — marketing- en investeringstiming onzeker | MEDIUM | Sprint 1 stabiliseert basis; lauchdatum nog te bepalen |
| FIN-RISK-007 | Geen activatiedashboard voor B2B-werkgevers | LOW | Roadmap — niet blokkerend voor eerste deals |

---

## Goedkeuring

| | |
|---|---|
| **Opgesteld door** | PO — SP-1-012 (2026-03-03) |
| **Status** | APPROVED |
| **Volgende review** | Bij eerste B2B-deal of lauchdatum vastgesteld |

---

<details>
<summary>Versiehistorie</summary>

| Versie | Datum | Wijziging |
|--------|-------|-----------|
| v1 | 2026-03-03 | Initiële draft door audit-systeem (Phase 1) — INSUFFICIENT_DATA op alle revenue-velden |
| v2 | 2026-03-03 | Volledig bijgewerkt door PO (SP-1-012) — revenue model definitief vastgesteld: one-time €125, tiers, B2B-propositie, geen freemium/abonnement |

</details>
