import { app, dialog } from "electron";
import { startBackend, stopBackend } from "./sidecar";
import { createMainWindow } from "./window";
import { getBackendPath, getFrontendPath } from "./paths";
import { registerAutoBackupHandlers, startAutoBackupScheduler, stopAutoBackupScheduler } from "./autobackup";

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
      "Lumio — Fout bij opstarten",
      `Lumio kon niet worden gestart.\n\n${err}\n\nBackend: ${getBackendPath()}\nFrontend: ${getFrontendPath()}`
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
