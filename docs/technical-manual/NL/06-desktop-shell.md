# 6. Desktop Shell (Electron)

## 6.1 Overzicht

De Electron-shell (v35.2.1) fungeert als native wrapper die de .NET-backend als sidecar-process opstart en de frontend in een `BrowserWindow` toont. De architectuur volgt het **sidecar-patroon**: Electron beheert het levenscyclusbeheer, de backend verwerkt alle logica.

```
Electron main process
       │
       ├── sidecar.ts      → Start/stop .NET backend
       ├── window.ts       → BrowserWindow configuratie
       ├── paths.ts        → USB-portable padresolutie
       ├── autobackup.ts   → Automatische backup scheduler
       └── preload/index.ts → Context Bridge API
```

### Afhankelijkheden

| Package | Versie | Doel |
|---------|--------|------|
| `electron` | 35.2.1 | Desktop runtime (devDependency) |
| `electron-builder` | 26.0.12 | Packaging (devDependency) |
| `get-port` | 7.1.0 | Dynamische poort-selectie |
| `typescript` | 5.9.3 | TypeScript compiler |

## 6.2 Opstartsequentie

```
app.whenReady()
       │
       ▼
① Single-instance lock
   ├── Lock verkregen → Doorgaan
   └── Niet verkregen → app.quit()
       │
       ▼
② Dynamische poort vinden
   get-port({ port: [5123, 5124, 5125, 5126, 5127] })
   Fallback: 5123
       │
       ▼
③ IPC-handlers registreren
   registerAutoBackupHandlers()
       │
       ▼
④ .NET Backend starten
   startBackend(port)
   │  spawn(exePath, [], { env: { ASPNETCORE_URLS, LUMIO_DATA_DIR, LUMIO_FRONTEND_DIR } })
   │  wacht op GET /api/status → 200 (max 30s, poll elke 500ms)
   └── Timeout? → Error dialog → app.quit()
       │
       ▼
⑤ Auto-backup scheduler starten
   startAutoBackupScheduler()
       │
       ▼
⑥ BrowserWindow aanmaken
   createMainWindow()
   mainWindow.loadURL(`http://127.0.0.1:${port}`)
```

### Foutafhandeling bij opstarten

Bij een fout in stap ④ toont Electron een native foutdialoog:

```
┌─── Lumio — Fout bij opstarten ───┐
│                                   │
│ Lumio kon niet worden gestart.   │
│                                   │
│ {error details}                   │
│ Backend: {path to Lumio.Api.exe} │
│ Frontend: {path to out/}         │
└───────────────────────────────────┘
```

## 6.3 Sidecar (Backend Process Management)

### Backend starten

Het .NET-backend wordt als child process gestart met drie omgevingsvariabelen:

| Variabele | Waarde | Beschrijving |
|-----------|--------|-------------|
| `ASPNETCORE_URLS` | `http://127.0.0.1:{port}` | Luisteradres |
| `LUMIO_DATA_DIR` | `{appRoot}/data` | Data-directory |
| `LUMIO_FRONTEND_DIR` | `{appRoot}/frontend` | Frontend-bestanden |

```typescript
backendProcess = spawn(exePath, [], {
    env: { ...process.env, ASPNETCORE_URLS, LUMIO_DATA_DIR, LUMIO_FRONTEND_DIR },
    stdio: ["ignore", "pipe", "pipe"],
    detached: false,
});
```

- **stdout/stderr** worden doorgesluisd naar de Electron console (`[backend]` / `[backend:err]` prefix)
- **detached: false** — backend stopt automatisch als Electron afsluit

### Health check

Na het starten pollt Electron de backend elke 500ms tot `/api/status` HTTP 200 retourneert, met een timeout van 30 seconden.

### Backend stoppen

Bij afsluiting wordt het backend-process gestopt:
- **Windows:** `taskkill /pid {pid} /f /t` (hele process tree)
- **macOS/Linux:** `SIGTERM`

## 6.4 Window-configuratie

### BrowserWindow

```typescript
mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: "Lumio — Digitale Nalatenschap",
    webPreferences: {
        preload: path.join(__dirname, "..", "preload", "index.js"),
        contextIsolation: true,    // Beveiligingsgrens
        sandbox: true,             // Sandboxed renderer
        nodeIntegration: false,    // Geen Node.js in renderer
        webSecurity: true,         // Same-origin policy
    },
});
```

### Beveiligingsmaatregelen

| Maatregel | Beschrijving |
|-----------|-------------|
| `contextIsolation: true` | Scheidt preload-script van renderer context |
| `sandbox: true` | Renderer draait in sandboxed mode |
| `nodeIntegration: false` | Geen directe Node.js-toegang vanuit frontend |
| Navigatie-restrictie | Alleen URLs naar `http://127.0.0.1:{port}` toegestaan |
| Popup-blokkering | `setWindowOpenHandler(() => { action: "deny" })` |

### Single-instance lock

```typescript
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) { app.quit(); }

app.on("second-instance", () => {
  // Focus bestaand venster
  if (win.isMinimized()) win.restore();
  win.focus();
});
```

Voorkomt dat meerdere Lumio-instanties tegelijkertijd draaien (wat conflicten met de backend-poort zou veroorzaken).

