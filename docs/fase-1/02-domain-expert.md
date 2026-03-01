# Analyse – Domain Expert – 2026-03-01

## Metadata
- **Agent:** 02-domain-expert
- **Fase:** 1
- **Input ontvangen van:** 01-business-analyst (`docs/fase-1/01-business-analyst.md`)
- **Datum:** 2026-03-01T00:00:00Z
- **Software onder analyse:** Lumio v1.0.0 (branch `Feature/UI`, commit `3049daec`)
- **Guardrails gevolgd:** `docs/guardrails/00-global-guardrails.md`, `docs/guardrails/01-business-guardrails.md` (G-BUS-01 t/m G-BUS-08)

---

## 1. Domein Vaststelling

**Primair domein:** Digitale Nalatenschap (Digital Estate Planning) — Nederlandse juridische en medische context

Lumio opereert op het snijvlak van vier sub-domeinen:

| Sub-domein | Toepasselijke wet- en regelgeving |
|------------|----------------------------------|
| **Erfrecht** | Burgerlijk Wetboek Boek 4 (BW 4), Successiewet 1956 (SW 1956) |
| **Medische wilsverklaring** | Wet toetsing levensbeëindiging op verzoek en hulp bij zelfdoding (WTL, Stb. 2001, 194) |
| **Orgaandonatie** | Wet op de orgaandonatie (WOD, 1996, gewijzigd 2020 — actief donorregistratiesysteem) |
| **Privacy & Gegevensverwerking** | Algemene Verordening Gegevensbescherming (AVG), Uitvoeringswet AVG (UAVG), Wet gebruik BSN (Wbsn-z) |

**Relevante adviserende instanties / normenkaders:**
- Koninklijke Notariële Beroepsorganisatie (KNB)
- Rijksoverheid.nl — Erfrecht, Donor, Euthanasie
- Belastingdienst — Successiewet / erfbelasting tarieven
- Autoriteit Persoonsgegevens (AP)

---

## 2. Domein-Standaarden Inventarisatie

| Standaard/Wet | Toepassingsgebied in Lumio | Bron (verifieerbaar) |
|---------------|--------------------------|---------------------|
| BW 4:42–4:137 | Testamentrecht: formvereisten, codicil, herroeping | Burgerlijk Wetboek Boek 4, titel 4 (wetten.nl) |
| BW 4:63–4:69 | Legitieme portie: berekening rechten kinderen | Burgerlijk Wetboek Boek 4, titel 3 (wetten.nl) |
| BW 4:182–4:232 | Erfopvolging bij versterf (ab intestato) | Burgerlijk Wetboek Boek 4, titel 7 (wetten.nl) |
| Successiewet 1956 | Erfbelasting, vrijstellingen, tarieven — geïmplementeerd in `lumio-rules.json` | SW 1956 + jaarlijkse Belastingdienst-update |
| WTL 2001 | Euthanasie wilsverklaring: vereisten schriftelijkheid, persoonskenmerken, capaciteit | Wet van 12 april 2001, Stb. 2001, 194 |
| WOD 1996 (gewijzigd 2020) | Orgaandonatie: actief donorregistratiesysteem per 1 juli 2020 | Art. 10a WOD; Donorregister.nl |
| Wbsn-z | Gebruik BSN door niet-overheidsinstellingen beperkt; burgerservicenummer in juridische context | UAVG art. 46; Wbsn-z art. 2 |
| NUV-formaat | XML exportformaat voor notarieel uitvaart — vereist schema-versie | Centrale Notaris Register; NOTIS/NUV schema documentatie |
| IBAN ISO 13616 | Bankrekening-validatie | ISO 13616:2020 |

---

## 3. Validatie Business Capabilities

| Capability | Status | Domeinbeoordeling |
|-----------|--------|--------------------|
| CAP-01 Digitale Nalatenschap Vastlegging | **Valide** | Correct domein-benaming. De vastlegging is informatief, niet rechtsgeldig op zichzelf — dit is correct gedisclaimed bij euthanasie/donor-wizards. |
| CAP-02 Boedel & Financieel Beheer | **Valide** | Correct voor estate planning context. Compleetheidsberekening correct. |
| CAP-03 Digitaal Bezit Beheer | **Valide** | Relevant voor digitale nalatenschap; geen branchestandaard beschikbaar maar praktisch relevant. |
| CAP-04 Documentenbeheer | **Valide** | Standaard in estate planning tools. |
| CAP-05 Videoboodschappen | **Afwijkend — ACTIE VEREIST** | Een video-testament is **niet rechtsgeldig** in Nederland. Notarieel testament vereist persooonlijk verschijnen bij notaris (BW 4:94). Lumio moet expliciet disclaimen dat videoboodschappen geen juridische waarde hebben als testament. Zie GAP-DE-001. |
| CAP-06 Erfgenamen & Nahuwelijkse Zorg | **Valide** | Legitieme portie berekening correct naar BW 4:63 conform `LegitimairePortieService` + `lumio-rules.json`. |
| CAP-07 Shamir Secret Sharing Toegang | **Valide met kanttekening** | Technisch correct. Er is echter **geen wettelijk kader** in Nederland dat digitale nalatenschap-toegang voor erfgenamen regelt (Wet digitale nalatenschap is nog in voorbereiding). Disclaimer vereist dat Shamir een technisch hulpmiddel is, geen juridisch recht verleent. Zie GAP-DE-002. |
| CAP-08 Privacy-by-Design Encryptie | **Valide** | AES-256 + PBKDF2 100.000 iteraties: conform huidige NIST SP 800-132 aanbevelingen. SQLCipher = industrie-standaard voor offline encrypted SQLite. |
| CAP-09 Multi-format Export | **Valide met kanttekening** | NUV-formaat: schema-versie onbekend — zie GAP-DE-003. |
| CAP-10 Actualisatie & Status Tracking | **Valide** | 730 dagen wilsverklaring herbevestiging is redelijk conform WTL-geest (opnieuw bekrachtigen bij verandering omstandigheden). |
| CAP-11 Multi-Profiel Beheer | **Valide** | Relevant voor gezinssituaties (partner + eigenaar). |
| CAP-12 Whitelabel B2B Distributie | **Valide** | Geen specifiek domein-standaard van toepassing; juridische VWO-verplichting reeds geïdentificeerd door Business Analyst (GAP-003). |
| CAP-13 Audit Logging | **Valide** | Conform AVG art. 5 lid 1 sub f (integriteit/vertrouwelijkheid) en beveiligingslogging. |
| CAP-14 Full-text Zoeken | **Valide** | Operationeel, geen domein-vereisten. |
| CAP-15 AVG / DPIA Compliance | **Valide — Gedeeltelijk** | DPIA goedgekeurd. DELETE-endpoint ontbreekt (reeds geïdentificeerd door Business Analyst). |
| CAP-16 Internationalisering | **Afwijkend — OPMERKING** | De NL-specifieke wetgeving (WTL, WOD, SW 1956) is niet rechtstreeks toepasselijk in andere landen. Een EN-versie voor buitenlandse gebruikers zou andere juridische kaders moeten hanteren. Zie GAP-DE-004. |

