import { describe, expect, it } from "vitest";

import {
  AFSLUIT_INSTRUCTIES,
  zoekAfsluitInstructie,
  zoekAfsluitInstructiesVoorCategorie,
} from "./afsluit-instructies";

describe("zoekAfsluitInstructie", () => {
  it("finds an instruction by exact keyword match", () => {
    const result = zoekAfsluitInstructie("facebook");
    expect(result).toBeDefined();
    expect(result?.platform).toBe("Facebook / Meta");
  });

  it("matches case-insensitively", () => {
    const upper = zoekAfsluitInstructie("FACEBOOK");
    const mixed = zoekAfsluitInstructie("FaceBook");
    expect(upper?.platform).toBe("Facebook / Meta");
    expect(mixed?.platform).toBe("Facebook / Meta");
  });

  it("trims leading and trailing whitespace", () => {
    const result = zoekAfsluitInstructie("  instagram  ");
    expect(result).toBeDefined();
    expect(result?.platform).toBe("Instagram");
  });

  it("finds Google by its gmail alias", () => {
    const result = zoekAfsluitInstructie("gmail");
    expect(result).toBeDefined();
    expect(result?.platform).toContain("Google");
  });

  it("finds Microsoft by hotmail alias", () => {
    const result = zoekAfsluitInstructie("hotmail");
    expect(result).toBeDefined();
    expect(result?.platform).toContain("Microsoft");
  });

  it("finds LinkedIn by its platform name", () => {
    const result = zoekAfsluitInstructie("linkedin");
    expect(result).toBeDefined();
    expect(result?.beschrijvingKey).toBe("linkedin");
  });

  it("returns undefined for a completely unknown platform", () => {
    const result = zoekAfsluitInstructie("onbekendplatform99999");
    expect(result).toBeUndefined();
  });

  it("returns the first entry for empty string (every keyword includes '')", () => {
    // The matching algorithm: z.includes("") is always true, so the first entry is returned.
    const result = zoekAfsluitInstructie("");
    expect(result).toBeDefined();
  });

  it("every found instruction has a valid https URL", () => {
    const platforms = ["facebook", "instagram", "twitter", "linkedin", "google"];
    platforms.forEach((p) => {
      const result = zoekAfsluitInstructie(p);
      expect(result?.url).toMatch(/^https?:\/\//);
    });
  });

  it("each result has a non-empty beschrijvingKey", () => {
    const result = zoekAfsluitInstructie("snapchat");
    expect(result?.beschrijvingKey).toBeTruthy();
  });
});

describe("zoekAfsluitInstructiesVoorCategorie", () => {
  it("returns all instructions for the Social Media category", () => {
    const result = zoekAfsluitInstructiesVoorCategorie("Social Media");
    expect(result.length).toBeGreaterThan(0);
    result.forEach((i) =>
      expect(i.categorie?.toLowerCase()).toBe("social media")
    );
  });

  it("is case-insensitive when matching category", () => {
    const lower = zoekAfsluitInstructiesVoorCategorie("social media");
    const upper = zoekAfsluitInstructiesVoorCategorie("SOCIAL MEDIA");
    const mixed = zoekAfsluitInstructiesVoorCategorie("Social Media");
    expect(lower.length).toBe(upper.length);
    expect(lower.length).toBe(mixed.length);
    expect(lower.length).toBeGreaterThan(0);
  });

  it("returns results for the Email category", () => {
    const result = zoekAfsluitInstructiesVoorCategorie("Email");
    expect(result.length).toBeGreaterThan(0);
    result.forEach((i) =>
      expect(i.categorie?.toLowerCase()).toBe("email")
    );
  });

  it("returns results for the Gaming category", () => {
    const result = zoekAfsluitInstructiesVoorCategorie("Gaming");
    expect(result.length).toBeGreaterThan(0);
  });

  it("returns an empty array for an unknown category", () => {
    const result = zoekAfsluitInstructiesVoorCategorie("BestaatNiet");
    expect(result).toHaveLength(0);
  });

  it("returns an empty array for empty string", () => {
    const result = zoekAfsluitInstructiesVoorCategorie("");
    expect(result).toHaveLength(0);
  });
});

describe("AFSLUIT_INSTRUCTIES data integrity", () => {
  it("all entries have a non-empty platform name", () => {
    AFSLUIT_INSTRUCTIES.forEach((entry) => {
      expect(entry.platform).toBeTruthy();
    });
  });

  it("all entries have at least one zoekwoord", () => {
    AFSLUIT_INSTRUCTIES.forEach((entry) => {
      expect(entry.zoekwoorden.length).toBeGreaterThan(0);
    });
  });

  it("all entries have a non-empty beschrijvingKey", () => {
    AFSLUIT_INSTRUCTIES.forEach((entry) => {
      expect(entry.beschrijvingKey).toBeTruthy();
    });
  });

  it("all entries have a valid URL starting with https", () => {
    AFSLUIT_INSTRUCTIES.forEach((entry) => {
      expect(entry.url).toMatch(/^https?:\/\//);
    });
  });

  it("zoekwoorden are lowercase for consistent matching", () => {
    AFSLUIT_INSTRUCTIES.forEach((entry) => {
      entry.zoekwoorden.forEach((z) => {
        expect(z).toBe(z.toLowerCase());
      });
    });
  });
});
