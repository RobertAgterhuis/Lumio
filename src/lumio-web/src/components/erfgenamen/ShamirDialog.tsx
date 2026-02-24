"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { HelpTooltip } from "@/components/ui/help-tooltip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Check, Copy, KeyRound, Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import type { Erfgenaam, GenereerResponse } from "./types";

interface ShamirDialogProps {
  open: boolean;
  onClose: () => void;
  erfgenamen: Erfgenaam[];
  password: string;
  onPasswordChange: (value: string) => void;
  threshold: string;
  onThresholdChange: (value: string) => void;
  generating: boolean;
  onGenerate: () => void;
  generatedShares: GenereerResponse | null;
  copiedIndex: number | null;
  onCopyShare: (index: number, value: string) => void;
  displayName: (e: Erfgenaam) => string;
  translations: {
    titel: string;
    beschrijving: (aantal: number) => string;
    waarschuwing: string;
    waarschuwingTekst: string;
    wachtwoord: string;
    wachtwoordPlaceholder: string;
    drempel: string;
    drempelTooltip: string;
    drempelOptie: (n: number, totaal: number) => string;
    delenInfo: (params: { aantal: number; drempel: string }) => ReactNode;
    annuleren: string;
    genererenBezig: string;
    genereren: string;
    succes: string;
    succesTekst: (aantal: number, drempel: number) => string;
    deel: (index: number) => string;
    erfgenaamFallback: (nummer: number) => string;
    gekopieerd: string;
    kopieren: string;
    sluiten: string;
  };
}

export function ShamirDialog({
  open,
  onClose,
  erfgenamen,
  password,
  onPasswordChange,
  threshold,
  onThresholdChange,
  generating,
  onGenerate,
  generatedShares,
  copiedIndex,
  onCopyShare,
  displayName,
  translations: t,
}: ShamirDialogProps) {
  const thresholdOptions = Array.from(
    { length: Math.max(erfgenamen.length - 1, 1) },
    (_, i) => i + 2
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogHeader>
        <DialogTitle>{t.titel}</DialogTitle>
        <DialogDescription>{t.beschrijving(erfgenamen.length)}</DialogDescription>
      </DialogHeader>

      {!generatedShares ? (
        <>
          <div className="space-y-4 py-4">
            <div className="rounded-lg border border-warning bg-warning-100 p-3">
              <p className="text-sm text-warning">
                <strong>{t.waarschuwing}</strong> {t.waarschuwingTekst}
              </p>
            </div>
            <div className="space-y-2">
              <Label>{t.wachtwoord}</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => onPasswordChange(e.target.value)}
                placeholder={t.wachtwoordPlaceholder}
              />
            </div>
            <div className="space-y-2">
              <Label>
                {t.drempel}
                <HelpTooltip tekst={t.drempelTooltip} />
              </Label>
              <Select value={threshold} onChange={(e) => onThresholdChange(e.target.value)}>
                {thresholdOptions.map((n) => (
                  <option key={n} value={n.toString()}>
                    {t.drempelOptie(n, erfgenamen.length)}
                  </option>
                ))}
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              {t.delenInfo({ aantal: erfgenamen.length, drempel: threshold })}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              {t.annuleren}
            </Button>
            <Button onClick={onGenerate} disabled={generating || !password}>
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t.genererenBezig}
                </>
              ) : (
                <>
                  <KeyRound className="h-4 w-4 mr-2" />
                  {t.genereren}
                </>
              )}
            </Button>
          </DialogFooter>
        </>
      ) : (
        <>
          <div className="space-y-4 py-4">
            <Alert variant="success">
              <AlertDescription>
                <strong>{t.succes}</strong>{" "}
                {t.succesTekst(generatedShares.totaalAantalDelen, generatedShares.drempel)}
              </AlertDescription>
            </Alert>
            <div className="space-y-3">
              {generatedShares.delen.map((share, i) => (
                <div key={share.index} className="rounded-md border p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {t.deel(share.index)} &mdash;{" "}
                      {erfgenamen[i] ? displayName(erfgenamen[i]) : t.erfgenaamFallback(i + 1)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onCopyShare(share.index, share.waarde)}
                    >
                      {copiedIndex === share.index ? (
                        <>
                          <Check className="h-3 w-3 mr-1" /> {t.gekopieerd}
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3 mr-1" /> {t.kopieren}
                        </>
                      )}
                    </Button>
                  </div>
                  <code className="block w-full rounded bg-muted p-2 text-xs break-all font-mono">
                    {share.waarde}
                  </code>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={onClose}>{t.sluiten}</Button>
          </DialogFooter>
        </>
      )}
    </Dialog>
  );
}
