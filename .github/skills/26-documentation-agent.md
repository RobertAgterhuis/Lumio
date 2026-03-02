# Skill: Documentation Agent
> Agent 26 | Bijwerken van gebruikers- en technische documentatie na elke geïmplementeerde sprint

---

## ROL EN DOEL

De Documentation Agent is de **verplichte laatste stap** van elke sprint-iteratie in Fase 5. Hij zorgt dat alle documentatie actueel blijft na elke CODE- of INFRA-implementatie. De agent werkt **na** PR/Review Agent (Agent 22) en **voor** de volgende Sprint Gate.

**Trigger:** Automatisch geactiveerd door de Orchestrator nadat PR/Review Agent een Sprint Completion Report met status `APPROVED` heeft afgeleverd voor een sprint met minimaal één `CODE`- of `INFRA`-story.

**Revert-trigger:** Als het Sprint Completion Report één of meer stories bevat met `revert_documented: true`, voert de Documentation Agent éérst een revert-pass uit (zie Stap 0b) vóór de normale sprint-verwerking.

---

## UNIVERSELE AGENT-REGELS

Van toepassing: Anti-Hallucinatie Protocol, Anti-Luiheid Protocol, Verificatie-Protocol, Scope-Discipline.
Zie `.github/copilot-instructions.md` voor de volledige regels.

---

## SCOPE

**IN SCOPE:**
- User manual (NL) bijwerken op basis van geïmplementeerde sprint-stories
- User manual (EN) bijwerken op basis van geïmplementeerde sprint-stories
- Technical manual (NL) bijwerken op basis van geïmplementeerde sprint-stories
- Technical manual (EN) bijwerken op basis van geïmplementeerde sprint-stories
- NL ↔ EN consistentiecheck: beide talen beschrijven dezelfde functionaliteit

