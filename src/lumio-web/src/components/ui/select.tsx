import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Native select dropdown component with consistent styling.
 *
 * @example
 * // Basic usage
 * <Select value={country} onChange={(e) => setCountry(e.target.value)}>
 *   <option value="">Select a country</option>
 *   <option value="nl">Netherlands</option>
 *   <option value="be">Belgium</option>
 * </Select>
 *
 * @example
 * // Disabled state
 * <Select disabled>
 *   <option>Cannot change</option>
 * </Select>
 */
const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => {
  return (
    <select
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </select>
  );
});
Select.displayName = "Select";

export { Select };
