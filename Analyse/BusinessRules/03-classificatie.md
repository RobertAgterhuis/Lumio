# 3. Classificatie & Extractieanalyse

> **Doel:** elke business rule classificeren op **extractiepotentieel** —
> hoe makkelijk is het om de regel los te koppelen van de huidige implementatie?
> Dit vormt de basis voor de keuze van externaliseringsaanpak per regelgroep.

---

## 3.1 Extractie-dimensies

We beoordelen elke regel op vier dimensies:

| Dimensie | Vraag | Schaal |
|----------|-------|--------|
| **DB-koppeling** | Is er een EF Core query nodig om de regel uit te voeren? | 🟢 Geen / 🟡 Leest data / 🔴 Schrijft data |
| **State-afhankelijk** | Hangt de regel af van runtime state (profiel, password, encryptie)? | 🟢 Nee / 🔴 Ja |
| **Pure logica** | Kan de regel als pure functie worden uitgedrukt (input → output, geen side-effects)? | 🟢 Ja / 🟡 Deels / 🔴 Nee |
| **Wijzigingsfrequentie** | Hoe vaak wijzigt de regel in de praktijk? | 🟢 Nooit / 🟡 Jaarlijks / 🔴 Regelmatig |

### Extractie-score

De combinatie levert een score op:

| Score | Betekenis | Aanpak |
|-------|-----------|--------|
| **A** — Direct extraheerbaar | Pure logica, geen DB, geen state | Verplaats naar configuratie of pure service |
| **B** — Extraheerbaar met interface | Leest data via interface, geen state | Extract naar service met data-interface |
| **C** — Deels extraheerbaar | Gemixte verantwoordelijkheden | Splits in data-ophaal + pure logica |
| **D** — Nauw gekoppeld | Diep verweven met infra/state | Laat in huidige laag, verbeter structuur |

---

## 3.2 Score A — Direct extraheerbaar (57 regels)

Deze regels zijn pure functies of statische waarden die **zonder enige afhankelijkheid** naar een apart bestand/module verplaatst kunnen worden.

### A1. Drempelwaarden en constanten (42 regels)

| BR-ID's | Beschrijving | Huidig | Doel |
|---------|-------------|--------|------|
| BR-001 | Min wachtwoordlengte (8) | Hardcoded (3×!) | `Rules/LumioConstants.cs` of `appsettings.json` |
| BR-017 | Max profielen (5) | `IProfileService.MaxProfiles` | Config |
| BR-026,028,029,031,036,038 | Max lengtes (100, 20, 10) | FluentValidation | Config-driven validators |
| BR-033 | Max profielfoto (10 MB) | Attribuut | Config |
| BR-042–045 | Erfbelasting tarieven 2025 | Hardcoded in controller | **JSON config** (jaarlijks!) |
| BR-063 | UitsluitingsClausule default | Hardcoded | Config |
| BR-087,091,093,094 | Minimum bedragwaarden | FluentValidation | Config |
| BR-101 | Max document upload (50 MB) | Attribuut | Config |
| BR-110 | Shamir min drempel (2) | Hardcoded (2×!) | Config |
| BR-123–132 | Granulaire compleetheid veldaantallen | Hardcoded | Config/metadata |
| BR-157 | Min zoektermlengte (2) | Hardcoded | Config |
| BR-162 | NUV namespace | Hardcoded | Config |
| BR-165 | CSV separator (`;`) | Hardcoded | Config |
| BR-170 | Backup naamformaat | Hardcoded | Config |
| BR-177–183 | Encryptie parameters | Hardcoded | Config (security policy) |
| BR-189,190 | Backup/actualisatie drempels | Hardcoded | Config |

**Totale impact:** 42 regels → verplaatsbaar naar configuratiebestand(en).  
**Risico:** Laag. Wijzigingen zijn puur waarde-vervangingen.  
**Effort:** Klein. Betreft `IOptions<T>`-binding + constants file/JSON.

### A2. Pure berekeningen (15 regels)

| BR-ID's | Beschrijving | Huidig | Doel |
|---------|-------------|--------|------|
| BR-041 | Relatie-classificatie → tariefgroep | Inline switch/if | Pure functie `BepaalTariefGroep(relatie)` |
| BR-046,047 | Erfbelasting berekening | Inline in controller | Pure functie `BerekenBelasting(bedrag, groep, tarieven)` |
| BR-048,095,096 | Netto nalatenschap | 3× gedupliceerd! | Pure functie `BerekenNettoNalatenschap(...)` |
| BR-049 | Gelijke erfverdeling | Inline | Pure functie `VerdeelNalatenschap(netto, aantalErfgenamen)` |
| BR-050,051 | Legitimaire portie berekening | Inline | Pure functie `BerekenLegitimairePortie(...)` |
| BR-052,053 | Kind-relatie detectie | Inline string matching | Pure functie `IsKindRelatie(relatie)` |
| BR-060 | Onroerend goed detectie | Inline keyword matching | Pure functie `IsOnroerendGoed(categorie, kadastraal)` |

