"use client";

import Link from "next/link";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LumioIcon, type LumioIconName } from "@/components/ui/lumio-icon";
import { useTranslations } from "next-intl";
import {
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  EyeOff,
  GripVertical,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export type CardStatus = "afgerond" | "reviewNodig" | "bezig" | "beginnen";

export interface DomeinCardData {
  href: string;
  domein: string;
  lumioIcon: LumioIconName;
  domeinKey: string;
  color: string;
  bgColor: string;
}

interface Props {
  card: DomeinCardData;
  cardStatus: CardStatus;
  isAanbevolen: boolean;
  onHide: () => void;
  onMarkToggle: () => void;
}

export function SortableDomeinKaart({ card, cardStatus, isAanbevolen, onHide, onMarkToggle }: Props) {
  const t = useTranslations("dashboard");

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.domein });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        position: "relative",
        zIndex: isDragging ? 10 : undefined,
        cursor: isDragging ? "grabbing" : "grab",
      }}
    >
      <Link href={card.href} draggable={false}>
          <Card className={`h-full transition-shadow hover:shadow-md cursor-[inherit] select-none ${
          isAanbevolen ? "border-primary/60 ring-2 ring-primary/20 shadow-sm" : ""
        }`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Drag hint icon */}
                <span
                  className="p-0.5 -ml-0.5 text-muted-foreground/40 pointer-events-none"
                  aria-hidden="true"
                >
                  <GripVertical className="h-4 w-4" />
                </span>
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.bgColor}`}>
                  <LumioIcon name={card.lumioIcon} size="md" className={card.color} />
                </div>
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
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onHide(); }}
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
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onMarkToggle(); }}
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
    </div>
  );
}