### Ontbrekende Capabilities (in dit domein standaard)

| ID | Capability | Domein-rationale | Prioriteit |
|----|-----------|-----------------|-----------|
| CAP-MISS-01 | **Juridische disclaimer-management** | Alle rechtsgebieden vereisen expliciete, per-scherm gedocumenteerde disclaimers ("Lumio geeft geen juridisch advies"). De wizard-disclaimers zijn aanwezig bij euthanasie/donor maar niet systematisch per rechts-gerelateerde capability beheerd. | Hoog |
| CAP-MISS-02 | **Actualisatie bij levensgebeurtenissen** | Conform BW 4 en WTL: bij life events (geboorte kind, echtscheiding, overlijden erfgenaam) moeten testamenten en wilsverklaringen worden herzien. Huidige actualisatie is interval-gebaseerd, niet event-gebaseerd. | Middelmatig |
| CAP-MISS-03 | **Notaris-exportfunctie voor testament** | De testamentaire wensen in Lumio zijn informatief. Een gestructureerde export-naar-notaris (bijv. gestandaardiseerd PDF met KNB-compatible structuur) ontbreekt. Dit is een gebruiksgemak-lacune in estate planning tools. | Laag |

---

## 4. Validatie Business Rules

| BR-ID | Status | Domein-bevinding |
|-------|--------|-----------------|
| BR-001 (max 5 profielen) | **Correct** | Geen domein-vereiste; operationele keuze. |
| BR-002 (wachtwoord min 8) | **Correct — suboptimaal** | NIST SP 800-63B (2024 aanbeveling) adviseert ≥12 karakters voor hoge-risico data met gevoelige gezondheidsgegevens. 8 is technisch toegestaan maar niet de actuele best practice voor special category data. Zie GAP-DE-005. |
| BR-003 (Shamir min drempel 2) | **Correct** | Technisch minimaal. Voor hogere zekerheid (overlijdensscenario met 3+ erfgenamen) moet drempel hoger zijn. Functioneel correct als gebruikerskeuze. |
| BR-004 (backup 30 dagen) | **Correct** | Operationeel, geen domein-vereiste. |
| BR-005 (actualisatie-intervallen) | **Correct** | 365 dagen voor testament en donor. Conform best practice. Wilsverklaring 730 dagen (2 jaar) is adequaat. |
| BR-006 (wilsverklaring herbevestiging 5 jaar) | **Correct** | Juridisch verdedigbaar. WTL eist geen vaste herbevestigingstermijn maar dit is een verantwoorde keuze. |
| BR-007 (video max 5 min) | **Correct** | Operationeel. |
| BR-008 (foto max 10 MB, document max 50 MB) | **Correct** | Operationeel. |
| BR-009 (audit log rotatie 90 dagen) | **Correct — niet geautomatiseerd** | AVG opslagbeperking vereist handhaving; reeds gemarkeerd als GAP-002 door Business Analyst. |
| BR-010 (PBKDF2 100k iteraties, AES-256-GCM) | **Correct** | Conform NIST SP 800-132 (2022) aanbevelingen voor passphrase-based key derivation. |
| BR-011 (erfbelasting tarieven 2025) | **AFWIJKEND — KRITIEK** | Het document bevat tarieven en vrijstellingen uit 2025 (`lumioRules.laatste Gewijzigd: "2025-01-01"`). De Belastingdienst actualiseert erfbelastingtarieven en vrijstellingen jaarlijks per 1 januari. Analyse op 2026-03-01: tarieven voor 2026 zijn NIET gevalideerd en zijn vermoedelijk verouderd. Zie GAP-DE-006. |
| BR-012 (BSN mod-11) | **Correct** | BSN-validatie via elf-proef is de officieel vereiste validatie conform Belastingdienst-richtlijnen. |
| BR-013 (zoeken min 2 chars) | **Correct** | Operationeel. |
| BR-014 (compleetheid caps) | **Correct** | Domein-neutraal, operationele keuze. |
| BR-015 (legitimatie 180 dagen) | **Correct** | Operationeel. |

### Ontbrekende Business Rules

| ID | Ontbrekende rule | Regelgeving | Prioriteit |
|----|-----------------|------------|-----------|
| BR-MISS-01 | **Orgaandonatie opt-out waarschuwing** | Wet op de orgaandonatie (WOD) art. 10a: Per 1 juli 2020 geldt in Nederland een aktief donorregistratiesysteem. Burgers die niet geregistreerd zijn, worden automatisch als donor beschouwd tenzij zij zich uitschrijven. De app informeert de gebruiker niet expliciet over deze opt-out systematiek. | Hoog |
| BR-MISS-02 | **Testament-disclaimer: notarieel vereiste** | BW 4:94-4:109: Een rechtsgeldig testament vereist een notariële akte. Lumio's vastlegging is informatief/codicil-achtig, maar dit onderscheid moet bij elke testament-invoer worden gecommuniceerd. | Hoog |
| BR-MISS-03 | **Video-testament disclaimer: geen juridische waarde** | BW 4:42-4:45: Testamentvormen zijn limitatief (openbaar/eigenhandig/geheim notarieel). Een video heeft geen testamentaire rechtskracht. | Kritiek (zie CAP-05 bevinding) |
| BR-MISS-04 | **Wilsverklaring: capaciteitsvereiste** | WTL art. 2 lid 2: Een schriftelijke wilsverklaring is alleen geldig als de persoon meerderjarig was en handelingsbekwaam op het moment van ondertekening. Lumio heeft geen bevestigingsstap die deze capaciteitsverklaring expliciet vastlegt. | Hoog |
| BR-MISS-05 | **Erfbelasting jaarlijkse update-verplichting** | SW 1956: tarieven, vrijstellingen en schijfgrenzen worden jaarlijks per Koninklijk Besluit aangepast. De applicatie heeft GEEN updateproces voor `lumio-rules.json`. | Kritiek |

