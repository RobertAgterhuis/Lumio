"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api-client";
import { useAuthStore } from "@/stores/authStore";
import { Shield } from "lucide-react";

export function SetupForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUnlocked, setFirstRun } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Wachtwoord moet minimaal 8 tekens bevatten.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Wachtwoorden komen niet overeen.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/auth/setup", { wachtwoord: password });
      setFirstRun(false);
      setUnlocked(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Setup mislukt");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Shield className="h-8 w-8 text-primary" />
        </div>
        <CardTitle>Welkom bij Lumio</CardTitle>
        <CardDescription>
          Kies een sterk wachtwoord om uw digitale nalatenschap te beveiligen.
          Dit wachtwoord versleutelt al uw gegevens.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Wachtwoord</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimaal 8 tekens"
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm">Bevestig wachtwoord</Label>
            <Input
              id="confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Herhaal uw wachtwoord"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Database aanmaken..." : "Database Aanmaken"}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Uw gegevens worden versleuteld opgeslagen. Bewaar uw wachtwoord goed — zonder wachtwoord is de data niet toegankelijk.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
