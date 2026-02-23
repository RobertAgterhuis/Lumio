# 4 — Security

## Design Principles

1. **Local-only** — No cloud, no network traffic, no telemetry
2. **Encryption-at-rest** — Full database encryption with SQLCipher (AES-256)
3. **Per-field encryption** — Sensitive fields (passwords) additionally encrypted with AES-256-GCM
4. **Password never on disk** — In-memory only, never logged
5. **Emergency access** — Shamir's Secret Sharing for heirs

## Database Encryption (SQLCipher)

Each profile database is fully encrypted:

| Parameter | Value |
|-----------|-------|
| Algorithm | AES-256 |
| Implementation | SQLCipher via `Microsoft.Data.Sqlite` |
| Key | User password (via `PRAGMA key`) |
| Key change | Via `PRAGMA rekey` |

The database **cannot** be opened without the correct password — not even with direct file access.

## Field Encryption (AES-256-GCM)

Sensitive fields (such as stored passwords in the password vault) are additionally encrypted on top of the database encryption:

| Parameter | Value |
|-----------|-------|
| Algorithm | AES-256-GCM |
| Nonce | 12 bytes (random) |
| Auth tag | 16 bytes |
| Key derivation | PBKDF2 (100,000 iterations, SHA-256) |
| Salt | 32 bytes (random per field) |

**Storage format:** `base64(salt + nonce + ciphertext + tag)`

## Authentication Flow

```
1. Select profile (api/auth/selecteer-profiel)
   └── Loads profile metadata, database remains locked

2. Unlock (api/auth/ontgrendel)
   ├── Password goes to MasterPasswordService (in-memory)
   ├── SQLCipher opens database with PRAGMA key
   └── All API endpoints become available

3. Lock (api/auth/vergrendel)
   ├── MasterPasswordService clears password from memory
   ├── Database connection is closed
   └── DatabaseUnlockMiddleware blocks requests (423)
```

### First-time Setup

```
api/auth/setup
├── Receive: password + profile name
├── Create new profile in profiles.json
├── Create encrypted database
├── Run EF Core migrations
└── Database is immediately unlocked
```

## Shamir's Secret Sharing

For emergency access by heirs after passing.

### How It Works

1. Owner generates emergency codes via `api/shamir/genereer`
2. The database password is split into `n` shares (one per heir)
3. A threshold value `k` determines how many shares are needed for reconstruction
4. Each share is individually given to an heir

### Reconstruction

```
api/shamir/reconstrueer-en-ontgrendel
├── Receive: k or more shares
├── Reconstruct original password
├── Unlock database
└── Enable read-only (heir) mode
```

### Heir Mode

After unlocking via Shamir shares, the application enters **read-only mode**:
- All data is readable
- No modifications possible
- Settlement checklist available
- Export functionality available

## Session Management

| Mechanism | Implementation |
|-----------|----------------|
| Idle timeout | Frontend `useIdleTimer` hook |
| Warning | `SessionTimeoutWarning` component (60s countdown) |
| Auto-lock | After timeout → `api/auth/vergrendel` |
| Destructive actions | `ConfirmDestructiveAction` component (confirmation dialog) |

## Security Components (Frontend)

| Component | Purpose |
|-----------|---------|
| `ConfirmDestructiveAction` | Confirmation dialog for irreversible actions |
| `SecureValueReveal` | Show/hide sensitive values (passwords) |
| `ReadOnlyModeWrapper` | Hides/disables mutation UI in heir mode |
| `SecurityStatusIndicator` | Visual status (secure/warning/critical/unknown) |
| `SessionTimeoutWarning` | Countdown dialog on inactivity |
| `ActivityLogItem` | Display of audit log entries |

## Audit Log

All significant actions are logged in `AuditLogEntry`:

- Unlock/lock
- Create/modify/delete data
- Export actions
- Password changes
- Shamir operations

The audit log is read-only — entries are never deleted or modified.

## Backup & Restore

| Endpoint | Action |
|----------|--------|
| `GET api/backup` | Download complete encrypted database as file |
| `POST api/backup/restore` | Restore database from backup file |

Electron supports automatic backups at a configurable interval.
