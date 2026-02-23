"use client";

import { useEffect, useRef, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { useHelpStore } from "@/stores/helpStore";
import {
  helpChapters,
  getChapterUrl,
  type HelpChapter,
} from "@/content/help-chapters";

/**
 * Slide-over panel that shows contextual help content.
 * Opens from the right side of the screen.
 */
export function HelpPanel() {
  const t = useTranslations("help");
  const locale = useLocale();
  const panelRef = useRef<HTMLDivElement>(null);

  const {
    panelOpen,
    activeChapterSlug,
    contentCache,
    loading,
    closePanel,
    setActiveChapter,
    cacheContent,
    setLoading,
  } = useHelpStore();

  const activeChapter = helpChapters.find(
    (ch) => ch.slug === activeChapterSlug
  );
  const activeIndex = activeChapter
    ? helpChapters.indexOf(activeChapter)
    : -1;

  const cachedContent = activeChapterSlug
    ? contentCache[`${activeChapterSlug}-${locale}`]
    : undefined;

  // Fetch markdown content when chapter changes
  useEffect(() => {
    if (!panelOpen || !activeChapter) return;

    const cacheKey = `${activeChapter.slug}-${locale}`;
    if (useHelpStore.getState().contentCache[cacheKey]) return;

    setLoading(true);
    const url = getChapterUrl(activeChapter, locale);

    let cancelled = false;
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((text) => {
        if (!cancelled) cacheContent(cacheKey, text);
      })
      .catch((err) => {
        console.error("Failed to load help content:", err);
        if (!cancelled) cacheContent(cacheKey, `# ${t("laadFout")}\n\n${t("laadFoutBeschrijving")}`);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [panelOpen, activeChapter, locale, cacheContent, setLoading, t]);

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
          <select
            value={activeChapterSlug ?? ""}
            onChange={(e: { target: { value: string } }) => setActiveChapter(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
          >
            {helpChapters.map((ch) => (
              <option key={ch.slug} value={ch.slug}>
                {ch.number}. {t(`chapters.${ch.titleKey}`)}
              </option>
            ))}
          </select>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-muted-foreground">{t("laden")}</p>
            </div>
          ) : cachedContent ? (
            <MarkdownRenderer content={cachedContent} />
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
