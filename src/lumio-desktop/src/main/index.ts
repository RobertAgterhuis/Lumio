import { app, globalShortcut, ipcMain, Menu, nativeTheme, session, shell } from "electron";
import * as path from "path";
import { startBackend, stopBackend } from "./sidecar";
import { createMainWindow, getMainWindow, applyTitleBarOverlay } from "./window";
import { getBackendPath, getFrontendPath, getDataDir } from "./paths";
import { registerAutoBackupHandlers, startAutoBackupScheduler, stopAutoBackupScheduler, performBackupForTray } from "./autobackup";
import { loadLocale, t, getLocale, setLocale, persistLocale } from "./i18n";
import { buildApplicationMenu } from "./menu";
import { showSplash, closeSplash, showSplashError } from "./splash";
import { createTray, destroyTray } from "./tray";
import { setupThemeSync } from "./theme";
import {
  loadWhitelabelConfig,
  applyWhitelabelCSS,
  applyWhitelabelTitleBar,
  registerWhitelabelIpcHandlers,
} from "./whitelabel";

// Set to true before calling app.quit() so the close-to-tray handler lets
// windows actually close during the quit sequence.
let isAppQuitting = false;

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
  const win = getMainWindow();
  if (win) {
    if (win.isMinimized()) win.restore();
    win.show();
    win.focus();
  }
});

