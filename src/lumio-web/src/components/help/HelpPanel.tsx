"use client";

import { useEffect, useRef, useCallback, useMemo } from "react";
import { X, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { useHelpStore } from "@/stores/helpStore";
import { helpChapters, type HelpChapter } from "@/content/help-chapters";
import { getHelpContent } from "@/content/help-content";

/**
 * Slide-over panel that shows contextual help content.
 * Opens from the right side of the screen.
 * Content is embedded at build time — no network requests needed.
 */
export function HelpPanel() {
  const t = useTranslations("help");
  const locale = useLocale();
  const panelRef = useRef<HTMLDivElement>(null);

  const {
    panelOpen,
    activeChapterSlug,
    closePanel,
    setActiveChapter,
  } = useHelpStore();

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

  // Close on Escape
  useEffect(() => {
    if (!panelOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePanel();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [panelOpen, closePanel]);

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
          "border-l border-border bg-background shadow-2xl",
          "animate-in slide-in-from-right duration-300"
        )}
        role="dialog"
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

        {/* Chapter selector */}
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
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
      </aside>
    </>
  );
}
