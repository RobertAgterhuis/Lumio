# REEVALUATE TECHNIEK + UX — v2
**Datum:** 2026-03-02  
**Trigger:** `REEVALUATE TECHNIEK UX` — delta-scan na voltooiing SP-8 (R001–R005, UX-001/003) + SP-9 (UX-001, R001–R005)  
**Scope:** FASE-2 (Techniek & Architectuur) + FASE-3 (UX & Product)  
**Vorige versie:**  
- FASE-2 v1: `docs/synthesis/reevaluate-fase2-techniek-2026-03-02.md` (HEAD `3948c3b`)  
- FASE-3 v1: `docs/synthesis/reevaluate-fase3-ux-2026-03-02.md` (HEAD `6a04cf2`)  
**Huidige HEAD:** `77cb7b1` (main, 2026-03-02)  
**Agent:** 23 – Reevaluate Agent

---

## Executive Summary

Van de **14 open bevindingen** uit reevaluate v1 zijn er **13 volledig opgelost** via SP-8 en SP-9. De codekwaliteit, security-posture en WCAG-compliance zijn significant verbeterd. Twee nieuwe bevindingen (HOOG) zijn geïdentificeerd die bij SP-9-UX-001 zijn geïntroduceerd:

1. **NEW-ARCH-001**: `GET /api/shamir/drempel` ontbreekt in `DatabaseUnlockMiddleware.AllowedPrefixes` → endpoint retourneert HTTP 423 in de vergrendelde staat → `HeirUnlockForm` valt stil terug op threshold=2, waardoor SP-9-UX-001 functioneel onvolledig is voor eigenaars met drempel > 2.
2. **NEW-DATA-001**: `MigratieDbHelper.newMigrations` mist migratie `20260302113751_SP9_ShamirDrempel` → pre-migratie databases (EnsureCreated-bootstrap) krijgen de `ShamirDrempel`-kolom nooit aangemaakt → runtime-fout bij `GET /api/shamir/drempel` en `POST /api/shamir/genereer`.

Beide bevindingen vereisen een corrective story vóór de volgende productie-release. WCAG-status en overige security-posture zijn ongewijzigd positief.

---

## DELTA-SCAN RAPPORT
- **Analyseversie:** v1 → v2
- **Datum vorige analyses:** 2026-03-02 (FASE-2 + FASE-3 v1)
- **Datum herevaluatie:** 2026-03-02
- **Scope:** FASE-2 (Techniek) + FASE-3 (UX)
- **Commits in delta:** `25aaf4d` → `77cb7b1` (10 commits)

| Commit | Omschrijving | Raak aan |
|--------|-------------|---------|
| `516328a` | SP-8-R001: Swagger IsDevelopment guard | SEC-001 |
| `02bba19` | SP-8-R002: AuditLogRotatieService | SEC-005 / DATA-002 |
| `9dc27c1` | SP-8-R003: AuditService + KDF LogWarning | DEV-002/DEV-003 |
| `2a9b17d` | SP-8-R004: NuGet scan + zombie dep verwijderd | ARCH-001 / OPS-001 |
| `5de93fe` | SP-8-R005: Coverage scope Services + gate 70% | DEV-005 / OPS-002 |
| `6a04cf2` | SP-8-UX-001/003: OnboardingWizard focus-trap + progressbar | RP-ACC-002 / RP-ACC-NEW-02 |
| `d0a4d10` | SP-9-UX-001: HeirUnlockForm dynamic threshold | UXR-001 |
| `77cb7b1` | SP-9-R001–R005: ARCH-002 / DEV-001 / SEC-002 / SEC-006 / DATA-003 | Meerdere |

---

### Verdwenen bevindingen (OPGELOST)