**Totale impact:** 15 regels → verplaatsbaar naar pure statische klassen.  
**Risico:** Zeer laag. Dit zijn deterministische functies.  
**Effort:** Klein. Methoden kopiëren + unit tests schrijven.

---

## 3.3 Score B — Extraheerbaar met interface (33 regels)

Deze regels lezen data uit de database maar bevatten pure beslislogica die kan worden gescheiden via een interface (data-ophaal los van evaluatie).

### B1. Compleetheidsscoring (13 regels)

| BR-ID's | Beschrijving | Patroon |
|---------|-------------|---------|
| BR-120,121 | Compleetheid (10 domeinen) | Data ophalen → scoring functie |
| BR-122 | Granulaire compleetheid | Data ophalen → veldcontrole functie |

**Extractiepatroon:**
```
Controller  →  haalt Eigenaar, Testament, ... op (IDataProvider)
            →  geeft door aan CompleetService.BerekenCompleetheid(data)
            →  retourneert CompleetheidsResultaat
```

### B2. Cross-entity checks — Meldingen (16 regels)

| BR-ID's | Beschrijving | Patroon |
|---------|-------------|---------|
| BR-133–148 | 16 meldingsregels | Data ophalen → evaluatiefunctie per regel |

**Extractiepatroon:**
```
Controller  →  haalt snapshot van alle domeinen op
            →  MeldingService.EvalueerMeldingen(snapshot, configuratie)
            →  retourneert List<Melding>
```

De **configuratie** bevat drempels (30 dagen backup, 90 dagen actualisatie) die nu hardcoded zijn.

### B3. Cross-entity checks — Suggesties (7 regels)

| BR-ID's | Beschrijving | Patroon |
|---------|-------------|---------|
| BR-149–155 | 7 suggestieregels | Data ophalen → vergelijkingsfunctie |

**Extractiepatroon:**
```
Controller  →  haalt erfgenamen, noodcontacten, testament, uitvaart op
            →  SuggestieService.EvalueerSuggesties(data)
            →  retourneert List<Suggestie>
```

---

## 3.4 Score C — Deels extraheerbaar (38 regels)

Deze regels combineren data-ophaal, beslislogica, én schrijfacties. Ze moeten worden opgesplitst.

### C1. Testament juridische checks (6 regels)

| BR-ID's | Beschrijving | Opsplitsing |
|---------|-------------|-------------|
| BR-054–059 | Juridische check | **Data-ophaal** (controller/service) → **evaluatie** (pure) → **response** (controller) |

De juridische check doet 6 EF-queries (eigenaar, testament, begunstigden, executeurs, erfgenamen, fysiek bezit) en evalueert vervolgens 6 condities. De evaluatie zelf is puur.

### C2. Authenticatie state machine (12 regels)

| BR-ID's | Beschrijving | Opsplitsing |
|---------|-------------|-------------|
| BR-005–016 | Setup/unlock/lock/change/delete flow | **Policy decisions** (extraheerbaar als state machine) + **side-effects** (DB/encryptie, niet extraheerbaar) |

De state-transitions (IsFirstRun → setup → unlocked → lock) kunnen als state machine worden gemodelleerd. De bijbehorende acties (PRAGMA key, re-encrypt, file I/O) blijven in services.

### C3. Afhandeling workflow (5 regels)

| BR-ID's | Beschrijving | Opsplitsing |
|---------|-------------|-------------|
| BR-115–119 | Status-transitions + auto-initialisatie | **State machine** (extraheerbaar) + **DB-schrijfacties** (niet extraheerbaar) |

### C4. Document versioning (4 regels)

| BR-ID's | Beschrijving | Opsplitsing |
|---------|-------------|-------------|
| BR-102–104 | Auto-versioning logica | **Versie-bepaling** (extraheerbaar) + **DB-opslag** (niet) |

### C5. CSV import logica (2 regels)

| BR-ID's | Beschrijving | Opsplitsing |
|---------|-------------|-------------|
| BR-079,080 | Kolom auto-detectie + lege-wachtwoord-filter | **Parsing** (extraheerbaar) + **encryptie + DB** (niet) |

### C6. Shamir workflow (5 regels)

| BR-ID's | Beschrijving | Opsplitsing |
|---------|-------------|-------------|
| BR-111–114 | Validatie + toewijzingslogica | **Validatie** (extraheerbaar) + **crypto + DB** (niet) |

