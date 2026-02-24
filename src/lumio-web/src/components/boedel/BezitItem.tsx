"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import type { FysiekBezit } from "./types";

interface BezitItemProps {
  bezit: FysiekBezit;
  onEdit: (bezit: FysiekBezit) => void;
  onDelete: (id: string) => void;
}

export function BezitItem({ bezit, onEdit, onDelete }: BezitItemProps) {
  const t = useTranslations("boedel");
  const locale = useLocale();
  const currencyLocale = locale === "en" ? "en-NL" : "nl-NL";

  return (
    <div className="flex items-center justify-between rounded-md border p-3">
      <div className="flex items-center gap-2">
        <Badge variant={bezit.vermogensSoort === 1 ? "secondary" : "outline"} className="text-xs px-1.5 py-0">
          {bezit.vermogensSoort === 1 ? t("bezittingen.gemeenschap") : t("bezittingen.prive")}
        </Badge>
        <div>
          <p className="text-sm font-medium">{bezit.omschrijving}</p>
          <p className="text-xs text-muted-foreground">
            {bezit.categorie}
            {bezit.locatie ? ` — ${bezit.locatie}` : ""}
            {bezit.kadastraalNummer ? ` — ${t("bezittingen.kadLabel")} ${bezit.kadastraalNummer}` : ""}
            {bezit.kenteken ? ` — ${bezit.kenteken}` : ""}
            {bezit.kvKNummer ? ` — ${t("bezittingen.kvkLabel")} ${bezit.kvKNummer}` : ""}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {bezit.geschatteWaarde != null && (
          <span className="text-sm font-medium">&euro; {bezit.geschatteWaarde.toLocaleString(currencyLocale)}</span>
        )}
        <Button variant="ghost" size="sm" onClick={() => onEdit(bezit)}>
          <Pencil className="h-3 w-3" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onDelete(bezit.id)}>
          <Trash2 className="h-3 w-3 text-danger" />
        </Button>
      </div>
    </div>
  );
}
