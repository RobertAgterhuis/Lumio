import { ipcMain, dialog, BrowserWindow } from "electron";
import * as fs from "fs";
import * as path from "path";
import * as http from "http";
import { getDataDir } from "./paths";
import { getBackendPort } from "./sidecar";
import { t } from "./i18n";

interface AutoBackupConfig {
  pad: string;
  frequentie: string; // "dagelijks" | "wekelijks" | "maandelijks"
}

const CONFIG_FILENAME = "auto-backup.json";
let backupTimer: ReturnType<typeof setInterval> | null = null;

function getConfigPath(): string {
  return path.join(getDataDir(), CONFIG_FILENAME);
}

function loadConfig(): AutoBackupConfig | null {
  const configPath = getConfigPath();
  if (!fs.existsSync(configPath)) return null;
  try {
    const content = fs.readFileSync(configPath, "utf-8");
    return JSON.parse(content) as AutoBackupConfig;
  } catch {
    return null;
  }
}

function saveConfig(config: AutoBackupConfig | null): void {
  const configPath = getConfigPath();
  if (config === null) {
    if (fs.existsSync(configPath)) fs.unlinkSync(configPath);
    return;
  }
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");
}

/**
 * Download a backup ZIP from the backend API and save it to the configured directory.
 */
function performBackup(): Promise<{ success: boolean; error?: string }> {
  const config = loadConfig();
  if (!config) return Promise.resolve({ success: false, error: t("noAutoBackupConfigured") });

  if (!fs.existsSync(config.pad)) {
    return Promise.resolve({ success: false, error: t("backupDirNotFound", { path: config.pad }) });
  }

  return new Promise((resolve) => {
    const port = getBackendPort();
    const req = http.get(`http://127.0.0.1:${port}/api/backup`, (res) => {
      if (res.statusCode !== 200) {
        res.resume();
        resolve({ success: false, error: t("backupApiError", { status: String(res.statusCode) }) });
        return;
      }

      // Extract filename from content-disposition header
      const contentDisposition = res.headers["content-disposition"] || "";
      const filenameMatch = contentDisposition.match(/filename=(.+)/);
      const filename = filenameMatch
        ? filenameMatch[1].replace(/"/g, "")
        : `lumio-backup-${new Date().toISOString().slice(0, 10)}.zip`;

      const destPath = path.join(config.pad, filename);
      const fileStream = fs.createWriteStream(destPath);

      res.pipe(fileStream);
      fileStream.on("finish", () => {
        fileStream.close();
        console.log(`[auto-backup] Backup saved to ${destPath}`);
        resolve({ success: true });
      });
      fileStream.on("error", (err) => {
        resolve({ success: false, error: err.message });
      });
    });

    req.on("error", (err) => {
      resolve({ success: false, error: err.message });
    });
    req.setTimeout(30_000, () => {
      req.destroy();
      resolve({ success: false, error: t("backupTimeout") });
    });
  });
}

function getIntervalMs(frequentie: string): number {
  switch (frequentie) {
    case "dagelijks":
      return 24 * 60 * 60 * 1000;
    case "wekelijks":
      return 7 * 24 * 60 * 60 * 1000;
    case "maandelijks":
      return 30 * 24 * 60 * 60 * 1000;
    default:
      return 24 * 60 * 60 * 1000;
  }
}

/**
 * Start or restart the auto-backup scheduler based on current config.
 */
export function startAutoBackupScheduler(): void {
  if (backupTimer) {
    clearInterval(backupTimer);
    backupTimer = null;
  }

  const config = loadConfig();
  if (!config) return;

  const intervalMs = getIntervalMs(config.frequentie);
  console.log(`[auto-backup] Scheduler started: every ${config.frequentie} to ${config.pad}`);

  backupTimer = setInterval(async () => {
    console.log("[auto-backup] Running scheduled backup...");
    const result = await performBackup();
    if (!result.success) {
      console.error(`[auto-backup] Failed: ${result.error}`);
    }
  }, intervalMs);
}

export function stopAutoBackupScheduler(): void {
  if (backupTimer) {
    clearInterval(backupTimer);
    backupTimer = null;
  }
}

/**
 * Register all auto-backup IPC handlers.
 */
export function registerAutoBackupHandlers(): void {
  ipcMain.handle("select-directory", async () => {
    const win = BrowserWindow.getFocusedWindow();
    if (!win) return null;

    const result = await dialog.showOpenDialog(win, {
      properties: ["openDirectory"],
      title: t("selectBackupLocation"),
    });

    if (result.canceled || result.filePaths.length === 0) return null;
    return result.filePaths[0];
  });

  ipcMain.handle("get-auto-backup-config", () => {
    return loadConfig();
  });

  ipcMain.handle("set-auto-backup-config", (_event, config: AutoBackupConfig | null) => {
    saveConfig(config);
    startAutoBackupScheduler();
  });

  ipcMain.handle("trigger-auto-backup", async () => {
    return performBackup();
  });
}
