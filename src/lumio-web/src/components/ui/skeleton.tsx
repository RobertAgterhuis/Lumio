import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Variant determines the animation style.
   * - `pulse`: Default subtle opacity animation
   * - `shimmer`: Gradient sweep animation
   * @default "pulse"
   */
  variant?: "pulse" | "shimmer";

  /**
   * Pre-defined shape presets for common use cases.
   * - `line`: Full-width text placeholder
   * - `circle`: Avatar/icon placeholder
   * - `card`: Card content placeholder
   * - `button`: Button-sized rectangle
   */
  shape?: "line" | "circle" | "card" | "button";
}

/**
 * Skeleton loading placeholder component.
 *
 * Use to indicate content loading state while maintaining layout stability.
 * Inherits dimensions from parent or uses shape presets.
 *
 * @example
 * // Basic skeleton with custom size
 * <Skeleton className="h-4 w-32" />
 *
 * @example
 * // Text line placeholder
 * <Skeleton shape="line" />
 *
 * @example
 * // Avatar placeholder
 * <Skeleton shape="circle" className="h-10 w-10" />
 *
 * @example
 * // Card content loading state
 * <Card>
 *   <CardContent className="space-y-3">
 *     <Skeleton shape="line" className="w-3/4" />
 *     <Skeleton shape="line" />
 *     <Skeleton shape="line" className="w-1/2" />
 *   </CardContent>
 * </Card>
 */
export function Skeleton({
  className,
  variant = "pulse",
  shape,
  ...props
}: SkeletonProps) {
  const shapeStyles = {
    line: "h-4 w-full rounded",
    circle: "rounded-full aspect-square",
    card: "h-24 w-full rounded-lg",
    button: "h-10 w-24 rounded-md",
  };

  return (
    <div
      className={cn(
        "bg-muted",
        variant === "pulse" && "animate-pulse",
        variant === "shimmer" && "animate-shimmer bg-linear-to-r from-muted via-muted-foreground/10 to-muted bg-size-[200%_100%]",
        shape && shapeStyles[shape],
        className
      )}
      {...props}
    />
  );
}

/**
 * Pre-composed skeleton for text content loading.
 * Renders multiple lines with varying widths.
 *
 * @example
 * <SkeletonText lines={3} />
 */
export function SkeletonText({
  lines = 3,
  className,
}: {
  /** Number of text lines to render */
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          shape="line"
          className={cn(
            // Last line is shorter for natural text appearance
            i === lines - 1 && "w-3/4"
          )}
        />
      ))}
    </div>
  );
}

/**
 * Pre-composed skeleton for avatar with text (e.g., user cards).
 *
 * @example
 * <SkeletonAvatar />
 */
export function SkeletonAvatar({
  size = "md",
  showText = true,
  className,
}: {
  /** Avatar size preset */
  size?: "sm" | "md" | "lg";
  /** Show text lines next to avatar */
  showText?: boolean;
  className?: string;
}) {
  const avatarSizes = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Skeleton shape="circle" className={avatarSizes[size]} />
      {showText && (
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      )}
    </div>
  );
}

/**
 * Pre-composed skeleton for card content.
 *
 * @example
 * <Card>
 *   <SkeletonCard />
 * </Card>
 */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("p-4 space-y-4", className)}>
      <div className="flex items-center gap-3">
        <Skeleton shape="circle" className="h-10 w-10" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <SkeletonText lines={2} />
      <div className="flex gap-2">
        <Skeleton shape="button" />
        <Skeleton shape="button" className="w-20" />
      </div>
    </div>
  );
}

/**
 * Full-page loading skeleton that mimics a typical domain page layout.
 * Shows a heading placeholder, description, and card placeholders.
 *
 * @example
 * if (loading) return <PageSkeleton />;
 */
export function PageSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-6 animate-in fade-in-50 duration-300", className)}>
      {/* Heading area */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Skeleton shape="circle" className="h-8 w-8" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>

      {/* Status bar placeholder */}
      <Skeleton className="h-10 w-full rounded-lg" />

      {/* Content cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border bg-card p-5 space-y-3">
          <Skeleton className="h-5 w-32" />
          <SkeletonText lines={3} />
        </div>
        <div className="rounded-lg border bg-card p-5 space-y-3">
          <Skeleton className="h-5 w-24" />
          <SkeletonText lines={3} />
        </div>
      </div>
    </div>
  );
}
