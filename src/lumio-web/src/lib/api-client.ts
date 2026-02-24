// API base: empty string = same origin (frontend served by the .NET backend).
// In production (Electron), the frontend is served by the backend on the same port.
// For standalone dev, set NEXT_PUBLIC_API_URL=http://127.0.0.1:5123
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

import { ApiError } from "./api-error";

// Re-export ApiError for convenience
export { ApiError } from "./api-error";
export type { ProblemDetails } from "./api-error";

/** Default request timeout in milliseconds */
const REQUEST_TIMEOUT_MS = 30_000;

function getLocale(): string {
  if (typeof window !== "undefined") {
    return localStorage.getItem("lumio-locale") ?? "nl";
  }
  return "nl";
}

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        ...options?.headers,
        "Accept-Language": getLocale(),
      },
    });

    if (res.status === 423) {
      throw new Error("LOCKED");
    }

    if (!res.ok) {
      throw await ApiError.fromResponse(res);
    }

    if (res.status === 204) return undefined as T;
    return res.json();
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error("REQUEST_TIMEOUT");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
  deleteWithBody: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    }),
  upload: <T>(path: string, formData: FormData) =>
    request<T>(path, {
      method: "POST",
      body: formData,
    }),
  download: async (path: string, options?: { method?: string; body?: unknown }) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const res = await fetch(`${API_BASE}${path}`, {
        method: options?.method ?? "GET",
        signal: controller.signal,
        headers: {
          "Accept-Language": getLocale(),
          ...(options?.body ? { "Content-Type": "application/json" } : {}),
        },
        body: options?.body ? JSON.stringify(options.body) : undefined,
      });
      if (res.status === 423) throw new Error("LOCKED");
      if (!res.ok) {
        throw await ApiError.fromResponse(res);
      }
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition");
      const match = disposition?.match(/filename="?([^";\n]+)"?/);
      const filename = match?.[1] ?? "download";
      return { blob, filename };
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        throw new Error("REQUEST_TIMEOUT");
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  },
};

/**
 * Downloads a file via api.download() and triggers a browser save dialog.
 * @param path  API path (e.g. "/api/export/testament")
 * @param fallbackFilename  Filename to use when the server doesn't provide one.
 * @param options  Optional method / body overrides.
 */
export async function downloadAndSave(
  path: string,
  fallbackFilename: string,
  options?: { method?: string; body?: unknown }
): Promise<void> {
  const { blob, filename } = await api.download(path, options);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename !== "download" ? filename : fallbackFilename;
  a.click();
  URL.revokeObjectURL(url);
}
