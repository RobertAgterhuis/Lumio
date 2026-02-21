"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/lib/api-client";
import { Settings, Key, Shield, Loader2 } from "lucide-react";

export default function InstellingenPage() {
  const [huidigWachtwoord, setHuidigWachtwoord] = useState("");
  const [nieuwWachtwoord, setNieuwWachtwoord] = useState("");
  const [bevestigWachtwoord, setBevestigWachtwoord] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (nieuwWachtwoord !== bevestigWachtwoord) {
      setMessage({ type: "error", text: "Wachtwoorden komen niet overeen." });
      return;
    }

    if (nieuwWachtwoord.length < 8) {
      setMessage({
        type: "error",
        text: "Wachtwoord moet minimaal 8 tekens bevatten.",
      });
      return;
    }

    setSaving(true);
    try {
      await api.post("/api/auth/wachtwoord", {
        huidigWachtwoord,
        nieuwWachtwoord,
      });
      setMessage({
        type: "success",
        text: "Wachtwoord succesvol gewijzigd.",
      });
      setHuidigWachtwoord("");
      setNieuwWachtwoord("");
      setBevestigWachtwoord("");
    } catch {
      setMessage({
        type: "error",
        text: "Wachtwoord wijzigen mislukt. Controleer uw huidige wachtwoord.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Instellingen</h1>
        <p className="text-muted-foreground mt-1">
          Beheer uw beveiligingsinstellingen
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" /> Wachtwoord wijzigen
          </CardTitle>
          <CardDescription>
            Wijzig uw hoofdwachtwoord. Na wijziging wordt de database opnieuw
            versleuteld met het nieuwe wachtwoord.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="huidig">Huidig wachtwoord</Label>
              <Input
                id="huidig"
                type="password"
                value={huidigWachtwoord}
                onChange={(e) => setHuidigWachtwoord(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nieuw">Nieuw wachtwoord</Label>
              <Input
                id="nieuw"
                type="password"
                value={nieuwWachtwoord}
                onChange={(e) => setNieuwWachtwoord(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bevestig">Bevestig nieuw wachtwoord</Label>
              <Input
                id="bevestig"
                type="password"
                value={bevestigWachtwoord}
                onChange={(e) => setBevestigWachtwoord(e.target.value)}
                required
                minLength={8}
              />
            </div>
            {message && (
              <p
                className={`text-sm ${
                  message.type === "success"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {message.text}
              </p>
            )}
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Wachtwoord wijzigen
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" /> Beveiliging
          </CardTitle>
          <CardDescription>
            Informatie over de beveiliging van uw gegevens.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span>Database versleuteld met SQLCipher (AES-256-CBC)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span>
              Gevoelige velden extra versleuteld (AES-256-GCM)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span>Alleen lokale verbinding (127.0.0.1)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span>Geen internetverbinding vereist</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" /> Over Lumio
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>
            Lumio is een hulpmiddel voor het vastleggen van uw digitale
            nalatenschap. Alle gegevens worden lokaal en versleuteld opgeslagen.
          </p>
          <p className="mt-2">
            Een notarieel testament blijft vereist voor juridische geldigheid
            conform het Burgerlijk Wetboek (BW Boek 4).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
