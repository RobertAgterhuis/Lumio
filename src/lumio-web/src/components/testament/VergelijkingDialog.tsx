"use client";

import { Dialog, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import type { TestamentVergelijking } from "./types";

interface VergelijkingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vergelijking: TestamentVergelijking | null;
}

export function VergelijkingDialog({
  open,
  onOpenChange,
  vergelijking
}: VergelijkingDialogProps) {
  const t = useTranslations("testament");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>
          {t("vergelijkDialog.titel", {
            versie1: vergelijking?.versie1?.versie ?? 0,
            versie2: vergelijking?.versie2?.versie ?? 0
          })}
        </DialogTitle>
      </DialogHeader>
      <div className="py-4">
        {vergelijking && vergelijking.verschillen.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            {t("vergelijkDialog.geenVerschillen")}
          </p>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-2 font-medium">{t("vergelijkDialog.kolomVeld")}</th>
                  <th className="text-left p-2 font-medium">
                    {t("vergelijkDialog.kolomVersie", { nummer: vergelijking?.versie1?.versie ?? 0 })}
                  </th>
                  <th className="text-left p-2 font-medium">
                    {t("vergelijkDialog.kolomVersie", { nummer: vergelijking?.versie2?.versie ?? 0 })}
                  </th>
                </tr>
              </thead>
              <tbody>
                {vergelijking?.verschillen.map((v, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-2 font-medium">{v.veld}</td>
                    <td className="p-2 text-danger bg-danger-100 dark:bg-danger/20">{v.waardeVersie1 || "—"}</td>
                    <td className="p-2 text-success bg-success-100 dark:bg-success/20">{v.waardeVersie2 || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>{t("vergelijkDialog.sluiten")}</Button>
      </DialogFooter>
    </Dialog>
  );
}
