"use client";

import { useEffect, useRef, useCallback, useMemo, useState } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  BookOpen,
  List,
  Search,
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { useHelpStore } from "@/stores/helpStore";
import { helpChapters } from "@/content/help-chapters";
import { getHelpContent } from "@/content/help-content";
import { parseToc } from "@/lib/parseToc";
import { useHelpSearch } from "@/hooks/useHelpSearch";

/**
 * Slide-over panel that shows contextual help content.
 * Opens from the right side of the screen.
 * Content is embedded at build time — no network requests needed.
 */
export function HelpPanel() {
  const t = useTranslations("help");
  const tAria = useTranslations("aria");
  const locale = useLocale();
  const panelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const {
    panelOpen,
    activeChapterSlug,
    activeAnchor,
    closePanel,
    setActiveChapter,
    clearAnchor,
  } = useHelpStore();

  const [tocOpen, setTocOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const activeChapter = helpChapters.find(
    (ch) => ch.slug === activeChapterSlug
  );
  const activeIndex = activeChapter
    ? helpChapters.indexOf(activeChapter)
    : -1;

  // Look up content synchronously from embedded module
  const content = useMemo(() => {
    if (!activeChapter) return undefined;
    const file = locale === "en" ? activeChapter.fileEn : activeChapter.fileNl;
    return getHelpContent(file, locale === "en" ? "en" : "nl");
  }, [activeChapter, locale]);

  // Parse table of contents from chapter markdown
  const toc = useMemo(() => (content ? parseToc(content) : []), [content]);

  // Full-text search across all chapters
  const loc = locale === "en" ? "en" : "nl";
  const searchResults = useHelpSearch(searchQuery, loc);

  // Collapse ToC when switching chapters
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTocOpen(false);
  }, [activeChapterSlug]);

  // Scroll to anchor when activeAnchor changes (e.g. from HelpButton with anchor)
  useEffect(() => {
    if (!activeAnchor || !panelOpen) return;
    // Wait one tick for MarkdownRenderer to paint
    const timer = setTimeout(() => {
      const el = contentRef.current?.querySelector(`#${activeAnchor}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      clearAnchor();
    }, 80);
    return () => clearTimeout(timer);
  }, [activeAnchor, panelOpen, content, clearAnchor]);

  // Close on Escape
  useEffect(() => {
    if (!panelOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (searchQuery) {
          setSearchQuery("");
        } else {
          closePanel();
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [panelOpen, closePanel, searchQuery]);

  // Focus first interactive element when panel opens
  useEffect(() => {
    if (!panelOpen) return;
    const timer = setTimeout(() => {
      const firstFocusable = panelRef.current?.querySelector<HTMLElement>(
        'button:not([disabled]), [href], input, select, [tabindex]:not([tabindex="-1"])'
      );
      firstFocusable?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, [panelOpen]);

  // Trap Tab / Shift+Tab inside the panel
  useEffect(() => {
    if (!panelOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const focusable = Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input, select, [tabindex]:not([tabindex="-1"])'
        ) ?? []
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          last.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [panelOpen]);

  const navigateChapter = useCallback(
    (direction: "prev" | "next") => {
      const newIndex =
        direction === "prev" ? activeIndex - 1 : activeIndex + 1;
      if (newIndex >= 0 && newIndex < helpChapters.length) {
        setActiveChapter(helpChapters[newIndex].slug);
      }
    },
    [activeIndex, setActiveChapter]
  );

  if (!panelOpen) return null;

  const showSearchResults = searchQuery.length >= 2;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20 transition-opacity"
        onClick={closePanel}
        aria-hidden
      />

      {/* Panel */}
      <aside
        ref={panelRef}
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-full max-w-lg flex-col",
          "border-l-2 border-primary/20 bg-background shadow-2xl",
          "animate-in slide-in-from-right duration-300"
        )}
        role="dialog"
        aria-modal="true"
        aria-label={t("panelTitel")}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">{t("panelTitel")}</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={closePanel}
            aria-label={t("sluiten")}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Search bar */}
        <div className="border-b border-border px-3 py-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("zoeken")}
              className="w-full rounded-md border border-input bg-muted/30 py-1.5 pl-7 pr-3 text-sm placeholder:text-muted-foreground focus:bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
                aria-label={tAria("zoekopdachtWissen")}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Search results dropdown */}
          {showSearchResults && (
            <div className="mt-1 max-h-52 overflow-y-auto rounded-md border border-border bg-background shadow-sm">
              {searchResults.length === 0 ? (
                <p className="px-3 py-3 text-xs text-muted-foreground">
                  {t("geenResultaten")}
                </p>
              ) : (
                searchResults.slice(0, 5).map((result) => {
                  const chapter = helpChapters.find(
                    (ch) => ch.slug === result.slug
                  );
                  if (!chapter) return null;
                  return (
                    <button
                      key={result.slug}
                      type="button"
                      onClick={() => {
                        setActiveChapter(result.slug);
                        setSearchQuery("");
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-muted transition-colors"
                    >
                      <span className="text-xs font-medium">
                        {chapter.number}. {t(`chapters.${chapter.titleKey}`)}
                      </span>
                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                        {result.snippet}
                      </p>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Chapter selector — hidden when search results are showing */}
        {!showSearchResults && (
          <div className="border-b border-border px-4 py-2">
            <Select
              value={activeChapterSlug ?? ""}
              onChange={(e) => setActiveChapter(e.target.value)}
            >
              {helpChapters.map((ch) => (
                <option key={ch.slug} value={ch.slug}>
                  {ch.number}. {t(`chapters.${ch.titleKey}`)}
                </option>
              ))}
            </Select>
          </div>
        )}

        {/* Table of Contents toggle — shown when chapter has 3+ sections */}
        {!showSearchResults && toc.length >= 3 && (
          <div className="border-b border-border">
            <button
              type="button"
              onClick={() => setTocOpen((o) => !o)}
              className="flex w-full items-center justify-between px-4 py-2 text-xs text-muted-foreground hover:bg-muted/50 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <List className="h-3.5 w-3.5" />
                {t("inhoudsopgave")}
              </span>
              {tocOpen ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>

            {tocOpen && (
              <nav aria-label={t("inhoudsopgave")} className="pb-2">
                {toc.map((entry) => (
                  <a
                    key={entry.anchor}
                    href={`#${entry.anchor}`}
                    onClick={(e) => {
                      e.preventDefault();
                      const el = contentRef.current?.querySelector(
                        `#${entry.anchor}`
                      );
                      if (el)
                        el.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className={cn(
                      "block truncate py-1 text-xs text-muted-foreground hover:text-foreground transition-colors",
                      entry.level === 2 ? "pl-6" : "pl-10"
                    )}
                  >
                    {entry.text}
                  </a>
                ))}
              </nav>
            )}
          </div>
        )}

        {/* Content */}
        <div ref={contentRef} className="flex-1 overflow-y-auto px-6 py-4">
          {content ? (
            <MarkdownRenderer content={content} />
          ) : (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-muted-foreground">
                {t("selecteerHoofdstuk")}
              </p>
            </div>
          )}
        </div>

        {/* Footer navigation */}
        {!showSearchResults && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <Button
              variant="ghost"
              size="sm"
              disabled={activeIndex <= 0}
              onClick={() => navigateChapter("prev")}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              {t("vorige")}
            </Button>
            <span className="text-xs text-muted-foreground">
              {activeChapter
                ? `${activeChapter.number} / ${helpChapters.length}`
                : ""}
            </span>
            <Button
              variant="ghost"
              size="sm"
              disabled={activeIndex >= helpChapters.length - 1}
              onClick={() => navigateChapter("next")}
              className="gap-1"
            >
              {t("volgende")}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </aside>
    </>
  );
}