---

## 2. Gaps (Domain Expert)

### GAP-DE-001 — Video-Testament Disclaimer Ontbreekt
- **Beschrijving:** Videoboodschappen zijn prominent aanwezig in de applicatie maar hebben geen wettelijke testamentaire waarde in Nederland (BW 4:42-4:45, limitatieve opsomming testamentvormen). Er is geen duidelijke disclaimer op het video-scherm die de gebruiker hierop wijst.
- **Bron:** BW 4:42 lid 1 — notarieel, eigenhandig of geheim testament zijn de enige geldige vormen; `documentation/user-manual/NL/15-videoboodschappen.md` (videomodule aanwezig zonder juridische disclaimer)
- **Risico als niet opgelost:** Gebruikers vertrouwen op een video als testament-vervanging → juridische geschillen bij overlijden → productaansprakelijkheidsrisico; reputatieschade
- **Prioriteit:** Kritiek

### GAP-DE-002 — Shamir-Toegang Mist Juridische Context Disclaimer
- **Beschrijving:** Lumio's Shamir-module geeft erfgenamen technische toegang tot de database. Er is geen waarschuwing dat deze technische toegang géén juridisch recht op de nalatenschap verleent en dat het wettelijke erfrecht (BW 4 af. versterf of testament) het enige juridisch geldige kader is.
- **Bron:** BW 4:182 e.v. (erfopvolging); afwezigheid van juridische context in `devdocs/shamir-ux-test-protocol.md`
- **Risico als niet opgelost:** Erfgenamen gebruiken Shamir-toegang als bewijs van erfrecht → conflicten; geen juridische grondslag
- **Prioriteit:** Hoog

### GAP-DE-003 — NUV-Exportschema Versie Ongedocumenteerd
- **Beschrijving:** De applicatie biedt een NUV-exportoptie (Notarieel Uitvaart Vastlegging XML-formaat). De versie van het NUV-schema dat wordt gebruikt is niet gedocumenteerd. Als het schema is gebaseerd op een verouderde versie zijn gegenereerde exports mogelijk niet compatible met notariële software.
- **Bron:** `src/Lumio.Api/Controllers/ExportController.cs` (NUV-export aanwezig); NUV-schema versie niet aangetroffen in codebase of devdocs
- **Risico als niet opgelost:** Notarissen kunnen NUV-exports niet verwerken; gebruikers-frustratie; werkbare export heeft geen praktische waarde
- **Prioriteit:** Middelmatig

### GAP-DE-004 — EN-Versie Mist Juridische Geldigheidsomvang
- **Beschrijving:** De EN-interface (CAP-16) hanteert de NL-wetgeving (WTL, WOD, BW 4, erfbelasting) zonder enige disclaimer dat deze rules uitsluitend voor Nederlandse onderdanen/ingezetenen gelden.
- **Bron:** `src/lumio-web/messages/` (EN-vertalingen aanwezig); afwezigheid van jurisdictie-disclaimer in UI
- **Risico als niet opgelost:** Buitenlandse gebruikers nemen aan dat de inhoud geldig is in hun jurisdictie
- **Prioriteit:** Laag

### GAP-DE-005 — Wachtwoordbeleid Suboptimaal voor Bijzondere Categorieën
- **Beschrijving:** Het minimale wachtwoord is 8 karakters. NIST SP 800-63B (2024) en ENISA-richtlijnen bevelen ≥12 karakters aan voor systemen die gezondheidsgegevens verwerken (special category data).
- **Bron:** `src/Lumio.Api/Rules/lumio-rules.json` limieten.wachtwoordMinLengte=8; NIST SP 800-63B 2024 §5.1.1
- **Risico als niet opgelost:** Verhoogde kans op brute-force bij gestolen database; privacy-inbreuk gezondheidsgegevens
- **Prioriteit:** Middelmatig

### GAP-DE-006 — Erfbelastingtarieven Verouderd (2025 → 2026)
- **Beschrijving:** `lumio-rules.json` bevat de erfbelastingtarieven met versie `2025.1` en `laatsGewijzigd: "2025-01-01"`. Op 2026-03-01 zijn de tarieven voor belastingjaar 2026 van kracht. De vrijstellingsbedragen worden jaarlijks geïndexeerd door het Ministerie van Financiën (SW 1956 art. 32-33 + jaarlijkse indexatie-KB).
- **Bron:** `src/Lumio.Api/Rules/lumio-rules.json` lijn 4-5; Belastingdienst.nl — Erfbelasting tarieven 2026 (niet verifieerbaar zonder netwerktoegang; `UNCERTAIN: exacte 2026-waarden`)
- **Risico als niet opgelost:** Berekeningen aan gebruikers tonen onjuiste vrijstellingen/tarieven → verkeerde financiële planning → klachten, productaansprakelijkheid
- **Prioriteit:** Kritiek

### GAP-DE-007 — WOD Opt-Out Systematiek Niet Gecommuniceerd aan Gebruiker
- **Beschrijving:** Sinds 1 juli 2020 zijn alle volwassenen in Nederland geregistreerd als orgaandonor tenzij zij zich uitschrijven (actief donorregistratiesysteem, WOD art. 10a). De app informeert gebruikers niet over deze standaard-status, waardoor de donorregistratiefunctie misleidend kan zijn.
- **Bron:** Wet van 24 mei 2018 (Stb. 2018, 119) — WOD wijziging; inwerkingtreding 1 juli 2020
- **Risico als niet opgelost:** Gebruikers denken dat zij zonder actie niet als donor staan geregistreerd, terwijl dat wettelijk wel het geval is
- **Prioriteit:** Hoog

