"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { useTranslations } from "next-intl";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DomeinDetail {
  domein: string;
  label: string;
  ingevuld: number;
  totaal: number;
}

interface GranulairData {
  percentage: number;
  totaalIngevuld: number;
  totaalVelden: number;
  domeinen: DomeinDetail[];
}

export function VoortgangGranulair() {
  const [data, setData] = useState<GranulairData | null>(null);
  const [expanded, setExpanded] = useState(false);
  const t = useTranslations("dashboard.voortgangGranulair");

  useEffect(() => {
    api
      .get<GranulairData>("/api/status/compleetheid/granulair")
      .then(setData)
      .catch(() => {});
  }, []);

  if (!data) return null;

  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold">{t("titel")}</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-primary">
            {data.percentage}%
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="h-6 w-6 p-0"
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Overall bar */}
      <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${data.percentage}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {t("veldenIngevuld", { ingevuld: data.totaalIngevuld, totaal: data.totaalVelden })}
      </p>

      {/* Per-domain breakdown */}
      {expanded && (
        <div className="mt-4 space-y-2">
          {data.domeinen.map((d) => {
            const pct =
              d.totaal > 0
                ? Math.round((d.ingevuld / d.totaal) * 100)
                : 0;
            return (
              <Link
                key={d.domein}
                href={`/${d.domein}`}
                className="block group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs w-28 truncate text-muted-foreground group-hover:text-primary transition-colors">
                    {d.label}
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${pct}%`,
                        backgroundColor:
                          pct === 100
                            ? "var(--color-success)"
                            : pct > 0
                              ? "var(--color-accent)"
                              : "var(--color-muted)",
                      }}
                    />
                  </div>
                  <span className="text-xs w-16 text-right text-muted-foreground">
                    {d.ingevuld}/{d.totaal}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
