"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { api } from "@/lib/api-client";
import { useAuthStore } from "@/stores/authStore";
import { useTranslations } from "next-intl";
import { Shield, Eye, EyeOff } from "lucide-react";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function SetupForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avgConsent, setAvgConsent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { setUnlocked, setFirstRun } = useAuthStore();
  const t = useTranslations("auth.setup");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError(t("foutMinimaal"));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("foutOvereenkomst"));
      return;
    }

    if (!avgConsent) {
      setError(t("avgConsentFout"));
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/auth/setup", { wachtwoord: password });
      setFirstRun(false);
      setUnlocked(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("foutSetup"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Shield className="h-8 w-8 text-primary" />
        </div>
        <CardTitle>{t("titel")}</CardTitle>
        <CardDescription>
          {t("beschrijving")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">{t("wachtwoord")}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("wachtwoordPlaceholder")}
                required
                autoFocus
                className="pr-10"
              />
              <button
                type="button"
                aria-label={showPassword ? t("verbergWachtwoord") : t("toonWachtwoord")}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <PasswordStrengthMeter password={password} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm">{t("bevestig")}</Label>
            <div className="relative">
              <Input
                id="confirm"
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t("bevestigPlaceholder")}
                required
                className="pr-10"
              />
              <button
                type="button"
                aria-label={showConfirm ? t("verbergWachtwoord") : t("toonWachtwoord")}
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {/* AVG art.9 consent — verplicht voor bijzondere categorieën (gezondheid, euthanasie, donorregistratie) */}
          <div className="rounded-md border border-secure/30 bg-secure-100 p-3">
            <Checkbox
              id="avg-consent"
              checked={avgConsent}
              onChange={(e) => setAvgConsent(e.target.checked)}
              label={t("avgConsent")}
              className="mt-0.5 shrink-0"
            />
          </div>

          <Alert variant="warning">
            <AlertDescription>
              {t("wachtwoordWaarschuwing")}
            </AlertDescription>
          </Alert>

          <Button type="submit" className="w-full" disabled={loading || !avgConsent}>
            {loading ? t("bezig") : t("aanmaken")}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            {t("disclaimer")}
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
