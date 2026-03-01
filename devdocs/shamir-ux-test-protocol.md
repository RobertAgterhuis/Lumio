# Shamir UX — Formeel Gebruikerstest Protocol

> **SYS-RISK-009** | Score 6 (3×2) | Prioriteit: Midden  
> Doel: Reduceer SYS-RISK-009 naar score ≤3 door een formele UX-test aan te tonen dat het Shamir-reconstructie-proces betrouwbaar uitvoerbaar is onder emotionele druk.

---

## Aanleiding

De Shamir Secret Sharing wizard (nabestaanden-modus) is technisch geïmplementeerd en geïntegreerd:

- `ShamirDialog.tsx` — multi-step reconstruct workflow (drempel + delen invoer)
- `NabestaandenSection.tsx` — productpagina instructies (3 stappen uitgelegd)
- `ShamirService.cs` — crypto-laag (`SecretSharingDotNet`)

**Restrisico:** Er is nog geen empirisch bewijs dat nabestaanden (niet-technische gebruikers, in crisissituatie, kort na overlijden) de wizard snel en foutloos kunnen gebruiken.

---

## Testdoelen

| Nr | Doel | Succescriterium |
|----|------|-----------------|
| T-01 | Deelnemer vindt de deelcodes in 2 minuten terug | 80% slaagt zonder ondersteuning |
| T-02 | Deelnemer voert drempel correct in | 0 fouten bij 3 van 3 pogingen |
| T-03 | Deelnemer rondt de wizard volledig af | Completion rate ≥80% |
| T-04 | Perceived stress < 4/7 na afloop | Gemiddeld Likert-score ≤4 |
| T-05 | Geen noodzaak voor support-contact | 0 support-verzoeken tijdens test |

---

## Deelnemersprofiel

| Criterium | Waarde |
|-----------|--------|
| Aantal | 5 personen (minimum) |
| Leeftijd | 40+ (vertegenwoordigt nabestaanden-doelgroep) |
| Technische achtergrond | Laag tot midden (geen IT-professionals) |
| Lumio ervaring | Geen of minimaal — simuleer eerste aanraking |
| Exclusie | Mensen in actief rouwproces |

---

## Testomgeving

- **Platform**: Lumio Electron-app (Windows) of staging-web (`site/`)
- **Testdata**: Aangemaakt door testleider — profiel met 3 Shamir-delen, drempel 2
- **Deelcodes**: Uitgeprint op A4 met Lumio-branding (simuleer echte instructie-envelop)
- **Scenario-briefing**: "Je partner is zojuist onverwacht overleden. Je wil toegang tot zijn/haar Lumio-gegevens om de uitvaart te regelen."
- **Observatie**: Schermopname + think-aloud protocol (mondeling)
- **Duur**: 15–20 minuten per deelnemer

---

## Testscript (stap-voor-stap)

### Voorbereiding (testleider)

1. Open Lumio-app in nabestaanden-modus
2. Zorg dat ShamirDialog bereikbaar is via: **Instellingen → Nabestaanden → Toegang aanvragen**
3. Print 3 deelcodes op afzonderlijke papieren (of toon één voor één op scherm)
4. Bereid de screenrecorder voor (OBS, Loom of Teams-opname)

### Introductie (2 min)

> *"We testen de software, niet jou. Er zijn geen foute antwoorden. Vertel hardop wat je denkt en doet."*

Overhandig scenario-briefing. Beantwoord geen inhoudelijke vragen over het gebruik.

### Taak 1 — Navigeer naar de nabestaanden-wizard (3 min)

- Start: home-scherm na inlog
- Doel: deelnemer navigeert naar de Shamir-reconstructie
- Let op: ontdekbaarheid van de knop/ingang

### Taak 2 — Voer drempel en deelcodes in (5 min)

- Overhandig de geprinte deelcodes (2 van 3)
- Doel: deelnemer vult drempel (2) en beide codes in
- Let op: foutmeldingen, verwarring over volgorde

### Taak 3 — Beoordeling na afloop (5 min)

Stel na succesvolle of mislukte afronding:

1. *"Wat was het meest verwarrende moment?"*
2. *"Op een schaal 1–7, hoe stressvol was dit proces?"* (1 = helemaal niet, 7 = extreem)
3. *"Wat zou je veranderen aan de instructies?"*

---

## Metrieken en registratie

| Metriek | Hoe meten | Drempel |
|---------|-----------|---------|
| Task completion rate | Observatie: wizard volledig doorlopen | ≥80% |
| Time-on-task | Stopwatch per taak | ≤5 min voor Taak 2 |
| Foutrate | Aantal incorrecte invoeringen | ≤1 per deelnemer |
| Stress-score | Likert 1–7 na afloop | Gemiddeld ≤4 |
| Kritische events | Doodlopende paden, app-crash | 0 crashes |

---

## Rapportagetemplate

Na voltooiing van alle sessies:

```markdown
## Shamir UX Test Resultaten

Datum: [DATUM]
Aantal deelnemers: [N]

| Metriek | Resultaat | Norm | Status |
|---------|-----------|------|--------|
| Task completion rate | [X]% | ≥80% | PASS / FAIL |
| Gemiddelde tijd Taak 2 | [X] min | ≤5 min | PASS / FAIL |
| Gemiddelde foutrate | [X] | ≤1 | PASS / FAIL |
| Gemiddelde stress-score | [X]/7 | ≤4 | PASS / FAIL |
| Kritische events | [X] | 0 crashes | PASS / FAIL |

### Top-3 usability issues
1. ...
2. ...
3. ...

### Aanbeveling
[ ] Wizard is productiegereeed — SYS-RISK-009 gesloten
[ ] Aanpassingen vereist vóór sluiting — zie issues hierboven
```

---

## Aanbevelingen na test

Afhankelijk van resultaten:

| Uitkomst | Actie |
|----------|-------|
| Alle metrieken PASS | Markeer SYS-RISK-009 als GESLOTEN in `re-evaluation-report-v2.md` |
| Completion rate &lt;80% | Verbeter wizard onboarding text; hertest |
| Stress-score &gt;4 | Voeg emotionele ondersteuning toe (telefoonnummer, rustigere tone-of-voice) |
| Foutrate &gt;1 | Verbeter foutmeldingen / inline validatie in `ShamirDialog.tsx` |

---

## Verantwoordelijke

| Rol | Persoon | Status |
|-----|---------|--------|
| Testleider | PO (= développeur) | Plannen |
| Recrutering deelnemers | PO | Te starten |
| Rapportage | PO | Na testdatum |

---

## Status

- [ ] Deelnemers gerecruteerd
- [ ] Testdatum vastgesteld
- [ ] Testomgeving gereed (testprofiel aangemaakt, deelcodes geprint)
- [ ] Sessies uitgevoerd (0/5)
- [ ] Resultatenrapport gepubliceerd
- [ ] SYS-RISK-009 bijgewerkt in re-evaluatierapport