### GAP-DE-008 — Wilsverklaring Mist Capaciteitsverklaring
- **Beschrijving:** De euthanasie-wilsverklaring vereist conform WTL art. 2 lid 2 dat de opsteller handelingsbekwaam is op het moment van opstelling. De wizard heeft een disclaimer maar geen expliciete bevestigingsstap waarbij de gebruiker zijn wilsbekwaamheid bevestigt.
- **Bron:** WTL art. 2 lid 2 (Stb. 2001, 194); `devdocs/dpia-bijzondere-categorieen.md` §2.1 — vermeldt uitdrukkelijke toestemming maar niet handelingsbekwaamheid
- **Risico als niet opgelost:** Wilsverklaring aangevochten bij uitvoering; juridische complicaties voor nabestaanden en artsen
- **Prioriteit:** Hoog

---

## 3. Risks (Domain Expert)

### RISK-DE-001 — Productaansprakelijkheid Video-Testament
- **Beschrijving:** Als een gebruiker overlijdt en nalatenschap-situaties ontstaan waarbij de video als testament wordt aangeboden, bestaat risico op aansprakelijkheidsclaim tegen Lumio wegens misleiding over juridische status.
- **Kans:** Laag (zeldzaam scenario, maar juridisch aantoonbaar)
- **Impact:** Hoog (reputatieschade, juridische kosten)
- **Risicoscore:** Hoog
- **Mitigatie-opties:** Prominente wettelijke disclaimer op video-scherm; expliciete koppeling naar notaris-advies
- **Bron:** GAP-DE-001; BW 4:42

### RISK-DE-002 — Onjuiste Erfbelastingberekeningen
- **Beschrijving:** Verouderde tarieven leiden tot aantoonbaar onjuiste berekeningen die gebruikers presenteren als indicatieve rechten.
- **Kans:** Hoog (tarieven worden jaarlijks aangepast)
- **Impact:** Middelmatig (financiële planning op basis van onjuiste data)
- **Risicoscore:** Hoog
- **Mitigatie-opties:** Jaarlijkse update-procedure `lumio-rules.json` + CI-waarschuwing als versie > 12 maanden oud
- **Bron:** GAP-DE-006; SW 1956

### RISK-DE-003 — Donor-Informatieplicht Schending
- **Beschrijving:** Het niet mededelen van de opt-out-systematiek kan worden gezien als een schending van de informatieplicht (AVG art. 13/14 — doeleinden en bewerkingsinformatie; WOD-context informatieverplichting).
- **Kans:** Laag (indirecte schending)
- **Impact:** Middelmatig (klachten, negatieve pers)
- **Risicoscore:** Middelmatig
- **Mitigatie-opties:** WOD opt-out informatiebox toevoegen aan donor-scherm
- **Bron:** GAP-DE-007; WOD art. 10a

---

## 4. Domain-Specifieke KPI Baseline

| KPI | Huidige waarde | Bron | Meetmethode |
|-----|----------------|------|-------------|
| Erfbelasting-versie actualiteit | Verouderd: 2025.1 (2026-03-01) | `lumio-rules.json` reg. 4-5 | Versie-timestamp vs. huidige datum |
| Disclaimer-dekking (rechtsgebieden) | INSUFFICIENT_DATA: geen systematische disclaimer-inventory | — | Handmatige audit per rechts-gerelateerd scherm |
| Capaciteitsverklaring wilsverklaring | Niet aanwezig (0 van 1 te implementeren) | `devdocs/dpia-bijzondere-categorieen.md` | Aanwezigheid bevestigingsstap in EuthanasieWizard |
| WOD opt-out informatieblok | Niet aanwezig (0 van 1 te implementeren) | Codebase donor-module | Aanwezigheid informatieblok in DonorWizard |
| NUV-schema versie compatibiliteit | INSUFFICIENT_DATA: schema versie onbekend | `src/Lumio.Api/Controllers/ExportController.cs` | Te verifiëren met KNB/NOTIS specificaties |

---

## 5. UNCERTAIN Items

- `UNCERTAIN: Exacte erfbelastingtarieven 2026` — Reden: Geen netwerktoegang om belastingdienst.nl te raadplegen; tarieven wijzigen jaarlijks via KB. De discrepantie is zeker maar de exacte new waarden zijn onbekend. — Escalatie: Stakeholder/founder dient Belastingdienst.nl te raadplegen voor 2026-waarden vóór Sprint DE-1.
- `UNCERTAIN: NUV-schema versie` — Reden: Exportcontroller aanwezig maar schema-versie niet documenteerbaar zonder broncode-inspectie van ExportController. — Escalatie: Senior Developer (06) verifieert geïmplementeerde NUV-schemaversie in Fase 2.

---

## 6. INSUFFICIENT_DATA Items

- `INSUFFICIENT_DATA: INSUF-DE-001` — Disclaimer-inventory per scherm — Ontbrekend: geen systematische inventarisatie beschikbaar — Gevolg: kan niet vaststellen hoeveel en welke schermen juridische disclaimers missen
- `INSUFFICIENT_DATA: INSUF-DE-002` — NUV-schema versie — Ontbrekend: niet gedocumenteerd — Gevolg: NUV-export-compatibiliteit onverifieerbaar

---

## AANBEVELINGEN

### REC-DE-001 — Voeg Video-Testament Disclaimer toe op Videoboodschappen-Scherm
- **Verwijzing:** GAP-DE-001, RISK-DE-001
- **Beschrijving:** Implementeer een prominente, juridische disclaimer op het videoboodschappen-scherm en bij het opnemen/opslaan van een video: "Videoboodschappen hebben geen testamentaire rechtskracht. Een rechtsgeldig testament vereist een notariële akte (BW 4:94). Raadpleeg een notaris voor juridisch bindende wensen."
- **Impact — Risk Reductie:** Hoog — elimineert productaansprakelijkheidsrisico
- **Impact — Revenue:** Nihil
- **Impact — Cost:** Nihil (tekst-wijziging)
- **Impact — UX:** Laag — één informatieve banner/tekst; `OUT_OF_SCOPE: UX-plaatsing en vormgeving → 11-ux-designer`
- **Risico van niet-uitvoeren:** Aansprakelijkheidsclaim bij overlijdenssituaties; KNB / rechtbank kan stellen dat app misleidend is
- **SMART meetcriterium:**
  - KPI: "Video-disclaimer aanwezig" — Target: Disclaimer zichtbaar op videoboodschappen-startscherm EN bij elke video-opname
  - Baseline: Niet aanwezig
  - Target: Aanwezig en getest voor Sprint DE-1 einde
  - Meetmethode: Code review + handmatige UI-inspectie
  - Tijdshorizon: Sprint DE-1 (2 weken)
