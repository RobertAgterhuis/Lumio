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
          "peer h-4 w-4 shrink-0 appearance-none rounded border border-border bg-background",
          "checked:border-primary checked:bg-primary",
          "checked:bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%20fill%3D%22white%22%3E%3Cpath%20d%3D%22M12.207%204.793a1%201%200%20010%201.414l-5%205a1%201%200%2001-1.414%200l-2-2a1%201%200%20011.414-1.414L6.5%209.086l4.293-4.293a1%201%200%20011.414%200z%22%2F%3E%3C%2Fsvg%3E')]",
          "transition-all duration-150",
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
