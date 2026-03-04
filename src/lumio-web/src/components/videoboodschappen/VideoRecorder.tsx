"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Video, Square, RotateCcw, CheckCircle2, VideoOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoRecorderProps {
  /** Called when the user accepts a recording. */
  onVideoSelected: (file: File, durationSeconds: number) => void;
  /** Maximum allowed recording duration in seconds. */
  maxDurationSeconds: number;
}

type RecordState =
  | "idle"
  | "requesting"
  | "recording"
  | "uploading-preview"
  | "preview"
  | "not-supported";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function getApiBase(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "";
}

/** In-browser video recorder using the MediaRecorder API. */
export function VideoRecorder({
  onVideoSelected,
  maxDurationSeconds,
}: VideoRecorderProps) {
  const t = useTranslations("videoboodschappen.recorder");

  const [state, setState] = useState<RecordState>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [previewTempId, setPreviewTempId] = useState<string | null>(null);
  const [recordedFile, setRecordedFile] = useState<File | null>(null);
  const [recordedDuration, setRecordedDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Only used during "recording" state for the live camera feed.
  const liveVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  // Cleanup on unmount — also delete any dangling temp preview
  const previewTempIdRef = useRef<string | null>(null);
  useEffect(() => {
    return () => {
      stopStream();
      if (timerRef.current) clearInterval(timerRef.current);
      if (previewTempIdRef.current) {
        deletePreviewTemp(previewTempIdRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  // Attach live camera stream when the recording video element mounts
  useEffect(() => {
    if (state === "recording" && liveVideoRef.current && streamRef.current) {
      liveVideoRef.current.srcObject = streamRef.current;
      liveVideoRef.current.muted = true;
      liveVideoRef.current.play().catch(() => {});
    }
  }, [state]);

  // ── Temp preview helpers ────────────────────────────────────────────────

  const uploadPreviewToServer = async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append("bestand", file);
    const res = await fetch(`${getApiBase()}/api/videoboodschappen/preview`, {
      method: "POST",
      body: fd,
    });
    if (!res.ok) throw new Error(t("previewUploadMislukt"));
    const json = (await res.json()) as { tempId: string };
    return json.tempId;
  };

  const deletePreviewTemp = (tempId: string) => {
    // Fire-and-forget: best-effort cleanup of the temp file
    fetch(`${getApiBase()}/api/videoboodschappen/preview/${tempId}`, {
      method: "DELETE",
    }).catch(() => {});
  };

  // ── Recording ───────────────────────────────────────────────────────────

  const startRecording = useCallback(async () => {
    setError(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setState("not-supported");
      return;
    }

    setState("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });

      streamRef.current = stream;

      // Choose best supported MIME type
      const mimeType = [
        "video/webm;codecs=vp9,opus",
        "video/webm;codecs=vp8,opus",
        "video/webm",
        "video/mp4",
      ].find((m) => MediaRecorder.isTypeSupported(m)) ?? "";

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      recorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const actualMime = recorder.mimeType || "video/webm";
        const blob = new Blob(chunksRef.current, { type: actualMime });
        const ext = actualMime.includes("mp4") ? "mp4" : "webm";
        const file = new File([blob], `opname.${ext}`, { type: actualMime });
        const duration = Math.round((Date.now() - startTimeRef.current) / 1000);

        stopStream();
        if (timerRef.current) clearInterval(timerRef.current);

        setRecordedFile(file);
        setRecordedDuration(duration);
        setState("uploading-preview");

        // Upload the recording to a server-side temp location so we can play
        // it back via the confirmed-working stream endpoint — completely
        // bypassing all browser blob URL / autoplay policy issues.
        void (async () => {
          try {
            const tempId = await uploadPreviewToServer(file);
            previewTempIdRef.current = tempId;
            setPreviewTempId(tempId);
            setState("preview");
          } catch {
            setError(t("fout"));
            setState("idle");
          }
        })();
      };

      recorder.start(250); // collect chunks every 250 ms
      startTimeRef.current = Date.now();
      setState("recording");
      setElapsed(0);

      timerRef.current = setInterval(() => {
        const secs = Math.round((Date.now() - startTimeRef.current) / 1000);
        setElapsed(secs);

        if (secs >= maxDurationSeconds) {
          recorder.stop();
          if (timerRef.current) clearInterval(timerRef.current);
        }
      }, 1000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg.includes("Permission") || msg.includes("denied")
        ? t("permissieGeweigerd")
        : t("fout"));
      setState("idle");
      stopStream();
    }
  }, [maxDurationSeconds, stopStream, t]);

  const stopRecording = useCallback(() => {
    recorderRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const opnieuw = useCallback(() => {
    if (previewTempId) {
      deletePreviewTemp(previewTempId);
      previewTempIdRef.current = null;
    }
    setPreviewTempId(null);
    setRecordedFile(null);
    setElapsed(0);
    setState("idle");
  }, [previewTempId]);

  const accepteer = useCallback(() => {
    if (recordedFile && previewTempId) {
      // Kick off real save in the parent component
      onVideoSelected(recordedFile, recordedDuration);
      // Clean up the temp preview file in the background
      deletePreviewTemp(previewTempId);
      previewTempIdRef.current = null;
    }
  }, [recordedFile, recordedDuration, previewTempId, onVideoSelected]);

  // ── Render ──────────────────────────────────────────────────────────────

  if (state === "not-supported") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-6 text-center">
        <VideoOff className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{t("nietBeschikbaar")}</p>
        <p className="text-xs text-muted-foreground/70">{t("httpsVereist")}</p>
      </div>
    );
  }

  if (state === "uploading-preview") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{t("previewLaden")}</p>
      </div>
    );
  }

  if (state === "preview" && previewTempId) {
    const previewSrc = `${getApiBase()}/api/videoboodschappen/preview/${previewTempId}/stream`;
    return (
      <div className="space-y-3 animate-[fadeSlideIn_200ms_ease-out_both]">
        {/* Server-streamed playback — same mechanism as confirmed-working post-save player */}
        <video
          key={previewTempId}
          src={previewSrc}
          controls
          autoPlay
          playsInline
          className="w-full rounded-lg bg-black"
          style={{ maxHeight: 300 }}
        />
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={opnieuw}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {t("opnieuw")}
          </Button>
          <Button size="sm" className="gap-2" onClick={accepteer}>
            <CheckCircle2 className="h-3.5 w-3.5" />
            {t("gebruik")}
          </Button>
        </div>
      </div>
    );
  }

  if (state === "recording") {
    const remaining = maxDurationSeconds - elapsed;
    return (
      <div className="space-y-3">
        <video
          ref={liveVideoRef}
          playsInline
          className="w-full rounded-lg bg-black"
          style={{ maxHeight: 300 }}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-destructive" />
            <span className="font-mono text-sm tabular-nums">
              {formatTime(elapsed)}
            </span>
            {remaining <= 30 && (
              <span className="text-xs text-destructive transition-colors duration-300">
                {t("maxOver", { seconden: remaining })}
              </span>
            )}
          </div>

          <Button
            variant="destructive"
            size="sm"
            className="gap-2"
            onClick={stopRecording}
          >
            <Square className="h-3.5 w-3.5" />
            {t("stop")}
          </Button>
        </div>
      </div>
    );
  }

  // Idle / requesting
  return (
    <div className="space-y-3">
      <div
        className={cn(
          "flex flex-col items-center gap-3 rounded-lg border border-dashed p-8 text-center",
          state === "requesting" && "opacity-60"
        )}
      >
        {state === "requesting" ? (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{t("toestemming")}</p>
          </>
        ) : (
          <>
            <Video className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{t("klaarVoorOpname")}</p>
            <p className="text-xs text-muted-foreground/70">
              {t("maxDuur", { minuten: Math.floor(maxDurationSeconds / 60) })}
            </p>
          </>
        )}
      </div>

      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <Button
        onClick={startRecording}
        disabled={state === "requesting"}
        className="gap-2 w-full"
        size="sm"
      >
        <Video className="h-3.5 w-3.5" />
        {t("start")}
      </Button>
    </div>
  );
}
