"use client";

import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LumioIcon } from "@/components/ui/lumio-icon";
import type { ReactNode } from "react";

export interface ReadOnlyModeWrapperProps {
  /** Whether read-only mode is active */
  isReadOnly: boolean;
  /** The content to wrap */
  children: ReactNode;
  /** Optional banner message */
  message?: string;
  /** Additional className for the wrapper */
  className?: string;
  /** Whether to show the banner (default: true) */
  showBanner?: boolean;
}

/**
 * Wraps content in a read-only treatment when heir/read-only mode is active.
 * Disables pointer events on children and shows an optional banner.
 */
export function ReadOnlyModeWrapper({
  isReadOnly,
  children,
  message = "U bekijkt deze gegevens in alleen-lezen modus.",
  className,
  showBanner = true,
}: ReadOnlyModeWrapperProps) {
  if (!isReadOnly) {
    return <>{children}</>;
  }

  return (
    <div className={cn("relative", className)}>
      {showBanner && (
        <Alert variant="warning" className="mb-4">
          <AlertDescription>
            <LumioIcon name="shield-alert" size="sm" className="mr-2 inline" />
            {message}
          </AlertDescription>
        </Alert>
      )}
      <div
        className="pointer-events-none select-none opacity-80 transition-opacity duration-300"
        aria-disabled="true"
        // @ts-expect-error -- inert is a valid HTML attribute but React types lag behind
        inert=""
      >
        {children}
      </div>
    </div>
  );
}
