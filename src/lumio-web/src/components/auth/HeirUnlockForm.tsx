"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/lib/api-client";
import { useAuthStore } from "@/stores/authStore";
import { useTranslations } from "next-intl";
import { KeyRound, Plus, Trash2, Loader2, Unlock, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type Step = "intro" | "codes";

export function HeirUnlockForm() {
  const { setUnlocked, setReadOnly, setProfileSelected } = useAuthStore();
  const [step, setStep] = useState<Step>("intro");
  const [shares, setShares] = useState<string[]>([""]);
  const [error, setError] = useState<string | null>(null);
  const [reconstructing, setReconstructing] = useState(false);
  const t = useTranslations("auth.erfgenaam");

  const addShare = () => setShares((s) => [...s, ""]);

  const removeShare = (index: number) =>
    setShares((s) => s.filter((_, i) => i !== index));

  const updateShare = (index: number, value: string) =>
    setShares((s) => s.map((v, i) => (i === index ? value : v)));

  const handleReconstruct = async () => {
    setError(null);
    const validShares = shares.filter((s) => s.trim().length > 0);
    if (validShares.length < 2) {
      setError(t("minimaalCodes"));
      return;
    }

    setReconstructing(true);
    try {
      // Single-step: reconstruct + unlock server-side (S2-01 security fix)
      await api.post(
        "/api/shamir/reconstrueer-en-ontgrendel",
        { delen: validShares }
      );

      // Erfgenaam-toegang is altijd read-only
      setReadOnly(true);
      setUnlocked(true);
    } catch {
      setError("FAILED");
    } finally {
      setReconstructing(false);
    }
  };

  const profileLink = (
    <button
      onClick={() => setProfileSelected(false)}
      className="mt-4 text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
    >
      {t("anderProfiel")}
    </button>
  );

  if (step === "intro") {
    return (
      <>
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
              <KeyRound className="h-6 w-6 text-accent" />
            </div>
            <CardTitle>{t("introTitel")}</CardTitle>
            <CardDescription>{t("introBeschrijving")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border bg-muted/40 p-4 space-y-3">
              <p className="text-sm font-medium flex items-center gap-2">
                <Info className="h-4 w-4 text-accent shrink-0" />
                {t("introHoeWerktHet")}
              </p>
              <ol className="space-y-2 text-sm text-muted-foreground list-none">
                <li className="flex gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/20 text-xs font-semibold text-accent">1</span>
                  {t("introStap1")}
                </li>
                <li className="flex gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/20 text-xs font-semibold text-accent">2</span>
                  {t("introStap2")}
                </li>
                <li className="flex gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/20 text-xs font-semibold text-accent">3</span>
                  {t("introStap3")}
                </li>
              </ol>
            </div>
            <Button className="w-full" onClick={() => setStep("codes")}>
              <Unlock className="h-4 w-4 mr-2" />
              {t("introStarten")}
            </Button>
          </CardContent>
        </Card>
        {profileLink}
      </>
    );
  }

  return (
    <>
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
            <KeyRound className="h-6 w-6 text-accent" />
          </div>
          <CardTitle>{t("titel")}</CardTitle>
          <CardDescription>
            {t("beschrijving")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert variant="info">
              <AlertDescription>
                {t("instructie")}
              </AlertDescription>
            </Alert>
            <div className="space-y-3">
              {shares.map((share, i) => (
                <div key={i} className="flex gap-2">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">{t("codeLabel", { nummer: i + 1 })}</Label>
                    <Input
                      value={share}
                      onChange={(e) => updateShare(i, e.target.value)}
                      placeholder={t("codePlaceholder")}
                      className="font-mono text-xs"
                    />
                  </div>
                  {shares.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-6"
                      onClick={() => removeShare(i)}
                    >
                      <Trash2 className="h-4 w-4 text-danger" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={addShare}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" /> {t("codeToevoegen")}
            </Button>

            {error && (
              error === "FAILED" ? (
                <Alert variant="danger">
                  <AlertTitle>{t("reconstructieMisluktTitel")}</AlertTitle>
                  <AlertDescription>
                    <ol className="mt-2 space-y-1 text-sm list-none">
                      <li className="flex gap-2">
                        <span className="font-semibold shrink-0">1.</span>
                        {t("reconstructieMisluktStap1")}
                      </li>
                      <li className="flex gap-2">
                        <span className="font-semibold shrink-0">2.</span>
                        {t("reconstructieMisluktStap2")}
                      </li>
                      <li className="flex gap-2">
                        <span className="font-semibold shrink-0">3.</span>
                        {t("reconstructieMisluktStap3")}
                      </li>
                    </ol>
                  </AlertDescription>
                </Alert>
              ) : (
                <p className="text-sm text-danger text-center">{error}</p>
              )
            )}

            <Button
              className="w-full"
              onClick={handleReconstruct}
              disabled={reconstructing}
            >
              {reconstructing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t("bezig")}
                </>
              ) : (
                <>
                  <Unlock className="h-4 w-4 mr-2" />
                  {t("ontgrendelen")}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
      {profileLink}
    </>
  );
}
