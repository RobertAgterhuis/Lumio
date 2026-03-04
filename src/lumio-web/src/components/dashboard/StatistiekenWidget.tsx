"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { useTranslations, useLocale } from "next-intl";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  BarChart3,
} from "lucide-react";
import { LumioIcon, type LumioIconName } from "@/components/ui/lumio-icon";

interface Statistieken {
  erfgenamen: number;
  noodcontacten: number;
  documenten: number;
  digitaalBezit: {
    accounts: number;
    wachtwoorden: number;
    wallets: number;
    totaal: number;
  };
  boedel: {
    bezittingen: number;
    bankrekeningen: number;
    verzekeringen: number;
    schulden: number;
  };
  financieel: {
    totaalBezittingen: number;
    totaalSaldi: number;
    totaalVerzekeringen: number;
    totaalSchulden: number;
    nettoNalatenschap: number;
  };
}

interface StatistiekenWidgetProps {
  onHasContent?: (v: boolean) => void;
}

export function StatistiekenWidget({ onHasContent }: StatistiekenWidgetProps) {
  const [stats, setStats] = useState<Statistieken | null>(null);
  const t = useTranslations("dashboard.statistieken");
  const locale = useLocale();

  const formatBedrag = (bedrag: number): string => {
    return new Intl.NumberFormat(locale === "en" ? "en-NL" : "nl-NL", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(bedrag);
  };

  useEffect(() => {
    api
      .get<Statistieken>("/api/status/statistieken")
      .then(setStats)
      .catch((err) => console.error("Failed to load statistics:", err));
  }, []);

  // Report content availability once stats are loaded
  useEffect(() => {
    if (!stats) return;
    const hasFinancieelLocal =
      stats.financieel.totaalBezittingen > 0 ||
      stats.financieel.totaalSaldi > 0 ||
      stats.financieel.totaalVerzekeringen > 0 ||
      stats.financieel.totaalSchulden > 0;
    const totaalBoedel =
      stats.boedel.bezittingen +
      stats.boedel.bankrekeningen +
      stats.boedel.verzekeringen +
      stats.boedel.schulden;
    const hasAny =
      stats.erfgenamen > 0 ||
      stats.digitaalBezit.totaal > 0 ||
      stats.documenten > 0 ||
      totaalBoedel > 0 ||
      stats.noodcontacten > 0 ||
      hasFinancieelLocal;
    onHasContent?.(hasAny);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- onHasContent changes on each parent render; adding it would cause infinite loop
  }, [stats]);

  if (!stats) {
    return (
      <div className="rounded-lg border bg-card p-5 animate-pulse">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-4 w-4 rounded bg-muted" />
          <div className="h-4 w-24 rounded bg-muted" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3 rounded-md border p-3">
              <div className="h-8 w-8 rounded-lg bg-muted shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="h-5 w-8 rounded bg-muted" />
                <div className="h-3 w-16 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const hasFinancieel =
    stats.financieel.totaalBezittingen > 0 ||
    stats.financieel.totaalSaldi > 0 ||
    stats.financieel.totaalVerzekeringen > 0 ||
    stats.financieel.totaalSchulden > 0;

  const items: Array<{
    label: string;
    waarde: number;
    lumioIcon: LumioIconName;
    color: string;
    bgColor: string;
  }> = [
    {
      label: t("erfgenamen"),
      waarde: stats.erfgenamen,
      lumioIcon: "erfgenamen",
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      label: t("digitaleAccounts"),
      waarde: stats.digitaalBezit.totaal,
      lumioIcon: "digitaal-bezit",
      color: "text-success",
      bgColor: "bg-success-100",
    },
    {
      label: t("documenten"),
      waarde: stats.documenten,
      lumioIcon: "documenten",
      color: "text-info",
      bgColor: "bg-info-100",
    },
    {
      label: t("boedelitems"),
      waarde:
        stats.boedel.bezittingen +
        stats.boedel.bankrekeningen +
        stats.boedel.verzekeringen +
        stats.boedel.schulden,
      lumioIcon: "boedel",
      color: "text-warning",
      bgColor: "bg-warning-100",
    },
    {
      label: t("noodcontacten"),
      waarde: stats.noodcontacten,
      lumioIcon: "noodcontacten",
      color: "text-danger",
      bgColor: "bg-danger-100",
    },
  ];

  const hasAny = items.some((i) => i.waarde > 0) || hasFinancieel;
  if (!hasAny) return null;

  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold">{t("titel")}</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {items.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 rounded-md border p-3"
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.bgColor} shrink-0`}
              >
                <LumioIcon name={item.lumioIcon} size="sm" className={item.color} />
              </div>
              <div className="min-w-0">
                <p className="text-lg font-bold leading-none">{item.waarde}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {item.label}
                </p>
              </div>
            </div>
          ))}
      </div>

      {hasFinancieel && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-center gap-3 rounded-md border border-success bg-success-100/50 p-3">
            <TrendingUp className="h-4 w-4 text-success shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-success truncate">
                {formatBedrag(
                  stats.financieel.totaalBezittingen +
                    stats.financieel.totaalSaldi +
                    stats.financieel.totaalVerzekeringen
                )}
              </p>
              <p className="text-xs text-success">{t("totaleWaarde")}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-md border border-danger bg-danger-100/50 p-3">
            <TrendingDown className="h-4 w-4 text-danger shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-danger truncate">
                {formatBedrag(stats.financieel.totaalSchulden)}
              </p>
              <p className="text-xs text-danger">{t("schulden")}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-md border border-primary/20 bg-primary/5 p-3">
            <Wallet className="h-4 w-4 text-primary shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-primary truncate">
                {formatBedrag(stats.financieel.nettoNalatenschap)}
              </p>
              <p className="text-xs text-muted-foreground">{t("nettoNalatenschap")}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
