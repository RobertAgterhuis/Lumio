# 4 — Beveiliging

## Ontwerpprincipes

1. **Lokaal-only** — Geen cloud, geen netwerkverkeer, geen telemetrie
2. **Encryptie-at-rest** — Volledige database-encryptie met SQLCipher (AES-256)
3. **Encryptie-per-veld** — Gevoelige velden (wachtwoorden) extra versleuteld met AES-256-GCM
4. **Wachtwoord nooit op schijf** — Alleen in-memory, nooit gelogd
5. **Noodtoegang** — Shamir's Secret Sharing voor erfgenamen

## Database-encryptie (SQLCipher)

Elke profieldatabase is volledig versleuteld:

| Parameter | Waarde |
|-----------|--------|
| Algoritme | AES-256 |
| Implementatie | SQLCipher via `Microsoft.Data.Sqlite` |
| Sleutel | Gebruikerswachtwoord (via `PRAGMA key`) |
| Sleutelwijziging | Via `PRAGMA rekey` |

De database kan **niet** geopend worden zonder het juiste wachtwoord — zelfs niet met directe bestandstoegang.

## Veldencryptie (AES-256-GCM)

Gevoelige velden (zoals opgeslagen wachtwoorden in de wachtwoordkluis) worden extra versleuteld bovenop de database-encryptie:

| Parameter | Waarde |
|-----------|--------|
| Algoritme | AES-256-GCM |
| Nonce | 12 bytes (willekeurig) |
| Auth tag | 16 bytes |
| Sleutelafleiding | PBKDF2 (100.000 iteraties, SHA-256) |
| Salt | 32 bytes (willekeurig per veld) |

**Opslag formaat:** `base64(salt + nonce + ciphertext + tag)`

## Authenticatiestroom

```
1. Profiel selecteren (api/auth/selecteer-profiel)
   └── Laadt profielmetadata, database blijft vergrendeld

2. Ontgrendelen (api/auth/ontgrendel)
   ├── Wachtwoord gaat naar MasterPasswordService (in-memory)
   ├── SQLCipher opent database met PRAGMA key
   └── Alle API-endpoints worden beschikbaar

3. Vergrendelen (api/auth/vergrendel)
   ├── MasterPasswordService wist wachtwoord uit geheugen
   ├── Database-connectie wordt gesloten
   └── DatabaseUnlockMiddleware blokkeert requests (423)
```

### Eerste keer instellen

```
api/auth/setup
├── Ontvang: wachtwoord + profielnaam
├── Maak nieuw profiel aan in profiles.json
├── Maak versleutelde database aan
├── Voer EF Core migraties uit
└── Database is direct ontgrendeld
```

## Shamir's Secret Sharing

Voor noodtoegang door erfgenamen na overlijden.

### Hoe het werkt

1. Eigenaar genereert noodcodes via `api/shamir/genereer`
2. Het database-wachtwoord wordt opgesplitst in `n` delen (één per erfgenaam)
3. Een drempelwaarde `k` bepaalt hoeveel delen nodig zijn om te reconstrueren
4. Elk deel wordt individueel aan een erfgenaam gegeven

### Reconstructie

```
api/shamir/reconstrueer-en-ontgrendel
├── Ontvang: k of meer delen
├── Reconstrueer originele wachtwoord
├── Ontgrendel database
└── Schakel read-only (nabestaanden) modus in
```

### Nabestaandenmodus

Na ontgrendeling via Shamir delen wordt de applicatie in **read-only modus** gezet:
- Alle gegevens zijn leesbaar
- Geen wijzigingen mogelijk
- Afhandelingschecklist beschikbaar
- Export functionaliteit beschikbaar

## Sessiebeheer

| Mechanisme | Implementatie |
|------------|---------------|
| Idle timeout | Frontend `useIdleTimer` hook |
| Waarschuwing | `SessionTimeoutWarning` component (60s countdown) |
| Auto-lock | Na timeout → `api/auth/vergrendel` |
| Destructieve acties | `ConfirmDestructiveAction` component (bevestigingsdialoog) |

## Beveiligingscomponenten (Frontend)

| Component | Doel |
|-----------|------|
| `ConfirmDestructiveAction` | Bekrachtigingsdialoog voor onherstelbare acties |
| `SecureValueReveal` | Toon/verberg gevoelige waarden (wachtwoorden) |
| `ReadOnlyModeWrapper` | Verbergt/deactiveert mutatie-UI in nabestaandenmodus |
| `SecurityStatusIndicator` | Visuele status (secure/warning/critical/unknown) |
| `SessionTimeoutWarning` | Countdown-dialoog bij inactiviteit |
| `ActivityLogItem` | Weergave van audit-logregels |

## Audit Log

Alle significante acties worden gelogd in `AuditLogEntry`:

- Ontgrendelen/vergrendelen
- Aanmaken/wijzigen/verwijderen van gegevens
- Export-acties
- Wachtwoordwijzigingen
- Shamir-operaties

De audit log is alleen-lezen — entries worden nooit verwijderd of gewijzigd.

## Backup & Herstel

| Endpoint | Actie |
|----------|-------|
| `GET api/backup` | Download volledige versleutelde database als bestand |
| `POST api/backup/restore` | Herstel database vanuit backup-bestand |

Electron ondersteunt automatische backups op een configureerbaar interval.
