"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

export interface SecureValueRevealProps {
  /** The sensitive value to display when revealed */
  value: string;
  /** Masked placeholder text (default: "••••••••") */
  maskedText?: string;
  /** Auto-hide timeout in milliseconds (default: 10000 = 10s, 0 = never) */
  autoHideMs?: number;
  /** Additional class names */
  className?: string;
  /** Accessible label for the toggle button */
  toggleLabel?: string;
}

export function SecureValueReveal({
  value,
  maskedText = "••••••••",
  autoHideMs = 10000,
  className,
  toggleLabel = "Toon/verberg waarde",
}: SecureValueRevealProps) {
  const [visible, setVisible] = useState(false);

  const hide = useCallback(() => setVisible(false), []);

  useEffect(() => {
    if (!visible || autoHideMs <= 0) return;
    const timer = setTimeout(hide, autoHideMs);
    return () => clearTimeout(timer);
  }, [visible, autoHideMs, hide]);

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <span
        className={cn(
          "font-mono text-sm transition-opacity duration-200",
          visible ? "text-foreground" : "text-muted-foreground select-none"
        )}
        aria-live="polite"
      >
        {visible ? (
          <span className="animate-[fadeSlideIn_150ms_ease-out_both]">{value}</span>
        ) : (
          maskedText
        )}
      </span>
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={toggleLabel}
      >
        {visible ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
