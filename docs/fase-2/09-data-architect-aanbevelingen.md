# Aanbevelingen – Data Architectuur (Data Architect) – 2026-03-02
> Data Architect | Agent 09 | Fase 2

## Metadata
- Agent: Data Architect (09)
- Fase: 2
- Gebaseerd op analyse: `docs/fase-2/09-data-architect-analyse.md`
- Datum: 2026-03-02

---

## Aanbeveling REC-DATA-001

### Probleem
Geen data woordenboek aanwezig. 26 DbSets met Nederlandstalige entiteitsnamen zijn niet gedocumenteerd met definitie, datatype, verplicht/optioneel, AVG-classificatie of relaties.  
**Analyse referentie:** GAP-DATA-001

### Oplossing
Maak `docs/data-dictionary.md` — een machine-leesbare en door mensen te lezen beschrijving van alle entiteiten, velden, datatypes, nullability en AVG-classificatie.

**Implementatie-aanpak:**
1. Genereer een initieel data woordenboek via een generator-script op basis van LumioDbContextModelSnapshot.cs.
2. Voeg per entiteit toe: definitie in begrijpelijke taal, AVG-classificatie (publiek / intern / vertrouwelijk / bijzonder), retention rule.
3. Voeg per kolom toe: verplicht/optioneel, validatieregels (bijv. BSN mod-11), voorbeeld.
4. Sla op als `docs/data-dictionary.md` en update bij elke nieuwe EF migratie.

**Impact:**

| Dimensie | Verwacht effect | Rationale |
|----------|----------------|-----------|
| Revenue | Neutraal | — |
| Risk Reductie | Midden — onboarding nieuwe developers sneller; AVG-audit makkelijker | AVG-autoriteit (AP) kan data woordenboek opvragen bij DPIA-update |
| Cost | Negatief initieel (~4-8 uur initieel), neutrae  l onderhoud | Update bij elke migratie is laag-energie |
| UX | Neutraal | Geen directe UX-impact |

### Risico's van niet uitvoeren
Bij GDPR-audit kan het Autoriteit Persoonsgegevens (AP) verzoeken om een volledig overzicht van verwerkte persoonsgegevens per veld. Zonder data woordenboek is dit handmatig werk onder tijdsdruk.

### Meetcriterium
- KPI: `docs/data-dictionary.md` aanwezig met ≥90% entiteiten gedocumenteerd (binair + percentage)
- Baseline: Nee (0%)
- Target: Ja, ≥90% van 26 entiteiten gedocumenteerd
- Meetmethode: bestandscheck + regelcount vs. 26 entiteiten
- Tijdshorizon: SP-12 (documentatiesprint)

---

## Aanbeveling REC-DATA-002

### Probleem
`MigratieDbHelper.EnsureSchuldKolommenAsync` gebruikt raw DDL SQL als tijdelijke brug voor pre-migratieschemas (ADR-001). Dit accrueert technische schuld en vergroot het risico op data-integriteitsfouten bij schema-afwijkingen.  
**Analyse referentie:** GAP-DATA-002, ADR-001, REC-ARCH-002

### Oplossing
Verwijder `MigratieDbHelper` zodra voldoende zekerheid bestaat dat alle distributed Lumio-databases zijn bijgewerkt (of een migration-gate bij startup de versie controleert). Koppel dit aan de Application Layer migratie (REC-ARCH-001 / REC-ARCH-002).

**OUT_OF_SCOPE: Software Architect** — de architecturale aanpak voor het verwijderen van de bridge staat in REC-ARCH-002. De Data Architect-aanbeveling concentreert zich op het **dataperspectief**: de data-integriteitsrisico's van het uitgesteld verwijderen.

**Implementatie-aanpak (data-perspectief):**
1. Documenteer welke databases (en welke versie) de Schuld-kolommen nog missen.
2. Voeg een schema-versiecheck toe bij database unlock (vergelijk `PRAGMA user_version` met verwachte versie).
3. Na bevestiging dat alle databases zijn bijgewerkt: verwijder `MigratieDbHelper` en de ADR-001 notitie uit `adr-001-schulden-schema-brug.md`.

**Impact:**

