import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Shield, ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";

const statusVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
  {
    variants: {
      status: {
        secure: "bg-success-100 text-success",
        warning: "bg-warning-100 text-warning",
        critical: "bg-danger-100 text-danger",
        unknown: "bg-muted text-muted-foreground",
      },
    },
    defaultVariants: { status: "unknown" },
  }
);

const statusIcons = {
  secure: ShieldCheck,
  warning: ShieldAlert,
  critical: ShieldX,
  unknown: Shield,
} as const;

export interface SecurityStatusIndicatorProps
  extends VariantProps<typeof statusVariants> {
  /** Text label to display */
  label: string;
  /** Additional className */
  className?: string;
}

export function SecurityStatusIndicator({
  status = "unknown",
  label,
  className,
}: SecurityStatusIndicatorProps) {
  const Icon = statusIcons[status ?? "unknown"];

  return (
    <span className={cn(statusVariants({ status }), className)}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
    </span>
  );
}