---

## 3.5 Score D — Nauw gekoppeld (32 regels)

Deze regels zijn diep verweven met infrastructuur en kunnen niet zinvol worden geëxternaliseerd.

### D1. Encryptie policies (7 regels)

| BR-ID's | Beschrijving | Waarom D |
|---------|-------------|----------|
| BR-077,078,081 | Wachtwoord/seed versleuteling | Directe crypto-operaties |
| BR-177–183 | AES/PBKDF2 parameters | Security-primitieven (≠ business rules) |

> **Opmerking:** de *waarden* (iteraties, keylengte) zijn wél extraheerbaar als configuratie (Score A). De *logica* (hoe encryptie werkt) niet.

### D2. Middleware toegangscontrole (6 regels)

| BR-ID's | Beschrijving | Waarom D |
|---------|-------------|----------|
| BR-171–176 | Padfilters, lock-checks | Directe HTTP-pipeline integratie |

> **Opmerking:** de *padlijsten* zijn wél extraheerbaar als configuratie. De *middleware-logica* niet.

### D3. Database-specifieke regels (7 regels)

| BR-ID's | Beschrijving | Waarom D |
|---------|-------------|----------|
| BR-184–188 | Auto-audit, auto-timestamp, cascade delete | EF Core `SaveChangesAsync` override |

### D4. Policy/existentie-checks (12 regels)

| BR-ID's | Beschrijving | Waarom D |
|---------|-------------|----------|
| BR-032,064,067,097,098,099,105 | Singleton/eigenaar-existentie | Simpele DB-checks, overhead van externalisering > waarde |
| BR-018,019,020,021,022 | Profiel policies | Verweven met ProfileService state |

---

## 3.6 Overzichtsmatrix

```
┌─────────────────────────────┬─────────┬──────────────────────────────────┐
│ Score                       │ Regels  │ Primaire aanpak                  │
├─────────────────────────────┼─────────┼──────────────────────────────────┤
│ A — Direct extraheerbaar    │   57    │ Config (JSON/Options) +          │
│                             │         │ pure statische klassen           │
├─────────────────────────────┼─────────┼──────────────────────────────────┤
│ B — Extraheerbaar (interf.) │   33    │ Domain services met              │
│                             │         │ data-interfaces                  │
├─────────────────────────────┼─────────┼──────────────────────────────────┤
│ C — Deels extraheerbaar     │   38    │ Opsplitsen in pure logica +      │
│                             │         │ infrastructuur-acties            │
├─────────────────────────────┼─────────┼──────────────────────────────────┤
│ D — Nauw gekoppeld          │   32    │ Laten in huidige laag,           │
│                             │         │ structuur verbeteren             │
├─────────────────────────────┼─────────┼──────────────────────────────────┤
│ Veldvalidatie (ongewijzigd) │   30    │ FluentValidation behouden        │
│                             │         │ (evt. config-driven)             │
├─────────────────────────────┼─────────┼──────────────────────────────────┤
│ TOTAAL                      │  190    │                                  │
└─────────────────────────────┴─────────┴──────────────────────────────────┘
```

---

## 3.7 Extractie-potentieel per domeingebied

| Domein | Totaal regels | Score A | Score B | Score C | Score D | % extraheerbaar |
|--------|--------------|---------|---------|---------|---------|-----------------|
| Auth & Security | 23 | 2 | 0 | 12 | 9 | 61% |
| Profielen | 8 | 1 | 0 | 0 | 7 | 13% |
| Eigenaar | 10 | 5 | 0 | 0 | 5 | 50% |
| Erfgenamen | 15 | 10 | 0 | 5 | 0 | **100%** |
| Testament | 14 | 2 | 0 | 12 | 0 | **100%** |
| Euthanasie | 3 | 0 | 0 | 0 | 3 | 0% |
| Donor | 3 | 0 | 0 | 0 | 3 | 0% |
| Digitaal Bezit | 12 | 0 | 0 | 2 | 10 | 17% |
| Boedel | 16 | 10 | 0 | 0 | 6 | 63% |
| Uitvaart | 3 | 0 | 0 | 0 | 3 | 0% |
| Documenten | 4 | 1 | 0 | 3 | 0 | **100%** |
| Noodcontacten | 3 | 0 | 0 | 0 | 3 | 0% |
| Toewijzingen | 2 | 0 | 0 | 0 | 2 | 0% |
| Shamir | 5 | 1 | 0 | 4 | 0 | **100%** |
| Afhandeling | 5 | 0 | 0 | 5 | 0 | **100%** |
| Status/Compleetheid | 36 | 13 | 16 | 0 | 7 | 81% |
| Meldingen | 16 | 2 | 14 | 0 | 0 | **100%** |
| Suggesties | 7 | 0 | 7 | 0 | 0 | **100%** |
| Zoeken | 4 | 1 | 0 | 0 | 3 | 25% |
| Export | 6 | 3 | 0 | 0 | 3 | 50% |
| Backup | 4 | 1 | 0 | 0 | 3 | 25% |
| Database/Audit | 7 | 2 | 0 | 0 | 5 | 29% |