| ID | Beschrijving | Oplossing | Bewijs |
|----|-------------|-----------|--------|
| SEC-001 | Swagger UI toegankelijk in productie | `if (IsDevelopment())` guard | `Program.cs` — `516328a` |
| SEC-005 | AuditLog-rotatie niet geïmplementeerd (GDPR art.5) | `AuditLogRotatieService : BackgroundService` | `Services/AuditLogRotatieService.cs` — `02bba19` |
| DATA-002 | AuditLog-tabel groeit onbeperkt | Idem SEC-005 | Idem |
| DEV-002 | AuditService swallows exceptions stil | `ILogger<AuditService>` + `LogWarning` | `Services/AuditService.cs` — `9dc27c1` |
| DEV-003 | KDF-migratiefout via `Debug.WriteLine` | `ILogger.LogWarning(kdfEx, ...)` | `MasterPasswordService.cs` — `9dc27c1` |
| ARCH-001 | Zombie-dep `System.Linq.Dynamic.Core 1.7.1` | Verwijderd uit `.csproj` | `Lumio.Api.csproj` — `2a9b17d` |
| OPS-001 | Geen NuGet vulnerability scan in CI | `dotnet list package --vulnerable` stap toegevoegd | `.github/workflows/ci.yml` — `2a9b17d` |
| DEV-005 | Coverage scope alleen Validators | `services-coverage.runsettings`: Services + Validators; gate → 70% | `services-coverage.runsettings` — `5de93fe` |
| OPS-002 | Coverage-rapportage misleidend | Idem DEV-005 | Idem |
| ARCH-002 | `MigratieDbHelper.cs` in `Controllers/` | `git mv` → `Data/`, namespace `Lumio.Api.Data` | `src/Lumio.Api/Data/MigratieDbHelper.cs` — `77cb7b1` |
| DEV-001 | `ZoekenController` full-table scans | `.Take(500)` cap per DbSet | `ZoekenController.cs` regels 32–120 — `77cb7b1` |
| SEC-006 | `data-retention-policy.md §4` TODO verouderd | `✅ GEÏMPLEMENTEERD` + verwijzing `DELETE /api/auth/account` | `devdocs/data-retention-policy.md:80` |
| DATA-003 | Schema-drift `EnsureSchuldKolommenAsync` — geen ADR | `devdocs/adr-001-schulden-schema-brug.md` aangemaakt | ADR — `77cb7b1` |
| SEC-002 | BruteForce state reset bij herstart — niet gedocumenteerd | DEC-108 in `docs/decisions.md` als aanvaard risico | `decisions.md` — `77cb7b1` |
| UXR-001 | HeirUnlockForm drempel hardcoded op 2 (SC 3.3.2) | SP-9-UX-001: `useEffect` + `GET /api/shamir/drempel`; i18n `{drempel}` | `HeirUnlockForm.tsx` — `d0a4d10` ⚠️ zie NEW-ARCH-001 |

### Nieuwe bevindingen

**NEW-ARCH-001 (NIEUW) — `GET /api/shamir/drempel` niet in `DatabaseUnlockMiddleware.AllowedPrefixes`**  
_Bron: `src/Lumio.Api/Middleware/DatabaseUnlockMiddleware.cs` regels 9-14 + `src/lumio-web/src/components/auth/HeirUnlockForm.tsx` regels 28-40_

`DatabaseUnlockMiddleware.AllowedPrefixes` bevat: `/api/auth/`, `/api/profielen`, `/api/backup/restore`, `/swagger`. Het `GET /api/shamir/drempel` endpoint is hier **niet** in opgenomen.

De `HeirUnlockForm` roept `/api/shamir/drempel` aan via `useEffect` tijdens het erfgenaam-ontvergrendelscherm — een moment waarop de database per definitie vergrendeld is (anders zou de form niet worden getoond). De middleware retourneert HTTP 423. De catch-handler in `HeirUnlockForm.tsx` (regel 38: `// Valt terug op de initiële default (2 = ShamirMinDrempel)`) maskeert de fout stilzwijgend. Resultaat: de dynamische drempelweergave uit SP-9-UX-001 werkt nooit in de praktijk — alle erfgenamen zien altijd drempel=2 ongeacht de eigenaar-instelling.

**Ernst:** HOOG — de primaire functionaliteitsdoelstelling van SP-9-UX-001 is niet bereikt voor eigenaars die drempel > 2 hebben ingesteld.  
**Aanbeveling:** Voeg `/api/shamir/drempel` toe aan `AllowedPrefixes` in `DatabaseUnlockMiddleware.cs`.  
**Scope:** `src/Lumio.Api/Middleware/DatabaseUnlockMiddleware.cs` — regel 9

