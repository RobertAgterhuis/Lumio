"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface DialogContextValue {
  titleId: string;
  descriptionId: string;
}

const DialogContext = React.createContext<DialogContextValue | null>(null);

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  const titleId = React.useId();
  const descriptionId = React.useId();
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const previousActiveElement = React.useRef<Element | null>(null);
  // Store onOpenChange in a ref to avoid re-running focus effect when callback changes
  const onOpenChangeRef = React.useRef(onOpenChange);
  // eslint-disable-next-line react-hooks/refs -- intentional ref update during render to track latest callback
  onOpenChangeRef.current = onOpenChange;

  // Animation state: keep mounted during exit animation
  const [mounted, setMounted] = React.useState(false);
  const [animating, setAnimating] = React.useState(false);

  // Handle mount/unmount with animation
  React.useEffect(() => {
    if (open) {
      setMounted(true);
      // Trigger enter animation on next frame
      requestAnimationFrame(() => setAnimating(true));
    } else if (mounted) {
      // Trigger exit animation
      setAnimating(false);
      // Wait for animation to complete before unmounting
      const timer = setTimeout(() => setMounted(false), 200);
      return () => clearTimeout(timer);
    }
  }, [open, mounted]);

  // Save the element that had focus before the dialog opened
  React.useEffect(() => {
    if (open) {
      previousActiveElement.current = document.activeElement;
    }
  }, [open]);

  // Focus trap: focus first focusable element on open, return focus on close
  React.useEffect(() => {
    if (!open) return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    const focusableSelector =
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

    // Focus the first focusable element inside the dialog
    const firstFocusable = dialog.querySelector<HTMLElement>(focusableSelector);
    firstFocusable?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChangeRef.current(false);
        return;
      }

      if (e.key !== "Tab") return;

      const focusableElements = dialog.querySelectorAll<HTMLElement>(focusableSelector);
      if (focusableElements.length === 0) return;

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      // Return focus to the element that was focused before the dialog opened
      if (previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus();
      }
    };
  }, [open]);

  if (!mounted) return null;

  return (
    <DialogContext value={{ titleId, descriptionId }}>
      <div className="fixed inset-0 z-50">
        {/* Backdrop with fade animation */}
        <div
          className={cn(
            "fixed inset-0 bg-black/50 backdrop-blur-md transition-opacity duration-200",
            animating ? "opacity-100" : "opacity-0"
          )}
        />
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          onClick={() => onOpenChange(false)}
        >
          {/* Dialog content with scale + fade animation */}
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            className={cn(
              "relative z-50 w-full max-w-lg rounded-lg border bg-background p-6 shadow-xl",
              "flex flex-col max-h-[90vh] overflow-hidden",
              "transition-all duration-200 ease-out",
              animating
                ? "opacity-100 scale-100"
                : "opacity-0 scale-95"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </div>
        </div>
      </div>
    </DialogContext>
  );
}

export function DialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}
      {...props}
    />
  );
}

export function DialogTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  const ctx = React.use(DialogContext);
  return (
    <h2
      id={ctx?.titleId}
      className={cn("text-lg font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  );
}

export function DialogDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  const ctx = React.use(DialogContext);
  return (
    <p
      id={ctx?.descriptionId}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export function DialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4", className)}
      {...props}
    />
  );
}
