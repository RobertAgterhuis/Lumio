"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
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
  Bell,
  Info,
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

interface Melding {
  type: "waarschuwing" | "herinnering";
  categorie: string;
  bericht: string;
  actie: string;
}

interface MeldingenResponse {
  meldingen: Melding[];
  aantal: number;
}

const domainCards = [
  {
    href: "/eigenaar",
    domein: "eigenaar",
    icon: User,
    domeinKey: "eigenaar",
    color: "text-gray-600",
    bgColor: "bg-gray-50",
  },
  {
    href: "/testament",
    domein: "testament",
    icon: ScrollText,
    domeinKey: "testament",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    href: "/euthanasie",
    domein: "euthanasie",
    icon: Stethoscope,
    domeinKey: "euthanasie",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    href: "/donor",
    domein: "donor",
    icon: Heart,
    domeinKey: "donor",
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
  {
    href: "/digitaal-bezit",
    domein: "digitaal-bezit",
    icon: Globe,
    domeinKey: "digitaalBezit",
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    href: "/boedel",
    domein: "boedel",
    icon: Wallet,
    domeinKey: "boedel",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  {
    href: "/uitvaart",
    domein: "uitvaart",
    icon: Church,
    domeinKey: "uitvaart",
    color: "text-stone-600",
    bgColor: "bg-stone-50",
  },
  {
    href: "/documenten",
    domein: "documenten",
    icon: FileText,
    domeinKey: "documenten",
    color: "text-cyan-600",
    bgColor: "bg-cyan-50",
  },
  {
    href: "/erfgenamen",
    domein: "erfgenamen",
    icon: Users,
    domeinKey: "erfgenamen",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
  },
  {
    href: "/noodcontacten",
    domein: "noodcontacten",
    icon: Phone,
    domeinKey: "noodcontacten",
    color: "text-pink-600",
    bgColor: "bg-pink-50",
  },
];

export default function DashboardPage() {
  const { isReadOnly } = useAuthStore();
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [compleetheid, setCompleetheid] = useState<Compleetheid | null>(null);
  const [meldingen, setMeldingen] = useState<Melding[]>([]);
  const [meldingenOpen, setMeldingenOpen] = useState(true);
  const [showInterview, setShowInterview] = useState(false);
  const t = useTranslations("dashboard");

  useEffect(() => {
    api
      .get("/api/eigenaar")
      .then(() => setHasProfile(true))
      .catch(() => setHasProfile(false));

    api
      .get<Compleetheid>("/api/status/compleetheid")
      .then(setCompleetheid)
      .catch(() => {});

    api
      .get<MeldingenResponse>("/api/status/meldingen")
      .then((data) => setMeldingen(data.meldingen))
      .catch(() => {});
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

      {/* Compleetheid-indicator */}
      {compleetheid && (
        <div className="rounded-lg border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">
              {t("voortgang.titel")}
            </h2>
            <span className="text-sm font-bold text-primary">
              {compleetheid.percentage}%
            </span>
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

      {/* Notificaties & Herinneringen */}
      {meldingen.length > 0 && meldingenOpen && (
        <div className="rounded-lg border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold">
                {t("meldingen.titel", { aantal: meldingen.length })}
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMeldingenOpen(false)}
              className="text-xs text-muted-foreground"
            >
              {t("meldingen.verbergen")}
            </Button>
          </div>
          <div className="space-y-2">
            {meldingen.map((melding, idx) => (
              <Link key={idx} href={melding.actie}>
                <div
                  className={cn(
                    "flex items-start gap-3 rounded-md border p-3 transition-colors hover:bg-muted/50 cursor-pointer",
                    melding.type === "waarschuwing"
                      ? "border-amber-200 bg-amber-50"
                      : "border-blue-100 bg-blue-50/50"
                  )}
                >
                  {melding.type === "waarschuwing" ? (
                    <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                  ) : (
                    <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                  )}
                  <p className={cn(
                    "text-sm",
                    melding.type === "waarschuwing" ? "text-amber-900" : "text-blue-900"
                  )}>
                    {melding.bericht}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Granulaire voortgang per sectie */}
      <VoortgangGranulair />

      {/* Slimme suggesties */}
      <ProfielSuggesties />

      {/* Statistieken-widget */}
      <StatistiekenWidget />

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
        <div className="rounded-lg border-2 border-amber-300 bg-amber-50 p-5 dark:border-amber-700 dark:bg-amber-950">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                {t("geenProfiel.titel")}
              </p>
              <p className="text-sm text-amber-800 dark:text-amber-300 mt-1">
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

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <strong>{t("letOp")}</strong> {t("juridisch")}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {domainCards.map((card) => {
          const Icon = card.icon;
          const status = getDomeinStatus(card.domein);
          return (
            <Link key={card.href} href={card.href}>
              <Card className="h-full transition-shadow hover:shadow-md cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.bgColor}`}>
                      <Icon className={`h-5 w-5 ${card.color}`} />
                    </div>
                    {status === true ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100 gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        {t("status.ingevuld")}
                      </Badge>
                    ) : status === false ? (
                      <Badge variant="secondary" className="gap-1">
                        <Circle className="h-3 w-3" />
                        {t("status.beginnen")}
                      </Badge>
                    ) : (
                      <Badge variant="secondary">{t("status.beginnen")}</Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg mt-3">{t(`domein.${card.domeinKey}.titel`)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{t(`domein.${card.domeinKey}.beschrijving`)}</CardDescription>
                  <div className="mt-3 flex items-center text-sm text-primary">
                    {t("status.openen")} <ArrowRight className="ml-1 h-3 w-3" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
