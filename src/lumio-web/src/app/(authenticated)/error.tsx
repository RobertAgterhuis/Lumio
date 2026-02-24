"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function AuthenticatedError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errors.page");

  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="text-center space-y-4 max-w-md">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="text-xl font-semibold">{t("titel")}</h2>
        <p className="text-sm text-muted-foreground">
          {t("beschrijving")}
        </p>
        <div className="flex justify-center gap-3">
          <Button
            variant="outline"
            onClick={() => window.location.assign("/dashboard")}
          >
            {t("naarDashboard")}
          </Button>
          <Button onClick={reset}>{t("opnieuw")}</Button>
        </div>
      </div>
    </div>
  );
}
