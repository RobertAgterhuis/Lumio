"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api-client";
import { useAuthStore } from "@/stores/authStore";
import { usePreferencesStore, type DashboardPreferences } from "@/stores/preferencesStore";
import { NabestaandenDashboard } from "@/components/nabestaanden/NabestaandenDashboard";
import { StatistiekenWidget } from "@/components/dashboard/StatistiekenWidget";
import { VoortgangGranulair } from "@/components/dashboard/VoortgangGranulair";
import { ProfielSuggesties } from "@/components/dashboard/ProfielSuggesties";
import { InterviewWizard } from "@/components/interview/InterviewWizard";
import { useTranslations } from "next-intl";
import {
  ScrollText,
  Heart,
  Stethoscope,
  Globe,
  Wallet,
  Church,
  FileText,
  Users,
  ArrowRight,
  User,
  AlertTriangle,
  Phone,
  CheckCircle2,
  Circle,
  Clock,
  EyeOff,
} from "lucide-react";

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

const domainCards = [
  {
    href: "/eigenaar",
    domein: "eigenaar",
    icon: User,
    domeinKey: "eigenaar",
    color: "text-muted-foreground",
    bgColor: "bg-muted",
  },
  {
    href: "/testament",
    domein: "testament",
    icon: ScrollText,
    domeinKey: "testament",
    color: "text-info",
    bgColor: "bg-info-100",
  },
  {
    href: "/euthanasie",
    domein: "euthanasie",
    icon: Stethoscope,
    domeinKey: "euthanasie",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    href: "/donor",
    domein: "donor",
    icon: Heart,
    domeinKey: "donor",
    color: "text-danger",
    bgColor: "bg-danger-100",
  },
  {
    href: "/digitaal-bezit",
    domein: "digitaal-bezit",
    icon: Globe,
    domeinKey: "digitaalBezit",
    color: "text-success",
    bgColor: "bg-success-100",
  },
  {
    href: "/boedel",
    domein: "boedel",
    icon: Wallet,
    domeinKey: "boedel",
    color: "text-warning",
    bgColor: "bg-warning-100",
  },
  {
    href: "/uitvaart",
    domein: "uitvaart",
    icon: Church,
    domeinKey: "uitvaart",
    color: "text-muted-foreground",
    bgColor: "bg-muted",
  },
  {
    href: "/documenten",
    domein: "documenten",
    icon: FileText,
    domeinKey: "documenten",
    color: "text-info",
    bgColor: "bg-info-100",
  },
  {
    href: "/erfgenamen",
    domein: "erfgenamen",
    icon: Users,
    domeinKey: "erfgenamen",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    href: "/noodcontacten",
    domein: "noodcontacten",
    icon: Phone,
    domeinKey: "noodcontacten",
    color: "text-danger",
    bgColor: "bg-danger-100",
  },
];

interface ActualisatieDomein {
  domein: string;
  label: string;
  laatsteBevestiging: string | null;
  actualisatieNodig: boolean;
}

export default function DashboardPage() {
  const { isReadOnly } = useAuthStore();
  const {
    showVoortgang, showVoortgangGranulair, showSuggesties, showDomeinKaarten,
    toggleSection, finishedDomains, setDomainFinished,
  } = usePreferencesStore();
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [compleetheid, setCompleetheid] = useState<Compleetheid | null>(null);
  const [actualisatie, setActualisatie] = useState<ActualisatieDomein[]>([]);
  const [showInterview, setShowInterview] = useState(false);
  const t = useTranslations("dashboard");

  type CardStatus = "afgerond" | "reviewNodig" | "bezig" | "beginnen";

  const getCardStatus = (domein: string): CardStatus => {
    const isFinished = !!finishedDomains[domein];
    const needsReview = isFinished && actualisatie.find((a) => a.domein === domein)?.actualisatieNodig === true;
    const hasData = getDomeinStatus(domein);
    if (needsReview) return "reviewNodig";
    if (isFinished) return "afgerond";
    if (hasData) return "bezig";
    return "beginnen";
  };

  const HideButton = ({ section, label }: { section: keyof DashboardPreferences; label: string }) => (
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

  useEffect(() => {
    api
      .get("/api/eigenaar")
      .then(() => setHasProfile(true))
      .catch(() => setHasProfile(false));

    api
      .get<Compleetheid>("/api/status/compleetheid")
      .then(setCompleetheid)
      .catch((err) => console.error("Failed to load compleetheid:", err));

    api
      .get<{ domeinen: ActualisatieDomein[]; herinneringNodig: boolean }>("/api/status/actualisatie")
      .then((data) => setActualisatie(data.domeinen))
      .catch((err) => console.error("Failed to load actualisatie:", err));
  }, []);

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
        <h1 className="text-3xl font-bold">{t("titel")}</h1>
        <p className="text-muted-foreground mt-1">
          {t("beschrijving")}
        </p>
      </div>

      <div className="rounded-lg border border-info bg-info-100 p-4 dark:bg-info/20">
        <p className="text-sm text-info">
          <strong>{t("letOp")}</strong> {t("juridisch")}
        </p>
      </div>

      {/* Top widgets — responsive 2-column grid */}
      {showVoortgang && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Compleetheid-indicator */}
          {compleetheid && (
            <div className="rounded-lg border bg-card p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold">
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
          <StatistiekenWidget />
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

      {showInterview && (
        <div className="rounded-lg border bg-card p-6">
          <InterviewWizard
            onComplete={() => {
              setShowInterview(false);
              setHasProfile(true);
              window.location.reload();
            }}
            onCancel={() => setShowInterview(false)}
          />
        </div>
      )}

      {hasProfile === false && !showInterview && (
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

      {showDomeinKaarten && (
      <div>
        <div className="flex items-center justify-end mb-2">
          <HideButton section="showDomeinKaarten" label="Domeinkaarten" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {domainCards.map((card) => {
          const Icon = card.icon;
          const cardStatus = getCardStatus(card.domein);
          return (
            <Link key={card.href} href={card.href}>
              <Card className="h-full transition-shadow hover:shadow-md cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.bgColor}`}>
                      <Icon className={`h-5 w-5 ${card.color}`} />
                    </div>
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
                  </div>
                  <CardTitle className="text-lg mt-3">{t(`domein.${card.domeinKey}.titel`)}</CardTitle>
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
                          if (cardStatus === "reviewNodig") {
                            // Confirm actualisatie on server (BR-148/BR-190)
                            try {
                              await api.post(`/api/status/actualisatie/${card.domein}`, {});
                              setActualisatie((prev) =>
                                prev.map((a) =>
                                  a.domein === card.domein ? { ...a, actualisatieNodig: false } : a
                                )
                              );
                              setDomainFinished(card.domein, true);
                            } catch {
                              // Ignore
                            }
                          } else if (cardStatus === "afgerond") {
                            setDomainFinished(card.domein, false);
                          } else {
                            setDomainFinished(card.domein, true);
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
      </div>
      )}
    </div>
  );
}
