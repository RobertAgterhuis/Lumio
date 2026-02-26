import { useMemo } from "react";
import { helpChapters } from "@/content/help-chapters";
import { getHelpContent } from "@/content/help-content";

export interface HelpSearchResult {
  /** Chapter slug */
  slug: string;
  /** Surrounding text snippet (with prefix/suffix "...") */
  snippet: string;
}

/**
 * Searches help content synchronously across all embedded chapters.
 * Returns up to 8 results. Returns an empty array when query is shorter than 2 chars.
 *
 * Can be used in both /help page and HelpPanel without duplication.
 */
export function useHelpSearch(
  query: string,
  locale: string,
): HelpSearchResult[] {
  return useMemo(() => {
    if (query.length < 2) return [];

    const results: HelpSearchResult[] = [];
    const lowerQuery = query.toLowerCase();
    const loc = locale === "en" ? "en" : "nl";

    for (const chapter of helpChapters) {
      const file = loc === "en" ? chapter.fileEn : chapter.fileNl;
      const text = getHelpContent(file, loc);
      if (!text) continue;

      const lowerText = text.toLowerCase();
      const idx = lowerText.indexOf(lowerQuery);
      if (idx !== -1) {
        const start = Math.max(0, idx - 40);
        const end = Math.min(text.length, idx + query.length + 80);
        const snippet =
          (start > 0 ? "…" : "") +
          text.slice(start, end).replace(/[#*`>\n]+/g, " ").replace(/\s+/g, " ").trim() +
          (end < text.length ? "…" : "");
        results.push({ slug: chapter.slug, snippet });
      }

      if (results.length >= 8) break;
    }

    return results;
  }, [query, locale]);
}
