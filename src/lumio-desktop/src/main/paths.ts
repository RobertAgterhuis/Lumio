import * as path from "path";
import { app } from "electron";

/**
 * USB-portable path resolution.
 * When packaged, resources are relative to the app directory.
 * In development, they're relative to the project root.
 */

const isPackaged = app.isPackaged;

/** Root of the Lumio distribution (the folder containing Lumio.exe) */
export function getAppRoot(): string {
  if (isPackaged) {
    // In packaged app: app.getAppPath() = <appRoot>/resources/app.asar
    // Go up 2 levels to reach the folder containing Lumio.exe
    return path.resolve(app.getAppPath(), "..", "..");
  }
  // In development: lumio-desktop/dist/main → go up to WietLogboek root
  return path.resolve(__dirname, "..", "..", "..", "..");
}

/** Path to the .NET backend executable */
export function getBackendPath(): string {
  if (isPackaged) {
    const root = getAppRoot();
    const exe = process.platform === "win32" ? "Lumio.Api.exe" : "Lumio.Api";
    return path.join(root, "backend", exe);
  }
  // Development: use the dotnet run output
  const root = getAppRoot();
  const exe = process.platform === "win32" ? "Lumio.Api.exe" : "Lumio.Api";
  return path.join(
    root,
    "src",
    "Lumio.Api",
    "bin",
    "Debug",
    "net10.0",
    exe
  );
}

/** Path to the Next.js static export */
export function getFrontendPath(): string {
  if (isPackaged) {
    return path.join(getAppRoot(), "frontend");
  }
  // Development: use the next build output
  return path.join(getAppRoot(), "src", "lumio-web", "out");
}

/** Path to the data directory (always next to the app root for USB portability) */
export function getDataDir(): string {
  return path.join(getAppRoot(), "data");
}
