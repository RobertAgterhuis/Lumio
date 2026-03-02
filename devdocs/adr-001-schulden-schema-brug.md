# ADR-001: EnsureSchuldKolommenAsync — tijdelijke DDL-brug voor pre-migratie databases

**Status:** ACCEPTED  
**Datum:** 2026-03-02  
**Auteur:** SP-9 / DATA-003 (REEVALUATE FASE-2)  
**Eigenaar:** Software Architect

---

## Context

Bij de introductie van de `SchuldBezitLink`-relatie (migratie `20260224151055_AddSchuldBezitLink`) werden twee
kolommen aan de `Schulden`-tabel toegevoegd: `BezitId` (TEXT NULL) en `LeaseMaatschappij` (TEXT NULL), plus
een index `IX_Schulden_BezitId`.

Bestaande databases die waren aangemaakt via `EnsureCreated` (dus zonder EF-migratiebeheer) misten de
`__EFMigrationsHistory`-tabel. Voor die databases kan `MigrateAsync()` de ontbrekende kolommen wel baselinen,
maar in SQLite-omgevingen kan een FK-constraint-probleem er voor zorgen dat de `ALTER TABLE` stil mislukt terwijl
de migratie wél als "applied" wordt gemarkeerd.

## Besluit

De methode `EnsureSchuldKolommenAsync` in `src/Lumio.Api/Data/MigratieDbHelper.cs` voert een belt-and-suspenders
check uit: zij probeert een `SELECT "BezitId" FROM "Schulden" LIMIT 0` en past — indien die query faalt — de
drie DDL-statements direct toe via `ExecuteSqlRawAsync`.

Dit is **intentioneel** en **tijdelijk**:

- Intentioneel omdat SQLite `ALTER TABLE … ADD COLUMN` idempotent is en geen dataverlies kan veroorzaken.
- Tijdelijk omdat de methode overbodig wordt zodra alle actieve deployments de officiële EF-migratie hebben
  doorlopen (te verifiëren via `__EFMigrationsHistory`).

## Gevolgen

| Aspect | Impact |
|--------|--------|
| EF Migration puriteit | Laag risico — de DDL-brug interfereert niet met toekomstige migraties; EF ziet de kolommen als reeds aanwezig. |
| Schema drift | Niet van toepassing — de brug repliceert exact de inhoud van migratie `20260224151055_AddSchuldBezitLink`. |
| Testbaarheid | `EnsureSchuldKolommenAsync` is afzonderlijk testbaar (zie `AuthController`-integratietests). |
| Verwijdering | Verwijder `EnsureSchuldKolommenAsync` en de aanroep in `EnsureMigratedAsync` zodra is bevestigd dat geen enkele productie-database meer de `EnsureCreated`-bootstrap gebruikt. Registreer als SP-{toekomstig}-R cleanup item. |

## Alternatieven overwogen

| Alternatief | Reden afgewezen |
|-------------|----------------|
| Pure EF `MigrateAsync()` zonder brug | Stuit op SQLite FK-edge-case voor legacy databases; risico op stille mislukking. |
| Aparte one-time migration script | Vergroot operationele overhead voor self-hosted installaties die de app zelf als migratietool gebruiken. |
| `EnsureCreated` volledig verbieden | Bestaande productie-databases zijn reeds aangemaakt met `EnsureCreated`; migratie kan niet met terugwerkende kracht worden afgedwongen. |

## Verwijzingen

- `src/Lumio.Api/Data/MigratieDbHelper.cs` — `EnsureSchuldKolommenAsync` (regels 59–69)
- `src/Lumio.Api/Migrations/20260224151055_AddSchuldBezitLink.cs` — de officiële migratie
- REEVALUATE FASE-2 bevinding DATA-003
