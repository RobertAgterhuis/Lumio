"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import type { Bankrekening } from "./types";

interface RekeningItemProps {
  rekening: Bankrekening;
  onEdit: (rekening: Bankrekening) => void;
  onDelete: (id: string) => void;
}

export function RekeningItem({ rekening, onEdit, onDelete }: RekeningItemProps) {
  const t = useTranslations("boedel");
  const tEnum = useTranslations("enums");
  const locale = useLocale();
  const currencyLocale = locale === "en" ? "en-NL" : "nl-NL";

  return (
    <div className="flex items-center justify-between rounded-md border p-3">
      <div className="flex items-center gap-2">
        <Badge variant={rekening.vermogensSoort === 1 ? "secondary" : "outline"} className="text-xs px-1.5 py-0">
          {rekening.vermogensSoort === 1 ? t("bezittingen.gemeenschap") : t("bezittingen.prive")}
        </Badge>
        <div>
          <p className="text-sm font-medium">{rekening.bankNaam}</p>
          <p className="text-xs text-muted-foreground">{tEnum(`rekeningType.${rekening.rekeningType.toLowerCase()}` as Parameters<typeof tEnum>[0])} — {rekening.iban}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {rekening.saldo != null && (
          <span className="text-sm font-medium">&euro; {rekening.saldo.toLocaleString(currencyLocale, { minimumFractionDigits: 2 })}</span>
        )}
        <Button variant="ghost" size="sm" onClick={() => onEdit(rekening)}>
          <Pencil className="h-3 w-3" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onDelete(rekening.id)}>
          <Trash2 className="h-3 w-3 text-danger" />
        </Button>
      </div>
    </div>
  );
}
