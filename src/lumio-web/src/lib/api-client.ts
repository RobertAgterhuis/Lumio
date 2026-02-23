// API base: empty string = same origin (frontend served by the .NET backend).
// In production (Electron), the frontend is served by the backend on the same port.
// For standalone dev, set NEXT_PUBLIC_API_URL=http://127.0.0.1:5123
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

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
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...options?.headers,
      "Accept-Language": getLocale(),
    },
  });

  if (res.status === 423) {
    throw new Error("LOCKED");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
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
  download: async (path: string) => {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { "Accept-Language": getLocale() },
    });
    if (res.status === 423) throw new Error("LOCKED");
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `HTTP ${res.status}`);
    }
    const blob = await res.blob();
    const disposition = res.headers.get("Content-Disposition");
    const match = disposition?.match(/filename="?([^";\n]+)"?/);
    const filename = match?.[1] ?? "download";
    return { blob, filename };
  },
};
