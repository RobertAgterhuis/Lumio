"use client";

import { useState, useMemo, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { BookOpen, Search } from "lucide-react";
import { MarkdownRenderer } from "@/components/help/MarkdownRenderer";
import { helpChapters } from "@/content/help-chapters";
import { getHelpContent } from "@/content/help-content";
import { useHelpSearch } from "@/hooks/useHelpSearch";

/** Inner component — separated so useSearchParams is inside a Suspense boundary */
function HelpPageContent() {
  const t = useTranslations("help");
  const locale = useLocale();
  const params = useSearchParams();
  const contentRef = useRef<HTMLDivElement>(null);

  const [activeSlug, setActiveSlug] = useState(() => {
    const chapterParam = params.get("chapter");
    if (chapterParam && helpChapters.some((ch) => ch.slug === chapterParam))
      return chapterParam;
    return helpChapters[0].slug;
  });
  const [searchQuery, setSearchQuery] = useState("");

  // Scroll to a deep-linked section after content renders
  useEffect(() => {
    const section = params.get("section");
    if (!section) return;
    const timer = setTimeout(() => {
      const el = contentRef.current?.querySelector(`#${section}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSlug]); // re-run when chapter changes so section scroll works after nav

  const activeChapter = helpChapters.find((ch) => ch.slug === activeSlug);

  // Content is looked up synchronously from embedded module
  const content = useMemo(() => {
    if (!activeChapter) return "";
    const file = locale === "en" ? activeChapter.fileEn : activeChapter.fileNl;
    return getHelpContent(file, locale === "en" ? "en" : "nl") ?? "";
  }, [activeChapter, locale]);

  // Full-text search via shared hook
  const searchResults = useHelpSearch(searchQuery, locale === "en" ? "en" : "nl");

  return (
    <div className="flex h-full gap-0 -m-6">
      {/* Sidebar */}
      <aside className="help-sidebar flex w-72 flex-col border-r border-border bg-muted/30">
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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              placeholder={t("zoeken")}
              className="w-full rounded-md border border-input bg-background py-2 pl-8 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Search results or chapter list */}
        <nav className="flex-1 overflow-y-auto p-2">
          {searchQuery.length >= 2 ? (
            searchResults.length === 0 ? (
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
      <div ref={contentRef} className="help-main flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-8 py-6">
          <MarkdownRenderer content={content} />
        </div>
      </div>
    </div>
  );
}

export default function HelpPage() {
  return (
    <Suspense>
      <HelpPageContent />
    </Suspense>
  );
}
