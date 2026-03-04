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
  BookOpen,
} from "lucide-react";
import { useHelpStore } from "@/stores/helpStore";
import { helpChapters } from "@/content/help-chapters";

// Maps bgColor utility class → a header background colour via an explicit
// Tailwind class (so the compiler never purges it).
const HEADER_BG: Record<string, string> = {
  "bg-primary-100":  "bg-primary-100",
  "bg-sage-100":     "bg-sage-100",
  "bg-success-100":  "bg-success-100",
};

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
  const { openPanel } = useHelpStore();

  // Derive the help chapter slug that matches this domain
  const chapterSlug =
    helpChapters.find((ch) => ch.relatedRoute === "/" + card.domein)?.slug ??
    card.domein;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.domein });

  const headerBg = HEADER_BG[card.bgColor] ?? card.bgColor;

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
        scale: isDragging ? "1.03" : undefined,
        position: "relative",
        zIndex: isDragging ? 10 : undefined,
        cursor: isDragging ? "grabbing" : "grab",
      }}
    >
      <Link href={card.href} draggable={false}>
        <Card className={`h-full overflow-hidden transition-all duration-200 cursor-[inherit] select-none hover:shadow-lg hover:-translate-y-0.5 ${
          isAanbevolen ? "border-primary/60 ring-2 ring-primary/30 shadow-md bg-linear-to-b from-primary-50/50 to-card" : ""
        }`}>

          {/* ── Coloured header row ────────────────────────────────────── */}
          <div className={`${headerBg} px-3 py-2.5 flex items-center justify-between border-b border-black/5 dark:border-white/10`}>
            {/* Left: drag grip + domain icon */}
            <div className="flex items-center gap-2">
              <span
                className={`p-0.5 -ml-0.5 pointer-events-none ${card.color} opacity-40`}
                aria-hidden="true"
              >
                <GripVertical className="h-4 w-4" />
              </span>
              <LumioIcon name={card.lumioIcon} size="md" className={card.color} />
            </div>

            {/* Right: status badge + hide button */}
            <div className="flex items-center gap-1">
              {cardStatus === "afgerond" ? (
                <Badge variant="soft-success" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {t("status.afgerond")}
                </Badge>
              ) : cardStatus === "reviewNodig" ? (
                <Badge variant="soft-warning" className="gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {t("status.reviewNodig")}
                </Badge>
              ) : cardStatus === "bezig" ? (
                <Badge variant="soft-info" className="gap-1">
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
                className={`h-7 text-xs px-2 gap-1 ${card.color} opacity-70 hover:opacity-100 hover:bg-black/10 hover:text-primary-700 dark:hover:bg-white/10 dark:hover:text-primary-300`}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onHide(); }}
              >
                <EyeOff className="h-3.5 w-3.5" />
                {t("verbergen")}
              </Button>
            </div>
          </div>

          {/* ── Card body ──────────────────────────────────────────────── */}
          <CardHeader className="pb-2 pt-3">
            <CardTitle className="text-lg flex items-center gap-2">
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
              {cardStatus === "beginnen" ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs px-2 gap-1 text-muted-foreground hover:text-primary"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openPanel(chapterSlug);
                  }}
                  title={t("hoeWerkt", { titel: t(`domein.${card.domeinKey}.titel`) })}
                  aria-label={t("hoeWerkt", { titel: t(`domein.${card.domeinKey}.titel`) })}
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  {t("helpHint")}
                </Button>
              ) : (
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
