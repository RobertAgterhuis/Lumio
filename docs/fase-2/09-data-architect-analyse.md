# Analyse – Data Architectuur (Data Architect) – 2026-03-02
> Data Architect | Agent 09 | Fase 2

## Metadata
- Agent: Data Architect (09)
- Fase: 2
- Input ontvangen: alle voorgaande Fase 2 agents (05–08)
- Compliance kader: AVG/GDPR (vastgesteld door Security Architect)
- Datum: 2026-03-02

---

## 1. Data Model Inventarisatie

**Data store type:** SQLite/SQLCipher (Single-file relationele database, lokaal op eindgebruikersmachine)  
**ORM:** Entity Framework Core 10 via `LumioDbContext`  
**Migraties:** 6 EF migraties (20260226–20260302)  
**DbSet-count:** 26 DbSets in 9 bounded contexts

### Entiteitenlijst per Bounded Context

| Bounded Context | Entiteiten | Bron |
|---|---|---|
| **Common** | Eigenaar, Erfgenaam, Noodcontact, Werkgever, AuditLogEntry, AfhandelingsItem, ActualisatieBevestiging, SectieNotitie | `LumioDbContext.cs` L19-26 |
| **Asset Registry (Boedel)** | FysiekBezit, Bankrekening, Verzekering, Schuld, ErfgenaamToewijzing | `LumioDbContext.cs` L29-33 |
| **Digital Estate** | DigitaalAccount, CryptoWallet, WachtwoordEntry | `LumioDbContext.cs` L36-38 |
| **Documents** | PersoonlijkDocument | `LumioDbContext.cs` L41 |
| **Donor Registration** | DonorRegistratie, OrgaanKeuze | `LumioDbContext.cs` L44-45 |
| **Euthanasia Directive** | WilsverklaringEuthanasie, EuthanasieVoorwaarde | `LumioDbContext.cs` L48-49 |
| **Funeral Wishes** | UitvaartWensen, CeremonieDetail, UitvaartGenodigde | `LumioDbContext.cs` L52-54 |
| **Testament** | TestamentInfo, Begunstigde, Executeur, TestamentSnapshot | `LumioDbContext.cs` L57-60 |
| **Video Messages** | Videoboodschap, VideoboodschapBlob, VideoboodschapOntvanger | `LumioDbContext.cs` L63-65 |

### Root Aggregate
`Eigenaar` is de centrale entity — alle andere domeinen refereren indirect aan de eigenaar. Er is één `Eigenaar` per SQLite-database (single-user per profiel).

**Bron:** `InitialSchema.cs` L69-82 (Eigenaren-tabel), `LumioDbContext.cs` L19

### Migratie Tijdlijn

| Migratie | Datum | Inhoud |
|---|---|---|
| `InitialSchema` | 2026-02-26 | Volledig initieel schema |
| `AddWerkgever` | 2026-02-27 | Werkgever-entiteit toegevoegd |
| `AddNoodcontactExtended` | 2026-02-27 | Uitbreiding Noodcontact-velden |
| `AddVideoboodschapBestandsPad` | 2026-02-27 | BestandsPad-kolom op Videoboodschap |
| `AddPersonLinkIds` | 2026-02-28 | PersonLinkIds voor cross-domain referenties |
| `SP9_ShamirDrempel` | 2026-03-02 | Shamir drempel-instelling (SP-9) |

**Bron:** `src/Lumio.Api/Migrations/` (bestandsnamen)

---

## 2. Data Lineage

