import { ChildProcess, spawn } from "child_process";
import * as fs from "fs";
import * as http from "http";
import { getBackendPath, getDataDir, getFrontendPath } from "./paths";

let backendProcess: ChildProcess | null = null;
let backendPort: number = 5123;

export function getBackendPort(): number {
  return backendPort;
}

export function getBackendUrl(): string {
  return `http://127.0.0.1:${backendPort}`;
}

/**
 * Start the .NET backend sidecar process.
 * Returns once the health endpoint responds successfully.
 */
export async function startBackend(port: number): Promise<void> {
  backendPort = port;

  const exePath = getBackendPath();
  const dataDir = getDataDir();
  const frontendDir = getFrontendPath();

  // Ensure data directory exists
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  console.log(`[sidecar] Starting backend: ${exePath}`);
  console.log(`[sidecar] Data dir: ${dataDir}`);
  console.log(`[sidecar] Frontend dir: ${frontendDir}`);
  console.log(`[sidecar] Port: ${port}`);

  backendProcess = spawn(exePath, [], {
    env: {
      ...process.env,
      ASPNETCORE_URLS: `http://127.0.0.1:${port}`,
      LUMIO_DATA_DIR: dataDir,
      LUMIO_FRONTEND_DIR: frontendDir,
    },
    stdio: ["ignore", "pipe", "pipe"],
    detached: false,
  });

  backendProcess.stdout?.on("data", (data: Buffer) => {
    console.log(`[backend] ${data.toString().trim()}`);
  });

  backendProcess.stderr?.on("data", (data: Buffer) => {
    console.error(`[backend:err] ${data.toString().trim()}`);
  });

  backendProcess.on("exit", (code, signal) => {
    console.log(`[sidecar] Backend exited: code=${code}, signal=${signal}`);
    backendProcess = null;
  });

  backendProcess.on("error", (err) => {
    console.error(`[sidecar] Failed to start backend:`, err);
    backendProcess = null;
  });

  // Wait for the backend to become healthy
  await waitForHealth(port, 30_000);
}

/**
 * Stop the backend sidecar process gracefully.
 */
export function stopBackend(): void {
  if (!backendProcess) return;

  console.log("[sidecar] Stopping backend...");

  try {
    if (process.platform === "win32") {
      // On Windows, use taskkill to kill the process tree
      spawn("taskkill", ["/pid", backendProcess.pid!.toString(), "/f", "/t"], {
        stdio: "ignore",
      });
    } else {
      backendProcess.kill("SIGTERM");
    }
  } catch (err) {
    console.error("[sidecar] Error stopping backend:", err);
  }

  backendProcess = null;
}

/**
 * Poll the health endpoint until it responds or timeout.
 */
async function waitForHealth(
  port: number,
  timeoutMs: number
): Promise<void> {
  const start = Date.now();
  const interval = 500;

  while (Date.now() - start < timeoutMs) {
    try {
      const ok = await checkHealth(port);
      if (ok) {
        console.log("[sidecar] Backend is healthy");
        return;
      }
    } catch {
      // Not ready yet
    }
    await sleep(interval);
  }

  throw new Error(
    `Backend did not become healthy within ${timeoutMs}ms`
  );
}

function checkHealth(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.get(
      `http://127.0.0.1:${port}/api/status`,
      (res) => {
        resolve(res.statusCode === 200);
        res.resume();
      }
    );
    req.on("error", () => resolve(false));
    req.setTimeout(2000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
