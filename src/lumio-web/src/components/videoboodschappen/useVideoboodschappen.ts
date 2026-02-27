"use client";

import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useDomainQuery, domainKeys } from "@/hooks/useDomainQuery";
import { api } from "@/lib/api-client";
import { toast } from "@/stores/toastStore";
import type { Videoboodschap } from "./types";

const ENDPOINT = "videoboodschappen";

export function useVideoboodschappen() {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [saving, setSaving] = useState(false);

  const { data: videoboodschappen = [], isLoading } =
    useDomainQuery<Videoboodschap[]>(ENDPOINT);

  /** Upload a video file with progress tracking via XHR. */
  const uploaden = useCallback(
    (
      formData: FormData,
      onProgress?: (pct: number) => void
    ): Promise<Videoboodschap> => {
      // Determine API base URL (same as api-client)
      const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "";

      return new Promise<Videoboodschap>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `${apiBase}/api/videoboodschappen/uploaden`);
        xhr.timeout = 300_000; // 5 minuten — grote bestanden hebben tijd nodig
        xhr.ontimeout = () => reject(new Error("Upload-timeout: het bestand is te groot of de verbinding is te traag."));

        // Accept-Language header (mirrors api-client)
        const locale =
          typeof window !== "undefined"
            ? (localStorage.getItem("lumio-locale") ?? "nl")
            : "nl";
        xhr.setRequestHeader("Accept-Language", locale);

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 100);
            setUploadProgress(pct);
            onProgress?.(pct);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText) as Videoboodschap);
          } else {
            try {
              const body = JSON.parse(xhr.responseText) as { error?: string; title?: string };
              reject(new Error(body.error ?? body.title ?? "Upload mislukt"));
            } catch {
              reject(new Error(`Upload mislukt (${xhr.status})`));
            }
          }
        };

        xhr.onerror = () => reject(new Error("Networkfout tijdens uploaden"));
        xhr.onabort = () => reject(new Error("Upload geannuleerd"));

        xhr.send(formData);
      });
    },
    []
  );

  /**
   * Build the FormData payload and start an upload.
   * Returns the created Videoboodschap or throws on error.
   */
  const opslaan = useCallback(
    async (params: {
      file: File;
      titel: string;
      beschrijving?: string;
      ontvangerIds: string[];
      duurSeconden?: number;
    }) => {
      setUploading(true);
      setUploadProgress(0);
      try {
        const fd = new FormData();
        fd.append("bestand", params.file);
        fd.append("titel", params.titel);
        if (params.beschrijving) fd.append("beschrijving", params.beschrijving);
        if (params.ontvangerIds.length > 0)
          fd.append("ontvangerIds", JSON.stringify(params.ontvangerIds));
        if (params.duurSeconden !== undefined)
          fd.append("duurSeconden", String(params.duurSeconden));

        const result = await uploaden(fd);
        await queryClient.invalidateQueries({
          queryKey: domainKeys.all(ENDPOINT),
        });
        return result;
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    },
    [uploaden, queryClient]
  );

  /** Update metadata (titel / beschrijving / ontvangers) of an existing video. */
  const bijwerken = useCallback(
    async (
      id: string,
      data: { titel?: string; beschrijving?: string; ontvangerIds?: string[] }
    ) => {
      setSaving(true);
      try {
        const result = await api.patch<Videoboodschap>(
          `/api/videoboodschappen/${id}`,
          data
        );
        await queryClient.invalidateQueries({
          queryKey: domainKeys.all(ENDPOINT),
        });
        return result;
      } finally {
        setSaving(false);
      }
    },
    [queryClient]
  );

  /** Delete a video message. Shows a toast on success. */
  const verwijderen = useCallback(
    async (id: string, titelVoorToast: string) => {
      await api.delete(`/api/videoboodschappen/${id}`);
      await queryClient.invalidateQueries({
        queryKey: domainKeys.all(ENDPOINT),
      });
      toast.success(`"${titelVoorToast}" verwijderd`);
    },
    [queryClient]
  );

  return {
    videoboodschappen,
    isLoading,
    uploading,
    uploadProgress,
    saving,
    opslaan,
    bijwerken,
    verwijderen,
  };
}
