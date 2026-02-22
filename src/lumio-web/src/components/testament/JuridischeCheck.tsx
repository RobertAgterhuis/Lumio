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
import { Scale, AlertTriangle, Info, CheckCircle, Loader2 } from "lucide-react";

interface Waarschuwing {
  ernst: "hoog" | "middel" | "info";
  categorie: string;
  melding: string;
  suggestie: string;
}

interface CheckResult {
  aantalWaarschuwingen: number;
  waarschuwingen: Waarschuwing[];
}

export function JuridischeCheck() {
  const [result, setResult] = useState<CheckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async () => {
    setLoading(true);
    setError(null);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";
      const res = await fetch(`${API_BASE}/api/testament/juridische-check`);
      if (res.status === 423) { window.location.href = "/"; return; }
      if (!res.ok) throw new Error("Controle mislukt");
      const data: CheckResult = await res.json();
      setResult(data);
    } catch {
      setError("Kon de juridische controle niet uitvoeren.");
    } finally {
      setLoading(false);
    }
  };

  const ernstKleur = (ernst: string) => {
    switch (ernst) {
      case "hoog": return "border-red-300 bg-red-50";
      case "middel": return "border-amber-300 bg-amber-50";
      case "info": return "border-blue-300 bg-blue-50";
      default: return "border-muted bg-muted/30";
    }
  };

  const ernstIcon = (ernst: string) => {
    switch (ernst) {
      case "hoog": return <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />;
      case "middel": return <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />;
      case "info": return <Info className="h-4 w-4 text-blue-600 shrink-0" />;
      default: return <Info className="h-4 w-4 shrink-0" />;
    }
  };

  const ernstLabel = (ernst: string) => {
    switch (ernst) {
      case "hoog": return "Hoog";
      case "middel": return "Middel";
      case "info": return "Informatief";
      default: return ernst;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="h-5 w-5" /> Juridische controle
        </CardTitle>
        <CardDescription>
          Controleer uw testamentaire keuzes op juridische inconsistenties en
          ontvang suggesties voor verbetering.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleCheck} disabled={loading} variant="outline">
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Scale className="h-4 w-4 mr-2" />
          )}
          Controle uitvoeren
        </Button>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {result && (
          <div className="space-y-3">
            {result.aantalWaarschuwingen === 0 ? (
              <div className="rounded-lg border border-green-300 bg-green-50 p-4 flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-800">
                    Geen waarschuwingen gevonden
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    Uw testamentaire keuzes bevatten geen bekende inconsistenties.
                    Raadpleeg altijd een notaris voor juridisch advies.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  {result.aantalWaarschuwingen} waarschuwing{result.aantalWaarschuwingen !== 1 ? "en" : ""} gevonden:
                </p>
                {result.waarschuwingen.map((w, i) => (
                  <div
                    key={i}
                    className={`rounded-lg border p-4 ${ernstKleur(w.ernst)}`}
                  >
                    <div className="flex items-start gap-3">
                      {ernstIcon(w.ernst)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium uppercase tracking-wide">
                            {w.categorie}
                          </span>
                          <span className="text-xs px-1.5 py-0.5 rounded bg-white/60">
                            {ernstLabel(w.ernst)}
                          </span>
                        </div>
                        <p className="text-sm">{w.melding}</p>
                        <p className="text-xs text-muted-foreground mt-2 italic">
                          💡 {w.suggestie}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            <p className="text-xs text-muted-foreground italic">
              Deze controle is informatief en vervangt geen juridisch advies.
              Raadpleeg altijd een notaris voor uw specifieke situatie.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
