"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useDomainQuery } from "@/hooks";
import { useTranslations } from "next-intl";
import {
  User,
  Phone,
  ScrollText,
  Church,
  Download,
  Users,
  ChevronRight,
  Check,
  Sparkles,
  X,
} from "lucide-react";

interface OnboardingStap {
  id: string;
  stapKey: string;
  icon: React.ElementType;
  href: string;
}

const ONBOARDING_KEY = "lumio_onboarding_completed";

const stappen: OnboardingStap[] = [
  { id: "profiel", stapKey: "profiel", icon: User, href: "/eigenaar" },
  { id: "noodcontacten", stapKey: "noodcontacten", icon: Phone, href: "/noodcontacten" },
  { id: "testament", stapKey: "testament", icon: ScrollText, href: "/testament" },
  { id: "uitvaart", stapKey: "uitvaart", icon: Church, href: "/uitvaart" },
  { id: "erfgenamen", stapKey: "erfgenamen", icon: Users, href: "/erfgenamen" },
  { id: "backup", stapKey: "backup", icon: Download, href: "/instellingen" },
];

export function OnboardingWizard() {
  const router = useRouter();
  const t = useTranslations("wizard");
  const [visible, setVisible] = useState(false);
  const [localStorageChecked, setLocalStorageChecked] = useState(false);

  // Load data with React Query
  const { data: eigenaar, isLoading: loadingEigenaar } = useDomainQuery<{ id?: string } | null>("eigenaar");
  const { data: noodcontacten, isLoading: loadingNoodcontacten } = useDomainQuery<unknown[] | null>("noodcontacten");
  const { data: testament, isLoading: loadingTestament } = useDomainQuery<{ id?: string } | null>("testament");
  const { data: uitvaart, isLoading: loadingUitvaart } = useDomainQuery<{ id?: string } | null>("uitvaart");
  const { data: erfgenamen, isLoading: loadingErfgenamen } = useDomainQuery<unknown[] | null>("erfgenamen");
  const { data: statusMeldingen, isLoading: loadingStatus } = useDomainQuery<{ meldingen: { categorie: string }[] } | null>("status/meldingen");

  const loading = loadingEigenaar || loadingNoodcontacten || loadingTestament || loadingUitvaart || loadingErfgenamen || loadingStatus;

  // Derive completion status from query data
  const stapStatus = useMemo(() => ({
    profiel: !!eigenaar?.id,
    noodcontacten: Array.isArray(noodcontacten) && noodcontacten.length > 0,
    testament: !!testament?.id,
    uitvaart: !!uitvaart?.id,
    erfgenamen: Array.isArray(erfgenamen) && erfgenamen.length > 0,
    backup: !statusMeldingen?.meldingen?.some((m) => m.categorie === "backup"),
  }), [eigenaar, noodcontacten, testament, uitvaart, erfgenamen, statusMeldingen]);

  // Check localStorage and determine visibility
  useEffect(() => {
    const completed = localStorage.getItem(ONBOARDING_KEY);
    if (completed === "true") {
      setVisible(false);
    }
    setLocalStorageChecked(true);
  }, []);

  // Auto-complete onboarding when all steps done
  useEffect(() => {
    if (!localStorageChecked || loading) return;

    const allDone = stappen.every((s) => stapStatus[s.id as keyof typeof stapStatus]);
    if (allDone) {
      localStorage.setItem(ONBOARDING_KEY, "true");
      setVisible(false);
    } else {
      const completed = localStorage.getItem(ONBOARDING_KEY);
      if (completed !== "true") {
        setVisible(true);
      }
    }
  }, [localStorageChecked, loading, stapStatus]);

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setVisible(false);
  };

  const handleNavigate = (href: string) => {
    router.push(href);
  };

  const completedCount = stappen.filter((s) => stapStatus[s.id as keyof typeof stapStatus]).length;

  if (loading || !localStorageChecked || !visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-lg rounded-xl border border-border bg-background shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{t("welkom")}</h2>
              <p className="text-sm text-muted-foreground">
                {t("doorloop")}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={handleComplete}
            title={t("sluiten")}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Progress */}
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {t("voltooid", { voltooid: completedCount, totaal: stappen.length })}
            </span>
            <span className="font-medium text-primary">
              {Math.round((completedCount / stappen.length) * 100)}%
            </span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${(completedCount / stappen.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="max-h-[400px] overflow-y-auto px-6 py-4 space-y-2">
          {stappen.map((stap) => {
            const isDone = stapStatus[stap.id as keyof typeof stapStatus];
            const Icon = stap.icon;
            return (
              <Card
                key={stap.id}
                className={cn(
                  "cursor-pointer transition-colors hover:bg-muted/50",
                  isDone && "bg-success-100 border-success"
                )}
                onClick={() => !isDone && handleNavigate(stap.href)}
              >
                <CardContent className="flex items-center gap-4 p-4">
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                      isDone
                        ? "bg-success-100 text-success"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {isDone ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        isDone && "text-success"
                      )}
                    >
                      {t(`stappen.${stap.stapKey}.titel`)}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {t(`stappen.${stap.stapKey}.beschrijving`)}
                    </p>
                  </div>
                  {!isDone && (
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-6 py-4">
          <Button variant="ghost" onClick={handleComplete}>
            {t("laterInvullen")}
          </Button>
          {completedCount === stappen.length && (
            <Button onClick={handleComplete}>
              <Check className="h-4 w-4 mr-2" />
              {t("afronden")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
