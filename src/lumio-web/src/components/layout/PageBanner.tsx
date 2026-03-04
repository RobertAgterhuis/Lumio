"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePreferencesStore } from "@/stores/preferencesStore";
import type { ReactNode } from "react";

interface PageBannerProps {
  /** Unique id — used to persist dismiss state per user */
  id: string;
  children: ReactNode;
  /**
   * Controlled visibility. Set to `false` when the underlying condition no longer
   * applies (e.g. profile has been created). The banner will never render when
   * `show` is false, regardless of dismiss state.
   */
  show?: boolean;
  variant?: "warning" | "info" | "destructive" | "secure";
  className?: string;
  /**
   * When true, renders the banner inline in the normal document flow instead of
   * via a portal. Use this when combining with DomainStatusBanner in a side-by-side
   * grid layout.
   */
  inline?: boolean;
}

const variantClasses: Record<string, string> = {
  warning: "border-warning bg-warning-100 text-warning",
  info: "border-info bg-info-100 text-info",
  destructive: "border-danger bg-danger-100 text-danger",
  secure: "border-secure bg-secure-100 text-secure",
};

/**
 * PageBanner — SP-UX universal dismissable page-level notification.
 *
 * Renders via a portal into #page-banner-portal, which sits between the
 * app Header and <main> in the authenticated layout — identical position to
 * the read-only (erfgenaam) banner. Works correctly regardless of where
 * <PageBanner> is placed in the page JSX.
 *
 * Dismiss state is persisted per user via preferencesStore.dismissedBanners.
 * Can be reset via Instellingen → Dashboard-weergave → Verborgen meldingen herstellen.
 */
export function PageBanner({
  id,
  children,
  show = true,
  variant = "warning",
  className,
  inline = false,
}: PageBannerProps) {
  const dismissed = usePreferencesStore((s) => s.dismissedBanners.includes(id));
  const dismissBanner = usePreferencesStore((s) => s.dismissBanner);
  const [exiting, setExiting] = useState(false);

  const handleDismiss = () => {
    setExiting(true);
    setTimeout(() => dismissBanner(id), 200);
  };

  const [portal, setPortal] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Portal is only needed in non-inline mode; prop is effectively static after mount
    if (!inline) setPortal(document.getElementById("page-banner-portal"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!show || dismissed) return null;
  if (!inline && !portal) return null;

  const content = (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={cn(
        inline
          ? "rounded-lg border p-4 flex items-start justify-between gap-3 h-full animate-in fade-in-50 slide-in-from-top-2 duration-300"
          : "border-b px-6 py-3 flex items-center justify-between gap-4 animate-in fade-in-50 slide-in-from-top-full duration-300",
        exiting && "animate-out fade-out-0 slide-out-to-top-full duration-200",
        variantClasses[variant] ?? variantClasses.warning,
        className
      )}
    >
      <p className="text-sm">{children}</p>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Melding verbergen"
        className="shrink-0 opacity-60 hover:opacity-100 transition-opacity focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );

  if (inline) return content;
  return createPortal(content, portal!);
}
