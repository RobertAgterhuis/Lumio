import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface ActivityLogItemProps {
  /** Icon to display */
  icon: LucideIcon;
  /** Main action description */
  action: string;
  /** When the action occurred */
  timestamp: Date | string;
  /** Optional additional detail text */
  detail?: string;
  /** Optional severity for icon coloring */
  severity?: "info" | "success" | "warning" | "danger";
  /** Additional className */
  className?: string;
}

const severityClasses = {
  info: "text-info bg-info-100",
  success: "text-success bg-success-100",
  warning: "text-warning bg-warning-100",
  danger: "text-danger bg-danger-100",
} as const;

function formatRelativeTime(date: Date): string {
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  const rtf = new Intl.RelativeTimeFormat("nl", { numeric: "auto" });

  if (diffDay > 0) return rtf.format(-diffDay, "day");
  if (diffHr > 0) return rtf.format(-diffHr, "hour");
  if (diffMin > 0) return rtf.format(-diffMin, "minute");
  return rtf.format(-diffSec, "second");
}

export function ActivityLogItem({
  icon: Icon,
  action,
  timestamp,
  detail,
  severity = "info",
  className,
}: ActivityLogItemProps) {
  const date =
    typeof timestamp === "string" ? new Date(timestamp) : timestamp;
  const relative = formatRelativeTime(date);

  return (
    <div className={cn("flex items-start gap-3 py-2 rounded-md px-2 -mx-2 transition-colors hover:bg-muted/50", className)}>
      <div
        className={cn(
          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          severityClasses[severity]
        )}
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{action}</p>
        {detail && (
          <p className="text-xs text-muted-foreground">{detail}</p>
        )}
        <time
          className="text-xs text-muted-foreground"
          dateTime={date.toISOString()}
          title={date.toLocaleString("nl-NL")}
        >
          {relative}
        </time>
      </div>
    </div>
  );
}
