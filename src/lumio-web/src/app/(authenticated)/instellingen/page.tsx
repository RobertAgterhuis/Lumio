"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { api } from "@/lib/api-client";
import { useDomainQuery } from "@/hooks";
import { useAuthStore, type Profile } from "@/stores/authStore";
import { usePreferencesStore } from "@/stores/preferencesStore";
import { useTranslations } from "next-intl";
import { Settings } from "lucide-react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import {
  PasswordChangeCard,
  ProfilesCard,
  BackupRestoreCard,
  SecurityInfoCard,
  AccountDeletionCard,
  AboutCard,
  AutoLockCard,
  GroteTekstCard,
  DashboardWeergaveCard,
  TaalkeuzeCard,
  ActualisatieCard,
  SortableInstellingenCard,
  ReferralCard,
} from "@/components/instellingen";
import { HelpButton } from "@/components/help/HelpButton";

const DEFAULT_LINKS = ["autolock", "grote-tekst", "dashboard-weergave", "taalkeuze", "actualisatie"] as const;
const DEFAULT_RECHTS = ["profielen", "wachtwoord", "backup", "beveiliging", "over", "aanbevelen", "verwijderen"] as const;
const ALL_CARDS = [...DEFAULT_LINKS, ...DEFAULT_RECHTS] as readonly string[];

function resolveOrder(stored: string[], defaults: readonly string[], exclude: string[] = []): string[] {
  const base =
    stored.length > 0
      ? [
          ...stored.filter((k) => ALL_CARDS.includes(k)),
          ...defaults.filter((k) => !stored.includes(k)),
        ]
      : [...defaults];
  return base.filter((k) => !exclude.includes(k));
}