## 6.5 Padresolutie (USB-portabiliteit)

### Principe

Alle paden zijn relatief ten opzichte van de applicatieroot. Er worden geen absolute paden of OS-specifieke locaties (AppData, etc.) gebruikt.

### Padberekening

```
Gepackaged:
  app.getAppPath() = <appRoot>/resources/app.asar
  getAppRoot()     = <appRoot>  (2 niveaus omhoog)

Ontwikkeling:
  __dirname        = lumio-desktop/dist/main
  getAppRoot()     = projectroot  (4 niveaus omhoog)
```

### Padtabel

| Functie | Gepackaged | Ontwikkeling |
|---------|-----------|-------------|
| `getAppRoot()` | `<appRoot>/` | `d:\repositories\Lumio\` |
| `getBackendPath()` | `<appRoot>/backend/Lumio.Api.exe` | `src/Lumio.Api/bin/Debug/net10.0/Lumio.Api.exe` |
| `getFrontendPath()` | `<appRoot>/frontend/` | `src/lumio-web/out/` |
| `getDataDir()` | `<appRoot>/data/` | `data/` |

### USB-structuur

```
USB-stick/
├── Lumio.exe                    ← Electron executable
├── resources/
│   └── app.asar                 ← Electron app code
├── backend/
│   ├── Lumio.Api.exe            ← .NET self-contained
│   └── ...                      ← .NET runtime bestanden
├── frontend/
│   ├── index.html               ← Next.js export
│   └── ...
└── data/
    ├── profiles.json            ← Profielmanifest
    ├── {id}.db                  ← Versleutelde databases
    ├── {id}.salt                ← Veldversleuteling salts
    └── auto-backup.json         ← Backup configuratie
```

## 6.6 Preload Script (Context Bridge)

Het preload-script biedt een veilige API aan de renderer via `contextBridge`:

```typescript
contextBridge.exposeInMainWorld("lumio", {
    platform: process.platform,
    isElectron: true,
    selectDirectory: () => ipcRenderer.invoke("select-directory"),
    getAutoBackupConfig: () => ipcRenderer.invoke("get-auto-backup-config"),
    setAutoBackupConfig: (config) => ipcRenderer.invoke("set-auto-backup-config", config),
    triggerAutoBackup: () => ipcRenderer.invoke("trigger-auto-backup"),
});
```

### Beschikbare API's

| Methode | Retourtype | Beschrijving |
|---------|-----------|-------------|
| `window.lumio.platform` | `string` | OS platform ("win32", "darwin", "linux") |
| `window.lumio.isElectron` | `boolean` | Altijd `true` in Electron |
| `window.lumio.selectDirectory()` | `Promise<string\|null>` | Native directory picker dialog |
| `window.lumio.getAutoBackupConfig()` | `Promise<Config\|null>` | Huidige backup-configuratie |
| `window.lumio.setAutoBackupConfig(config)` | `Promise<void>` | Backup-configuratie opslaan |
| `window.lumio.triggerAutoBackup()` | `Promise<Result>` | Handmatig backup uitvoeren |

## 6.7 Automatische Backup

### Configuratie

Opgeslagen in `data/auto-backup.json`:

```json
{
  "pad": "D:\\Backups\\Lumio",
  "frequentie": "dagelijks"
}
```

| Frequentie | Interval |
|------------|----------|
| `dagelijks` | 24 uur |
| `wekelijks` | 7 dagen |
| `maandelijks` | 30 dagen |

### Werking

1. Bij opstarten wordt de scheduler gestart op basis van de `auto-backup.json` configuratie
2. De scheduler draait een `setInterval` met het ingestelde interval
3. Bij elke tick wordt `GET /api/backup` aangeroepen (de backend moet ontgrendeld zijn)
4. Het ZIP-bestand wordt opgeslagen in de geconfigureerde directory
5. Bestandsnaam uit de `Content-Disposition` header of fallback `lumio-backup-{datum}.zip`

### IPC-handlers

| Channel | Beschrijving |
|---------|-------------|
| `select-directory` | Opent native directory picker via `dialog.showOpenDialog` |
| `get-auto-backup-config` | Leest `auto-backup.json` |
| `set-auto-backup-config` | Schrijft `auto-backup.json`, herstart scheduler |
| `trigger-auto-backup` | Voert direct een backup uit |

## 6.8 Afsluitsequentie

```
Venster gesloten / app.quit()
       │
       ▼
① stopAutoBackupScheduler()
   clearInterval(backupTimer)
       │
       ▼
② stopBackend()
   ├── Windows: taskkill /pid {pid} /f /t
   └── Unix: SIGTERM
       │
       ▼
③ app.quit()
```

De `before-quit` en `window-all-closed` events zorgen beide voor cleanup, zodat de backend altijd netjes wordt afgesloten.

## 6.9 TypeScript-configuratie

```jsonc
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",      // Electron vereist CommonJS
    "strict": true,
    "esModuleInterop": true,   // Voor ESM-modules (get-port)
    "outDir": "dist",
    "rootDir": "src"
  }
}
```

**Let op:** `get-port` is een ESM-only package. Dit wordt opgelost via `dynamic import()` in combinatie met `esModuleInterop`.
