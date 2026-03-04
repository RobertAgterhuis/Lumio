"use client";

import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api-client";
import { Calculator, TrendingDown, Euro } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

interface ErfbelastingResultaat {
  erfgenaamId: string;
  naam: string;
  relatie: string;
  tariefgroep: string;
  brutoDeel: number;
  vrijstelling: number;
  belastbaar: number;
  erfbelasting: number;
  nettoDeel: number;
}

interface ErfbelastingResponse {
  resultaten: ErfbelastingResultaat[];
  nettoNalatenschap: number;
  aantalErfgenamen: number;
  disclaimer: string;
}

export function ErfbelastingCalculator() {
  const t = useTranslations("erfbelasting");
  const locale = useLocale();
  const [data, setData] = useState<ErfbelastingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const formatBedrag = (bedrag: number): string => {
    return new Intl.NumberFormat(locale === "en" ? "en-NL" : "nl-NL", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
    }).format(bedrag);
  };

  const berekenen = async () => {
    setLoading(true);
    try {
      const result = await api.get<ErfbelastingResponse>(
        "/api/erfgenamen/erfbelasting"
      );
      setData(result);
      setOpen(true);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button
        variant="outline"
        onClick={berekenen}
        disabled={loading}
        className="gap-2"
      >
        <Calculator className="h-4 w-4" />
        {loading ? t("berekenBezig") : t("berekenen")}
      </Button>

      {open && data && (
        <Card className="mt-4 animate-[fadeSlideIn_300ms_ease-out_both]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Euro className="h-5 w-5 text-primary" />
                {t("titel")}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
                className="text-xs"
              >
                {t("sluiten")}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Netto nalatenschap */}
            <div className="flex items-center justify-between rounded-md border p-3 bg-muted/50">
              <span className="text-sm font-medium">{t("nettoNalatenschap")}</span>
              <span className="text-sm font-bold">
                {formatBedrag(data.nettoNalatenschap)}
              </span>
            </div>

            {/* Per erfgenaam */}
            {data.resultaten.length > 0 ? (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">{t("perErfgenaam")}</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="pb-2 pr-4">{t("kolomNaam")}</th>
                        <th className="pb-2 pr-4">{t("kolomTariefgroep")}</th>
                        <th className="pb-2 pr-4 text-right">{t("kolomErfdeel")}</th>
                        <th className="pb-2 pr-4 text-right">{t("kolomVrijstelling")}</th>
                        <th className="pb-2 pr-4 text-right">{t("kolomBelastbaar")}</th>
                        <th className="pb-2 pr-4 text-right">{t("kolomErfbelasting")}</th>
                        <th className="pb-2 text-right">{t("kolomNetto")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.resultaten.map((r) => (
                        <tr key={r.erfgenaamId} className="border-b last:border-0 transition-colors hover:bg-muted/50">
                          <td className="py-2 pr-4 font-medium">{r.naam}</td>
                          <td className="py-2 pr-4 text-muted-foreground text-xs">
                            {r.tariefgroep}
                          </td>
                          <td className="py-2 pr-4 text-right">
                            {formatBedrag(r.brutoDeel)}
                          </td>
                          <td className="py-2 pr-4 text-right text-success">
                            {formatBedrag(r.vrijstelling)}
                          </td>
                          <td className="py-2 pr-4 text-right">
                            {formatBedrag(r.belastbaar)}
                          </td>
                          <td className="py-2 pr-4 text-right text-danger font-medium">
                            {formatBedrag(r.erfbelasting)}
                          </td>
                          <td className="py-2 text-right font-bold">
                            {formatBedrag(r.nettoDeel)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t font-semibold">
                        <td className="pt-2 pr-4" colSpan={5}>
                          {t("totaalErfbelasting")}
                        </td>
                        <td className="pt-2 pr-4 text-right text-danger">
                          <TrendingDown className="inline h-3 w-3 mr-1" />
                          {formatBedrag(
                            data.resultaten.reduce(
                              (sum, r) => sum + r.erfbelasting,
                              0
                            )
                          )}
                        </td>
                        <td className="pt-2 text-right">
                          {formatBedrag(
                            data.resultaten.reduce(
                              (sum, r) => sum + r.nettoDeel,
                              0
                            )
                          )}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {t("geenErfgenamen")}
              </p>
            )}

            {/* Disclaimer */}
            <Alert variant="warning">
              <AlertDescription className="text-xs leading-relaxed">
                {data.disclaimer}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
