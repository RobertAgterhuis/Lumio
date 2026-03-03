"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api, ApiError } from "@/lib/api-client";
import { useAuthStore } from "@/stores/authStore";
import { useTranslations } from "next-intl";
import { Lock, Eye, EyeOff, Info } from "lucide-react";

export function UnlockForm({ onHeirMode }: { onHeirMode?: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { setUnlocked } = useAuthStore();
  const t = useTranslations("auth.ontgrendel");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/api/auth/ontgrendel", { wachtwoord: password });
      setUnlocked(true);
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        const seconds = (err as ApiError & { lockoutRemainingSeconds?: number }).lockoutRemainingSeconds ?? 0;
        const minutes = Math.max(1, Math.ceil(seconds / 60));
        setError(t("geblokkerd", { minuten: minutes }));
      } else if (err instanceof ApiError) {
        setError(err.detail || t("mislukt"));
      } else {
        setError(err instanceof Error ? err.message : t("mislukt"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Lock aria-hidden="true" className="h-8 w-8 text-primary" />
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
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? t("wachtwoordVerbergen") : t("wachtwoordTonen")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff aria-hidden="true" className="h-4 w-4" /> : <Eye aria-hidden="true" className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={loading || !password}>
            {loading ? t("bezig") : t("ontgrendelen")}
          </Button>

          {/* SP-UX-01-004: Nabestaanden entry-point — REC-UX-002 + REC-UXDESIGN-003 */}
          {onHeirMode && (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={onHeirMode}
            >
              {t("erfgenaamKnop")}
            </Button>
          )}
        </form>
        <div className="mt-4 rounded-md border border-border/50 bg-muted/30 p-3 flex gap-2">
          <Info aria-hidden="true" className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-medium text-muted-foreground">{t("wachtwoordVergetenTitel")}</p>
            <p className="text-xs text-muted-foreground/80 mt-0.5">{t("wachtwoordVergetenTekst")}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
