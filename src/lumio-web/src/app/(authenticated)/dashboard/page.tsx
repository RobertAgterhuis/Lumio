"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDomainQuery } from "@/hooks";
import { api } from "@/lib/api-client";
import { useAuthStore } from "@/stores/authStore";
import { usePreferencesStore, type DashboardPreferences, type BooleanPreferenceKey } from "@/stores/preferencesStore";
import { NabestaandenDashboard } from "@/components/nabestaanden/NabestaandenDashboard";
import { StatistiekenWidget } from "@/components/dashboard/StatistiekenWidget";
import { VoortgangGranulair } from "@/components/dashboard/VoortgangGranulair";
import { ProfielSuggesties } from "@/components/dashboard/ProfielSuggesties";
import { MeldingenWidget } from "@/components/dashboard/MeldingenWidget";
import { BackupStatusWidget } from "@/components/dashboard/BackupStatusWidget";
import { AanbevolenStapWidget } from "@/components/dashboard/AanbevolenStapWidget";
import { DocumentenVerloopdatumWidget } from "@/components/dashboard/DocumentenVerloopdatumWidget";
import { SortableDomeinKaart } from "@/components/dashboard/SortableDomeinKaart";
import { SortableSection } from "@/components/dashboard/SortableSection";
import { InterviewWizard } from "@/components/interview/InterviewWizard";
import { useTranslations } from "next-intl";
import {
  EyeOff,
  Loader2,
} from "lucide-react";
import { LumioIcon, type LumioIconName } from "@/components/ui/lumio-icon";
import { cn } from "@/lib/utils";
import { HelpButton } from "@/components/help/HelpButton";
import { DossierVolledigBanner } from "@/components/wizard/DossierVolledigBanner";
import { PageBanner } from "@/components/layout/PageBanner";
import { FadeIn, SlideIn } from "@/components/ui/transitions";

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

const domainCards: Array<{
  href: string;
  domein: string;
  lumioIcon: LumioIconName;
  domeinKey: string;
  color: string;
  bgColor: string;
}> = [
  {
    href: "/eigenaar",
    domein: "eigenaar",
    lumioIcon: "profiel",
    domeinKey: "eigenaar",
    color: "text-primary",
    bgColor: "bg-primary-100",
  },
  {
    href: "/noodcontacten",
    domein: "noodcontacten",
    lumioIcon: "noodcontacten",
    domeinKey: "noodcontacten",
    color: "text-primary",
    bgColor: "bg-primary-100",
  },
  {
    href: "/testament",
    domein: "testament",
    lumioIcon: "testament",
    domeinKey: "testament",
    color: "text-sage",
    bgColor: "bg-sage-100",
  },
  {
    href: "/euthanasie",
    domein: "euthanasie",
    lumioIcon: "wilsverklaring",
    domeinKey: "euthanasie",
    color: "text-sage",
    bgColor: "bg-sage-100",
  },
  {
    href: "/donor",
    domein: "donor",
    lumioIcon: "donor",
    domeinKey: "donor",
    color: "text-success",
    bgColor: "bg-success-100",
  },
  {
    href: "/uitvaart",
    domein: "uitvaart",
    lumioIcon: "uitvaart",
    domeinKey: "uitvaart",
    color: "text-sage",
    bgColor: "bg-sage-100",
  },
  {
    href: "/erfgenamen",
    domein: "erfgenamen",
    lumioIcon: "erfgenamen",
    domeinKey: "erfgenamen",
    color: "text-primary",
    bgColor: "bg-primary-100",
  },
  {
    href: "/boedel",
    domein: "boedel",
    lumioIcon: "boedel",
    domeinKey: "boedel",
    color: "text-success",
    bgColor: "bg-success-100",
  },
  {
    href: "/digitaal-bezit",
    domein: "digitaal-bezit",
    lumioIcon: "digitaal-bezit",
    domeinKey: "digitaalBezit",
    color: "text-primary",
    bgColor: "bg-primary-100",
  },
  {
    href: "/documenten",
    domein: "documenten",
    lumioIcon: "documenten",
    domeinKey: "documenten",
    color: "text-sage",
    bgColor: "bg-sage-100",
  },
];

interface ActualisatieDomein {
  domein: string;
  label: string;
  isAfgerond: boolean;
  laatsteBevestiging: string | null;
  actualisatieNodig: boolean;
}

