import { app, dialog, ipcMain, session, shell } from "electron";
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
