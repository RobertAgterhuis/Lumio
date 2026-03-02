import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("lumio", {
  platform: process.platform,
  isElectron: true,
  getLocale: (): Promise<string> => ipcRenderer.invoke("get-locale"),
  setLocale: (locale: string): Promise<void> => ipcRenderer.invoke("set-locale", locale),
  selectDirectory: (): Promise<string | null> =>
    ipcRenderer.invoke("select-directory"),
  getAutoBackupConfig: (): Promise<{ pad: string; frequentie: string } | null> =>
    ipcRenderer.invoke("get-auto-backup-config"),
  setAutoBackupConfig: (
    config: { pad: string; frequentie: string } | null
  ): Promise<{ success: boolean; error?: string }> =>
    ipcRenderer.invoke("set-auto-backup-config", config),
  triggerAutoBackup: (): Promise<{ success: boolean; error?: string }> =>
    ipcRenderer.invoke("trigger-auto-backup"),
  /**
   * Safely open an external URL in the default browser.
   * Only HTTPS URLs are allowed for security.
   */
  openExternalUrl: (url: string): Promise<{ success: boolean; error?: string }> =>
    ipcRenderer.invoke("open-external-url", url),
  /**
   * Subscribe to OS dark/light mode changes.
   * The callback is invoked with `isDark: boolean` every time the OS theme changes.
   * Register once in a top-level client component and clean up on unmount if needed.
   */
  onThemeChange: (callback: (isDark: boolean) => void): void => {
    ipcRenderer.on("native-theme-changed", (_event, isDark: boolean) =>
      callback(isDark)
    );
  },
  /** Returns whether the OS is currently in dark mode (one-shot, async). */
  getInitialThemeIsDark: (): Promise<boolean> =>
    ipcRenderer.invoke("get-initial-theme"),
  /**
   * Update the native OS window title (visible in ALT+TAB / CMD+TAB).
   * No-op when called outside the Electron shell.
   */
  setWindowTitle: (title: string): void =>
    ipcRenderer.send("set-window-title", title),
  /** Returns the Electron app version string (e.g. "1.0.0"). */
  getAppVersion: (): Promise<string> =>
    ipcRenderer.invoke("get-app-version"),
  /**
   * SP-12-002: Session timeout.
   * Registers a callback that fires when the inactivity timeout expires and the
   * main process requests the app to lock. The renderer should call the lock API.
   */
  onSessionLock: (callback: () => void): void => {
    ipcRenderer.on("session-lock", () => callback());
  },
  /** Returns the current session timeout in minutes (default 15, range 5-60). */
  getSessionTimeoutMinutes: (): Promise<number> =>
    ipcRenderer.invoke("get-session-timeout-minutes"),
  /** Sets the session timeout in minutes. Clamped to [5, 60]. */
  setSessionTimeoutMinutes: (minutes: number): Promise<void> =>
    ipcRenderer.invoke("set-session-timeout-minutes", minutes),
});

/**
 * Expose whitelabel metadata to the renderer world so the web app can read
 * company branding details if needed (e.g. for aria-labels or page titles).
 * Returns null values when no whitelabel config is deployed.
 */
contextBridge.exposeInMainWorld("__whitelabel__", {
  companyName: ipcRenderer.sendSync("whitelabel:get-name")    as string | null,
  message:     ipcRenderer.sendSync("whitelabel:get-message") as string | null,
  hasLogo:     (ipcRenderer.sendSync("whitelabel:get-logo")   !== null),
});

// ── WL-3: Logo & message overlay (runs in the isolated preload world) ─────────
// Inline (not a separate require) so sandbox mode works with a single file.
// Installs a MutationObserver + navigation hooks that keep the company logo
// and dashboard message bar alive through SPA navigation.

/* eslint-disable */
/// <reference lib="dom" />

