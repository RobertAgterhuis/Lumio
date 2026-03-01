/**
 * Global type declaration for the Electron context bridge API.
 *
 * Exposed by `src/lumio-desktop/src/preload/index.ts` via
 * `contextBridge.exposeInMainWorld("lumio", {...})`.
 *
 * `window.lumio` is `undefined` when running in a normal browser.
 * Always guard usage with `if (window.lumio)` or optional chaining.
 */

interface LumioElectronAPI {
  /** Node.js `process.platform` from the Electron main process. */
  readonly platform: NodeJS.Platform;
  /** Always `true` when running inside Electron. */
  readonly isElectron: true;

  // ── Locale ──────────────────────────────────────────────────────────────
  getLocale(): Promise<string>;
  setLocale(locale: string): Promise<void>;

  // ── File system ─────────────────────────────────────────────────────────
  selectDirectory(): Promise<string | null>;

  // ── Auto-backup ─────────────────────────────────────────────────────────
  getAutoBackupConfig(): Promise<{ pad: string; frequentie: string } | null>;
  setAutoBackupConfig(
    config: { pad: string; frequentie: string } | null
  ): Promise<{ success: boolean; error?: string }>;
  triggerAutoBackup(): Promise<{ success: boolean; error?: string }>;

  // ── External URLs ────────────────────────────────────────────────────────
  openExternalUrl(url: string): Promise<{ success: boolean; error?: string }>;

  // ── OS theme sync (EL-4) ─────────────────────────────────────────────────
  /**
   * Subscribe to OS dark/light mode changes.
   * The callback fires every time the OS theme is toggled.
   * Note: this adds a listener; register only once per component lifecycle.
   */
  onThemeChange(callback: (isDark: boolean) => void): void;
  /** Returns whether the OS is currently in dark mode. */
  getInitialThemeIsDark(): Promise<boolean>;

  // ── Window chrome (EL-6) ─────────────────────────────────────────────────
  /**
   * Set the native OS window title (shown in ALT+TAB, CMD+TAB, taskbar).
   * Call on every route change: `setWindowTitle("Dashboard — Lumio")`.
   * Guard: no-op when `window.lumio` is undefined (browser mode).
   */
  setWindowTitle(title: string): void;
  /** Returns the Electron app version string from package.json (e.g. `"1.0.0"`). */
  getAppVersion(): Promise<string>;
}

declare global {
  interface Window {
    /** Present only when running inside the Lumio Electron shell. */
    lumio?: LumioElectronAPI;
  }
}

export {};
