"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTranslations } from "next-intl";
import {
  AlertTriangle,
  Clock,
  Calendar,
  CalendarDays,
  ListChecks,
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
    color: "text-red-700 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-950/30",
    borderColor: "border-red-200 dark:border-red-800",
    dotColor: "bg-red-500",
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
    color: "text-amber-700 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    borderColor: "border-amber-200 dark:border-amber-800",
    dotColor: "bg-amber-500",
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
    color: "text-blue-700 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-blue-200 dark:border-blue-800",
    dotColor: "bg-blue-500",
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
    color: "text-violet-700 dark:text-violet-400",
    bgColor: "bg-violet-50 dark:bg-violet-950/30",
    borderColor: "border-violet-200 dark:border-violet-800",
    dotColor: "bg-violet-500",
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

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2">
          <ListChecks className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">
            {t("titel")}
          </h1>
        </div>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          {t("beschrijving")}
        </p>
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
                {t(`fasen.${fase.fase}.label`)}
              </h2>
            </div>

            {/* Stappen met verticale lijn */}
            <div className="relative ml-5 border-l-2 border-border pl-8 space-y-4">
              {fase.stappen.map((stap, idx) => {
                const StapIcon = stap.icon;
                return (
                  <div key={idx} className="relative">
                    {/* Dot op de lijn */}
                    <div
                      className={`absolute -left-[calc(2rem+5px)] top-4 h-3 w-3 rounded-full ${fase.dotColor} ring-4 ring-background`}
                    />
                    <Card
                      className={`border ${fase.borderColor} transition-colors hover:shadow-sm`}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${fase.bgColor}`}
                          >
                            <StapIcon
                              className={`h-4 w-4 ${fase.color}`}
                            />
                          </div>
                          <CardTitle className="text-base">
                            {t(`fasen.${fase.fase}.${stap.key}.titel`)}
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-sm leading-relaxed">
                          {t(`fasen.${fase.fase}.${stap.key}.beschrijving`)}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Disclaimer */}
      <Card className="border-muted bg-muted/30">
        <CardContent className="py-4">
          <p className="text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: t.raw("disclaimer") }} />
        </CardContent>
      </Card>
    </div>
  );
}
