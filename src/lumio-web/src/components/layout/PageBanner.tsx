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
}: PageBannerProps) {
  const dismissed = usePreferencesStore((s) => s.dismissedBanners.includes(id));
  const dismissBanner = usePreferencesStore((s) => s.dismissBanner);
  const [portal, setPortal] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortal(document.getElementById("page-banner-portal"));
  }, []);

  if (!show || dismissed || !portal) return null;

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={cn(
        "border-b px-6 py-3 flex items-center justify-between gap-4",
        variantClasses[variant] ?? variantClasses.warning,
        className
      )}
    >
      <p className="text-sm">{children}</p>
      <button
        type="button"
        onClick={() => dismissBanner(id)}
        aria-label="Melding verbergen"
        className="shrink-0 opacity-60 hover:opacity-100 transition-opacity focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded"
      >
        <X className="h-4 w-4" />
      </button>
    </div>,
    portal
  );
}
