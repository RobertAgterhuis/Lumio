"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useTranslations } from "next-intl";
import type { LegitimairePortieCheck } from "./types";

interface LegitimairePortieAlertProps {
  check: LegitimairePortieCheck | null;
}

export function LegitimairePortieAlert({ check }: LegitimairePortieAlertProps) {
  const t = useTranslations("testament");

  if (!check?.heeftWaarschuwing) {
    return null;
  }

  return (
    <Alert variant="warning">
      <AlertTitle>{t("legitimairePortie.titel")}</AlertTitle>
      <AlertDescription>
        <p className="text-sm mt-1">
          {t("legitimairePortie.beschrijving", {
            aantalKinderen: check.aantalKinderen,
            heeftPartner: String(check.heeftPartner),
            percentage: check.minimumPercentagePerKind,
          })}
        </p>
        <ul className="mt-2 space-y-1">
          {check.waarschuwingen.map((w, i) => (
            <li key={i} className="text-sm">
              <strong>{w.naam}</strong>:{" "}
              {w.toegewezenPercentage != null
                ? t("legitimairePortie.toegewezen", { percentage: w.toegewezenPercentage, minimum: w.minimumPercentage })
                : t("legitimairePortie.nietOpgenomen", { minimum: w.minimumPercentage })}
            </li>
          ))}
        </ul>
        <p className="text-xs mt-2">
          {t("legitimairePortie.disclaimer")}
        </p>
      </AlertDescription>
    </Alert>
  );
}
