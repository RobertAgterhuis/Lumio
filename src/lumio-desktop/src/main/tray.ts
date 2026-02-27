import { Tray, Menu } from "electron";
import type { BrowserWindow } from "electron";
import * as path from "path";
import * as fs from "fs";

let tray: Tray | null = null;

/**
 * Returns the tray icon path for the current platform.
 *
 * - macOS: `build/tray-iconTemplate.png` (16×16 white PNG) if it exists.
 *   macOS treats any image whose filename contains "Template" as a template
 *   image, automatically inverting it for dark/light menu bars.
 *   Falls back to `build/icons/16.png` (teal) if the template file is absent.
 * - Windows/Linux: `build/icons/32.png` (teal, 32×32).
 */
function getTrayIconPath(): string {
  const buildDir = path.join(__dirname, "..", "..", "build");
  if (process.platform === "darwin") {
    const template = path.join(buildDir, "tray-iconTemplate.png");
    if (fs.existsSync(template)) return template;
    // Fallback: use the 16 px coloured icon
    return path.join(buildDir, "icons", "16.png");
  }
  return path.join(buildDir, "icons", "32.png");
}

/**
 * Build and set the tray context menu.
 * Called once on creation and whenever the menu state needs to be refreshed.
 */
function buildMenu(
  getWindow: () => BrowserWindow | null,
  triggerBackup: () => void,
  onQuit: () => void
): Electron.Menu {
  return Menu.buildFromTemplate([
    {
      label: "Lumio openen",
      click: () => {
        const win = getWindow();
        if (win) {
          if (win.isMinimized()) win.restore();
          win.show();
          win.focus();
        }
      },
    },
    { type: "separator" },
    { label: "Nu back-uppen", click: triggerBackup },
    { type: "separator" },
    { label: "Afsluiten", click: onQuit },
  ]);
}

/**
 * Create the system tray icon and its context menu.
 *
 * @param getWindow     Returns the current main BrowserWindow (or null).
 * @param triggerBackup Callback that runs a manual backup.
 * @param onQuit        Callback that performs a clean application quit.
 */
export function createTray(
  getWindow: () => BrowserWindow | null,
  triggerBackup: () => void,
  onQuit: () => void
): void {
  if (tray) return; // already created

  tray = new Tray(getTrayIconPath());
  tray.setToolTip("Lumio — Digitale Nalatenschap");
  tray.setContextMenu(buildMenu(getWindow, triggerBackup, onQuit));

  // Single-click on Windows and Linux brings the window to front.
  // On macOS a single-click opens the context menu (platform default).
  if (process.platform !== "darwin") {
    tray.on("click", () => {
      const win = getWindow();
      if (win) {
        if (win.isMinimized()) win.restore();
        win.show();
        win.focus();
      }
    });
  }

  // Double-click on Windows brings the window to front
  tray.on("double-click", () => {
    const win = getWindow();
    if (win) {
      if (win.isMinimized()) win.restore();
      win.show();
      win.focus();
    }
  });
}

/** Destroy the tray icon (called during app quit). */
export function destroyTray(): void {
  if (tray && !tray.isDestroyed()) {
    tray.destroy();
  }
  tray = null;
}
