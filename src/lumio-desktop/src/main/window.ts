import { BrowserWindow } from "electron";
import * as path from "path";
import { getBackendPort, getBackendUrl } from "./sidecar";
import { t } from "./i18n";

let mainWindow: BrowserWindow | null = null;

export function createMainWindow(): BrowserWindow {
  const port = getBackendPort();

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: t("windowTitle"),
    icon: undefined, // TODO: add icon
    webPreferences: {
      preload: path.join(__dirname, "..", "preload", "index.js"),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      webSecurity: true,
    },
  });

  // Load frontend via HTTP — served by the .NET backend
  // This ensures Next.js routing, assets, and API calls all work (same origin)
  mainWindow.loadURL(getBackendUrl());

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
