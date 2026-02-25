"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { useDomainQuery } from "@/hooks/useDomainQuery";
import { Loader2, Upload, FileVideo, CheckCircle2, X } from "lucide-react";
import { VideoRecorder } from "./VideoRecorder";
import type { Erfgenaam } from "@/components/erfgenamen/types";
import type { Videoboodschap, VideoboodschapFormData } from "./types";
import { emptyVideoboodschapForm } from "./types";

interface VideoboodschapDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When provided: editing mode (no video re-upload). */
  editing?: Videoboodschap;
  /** Called to perform the save (upload or update). */
  onSave: (form: VideoboodschapFormData) => Promise<void>;
  uploading: boolean;
  uploadProgress: number;
  saving: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

/** Dialog for creating a new video message or editing metadata of an existing one. */
export function VideoboodschapDialog({
  open,
  onOpenChange,
  editing,
  onSave,
  uploading,
  uploadProgress,
  saving,
}: VideoboodschapDialogProps) {
  const t = useTranslations("videoboodschappen");
  const isEditing = !!editing;
  const isBusy = uploading || saving;

  const [form, setForm] = useState<VideoboodschapFormData>(() =>
    editing
      ? {
          titel: editing.titel,
          beschrijving: editing.beschrijving ?? "",
          ontvangerIds: editing.ontvangers.map((o) => o.erfgenaamId),
          file: null,
        }
      : { ...emptyVideoboodschapForm }
  );
  const [error, setError] = useState<string | null>(null);
  const [videoTab, setVideoTab] = useState("opnemen");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Q-21: Reset form when editing prop changes (prevents stale formdata)
  useEffect(() => {
    setForm(
      editing
        ? {
            titel: editing.titel,
            beschrijving: editing.beschrijving ?? "",
            ontvangerIds: editing.ontvangers.map((o) => o.erfgenaamId),
            file: null,
          }
        : { ...emptyVideoboodschapForm }
    );
    setError(null);
  }, [editing]);

  const { data: erfgenamen = [] } = useDomainQuery<Erfgenaam[]>("erfgenamen");

  // Reset form when dialog opens/closes
  const handleOpenChange = useCallback(
    (v: boolean) => {
      if (!v) {
        setForm(
          editing
            ? {
                titel: editing.titel,
                beschrijving: editing.beschrijving ?? "",
                ontvangerIds: editing.ontvangers.map((o) => o.erfgenaamId),
                file: null,
              }
            : { ...emptyVideoboodschapForm }
        );
        setError(null);
      }
      onOpenChange(v);
    },
    [editing, onOpenChange]
  );

  const setField = <K extends keyof VideoboodschapFormData>(
    key: K,
    value: VideoboodschapFormData[K]
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  // ── Erfgenaam recipient toggle ─────────────────────────────────────────
  const toggleOntvanger = (id: string) => {
    setForm((prev) => ({
      ...prev,
      ontvangerIds: prev.ontvangerIds.includes(id)
        ? prev.ontvangerIds.filter((x) => x !== id)
        : [...prev.ontvangerIds, id],
    }));
  };

  // ── File input change ─────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    if (!f.type.startsWith("video/")) {
      setError(t("dialog.alleenVideo"));
      return;
    }
    if (f.size > 104_857_600) {
      setError(t("dialog.bestandTeGroot"));
      return;
    }
    setError(null);
    setField("file", f);
  };

  // ── VideoRecorder callback ─────────────────────────────────────────────
  const handleRecorded = (file: File, durationSeconds: number) => {
    setField("file", file);
    setField("duurSeconden", durationSeconds);
    // Auto-fill title if empty
    if (!form.titel) {
      setField("titel", t("dialog.standaardTitel", { datum: new Date().toLocaleDateString("nl-NL") }));
    }
  };

  // ── Submit ──────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setError(null);

    if (!form.titel.trim()) {
      setError(t("dialog.titelVerplicht"));
      return;
    }
    if (!isEditing && !form.file) {
      setError(t("dialog.videoVerplicht"));
      return;
    }

    try {
      await onSave(form);
      handleOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("dialog.fout"));
    }
  };

  // ── Display name helper ────────────────────────────────────────────────
  const erfgenaamNaam = (e: Erfgenaam) =>
    e.tussenvoegsel
      ? `${e.voornaam} ${e.tussenvoegsel} ${e.achternaam}`
      : `${e.voornaam} ${e.achternaam}`;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogHeader className="pb-2">
        <DialogTitle>
          {isEditing ? t("dialog.bewerken") : t("dialog.nieuw")}
        </DialogTitle>
      </DialogHeader>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto space-y-5 pr-1">

        {/* ── Video selection (new only) ────────────────────────────── */}
        {!isEditing && (
          <div className="space-y-2">
            <Label className="text-sm font-semibold">{t("dialog.video")}</Label>

            {form.file ? (
              /* Already chosen — show file badge + clear button */
              <div className="flex items-center gap-2 rounded-lg border p-3">
                <FileVideo className="h-5 w-5 shrink-0 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">{form.file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatBytes(form.file.size)}
                    {form.duurSeconden !== undefined &&
                      ` · ${Math.floor(form.duurSeconden / 60)}:${String(form.duurSeconden % 60).padStart(2, "0")}`}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  onClick={() => {
                    setField("file", null);
                    setField("duurSeconden", undefined);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Tabs value={videoTab} onValueChange={setVideoTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="opnemen">{t("dialog.tabOpnemen")}</TabsTrigger>
                  <TabsTrigger value="uploaden">{t("dialog.tabUploaden")}</TabsTrigger>
                </TabsList>

                <TabsContent value="opnemen" className="mt-3">
                  <VideoRecorder onVideoSelected={handleRecorded} />
                </TabsContent>

                <TabsContent value="uploaden" className="mt-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <button
                    type="button"
                    className="flex w-full flex-col items-center gap-3 rounded-lg border border-dashed p-8 text-center transition-colors hover:bg-muted/50"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        {t("dialog.uploadKlik")}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t("dialog.uploadTip")}
                      </p>
                    </div>
                  </button>
                </TabsContent>
              </Tabs>
            )}
          </div>
        )}

        {/* ── Details form ──────────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vb-titel">
              {t("dialog.titel")}{" "}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="vb-titel"
              value={form.titel}
              onChange={(e) => setField("titel", e.target.value)}
              placeholder={t("dialog.titelPlaceholder")}
              disabled={isBusy}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vb-beschrijving">{t("dialog.beschrijving")}</Label>
            <Textarea
              id="vb-beschrijving"
              value={form.beschrijving}
              onChange={(e) => setField("beschrijving", e.target.value)}
              placeholder={t("dialog.beschrijvingPlaceholder")}
              rows={3}
              className="resize-none"
              disabled={isBusy}
            />
          </div>

          {/* Ontvanger selection */}
          {erfgenamen.length > 0 && (
            <div className="space-y-2">
              <Label>{t("dialog.ontvangers")}</Label>
              <div className="space-y-2 rounded-lg border p-3 max-h-40 overflow-y-auto">
                {erfgenamen.map((e) => (
                  <div key={e.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`ontvanger-${e.id}`}
                      checked={form.ontvangerIds.includes(e.id)}
                      onChange={() => toggleOntvanger(e.id)}
                      disabled={isBusy}
                    />
                    <label
                      htmlFor={`ontvanger-${e.id}`}
                      className="text-sm cursor-pointer select-none flex-1"
                    >
                      {erfgenaamNaam(e)}
                      {e.relatie && (
                        <span className="ml-1.5 text-xs text-muted-foreground">
                          ({e.relatie})
                        </span>
                      )}
                    </label>
                  </div>
                ))}
              </div>
              {form.ontvangerIds.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {t("dialog.aantalOntvangers", { aantal: form.ontvangerIds.length })}
                </p>
              )}
            </div>
          )}
        </div>

        {/* ── Upload progress ────────────────────────────────────────── */}
        {uploading && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{t("dialog.uploading")}</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* ── Error ─────────────────────────────────────────────────── */}
        {error && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
      </div>

      <DialogFooter className="pt-4">
        <Button
          variant="outline"
          onClick={() => handleOpenChange(false)}
          disabled={isBusy}
        >
          {t("dialog.annuleren")}
        </Button>
        <Button onClick={handleSave} disabled={isBusy} className="gap-2">
          {isBusy && <Loader2 className="h-4 w-4 animate-spin" />}
          {uploading
            ? t("dialog.uploading")
            : saving
            ? t("dialog.opslaan") + "..."
            : t("dialog.opslaan")}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
