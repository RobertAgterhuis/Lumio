import { cn } from "@/lib/utils";
import { forwardRef, type HTMLAttributes } from "react";

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  /** Current value (0–100) */
  value?: number;
  /** Maximum value (default 100) */
  max?: number;
  /** Optional label displayed above the bar */
  label?: string;
  /** Show percentage text */
  showValue?: boolean;
}

const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, label, showValue, ...props }, ref) => {
    const percent = Math.min(100, Math.max(0, (value / max) * 100));

    return (
      <div ref={ref} className={cn("w-full", className)} {...props}>
        {(label || showValue) && (
          <div className="mb-1 flex items-center justify-between text-sm">
            {label && (
              <span className="font-medium text-foreground">{label}</span>
            )}
            {showValue && (
              <span className="text-muted-foreground">
                {Math.round(percent)}%
              </span>
            )}
          </div>
        )}
        <div
          className="relative h-2 w-full overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={label}
        >
          <div
            className="h-full rounded-full bg-primary transition-all duration-300 ease-in-out"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    );
  }
);
Progress.displayName = "Progress";

export { Progress };
