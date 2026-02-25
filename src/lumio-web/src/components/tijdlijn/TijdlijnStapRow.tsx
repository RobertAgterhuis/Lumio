"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Loader2,
} from "lucide-react";
import type { TijdlijnStapConfig } from "./tijdlijn-data";

interface TijdlijnStapRowProps {
  /** Phase key such as "24uur", "week1", etc. — for translation lookup */
  faseKey: string;
  /** Step key such as "uitvaart", "donor", etc. — for translation lookup */
  stapKey: string;
  /** Lucide icon for this step */
  stapIcon: React.ComponentType<{ className?: string }>;
  /** Tailwind text-color class for this phase */
  color: string;
  /** Tailwind bg-color class for this phase */
  bgColor: string;
  /** Tailwind border-color class for this phase */
  borderColor: string;
  /** Tailwind bg-color class for the dot on the timeline */
  dotColor: string;
  /** Domain config if this step is linked to a Lumio domain — undefined for non-linked steps */
  domainConfig?: TijdlijnStapConfig;
  /** Fetched domain data (may be null/undefined when not yet loaded or no data exists) */
  domainData: unknown;
  /** True while domain data is loading */
  isLoading?: boolean;
}

/**
 * TijdlijnStapRow — an expandable timeline step card.
 *
 * - Non-linked steps: shows title + static description only (not clickable).
 * - Linked steps: shows completion badge, is expandable.
 *   - When domain has data: shows a short summary + "Bekijken →" link.
 *   - When domain has no data: shows a prompt + "Invullen →" CTA.
 */
export function TijdlijnStapRow({
  faseKey,
  stapKey,
  stapIcon: StapIcon,
  color,
  bgColor,
  borderColor,
  dotColor,
  domainConfig,
  domainData,
  isLoading,
}: TijdlijnStapRowProps) {
  const t = useTranslations("tijdlijn");
  const [open, setOpen] = useState(false);

  const isLinked = !!domainConfig;
  const domainHasData =
    isLinked && domainData !== undefined && domainConfig!.hasData(domainData);
  const isCompleted = isLinked && domainHasData && domainConfig!.isCompleted(domainData);

  // Adapter so getSamenvatting can call t() without knowing the full type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tStr = (key: string, values?: any) => t(key as never, values) as unknown as string;

  return (
    <div className="relative">
      {/* Dot on the vertical timeline line */}
      <div
        className={`absolute -left-[calc(2rem+5px)] top-4 h-3 w-3 rounded-full ${dotColor} ring-4 ring-background`}
      />

      <Card
        className={`border ${borderColor} transition-colors hover:shadow-sm ${isLinked ? "cursor-pointer select-none" : ""}`}
        onClick={isLinked ? () => setOpen((v) => !v) : undefined}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-3">
            {/* Icon + title */}
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${bgColor}`}
              >
                <StapIcon className={`h-4 w-4 ${color}`} />
              </div>
              <CardTitle className="text-base">
                {t(`fasen.${faseKey}.${stapKey}.titel` as never)}
              </CardTitle>
            </div>

            {/* Right side: completion badge + chevron */}
            <div className="flex items-center gap-2 shrink-0">
              {isLinked && !isLoading && (
                isCompleted ? (
                  <Badge className="gap-1 bg-success-100 text-success hover:bg-success-100 dark:bg-success/20 dark:text-success pointer-events-none">
                    <CheckCircle2 className="h-3 w-3" />
                    {t("volledigIngevuld")}
                  </Badge>
                ) : domainHasData ? (
                  <Badge
                    variant="outline"
                    className="gap-1 text-muted-foreground pointer-events-none"
                  >
                    <Circle className="h-3 w-3" />
                    {t("gedeeltelijkIngevuld")}
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="gap-1 text-muted-foreground pointer-events-none"
                  >
                    <Circle className="h-3 w-3" />
                    {t("nogNietIngevuld")}
                  </Badge>
                )
              )}
              {isLinked && isLoading && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
              {isLinked && (
                open ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )
              )}
            </div>
          </div>
        </CardHeader>

        {/* Description — always visible when collapsed, hidden when expanded */}
        {!open && (
          <CardContent>
            <CardDescription className="text-sm leading-relaxed">
              {t(`fasen.${faseKey}.${stapKey}.beschrijving` as never)}
            </CardDescription>
          </CardContent>
        )}

        {/* Expanded panel — only for linked steps */}
        {isLinked && open && (
          <CardContent className="pt-0">
            {isLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("laden")}
              </div>
            ) : domainHasData ? (
              /* Domain has data — show summary + "Bekijken" link */
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {domainConfig!.getSamenvatting(domainData, tStr)}
                </p>
                <Link href={domainConfig!.href} onClick={(e) => e.stopPropagation()}>
                  <Button variant="outline" size="sm" className="gap-2">
                    {t("bekijken")}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            ) : (
              /* No data yet — prompt the user to fill it in */
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {t(`legeStaat.${stapKey}` as never)}
                </p>
                <Link href={domainConfig!.href} onClick={(e) => e.stopPropagation()}>
                  <Button size="sm" className="gap-2">
                    {t("invullen")}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
