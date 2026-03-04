"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, RotateCcw, AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api-client";

interface DomainStatusBannerProps {
  /** The domain key, matching the domainCards array (e.g. "eigenaar", "testament") */
  domein: string;
}

interface ActualisatieDomein {
  domein: string;
  label: string;
  isAfgerond: boolean;
  laatsteBevestiging: string | null;
  actualisatieNodig: boolean;
}

/**
 * A compact banner that lets the user mark a domain as "Afgerond" (finished).
 * Shows the current status and a toggle button.
 * Review status is driven by the server-side actualisatie API (BR-148/BR-190).
 *
 * Place this right below the heading section of each domain page.
 */
export function DomainStatusBanner({ domein }: DomainStatusBannerProps) {
  const t = useTranslations("domainStatus");

  // S4-01: Server-driven state — no localStorage
  const [isAfgerond, setIsAfgerond] = useState(false);
  const [needsReview, setNeedsReview] = useState(false);

  useEffect(() => {
    api
      .get<{ domeinen: ActualisatieDomein[]; herinneringNodig: boolean }>("/api/status/actualisatie")
      .then((data) => {
        const match = data.domeinen.find((d) => d.domein === domein);
        setIsAfgerond(match?.isAfgerond ?? false);
        setNeedsReview(match?.actualisatieNodig ?? false);
      })
      .catch((err) => console.error(`Failed to load actualisatie for ${domein}:`, err));
  }, [domein]);

  const handleMarkeerAfgerond = async () => {
    try {
      await api.post(`/api/status/actualisatie/${domein}`, {});
      setIsAfgerond(true);
    } catch {
      // Ignore
    }
  };

  const handleMarkeringOpheffen = async () => {
    try {
      await api.delete(`/api/status/actualisatie/${domein}`);
      setIsAfgerond(false);
      setNeedsReview(false);
    } catch {
      // Ignore
    }
  };

  const handleBevestigActualisatie = async () => {
    try {
      await api.post(`/api/status/actualisatie/${domein}`, {});
      setNeedsReview(false);
      setIsAfgerond(true);
    } catch {
      // Ignore
    }
  };

  // Only show review warning for domains that are explicitly finished
  const showReview = isAfgerond && needsReview;

  return (
    <div className="flex items-center justify-between rounded-lg border bg-card px-4 py-3 animate-in fade-in-50 slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-3">
        {showReview ? (
          <>
            <Badge className="bg-warning-100 text-warning hover:bg-warning-100 gap-1 dark:bg-warning/20 dark:text-warning">
              <AlertTriangle className="h-3 w-3" />
              {t("reviewNodig")}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {t("reviewBeschrijving")}
            </span>
          </>
        ) : isAfgerond ? (
          <>
            <Badge className="bg-success-100 text-success hover:bg-success-100 gap-1 dark:bg-success/20 dark:text-success">
              <CheckCircle2 className="h-3 w-3" />
              {t("afgerond")}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {t("afgerondBeschrijving")}
            </span>
          </>
        ) : (
          <span className="text-sm text-muted-foreground">
            {t("nietAfgerond")}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {isAfgerond ? (
          showReview ? (
            <Button
              size="sm"
              onClick={handleBevestigActualisatie}
              className="gap-1"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {t("opnieuwBevestigen")}
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkeringOpheffen}
              className="text-muted-foreground gap-1"
            >
              {t("markeringOpheffen")}
            </Button>
          )
        ) : (
          <Button
            size="sm"
            onClick={handleMarkeerAfgerond}
            className="gap-1"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            {t("markeerAfgerond")}
          </Button>
        )}
      </div>
    </div>
  );
}
