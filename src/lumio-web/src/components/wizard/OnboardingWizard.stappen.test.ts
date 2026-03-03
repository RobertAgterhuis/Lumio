/**
 * SP-UX-02-001: Stap-volgorde test voor OnboardingWizard
 *
 * Verificeert dat uitvaart op positie 6 staat (na erfgenamen + sleutels)
 * conform REC-UX-003 en REC-UXDESIGN-004.
 */
import { describe, it, expect } from "vitest";
import { stappen } from "./OnboardingWizard";

describe("OnboardingWizard – stappen volgorde (SP-UX-02-001)", () => {
  const ids = stappen.map((s) => s.id);

  it("bevat alle verwachte stappen", () => {
    expect(ids).toEqual([
      "profiel",
      "noodcontacten",
      "testament",
      "erfgenamen",
      "sleutels",
      "uitvaart",
      "backup",
    ]);
  });

  it("uitvaart staat NIET voor erfgenamen", () => {
    const uitvaartIdx = ids.indexOf("uitvaart");
    const erfgenamenIdx = ids.indexOf("erfgenamen");
    expect(uitvaartIdx).toBeGreaterThan(erfgenamenIdx);
  });

  it("uitvaart staat NIET voor sleutels", () => {
    const uitvaartIdx = ids.indexOf("uitvaart");
    const sleutelsIdx = ids.indexOf("sleutels");
    expect(uitvaartIdx).toBeGreaterThan(sleutelsIdx);
  });

  it("uitvaart staat op positie 6 (1-indexed)", () => {
    const uitvaartIdx = ids.indexOf("uitvaart");
    // 0-indexed = 5 → 1-indexed positie 6
    expect(uitvaartIdx + 1).toBe(6);
  });

  it("backup staat als laatste stap", () => {
    expect(ids.at(-1)).toBe("backup");
  });

  it("profiel staat als eerste stap", () => {
    expect(ids[0]).toBe("profiel");
  });
});
