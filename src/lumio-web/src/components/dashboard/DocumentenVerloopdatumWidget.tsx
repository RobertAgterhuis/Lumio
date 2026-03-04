"use client";

import Link from "next/link";
import { useEffect } from "react";
import { FileText, AlertTriangle, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDomainQuery } from "@/hooks";
import { usePreferencesStore } from "@/stores/preferencesStore";
import { useTranslations } from "next-intl";

interface Document {
  id: string;
  naam: string;
  categorie: string;
  verlooptOp?: string | null;
}

const DAGEN_WAARSCHUWING = 90;

function dagenTot(verlooptOp: string): number {
  const nu = new Date();
  nu.setHours(0, 0, 0, 0);
  const verloop = new Date(verlooptOp);
  return Math.ceil((verloop.getTime() - nu.getTime()) / (1000 * 60 * 60 * 24));
}

export function DocumentenVerloopdatumWidget({ onHasContent }: { onHasContent?: (v: boolean) => void }) {
  const t = useTranslations("dashboard");
  const toggleSection = usePreferencesStore((s) => s.toggleSection);
  const { data: documenten = [], isLoading } = useDomainQuery<Document[]>("documenten");

  const verlopen = !isLoading
    ? documenten
        .filter((d) => d.verlooptOp != null)
        .map((d) => ({ ...d, dagenResterend: dagenTot(d.verlooptOp!) }))
        .filter((d) => d.dagenResterend <= DAGEN_WAARSCHUWING)
        .sort((a, b) => a.dagenResterend - b.dagenResterend)
        .slice(0, 5)
    : [];

  // Report to parent whether this widget has visible content
  useEffect(() => {
    if (!isLoading) {
      onHasContent?.(verlopen.length > 0);
    }
  }, [isLoading, verlopen.length, onHasContent]);

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card p-5 animate-pulse">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-4 w-4 rounded bg-muted" />
          <div className="h-4 w-36 rounded bg-muted" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full rounded bg-muted" />
          <div className="h-3 w-2/3 rounded bg-muted" />
        </div>
      </div>
    );
  }
  if (verlopen.length === 0) return null;

  return (
    <Card className="border-warning/40">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-warning">
            <AlertTriangle className="h-4 w-4" />
            {t("verloopdatumWidget.titel")}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleSection("showVerloopdatum")}
            className="text-xs text-muted-foreground gap-1 h-7 px-2"
          >
            <EyeOff className="h-3.5 w-3.5" />
            {t("verbergen")}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {verlopen.map((doc) => (
          <div key={doc.id} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="text-sm truncate">{doc.naam}</span>
            </div>
            <Badge
              variant={doc.dagenResterend <= 30 ? "destructive" : "secondary"}
              className="shrink-0 text-xs"
            >
              {doc.dagenResterend <= 0
                ? t("verloopdatumWidget.verlopen")
                : t("verloopdatumWidget.dagenOver", { dagen: doc.dagenResterend })}
            </Badge>
          </div>
        ))}
        <Link href="/documenten" className="block text-xs text-primary mt-2 hover:underline">
          {t("verloopdatumWidget.beherenLink")}
        </Link>
      </CardContent>
    </Card>
  );
}
