import { BrowserWindow, nativeImage, nativeTheme } from "electron";
import * as fs from "fs";
import * as path from "path";
import { getBackendPort, getBackendUrl } from "./sidecar";
import { t } from "./i18n";

let mainWindow: BrowserWindow | null = null;

/** Platform-correct path to the compiled app icon inside the build folder. */
function getIconPath(): string {
  const buildDir = path.join(__dirname, "..", "..", "build");
  if (process.platform === "win32") return path.join(buildDir, "icon.ico");
  if (process.platform === "darwin") return path.join(buildDir, "icon.icns");
  return path.join(buildDir, "icons", "256.png");
}

export function createMainWindow(): BrowserWindow {
  const port = getBackendPort();

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: t("windowTitle"),
    icon: getIconPath(),
    // Hide until first paint to prevent a white/blank flash
    show: false,
    // Match OS theme so the background colour is never jarring before the web-app loads
    backgroundColor: nativeTheme.shouldUseDarkColors ? "#0F1A1D" : "#F3F7F8",
    // ── Platform-specific titlebar (EL-5) ────────────────────────────────────
    // macOS: hide the title text but keep native traffic-light buttons inset
    // inside the window frame so the custom web-app header fills the space.
    // Windows: hide the system titlebar — a custom overlay is applied below.
    // Other: default native titlebar.
    titleBarStyle: process.platform === "darwin"
      ? "hiddenInset"
      : process.platform === "win32"
        ? "hidden"
        : "default",
    // macOS: position traffic lights so they sit 14px from top-left
    trafficLightPosition: process.platform === "darwin" ? { x: 14, y: 14 } : undefined,
    // Windows: enable the title-bar overlay so setTitleBarOverlay() works at runtime.
    // Must be declared in the constructor — cannot be enabled after window creation.
    ...(process.platform === "win32" ? {
      titleBarOverlay: {
        color: nativeTheme.shouldUseDarkColors ? "#0D2129" : "#2C4A52",
        symbolColor: "#E6EFF1",
        height: 36,
      },
    } : {}),
    webPreferences: {
      preload: path.join(__dirname, "..", "preload", "index.js"),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      webSecurity: true,
      devTools: true,
    },
  });

  // NOTE: show: false — the window is revealed by index.ts inside the
  // ready-to-show handler, after the splash screen has been closed.

  // Load frontend via HTTP — served by the .NET backend
  // This ensures Next.js routing, assets, and API calls all work (same origin)
  mainWindow.loadURL(getBackendUrl());

  // Push the current OS theme into the renderer as soon as the DOM is ready.
  // This handles the case where the inline script in layout.tsx ran before
  // Electron's nativeTheme was fully resolved (rare but possible on slow hardware).
  mainWindow.webContents.on("dom-ready", () => {
    mainWindow?.webContents.send(
      "native-theme-changed",
      nativeTheme.shouldUseDarkColors
    );
  });

  // Prevent navigation to external URLs
  const backendOrigin = `http://127.0.0.1:${port}`;
  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (!url.startsWith(backendOrigin)) {
      event.preventDefault();
    }
  });

  // Prevent new window creation
  mainWindow.webContents.setWindowOpenHandler(() => {
    return { action: "deny" };
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  return mainWindow;
}

export function getMainWindow(): BrowserWindow | null {
  return mainWindow;
}

/**
 * Apply the brand-teal Windows title-bar overlay that replaces the hidden
 * system title bar introduced in EL-5-03.
 *
 * No-op on macOS and Linux.  Safe to call before the window is shown.
 */
export function applyTitleBarOverlay(
  win: BrowserWindow | null = mainWindow,
  isDark = nativeTheme.shouldUseDarkColors
): void {
  if (process.platform !== "win32" || !win) return;
  win.setTitleBarOverlay({
    color: isDark ? "#0D2129" : "#2C4A52",
    symbolColor: "#E6EFF1",
    height: 36,
  });
}

/**
 * Show a small status overlay on the Windows taskbar button after a backup.
 *
 * - Success → green check overlay, cleared automatically after 3 s.
 * - Failure → amber warning overlay, persists until next successful backup.
 *
 * No-op on macOS and Linux, or when the overlay PNG files have not been
 * generated yet (`npm run build:icons`).
 */
export function setTaskbarOverlayIcon(success: boolean): void {
  if (process.platform !== "win32" || !mainWindow) return;
  const buildDir = path.join(__dirname, "..", "..", "build");
  const overlayPath = path.join(
    buildDir,
    success ? "overlay-ok.png" : "overlay-warn.png"
  );
  if (!fs.existsSync(overlayPath)) return; // icons not yet generated — skip silently
  const img = nativeImage.createFromPath(overlayPath);
  mainWindow.setOverlayIcon(img, success ? "Back-up voltooid" : "Back-up mislukt");
  if (success) {
    // Clear the tick after 3 s so the taskbar button returns to normal
    const win = mainWindow;
    setTimeout(() => { win.setOverlayIcon(null, ""); }, 3000);
  }
}
