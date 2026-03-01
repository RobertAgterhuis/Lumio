# Sprint Gate — SP-2: Data Integrity
**Datum:** 2026-03-01  
**Orchestrator:** Lumio Audit Multi-Agent Systeem  
**Audit scope:** COMBO_PARTIAL (Fase 2 Techniek + Fase 3 UX)  
**Vorige sprint:** SP-1 Security Critical — ✅ SPRINT_COMPLETE (PR #41 gemerged, SHA f0a05b5)

---

## PRE-GATE CHECKS

### ✅ Stap 0: decisions.md — Open HOOG-prioriteit items

| Bevinding | Resultaat |
|---|---|
| Open HOOG items in decisions.md | GEEN — enkel placeholders aanwezig |
| Sprint Gate geblokkeerd door decisions.md | **NEE — geen blokkering** |

---

### ✅ Stap 0B: RULE ORC-13 — GitHub Issues status

| Item | Status |
|---|---|
| GitHub Issues SP-2 aangemaakt | ✅ #15 (T-005) · #16 (T-006) — milestone "SP-2 Data Integrity" |
| Labels aanwezig | ✅ type:code, priority:critical/high, sprint:SP-2, audit-generated |

---

### ✅ Stap 1: SP-1 afhankelijkheidscheck

| Afhankelijkheid | Status |
|---|---|
| SP-1 BLK-001 koppeling | ✅ OPGELOST — SP-1 gemerged als SHA f0a05b5 in Feature/UI |
| GitHub Issues SP-1 (#11-#14) gesloten | ✅ GESLOTEN |
| PR #41 gemerged | ✅ 2026-03-01 |

> SP-1 is formeel compleet. SP-2 mag starten.

---

## CODEBASE-BEVINDINGEN (T-005 & T-006)

### GAP-DATA-03 → T-005: Credentials in export (grondslag)

**Locatie:** `src/Lumio.Api/Services/Pdf/Generators/DigitaalBezitGenerator.cs` (regel 62-65) + `src/Lumio.Api/Services/Pdf/Data/PdfDataLoader.cs` (regel 77-78)

**Huidig gedrag:**
- `PdfDataLoader.LoadAllAsync()` laadt het volledige `WachtwoordEntry`-domeinobject inclusief `EncryptedWachtwoord` in memory (`_db.Wachtwoorden.Where(w => w.EigenaarId == eid).ToListAsync()`).
- `DigitaalBezitGenerator` rendert per `WachtwoordEntry`: `w.Naam` + `w.Gebruikersnaam ?? "—"` — dit zijn semi-credentials in plaintext in een exporteerbaar PDF.
- `CryptoWallet.EncryptedSeedPhrase` wordt meegeladen maar niet gerenderd; het veld is echter beschikbaar in memory als de generator dit ooit per ongeluk inkludert.

**Risico:** AVG Art.9 — Wachtwoord-gebruikersnamen en crypto-wallet context worden zonder bevestigingsdialog meegenomen in PDF-export. Blokkeert UX-008 (export-waarschuwingsdialoog).

**Vereiste fix:**
1. `PdfDataLoader` projecteert `WachtwoordEntry` op een Safe-DTO met uitsluitend `Id`, `Naam`, `Url`, `Notities` — **nooit `EncryptedWachtwoord` of `Gebruikersnaam`**.
2. `DigitaalBezitGenerator` toont voor wachtwoorden: `"[{count} beveiligde items — gebruik app voor toegang]"` als default.
3. Integration test verifieert dat geen wachtwoord-veld lekt via `GET /api/export/digitaal-bezit`.

---

### GAP-DATA-02 → T-006: Niet-atomaire videoverwijdering (grondslag)

**Locatie:** `src/Lumio.Api/Controllers/VideoboodschappenController.cs` (regels 276-299)

**Huidig gedrag:**
```
1. ExecuteDeleteAsync() → DB-record weg (geen omkeerbaarheid)
2. videoStorage.Verwijderen(bestandsPad) → bestand weg
```

**Risico:** GDPR Art.17 (right-to-erasure):
- Als de app crasht **na** stap 1 maar **voor** stap 2: DB-record verdwenen, videobestand blijft ongewenst op disk.
- Als stap 2 gooit (disk-fout, rechten, bestand al weg): DB-record is toch verwijderd, exception wordt niet teruggedraaid.

**Vereiste fix (compensating-transaction patroon):**
```
1. BeginTransactionAsync()
2. FindAsync (entiteit ophalen)
3. Remove + SaveChangesAsync (nog niet gecommit)
4. videoStorage.Verwijderen() — file-delete poging
   → bij exception: tx.RollbackAsync() + 500-response
5. tx.CommitAsync()
```

---

## SPRINT SP-2 OVERVIEW

| Veld | Waarde |
|---|---|
| Sprint | SP-2 |
| Naam | Data Integrity |
| Doel | Verwijder datatekortkomingen die AVG Art.9 en GDPR Art.17 raken; deblokkeer UX-team voor BLK-001 |
| Stories | 2 (T-005 · T-006) |
| Totaal SP (schatting) | ~8 SP (T-005: ~4 SP · T-006: ~4 SP) |
| Afhankelijk van | SP-1 BLK-001 koppeling ✅ |
| Blokkeert | BLK-001 → UX-008 Export-waarschuwingsdialoog (na T-005) |
| Risico | HOOG — GDPR Art.17 + AVG Art.9 exposure |

---

## DEFINITION OF READY — SP-2 STORIES

### T-005: Credentials-filter in digitaal-bezit export

| Criterium | Status |
|---|---|
| ≥2 concrete acceptatiecriteria | ✅ JA (3 ACs in issue #15) |
| Afhankelijkheden opgelost | ✅ GEEN upstream — T-005 heeft geen blokkerende afhankelijkheden |
| Story ≤8 SP | ✅ SCHATTING ≤4 SP |
| Blokkeert na voltooiing | ✅ Deblokkeer UX-008 #29 (exportwaarschuwingsdialoog) |
| Specialist beschikbaar | Security-context aanwezig via SP-1 kennis |
| Tests gedocumenteerd | ✅ Integration test vereist die credential-leak verifieert |

**DoR status: READY**

---

### T-006: Atomaire videoverwijdering

| Criterium | Status |
|---|---|
| ≥2 concrete acceptatiecriteria | ✅ JA (4 ACs in issue #16) |
| Afhankelijkheden opgelost | ✅ GEEN |
| Story ≤8 SP | ✅ SCHATTING ≤4 SP |
| Compensating transaction patroon | ✅ DUIDELIJK BESCHREVEN in AC |
| Tests gedocumenteerd | ✅ Transactionele test beide failure-paden |

**DoR status: READY**

---

## LESSONS LEARNED INJECTIE (van SP-1)

| Les | Toepassing in SP-2 |
|---|---|
| Tests vooraf schrijven verhoogt focus | ✅ Tests worden gelijktijdig met implementatie geschreven |
| Branch afsplitsen van verkeerde base (SP-1 probleem) | ✅ SP-2 branch MOET van `Feature/UI` vertrekken (current HEAD) |
| PR richting `Feature/UI`, NIET `main` | ✅ Zelfde aanpak als PR #41 |
| Audit-trail via AuditService werkt in apart scope | ⚠️ Bekend risico — buiten scope SP-2, opgepakt in SP-3 backlog |

---

## SPRINT GATE BESLISSING

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SPRINT GATE – SP-2: "Data Integrity"
Status: ✅ IMPLEMENTEER — 2026-03-01

Alle pre-gate checks: ✅ GESLAAGD
GitHub Issues: #15 (T-005) · #16 (T-006)
Definition of Ready: T-005: READY · T-006: READY

Typ IMPLEMENTEER om de Implementation Agent te activeren.
Stories kunnen parallel worden uitgevoerd (geen onderlinge afhankelijkheid).
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

> **Hoe antwoorden:** Typ `IMPLEMENTEER` of `BACKLOG` als reactie op dit document.  
> Bij `IMPLEMENTEER` activeert de Orchestrator de Implementation Agent voor T-005 en T-006 (parallel uitvoerbaar).  
> Branch: `feature/sp-2-data-integrity` — af te splitsen vanuit `Feature/UI`.

---

## ORCHESTRATOR LOG — Sprint Gate SP-2

| Tijdstip | Event | Detail |
|---|---|---|
| 2026-03-01 | SPRINT_GATE_INITIATED | SP-2 — Data Integrity |
| 2026-03-01 | DECISIONS_CHECK | Geen open HOOG items — niet geblokkeerd |
| 2026-03-01 | SP1_DEPENDENCY_CHECK | SP-1 COMPLETE — BLK-001 opgelost — SHA f0a05b5 |
| 2026-03-01 | ORC13_CHECK | Issues #15 en #16 aanwezig — milestone SP-2 Data Integrity |
| 2026-03-01 | CODEBASE_ANALYSIS | GAP-DATA-02 en GAP-DATA-03 verifiëerd in broncode |
| 2026-03-01 | DOF_READY_CHECK | T-005: READY · T-006: READY |
| 2026-03-01 | SPRINT_GATE_AWAITING | Wacht op gebruikersbeslissing IMPLEMENTEER / BACKLOG |
| 2026-03-01 | IMPLEMENTEER | Gebruiker goedgekeurd — Implementation Agent geactiveerd voor T-005, T-006 |
| 2026-03-01 | IMPLEMENTATION_COMPLETE | T-005 ✅ T-006 ✅ — 178/178 tests groen — GEEN regressies — PR gereed |

---

## NEXT SPRINTS (na SP-2)

| Sprint | Status | Afhankelijk van |
|---|---|---|
| SP-UX-01 Core | QUEUED | SP-2 BLK-001 (T-005) |
| SP-3 Dev Kwaliteit | QUEUED | SP-1 compleet ✅ — kan parallel aan SP-UX-01 |
| SP-4 DevOps | QUEUED | SP-3 CI-foundation |
| SP-UX-01B | QUEUED | SP-1 + SP-2 + SP-3 |

---

## HANDOFF CHECKLIST
- [x] decisions.md gecontroleerd — geen open HOOG items
- [x] SP-1 afhankelijkheden geverifieerd (PR #41 gemerged)
- [x] GitHub Issues aanwezig (#15 T-005 · #16 T-006)
- [x] Codebase-bronnen voor elke bevinding gedocumenteerd (bestandsnaam + regelnummer)
- [x] Sprint overview en story points geschat
- [x] Definition of Ready per story gecheckt
- [x] Lessons Learned SP-1 geïnjecteerd
- [x] Sprint Gate presentatie klaar voor gebruikersbeslissing
- [x] Orchestrator Log bijgewerkt
- [x] Geen open UNCERTAIN: of INSUFFICIENT_DATA: items
