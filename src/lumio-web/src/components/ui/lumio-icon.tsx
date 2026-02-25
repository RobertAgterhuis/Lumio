import { forwardRef, type SVGProps } from "react";
import {
  DashboardIcon,
  ProfielIcon,
  TestamentIcon,
  WilsverklaringIcon,
  DonorIcon,
  UitvaartIcon,
  DigitaalBezitIcon,
  BoedelIcon,
  DocumentenIcon,
  ErfgenamenIcon,
  NoodcontactenIcon,
  TijdlijnIcon,
  ShieldIcon,
  ShieldCheckIcon,
  ShieldAlertIcon,
  ShieldXIcon,
} from "@/components/ui/lumio-icons";

// ─── Types ──────────────────────────────────────────────────────────────────

export type LumioIconName =
  | "dashboard"
  | "profiel"
  | "testament"
  | "wilsverklaring"
  | "donor"
  | "uitvaart"
  | "digitaal-bezit"
  | "boedel"
  | "documenten"
  | "erfgenamen"
  | "noodcontacten"
  | "tijdlijn"
  | "shield"
  | "shield-check"
  | "shield-alert"
  | "shield-x";

export type LumioIconSize = "sm" | "md" | "lg" | "xl";

export interface LumioIconProps extends SVGProps<SVGSVGElement> {
  name: LumioIconName;
  size?: LumioIconSize;
  /** Accessible label. When omitted the icon is decorative (aria-hidden). */
  label?: string;
}

// ─── Size map (mirrors icon.tsx Lucide wrapper) ──────────────────────────────

const sizeClasses: Record<LumioIconSize, string> = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
  xl: "h-8 w-8",
};

// ─── Icon map ────────────────────────────────────────────────────────────────

const icons: Record<LumioIconName, React.ComponentType<SVGProps<SVGSVGElement>>> = {
  dashboard: DashboardIcon,
  profiel: ProfielIcon,
  testament: TestamentIcon,
  wilsverklaring: WilsverklaringIcon,
  donor: DonorIcon,
  uitvaart: UitvaartIcon,
  "digitaal-bezit": DigitaalBezitIcon,
  boedel: BoedelIcon,
  documenten: DocumentenIcon,
  erfgenamen: ErfgenamenIcon,
  noodcontacten: NoodcontactenIcon,
  tijdlijn: TijdlijnIcon,
  shield: ShieldIcon,
  "shield-check": ShieldCheckIcon,
  "shield-alert": ShieldAlertIcon,
  "shield-x": ShieldXIcon,
};

// ─── Component ───────────────────────────────────────────────────────────────

export const LumioIcon = forwardRef<SVGSVGElement, LumioIconProps>(
  function LumioIcon({ name, size = "md", label, className, ...props }, ref) {
    if (process.env.NODE_ENV !== "production" && !(name in icons)) {
      console.warn(
        `[LumioIcon] Unknown icon name "${String(name)}". ` +
          `Valid names: ${Object.keys(icons).join(", ")}.`,
      );
    }

    const Icon = icons[name];
    const sizeClass = sizeClasses[size];

    return (
      <Icon
        ref={ref}
        className={[sizeClass, className].filter(Boolean).join(" ")}
        aria-hidden={!label}
        aria-label={label}
        role={label ? "img" : undefined}
        {...props}
      />
    );
  },
);

LumioIcon.displayName = "LumioIcon";