- **Prioriteit:** P1 | Impact: Hoog | Effort: Laag | Sprint: DE-1

### REC-DE-002 — Actualiseer Erfbelastingtarieven naar 2026 en Implementeer Update-Procedure
- **Verwijzing:** GAP-DE-006, RISK-DE-002, BR-MISS-05
- **Beschrijving:** (a) Update `lumio-rules.json` met de erfbelasting-vrijstellingen en tarieven voor 2026 conform Belastingdienst.nl. (b) Implementeer een CI-waarschuwing die bij elke build de versiedatum van `lumio-rules.json` controleert en een CRITICAL_FINDING genereert als deze ouder is dan 365 dagen. (c) Documenteer een jaarlijkse update-procedure (januari) in devdocs.
- **Impact — Risk Reductie:** Kritiek — elimineert onjuiste berekeningen
- **Impact — Revenue:** Middelmatig — correcte berekeningen zijn een kernfunctie; fouten leiden tot klantverloop
- **Impact — Cost:** Laag (eenmalige update + CI-check)
- **Impact — UX:** Positief — correct functionerende erbelastingberekening
- **Risico van niet-uitvoeren:** Onjuiste financiële informatie aan gebruikers; klachten; mogelijke AVG/productaansprakelijkheid
- **SMART meetcriterium:**
  - KPI: "Erfbelasting regels actueel" — Target: lumio-rules.json versie = 2026.1; CI-check aanwezig
  - Baseline: versie 2025.1 (verouderd)
  - Target: versie 2026.1 gepubliceerd; CI-check actief
  - Meetmethode: `lumioRules.versie` en `laatsGewijzigd` in `lumio-rules.json`; CI job aanwezig in `ci.yml`
  - Tijdshorizon: Sprint DE-1
- **Prioriteit:** P1 | Impact: Hoog | Effort: Laag | Sprint: DE-1

### REC-DE-003 — Voeg WOD Opt-Out Informatieblok toe aan Donorregistratie
- **Verwijzing:** GAP-DE-007, RISK-DE-003, BR-MISS-01
- **Beschrijving:** Voeg op het donorregistratie-scherm (DonorWizardPage) een informatieblok toe: "Wist u dat: u in Nederland automatisch als orgaandonor bent geregistreerd tenzij u zich hebt afgemeld (WOD, actief donorregistratiesysteem per 1 juli 2020). Controleer uw registratie op Donorregister.nl."
- **Impact — Risk Reductie:** Middelmatig — voldoet aan informatieverplichting
- **Impact — Revenue:** Nihil
- **Impact — Cost:** Nihil (tekst-implementatie)
- **Impact — UX:** Positief — verhoogt vertrouwen en informatiewaarde
- **Risico van niet-uitvoeren:** Informatieverplichting schending; gebruikers begrijpen hun donor-status niet
- **SMART meetcriterium:**
  - KPI: "WOD opt-out info aanwezig" — Target: Informatieblok zichtbaar op donorscherm
  - Baseline: Niet aanwezig
  - Target: Aanwezig voor Sprint DE-1
  - Meetmethode: Code review + handmatige UI-inspectie
  - Tijdshorizon: Sprint DE-1
- **Prioriteit:** P1 | Impact: Middelmatig | Effort: Laag | Sprint: DE-1

### REC-DE-004 — Voeg Capaciteitsverklaring toe aan Wilsverklaring Wizard
- **Verwijzing:** GAP-DE-008, BR-MISS-04
- **Beschrijving:** Voeg aan de EuthanasieWizard een expliciete bevestigingsstap toe: "Ik verklaar dat ik deze wilsverklaring opstel terwijl ik handelingsbekwaam ben en mijn wil duidelijk kan uiten (conform WTL art. 2 lid 2)." — met datum + checkbox-bevestiging die wordt opgeslagen bij de wilsverklaring.
- **Impact — Risk Reductie:** Hoog — versterkt juridisch bewijs van capaciteitsmoment
- **Impact — Revenue:** Nihil
- **Impact — Cost:** Laag (wizard-stap toevoegen)
- **Impact — UX:** Laag positief — extra stap maar verhoogt geloofwaardigheid en serieuze context; `OUT_OF_SCOPE: UX-flow → 11-ux-designer`
- **Risico van niet-uitvoeren:** Wilsverklaring aanvechtbaar bij uitvoering; juridische complicaties voor nabestaanden
- **SMART meetcriterium:**
  - KPI: "Capaciteitsverklaring opgeslagen" — Target: Boolean `CapaciteitsVerklaard` en `CapaciteitsDatum` aanwezig op WilsverklaringEuthanasie-entiteit
  - Baseline: Niet aanwezig
  - Target: Aanwezig en opgeslagen voor Sprint DE-1
  - Meetmethode: Database-inspectie; integratietest verifieert opslag
  - Tijdshorizon: Sprint DE-1
- **Prioriteit:** P1 | Impact: Hoog | Effort: Laag | Sprint: DE-1

### REC-DE-005 — Verhoog Minimale Wachtwoordlengte naar 12 Karakters
- **Verwijzing:** GAP-DE-005, BR-002
- **Beschrijving:** Pas `lumio-rules.json` limieten.wachtwoordMinLengte aan van 8 naar 12, conform NIST SP 800-63B 2024 §5.1.1 voor systemen met special category data. Update validators en UI-hints.
- **Impact — Risk Reductie:** Middelmatig — verlaagt kans op succesvolle brute-force aanval op gestolen database
- **Impact — Revenue:** Nihil
- **Impact — Cost:** Laag (config-wijziging + UI-teksten)
- **Impact — UX:** Laag negatief — bestaande gebruikers hoeven wachtwoord NIET te wijzigen (enkelvoudige validatie bij aanmaken); nieuwe instelling geldt voor nieuwe profielen
- **Risico van niet-uitvoeren:** Suboptimale bescherming van gezondheidsgegevens; non-compliance met NIST best practices voor special category data
- **SMART meetcriterium:**
  - KPI: "`wachtwoordMinLengte`" — Target: waarde = 12 in productie-build
  - Baseline: 8
  - Target: 12
  - Meetmethode: `lumio-rules.json` + integratietest verifieert nieuwe validatieregel
  - Tijdshorizon: Sprint DE-2
