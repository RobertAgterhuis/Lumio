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
  | "preview"
  | "not-supported";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

/** In-browser video recorder using the MediaRecorder API. */
export function VideoRecorder({
  onVideoSelected,
  maxDurationSeconds,
}: VideoRecorderProps) {
  const t = useTranslations("videoboodschappen.recorder");

  const [state, setState] = useState<RecordState>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [recordedFile, setRecordedFile] = useState<File | null>(null);
  const [recordedDuration, setRecordedDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const liveVideoRef = useRef<HTMLVideoElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStream();
      if (timerRef.current) clearInterval(timerRef.current);
      if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

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

      if (liveVideoRef.current) {
        liveVideoRef.current.srcObject = stream;
        liveVideoRef.current.muted = true; // avoid feedback
        await liveVideoRef.current.play();
      }

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
        setRecordedDuration(duration);
        setRecordedFile(file);

        const url = URL.createObjectURL(blob);
        setRecordedUrl(url);
        setState("preview");

        stopStream();
        if (timerRef.current) clearInterval(timerRef.current);
      };

      recorder.start(250); // collect chunks every 250 ms
      startTimeRef.current = Date.now();
      setState("recording");
      setElapsed(0);

      timerRef.current = setInterval(() => {
        const secs = Math.round((Date.now() - startTimeRef.current) / 1000);
        setElapsed(secs);

        // Auto-stop at max duration
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
    if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    setRecordedUrl(null);
    setRecordedFile(null);
    setElapsed(0);
    setState("idle");
  }, [recordedUrl]);

  const accepteer = useCallback(() => {
    if (recordedFile) {
      onVideoSelected(recordedFile, recordedDuration);
    }
  }, [recordedFile, recordedDuration, onVideoSelected]);

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

  if (state === "preview" && recordedUrl) {
    return (
      <div className="space-y-3">
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          ref={previewVideoRef}
          src={recordedUrl}
          controls
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
        {/* Live preview */}
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          ref={liveVideoRef}
          autoPlay
          playsInline
          muted
          className="w-full rounded-lg bg-black"
          style={{ maxHeight: 300 }}
        />

        <div className="flex items-center justify-between">
          {/* Recording indicator + timer */}
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-destructive" />
            <span className="font-mono text-sm tabular-nums">
              {formatTime(elapsed)}
            </span>
            {remaining <= 30 && (
              <span className="text-xs text-destructive">
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
