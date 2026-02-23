import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type HTMLAttributes } from "react";
import {
  AlertTriangle,
  CheckCircle,
  Info,
  XCircle,
  Shield,
} from "lucide-react";

const alertVariants = cva(
  "relative flex items-start gap-3 rounded-lg border p-4 text-sm transition-colors [&>svg]:shrink-0 [&>svg]:mt-0.5",
  {
    variants: {
      variant: {
        info: "border-info-100 bg-info-100/40 text-info [&>svg]:text-info dark:border-info-100 dark:bg-info-100/40 dark:text-info",
        success:
          "border-success-100 bg-success-100/40 text-success [&>svg]:text-success dark:border-success-100 dark:bg-success-100/40 dark:text-success",
        warning:
          "border-warning-100 bg-warning-100/40 text-warning [&>svg]:text-warning dark:border-warning-100 dark:bg-warning-100/40 dark:text-warning",
        danger:
          "border-danger-100 bg-danger-100/40 text-danger [&>svg]:text-danger dark:border-danger-100 dark:bg-danger-100/40 dark:text-danger",
        security:
          "border-secure-100 bg-secure-100/40 text-secure [&>svg]:text-secure dark:border-secure-100 dark:bg-secure-100/40 dark:text-secure",
      },
    },
    defaultVariants: { variant: "info" },
  }
);

const alertIcons = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  danger: XCircle,
  security: Shield,
} as const;

export interface AlertProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  /** Override the default icon for the variant */
  icon?: React.ReactNode;
  /** Hide the icon entirely */
  hideIcon?: boolean;
}

const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "info", icon, hideIcon, children, ...props }, ref) => {
    const IconComponent = alertIcons[variant ?? "info"];

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ variant }), className)}
        {...props}
      >
        {!hideIcon &&
          (icon ?? <IconComponent className="h-4 w-4" aria-hidden="true" />)}
        <div className="flex-1">{children}</div>
      </div>
    );
  }
);
Alert.displayName = "Alert";

const AlertTitle = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("font-semibold leading-tight", className)}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm leading-relaxed opacity-90", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription, alertVariants };