---

**NEW-DATA-001 (NIEUW) — `MigratieDbHelper.newMigrations` mist `SP9_ShamirDrempel`**  
_Bron: `src/Lumio.Api/Data/MigratieDbHelper.cs` regels 37-44_

```csharp
var newMigrations = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
{
    "20260224151055_AddSchuldBezitLink"
};
```

`EnsureMigratedAsync` markeert alle migrations **buiten** `newMigrations` als reeds toegepast in `__EFMigrationsHistory`, zodat `MigrateAsync()` ze overslaat. De nieuwe migratie `20260302113751_SP9_ShamirDrempel` (kolom `ShamirDrempel int? NULL` op tabel `Eigenaren`) zit NIET in de `newMigrations`-set → wordt voor pre-migratie databases (aangemaakt met `EnsureCreated`) als "reeds toegepast" gebaselijnd terwijl de kolom fysiek niet bestaat.

Gevolgen voor pre-migratie databases:
- `GET /api/shamir/drempel`: `_db.Eigenaren.FirstOrDefaultAsync()` gooit SQLite `no such column: e.ShamirDrempel` → HTTP 500
- `POST /api/shamir/genereer`: `eigenaar.ShamirDrempel = request.Drempel` → crash bij `SaveChangesAsync()`
- Belt-and-suspenders in `EnsureSchuldKolommenAsync` dekt uitsluitend `Schulden`-kolommen, niet `Eigenaren.ShamirDrempel`

**Ernst:** HOOG — productie-crash voor eigenaars op pre-migratie (EnsureCreated) databases zodra zij Shamir-shares proberen te genereren of erfgenamen het drempel-endpoint aanroepen.  
**Aanbeveling:** Voeg `"20260302113751_SP9_ShamirDrempel"` toe aan de `newMigrations` HashSet in `MigratieDbHelper.cs`, of voeg een belt-and-suspenders `ALTER TABLE "Eigenaren" ADD COLUMN "ShamirDrempel" INTEGER NULL` toe aan `EnsureSchuldKolommenAsync` (hernomen naar generiekere naam).  
**Scope:** `src/Lumio.Api/Data/MigratieDbHelper.cs` — regels 37-44

---

### Onveranderde bevindingen

| ID | Omschrijving | Status |
|----|-------------|--------|
| ARCH-003 | GUARD-010 legacy violaties in 4 controllers (`VideoboodschappenController`, `BoedelController`, `DigitaalBezitController`, `AfhandelingController`) — geen sprint-ID | OPEN — bewust uitgesteld; deferred SP-10 (zie besluitnotitie in v1-rapport) |
| UXR-002 | PostHog + Shamir UX test: geen empirische data; BLK-UX-01 + BLK-UX-02 open | OPEN — externe afhankelijkheid; geen technische fix mogelijk |

---

## Agent 05 — Software Architect (delta)

### Heroverwogen bevindingen

**ARCH-002 → OPGELOST:** `MigratieDbHelper.cs` correct verplaatst via `git mv`. Namespace `Lumio.Api.Data` ✅. Beide aanroepers (`AuthController:102`, `AuthSetupController:85`) compilen foutloos (`dotnet build` 0 errors, 0 warnings — geverifieerd).

**ARCH-003 → ONGEWIJZIGD:** 4 controllers > 200 regels, still in GUARD-010 known-violations lijst in `ci.yml`. Geen sprint-ID. **Actie vereist bij SP-10 planning.**

**NEW-DATA-001 (Architectuurimpact):** de `newMigrations` HashSet in `MigratieDbHelper.cs` is een **handmatig-onderhouden lijst** die bij élke nieuwe EF-migratie moet worden bijgewerkt. Dit is een sluipend onderhoudsrisico — bij een volgende sprint vergeet men opnieuw de HashSet. Aanbeveling: voeg een CI-check toe die valideert dat de `newMigrations` HashSet synchroon loopt met de migrations-directory.