export default function InstellingenPage() {
  const router = useRouter();
  const { lock, setProfiles } = useAuthStore();
  const {
    instellingenVolgordeLinks,
    instellingenVolgordeRechts,
    setInstellingenVolgordeLinks,
    setInstellingenVolgordeRechts,
  } = usePreferencesStore();
  const backupRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  // Local column state — mutated optimistically during drag, persisted on drop
  // colRechts excludes whatever is already in colLinks to prevent duplicates
  const [colLinks, setColLinks] = useState<string[]>(() =>
    resolveOrder(instellingenVolgordeLinks, DEFAULT_LINKS),
  );
  const [colRechts, setColRechts] = useState<string[]>(() => {
    const links = resolveOrder(instellingenVolgordeLinks, DEFAULT_LINKS);
    return resolveOrder(instellingenVolgordeRechts, DEFAULT_RECHTS, links);
  });
  const [activeId, setActiveId] = useState<string | null>(null);

  // Sync store → local when not dragging (e.g. after external reset)
  useEffect(() => {
    if (!isDraggingRef.current) {
      const links = resolveOrder(instellingenVolgordeLinks, DEFAULT_LINKS);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setColLinks(links);
      setColRechts(resolveOrder(instellingenVolgordeRechts, DEFAULT_RECHTS, links));
    }
  }, [instellingenVolgordeLinks, instellingenVolgordeRechts]);

  // Scroll to and focus backup section when navigated via #backup hash
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash === "#backup" && backupRef.current) {
      backupRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      backupRef.current.focus();
    }
  }, []);

  const t = useTranslations("instellingen");

  // Dialog state
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteProfileConfirm, setShowDeleteProfileConfirm] = useState<string | null>(null);
  const [pendingRestoreHandler, setPendingRestoreHandler] = useState<(() => void) | null>(null);
  const [pendingDeleteAccountHandler, setPendingDeleteAccountHandler] = useState<(() => void) | null>(null);

  const { data: profilesData, refetch: refetchProfiles } = useDomainQuery<Profile[]>("profielen");
  useEffect(() => {
    if (profilesData) setProfiles(profilesData);
  }, [profilesData, setProfiles]);

  const handleDeleteProfile = async (profileId: string) => {
    setShowDeleteProfileConfirm(null);
    try {
      await api.delete(`/api/profielen/${profileId}`);
      refetchProfiles();
    } catch { /* handled in component */ }
  };

  const handleRestoreConfirm = () => {
    pendingRestoreHandler?.();
    setPendingRestoreHandler(null);
    setShowRestoreConfirm(false);
  };

  const handleDeleteAccountConfirm = () => {
    pendingDeleteAccountHandler?.();
    setPendingDeleteAccountHandler(null);
    setShowDeleteConfirm(false);
  };

  const handlePostAction = () => {
    lock();
    router.replace("/");
  };

  // ── DnD ──────────────────────────────────────────────────────────────
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function findColumn(id: string): "links" | "rechts" | null {
    if (colLinks.includes(id)) return "links";
    if (colRechts.includes(id)) return "rechts";
    return null;
  }

  function handleDragStart({ active }: DragStartEvent) {
    isDraggingRef.current = true;
    setActiveId(active.id as string);
  }

  function handleDragOver({ active, over }: DragOverEvent) {
    if (!over || active.id === over.id) return;
    const aId = active.id as string;
    const oId = over.id as string;
    const aCol = findColumn(aId);
    const oCol = findColumn(oId);
    if (!aCol || !oCol) return;

    if (aCol === oCol) {
      // Same-column reorder
      if (aCol === "links") {
        const oi = colLinks.indexOf(aId), ni = colLinks.indexOf(oId);
        if (oi !== ni) setColLinks((c) => arrayMove(c, oi, ni));
      } else {
        const oi = colRechts.indexOf(aId), ni = colRechts.indexOf(oId);
        if (oi !== ni) setColRechts((c) => arrayMove(c, oi, ni));
      }
    } else {
      // Cross-column move: insert before the hovered card
      if (aCol === "links") {
        const overIdx = colRechts.indexOf(oId);
        setColLinks((c) => c.filter((id) => id !== aId));
        setColRechts((c) => {
          const without = c.filter((id) => id !== aId);
          return [...without.slice(0, overIdx), aId, ...without.slice(overIdx)];
        });
      } else {
        const overIdx = colLinks.indexOf(oId);
        setColRechts((c) => c.filter((id) => id !== aId));
        setColLinks((c) => {
          const without = c.filter((id) => id !== aId);
          return [...without.slice(0, overIdx), aId, ...without.slice(overIdx)];
        });
      }
    }
  }

  function handleDragEnd({ over }: DragEndEvent) {
    isDraggingRef.current = false;
    setActiveId(null);
    if (!over) {
      // Cancelled — revert
      const links = resolveOrder(instellingenVolgordeLinks, DEFAULT_LINKS);
      setColLinks(links);
      setColRechts(resolveOrder(instellingenVolgordeRechts, DEFAULT_RECHTS, links));
      return;
    }
    // Persist final layout
    setInstellingenVolgordeLinks(colLinks);
    setInstellingenVolgordeRechts(colRechts);
  }

  function handleDragCancel() {
    isDraggingRef.current = false;
    setActiveId(null);
    const links = resolveOrder(instellingenVolgordeLinks, DEFAULT_LINKS);
    setColLinks(links);
    setColRechts(resolveOrder(instellingenVolgordeRechts, DEFAULT_RECHTS, links));
  }

  // ── Card renderer ─────────────────────────────────────────────────────
  function renderCard(cardId: string) {
    switch (cardId) {
      case "autolock":         return <AutoLockCard />;
      case "grote-tekst":      return <GroteTekstCard />;
      case "dashboard-weergave": return <DashboardWeergaveCard />;
      case "taalkeuze":        return <TaalkeuzeCard />;
      case "actualisatie":     return <ActualisatieCard />;
      case "profielen":
        return <ProfilesCard onDeleteRequest={(id) => setShowDeleteProfileConfirm(id)} />;
      case "wachtwoord":       return <PasswordChangeCard />;
      case "backup":
        return (
          <div id="backup" ref={backupRef} tabIndex={-1} className="outline-none">
            <BackupRestoreCard
              onRestoreRequest={(handler: () => void) => {
                setPendingRestoreHandler(() => handler);
                setShowRestoreConfirm(true);
              }}
              onPostRestore={handlePostAction}
            />
          </div>
        );
      case "beveiliging":      return <SecurityInfoCard />;
      case "over":             return <AboutCard />;
      case "aanbevelen":      return <ReferralCard />;
      case "verwijderen":
        return (
          <AccountDeletionCard
            onDeleteRequest={(handler: () => void) => {
              setPendingDeleteAccountHandler(() => handler);
              setShowDeleteConfirm(true);
            }}
            onPostDelete={handlePostAction}
          />
        );
      default: return null;
    }
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Settings className="h-8 w-8 text-primary" />
          {t("titel")}
          <HelpButton />
        </h1>
        <p className="text-muted-foreground mt-1">{t("ondertitel")}</p>
      </div>

      {/* Single DndContext — cards can move freely between both columns */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="grid gap-6 pt-4 sm:grid-cols-2 items-start">
          {/* Left column */}
          <SortableContext items={colLinks} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-6">
              {colLinks.map((cardId) => (
                <SortableInstellingenCard key={cardId} id={cardId}>
                  {renderCard(cardId)}
                </SortableInstellingenCard>
              ))}
            </div>
          </SortableContext>

          {/* Right column */}
          <SortableContext items={colRechts} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-6">
              {colRechts.map((cardId) => (
                <SortableInstellingenCard key={cardId} id={cardId}>
                  {renderCard(cardId)}
                </SortableInstellingenCard>
              ))}
            </div>
          </SortableContext>
        </div>

        {/* Ghost card shown while dragging */}
        <DragOverlay>
          {activeId ? (
            <div className="opacity-90 rotate-1 scale-[1.02] shadow-2xl">
              {renderCard(activeId)}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Restore confirmation dialog */}
      <Dialog open={showRestoreConfirm} onOpenChange={setShowRestoreConfirm}>
        <DialogHeader>
          <DialogTitle>{t("dialogen.herstel.titel")}</DialogTitle>
          <DialogDescription>{t("dialogen.herstel.beschrijving")}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowRestoreConfirm(false)}>
            {t("dialogen.herstel.annuleren")}
          </Button>
          <Button onClick={handleRestoreConfirm}>
            {t("dialogen.herstel.bevestigen")}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Delete account confirmation dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogHeader>
          <DialogTitle className="text-destructive">
            {t("dialogen.verwijderAlles.titel")}
          </DialogTitle>
          <DialogDescription>{t("dialogen.verwijderAlles.beschrijving")}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
            {t("dialogen.verwijderAlles.annuleren")}
          </Button>
          <Button variant="destructive" onClick={handleDeleteAccountConfirm}>
            {t("dialogen.verwijderAlles.bevestigen")}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Profile delete confirmation dialog */}
      <Dialog
        open={showDeleteProfileConfirm !== null}
        onOpenChange={(open) => !open && setShowDeleteProfileConfirm(null)}
      >
        <DialogHeader>
          <DialogTitle className="text-destructive">
            {t("dialogen.verwijderProfiel.titel")}
          </DialogTitle>
          <DialogDescription>{t("dialogen.verwijderProfiel.beschrijving")}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowDeleteProfileConfirm(null)}>
            {t("dialogen.verwijderProfiel.annuleren")}
          </Button>
          <Button
            variant="destructive"
            onClick={() => showDeleteProfileConfirm && handleDeleteProfile(showDeleteProfileConfirm)}
          >
            {t("dialogen.verwijderProfiel.bevestigen")}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
