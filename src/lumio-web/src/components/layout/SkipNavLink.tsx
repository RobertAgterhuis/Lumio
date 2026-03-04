"use client";

import { useTranslations } from "next-intl";

/**
 * Accessible "skip to main content" link (WCAG SC 2.4.1).
 * Visually hidden by default; becomes visible on keyboard focus.
 * Uses i18n so the label adapts to the active locale.
 */
export function SkipNavLink() {
  const t = useTranslations("common");
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-[--base-primary-600] focus:px-4 focus:py-2 focus:text-white focus:shadow-md"
    >
      {t("gaNaarHoofdinhoud")}
    </a>
  );
}
