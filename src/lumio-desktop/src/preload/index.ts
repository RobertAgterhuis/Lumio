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
});