export default function DashboardPage() {
  const { isReadOnly } = useAuthStore();
  const {
    showVoortgang, showStatistieken, showVoortgangGranulair, showSuggesties,
    hiddenDomeinKaarten, domeinKaartenVolgorde, sectieVolgorde,
    showMeldingen, showBackup, showAanbevolen, showVerloopdatum,
    toggleSection, toggleDomeinKaart, setDomeinKaartenVolgorde, setSectieVolgorde,
  } = usePreferencesStore();
  const [showInterview, setShowInterview] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [widgetHasContent, setWidgetHasContent] = useState<Record<string, boolean>>({});
  const reportContent = (id: string) => (v: boolean) => setWidgetHasContent((prev) => ({ ...prev, [id]: v }));
  const t = useTranslations("dashboard");

  // dnd-kit sensors: require 8px movement to distinguish drag from click
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // Build ordered + filtered card list for the grid
  const defaultOrder = domainCards.map((c) => c.domein);
  const orderedDomeinKeys =
    domeinKaartenVolgorde.length > 0
      ? [
          ...domeinKaartenVolgorde.filter((k) => defaultOrder.includes(k)),
          ...defaultOrder.filter((k) => !domeinKaartenVolgorde.includes(k)),
        ]
      : defaultOrder;
  const orderedVisibleCards = orderedDomeinKeys
    .map((key) => domainCards.find((c) => c.domein === key))
    .filter((c): c is typeof domainCards[number] => c !== undefined)
    .filter((c) => !hiddenDomeinKaarten.includes(c.domein));

  function handleDomainDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = orderedDomeinKeys.indexOf(active.id as string);
    const newIndex = orderedDomeinKeys.indexOf(over.id as string);
    setDomeinKaartenVolgorde(arrayMove(orderedDomeinKeys, oldIndex, newIndex));
  }

  // Section ordering
  // React Query hooks needed by sectionVisibility — must be above that block
  const { data: eigenaarData, isSuccess: hasProfile, isFetched: profileFetched } = useDomainQuery<{ voornaam?: string } | null>("eigenaar");
  const { data: compleetheid, isFetched: compleetheitFetched } = useDomainQuery<Compleetheid>("status/compleetheid", { staleTime: 0 });
  const { data: actualisatieData, refetch: refetchActualisatie } = useDomainQuery<{ domeinen: ActualisatieDomein[]; herinneringNodig: boolean }>("status/actualisatie", { staleTime: 0 });

  useEffect(() => {
    if (profileFetched && compleetheitFetched) setIsInitializing(false); // eslint-disable-line react-hooks/set-state-in-effect
  }, [profileFetched, compleetheitFetched]);
  const actualisatie = actualisatieData?.domeinen ?? [];
  const aanbevolenDomein = compleetheid?.domeinen.find((d) => !d.ingevuld)?.domein ?? null;

  const DEFAULT_SECTIONS = ["suggesties", "statistieken", "meldingen", "aanbevolen", "voortgang", "granulair", "backup", "verloopdatum"];
  const sectionVisibility: Record<string, boolean> = {
    voortgang: showVoortgang,
    statistieken: showStatistieken && (widgetHasContent.statistieken !== false),
    granulair: showVoortgangGranulair,
    suggesties: showSuggesties,
    meldingen: showMeldingen,
    backup: showBackup && (widgetHasContent.backup !== false),
    aanbevolen: showAanbevolen && aanbevolenDomein !== null,
    verloopdatum: showVerloopdatum && (widgetHasContent.verloopdatum !== false),
  };
  const orderedSectieIds = (
    sectieVolgorde.length > 0
      ? [
          ...sectieVolgorde.filter((k) => DEFAULT_SECTIONS.includes(k)),
          ...DEFAULT_SECTIONS.filter((k) => !sectieVolgorde.includes(k)),
        ]
      : DEFAULT_SECTIONS
  ).filter((k) => sectionVisibility[k]);

  function handleSectionDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const fullOrder =
      sectieVolgorde.length > 0
        ? [...sectieVolgorde.filter((k) => DEFAULT_SECTIONS.includes(k)), ...DEFAULT_SECTIONS.filter((k) => !sectieVolgorde.includes(k))]
        : [...DEFAULT_SECTIONS];
    const oldIndex = fullOrder.indexOf(active.id as string);
    const newIndex = fullOrder.indexOf(over.id as string);
    setSectieVolgorde(arrayMove(fullOrder, oldIndex, newIndex));
  }

  // React Query hooks for dashboard data
  // (eigenaarData, compleetheid, actualisatieData already declared above for sectionVisibility)

  type CardStatus = "afgerond" | "reviewNodig" | "bezig" | "beginnen";

  const getCardStatus = (domein: string): CardStatus => {
    // S4-02: server-driven isAfgerond (not localStorage)
    const actualisatieDomein = actualisatie.find((a) => a.domein === domein);
    const isAfgerond = actualisatieDomein?.isAfgerond ?? false;
    const actualisatieNodig = actualisatieDomein?.actualisatieNodig ?? false;
    const hasData = getDomeinStatus(domein);
    // S4-03: reviewNodig also when domain has data but hasnt been explicitly reviewed yet
    const needsReview = (isAfgerond || hasData === true) && actualisatieNodig;
    if (needsReview) return "reviewNodig";
    if (isAfgerond) return "afgerond";
    if (hasData) return "bezig";
    return "beginnen";
  };

  const HideButton = ({ section, label }: { section: BooleanPreferenceKey; label: string }) => (
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

  const getDomeinStatus = (domein: string): boolean | null => {
    if (!compleetheid) return null;
    const d = compleetheid.domeinen.find((x) => x.domein === domein);
    return d?.ingevuld ?? null;
  };

  // In read-only (erfgenaam) mode, show the nabestaanden dashboard
  if (isReadOnly) {
    return <NabestaandenDashboard />;
  }

  if (isInitializing) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Hero skeleton */}
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-muted" />
            <div className="space-y-2 flex-1">
              <div className="h-5 w-48 rounded bg-muted" />
              <div className="h-3 w-72 rounded bg-muted" />
            </div>
          </div>
          <div className="mt-4 h-2 w-full rounded-full bg-muted" />
        </div>
        {/* Quick action & tip skeletons */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-lg border bg-card p-5 space-y-3">
            <div className="h-4 w-32 rounded bg-muted" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-20 rounded-lg bg-muted" />
              ))}
            </div>
          </div>
          <div className="rounded-lg border bg-card p-5 space-y-3">
            <div className="h-4 w-28 rounded bg-muted" />
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-4 w-full rounded bg-muted" />
              ))}
            </div>
          </div>
        </div>
        {/* Domain card skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-lg border bg-card overflow-hidden">
              <div className="h-10 bg-muted" />
              <div className="p-4 space-y-2">
                <div className="h-4 w-32 rounded bg-muted" />
                <div className="h-3 w-full rounded bg-muted" />
                <div className="h-3 w-2/3 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Hero Welcome Card ────────────────────────────────────────── */}
      <FadeIn show={!isInitializing} duration={400}>
        <div className="rounded-xl border border-primary/15 bg-linear-to-br from-primary-50 via-card to-sage-100/30 p-6 shadow-md ring-1 ring-primary/5">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold font-display text-primary">
              {(() => {
                const uur = new Date().getHours();
                const dagdeel = uur < 12 ? t("begroeting.ochtend") : uur < 18 ? t("begroeting.middag") : t("begroeting.avond");
                const naam = (eigenaarData as { voornaam?: string } | null)?.voornaam;
                return naam ? `${dagdeel}, ${naam}` : t("titel");
              })()}
            </h1>
            <HelpButton />
          </div>
          <p className="text-muted-foreground mt-1">
            {t("beschrijving")}
          </p>
        </div>
      </FadeIn>

      {/* Legal notice — shown until permanently dismissed */}
      <PageBanner id="dashboard-juridisch-notice" variant="info">
        <strong>{t("letOp")}</strong> {t("juridisch")}
      </PageBanner>

      {/* SP-UX-03-001: Celebration banner — shows for 5s after first wizard completion */}
      <DossierVolledigBanner />

      {/* Individual draggable widgets — 2-column grid, each widget independently reorderable */}
      <SlideIn show={!isInitializing} from="up" distance={12} duration={500}>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSectionDragEnd}>
        <SortableContext items={orderedSectieIds} strategy={rectSortingStrategy}>
          <div className="grid gap-6 md:grid-cols-2 pt-4">
            {orderedSectieIds.map((widgetId) => {
              if (widgetId === "voortgang") return (
                <SortableSection key="voortgang" id="voortgang">
                  {compleetheid ? (
                    <div className="rounded-lg border bg-card p-5 h-full shadow-sm hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-semibold text-primary">{t("voortgang.titel")}</h2>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-primary">{compleetheid.percentage}%</span>
                          <HideButton section="showVoortgang" label={t("voortgang.titel")} />
                        </div>
                      </div>
                      <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-700 ease-out",
                            compleetheid.percentage === 100
                              ? "bg-linear-to-r from-success to-success/80 shadow-[0_0_8px_rgba(45,107,49,0.4)]"
                              : "bg-linear-to-r from-primary to-primary-400"
                          )}
                          style={{ width: `${compleetheid.percentage}%` }}
                        />
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {t("voortgang.onderdelen", { aantalIngevuld: compleetheid.aantalIngevuld, totaal: compleetheid.totaal })}
                      </p>
                    </div>
                  ) : null}
                </SortableSection>
              );
              if (widgetId === "statistieken") return (
                <SortableSection key="statistieken" id="statistieken">
                  <div className="relative h-full">
                    <div className="absolute top-3 right-3 z-10">
                      <HideButton section="showStatistieken" label={t("statistieken.titel")} />
                    </div>
                    <StatistiekenWidget onHasContent={reportContent("statistieken")} />
                  </div>
                </SortableSection>
              );
              if (widgetId === "granulair") return (
                <SortableSection key="granulair" id="granulair">
                  <div className="relative h-full">
                    <div className="absolute top-3 right-3 z-10">
                      <HideButton section="showVoortgangGranulair" label={t("voortgangGranulair.titel")} />
                    </div>
                    <VoortgangGranulair />
                  </div>
                </SortableSection>
              );
              if (widgetId === "suggesties") return (
                <SortableSection key="suggesties" id="suggesties">
                  <div className="relative h-full">
                    <div className="absolute top-3 right-3 z-10">
                      <HideButton section="showSuggesties" label={t("suggesties.titel")} />
                    </div>
                    <ProfielSuggesties profileIsEmpty={!compleetheid || compleetheid.aantalIngevuld === 0} />
                  </div>
                </SortableSection>
              );
              if (widgetId === "meldingen") return (
                <SortableSection key="meldingen" id="meldingen"><MeldingenWidget /></SortableSection>
              );
              if (widgetId === "backup") return (
                <SortableSection key="backup" id="backup"><BackupStatusWidget onHasContent={reportContent("backup")} /></SortableSection>
              );
              if (widgetId === "aanbevolen") return (
                <SortableSection key="aanbevolen" id="aanbevolen"><AanbevolenStapWidget onStartInterview={() => setShowInterview(true)} /></SortableSection>
              );
              if (widgetId === "verloopdatum") return (
                <SortableSection key="verloopdatum" id="verloopdatum"><DocumentenVerloopdatumWidget onHasContent={reportContent("verloopdatum")} /></SortableSection>
              );
              return null;
            })}
          </div>
        </SortableContext>
      </DndContext>
      </SlideIn>

      {/* Domain cards — independently reorderable within their own grid */}
      {orderedVisibleCards.length > 0 && (
        <SlideIn show={!isInitializing} from="up" distance={16} duration={600}>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDomainDragEnd}>
          <SortableContext items={orderedVisibleCards.map((c) => c.domein)} strategy={rectSortingStrategy}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {orderedVisibleCards.map((card) => {
                const cardStatus = getCardStatus(card.domein);
                const isAanbevolen = card.domein === aanbevolenDomein;
                return (
                  <SortableDomeinKaart
                    key={card.domein}
                    card={card}
                    cardStatus={cardStatus}
                    isAanbevolen={isAanbevolen}
                    onHide={() => toggleDomeinKaart(card.domein)}
                    onMarkToggle={async () => {
                      try {
                        if (cardStatus === "reviewNodig" || cardStatus === "bezig") {
                          await api.post(`/api/status/actualisatie/${card.domein}`, {});
                        } else if (cardStatus === "afgerond") {
                          await api.delete(`/api/status/actualisatie/${card.domein}`);
                        } else {
                          await api.post(`/api/status/actualisatie/${card.domein}`, {});
                        }
                        refetchActualisatie();
                      } catch {
                        // Ignore
                      }
                    }}
                  />
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
        </SlideIn>
      )}

      {showInterview && (
        <div className="rounded-lg border bg-card p-6">
          <InterviewWizard
            onComplete={() => {
              setShowInterview(false);
              window.location.reload();
            }}
            onCancel={() => setShowInterview(false)}
          />
        </div>
      )}


    </div>
  );
}
