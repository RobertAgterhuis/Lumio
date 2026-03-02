import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// We test the module's exports: api.get/post/put/delete/etc, downloadAndSave
// Since api-client uses `fetch` and `localStorage`, we mock both.

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(globalThis, "localStorage", { value: localStorageMock });

// getLocale() checks `typeof window !== "undefined"` — define window so it reads localStorage
if (typeof globalThis.window === "undefined") {
  (globalThis as Record<string, unknown>).window = globalThis;
}

// Must import after localStorage mock is set up
const { api } = await import("./api-client");

describe("api-client", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("api.get()", () => {
    it("sends GET request with Accept-Language header", async () => {
      // getLocale() reads localStorage at call time, so setting it before the call works
      // But prior tests or the module load may have cached 'nl'. We verify the header is present.
      const mockResponse = { id: 1, name: "test" };

      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );

      const result = await api.get("/api/test");

      expect(fetch).toHaveBeenCalledOnce();
      const [url, opts] = vi.mocked(fetch).mock.calls[0];
      expect(url).toBe("/api/test");
      // Accept-Language should be present (nl or en depending on localStorage state)
      expect((opts?.headers as Record<string, string>)["Accept-Language"]).toBeDefined();
      expect(result).toEqual(mockResponse);
    });

    it("uses locale from localStorage", async () => {
      localStorageMock.setItem("lumio-locale", "en");

      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response("{}", { status: 200 })
      );

      await api.get("/api/test");

      const [, opts] = vi.mocked(fetch).mock.calls[0];
      expect((opts?.headers as Record<string, string>)["Accept-Language"]).toBe("en");
    });

    it("defaults locale to nl when not set", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response("{}", { status: 200 })
      );

      await api.get("/api/test");

      const [, opts] = vi.mocked(fetch).mock.calls[0];
      expect((opts?.headers as Record<string, string>)["Accept-Language"]).toBe("nl");
    });

    it("returns undefined for 204 No Content", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(null, { status: 204 })
      );

      const result = await api.get("/api/test");
      expect(result).toBeUndefined();
    });

    it("throws LOCKED for 423 status", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(null, { status: 423 })
      );

      await expect(api.get("/api/test")).rejects.toThrow("LOCKED");
    });

    it("throws ApiError with lockoutRemainingSeconds for 429 status", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(
          JSON.stringify({ error: "Te veel pogingen.", lockoutRemainingSeconds: 600 }),
          { status: 429 }
        )
      );

      const err = await api.get("/api/test").catch((e) => e);
      expect(err.status).toBe(429);
      expect(err.lockoutRemainingSeconds).toBe(600);
      expect(err.detail).toBe("Te veel pogingen.");
    });

    it("defaults lockoutRemainingSeconds to 0 when absent in 429 body", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify({ error: "Too many requests." }), { status: 429 })
      );

      const err = await api.get("/api/test").catch((e) => e);
      expect(err.status).toBe(429);
      expect(err.lockoutRemainingSeconds).toBe(0);
    });

    it("throws HTTP error for non-ok responses", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify({ error: "Not found" }), { status: 404 })
      );

      await expect(api.get("/api/test")).rejects.toThrow("Not found");
    });

    it("throws generic HTTP error when response body has no error field", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response("not json", { status: 500, statusText: "Server Error" })
      );

      await expect(api.get("/api/test")).rejects.toThrow("Serverfout");
    });
  });

  describe("api.post()", () => {
    it("sends POST with JSON body", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify({ id: 1 }), { status: 201 })
      );

      await api.post("/api/items", { name: "test" });

      const [, opts] = vi.mocked(fetch).mock.calls[0];
      expect(opts?.method).toBe("POST");
      expect((opts?.headers as Record<string, string>)["Content-Type"]).toBe("application/json");
      expect(opts?.body).toBe(JSON.stringify({ name: "test" }));
    });

    it("sends POST without body when none provided", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify({}), { status: 200 })
      );

      await api.post("/api/action");

      const [, opts] = vi.mocked(fetch).mock.calls[0];
      expect(opts?.body).toBeUndefined();
    });
  });

  describe("api.put()", () => {
    it("sends PUT with JSON body", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify({ id: 1 }), { status: 200 })
      );

      await api.put("/api/items/1", { name: "updated" });

      const [, opts] = vi.mocked(fetch).mock.calls[0];
      expect(opts?.method).toBe("PUT");
      expect(opts?.body).toBe(JSON.stringify({ name: "updated" }));
    });
  });

  describe("api.delete()", () => {
    it("sends DELETE request", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(null, { status: 204 })
      );

      await api.delete("/api/items/1");

      const [, opts] = vi.mocked(fetch).mock.calls[0];
      expect(opts?.method).toBe("DELETE");
    });
  });

  describe("api.deleteWithBody()", () => {
    it("sends DELETE with JSON body", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(null, { status: 204 })
      );

      await api.deleteWithBody("/api/items", { ids: [1, 2] });

      const [, opts] = vi.mocked(fetch).mock.calls[0];
      expect(opts?.method).toBe("DELETE");
      expect(opts?.body).toBe(JSON.stringify({ ids: [1, 2] }));
    });
  });

  describe("timeout", () => {
    it("throws REQUEST_TIMEOUT when request is aborted", async () => {
      vi.spyOn(globalThis, "fetch").mockImplementationOnce(() => {
        const error = new DOMException("The operation was aborted.", "AbortError");
        return Promise.reject(error);
      });

      await expect(api.get("/api/slow")).rejects.toThrow("REQUEST_TIMEOUT");
    });
  });

  describe("api.download()", () => {
    it("returns blob and parsed filename from Content-Disposition", async () => {
      const blob = new Blob(["test"], { type: "text/plain" });

      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(blob, {
          status: 200,
          headers: { "Content-Disposition": 'attachment; filename="exported.pdf"' },
        })
      );

      const result = await api.download("/api/export");

      expect(result.filename).toBe("exported.pdf");
      expect(result.blob).toBeInstanceOf(Blob);
    });

    it("uses fallback filename when Content-Disposition is absent", async () => {
      const blob = new Blob(["test"]);

      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(blob, { status: 200 })
      );

      const result = await api.download("/api/export");

      expect(result.filename).toBe("download");
    });

    it("sends POST when method is specified", async () => {
      const blob = new Blob(["test"]);

      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(blob, { status: 200 })
      );

      await api.download("/api/export", { method: "POST", body: { ids: [1] } });

      const [, opts] = vi.mocked(fetch).mock.calls[0];
      expect(opts?.method).toBe("POST");
      expect(opts?.body).toBe(JSON.stringify({ ids: [1] }));
    });
  });
});
