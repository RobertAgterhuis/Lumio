# Vragenlijst — Fase 3 UX & Product Experience: Content & Lokalisatie
**Project:** Lumio  
**Aangemaakt door:** Questionnaire Agent (overeenkomstig `docs/contracts/questionnaire-output-contract.md`)  
**Datum:** 2026-07-14  
**Bron:** `BusinessDocs/Phase3-UX/phase3-analysis.md` — Agent 32 Content Strategist + Agent 35 Localization Specialist  
**Status:** OPEN

---

## Instructies voor de invuller

Deze vragen betreffen de teksten, inhoudsstrategie en meertalige ondersteuning van Lumio.

---

## VEREISTE vragen

### Q-UX-C-001 — Activatiebevestiging (wizard voltooid)
**Achtergrond:** Na voltooiing van de 7-staps OnboardingWizard vuurt het `lumio_activated` PostHog-event. Het is onbekend of er ook een in-app bevestigingsstatus of successcherm aanwezig is.

**Vraag:** Wat ziet de gebruiker na het voltooien van de OnboardingWizard? Is er een expliciete succesbevestiging, felicitatietekst of een eerste-stap-suggestie in de applicatie?

**Gewenste informatie:** Screenshot of beschrijving van de status na activatie; aanwezigheid van een volgende-stap CTA.

---

### Q-UX-C-002 — Begeleiding na generatie Shamir noodcodes
**Achtergrond:** Het Shamir-sleuteldistributieproces is kritiek: als erfgenamen de noodcodes niet ontvangen, is toegang na overlijden onmogelijk. In de codebase is geen bevestigde in-app begeleiding gevonden na de sleutelgeneratiestap.

**Vraag:** Welke in-app begeleiding krijgt de gebruiker nádat de Shamir noodcodes zijn gegenereerd? Wordt er expliciet uitgelegd dat de codes direct verspreid moeten worden naar de erfgenamen, en hoe?

**Gewenste informatie:** Tekst of beschrijving van de post-sleutel-generatiestap; aanwezigheid checklist, herinnering of bevestigingsdialoog voor kopiëren/verspreiden van codes.

---

## OPTIONELE vragen

### Q-UX-C-003 — Content-eigenaarschap
**Achtergrond:** Er is geen content governance-proces of verantwoordelijke voor de NL/EN vertalingen geïdentificeerd. Vertalingen worden handmatig beheerd via JSON-bestanden in git.

**Vraag:** Wie is verantwoordelijk voor het bijhouden en reviewen van de NL en EN vertalingen (nl.json, en.json)? Is er een proces voor het signaleren van verouderde of ontbrekende vertalingen?

---

### Q-UX-L10N-001 — Synchronisatie NL/EN vertalingen
**Achtergrond:** De existentie van beide `nl.json` en `en.json` is bevestigd. Of beide bestanden up-to-date en gesynchroniseerd zijn, is onbekend.

**Vraag:** Is er een script of proces dat valideert of alle sleutels in `nl.json` ook aanwezig zijn in `en.json` (en vice versa)? Worden onvertaalde sleutels in de EN versie gesignaleerd vóór een release?

---

### Q-UX-L10N-002 — Uitbreiding naar andere talen
**Achtergrond:** De lokalisatie-architectuur (next-intl, ICU pluralization) is technisch gereed voor extra talen. Er is geen marktuitbreidingsplan gevonden voor DE, FR of andere EU-talen.

**Vraag:** Zijn er concrete plannen om Lumio binnen de komende 12 maanden uit te breiden naar Duits, Frans, of andere EU-talen? Zo ja, welke talen hebben prioriteit?

---

## Status tracking

| Q-ID | Status | Beantwoord door | Datum |
|------|--------|----------------|-------|
| Q-UX-C-001 | OPEN | — | — |
| Q-UX-C-002 | OPEN | — | — |
| Q-UX-C-003 | OPEN | — | — |
| Q-UX-L10N-001 | OPEN | — | — |
| Q-UX-L10N-002 | OPEN | — | — |
