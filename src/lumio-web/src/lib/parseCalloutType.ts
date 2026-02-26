/**
 * Detects whether the first strong element in a blockquote's first paragraph
 * indicates a callout card type.
 */

export type CalloutType = "tip" | "warning" | "danger" | "security" | "info";

const CALLOUT_PATTERNS: [RegExp, CalloutType][] = [
  [/^\*\*(Tip|Tip:)\*\*/i, "tip"],
  [/^\*\*(Opmerking|Info|Information|Notitie|Note)(\s*:)?\*\*/i, "info"],
  [/^\*\*(Belangrijk|Important)(\s*:)?\*\*/i, "warning"],
  [/^\*\*(Let op|Warning|Caution|Waarschuwing)(\s*:)?\*\*/i, "danger"],
  [/^\*\*(Veiligheid|Security|Beveiliging)(\s*:)?\*\*/i, "security"],
];

/**
 * Given the text representation of the first content in a blockquote paragraph
 * (e.g. `"**Tip**"` or `"**Belangrijk**:"`), returns the callout type,
 * or null if the blockquote is not a callout.
 */
export function parseCalloutType(firstText: string): CalloutType | null {
  const trimmed = firstText.trim();
  for (const [pattern, type] of CALLOUT_PATTERNS) {
    if (pattern.test(trimmed)) return type;
  }
  return null;
}

/**
 * Extracts the first strong text from a react-markdown hast blockquote node,
 * wrapped in `**...**` so `parseCalloutType` can match it.
 */
export function extractCalloutPattern(node: unknown): string {
  try {
    // node is a hast Element: { children: [{ tagName: "p", children: [...] }] }
    const n = node as Record<string, unknown>;
    const firstChild = (n.children as unknown[])?.[0] as Record<
      string,
      unknown
    >;
    if (!firstChild) return "";
    const pChildren = (firstChild.children as unknown[]) ?? [];
    for (const c of pChildren) {
      const child = c as Record<string, unknown>;
      if (child.tagName === "strong") {
        const textNode = (child.children as unknown[])?.[0] as Record<
          string,
          unknown
        >;
        if (textNode?.type === "text") return `**${textNode.value}**`;
      }
    }
    return "";
  } catch {
    return "";
  }
}
