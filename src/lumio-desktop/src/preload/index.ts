import { contextBridge } from "electron";

contextBridge.exposeInMainWorld("lumio", {
  platform: process.platform,
  isElectron: true,
});
