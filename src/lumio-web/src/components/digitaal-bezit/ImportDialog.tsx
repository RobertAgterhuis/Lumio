"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ImportResult } from "./types";

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  importing: boolean;
  importResult: ImportResult | null;
  onImport: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export function ImportDialog({
  open,
  onOpenChange,
  importing,
  importResult,
  onImport,
  fileInputRef,
}: ImportDialogProps) {
  const t = useTranslations("digitaalBezit");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>{t("importDialog.titel")}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="rounded-lg border border-info bg-info-100 dark:bg-info/20 p-3">
          <p className="text-sm text-info">
            {t.rich("importDialog.info", {
              strong: (chunks) => <strong>{chunks}</strong>,
            })}
          </p>
        </div>
        <div className="space-y-2">
          <Label>{t("importDialog.csvBestand")}</Label>
          <Input ref={fileInputRef} type="file" accept=".csv" />
        </div>
        {importResult && (
          <div
            className={`rounded-lg border p-3 animate-[fadeSlideIn_300ms_ease-out_both] ${
              importResult.fouten > 0
                ? "border-warning bg-warning-100 dark:bg-warning/20"
                : "border-success bg-success-100 dark:bg-success/20"
            }`}
          >
            <p className="text-sm font-medium">
              {importResult.fouten > 0
                ? t("importDialog.resultaatMetFouten", {
                    geimporteerd: importResult.geimporteerd,
                    fouten: importResult.fouten,
                  })
                : t("importDialog.resultaat", {
                    geimporteerd: importResult.geimporteerd,
                  })}
            </p>
            {importResult.details.length > 0 && (
              <ul className="mt-1 text-xs text-muted-foreground list-disc list-inside">
                {importResult.details.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          {t("importDialog.sluiten")}
        </Button>
        <Button onClick={onImport} disabled={importing}>
          {importing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />{" "}
              {t("importDialog.importerenBezig")}
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" /> {t("importDialog.importerenKnop")}
            </>
          )}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
