"use client";
import { PageTransition } from "@/components/ui/transitions";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useDomainQuery } from "@/hooks/useDomainQuery";
import {
  Plus,
  Play,
  Pencil,
  Trash2,
  Users,
  Clock,
  HardDrive,
  Video,
  Loader2,
  Info,
} from "lucide-react";
import { useVideoboodschappen } from "@/components/videoboodschappen/useVideoboodschappen";
import { VideoboodschapDialog } from "@/components/videoboodschappen/VideoboodschapDialog";
import { SectieNotitie } from "@/components/notities/SectieNotitie";
import { toast } from "@/stores/toastStore";
import { getApiUrl } from "@/lib/api-client";
import { useAuthStore } from "@/stores/authStore";
import { HelpButton } from "@/components/help/HelpButton";
import type { Erfgenaam } from "@/components/erfgenamen/types";
import type { Videoboodschap, VideoboodschapFormData } from "@/components/videoboodschappen/types";

// ── Utilities ────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

function formatDuration(seconds?: number): string {
  if (!seconds) return "";
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function VideoboodschappenPage() {
  const t = useTranslations("videoboodschappen");
  const { isReadOnly } = useAuthStore();

  const {
    videoboodschappen,
    isLoading,
    uploading,
    uploadProgress,
    saving,
    opslaan,
    bijwerken,
    verwijderen,
  } = useVideoboodschappen();

  const { data: erfgenamen = [] } = useDomainQuery<Erfgenaam[]>("erfgenamen");
  const { data: limietData } = useDomainQuery<{
    maxAantal: number;
    maxDuurSeconden: number;
    maxBytes: number;
    gebruiktBytes: number;
  }>("videoboodschappen/limiet");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Videoboodschap | undefined>(undefined);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [playingItem, setPlayingItem] = useState<Videoboodschap | undefined>(undefined);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteItem, setConfirmDeleteItem] = useState<Videoboodschap | null>(null);

  // ── Helpers ──────────────────────────────────────────────────────────────

  const openNew = () => {
    setEditingItem(undefined);
    setDialogOpen(true);
  };

  const openEdit = (item: Videoboodschap) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const openPlayer = (item: Videoboodschap) => {
    setPlayingItem(item);
    setPlayerOpen(true);
  };

  const handleSave = useCallback(
    async (form: VideoboodschapFormData) => {
      if (editingItem) {
        await bijwerken(editingItem.id, {
          titel: form.titel,
          beschrijving: form.beschrijving || undefined,
          ontvangerIds: form.ontvangerIds,
        });
        toast.success(t("opgeslagen"));
      } else {
        if (!form.file) throw new Error(t("dialog.videoVerplicht"));
        await opslaan({
          file: form.file,
          titel: form.titel,
          beschrijving: form.beschrijving || undefined,
          ontvangerIds: form.ontvangerIds,
          duurSeconden: form.duurSeconden,
        });
        toast.success(t("toegevoegd"));
      }
    },
    [editingItem, bijwerken, opslaan, t]
  );

  const handleDelete = useCallback((item: Videoboodschap) => {
    setConfirmDeleteItem(item);
  }, []);

  const execDelete = useCallback(async () => {
    if (!confirmDeleteItem) return;
    setDeletingId(confirmDeleteItem.id);
    setConfirmDeleteItem(null);
    try {
      await verwijderen(confirmDeleteItem.id, confirmDeleteItem.titel);
    } finally {
      setDeletingId(null);
    }
  }, [confirmDeleteItem, verwijderen]);

  // ── Recipient name map ───────────────────────────────────────────────────

  const erfgenaamMap = new Map(
    erfgenamen.map((e) => [
      e.id,
      e.tussenvoegsel
        ? `${e.voornaam} ${e.tussenvoegsel} ${e.achternaam}`
        : `${e.voornaam} ${e.achternaam}`,
    ])
  );

  // ── Storage bar values (owner only) ─────────────────────────────────────

  const showStorageBar =
    !isReadOnly &&
    limietData != null &&
    limietData.maxBytes > 0;

  const storagePct = showStorageBar
    ? Math.min(100, Math.round((limietData!.gebruiktBytes / limietData!.maxBytes) * 100))
    : 0;

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <PageTransition className="mx-auto max-w-3xl space-y-6 p-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold font-display tracking-tight">{t("titel")}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t("subtitel")}</p>

          {showStorageBar && (
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">
                  {t("opslagGebruikt", {
                    gebruikt: formatBytes(limietData!.gebruiktBytes),
                    max: formatBytes(limietData!.maxBytes),
                  })}
                </span>
                <span className="text-xs text-muted-foreground">{storagePct}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${storagePct}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {!isReadOnly && (
            <Button onClick={openNew} className="gap-2">
              <Plus className="h-4 w-4" />
              {t("nieuw")}
            </Button>
          )}
          <HelpButton />
        </div>
      </div>

      {/* ── Section note ── */}
      <SectieNotitie sectie="videoboodschappen" />

      {/* ── Info callout (owner) ── */}
      {!isReadOnly && (
        <div className="flex gap-3 rounded-lg border border-info/30 bg-info-100 px-4 py-3 text-sm text-foreground">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-info" />
          <p>{t("erfgenaamToegangInfo")}</p>
        </div>
      )}

      {/* ── Info callout (heir mode) ── */}
      {isReadOnly && (
        <div className="flex gap-3 rounded-lg border border-info/30 bg-info-100 px-4 py-3 text-sm text-foreground">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-info" />
          <p>{t("erfgenaamModus")}</p>
        </div>
      )}

      {/* ── Loading ── */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* ── Empty state ── */}
      {!isLoading && videoboodschappen.length === 0 && (
        isReadOnly ? (
          <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
            <Video className="h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground text-sm">{t("legeStaat.beschrijving")}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Video className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="font-medium">{t("legeStaat.titel")}</p>
              <p className="text-muted-foreground text-sm mt-0.5">{t("legeStaat.beschrijving")}</p>
            </div>
            <Button onClick={openNew} className="gap-2 mt-1">
              <Plus className="h-4 w-4" />
              {t("legeStaat.actie")}
            </Button>
          </div>
        )
      )}

      {/* ── Video list ── */}
      {!isLoading && videoboodschappen.length > 0 && (
        <div className="space-y-3">
          {videoboodschappen.map((item) => {
            const isDeleting = deletingId === item.id;
            return (
              <Card
                key={item.id}
                className={cn(
                  "transition-shadow hover:shadow-md",
                  isDeleting && "opacity-50 pointer-events-none"
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Video className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-base leading-tight">
                          {item.titel}
                        </CardTitle>
                        {item.beschrijving && (
                          <CardDescription className="mt-0.5 line-clamp-2">
                            {item.beschrijving}
                          </CardDescription>
                        )}
                        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          {item.duurSeconden !== undefined && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDuration(item.duurSeconden)}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <HardDrive className="h-3 w-3" />
                            {formatBytes(item.bestandsGrootte)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openPlayer(item)}
                        title={t("afspelen")}
                      >
                        <Play className="h-3.5 w-3.5" />
                      </Button>
                      {!isReadOnly && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEdit(item)}
                            title={t("bewerken")}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(item)}
                            disabled={isDeleting}
                            title={t("verwijderen")}
                          >
                            {isDeleting ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>

                {item.ontvangers.length > 0 && (
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      {item.ontvangers.map((o) => (
                        <Badge key={o.id} variant="secondary" className="text-xs">
                          {erfgenaamMap.get(o.erfgenaamId) ?? t("onbekendeOntvanger")}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* ── Create / edit dialog (hidden in heir mode) ── */}
      {!isReadOnly && (
        <VideoboodschapDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          editing={editingItem}
          onSave={handleSave}
          uploading={uploading}
          uploadProgress={uploadProgress}
          saving={saving}
          erfgenamen={erfgenamen}
        />
      )}

      {/* ── Player dialog ── */}
      {playingItem && (
        <Dialog open={playerOpen} onOpenChange={setPlayerOpen}>
          <DialogHeader className="pb-2 shrink-0">
            <DialogTitle>{playingItem.titel}</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto">
            <video
              key={playingItem.id}
              src={getApiUrl(`/api/videoboodschappen/${playingItem.id}/stream`)}
              controls
              autoPlay
              className="w-full rounded-lg bg-black"
              style={{ maxHeight: 400 }}
            />
            {playingItem.beschrijving && (
              <p className="text-sm text-muted-foreground pt-2">
                {playingItem.beschrijving}
              </p>
            )}
          </div>
        </Dialog>
      )}

      {/* ── Delete confirm dialog ── */}
      <Dialog
        open={confirmDeleteItem !== null}
        onOpenChange={(open) => { if (!open) setConfirmDeleteItem(null); }}
      >
        <DialogHeader>
          <DialogTitle>{t("verwijderenBevestigTitel")}</DialogTitle>
        </DialogHeader>
        <p className="py-4 text-sm text-muted-foreground">
          {t("verwijderenBevestig", { titel: confirmDeleteItem?.titel ?? "" })}
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={() => setConfirmDeleteItem(null)}>
            {t("annuleren")}
          </Button>
          <Button variant="destructive" onClick={execDelete}>
            {t("verwijderen")}
          </Button>
        </DialogFooter>
      </Dialog>

    </PageTransition>
  );
}
