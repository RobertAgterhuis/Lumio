"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDomainQuery } from "@/hooks";
import { api } from "@/lib/api-client";
import { useAuthStore } from "@/stores/authStore";
import { usePreferencesStore, type DashboardPreferences, type BooleanPreferenceKey } from "@/stores/preferencesStore";
import { NabestaandenDashboard } from "@/components/nabestaanden/NabestaandenDashboard";
import { StatistiekenWidget } from "@/components/dashboard/StatistiekenWidget";
import { VoortgangGranulair } from "@/components/dashboard/VoortgangGranulair";
import { ProfielSuggesties } from "@/components/dashboard/ProfielSuggesties";
import { MeldingenWidget } from "@/components/dashboard/MeldingenWidget";
import { BackupStatusWidget } from "@/components/dashboard/BackupStatusWidget";
import { AanbevolenStapWidget } from "@/components/dashboard/AanbevolenStapWidget";
import { DocumentenVerloopdatumWidget } from "@/components/dashboard/DocumentenVerloopdatumWidget";
import { InterviewWizard } from "@/components/interview/InterviewWizard";
import { useTranslations } from "next-intl";
import {
  ScrollText,
  ArrowRight,
  User,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Clock,
  EyeOff,
  Sparkles,
} from "lucide-react";
import { LumioIcon, type LumioIconName } from "@/components/ui/lumio-icon";

interface DomeinStatus {
  domein: string;
  label: string;
  ingevuld: boolean;
}

interface Compleetheid {
  percentage: number;
  aantalIngevuld: number;
  totaal: number;
  domeinen: DomeinStatus[];
}

const domainCards: Array<{
  href: string;
  domein: string;
  lumioIcon: LumioIconName;
  domeinKey: string;
  color: string;
  bgColor: string;
}> = [
  {
    href: "/eigenaar",
    domein: "eigenaar",
    lumioIcon: "profiel",
    domeinKey: "eigenaar",
    color: "text-muted-foreground",
    bgColor: "bg-muted",
  },
  {
    href: "/noodcontacten",
    domein: "noodcontacten",
    lumioIcon: "noodcontacten",
    domeinKey: "noodcontacten",
    color: "text-danger",
    bgColor: "bg-danger-100",
  },
  {
    href: "/testament",
    domein: "testament",
    lumioIcon: "testament",
    domeinKey: "testament",
    color: "text-info",
    bgColor: "bg-info-100",
  },
  {
    href: "/euthanasie",
    domein: "euthanasie",
    lumioIcon: "wilsverklaring",
    domeinKey: "euthanasie",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    href: "/donor",
    domein: "donor",
    lumioIcon: "donor",
    domeinKey: "donor",
    color: "text-success",
    bgColor: "bg-success-100",
  },
  {
    href: "/uitvaart",
    domein: "uitvaart",
    lumioIcon: "uitvaart",
    domeinKey: "uitvaart",
    color: "text-warning",
    bgColor: "bg-warning-100",
  },
  {
    href: "/erfgenamen",
    domein: "erfgenamen",
    lumioIcon: "erfgenamen",
    domeinKey: "erfgenamen",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    href: "/boedel",
    domein: "boedel",
    lumioIcon: "boedel",
    domeinKey: "boedel",
    color: "text-warning",
    bgColor: "bg-warning-100",
  },
  {
    href: "/digitaal-bezit",
    domein: "digitaal-bezit",
    lumioIcon: "digitaal-bezit",
    domeinKey: "digitaalBezit",
    color: "text-success",
    bgColor: "bg-success-100",
  },
  {
    href: "/documenten",
    domein: "documenten",
    lumioIcon: "documenten",
    domeinKey: "documenten",
    color: "text-info",
    bgColor: "bg-info-100",
  },
];

interface ActualisatieDomein {
  domein: string;
  label: string;
  isAfgerond: boolean;
  laatsteBevestiging: string | null;
  actualisatieNodig: boolean;
}

