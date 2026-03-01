import { app, BrowserWindow, ipcMain, shell } from "electron";
import * as path from "path";
import * as fs from "fs";
import { getDataDir } from "./paths";

let splashWindow: BrowserWindow | null = null;

/**
 * Create and show the branded splash screen.
 * Call immediately on app.whenReady() — before the heavy sidecar startup.
 */
export function showSplash(): void {
  // ── Whitelabel: prefer a patched splash.html when the engine has built one ──
  const wlSplashPath  = path.join(__dirname, "..", "..", "build", "whitelabel", "splash.html");
  const wlConfigPath  = path.join(__dirname, "..", "..", "build", "whitelabel", "whitelabel.json");
  const useWlSplash   = fs.existsSync(wlSplashPath);
  let   splashBgColor = "#2C4A52"; // default Lumio teal

  if (useWlSplash && fs.existsSync(wlConfigPath)) {
    try {
      const wlCfg = JSON.parse(fs.readFileSync(wlConfigPath, "utf-8"));
      splashBgColor = wlCfg.splashColor ?? wlCfg.colors?.primaryDark ?? "#2C4A52";
    } catch {
      // ignore — fall back to the default Lumio color
    }
  }

  splashWindow = new BrowserWindow({
    width: 480,
    height: 300,
    frame: false,
    resizable: false,
    movable: true,
    alwaysOnTop: true,
    center: true,
    backgroundColor: splashBgColor,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      preload: path.join(__dirname, "..", "preload", "splash-preload.js"),
    },
  });

  splashWindow.loadFile(
    useWlSplash
      ? wlSplashPath
      : path.join(__dirname, "..", "..", "build", "splash.html")
  );

  // Inject version number once the page is ready
  splashWindow.webContents.once("did-finish-load", () => {
    const version = app.getVersion();
    splashWindow?.webContents.executeJavaScript(
      `document.getElementById('version').textContent = 'v${version}';`
    );
  });

  // IPC: "Opnieuw proberen" button → relaunch the app cleanly
  ipcMain.on("splash-retry", () => {
    app.relaunch();
    app.exit(0);
  });

  // IPC: "Logboek openen" button → open data/logs folder in file explorer
  ipcMain.on("splash-open-log", () => {
    const logsDir = path.join(getDataDir(), "logs");
    const target = fs.existsSync(logsDir) ? logsDir : getDataDir();
    shell.openPath(target);
  });

  splashWindow.once("closed", () => {
    splashWindow = null;
    // Clean up IPC handlers when splash is gone
    ipcMain.removeAllListeners("splash-retry");
    ipcMain.removeAllListeners("splash-open-log");
  });
}

/**
 * Close the splash screen.
 * Call just before showing the main window (inside the ready-to-show handler).
 */
export function closeSplash(): void {
  if (splashWindow && !splashWindow.isDestroyed()) {
    splashWindow.close();
  }
  splashWindow = null;
}

/**
 * Switch the splash to its error state.
 * The animated dots are hidden and the error zone with message + action buttons
 * is revealed. The user can then click "Opnieuw proberen" or "Logboek openen".
 *
 * @param message   Human-readable error text shown under the error title.
 */
export function showSplashError(message: string): void {
  if (!splashWindow || splashWindow.isDestroyed()) return;

  // Escape the message for safe JS string interpolation
  const safe = message
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "");

  splashWindow.webContents.executeJavaScript(
    `typeof showError === 'function' && showError('${safe}');`
  );
}
