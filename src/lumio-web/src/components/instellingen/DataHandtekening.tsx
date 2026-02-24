"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";
import { Fingerprint, Copy, Check, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";

interface Snapshot {
  hash: string;
  algoritme: string;
  tijdstip: string;
  beschrijving: string;
}

export function DataHandtekening() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const t = useTranslations("dataHandtekening");
  const locale = useLocale();

  const genereer = async () => {
    setLoading(true);
    try {
      const data = await api.get<Snapshot>("/api/status/snapshot");
      setSnapshot(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  const kopieer = async () => {
    if (!snapshot) return;
    await navigator.clipboard.writeText(snapshot.hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3">
      <Button
        variant="outline"
        onClick={genereer}
        disabled={loading}
        className="gap-2"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Fingerprint className="h-4 w-4" />
        )}
        Digitale handtekening genereren
      </Button>

      {snapshot && (
        <div className="rounded-md border p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Fingerprint className="h-4 w-4 text-primary shrink-0" />
            <span className="text-xs font-semibold text-muted-foreground">
              {snapshot.algoritme} — {new Date(snapshot.tijdstip).toLocaleString(locale)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs font-mono bg-muted px-3 py-2 rounded break-all select-all">
              {snapshot.hash}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={kopieer}
              className="shrink-0"
            >
              {copied ? (
                <Check className="h-4 w-4 text-success" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {snapshot.beschrijving}
          </p>
        </div>
      )}
    </div>
  );
}
