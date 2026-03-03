"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { LumioIcon, type LumioIconName } from "@/components/ui/lumio-icon";

/**
 * GAP-UX-009: Contextual cross-linking between related modules.
 *
 * Renders a compact "Gerelateerde secties" footer panel pointing to modules
 * thematically related to the current page. Helps users understand how
 * modules connect without relying solely on the sidebar navigation.
 *
 * Usage:
 *   <RelatedModules links={TESTAMENT_RELATED} />
 *
 * WCAG compliance:
 * - Each link has a descriptive accessible name (title + reason text).
 * - Section is wrapped in a <nav aria-label="Gerelateerde secties"> landmark.
 */

export interface RelatedLink {
  /** Target route (without locale prefix) */
  href: string;
  /** i18n key from "nav" namespace (e.g. "testament") */
  labelKey: string;
  /** Brief reason why this module is related — plain string */
  reason: string;
  /** Optional LumioIcon to visually identify the module */
  icon?: LumioIconName;
}

interface RelatedModulesProps {
  links: RelatedLink[];
}

export function RelatedModules({ links }: RelatedModulesProps) {
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");

  if (links.length === 0) return null;

  return (
    <section
      aria-labelledby="related-modules-heading"
      className="mt-8 rounded-xl border border-border bg-muted/40 p-5"
    >
      <h2
        id="related-modules-heading"
        className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider"
      >
        {tCommon("gerelateerdeSectiesLabel")}
      </h2>
      <nav aria-label={tCommon("gerelateerdeSectiesLabel")}>
        <ul className="flex flex-col gap-3 sm:flex-row sm:flex-wrap list-none p-0 m-0">
          {links.map(({ href, labelKey, reason, icon }) => {
            const label = tNav(labelKey);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className="group flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-3 text-sm transition-colors hover:border-primary/50 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  aria-label={`${label} — ${reason}`}
                >
                  {icon && (
                    <LumioIcon
                      name={icon}
                      size="sm"
                      aria-hidden="true"
                      className="shrink-0 text-muted-foreground group-hover:text-primary transition-colors"
                    />
                  )}
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                      {label}
                    </span>
                    <span className="text-xs text-muted-foreground">{reason}</span>
                  </div>
                  <ArrowRight
                    aria-hidden="true"
                    className="ml-auto h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors"
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </section>
  );
}
