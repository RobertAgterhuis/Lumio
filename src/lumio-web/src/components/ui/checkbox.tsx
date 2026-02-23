import { cn } from "@/lib/utils";
import { forwardRef, type InputHTMLAttributes, useId } from "react";

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** Label text displayed next to the checkbox */
  label?: string;
  /** Optional description text below the label */
  description?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, id: propId, ...props }, ref) => {
    const autoId = useId();
    const id = propId ?? autoId;

    const input = (
      <input
        type="checkbox"
        id={id}
        ref={ref}
        className={cn(
          "h-4 w-4 shrink-0 rounded border-border text-primary accent-primary",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    );

    if (!label) return input;

    return (
      <div className="flex items-start space-x-2">
        {input}
        <div className="grid gap-0.5 leading-none">
          <label
            htmlFor={id}
            className="text-sm font-medium leading-tight peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
          </label>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