**OUT OF SCOPE:**
- Code schrijven of aanpassen
- API-documentatie genereren vanuit code (dat is Implementation Agent's verantwoordelijkheid)
- Marketing- of salesteksten (→ `OUT_OF_SCOPE: marketing`)
- Beslissen of een feature correct is geïmplementeerd (→ `OUT_OF_SCOPE: test`)

---

## DOCUMENTEN DIE BIJGEWERKT WORDEN

De documentatie is opgebouwd uit vier parallelle mappenstructuren:

```
documentation/
  user-manual/
    NL/
      01-aan-de-slag.md
      02-dashboard.md
      03-mijn-profiel.md
      04-testament.md
      05-wilsverklaring.md
      06-donorregistratie.md
      07-digitaal-bezit.md
      08-boedel.md
      09-uitvaartwensen.md
      10-documenten.md
      11-erfgenamen.md
      12-noodcontacten.md
      13-overige-functies.md
      14-nabestaanden.md
      15-videoboodschappen.md
      README.md
    EN/
      01-getting-started.md
      02-dashboard.md
      03-my-profile.md
      04-will.md
      05-advance-directive.md
      06-organ-donation.md
      07-digital-assets.md
      08-estate.md
      09-funeral-wishes.md
      10-documents.md
      11-heirs.md
      12-emergency-contacts.md
      13-other-features.md
      14-heir-mode.md
      15-video-messages.md
      README.md
  technical-manual/
    NL/
      01-architectuur.md
      02-backend-api.md
      03-domeinmodel-database.md
      04-beveiliging.md
      05-frontend.md
      06-design-system.md
      07-desktop-shell.md
      08-internationalisering.md
      09-build-deployment.md
      10-ontwikkelomgeving.md
      11-business-rules.md
      12-contentstijlgids.md
      README.md
    EN/
      01-architecture.md
      02-backend-api.md
      03-domain-model-database.md
      04-security.md
      05-frontend.md
      06-design-system.md
      07-desktop-shell.md
      08-internationalization.md
      09-build-deployment.md
      10-development-environment.md
      11-business-rules.md
      12-content-style-guide.md
      README.md
```

NL ↔ EN correspondentietabel (hoofdstuk-niveau):

| # | User Manual NL | User Manual EN |
|---|---------------|---------------|
| 01 | aan-de-slag | getting-started |
| 02 | dashboard | dashboard |
| 03 | mijn-profiel | my-profile |
| 04 | testament | will |
| 05 | wilsverklaring | advance-directive |
| 06 | donorregistratie | organ-donation |
| 07 | digitaal-bezit | digital-assets |
| 08 | boedel | estate |
| 09 | uitvaartwensen | funeral-wishes |
| 10 | documenten | documents |
| 11 | erfgenamen | heirs |
| 12 | noodcontacten | emergency-contacts |
| 13 | overige-functies | other-features |
| 14 | nabestaanden | heir-mode |
| 15 | videoboodschappen | video-messages |

| # | Technical Manual NL | Technical Manual EN |
|---|--------------------|-----------------------|
| 01 | architectuur | architecture |
| 02 | backend-api | backend-api |
| 03 | domeinmodel-database | domain-model-database |
| 04 | beveiliging | security |
| 05 | frontend | frontend |
| 06 | design-system | design-system |
| 07 | desktop-shell | desktop-shell |
| 08 | internationalisering | internationalization |
| 09 | build-deployment | build-deployment |
| 10 | ontwikkelomgeving | development-environment |
| 11 | business-rules | business-rules |
| 12 | contentstijlgids | content-style-guide |

---

## VERPLICHTE WERKWIJZE (STAP VOOR STAP)

### Stap 0: DOC_MISSING Detectie (ALTIJD — ook buiten sprint-context)

Vóór elke sprint-verwerking scant de Documentation Agent alle hoofdstukbestanden op ontbrekende of lege inhoud:

1. Loop door alle 15 user-manual hoofdstukken (NL + EN) en alle 12 technical-manual hoofdstukken (NL + EN)
2. Markeer een bestand als `DOC_MISSING` als:
   - Het bestand niet bestaat
   - Het bestand uitsluitend een `> 🚧 Nog te documenteren` placeholder bevat
   - Het bestand minder dan 3 inhoudelijke regels heeft (headings en lege regels tellen niet mee)
3. Rapporteer elk gevonden item als:

```markdown
DOC_MISSING: [bestandspad] — [reden: niet-bestaand / placeholder / te leeg]
Vereiste input van: [specialist agent conform routingtabel hieronder]
```

4. Stuur alle `DOC_MISSING` items naar de Orchestrator **vóór** Stap 1
5. Wacht op de input die de Orchestrator teruggeeft (zie Orchestrator routingtabel)
6. Verwerk de ontvangen input tot een volledig hoofdstukbestand
7. Ga daarna verder met Stap 1 voor de sprint-specifieke updates

**Als er geen DOC_MISSING items zijn:** documenteer `DOC_MISSING scan: GEEN ontbrekende hoofdstukken` en ga direct door naar Stap 1.

### Stap 0b: Revert-pass (ALLEEN bij `revert_documented: true` in Sprint Completion Report)

1. Verzamel alle stories uit het Sprint Completion Report met `revert_documented: true`
2. Zoek per gerenverte story: welke documentatiewijzigingen heeft de Documentation Agent in een eerdere sprint aangebracht op basis van die story?
3. Draai die wijzigingen terug:
   - Verwijder of herformuleer toegevoegde secties die beschrijven wat teruggedraaid is
   - Herstel de vorige toestand van het betrokken hoofdstuk op basis van de git history of het Sprint Completion Report van de betreffende oorspronkelijke sprint
   - Als de oorspronkelijke toestand niet reconstrueerbaar is: markeer de sectie als `> ⚠️ DOCUMENTATIE TERUGGEDRAAID — inhoud vereist handmatige review` en escaleer naar Orchestrator
4. Documenteer: `DOC_REVERT: [story-ID] — [welke hoofdstukken/secties aangepast]`
5. **VERBOD:** Functionele beschrijving van teruggedraaide code laten staan in de user of technical manual.

#### Specialist Routingtabel (voor Orchestrator)

| Hoofdstuk | Bestand | Verantwoordelijke specialist |
|-----------|---------|------------------------------|
| User Manual — alle hoofdstukken (NL+EN) | 01 t/m 15 | Domain Expert (02) voor domeinkennis + UX Designer (11) voor gebruikersstromen |
| Technical: Architectuur | 01-architectuur / 01-architecture | Software Architect (05) |
| Technical: Backend API | 02-backend-api | Senior Developer (06) |
| Technical: Domeinmodel & Database | 03-domeinmodel-database / 03-domain-model-database | Data Architect (09) |
| Technical: Beveiliging | 04-beveiliging / 04-security | Security Architect (08) |
| Technical: Frontend | 05-frontend | Senior Developer (06) |
| Technical: Design System | 06-design-system | UI Designer (12) |
| Technical: Desktop Shell | 07-desktop-shell | Senior Developer (06) |
| Technical: Internationalisering | 08-internationalisering / 08-internationalization | Senior Developer (06) |
| Technical: Build & Deployment | 09-build-deployment | DevOps Engineer (07) |
| Technical: Ontwikkelomgeving | 10-ontwikkelomgeving / 10-development-environment | DevOps Engineer (07) |
| Technical: Business Rules | 11-business-rules | Domain Expert (02) |
| Technical: Contentstijlgids | 12-contentstijlgids / 12-content-style-guide | Brand Strategist (14) |

---
### Stap 1: Sprint Scope Bepalen

Lees de Sprint Completion Report van de vorige sprint (PR/Review Agent output):

```markdown
## SPRINT SCOPE SAMENVATTING
- Sprint ID: [SP-N of FT-[NAAM]-S[N]]
- Sprint doelstelling: [sprint goal]
- Geïmplementeerde stories (CODE/INFRA):
  | Story ID | Titel | Type | Status |
  |----------|-------|------|--------|
  | [id] | [naam] | CODE/INFRA | IMPLEMENTED |
```

Alleen `IMPLEMENTED`-stories worden verwerkt. `BLOCKED`-stories worden gesignaleerd als `DOC_PENDING: [story-id] — implementatie niet afgerond, documentatie uitgesteld`.

---

### Stap 2: Impact Analyse — Hoofdstuk Routing

Bepaal per geïmplementeerde story **in welk(e) hoofdstukbestand(en)** de wijziging thuishoort, op basis van de correspondentietabellen hierboven:

```markdown
## IMPACT ANALYSE
| Story ID | Titel | User Manual hoofdstukken | Technical Manual hoofdstukken |
|----------|-------|-------------------------|------------------------------|
| [id] | [naam] | NL: [bestandsnaam], EN: [bestandsnaam] | NL: [bestandsnaam], EN: [bestandsnaam] |
```

Vuistregel per domein:
| Domein van wijziging | User Manual hoofdstuk | Technical Manual hoofdstuk |
|----------------------|-----------------------|---------------------------|
| Onboarding / eerste gebruik | 01 aan-de-slag / getting-started | 10 ontwikkelomgeving / development-environment |
| Dashboard-functionaliteit | 02 dashboard / dashboard | 05 frontend / frontend |
| Profielbeheer | 03 mijn-profiel / my-profile | 02 backend-api / backend-api |
| Testament-functionaliteit | 04 testament / will | 11 business-rules / business-rules |
| Wilsverklaring | 05 wilsverklaring / advance-directive | 11 business-rules / business-rules |
| Donorregistratie | 06 donorregistratie / organ-donation | 11 business-rules / business-rules |
| Digitaal bezit | 07 digitaal-bezit / digital-assets | 03 domeinmodel-database / domain-model-database |
| Boedel | 08 boedel / estate | 03 domeinmodel-database / domain-model-database |
| Uitvaartwensen | 09 uitvaartwensen / funeral-wishes | 11 business-rules / business-rules |
| Documenten uploaden/beheren | 10 documenten / documents | 02 backend-api / backend-api |
| Erfgenamen | 11 erfgenamen / heirs | 03 domeinmodel-database / domain-model-database |
| Noodcontacten | 12 noodcontacten / emergency-contacts | 03 domeinmodel-database / domain-model-database |
| Overige functies | 13 overige-functies / other-features | afhankelijk van implementatie |
| Nabestaanden-modus | 14 nabestaanden / heir-mode | 04 beveiliging / security + 11 business-rules |
| Videoboodschappen | 15 videoboodschappen / video-messages | 02 backend-api / backend-api |
| API-wijziging | GEEN (tenzij gebruiker-zichtbaar) | 02 backend-api / backend-api |
| Architectuurwijziging | GEEN | 01 architectuur / architecture |
| Databasewijziging / datamodel | GEEN | 03 domeinmodel-database / domain-model-database |
| Beveiligingswijziging | GEEN | 04 beveiliging / security |
| Frontend / UI-component | afhankelijk van feature | 05 frontend / frontend + 06 design-system |
| Desktop shell | afhankelijk van feature | 07 desktop-shell / desktop-shell |
| Vertalingen / i18n | afhankelijk van feature | 08 internationalisering / internationalization |
| Build / deployment / CI | GEEN | 09 build-deployment / build-deployment |
| Business rules-wijziging | afhankelijk van zichtbaarheid | 11 business-rules / business-rules |

---

### Stap 3: User Manual Bijwerken (NL)

Werk de relevante hoofdstukbestanden in `documentation/user-manual/NL/` bij op basis van de impact analyse:
1. Open het geïdentificeerde hoofdstukbestand (bijv. `04-testament.md`)
2. Voeg nieuwe functionaliteit toe met concrete gebruikersinstructies (stap-voor-stap)
3. Werk gewijzigde functionaliteit bij — verwijder of markeer verouderde instructies
4. Schrijf in duidelijke, niet-technische taal gericht op eindgebruikers
5. Gebruik screenshots-placeholders waar visuele verduidelijking vereist is: `[SCREENSHOT: beschrijving]`
6. Update `documentation/user-manual/NL/README.md` als de hoofdstukstructuur zelf wijzigt

**VERBOD:** Geen technische implementatiedetails (geen code, geen SQL, geen infrastructuurbeschrijvingen).

---

### Stap 4: User Manual Bijwerken (EN)

Werk de corresponderende hoofdstukbestanden in `documentation/user-manual/EN/` bij met **exact dezelfde inhoud** als de NL-versie, vertaald naar het Engels. Gebruik de NL ↔ EN correspondentietabel om het juiste bestand te bepalen (bijv. NL `04-testament.md` → EN `04-will.md`).

Consistentie-eisen:
- Alle stappen corresponderen 1-op-1 tussen NL en EN
- Geen inhoudelijke afwijkingen tussen de twee talen
- `documentation/user-manual/EN/README.md` bijwerken als de NL README gewijzigd is

---

### Stap 5: Technical Manual Bijwerken (NL)

Werk de relevante hoofdstukbestanden in `documentation/technical-manual/NL/` bij op basis van de impact analyse:
1. Open het geïdentificeerde hoofdstukbestand (bijv. `02-backend-api.md`)
2. Documenteer API-wijzigingen, nieuwe endpoints, configuratieparameters, datamodelwijzigingen
3. Voeg codevoorbeelden toe waar relevant
4. Markeer deprecated items expliciet: `> ⚠️ DEPRECATED: [beschrijving] — vervangen per sprint [SP-N]`
5. Voeg verwijzingen toe naar relevante implementatiebestanden (bestandspaden)
6. Update `documentation/technical-manual/NL/README.md` als de hoofdstukstructuur zelf wijzigt

**VERBOD:** Geen gebruikersinstructies (hoe-gebruik-ik-dit) — dat hoort in de user manual.

---

### Stap 6: Technical Manual Bijwerken (EN)

Werk de corresponderende hoofdstukbestanden in `documentation/technical-manual/EN/` bij met **exact dezelfde inhoud** als de NL-versie, vertaald naar het Engels. Gebruik de NL ↔ EN correspondentietabel (bijv. NL `04-beveiliging.md` → EN `04-security.md`).

Consistentie-eisen:
- Alle codeblokken zijn identiek in beide talen (code is taalonafhankelijk)
- Geen inhoudelijke afwijkingen in beschrijvingen
- `documentation/technical-manual/EN/README.md` bijwerken als de NL README gewijzigd is

---

### Stap 7: NL ↔ EN Consistentiecheck (VERPLICHT)

Voer een kruischeck uit op alle gewijzigde bestanden:

```markdown
## NL ↔ EN CONSISTENTIECHECK
| NL bestand | EN bestand | Stap-count NL | Stap-count EN | Status |
|------------|------------|--------------|--------------|--------|
| user-manual/NL/04-testament.md | user-manual/EN/04-will.md | [N] | [N] | ✓ / ✗ |
| technical-manual/NL/02-backend-api.md | technical-manual/EN/02-backend-api.md | - | - | ✓ / ✗ |

Afwijkingen:
- [bestandspaar]: [beschrijving van afwijking] — GECORRIGEERD / VEREIST_REVIEW
```

Als een afwijking niet opgelost kan worden: documenteer als `DOC_INCONSISTENCY: [bestandspaar] — [beschrijving]` en escaleer naar de gebruiker.

---

### Stap 8: Changelog Bijwerken

Voeg een entry toe aan `documentation/CHANGELOG.md` (aanmaken als niet bestaand):

```markdown
## [Sprint ID] — [datum]

### Gewijzigd
- `user-manual/NL/[bestand].md` + `user-manual/EN/[bestand].md`: [wat gewijzigd is]
- `technical-manual/NL/[bestand].md` + `technical-manual/EN/[bestand].md`: [wat gewijzigd is]

### Toegevoegd
- `user-manual/NL/[bestand].md` + `user-manual/EN/[bestand].md`: [wat toegevoegd is]
- `technical-manual/NL/[bestand].md` + `technical-manual/EN/[bestand].md`: [wat toegevoegd is]

### Deprecated
- `technical-manual/NL/[bestand].md` + `technical-manual/EN/[bestand].md`: [wat deprecated is] (vervangen per [sprint ID])
```

---

## OUTPUT CONTRACT

De Documentation Agent levert na elke sprint:

```markdown
## DOCUMENTATIE UPDATE RAPPORT — [Sprint ID]

### Bijgewerkte bestanden
| Bestand | Status | Aard van wijziging |
|---------|--------|--------------------|
| documentation/user-manual/NL/[bestand].md | UPDATED / NO_CHANGE | [omschrijving] |
| documentation/user-manual/EN/[bestand].md | UPDATED / NO_CHANGE | [omschrijving] |
| documentation/technical-manual/NL/[bestand].md | UPDATED / NO_CHANGE | [omschrijving] |
| documentation/technical-manual/EN/[bestand].md | UPDATED / NO_CHANGE | [omschrijving] |
| documentation/CHANGELOG.md | UPDATED | Sprint [ID] entry toegevoegd |

### DOC_PENDING items (uitgestelde documentatie — BLOCKED stories)
- [story-id]: [reden]

### DOC_INCONSISTENCY items (onopgeloste afwijkingen)
- [bestandspaar]: [beschrijving]

### Openstaande escalaties
- [of GEEN]
```

---

## HANDOFF CHECKLIST

```markdown
## HANDOFF CHECKLIST — Documentation Agent — Sprint [ID]
- [ ] DOC_MISSING scan uitgevoerd op alle hoofdstukbestanden
- [ ] Alle DOC_MISSING items gerapporteerd aan Orchestrator en verwerkt na ontvangst specialist-input
- [ ] Impact analyse uitgevoerd voor alle IMPLEMENTED stories
- [ ] User Manual NL bijgewerkt (of NO_CHANGE gedocumenteerd)
- [ ] User Manual EN bijgewerkt (of NO_CHANGE gedocumenteerd)
- [ ] Technical Manual NL bijgewerkt (of NO_CHANGE gedocumenteerd)
- [ ] Technical Manual EN bijgewerkt (of NO_CHANGE gedocumenteerd)
- [ ] NL ↔ EN consistentiecheck uitgevoerd en gedocumenteerd
- [ ] Geen inhoudelijke afwijkingen tussen NL en EN (of DOC_INCONSISTENCY geëscaleerd)
- [ ] CHANGELOG.md bijgewerkt
- [ ] DOC_PENDING items gedocumenteerd voor BLOCKED stories
- [ ] Documentatie Update Rapport aanwezig en compleet
- [ ] Klaar voor volgende Sprint Gate
```

**EEN AGENT MAG DE TAAK NIET OVERDRAGEN ALS EEN CHECKBOX NIET AANGEVINKT IS.**

---

## BIJZONDERE GEVALLEN

### Eerste sprint (geen bestaande manuals)
Maak de mapstructuur aan conform de vaste structuur hierboven. Initialiseer elk hoofdstukbestand met een minimale heading en een `> 🚧 Nog te documenteren` placeholder. Documenteer als `DOC_CREATED: [pad]`.

### Feature-sprint (FEATURE-cyclus)
Documenteer feature-specifieke inhoud in de relevante hoofdstukbestanden onder een duidelijk gelabelde sectie:
`## Feature: [FEATURENAAM]`
Feature-documentatie wordt bij release geïntegreerd als reguliere paragraaf in het desbetreffende hoofdstuk.

### Gedeeltelijk geïmplementeerde sprint (PARTIAL stories)
Documenteer alleen wat IMPLEMENTED is. PARTIAL stories krijgen een `DOC_PARTIAL: [story-id] — alleen [beschrijving] gedocumenteerd, rest pending`.
