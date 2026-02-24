"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import type { Samenvatting } from "./types";

interface SamenvattingCardProps {
  samenvatting: Samenvatting;
}

export function SamenvattingCard({ samenvatting }: SamenvattingCardProps) {
  const t = useTranslations("boedel");
  const locale = useLocale();
  const currencyLocale = locale === "en" ? "en-NL" : "nl-NL";

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" /> {t("overzicht.titel")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">{t("overzicht.bezittingen", { aantal: samenvatting.aantalBezittingen })}</p>
            <p className="text-lg font-semibold">&euro; {samenvatting.totaalBezittingen.toLocaleString(currencyLocale, { minimumFractionDigits: 2 })}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t("overzicht.saldi", { aantal: samenvatting.aantalRekeningen })}</p>
            <p className="text-lg font-semibold">&euro; {samenvatting.totaalSaldi.toLocaleString(currencyLocale, { minimumFractionDigits: 2 })}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t("overzicht.verzekeringen", { aantal: samenvatting.aantalVerzekeringen })}</p>
            <p className="text-lg font-semibold">&euro; {samenvatting.totaalVerzekeringen.toLocaleString(currencyLocale, { minimumFractionDigits: 2 })}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t("overzicht.schulden", { aantal: samenvatting.aantalSchulden })}</p>
            <p className="text-lg font-semibold text-danger">&euro; {samenvatting.totaalSchulden.toLocaleString(currencyLocale, { minimumFractionDigits: 2 })}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t("overzicht.brutoNalatenschap")}</p>
            <p className="text-lg font-semibold">&euro; {samenvatting.brutoNalatenschap.toLocaleString(currencyLocale, { minimumFractionDigits: 2 })}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t("overzicht.nettoNalatenschap")}</p>
            <p className={`text-lg font-bold ${samenvatting.nettoNalatenschap >= 0 ? "text-success" : "text-danger"}`}>
              &euro; {samenvatting.nettoNalatenschap.toLocaleString(currencyLocale, { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
