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
    <div className="relative">
      <select
        className={cn(
          "flex h-10 w-full appearance-none rounded-md border border-input bg-background px-3 py-2 pr-8 text-sm ring-offset-background transition-[border-color,box-shadow] duration-150 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
      <svg
        className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  );
});
Select.displayName = "Select";

export { Select };
