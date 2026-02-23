# 4. Beveiliging

## 4.1 Overzicht beveiligingslagen

Lumio implementeert **defense in depth** met vier complementaire beveiligingslagen:

```
┌──────────────────────────────────────────────────┐
│  Laag 1: Database-versleuteling (SQLCipher)      │
│  → Hele database versleuteld met AES-256-CBC     │
├──────────────────────────────────────────────────┤
│  Laag 2: Veldversleuteling (AES-256-GCM)         │
│  → Extra-gevoelige velden apart versleuteld      │
├──────────────────────────────────────────────────┤
│  Laag 3: Toegangscontrole (Middleware)            │
│  → Route-gebaseerd slot met read-only modus      │
├──────────────────────────────────────────────────┤
│  Laag 4: Erfgenaam-toegang (Shamir's Secret)      │
│  → Sleuteldeling voor postmortale toegang        │
└──────────────────────────────────────────────────┘
```

## 4.2 Laag 1: Database-versleuteling (SQLCipher)

### Principe

Elke profieldatabase is een SQLCipher-versleutelde SQLite database. Het hele bestand is versleuteld met het masterwachtwoord van de gebruiker. Zonder wachtwoord is de database onleesbaar.

### Implementatie

**Service:** `MasterPasswordService` (singleton)

| Eigenschap | Type | Beschrijving |
|-----------|------|-------------|
| `IsUnlocked` | `bool` | Of de database ontgrendeld is |
| `IsFirstRun` | `bool` | Of dit een nieuw profiel is (nog geen DB) |
| `IsReadOnly` | `bool` | Of de sessie in alleen-lezen modus is |
| `CurrentPassword` | `string?` | Het ontgrendelde wachtwoord (alleen in geheugen) |
| `ActiveDbPath` | `string?` | Pad naar de actieve database |

### Ontgrendeling

```csharp
// MasterPasswordService.UnlockAsync()
var connStr = new SqliteConnectionStringBuilder
{
    DataSource = dbPath,
    Mode = SqliteOpenMode.ReadWrite,
    Password = password         // ← SQLCipher PRAGMA key
}.ToString();

using var conn = new SqliteConnection(connStr);
await conn.OpenAsync();
// Valideer door te querien — fout = verkeerd wachtwoord
cmd.CommandText = "SELECT count(*) FROM sqlite_master;";
await cmd.ExecuteScalarAsync();
```

### Wachtwoord wijzigen

Bij wachtwoordwijziging wordt het SQLCipher `PRAGMA rekey` commando gebruikt om de database te herversleutelen:

```csharp
// Veilig escapen via parameterized quote()
quoteCmd.CommandText = "SELECT quote($pw)";
quoteCmd.Parameters.AddWithValue("$pw", newPassword);
var quoted = await quoteCmd.ExecuteScalarAsync();

rekeyCmd.CommandText = $"PRAGMA rekey = {quoted}";
await rekeyCmd.ExecuteNonQueryAsync();
```

### Levenscyclus

```
App start → Geen wachtwoord → Database vergrendeld
                                    │
                              ┌─────▼─────┐
                              │ /api/auth/ │ (altijd toegankelijk)
                              │ ontgrendel │
                              └─────┬──────┘
                                    │ wachtwoord correct
                                    ▼
                          Database ontgrendeld
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
              Handmatig       Idle timeout      Wachtwoord
              vergrendelen    (5 min default)   wijzigen
                    │               │               │
                    ▼               ▼               │
              DB vergrendeld  DB vergrendeld    PRAGMA rekey
                                                    │
                                                    ▼
                                              Shamir-shares
                                              ongeldig geworden
```

## 4.3 Laag 2: Veldversleuteling (AES-256-GCM)

### Principe

Extra-gevoelige gegevens worden bovenop de databaseversleuteling ook op veldniveau versleuteld. Dit beschermt tegen scenario's waar de database onversleuteld in geheugen staat.

