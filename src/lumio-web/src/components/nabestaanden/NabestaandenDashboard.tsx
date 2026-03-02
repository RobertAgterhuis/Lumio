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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { api, downloadAndSave } from "@/lib/api-client";
import { Loader2,
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
  Archive,
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
    color: "text-danger",
    bgColor: "bg-danger-100",
    borderColor: "border-danger",
    badgeClass: "bg-danger-100 text-danger",
  },
  week1: {
    icon: Clock,
    color: "text-warning",
    bgColor: "bg-warning-100",
    borderColor: "border-warning",
    badgeClass: "bg-warning-100 text-warning",
  },
  maand1: {
    icon: Calendar,
    color: "text-info",
    bgColor: "bg-info-100",
    borderColor: "border-info",
    badgeClass: "bg-info-100 text-info",
  },
  afronden: {
    icon: Flag,
    color: "text-success",
    bgColor: "bg-success-100",
    borderColor: "border-success",
    badgeClass: "bg-success-100 text-success",
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
  const [initLoading, setInitLoading] = useState(true);
  const [notitieOpen, setNotitieOpen] = useState<Record<string, boolean>>({});
  const [notitieValues, setNotitieValues] = useState<Record<string, string>>({});
  const [zipDownloading, setZipDownloading] = useState(false);

  useEffect(() => {
    api
      .get<Compleetheid>("/api/status/compleetheid")
      .then(setCompleetheid)
      .catch((err) => console.error("Failed to load compleetheid:", err));

    // Initialize tracking items if first visit, then load them
    api
      .post("/api/afhandeling/initialiseer", {})
      .then(() => api.get<AfhandelingsItemDto[]>("/api/afhandeling"))
      .then((items) => { setAfhandelingsItems(items); setInitLoading(false); })
      .catch(() => {
        // If init fails (already exists), just load
        api
          .get<AfhandelingsItemDto[]>("/api/afhandeling")
          .then((items) => { setAfhandelingsItems(items); setInitLoading(false); })
          .catch((err) => { console.error("Failed to load afhandeling:", err); setInitLoading(false); });
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

  const handleMarkeerAfgehandeld = (afhandelingId: string) => {
    setNotitieOpen((prev) => ({ ...prev, [afhandelingId]: true }));
  };

  const handleBevestigAfgehandeld = async (afhandelingId: string) => {
    const notitie = notitieValues[afhandelingId] || undefined;
    await updateItemStatus(afhandelingId, "Afgehandeld", notitie);
    setNotitieOpen((prev) => ({ ...prev, [afhandelingId]: false }));
  };

  const handleZipDownload = async () => {
    setZipDownloading(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      await downloadAndSave("/api/export/alles", `lumio-export-${today}.zip`, { method: "POST" });
    } catch {
      // Silently fail
    } finally {
      setZipDownloading(false);
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
      <div className="rounded-lg border border-muted bg-gradient-to-br from-muted/50 to-background p-6 dark:from-muted/20">
        <div className="flex items-center gap-2 mb-2">
          <ShieldAlert className="h-5 w-5 text-muted-foreground" />
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
        <Button
          variant="outline"
          onClick={handleZipDownload}
          disabled={zipDownloading}
        >
          {zipDownloading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Archive className="h-4 w-4 mr-2" />
          )}
          {t("downloadZip")}
        </Button>
        <Link href="/noodcontacten">
          <Button variant="outline">
            <Phone className="h-4 w-4 mr-2" />
            {t("noodcontactenBekijken")}
          </Button>
        </Link>
      </div>

      {/* Empathische hulptekst */}
      <Alert variant="info">
        <AlertDescription>
          <strong>{t("hulpTitel")}</strong>{" "}
          {t("hulpTekst")}
        </AlertDescription>
      </Alert>

      {/* Voortgang afhandeling */}
      {initLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">{t("laden")}</span>
        </div>
      ) : totaalItems > 0 && (
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
          <section key={fase} aria-labelledby={`fase-heading-${fase}`} className="space-y-3">
            <div className="flex items-center gap-2">
              <FaseIcon className={`h-5 w-5 ${config.color}`} />
              <h2 id={`fase-heading-${fase}`} className={`text-lg font-semibold ${config.color}`}>
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
                    <Badge className="bg-success-100 text-success hover:bg-success-100 gap-1 text-xs">
                      <CheckCircle2 className="h-3 w-3" />
                      {t("statusAfgehandeld")}
                    </Badge>
                  ) : afhandeling.status === "InBehandeling" ? (
                    <Badge className="bg-warning-100 text-warning hover:bg-warning-100 gap-1 text-xs">
                      <Clock className="h-3 w-3" />
                      {t("statusInBehandeling")}
                    </Badge>
                  ) : status === true ? (
                    <Badge className="bg-info-100 text-info hover:bg-info-100 gap-1 text-xs">
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
                  <Badge className="bg-info-100 text-info hover:bg-info-100 gap-1 text-xs">
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
                      <div className="px-6 pb-4 space-y-2">
                        {notitieOpen[afhandeling.id] ? (
                          <div className="space-y-2">
                            <Textarea
                              placeholder={t("notitiePlaceholder")}
                              value={notitieValues[afhandeling.id] ?? ""}
                              onChange={(e) =>
                                setNotitieValues((prev) => ({ ...prev, [afhandeling.id]: e.target.value }))
                              }
                              className="text-xs min-h-[60px]"
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="text-xs flex-1"
                                onClick={(e) => {
                                  e.preventDefault();
                                  void handleBevestigAfgehandeld(afhandeling.id);
                                }}
                              >
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                {t("bevestigen")}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setNotitieOpen((prev) => ({ ...prev, [afhandeling.id]: false }));
                                }}
                              >
                                {t("annuleren")}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-2">
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
                                handleMarkeerAfgehandeld(afhandeling.id);
                              }}
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              {t("markeerAfgehandeld")}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