export default function DashboardPage() {
  const { isReadOnly } = useAuthStore();
  const {
    showVoortgang, showStatistieken, showVoortgangGranulair, showSuggesties,
    hiddenDomeinKaarten,
    showMeldingen, showBackup, showAanbevolen, showVerloopdatum,
    toggleSection, toggleDomeinKaart,
  } = usePreferencesStore();
  const [showInterview, setShowInterview] = useState(false);
  const [showJuridisch, setShowJuridisch] = useState(false);
  const t = useTranslations("dashboard");

  // Load persistent dismiss state for the legal notice
  useEffect(() => {
    const key = `lumio_juridisch_begrepen`;
    if (!localStorage.getItem(key)) {
      setShowJuridisch(true);
    }
  }, []);

  const handleJuridischDismiss = () => {
    localStorage.setItem(`lumio_juridisch_begrepen`, "1");
    setShowJuridisch(false);
  };

  // React Query hooks for dashboard data
  const { data: eigenaarData, isSuccess: hasProfile } = useDomainQuery<{ voornaam?: string } | null>("eigenaar");
  const { data: compleetheid } = useDomainQuery<Compleetheid>("status/compleetheid", { staleTime: 0 });
  const { data: actualisatieData, refetch: refetchActualisatie } = useDomainQuery<{ domeinen: ActualisatieDomein[]; herinneringNodig: boolean }>("status/actualisatie", { staleTime: 0 });
  const actualisatie = actualisatieData?.domeinen ?? [];

  // Derive the first unfilled domain — same logic as AanbevolenStapWidget
  const aanbevolenDomein = compleetheid?.domeinen.find((d) => !d.ingevuld)?.domein ?? null;

  type CardStatus = "afgerond" | "reviewNodig" | "bezig" | "beginnen";

  const getCardStatus = (domein: string): CardStatus => {
    // S4-02: server-driven isAfgerond (not localStorage)
    const actualisatieDomein = actualisatie.find((a) => a.domein === domein);
    const isAfgerond = actualisatieDomein?.isAfgerond ?? false;
    const actualisatieNodig = actualisatieDomein?.actualisatieNodig ?? false;
    const hasData = getDomeinStatus(domein);
    // S4-03: reviewNodig also when domain has data but hasnt been explicitly reviewed yet
    const needsReview = (isAfgerond || hasData === true) && actualisatieNodig;
    if (needsReview) return "reviewNodig";
    if (isAfgerond) return "afgerond";
    if (hasData) return "bezig";
    return "beginnen";
  };

  const HideButton = ({ section, label }: { section: BooleanPreferenceKey; label: string }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => toggleSection(section)}
      className="text-xs text-muted-foreground gap-1 h-7"
      title={`${label} verbergen`}
    >
      <EyeOff className="h-3.5 w-3.5" />
      {t("verbergen")}
    </Button>
  );

  const getDomeinStatus = (domein: string): boolean | null => {
    if (!compleetheid) return null;
    const d = compleetheid.domeinen.find((x) => x.domein === domein);
    return d?.ingevuld ?? null;
  };

  // In read-only (erfgenaam) mode, show the nabestaanden dashboard
  if (isReadOnly) {
    return <NabestaandenDashboard />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">
          {(() => {
            const uur = new Date().getHours();
            const dagdeel = uur < 12 ? t("begroeting.ochtend") : uur < 18 ? t("begroeting.middag") : t("begroeting.avond");
            const naam = (eigenaarData as { voornaam?: string } | null)?.voornaam;
            return naam ? `${dagdeel}, ${naam}` : t("titel");
          })()}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t("beschrijving")}
        </p>
      </div>

      {/* Top widgets — responsive 2-column grid */}
      {(showVoortgang || showStatistieken) && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Compleetheid-indicator */}
          {showVoortgang && compleetheid && (
            <div className="rounded-lg border bg-card p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-primary">
                  {t("voortgang.titel")}
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-primary">
                    {compleetheid.percentage}%
                  </span>
                  <HideButton section="showVoortgang" label={t("voortgang.titel")} />
                </div>
              </div>
              <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${compleetheid.percentage}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {t("voortgang.onderdelen", { aantalIngevuld: compleetheid.aantalIngevuld, totaal: compleetheid.totaal })}
              </p>
            </div>
          )}

          {/* Statistieken-widget */}
          {showStatistieken && (
            <div className="relative">
              <div className="absolute top-3 right-3 z-10">
                <HideButton section="showStatistieken" label={t("statistieken.titel")} />
              </div>
              <StatistiekenWidget />
            </div>
          )}
        </div>
      )}

      {/* Secondary widgets — responsive 2-column grid */}
      {(showVoortgangGranulair || showSuggesties) && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Granulaire voortgang per sectie */}
          {showVoortgangGranulair && (
            <div className="relative">
              <div className="absolute top-3 right-3 z-10">
                <HideButton section="showVoortgangGranulair" label="Gedetailleerde voortgang" />
              </div>
              <VoortgangGranulair />
            </div>
          )}

          {/* Slimme suggesties */}
          {showSuggesties && (
            <div className="relative">
              <div className="absolute top-3 right-3 z-10">
                <HideButton section="showSuggesties" label="Slimme suggesties" />
              </div>
              <ProfielSuggesties />
            </div>
          )}
        </div>
      )}

      {/* Widgets: auto-fit grid — columns adapt to however many widgets actually render */}
      <div className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))]">
        {showMeldingen && <MeldingenWidget />}
        {showBackup && <BackupStatusWidget />}
        {showAanbevolen && <AanbevolenStapWidget />}
        {showVerloopdatum && <DocumentenVerloopdatumWidget />}
      </div>

      {showInterview && (
        <div className="rounded-lg border bg-card p-6">
          <InterviewWizard
            onComplete={() => {
              setShowInterview(false);
              window.location.reload();
            }}
            onCancel={() => setShowInterview(false)}
          />
        </div>
      )}

      {!hasProfile && !showInterview && (
        <div className="rounded-lg border-2 border-warning bg-warning-100 p-5 dark:bg-warning/20">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-warning mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-warning">
                {t("geenProfiel.titel")}
              </p>
              <p className="text-sm text-warning mt-1">
                {t("geenProfiel.beschrijving")}
              </p>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" onClick={() => setShowInterview(true)}>
                  <ScrollText className="h-4 w-4 mr-2" /> {t("geenProfiel.interview")}
                </Button>
                <Link href="/eigenaar">
                  <Button size="sm">
                    <User className="h-4 w-4 mr-2" /> {t("geenProfiel.direct")}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {domainCards.filter((card) => !hiddenDomeinKaarten.includes(card.domein)).map((card) => {
          const cardStatus = getCardStatus(card.domein);
          const isAanbevolen = card.domein === aanbevolenDomein;
          return (
            <Link key={card.href} href={card.href}>
              <Card className={`h-full transition-shadow hover:shadow-md cursor-pointer ${
                isAanbevolen
                  ? "border-primary/60 ring-2 ring-primary/20 shadow-sm"
                  : ""
              }`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.bgColor}`}>
                      <LumioIcon name={card.lumioIcon} size="md" className={card.color} />
                    </div>
                    <div className="flex items-center gap-1">
                      {cardStatus === "afgerond" ? (
                        <Badge className="bg-success-100 text-success hover:bg-success-100 gap-1 dark:bg-success/20 dark:text-success">
                          <CheckCircle2 className="h-3 w-3" />
                          {t("status.afgerond")}
                        </Badge>
                      ) : cardStatus === "reviewNodig" ? (
                        <Badge className="bg-warning-100 text-warning hover:bg-warning-100 gap-1 dark:bg-warning/20 dark:text-warning">
                          <AlertTriangle className="h-3 w-3" />
                          {t("status.reviewNodig")}
                        </Badge>
                      ) : cardStatus === "bezig" ? (
                        <Badge className="bg-info-100 text-info hover:bg-info-100 gap-1 dark:bg-info/20 dark:text-info">
                          <Clock className="h-3 w-3" />
                          {t("status.bezig")}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <Circle className="h-3 w-3" />
                          {t("status.beginnen")}
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs px-2 text-muted-foreground gap-1"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleDomeinKaart(card.domein); }}
                      >
                        <EyeOff className="h-3.5 w-3.5" />
                        {t("verbergen")}
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-lg mt-3 flex items-center gap-2">
                    {t(`domein.${card.domeinKey}.titel`)}
                    {isAanbevolen && <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{t(`domein.${card.domeinKey}.beschrijving`)}</CardDescription>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm text-primary flex items-center">
                      {t("status.openen")} <ArrowRight className="ml-1 h-3 w-3" />
                    </span>
                    {cardStatus !== "beginnen" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs px-2 text-muted-foreground"
                        onClick={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          try {
                            if (cardStatus === "reviewNodig" || cardStatus === "bezig") {
                              // S4-02: Mark as finished on server (BR-148/BR-190)
                              await api.post(`/api/status/actualisatie/${card.domein}`, {});
                            } else if (cardStatus === "afgerond") {
                              // S4-02: Remove mark on server
                              await api.delete(`/api/status/actualisatie/${card.domein}`);
                            } else {
                              await api.post(`/api/status/actualisatie/${card.domein}`, {});
                            }
                            refetchActualisatie();
                          } catch {
                            // Ignore
                          }
                        }}
                      >
                        {cardStatus === "afgerond" ? (
                          <><Circle className="h-3 w-3 mr-1" />{t("status.markeringOpheffen")}</>
                        ) : (
                          <><CheckCircle2 className="h-3 w-3 mr-1" />{t("status.markeerAfgerond")}</>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Legal notice — shown until permanently dismissed */}
      {showJuridisch && (
        <div className="rounded-lg border border-info bg-info-100 p-4 dark:bg-info/20 flex items-start justify-between gap-4">
          <p className="text-sm text-info">
            <strong>{t("letOp")}</strong> {t("juridisch")}
          </p>
          <button
            onClick={handleJuridischDismiss}
            className="shrink-0 text-xs text-info font-semibold underline underline-offset-2 hover:no-underline whitespace-nowrap"
          >
            {t("juridischBegrepen")}
          </button>
        </div>
      )}
    </div>
  );
}
