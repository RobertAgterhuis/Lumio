"use client";

import {
  createContext,
  forwardRef,
  useContext,
  useId,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type LabelHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

/**
 * Context for FormField — provides unique IDs for accessibility attributes.
 */
interface FormFieldContextValue {
  /** Unique ID for the input element */
  inputId: string;
  /** ID for error message element (for aria-describedby) */
  errorId: string;
  /** ID for helper text element (for aria-describedby) */
  helperId: string;
  /** Error message, if any */
  error?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Whether the field is disabled */
  disabled?: boolean;
}

const FormFieldContext = createContext<FormFieldContextValue | null>(null);

function useFormFieldContext() {
  const ctx = useContext(FormFieldContext);
  if (!ctx) {
    throw new globalThis.Error("FormField components must be used within a FormField.Root");
  }
  return ctx;
}

// ─────────────────────────────────────────────────────────────────────────────
// FormField.Root
// ─────────────────────────────────────────────────────────────────────────────

export interface FormFieldRootProps extends HTMLAttributes<HTMLDivElement> {
  /** Error message to display */
  error?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Whether the field is disabled */
  disabled?: boolean;
  children: ReactNode;
}

/**
 * Root container for a form field. Provides context for label, input, error, and helper.
 *
 * @example
 * ```tsx
 * <FormField.Root error={errors.email?.message} required>
 *   <FormField.Label>Email</FormField.Label>
 *   <FormField.Input type="email" {...register("email")} />
 *   <FormField.Helper>We'll never share your email.</FormField.Helper>
 *   <FormField.Error />
 * </FormField.Root>
 * ```
 */
const Root = forwardRef<HTMLDivElement, FormFieldRootProps>(
  ({ error, required, disabled, className, children, ...props }, ref) => {
    const id = useId();
    const inputId = `${id}-input`;
    const errorId = `${id}-error`;
    const helperId = `${id}-helper`;

    return (
      <FormFieldContext.Provider
        value={{ inputId, errorId, helperId, error, required, disabled }}
      >
        <div ref={ref} className={cn("space-y-2", className)} {...props}>
          {children}
        </div>
      </FormFieldContext.Provider>
    );
  }
);
Root.displayName = "FormField.Root";

// ─────────────────────────────────────────────────────────────────────────────
// FormField.Label
// ─────────────────────────────────────────────────────────────────────────────

export interface FormFieldLabelProps
  extends LabelHTMLAttributes<HTMLLabelElement> {
  /** Hide the required indicator even if field is required */
  hideRequired?: boolean;
}

/**
 * Label for the form field. Automatically sets `htmlFor` and shows required indicator.
 */
const Label = forwardRef<HTMLLabelElement, FormFieldLabelProps>(
  ({ className, children, hideRequired, ...props }, ref) => {
    const { inputId, required, disabled } = useFormFieldContext();

    return (
      <label
        ref={ref}
        htmlFor={inputId}
        className={cn(
          "text-sm font-medium leading-none",
          disabled && "cursor-not-allowed opacity-70",
          className
        )}
        {...props}
      >
        {children}
        {required && !hideRequired && (
          <span className="ml-1 text-destructive" aria-hidden="true">
            *
          </span>
        )}
      </label>
    );
  }
);
Label.displayName = "FormField.Label";

// ─────────────────────────────────────────────────────────────────────────────
// FormField.Input
// ─────────────────────────────────────────────────────────────────────────────

export interface FormFieldInputProps
  extends InputHTMLAttributes<HTMLInputElement> {}

/**
 * Input element for the form field. Automatically sets accessibility attributes.
 */
const Input = forwardRef<HTMLInputElement, FormFieldInputProps>(
  ({ className, ...props }, ref) => {
    const { inputId, errorId, helperId, error, required, disabled } =
      useFormFieldContext();

    // Build aria-describedby from available elements
    const describedBy = [error && errorId, helperId]
      .filter(Boolean)
      .join(" ") || undefined;

    return (
      <input
        ref={ref}
        id={inputId}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={describedBy}
        aria-required={required}
        disabled={disabled}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-destructive focus-visible:ring-destructive",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "FormField.Input";

// ─────────────────────────────────────────────────────────────────────────────
// FormField.Textarea
// ─────────────────────────────────────────────────────────────────────────────

export interface FormFieldTextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

/**
 * Textarea element for the form field. Automatically sets accessibility attributes.
 */
const Textarea = forwardRef<HTMLTextAreaElement, FormFieldTextareaProps>(
  ({ className, ...props }, ref) => {
    const { inputId, errorId, helperId, error, required, disabled } =
      useFormFieldContext();

    const describedBy = [error && errorId, helperId]
      .filter(Boolean)
      .join(" ") || undefined;

    return (
      <textarea
        ref={ref}
        id={inputId}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={describedBy}
        aria-required={required}
        disabled={disabled}
        className={cn(
          "flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-destructive focus-visible:ring-destructive",
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = "FormField.Textarea";

// ─────────────────────────────────────────────────────────────────────────────
// FormField.Select
// ─────────────────────────────────────────────────────────────────────────────

export interface FormFieldSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {}

/**
 * Select element for the form field. Automatically sets accessibility attributes.
 */
const Select = forwardRef<HTMLSelectElement, FormFieldSelectProps>(
  ({ className, children, ...props }, ref) => {
    const { inputId, errorId, helperId, error, required, disabled } =
      useFormFieldContext();

    const describedBy = [error && errorId, helperId]
      .filter(Boolean)
      .join(" ") || undefined;

    return (
      <select
        ref={ref}
        id={inputId}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={describedBy}
        aria-required={required}
        disabled={disabled}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-destructive focus-visible:ring-destructive",
          className
        )}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = "FormField.Select";

// ─────────────────────────────────────────────────────────────────────────────
// FormField.Helper
// ─────────────────────────────────────────────────────────────────────────────

export interface FormFieldHelperProps extends HTMLAttributes<HTMLParagraphElement> {}

/**
 * Helper text for the form field. Provides additional context or instructions.
 */
const Helper = forwardRef<HTMLParagraphElement, FormFieldHelperProps>(
  ({ className, children, ...props }, ref) => {
    const { helperId } = useFormFieldContext();

    if (!children) return null;

    return (
      <p
        ref={ref}
        id={helperId}
        className={cn("text-xs text-muted-foreground", className)}
        {...props}
      >
        {children}
      </p>
    );
  }
);
Helper.displayName = "FormField.Helper";

// ─────────────────────────────────────────────────────────────────────────────
// FormField.Error
// ─────────────────────────────────────────────────────────────────────────────

export interface FormFieldErrorProps extends HTMLAttributes<HTMLParagraphElement> {
  /** Override the error message from context */
  children?: ReactNode;
}

/**
 * Error message for the form field. Displays when there's a validation error.
 */
const Error = forwardRef<HTMLParagraphElement, FormFieldErrorProps>(
  ({ className, children, ...props }, ref) => {
    const { errorId, error } = useFormFieldContext();
    const message = children ?? error;

    if (!message) return null;

    return (
      <p
        ref={ref}
        id={errorId}
        role="alert"
        className={cn("text-sm text-destructive", className)}
        {...props}
      >
        {message}
      </p>
    );
  }
);
Error.displayName = "FormField.Error";

// ─────────────────────────────────────────────────────────────────────────────
// Export as namespace
// ─────────────────────────────────────────────────────────────────────────────

/**
 * FormField compound component for accessible form inputs.
 *
 * Provides automatic:
 * - `htmlFor` / `id` association between label and input
 * - `aria-invalid` on inputs when there's an error
 * - `aria-describedby` linking input to error and helper text
 * - `aria-required` on required fields
 * - Required indicator (*) on labels
 * - Error styling on inputs
 *
 * @example
 * ```tsx
 * // With react-hook-form
 * <FormField.Root error={errors.email?.message} required>
 *   <FormField.Label>Email</FormField.Label>
 *   <FormField.Input type="email" {...register("email")} />
 *   <FormField.Helper>We'll never share your email.</FormField.Helper>
 *   <FormField.Error />
 * </FormField.Root>
 *
 * // Standalone
 * <FormField.Root error={error} required>
 *   <FormField.Label>Username</FormField.Label>
 *   <FormField.Input value={value} onChange={onChange} />
 *   <FormField.Error />
 * </FormField.Root>
 * ```
 */
export const FormField = {
  Root,
  Label,
  Input,
  Textarea,
  Select,
  Helper,
  Error,
};
