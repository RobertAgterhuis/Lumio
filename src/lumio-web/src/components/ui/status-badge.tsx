import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { CheckCircle, AlertTriangle, Clock, Info, XCircle, Minus } from "lucide-react";

/**
 * StatusBadge - A semantic badge component for displaying status indicators.
 * Uses design system tokens to ensure consistent styling across the app.
 *
 * Status variants:
 * - complete/success: Indicates completion or positive status (green)
 * - warning/attention: Indicates items needing attention (amber/yellow)
 * - info/pending: Indicates informational or in-progress status (blue)
 * - error/danger: Indicates errors or critical issues (red)
 * - inactive/neutral: Indicates inactive or not started status (gray)
 */
const statusBadgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      status: {
        // Success/Complete - green semantic colors
        complete: "border-transparent bg-success-100 text-success dark:bg-success/20 dark:text-success",
        success: "border-transparent bg-success-100 text-success dark:bg-success/20 dark:text-success",

        // Warning/Attention - amber/yellow semantic colors
        warning: "border-transparent bg-warning-100 text-warning dark:bg-warning/20 dark:text-warning",
        attention: "border-transparent bg-warning-100 text-warning dark:bg-warning/20 dark:text-warning",

        // Info/Pending - blue semantic colors
        info: "border-transparent bg-info-100 text-info dark:bg-info/20 dark:text-info",
        pending: "border-transparent bg-info-100 text-info dark:bg-info/20 dark:text-info",

        // Error/Danger - red semantic colors
        error: "border-transparent bg-danger-100 text-danger dark:bg-danger/20 dark:text-danger",
        danger: "border-transparent bg-danger-100 text-danger dark:bg-danger/20 dark:text-danger",

        // Inactive/Neutral - gray/muted colors
        inactive: "border-transparent bg-muted text-muted-foreground",
        neutral: "border-transparent bg-muted text-muted-foreground",
      },
      showIcon: {
        true: "",
        false: "",
      },
    },
    defaultVariants: {
      status: "neutral",
      showIcon: false,
    },
  }
);

const statusIcons = {
  complete: CheckCircle,
  success: CheckCircle,
  warning: AlertTriangle,
  attention: AlertTriangle,
  info: Info,
  pending: Clock,
  error: XCircle,
  danger: XCircle,
  inactive: Minus,
  neutral: null,
} as const;

interface StatusBadgeProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusBadgeVariants> {
  /** Whether to show the status icon */
  showIcon?: boolean;
}

function StatusBadge({
  className,
  status,
  showIcon = false,
  children,
  ...props
}: StatusBadgeProps) {
  const IconComponent = status ? statusIcons[status] : null;

  return (
    <div className={cn(statusBadgeVariants({ status, showIcon }), className)} {...props}>
      {showIcon && IconComponent && <IconComponent className="h-3 w-3" />}
      {children}
    </div>
  );
}

export { StatusBadge, statusBadgeVariants };
export type { StatusBadgeProps };
