"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import { useVideoboodschappen } from "@/components/videoboodschappen/useVideoboodschappen";
import { VideoboodschapDialog } from "@/components/videoboodschappen/VideoboodschapDialog";
import { SectieNotitie } from "@/components/notities/SectieNotitie";
import { toast } from "@/stores/toastStore";
import { getApiUrl } from "@/lib/api-client";
import type { Erfgenaam } from "@/components/erfgenamen/types";
import type { Videoboodschap, VideoboodschapFormData } from "@/components/videoboodschappen/types";

function formatBytes(bytes: number): string {
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

function formatDuration(seconds?: number): string {
  if (!seconds) return "";
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function VideoboodschappenPage() {
  const t = useTranslations("videoboodschappen");

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

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Videoboodschap | undefined>(undefined);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [playingItem, setPlayingItem] = useState<Videoboodschap | undefined>(undefined);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ── Create helper ────────────────────────────────────────────────────
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

  // ── Save handler ────────────────────────────────────────────────────
  const handleSave = useCallback(
    async (form: VideoboodschapFormData) => {
      if (editingItem) {
        // Update metadata only
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

  // ── Delete handler ──────────────────────────────────────────────────
  const handleDelete = useCallback(
    async (item: Videoboodschap) => {
      if (!confirm(t("verwijderenBevestig", { titel: item.titel }))) return;
      setDeletingId(item.id);
      try {
        await verwijderen(item.id, item.titel);
      } finally {
        setDeletingId(null);
      }
    },
    [verwijderen, t]
  );

  // ── Recipient names ─────────────────────────────────────────────────
  const erfgenaamMap = new Map(
    erfgenamen.map((e) => [
      e.id,
      e.tussenvoegsel
        ? `${e.voornaam} ${e.tussenvoegsel} ${e.achternaam}`
        : `${e.voornaam} ${e.achternaam}`,
    ])
  );

  // ── Render ──────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("titel")}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t("subtitel")}</p>
        </div>
        <Button onClick={openNew} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          {t("nieuw")}
        </Button>
      </div>

      <SectieNotitie sectie="videoboodschappen" />

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && videoboodschappen.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <Video className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold">{t("legeStaat.titel")}</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                {t("legeStaat.beschrijving")}
              </p>
            </div>
            <Button onClick={openNew} className="gap-2" variant="outline">
              <Plus className="h-4 w-4" />
              {t("legeStaat.actie")}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Video list */}
      {!isLoading && videoboodschappen.length > 0 && (
        <div className="space-y-3">
          {videoboodschappen.map((item) => {
            const isDeleting = deletingId === item.id;
            return (
              <Card
                key={item.id}
                className={isDeleting ? "opacity-50 pointer-events-none" : ""}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      {/* Icon */}
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

                        {/* Meta row */}
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

                    {/* Action buttons */}
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
                    </div>
                  </div>
                </CardHeader>

                {/* Recipient badges */}
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

      {/* Create / edit dialog */}
      <VideoboodschapDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editingItem}
        onSave={handleSave}
        uploading={uploading}
        uploadProgress={uploadProgress}
        saving={saving}
      />

      {/* Video player dialog */}
      {playingItem && (
        <Dialog open={playerOpen} onOpenChange={setPlayerOpen}>
          <DialogHeader className="pb-2">
            <DialogTitle>{playingItem.titel}</DialogTitle>
          </DialogHeader>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
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
        </Dialog>
      )}
    </div>
  );
}
