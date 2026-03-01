"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AlertTriangle, Check, KeyRound, Share2, ShieldCheck } from "lucide-react";
import type { Erfgenaam } from "./types";

interface ShamirStatusBannerProps {
  erfgenamen: Erfgenaam[];
  onOpenShamirDialog: () => void;
  onShareErfgenaam: (id: string, voornaam: string) => void;
  displayName: (e: Erfgenaam) => string;
  isReadOnly?: boolean;
  translations: {
    titel: string;
    uitleg: string;
    differentiator: string;
    aantalLabel: (ontvangen: number, totaal: number) => string;
    shareStatus: string;
    geenShare: string;
    noodcodesHerdelen: string;
    deelOverzicht: string;
    noodcodesGenereren: string;
    drempelUitleg: string;
  };
}

export function ShamirStatusBanner({
  erfgenamen,
  onOpenShamirDialog,
  onShareErfgenaam,
  displayName,
  isReadOnly = false,
  translations: t,
}: ShamirStatusBannerProps) {
  if (erfgenamen.length < 2) return null;

  const aantalOntvangen = erfgenamen.filter((e) => e.heeftShareOntvangen).length;
  const allesVerdeeld = aantalOntvangen === erfgenamen.length && aantalOntvangen > 0;
  const onitOntvangen = aantalOntvangen > 0 && aantalOntvangen < erfgenamen.length;

  return (
    <div
      className={cn(
        "rounded-lg border p-4 space-y-4",
        allesVerdeeld
          ? "border-success bg-success/5"
          : aantalOntvangen > 0
          ? "border-warning bg-warning-100"
          : "border-primary/30 bg-primary/5"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <ShieldCheck
            className={cn(
              "h-5 w-5 shrink-0 mt-0.5",
              allesVerdeeld ? "text-success" : "text-primary"
            )}
            aria-hidden="true"
          />
          <div>
            <p className="text-sm font-semibold">{t.titel}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{t.uitleg}</p>
          </div>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold",
            allesVerdeeld
              ? "bg-success/20 text-success"
              : onitOntvangen
              ? "bg-warning/20 text-warning"
              : "bg-muted text-muted-foreground"
          )}
        >
          {t.aantalLabel(aantalOntvangen, erfgenamen.length)}
        </span>
      </div>

      {/* Per-heir rows */}
      <div className="space-y-2">
        {erfgenamen.map((e) => (
          <div
            key={e.id}
            className={cn(
              "flex items-center justify-between rounded-md px-3 py-2 text-sm",
              e.heeftShareOntvangen
                ? "bg-success/10"
                : "bg-muted/60"
            )}
          >
            <div className="flex items-center gap-2">
              {e.heeftShareOntvangen ? (
                <Check className="h-4 w-4 text-success" aria-label={t.shareStatus} />
              ) : (
                <AlertTriangle className="h-4 w-4 text-warning" aria-label={t.geenShare} />
              )}
              <span className="font-medium">{displayName(e)}</span>
            </div>
            {!isReadOnly && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onShareErfgenaam(e.id, e.voornaam)}
                title={t.deelOverzicht}
                className="h-7 gap-1 text-xs"
              >
                <Share2 className="h-3 w-3" aria-hidden="true" />
                {t.deelOverzicht}
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* Marketing callout — GUARD-005 unblocked after Shamir wizard ✅ */}
      <div className="rounded-md bg-primary/5 border border-primary/20 px-3 py-2">
        <p className="text-xs text-primary/80">{t.differentiator}</p>
      </div>

      {/* Action */}
      {!isReadOnly && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={onOpenShamirDialog} className="gap-2">
            <KeyRound className="h-4 w-4" aria-hidden="true" />
            {aantalOntvangen > 0 ? t.noodcodesHerdelen : t.noodcodesGenereren}
          </Button>
        </div>
      )}
    </div>
  );
}
