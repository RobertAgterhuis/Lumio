import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("lumio", {
  platform: process.platform,
  isElectron: true,
  selectDirectory: (): Promise<string | null> =>
    ipcRenderer.invoke("select-directory"),
  getAutoBackupConfig: (): Promise<{ pad: string; frequentie: string } | null> =>
    ipcRenderer.invoke("get-auto-backup-config"),
  setAutoBackupConfig: (
    config: { pad: string; frequentie: string } | null
  ): Promise<void> => ipcRenderer.invoke("set-auto-backup-config", config),
  triggerAutoBackup: (): Promise<{ success: boolean; error?: string }> =>
    ipcRenderer.invoke("trigger-auto-backup"),
});
