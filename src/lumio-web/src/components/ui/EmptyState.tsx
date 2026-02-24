"use client";

import type { ReactNode } from "react";
import { type LucideIcon, Package } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  /** Icon to display (defaults to Package) */
  icon?: LucideIcon;
  /** Main title/message */
  title: string;
  /** Optional description providing more context */
  description?: string;
  /** CTA button label */
  ctaLabel?: string;
  /** CTA click handler */
  onCtaClick?: () => void;
  /** Optional additional content */
  children?: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * EmptyState - A consistent empty state component with icon, guidance text, and CTA.
 *
 * Usage:
 * ```tsx
 * <EmptyState
 *   icon={Users}
 *   title="Nog geen erfgenamen"
 *   description="Voeg erfgenamen toe om uw nalatenschap te verdelen"
 *   ctaLabel="Erfgenaam toevoegen"
 *   onCtaClick={() => openDialog()}
 * />
 * ```
 */
export function EmptyState({
  icon: Icon = Package,
  title,
  description,
  ctaLabel,
  onCtaClick,
  children,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <Icon
        className="h-12 w-12 text-muted-foreground mb-4"
        aria-hidden="true"
      />
      <p className="text-base font-medium text-foreground mb-1">{title}</p>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-4">
          {description}
        </p>
      )}
      {ctaLabel && onCtaClick && (
        <Button onClick={onCtaClick} className="mt-2">
          {ctaLabel}
        </Button>
      )}
      {children}
    </div>
  );
}