### Versleutelde velden

| Entiteit | Veld | Inhoud |
|----------|------|--------|
| `WachtwoordEntry` | `EncryptedWachtwoord` | Wachtwoorden |
| `CryptoWallet` | `EncryptedSeedPhrase` | Crypto seed phrases |

### Sleutelafleiding

```
MasterWachtwoord
       │
       ▼
  PBKDF2 (SHA-256, 100.000 iteraties)
       │            │
       │      Per-DB salt
       │     (32 random bytes)
       │     opgeslagen in .salt bestand
       ▼
  AES-256 sleutel (32 bytes)
```

### Salt-beheer

Per profieldatabase wordt een apart `.salt`-bestand aangemaakt:

```
data/
├── {profiel-id}.db     ← SQLCipher database
└── {profiel-id}.salt   ← 32-byte random salt voor veldversleuteling
```

**Backwards-compatibiliteit:** Bestaande databases zonder `.salt`-bestand gebruiken automatisch de legacy-salt `"Lumio.FieldEncryption.v1"` (UTF-8 bytes). Nieuwe databases krijgen altijd een cryptografisch random salt.

### Versleutelingsformaat

```
Base64 encoded:
┌──────────┬──────────┬─────────────┐
│ Nonce    │ Auth Tag │ Ciphertext  │
│ 12 bytes │ 16 bytes │ N bytes     │
└──────────┴──────────┴─────────────┘
```

- **Nonce:** 12 bytes, cryptografisch random per versleuteling (`RandomNumberGenerator.Fill`)
- **Authentication Tag:** 16 bytes, garandeert integriteit (GCM authenticated encryption)
- **Ciphertext:** Gelijk aan plaintext-lengte

### Service-registratie

`EncryptionService` is geregistreerd als **scoped** — een nieuwe instantie per request. Bij instantiatie:
1. Haalt het wachtwoord op uit `MasterPasswordService`
2. Leest de salt uit het `.salt`-bestand
3. Leidt de AES-sleutel af via PBKDF2
4. Sleutel bestaat alleen in geheugen gedurende het request

## 4.4 Laag 3: Toegangscontrole (DatabaseUnlockMiddleware)

### Principe

Middleware die alle API-verzoeken filtert op basis van de vergrendelingsstatus. Niet-geauthentiseerde verzoeken krijgen HTTP 423 (Locked) terug.

### Route-filtering

**Altijd toegankelijk** (ongeacht vergrendeling):

| Route-prefix | Doel |
|-------------|------|
| `/api/auth/` | Authenticatie-acties |
| `/api/profielen` | Profielbeheer |
| `/api/status` | Systeemstatus |
| `/api/backup/restore` | Backup herstellen |
| `/swagger` | API-documentatie |

**Alleen-lezen modus** — aanvullend toegankelijk voor erfgenamen:

| Route-prefix | Doel |
|-------------|------|
| `/api/export/` | Exportacties |
| `/api/afhandeling` | Afhandelingstracker |

### Beslissingsboom

```
Inkomend request
       │
       ├── Begint NIET met /api/ → Doorlaten (statische bestanden)
       │
       ├── Staat in AllowedPrefixes → Doorlaten
       │
       ├── Geen profiel geselecteerd → 423 Locked
       │         "Geen profiel geselecteerd"
       │
       ├── Niet ontgrendeld → 423 Locked
       │         "Database is vergrendeld"
       │
       ├── ReadOnly + schrijfactie (POST/PUT/PATCH/DELETE)
       │   + NIET in ReadOnlyAllowedPrefixes → 403 Forbidden
       │         "Database is geopend in alleen-lezen modus"
       │
       └── Doorlaten naar controller
```

### Frontend-afhandeling

De API-client detecteert HTTP 423 en gooit een `"LOCKED"` error:

```typescript
if (res.status === 423) {
    throw new Error("LOCKED");
}
```