app.whenReady().then(async () => {
  // Show the branded splash screen immediately — before anything else.
  // This ensures the user never sees a blank window while the backend starts.
  showSplash();

  try {
    // === WHITELABEL: load optional company branding config =================
    // Must be the very first action so every subsequent step can use the config.
    // Returns null when no config file exists (standard Lumio build).
    const whitelabelConfig = loadWhitelabelConfig();
    // Register IPC handlers so the preload overlay can retrieve logo/message
    // data synchronously via sendSync before any page JS runs.
    registerWhitelabelIpcHandlers();
    // =========================================================================

    // === IDENTITY: correct app name on all platforms ===
    app.setName("Lumio");
    // Windows: ensures correct taskbar grouping and notification icon
    if (process.platform === "win32") {
      app.setAppUserModelId("nl.lumio.desktop");
    }

    // === MENU: replace default Electron menu with brand-aware menu ===
    buildApplicationMenu();

    // === PLATFORM BRANDING (EL-5) ============================================

    // macOS: branded About panel (⌘+I / Lumio > About Lumio)
    if (process.platform === "darwin") {
      app.setAboutPanelOptions({
        applicationName: "Lumio",
        applicationVersion: app.getVersion(),
        copyright: `© ${new Date().getFullYear()} Lumio`,
        iconPath: path.join(__dirname, "..", "..", "build", "icon.icns"),
        website: "https://lumio.nl",
      });

      // macOS dock right-click menu
      app.dock?.setMenu(
        Menu.buildFromTemplate([
          {
            label: "Nu back-uppen",
            click: () => { void performBackupForTray(); },
          },
        ])
      );
    }

    // Windows: pinned Jump List task
    if (process.platform === "win32") {
      app.setUserTasks([
        {
          program: process.execPath,
          arguments: "--backup-now",
          iconPath: path.join(__dirname, "..", "..", "build", "icon.ico"),
          iconIndex: 0,
          title: "Nu back-uppen",
          description: "Maak direct een back-up van uw gegevens",
        },
      ]);
    }

    // =========================================================================

    const port = await findPort();
    console.log(`[lumio] Starting with backend port ${port}`);

    // === SECURITY: Enforce Content Security Policy via webRequest ===
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      const backendOrigin = `http://127.0.0.1:${port}`;
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          // Strict CSP: only allow resources from the backend origin
          // No unsafe-eval, no unsafe-inline (except for Next.js inline styles which use nonces)
          "Content-Security-Policy": [
            `default-src 'self' ${backendOrigin};`,
            `script-src 'self' ${backendOrigin} 'unsafe-inline';`, // Next.js needs inline scripts
            `style-src 'self' ${backendOrigin} 'unsafe-inline';`, // Tailwind/CSS-in-JS
            `img-src 'self' ${backendOrigin} data: blob:;`,
            `font-src 'self' ${backendOrigin};`,
            `connect-src 'self' ${backendOrigin};`,
            `frame-ancestors 'none';`,
            `form-action 'self' ${backendOrigin};`,
            `base-uri 'self';`,
          ].join(" "),
        },
      });
    });
    console.log("[lumio] CSP enforcement enabled via webRequest");

    // === SECURITY: Safe external URL handler (https only) ===
    ipcMain.handle("open-external-url", async (_event: unknown, url: string) => {
      // Validate URL is a string
      if (typeof url !== "string") {
        console.warn("[lumio] open-external-url: Invalid URL type");
        return { success: false, error: "Invalid URL" };
      }

      // Only allow https:// URLs
      if (!url.startsWith("https://")) {
        console.warn(`[lumio] open-external-url: Blocked non-https URL: ${url}`);
        return { success: false, error: "Only HTTPS URLs are allowed" };
      }

      // Block suspicious URLs
      const blockedPatterns = [
        /javascript:/i,
        /data:/i,
        /file:/i,
        /vbscript:/i,
      ];
      if (blockedPatterns.some((pattern) => pattern.test(url))) {
        console.warn(`[lumio] open-external-url: Blocked suspicious URL: ${url}`);
        return { success: false, error: "URL pattern not allowed" };
      }

      try {
        await shell.openExternal(url);
        return { success: true };
      } catch (err) {
        console.error(`[lumio] open-external-url: Failed to open: ${err}`);
        return { success: false, error: String(err) };
      }
    });
    console.log("[lumio] Safe external URL handler registered");

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

    // === THEME: respond to one-shot "what is the current theme?" queries ===
    ipcMain.handle("get-initial-theme", () => nativeTheme.shouldUseDarkColors);

    // === EL-6: Window title & app version ====================================
    // ipcMain.on (fire-and-forget) because the renderer does not need a reply.
    ipcMain.on("set-window-title", (_event, title: unknown) => {
      if (typeof title !== "string" || title.trim() === "") return;
      const win = getMainWindow();
      win?.setTitle(title);
      // accessibleTitle improves screen-reader announcements on Windows
      if (win) win.accessibleTitle = title;
    });
    ipcMain.handle("get-app-version", () => app.getVersion());
    // =========================================================================

    // Register IPC handlers before creating window
    registerAutoBackupHandlers();

    // Start the .NET sidecar
    await startBackend(port);

    // Start auto-backup scheduler
    startAutoBackupScheduler();

    // Create the main window and show it after the first paint,
    // closing the splash just before the main window appears.
    const mainWin = createMainWindow();

    // Register F12 and Ctrl+Shift+I to open DevTools for diagnostics.
    // globalShortcut is the only way to intercept these keys in a packaged app
    // where the default Chromium accelerators are stripped.
    const openDevTools = () => {
      const win = getMainWindow();
      if (!win) return;
      if (win.webContents.isDevToolsOpened()) {
        win.webContents.closeDevTools();
      } else {
        win.webContents.openDevTools({ mode: "detach" });
      }
    };
    globalShortcut.register("F12", openDevTools);
    globalShortcut.register("CommandOrControl+Shift+I", openDevTools);

    // === WHITELABEL CSS: inject brand-color overrides on every page load ===
    applyWhitelabelCSS(mainWin, whitelabelConfig);
    // =========================================================================

    // === THEME: forward OS theme-change events into the renderer ===
    // Also updates the Windows title-bar overlay colours on theme changes.
    // After the teal default is applied, re-apply the whitelabel brand color
    // so OS theme changes never revert the title bar to Lumio teal.
    setupThemeSync(getMainWindow, (isDark) => {
      applyTitleBarOverlay(getMainWindow(), isDark);
      applyWhitelabelTitleBar(getMainWindow(), whitelabelConfig);
    });

    // Windows: apply themed title-bar overlay immediately after window creation.
    // (setupThemeSync only fires on future OS theme changes, not on first load.)
    applyTitleBarOverlay(mainWin);
    // Override with whitelabel brand color if configured (must be after above).
    applyWhitelabelTitleBar(mainWin, whitelabelConfig);

    // Hide to tray when the user clicks the window's close (X) button.
    // The window is only truly destroyed during a real app quit (isAppQuitting).
    mainWin.on("close", (event) => {
      if (!isAppQuitting) {
        event.preventDefault();
        mainWin.hide();
      }
    });

    mainWin.once("ready-to-show", () => {
      closeSplash();
      mainWin.show();

      // Create the tray icon now that the main window is visible
      createTray(
        getMainWindow,
        () => { void performBackupForTray(); },
        () => { isAppQuitting = true; app.quit(); }
      );
    });
  } catch (err) {
    console.error("[lumio] Failed to start:", err);
    // Show error inside the splash screen instead of a generic dialog.
    // The user can click “Opnieuw proberen” (relaunch) or “Logboek openen”.
    showSplashError(
      t("errorStartBody", { error: String(err), backend: getBackendPath(), frontend: getFrontendPath() })
    );
    // Do NOT call app.quit() here — keep the splash open so the user can act.
  }
});

app.on("window-all-closed", () => {
  // This event only fires when windows are actually destroyed (not hidden).
  // With close-to-tray, this means a real quit is in progress.
  stopAutoBackupScheduler();
  stopBackend();
  destroyTray();
  app.quit();
});

app.on("before-quit", () => {
  // Allow the close event to proceed without preventDefault during quit
  isAppQuitting = true;
  globalShortcut.unregisterAll();
  stopAutoBackupScheduler();
  stopBackend();
  destroyTray();
});

// macOS: re-create window when dock icon is clicked and no window is visible
app.on("activate", () => {
  const win = getMainWindow();
  if (!win) {
    createMainWindow();
  } else {
    // Window exists but is hidden (close-to-tray) — just show it
    win.show();
    win.focus();
  }
});
