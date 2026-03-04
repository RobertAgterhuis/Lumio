import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { LumioIcon, type LumioIconName } from "@/components/ui/lumio-icon";

const statusVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-all",
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

const statusIcons: Record<NonNullable<VariantProps<typeof statusVariants>["status"]>, LumioIconName> = {
  secure: "shield-check",
  warning: "shield-alert",
  critical: "shield-x",
  unknown: "shield",
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
  const iconName = statusIcons[status ?? "unknown"];

  return (
    <span className={cn(statusVariants({ status }), className)}>
      <LumioIcon name={iconName} size="sm" aria-hidden={true} />
      {label}
    </span>
  );
}