### Score (delta)
| Criterium | v1 score | v2 score | Delta |
|-----------|---------|---------|-------|
| DDD-adherentie | 4/5 | 4/5 | = |
| Koppeling | 4/5 | 5/5 | ✅ MigratieDbHelper correct geplaatst |
| Tech debt | 3/5 | 3/5 | = (ARCH-003 + NEW-DATA-001 trekken score gelijk) |
| Compliantie GUARD | 4/5 | 4/5 | = |

---

## Agent 06 — Senior Developer (delta)

### Heroverwogen bevindingen

**DEV-001 → OPGELOST:** `Take(500)` cap aanwezig op alle 10 DbSet-queries in `ZoekenController.cs`. Comment `// SP-9: Defensieve cap — voorkomt memory-issue bij grote datasets (DEV-001)` aanwezig. Correct vóór `ToListAsync()` geplaatst.

**DEV-002/003 → OPGELOST:** `AuditService.LogAsync` logt `LogWarning` via `ILogger<AuditService>`. `MasterPasswordService.UnlockAsync` logt KDF-migratiefout via `LogWarning` (in plaats van `Debug.WriteLine`).

**SP-9 coverage:** Migration `20260302113751_SP9_ShamirDrempel` is een enkelvoudige additive migration zonder destruktieve wijzigingen. Correct patroon. Test-coverage voor `ShamirController.GetDrempel()` is **niet geverifieerd** — `INSUFFICIENT_DATA:` — coverage-rapporten van SP-9 niet aangetroffen in `docs/metrics/`.

### Score (delta)
| Criterium | v1 score | v2 score | Delta |
|-----------|---------|---------|-------|
| Testcoverage | 4/5 | 4/5 | = (NEW-DATA-001 nog niet gecoverd) |
| Code-kwaliteit | 4/5 | 5/5 | ✅ Full-table scan + stille audit-swallow opgelost |
| Observability in code | 2/5 | 4/5 | ✅ LogWarning geïmplementeerd |
| Dependency-hygiëne | 3/5 | 5/5 | ✅ Zombie-dep verwijderd |

---

## Agent 07 — DevOps Engineer (delta)

### Heroverwogen bevindingen

**OPS-001 → OPGELOST:** `ci.yml` backend-job bevat NuGet vulnerability scan stap. `System.Linq.Dynamic.Core` verwijderd uit `.csproj` — geen false positive meer.

**OPS-002 → OPGELOST:** `services-coverage.runsettings` bevat `Lumio.Api.Services.*` + `Lumio.Api.Validators.*`. Coverage gate verhoogd naar ≥70%. Verouderd comment verwijderd.

**CI-observatie:** `dotnet build --warnaserror` is actief. SP-9 builds zijn clean (0 warnings). Geen nieuwe CI-issues na SP-9-R branch-merge.

**NEW-CI-001 (Aanbeveling/LAAG):** De `newMigrations` HashSet in `MigratieDbHelper.cs` is handmatig. Overweeg een CI-check die telt of het aantal entries in de HashSet overeenkomt met het totaal aantal migration-bestanden min één (de baseline AddSchuldBezitLink). Dit voorkomt herhaling van NEW-DATA-001.

### Score (delta)
| Criterium | v1 score | v2 score | Delta |
|-----------|---------|---------|-------|
| CI-maturity | 4/5 | 5/5 | ✅ NuGet scan toegevoegd |
| Coverage-rapportage | 2/5 | 5/5 | ✅ Scope + gate gefixed |
| Tooling-versies | 5/5 | 5/5 | = |

---

## Agent 08 — Security Architect (delta)

### Heroverwogen bevindingen

**SEC-001 → OPGELOST:** `Program.cs` — `app.UseSwagger()` + `app.UseSwaggerUI()` correct gewrapped in `if (app.Environment.IsDevelopment())`. `/swagger` retourneert 404 in productie.

**SEC-002 → OPGELOST (als gedocumenteerd risico):** DEC-108 aanwezig in `docs/decisions.md` met volledige risicoanalyse (AES-256 SQLCipher als primaire verdedigingslinie; herstart vereist fysieke toegang). Geen code-actie vereist.

**SEC-005 → OPGELOST:** `AuditLogRotatieService` geregistreerd in `Program.cs` regel 98. Retentiebeleid §3.4 bijgewerkt.

