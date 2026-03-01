import { describe, it, expect } from "vitest";
import { parseToc } from "./parseToc";

describe("parseToc()", () => {
  it("returns empty array for empty string", () => {
    expect(parseToc("")).toEqual([]);
  });

  it("parses a single h2 heading", () => {
    const md = "## Introductie\n\nSome text.";
    expect(parseToc(md)).toEqual([
      { level: 2, text: "Introductie", anchor: "introductie" },
    ]);
  });

  it("parses a single h3 heading", () => {
    const md = "### Sub-sectie\n\nText.";
    expect(parseToc(md)).toEqual([
      { level: 3, text: "Sub-sectie", anchor: "sub-sectie" },
    ]);
  });

  it("parses mixed h2 and h3 headings in order", () => {
    const md = [
      "## Vereisten",
      "Some text.",
      "### Detail één",
      "More text.",
      "## Installatie",
      "### Stap 3: Setup",
    ].join("\n");

    const toc = parseToc(md);
    expect(toc).toHaveLength(4);
    expect(toc[0]).toEqual({ level: 2, text: "Vereisten", anchor: "vereisten" });
    expect(toc[1]).toEqual({ level: 3, text: "Detail één", anchor: "detail-een" });
    expect(toc[2]).toEqual({ level: 2, text: "Installatie", anchor: "installatie" });
    expect(toc[3]).toEqual({ level: 3, text: "Stap 3: Setup", anchor: "stap-3-setup" });
  });

  it("ignores h1 headings", () => {
    const md = "# Titel\n\n## Sectie";
    expect(parseToc(md)).toHaveLength(1);
    expect(parseToc(md)[0].level).toBe(2);
  });

  it("ignores h4+ headings", () => {
    const md = "## Sectie\n\n#### Detail";
    expect(parseToc(md)).toHaveLength(1);
  });

  it("ignores headings that appear mid-line (not at start)", () => {
    const md = "Some text ## not a heading";
    expect(parseToc(md)).toHaveLength(0);
  });

  it("trims extra whitespace from heading text", () => {
    const md = "##  Spatie  ";
    const toc = parseToc(md);
    expect(toc[0].text).toBe("Spatie");
  });

  it("returns empty array when no headings present", () => {
    const md = "Just some paragraph text without headings.";
    expect(parseToc(md)).toEqual([]);
  });
});
