import { describe, it, expect } from "vitest";
import { slugify } from "./slugify";

describe("slugify()", () => {
  it("lowercases input", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("replaces spaces with hyphens", () => {
    expect(slugify("foo bar baz")).toBe("foo-bar-baz");
  });

  it("collapses multiple spaces into one hyphen", () => {
    expect(slugify("foo   bar")).toBe("foo-bar");
  });

  it("strips non-alphanumeric characters (collapsed into single hyphen)", () => {
    expect(slugify("foo & bar!")).toBe("foo-bar");
  });

  it("handles Dutch accented characters", () => {
    expect(slugify("één")).toBe("een");
    expect(slugify("Über")).toBe("uber");
    expect(slugify("café")).toBe("cafe");
    expect(slugify("naïef")).toBe("naief");
    expect(slugify("côté")).toBe("cote");
  });

  it("handles all supported accent groups", () => {
    expect(slugify("äàáâãå")).toBe("aaaaaa");
    expect(slugify("ëèéê")).toBe("eeee");
    expect(slugify("ïìíî")).toBe("iiii");
    expect(slugify("öòóôõ")).toBe("ooooo");
    expect(slugify("üùúû")).toBe("uuuu");
  });

  it("trims leading and trailing whitespace", () => {
    expect(slugify("  hello  ")).toBe("hello");
  });

  it("returns empty string for empty input", () => {
    expect(slugify("")).toBe("");
  });

  it("handles string with only special characters", () => {
    expect(slugify("!!!")).toBe("");
  });

  it("produces stable anchor for typical Dutch heading", () => {
    expect(slugify("Technische vereisten")).toBe("technische-vereisten");
    expect(slugify("AVG & Privacy")).toBe("avg-privacy");
    expect(slugify("Stap 3: Beveiliging")).toBe("stap-3-beveiliging");
  });
});