| Data Domein | Bron | Transformatie | Bestemming | Eigenaar |
|---|---|---|---|---|
| Persoonsgegevens (Eigenaar, BSN) | Eindgebruiker-invoer via OnboardingWizard | Validatie (FluentValidation), BSN mod-11 check | SQLite/SQLCipher op lokale machine | Eindgebruiker |
| Erfenisgegevens (Testament, Begunstigden, Boedel) | Eindgebruiker-invoer | Validatie, domeinregels (RulesEngine) | SQLite/SQLCipher | Eindgebruiker |
| Cryptografische sleutels (Shamir-shares) | ShamirService (SecretSharingDotNet) | Splitsing in N-van-M shares | SQLite (shares) + externe dragers (physiek) | Eindgebruiker |
| Videoboodschappen | Mediaflow vanuit Electron | VideoboodschapBlob in DB + bestandspad in `data/videos/` | SQLite (metadata) + lokaal filesystem (blob) | Eindgebruiker |
| PDF-rapporten | LumioDbContext (query) | QuestPDF generatoren | Lokale export / print | Eindgebruiker |
| Audit log | API-operaties (AuditService) | Serilog enrichment + rotatie (90 dagen) | SQLite AuditLog tabel | Systeem |
| Product analytics | Eindgebruikergedrag (PostHog JS events) | PostHog SDK | PostHog Cloud (opt-in) | Systeem (opt-in consent) |
| Backup export (NUV/ZIP) | SQLite snapshot | ZipExportService, NuvExportService, EncryptedBackupService | Lokaal bestand (eindgebruiker kiest locatie) | Eindgebruiker |

---

## 3. Data Governance Analyse

| Aspect | Status | Detail | Bron |
|---|---|---|---|
| Data eigenaarschap | ✓ DUIDELIJK | Eindgebruiker is exclusief data-eigenaar; geen data naar cloud (offline-first) | `devdocs/data-retention-policy.md` |
| Data woordenboek | ✗ AFWEZIG | Geen `docs/data-dictionary.md` of vergelijkbaar aangetroffen in workspace | Workspace-scan (616 bestanden) |
| Data retentie beleid | ✓ AANWEZIG | Data Retention Policy v1.1, DPO sign-off 2026-03-01, 90-dagen AuditLog rotatie | `devdocs/data-retention-policy.md` |
| Data classificatie | GEDEELTELIJK | DPIA classificeert bijzondere categorieën; geen formeel classificatieschema per tabel per kolom | `devdocs/dpia-bijzondere-categorieen.md` |
| Data woordenboek entiteiten | ✗ AFWEZIG | Dutch-named entities zonder beschrijving in code of docs | `LumioDbContext.cs` |

`GAP-DATA-001: Geen data woordenboek beschikbaar`

---

## 4. Data Kwaliteit Analyse

| Aspect | Status | Detail | Bron |
|---|---|---|---|
| Validatie | ✓ AANWEZIG | FluentValidation 11 op alle controllers; BSN mod-11 validatie | `Lumio.Api.csproj` |
| Duplicaten-patronen | UNCERTAIN | Geen uniekheids-constraints zichtbaar in InitialSchema voor BSN; meerdere Eigenaar-rows theoretisch mogelijk per DB | `InitialSchema.cs` (gedeeltelijk gelezen) |
| Nullable velden | GEDEELTELIJK | BSN nullable (`BSN` `TEXT NULL` in Eigenaren), Adres nullable — correcte keuze voor optionele gegevens | `InitialSchema.cs` L84 |
| AuditLog-integriteit | GEDEELTELIJK | `AuditLogEntry.EntityId` is nullable Guid zonder FK naar Eigenaren — intentioneel (audit log blijft na right-to-erasure) maar bemoeilijkt GDPR-audit-trail | `LumioDbContext.cs` L24 |
| Schema bridge (ADR-001) | ✗ TECHNISCHE SCHULD | MigratieDbHelper.EnsureSchuldKolommenAsync: raw DDL voor pre-migratie databases; data integriteitsrisico bij schema-afwijking | `devdocs/adr-001-schulden-schema-brug.md` |

`GAP-DATA-002: MigratieDbHelper DDL bridge is technische schuld; risico op data-integriteitsfouten`
`UNCERTAIN-DATA-001: BSN-uniekheid niet geverifieerd via constraint`

---

