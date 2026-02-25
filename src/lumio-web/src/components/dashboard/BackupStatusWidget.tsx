"use client";

import { useDomainQuery } from "@/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import { HardDrive, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

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
 */
export function BackupStatusWidget() {
  const t = useTranslations("dashboard.backup");
  const { data, isLoading, isError } = useDomainQuery<BackupStatus>("status/backup", {
    staleTime: 5 * 60 * 1000,
  });

  const status = data?.status ?? "noBackup";
  const { icon: Icon, badgeClass } = statusConfig[status];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-base">
            <HardDrive className="h-4 w-4" />
            {t("titel")}
          </div>
          {data && (
            <Badge className={badgeClass}>
              <Icon className="h-3 w-3 mr-1" />
              {t(`status.${status}`)}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <p className="text-sm text-muted-foreground">{t("laden")}</p>
        )}
        {isError && (
          <p className="text-sm text-danger">{t("fout")}</p>
        )}
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
                {data.daysSince !== null && data.daysSince > 0 && (
                  <p>{t("dagenGeleden", { dagen: data.daysSince })}</p>
                )}
              </>
            ) : (
              <p>{t("nooit")}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