((): void => {
  interface LogoData {
    dataUrl: string;
    height: number;
    opacity: number;
  }

  const logo    = ipcRenderer.sendSync("whitelabel:get-logo")    as LogoData | null;
  const message = ipcRenderer.sendSync("whitelabel:get-message") as string   | null;
  const company = ipcRenderer.sendSync("whitelabel:get-name")    as string   | null;

  console.log("[wl-overlay] IPC data received:", { hasLogo: !!logo, hasMessage: !!message, company });

  if (!logo && !message) return;

  const Z                  = 9998;
  const LOGO_BOTTOM_WITH_MSG = 44;
  const LOGO_BOTTOM_NO_MSG   = 16;
  const MSG_BAR_HEIGHT       = 36;
  const LOGO_ID = "__wl_logo__";
  const MSG_ID  = "__wl_msg__";

  function isDashboardRoute(): boolean {
    const p = window.location.pathname;
    return p === "/" || p.startsWith("/dashboard");
  }

  function injectLogo(): void {
    if (!logo) return;
    if (document.getElementById(LOGO_ID)) return;
    const bottomPx = message ? LOGO_BOTTOM_WITH_MSG : LOGO_BOTTOM_NO_MSG;
    const wrapper  = document.createElement("div");
    wrapper.id = LOGO_ID;
    Object.assign(wrapper.style, {
      position: "fixed", bottom: `${bottomPx}px`, left: "50%",
      transform: "translateX(-50%)", pointerEvents: "none",
      zIndex: String(Z), lineHeight: "0",
    });
    const img = document.createElement("img");
    img.src = logo.dataUrl;
    img.alt = company ?? "";
    Object.assign(img.style, {
      height: `${logo.height}px`, width: "auto", opacity: String(logo.opacity),
      display: "block", userSelect: "none",
    });
    img.onerror = (): void => { wrapper.style.display = "none"; };
    wrapper.appendChild(img);
    document.body.appendChild(wrapper);
  }

  function removeMessage(): void {
    document.getElementById(MSG_ID)?.remove();
  }

  function injectMessage(): void {
    if (!message) return;
    if (document.getElementById(MSG_ID)) return;
    if (!isDashboardRoute()) {
      console.log("[wl-overlay] injectMessage: not on dashboard, pathname:", window.location.pathname);
      return;
    }
    console.log("[wl-overlay] injecting message bar");
    const bar = document.createElement("div");
    bar.id = MSG_ID;
    Object.assign(bar.style, {
      position: "fixed", bottom: "0", left: "0", right: "0",
      height: `${MSG_BAR_HEIGHT}px`, display: "flex",
      alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,0.04)", borderTop: "1px solid rgba(0,0,0,0.06)",
      fontSize: "12px", color: "rgba(0,0,0,0.45)", pointerEvents: "none",
      zIndex: String(Z), fontFamily: "inherit", whiteSpace: "nowrap",
      overflow: "hidden", textOverflow: "ellipsis", padding: "0 16px",
      boxSizing: "border-box", letterSpacing: "0.01em",
    });
    bar.textContent = message;
    document.body.appendChild(bar);
  }

  function syncOverlays(): void {
    injectLogo();
    if (isDashboardRoute()) { injectMessage(); } else { removeMessage(); }
  }

  function onNavigated(): void {
    console.log("[wl-overlay] navigation detected, pathname:", window.location.pathname);
    window.setTimeout(syncOverlays, 80);
  }

  function createBodyObserver(): MutationObserver {
    const observer = new MutationObserver(() => {
      const logoMissing = logo    && !document.getElementById(LOGO_ID);
      const msgMissing  = message && !document.getElementById(MSG_ID) && isDashboardRoute();
      if (logoMissing || msgMissing) { syncOverlays(); }
    });
    observer.observe(document.body, { childList: true });
    return observer;
  }

  function init(): void {
    console.log("[wl-overlay] init() called, pathname:", window.location.pathname);
    syncOverlays();
    createBodyObserver();

    const origPush    = history.pushState.bind(history);
    const origReplace = history.replaceState.bind(history);
    history.pushState    = (data: any, unused: string, url?: string | URL | null): void => { origPush(data, unused, url);    onNavigated(); };
    history.replaceState = (data: any, unused: string, url?: string | URL | null): void => { origReplace(data, unused, url); onNavigated(); };
    window.addEventListener("popstate", onNavigated);

    const nav = (window as any).navigation;
    if (nav) { nav.addEventListener("navigatesuccess", onNavigated); }
    console.log("[wl-overlay] navigation hooks installed, nav API available:", !!nav);
  }

  if (document.body) { init(); }
  else { window.addEventListener("DOMContentLoaded", init, { once: true }); }
})();
/* eslint-enable */
