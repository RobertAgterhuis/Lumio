"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { BezitSchuld } from "./types";

interface BezitSchuldRowProps {
  schuld: BezitSchuld;
  bezitCategorie: string;
  onChange: (schuld: BezitSchuld) => void;
  onDelete: () => void;
}

export function BezitSchuldRow({
  schuld,
  bezitCategorie,
  onChange,
  onDelete,
}: BezitSchuldRowProps) {
  const t = useTranslations("boedel");

  const isVoertuig = bezitCategorie === "Voertuig";
  const isOnroerend = bezitCategorie === "Onroerend goed";

  const schuldTypes: Array<BezitSchuld["type"]> = isVoertuig
    ? ["Lening", "Lease", "Overig"]
    : isOnroerend
    ? ["Hypotheek", "Lening", "Overig"]
    : ["Hypotheek", "Lening", "Lease", "Overig"];

  return (
    <div className="rounded-md border bg-muted/30 p-3 space-y-3">
      <div className="flex items-start gap-2">
        <div className="flex-1 space-y-2">
          <Label className="text-xs">{t("bezitDialog.schulden.schuldeiser")}</Label>
          <Input
            value={schuld.schuldeiser}
            onChange={(e) => onChange({ ...schuld, schuldeiser: e.target.value })}
            placeholder={t("bezitDialog.schulden.schuldeiserPlaceholder")}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs">{t("bezitDialog.schulden.type")}</Label>
          <Select
            value={schuld.type}
            onChange={(e) =>
              onChange({ ...schuld, type: e.target.value as BezitSchuld["type"] })
            }
          >
            {schuldTypes.map((type) => (
              <option key={type} value={type}>
                {t(`bezitDialog.schulden.types.${type.toLowerCase()}`)}
              </option>
            ))}
          </Select>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="mt-6 shrink-0"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4 text-danger" />
        </Button>
      </div>
      {schuld.type === "Lease" && (
        <div className="space-y-2">
          <Label className="text-xs">{t("bezitDialog.schulden.leaseMaatschappij")}</Label>
          <Input
            value={schuld.leaseMaatschappij ?? ""}
            onChange={(e) => onChange({ ...schuld, leaseMaatschappij: e.target.value })}
            placeholder={t("bezitDialog.schulden.leaseMaatschappijPlaceholder")}
          />
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-xs">{t("bezitDialog.schulden.bedrag")}</Label>
          <Input
            type="number"
            value={schuld.bedrag === 0 ? "" : schuld.bedrag}
            onChange={(e) =>
              onChange({ ...schuld, bedrag: parseFloat(e.target.value) || 0 })
            }
            placeholder="0"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs">{t("bezitDialog.schulden.maandelijkseAflossing")}</Label>
          <Input
            type="number"
            value={schuld.maandelijkseAflossing ?? ""}
            onChange={(e) =>
              onChange({
                ...schuld,
                maandelijkseAflossing: e.target.value ? parseFloat(e.target.value) : undefined,
              })
            }
            placeholder={t("bezitDialog.schulden.optioneel")}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-xs">{t("bezitDialog.schulden.einddatum")}</Label>
        <Input
          type="date"
          value={schuld.einddatum ?? ""}
          onChange={(e) =>
            onChange({ ...schuld, einddatum: e.target.value || undefined })
          }
        />
      </div>
    </div>
  );
}
