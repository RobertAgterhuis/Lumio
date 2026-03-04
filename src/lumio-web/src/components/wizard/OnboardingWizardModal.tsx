"use client";

/**
 * OnboardingWizardModal — SP-UX-01-009 (REC-UIDESIGN-002)
 *
 * Presentational component containing the OnboardingWizard modal UI.
 * Extracted from OnboardingWizard.tsx to enable Storybook stories and
 * isolated accessibility testing (SP-UX-01-006 / SP-UX-01-009).
 *
 * All state/data-fetching logic remains in OnboardingWizard.tsx.
 */

import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import {
  Sparkles,
  Check,
  ChevronRight,
  X,
} from "lucide-react";

export interface OnboardingStapDisplay {
  id: string;
  stapKey: string;
  icon: React.ElementType;
  href: string;
}

export interface OnboardingWizardModalProps {
  stappen: OnboardingStapDisplay[];
  /** Boolean map: stepId → completed */
  stapStatus: Record<string, boolean>;
  completedCount: number;
  /** Called when user clicks a not-yet-completed step */
  onNavigate: (href: string) => void;
  /** Called for "Later invullen" / "Afronden" buttons */
  onClose: () => void;
  /** Called for "Niet meer tonen" button */
  onDontShowAgain: () => void;
}

export function OnboardingWizardModal({
  stappen,
  stapStatus,
  completedCount,
  onNavigate,
  onClose,
  onDontShowAgain,
}: OnboardingWizardModalProps) {
  const t = useTranslations("wizard");
  const modalRef = useRef<HTMLDivElement | null>(null);

  // UX-001: Focus-trap — keep keyboard focus inside modal (WCAG 2.1.1, 2.1.2)
  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;
    const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const getFocusable = () => Array.from(modal.querySelectorAll<HTMLElement>(FOCUSABLE));
    getFocusable()[0]?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      // SC 2.1.2: Escape sluit het modal
      if (e.key === "Escape") { onClose(); return; }
      if (e.key !== "Tab") return;
      const els = getFocusable();
      if (els.length === 0) { e.preventDefault(); return; }
      const first = els[0];
      const last = els[els.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-wizard-title"
        className="mx-4 w-full max-w-2xl rounded-xl border border-border bg-background shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
            <div>
              <h2 id="onboarding-wizard-title" className="text-lg font-semibold">{t("welkom")}</h2>
              <p className="text-sm text-muted-foreground">
                {t("doorloop")}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={onClose}
            aria-label={t("sluiten")}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        {/* Progress */}
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {t("voltooid", { voltooid: completedCount, totaal: stappen.length })}
            </span>
            <span className="font-medium text-primary">
              {Math.round((completedCount / stappen.length) * 100)}%
            </span>
          </div>
          <div
            className="mt-2 h-2 rounded-full bg-muted"
            role="progressbar"
            aria-valuenow={completedCount}
            aria-valuemin={0}
            aria-valuemax={stappen.length}
            aria-label={t("voortgang")}
          >
            <div
              className="h-full rounded-full bg-linear-to-r from-primary to-primary-400 transition-all duration-500"
              style={{ width: `${(completedCount / stappen.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="px-6 py-4 space-y-2">
          {stappen.map((stap, idx) => {
            const isDone = stapStatus[stap.id] ?? false;
            const Icon = stap.icon;
            return (
              <Card
                key={stap.id}
                style={{ animationDelay: `${idx * 50}ms` }}
                className={cn(
                  "cursor-pointer transition-colors hover:bg-muted/50 animate-[fadeSlideIn_300ms_ease-out_both]",
                  isDone && "bg-success-100 border-success"
                )}
                onClick={() => !isDone && onNavigate(stap.href)}
              >
                <CardContent className="flex items-center gap-4 p-4">
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                      isDone
                        ? "bg-success-100 text-success"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {isDone ? (
                      <Check className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        isDone && "text-success"
                      )}
                    >
                      {t(`stappen.${stap.stapKey}.titel`)}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {t(`stappen.${stap.stapKey}.beschrijving`)}
                    </p>
                  </div>
                  {!isDone && (
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={onClose}>
              {t("laterInvullen")}
            </Button>
            {completedCount < stappen.length && (
              <button
                type="button"
                onClick={onDontShowAgain}
                className="text-sm font-bold text-muted-foreground underline-offset-2 hover:underline hover:text-foreground transition-colors"
              >
                {t("nietMeerTonen")}
              </button>
            )}
          </div>
          {completedCount === stappen.length && (
            <Button onClick={onClose}>
              <Check className="h-4 w-4 mr-2" aria-hidden="true" />
              {t("afronden")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