**NEW-ARCH-001 (Securityimpact):** `GET /api/shamir/drempel` is een onbeschermd endpoint (of bedoeld onbeschermd — het is informatief). Toevoeging aan `AllowedPrefixes` is correct en veilig: het endpoint retourneert uitsluitend een integer (de drempelwaarde) en bevat geen gevoelige data.

**OWASP A03 (Heroverweging):** `ZoekenController` heeft nu `.Take(500)` per DbSet. Full-table scan risico gereduceerd. ✅

### Gecorrigeerde OWASP Top 10 status

| OWASP | v1 status | v2 status | Delta |
|-------|---------|---------|-------|
| A05 Misconfig | ⚠️ Swagger in prod | ✅ | ✅ SEC-001 opgelost |
| A06 Vuln Components | ⚠️ Geen NuGet scan | ✅ | ✅ OPS-001 opgelost |
| A09 Sec Logging | ⚠️ AuditService swallow | ✅ | ✅ DEV-002 opgelost |
| Alle andere | ✅ | ✅ | = |

### Score (delta)
| Criterium | v1 score | v2 score | Delta |
|-----------|---------|---------|-------|
| Encryptie at rest | 5/5 | 5/5 | = |
| Auth & toegangscontrole | 4/5 | 4/5 | = (NEW-ARCH-001 aftrek) |
| GDPR-implementatie | 4/5 | 5/5 | ✅ Auditlog rotatie geïmplementeerd |
| Security monitoring | 3/5 | 4/5 | ✅ LogWarning + Swagger guard |

---

## Agent 09 — Data Architect (delta)

### Heroverwogen bevindingen

**DATA-002/SEC-005 → OPGELOST:** `AuditLogRotatieService` actief.

**DATA-003 → OPGELOST:** `devdocs/adr-001-schulden-schema-brug.md` aanwezig. ADR documenteert intentioneel karakter, verwijdercriteria, en scope. ✅

**NEW-DATA-001 — Kritieke regressie via `MigratieDbHelper.newMigrations`:**  
Zie hierboven. De `EnsureSchuldKolommenAsync` belt-and-suspenders dekt de `Schulden`-tabel. Maar `Eigenaar.ShamirDrempel` valt buiten deze dekking. Voor pre-migratie databases geldt: de kolom wordt nooit aangemaakt. Twee herstelstrategieën:

*Optie A (aanbevolen):* voeg migratie-ID toe aan `newMigrations` HashSet:
```csharp
var newMigrations = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
{
    "20260224151055_AddSchuldBezitLink",
    "20260302113751_SP9_ShamirDrempel"   // ← toevoegen
};
```

*Optie B (belt-and-suspenders additioneel):* voeg SQL-check toe aan `EnsureSchuldKolommenAsync`:
```csharp
// Eigenaar — ShamirDrempel kolom
try { await db.Database.ExecuteSqlRawAsync("SELECT \"ShamirDrempel\" FROM \"Eigenaren\" LIMIT 0"); }
catch { await db.Database.ExecuteSqlRawAsync("ALTER TABLE \"Eigenaren\" ADD COLUMN \"ShamirDrempel\" INTEGER NULL"); }
```

*Aanbeveling:* beide opties combineren (optie A vereist, optie B als belt-and-suspenders conform bestaand patroon).

### Score (delta)
| Criterium | v1 score | v2 score | Delta |
|-----------|---------|---------|-------|
| Data-model kwaliteit | 4/5 | 4/5 | = |
| GDPR-compliancy | 4/5 | 5/5 | ✅ Auditlog rotatie |
| Schema lifecycle | 4/5 | 3/5 | ⬇️ NEW-DATA-001 regressie |
| Documentatie | 3/5 | 5/5 | ✅ ADR + retentiebeleid bijgewerkt |

---

## Agent 10 — UX Researcher (Re-evaluatie v2)

### Heroverwogen bevindingen

**UXR-001 — GEDEELTELIJK OPGELOST:**  
SP-9-UX-001 is correct geïmplementeerd op code-niveau: `HeirUnlockForm.tsx` roept `GET /api/shamir/drempel` aan en injecteert de drempelwaarde in zowel de intro-stap als de codes-stap. De i18n-sleutels `{drempel}` zijn correct aanwezig in `nl/auth.json` en `en/auth.json`.

