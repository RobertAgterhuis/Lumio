"use client";

import { useMemo } from "react";
import { BookOpen, Plus } from "lucide-react";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LumioIcon, type LumioIconName } from "@/components/ui/lumio-icon";
import { useHelpStore } from "@/stores/helpStore";
import { helpChapters } from "@/content/help-chapters";
import { getHelpContent } from "@/content/help-content";

interface HelpEmptyStateProps {
  /** Chapter slug that maps to this domain (e.g. "erfgenamen") */
  chapterSlug: string;
  /** Text label for the primary add action (e.g. "eerste erfgenaam toevoegen") */
  addLabel: string;
  /** Called when user clicks the primary add button */
  onAdd: () => void;
  /** Domain name used in the "Nog geen X toegevoegd" heading */
  domeinLabel: string;
  /** Optional override for the Lumio icon name; defaults to chapterSlug */
  iconName?: LumioIconName;
}

/** Strips markdown syntax and returns clean plain text. */
function stripMarkdown(md: string): string {
  return md
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\n+/g, " ")
    .trim();
}

/** Extracts the first meaningful paragraph from a markdown string. */
function extractIntroParagraph(markdown: string): string {
  const lines = markdown.split("\n");
  const paragraphs: string[] = [];
  let current: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === "") {
      if (current.length > 0) {
        paragraphs.push(current.join(" "));
        current = [];
      }
    } else if (!trimmed.startsWith("#") && !trimmed.startsWith(">")) {
      current.push(trimmed);
    }
  }
  if (current.length > 0) paragraphs.push(current.join(" "));

  const first = paragraphs.find((p) => p.length > 40) ?? paragraphs[0] ?? "";
  const clean = stripMarkdown(first);
  return clean.length > 200 ? clean.slice(0, 197) + "…" : clean;
}

/**
 * Replaces a page's "geen items" empty state with a richer component that
 * shows a domain icon, heading, intro paragraph from the help chapter, and
 * a call-to-action button with a "Meer weten?" help link.
 */
export function HelpEmptyState({
  chapterSlug,
  addLabel,
  onAdd,
  domeinLabel,
  iconName,
}: HelpEmptyStateProps) {
  const locale = useLocale();
  const { openPanel } = useHelpStore();

  const chapter = helpChapters.find((ch) => ch.slug === chapterSlug);
  const loc = locale === "en" ? "en" : "nl";

  const introParagraph = useMemo(() => {
    if (!chapter) return "";
    const file = loc === "en" ? chapter.fileEn : chapter.fileNl;
    const md = getHelpContent(file, loc);
    if (!md) return "";
    return extractIntroParagraph(md);
  }, [chapter, loc]);

  const resolvedIconName = (iconName ?? chapterSlug) as LumioIconName;

  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
        {/* Domain icon */}
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <LumioIcon
            name={resolvedIconName}
            size="lg"
            className="text-muted-foreground"
          />
        </div>

        {/* Heading */}
        <div className="space-y-2 max-w-sm">
          <h2 className="font-semibold text-lg">
            {locale === "en"
              ? `No ${domeinLabel} added yet`
              : `Nog geen ${domeinLabel} toegevoegd`}
          </h2>

          {/* Intro paragraph from the help file */}
          {introParagraph && (
            <p className="text-sm text-muted-foreground">{introParagraph}</p>
          )}
        </div>

        {/* Primary action */}
        <Button onClick={onAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          {addLabel}
        </Button>

        {/* Help link */}
        <button
          type="button"
          onClick={() => openPanel(chapterSlug)}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          <BookOpen className="h-3.5 w-3.5" />
          {locale === "en"
            ? "Want to know more? Read the guide →"
            : "Meer weten? Lees de handleiding →"}
        </button>
      </CardContent>
    </Card>
  );
}
