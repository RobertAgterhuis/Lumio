"use client";

/**
 * WizardReturnBadge — SP-UX-01-003 (REC-UXDESIGN-002)
 *
 * Shows a floating "Ga verder met wizard →" badge on any wizard-step page that was
 * opened via the OnboardingWizard (detected by ?vanWizard=true query parameter).
 *
 * On click, dispatches a "lumio:wizard:reopen" custom event that the OnboardingWizard
 * (in the authenticated layout) listens for and uses to reopen itself.
 *
 * WCAG: badge has role="button", focusable, keyboard-activated (Enter/Space).
 */

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";

function WizardReturnBadgeInner() {
  const searchParams = useSearchParams();
  const t = useTranslations("wizard");

  const vanWizard = searchParams.get("vanWizard") === "true";
  if (!vanWizard) return null;

  const handleClick = () => {
    window.dispatchEvent(new CustomEvent("lumio:wizard:reopen"));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={t("terugkeerBadgeAria")}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className="fixed bottom-6 right-6 z-40 flex cursor-pointer items-center gap-2 rounded-full border border-primary/30 bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <Sparkles className="h-4 w-4" aria-hidden="true" />
      {t("terugkeerBadge")}
    </div>
  );
}

/**
 * Exported wrapper — Suspense boundary required because useSearchParams()
 * opts the component into dynamic rendering (Next.js App Router requirement).
 */
export function WizardReturnBadge() {
  return (
    <Suspense fallback={null}>
      <WizardReturnBadgeInner />
    </Suspense>
  );
}