| Dimensie | Verwacht effect | Rationale |
|----------|----------------|-----------|
| Revenue | Neutraal | — |
| Risk Reductie | Midden — elimineert data integriteitsrisico bij schema-mismatch | ADR-001 accepteert dit risico op expiratie |
| Cost | Negatief initieel (~4-8 uur cleanup) | Klein refactor |
| UX | Neutraal | — |

### Risico's van niet uitvoeren
Elke toekomstige schema-helper die wordt toegevoegd als "tijdelijke brug" vergroot de kans op ongedocumenteerde DDL-patronen die buiten EF Core's controle vallen. Data-integriteitsgaranties van EF worden ondermijnd.

### Meetcriterium
- KPI: `MigratieDbHelper` gemarkeerd als REMOVED in codebase (binair)
- Baseline: Aanwezig (ADR-001 technische schuld actief)
- Target: Verwijderd; ADR-001 status "RESOLVED"
- Meetmethode: `grep -r "MigratieDbHelper" src/` geeft 0 matches
- Tijdshorizon: SP-13 (na Application Layer start in SP-12)

---

## Aanbeveling REC-DATA-003

### Probleem
PostHog datacenter locatie (EU vs. US) niet geverifieerd. Op basis van `app.posthog.com` (default US endpoint) kunnen analyticsgegevens buiten de EER worden verwerkt, wat een AVG-dataoverdracht-grondslag vereist.  
**Analyse referentie:** UNCERTAIN-DATA-002

### Oplossing
Verifieer of het PostHog-project geconfigureerd is op het EU-datacenter (`eu.posthog.com`). Zo niet: migreer naar EU-instantie of voeg een SCC (Standard Contractual Clauses) grondslag toe aan de DPIA.

**Implementatie-aanpak:**
1. Controleer de PostHog project-instellingen: Configuration → Data region.
2. Als US: update `NEXT_PUBLIC_POSTHOG_HOST` naar `https://eu.i.posthog.com`.
3. Als US en niet migreerbaar: DPO-review voor SCC-grondslag toevoegen aan `devdocs/dpia-bijzondere-categorieen.md`.

**Impact:**

| Dimensie | Verwacht effect | Rationale |
|----------|----------------|-----------|
| Revenue | Neutraal | — |
| Risk Reductie | Hoog — AVG-compliance voor data-export basis | App.posthog.com verwerkt data in US per default |
| Cost | Neutraal — EU-datacenter is zelfde prijs | — |
| UX | Neutraal | — |

### Risico's van niet uitvoeren
Dataoverdracht naar derde land (VS) zonder geldige grondslag is een AVG-overtreding (art. 44 e.v.). Bij AP-klacht is dit een aantoonbaar compliance-gat.

### Meetcriterium
- KPI: PostHog geconfigureerd op EU-datacenter of SCC in DPIA gedocumenteerd (binair)
- Baseline: UNCERTAIN (niet geverifieerd)
- Target: EU-datacenter bevestigd of SCC-grondslag aanwezig in DPIA
- Meetmethode: PostHog dashboard data region check; DPIA sectie 6 update
- Tijdshorizon: SP-11 (snelle verificatie, ~1 uur)

---

## PRIORITEITENMATRIX

| Aanbeveling ID | Impact | Effort | Prioriteit | Sprint |
|----------------|--------|--------|------------|--------|
| REC-DATA-003 (PostHog EU) | Hoog (AVG) | Laag | P1 | SP-11 (~1 uur) |
| REC-DATA-001 (Data woordenboek) | Midden | Midden | P2 | SP-12 |
| REC-DATA-002 (MigratieDbHelper) | Midden | Midden | P2 | SP-13 |

---

## HANDOFF CHECKLIST — Aanbevelingen Data Architect
- [x] Alle aanbevelingen verwijzen naar analyse-bevindingen
- [x] Impacts hebben rationale of INSUFFICIENT_DATA markering
- [x] UNCERTAIN items gedocumenteerd
- [x] Meetcriteria SMART
- [x] OUT_OF_SCOPE correct gemarkeerd
- [x] Prioriteitenmatrix volledig
- [x] Status: READY voor Fase 2 Critic + Risk validatie