- **Prioriteit:** P2 | Impact: Middelmatig | Effort: Laag | Sprint: DE-2

### REC-DE-006 — Voeg Notarieel Testament Disclaimer toe op Testament-Schermen
- **Verwijzing:** BR-MISS-02, CAP-01
- **Beschrijving:** Voeg op de testamentaire vastlegging-schermen een permanente disclaimer toe: "De informatie die u hier vastlegt heeft uitsluitend informatieve waarde. Een rechtsgeldig testament vereist een notariële akte. Raadpleeg een notaris." Maak dit een persistente UI-component (niet wegklikbaar).
- **Impact — Risk Reductie:** Middelmatig — voorkomt verkeerde verwachtingen
- **Impact — Revenue:** Nihil direct; verhoogt vertrouwen
- **Impact — Cost:** Nihil
- **Impact — UX:** Laag — `OUT_OF_SCOPE: UX-plaatsing → 11-ux-designer`
- **Risico van niet-uitvoeren:** Gebruikers verwarren Lumio-invoer met juridisch testament
- **SMART meetcriterium:**
  - KPI: "Testament-disclaimer aanwezig" — Target: Zichtbaar op elke testament-inputpagina
  - Baseline: INSUFFICIENT_DATA: huidige aanwezigheid niet geverifieerd (alleen wizard-disclaimer euthanasie/donor bevestigd)
  - Target: Aanwezig op alle 5 testament-controllers' corresponderende UI-pagina's
  - Meetmethode: Handmatige UI-inspectie alle testament-routes
  - Tijdshorizon: Sprint DE-1
- **Prioriteit:** P1 | Impact: Hoog | Effort: Laag | Sprint: DE-1

---

## PRIORITEITENMATRIX

```
                LAGE EFFORT          HOGE EFFORT
               ┌─────────────────────────────────┐
HOGE IMPACT    │ P1 — Sprint DE-1:               │
               │ REC-DE-001 (video disclaimer)   │
               │ REC-DE-002 (erfbelasting 2026)  │
               │ REC-DE-003 (WOD opt-out)        │
               │ REC-DE-004 (capaciteitsverkl.)  │
               │ REC-DE-006 (testament discl.)   │
               ├─────────────────────────────────┤
MIDDELMATIG    │ P2 — Sprint DE-2:               │
IMPACT         │ REC-DE-005 (wachtwoord ≥12)     │
               └─────────────────────────────────┘
```

---

## SPRINTPLAN

### Aannames

**Teams:** Conform Business Analyst output (INSUFFICIENT_DATA: team-samenstelling — aanname 1 FTE full-stack, 10 SP/sprint)  
**Sprint duur:** 2 weken  
**Randvoorwaarden Sprint DE-1:** Belastingdienst.nl 2026-tarieven opgehaald door founder VÓÓR sprint-start

---

### Sprint DE-1 — "Wettelijke Correctheid & Disclaimer-Fundament"

**Sprint Doel:** Na Sprint DE-1 zijn alle kritieke juridische disclaimers aanwezig, zijn erfbelastingtarieven actueel (2026), is de WOD opt-out gecommuniceerd, en is de capaciteitsverklaring wilsverklaring geïmplementeerd.

**KPI-targets:**
- Erfbelasting versie = 2026.1 ✓
- Video-disclaimer aanwezig ✓
- Testament-disclaimer aanwezig op alle testament-schermen ✓
- WOD opt-out informatieblok aanwezig ✓
- Capaciteitsverklaring opgeslagen in database ✓

**Definition of Done:** Alle stories IMPLEMENTED; tests geslaagd; geen nieuwe CRITICAL_FINDING

---

#### SP-DE1-001 — Erfbelastingtarieven 2026 Updaten

| Veld | Waarde |
|------|--------|
| **Beschrijving** | Als gebruiker wil ik dat erfbelastingberekeningen de actuele 2026-tarieven hanteren zodat ik het juiste wettelijk kader ziet |
| **Team** | Team Techniek |
| **Story type** | CODE |
| **Story points** | 2 SP |
| **Aanbeveling-referentie** | REC-DE-002 |
| **Afhankelijkheden** | EXTERN: actualiteit 2026-tarieven van Belastingdienst.nl |
| **Blocker** | EXTERN: 2026-erfbelastingtarieven moeten worden opgehaald via Belastingdienst.nl \| eigenaar: founder \| escalatie: als tarieven niet tijdig beschikbaar zijn, verander versier-string naar `2026.0-UNVERIFIED` en toon disclaimer in app |

**Acceptatiecriteria:**
- Gegeven `lumio-rules.json`, wanneer versie-header wordt geïnspecteerd, dan is `versie: "2026.1"` en `laatsGewijzigd: "2026-01-01"` of later
- Gegeven de erfbelastingberekening, wanneer een berekening wordt uitgevoerd, dan worden de 2026-vrijstellingen gehanteerd (verificatie na ontvangst Belastingdienst-data)
- Gegeven de CI-build, wanneer `laatsGewijzigd` ouder is dan 365 dagen, dan geeft de CI een WARNING die de developer informeert

---

#### SP-DE1-002 — Video-Testament Disclaimer

| Veld | Waarde |
|------|--------|
| **Beschrijving** | Als gebruiker wil ik op het videoboodschappen-scherm een duidelijke disclaimer zien over de juridische status van videoboodschappen zodat ik geen verkeerde verwachtingen heb |
| **Team** | Team Techniek |
| **Story type** | CODE |
| **Story points** | 1 SP |
| **Aanbeveling-referentie** | REC-DE-001 |
| **Afhankelijkheden** | NONE |
| **Blocker** | NONE |

**Acceptatiecriteria:**
- Gegeven de videoboodschappen-pagina, wanneer een gebruiker deze opent, dan is er een niet-wegklikbaar informatieblok zichtbaar met de tekst "Videoboodschappen hebben geen testamentaire rechtskracht (BW 4:42). Raadpleeg een notaris voor juridisch bindende wensen." of gelijkwaardige bewoording
- Gegeven de EN-versie van de app, wanneer dezelfde pagina wordt geopend, dan is de disclaimer Engelstalig aanwezig

