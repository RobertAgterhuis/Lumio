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

## Electron Security

The desktop shell implements multiple security hardening measures.

### Content Security Policy (CSP)

CSP is enforced via Electron's `webRequest` API:

```typescript
session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
  callback({
    responseHeaders: {
      ...details.responseHeaders,
      "Content-Security-Policy": [
        "default-src 'self';",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval';",
        "style-src 'self' 'unsafe-inline';",
        "img-src 'self' data: blob:;",
        "font-src 'self' data:;",
        "connect-src 'self' http://127.0.0.1:* ws://127.0.0.1:*;",
      ].join(" "),
    },
  });
});
```

### External URL Handling

External URLs opened via the renderer are validated:

```typescript
// ✅ Only https:// URLs are allowed
ipcMain.handle("open-external-url", async (_, url: string) => {
  if (typeof url !== "string" || !url.startsWith("https://")) {
    return false;
  }
  await shell.openExternal(url);
  return true;
});
```

**Security benefits:**
- Prevents arbitrary protocol handlers (`file://`, `javascript:`)
- Prevents navigation to local files
- All external navigation is explicit (not automatic link clicking)

### IPC Input Validation

All IPC handlers validate incoming data:

```typescript
// Example: auto-backup configuration
ipcMain.handle("set-auto-backup-config", async (_, config: unknown) => {
  // Validate config structure and types
  if (!config || typeof config !== "object") {
    throw new Error("Invalid config");
  }
  const { enabled, intervalMinutes, backupPath } = config as Record<string, unknown>;
  
  if (typeof enabled !== "boolean") throw new Error("Invalid enabled value");
  if (typeof intervalMinutes !== "number" || intervalMinutes < 0) {
    throw new Error("Invalid intervalMinutes");
  }
  if (typeof backupPath !== "string") throw new Error("Invalid backupPath");
  
  // ... proceed with validated data
});
```

### Security Configuration

| Setting | Value | Purpose |
|---------|-------|---------|
| `webSecurity` | `true` | Enable same-origin policy |
| `contextIsolation` | `true` | Isolate preload scripts from web content |
| `nodeIntegration` | `false` | Prevent renderer access to Node.js |
| `sandbox` | `true` | Enable Chromium sandbox |

### API Exposure via contextBridge

Only whitelisted APIs are exposed to the renderer:

```typescript
contextBridge.exposeInMainWorld("electronAPI", {
  // File operations
  openFileDialog: () => ipcRenderer.invoke("dialog:openFile"),
  saveFileDialog: (defaultPath: string) => 
    ipcRenderer.invoke("dialog:saveFile", defaultPath),
  
  // Backup
  getAutoBackupConfig: () => ipcRenderer.invoke("get-auto-backup-config"),
  setAutoBackupConfig: (config) => ipcRenderer.invoke("set-auto-backup-config", config),
  
  // External URL (https-only)
  openExternalUrl: (url: string) => ipcRenderer.invoke("open-external-url", url),
  
  // Application
  getAppVersion: () => ipcRenderer.invoke("get-app-version"),
});
```