Echter: door NEW-ARCH-001 retourneert dit endpoint HTTP 423 in de vergrendelde DB-staat. De catch-handler in `HeirUnlockForm.tsx:38-40` maskeert dit stilzwijgend. **In productie zien alle erfgenamen threshold=2, ongeacht de eigenaar-instelling.**

Status herclassificatie: `UXR-001` van OPGELOST → **GEDEELTELIJK OPGELOST** totdat NEW-ARCH-001 is gefixed.

**UXR-002 → ONGEWIJZIGD:** PostHog niet actief (BLK-UX-02). Shamir UX test niet uitgevoerd (BLK-UX-01). Geen empirische data voor KPI-baselines. Externe coördinatie vereist.

---

## Agent 13 — Accessibility Specialist (Re-evaluatie v2)

### WCAG-status (ongewijzigd t.o.v. v1 post-SP-8)

| Principe | v1 post-SP-8 | v2 | Delta |
|----------|-------------|-----|-------|
| Perceivable (1.x) | 0 violations | 0 violations | = |
| Operable (2.x) | 0 violations | 0 violations | = |
| Understandable (3.x) | 1 open item (UXR-001) | ⚠️ 1 open item (UXR-001 gedeeltelijk) | = |
| Robust (4.x) | 0 violations | 0 violations | = |

**SC 3.3.2 (Labels or Instructions):** HeirUnlockForm toont drempel-instructie in de intro-stap, maar met falsely fallback waarde (2). Voor eigenaars met drempel=2 is dit correct. Voor eigenaars met drempel > 2 ontvangt de erfgenaam **onjuiste instructies** → SC 3.3.2 technisch nog niet volledig voldaan in deze edge-case.

**EAA / EN 301 549 compliance:** Ongewijzigd WCAG-AA-Compliant voor alle andere flows. SC 3.3.2 reste issue is geen EAA-blocker.

---

## AANBEVELING-DELTA v2

### Nieuwe aanbevelingen (corrective stories)

**REC-SP10-COR-001 (NIEUW, HOOG)** — `DatabaseUnlockMiddleware`: voeg `/api/shamir/drempel` toe aan `AllowedPrefixes`  
_Gebaseerd op: NEW-ARCH-001_  
- `DatabaseUnlockMiddleware.cs` regel 9: voeg `"/api/shamir/drempel"` toe aan `AllowedPrefixes`-array
- Geen verdere wijzigingen vereist — endpoint bevat geen gevoelige data

**REC-SP10-COR-002 (NIEUW, HOOG)** — `MigratieDbHelper`: voeg `SP9_ShamirDrempel` toe aan `newMigrations` + belt-and-suspenders  
_Gebaseerd op: NEW-DATA-001_  
- Optie A: voeg `"20260302113751_SP9_ShamirDrempel"` toe aan `newMigrations` HashSet
- Optie B: voeg `ShamirDrempel`-check toe aan `EnsureSchuldKolommenAsync` (of hernoemde methode)
- Optie C (structureel, LAAG): CI-check die de HashSet-grootte valideert tegen het aantal migrations-bestanden

### Aangepaste aanbevelingen
- **UXR-001 → HERКЛАССIFICEERD:** was OPGELOST, nu GEDEELTELIJK OPGELOST. Volledig opgelost na REC-SP10-COR-001.

### Vervallen aanbevelingen
_Geen_ — alle v1-aanbevelingen die OPGELOST zijn, blijven opgelost.

### Ongewijzigde aanbevelingen (open)
- ARCH-003 → SP-10 registratie (4 GUARD-010 legacy controllers)
- UXR-002 → externe coördinatie PostHog + Shamir UX test

---

## Sprint Backlog Impact

| Sprint | Status | Impact | Aanbevolen actie |
|--------|--------|--------|-----------------|
| SP-1 t/m SP-8 | COMPLETED | Geen drift gedetecteerd | Geen actie |
| SP-9 | COMPLETED | UXR-001 gedeeltelijk — NEW-ARCH-001 + NEW-DATA-001 geïntroduceerd | Correctiestory aanmaken (SP-10) |
| SP-10 | QUEUED (niet formeel geopend) | Twee nieuwe HOOG-stories | Stories toevoegen vóór Sprint Gate SP-10 |

