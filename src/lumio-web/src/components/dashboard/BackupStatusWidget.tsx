"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useDomainQuery } from "@/hooks";
import { useAuthStore } from "@/stores/authStore";
import { usePreferencesStore } from "@/stores/preferencesStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { HardDrive, CheckCircle2, AlertTriangle, XCircle, EyeOff, ChevronDown, ChevronUp } from "lucide-react";

interface BackupStatus {
  lastBackup: string | null;
  daysSince: number | null;
  status: "ok" | "warning" | "noBackup";
}

const statusConfig = {
  ok: {
    icon: CheckCircle2,
    badgeClass: "bg-success-100 text-success hover:bg-success-100 dark:bg-success/20 dark:text-success",
  },
  warning: {
    icon: AlertTriangle,
    badgeClass: "bg-warning-100 text-warning hover:bg-warning-100 dark:bg-warning/20 dark:text-warning",
  },
  noBackup: {
    icon: XCircle,
    badgeClass: "bg-danger-100 text-danger hover:bg-danger-100 dark:bg-danger/20 dark:text-danger",
  },
} as const;

/**
 * S4-06: Widget that shows last backup date and health status on the dashboard.
 * Hidden on the very first run for a profile; shown from the second run onwards.
 * Clicking navigates to /instellingen#backup.
 */
export function BackupStatusWidget({ onHasContent }: { onHasContent?: (v: boolean) => void }) {
  const t = useTranslations("dashboard.backup");
  const tDash = useTranslations("dashboard");
  const { activeProfile } = useAuthStore();
  const toggleSection = usePreferencesStore((s) => s.toggleSection);
  const [isFirstRun, setIsFirstRun] = useState<boolean | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const { data, isLoading, isError } = useDomainQuery<BackupStatus>("status/backup", {
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!activeProfile) return;
    const key = `lumio_backupwidget_seen_${activeProfile.id}`;
    const stored = localStorage.getItem(key);
    const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
    const dismissKey = `lumio_backupwidget_dismissed_${activeProfile.id}`;

    if (!stored) {
      // First ever visit: record today's date and hide the widget all day
      localStorage.setItem(key, today);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsFirstRun(true);
    } else {
      // Show the widget starting the day after first use
      setIsFirstRun(stored === today);
    }

    setIsDismissed(localStorage.getItem(dismissKey) === "1");
  }, [activeProfile]);

  // Report to parent whether this widget has visible content
  useEffect(() => {
    if (isFirstRun !== null) {
      onHasContent?.(!isFirstRun && !isDismissed);
    }
  }, [isDismissed, isFirstRun, onHasContent]);

  // Hide until we've determined run status, and hide on first run
  if (isFirstRun === null || isFirstRun || isDismissed) return null;

  const status = data?.status ?? "noBackup";
  const { icon: Icon, badgeClass } = statusConfig[status];

  return (
    <Card className="overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <HardDrive className="h-4 w-4 text-primary shrink-0" />
        <span className="text-sm font-semibold flex-1">{t("titel")}</span>
        {data && (
          <Badge className={badgeClass}>
            <Icon className="h-3 w-3 mr-1" />
            {t(`status.${status}`)}
          </Badge>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            if (activeProfile) {
              localStorage.setItem(`lumio_backupwidget_dismissed_${activeProfile.id}`, "1");
            }
            setIsDismissed(true);
          }}
          className="text-xs text-muted-foreground h-7 px-2"
        >
          {t("negeren")}
        </Button>
        {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>

      {expanded && (
        <CardContent className="pt-4 space-y-3 animate-[fadeSlideIn_220ms_ease-out_both]">
          {isLoading && (
            <div className="space-y-2 animate-pulse">
              <div className="h-4 w-3/4 rounded bg-muted" />
              <div className="h-3 w-1/2 rounded bg-muted" />
            </div>
          )}
          {isError && <p className="text-sm text-danger">{t("fout")}</p>}
          {data && (
            <div className="text-sm text-muted-foreground space-y-1">
              {data.lastBackup ? (
                <>
                  <p>
                    {t("laatste")}:{" "}
                    <span className="font-medium text-foreground">
                      {new Date(data.lastBackup).toLocaleDateString("nl-NL", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </p>
                  {data.daysSince !== null && data.daysSince > 0 && <p>{t("dagenGeleden", { dagen: data.daysSince })}</p>}
                </>
              ) : (
                <p>{t("nooit")}</p>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleSection("showBackup")}
              className="text-xs text-muted-foreground gap-1 h-7 px-2"
            >
              <EyeOff className="h-3.5 w-3.5" />
              {tDash("verbergen")}
            </Button>
            <Button asChild size="sm" variant="outline" className="h-7 text-xs">
              <Link href="/instellingen#backup">{t("naarInstellingen")}</Link>
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
