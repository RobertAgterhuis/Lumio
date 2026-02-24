import { type LucideIcon, type LucideProps } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Size presets for the Icon component.
 * Maps to token-based dimensions for consistency.
 */
const sizes = {
  /** 16px - For inline text, badges, dense UI */
  sm: "h-4 w-4",
  /** 20px - Default, balanced for most contexts */
  md: "h-5 w-5",
  /** 24px - For prominent actions, headers */
  lg: "h-6 w-6",
  /** 32px - For empty states, feature highlights */
  xl: "h-8 w-8",
} as const;

type IconSize = keyof typeof sizes;

export interface IconProps extends Omit<LucideProps, "size"> {
  /**
   * The Lucide icon component to render.
   * @example
   * import { Home } from "lucide-react";
   * <Icon icon={Home} />
   */
  icon: LucideIcon;

  /**
   * Size preset for the icon.
   * - `sm`: 16px - For inline text, badges, dense UI
   * - `md`: 20px - Default, balanced for most contexts
   * - `lg`: 24px - For prominent actions, headers
   * - `xl`: 32px - For empty states, feature highlights
   * @default "md"
   */
  size?: IconSize;

  /**
   * Accessible label for the icon. When provided, the icon becomes
   * visible to screen readers with this label.
   * If omitted, the icon is hidden from assistive technology (aria-hidden).
   */
  label?: string;

  /**
   * Additional CSS classes to apply to the icon.
   */
  className?: string;
}

/**
 * Icon wrapper component with accessibility and size presets.
 *
 * By default, icons are decorative (aria-hidden). Provide a `label`
 * prop to make the icon accessible to screen readers.
 *
 * @example
 * // Decorative icon (hidden from screen readers)
 * import { Home } from "lucide-react";
 * <Icon icon={Home} size="md" />
 *
 * @example
 * // Accessible icon with label
 * import { AlertTriangle } from "lucide-react";
 * <Icon icon={AlertTriangle} label="Warning" className="text-warning" />
 *
 * @example
 * // Custom size via className
 * import { Search } from "lucide-react";
 * <Icon icon={Search} className="h-10 w-10" />
 */
export function Icon({
  icon: IconComponent,
  size = "md",
  label,
  className,
  ...props
}: IconProps) {
  const isDecorative = !label;

  return (
    <IconComponent
      className={cn(sizes[size], className)}
      aria-hidden={isDecorative}
      aria-label={label}
      role={label ? "img" : undefined}
      {...props}
    />
  );
}