---

## 3.8 Quick wins — Hoogste impact met laagste effort

### 🏆 Top 5 quick wins

| Prio | Wat | Impact | Effort | Waarom |
|------|-----|--------|--------|--------|
| 1 | **Erfbelasting tarieven naar JSON** (BR-042–045) | 🔴 Hoog — wijzigt jaarlijks | 🟢 Klein | Voorkomt jaarlijkse code-wijziging |
| 2 | **Netto nalatenschap centraliseren** (BR-048/095/096) | 🔴 Hoog — 3× gedupliceerd | 🟢 Klein | Elimineert code-duplicatie |
| 3 | **Alle constanten naar config** (21 waarden) | 🟡 Middel — voorkomt rebuilds | 🟢 Klein | `IOptions<LumioLimits>` |
| 4 | **Compleetheid/meldingen naar service** (BR-120–148) | 🟡 Middel — 420 regels uit controller | 🟡 Middel | Testbaarheid ↑, controller ↓ |
| 5 | **Pure berekeningen extraheren** (BR-041,046–053) | 🟡 Middel — testbaarheid | 🟢 Klein | Unit-testbare functies |

### 📊 Inspanning vs. impact matrix

```
              │ Hoog impact
              │
    Quick     │  ★ Erfbelasting config (1)
    wins      │  ★ Netto nalatenschap (2)
              │  ★ Constanten → config (3)
              │  ★ Pure berekeningen (5)
              │
              ├──────────────────────────────
              │
    Investeer │  ★ Compleetheid service (4)
              │  ★ Suggesties service
              │  ★ Juridische check service
              │  ★ Meldingen service
              │
              └─────────────────────────────→ Effort
                 Laag                Hoog
```

---

## 3.9 Koppelingsanalyse — Gedetailleerd

### Regels met meeste EF-koppeling

| Regel | Aantal EF-queries | Entiteiten |
|-------|------------------|------------|
| Suggesties (BR-149–155) | 6+ queries | Eigenaar, Erfgenamen, Noodcontacten, Testament, Begunstigden, UitvaartWensen |
| Juridische check (BR-054–059) | 6 queries | Eigenaar, Testament, Begunstigden, Executeurs, Erfgenamen, FysiekBezit |
| Erfbelasting (BR-041–049) | 5 queries | Erfgenamen, FysiekBezit, Bankrekeningen, Verzekeringen, Schulden |
| Meldingen (BR-133–148) | 10+ queries | Alle domein-entiteiten + AuditLog |
| Granulaire compleetheid (BR-122) | 10 queries | Alle domein-entiteiten |

### Regels die alleen hardcoded strings bevatten

| Regel | Aantal strings | Voorbeeld |
|-------|---------------|-----------|
| Meldingen (BR-133–148) | 16 | "Overweeg uw testament vast te leggen" |
| Juridische check (BR-054–059) | 8 | "Een codicil is niet geldig voor onroerend goed..." |
| Suggesties (BR-149–155) | 7 | "Erfgenaam '{naam}' is niet als noodcontact geregistreerd" |
| Relatie-classificatie (BR-041) | 10+ | "kind", "zoon", "dochter", "stiefkind", ... |
| Erfbelasting disclaimer | 1 blok | Meerregelige juridische disclaimer |

**Totaal: ~60+ hardcoded Dutch strings** die direct aan business rules gekoppeld zijn.

---

## 3.10 Conclusie classificatie

Van de 190 geïdentificeerde business rules:

| Categorie | Aantal | % | Aanbevolen aanpak |
|-----------|--------|---|-------------------|
| **Configureerbaar** maken (Score A) | 57 | 30% | Sprint 1 — quick wins |
| **Service-extraheerbaar** (Score B) | 33 | 17% | Sprint 2 — domain services |
| **Opsplitsbaar** (Score C) | 38 | 20% | Sprint 2–3 — refactoring |
| **Infrastructureel** (Score D) | 32 | 17% | Niet externaliseren |
| **Veldvalidatie** (behouden) | 30 | 16% | FluentValidation, evt. config-driven |

**128 van 190 regels (67%)** kunnen zinvol worden geëxternaliseerd of geconfigureerd.
