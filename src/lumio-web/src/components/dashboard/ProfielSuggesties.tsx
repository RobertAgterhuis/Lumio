"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { Lightbulb, Loader2, CheckCircle, Link2 } from "lucide-react";

interface Suggestie {
  categorie: string;
  melding: string;
  actie?: string;
}

interface SuggestieResult {
  aantalSuggesties: number;
  suggesties: Suggestie[];
}

export function ProfielSuggesties() {
  const [result, setResult] = useState<SuggestieResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations("dashboard.suggesties");

  const handleCheck = async () => {
    setLoading(true);
    setError(null);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";
      const res = await fetch(`${API_BASE}/api/status/suggesties`);
      if (res.status === 423) {
        window.location.href = "/";
        return;
      }
      if (!res.ok) throw new Error(t("analyseMislukt"));
      const data: SuggestieResult = await res.json();
      setResult(data);
    } catch {
      setError(t("fout"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" /> {t("titel")}
        </CardTitle>
        <CardDescription>
          {t("beschrijving")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleCheck} disabled={loading} variant="outline">
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Lightbulb className="h-4 w-4 mr-2" />
          )}
          {t("analyseren")}
        </Button>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {result && (
          <div className="space-y-3">
            {result.aantalSuggesties === 0 ? (
              <div className="rounded-lg border border-green-300 bg-green-50 p-4 flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-800">
                    {t("geenSuggesties")}
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    {t("geenSuggestiesBeschrijving")}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  {t("aantalGevonden", { aantal: result.aantalSuggesties })}
                </p>
                {result.suggesties.map((s, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-blue-200 bg-blue-50 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <Link2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-medium uppercase tracking-wide text-blue-700">
                          {s.categorie}
                        </span>
                        <p className="text-sm mt-1">{s.melding}</p>
                        {s.actie && (
                          <p className="text-xs text-blue-600 mt-2 italic">
                            💡 {s.actie}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
