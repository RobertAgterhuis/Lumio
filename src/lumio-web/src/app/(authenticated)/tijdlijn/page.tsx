"use client";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { useTranslations } from "next-intl";
import {
  AlertTriangle,
  Clock,
  Calendar,
  CalendarDays,
  Stethoscope,
  Church,
  Phone,
  ScrollText,
  Wallet,
  Globe,
  Building2,
  Landmark,
  ShieldCheck,
  FileText,
  Scale,
  HeartHandshake,
  UserX,
} from "lucide-react";
import { useDomainQuery } from "@/hooks";
import { useEffect } from "react";
import { api } from "@/lib/api-client";
import { LumioIcon } from "@/components/ui/lumio-icon";
import { TijdlijnStapRow } from "@/components/tijdlijn/TijdlijnStapRow";
import { STAP_DOMAIN_CONFIGS } from "@/components/tijdlijn/tijdlijn-data";

interface TijdlijnStap {
  key: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface TijdlijnFase {
  fase: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
  dotColor: string;
  stappen: TijdlijnStap[];
}

const tijdlijn: TijdlijnFase[] = [
  {
    fase: "24uur",
    icon: AlertTriangle,
    color: "text-danger",
    bgColor: "bg-danger-100 dark:bg-danger/20",
    borderColor: "border-danger",
    dotColor: "bg-danger",
    stappen: [
      { key: "huisarts", icon: Stethoscope },
      { key: "uitvaart", icon: Church },
      { key: "naasten", icon: Phone },
      { key: "donor", icon: HeartHandshake },
      { key: "wilsverklaring", icon: ShieldCheck },
    ],
  },
  {
    fase: "week1",
    icon: Clock,
    color: "text-warning",
    bgColor: "bg-warning-100 dark:bg-warning/20",
    borderColor: "border-warning",
    dotColor: "bg-warning",
    stappen: [
      { key: "notaris", icon: ScrollText },
      { key: "werkgever", icon: Building2 },
      { key: "aangifte", icon: Landmark },
      { key: "documenten", icon: FileText },
    ],
  },
  {
    fase: "maand1",
    icon: Calendar,
    color: "text-info",
    bgColor: "bg-info-100 dark:bg-info/20",
    borderColor: "border-info",
    dotColor: "bg-info",
    stappen: [
      { key: "verzekeringen", icon: ShieldCheck },
      { key: "bank", icon: Landmark },
      { key: "abonnementen", icon: FileText },
      { key: "uitkeringen", icon: Building2 },
      { key: "digitaal", icon: Globe },
    ],
  },
  {
    fase: "3maanden",
    icon: CalendarDays,
    color: "text-accent",
    bgColor: "bg-accent/10 dark:bg-accent/20",
    borderColor: "border-accent",
    dotColor: "bg-accent",
    stappen: [
      { key: "erfbelasting", icon: Scale },
      { key: "aanvaarding", icon: ScrollText },
      { key: "boedelverdeling", icon: Wallet },
      { key: "inkomstenbelasting", icon: Building2 },
      { key: "socialMedia", icon: UserX },
    ],
  },
];

export default function TijdlijnPage() {
  const t = useTranslations("tijdlijn");

  // Domain queries for steps that are linked to Lumio domains
  const { data: uitvaartData, isLoading: uitvaartLoading } = useDomainQuery("uitvaart");
  const { data: donorData, isLoading: donorLoading } = useDomainQuery("donor");
  const { data: euthanasieData, isLoading: euthanasieLoading } = useDomainQuery("euthanasie");
  const { data: testamentData, isLoading: testamentLoading } = useDomainQuery("testament");
  const { data: documentenData, isLoading: documentenLoading } = useDomainQuery<unknown[]>("documenten");
  const { data: noodcontactenData, isLoading: noodcontactenLoading } = useDomainQuery<unknown[]>("noodcontacten");
  const { data: boedelData, isLoading: boedelLoading } = useDomainQuery("boedel");
  const { data: erfgenamenData, isLoading: erfgenamenLoading } = useDomainQuery<unknown[]>("erfgenamen");
  const { data: digitaalBezitData, isLoading: digitaalBezitLoading } = useDomainQuery("digitaal-bezit");

  // S6-20: Mark tijdlijn as viewed on load
  useEffect(() => {
    void api.post("/api/status/tijdlijn-bekeken").catch(() => void 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Maps stap key → fetched domain data
  const domainDataMap: Record<string, unknown> = {
    uitvaart: uitvaartData,
    donor: donorData,
    wilsverklaring: euthanasieData,
    notaris: testamentData,
    documenten: documentenData,
    naasten: noodcontactenData,
    digitaal: digitaalBezitData,
    aanvaarding: erfgenamenData,
    boedelverdeling: boedelData,
  };

  // Maps stap key → loading state
  const domainLoadingMap: Record<string, boolean> = {
    uitvaart: uitvaartLoading,
    donor: donorLoading,
    wilsverklaring: euthanasieLoading,
    notaris: testamentLoading,
    documenten: documentenLoading,
    naasten: noodcontactenLoading,
    digitaal: digitaalBezitLoading,
    aanvaarding: erfgenamenLoading,
    boedelverdeling: boedelLoading,
  };

  // S6-18: Count steps linked to domain configs
  const gelinktStappen = tijdlijn.flatMap((f) => f.stappen).filter((s) => s.key in STAP_DOMAIN_CONFIGS);
  const ingevuldStappen = gelinktStappen.filter((s) => {
    const config = STAP_DOMAIN_CONFIGS[s.key];
    return config?.isCompleted(domainDataMap[s.key]);
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <LumioIcon name="tijdlijn" size="lg" className="text-primary" />
          {t("titel")}
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          {t("beschrijving")}
        </p>
        {gelinktStappen.length > 0 && (
          <p className="text-sm text-muted-foreground mt-1">
            {t("voortgang", { ingevuld: ingevuldStappen.length, totaal: gelinktStappen.length })}
          </p>
        )}
      </div>

      {tijdlijn.map((fase) => {
        const FaseIcon = fase.icon;

        return (
          <div key={fase.fase} className="space-y-4">
            {/* Faseheader */}
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${fase.bgColor}`}
              >
                <FaseIcon className={`h-5 w-5 ${fase.color}`} />
              </div>
              <h2 className={`text-xl font-semibold ${fase.color}`}>
                {t(`fasen.${fase.fase}.label` as never)}
              </h2>
            </div>

            {/* Stappen met verticale lijn */}
            <div className="relative ml-5 border-l-2 border-border pl-8 space-y-4">
              {fase.stappen.map((stap, idx) => (
                <TijdlijnStapRow
                  key={idx}
                  faseKey={fase.fase}
                  stapKey={stap.key}
                  stapIcon={stap.icon}
                  color={fase.color}
                  bgColor={fase.bgColor}
                  borderColor={fase.borderColor}
                  dotColor={fase.dotColor}
                  domainConfig={STAP_DOMAIN_CONFIGS[stap.key]}
                  domainData={domainDataMap[stap.key]}
                  isLoading={domainLoadingMap[stap.key]}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* Disclaimer */}
      <Card className="border-muted bg-muted/30">
        <CardContent className="py-4">
          <p className="text-sm text-muted-foreground">{t.rich("disclaimer", { strong: (chunks) => <strong>{chunks}</strong> })}</p>
        </CardContent>
      </Card>
    </div>
  );
}
