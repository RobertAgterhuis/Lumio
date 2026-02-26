import { slugify } from "./slugify";

export interface TocEntry {
  level: 2 | 3;
  text: string;
  anchor: string;
}

/**
 * Parses a markdown string and returns a table of contents from all
 * level-2 (##) and level-3 (###) headings.
 */
export function parseToc(markdown: string): TocEntry[] {
  const result: TocEntry[] = [];
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  let match: RegExpExecArray | null;

  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length as 2 | 3;
    const text = match[2].trim();
    result.push({ level, text, anchor: slugify(text) });
  }

  return result;
}
