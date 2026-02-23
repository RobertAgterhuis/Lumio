"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { BookOpen, Search } from "lucide-react";
import { MarkdownRenderer } from "@/components/help/MarkdownRenderer";
import { helpChapters, getChapterUrl } from "@/content/help-chapters";

export default function HelpPage() {
  const t = useTranslations("help");
  const locale = useLocale();

  const [activeSlug, setActiveSlug] = useState(helpChapters[0].slug);
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [contentCache, setContentCache] = useState<Record<string, string>>({});
  const contentCacheRef = useRef<Record<string, string>>({});
  contentCacheRef.current = contentCache;
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<
    { slug: string; snippet: string }[]
  >([]);
  const [searching, setSearching] = useState(false);

  const activeChapter = helpChapters.find((ch) => ch.slug === activeSlug);

  // Fetch chapter content when active chapter changes
  useEffect(() => {
    const chapter = helpChapters.find((ch) => ch.slug === activeSlug);
    if (!chapter) return;

    const cacheKey = `${activeSlug}-${locale}`;
    const cached = contentCacheRef.current[cacheKey];
    if (cached) {
      setContent(cached);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetch(getChapterUrl(chapter, locale))
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((text) => {
        if (!cancelled) {
          setContentCache((prev) => ({ ...prev, [cacheKey]: text }));
          setContent(text);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setContent(`# ${t("laadFout")}\n\n${t("laadFoutBeschrijving")}`);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [activeSlug, locale, t]);

  // Full-text search across all chapters
  const handleSearch = useCallback(
    async (query: string) => {
      setSearchQuery(query);
      if (query.length < 2) {
        setSearchResults([]);
        setSearching(false);
        return;
      }
      setSearching(true);

      const results: { slug: string; snippet: string }[] = [];

      for (const chapter of helpChapters) {
        const cacheKey = `${chapter.slug}-${locale}`;
        let text = contentCacheRef.current[cacheKey];

        if (!text) {
          try {
            const url = getChapterUrl(chapter, locale);
            const res = await fetch(url);
            if (res.ok) {
              text = await res.text();
              setContentCache((prev) => ({ ...prev, [cacheKey]: text! }));
              contentCacheRef.current = { ...contentCacheRef.current, [cacheKey]: text };
            }
          } catch {
            continue;
          }
        }

        if (text) {
          const lowerText = text.toLowerCase();
          const lowerQuery = query.toLowerCase();
          const idx = lowerText.indexOf(lowerQuery);
          if (idx !== -1) {
            const start = Math.max(0, idx - 40);
            const end = Math.min(text.length, idx + query.length + 40);
            const snippet =
              (start > 0 ? "..." : "") +
              text.slice(start, end).replace(/\n/g, " ") +
              (end < text.length ? "..." : "");
            results.push({ slug: chapter.slug, snippet });
          }
        }
      }

      setSearchResults(results);
      setSearching(false);
    },
    [locale]
  );

  return (
    <div className="flex h-full gap-0 -m-6">
      {/* Sidebar */}
      <aside className="flex w-72 flex-col border-r border-border bg-muted/30">
        <div className="flex items-center gap-2 border-b border-border px-4 py-4">
          <BookOpen className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-bold">{t("titel")}</h1>
        </div>

        {/* Search */}
        <div className="border-b border-border px-3 py-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value)}
              placeholder={t("zoeken")}
              className="w-full rounded-md border border-input bg-background py-2 pl-8 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Search results or chapter list */}
        <nav className="flex-1 overflow-y-auto p-2">
          {searchQuery.length >= 2 ? (
            searching ? (
              <p className="px-3 py-4 text-xs text-muted-foreground">
                {t("laden")}
              </p>
            ) : searchResults.length === 0 ? (
              <p className="px-3 py-4 text-xs text-muted-foreground">
                {t("geenResultaten")}
              </p>
            ) : (
              <div className="space-y-1">
                {searchResults.map((result) => {
                  const chapter = helpChapters.find(
                    (ch) => ch.slug === result.slug
                  );
                  if (!chapter) return null;
                  return (
                    <button
                      key={result.slug}
                      onClick={() => {
                        setActiveSlug(result.slug);
                        setSearchQuery("");
                        setSearchResults([]);
                      }}
                      className="w-full rounded-md px-3 py-2 text-left hover:bg-muted"
                    >
                      <span className="text-sm font-medium">
                        {chapter.number}. {t(`chapters.${chapter.titleKey}`)}
                      </span>
                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                        {result.snippet}
                      </p>
                    </button>
                  );
                })}
              </div>
            )
          ) : (
            <div className="space-y-0.5">
              {helpChapters.map((chapter) => {
                const Icon = chapter.icon;
                const isActive = chapter.slug === activeSlug;
                return (
                  <button
                    key={chapter.slug}
                    onClick={() => setActiveSlug(chapter.slug)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-primary/10 font-medium text-primary"
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">
                      {chapter.number}. {t(`chapters.${chapter.titleKey}`)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-8 py-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-muted-foreground">{t("laden")}</p>
            </div>
          ) : (
            <MarkdownRenderer content={content} />
          )}
        </div>
      </div>
    </div>
  );
}
