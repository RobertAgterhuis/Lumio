"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import type { Verzekering } from "./types";

interface VerzekeringItemProps {
  verzekering: Verzekering;
  onEdit: (verzekering: Verzekering) => void;
  onDelete: (id: string) => void;
}

export function VerzekeringItem({ verzekering, onEdit, onDelete }: VerzekeringItemProps) {
  const t = useTranslations("boedel");
  const locale = useLocale();
  const currencyLocale = locale === "en" ? "en-NL" : "nl-NL";

  return (
    <div className="flex items-center justify-between rounded-md border p-3">
      <div className="flex items-center gap-2">
        <Badge variant={verzekering.vermogensSoort === 1 ? "secondary" : "outline"} className="text-xs px-1.5 py-0">
          {verzekering.vermogensSoort === 1 ? t("bezittingen.gemeenschap") : t("bezittingen.prive")}
        </Badge>
        <div>
          <p className="text-sm font-medium">{verzekering.verzekeraar}</p>
          <p className="text-xs text-muted-foreground">{verzekering.type} — {t("verzekeringen.polisLabel")} {verzekering.polisNummer}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {verzekering.verzekerdBedrag != null && (
          <span className="text-sm font-medium">&euro; {verzekering.verzekerdBedrag.toLocaleString(currencyLocale)}</span>
        )}
        <Button variant="ghost" size="sm" onClick={() => onEdit(verzekering)}>
          <Pencil className="h-3 w-3" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onDelete(verzekering.id)}>
          <Trash2 className="h-3 w-3 text-danger" />
        </Button>
      </div>
    </div>
  );
}
