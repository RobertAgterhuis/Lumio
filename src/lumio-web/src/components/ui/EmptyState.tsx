"use client";

import type { ReactNode } from "react";
import { type LucideIcon, Package } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";
import { LumioIcon, type LumioIconName } from "@/components/ui/lumio-icon";

export interface EmptyStateProps {
  /** Lucide icon to display (defaults to Package) */
  icon?: LucideIcon;
  /** LumioIcon name — preferred for domain-specific empty states */
  lumioIcon?: LumioIconName;
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
  lumioIcon,
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
        "flex flex-col items-center justify-center py-12 px-4 text-center rounded-xl bg-linear-to-b from-muted/40 to-transparent animate-in fade-in-50 zoom-in-95 duration-300",
        className
      )}
      role="status"
      aria-live="polite"
    >
      {lumioIcon ? (
        <div className="mb-4 rounded-full bg-primary-50 p-4 ring-1 ring-primary/10">
          <LumioIcon
            name={lumioIcon}
            size="xl"
            className="text-primary-400"
          />
        </div>
      ) : (
        <div className="mb-4 rounded-full bg-primary-50 p-4 ring-1 ring-primary/10">
          <Icon
            className="h-12 w-12 text-primary-400"
            aria-hidden="true"
          />
        </div>
      )}
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
