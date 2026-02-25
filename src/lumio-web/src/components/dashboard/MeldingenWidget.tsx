"use client";

import { useDomainQuery } from "@/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import { Bell, AlertTriangle, Info } from "lucide-react";

interface Melding {
  type: "waarschuwing" | "herinnering";
  categorie: string;
  bericht: string;
  actie: string;
}

interface MeldingenResponse {
  meldingen: Melding[];
  aantal: number;
}

/**
 * S4-05: Widget that shows active system notifications / meldingen on the dashboard.
 * Uses useDomainQuery so it integrates with React Query cache.
 */
export function MeldingenWidget() {
  const t = useTranslations("dashboard.meldingen");
  const { data, isLoading, isError } = useDomainQuery<MeldingenResponse>("status/meldingen", {
    staleTime: 2 * 60 * 1000,
  });

  const meldingen = data?.meldingen ?? [];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-base">
            <Bell className="h-4 w-4" />
            {t("titel")}
          </div>
          {meldingen.length > 0 && (
            <Badge className="bg-warning-100 text-warning hover:bg-warning-100 dark:bg-warning/20 dark:text-warning">
              {meldingen.length}
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
        {!isLoading && !isError && meldingen.length === 0 && (
          <div className="flex items-center gap-2 text-sm text-success">
            <Info className="h-4 w-4 shrink-0" />
            {t("geenMeldingen")}
          </div>
        )}
        {!isLoading && !isError && meldingen.length > 0 && (
          <ul className="space-y-2">
            {meldingen.map((m, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                {m.type === "waarschuwing" ? (
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-warning" />
                ) : (
                  <Info className="h-4 w-4 shrink-0 mt-0.5 text-info" />
                )}
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {m.categorie}
                  </span>
                  <p className="mt-0.5">{m.bericht}</p>
                  {m.actie && (
                    <p className="mt-1 text-xs italic text-muted-foreground">
                      {m.actie}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
