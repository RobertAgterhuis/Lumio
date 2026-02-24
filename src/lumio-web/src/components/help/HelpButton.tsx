"use client";

import { usePathname } from "next/navigation";
import { HelpCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useHelpStore } from "@/stores/helpStore";
import { getChapterForRoute, helpChapters } from "@/content/help-chapters";

interface HelpButtonProps {
  /**
   * Explicitly set the chapter slug to open.
   * If omitted, the chapter is auto-detected from the current route.
   */
  chapterSlug?: string;
  /** Visual variant */
  variant?: "icon" | "text" | "outline";
  /** Additional CSS classes */
  className?: string;
}

/**
 * Contextual help button that opens the HelpPanel with the
 * chapter that matches the current page (or an explicit slug).
 */
export function HelpButton({
  chapterSlug,
  variant = "icon",
  className,
}: HelpButtonProps) {
  const pathname = usePathname();
  const t = useTranslations("help");
  const { openPanel } = useHelpStore();

  const resolvedSlug =
    chapterSlug ??
    getChapterForRoute(pathname ?? "")?.slug ??
    helpChapters[0].slug;

  const handleClick = () => {
    openPanel(resolvedSlug);
  };

  if (variant === "icon") {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClick}
        className={className}
        title={t("helpOpenen")}
        aria-label={t("helpOpenen")}
      >
        <HelpCircle className="h-4 w-4" />
      </Button>
    );
  }

  if (variant === "outline") {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleClick}
        className={className}
      >
        <HelpCircle className="mr-2 h-4 w-4" />
        {t("helpOpenen")}
      </Button>
    );
  }

  // variant === "text"
  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-1 text-sm text-primary hover:underline ${className ?? ""}`}
    >
      <HelpCircle className="h-3.5 w-3.5" />
      {t("helpOpenen")}
    </button>
  );
}
