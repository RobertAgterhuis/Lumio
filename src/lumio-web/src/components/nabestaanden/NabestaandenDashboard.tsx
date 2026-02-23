"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api-client";
import {
  ShieldAlert,
  Download,
  Phone,
  ScrollText,
  Heart,
  Stethoscope,
  Globe,
  Wallet,
  Church,
  FileText,
  Users,
  User,
  Clock,
  CheckCircle2,
  Circle,
  AlertTriangle,
  ArrowRight,
  Calendar,
  CalendarDays,
  Flag,
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

interface AfhandelingsItemDto {
  id: string;
  domein: string;
  entityId: string | null;
  label: string | null;
  status: "Open" | "InBehandeling" | "Afgehandeld";
  notitie: string | null;
  afgehandeldOp: string | null;
  aangemaaktOp: string;
  gewijzigdOp: string;
}

interface StappenplanItem {
  id: string;
  fase: "urgent" | "week1" | "maand1" | "afronden";
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  domein?: string;
}

const stappenplan: StappenplanItem[] = [
  // Urgent — eerste 24-48 uur
  {
    id: "noodcontacten",
    fase: "urgent",
    href: "/noodcontacten",
    icon: Phone,
    domein: "noodcontacten",
  },
  {
    id: "uitvaart",
    fase: "urgent",
    href: "/uitvaart",
    icon: Church,
    domein: "uitvaart",
  },
  {
    id: "donor",
    fase: "urgent",
    href: "/donor",
    icon: Heart,
    domein: "donor",
  },
  {
    id: "euthanasie",
    fase: "urgent",
    href: "/euthanasie",
    icon: Stethoscope,
    domein: "euthanasie",
  },

  // Week 1
  {
    id: "testament",
    fase: "week1",
    href: "/testament",
    icon: ScrollText,
    domein: "testament",
  },
  {
    id: "erfgenamen",
    fase: "week1",
    href: "/erfgenamen",
    icon: Users,
    domein: "erfgenamen",
  },
  {
    id: "documenten",
    fase: "week1",
    href: "/documenten",
    icon: FileText,
    domein: "documenten",
  },

  // Maand 1
  {
    id: "boedel",
    fase: "maand1",
    href: "/boedel",
    icon: Wallet,
    domein: "boedel",
  },
  {
    id: "digitaalBezit",
    fase: "maand1",
    href: "/digitaal-bezit",
    icon: Globe,
    domein: "digitaal-bezit",
  },

  // Afronden
  {
    id: "export",
    fase: "afronden",
    href: "/export",
    icon: Download,
  },
  {
    id: "eigenaar",
    fase: "afronden",
    href: "/eigenaar",
    icon: User,
    domein: "eigenaar",
  },
];

const faseConfig = {
  urgent: {
    icon: AlertTriangle,
    color: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    badgeClass: "bg-red-100 text-red-800",
  },
  week1: {
    icon: Clock,
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    badgeClass: "bg-amber-100 text-amber-800",
  },
  maand1: {
    icon: Calendar,
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    badgeClass: "bg-blue-100 text-blue-800",
  },
  afronden: {
    icon: Flag,
    color: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    badgeClass: "bg-green-100 text-green-800",
  },
};

const faseOrder: Array<"urgent" | "week1" | "maand1" | "afronden"> = [
  "urgent",
  "week1",
  "maand1",
  "afronden",
];

export function NabestaandenDashboard() {
  const t = useTranslations("nabestaanden");
  const [compleetheid, setCompleetheid] = useState<Compleetheid | null>(null);
  const [afhandelingsItems, setAfhandelingsItems] = useState<AfhandelingsItemDto[]>([]);

  useEffect(() => {
    api
      .get<Compleetheid>("/api/status/compleetheid")
      .then(setCompleetheid)
      .catch(() => {});

    // Initialize tracking items if first visit, then load them
    api
      .post("/api/afhandeling/initialiseer", {})
      .then(() => api.get<AfhandelingsItemDto[]>("/api/afhandeling"))
      .then(setAfhandelingsItems)
      .catch(() => {
        // If init fails (already exists), just load
        api
          .get<AfhandelingsItemDto[]>("/api/afhandeling")
          .then(setAfhandelingsItems)
          .catch(() => {});
      });
  }, []);

  const updateItemStatus = async (
    id: string,
    status: "Open" | "InBehandeling" | "Afgehandeld",
    notitie?: string
  ) => {
    try {
      const updated = await api.put<AfhandelingsItemDto>(
        `/api/afhandeling/${id}`,
        { status, notitie }
      );
      setAfhandelingsItems((items) =>
        items.map((item) => (item.id === id ? updated : item))
      );
    } catch {
      // Silently fail
    }
  };

  const getDomeinStatus = (domein?: string): boolean | null => {
    if (!domein || !compleetheid) return null;
    const d = compleetheid.domeinen.find((x) => x.domein === domein);
    return d?.ingevuld ?? null;
  };

  const getAfhandelingsItem = (domein: string): AfhandelingsItemDto | undefined => {
    return afhandelingsItems.find((a) => a.domein === domein);
  };

  const afgehandeldCount = afhandelingsItems.filter(
    (a) => a.status === "Afgehandeld"
  ).length;
  const totaalItems = afhandelingsItems.length;
  const voortgangPercentage =
    totaalItems > 0 ? Math.round((afgehandeldCount / totaalItems) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header — empathisch ontwerp */}
      <div className="rounded-lg border border-stone-200 bg-gradient-to-br from-stone-50 to-white p-6 dark:border-stone-700 dark:from-stone-900 dark:to-stone-950">
        <div className="flex items-center gap-2 mb-2">
          <ShieldAlert className="h-5 w-5 text-stone-500" />
          <h1 className="text-3xl font-bold">{t("titel")}</h1>
        </div>
        <p className="text-muted-foreground mt-1 leading-relaxed">
          {t("introTekst")}
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          {t("gegevensInfo")}
        </p>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Link href="/export">
          <Button>
            <Download className="h-4 w-4 mr-2" />
            {t("exporteren")}
          </Button>
        </Link>
        <Link href="/noodcontacten">
          <Button variant="outline">
            <Phone className="h-4 w-4 mr-2" />
            {t("noodcontactenBekijken")}
          </Button>
        </Link>
      </div>

      {/* Empathische hulptekst */}
      <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
        <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
          <strong>{t("hulpTitel")}</strong>{" "}
          {t("hulpTekst")}
        </p>
      </div>

      {/* Voortgang afhandeling */}
      {totaalItems > 0 && (
        <div className="rounded-lg border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">{t("voortgangTitel")}</h2>
            <span className="text-sm font-bold text-primary">
              {voortgangPercentage}%
            </span>
          </div>
          <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${voortgangPercentage}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {t("voortgangTekst", { afgehandeld: afgehandeldCount, totaal: totaalItems })}
          </p>
        </div>
      )}

      {/* Stappenplan per fase */}
      {faseOrder.map((fase) => {
        const config = faseConfig[fase];
        const FaseIcon = config.icon;
        const items = stappenplan.filter((s) => s.fase === fase);

        return (
          <div key={fase} className="space-y-3">
            <div className="flex items-center gap-2">
              <FaseIcon className={`h-5 w-5 ${config.color}`} />
              <h2 className={`text-lg font-semibold ${config.color}`}>
                {t(`fases.${fase}`)}
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => {
                const Icon = item.icon;
                const status = getDomeinStatus(item.domein);
                const afhandeling = getAfhandelingsItem(item.domein || item.href.replace("/", ""));

                const statusBadge = afhandeling ? (
                  afhandeling.status === "Afgehandeld" ? (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100 gap-1 text-xs">
                      <CheckCircle2 className="h-3 w-3" />
                      {t("statusAfgehandeld")}
                    </Badge>
                  ) : afhandeling.status === "InBehandeling" ? (
                    <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 gap-1 text-xs">
                      <Clock className="h-3 w-3" />
                      {t("statusInBehandeling")}
                    </Badge>
                  ) : status === true ? (
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 gap-1 text-xs">
                      <Circle className="h-3 w-3" />
                      {t("statusBeschikbaar")}
                    </Badge>
                  ) : status === false ? (
                    <Badge variant="secondary" className="gap-1 text-xs">
                      <Circle className="h-3 w-3" />
                      {t("statusNietIngevuld")}
                    </Badge>
                  ) : null
                ) : status === true ? (
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 gap-1 text-xs">
                    <Circle className="h-3 w-3" />
                    {t("statusBeschikbaar")}
                  </Badge>
                ) : null;

                return (
                  <Card
                    key={item.id}
                    className={`h-full transition-shadow hover:shadow-md border ${config.borderColor}`}
                  >
                    <Link href={item.href}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div
                            className={`flex h-9 w-9 items-center justify-center rounded-lg ${config.bgColor}`}
                          >
                            <Icon className={`h-4 w-4 ${config.color}`} />
                          </div>
                          {statusBadge}
                        </div>
                        <CardTitle className="text-base mt-2">
                          {t(`stappen.${item.id}.titel`)}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-xs">
                          {t(`stappen.${item.id}.beschrijving`)}
                        </CardDescription>
                        <div className="mt-2 flex items-center text-xs text-primary">
                          {t("bekijken")} <ArrowRight className="ml-1 h-3 w-3" />
                        </div>
                      </CardContent>
                    </Link>
                    {/* Status tracking buttons */}
                    {afhandeling && afhandeling.status !== "Afgehandeld" && (
                      <div className="px-6 pb-4 flex gap-2">
                        {afhandeling.status === "Open" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs flex-1"
                            onClick={(e) => {
                              e.preventDefault();
                              updateItemStatus(afhandeling.id, "InBehandeling");
                            }}
                          >
                            <CalendarDays className="h-3 w-3 mr-1" />
                            {t("start")}
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs flex-1"
                          onClick={(e) => {
                            e.preventDefault();
                            updateItemStatus(afhandeling.id, "Afgehandeld");
                          }}
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          {t("markeerAfgehandeld")}
                        </Button>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