---

#### SP-DE1-003 — Testament Disclaimers op Alle Testamentschermen

| Veld | Waarde |
|------|--------|
| **Beschrijving** | Als gebruiker wil ik op elk testamentaire invoer-scherm een herinnering zien dat ik een notaris nodig heb voor een rechtsgeldig testament zodat ik de app juist gebruik |
| **Team** | Team Techniek |
| **Story type** | CODE |
| **Story points** | 2 SP |
| **Aanbeveling-referentie** | REC-DE-006 |
| **Afhankelijkheden** | NONE |
| **Blocker** | NONE |

**Acceptatiecriteria:**
- Gegeven de routes `/testament`, `/testament/begunstigden`, `/testament/executeurs`, `/testament/juridische-check` en `/testament/snapshots`, wanneer een gebruiker één van deze opent, dan is er een persistente disclaimer aanwezig
- Gegeven de disclaimer, wanneer de gebruiker shard uitvoert, dan is de disclaimer NIET wegklikbaar (permanente informatiebanner, geen modal)
- Gegeven de NL- én EN-versie, wanneer de desbetreffende route wordt bezoek, dan is de disclaimer in de juiste taal aanwezig

---

#### SP-DE1-004 — WOD Opt-Out Informatieblok

| Veld | Waarde |
|------|--------|
| **Beschrijving** | Als gebruiker wil ik op het donorregistratiescherm worden geïnformeerd over het Nederlandse opt-out donorsysteem zodat ik mijn donor-status correct begrijp |
| **Team** | Team Techniek |
| **Story type** | CODE |
| **Story points** | 1 SP |
| **Aanbeveling-referentie** | REC-DE-003 |
| **Afhankelijkheden** | NONE |
| **Blocker** | NONE |

**Acceptatiecriteria:**
- Gegeven de donor-pagina, wanneer een gebruiker deze opent, dan is een informatieblok aanwezig met uitleg over het actief donorregistratiesysteem (WOD 2020) en een link naar Donorregister.nl
- Gegeven de EN-versie, wanneer de pagina wordt geopend, dan is de WOD-uitleg in het Engels beschikbaar

---

#### SP-DE1-005 — Capaciteitsverklaring Wilsverklaring

| Veld | Waarde |
|------|--------|
| **Beschrijving** | Als gebruiker wil ik bij het opstellen van mijn wilsverklaring euthanasie bevestigen dat ik handelingsbekwaam ben zodat mijn verklaring juridisch sterker staat |
| **Team** | Team Techniek |
| **Story type** | CODE |
| **Story points** | 2 SP |
| **Aanbeveling-referentie** | REC-DE-004 |
| **Afhankelijkheden** | NONE |
| **Blocker** | NONE |

**Acceptatiecriteria:**
- Gegeven de EuthanasieWizard, wanneer de gebruiker de final stap bereikt, dan is er een bevestigingsstap: "Ik verklaar dat ik deze wilsverklaring opstel terwijl ik handelingsbekwaam ben (WTL art. 2 lid 2)" met een checkbox
- Gegeven de opgeslagen wilsverklaring, wanneer de database wordt geïnspecteerd, dan zijn de velden `CapaciteitsVerklaard: bool` en `CapaciteitsDatum: DateTime` aanwezig en ingevuld
- Gegeven de integratietest, wanneer een wilsverklaring wordt opgeslagen zonder de capaciteitsbevestiging, dan retourneert de API een validatiefout

---

### Sprint DE-2 — "Veiligheidsverbetering & Domeinverdieping"

**Sprint Doel:** Wachtwoordbeleid verhoogd naar ≥12 karakters conform NIST SP 800-63B voor special category data.

**KPI-targets:**
- `wachtwoordMinLengte` = 12 in productie-build ✓

---

#### SP-DE2-001 — Wachtwoord Minimumlengte naar 12

| Veld | Waarde |
|------|--------|
| **Beschrijving** | Als eigenaar van een Lumio-profiel wil ik dat mijn wachtwoord minimaal 12 karakters heeft zodat mijn gezondheidsgegevens beter beschermd zijn |
| **Team** | Team Techniek |
| **Story type** | CODE |
| **Story points** | 1 SP |
| **Aanbeveling-referentie** | REC-DE-005 |
| **Afhankelijkheden** | NONE |
| **Blocker** | NONE |

**Acceptatiecriteria:**
- Gegeven `lumio-rules.json`, wanneer `wachtwoordMinLengte` wordt geïnspecteerd, dan is de waarde ≥12
- Gegeven de setup-wizard, wanneer een gebruiker een wachtwoord van 11 tekens invoert, dan wordt een validatiefout getoond
- Gegeven bestaande profielen (migratie-scenario), wanneer een bestaand wachtwoord < 12 tekens is, dan wordt de gebruiker bij de eerstvolgende unlock NIET geblokkeerd maar WEL gevraagd het wachtwoord te updaten (soft enforcement)

---

### Parallelle Tracks Sprint DE-1

| Track | Stories | Team | Startvoorwaarde |
|-------|---------|------|----------------|
| Track A — Fiscaal | SP-DE1-001 | Team Techniek | 2026-tarieven beschikbaar van Belastingdienst.nl |
| Track B — Juridische Disclaimers | SP-DE1-002, SP-DE1-003, SP-DE1-004, SP-DE1-005 | Team Techniek | Geen — kan direct starten |

**Track B is volledig parallel aan Track A.**

### Blocker Register Sprint DE-1

| ID | Story | Type | Eigenaar | Escalatie |
|----|-------|------|----------|-----------|
| BLK-DE1-001 | SP-DE1-001 | EXTERN: 2026-tarieven Belastingdienst | Founder | Tijdelijke maatregel: markeer versie als `2026.0-UNVERIFIED` en toon in-app disclaimer "Erfbelastingberekeningen worden bijgewerkt"; blokkeer release van SP-DE1-001 niet voor Track B |

---

## GUARDRAILS

### GUARD-DE-001 — Erfbelasting-Versie Mag Niet Ouder Zijn Dan 13 Maanden

