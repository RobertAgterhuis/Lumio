"use client";

/**
 * DossierVolledigBanner — SP-UX-03-001 (REC-UX-006, REC-UXDESIGN-006)
 *
 * Renders a "Dossier volledig" celebration banner for 5 seconds when the
 * `lumio:dossier-volledig` custom event is dispatched by OnboardingWizard
 * on first-ever completion of all 7 wizard steps.
 *
 * Accessibility: role="status", aria-live="polite", aria-atomic="true"
 * Placement: top of dashboard page, rendered only there (not in layout).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const BANNER_DURATION_MS = 5000;

export function DossierVolledigBanner({ className }: { className?: string }) {
  const t = useTranslations("wizard.dossierVolledigBanner");
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEvent = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(true);
    timerRef.current = setTimeout(() => setVisible(false), BANNER_DURATION_MS);
  }, []);

  useEffect(() => {
    window.addEventListener("lumio:dossier-volledig", handleEvent);
    return () => window.removeEventListener("lumio:dossier-volledig", handleEvent);
  }, [handleEvent]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      data-testid="dossier-volledig-banner"
      className={cn(
        "flex items-center gap-3 rounded-lg border border-success-100 bg-success-100/95 px-4 py-3 text-success shadow-sm",
        className,
      )}
    >
      <CheckCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
      <div>
        <p className="text-sm font-semibold">{t("titel")}</p>
        <p className="text-xs opacity-80">{t("beschrijving")}</p>
      </div>
    </div>
  );
}
