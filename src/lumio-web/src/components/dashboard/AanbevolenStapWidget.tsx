"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, EyeOff, ScrollText, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LumioIcon, type LumioIconName } from "@/components/ui/lumio-icon";
import { useDomainQuery } from "@/hooks";
import { usePreferencesStore } from "@/stores/preferencesStore";
import { useTranslations } from "next-intl";

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

const DOMEIN_ICON_MAP: Record<string, LumioIconName> = {
  eigenaar: "profiel",
  noodcontacten: "noodcontacten",
  testament: "testament",
  euthanasie: "wilsverklaring",
  donor: "donor",
  uitvaart: "uitvaart",
  erfgenamen: "erfgenamen",
  boedel: "boedel",
  "digitaal-bezit": "digitaal-bezit",
  documenten: "documenten",
};

const DOMEIN_HREF_MAP: Record<string, string> = {
  eigenaar: "/eigenaar",
  noodcontacten: "/noodcontacten",
  testament: "/testament",
  euthanasie: "/euthanasie",
  donor: "/donor",
  uitvaart: "/uitvaart",
  erfgenamen: "/erfgenamen",
  boedel: "/boedel",
  "digitaal-bezit": "/digitaal-bezit",
  documenten: "/documenten",
};

export function AanbevolenStapWidget({ onStartInterview }: { onStartInterview?: () => void }) {
  const t = useTranslations("dashboard");
  const toggleSection = usePreferencesStore((s) => s.toggleSection);
  const { data: compleetheid, isLoading } = useDomainQuery<Compleetheid>("status/compleetheid");

  if (isLoading || !compleetheid) return null;

  const aanbevolen = compleetheid.domeinen.find((d) => !d.ingevuld);
  if (!aanbevolen) return null;

  const icon = DOMEIN_ICON_MAP[aanbevolen.domein];
  const href = DOMEIN_HREF_MAP[aanbevolen.domein] ?? "/dashboard";

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <Sparkles className="h-4 w-4" />
            {t("aanbevolenStap.titel")}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleSection("showAanbevolen")}
            className="text-xs text-muted-foreground gap-1 h-7 px-2"
          >
            <EyeOff className="h-3.5 w-3.5" />
            {t("verbergen")}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {icon && <LumioIcon name={icon} size="sm" className="text-primary" />}
          <div>
            <p className="font-medium text-sm">{aanbevolen.label}</p>
            <p className="text-xs text-muted-foreground">
              {t("aanbevolenStap.beschrijving")}
            </p>
          </div>
        </div>
        {aanbevolen.domein === "eigenaar" && onStartInterview ? (
          <div className="flex gap-2 shrink-0">
            <Button size="sm" variant="outline" onClick={onStartInterview} className="gap-1">
              <ScrollText className="h-3.5 w-3.5" />
              {t("geenProfiel.interview")}
            </Button>
            <Link href={href}>
              <Button size="sm" className="gap-1">
                <User className="h-3.5 w-3.5" />
                {t("geenProfiel.direct")}
              </Button>
            </Link>
          </div>
        ) : (
          <Link href={href}>
            <Button size="sm" variant="outline" className="shrink-0 gap-1">
              {t("aanbevolenStap.actie")}
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
