import { cn } from "@/lib/utils";
import { forwardRef, type InputHTMLAttributes } from "react";

/**
 * Styled text input component with focus ring and disabled states.
 *
 * @example
 * // Basic usage
 * <Input placeholder="Enter your name" />
 *
 * @example
 * // With type and controlled value
 * <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
 *
 * @example
 * // Disabled state
 * <Input disabled placeholder="Cannot edit" />
 */
const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
