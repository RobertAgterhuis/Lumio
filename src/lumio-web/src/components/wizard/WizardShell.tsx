"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

export interface WizardStep {
  id: string;
  titel: string;
  beschrijving?: string;
  content: ReactNode;
  isOptional?: boolean;
}

interface WizardShellProps {
  titel: string;
  stappen: WizardStep[];
  onComplete: () => void | Promise<void>;
  onCancel?: () => void;
}

export function WizardShell({ titel, stappen, onComplete, onCancel }: WizardShellProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLastStep = currentStep === stappen.length - 1;
  const step = stappen[currentStep];

  const handleNext = async () => {
    if (isLastStep) {
      setCompleting(true);
      setError(null);
      try {
        await onComplete();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Opslaan mislukt.");
      } finally {
        setCompleting(false);
      }
    } else {
      setCurrentStep((s) => s + 1);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">{titel}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Stap {currentStep + 1} van {stappen.length}: {step.titel}
        </p>
      </div>

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
      <div className="min-h-[300px]">
        {step.beschrijving && (
          <p className="text-sm text-muted-foreground mb-4">{step.beschrijving}</p>
        )}
        {step.content}
      </div>

      {/* Error display */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between border-t border-border pt-4">
        <div>
          {onCancel && (
            <Button variant="ghost" onClick={onCancel}>
              Annuleren
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentStep((s) => s - 1)}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Vorige
          </Button>
          <Button onClick={handleNext} disabled={completing}>
            {isLastStep ? (
              completing ? "Opslaan..." : "Opslaan"
            ) : (
              <>
                Volgende
                <ChevronRight className="h-4 w-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
