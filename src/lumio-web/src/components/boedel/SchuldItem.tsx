"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Home, Pencil, Trash2 } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import type { Schuld } from "./types";

interface SchuldItemProps {
  schuld: Schuld;
  onEdit: (schuld: Schuld) => void;
  onDelete: (id: string) => void;
}

export function SchuldItem({ schuld, onEdit, onDelete }: SchuldItemProps) {
  const t = useTranslations("boedel");
  const tEnum = useTranslations("enums");
  const locale = useLocale();
  const currencyLocale = locale === "en" ? "en-NL" : "nl-NL";
  function toCamelCase(s: string): string {
    return s.split(" ").map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join("");
  }

  return (
    <div className="flex items-center justify-between rounded-md border p-3">
      <div className="flex items-center gap-2">
        <Badge variant={schuld.vermogensSoort === 1 ? "secondary" : "outline"} className="text-xs px-1.5 py-0">
          {schuld.vermogensSoort === 1 ? t("bezittingen.gemeenschap") : t("bezittingen.prive")}
        </Badge>
        <div>
          <p className="text-sm font-medium">{schuld.schuldeiser}</p>
          <p className="text-xs text-muted-foreground">{tEnum(`schuldType.${toCamelCase(schuld.type)}` as Parameters<typeof tEnum>[0])}{schuld.referentie ? ` — ${schuld.referentie}` : ""}</p>
          {schuld.bezitNaam && (
            <Badge variant="outline" className="mt-1 gap-1 text-xs">
              <Home className="h-3 w-3" />
              {schuld.bezitNaam}
            </Badge>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-danger">&euro; {schuld.bedrag.toLocaleString(currencyLocale)}</span>
        <Button variant="ghost" size="sm" onClick={() => onEdit(schuld)}>
          <Pencil className="h-3 w-3" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onDelete(schuld.id)}>
          <Trash2 className="h-3 w-3 text-danger" />
        </Button>
      </div>
    </div>
  );
}
