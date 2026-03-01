import { describe, it, expect } from "vitest";
import { ApiError } from "./api-error";

describe("ApiError", () => {
  describe("constructor", () => {
    it("sets message to detail when provided", () => {
      const err = new ApiError({ status: 400, detail: "Naam is verplicht" });
      expect(err.message).toBe("Naam is verplicht");
    });

    it("falls back to title when detail is absent", () => {
      const err = new ApiError({ status: 400, title: "Validatiefout" });
      expect(err.message).toBe("Validatiefout");
    });

    it("falls back to 'HTTP 500' when neither title nor detail is present", () => {
      const err = new ApiError({ status: 500 });
      expect(err.message).toBe("HTTP 500");
    });

    it("has name 'ApiError'", () => {
      const err = new ApiError({ status: 404 });
      expect(err.name).toBe("ApiError");
    });

    it("is an instance of Error", () => {
      const err = new ApiError({ status: 500 });
      expect(err).toBeInstanceOf(Error);
    });

    it("uses the generic fallback type when none provided in constructor", () => {
      const err = new ApiError({ status: 404 });
      // The constructor fallback is always 'https://httpstatuses.com/500';
      // status-specific type is only injected by fromResponse().
      expect(err.type).toBe("https://httpstatuses.com/500");
    });

    it("uses provided type", () => {
      const err = new ApiError({ status: 400, type: "https://example.com/error" });
      expect(err.type).toBe("https://example.com/error");
    });

    it("stores errors map", () => {
      const errors = { naam: ["is verplicht"], email: ["is ongeldig"] };
      const err = new ApiError({ status: 400, errors });
      expect(err.errors).toEqual(errors);
    });
  });

  describe("hasFieldError()", () => {
    it("returns true when field has errors", () => {
      const err = new ApiError({ status: 400, errors: { naam: ["is verplicht"] } });
      expect(err.hasFieldError("naam")).toBe(true);
    });

    it("is case-insensitive", () => {
      const err = new ApiError({ status: 400, errors: { Naam: ["is verplicht"] } });
      expect(err.hasFieldError("naam")).toBe(true);
    });

    it("returns false when field is not present", () => {
      const err = new ApiError({ status: 400, errors: { naam: ["is verplicht"] } });
      expect(err.hasFieldError("email")).toBe(false);
    });

    it("returns false when errors is undefined", () => {
      const err = new ApiError({ status: 500 });
      expect(err.hasFieldError("naam")).toBe(false);
    });
  });

  describe("getFieldErrors()", () => {
    it("returns error messages for field", () => {
      const err = new ApiError({ status: 400, errors: { naam: ["is verplicht", "is te kort"] } });
      expect(err.getFieldErrors("naam")).toEqual(["is verplicht", "is te kort"]);
    });

    it("returns empty array when field not present", () => {
      const err = new ApiError({ status: 400, errors: { naam: ["is verplicht"] } });
      expect(err.getFieldErrors("email")).toEqual([]);
    });

    it("returns empty array when no errors", () => {
      const err = new ApiError({ status: 500 });
      expect(err.getFieldErrors("naam")).toEqual([]);
    });
  });

  describe("getAllFieldErrors()", () => {
    it("returns flat array of all error messages", () => {
      const err = new ApiError({
        status: 400,
        errors: { naam: ["is verplicht"], email: ["is ongeldig"] },
      });
      const all = err.getAllFieldErrors();
      expect(all).toContain("is verplicht");
      expect(all).toContain("is ongeldig");
      expect(all).toHaveLength(2);
    });

    it("returns empty array when no errors", () => {
      const err = new ApiError({ status: 500 });
      expect(err.getAllFieldErrors()).toEqual([]);
    });
  });

  describe("status helpers", () => {
    it("isValidationError() returns true for 400 with errors", () => {
      const err = new ApiError({ status: 400, errors: { naam: ["is verplicht"] } });
      expect(err.isValidationError()).toBe(true);
    });

    it("isValidationError() returns false for 400 without errors", () => {
      const err = new ApiError({ status: 400 });
      expect(err.isValidationError()).toBe(false);
    });

    it("isNotFound() returns true for 404", () => {
      expect(new ApiError({ status: 404 }).isNotFound()).toBe(true);
      expect(new ApiError({ status: 500 }).isNotFound()).toBe(false);
    });

    it("isUnauthorized() returns true for 401", () => {
      expect(new ApiError({ status: 401 }).isUnauthorized()).toBe(true);
      expect(new ApiError({ status: 403 }).isUnauthorized()).toBe(false);
    });

    it("isServerError() returns true for 5xx", () => {
      expect(new ApiError({ status: 500 }).isServerError()).toBe(true);
      expect(new ApiError({ status: 502 }).isServerError()).toBe(true);
      expect(new ApiError({ status: 400 }).isServerError()).toBe(false);
    });
  });

  describe("fromResponse()", () => {
    it("parses ProblemDetails response body", async () => {
      const body = { type: "https://ex.com/err", title: "Fout", detail: "Details hier", status: 422 };
      const response = new Response(JSON.stringify(body), { status: 422, headers: { "Content-Type": "application/problem+json" } });
      const err = await ApiError.fromResponse(response);
      expect(err.status).toBe(422);
      expect(err.title).toBe("Fout");
      expect(err.detail).toBe("Details hier");
    });

    it("parses legacy { error: string } format", async () => {
      const response = new Response(JSON.stringify({ error: "Iets ging mis" }), { status: 500 });
      const err = await ApiError.fromResponse(response);
      expect(err.detail).toBe("Iets ging mis");
    });

    it("handles non-JSON response body", async () => {
      const response = new Response("Not JSON", { status: 503 });
      const err = await ApiError.fromResponse(response);
      expect(err.status).toBe(503);
      expect(err.title).toBe("Service niet beschikbaar");
    });

    it("uses status-based default title for known status codes", async () => {
      const response = new Response("{}", { status: 404 });
      const err = await ApiError.fromResponse(response);
      expect(err.title).toBe("Niet gevonden");
    });
  });
});
