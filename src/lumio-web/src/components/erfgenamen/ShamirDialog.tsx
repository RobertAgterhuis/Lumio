"use client";

import { useEffect, useState } from "react";
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
import { cn } from "@/lib/utils";
import { Check, Copy, Info, KeyRound, Loader2, ShieldCheck, Users } from "lucide-react";
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
    // wizard step labels
    stap1Titel: string;
    stap1Uitleg: string;
    stap1Bullet1: string;
    stap1Bullet2: string;
    stap1Bullet3: string;
    stap1Callout: string;
    stap2Titel: string;
    stap2ErfgenamenLabel: string;
    stap3Titel: string;
    stap4Titel: string;
    stap4NogTeKopieren: (n: number) => string;
    stap4AlleGekopieerd: string;
    stap4CodeFormaat: string;
    volgende: string;
    vorige: string;
    stapIndicator: (huidig: number, totaal: number) => string;
    // existing keys
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

const TOTAL_STEPS = 4;

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
  onCopyShare,
  displayName,
  translations: t,
}: ShamirDialogProps) {
  const [step, setStep] = useState(1);
  const [copiedSet, setCopiedSet] = useState<Set<number>>(new Set());

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStep(1);
      setCopiedSet(new Set());
    }
  }, [open]);

  // Advance to step 4 when shares are freshly generated
  useEffect(() => {
    if (generatedShares) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStep(4);
    }
  }, [generatedShares]);

  const handleCopyShare = (index: number, value: string) => {
    onCopyShare(index, value);
    setCopiedSet((prev) => new Set([...prev, index]));
  };

  const allCopied = generatedShares
    ? copiedSet.size >= generatedShares.delen.length
    : false;

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

      {/* Step indicator */}
      <div className="flex items-center gap-2 px-1 py-2">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((s) => (
          <div
            key={s}
            className={cn(
              "h-2 rounded-full transition-all duration-200",
              s === step ? "w-6 bg-primary" : s < step ? "w-2 bg-primary/50" : "w-2 bg-muted"
            )}
          />
        ))}
        <span className="ml-1 text-xs text-muted-foreground">
          {t.stapIndicator(step, TOTAL_STEPS)}
        </span>
      </div>

      {/* Step 1 — Uitleg */}
      {step === 1 && (
        <div key="step1" className="animate-[fadeSlideIn_200ms_ease-out_both]">
          <div className="space-y-4 py-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-8 w-8 shrink-0 text-primary mt-0.5" aria-hidden="true" />
              <div>
                <h3 className="font-semibold text-base">{t.stap1Titel}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t.stap1Uitleg}</p>
              </div>
            </div>
            <ul className="ml-11 space-y-2">
              {[t.stap1Bullet1, t.stap1Bullet2, t.stap1Bullet3].map((bullet) => (
                <li key={bullet} className="flex gap-2 text-sm">
                  <Check className="h-4 w-4 shrink-0 text-success mt-0.5" aria-hidden="true" />
                  {bullet}
                </li>
              ))}
            </ul>
            <div className="rounded-lg border border-warning bg-warning-100 p-3">
              <p className="text-sm text-warning">
                <Info className="mr-1 inline h-4 w-4" aria-hidden="true" />
                {t.stap1Callout}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              {t.annuleren}
            </Button>
            <Button onClick={() => setStep(2)}>{t.volgende}</Button>
          </DialogFooter>
        </div>
      )}

      {/* Step 2 — Instellingen */}
      {step === 2 && (
        <div key="step2" className="animate-[fadeSlideIn_200ms_ease-out_both]">
          <div className="space-y-4 py-4">
            <h3 className="flex items-center gap-2 font-semibold">
              <Users className="h-5 w-5 text-primary" aria-hidden="true" />
              {t.stap2Titel}
            </h3>
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
            <div>
              <p className="mb-2 text-sm font-medium">{t.stap2ErfgenamenLabel}</p>
              <div className="space-y-1">
                {erfgenamen.map((e, i) => (
                  <div
                    key={e.id}
                    className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2 text-sm"
                  >
                    <Users className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <span>{displayName(e)}</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {t.deel(i + 1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStep(1)}>
              {t.vorige}
            </Button>
            <Button onClick={() => setStep(3)}>{t.volgende}</Button>
          </DialogFooter>
        </div>
      )}

      {/* Step 3 — Beveiliging */}
      {step === 3 && (
        <div key="step3" className="animate-[fadeSlideIn_200ms_ease-out_both]">
          <div className="space-y-4 py-4">
            <h3 className="flex items-center gap-2 font-semibold">
              <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
              {t.stap3Titel}
            </h3>
            <div className="rounded-lg border border-warning bg-warning-100 p-3">
              <p className="text-sm text-warning">
                <strong>{t.waarschuwing}</strong> {t.waarschuwingTekst}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="shamir-password">{t.wachtwoord}</Label>
              <Input
                id="shamir-password"
                type="password"
                value={password}
                onChange={(e) => onPasswordChange(e.target.value)}
                placeholder={t.wachtwoordPlaceholder}
                autoComplete="current-password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStep(2)}>
              {t.vorige}
            </Button>
            <Button onClick={onGenerate} disabled={generating || !password}>
              {generating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t.genererenBezig}
                </>
              ) : (
                <>
                  <KeyRound className="mr-2 h-4 w-4" />
                  {t.genereren}
                </>
              )}
            </Button>
          </DialogFooter>
        </div>
      )}

      {/* Step 4 — Verdelen */}
      {step === 4 && generatedShares && (
        <div key="step4" className="animate-[fadeSlideIn_200ms_ease-out_both]">
          <div className="space-y-4 py-4">
            <Alert variant="success">
              <AlertDescription>
                <strong>{t.succes}</strong>{" "}
                {t.succesTekst(generatedShares.totaalAantalDelen, generatedShares.drempel)}
              </AlertDescription>
            </Alert>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{t.stap4Titel}</h3>
              <span
                className={cn(
                  "text-xs font-medium",
                  allCopied ? "text-success" : "text-muted-foreground"
                )}
              >
                {allCopied
                  ? t.stap4AlleGekopieerd
                  : t.stap4NogTeKopieren(generatedShares.delen.length - copiedSet.size)}
              </span>
            </div>
            <div className="space-y-3">
              {generatedShares.delen.map((share, i) => (
                <div
                  key={share.index}
                  className={cn(
                    "rounded-md border p-3 space-y-2 transition-colors",
                    copiedSet.has(share.index) && "border-success/40 bg-success/5"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {t.deel(share.index)} &mdash;{" "}
                      {erfgenamen[i] ? displayName(erfgenamen[i]) : t.erfgenaamFallback(i + 1)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyShare(share.index, share.waarde)}
                    >
                      {copiedSet.has(share.index) ? (
                        <>
                          <Check className="mr-1 h-3 w-3 text-success" /> {t.gekopieerd}
                        </>
                      ) : (
                        <>
                          <Copy className="mr-1 h-3 w-3" /> {t.kopieren}
                        </>
                      )}
                    </Button>
                  </div>
                  <code className="block w-full break-all rounded bg-muted p-2 font-mono text-xs">
                    {share.waarde}
                  </code>
                  <p className="text-xs text-muted-foreground">
                    {t.stap4CodeFormaat}
                  </p>
                </div>
              ))}
            </div>
            {!allCopied && (
              <p className="text-xs text-muted-foreground text-center">
                {t.stap1Callout}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button onClick={onClose} disabled={!allCopied}>
              {t.sluiten}
            </Button>
          </DialogFooter>
        </div>
      )}
    </Dialog>
  );
}
