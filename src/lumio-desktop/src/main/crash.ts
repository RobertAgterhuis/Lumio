/**
 * DO-2-003 — Electron crash/uncaughtException handler.
 *
 * Captures `uncaughtException` and `unhandledRejection` in the main process,
 * writes a timestamped crash log to `data/logs/` so bugs in the packaged app
 * can be diagnosed without a debugger attached.
 *
 * Must be imported (side-effect only) before `app.whenReady()`.
 */

import * as fs from "fs";
import * as path from "path";
import { app } from "electron";

// ─────────────────────────────────────────────────────────────────────────────
// Log path — resolved identically to getDataDir() in paths.ts but without
// importing paths.ts so this module truly has zero dependencies and can be
// required before anything else.
// ─────────────────────────────────────────────────────────────────────────────

function getLogsDir(): string {
  let appRoot: string;
  if (app.isPackaged) {
    // packaged: <root>/resources/app.asar → go up two levels to distribution root
    appRoot = path.resolve(app.getAppPath(), "..", "..");
  } else {
    // development: __dirname = dist/main, go up four levels to repo root
    appRoot = path.resolve(__dirname, "..", "..", "..", "..");
  }
  return path.join(appRoot, "data", "logs");
}

function writeCrashLog(label: string, error: unknown): void {
  try {
    const logsDir = getLogsDir();
    fs.mkdirSync(logsDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const logFile = path.join(logsDir, `crash-${timestamp}.log`);

    const header = [
      `=== LUMIO CRASH LOG ===`,
      `type:      ${label}`,
      `timestamp: ${new Date().toISOString()}`,
      `version:   ${app.getVersion()}`,
      `platform:  ${process.platform} ${process.arch}`,
      `packaged:  ${app.isPackaged}`,
      ``,
    ].join("\n");

    const body =
      error instanceof Error
        ? `${error.name}: ${error.message}\n\nStack:\n${error.stack ?? "(no stack)"}`
        : `Non-Error value thrown:\n${JSON.stringify(error, null, 2)}`;

    fs.writeFileSync(logFile, header + body + "\n", "utf-8");
    console.error(`[lumio/crash] ${label} — crash log written to: ${logFile}`);
  } catch (writeErr) {
    // Last-resort: at least surface to stderr
    console.error(`[lumio/crash] Failed to write crash log:`, writeErr);
    console.error(`[lumio/crash] Original error:`, error);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Register handlers
// ─────────────────────────────────────────────────────────────────────────────

process.on("uncaughtException", (error: Error) => {
  writeCrashLog("uncaughtException", error);
  // Allow Electron's default handler to run so the app quits cleanly
  // (re-throw would trigger the listener again; instead let it propagate)
});

process.on("unhandledRejection", (reason: unknown) => {
  writeCrashLog("unhandledRejection", reason);
  // unhandledRejection does not crash the process by default in Electron —
  // we log it but do not force-quit so the user can continue using the app.
});
