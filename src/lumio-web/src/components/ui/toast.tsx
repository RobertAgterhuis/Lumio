"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { X, CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";

const toastVariants = cva(
  "pointer-events-auto relative flex w-full items-start gap-3 rounded-lg border p-4 pr-10 shadow-lg transition-all",
  {
    variants: {
      variant: {
        success:
          "border-success-100 bg-success-100/95 text-success dark:border-success-100 dark:bg-success-100/95",
        error:
          "border-danger-100 bg-danger-100/95 text-danger dark:border-danger-100 dark:bg-danger-100/95",
        warning:
          "border-warning-100 bg-warning-100/95 text-warning dark:border-warning-100 dark:bg-warning-100/95",
        info: "border-info-100 bg-info-100/95 text-info dark:border-info-100 dark:bg-info-100/95",
      },
    },
    defaultVariants: { variant: "info" },
  }
);

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
} as const;

export interface ToastProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toastVariants> {
  /** Toast ID for removal */
  toastId: string;
  /** Message to display */
  message: string;
  /** Auto-dismiss duration in ms (default: 5000, 0 = no auto-dismiss) */
  duration?: number;
  /** Callback when toast is dismissed */
  onDismiss: (id: string) => void;
}

export function Toast({
  className,
  variant = "info",
  toastId,
  message,
  duration = 5000,
  onDismiss,
  ...props
}: ToastProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const IconComponent = toastIcons[variant ?? "info"];

  useEffect(() => {
    if (duration > 0) {
      timerRef.current = setTimeout(() => {
        onDismiss(toastId);
      }, duration);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [toastId, duration, onDismiss]);

  return (
    <div
      role={variant === "error" || variant === "warning" ? "alert" : "status"}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    >
      <IconComponent className="h-5 w-5 shrink-0 mt-0.5" aria-hidden="true" />
      <p className="text-sm font-medium flex-1">{message}</p>
      <button
        type="button"
        onClick={() => onDismiss(toastId)}
        className="absolute right-2 top-2 rounded-md p-1 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
