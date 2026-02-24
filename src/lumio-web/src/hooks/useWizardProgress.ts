"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

const WIZARD_PROGRESS_PREFIX = "lumio_wizard_progress_";

export interface WizardProgressState {
  currentStep: number;
  formData: Record<string, unknown>;
  lastUpdated: string;
}

interface UseWizardProgressOptions {
  /** Unique identifier for this wizard (e.g., "testament", "uitvaart") */
  wizardId: string;
  /** Total number of steps in the wizard */
  totalSteps: number;
  /** Initial form data (merged with persisted data if available) */
  initialFormData?: Record<string, unknown>;
  /** Auto-clear progress after completion (default: true) */
  clearOnComplete?: boolean;
}

interface UseWizardProgressReturn {
  /** Current step index (0-based) */
  currentStep: number;
  /** Set current step */
  setCurrentStep: (step: number) => void;
  /** Persisted form data */
  formData: Record<string, unknown>;
  /** Update form data (merges with existing) */
  updateFormData: (updates: Record<string, unknown>) => void;
  /** Whether progress was restored from localStorage */
  wasRestored: boolean;
  /** Clear all progress for this wizard */
  clearProgress: () => void;
  /** Mark wizard as complete (clears progress if clearOnComplete is true) */
  markComplete: () => void;
  /** Whether there is saved progress */
  hasSavedProgress: boolean;
}

/**
 * Load initial state from localStorage synchronously
 */
function loadInitialState(
  storageKey: string,
  totalSteps: number,
  initialFormData: Record<string, unknown>
): { state: WizardProgressState; wasRestored: boolean } {
  try {
    if (typeof window === "undefined") {
      return {
        state: { currentStep: 0, formData: initialFormData, lastUpdated: new Date().toISOString() },
        wasRestored: false,
      };
    }
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const parsed = JSON.parse(stored) as WizardProgressState;
      if (parsed.currentStep >= 0 && parsed.currentStep < totalSteps) {
        return {
          state: {
            currentStep: parsed.currentStep,
            formData: { ...initialFormData, ...parsed.formData },
            lastUpdated: parsed.lastUpdated,
          },
          wasRestored: true,
        };
      }
    }
  } catch {
    // Invalid JSON, ignore
  }
  return {
    state: { currentStep: 0, formData: initialFormData, lastUpdated: new Date().toISOString() },
    wasRestored: false,
  };
}

/**
 * Custom hook for persisting wizard progress to localStorage.
 * Enables users to return to where they left off after closing/refreshing.
 *
 * @example
 * ```tsx
 * const { currentStep, setCurrentStep, formData, updateFormData, markComplete } =
 *   useWizardProgress({
 *     wizardId: "testament",
 *     totalSteps: 5,
 *     initialFormData: { testamentType: "" },
 *   });
 * ```
 */
export function useWizardProgress({
  wizardId,
  totalSteps,
  initialFormData = {},
  clearOnComplete = true,
}: UseWizardProgressOptions): UseWizardProgressReturn {
  const storageKey = `${WIZARD_PROGRESS_PREFIX}${wizardId}`;

  // Initialize state lazily from localStorage
  const [{ state: initialState, wasRestored: initialWasRestored }] = useState(() =>
    loadInitialState(storageKey, totalSteps, initialFormData)
  );

  const [state, setState] = useState<WizardProgressState>(initialState);
  const [wasRestored] = useState(initialWasRestored);

  // Compute hasSavedProgress from state
  const hasSavedProgress = useMemo(() => {
    return state.currentStep > 0 || Object.keys(state.formData).some(
      key => state.formData[key] !== initialFormData[key]
    );
  }, [state, initialFormData]);

  // Persist to localStorage whenever state changes (use effect for side effect)
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        ...state,
        lastUpdated: new Date().toISOString(),
      }));
    } catch {
      // localStorage full or unavailable
    }
  }, [state, storageKey]);

  const setCurrentStep = useCallback((step: number) => {
    if (step >= 0 && step < totalSteps) {
      setState((prev) => ({
        ...prev,
        currentStep: step,
        lastUpdated: new Date().toISOString(),
      }));
    }
  }, [totalSteps]);

  const updateFormData = useCallback((updates: Record<string, unknown>) => {
    setState((prev) => ({
      ...prev,
      formData: { ...prev.formData, ...updates },
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  const clearProgress = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
    setState({
      currentStep: 0,
      formData: initialFormData,
      lastUpdated: new Date().toISOString(),
    });
  }, [storageKey, initialFormData]);

  const markComplete = useCallback(() => {
    if (clearOnComplete) {
      clearProgress();
    }
  }, [clearOnComplete, clearProgress]);

  return {
    currentStep: state.currentStep,
    setCurrentStep,
    formData: state.formData,
    updateFormData,
    wasRestored,
    clearProgress,
    markComplete,
    hasSavedProgress,
  };
}

/**
 * Utility to check if any wizard has saved progress
 */
export function getWizardsWithProgress(): string[] {
  const wizards: string[] = [];

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(WIZARD_PROGRESS_PREFIX)) {
        wizards.push(key.replace(WIZARD_PROGRESS_PREFIX, ""));
      }
    }
  } catch {
    // localStorage unavailable
  }

  return wizards;
}

/**
 * Utility to clear all wizard progress
 */
export function clearAllWizardProgress(): void {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(WIZARD_PROGRESS_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  } catch {
    // localStorage unavailable
  }
}
