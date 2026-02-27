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
});
