"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { usePreferencesStore, type BooleanPreferenceKey } from "@/stores/preferencesStore";
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
  sectionKey: BooleanPreferenceKey;
  label: string;
}

function DashboardToggle({ sectionKey, label }: DashboardToggleProps) {
  const value = usePreferencesStore((s) => s[sectionKey] as boolean);
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

const DOMEIN_KAARTEN = [
  { domein: "eigenaar", domeinKey: "eigenaar" },
  { domein: "noodcontacten", domeinKey: "noodcontacten" },
  { domein: "testament", domeinKey: "testament" },
  { domein: "euthanasie", domeinKey: "euthanasie" },
  { domein: "donor", domeinKey: "donor" },
  { domein: "uitvaart", domeinKey: "uitvaart" },
  { domein: "erfgenamen", domeinKey: "erfgenamen" },
  { domein: "boedel", domeinKey: "boedel" },
  { domein: "digitaal-bezit", domeinKey: "digitaalBezit" },
  { domein: "documenten", domeinKey: "documenten" },
] as const;

function DomeinKaartToggle({ domein, label }: { domein: string; label: string }) {
  const isHidden = usePreferencesStore((s) => s.hiddenDomeinKaarten.includes(domein));
  const toggle = usePreferencesStore((s) => s.toggleDomeinKaart);
  return (
    <button
      type="button"
      onClick={() => toggle(domein)}
      className="flex items-center justify-between w-full rounded-lg border p-3 hover:bg-muted/50 transition-colors"
    >
      <span className="text-sm font-medium">{label}</span>
      {!isHidden ? (
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
    <Card className="overflow-hidden">
      <div className="bg-primary-100 px-4 py-3 flex items-center gap-3 border-b border-black/5 dark:border-white/10">
        <Timer className="h-5 w-5 text-primary shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-primary leading-tight">{t("autoLock.titel")}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{t("autoLock.beschrijving")}</p>
        </div>
      </div>
      <CardContent className="pt-5">
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
    <Card className="overflow-hidden">
      <div className="bg-primary-100 px-4 py-3 flex items-center gap-3 border-b border-black/5 dark:border-white/10">
        <Type className="h-5 w-5 text-primary shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-primary leading-tight">{t("groteTekst.titel")}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{t("groteTekst.beschrijving")}</p>
        </div>
      </div>
      <CardContent className="pt-5">
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
  const tDash = useTranslations("dashboard");

  return (
    <Card className="overflow-hidden">
      <div className="bg-primary-100 px-4 py-3 flex items-center gap-3 border-b border-black/5 dark:border-white/10">
        <LayoutDashboard className="h-5 w-5 text-primary shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-primary leading-tight">{t("dashboardWeergave.titel")}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{t("dashboardWeergave.beschrijving")}</p>
        </div>
      </div>
      <CardContent className="pt-5 space-y-3">
        <DashboardToggle
          sectionKey="showVoortgang"
          label={t("dashboardWeergave.voortgang")}
        />
        <DashboardToggle
          sectionKey="showStatistieken"
          label={t("dashboardWeergave.statistieken")}
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
          sectionKey="showMeldingen"
          label={t("dashboardWeergave.meldingen")}
        />
        <DashboardToggle
          sectionKey="showBackup"
          label={t("dashboardWeergave.backup")}
        />
        <DashboardToggle
          sectionKey="showAanbevolen"
          label={t("dashboardWeergave.aanbevolen")}
        />
        <DashboardToggle
          sectionKey="showVerloopdatum"
          label={t("dashboardWeergave.verloopdatum")}
        />
        <div className="pt-3 border-t">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            {t("dashboardWeergave.domeinKaarten")}
          </p>
          <div className="space-y-2">
            {DOMEIN_KAARTEN.map(({ domein, domeinKey }) => (
              <DomeinKaartToggle
                key={domein}
                domein={domein}
                label={tDash(`domein.${domeinKey}.titel`)}
              />
            ))}
          </div>
        </div>
        <div className="pt-2 flex gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => usePreferencesStore.getState().resetDashboard()}
          >
            {t("dashboardWeergave.allesHerstellen")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => usePreferencesStore.getState().resetDismissedBanners()}
          >
            {t("dashboardWeergave.meldingenHerstellen")}
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
    <Card className="overflow-hidden">
      <div className="bg-primary-100 px-4 py-3 flex items-center gap-3 border-b border-black/5 dark:border-white/10">
        <Globe className="h-5 w-5 text-primary shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-primary leading-tight">{t("taal.titel")}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{t("taal.beschrijving")}</p>
        </div>
      </div>
      <CardContent className="pt-5">
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

  useEffect(() => {
    reloadActualisatie();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
    <Card className="overflow-hidden">
      <div className="bg-primary-100 px-4 py-3 flex items-center gap-3 border-b border-black/5 dark:border-white/10">
        <RefreshCw className="h-5 w-5 text-primary shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-primary leading-tight">{t("actualisatie.titel")}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{t("actualisatie.beschrijving")}</p>
        </div>
      </div>
      <CardContent className="pt-5 space-y-4">
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
