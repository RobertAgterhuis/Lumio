/**
 * Minimal IPC bridge for the splash screen window.
 *
 * Exposes two actions the splash HTML buttons can call:
 *   - retryStart: relaunch the app (restarts the entire process)
 *   - openLog:    open the Lumio data/logs folder in the OS file explorer
 *
 * Must be compiled to dist/preload/splash-preload.js (handled by tsconfig).
 */

import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("splashApi", {
  retryStart: () => ipcRenderer.send("splash-retry"),
  openLog:    () => ipcRenderer.send("splash-open-log"),
});