De authenticated layout controleert de sessiestatus bij page refresh en redirected naar de loginpagina indien niet ontgrendeld.

## 4.5 Laag 4: Erfgenaam-toegang (Shamir's Secret Sharing)

### Principe

Shamir's Secret Sharing splitst het masterwachtwoord in N delen, waarvan K delen nodig zijn om het wachtwoord te reconstrueren (drempel-schema). Erfgenamen ontvangen elk een deel en kunnen samen — na overlijden — de database openen in alleen-lezen modus.

### Configuratie

| Parameter | Uitleg |
|-----------|--------|
| `totalShares` (N) | Totaal aantal sleuteldelen |
| `threshold` (K) | Minimaal aantal delen voor reconstructie |

Voorwaarden:
- Drempel (K) ≥ 2
- Totaal (N) ≥ K

### Genereerproces

```
1. Gebruiker kiest K (drempel) en N (totaal)
2. POST /api/shamir/genereer { wachtwoord, aantalDelen, drempel }
3. ShamirService.GenerateShares() → N wiskundige sleuteldelen
4. Bestaande share-toewijzingen worden gereset
5. Delen worden toegewezen aan erfgenamen (op volgorde van ID)
   → ShareIndex, HeeftShareOntvangen, ShareUitgegevenOp
6. Sleuteldelen worden eenmalig getoond voor uitgifte
```

### Share-toewijzing aan erfgenamen

```csharp
// Erfgenamen worden op stabiele ID-volgorde genomen
var erfgenamen = alleErfgenamen.OrderBy(e => e.Id).Take(result.Shares.Count).ToList();
for (int i = 0; i < erfgenamen.Count; i++)
{
    erfgenamen[i].ShareIndex = result.Shares[i].Index;
    erfgenamen[i].HeeftShareOntvangen = true;
    erfgenamen[i].ShareUitgegevenOp = DateTime.UtcNow;
}
```

### Reconstructie en ontgrendeling

Er zijn twee ontgrendelingsroutes voor erfgenamen:

**Route 1: Via AuthController** (`POST /api/auth/ontgrendel-erfgenaam`)
```
Erfgenamen voeren K shares in
       │
       ▼
ShamirService.ReconstructSecret(shares)
       │
       ▼
MasterPasswordService.UnlockAsync(reconstructed password)
       │
       ▼
MasterPasswordService.SetReadOnly(true)    ← Alleen-lezen!
       │
       ▼
Database ontgrendeld in read-only modus
```

**Route 2: Via ShamirController** (`POST /api/shamir/reconstrueer-en-ontgrendel`)
```
Identiek pad, maar via apart endpoint
```

### Alleen-lezen beperkingen

Na erfgenaam-ontgrendeling:
- **Lezen:** Alle gegevens zijn zichtbaar
- **Schrijven:** Geblokkeerd door middleware (HTTP 403)
- **Toegestaan:** Export, afhandeling, auth-acties
- **UI-indicatie:** Banner "U heeft alleen-lezen toegang"

## 4.6 Idle-timeout & automatisch vergrendelen

### Frontend-implementatie

De `useIdleTimer` hook bewaakt gebruikersactiviteit:

| Parameter | Waarde | Beschrijving |
|-----------|--------|-------------|
| Standaard timeout | 5 minuten | Configureerbaar via localStorage |
| Waarschuwingstijd | 30 seconden | Countdown voor auto-lock |
| Gedetecteerde activiteit | mousemove, keydown, mousedown, touchstart, scroll | Reset timer |
| Opslag | `lumio-idle-timeout` | localStorage key |

### Timeout-flow

```
Gebruikersactiviteit gedetecteerd
       │
       ▼
  Timer reset naar T minuten
       │
       │ geen activiteit gedurende (T - 30s)
       ▼
  Waarschuwingsdialoog verschijnt
  "Sessie verloopt over 30 seconden"
       │
  ┌────┼────┐
  │         │
  Dismiss   30s verlopen
  (klik)    (geen actie)
  │         │
  ▼         ▼
  Timer     POST /api/auth/vergrendel
  herstart  Zustand lock()
            Redirect naar loginpagina
```

