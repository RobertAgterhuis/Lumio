import { Lightbulb, AlertTriangle, AlertCircle, Shield, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CalloutType } from "@/lib/parseCalloutType";

interface HelpCalloutCardProps {
  type: CalloutType;
  children: React.ReactNode;
}

const CONFIG: Record<
  CalloutType,
  {
    icon: React.ElementType;
    label: string;
    classes: string;
    iconClass: string;
  }
> = {
  tip: {
    icon: Lightbulb,
    label: "Tip",
    classes: "bg-success/10 border-success/30 text-foreground",
    iconClass: "text-success",
  },
  warning: {
    icon: AlertTriangle,
    label: "Belangrijk",
    classes: "bg-warning/10 border-warning/30 text-foreground",
    iconClass: "text-warning",
  },
  danger: {
    icon: AlertCircle,
    label: "Let op",
    classes: "bg-destructive/10 border-destructive/30 text-foreground",
    iconClass: "text-destructive",
  },
  security: {
    icon: Shield,
    label: "Beveiliging",
    classes: "bg-primary/10 border-primary/30 text-foreground",
    iconClass: "text-primary",
  },
  info: {
    icon: Info,
    label: "Opmerking",
    classes: "bg-muted border-border text-foreground",
    iconClass: "text-muted-foreground",
  },
};

/**
 * Visually rich callout card rendered from `> **Tip**:` style blockquotes.
 */
export function HelpCalloutCard({ type, children }: HelpCalloutCardProps) {
  const { icon: Icon, label, classes, iconClass } = CONFIG[type];

  return (
    <div
      className={cn("my-4 flex gap-3 rounded-lg border px-4 py-3 text-sm animate-[fadeSlideIn_300ms_ease-out_both]", classes)}
      role={type === "danger" || type === "warning" ? "alert" : "note"}
    >
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", iconClass)} aria-hidden />
      <div className="min-w-0 flex-1">
        <span className={cn("mb-1 block font-semibold leading-none", iconClass)}>
          {label}
        </span>
        {children}
      </div>
    </div>
  );
}
