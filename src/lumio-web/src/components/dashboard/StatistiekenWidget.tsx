"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { useTranslations, useLocale } from "next-intl";
import {
  Users,
  Globe,
  FileText,
  Wallet,
  Phone,
  TrendingUp,
  TrendingDown,
  BarChart3,
} from "lucide-react";

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

export function StatistiekenWidget() {
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
      .catch(() => {});
  }, []);

  if (!stats) return null;

  const hasFinancieel =
    stats.financieel.totaalBezittingen > 0 ||
    stats.financieel.totaalSaldi > 0 ||
    stats.financieel.totaalVerzekeringen > 0 ||
    stats.financieel.totaalSchulden > 0;

  const items = [
    {
      label: t("erfgenamen"),
      waarde: stats.erfgenamen,
      icon: Users,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
    {
      label: t("digitaleAccounts"),
      waarde: stats.digitaalBezit.totaal,
      icon: Globe,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: t("documenten"),
      waarde: stats.documenten,
      icon: FileText,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
    },
    {
      label: t("boedelitems"),
      waarde:
        stats.boedel.bezittingen +
        stats.boedel.bankrekeningen +
        stats.boedel.verzekeringen +
        stats.boedel.schulden,
      icon: Wallet,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      label: t("noodcontacten"),
      waarde: stats.noodcontacten,
      icon: Phone,
      color: "text-pink-600",
      bgColor: "bg-pink-50",
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
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="flex items-center gap-3 rounded-md border p-3"
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.bgColor} shrink-0`}
              >
                <Icon className={`h-4 w-4 ${item.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-lg font-bold leading-none">{item.waarde}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {item.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {hasFinancieel && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-center gap-3 rounded-md border border-green-200 bg-green-50/50 p-3">
            <TrendingUp className="h-4 w-4 text-green-600 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-green-800 truncate">
                {formatBedrag(
                  stats.financieel.totaalBezittingen +
                    stats.financieel.totaalSaldi +
                    stats.financieel.totaalVerzekeringen
                )}
              </p>
              <p className="text-xs text-green-700">{t("totaleWaarde")}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-md border border-red-200 bg-red-50/50 p-3">
            <TrendingDown className="h-4 w-4 text-red-600 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-red-800 truncate">
                {formatBedrag(stats.financieel.totaalSchulden)}
              </p>
              <p className="text-xs text-red-700">{t("schulden")}</p>
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
