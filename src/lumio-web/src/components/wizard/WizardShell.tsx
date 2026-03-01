"use client";

import { useState, useEffect, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Check, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { Alert, AlertDescription } from "@/components/ui/alert";

export interface WizardStep {
  id: string;
  titel: string;
  beschrijving?: string;
  content: ReactNode;
  isOptional?: boolean;
  /** When explicitly false, the "Next / Save" button is disabled for this step */
  canAdvance?: boolean;
}

interface WizardShellProps {
  titel: string;
  stappen: WizardStep[];
  onComplete: () => void | Promise<void>;
  onCancel?: () => void;
  /** Controlled step (for external progress management) */
  initialStep?: number;
  /** Callback when step changes (for external progress tracking) */
  onStepChange?: (step: number) => void;
  /** Show restored progress alert */
  wasRestored?: boolean;
  /** Callback to clear progress */
  onClearProgress?: () => void;
}

export function WizardShell({
  titel,
  stappen,
  onComplete,
  onCancel,
  initialStep = 0,
  onStepChange,
  wasRestored = false,
  onClearProgress,
}: WizardShellProps) {
  const t = useTranslations("wizard.shell");
  const [currentStep, setCurrentStepInternal] = useState(initialStep);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRestoredAlert, setShowRestoredAlert] = useState(wasRestored);

  // Sync with initialStep when it changes
  useEffect(() => {
    if (initialStep !== currentStep) {
      setCurrentStepInternal(initialStep);
    }
  }, [initialStep]);

  const setCurrentStep = (step: number) => {
    setCurrentStepInternal(step);
    onStepChange?.(step);
  };

  const isLastStep = currentStep === stappen.length - 1;
  const step = stappen[currentStep];

  const handleNext = async () => {
    if (isLastStep) {
      setCompleting(true);
      setError(null);
      try {
        await onComplete();
      } catch (err) {
        setError(err instanceof Error ? err.message : t("opslaanMislukt"));
      } finally {
        setCompleting(false);
      }
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleClearProgress = () => {
    onClearProgress?.();
    setCurrentStepInternal(0);
    setShowRestoredAlert(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">{titel}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {t("stap", { huidig: currentStep + 1, totaal: stappen.length, titel: step.titel })}
        </p>
      </div>

      {/* Restored progress alert */}
      {showRestoredAlert && initialStep > 0 && (
        <Alert variant="info" className="flex items-center justify-between">
          <AlertDescription>
            {t("voortgangHersteld", { stap: initialStep + 1 })}
          </AlertDescription>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearProgress}
            className="ml-4 gap-1"
          >
            <RotateCcw className="h-3 w-3" />
            {t("opnieuwBeginnen")}
          </Button>
        </Alert>
      )}

      {/* Progress bar */}
      <div className="flex gap-1">
        {stappen.map((s, i) => (
          <div
            key={s.id}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              i <= currentStep ? "bg-primary" : "bg-muted"
            )}
          />
        ))}
      </div>

      {/* Step labels */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {stappen.map((s, i) => (
          <button
            key={s.id}
            onClick={() => i < currentStep && setCurrentStep(i)}
            className={cn(
              "flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition-colors",
              i === currentStep
                ? "bg-primary text-primary-foreground"
                : i < currentStep
                ? "bg-muted text-foreground cursor-pointer hover:bg-muted/80"
                : "bg-muted/50 text-muted-foreground"
            )}
          >
            {i < currentStep && <Check className="h-3 w-3" />}
            {s.titel}
          </button>
        ))}
      </div>

      {/* Step content */}
      <div className="min-h-75">
        {step.beschrijving && (
          <p className="text-sm text-muted-foreground mb-4">{step.beschrijving}</p>
        )}
        {step.content}
      </div>

      {/* Error display */}
      {error && (
        <Alert variant="danger">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Navigation */}
      <div className="flex justify-between border-t border-border pt-4">
        <div>
          {onCancel && (
            <Button variant="ghost" onClick={onCancel}>
              {t("annuleren")}
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(currentStep - 1)}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {t("vorige")}
          </Button>
          <Button onClick={handleNext} disabled={completing || step.canAdvance === false}>
            {isLastStep ? (
              completing ? t("opslaanBezig") : t("opslaan")
            ) : (
              <>
                {t("volgende")}
                <ChevronRight className="h-4 w-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
