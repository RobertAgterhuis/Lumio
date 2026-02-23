import { app, dialog, ipcMain } from "electron";
import { startBackend, stopBackend } from "./sidecar";
import { createMainWindow } from "./window";
import { getBackendPath, getFrontendPath, getDataDir } from "./paths";
import { registerAutoBackupHandlers, startAutoBackupScheduler, stopAutoBackupScheduler } from "./autobackup";
import { loadLocale, t, getLocale, setLocale, persistLocale } from "./i18n";

// Single instance lock — prevent multiple Lumio instances
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
}

// Find an available port for the backend
async function findPort(): Promise<number> {
  try {
    // get-port is ESM-only, use dynamic import
    const { default: getPort } = await import("get-port");
    return await getPort({ port: [5123, 5124, 5125, 5126, 5127] });
  } catch {
    // Fallback to default port
    return 5123;
  }
}

app.on("second-instance", () => {
  const { getMainWindow } = require("./window");
  const win = getMainWindow();
  if (win) {
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

app.whenReady().then(async () => {
  try {
    const port = await findPort();
    console.log(`[lumio] Starting with backend port ${port}`);

    // Load locale preference
    const dataDir = getDataDir();
    loadLocale(dataDir);

    // Register locale IPC handlers
    ipcMain.handle("get-locale", () => getLocale());
    ipcMain.handle("set-locale", (_event: unknown, locale: string) => {
      if (locale === "nl" || locale === "en") {
        setLocale(locale);
        persistLocale(dataDir, locale);
      }
    });

    // Register IPC handlers before creating window
    registerAutoBackupHandlers();

    // Start the .NET sidecar
    await startBackend(port);

    // Start auto-backup scheduler
    startAutoBackupScheduler();

    // Create the main window
    createMainWindow();
  } catch (err) {
    console.error("[lumio] Failed to start:", err);
    dialog.showErrorBox(
      t("errorStartTitle"),
      t("errorStartBody", { error: String(err), backend: getBackendPath(), frontend: getFrontendPath() })
    );
    app.quit();
  }
});

app.on("window-all-closed", () => {
  stopAutoBackupScheduler();
  stopBackend();
  app.quit();
});

app.on("before-quit", () => {
  stopAutoBackupScheduler();
  stopBackend();
});

// macOS: re-create window when dock icon is clicked
app.on("activate", () => {
  const { getMainWindow } = require("./window");
  if (!getMainWindow()) {
    createMainWindow();
  }
});