### Configuratie

Timeout is instelbaar op de instellingenpagina. Waarde `0` schakelt de timer uit.

## 4.7 Audit Trail

### Automatische logging (DbContext)

Elke `SaveChanges()` creëert automatisch audit-entries voor alle aangemaakt, gewijzigde en verwijderde `BaseEntity`-objecten:

| Kolom | Inhoud |
|-------|--------|
| `Actie` | "Aangemaakt", "Gewijzigd", "Verwijderd" |
| `EntityType` | Klasse-naam (bijv. "Erfgenaam") |
| `EntityId` | GUID van de entiteit |
| `Details` | "{EntityType} {actie}" |
| `Tijdstip` | UTC timestamp |

### Handmatige logging (AuditService)

Voor niet-entity gebeurtenissen wordt `AuditService.LogAsync()` gebruikt:

| Actie | Wanneer |
|-------|---------|
| `"Ontgrendeld"` | Succesvolle database-ontgrendeling |
| `"Vergrendeld"` | Handmatige of automatische vergrendeling |
| `"Wachtwoord gewijzigd"` | Na wachtwoordwijziging |
| `"Export"` | Bij PDF/backup export |

De AuditService is fout-tolerant: als de database niet beschikbaar is (vergrendeld), wordt de log silently genegeerd.

## 4.8 Beveiligingsoverzicht per gegevenstype

| Gegevens | SQLCipher (L1) | AES-GCM (L2) | Middleware (L3) |
|----------|:--------------:|:-------------:|:---------------:|
| Persoonsgegevens (naam, adres) | ✓ | — | ✓ |
| BSN | ✓ | — | ✓ |
| Wachtwoorden (WachtwoordEntry) | ✓ | ✓ | ✓ |
| Seed phrases (CryptoWallet) | ✓ | ✓ | ✓ |
| Testamentgegevens | ✓ | — | ✓ |
| Uitvaartwensen | ✓ | — | ✓ |
| Documenten (binair) | ✓ | — | ✓ |
| Audit-log | ✓ | — | ✓ |
| Profielen (profiles.json) | — | — | — |

### Opmerking over BSN

Het BSN wordt momenteel niet veldversleuteld maar uitsluitend beschermd door SQLCipher-databaseversleuteling. De architectuur maakt het mogelijk om in de toekomst BSN-velden toe te voegen aan de veldversleuteling.

## 4.9 Wachtwoordbeleid

| Regel | Waarde |
|-------|--------|
| Minimale lengte | 8 tekens |
| Complexiteitseisen | Geen (gebruikerstoegang) |
| Wachtwoordhint | Geen |
| Brute-force bescherming | SQLCipher PBKDF2 (vanuit database-engine) |
| Verificatie bij gevoelige acties | Wachtwoord wijzigen, account verwijderen |

## 4.10 Dreigingsmodel

| Dreiging | Mitigatie |
|----------|----------|
| USB-stick gestolen | Database onleesbaar zonder wachtwoord (SQLCipher) |
| Geheugen-dump tijdens gebruik | Veldversleuteling beschermt wachtwoorden/seeds aanvullend |
| Onbevoegde API-toegang | Middleware blokkeert alle verzoeken zonder unlock |
| Eigenaar overlijdt | Shamir-shares bij erfgenamen, K-van-N reconstructie |
| Wachtwoord vergeten | Shamir-reconstructie of backup importeren |
| Man-in-the-middle | Niet van toepassing: lokale communicatie (127.0.0.1) |
| Database-tampering | AES-GCM authenticatie-tag detecteert wijzigingen |
| Idle sessie | Automatisch vergrendelen na configureerbare timeout |
