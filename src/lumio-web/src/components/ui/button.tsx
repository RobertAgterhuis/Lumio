import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { Slot } from "@radix-ui/react-slot";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground hover:scale-[1.02] active:scale-[0.98]",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:scale-[1.02] active:scale-[0.98]",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /**
   * Show a loading spinner and disable the button.
   * The button content is hidden but preserved to maintain width.
   */
  loading?: boolean;

  /**
   * When true, renders the child element directly with button styles applied
   * instead of wrapping in a `<button>`. Useful for rendering links styled as buttons.
   *
   * @example
   * // Render a Next.js Link styled as a button
   * <Button asChild>
   *   <Link href="/dashboard">Go to Dashboard</Link>
   * </Button>
   *
   * @default false
   */
  asChild?: boolean;
}

/**
 * Button component with variant styles, loading state, and polymorphic rendering.
 *
 * @example
 * // Default button
 * <Button>Click me</Button>
 *
 * @example
 * // Destructive variant with loading
 * <Button variant="destructive" loading>Deleting...</Button>
 *
 * @example
 * // Link styled as a button (polymorphic)
 * <Button asChild variant="outline">
 *   <a href="/external">External Link</a>
 * </Button>
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, disabled, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    // When asChild is true, we don't render the loading wrapper
    // as the child element handles its own content
    if (asChild) {
      return (
        <Comp
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </Comp>
      );
    }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }), "relative")}
        ref={ref as React.Ref<HTMLButtonElement>}
        disabled={disabled || loading}
        {...props}
      >
        {/* Content - hide when loading but keep for width */}
        <span className={cn("inline-flex items-center gap-2", loading && "invisible")}>
          {children}
        </span>
        {/* Loading spinner - absolutely positioned to center */}
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center animate-in fade-in-0 duration-150">
            <Loader2 className="h-4 w-4 animate-spin" />
          </span>
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