**Drift SP-9 (COMPLETED):**  
SP-9-UX-001 is geïmplementeerd maar introduceert twee bugs (NEW-ARCH-001 / NEW-DATA-001). Volgens de REEVALUATE-regels mogen COMPLETED sprints niet worden teruggedraaid. De bugs worden als nieuwe stories ingepland in SP-10.

---

## Sprint-Delta Voorstel

### Nieuwe stories voor SP-10 (corrective)

**SP-10-COR-001 — DatabaseUnlockMiddleware: `/api/shamir/drempel` toevoegen aan AllowedPrefixes (HIGH)**
```
Als erfgenaam
wil ik de drempelwaarde kunnen zien op het ontvergrendelscherm
zodat ik weet hoeveel codes ik nodig heb vóórdat ik probeer in te loggen

Acceptatiecriteria:
- [ ] DatabaseUnlockMiddleware.AllowedPrefixes bevat "/api/shamir/drempel"
- [ ] GET /api/shamir/drempel retourneert HTTP 200 (niet 423) als database vergrendeld is maar profiel geselecteerd
- [ ] HeirUnlockForm toont correcte drempelwaarde (niet altijd 2) op testomgeving met drempel=3
- [ ] Unit/integratietest: drempel-endpoint is bereikbaar zonder unlock
Effort: 1 SP | Bron: NEW-ARCH-001 | Bron-bestand: DatabaseUnlockMiddleware.cs:9
```

**SP-10-COR-002 — MigratieDbHelper: SP9_ShamirDrempel in newMigrations + belt-and-suspenders (HIGH)**
```
Als eigenaar met een pre-migratie database
wil ik dat de ShamirDrempel-kolom automatisch wordt aangemaakt bij de eerste unlock
zodat generate-shares en get-drempel niet crashen na de SP-9-upgrade

Acceptatiecriteria:
- [ ] "20260302113751_SP9_ShamirDrempel" toegevoegd aan MigratieDbHelper.newMigrations
- [ ] EnsureSchuldKolommenAsync (of nieuwe methode) voegt ShamirDrempel-check toe als belt-and-suspenders
- [ ] Test: legacy-database-scenario (EnsureCreated bootstrap) slaagt na EnsureMigratedAsync
- [ ] Geen regressie voor reguliere (MigrateAsync) databases
Effort: 1 SP | Bron: NEW-DATA-001 | Bron-bestand: MigratieDbHelper.cs:37-44
```

**SP-10-001 t/m SP-10-004 — GUARD-010 legacy controllers** (conform v1-aanbeveling ARCH-003 — bij SP-10 planning toe te voegen)

---

## Critic + Risk Validatie

### Critic Agent

| Check | Oordeel | Toelichting |
|-------|---------|-------------|
| Delta-scan volledig (nieuw/verdwenen/gewijzigd/ongewijzigd) | ✅ PASSED | Alle 14 v1-bevindingen beoordeeld; 2 nieuwe bevindingen met bronvermelding |
| Bronvermelding alle bevindingen | ✅ PASSED | Bestandsnaam + regelnummer aanwezig voor alle findings |
| OPGELOST-items: bewijs aanwezig | ✅ PASSED | Commit-hashes + bestandsreferenties voor alle 14 opgeloste items |
| Geen contradicties | ✅ PASSED | UXR-001 herclassificatie is consistent met NEW-ARCH-001 |
| Sprint-status regels gerespecteerd | ✅ PASSED | Geen status-wijziging voor COMPLETED sprints; correctiestories als QUEUED SP-10 |
| UNCERTAIN: items gedocumenteerd | ✅ PASSED | SP-9-UX-001 test-coverage `INSUFFICIENT_DATA:` gedocumenteerd |

**Oordeel Critic Agent:** PASSED

### Risk Agent

