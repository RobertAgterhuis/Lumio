import { describe, it, expect } from "vitest";
import { parseCalloutType } from "./parseCalloutType";

describe("parseCalloutType()", () => {
  it("returns null for non-callout text", () => {
    expect(parseCalloutType("Regular paragraph")).toBeNull();
    expect(parseCalloutType("")).toBeNull();
    expect(parseCalloutType("**SomeRandomWord**")).toBeNull();
  });

  it("detects 'tip' callout", () => {
    expect(parseCalloutType("**Tip**")).toBe("tip");
    expect(parseCalloutType("**Tip:**")).toBe("tip");
    expect(parseCalloutType("**TIP**")).toBe("tip");
  });

  it("detects 'info' callout variants", () => {
    expect(parseCalloutType("**Opmerking**")).toBe("info");
    expect(parseCalloutType("**Info**")).toBe("info");
    expect(parseCalloutType("**Information**")).toBe("info");
    expect(parseCalloutType("**Notitie**")).toBe("info");
    expect(parseCalloutType("**Note**")).toBe("info");
    expect(parseCalloutType("**Note:**")).toBe("info");
  });

  it("detects 'warning' callout variants", () => {
    expect(parseCalloutType("**Belangrijk**")).toBe("warning");
    expect(parseCalloutType("**Important**")).toBe("warning");
    expect(parseCalloutType("**Belangrijk:**")).toBe("warning");
  });

  it("detects 'danger' callout variants", () => {
    expect(parseCalloutType("**Let op**")).toBe("danger");
    expect(parseCalloutType("**Warning**")).toBe("danger");
    expect(parseCalloutType("**Caution**")).toBe("danger");
    expect(parseCalloutType("**Waarschuwing**")).toBe("danger");
    expect(parseCalloutType("**Let op:**")).toBe("danger");
  });

  it("detects 'security' callout variants", () => {
    expect(parseCalloutType("**Veiligheid**")).toBe("security");
    expect(parseCalloutType("**Security**")).toBe("security");
    expect(parseCalloutType("**Beveiliging**")).toBe("security");
    expect(parseCalloutType("**Security:**")).toBe("security");
  });

  it("is case-insensitive", () => {
    expect(parseCalloutType("**TIP**")).toBe("tip");
    expect(parseCalloutType("**WAARSCHUWING**")).toBe("danger");
    expect(parseCalloutType("**IMPORTANT**")).toBe("warning");
  });

  it("trims whitespace before matching", () => {
    expect(parseCalloutType("  **Tip**  ")).toBe("tip");
  });
});
