"use client";

import { useEffect, useState } from "react";
import { usePreferencesStore } from "@/stores/preferencesStore";
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
  const { finishedDomains, setDomainFinished } = usePreferencesStore();
  const t = useTranslations("domainStatus");

  const isFinished = !!finishedDomains[domein];

  // Fetch actualisatie status from server (BR-148/BR-190)
  const [needsReview, setNeedsReview] = useState(false);

  useEffect(() => {
    api
      .get<{ domeinen: ActualisatieDomein[]; herinneringNodig: boolean }>("/api/status/actualisatie")
      .then((data) => {
        const match = data.domeinen.find((d) => d.domein === domein);
        setNeedsReview(match?.actualisatieNodig ?? false);
      })
      .catch(() => {});
  }, [domein]);

  const handleBevestigActualisatie = async () => {
    try {
      await api.post(`/api/status/actualisatie/${domein}`, {});
      setNeedsReview(false);
      // Also re-mark as finished with fresh timestamp
      setDomainFinished(domein, true);
    } catch {
      // Ignore
    }
  };

  // Only show review warning for domains that are marked finished
  const showReview = isFinished && needsReview;

  return (
    <div className="flex items-center justify-between rounded-lg border bg-card px-4 py-3">
      <div className="flex items-center gap-3">
        {showReview ? (
          <>
            <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 gap-1 dark:bg-amber-900 dark:text-amber-200">
              <AlertTriangle className="h-3 w-3" />
              {t("reviewNodig")}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {t("reviewBeschrijving")}
            </span>
          </>
        ) : isFinished ? (
          <>
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100 gap-1 dark:bg-green-900 dark:text-green-200">
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
        {isFinished ? (
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
              onClick={() => setDomainFinished(domein, false)}
              className="text-muted-foreground gap-1"
            >
              {t("markeringOpheffen")}
            </Button>
          )
        ) : (
          <Button
            size="sm"
            onClick={() => setDomainFinished(domein, true)}
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