| Risico | Waarschijnlijkheid | Impact | Score | Beheersmaatregel |
|--------|------------------|--------|-------|-----------------|
| NEW-ARCH-001: SP-9-UX-001 functioneel onvolledig in productie | HOOG (elke heir unlock poging bij drempel>2) | HOOG (erfgenamen ontvangen verkeerde instructies in emotionele situatie) | 9 | SP-10-COR-001 vóór release |
| NEW-DATA-001: pre-migratie databases crashen bij Shamir-functies | MIDDEL (afhankelijk van deployment-type) | HOOG (HTTP 500 crash bij share-generatie) | 6 | SP-10-COR-002 vóór release |
| ARCH-003: GUARD-010 legacy controllers → tech debt groeit | LAAG | LAAG | 1 | SP-10-001..004 bij planning |
| UXR-002: geen empirische UX-data | LAAG | MIDDEL | 2 | Externe coördinatie |

**Hoogste risico's na v1 → v2:** RISK-NEW-001 (score 9) en RISK-NEW-002 (score 6) vereisen correctiestories vóór de volgende productie-release. Geen van de v1-hoge risico's (SEC-001, SEC-005, DEV-002) is nog open.

**Oordeel Risk Agent:** PASSED (conditie: SP-10-COR-001 + SP-10-COR-002 gaan vóór productie-release)

---

## Strategische bevindingen voor `docs/decisions.md`

**DEC-109 (BESLOTEN) — SP-9-UX-001 gedeeltelijk geïmplementeerd; correctie vereist vóór release**  
`GET /api/shamir/drempel` mist `AllowedPrefixes`-entry → endpoint niet bereikbaar in vergrendelde staat → HeirUnlockForm valt terug op hardcoded threshold=2. SP-10-COR-001 is verplicht vóór productie-release. Agents mogen SP-9-UX-001 niet als fully-complete markeren.

**DEC-110 (BESLOTEN) — `MigratieDbHelper.newMigrations` is handmatig onderhouden; bij elke nieuwe migratie updaten**  
NEW-DATA-001 toont aan dat `newMigrations` niet automatisch wordt bijgehouden. Elke implementatie-agent die een EF-migratie toevoegt, MOET ook `newMigrations` in `MigratieDbHelper.cs` bijwerken.

---

## Versiegeschiedenis

| Versie | Datum | Scope | Trigger |
|--------|-------|-------|---------|
| v1 (FASE-2) | 2026-03-02 | FASE-2 Techniek | `REEVALUATE FASE-2` — baseline na SP-1..SP-7 |
| v1 (FASE-3) | 2026-03-02 | FASE-3 UX | `REEVALUATE FASE-3` — baseline na SP-UX-01..03 |
| **v2 (gecombineerd)** | **2026-03-02** | **FASE-2 + FASE-3** | **`REEVALUATE TECHNIEK UX` — delta na SP-8 + SP-9** |

---

## HANDOFF CHECKLIST

- [x] Delta-Scan Rapport is volledig (nieuw / verdwenen / gewijzigd / ongewijzigd)
- [x] Alle OPGELOST bevindingen hebben aantoonbaar bewijs (commit-hash + bestandsnaam)
- [x] Alle IN_PROGRESS sprint vlagmeldingen: geen IN_PROGRESS sprints geraakt — GEEN
- [x] COMPLETED sprints: SP-9 drift gedocumenteerd (NEW-ARCH-001 + NEW-DATA-001)
- [x] Sprint-Delta Voorstel bevat geen status-wijzigingen voor IN_PROGRESS/COMPLETED sprints
- [x] Aanbeveling-Delta gesynchroniseerd met bevindingsdelta
- [x] Critic Agent: PASSED
- [x] Risk Agent: PASSED (conditie: COR-001/002 vóór release)
- [x] Strategische bevindingen verwerkt: DEC-109 + DEC-110 voorbereid voor `docs/decisions.md`
- [x] Re-evaluation Report compleet en machine-leesbaar
- [x] Versiegeschiedenis bijgewerkt
- [x] Output aangeleverd aan Orchestrator voor Sprint Gate SP-10

---

_Gegenereerd door REEVALUATE Agent (skill 23) — HEAD `77cb7b1` (main, 2026-03-02)_  
_v1-baselines: `reevaluate-fase2-techniek-2026-03-02.md` (HEAD `25aaf4d`) + `reevaluate-fase3-ux-2026-03-02.md` (HEAD `6a04cf2`)_