## 5. Analytics en Reporting Architectuur

| Aspect | Status | Detail | Bron |
|---|---|---|---|
| Rapporten | ✓ AANWEZIG | QuestPDF 2026.2.2 met 14+ PDF-generators (Testament, Boedel, Donor, etc.) | `Program.cs` L83-100 |
| Product analytics | ✓ AANWEZIG (opt-in) | PostHog JS SDK voor feature usage events (opt-in in productie) | `devdocs/posthog-analytics.md` |
| Data warehouse | N/A | Offline desktop-app; geen centraal dataplatform | — |
| Real-time verwerking | N/A | Geen streaming; alle bewerkingen zijn synchrone user-initiated acties | — |
| BI-tooling | AFWEZIG | Geen externe BI-tooling in scope | — |

---

## 6. Data-Compliance Analyse (AVG/GDPR)

| AVG Vereiste | Status | Detail | Bron |
|---|---|---|---|
| Verwerking bijzondere persoonsgegevens | ✓ GRONDSLAG AANWEZIG | DPIA aanwezig + DPO sign-off 2026-03-01 | `devdocs/dpia-bijzondere-categorieen.md` |
| Data minimalisatie | ✓ GOED | BSN nullable; alle velden optioneel tenzij functioneel verplicht | `InitialSchema.cs` |
| Recht op vergetelheid (right-to-erasure) | ✓ GEÏMPLEMENTEERD | Cascade delete from Eigenaar → alle gerelateerde tabellen | `InitialSchema.cs` (cascade constraints) |
| Datapositie: BSN in logs | ✓ BEVEILIGD | BSN-masking Serilog enricher actief | `Program.cs` L52; GUARD-SEC-01 |
| Retentiebeleid AuditLog | ✓ GEBORGD | AuditLogRotatieService: 90 dagen, automatisch | `Program.cs` L106, `devdocs/data-retention-policy.md` |
| Data buiten EU/EER | UNCERTAIN | PostHog cloud (app.posthog.com) — is dit een EU-datacenter? Opt-in consent aanwezig maar locatie UNCERTAIN | `devdocs/dpia-bijzondere-categorieen.md` |

`UNCERTAIN-DATA-002: PostHog datacenter locatie (EU vs. US) niet geverifieerd voor AVG-doeleinden`

---

## 7. Gap Analyse

| ID | Omschrijving | Ernst |
|---|---|---|
| GAP-DATA-001 | Geen data woordenboek | Midden |
| GAP-DATA-002 | MigratieDbHelper DDL bridge (ADR-001) | Midden |
| UNCERTAIN-DATA-001 | BSN uniekheid niet geverifieerd via DB-constraint | Midden |
| UNCERTAIN-DATA-002 | PostHog datacenter locatie (AVG) | Midden |

---

## 8. Zelfcontrole Fase 2 Compleetheid

Alle vijf Fase 2 agents hebben output geleverd:
- ✓ Software Architect (05): architectuur + DDD-analyse
- ✓ Senior Developer (06): code kwaliteit + test coverage
- ✓ DevOps Engineer (07): CI/CD + observability
- ✓ Security Architect (08): OWASP + compliance + security handoff context
- ✓ Data Architect (09): data model + governance + compliance

**Gecombineerde Fase 2 bevindingen zijn gereed voor Critic + Risk validatie.**

---

## HANDOFF CHECKLIST — Analyse Data Architect
- [x] Data model volledig geïnventariseerd (26 DbSets, 9 contexten)
- [x] Data lineage gedocumenteerd voor alle 8 primaire datadomeinen
- [x] GDPR-compliance beoordeeld per vereiste
- [x] Data governance gaps gedocumenteerd
- [x] UNCERTAIN items gedocumenteerd (DATA-001, DATA-002)
- [x] Fase 2 compleetheid bevestigd
- [x] Bronverwijzingen aanwezig
- [x] Status: READY voor Data Architect Aanbevelingen