- **Formulering:** De `lumioRules.laatsGewijzigd`-datum in `lumio-rules.json` mag nooit meer dan 13 maanden in het verleden liggen bij een productie-release.
- **Scope:** Alle releases, CI/CD pipeline
- **Verwijzing:** GAP-DE-006, RISK-DE-002
- **Schending-actie:** CI/CD build genereert een `GUARDRAIL_VIOLATION: GUARD-DE-001`-warning; release-manager blokkeert productie-release totdat tarieven zijn bijgewerkt
- **Verificatiemethode:** Geautomatiseerde CI-job in `ci.yml` vergelijkt `laatsGewijzigd` met build-datum; faalt met warning bij >13 maanden oud
- **Overlap check:** Nieuw

### GUARD-DE-002 — Juridisch-Relevante Functies Vereisen Zichtbare Disclaimer

- **Formulering:** Elk scherm dat betrekking heeft op testament, euthanasie-wilsverklaring, donorregistratie of videoboodschappen MOET een juridische disclaimer bevatten die niet door de gebruiker weg te klikken of te verbergen is.
- **Scope:** Frontend development, code reviews
- **Verwijzing:** GAP-DE-001, BR-MISS-02, BR-MISS-03
- **Schending-actie:** PR-review blokkert merge; markeer als `GUARDRAIL_VIOLATION: GUARD-DE-002`
- **Verificatiemethode:** Code review checklist bevat item "juridische disclaimer aanwezig en persistent"; Playwright smoke test verifieert aanwezigheid disclaimer-element via data-attribuut
- **Overlap check:** Nieuw

### GUARD-DE-003 — Wilsverklaring Opslaan Vereist Capaciteitsbevestiging

- **Formulering:** Het opslaan van een euthanasie-wilsverklaring MOET een geregistreerde capaciteitsbevestiging bevatten (WTL art. 2 lid 2). De API MOET een POST/PUT-request zonder geldige capaciteitsverklaring weigeren.
- **Scope:** Backend API, frontend wizard
- **Verwijzing:** GAP-DE-008, BR-MISS-04
- **Schending-actie:** API retourneert HTTP 422 bij ontbrekende capaciteitsverklaring; markeer als `GUARDRAIL_VIOLATION: GUARD-DE-003`
- **Verificatiemethode:** Integratietest verifieert dat API wilsverklaring zonder `CapaciteitsVerklaard=true` afwijst
- **Overlap check:** Aanvulling op DPIA §2.1 (consent-onderbouwing)

---

## JSON EXPORT

```json
{
  "domain": "Digitale Nalatenschap (Dutch Estate Planning)",
  "applicable_regulations": [
    "BW 4:42-4:137 (Testamentrecht)",
    "BW 4:63-4:69 (Legitieme portie)",
    "BW 4:182-4:232 (Erfopvolging ab intestato)",
    "Successiewet 1956 (Erfbelasting)",
    "WTL 2001 (Euthanasie wilsverklaring)",
    "WOD 1996/2020 (Orgaandonatie, actief registratiesysteem)",
    "AVG / UAVG (Bijzondere categorieën)",
    "Wbsn-z (BSN gebruik)"
  ],
  "capability_validation": [
    { "id": "CAP-01", "status": "Valide" },
    { "id": "CAP-05", "status": "Afwijkend", "finding": "Video-testament niet rechtsgeldig — disclaimer vereist" },
    { "id": "CAP-07", "status": "Valide met kanttekening", "finding": "Geen wettelijk kader digitale nalatenschap — disclaimer vereist" },
    { "id": "CAP-09", "status": "Valide met kanttekening", "finding": "NUV-schema versie ongedocumenteerd" },
    { "id": "CAP-16", "status": "Afwijkend — Opmerking", "finding": "EN-versie mist jurisdictie-disclaimer" }
  ],
  "missing_capabilities": ["CAP-MISS-01", "CAP-MISS-02", "CAP-MISS-03"],
  "business_rule_validation": [
    { "id": "BR-011", "status": "AFWIJKEND - KRITIEK", "finding": "Erfbelasting 2025 — 2026 update vereist" },
    { "id": "BR-002", "status": "Correct — suboptimaal", "finding": "Min wachtwoord 8 chars; NIST advies ≥12" }
  ],
  "missing_business_rules": ["BR-MISS-01", "BR-MISS-02", "BR-MISS-03", "BR-MISS-04", "BR-MISS-05"],
  "domain_gaps": [
    { "id": "GAP-DE-001", "priority": "Kritiek" },
    { "id": "GAP-DE-002", "priority": "Hoog" },
    { "id": "GAP-DE-003", "priority": "Middelmatig" },
    { "id": "GAP-DE-004", "priority": "Laag" },
    { "id": "GAP-DE-005", "priority": "Middelmatig" },
    { "id": "GAP-DE-006", "priority": "Kritiek" },
    { "id": "GAP-DE-007", "priority": "Hoog" },
    { "id": "GAP-DE-008", "priority": "Hoog" }
  ],
  "domain_risks": [
    { "id": "RISK-DE-001", "score": "Hoog" },
    { "id": "RISK-DE-002", "score": "Hoog" },
    { "id": "RISK-DE-003", "score": "Middelmatig" }
  ]
}
```

---

## HANDOFF CHECKLIST – Domain Expert – 2026-03-01

- [x] Domein is eenduidig vastgesteld: Digitale Nalatenschap (NL — erfrecht + medisch recht + privacy)
- [x] Domein-standaarden zijn geïnventariseerd met bronnen (BW 4, SW 1956, WTL, WOD, AVG, Wbsn-z)
- [x] Alle capabilities zijn gevalideerd (Valide/Afwijkend/Ontbrekend)
- [x] Alle business rules zijn gevalideerd (BR-001 t/m BR-015 + 5 ontbrekende rules geïdentificeerd)
- [x] Compliance gap analyse is volledig (8 domain gaps, 3 domain risks)
- [x] Business Analyst output is als input gebruikt
- [x] Alle bevindingen hebben bronvermelding (BW, WTL, WOD, SW 1956, NIST SP 800-63B, `lumio-rules.json`)
- [x] Alle UNCERTAIN: items zijn gedocumenteerd (2 items)
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

**STATUS: GEREED VOOR HANDOFF → 03-sales-strategist**
