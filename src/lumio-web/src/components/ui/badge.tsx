import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground",
        success: "border-transparent bg-success text-white",
        warning: "border-transparent bg-warning text-white",
        security: "border-transparent bg-secure text-white",
        info: "border-transparent bg-info text-white",
        danger: "border-transparent bg-danger text-white",
        "soft-success": "border-success/20 bg-success/10 text-success",
        "soft-warning": "border-warning/20 bg-warning/10 text-warning",
        "soft-danger": "border-danger/20 bg-danger/10 text-danger",
        "soft-info": "border-info/20 bg-info/10 text-info",
        "soft-primary": "border-primary/20 bg-primary/10 text-primary",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

/**
 * Small status indicator badge with semantic color variants.
 *
 * @example
 * // Default badge
 * <Badge>New</Badge>
 *
 * @example
 * // Semantic variants
 * <Badge variant="success">Completed</Badge>
 * <Badge variant="warning">Pending</Badge>
 * <Badge variant="danger">Failed</Badge>
 *
 * @example
 * // Outline variant
 * <Badge variant="outline">Draft</Badge>
 */
function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
