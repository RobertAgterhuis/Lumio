"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { usePreferencesStore, type DashboardPreferences } from "@/stores/preferencesStore";
import { LanguageSelector } from "@/components/common/LanguageSelector";
import { api } from "@/lib/api-client";
import {
  getIdleTimeoutMinutes,
  setIdleTimeoutMinutes,
} from "@/hooks/useIdleTimer";
import { useTranslations, useLocale } from "next-intl";
import {
  Timer,
  Type,
  Globe,
  LayoutDashboard,
  Eye,
  EyeOff,
  RefreshCw,
  Check,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from "lucide-react";

const TIMEOUT_VALUES = [1, 2, 5, 10, 15, 30, 0];

interface DashboardToggleProps {
  sectionKey: keyof DashboardPreferences;
  label: string;
}

function DashboardToggle({ sectionKey, label }: DashboardToggleProps) {
  const value = usePreferencesStore((s) => s[sectionKey]);
  const toggle = usePreferencesStore((s) => s.toggleSection);
  return (
    <button
      type="button"
      onClick={() => toggle(sectionKey)}
      className="flex items-center justify-between w-full rounded-lg border p-3 hover:bg-muted/50 transition-colors"
    >
      <span className="text-sm font-medium">{label}</span>
      {value ? (
        <Eye className="h-4 w-4 text-primary" />
      ) : (
        <EyeOff className="h-4 w-4 text-muted-foreground" />
      )}
    </button>
  );
}

/**
 * Auto-lock timeout card for setting the idle timeout duration.
 */
export function AutoLockCard() {
  const t = useTranslations("instellingen");
  const [idleTimeout, setIdleTimeout] = useState(() => getIdleTimeoutMinutes());

  const handleIdleTimeoutChange = (value: number) => {
    setIdleTimeout(value);
    setIdleTimeoutMinutes(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Timer className="h-5 w-5" /> {t("autoLock.titel")}
        </CardTitle>
        <CardDescription>{t("autoLock.beschrijving")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {TIMEOUT_VALUES.map((value) => (
            <Button
              key={value}
              variant={idleTimeout === value ? "default" : "outline"}
              size="sm"
              onClick={() => handleIdleTimeoutChange(value)}
            >
              {t(`timeoutOpties.${value}`)}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Card for toggling large text mode (accessibility feature).
 */
export function GroteTekstCard() {
  const t = useTranslations("instellingen");
  const [groteTekst, setGroteTekst] = useState(() => {
    if (typeof window === "undefined") return false;
    const saved = localStorage.getItem("lumio-grote-tekst");
    if (saved === "true") {
      document.documentElement.classList.add("grote-tekst");
      return true;
    }
    return false;
  });

  const toggleGroteTekst = (aan: boolean) => {
    setGroteTekst(aan);
    if (aan) {
      document.documentElement.classList.add("grote-tekst");
      localStorage.setItem("lumio-grote-tekst", "true");
    } else {
      document.documentElement.classList.remove("grote-tekst");
      localStorage.removeItem("lumio-grote-tekst");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Type className="h-5 w-5" /> {t("groteTekst.titel")}
        </CardTitle>
        <CardDescription>{t("groteTekst.beschrijving")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <Button
            variant={!groteTekst ? "default" : "outline"}
            size="sm"
            onClick={() => toggleGroteTekst(false)}
          >
            {t("groteTekst.normaal")}
          </Button>
          <Button
            variant={groteTekst ? "default" : "outline"}
            size="sm"
            onClick={() => toggleGroteTekst(true)}
          >
            {t("groteTekst.groot")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Card for configuring dashboard widget visibility.
 */
export function DashboardWeergaveCard() {
  const t = useTranslations("instellingen");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LayoutDashboard className="h-5 w-5" /> {t("dashboardWeergave.titel")}
        </CardTitle>
        <CardDescription>{t("dashboardWeergave.beschrijving")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <DashboardToggle
          sectionKey="showVoortgang"
          label={t("dashboardWeergave.voortgang")}
        />
        <DashboardToggle
          sectionKey="showVoortgangGranulair"
          label={t("dashboardWeergave.voortgangGranulair")}
        />
        <DashboardToggle
          sectionKey="showSuggesties"
          label={t("dashboardWeergave.suggesties")}
        />
        <DashboardToggle
          sectionKey="showDomeinKaarten"
          label={t("dashboardWeergave.domeinKaarten")}
        />
        <div className="pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => usePreferencesStore.getState().resetDashboard()}
          >
            {t("dashboardWeergave.allesHerstellen")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Card for language selection.
 */
export function TaalkeuzeCard() {
  const t = useTranslations("instellingen");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" /> {t("taal.titel")}
        </CardTitle>
        <CardDescription>{t("taal.beschrijving")}</CardDescription>
      </CardHeader>
      <CardContent>
        <LanguageSelector />
      </CardContent>
    </Card>
  );
}

/**
 * Card for periodic data review/confirmation (actualisatie).
 */
export function ActualisatieCard() {
  const t = useTranslations("instellingen");
  const locale = useLocale();

  interface ActualisatieDomein {
    domein: string;
    label: string;
    laatsteBevestiging: string | null;
    actualisatieNodig: boolean;
  }

  const [actualisatieDomeinen, setActualisatieDomeinen] = useState<ActualisatieDomein[]>([]);
  const [actualisatieConfirming, setActualisatieConfirming] = useState<string | null>(null);
  const [actualisatieMessage, setActualisatieMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    const loadActualisatie = async () => {
      try {
        const data = await api.get<{
          domeinen: ActualisatieDomein[];
          herinneringNodig: boolean;
        }>("/api/status/actualisatie");
        setActualisatieDomeinen(data.domeinen);
      } catch {
        // Ignore
      }
    };
    loadActualisatie();
  }, []);

  const reloadActualisatie = async () => {
    try {
      const data = await api.get<{
        domeinen: ActualisatieDomein[];
        herinneringNodig: boolean;
      }>("/api/status/actualisatie");
      setActualisatieDomeinen(data.domeinen);
    } catch {
      // Ignore
    }
  };

  const handleBevestigAlles = async () => {
    setActualisatieConfirming("alles");
    setActualisatieMessage(null);
    try {
      await api.post("/api/status/actualisatie/alles", {});
      await reloadActualisatie();
      setActualisatieMessage({ type: "success", text: t("actualisatie.bevestigdSucces") });
    } catch {
      setActualisatieMessage({ type: "error", text: t("actualisatie.bevestigdFout") });
    } finally {
      setActualisatieConfirming(null);
    }
  };

  const handleBevestigDomein = async (domein: string) => {
    setActualisatieConfirming(domein);
    setActualisatieMessage(null);
    try {
      await api.post(`/api/status/actualisatie/${domein}`, {});
      await reloadActualisatie();
    } catch {
      setActualisatieMessage({ type: "error", text: t("actualisatie.bevestigdFout") });
    } finally {
      setActualisatieConfirming(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" /> {t("actualisatie.titel")}
        </CardTitle>
        <CardDescription>{t("actualisatie.beschrijving")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {actualisatieDomeinen.length > 0 ? (
          <>
            <div className="grid gap-2 sm:grid-cols-2">
              {actualisatieDomeinen.map((d) => (
                <div
                  key={d.domein}
                  className={`flex items-center justify-between rounded-lg border p-3 ${
                    d.actualisatieNodig
                      ? "border-warning bg-warning-100 dark:bg-warning/20"
                      : "border-border"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {d.actualisatieNodig ? (
                      <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{d.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {d.laatsteBevestiging
                          ? t("actualisatie.gecontroleerd", {
                              datum: new Date(d.laatsteBevestiging).toLocaleDateString(locale),
                            })
                          : t("actualisatie.nietGecontroleerd")}
                      </p>
                    </div>
                  </div>
                  {d.actualisatieNodig && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0 ml-2"
                      disabled={actualisatieConfirming !== null}
                      onClick={() => handleBevestigDomein(d.domein)}
                    >
                      {actualisatieConfirming === d.domein ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Check className="h-3 w-3" />
                      )}
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {actualisatieMessage && (
              <p
                className={`text-sm ${
                  actualisatieMessage.type === "success" ? "text-success" : "text-danger"
                }`}
              >
                {actualisatieMessage.text}
              </p>
            )}

            {actualisatieDomeinen.some((d) => d.actualisatieNodig) && (
              <Button
                onClick={handleBevestigAlles}
                disabled={actualisatieConfirming !== null}
              >
                {actualisatieConfirming === "alles" && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {t("actualisatie.allesBevestigen")}
              </Button>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">{t("actualisatie.laden")}</p>
        )}
      </CardContent>
    </Card>
  );
}
