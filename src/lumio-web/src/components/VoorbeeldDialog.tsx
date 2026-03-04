"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Eye } from "lucide-react";
import { getVoorbeeldData, type VoorbeeldData } from "@/lib/voorbeeld-data";
import { useTranslations } from "next-intl";

interface VoorbeeldDialogProps {
  domein: string;
}

export function VoorbeeldDialog({ domein }: VoorbeeldDialogProps) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("voorbeeldData");
  const voorbeeldData = getVoorbeeldData(t);
  const data: VoorbeeldData | undefined = voorbeeldData[domein];

  if (!data) return null;

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground gap-1.5"
        onClick={() => setOpen(true)}
      >
        <Eye className="h-4 w-4" />
        {t("bekijkVoorbeeld")}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogHeader>
          <DialogTitle>{data.titel}</DialogTitle>
          <DialogDescription>{data.beschrijving}</DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto space-y-5 pr-1">
          {data.secties.map((sectie, idx) => (
            <div key={sectie.titel}>
              {idx > 0 && <div className="border-t border-border mb-5" />}
              <h4 className="text-sm font-semibold text-primary mb-2">
                {sectie.titel}
              </h4>
              <div className="space-y-1.5">
                {sectie.velden.map((veld) => (
                  <div
                    key={veld.label}
                    className="flex gap-3 text-sm"
                  >
                    <span className="text-muted-foreground shrink-0 min-w-[140px] font-medium">
                      {veld.label}
                    </span>
                    <span className="text-foreground">{veld.waarde}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="pt-3 border-t">
          <p className="text-xs text-muted-foreground italic">
            {t("disclaimer")}
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t("sluiten")}
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
